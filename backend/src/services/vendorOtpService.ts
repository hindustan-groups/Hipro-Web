import crypto from "crypto";

interface OtpEntry {
  otpHash?: string;
  reqId?: string;
  mode: "MSG91_WIDGET" | "DEMO";
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpEntry>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5;
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const OTP_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "hipro-vendor-otp-secret";

export function normalizeIndianPhone(raw: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

function hashOtp(phone: string, otp: string): string {
  return crypto.createHmac("sha256", OTP_SECRET).update(`${phone}:${otp}`).digest("hex");
}

function signVerificationToken(phone: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${phone}:${expiresAt}`;
  const sig = crypto.createHmac("sha256", OTP_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyOtpToken(token: string, expectedPhone: string): boolean {
  try {
    if (!token) return false;
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [phone, expStr, sig] = decoded.split(":");
    if (!phone || !expStr || !sig) return false;
    if (phone !== normalizeIndianPhone(expectedPhone)) return false;
    if (Date.now() > Number(expStr)) return false;

    const expectedSig = crypto.createHmac("sha256", OTP_SECRET).update(`${phone}:${expStr}`).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"));
  } catch {
    return false;
  }
}

export async function sendPhoneOtp(rawPhone: string): Promise<{
  phone: string;
  smsMode: "LIVE" | "DEMO";
  provider: "MSG91" | "DEMO";
  demoOtp?: string;
  cooldownSeconds: number;
}> {
  const phone = normalizeIndianPhone(rawPhone);
  if (!isValidIndianPhone(phone)) {
    throw new Error("Please enter a valid 10-digit Indian mobile number.");
  }

  const now = Date.now();
  const existing = otpStore.get(phone);
  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    throw new Error(`Please wait ${waitSec} seconds before requesting a new OTP.`);
  }

  const msg91AuthKey = process.env.MSG91_AUTH_KEY?.trim().replace(/^["']|["']$/g, "");
  const msg91TokenAuth = process.env.MSG91_TOKEN_AUTH?.trim().replace(/^["']|["']$/g, "");
  const msg91WidgetId =
    process.env.MSG91_WIDGET_ID?.trim().replace(/^["']|["']$/g, "") ||
    "366b426d6d35343439373933";

  // 100% Server-Side MSG91 Widget API (keeps authkey secret on backend, no browser widget issues)
  if ((msg91AuthKey || msg91TokenAuth) && msg91WidgetId) {
    let resp = await fetch("https://api.msg91.com/api/v5/widget/sendOtp", {
      method: "POST",
      headers: {
        ...(msg91AuthKey ? { authkey: msg91AuthKey } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        widgetId: msg91WidgetId,
        identifier: `91${phone}`,
        ...(msg91TokenAuth && !msg91AuthKey ? { tokenAuth: msg91TokenAuth } : {}),
      }),
    });

    let json: any = await resp.json().catch(() => ({}));
    if ((!resp.ok || json?.type !== "success") && msg91TokenAuth && msg91AuthKey) {
      // Retry using tokenAuth in payload if authkey header was rejected
      resp = await fetch("https://api.msg91.com/api/v5/widget/sendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          widgetId: msg91WidgetId,
          tokenAuth: msg91TokenAuth,
          identifier: `91${phone}`,
        }),
      });
      json = await resp.json().catch(() => ({}));
    }

    if (!resp.ok || json?.type !== "success") {
      console.error("[VENDOR OTP] MSG91 sendOtp failed:", resp.status, json);
      throw new Error(json?.message || "Failed to send SMS OTP via MSG91.");
    }

    const reqId = typeof json?.message === "string" ? json.message : json?.reqId || "";
    otpStore.set(phone, {
      reqId,
      mode: "MSG91_WIDGET",
      expiresAt: now + OTP_TTL_MS,
      lastSentAt: now,
      attempts: 0,
    });

    console.log(`[VENDOR OTP] MSG91 live SMS sent to 91${phone} (reqId: ${reqId})`);
    return {
      phone,
      smsMode: "LIVE",
      provider: "MSG91",
      cooldownSeconds: 30,
    };
  }

  // Fallback only when MSG91_AUTH_KEY is not configured at all
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, {
    otpHash: hashOtp(phone, otp),
    mode: "DEMO",
    expiresAt: now + OTP_TTL_MS,
    lastSentAt: now,
    attempts: 0,
  });

  console.log(`[VENDOR OTP DEMO] Phone ${phone} -> OTP: ${otp}`);
  return {
    phone,
    smsMode: "DEMO",
    provider: "DEMO",
    demoOtp: otp,
    cooldownSeconds: 30,
  };
}

export async function verifyPhoneOtp(rawPhone: string, rawOtp: string): Promise<{
  phone: string;
  otpToken: string;
}> {
  const phone = normalizeIndianPhone(rawPhone);
  const otp = String(rawOtp || "").trim();

  if (!isValidIndianPhone(phone)) {
    throw new Error("Invalid mobile number.");
  }
  if (!/^\d{4,8}$/.test(otp)) {
    throw new Error("Please enter the valid numeric OTP.");
  }

  const entry = otpStore.get(phone);
  if (!entry) {
    throw new Error("No OTP found for this number. Please click Send OTP first.");
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    throw new Error("OTP has expired. Please request a new OTP.");
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    throw new Error("Too many invalid attempts. Please request a new OTP.");
  }

  entry.attempts += 1;

  if (entry.mode === "MSG91_WIDGET") {
    const msg91AuthKey = process.env.MSG91_AUTH_KEY?.trim().replace(/^["']|["']$/g, "");
    const msg91TokenAuth = process.env.MSG91_TOKEN_AUTH?.trim().replace(/^["']|["']$/g, "");
    const msg91WidgetId =
      process.env.MSG91_WIDGET_ID?.trim().replace(/^["']|["']$/g, "") ||
      "366b426d6d35343439373933";
    if (!msg91AuthKey && !msg91TokenAuth) {
      throw new Error("MSG91_AUTH_KEY is not configured on backend.");
    }

    let resp = await fetch("https://api.msg91.com/api/v5/widget/verifyOtp", {
      method: "POST",
      headers: {
        ...(msg91AuthKey ? { authkey: msg91AuthKey } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        widgetId: msg91WidgetId,
        reqId: entry.reqId,
        otp,
        ...(msg91TokenAuth && !msg91AuthKey ? { tokenAuth: msg91TokenAuth } : {}),
      }),
    });

    let json: any = await resp.json().catch(() => ({}));
    if ((!resp.ok || json?.type !== "success") && msg91TokenAuth && msg91AuthKey) {
      resp = await fetch("https://api.msg91.com/api/v5/widget/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          widgetId: msg91WidgetId,
          tokenAuth: msg91TokenAuth,
          reqId: entry.reqId,
          otp,
        }),
      });
      json = await resp.json().catch(() => ({}));
    }
    if (!resp.ok || json?.type !== "success") {
      throw new Error(json?.message || "Incorrect OTP. Please check and try again.");
    }

    otpStore.delete(phone);
    return {
      phone,
      otpToken: signVerificationToken(phone),
    };
  }

  // DEMO fallback verification
  const candidateHash = hashOtp(phone, otp);
  const match =
    entry.otpHash &&
    crypto.timingSafeEqual(Buffer.from(candidateHash, "hex"), Buffer.from(entry.otpHash, "hex"));

  if (!match) {
    throw new Error("Incorrect OTP. Please check and try again.");
  }

  otpStore.delete(phone);
  return {
    phone,
    otpToken: signVerificationToken(phone),
  };
}

/**
 * Verifies a JWT access-token returned by the MSG91 OTP Widget on the client
 * using MSG91's server-side verifyAccessToken API (keeps authkey secret on backend).
 */
export async function verifyMsg91WidgetToken(
  accessToken: string,
  expectedPhone?: string
): Promise<{ phone: string; otpToken: string }> {
  const authkey = process.env.MSG91_AUTH_KEY?.trim();
  if (!authkey) {
    throw new Error("MSG91_AUTH_KEY is not configured on the backend.");
  }

  const cleanToken = String(accessToken || "").trim();
  if (!cleanToken) {
    throw new Error("MSG91 access-token is required.");
  }

  const resp = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      authkey,
      "access-token": cleanToken,
    }),
  });

  const json: any = await resp.json().catch(() => ({}));
  if (!resp.ok || json?.type !== "success") {
    throw new Error(json?.message || "MSG91 OTP token verification failed.");
  }

  const rawIdentifier =
    json?.data?.identifier || json?.identifier || json?.message || "";
  const verifiedPhoneFromMsg91 = normalizeIndianPhone(String(rawIdentifier));
  const cleanExpected = expectedPhone ? normalizeIndianPhone(expectedPhone) : "";

  if (
    cleanExpected &&
    isValidIndianPhone(verifiedPhoneFromMsg91) &&
    verifiedPhoneFromMsg91 !== cleanExpected
  ) {
    throw new Error("Verified mobile number does not match the entered number.");
  }

  const finalPhone = isValidIndianPhone(verifiedPhoneFromMsg91)
    ? verifiedPhoneFromMsg91
    : cleanExpected;

  if (!isValidIndianPhone(finalPhone)) {
    throw new Error("Could not determine a valid verified Indian mobile number.");
  }

  return {
    phone: finalPhone,
    otpToken: signVerificationToken(finalPhone),
  };
}
