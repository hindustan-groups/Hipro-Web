import assert from "node:assert";
import {
  createOrGetVendorAccount,
  generateActivationToken,
  authenticateVendor,
  activateVendorAccount,
  requestPasswordReset,
  resetPasswordWithToken,
} from "../src/services/vendorAccountService";
import {
  logVendorActivity,
  getVendorActivityLogs,
} from "../src/services/vendorActivityService";

async function runTests() {
  console.log("==================================================================");
  console.log("Phase 3: HiPRO Vendor Portal End-to-End Service Tests");
  console.log("==================================================================");

  let passed = 0;
  const testAppId = "test-app-" + Date.now();
  const testEmail = `contractor_${Date.now()}@sharmaworks.in`;

  // 1. Account Creation & Activation Token Generation
  console.log("[TEST 1] Creating vendor account and generating activation token...");
  const account = await createOrGetVendorAccount(testAppId, testEmail);
  assert.strictEqual(account.email, testEmail);
  assert.strictEqual(account.status, "PENDING_ACTIVATION");

  const { token, account: invitedAccount } = await generateActivationToken(testAppId);
  assert.ok(token, "Must generate an activation token");
  passed++;
  console.log("[PASS 1] Vendor account created in PENDING_ACTIVATION status with token");

  // 2. Activating account with new password
  console.log("[TEST 2] Activating account using token...");
  const activated = await activateVendorAccount(token, "SecurePassword123!");
  assert.strictEqual(activated.status, "ACTIVE");
  assert.strictEqual(activated.activationToken, null);
  passed++;
  console.log("[PASS 2] Account activated successfully and token cleared");

  // 3. Authenticate with correct credentials
  console.log("[TEST 3] Authenticating with valid credentials...");
  const authed = await authenticateVendor(testEmail, "SecurePassword123!");
  assert.strictEqual(authed.id, account.id);
  passed++;
  console.log("[PASS 3] Authentication succeeded with valid password");

  // 4. Reject invalid password
  console.log("[TEST 4] Authenticating with invalid password...");
  let rejected = false;
  try {
    await authenticateVendor(testEmail, "WrongPassword");
  } catch (err: any) {
    rejected = true;
    assert.match(err.message, /invalid email or password/i);
  }
  assert.ok(rejected, "Must reject incorrect password");
  passed++;
  console.log("[PASS 4] Authentication cleanly rejected invalid password");

  // 5. Password Reset Flow
  console.log("[TEST 5] Requesting password reset...");
  const resetData = await requestPasswordReset(testEmail);
  assert.ok(resetData?.token, "Must return a reset token");
  const resetResult = await resetPasswordWithToken(resetData.token, "BrandNewPassword456!");
  assert.ok(resetResult, "Must successfully reset password");
  const authedNew = await authenticateVendor(testEmail, "BrandNewPassword456!");
  assert.strictEqual(authedNew.id, account.id);
  passed++;
  console.log("[PASS 5] Self-service password reset succeeded and verified");

  // 6. Vendor Activity Audit Logging
  console.log("[TEST 6] Logging vendor portal activities...");
  await logVendorActivity({
    applicationId: testAppId,
    vendorAccountId: account.id,
    actorType: "VENDOR",
    actorName: testEmail,
    action: "VENDOR_LOGGED_IN",
    details: "Logged in from test runner",
  });

  await logVendorActivity({
    applicationId: testAppId,
    vendorAccountId: account.id,
    actorType: "VENDOR",
    actorName: testEmail,
    action: "GATE_PASS_ISSUED",
    details: "Issued 24-hr site gate pass for Jaipur Site",
  });

  const logs = await getVendorActivityLogs(testAppId);
  assert.ok(logs.length >= 2, "Must contain at least 2 logs");
  assert.strictEqual(logs[0].action, "GATE_PASS_ISSUED");
  assert.strictEqual(logs[1].action, "VENDOR_LOGGED_IN");
  passed++;
  console.log("[PASS 6] Chronological vendor activity audit verified");

  console.log("==================================================================");
  console.log(`TOTAL CHECKS: ${passed} | PASSED: ${passed} | FAILED: 0`);
  console.log("==================================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
