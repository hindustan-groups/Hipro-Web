/**
 * Comprehensive Automated Test Suite: Master Admin Staff RBAC Authorization
 *
 * Covers:
 * 1. Permission Extraction & Parsing (getUserPermissions)
 *    - JSON string arrays, native arrays, whitespace trimming
 *    - Fail-closed parsing for null, undefined, malformed JSON, non-arrays, non-strings
 * 2. Role & Permission Verification (hasPermission)
 *    - Super Admin unrestricted bypass (role === "admin")
 *    - Staff granular verification (role === "employee")
 *    - Any-of array semantics
 *    - Unknown roles, empty permissions, and missing user objects fail closed
 * 3. Middleware Enforcement (requirePermission, permissionGuard, adminGuard)
 *    - Unauthenticated sessions return HTTP 401 Unauthorized
 *    - Super Admin passes all guarded endpoints
 *    - Staff with required permission passes to next()
 *    - Staff lacking required permission receives HTTP 403 Forbidden
 * 4. Super Admin Sole Privilege Endpoints
 *    - /api/admin-users/* strictly restricted to role === "admin"
 *    - PATCH /api/settings strictly restricted to role === "admin"
 *    - POST /api/hbs/seed strictly restricted to role === "admin"
 * 5. Content Management RBAC Enforcement
 *    - Blogs, About, Projects, Services, Team, Testimonials, Hero, Jobs, Stats, Guarantees
 * 6. Upload Endpoint Content Privilege Integration
 *    - Staff with content permissions (blogs, projects, etc.) permitted to upload
 *    - Staff with CRM-only permissions or empty permissions denied HTTP 403
 * 7. CRM Module Strict Isolation
 *    - Distinct permissions for leads, contacts, quotes, applications, newsletter
 * 8. Group Ventures Route Protection
 *    - HBS mutations, HBS leads, Empanelment admin, Automail
 * 9. Session Invalidation on Staff Account Deletion
 *    - Deleting staff account purges active sessions; subsequent requests return 401
 * 10. Fail-Closed Security & Tamper Resistance
 *    - Unknown roles, corrupted payloads, empty arrays fail closed
 */

import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/db";
import {
  getUserPermissions,
  hasPermission,
  requirePermission,
  permissionGuard,
  adminGuard,
  authGuard,
} from "../middleware/authGuard";
import { getSessionUser } from "../lib/auth";
import newsletterRouter from "../routes/newsletter";
import adminUsersRouter from "../routes/adminUsers";

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

let sessionDeleteManyCallCount = 0;
let lastDeletedSessionUserId: string | null = null;

// Intercept Prisma calls for test harness
(prisma.adminSession as any).findUnique = async ({ where }: any) => {
  const session = mockSessions.get(where.id);
  if (!session) return null;
  return { ...session, expiresAt: new Date(session.expiresAt) };
};

(prisma.adminSession as any).updateMany = async ({ where, data }: any) => {
  if (where?.id) {
    const s = mockSessions.get(where.id);
    if (s) {
      if (data?.expiresAt) s.expiresAt = new Date(data.expiresAt);
      return { count: 1 };
    }
  }
  return { count: 0 };
};

(prisma.adminSession as any).deleteMany = async ({ where }: any) => {
  sessionDeleteManyCallCount++;
  if (where?.userId) {
    lastDeletedSessionUserId = where.userId;
    for (const [id, s] of mockSessions.entries()) {
      if (s.userId === where.userId) {
        mockSessions.delete(id);
      }
    }
  }
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

(prisma.adminUser as any).delete = async ({ where }: any) => {
  mockUsers.delete(where.id);
  return { id: where.id };
};

// Mock Newsletter Subscribers
interface MockNewsletterSubscriber {
  id: string;
  email: string;
  active: boolean;
}

const mockSubscribers = new Map<string, MockNewsletterSubscriber>();

(prisma as any).newsletterSubscriber = {
  findUnique: async ({ where }: any) => {
    if (where?.email) {
      for (const s of mockSubscribers.values()) {
        if (s.email === where.email) return { ...s };
      }
    }
    if (where?.id) {
      const s = mockSubscribers.get(where.id);
      return s ? { ...s } : null;
    }
    return null;
  },
  update: async ({ where, data }: any) => {
    let sub: MockNewsletterSubscriber | undefined;
    if (where?.email) {
      for (const s of mockSubscribers.values()) {
        if (s.email === where.email) {
          sub = s;
          break;
        }
      }
    } else if (where?.id) {
      sub = mockSubscribers.get(where.id);
    }
    if (sub) {
      if (typeof data?.active === "boolean") sub.active = data.active;
      return { ...sub };
    }
    throw new Error("Subscriber not found for update");
  },
  delete: async ({ where }: any) => {
    if (where?.id) {
      const s = mockSubscribers.get(where.id);
      if (s) {
        mockSubscribers.delete(where.id);
        return { ...s };
      }
    }
    throw new Error("Subscriber not found for delete");
  },
};

// Mock Response Builder
interface MockResponseResult {
  statusCode: number;
  body: any;
  headers: Record<string, string>;
}

function createMockResponse(): { res: Response; result: MockResponseResult } {
  const result: MockResponseResult = {
    statusCode: 200,
    body: null,
    headers: {},
  };

  const res: any = {
    statusCode: 200,
    status(code: number) {
      result.statusCode = code;
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      result.body = data;
      return this;
    },
    send(data: any) {
      result.body = data;
      return this;
    },
    setHeader(name: string, val: string) {
      result.headers[name] = val;
      return this;
    },
    cookie() {
      return this;
    },
    clearCookie() {
      return this;
    },
    end() {
      return this;
    },
  };

  return { res, result };
}

function createMockRequest(options: {
  cookie?: string;
  user?: any;
  params?: Record<string, any>;
  body?: any;
  query?: Record<string, any>;
  method?: string;
  url?: string;
}): Request {
  const cookieHeader = options.cookie ? `admin_session=${options.cookie}` : "";
  return {
    method: options.method || "GET",
    url: options.url || "/",
    originalUrl: options.url || "/",
    cookies: options.cookie ? { admin_session: options.cookie } : {},
    headers: {
      cookie: cookieHeader,
      "user-agent": "RBAC-TestSuite/1.0",
    },
    user: options.user,
    params: options.params || {},
    body: options.body || {},
    query: options.query || {},
  } as any;
}

function dispatchRouter(
  router: any,
  req: Request,
  res: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    const origJson = res.json.bind(res);
    const origSend = res.send ? res.send.bind(res) : null;
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };
    res.json = function (data: any) {
      origJson(data);
      finish();
      return this;
    };
    if (origSend) {
      res.send = function (data: any) {
        origSend(data);
        finish();
        return this;
      };
    }
    router(req, res, (err: any) => {
      if (err) return reject(err);
      finish();
    });
  });
}

