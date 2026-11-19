/**
 * backend/test/empanelmentRegistration.test.ts
 *
 * PR A1 Regression Test Suite for Vendor Registration Past Work Document Mapping:
 * 1. Canonical workExperienceDocUrl is accepted and persisted.
 * 2. Legacy pastWorkDocUrl is accepted and mapped correctly into workExperienceDocUrl.
 * 3. Canonical value takes precedence when both fields are supplied.
 * 4. Empty or null document values remain optional (saved as null).
 * 5. Missing termsAgreed is rejected with HTTP 400.
 * 6. termsAgreed: false is rejected with HTTP 400.
 * 7. Missing mandatory registration fields are rejected with HTTP 400.
 * 8. Existing registration behaviour remains compatible (trackingId, provisional tier, score).
 * 9. Persisted work-experience document is accessible through Admin Review data path (/admin/applications/:id).
 */

import assert from "assert";
import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { prisma } from "../src/lib/db";
import empanelmentRouter from "../src/routes/empanelment";

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
// Standard Baseline Registration Payload
// -----------------------------------------------------------------------------

function getValidPayload(overrides: Record<string, any> = {}) {
  return {
    companyName: "Hindustan Infra Buildtech Pvt Ltd",
    tradeName: "HiPRO Buildtech",
    category: "Civil Construction",
    entityType: "PRIVATE_LIMITED",
    pan: "ABCDE1234F",
    gstin: "08ABCDE1234F1Z5",
    gstCertificateUrl: "https://storage.example.com/gst-certificate.pdf",
    contactName: "Rajendra Sharma",
    designation: "Managing Director",
    phone: "9876543210",
    email: "procurement@hindustanbuildtech.com",
    address: "Plot 104, RIICO Industrial Area",
    city: "Bhilwara",
    state: "Rajasthan",
    pincode: "311001",
    bankName: "State Bank of India",
    accountNumber: "38920194819",
    ifscCode: "SBIN0001234",
    termsAgreed: true,
    ...overrides,
  };
}

function generateTestCuid(timestampMs: number = Date.now()): string {
  const base36Time = timestampMs.toString(36).padStart(8, "0");
  return `c${base36Time}0001slp6testcuid1`;
}

const VALID_ADMIN_SESSION_ID = generateTestCuid(Date.now() - 3600000);

// -----------------------------------------------------------------------------
// Test Execution Suite
// -----------------------------------------------------------------------------

