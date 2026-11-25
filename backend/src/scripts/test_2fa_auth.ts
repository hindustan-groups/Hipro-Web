import { generateSync } from "otplib";
import {
  generateTotpSetup,
  verifyTotp,
  generateBackupCodes,
  sign2FaTempToken,
  verify2FaTempToken,
} from "../lib/totp";

async function runTest() {
  console.log("=== Testing 2FA TOTP & Security Logic ===");

  // 1. Test Setup Generation
  const testEmail = "admin@hindustanprojects.in";
  const setup = await generateTotpSetup(testEmail, "HiPRO Master Cockpit");
  console.log("✔ TOTP secret generated:", setup.secret);
  console.log("✔ OTP Auth URL generated:", setup.otpAuthUrl);
  console.log("✔ QR Code Data URL length:", setup.qrCodeDataUrl.length);
  if (!setup.qrCodeDataUrl.startsWith("data:image/png;base64,")) {
    throw new Error("Invalid QR code format");
  }

  // 2. Test Live Token Verification
  const currentToken = generateSync({ secret: setup.secret });
  const isValid = verifyTotp(currentToken, setup.secret);
  console.log("✔ Current token:", currentToken, "=> Verified valid:", isValid);
  if (!isValid) throw new Error("Current token verification failed");

  // Invalid token test
  const isInvalid = verifyTotp("000000", setup.secret);
  console.log("✔ Invalid token check => Rejected as expected:", !isInvalid);
  if (isInvalid) throw new Error("Invalid token falsely accepted");

  // 3. Test Temp Token (5-minute expiry HMAC)
  const fakeUserId = "cuid_admin_test_123";
  const tempToken = sign2FaTempToken(fakeUserId);
  console.log("✔ Signed 2FA Temp Token:", tempToken);
  const verifiedUserId = verify2FaTempToken(tempToken);
  console.log("✔ Verified Temp Token user ID:", verifiedUserId);
  if (verifiedUserId !== fakeUserId) {
    throw new Error("Temp token user ID mismatch");
  }

  // Tampered temp token test
  const tamperedToken = tempToken.slice(0, -4) + "AAAA";
  const tamperedResult = verify2FaTempToken(tamperedToken);
  console.log("✔ Tampered Temp Token => Rejected as expected:", tamperedResult === null);
  if (tamperedResult !== null) throw new Error("Tampered token accepted");

  // 4. Test Backup Codes
  const backupCodes = generateBackupCodes(8);
  console.log("✔ Generated 8 Backup Codes:", backupCodes);
  if (backupCodes.length !== 8) throw new Error("Backup codes count mismatch");
  for (const code of backupCodes) {
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
      throw new Error(`Invalid backup code format: ${code}`);
    }
  }

  console.log("\n🎉 ALL 2FA CORE LOGIC TESTS PASSED SUCCESSFULLY!\n");
}

runTest().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
