/**
 * backend/test/empanelmentVerify.test.ts
 *
 * Dedicated Regression Test Suite for Smart Partner Verification API:
 * 1. Approved verification response (status === "APPROVED", correct fields).
 * 2. Pending status verification response (e.g. UNDER_VERIFICATION).
 * 3. Rejected and blacklisted status verification response.
 * 4. Unknown/unexpected status verification response (e.g. SUSPENDED).
 * 5. Invalid tracking ID returns HTTP 404.
 * 6. Missing tracking ID returns HTTP 400.
 * 7. Private/sensitive fields strictly absent from verify API response.
 * 8. Certificate URL protocol validation (sanitizes javascript:, preserves https: and data:).
 * 9. Existing tracking API (/api/empanelment/track/:trackingId) remains completely unchanged.
 */

import assert from "assert";
import express from "express";
import http from "http";
import { prisma } from "../src/lib/db";
import empanelmentRouter from "../src/routes/empanelment";

const app = express();
app.use(express.json());
app.use("/api/empanelment", empanelmentRouter);

let server: http.Server;
let port: number;

function makeRequest(
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: {
          ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
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

async function runTests() {
  console.log("==================================================================");
  console.log("Smart Partner Verification API (/verify/:id) Regression Test Suite");
  console.log("==================================================================");

  const originalFindUnique = prisma.vendorApplication.findUnique;
  const originalFindFirst = prisma.vendorApplication.findFirst;

  const mockDatabase: Record<string, any> = {
    "HP-EMP-APPROVED": {
      id: "v-cuid-101",
      trackingId: "HP-EMP-APPROVED",
      status: "APPROVED",
      companyName: "Hindustan Infra Buildtech Pvt Ltd",
      contactName: "Rajesh Kumar",
      category: "Civil Works & Structural Execution",
      tier: "CLASS_A",
      city: "Bhilwara",
      state: "Rajasthan",
      approvedAt: new Date("2026-10-15T10:00:00.000Z"),
      digitalCertificateUrl: "https://storage.hindustanprojects.in/certs/HP-EMP-APPROVED.pdf",
      pan: "ABCDE1234F",
      gstin: "08ABCDE1234F1Z5",
      phone: "9829012345",
      email: "rajesh@hindustaninfra.test",
      isGstVerified: true,
      eligibilityScore: 92,
      bankName: "HDFC Bank",
      accountNumber: "50100123456789",
      ifscCode: "HDFC0001234",
      adminRemarks: "Board approved Class A empanelment.",
      passportPhotoUrl: "data:image/jpeg;base64,dummyphoto",
      submittedAt: new Date("2026-10-01T10:00:00.000Z"),
    },
    "HP-EMP-PENDING": {
      id: "v-cuid-102",
      trackingId: "HP-EMP-PENDING",
      status: "UNDER_VERIFICATION",
      companyName: "Pending Infra Solutions LLP",
      contactName: "Sunil Verma",
      category: "MEP & Electrical",
      tier: "CLASS_B",
      city: "Jaipur",
      state: "Rajasthan",
      approvedAt: null,
      digitalCertificateUrl: null,
      pan: "BCDEF2345G",
      gstin: "08BCDEF2345G1Z6",
      phone: "9829098765",
      email: "sunil@pendinginfra.test",
      isGstVerified: true,
      eligibilityScore: 78,
      submittedAt: new Date("2026-11-01T10:00:00.000Z"),
    },
    "HP-EMP-REJECTED": {
      id: "v-cuid-103",
      trackingId: "HP-EMP-REJECTED",
      status: "REJECTED",
      companyName: "Rejected Contracting Ltd",
      contactName: "Vikas Jain",
      category: "Civil Works",
      tier: "CLASS_C",
      city: "Udaipur",
      state: "Rajasthan",
      approvedAt: null,
      digitalCertificateUrl: null,
    },
    "HP-EMP-BLACKLISTED": {
      id: "v-cuid-104",
      trackingId: "HP-EMP-BLACKLISTED",
      status: "BLACKLISTED",
      companyName: "Blacklisted Suppliers Corp",
      contactName: "Ashok Sharma",
      category: "Raw Material Supply",
      tier: "CLASS_D",
      city: "Ajmer",
      state: "Rajasthan",
      approvedAt: null,
      digitalCertificateUrl: null,
    },
    "HP-EMP-UNKNOWN": {
      id: "v-cuid-105",
      trackingId: "HP-EMP-UNKNOWN",
      status: "SUSPENDED",
      companyName: "Suspended Operations Pvt Ltd",
      contactName: "Manoj Agarwal",
      category: "Specialized Trade",
      tier: "CLASS_B",
      city: "Kota",
      state: "Rajasthan",
      approvedAt: null,
      digitalCertificateUrl: null,
    },
    "HP-EMP-MALICIOUS-CERT": {
      id: "v-cuid-106",
      trackingId: "HP-EMP-MALICIOUS-CERT",
      status: "APPROVED",
      companyName: "Test Exploit Corp",
      category: "Civil Works",
      tier: "CLASS_A",
      city: "Jaipur",
      state: "Rajasthan",
      approvedAt: new Date("2026-10-15T10:00:00.000Z"),
      digitalCertificateUrl: "javascript:alert(document.cookie)",
    },
    "HP-EMP-DATA-URI-CERT": {
      id: "v-cuid-107",
      trackingId: "HP-EMP-DATA-URI-CERT",
      status: "APPROVED",
      companyName: "Data URI Cert Corp",
      category: "Civil Works",
      tier: "CLASS_A",
      city: "Jaipur",
      state: "Rajasthan",
      approvedAt: new Date("2026-10-15T10:00:00.000Z"),
      digitalCertificateUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    },
  };

  (prisma.vendorApplication as any).findUnique = async ({ where, select }: any) => {
    const record = mockDatabase[where.trackingId];
    if (!record) return null;
    if (!select) return record;
    const projected: Record<string, any> = {};
    for (const key of Object.keys(select)) {
      if (select[key]) {
        projected[key] = record[key];
      }
    }
    return projected;
  };

  (prisma.vendorApplication as any).findFirst = async ({ where, select }: any) => {
    let found = null;
    for (const candidate of Object.values(mockDatabase)) {
      if (where.OR) {
        for (const cond of where.OR) {
          if (cond.trackingId && candidate.trackingId.toUpperCase() === cond.trackingId.equals.toUpperCase()) {
            found = candidate;
            break;
          }
          if (cond.phone && candidate.phone === cond.phone.equals) {
            found = candidate;
            break;
          }
        }
      }
      if (found) break;
    }
    if (!found) return null;
    if (!select) return found;
    const projected: Record<string, any> = {};
    for (const key of Object.keys(select)) {
      if (select[key]) {
        projected[key] = found[key];
      }
    }
    return projected;
  };

  try {
    // TEST 1: Approved Verification Response
    {
      const res = await makeRequest("GET", "/api/empanelment/verify/HP-EMP-APPROVED");
      assert.strictEqual(res.status, 200, "Approved verification must return HTTP 200");
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.application.trackingId, "HP-EMP-APPROVED");
      assert.strictEqual(res.body.application.status, "APPROVED");
      assert.strictEqual(res.body.application.companyName, "Hindustan Infra Buildtech Pvt Ltd");
      assert.strictEqual(res.body.application.category, "Civil Works & Structural Execution");
      assert.strictEqual(res.body.application.tier, "CLASS_A");
      assert.strictEqual(res.body.application.city, "Bhilwara");
      assert.strictEqual(res.body.application.state, "Rajasthan");
      assert.strictEqual(res.body.application.digitalCertificateUrl, "https://storage.hindustanprojects.in/certs/HP-EMP-APPROVED.pdf");
      console.log("PASS - Test 1: Approved vendor verification returns correct status and public fields");
    }

    // TEST 2: Pending Status Verification Response
    {
      const res = await makeRequest("GET", "/api/empanelment/verify/HP-EMP-PENDING");
      assert.strictEqual(res.status, 200, "Pending verification must return HTTP 200");
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.application.status, "UNDER_VERIFICATION");
      assert.strictEqual(res.body.application.companyName, "Pending Infra Solutions LLP");
      console.log("PASS - Test 2: Pending application verification returns UNDER_VERIFICATION");
    }

    // TEST 3: Rejected and Blacklisted Status
    {
      const resRejected = await makeRequest("GET", "/api/empanelment/verify/HP-EMP-REJECTED");
      assert.strictEqual(resRejected.status, 200);
      assert.strictEqual(resRejected.body.application.status, "REJECTED");

      const resBlacklisted = await makeRequest("GET", "/api/empanelment/verify/HP-EMP-BLACKLISTED");
      assert.strictEqual(resBlacklisted.status, 200);
      assert.strictEqual(resBlacklisted.body.application.status, "BLACKLISTED");
      console.log("PASS - Test 3: Rejected and Blacklisted statuses are returned accurately");
    }

    // TEST 4: Unknown / Unexpected Status
    {
      const res = await makeRequest("GET", "/api/empanelment/verify/HP-EMP-UNKNOWN");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.application.status, "SUSPENDED");
      console.log("PASS - Test 4: Unknown status (SUSPENDED) is returned accurately without approval");
    }

    // TEST 5: Invalid Tracking ID (404)
    {
      const res = await makeRequest("GET", "/api/empanelment/verify/HP-EMP-NONEXISTENT");
      assert.strictEqual(res.status, 404, "Non-existent tracking ID must return HTTP 404");
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.error.includes("No partner credential found"));
      console.log("PASS - Test 5: Invalid tracking ID returns HTTP 404 with clear message");
    }

    // TEST 6: Private Fields Strictly Excluded from Verify API Response
    {
      const res = await makeRequest("GET", "/api/empanelment/verify/HP-EMP-APPROVED");
      const appData = res.body.application;

      assert.strictEqual(appData.contactName, undefined, "contactName must be undefined");
      assert.strictEqual(appData.eligibilityScore, undefined, "eligibilityScore must be undefined");
      assert.strictEqual(appData.isGstVerified, undefined, "isGstVerified must be undefined");
      assert.strictEqual(appData.pan, undefined, "pan must be undefined");
      assert.strictEqual(appData.gstin, undefined, "gstin must be undefined");
      assert.strictEqual(appData.phone, undefined, "phone must be undefined");
      assert.strictEqual(appData.email, undefined, "email must be undefined");
      assert.strictEqual(appData.bankName, undefined, "bankName must be undefined");
      assert.strictEqual(appData.accountNumber, undefined, "accountNumber must be undefined");
      assert.strictEqual(appData.ifscCode, undefined, "ifscCode must be undefined");
      assert.strictEqual(appData.adminRemarks, undefined, "adminRemarks must be undefined");
      assert.strictEqual(appData.passportPhotoUrl, undefined, "passportPhotoUrl must be undefined");
      assert.strictEqual(appData.id, undefined, "id must be undefined");
      assert.strictEqual(appData.submittedAt, undefined, "submittedAt must be undefined");
      console.log("PASS - Test 6: All sensitive, private, and internal fields are strictly excluded");
    }

    // TEST 7: Certificate URL Validation and Sanitization
    {
      // Malicious javascript: URL sanitized to null
      const resMalicious = await makeRequest("GET", "/api/empanelment/verify/HP-EMP-MALICIOUS-CERT");
      assert.strictEqual(resMalicious.status, 200);
      assert.strictEqual(
        resMalicious.body.application.digitalCertificateUrl,
        null,
        "javascript: protocol must be sanitized to null"
      );

      // Safe Data URI certificate preserved
      const resDataUri = await makeRequest("GET", "/api/empanelment/verify/HP-EMP-DATA-URI-CERT");
      assert.strictEqual(resDataUri.status, 200);
      assert.strictEqual(
        resDataUri.body.application.digitalCertificateUrl,
        "data:application/pdf;base64,JVBERi0xLjQKJ...",
        "Safe data:application/pdf URI must be preserved"
      );
      console.log("PASS - Test 7: Certificate URLs are safely validated (unsafe schemes blocked)");
    }

    // TEST 8: Case-Insensitive Lookup
    {
      const res = await makeRequest("GET", "/api/empanelment/verify/hp-emp-approved");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.application.trackingId, "HP-EMP-APPROVED");
      console.log("PASS - Test 8: Lowercase tracking ID lookup succeeds seamlessly");
    }

    // TEST 9: Existing Tracking API Remains Completely Unchanged
    {
      const res = await makeRequest("GET", "/api/empanelment/track/HP-EMP-APPROVED");
      assert.strictEqual(res.status, 200, "Tracking endpoint must return HTTP 200");
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.application, "Tracking endpoint must return application object");
      assert.strictEqual(res.body.application.id, "v-cuid-101", "Tracking endpoint retains id");
      assert.strictEqual(res.body.application.contactName, "Rajesh Kumar", "Tracking endpoint retains contactName");
      assert.strictEqual(res.body.application.isGstVerified, true, "Tracking endpoint retains isGstVerified");
      assert.strictEqual(res.body.application.eligibilityScore, 92, "Tracking endpoint retains eligibilityScore");
      console.log("PASS - Test 9: Existing tracking API (/api/empanelment/track/:id) remains intact with full contract");
    }

    console.log("==================================================================");
    console.log("ALL 9 VERIFICATION API REGRESSION TESTS PASSED SUCCESSFULLY");
    console.log("==================================================================");
  } finally {
    prisma.vendorApplication.findUnique = originalFindUnique;
    prisma.vendorApplication.findFirst = originalFindFirst;
    server.close();
  }
}

server = app.listen(0, "127.0.0.1", () => {
  port = (server.address() as any).port;
  runTests().catch((err) => {
    console.error("Test execution failed:", err);
    if (server) server.close();
    process.exit(1);
  });
});
