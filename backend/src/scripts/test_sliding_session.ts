/**
 * Comprehensive Automated Test Suite: Master Admin Sliding Session Renewal
 *
 * Covers:
 * 1. Active session renewal (sliding window extension)
 * 2. Renewal throttling (prevents high-frequency DB writes & race conditions)
 * 3. Expired session rejection (never revives expired sessions)
 * 4. Absolute maximum lifetime rejection (enforces 30-day hard ceiling)
 * 5. Absolute maximum lifetime capping (caps sliding extension at 30-day boundary)
 * 6. Concurrent requests handling (parallel thread safety)
 * 7. Invalid or missing session handling
 * 8. Logout invalidation and cookie clearing
 * 9. Admin and Subadmin role/permission preservation
 * 10. Cookie security attributes (HttpOnly, SameSite, Secure, Path)
 * 11. SEC-01: Non-CUID, UUID-like, and malformed ID fail-closed rejection
 * 12. SEC-02: Atomic conditional Prisma updateMany optimistic concurrency & zero-row safety
 */

import { Request, Response } from "express";
import { prisma } from "../lib/db";
import {
  createSession,
  getSessionUser,
  logout,
  getSessionCreatedAt,
  SLIDING_SESSION_TTL_MS,
  ABSOLUTE_MAX_SESSION_TTL_MS,
  RENEWAL_THRESHOLD_MS,
} from "../lib/auth";
import { authGuard, adminGuard } from "../middleware/authGuard";

let cuidCounter = 0;
function generateCuidWithTimestamp(timestampMs: number): string {
  cuidCounter++;
  const counterStr = cuidCounter.toString(36).padStart(4, "0");
  const base36Time = timestampMs.toString(36).padStart(8, "0");
  return `c${base36Time}${counterStr}slp6testcuid1`;
}

// In-memory mock database
interface MockSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string | null;
}

const mockSessions = new Map<string, MockSession>();
const mockUsers = new Map<string, MockUser>();

let updateCallCount = 0;
let updateManyCallCount = 0;
let updateManySuccessCount = 0;
let deleteCallCount = 0;
let findSessionCallCount = 0;

// Intercept Prisma calls
const originalFindSession = prisma.adminSession.findUnique;
const originalCreateSession = prisma.adminSession.create;
const originalUpdateSession = prisma.adminSession.update;
const originalUpdateManySession = prisma.adminSession.updateMany;
const originalDeleteManySession = prisma.adminSession.deleteMany;
const originalFindUser = prisma.adminUser.findUnique;

(prisma.adminSession as any).findUnique = async ({ where }: any) => {
  findSessionCallCount++;
  const session = mockSessions.get(where.id);
  if (!session) return null;
  // Return a cloned object so mutations in tests don't leak unexpectedly
  return { ...session, expiresAt: new Date(session.expiresAt) };
};

(prisma.adminSession as any).create = async ({ data }: any) => {
  const id = data.id || generateCuidWithTimestamp(Date.now());
  const session: MockSession = {
    id,
    userId: data.userId,
    expiresAt: new Date(data.expiresAt),
  };
  mockSessions.set(id, session);
  return { ...session };
};

(prisma.adminSession as any).update = async ({ where, data }: any) => {
  updateCallCount++;
  const session = mockSessions.get(where.id);
  if (!session) throw new Error("Session not found");
  if (data.expiresAt) {
    session.expiresAt = new Date(data.expiresAt);
  }
  return { ...session };
};

(prisma.adminSession as any).updateMany = async ({ where, data }: any) => {
  updateManyCallCount++;
  const session = mockSessions.get(where.id);
  if (!session) return { count: 0 };

  // SEC-02: Atomic conditional check matching both ID and exact expiresAt
  if (where.expiresAt) {
    const expectedTime = new Date(where.expiresAt).getTime();
    if (session.expiresAt.getTime() !== expectedTime) {
      // Concurrency conflict: another thread already updated this session
      return { count: 0 };
    }
  }

  if (data.expiresAt) {
    session.expiresAt = new Date(data.expiresAt);
  }
  updateManySuccessCount++;
  return { count: 1 };
};

(prisma.adminSession as any).deleteMany = async ({ where }: any) => {
  deleteCallCount++;
  if (where?.id) {
    mockSessions.delete(where.id);
  }
  return { count: 1 };
};

