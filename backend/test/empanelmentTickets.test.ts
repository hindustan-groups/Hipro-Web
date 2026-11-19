/**
 * backend/test/empanelmentTickets.test.ts
 *
 * Phase 1 Regression Test Suite for Empanelment Support Tickets:
 * 1. Valid ticket submission with mandatory fields returns HTTP 201 and ticket record.
 * 2. Explicit priority ("HIGH", "URGENT", "LOW") is safely preserved.
 * 3. Invalid/unrecognized priority defaults to "NORMAL".
 * 4. Missing or empty mandatory fields (trackingId, subject, message) rejected with HTTP 400.
 * 5. Non-existent vendor trackingId rejected with HTTP 404.
 * 6. Case insensitivity and whitespace trimming for trackingId.
 * 7. Admin ticket retrieval (GET /api/empanelment/admin/tickets) with RBAC auth.
 * 8. Admin ticket reply (PATCH /api/empanelment/admin/tickets/:id) with status update to RESOLVED.
 */

import assert from "assert";
import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { prisma } from "../src/lib/db";
import empanelmentRouter from "../src/routes/empanelment";

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

function generateTestCuid(timestampMs: number = Date.now()): string {
  const base36Time = timestampMs.toString(36).padStart(8, "0");
  return `c${base36Time}0001slp6testcuid1`;
}

const VALID_ADMIN_SESSION_ID = generateTestCuid(Date.now() - 3600000);