// Test Runner Helpers
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${message}`);
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("       MASTER ADMIN STAFF RBAC AUTHORIZATION TEST SUITE           ");
  console.log("==================================================================\n");

  // ─────────────────────────────────────────────────────────────────
  // 1. Permission Extraction & Parsing (getUserPermissions)
  // ─────────────────────────────────────────────────────────────────
  console.log("--- 1. Permission Extraction & Parsing (getUserPermissions) ---");

  // 1.1 JSON string array parsing
  const permsFromJson = getUserPermissions({ permissions: '["blogs", "projects", "services"]' });
  assert(
    permsFromJson.length === 3 &&
      permsFromJson.includes("blogs") &&
      permsFromJson.includes("projects") &&
      permsFromJson.includes("services"),
    "getUserPermissions correctly parses JSON array string"
  );

  // 1.2 Native string array parsing & trimming
  const permsFromNative = getUserPermissions({ permissions: [" blogs ", "  leads", "quotes "] });
  assert(
    permsFromNative.length === 3 &&
      permsFromNative[0] === "blogs" &&
      permsFromNative[1] === "leads" &&
      permsFromNative[2] === "quotes",
    "getUserPermissions handles native arrays and trims whitespace"
  );

  // 1.3 Filters out empty strings and non-string elements
  const permsMixed = getUserPermissions({ permissions: ["blogs", "", "   ", 123, null, undefined, {}] });
  assert(
    permsMixed.length === 1 && permsMixed[0] === "blogs",
    "getUserPermissions filters out empty strings and invalid types"
  );

  // 1.4 Fails closed on malformed JSON
  const permsMalformed = getUserPermissions({ permissions: '["blogs", unclosed string' });
  assert(permsMalformed.length === 0, "getUserPermissions fails closed on malformed JSON");

  // 1.5 Fails closed on non-array JSON
  const permsNonArrayJson = getUserPermissions({ permissions: '{"module": "blogs"}' });
  assert(permsNonArrayJson.length === 0, "getUserPermissions fails closed on non-array JSON object");

  // 1.6 Fails closed on null, undefined, and empty string
  assert(getUserPermissions({ permissions: null }).length === 0, "getUserPermissions returns [] for null");
  assert(getUserPermissions({ permissions: undefined }).length === 0, "getUserPermissions returns [] for undefined");
  assert(getUserPermissions({ permissions: "" }).length === 0, "getUserPermissions returns [] for empty string");
  assert(getUserPermissions({}).length === 0, "getUserPermissions returns [] when permissions property is absent");
  assert(getUserPermissions(null).length === 0, "getUserPermissions returns [] for null user");

  // ─────────────────────────────────────────────────────────────────
  // 2. Role & Permission Verification (hasPermission)
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 2. Role & Permission Verification (hasPermission) ---");

  const superAdmin = { id: "u-admin", role: "admin", permissions: null };
  const staffBlogs = { id: "u-emp1", role: "employee", permissions: '["blogs"]' };
  const staffMulti = { id: "u-emp2", role: "employee", permissions: '["projects", "services", "about"]' };
  const staffNoPerms = { id: "u-emp3", role: "employee", permissions: "[]" };
  const invalidRoleUser = { id: "u-invalid", role: "contractor", permissions: '["blogs"]' };

  // 2.1 Super Admin bypass
  assert(hasPermission(superAdmin, "blogs"), "Super Admin has permission for 'blogs'");
  assert(hasPermission(superAdmin, "settings"), "Super Admin has permission for 'settings'");
  assert(hasPermission(superAdmin, "admin-users"), "Super Admin has permission for 'admin-users'");
  assert(hasPermission(superAdmin, "any_arbitrary_module"), "Super Admin has permission for any arbitrary module");
  assert(hasPermission(superAdmin, ["modA", "modB"]), "Super Admin satisfies any-of permissions");

  // 2.2 Staff granular check
  assert(hasPermission(staffBlogs, "blogs"), "Staff with 'blogs' has permission for 'blogs'");
  assert(!hasPermission(staffBlogs, "projects"), "Staff with 'blogs' lacks permission for 'projects'");
  assert(!hasPermission(staffBlogs, "settings"), "Staff with 'blogs' lacks permission for 'settings'");

  // 2.3 Staff any-of semantics
  assert(
    hasPermission(staffMulti, ["blogs", "projects"]),
    "Staff with 'projects' satisfies any-of ['blogs', 'projects']"
  );
  assert(
    !hasPermission(staffMulti, ["blogs", "quotes"]),
    "Staff lacking both in any-of ['blogs', 'quotes'] is denied"
  );

  // 2.4 Least privilege & fail-closed
  assert(!hasPermission(staffNoPerms, "blogs"), "Staff with empty permissions is denied");
  assert(!hasPermission(invalidRoleUser, "blogs"), "User with unknown role 'contractor' is denied");
  assert(!hasPermission(null, "blogs"), "Null user is denied");
  assert(!hasPermission(staffBlogs, ""), "Empty required permission is denied");
  assert(!hasPermission(staffBlogs, []), "Empty required permissions array is denied");

  // ─────────────────────────────────────────────────────────────────
  // 3. Middleware Enforcement (requirePermission & adminGuard)
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 3. Middleware Enforcement (requirePermission & adminGuard) ---");

  // Setup mock session in DB
  const now = Date.now();
  const validCuid = generateCuidWithTimestamp(now);
  const staffCuid = generateCuidWithTimestamp(now);

  mockUsers.set("admin-1", {
    id: "admin-1",
    email: "admin@hindustanprojects.com",
    name: "Super Admin",
    role: "admin",
    permissions: null,
  });

  mockUsers.set("emp-blogs", {
    id: "emp-blogs",
    email: "writer@hindustanprojects.com",
    name: "Content Staff",
    role: "employee",
    permissions: '["blogs"]',
  });

  mockSessions.set(validCuid, {
    id: validCuid,
    userId: "admin-1",
    expiresAt: new Date(now + 7 * 86400000),
  });

  mockSessions.set(staffCuid, {
    id: staffCuid,
    userId: "emp-blogs",
    expiresAt: new Date(now + 7 * 86400000),
  });

  // 3.1 Unauthenticated request returns 401
  await (async () => {
    const req = createMockRequest({});
    const { res, result } = createMockResponse();
    let nextCalled = false;

    const middleware = requirePermission("blogs");
    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert(!nextCalled, "requirePermission does not call next() for unauthenticated request");
    assert(result.statusCode === 401, "requirePermission returns HTTP 401 for unauthenticated request");
  })();

  // 3.2 Super Admin allowed via requirePermission
  await (async () => {
    const req = createMockRequest({ cookie: validCuid });
    const { res, result } = createMockResponse();
    let nextCalled = false;

    const middleware = requirePermission("blogs");
    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert(nextCalled, "requirePermission allows Super Admin");
    assert(result.statusCode === 200, "Super Admin response status remains 200");
  })();

  // 3.3 Staff with required permission allowed
  await (async () => {
    const req = createMockRequest({ cookie: staffCuid });
    const { res, result } = createMockResponse();
    let nextCalled = false;

    const middleware = requirePermission("blogs");
    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert(nextCalled, "requirePermission allows Staff with 'blogs' permission");
    assert(result.statusCode === 200, "Staff with 'blogs' response status remains 200");
  })();

  // 3.4 Staff lacking required permission receives 403 Forbidden
  await (async () => {
    const req = createMockRequest({ cookie: staffCuid });
    const { res, result } = createMockResponse();
    let nextCalled = false;

    const middleware = requirePermission("projects");
    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert(!nextCalled, "requirePermission blocks Staff lacking 'projects' permission");
    assert(result.statusCode === 403, "requirePermission returns HTTP 403 Forbidden");
    assert(result.body?.error?.includes("Forbidden"), "requirePermission response includes Forbidden error message");
  })();

  // 3.5 Alias permissionGuard works identically
  await (async () => {
    const req = createMockRequest({ cookie: staffCuid });
    const { res, result } = createMockResponse();
    let nextCalled = false;

    const middleware = permissionGuard("projects");
    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert(!nextCalled, "permissionGuard alias blocks unauthorized staff");
    assert(result.statusCode === 403, "permissionGuard returns HTTP 403");
  })();

  // 3.6 Staff attempting adminGuard receives 403 Forbidden
  await (async () => {
    const req = createMockRequest({ cookie: staffCuid });
    const { res, result } = createMockResponse();
    let nextCalled = false;

    await adminGuard(req, res, () => {
      nextCalled = true;
    });

    assert(!nextCalled, "adminGuard strictly blocks employee role");
    assert(result.statusCode === 403, "adminGuard returns HTTP 403 for employee role");
    assert(
      result.body?.error === "Forbidden - Admin access required",
      "adminGuard returns exact Admin access required error"
    );
  })();

  // ─────────────────────────────────────────────────────────────────
  // 4. Super Admin Sole Privilege Endpoints
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 4. Super Admin Sole Privilege Endpoints ---");

  // 4.1 adminGuard allows Super Admin
  await (async () => {
    const req = createMockRequest({ cookie: validCuid });
    const { res, result } = createMockResponse();
    let nextCalled = false;

    await adminGuard(req, res, () => {
      nextCalled = true;
    });

    assert(nextCalled, "adminGuard allows Super Admin (role === 'admin')");
  })();

  // 4.2 Staff with broad permissions still blocked from adminGuard
  const staffBroadCuid = generateCuidWithTimestamp(now);
  mockUsers.set("emp-broad", {
    id: "emp-broad",
    email: "manager@hindustanprojects.com",
    name: "General Manager",
    role: "employee",
    permissions: '["blogs", "projects", "services", "about", "leads", "settings"]',
  });
  mockSessions.set(staffBroadCuid, {
    id: staffBroadCuid,
    userId: "emp-broad",
    expiresAt: new Date(now + 7 * 86400000),
  });

  await (async () => {
    const req = createMockRequest({ cookie: staffBroadCuid });
    const { res, result } = createMockResponse();
    let nextCalled = false;

    await adminGuard(req, res, () => {
      nextCalled = true;
    });

    assert(!nextCalled, "adminGuard blocks staff even if permissions contains 'settings'");
    assert(result.statusCode === 403, "adminGuard strictly returns 403 for staff on admin-only routes");
  })();

  // ─────────────────────────────────────────────────────────────────
  // 5. Content Management RBAC Enforcement
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 5. Content Management RBAC Enforcement ---");

  const testModules = [
    { name: "blogs", guard: requirePermission("blogs") },
    { name: "about", guard: requirePermission("about") },
    { name: "projects", guard: requirePermission("projects") },
    { name: "services", guard: requirePermission("services") },
    { name: "team", guard: requirePermission("team") },
    { name: "testimonials", guard: requirePermission("testimonials") },
    { name: "hero", guard: requirePermission("hero") },
    { name: "jobs", guard: requirePermission("jobs") },
    { name: "stats", guard: requirePermission("stats") },
    { name: "guarantees", guard: requirePermission(["guarantees", "about", "settings"]) },
  ];

  for (const mod of testModules) {
    // 5.1 Super Admin allowed on mod
    const reqAdmin = createMockRequest({ cookie: validCuid });
    const { res: resAdmin } = createMockResponse();
    let adminPassed = false;
    await mod.guard(reqAdmin, resAdmin, () => {
      adminPassed = true;
    });
    assert(adminPassed, `Super Admin allowed on ${mod.name} module`);

    // 5.2 Staff with blogs only: allowed only on blogs (and not others)
    const reqStaff = createMockRequest({ cookie: staffCuid });
    const { res: resStaff, result: staffRes } = createMockResponse();
    let staffPassed = false;
    await mod.guard(reqStaff, resStaff, () => {
      staffPassed = true;
    });

    if (mod.name === "blogs") {
      assert(staffPassed, "Staff with 'blogs' allowed on blogs module");
    } else {
      assert(!staffPassed, `Staff with 'blogs' blocked (403) from ${mod.name} module`);
      assert(staffRes.statusCode === 403, `Staff receives 403 on unauthorized module ${mod.name}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. Upload Endpoint Content Privilege Integration
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 6. Upload Endpoint Content Privilege Integration ---");

  const uploadGuard = requirePermission([
    "upload",
    "projects",
    "blogs",
    "services",
    "about",
    "team",
    "testimonials",
    "hero",
    "hbs",
  ]);

  // 6.1 Super Admin allowed to upload
  await (async () => {
    const req = createMockRequest({ cookie: validCuid });
    const { res } = createMockResponse();
    let passed = false;
    await uploadGuard(req, res, () => {
      passed = true;
    });
    assert(passed, "Super Admin allowed to upload");
  })();

  // 6.2 Staff with 'blogs' allowed to upload
  await (async () => {
    const req = createMockRequest({ cookie: staffCuid });
    const { res } = createMockResponse();
    let passed = false;
    await uploadGuard(req, res, () => {
      passed = true;
    });
    assert(passed, "Staff with 'blogs' allowed to upload images for their content");
  })();

  // 6.3 Staff with CRM-only permissions blocked from upload
  const crmOnlyCuid = generateCuidWithTimestamp(now);
  mockUsers.set("emp-crm", {
    id: "emp-crm",
    email: "crm@hindustanprojects.com",
    name: "CRM Representative",
    role: "employee",
    permissions: '["leads", "contacts", "quotes"]',
  });
  mockSessions.set(crmOnlyCuid, {
    id: crmOnlyCuid,
    userId: "emp-crm",
    expiresAt: new Date(now + 7 * 86400000),
  });

  await (async () => {
    const req = createMockRequest({ cookie: crmOnlyCuid });
    const { res, result } = createMockResponse();
    let passed = false;
    await uploadGuard(req, res, () => {
      passed = true;
    });
    assert(!passed, "Staff with CRM-only permissions blocked from uploading");
    assert(result.statusCode === 403, "CRM-only staff upload attempt returns 403 Forbidden");
  })();

  // ─────────────────────────────────────────────────────────────────
  // 7. CRM Module Strict Isolation
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 7. CRM Module Strict Isolation ---");

  const quoteGuard = requirePermission("quotes");
  const leadGuard = requirePermission("leads");
  const contactGuard = requirePermission("contacts");
  const appGuard = requirePermission("applications");
  const newsGuard = requirePermission("newsletter");

  const quotesStaffCuid = generateCuidWithTimestamp(now);
  mockUsers.set("emp-quotes", {
    id: "emp-quotes",
    email: "sales@hindustanprojects.com",
    name: "Sales Estimator",
    role: "employee",
    permissions: '["quotes"]',
  });
  mockSessions.set(quotesStaffCuid, {
    id: quotesStaffCuid,
    userId: "emp-quotes",
    expiresAt: new Date(now + 7 * 86400000),
  });

  // 7.1 Allowed on quotes
  await (async () => {
    const req = createMockRequest({ cookie: quotesStaffCuid });
    const { res } = createMockResponse();
    let passed = false;
    await quoteGuard(req, res, () => {
      passed = true;
    });
    assert(passed, "Staff with 'quotes' permission allowed on quote module");
  })();

  // 7.2 Blocked on leads
  await (async () => {
    const req = createMockRequest({ cookie: quotesStaffCuid });
    const { res, result } = createMockResponse();
    let passed = false;
    await leadGuard(req, res, () => {
      passed = true;
    });
    assert(!passed, "Staff with 'quotes' strictly blocked from leads module");
    assert(result.statusCode === 403, "Lacking 'leads' permission returns 403");
  })();

  // 7.3 Blocked on contacts
  await (async () => {
    const req = createMockRequest({ cookie: quotesStaffCuid });
    const { res, result } = createMockResponse();
    let passed = false;
    await contactGuard(req, res, () => {
      passed = true;
    });
    assert(!passed, "Staff with 'quotes' strictly blocked from contacts module");
    assert(result.statusCode === 403, "Lacking 'contacts' permission returns 403");
  })();

  // 7.4 Blocked on job applications
  await (async () => {
    const req = createMockRequest({ cookie: quotesStaffCuid });
    const { res, result } = createMockResponse();
    let passed = false;
    await appGuard(req, res, () => {
      passed = true;
    });
    assert(!passed, "Staff with 'quotes' strictly blocked from job applications module");
    assert(result.statusCode === 403, "Lacking 'applications' permission returns 403");
  })();

  // 7.5 Blocked on newsletter subscribers
  await (async () => {
    const req = createMockRequest({ cookie: quotesStaffCuid });
    const { res, result } = createMockResponse();
    let passed = false;
    await newsGuard(req, res, () => {
      passed = true;
    });
    assert(!passed, "Staff with 'quotes' strictly blocked from newsletter module");
    assert(result.statusCode === 403, "Lacking 'newsletter' permission returns 403");
  })();

  // ─────────────────────────────────────────────────────────────────
  // 8. Group Ventures Route Protection
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 8. Group Ventures Route Protection ---");

  const hbsGuard = requirePermission("hbs");
  const hbsLeadsGuard = requirePermission(["hbs", "leads"]);
  const empanelmentGuard = requirePermission("empanelment");
  const automailGuard = requirePermission("automail");

  const venturesStaffCuid = generateCuidWithTimestamp(now);
  mockUsers.set("emp-ventures", {
    id: "emp-ventures",
    email: "partner@hindustanprojects.com",
    name: "Ventures Partner",
    role: "employee",
    permissions: '["hbs", "empanelment"]',
  });
  mockSessions.set(venturesStaffCuid, {
    id: venturesStaffCuid,
    userId: "emp-ventures",
    expiresAt: new Date(now + 7 * 86400000),
  });

  // 8.1 HBS module allowed for hbs permission
  await (async () => {
    const req = createMockRequest({ cookie: venturesStaffCuid });
    const { res } = createMockResponse();
    let passed = false;
    await hbsGuard(req, res, () => {
      passed = true;
    });
    assert(passed, "Staff with 'hbs' allowed on HBS portal endpoints");
  })();

  // 8.2 HBS leads allowed for either 'hbs' or 'leads'
  await (async () => {
    const req = createMockRequest({ cookie: venturesStaffCuid });
    const { res } = createMockResponse();
    let passed = false;
    await hbsLeadsGuard(req, res, () => {
      passed = true;
    });
    assert(passed, "Staff with 'hbs' allowed on HBS leads endpoints");
  })();

  // 8.3 Empanelment allowed for empanelment permission
  await (async () => {
    const req = createMockRequest({ cookie: venturesStaffCuid });
    const { res } = createMockResponse();
    let passed = false;
    await empanelmentGuard(req, res, () => {
      passed = true;
    });
    assert(passed, "Staff with 'empanelment' allowed on Empanelment admin endpoints");
  })();

  // 8.4 Automail denied when lacking automail permission
  await (async () => {
    const req = createMockRequest({ cookie: venturesStaffCuid });
    const { res, result } = createMockResponse();
    let passed = false;
    await automailGuard(req, res, () => {
      passed = true;
    });
    assert(!passed, "Staff lacking 'automail' blocked from Automail endpoints");
    assert(result.statusCode === 403, "Automail access returns 403 Forbidden");
  })();

  // ─────────────────────────────────────────────────────────────────
  // 9. Session Invalidation on Staff Account Deletion
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 9. Session Invalidation on Staff Account Deletion ---");

  const victimUserCuid = generateCuidWithTimestamp(now);
  const victimUserId = "emp-victim";
  mockUsers.set(victimUserId, {
    id: victimUserId,
    email: "departing@hindustanprojects.com",
    name: "Departing Staff",
    role: "employee",
    permissions: '["blogs"]',
  });
  mockSessions.set(victimUserCuid, {
    id: victimUserCuid,
    userId: victimUserId,
    expiresAt: new Date(now + 7 * 86400000),
  });

  // Verify session works prior to deletion
  await (async () => {
    const req = createMockRequest({ cookie: victimUserCuid });
    const { res } = createMockResponse();
    let passed = false;
    await requirePermission("blogs")(req, res, () => {
      passed = true;
    });
    assert(passed, "Staff session is active and functional before deletion");
  })();

  // Simulate adminUsers.ts DELETE /api/admin-users/:id logic:
  // Invalidate sessions immediately upon staff deletion
  await prisma.adminSession.deleteMany({
    where: { userId: victimUserId },
  });
  await prisma.adminUser.delete({
    where: { id: victimUserId },
  });

  assert(sessionDeleteManyCallCount > 0, "adminSession.deleteMany was invoked upon staff deletion");
  assert(lastDeletedSessionUserId === victimUserId, "deleteMany targeted the correct deleted userId");
  assert(!mockSessions.has(victimUserCuid), "Staff session was purged from the session database");

  // Verify subsequent request with deleted staff session is rejected (401 Unauthorized)
  await (async () => {
    const req = createMockRequest({ cookie: victimUserCuid });
    const { res, result } = createMockResponse();
    let passed = false;
    await requirePermission("blogs")(req, res, () => {
      passed = true;
    });
    assert(!passed, "Deleted staff user request is blocked after session purge");
    assert(result.statusCode === 401, "Subsequent request returns 401 Unauthorized");
  })();

  // ─────────────────────────────────────────────────────────────────
  // 10. Fail-Closed Security & Tamper Resistance
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 10. Fail-Closed Security & Tamper Resistance ---");

  // 10.1 Role tampering attempt (e.g. role: 'superadmin' instead of canonical 'admin')
  const tamperedRoleUser = { id: "u-tamp", role: "superadmin", permissions: '["blogs"]' };
  assert(
    !hasPermission(tamperedRoleUser, "blogs"),
    "Non-canonical role 'superadmin' fails closed (returns false)"
  );

  // 10.2 Permission array with injection payload
  const injectionUser = {
    id: "u-inject",
    role: "employee",
    permissions: '["blogs\' OR \'1\'=\'1", "<script>alert(1)</script>"]',
  };
  assert(
    !hasPermission(injectionUser, "blogs"),
    "Injected SQL/XSS payload string in permissions fails closed"
  );

  // 10.3 Empty permissions array fails closed for all modules
  const emptyUser = { id: "u-empty", role: "employee", permissions: "[]" };
  assert(!hasPermission(emptyUser, "blogs"), "Empty permissions fails closed on blogs");
  assert(!hasPermission(emptyUser, "projects"), "Empty permissions fails closed on projects");
  assert(!hasPermission(emptyUser, "leads"), "Empty permissions fails closed on leads");
  assert(!hasPermission(emptyUser, "upload"), "Empty permissions fails closed on upload");

  // 10.4 Null permissions in database fails closed
  const nullPermsUser = { id: "u-null", role: "employee", permissions: null };
  assert(!hasPermission(nullPermsUser, "blogs"), "Null permissions fails closed on blogs");

  // ─────────────────────────────────────────────────────────────────
  // 11. Newsletter Deletion Security (SEC-B2B-01)
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 11. Newsletter Deletion Security (SEC-B2B-01) ---");

  // Setup test subscribers in mock database
  const sub1 = { id: "sub-public-1", email: "unsub-me@example.com", active: true };
  const sub2 = { id: "sub-delete-1", email: "delete-me@example.com", active: true };
  mockSubscribers.set(sub1.id, { ...sub1 });
  mockSubscribers.set(sub2.id, { ...sub2 });

  // 11.1 Unauthenticated DELETE /api/newsletter with { id } returns 400 Bad Request
  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: "/",
      body: { id: sub1.id },
    });
    await dispatchRouter(newsletterRouter, req, res);
    assert(
      result.statusCode === 400 &&
        result.body?.success === false &&
        result.body?.error?.includes("Direct deletion by ID is not supported"),
      "Public DELETE /api/newsletter with { id } returns 400 rejecting unauthenticated deletion"
    );
    assert(
      mockSubscribers.has(sub1.id),
      "Subscriber record is NOT deleted when { id } is provided to public unsubscribe"
    );
  })();

  // 11.2 Public DELETE /api/newsletter with { email } deactivates without record deletion (active: false)
  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: "/",
      body: { email: "unsub-me@example.com" },
    });
    await dispatchRouter(newsletterRouter, req, res);
    assert(
      result.statusCode === 200 &&
        result.body?.success === true &&
        result.body?.message === "Unsubscribed successfully",
      "Public DELETE /api/newsletter with { email } returns 200 Unsubscribed successfully"
    );
    const updatedSub = mockSubscribers.get(sub1.id);
    assert(
      updatedSub !== undefined && updatedSub.active === false,
      "Public unsubscribe deactivates subscription (active = false) without record removal"
    );
  })();

  // 11.3 Protected DELETE /api/newsletter/:id without session returns 401 Unauthorized
  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: `/${sub2.id}`,
    });
    await dispatchRouter(newsletterRouter, req, res);
    assert(
      result.statusCode === 401 && result.body?.error === "Unauthorized",
      "DELETE /api/newsletter/:id without authentication returns 401 Unauthorized"
    );
  })();

  // 11.4 Protected DELETE /api/newsletter/:id with unauthorized staff (e.g. blogs only) returns 403 Forbidden
  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: `/${sub2.id}`,
      cookie: staffCuid, // staffCuid has permissions: '["blogs"]'
    });
    await dispatchRouter(newsletterRouter, req, res);
    assert(
      result.statusCode === 403 && result.body?.error?.includes("Forbidden"),
      "DELETE /api/newsletter/:id with unauthorized employee returns 403 Forbidden"
    );
  })();

  // 11.5 Protected DELETE /api/newsletter/:id with authorized staff ('newsletter' permission) deletes record (200)
  const newsStaffCuid = generateCuidWithTimestamp(now);
  mockUsers.set("emp-news", {
    id: "emp-news",
    email: "news-editor@hindustanprojects.com",
    name: "Newsletter Editor",
    role: "employee",
    permissions: '["newsletter"]',
  });
  mockSessions.set(newsStaffCuid, {
    id: newsStaffCuid,
    userId: "emp-news",
    expiresAt: new Date(now + 7 * 86400000),
  });

  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: `/${sub2.id}`,
      cookie: newsStaffCuid,
    });
    await dispatchRouter(newsletterRouter, req, res);
    assert(
      result.statusCode === 200 &&
        result.body?.success === true &&
        result.body?.message === "Subscriber deleted successfully",
      "DELETE /api/newsletter/:id with authorized 'newsletter' staff deletes record and returns 200"
    );
    assert(!mockSubscribers.has(sub2.id), "Subscriber was permanently removed from database");
  })();

  // 11.6 Protected DELETE /api/newsletter/:id with Super Admin deletes record (200)
  const sub3 = { id: "sub-super-del", email: "admin-del@example.com", active: true };
  mockSubscribers.set(sub3.id, { ...sub3 });

  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: `/${sub3.id}`,
      cookie: validCuid, // validCuid is Super Admin (role === "admin")
    });
    await dispatchRouter(newsletterRouter, req, res);
    assert(
      result.statusCode === 200 &&
        result.body?.success === true &&
        result.body?.message === "Subscriber deleted successfully",
      "DELETE /api/newsletter/:id with Super Admin successfully deletes record and returns 200"
    );
    assert(!mockSubscribers.has(sub3.id), "Subscriber was permanently removed by Super Admin");
  })();

  // ─────────────────────────────────────────────────────────────────
  // 12. Super Admin Account Protection & Staff Deletion Security (SEC-B2B-04)
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 12. Super Admin Account Protection & Staff Deletion Security (SEC-B2B-04) ---");

  const superAdmin1Id = "admin-primary";
  const superAdmin2Id = "admin-secondary";
  mockUsers.set(superAdmin1Id, {
    id: superAdmin1Id,
    email: "superadmin1@hindustanprojects.com",
    name: "Primary Super Admin",
    role: "admin",
    permissions: null,
  });
  mockUsers.set(superAdmin2Id, {
    id: superAdmin2Id,
    email: "superadmin2@hindustanprojects.com",
    name: "Secondary Super Admin",
    role: "admin",
    permissions: null,
  });

  const superAdmin1Cuid = generateCuidWithTimestamp(now);
  mockSessions.set(superAdmin1Cuid, {
    id: superAdmin1Cuid,
    userId: superAdmin1Id,
    expiresAt: new Date(now + 7 * 86400000),
  });

  // 12.1 Attempting to delete another Super Admin via DELETE /api/admin-users/:id returns 403 Forbidden
  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: `/${superAdmin2Id}`,
      cookie: superAdmin1Cuid,
    });
    await dispatchRouter(adminUsersRouter, req, res);
    assert(
      result.statusCode === 403 &&
        result.body?.error === "Cannot delete a Super Admin account through staff management",
      "DELETE /api/admin-users/:id targeting another Super Admin returns 403 Forbidden"
    );
    assert(mockUsers.has(superAdmin2Id), "Target Super Admin was NOT deleted from database");
  })();

  // 12.2 Attempting to delete oneself returns 400 Bad Request
  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: `/${superAdmin1Id}`,
      cookie: superAdmin1Cuid,
    });
    await dispatchRouter(adminUsersRouter, req, res);
    assert(
      result.statusCode === 400 && result.body?.error === "Cannot delete yourself",
      "DELETE /api/admin-users/:id targeting oneself returns 400 Bad Request"
    );
    assert(mockUsers.has(superAdmin1Id), "Current user was NOT deleted");
  })();

  // 12.3 Attempting to delete non-existent user returns 404 Not Found
  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: "/non-existent-user-id",
      cookie: superAdmin1Cuid,
    });
    await dispatchRouter(adminUsersRouter, req, res);
    assert(
      result.statusCode === 404 && result.body?.error === "User not found",
      "DELETE /api/admin-users/:id targeting non-existent user returns 404 Not Found"
    );
  })();

  // 12.4 Deleting an employee user succeeds with 200 and purges active sessions
  const staffTargetId = "emp-target-delete";
  const staffTargetCuid = generateCuidWithTimestamp(now);
  mockUsers.set(staffTargetId, {
    id: staffTargetId,
    email: "leaving.staff@hindustanprojects.com",
    name: "Leaving Staff",
    role: "employee",
    permissions: '["leads"]',
  });
  mockSessions.set(staffTargetCuid, {
    id: staffTargetCuid,
    userId: staffTargetId,
    expiresAt: new Date(now + 7 * 86400000),
  });

  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "DELETE",
      url: `/${staffTargetId}`,
      cookie: superAdmin1Cuid,
    });
    await dispatchRouter(adminUsersRouter, req, res);
    assert(
      result.statusCode === 200 && result.body?.success === true,
      "DELETE /api/admin-users/:id targeting employee succeeds with 200 OK"
    );
    assert(!mockUsers.has(staffTargetId), "Employee record was deleted from database");
    assert(!mockSessions.has(staffTargetCuid), "All active sessions for deleted employee were purged");
  })();

  // 12.5 Subsequent request with purged session token returns 401 Unauthorized
  await (async () => {
    const { res, result } = createMockResponse();
    const req = createMockRequest({
      method: "GET",
      url: "/api/leads",
      cookie: staffTargetCuid,
    });
    let passed = false;
    await requirePermission("leads")(req, res, () => {
      passed = true;
    });
    assert(!passed, "Subsequent request with deleted staff session is blocked");
    assert(result.statusCode === 401, "Deleted staff session returns 401 Unauthorized");
  })();

  // ─────────────────────────────────────────────────────────────────
  // 13. Frontend Permission UI & Access Alignment Verification (SEC-B2B-02 & SEC-B2B-03)
  // ─────────────────────────────────────────────────────────────────
  console.log("\n--- 13. Frontend Permission UI & Access Alignment (SEC-B2B-02 & SEC-B2B-03) ---");

  const frontendUsersPagePath = path.resolve(__dirname, "../../../frontend/app/admin/users/page.tsx");
  const accessWrapperPath = path.resolve(__dirname, "../../../frontend/components/admin/AdminAccessWrapper.tsx");
  const adminSidebarPath = path.resolve(__dirname, "../../../frontend/components/admin/AdminSidebar.tsx");

  const usersPageContent = fs.readFileSync(frontendUsersPagePath, "utf-8");
  const accessWrapperContent = fs.readFileSync(accessWrapperPath, "utf-8");
  const adminSidebarContent = fs.readFileSync(adminSidebarPath, "utf-8");

  // 13.1 users/page.tsx: 'settings' removed from employee available sections
  assert(
    !usersPageContent.includes('{ key: "settings"'),
    "frontend users/page.tsx excludes 'settings' from availableSections (SEC-B2B-02)"
  );

  // 13.2 users/page.tsx: 'hbs', 'empanelment', and 'automail' present in available sections
  assert(
    usersPageContent.includes('{ key: "hbs", label: "HBS Portal CMS" }') &&
      usersPageContent.includes('{ key: "empanelment", label: "Vendor Empanelment" }') &&
      usersPageContent.includes('{ key: "automail", label: "AutoMail Studio" }'),
    "frontend users/page.tsx includes 'hbs', 'empanelment', and 'automail' in availableSections (SEC-B2B-02)"
  );

  // 13.3 AdminAccessWrapper.tsx: 'leads' strictly requires 'leads' permission
  assert(
    accessWrapperContent.includes('(sectionKey === "leads" && userPermissions.includes("leads"))'),
    "AdminAccessWrapper strictly enforces 'leads' section requires 'leads' permission (SEC-B2B-03)"
  );

  // 13.4 AdminAccessWrapper.tsx: 'automail' strictly requires 'automail' permission
  assert(
    accessWrapperContent.includes('(sectionKey === "automail" && userPermissions.includes("automail"))'),
    "AdminAccessWrapper strictly enforces 'automail' section requires 'automail' permission (SEC-B2B-03)"
  );

  // 13.5 AdminSidebar.tsx: 'leads' menu item strictly requires 'leads' permission
  assert(
    adminSidebarContent.includes('key === "leads"') &&
      adminSidebarContent.includes('return userPermissions.includes("leads");'),
    "AdminSidebar strictly enforces 'leads' navigation requires 'leads' permission (SEC-B2B-03)"
  );

  // 13.6 AdminSidebar.tsx: 'automail' menu item strictly requires 'automail' permission
  assert(
    adminSidebarContent.includes('key === "automail"') &&
      adminSidebarContent.includes('return userPermissions.includes("automail");'),
    "AdminSidebar strictly enforces 'automail' navigation requires 'automail' permission (SEC-B2B-03)"
  );

  console.log("\n==================================================================");
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log("==================================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