(prisma.adminUser as any).findUnique = async ({ where }: any) => {
  const user = mockUsers.get(where.id);
  if (!user) return null;
  return { ...user };
};

// Mock Response Factory
function createMockResponse(): {
  res: Response;
  cookiesSet: Array<{ name: string; val: any; options: any }>;
  cookiesCleared: Array<{ name: string; options?: any }>;
  statusCode: number;
  jsonData: any;
} {
  const cookiesSet: Array<{ name: string; val: any; options: any }> = [];
  const cookiesCleared: Array<{ name: string; options?: any }> = [];
  let statusCode = 200;
  let jsonData: any = null;

  const res: any = {
    headersSent: false,
    cookie: (name: string, val: any, options: any) => {
      cookiesSet.push({ name, val, options });
    },
    clearCookie: (name: string, options?: any) => {
      cookiesCleared.push({ name, options });
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      jsonData = data;
      return res;
    },
  };

  return { res, cookiesSet, cookiesCleared, get statusCode() { return statusCode; }, get jsonData() { return jsonData; } };
}

// Test Runner
async function runSlidingSessionTests() {
  console.log("==================================================================");
  console.log("    MASTER ADMIN SLIDING SESSION RENEWAL TEST SUITE               ");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  // Populate mock users
  const adminUser: MockUser = {
    id: "usr_admin_01",
    email: "admin@hindustanprojects.in",
    name: "Master Admin",
    role: "admin",
    permissions: "[\"*\"]",
  };
  const subadminUser: MockUser = {
    id: "usr_subadmin_02",
    email: "subadmin@hindustanprojects.in",
    name: "Site Supervisor",
    role: "employee",
    permissions: "[\"leads:read\",\"projects:read\"]",
  };
  mockUsers.set(adminUser.id, adminUser);
  mockUsers.set(subadminUser.id, subadminUser);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: CUID Timestamp Extraction & SEC-01 Non-CUID Rejection
    // -------------------------------------------------------------------------
    console.log("--- 1. Session Creation Timestamp Derivation ---");
    const testTime = Date.now() - 3600000; // 1 hour ago
    const testCuid = generateCuidWithTimestamp(testTime);
    const derivedDate = getSessionCreatedAt({ id: testCuid, expiresAt: new Date() });
    assert(
      derivedDate !== null && Math.abs(derivedDate.getTime() - testTime) < 5,
      "getSessionCreatedAt parses exact CUID v1 timestamp",
      `Expected ${testTime}, got ${derivedDate?.getTime()}`
    );

    const nonCuidFallback = getSessionCreatedAt({
      id: "plain-uuid-1234",
      expiresAt: new Date(1000000000000),
    });
    assert(
      nonCuidFallback === null,
      "getSessionCreatedAt returns null for non-CUID IDs (SEC-01: eliminates unsafe fallback)"
    );

    // -------------------------------------------------------------------------
    // TEST 2: Active Session Renewal
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Active Session Renewal & Sliding Window ---");
    const session1Time = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago
    const session1Id = generateCuidWithTimestamp(session1Time);
    // 5 days remaining (< 6 days remaining threshold) => eligible for sliding renewal
    mockSessions.set(session1Id, {
      id: session1Id,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    const mockRes1 = createMockResponse();
    const req1: any = { cookies: { admin_session: session1Id } };

    updateManyCallCount = 0;
    const user1 = await getSessionUser(req1, mockRes1.res);

    assert(user1?.id === adminUser.id, "getSessionUser returns authentic user data");
    assert(updateManyCallCount === 1, "Eligible active session triggers conditional updateMany for expiresAt");

    const updatedSession1 = mockSessions.get(session1Id)!;
    const expectedExpiryMin = Date.now() + SLIDING_SESSION_TTL_MS - 2000;
    const expectedExpiryMax = Date.now() + SLIDING_SESSION_TTL_MS + 2000;
    assert(
      updatedSession1.expiresAt.getTime() >= expectedExpiryMin &&
      updatedSession1.expiresAt.getTime() <= expectedExpiryMax,
      "Session expiresAt slid forward by exactly 7 days from now"
    );

    assert(mockRes1.cookiesSet.length === 1, "res.cookie was called with refreshed expiration");
    const cookie1 = mockRes1.cookiesSet[0];
    assert(cookie1.name === "admin_session", "Cookie name is admin_session");
    assert(cookie1.options.httpOnly === true, "Cookie has httpOnly: true");
    assert(cookie1.options.sameSite === "lax", "Cookie has sameSite: lax");
    assert(cookie1.options.path === "/", "Cookie has path: /");

    // -------------------------------------------------------------------------
    // TEST 3: Renewal Throttling (Prevents DB Spikes & Concurrent Race Conditions)
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Renewal Throttling & Concurrent Load Protection ---");
    // Session expires in 6.9 days (more than 6 days remaining) => not yet eligible
    const session2Time = Date.now() - 10 * 60 * 1000; // 10 minutes ago
    const session2Id = generateCuidWithTimestamp(session2Time);
    mockSessions.set(session2Id, {
      id: session2Id,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 6.9 * 24 * 60 * 60 * 1000),
    });

    const mockRes2 = createMockResponse();
    const req2: any = { cookies: { admin_session: session2Id } };

    updateManyCallCount = 0;
    const user2 = await getSessionUser(req2, mockRes2.res);

    assert(user2?.id === adminUser.id, "Session resolves user when within throttle window");
    assert(updateManyCallCount === 0, "No database update performed when within throttle window (> 6 days left)");
    assert(mockRes2.cookiesSet.length === 0, "No redundant Set-Cookie emitted when within throttle window");

    // -------------------------------------------------------------------------
    // TEST 4: Expired Session Rejection
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Expired Session Rejection (Fail-Closed) ---");
    const session3Time = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const session3Id = generateCuidWithTimestamp(session3Time);
    // Expired 1 hour ago
    mockSessions.set(session3Id, {
      id: session3Id,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() - 3600000),
    });

    const mockRes3 = createMockResponse();
    const req3: any = { cookies: { admin_session: session3Id } };

    const user3 = await getSessionUser(req3, mockRes3.res);
    assert(user3 === null, "Expired session returns null (fail-closed)");
    assert(!mockSessions.has(session3Id), "Expired session is deleted from database");
    assert(
      mockRes3.cookiesCleared.some((c) => c.name === "admin_session"),
      "clearCookie('admin_session') called for expired session"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Absolute Maximum Lifetime Rejection (30-Day Hard Limit)
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Absolute Maximum Lifetime Rejection (30-Day Hard Limit) ---");
    // Session was created 31 days ago, but has a future expiresAt (e.g. from continuous sliding)
    const session4Time = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const session4Id = generateCuidWithTimestamp(session4Time);
    mockSessions.set(session4Id, {
      id: session4Id,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // future expiresAt
    });

    const mockRes4 = createMockResponse();
    const req4: any = { cookies: { admin_session: session4Id } };

    const user4 = await getSessionUser(req4, mockRes4.res);
    assert(user4 === null, "Session older than 30 days is rejected even if expiresAt is in future");
    assert(!mockSessions.has(session4Id), "Session exceeding absolute maximum lifetime is deleted from DB");
    assert(
      mockRes4.cookiesCleared.some((c) => c.name === "admin_session"),
      "clearCookie('admin_session') called when absolute limit reached"
    );

    // -------------------------------------------------------------------------
    // TEST 6: Absolute Maximum Lifetime Capping
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Absolute Maximum Lifetime Capping ---");
    // Session created 28 days ago (has 2 days remaining until the 30-day absolute ceiling)
    const session5Time = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const session5Id = generateCuidWithTimestamp(session5Time);
    mockSessions.set(session5Id, {
      id: session5Id,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day remaining
    });

    const mockRes5 = createMockResponse();
    const req5: any = { cookies: { admin_session: session5Id } };

    updateManyCallCount = 0;
    const user5 = await getSessionUser(req5, mockRes5.res);
    assert(user5?.id === adminUser.id, "Session resolves user successfully near 30-day boundary");
    assert(updateManyCallCount === 1, "Session updates expiresAt to ceiling");

    const updatedSession5 = mockSessions.get(session5Id)!;
    const absoluteMaxExpected = session5Time + ABSOLUTE_MAX_SESSION_TTL_MS;
    assert(
      Math.abs(updatedSession5.expiresAt.getTime() - absoluteMaxExpected) < 10,
      "expiresAt is capped at exactly the 30-day absolute ceiling (NOT slid 7 full days beyond)"
    );

    // -------------------------------------------------------------------------
    // TEST 7: Concurrent Requests Safety
    // -------------------------------------------------------------------------
    console.log("\n--- 7. Concurrent Requests Race Condition Safety ---");
    const session6Time = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const session6Id = generateCuidWithTimestamp(session6Time);
    mockSessions.set(session6Id, {
      id: session6Id,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    });

    const concurrentRequests = Array.from({ length: 10 }, () => {
      const mockRes = createMockResponse();
      const req: any = { cookies: { admin_session: session6Id } };
      return getSessionUser(req, mockRes.res);
    });

    const concurrentResults = await Promise.all(concurrentRequests);
    const allResolved = concurrentResults.every((u) => u?.id === adminUser.id);
    assert(allResolved, "All 10 concurrent parallel requests resolve user successfully without error");

    // -------------------------------------------------------------------------
    // TEST 8: Invalid & Missing Sessions
    // -------------------------------------------------------------------------
    console.log("\n--- 8. Invalid & Missing Session Handling ---");
    const reqEmpty: any = { cookies: {} };
    findSessionCallCount = 0;
    const userEmpty = await getSessionUser(reqEmpty);
    assert(userEmpty === null, "Missing cookie returns null immediately without DB lookup");
    assert(findSessionCallCount === 0, "No Prisma lookup executed when cookie is missing");

    const reqNonexistent: any = { cookies: { admin_session: "c_non_existent_id_12345" } };
    const userNonexistent = await getSessionUser(reqNonexistent);
    assert(userNonexistent === null, "Non-existent session ID returns null safely");

    // -------------------------------------------------------------------------
    // TEST 9: Logout Invalidation
    // -------------------------------------------------------------------------
    console.log("\n--- 9. Logout Invalidation & Cleanup ---");
    const session7Id = generateCuidWithTimestamp(Date.now());
    mockSessions.set(session7Id, {
      id: session7Id,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const mockResLogout = createMockResponse();
    const reqLogout: any = { cookies: { admin_session: session7Id } };

    await logout(reqLogout, mockResLogout.res);
    assert(!mockSessions.has(session7Id), "logout deletes session from database");
    assert(
      mockResLogout.cookiesCleared.some((c) => c.name === "admin_session"),
      "logout calls clearCookie('admin_session')"
    );

    const postLogoutCheck = await getSessionUser(reqLogout);
    assert(postLogoutCheck === null, "Post-logout getSessionUser returns null");

    // -------------------------------------------------------------------------
    // TEST 10: Admin & Subadmin Role & Guard Compatibility
    // -------------------------------------------------------------------------
    console.log("\n--- 10. Role & Guard Compatibility (Admin vs Subadmin) ---");
    const sessionAdminId = generateCuidWithTimestamp(Date.now());
    mockSessions.set(sessionAdminId, {
      id: sessionAdminId,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const sessionSubadminId = generateCuidWithTimestamp(Date.now());
    mockSessions.set(sessionSubadminId, {
      id: sessionSubadminId,
      userId: subadminUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // authGuard with admin user
    let adminGuardPassed = false;
    const reqAdmin: any = { cookies: { admin_session: sessionAdminId } };
    const resAdmin = createMockResponse();
    await authGuard(reqAdmin, resAdmin.res, () => {
      adminGuardPassed = true;
    });
    assert(adminGuardPassed, "authGuard permits authenticated admin user");
    assert(reqAdmin.user.role === "admin", "authGuard attaches correct user object with role 'admin'");

    // authGuard with subadmin user
    let subadminAuthGuardPassed = false;
    const reqSubadmin: any = { cookies: { admin_session: sessionSubadminId } };
    const resSubadmin = createMockResponse();
    await authGuard(reqSubadmin, resSubadmin.res, () => {
      subadminAuthGuardPassed = true;
    });
    assert(subadminAuthGuardPassed, "authGuard permits authenticated subadmin (employee) user");
    assert(reqSubadmin.user.role === "employee", "authGuard attaches user with role 'employee'");
    assert(
      reqSubadmin.user.permissions === "[\"leads:read\",\"projects:read\"]",
      "authGuard preserves subadmin permissions JSON"
    );

    // adminGuard checks
    let adminGuardExecution = false;
    await new Promise<void>((resolve) => {
      adminGuard(reqAdmin, resAdmin.res, () => {
        adminGuardExecution = true;
        resolve();
      });
    });
    assert(adminGuardExecution, "adminGuard allows user with role 'admin'");

    const resSubadminForbidden = createMockResponse();
    await new Promise<void>((resolve) => {
      adminGuard(reqSubadmin, resSubadminForbidden.res, () => {
        throw new Error("Should not reach next() for non-admin");
      });
      setTimeout(resolve, 50);
    });
    assert(
      resSubadminForbidden.statusCode === 403,
      "adminGuard returns HTTP 403 Forbidden for subadmin (employee) user"
    );

    // -------------------------------------------------------------------------
    // TEST 11: SEC-01 — Non-CUID & Malformed Session Fail-Closed Rejection
    // -------------------------------------------------------------------------
    console.log("\n--- 11. SEC-01: Non-CUID & Malformed ID Fail-Closed Rejection ---");

    // Case 1: UUID-like session ID
    const uuidSessionId = "550e8400-e29b-41d4-a716-446655440000";
    mockSessions.set(uuidSessionId, {
      id: uuidSessionId,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });
    const resUuid = createMockResponse();
    const reqUuid: any = { cookies: { admin_session: uuidSessionId } };
    const userUuid = await getSessionUser(reqUuid, resUuid.res);
    assert(userUuid === null, "UUID-like session ID fails closed (returns null)");
    assert(!mockSessions.has(uuidSessionId), "UUID session is deleted from database");
    assert(resUuid.cookiesCleared.some((c) => c.name === "admin_session"), "clearCookie called for UUID session");

    // Case 2: Malformed non-base36 / short CUID ID
    const malformedId = "c_invalid!@#$";
    mockSessions.set(malformedId, {
      id: malformedId,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });
    const resMalformed = createMockResponse();
    const reqMalformed: any = { cookies: { admin_session: malformedId } };
    const userMalformed = await getSessionUser(reqMalformed, resMalformed.res);
    assert(userMalformed === null, "Malformed session ID fails closed (returns null)");
    assert(!mockSessions.has(malformedId), "Malformed session is deleted from database");

    // Case 3: Out-of-bounds future crafted timestamp (e.g. year 2099)
    const futureTime = new Date("2099-01-01").getTime();
    const futureCraftedId = `c${futureTime.toString(36)}0001slp6testcuid1`;
    mockSessions.set(futureCraftedId, {
      id: futureCraftedId,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });
    const resFuture = createMockResponse();
    const reqFuture: any = { cookies: { admin_session: futureCraftedId } };
    const userFuture = await getSessionUser(reqFuture, resFuture.res);
    assert(userFuture === null, "Crafted out-of-bounds future timestamp fails closed");
    assert(!mockSessions.has(futureCraftedId), "Out-of-bounds session is deleted from DB");

    // Case 4: Repeated renewal attempt cannot bypass ceiling on non-CUID
    const nonCuidRepeatId = "manual_session_token_xyz";
    mockSessions.set(nonCuidRepeatId, {
      id: nonCuidRepeatId,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });
    const resRepeat = createMockResponse();
    const reqRepeat: any = { cookies: { admin_session: nonCuidRepeatId } };
    const userRepeat = await getSessionUser(reqRepeat, resRepeat.res);
    assert(userRepeat === null, "Repeated renewal on non-CUID cannot slide or bypass ceiling");

    // -------------------------------------------------------------------------
    // TEST 12: SEC-02 — Atomic Conditional updateMany Optimistic Concurrency
    // -------------------------------------------------------------------------
    console.log("\n--- 12. SEC-02: Atomic Conditional updateMany Optimistic Concurrency ---");
    const sessionOccTime = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const sessionOccId = generateCuidWithTimestamp(sessionOccTime);
    const initialExpiresAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // 4 days remaining (< 6 threshold)

    mockSessions.set(sessionOccId, {
      id: sessionOccId,
      userId: adminUser.id,
      expiresAt: initialExpiresAt,
    });

    updateManyCallCount = 0;
    updateManySuccessCount = 0;

    // Simulate 5 simultaneous requests arriving at the identical old session state
    const occResponses = Array.from({ length: 5 }, () => createMockResponse());
    const occRequests = occResponses.map((resWrap) => {
      const req: any = { cookies: { admin_session: sessionOccId } };
      return getSessionUser(req, resWrap.res);
    });

    const occUsers = await Promise.all(occRequests);

    // All requests must successfully resolve the authenticated user
    const allUsersValid = occUsers.every((u) => u?.id === adminUser.id);
    assert(allUsersValid, "All concurrent requests resolve user successfully during OCC race");

    // Exactly 1 request successfully updated the row (count === 1)
    assert(
      updateManySuccessCount === 1,
      `Exactly 1 concurrent request won the atomic update race (success count: ${updateManySuccessCount})`
    );

    // Exactly 1 response set the refreshed cookie; the 4 losing requests did not emit redundant Set-Cookie
    const responsesWithCookie = occResponses.filter((r) => r.cookiesSet.length > 0);
    assert(
      responsesWithCookie.length === 1,
      `Only the winning request set the refreshed cookie (winner count: ${responsesWithCookie.length})`
    );

    // Zero-row update safety test: verify when count === 0, session does not revive or throw
    const sessionZeroId = generateCuidWithTimestamp(Date.now() - 2 * 24 * 60 * 60 * 1000);
    mockSessions.set(sessionZeroId, {
      id: sessionZeroId,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    });

    // Artificially simulate updateMany returning count: 0 (concurrency collision)
    const originalUpdateMany = (prisma.adminSession as any).updateMany;
    (prisma.adminSession as any).updateMany = async () => ({ count: 0 });

    const resZero = createMockResponse();
    const reqZero: any = { cookies: { admin_session: sessionZeroId } };
    const userZero = await getSessionUser(reqZero, resZero.res);

    assert(userZero?.id === adminUser.id, "Zero-row update safely resolves user without error");
    assert(resZero.cookiesSet.length === 0, "Zero-row update does not emit redundant Set-Cookie");

    // Restore updateMany mock
    (prisma.adminSession as any).updateMany = originalUpdateMany;

    // -------------------------------------------------------------------------
    // TEST 13: SEC-02 — Deep Zero-Row Update Concurrency Scenarios
    // -------------------------------------------------------------------------
    console.log("\n--- 13. SEC-02: Deep Zero-Row Update Concurrency Scenarios ---");

    const baseUpdateMany = (prisma.adminSession as any).updateMany;
    const baseFindUnique = (prisma.adminSession as any).findUnique;

    // Scenario A: Concurrent renewal winner: losing request re-reads renewed session and remains authenticated
    const sessionWinId = generateCuidWithTimestamp(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const oldWinExpiresAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // 4 days remaining (< 6 threshold)
    const renewedWinExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // renewed by winning request

    mockSessions.set(sessionWinId, {
      id: sessionWinId,
      userId: adminUser.id,
      expiresAt: oldWinExpiresAt,
    });

    (prisma.adminSession as any).updateMany = async (args: any) => {
      if (args.where?.id === sessionWinId) {
        // Winning request updated session in DB right before losing request's updateMany executed
        const current = mockSessions.get(sessionWinId);
        if (current) {
          current.expiresAt = renewedWinExpiresAt;
        }
        // Conditional update matching old expiresAt fails (0 rows updated)
        return { count: 0 };
      }
      return baseUpdateMany(args);
    };

    const resWin = createMockResponse();
    const reqWin: any = { cookies: { admin_session: sessionWinId } };
    const userWin = await getSessionUser(reqWin, resWin.res);

    assert(userWin?.id === adminUser.id, "Concurrent renewal winner: losing request re-reads renewed session and remains authenticated");
    assert(resWin.cookiesSet.length === 0, "Concurrent renewal winner: losing request does NOT issue duplicate Set-Cookie");
    assert(resWin.cookiesCleared.length === 0, "Concurrent renewal winner: cookie is NOT cleared on valid session");

    // Scenario B: Concurrent logout: losing request finds session deleted and returns null
    const sessionLogoutId = generateCuidWithTimestamp(Date.now() - 2 * 24 * 60 * 60 * 1000);
    mockSessions.set(sessionLogoutId, {
      id: sessionLogoutId,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    });

    (prisma.adminSession as any).updateMany = async (args: any) => {
      if (args.where?.id === sessionLogoutId) {
        // Concurrent logout deleted session from DB while losing request was processing
        mockSessions.delete(sessionLogoutId);
        return { count: 0 };
      }
      return baseUpdateMany(args);
    };

    const resConcLogout = createMockResponse();
    const reqConcLogout: any = { cookies: { admin_session: sessionLogoutId } };
    const userConcLogout = await getSessionUser(reqConcLogout, resConcLogout.res);

    assert(userConcLogout === null, "Concurrent logout: losing request finds session deleted and returns null");
    assert(resConcLogout.cookiesCleared.some((c) => c.name === "admin_session"), "Concurrent logout: cookie is cleared on losing request");
    assert(resConcLogout.cookiesSet.length === 0, "Concurrent logout: no Set-Cookie issued");

    // Scenario C: Expired session after zero-row update: returns null and cleans up DB & cookie
    const sessionExpiredZeroId = generateCuidWithTimestamp(Date.now() - 5 * 24 * 60 * 60 * 1000);
    mockSessions.set(sessionExpiredZeroId, {
      id: sessionExpiredZeroId,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    });

    (prisma.adminSession as any).updateMany = async (args: any) => {
      if (args.where?.id === sessionExpiredZeroId) {
        // Session expired concurrently
        const current = mockSessions.get(sessionExpiredZeroId);
        if (current) {
          current.expiresAt = new Date(Date.now() - 1000); // expired
        }
        return { count: 0 };
      }
      return baseUpdateMany(args);
    };

    const resExpiredZero = createMockResponse();
    const reqExpiredZero: any = { cookies: { admin_session: sessionExpiredZeroId } };
    const userExpiredZero = await getSessionUser(reqExpiredZero, resExpiredZero.res);

    assert(userExpiredZero === null, "Expired session after zero-row update returns null");
    assert(!mockSessions.has(sessionExpiredZeroId), "Expired session after zero-row update is deleted from DB");
    assert(resExpiredZero.cookiesCleared.some((c) => c.name === "admin_session"), "Expired session after zero-row update clears cookie");
    assert(resExpiredZero.cookiesSet.length === 0, "Expired session after zero-row update does NOT emit Set-Cookie");

    // Scenario D: Absolute ceiling exceeded after zero-row update: returns null and cleans up DB & cookie
    const sessionCeilingZeroId = generateCuidWithTimestamp(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const expired31DaysCuid = generateCuidWithTimestamp(Date.now() - (ABSOLUTE_MAX_SESSION_TTL_MS + 60000));
    mockSessions.set(sessionCeilingZeroId, {
      id: sessionCeilingZeroId,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    });

    let ceilingZeroFindCalls = 0;
    (prisma.adminSession as any).findUnique = async (args: any) => {
      if (args.where?.id === sessionCeilingZeroId) {
        ceilingZeroFindCalls++;
        if (ceilingZeroFindCalls > 1) {
          // On second call (re-read in zero-row branch), simulate absolute ceiling exceeded
          return {
            id: expired31DaysCuid,
            userId: adminUser.id,
            expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          };
        }
      }
      return baseFindUnique(args);
    };

    (prisma.adminSession as any).updateMany = async (args: any) => {
      if (args.where?.id === sessionCeilingZeroId) {
        return { count: 0 };
      }
      return baseUpdateMany(args);
    };

    const resCeilingZero = createMockResponse();
    const reqCeilingZero: any = { cookies: { admin_session: sessionCeilingZeroId } };
    const userCeilingZero = await getSessionUser(reqCeilingZero, resCeilingZero.res);

    assert(userCeilingZero === null, "Absolute ceiling exceeded after zero-row update returns null");
    assert(resCeilingZero.cookiesCleared.some((c) => c.name === "admin_session"), "Absolute ceiling exceeded clears cookie");
    assert(resCeilingZero.cookiesSet.length === 0, "Absolute ceiling exceeded does NOT emit Set-Cookie");

    // Scenario E: Redundant writes verification
    assert(updateCallCount === 0, "No legacy update() calls made across concurrency tests (all use atomic updateMany)");

    // Restore mocks
    (prisma.adminSession as any).updateMany = baseUpdateMany;
    (prisma.adminSession as any).findUnique = baseFindUnique;

  } finally {
    // Restore original Prisma methods
    (prisma.adminSession as any).findUnique = originalFindSession;
    (prisma.adminSession as any).create = originalCreateSession;
    (prisma.adminSession as any).update = originalUpdateSession;
    (prisma.adminSession as any).updateMany = originalUpdateManySession;
    (prisma.adminSession as any).deleteMany = originalDeleteManySession;
    (prisma.adminUser as any).findUnique = originalFindUser;
  }

  console.log("\n==================================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSlidingSessionTests().catch((err) => {
  console.error("Test execution threw error:", err);
  process.exit(1);
});

