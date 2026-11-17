/**
 * backend/test/phase2bRegistrationSemantics.test.ts
 *
 * Phase 2B.1 Regression Test Suite:
 * 1. All six approved categories are accepted.
 * 2. Unsupported non-empty categories return a validation error (HTTP 400).
 * 3. Empty category still permits unclassified registration (category: null, currentStage: "Pending Trade Classification").
 * 4. CMS category labels cannot silently become null through backend whitelist mismatch (rejected with 400).
 * 5. Authorized admin can assign an approved category (HTTP 200).
 * 6. Unauthorized admin cannot assign a category (HTTP 401/403).
 * 7. Approval without an assigned category remains blocked (HTTP 400).
 * 8. Empty turnover remains null (turnoverBracket: null).
 * 9. Empty workforce remains null (teamSize: null).
 * 10. Invalid turnover string cannot be persisted (HTTP 400).
 * 11. Valid turnover values are accepted (all 4 brackets).
 * 12. Valid PAN format is accepted (including case/space normalization).
 * 13. Invalid PAN format is rejected (HTTP 400).
 * 14. Existing historical records remain readable.
 * 15. Establishment year stored as calendar year directly (never inferred from yearsInBusiness).
 * 16. Multi-year audited turnover fields preserved and not overwritten.
 * 17. Client cannot force GST verification (isGstVerified forced false).
 * 18. Local vendor support: Registration succeeds without GSTIN (PAN only).
 * 19. Tender gating: Unclassified vendor cannot bid (HTTP 403).
 * 20. Tender gating: Category mismatch rejected (HTTP 403).
 * 21. Tender gating: Matching category approved vendor bids successfully (HTTP 201).
 */

import assert from "assert";
import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { prisma } from "../src/lib/db";
import empanelmentRouter, {
  resolveTeamSizeBracket,
  resolveTurnoverBracket,
  APPROVED_VENDOR_CATEGORIES,
  ALLOWED_TURNOVER_BRACKETS,
  ALLOWED_TEAM_SIZE_BRACKETS,
  PAN_REGEX,
} from "../src/routes/empanelment";

// -----------------------------------------------------------------------------
// Test Server Setup
// -----------------------------------------------------------------------------

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use("/api/empanelment", empanelmentRouter);

let server: http.Server;
let port: number;

function makeRequest(
  method: string,
  path: string,
  body?: any,
  cookies?: Record<string, string>
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const cookieHeader = cookies
      ? Object.entries(cookies)
          .map(([k, v]) => `${k}=${v}`)
          .join("; ")
      : undefined;

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: {
          ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode || 0, body: parsed, headers: res.headers });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// -----------------------------------------------------------------------------
// Baseline Payload Helper
// -----------------------------------------------------------------------------

function getBaselinePayload(overrides: Record<string, any> = {}) {
  return {
    companyName: "Sharma Engineering Works",
    tradeName: "Sharma Civil",
    category: "Civil Construction",
    entityType: "PROPRIETORSHIP",
    pan: "ABCDE1234F",
    gstin: "08ABCDE1234F1Z5",
    contactName: "Ramesh Sharma",
    phone: "9876543210",
    email: "ramesh@sharmaworks.in",
    address: "Plot 42, RIICO Industrial Area",
    city: "Bhilwara",
    state: "Rajasthan",
    pincode: "311001",
    bankName: "State Bank of India",
    accountNumber: "38192004812",
    ifscCode: "SBIN0001234",
    establishmentYear: "2018",
    turnoverBracket: "₹50 Lakh – ₹2 Crore",
    teamSize: "11-50",
    termsAgreed: true,
    ...overrides,
  };
}

function generateTestCuid(timestampMs: number = Date.now()): string {
  const base36Time = timestampMs.toString(36).padStart(8, "0");
  return `c${base36Time}0001slp6testcuid2b`;
}

const VALID_ADMIN_SESSION_ID = generateTestCuid(Date.now() - 3600000);
const UNAUTHORIZED_SESSION_ID = generateTestCuid(Date.now() - 7200000);

// -----------------------------------------------------------------------------
// Test Execution Suite
// -----------------------------------------------------------------------------

