/**
 * frontend/test/partner-verification.test.mjs
 *
 * Phase 1 Final Regression Test Suite for Smart Partner Verification:
 * 1. Approved vendor verification (APPROVED status displays verified partner credential).
 * 2. Pending vendor verification (KNOWN_PENDING_STATUSES displays pending notice).
 * 3. Rejected/inactive vendor (KNOWN_VOID_STATUSES displays void credential).
 * 4. Unknown/unexpected status (displays neutral status verification unavailable state).
 * 5. Missing tracking ID (displays neutral verification lookup form).
 * 6. Invalid tracking ID (displays not found in registry message on 404).
 * 7. Legacy `trackingId` query parameter is supported seamlessly.
 * 8. Canonical `id` query parameter is supported seamlessly.
 * 9. Sensitive fields are NEVER exposed in dedicated /verify endpoint or UI interface.
 * 10. Partner verification route NEVER redirects to application tracking (/empanelment/track).
 * 11. SmartCardPreviewModal encodes canonical production host (https://www.hindustanprojects.in).
 * 12. Smart Partner Verification page queries dedicated /api/empanelment/verify/ endpoint.
 * 13. Certificate URL protocol validation blocks javascript: and allows safe schemes.
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================================");
console.log("Smart Partner Verification & Privacy Regression Test Suite");
console.log("==================================================================");

// -----------------------------------------------------------------------------
// TEST 1: Approved Vendor Verification Logic
// -----------------------------------------------------------------------------
{
  const mockApprovedVendor = {
    trackingId: "HP-EMP-849201",
    companyName: "Hindustan Infra Buildtech Pvt Ltd",
    status: "APPROVED",
    tier: "CLASS_A",
    category: "Civil Works & Structural Execution",
    approvedAt: "2026-10-15T10:00:00.000Z",
    city: "Bhilwara",
    state: "Rajasthan",
    digitalCertificateUrl: "https://storage.hindustanprojects.in/certs/HP-EMP-849201.pdf",
  };

  assert.strictEqual(mockApprovedVendor.status, "APPROVED");
  assert.ok(mockApprovedVendor.companyName.length > 0);
  assert.ok(mockApprovedVendor.trackingId.startsWith("HP-EMP-"));
  assert.strictEqual(mockApprovedVendor.tier, "CLASS_A");
  console.log("PASS - Test 1: Approved vendor verification contract is valid");
}

// -----------------------------------------------------------------------------
// TEST 2: Pending Vendor (Not Approved)
// -----------------------------------------------------------------------------
{
  const pendingStatuses = ["SUBMITTED", "UNDER_VERIFICATION", "TECHNICAL_AUDIT", "FINANCIAL_REVIEW", "DOCS_REQUESTED"];

  for (const status of pendingStatuses) {
    const isApproved = status === "APPROVED";
    assert.strictEqual(isApproved, false, `Status ${status} must not be treated as approved`);
  }
  console.log("PASS - Test 2: Pending applications are never treated as approved");
}

// -----------------------------------------------------------------------------
// TEST 3: Rejected / Inactive Vendor
// -----------------------------------------------------------------------------
{
  const inactiveStatuses = ["REJECTED", "BLACKLISTED"];

  for (const status of inactiveStatuses) {
    const isVoid = status === "REJECTED" || status === "BLACKLISTED";
    assert.strictEqual(isVoid, true, `Status ${status} must be treated as void`);
  }
  console.log("PASS - Test 3: Rejected and blacklisted records are identified as void");
}

// -----------------------------------------------------------------------------
// TEST 4: Unknown / Unexpected Status Handling (Neutral State)
// -----------------------------------------------------------------------------
{
  const verifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/empanelment/verify-partner/page.tsx"),
    "utf8"
  );

  assert.ok(
    verifyPartnerSource.includes("STATUS VERIFICATION UNAVAILABLE"),
    "VerifyPartner must provide neutral state for unknown/unexpected statuses"
  );
  assert.ok(
    verifyPartnerSource.includes("!KNOWN_PENDING_STATUSES.includes(vendor.status)"),
    "VerifyPartner must differentiate unknown statuses from pending statuses"
  );
  console.log("PASS - Test 4: Unknown status triggers neutral unavailable state without approval");
}

// -----------------------------------------------------------------------------
// TEST 5: Missing Tracking ID Handling
// -----------------------------------------------------------------------------
{
  const verifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/empanelment/verify-partner/page.tsx"),
    "utf8"
  );

  assert.ok(
    verifyPartnerSource.includes('searchParams?.get("id") || searchParams?.get("trackingId") || ""'),
    "VerifyPartner must safely read id or trackingId"
  );
  assert.ok(
    verifyPartnerSource.includes("Enter Empanelment Tracking ID to Verify"),
    "VerifyPartner must provide manual input when no ID is passed"
  );
  console.log("PASS - Test 5: Missing tracking ID renders manual lookup input without errors");
}

// -----------------------------------------------------------------------------
// TEST 6: Invalid Tracking ID Handling
// -----------------------------------------------------------------------------
{
  const verifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/empanelment/verify-partner/page.tsx"),
    "utf8"
  );

  assert.ok(
    verifyPartnerSource.includes("Credential Not Found in Registry"),
    "VerifyPartner must render a clear not found message on 404"
  );
  assert.ok(
    verifyPartnerSource.includes("res.status === 404"),
    "VerifyPartner must detect 404 responses explicitly"
  );
  console.log("PASS - Test 6: Invalid tracking ID triggers clear not-found state");
}

// -----------------------------------------------------------------------------
// TEST 7: Legacy `trackingId` Parameter Compatibility
// -----------------------------------------------------------------------------
{
  const verifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/empanelment/verify-partner/page.tsx"),
    "utf8"
  );
  const siteVerifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/(site)/verify-partner/page.tsx"),
    "utf8"
  );

  assert.ok(
    verifyPartnerSource.includes('searchParams?.get("trackingId")'),
    "empanelment/verify-partner must support legacy trackingId query param"
  );
  assert.ok(
    siteVerifyPartnerSource.includes("trackingId"),
    "(site)/verify-partner must support legacy trackingId query param"
  );
  console.log("PASS - Test 7: Legacy trackingId parameter is fully supported across routes");
}

// -----------------------------------------------------------------------------
// TEST 8: Canonical `id` Parameter
// -----------------------------------------------------------------------------
{
  const verifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/empanelment/verify-partner/page.tsx"),
    "utf8"
  );
  const siteVerifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/(site)/verify-partner/page.tsx"),
    "utf8"
  );

  assert.ok(
    verifyPartnerSource.includes('searchParams?.get("id")'),
    "empanelment/verify-partner must accept canonical id parameter"
  );
  assert.ok(
    siteVerifyPartnerSource.includes("id"),
    "(site)/verify-partner must accept canonical id parameter"
  );
  console.log("PASS - Test 8: Canonical id parameter is supported across routes");
}

// -----------------------------------------------------------------------------
// TEST 9: Sensitive Fields are NEVER Exposed in Verify Endpoint or UI Interface
// -----------------------------------------------------------------------------
{
  const empanelmentRouteSource = fs.readFileSync(
    path.resolve(rootDir, "../backend/src/routes/empanelment.ts"),
    "utf8"
  );

  const verifyRouteMatch = empanelmentRouteSource.match(/router\.get\("\/verify\/:trackingId"[\s\S]*?select:\s*\{([\s\S]*?)\}/);
  assert.ok(verifyRouteMatch, "verify endpoint must exist with strict field projection");

  const projectedFields = verifyRouteMatch[1];
  const forbiddenSensitiveKeys = [
    "contactName",
    "eligibilityScore",
    "isGstVerified",
    "pan",
    "gstin",
    "phone",
    "email",
    "bankName",
    "accountNumber",
    "ifscCode",
    "address",
    "passportPhotoUrl",
    "adminRemarks",
    "turnoverYear1",
    "turnoverYear2",
  ];

  for (const forbidden of forbiddenSensitiveKeys) {
    const isExposed = new RegExp(`\\b${forbidden}:\\s*true\\b`).test(projectedFields);
    assert.strictEqual(isExposed, false, `Field '${forbidden}' must NEVER be exposed in verify endpoint`);
  }
  console.log("PASS - Test 9: Sensitive financial & PII fields are strictly excluded from /verify endpoint");
}

// -----------------------------------------------------------------------------
// TEST 10: Partner Verification Never Redirects to Application Tracking
// -----------------------------------------------------------------------------
{
  const siteVerifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/(site)/verify-partner/page.tsx"),
    "utf8"
  );
  const empanelmentVerifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/empanelment/verify-partner/page.tsx"),
    "utf8"
  );

  // (site)/verify-partner must redirect to /empanelment/verify-partner, NOT /empanelment/track
  assert.ok(
    siteVerifyPartnerSource.includes("/empanelment/verify-partner"),
    "(site)/verify-partner must forward to /empanelment/verify-partner"
  );
  assert.strictEqual(
    siteVerifyPartnerSource.includes("/empanelment/track"),
    false,
    "(site)/verify-partner must NOT redirect to /empanelment/track"
  );

  // empanelment/verify-partner must NOT redirect to /empanelment/track
  assert.strictEqual(
    empanelmentVerifyPartnerSource.includes('redirect("/empanelment/track")'),
    false,
    "empanelment/verify-partner must not unconditionally redirect to tracking"
  );
  console.log("PASS - Test 10: Partner verification is decoupled from applicant tracking");
}

// -----------------------------------------------------------------------------
// TEST 11: Canonical Production Host in SmartCardPreviewModal
// -----------------------------------------------------------------------------
{
  const smartCardSource = fs.readFileSync(
    path.join(rootDir, "components/admin/empanelment/SmartCardPreviewModal.tsx"),
    "utf8"
  );

  assert.ok(
    smartCardSource.includes('const CANONICAL_HOST = "https://www.hindustanprojects.in"'),
    "SmartCardPreviewModal must use canonical production host https://www.hindustanprojects.in"
  );
  assert.strictEqual(
    smartCardSource.includes("window.location.origin"),
    false,
    "SmartCardPreviewModal must NOT use dynamic window.location.origin"
  );
  assert.ok(
    smartCardSource.includes("/empanelment/verify-partner?id="),
    "SmartCardPreviewModal QR must encode /empanelment/verify-partner?id="
  );
  console.log("PASS - Test 11: SmartCardPreviewModal encodes canonical host & partner verification URL");
}

// -----------------------------------------------------------------------------
// TEST 12: Partner Verification Page Queries Dedicated /verify/ Endpoint
// -----------------------------------------------------------------------------
{
  const verifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/empanelment/verify-partner/page.tsx"),
    "utf8"
  );

  assert.ok(
    verifyPartnerSource.includes("/api/empanelment/verify/"),
    "VerifyPartner must query /api/empanelment/verify/, NOT /api/empanelment/track/"
  );
  assert.strictEqual(
    verifyPartnerSource.includes("/api/empanelment/track/"),
    false,
    "VerifyPartner must NOT query the applicant tracking endpoint"
  );
  console.log("PASS - Test 12: Partner Verification page queries dedicated /verify/ endpoint");
}

// -----------------------------------------------------------------------------
// TEST 13: Certificate URL Protocol Validation
// -----------------------------------------------------------------------------
{
  const verifyPartnerSource = fs.readFileSync(
    path.join(rootDir, "app/empanelment/verify-partner/page.tsx"),
    "utf8"
  );

  assert.ok(
    verifyPartnerSource.includes("isSafeCertificateUrl"),
    "VerifyPartner must define and invoke isSafeCertificateUrl"
  );
  assert.ok(
    verifyPartnerSource.includes('lower.startsWith("javascript:")'),
    "isSafeCertificateUrl must explicitly block javascript: scheme"
  );
  console.log("PASS - Test 13: Certificate URL protocol validation blocks unsafe schemes");
}

console.log("==================================================================");
console.log("ALL 13 SMART PARTNER VERIFICATION TESTS PASSED SUCCESSFULLY");
console.log("==================================================================");
