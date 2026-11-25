import { generateSecret, generateURI, verifySync } from "otplib";
import qrcode from "qrcode";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const HMAC_SECRET = process.env.JWT_SECRET || "hipro-corporate-2fa-temp-secret-fallback";

export interface TotpSetupResult {
  secret: string;
  otpAuthUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Generates a new TOTP secret and a Base64 QR code image data URL for Google Authenticator.
 */
export async function generateTotpSetup(email: string, issuer = "HiPRO Master Cockpit"): Promise<TotpSetupResult> {
  const secret = generateSecret();
  const otpAuthUrl = generateURI({
    issuer,
    label: email,
    secret,
  });

  const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: "#0F2C59", // HiPRO corporate navy
      light: "#FFFFFF",
    },
  });

  return { secret, otpAuthUrl, qrCodeDataUrl };
}

/**
 * Verifies a 6-digit TOTP code against the provided secret.
 */
export function verifyTotp(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.toString().trim().replace(/\s+/g, "");
  try {
    const result = verifySync({
      token: cleanToken,
      secret,
      // window allows ±1 step (30 seconds drift tolerance)
    });
    return !!(result && result.valid);
  } catch (err) {
    console.error("TOTP verification error:", err);
    return false;
  }
}

/**
 * Generates 8 human-readable emergency backup codes formatted as XXXX-XXXX.
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Base32 unambiguous set (no 0/O, 1/I)
  
  for (let i = 0; i < count; i++) {
    let part1 = "";
    let part2 = "";
    const bytes = randomBytes(8);
    for (let b = 0; b < 4; b++) {
      part1 += chars[bytes[b] % chars.length];
      part2 += chars[bytes[b + 4] % chars.length];
    }
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

/**
 * Signs a short-lived temporary 2FA token (valid for 5 minutes)
 * to be returned to the client when password matches but 2FA OTP is required.
 */
export function sign2FaTempToken(userId: string): string {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  const payload = `${userId}:${expiresAt}`;
  const hmac = createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");
  const tokenString = `${payload}:${hmac}`;
  return Buffer.from(tokenString).toString("base64url");
}

/**
 * Verifies a temporary 2FA token and returns userId if valid, or null if invalid/expired.
 */
export function verify2FaTempToken(tempToken: string): string | null {
  try {
    const decoded = Buffer.from(tempToken, "base64url").toString("utf8");
    const [userId, expiresAtStr, receivedHmac] = decoded.split(":");
    if (!userId || !expiresAtStr || !receivedHmac) return null;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return null; // Expired
    }

    const payload = `${userId}:${expiresAtStr}`;
    const expectedHmac = createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");

    const a = Buffer.from(receivedHmac, "hex");
    const b = Buffer.from(expectedHmac, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null; // Tampered
    }

    return userId;
  } catch (err) {
    return null;
  }
}
