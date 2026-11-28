import crypto from "crypto";

interface OtpEntry {
  otpHash: string;
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

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, {
    otpHash: hashOtp(phone, otp),
    expiresAt: now + OTP_TTL_MS,
    lastSentAt: now,
    attempts: 0,
  });

  // Live SMS dispatch if Fast2SMS API key is configured in production
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey && process.env.NODE_ENV === "production") {
    try {
      const resp = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: phone,
        }),
      });
      if (resp.ok) {
        return { phone, smsMode: "LIVE", cooldownSeconds: 30 };
      }
    } catch (err) {
      console.warn("[VENDOR OTP] Live SMS dispatch failed, falling back:", err);
    }
  }

  console.log(`[VENDOR OTP] Phone ${phone} -> OTP: ${otp}`);
  return {
    phone,
    smsMode: "DEMO",
    demoOtp: otp,
    cooldownSeconds: 30,
  };
}

export function verifyPhoneOtp(rawPhone: string, rawOtp: string): {
  phone: string;
  otpToken: string;
} {
  const phone = normalizeIndianPhone(rawPhone);
  const otp = String(rawOtp || "").trim();

  if (!isValidIndianPhone(phone)) {
    throw new Error("Invalid mobile number.");
  }
  if (!/^\d{6}$/.test(otp)) {
    throw new Error("Please enter the 6-digit OTP.");
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
  const candidateHash = hashOtp(phone, otp);
  const match = crypto.timingSafeEqual(
    Buffer.from(candidateHash, "hex"),
    Buffer.from(entry.otpHash, "hex")
  );

  if (!match) {
    throw new Error("Incorrect OTP. Please check and try again.");
  }

  otpStore.delete(phone);
  return {
    phone,
    otpToken: signVerificationToken(phone),
  };
}