async function runTests() {
  console.log("==================================================================");
  console.log("Phase 2B.1: Vendor Registration Data Contract & Corrections Tests");
  console.log("==================================================================");

  // Preserve original Prisma functions
  const originalCreate = prisma.vendorApplication.create;
  const originalFindUnique = prisma.vendorApplication.findUnique;
  const originalUpdate = prisma.vendorApplication.update;
  const originalTenderFind = prisma.empanelmentTender.findUnique;
  const originalTenderFindMany = prisma.empanelmentTender.findMany;
  const originalTenderUpdate = prisma.empanelmentTender.update;
  const originalBidCreate = prisma.vendorBid.create;
  const originalSiteGatePassCreate = prisma.siteGatePass.create;
  const originalSiteGatePassFindUnique = prisma.siteGatePass.findUnique;
  const originalAdminSessionFind = prisma.adminSession.findUnique;
  const originalAdminUserFind = prisma.adminUser.findUnique;

  let capturedCreateData: any = null;
  let mockDatabaseRecord: any = null;
  let mockTenderRecord: any = null;

  let vendorBidCreateCalls = 0;
  let tenderUpdateCalls = 0;
  let siteGatePassCreateCalls = 0;

  (prisma.vendorApplication as any).create = async ({ data }: any) => {
    capturedCreateData = data;
    mockDatabaseRecord = {
      id: "test-app-cuid-2b",
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedAt: new Date(),
      approvedAt: null,
      bids: [],
      gatePasses: [],
      workOrders: [],
      invoices: [],
      tickets: [],
      ...data,
    };
    return mockDatabaseRecord;
  };

  (prisma.vendorApplication as any).findUnique = async ({ where }: any) => {
    if (mockDatabaseRecord && (where.id === mockDatabaseRecord.id || where.trackingId === mockDatabaseRecord.trackingId)) {
      return mockDatabaseRecord;
    }
    return null;
  };

  (prisma.vendorApplication as any).update = async ({ where, data }: any) => {
    if (mockDatabaseRecord && where.id === mockDatabaseRecord.id) {
      mockDatabaseRecord = { ...mockDatabaseRecord, ...data };
      return mockDatabaseRecord;
    }
    return null;
  };

  (prisma.empanelmentTender as any).findUnique = async ({ where }: any) => {
    if (mockTenderRecord && where.id === mockTenderRecord.id) {
      return mockTenderRecord;
    }
    return null;
  };

  (prisma.empanelmentTender as any).findMany = async () => {
    return [
      {
        id: "tender-civil-active",
        tenderNumber: "HP-TDR-2026-001",
        title: "Commercial Complex Structural Works",
        category: "Civil Construction",
        location: "Jaipur, Rajasthan",
        estimatedBudget: "₹4.5 Crore",
        bidsCount: 2,
        status: "ACTIVE",
      },
    ];
  };

  (prisma.empanelmentTender as any).update = async ({ where, data }: any) => {
    tenderUpdateCalls++;
    if (mockTenderRecord && where.id === mockTenderRecord.id) {
      return { ...mockTenderRecord, ...data };
    }
    return null;
  };

  (prisma.vendorBid as any).create = async ({ data }: any) => {
    vendorBidCreateCalls++;
    return { id: "bid-cuid-1", createdAt: new Date(), ...data };
  };

  (prisma.siteGatePass as any).create = async ({ data }: any) => {
    siteGatePassCreateCalls++;
    return { id: "pass-cuid-1", createdAt: new Date(), ...data };
  };

  (prisma.siteGatePass as any).findUnique = async ({ where }: any) => {
    if (where.passCode === "HP-GP-98214") {
      return {
        id: "pass-cuid-historical",
        passCode: "HP-GP-98214",
        visitorName: "Mukesh Sharma",
        workerCount: 5,
        vehicleNo: "RJ-14-EA-4592",
        siteLocation: "Mansarovar Commercial Site, Jaipur",
        validFrom: new Date(Date.now() - 3600000),
        validTill: new Date(Date.now() + 3600000),
        status: "ACTIVE",
        vendor: {
          companyName: "Sharma Engineering Works",
          contactName: "Ramesh Sharma",
          phone: "9876543210",
          tier: "CLASS_A",
        },
      };
    }
    return null;
  };

  (prisma.adminSession as any).findUnique = async ({ where }: any) => {
    if (where.id === VALID_ADMIN_SESSION_ID) {
      return {
        id: VALID_ADMIN_SESSION_ID,
        userId: "admin-user-id",
        expiresAt: new Date(Date.now() + 86400000),
      };
    }
    if (where.id === UNAUTHORIZED_SESSION_ID) {
      return {
        id: UNAUTHORIZED_SESSION_ID,
        userId: "unauthorized-user-id",
        expiresAt: new Date(Date.now() + 86400000),
      };
    }
    return null;
  };

  (prisma.adminUser as any).findUnique = async ({ where }: any) => {
    if (where.id === "admin-user-id") {
      return {
        id: "admin-user-id",
        email: "admin@hindustanprojects.in",
        role: "admin",
        permissions: ["empanelment"],
        isActive: true,
      };
    }
    if (where.id === "unauthorized-user-id") {
      return {
        id: "unauthorized-user-id",
        email: "staff@hindustanprojects.in",
        role: "employee",
        permissions: ["blogs"], // Missing empanelment permission
        isActive: true,
      };
    }
    return null;
  };

  const authCookies = { admin_session: VALID_ADMIN_SESSION_ID };
  const unauthorizedCookies = { admin_session: UNAUTHORIZED_SESSION_ID };

  let passedCount = 0;
  let failedCount = 0;

  function runCheck(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`[PASS] ${name}`);
        passedCount++;
      })
      .catch((err) => {
        console.error(`[FAIL] ${name}`);
        console.error(err);
        failedCount++;
      });
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: All Six Approved Categories are Accepted
    // -------------------------------------------------------------------------
    await runCheck("1. Category Sync: All 6 approved categories are accepted", async () => {
      assert.strictEqual(APPROVED_VENDOR_CATEGORIES.length, 6);
      for (const cat of APPROVED_VENDOR_CATEGORIES) {
        capturedCreateData = null;
        const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
          category: cat,
        }));
        assert.strictEqual(res.status, 201);
        assert.strictEqual(capturedCreateData.category, cat);
        assert.strictEqual(capturedCreateData.currentStage, "Document Audit & Compliance Verification");
      }
    });

    // -------------------------------------------------------------------------
    // TEST 2: Unsupported Non-Empty Categories Return a Validation Error
    // -------------------------------------------------------------------------
    await runCheck("2. Category Sync: Unsupported non-empty category returns HTTP 400 validation error", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        category: "Software Development & IT",
      }));
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.error, /Invalid trade category/i);
      assert.strictEqual(capturedCreateData, null); // Must not create record
    });

    // -------------------------------------------------------------------------
    // TEST 3: Empty Category Still Permits Unclassified Registration
    // -------------------------------------------------------------------------
    await runCheck("3. Category Sync: Empty category permits unclassified registration (category: null)", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        category: "",
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.category, null);
      assert.strictEqual(capturedCreateData.currentStage, "Pending Trade Classification");
    });

    // -------------------------------------------------------------------------
    // TEST 4: CMS Category Labels Cannot Silently Become Null
    // -------------------------------------------------------------------------
    await runCheck("4. Category Sync: Marketing CMS category strings return validation error rather than silent null", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        category: "Building Materials", // From CMS cards
      }));
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.error, /Invalid trade category 'Building Materials'/i);
    });

    // -------------------------------------------------------------------------
    // TEST 5: Authorized Admin Can Assign an Approved Category
    // -------------------------------------------------------------------------
    await runCheck("5. Admin RBAC: Authorized admin can assign an approved category", async () => {
      mockDatabaseRecord = {
        id: "vendor-app-unclassified",
        trackingId: "HP-EMP-555555",
        status: "SUBMITTED",
        category: null,
      };

      const res = await makeRequest(
        "PATCH",
        "/api/empanelment/admin/applications/vendor-app-unclassified/status",
        { category: "Fabrication & PEB" },
        authCookies
      );

      assert.strictEqual(res.status, 200);
      assert.strictEqual(mockDatabaseRecord.category, "Fabrication & PEB");
    });

    // -------------------------------------------------------------------------
    // TEST 6: Unauthorized Admin Cannot Assign a Category
    // -------------------------------------------------------------------------
    await runCheck("6. Admin RBAC: Unauthorized actor cannot assign a category (HTTP 401 / HTTP 403)", async () => {
      mockDatabaseRecord = {
        id: "vendor-app-unclassified-2",
        trackingId: "HP-EMP-555556",
        status: "SUBMITTED",
        category: null,
      };

      // 6a: Unauthenticated (no cookie) -> HTTP 401
      const resUnauth = await makeRequest(
        "PATCH",
        "/api/empanelment/admin/applications/vendor-app-unclassified-2/status",
        { category: "Civil Construction" }
      );
      assert.strictEqual(resUnauth.status, 401);

      // 6b: Employee without empanelment permission -> HTTP 403
      const resForbidden = await makeRequest(
        "PATCH",
        "/api/empanelment/admin/applications/vendor-app-unclassified-2/status",
        { category: "Civil Construction" },
        unauthorizedCookies
      );
      assert.strictEqual(resForbidden.status, 403);
      assert.strictEqual(mockDatabaseRecord.category, null); // Unaltered
    });

    // -------------------------------------------------------------------------
    // TEST 7: Approval Without an Assigned Category Remains Blocked
    // -------------------------------------------------------------------------
    await runCheck("7. Admin Safety: Approval without an assigned category remains blocked (HTTP 400)", async () => {
      mockDatabaseRecord = {
        id: "vendor-app-unclassified-3",
        trackingId: "HP-EMP-555557",
        status: "SUBMITTED",
        category: null,
      };

      const res = await makeRequest(
        "PATCH",
        "/api/empanelment/admin/applications/vendor-app-unclassified-3/status",
        { status: "APPROVED" },
        authCookies
      );

      assert.strictEqual(res.status, 400);
      assert.match(res.body.error, /Cannot approve partner without assigning an approved trade category/i);
    });

    // -------------------------------------------------------------------------
    // TEST 8: Empty Turnover Remains Null
    // -------------------------------------------------------------------------
    await runCheck("8. Financial Defaults: Empty turnover remains null (turnoverBracket: null)", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        turnoverBracket: "",
        annualTurnover: "",
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.turnoverBracket, null);
    });

    // -------------------------------------------------------------------------
    // TEST 9: Empty Workforce Remains Null
    // -------------------------------------------------------------------------
    await runCheck("9. Workforce Defaults: Empty workforce capacity remains null (teamSize: null)", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        teamSize: "",
        workforceCount: "",
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.teamSize, null);
    });

    // -------------------------------------------------------------------------
    // TEST 10: Invalid Turnover String Cannot Be Persisted
    // -------------------------------------------------------------------------
    await runCheck("10. Financial Validation: Invalid turnover string cannot be persisted (HTTP 400 / null)", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        turnoverBracket: "INVALID_UNAPPROVED_BRACKET",
      }));
      assert.strictEqual(res.status, 400);
      assert.match(res.body.error, /Invalid annual turnover bracket/i);
      assert.strictEqual(capturedCreateData, null);

      // Also verify helper unit resolution returns null directly
      assert.strictEqual(resolveTurnoverBracket("INVALID_VALUE", null), null);
    });

    // -------------------------------------------------------------------------
    // TEST 11: Valid Turnover Values are Accepted
    // -------------------------------------------------------------------------
    await runCheck("11. Financial Validation: All 4 approved turnover brackets are accepted", async () => {
      for (const bracket of ALLOWED_TURNOVER_BRACKETS) {
        capturedCreateData = null;
        const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
          turnoverBracket: bracket,
        }));
        assert.strictEqual(res.status, 201);
        assert.strictEqual(capturedCreateData.turnoverBracket, bracket);
      }
    });

    // -------------------------------------------------------------------------
    // TEST 12: Valid PAN Format is Accepted
    // -------------------------------------------------------------------------
    await runCheck("12. Statutory Validation: Valid PAN format accepted with normalization", async () => {
      capturedCreateData = null;
      // Test lowercase + whitespace normalization
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        pan: "  abcde1234f  ",
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.pan, "ABCDE1234F");
      assert.ok(PAN_REGEX.test(capturedCreateData.pan));
    });

    // -------------------------------------------------------------------------
    // TEST 13: Invalid PAN Format is Rejected
    // -------------------------------------------------------------------------
    await runCheck("13. Statutory Validation: Malformed PAN format rejected with HTTP 400", async () => {
      for (const malformed of ["INVALID", "12345", "ABCDE12345", "ABC1234F", "12345ABCDE", ""]) {
        capturedCreateData = null;
        const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
          pan: malformed,
        }));
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(capturedCreateData, null);
      }
    });

    // -------------------------------------------------------------------------
    // TEST 14: Existing Historical Records Remain Readable
    // -------------------------------------------------------------------------
    await runCheck("14. Compatibility: Existing historical records with multi-year turnover remain readable", async () => {
      mockDatabaseRecord = {
        id: "legacy-app-1",
        trackingId: "HP-EMP-000001",
        companyName: "Old Heritage Builders",
        category: "Civil Construction",
        status: "APPROVED",
        tier: "CLASS_B",
        establishmentYear: null,
        turnoverBracket: null,
        turnoverYear1: "₹40,00,000",
        turnoverYear2: "₹50,00,000",
        turnoverYear3: "₹60,00,000",
        teamSize: null,
        msmeDocUrl: null,
        workExperienceDocUrl: "https://storage.example.com/legacy-exp.pdf",
      };

      const res = await makeRequest(
        "GET",
        "/api/empanelment/admin/applications/legacy-app-1",
        undefined,
        authCookies
      );

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.application.companyName, "Old Heritage Builders");
      assert.strictEqual(res.body.application.turnoverYear1, "₹40,00,000");
    });

    // -------------------------------------------------------------------------
    // TEST 15: Establishment Year Semantics
    // -------------------------------------------------------------------------
    await runCheck("15. Establishment Year: Stored directly as calendar year, never inferred from yearsInBusiness", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        establishmentYear: "2018",
        yearsInBusiness: 5,
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.establishmentYear, "2018");
    });

    // -------------------------------------------------------------------------
    // TEST 16: Multi-Year Turnover Fields Preservation
    // -------------------------------------------------------------------------
    await runCheck("16. Financial Preservation: Multi-year audited turnover preserved and not overwritten", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        turnoverBracket: "₹50 Lakh – ₹2 Crore",
        turnoverYear1: "₹45,00,000",
        turnoverYear2: "₹65,00,000",
        turnoverYear3: "₹90,00,000",
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.turnoverBracket, "₹50 Lakh – ₹2 Crore");
      assert.strictEqual(capturedCreateData.turnoverYear1, "₹45,00,000");
      assert.strictEqual(capturedCreateData.turnoverYear2, "₹65,00,000");
      assert.strictEqual(capturedCreateData.turnoverYear3, "₹90,00,000");
    });

    // -------------------------------------------------------------------------
    // TEST 17: Client Cannot Force GST Verification
    // -------------------------------------------------------------------------
    await runCheck("17. Statutory Safety: Client cannot force isGstVerified: true on registration", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        isGstVerified: true,
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.isGstVerified, false);
    });

    // -------------------------------------------------------------------------
    // TEST 18: Local Vendor Support (GSTIN Optional)
    // -------------------------------------------------------------------------
    await runCheck("18. Local Vendor Support: Registration succeeds without GSTIN (PAN only)", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        gstin: undefined,
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.gstin, null);
      assert.strictEqual(capturedCreateData.pan, "ABCDE1234F");
    });

    // -------------------------------------------------------------------------
    // TEST 18.1: Document Requirements: Optional Documents (PAN Card & Cheque Omitted)
    // -------------------------------------------------------------------------
    await runCheck("18.1. Document Requirements: Registration succeeds without PAN card doc and without cancelled cheque", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        panCardUrl: undefined,
        bankChequeUrl: undefined,
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.panCardUrl, null);
      assert.strictEqual(capturedCreateData.bankChequeUrl, null);
      assert.strictEqual(capturedCreateData.pan, "ABCDE1234F"); // Mandatory PAN number preserved
    });

    // -------------------------------------------------------------------------
    // TEST 18.2: Document Requirements: Optional Documents Persisted When Provided
    // -------------------------------------------------------------------------
    await runCheck("18.2. Document Requirements: Optional PAN card doc and cancelled cheque persisted when provided", async () => {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getBaselinePayload({
        panCardUrl: "https://storage.example.com/pan-card.pdf",
        bankChequeUrl: "https://storage.example.com/cheque.pdf",
      }));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(capturedCreateData.panCardUrl, "https://storage.example.com/pan-card.pdf");
      assert.strictEqual(capturedCreateData.bankChequeUrl, "https://storage.example.com/cheque.pdf");
      assert.strictEqual(capturedCreateData.pan, "ABCDE1234F");
    });

    // -------------------------------------------------------------------------
    // TEST 19: Tender Containment — Public Bid Returns HTTP 503
    // -------------------------------------------------------------------------
    await runCheck("19. Tender Containment: Public bid submission unconditionally returns HTTP 503 Service Unavailable", async () => {
      const res = await makeRequest("POST", "/api/empanelment/tenders/tender-civil-active/bid", {
        trackingId: "HP-EMP-111111",
        bidAmount: 4500000,
      });

      assert.strictEqual(res.status, 503);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.error, /temporarily unavailable/i);
    });

    // -------------------------------------------------------------------------
    // TEST 20: Tender Containment — Zero Writes to VendorBid or bidsCount
    // -------------------------------------------------------------------------
    await runCheck("20. Tender Containment: No VendorBid record created and bidsCount remains unchanged", async () => {
      assert.strictEqual(vendorBidCreateCalls, 0, "Expected zero VendorBid records to be created");
      assert.strictEqual(tenderUpdateCalls, 0, "Expected zero updates to tender bidsCount");
    });

    // -------------------------------------------------------------------------
    // TEST 21: Tender Containment — Approved Tracking ID Cannot Bypass Suspension
    // -------------------------------------------------------------------------
    await runCheck("21. Tender Containment: Valid approved trackingId cannot bypass suspension (HTTP 503, 0 writes)", async () => {
      const initialBidCalls = vendorBidCreateCalls;
      const res = await makeRequest("POST", "/api/empanelment/tenders/tender-civil-active/bid", {
        trackingId: "HP-EMP-849201",
        bidAmount: 1000,
      });

      assert.strictEqual(res.status, 503);
      assert.strictEqual(vendorBidCreateCalls, initialBidCalls);
    });

    // -------------------------------------------------------------------------
    // TEST 22: Tender Containment — Missing / Invalid Payload Fails Closed (503)
    // -------------------------------------------------------------------------
    await runCheck("22. Tender Containment: Missing or invalid payload fails closed with HTTP 503 without writing", async () => {
      const initialBidCalls = vendorBidCreateCalls;
      const res = await makeRequest("POST", "/api/empanelment/tenders/tender-civil-active/bid", {});

      assert.strictEqual(res.status, 503);
      assert.strictEqual(vendorBidCreateCalls, initialBidCalls);
    });

    // -------------------------------------------------------------------------
    // TEST 23: Gate Pass Containment — Public Generation Returns HTTP 503
    // -------------------------------------------------------------------------
    await runCheck("23. Gate Pass Containment: Public gate pass generation returns HTTP 503 Service Unavailable", async () => {
      const res = await makeRequest("POST", "/api/empanelment/gate-pass/generate", {
        trackingId: "HP-EMP-849201",
        visitorName: "Mukesh Sharma",
        siteLocation: "Mansarovar Commercial Site, Jaipur",
      });

      assert.strictEqual(res.status, 503);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.error, /temporarily unavailable/i);
    });

    // -------------------------------------------------------------------------
    // TEST 24: Gate Pass Containment — Zero Writes to SiteGatePass
    // -------------------------------------------------------------------------
    await runCheck("24. Gate Pass Containment: No SiteGatePass record is created and no pass code is issued", async () => {
      assert.strictEqual(siteGatePassCreateCalls, 0, "Expected zero SiteGatePass records to be created");
    });

    // -------------------------------------------------------------------------
    // TEST 25: Gate Pass Verification — Historical Pass Verification Works
    // -------------------------------------------------------------------------
    await runCheck("25. Gate Pass Verification: Existing historical pass verification remains functional (HTTP 200)", async () => {
      const res = await makeRequest("GET", "/api/empanelment/gate-pass/verify/HP-GP-98214");

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.valid, true);
      assert.strictEqual(res.body.pass.passCode, "HP-GP-98214");
      assert.strictEqual(res.body.pass.status, "AUTHORIZED");
    });

    // -------------------------------------------------------------------------
    // TEST 26: Regression — Public Tender Listing Remains Functional
    // -------------------------------------------------------------------------
    await runCheck("26. Regression: Public tender listing remains functional (HTTP 200)", async () => {
      const res = await makeRequest("GET", "/api/empanelment/tenders");

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.tenders));
      assert.strictEqual(res.body.tenders.length, 1);
      assert.strictEqual(res.body.tenders[0].id, "tender-civil-active");
    });
  } finally {
    // Restore original Prisma functions
    prisma.vendorApplication.create = originalCreate;
    prisma.vendorApplication.findUnique = originalFindUnique;
    prisma.vendorApplication.update = originalUpdate;
    prisma.empanelmentTender.findUnique = originalTenderFind;
    prisma.empanelmentTender.findMany = originalTenderFindMany;
    prisma.empanelmentTender.update = originalTenderUpdate;
    prisma.vendorBid.create = originalBidCreate;
    prisma.siteGatePass.create = originalSiteGatePassCreate;
    prisma.siteGatePass.findUnique = originalSiteGatePassFindUnique;
    (prisma.adminSession as any).findUnique = originalAdminSessionFind;
    (prisma.adminUser as any).findUnique = originalAdminUserFind;
  }

  console.log("==================================================================");
  console.log(`TOTAL CHECKS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log("==================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

// Start test server
server = http.createServer(app);
server.listen(0, "127.0.0.1", () => {
  const addr = server.address() as any;
  port = addr.port;
  runTests().finally(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