async function runTests() {
  console.log("==================================================================");
  console.log("Empanelment Tickets API & Integration Regression Test Suite");
  console.log("==================================================================");

  // Preserve original Prisma functions
  const originalVendorFindUnique = prisma.vendorApplication.findUnique;
  const originalTicketCreate = prisma.empanelmentTicket.create;
  const originalTicketFindMany = prisma.empanelmentTicket.findMany;
  const originalTicketUpdate = prisma.empanelmentTicket.update;
  const originalAdminSessionFind = prisma.adminSession.findUnique;
  const originalAdminUserFind = prisma.adminUser.findUnique;

  const mockVendor = {
    id: "test-vendor-cuid-999",
    trackingId: "HP-EMP-849201",
    companyName: "Hindustan Test Infra Pvt Ltd",
    contactName: "Rajesh Kumar",
    phone: "9829012345",
    email: "rajesh@hindustaninfra.test",
    tier: "CLASS_A",
    status: "APPROVED",
  };

  let capturedTicketData: any = null;
  let mockTicketDatabase: any[] = [];

  (prisma.vendorApplication as any).findUnique = async ({ where }: any) => {
    if (where.trackingId === mockVendor.trackingId) {
      return mockVendor;
    }
    return null;
  };

  (prisma.empanelmentTicket as any).create = async ({ data }: any) => {
    capturedTicketData = data;
    const record = {
      id: `ticket-cuid-${mockTicketDatabase.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      adminReply: null,
      ...data,
      vendor: mockVendor,
    };
    mockTicketDatabase.push(record);
    return record;
  };

  (prisma.empanelmentTicket as any).findMany = async (args?: any) => {
    let result = [...mockTicketDatabase];
    if (args?.where?.status && args.where.status !== "ALL") {
      result = result.filter((t) => t.status === args.where.status);
    }
    if (args?.where?.priority && args.where.priority !== "ALL") {
      result = result.filter((t) => t.priority === args.where.priority);
    }
    return result;
  };

  (prisma.empanelmentTicket as any).update = async ({ where, data }: any) => {
    const record = mockTicketDatabase.find((t) => t.id === where.id);
    if (!record) throw new Error("Ticket not found");
    Object.assign(record, data, { updatedAt: new Date() });
    return record;
  };

  // Mock admin authentication
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
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const addr = server.address() as any;
        port = addr.port;
        resolve();
      });
    });

    // -------------------------------------------------------------------------
    // TEST 1: Valid Ticket Submission
    // -------------------------------------------------------------------------
    {
      capturedTicketData = null;
      const res = await makeRequest("POST", "/api/empanelment/tickets", {
        trackingId: "HP-EMP-849201",
        subject: "GST Invoicing Query",
        category: "Billing & Invoicing",
        priority: "NORMAL",
        message: "Need clarification on milestone billing certificate format.",
      });

      assert.strictEqual(res.status, 201, "Test 1 failed: Expected HTTP 201");
      assert.strictEqual(res.body.success, true, "Test 1 failed: Expected success true");
      assert.ok(res.body.ticketNo.startsWith("HP-TCK-"), "Test 1 failed: Expected HP-TCK- ticketNo prefix");
      assert.strictEqual(capturedTicketData.subject, "GST Invoicing Query");
      assert.strictEqual(capturedTicketData.priority, "NORMAL");
      assert.strictEqual(capturedTicketData.vendorId, mockVendor.id);
      console.log("PASS - Test 1: Valid ticket submission creates ticket record");
    }

    // -------------------------------------------------------------------------
    // TEST 2: Priority Preservation ("HIGH", "URGENT")
    // -------------------------------------------------------------------------
    {
      capturedTicketData = null;
      const res = await makeRequest("POST", "/api/empanelment/tickets", {
        trackingId: "HP-EMP-849201",
        subject: "Site Access Stoppage",
        category: "Gate Pass Issue",
        priority: "URGENT",
        message: "Concrete boom placer team stuck at Kota site entrance gate.",
      });

      assert.strictEqual(res.status, 201, "Test 2 failed: Expected HTTP 201");
      assert.strictEqual(capturedTicketData.priority, "URGENT", "Test 2 failed: URGENT priority must be preserved");
      console.log("PASS - Test 2: High/Urgent priority is preserved accurately");
    }

    // -------------------------------------------------------------------------
    // TEST 3: Invalid Priority Defaults to "NORMAL"
    // -------------------------------------------------------------------------
    {
      capturedTicketData = null;
      const res = await makeRequest("POST", "/api/empanelment/tickets", {
        trackingId: "HP-EMP-849201",
        subject: "General Question",
        priority: "INVALID_PRIORITY_TEXT",
        message: "Question regarding upcoming civil packages.",
      });

      assert.strictEqual(res.status, 201, "Test 3 failed: Expected HTTP 201");
      assert.strictEqual(capturedTicketData.priority, "NORMAL", "Test 3 failed: Invalid priority must default to NORMAL");
      console.log("PASS - Test 3: Unrecognized priority safely defaults to NORMAL");
    }

    // -------------------------------------------------------------------------
    // TEST 4: Missing or Empty Mandatory Fields Rejected with HTTP 400
    // -------------------------------------------------------------------------
    {
      // Missing trackingId
      const res1 = await makeRequest("POST", "/api/empanelment/tickets", {
        subject: "No tracking",
        message: "Some message",
      });
      assert.strictEqual(res1.status, 400, "Test 4.1 failed: Expected HTTP 400");
      assert.strictEqual(res1.body.success, false);

      // Whitespace-only subject
      const res2 = await makeRequest("POST", "/api/empanelment/tickets", {
        trackingId: "HP-EMP-849201",
        subject: "   ",
        message: "Some message",
      });
      assert.strictEqual(res2.status, 400, "Test 4.2 failed: Expected HTTP 400");
      assert.strictEqual(res2.body.success, false);

      // Whitespace-only message
      const res3 = await makeRequest("POST", "/api/empanelment/tickets", {
        trackingId: "HP-EMP-849201",
        subject: "Valid subject",
        message: "\t\n  ",
      });
      assert.strictEqual(res3.status, 400, "Test 4.3 failed: Expected HTTP 400");
      assert.strictEqual(res3.body.success, false);
      console.log("PASS - Test 4: Missing or whitespace mandatory fields rejected with HTTP 400");
    }

    // -------------------------------------------------------------------------
    // TEST 5: Non-existent Vendor Tracking ID Rejected with HTTP 404
    // -------------------------------------------------------------------------
    {
      const res = await makeRequest("POST", "/api/empanelment/tickets", {
        trackingId: "HP-EMP-NONEXISTENT",
        subject: "Unregistered ticket",
        message: "Should fail because vendor does not exist.",
      });

      assert.strictEqual(res.status, 404, "Test 5 failed: Expected HTTP 404");
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.error.includes("not found"), "Test 5 failed: Error message must explain vendor not found");
      console.log("PASS - Test 5: Non-existent tracking ID rejected with HTTP 404");
    }

    // -------------------------------------------------------------------------
    // TEST 6: Tracking ID Case Insensitivity & Whitespace Trimming
    // -------------------------------------------------------------------------
    {
      capturedTicketData = null;
      const res = await makeRequest("POST", "/api/empanelment/tickets", {
        trackingId: "  hp-emp-849201  ",
        subject: "Case insensitivity test",
        message: "Checking lowercase and leading/trailing spaces.",
      });

      assert.strictEqual(res.status, 201, "Test 6 failed: Expected HTTP 201");
      assert.strictEqual(capturedTicketData.vendorId, mockVendor.id);
      console.log("PASS - Test 6: Tracking ID safely trimmed and converted to uppercase");
    }

    // -------------------------------------------------------------------------
    // TEST 7: Admin Ticket Retrieval (GET /api/empanelment/admin/tickets)
    // -------------------------------------------------------------------------
    {
      const res = await makeRequest(
        "GET",
        "/api/empanelment/admin/tickets?priority=URGENT",
        undefined,
        { admin_session: VALID_ADMIN_SESSION_ID }
      );

      assert.strictEqual(res.status, 200, "Test 7 failed: Expected HTTP 200");
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.tickets), "Test 7 failed: Expected tickets array");
      assert.strictEqual(res.body.tickets.length, 1);
      assert.strictEqual(res.body.tickets[0].priority, "URGENT");
      console.log("PASS - Test 7: Admin ticket retrieval with RBAC and filtering works");
    }

    // -------------------------------------------------------------------------
    // TEST 8: Admin Ticket Reply (PATCH /api/empanelment/admin/tickets/:id)
    // -------------------------------------------------------------------------
    {
      const targetTicket = mockTicketDatabase[0];
      const replyBody = {
        adminReply: "Site security officer notified. Access granted via Gate 2.",
        status: "RESOLVED",
        priority: "HIGH",
      };

      const res = await makeRequest(
        "PATCH",
        `/api/empanelment/admin/tickets/${targetTicket.id}`,
        replyBody,
        { admin_session: VALID_ADMIN_SESSION_ID }
      );

      assert.strictEqual(res.status, 200, "Test 8 failed: Expected HTTP 200");
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.ticket.status, "RESOLVED");
      assert.strictEqual(res.body.ticket.adminReply, replyBody.adminReply);
      console.log("PASS - Test 8: Admin ticket reply updates status to RESOLVED");
    }

    console.log("==================================================================");
    console.log("ALL 8 EMPANELMENT TICKETS TESTS PASSED SUCCESSFULLY");
    console.log("==================================================================");
  } finally {
    // Restore Prisma mocks
    (prisma.vendorApplication as any).findUnique = originalVendorFindUnique;
    (prisma.empanelmentTicket as any).create = originalTicketCreate;
    (prisma.empanelmentTicket as any).findMany = originalTicketFindMany;
    (prisma.empanelmentTicket as any).update = originalTicketUpdate;
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