async function runTests() {
  console.log("==================================================================");
  console.log("PR A1: Vendor Registration Past Work Mapping & Validation Test Suite");
  console.log("==================================================================");

  // Preserve original Prisma functions
  const originalCreate = prisma.vendorApplication.create;
  const originalFindUnique = prisma.vendorApplication.findUnique;
  const originalAdminSessionFind = prisma.adminSession.findUnique;
  const originalAdminUserFind = prisma.adminUser.findUnique;

  let capturedCreateData: any = null;
  let mockDatabaseRecord: any = null;

  (prisma.vendorApplication as any).create = async ({ data }: any) => {
    capturedCreateData = data;
    mockDatabaseRecord = {
      id: "test-app-cuid-123",
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

  // Mock admin authentication for admin review path
  (prisma.adminSession as any).findUnique = async ({ where }: any) => {
    if (where.id === VALID_ADMIN_SESSION_ID) {
      return {
        id: VALID_ADMIN_SESSION_ID,
        userId: "admin-user-id",
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
      };
    }
    return null;
  };

  try {
    // Start ephemeral local server
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const addr = server.address() as any;
        port = addr.port;
        resolve();
      });
    });

    // -------------------------------------------------------------------------
    // TEST 1: Canonical workExperienceDocUrl is accepted and persisted
    // -------------------------------------------------------------------------
    {
      capturedCreateData = null;
      const canonicalDoc = "data:application/pdf;base64,JVBERi0xLjQKJ...";
      const res = await makeRequest("POST", "/api/empanelment/apply", getValidPayload({
        workExperienceDocUrl: canonicalDoc,
      }));

      assert.strictEqual(res.status, 201, "Test 1 failed: Expected status 201 Created");
      assert.strictEqual(res.body.success, true, "Test 1 failed: Expected success true");
      assert.strictEqual(
        capturedCreateData.workExperienceDocUrl,
        canonicalDoc,
        "Test 1 failed: Canonical workExperienceDocUrl must be persisted directly in VendorApplication"
      );
      console.log("PASS - Test 1: Canonical workExperienceDocUrl is accepted and persisted");
    }

    // -------------------------------------------------------------------------
    // TEST 2: Legacy pastWorkDocUrl is accepted and mapped correctly
    // -------------------------------------------------------------------------
    {
      capturedCreateData = null;
      const legacyDoc = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE...";
      const res = await makeRequest("POST", "/api/empanelment/apply", getValidPayload({
        pastWorkDocUrl: legacyDoc,
      }));

      assert.strictEqual(res.status, 201, "Test 2 failed: Expected status 201 Created");
      assert.strictEqual(res.body.success, true, "Test 2 failed: Expected success true");
      assert.strictEqual(
        capturedCreateData.workExperienceDocUrl,
        legacyDoc,
        "Test 2 failed: Legacy pastWorkDocUrl must be mapped into workExperienceDocUrl"
      );
      console.log("PASS - Test 2: Legacy pastWorkDocUrl is accepted and mapped correctly");
    }

    // -------------------------------------------------------------------------
    // TEST 3: Canonical value takes precedence when both fields are supplied
    // -------------------------------------------------------------------------
    {
      capturedCreateData = null;
      const canonicalDoc = "data:application/pdf;base64,CANONICAL_PRECEDENCE...";
      const legacyDoc = "data:image/jpeg;base64,LEGACY_OVERWRITTEN...";
      const res = await makeRequest("POST", "/api/empanelment/apply", getValidPayload({
        workExperienceDocUrl: canonicalDoc,
        pastWorkDocUrl: legacyDoc,
      }));

      assert.strictEqual(res.status, 201, "Test 3 failed: Expected status 201 Created");
      assert.strictEqual(
        capturedCreateData.workExperienceDocUrl,
        canonicalDoc,
        "Test 3 failed: Canonical workExperienceDocUrl must take precedence over legacy pastWorkDocUrl"
      );
      console.log("PASS - Test 3: Canonical value takes precedence when both fields are supplied");
    }

    // -------------------------------------------------------------------------
    // TEST 4: Empty or null document values remain optional (persisted as null)
    // -------------------------------------------------------------------------
    {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getValidPayload({
        workExperienceDocUrl: null,
        pastWorkDocUrl: "",
      }));

      assert.strictEqual(res.status, 201, "Test 4 failed: Expected status 201 Created");
      assert.strictEqual(
        capturedCreateData.workExperienceDocUrl,
        null,
        "Test 4 failed: Empty or null workExperienceDocUrl must remain optional and persist as null"
      );
      console.log("PASS - Test 4: Empty or null document values remain optional (persisted as null)");
    }

    // -------------------------------------------------------------------------
    // TEST 5: Missing termsAgreed is rejected with HTTP 400
    // -------------------------------------------------------------------------
    {
      const payload = getValidPayload();
      delete (payload as any).termsAgreed;
      const res = await makeRequest("POST", "/api/empanelment/apply", payload);

      assert.strictEqual(res.status, 400, "Test 5 failed: Missing termsAgreed must return HTTP 400");
      assert.strictEqual(res.body.success, false, "Test 5 failed: Expected success false");
      assert.ok(
        res.body.error.toLowerCase().includes("declaration") || res.body.error.toLowerCase().includes("conduct"),
        "Test 5 failed: Error message must explain terms declaration is required"
      );
      console.log("PASS - Test 5: Missing termsAgreed is rejected with HTTP 400");
    }

    // -------------------------------------------------------------------------
    // TEST 6: termsAgreed: false is rejected with HTTP 400
    // -------------------------------------------------------------------------
    {
      const res = await makeRequest("POST", "/api/empanelment/apply", getValidPayload({
        termsAgreed: false,
      }));

      assert.strictEqual(res.status, 400, "Test 6 failed: termsAgreed: false must return HTTP 400");
      assert.strictEqual(res.body.success, false, "Test 6 failed: Expected success false");
      console.log("PASS - Test 6: termsAgreed: false is rejected with HTTP 400");
    }

    // -------------------------------------------------------------------------
    // TEST 7: Missing mandatory registration fields are rejected
    // -------------------------------------------------------------------------
    {
      const mandatoryFields = ["companyName", "contactName", "phone", "email", "pan"];
      for (const field of mandatoryFields) {
        const payload = getValidPayload({ [field]: "" });
        const res = await makeRequest("POST", "/api/empanelment/apply", payload);

        assert.strictEqual(
          res.status,
          400,
          `Test 7 failed: Empty mandatory field '${field}' must return HTTP 400`
        );
        assert.strictEqual(res.body.success, false);
      }
      console.log("PASS - Test 7: Missing mandatory registration fields are rejected with HTTP 400");
    }

    // -------------------------------------------------------------------------
    // TEST 8: Existing registration behaviour remains compatible
    // -------------------------------------------------------------------------
    {
      capturedCreateData = null;
      const res = await makeRequest("POST", "/api/empanelment/apply", getValidPayload());

      assert.strictEqual(res.status, 201, "Test 8 failed: Expected status 201 Created");
      assert.ok(res.body.trackingId.startsWith("HP-EMP-"), "Test 8 failed: Must generate HP-EMP- trackingId");
      assert.strictEqual(capturedCreateData.status, "SUBMITTED", "Test 8 failed: Default status must be SUBMITTED");
      assert.ok(capturedCreateData.hashSignature, "Test 8 failed: Must compute SHA-256 hashSignature");
      console.log("PASS - Test 8: Existing registration behaviour remains compatible");
    }

    // -------------------------------------------------------------------------
    // TEST 9: Persisted work-experience document is available through Admin Review data path
    // -------------------------------------------------------------------------
    {
      // Create a submission with past work doc
      const testDocUrl = "data:application/pdf;base64,ADMIN_PREVIEW_DOC_VERIFICATION";
      const submitRes = await makeRequest("POST", "/api/empanelment/apply", getValidPayload({
        pastWorkDocUrl: testDocUrl,
      }));
      assert.strictEqual(submitRes.status, 201);

      // Query admin application detail route
      const adminRes = await makeRequest(
        "GET",
        `/api/empanelment/admin/applications/${mockDatabaseRecord.id}`,
        undefined,
        { admin_session: VALID_ADMIN_SESSION_ID }
      );

      assert.strictEqual(adminRes.status, 200, "Test 9 failed: Admin application detail must return HTTP 200");
      assert.strictEqual(adminRes.body.success, true);
      assert.strictEqual(
        adminRes.body.application.workExperienceDocUrl,
        testDocUrl,
        "Test 9 failed: workExperienceDocUrl must be available in admin application response"
      );
      console.log("PASS - Test 9: Persisted work-experience document is available through Admin Review data path");
    }

    console.log("==================================================================");
    console.log("ALL 9 PR A1 REGRESSION TESTS PASSED SUCCESSFULLY");
    console.log("==================================================================");
  } finally {
    // Restore mocks
    (prisma.vendorApplication as any).create = originalCreate;
    (prisma.vendorApplication as any).findUnique = originalFindUnique;
    (prisma.adminSession as any).findUnique = originalAdminSessionFind;
    (prisma.adminUser as any).findUnique = originalAdminUserFind;

    if (server) {
      server.close();
    }
  }
}

runTests().catch((err) => {
  console.error("Test Suite Failed with Exception:", err);
  process.exit(1);
});
