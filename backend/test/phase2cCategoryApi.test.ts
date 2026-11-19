/**
 * phase2cCategoryApi.test.ts — Phase 2C.4
 *
 * Automated test suite for Vendor Category & Subcategory APIs:
 * - Public category endpoint (active only, nested active subcategories, no internal metadata)
 * - Admin RBAC enforcement (HTTP 401 unauthenticated, HTTP 403 unauthorized, HTTP 200 authorized)
 * - Admin Category CRUD validations (slug format, name length, icon format, 409 conflicts)
 * - Admin Subcategory CRUD validations (parent existence, compound slug uniqueness, parent immutability)
 * - Immediate cache invalidation on successful mutations & cache persistence on failed mutations
 * - Safe deactivation preservation (zero deletion, relations intact)
 *
 * ZERO DATABASE CONNECTIONS — Runs with mock Prisma in memory.
 */

import http from "node:http";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "../src/lib/db";
import empanelmentRouter from "../src/routes/empanelment";
import {
  getCachedPublicCategories,
  invalidatePublicCategoryCache,
} from "../src/services/vendorCategoryService";

console.log("==================================================================");
console.log("Phase 2C.4: Vendor Category & Subcategory API Test Suite");
console.log("==================================================================");

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
): Promise<{ status: number; body: any }> {
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
          let parsed: any = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode || 500, body: parsed });
        });
      }
    );

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

// In-memory mock database state
let mockCategories: any[] = [];
let mockSubcategories: any[] = [];

function generateTestCuid(timestampMs: number = Date.now()): string {
  const base36Time = timestampMs.toString(36).padStart(8, "0");
  return `c${base36Time}0001slp6testcuid2c`;
}

const VALID_ADMIN_SESSION_ID = generateTestCuid(Date.now() - 3600000);
const UNAUTHORIZED_SESSION_ID = generateTestCuid(Date.now() - 7200000);
const authCookies = { admin_session: VALID_ADMIN_SESSION_ID };
const unauthorizedCookies = { admin_session: UNAUTHORIZED_SESSION_ID };

function resetMockDb() {
  invalidatePublicCategoryCache();
  mockCategories = [
    {
      id: "cat-civil",
      slug: "civil-construction",
      name: "Civil Construction",
      nameHindi: "आरसीसी एवं चिनाई",
      description: "RCC structural works",
      icon: "hard-hat",
      sortOrder: 1,
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
    {
      id: "cat-mep",
      slug: "electrical-mep",
      name: "Electrical & MEP",
      nameHindi: "विद्युत एवं सबस्टेशन",
      description: "Electrical power distribution",
      icon: "zap",
      sortOrder: 2,
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
    {
      id: "cat-inactive",
      slug: "demolition-works",
      name: "Demolition Works",
      nameHindi: "ध्वस्तीकरण कार्य",
      description: "Heavy demolition and earthmoving",
      icon: "hammer",
      sortOrder: 10,
      isActive: false, // Inactive category
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
  ];

  mockSubcategories = [
    {
      id: "sub-rcc",
      categoryId: "cat-civil",
      slug: "rcc-foundations",
      name: "RCC Foundations",
      nameHindi: "आरसीसी नींव",
      description: "Foundation footings",
      sortOrder: 1,
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
    {
      id: "sub-inactive",
      categoryId: "cat-civil",
      slug: "old-quarry-work",
      name: "Old Quarry Work",
      nameHindi: "खनन कार्य",
      description: "Legacy quarry operations",
      sortOrder: 99,
      isActive: false, // Inactive subcategory under active category
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
    {
      id: "sub-mep-wiring",
      categoryId: "cat-mep",
      slug: "electrical-wiring",
      name: "Electrical Wiring",
      nameHindi: "वायरिंग",
      description: "Internal wiring",
      sortOrder: 1,
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
  ];
}

async function runTests() {
  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      port = (server.address() as any).port;
      resolve();
    });
  });

  // Wire Prisma Mock Functions
  (prisma.adminSession as any).findUnique = async ({ where }: any) => {
    if (where.id === VALID_ADMIN_SESSION_ID) {
      return { id: VALID_ADMIN_SESSION_ID, userId: "admin-user", expiresAt: new Date(Date.now() + 86400000) };
    }
    if (where.id === UNAUTHORIZED_SESSION_ID) {
      return { id: UNAUTHORIZED_SESSION_ID, userId: "unauth-user", expiresAt: new Date(Date.now() + 86400000) };
    }
    return null;
  };

  (prisma.adminUser as any).findUnique = async ({ where }: any) => {
    if (where.id === "admin-user") {
      return { id: "admin-user", role: "admin", permissions: ["empanelment"], isActive: true };
    }
    if (where.id === "unauth-user") {
      return { id: "unauth-user", role: "employee", permissions: ["blogs"], isActive: true };
    }
    return null;
  };

  let categoryFindManyCalls = 0;

  (prisma.vendorCategory as any).findMany = async (args: any) => {
    categoryFindManyCalls++;
    let cats = [...mockCategories];
    if (args?.where?.isActive === true) {
      cats = cats.filter((c) => c.isActive === true);
    }
    return cats.map((cat) => {
      let subcats = mockSubcategories.filter((s) => s.categoryId === cat.id);
      if (args?.select?.subcategories?.where?.isActive === true) {
        subcats = subcats.filter((s) => s.isActive === true);
      }
      if (args?.select) {
        const item: any = {};
        for (const key of Object.keys(args.select)) {
          if (key === "subcategories") {
            item.subcategories = subcats.map((s) => {
              if (args.select.subcategories.select) {
                const subItem: any = {};
                for (const subKey of Object.keys(args.select.subcategories.select)) {
                  subItem[subKey] = s[subKey];
                }
                return subItem;
              }
              return s;
            });
          } else if (key === "_count") {
            item._count = {
              subcategories: subcats.length,
              applications: 2,
              tenders: 1,
            };
          } else {
            item[key] = cat[key];
          }
        }
        return item;
      }
      return {
        ...cat,
        subcategories: subcats,
        _count: {
          subcategories: subcats.length,
          applications: 2,
          tenders: 1,
        },
      };
    });
  };

  (prisma.vendorCategory as any).findUnique = async ({ where }: any) => {
    if (where.id) return mockCategories.find((c) => c.id === where.id) || null;
    if (where.slug) return mockCategories.find((c) => c.slug === where.slug) || null;
    return null;
  };

  (prisma.vendorCategory as any).findFirst = async ({ where }: any) => {
    return (
      mockCategories.find((c) => {
        if (where.id?.not && c.id === where.id.not) return false;
        if (where.name?.equals && c.name.toLowerCase() === where.name.equals.toLowerCase()) return true;
        return false;
      }) || null
    );
  };

  (prisma.vendorCategory as any).create = async ({ data }: any) => {
    const newCat = {
      id: `cat-${data.slug}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockCategories.push(newCat);
    return newCat;
  };

  (prisma.vendorCategory as any).update = async ({ where, data }: any) => {
    const idx = mockCategories.findIndex((c) => c.id === where.id);
    if (idx === -1) throw new Error("Category not found");
    mockCategories[idx] = { ...mockCategories[idx], ...data, updatedAt: new Date() };
    return mockCategories[idx];
  };

  (prisma.vendorSubcategory as any).findUnique = async ({ where }: any) => {
    if (where.id) return mockSubcategories.find((s) => s.id === where.id) || null;
    if (where.categoryId_slug) {
      return (
        mockSubcategories.find(
          (s) => s.categoryId === where.categoryId_slug.categoryId && s.slug === where.categoryId_slug.slug
        ) || null
      );
    }
    return null;
  };

  (prisma.vendorSubcategory as any).create = async ({ data }: any) => {
    const newSub = {
      id: `sub-${data.slug}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockSubcategories.push(newSub);
    return newSub;
  };

  (prisma.vendorSubcategory as any).update = async ({ where, data }: any) => {
    const idx = mockSubcategories.findIndex((s) => s.id === where.id);
    if (idx === -1) throw new Error("Subcategory not found");
    mockSubcategories[idx] = { ...mockSubcategories[idx], ...data, updatedAt: new Date() };
    return mockSubcategories[idx];
  };

  let passed = 0;

  try {
    resetMockDb();

    // 1. PUBLIC CATEGORY API: Active only, nested active subcategories
    const pubRes = await makeRequest("GET", "/api/empanelment/categories");
    assert.equal(pubRes.status, 200);
    assert.equal(pubRes.body.success, true);
    assert.equal(pubRes.body.categories.length, 2, "Only 2 active categories should be returned");
    // Verify inactive category 'demolition-works' is NOT present
    assert.ok(!pubRes.body.categories.some((c: any) => c.slug === "demolition-works"));
    // Verify active category 'civil-construction' contains only active subcategories
    const civil = pubRes.body.categories.find((c: any) => c.slug === "civil-construction");
    assert.ok(civil);
    assert.equal(civil.subcategories.length, 1, "Inactive subcategory 'old-quarry-work' must be excluded");
    assert.equal(civil.subcategories[0].slug, "rcc-foundations");
    // Verify no internal timestamps or counts in public output
    assert.equal(civil.createdAt, undefined);
    assert.equal(civil._count, undefined);
    console.log("[PASS] 1. Public API: Returns active categories and nested active subcategories only");
    passed++;

    // 2. CACHING: Second public call serves from memory cache
    const initialFindManyCalls = categoryFindManyCalls;
    const pubRes2 = await makeRequest("GET", "/api/empanelment/categories");
    assert.equal(pubRes2.status, 200);
    assert.equal(categoryFindManyCalls, initialFindManyCalls, "Prisma findMany should NOT be called when cache is fresh");
    console.log("[PASS] 2. Public Caching: Repeated requests served from short-lived in-memory cache");
    passed++;

    // 3. ADMIN RBAC: Unauthorized calls rejected
    const unauthRes = await makeRequest("GET", "/api/empanelment/admin/categories");
    assert.equal(unauthRes.status, 401, "Unauthenticated request must return HTTP 401");

    const forbiddenRes = await makeRequest("GET", "/api/empanelment/admin/categories", undefined, unauthorizedCookies);
    assert.equal(forbiddenRes.status, 403, "Missing empanelment permission must return HTTP 403");
    console.log("[PASS] 3. Admin RBAC: Unauthenticated (401) and unauthorized (403) access rejected");
    passed++;

    // 4. ADMIN GET CATEGORIES: Returns all (active + inactive) with assignment counts
    const adminRes = await makeRequest("GET", "/api/empanelment/admin/categories", undefined, authCookies);
    assert.equal(adminRes.status, 200);
    assert.equal(adminRes.body.success, true);
    assert.equal(adminRes.body.categories.length, 3, "Admin API must return all 3 categories (including inactive)");
    const adminCivil = adminRes.body.categories.find((c: any) => c.slug === "civil-construction");
    assert.ok(adminCivil._count);
    assert.equal(adminCivil._count.applications, 2);
    assert.equal(adminCivil.subcategories.length, 2, "Admin API must include inactive subcategories");
    console.log("[PASS] 4. Admin API: Returns active and inactive records with safe assignment counts");
    passed++;

    // 5. ADMIN CREATE CATEGORY: Validation & Conflict Rejections
    // 5a. Invalid slug (spaces, uppercase)
    const badSlugRes = await makeRequest("POST", "/api/empanelment/admin/categories", { slug: "Invalid Slug", name: "Valid Name" }, authCookies);
    assert.equal(badSlugRes.status, 400);

    // 5b. Invalid icon
    const badIconRes = await makeRequest("POST", "/api/empanelment/admin/categories", { slug: "valid-slug", name: "Valid Name", icon: "Hard Hat!" }, authCookies);
    assert.equal(badIconRes.status, 400);

    // 5c. Duplicate slug
    const dupSlugRes = await makeRequest("POST", "/api/empanelment/admin/categories", { slug: "civil-construction", name: "New Civil Works" }, authCookies);
    assert.equal(dupSlugRes.status, 409);
    assert.match(dupSlugRes.body.error, /slug 'civil-construction' already exists/i);

    // 5d. Duplicate name (case-insensitive)
    const dupNameRes = await makeRequest("POST", "/api/empanelment/admin/categories", { slug: "civil-construction-2", name: "civil construction" }, authCookies);
    assert.equal(dupNameRes.status, 409);
    assert.match(dupNameRes.body.error, /name 'civil construction' already exists/i);
    console.log("[PASS] 5. Admin Category Validation: Slug format, icon format, and 409 duplicate checks enforced");
    passed++;

    // 6. CACHE PERSISTENCE ON FAILED MUTATION
    assert.ok(getCachedPublicCategories() !== null, "Cache must remain active after failed mutations");
    console.log("[PASS] 6. Cache Integrity: Failed mutations do NOT invalidate or corrupt public cache");
    passed++;

    // 7. ADMIN CREATE CATEGORY SUCCESS & IMMEDIATE CACHE INVALIDATION
    const createCatRes = await makeRequest(
      "POST",
      "/api/empanelment/admin/categories",
      {
        slug: "plumbing-sanitation",
        name: "Plumbing & Sanitation",
        nameHindi: "प्लंबिंग कार्य",
        icon: "wrench",
        sortOrder: 3,
      },
      authCookies
    );
    assert.equal(createCatRes.status, 201);
    assert.equal(createCatRes.body.category.isActive, true, "New category must default to active");
    assert.equal(getCachedPublicCategories(), null, "Cache must be invalidated immediately upon successful create");

    // Public call now returns 3 active categories
    const pubRes3 = await makeRequest("GET", "/api/empanelment/categories");
    assert.equal(pubRes3.body.categories.length, 3);
    console.log("[PASS] 7. Admin Category Creation: Valid record created and public cache invalidated immediately");
    passed++;

    // 8. ADMIN UPDATE CATEGORY: Immutable field guards & deactivation
    // 8a. Attempt to change slug
    const changeSlugRes = await makeRequest("PATCH", "/api/empanelment/admin/categories/cat-civil", { slug: "new-slug" }, authCookies);
    assert.equal(changeSlugRes.status, 400);
    assert.match(changeSlugRes.body.error, /slug cannot be modified/i);

    // 8b. Safe update & deactivation
    const deactRes = await makeRequest("PATCH", "/api/empanelment/admin/categories/cat-civil", { isActive: false, sortOrder: 99 }, authCookies);
    assert.equal(deactRes.status, 200);
    assert.equal(deactRes.body.category.isActive, false);
    assert.equal(getCachedPublicCategories(), null, "Cache must be invalidated upon deactivation");

    // Public call now excludes deactivated civil category
    const pubRes4 = await makeRequest("GET", "/api/empanelment/categories");
    assert.ok(!pubRes4.body.categories.some((c: any) => c.slug === "civil-construction"));
    console.log("[PASS] 8. Admin Category Update: Slug immutability enforced and safe deactivation verified");
    passed++;

    // 9. ADMIN SUBCATEGORY CREATION: Parent existence & compound slug uniqueness
    // 9a. Non-existent parent category
    const noParentRes = await makeRequest(
      "POST",
      "/api/empanelment/admin/categories/non-existent-id/subcategories",
      { slug: "water-pipe", name: "Water Pipe" },
      authCookies
    );
    assert.equal(noParentRes.status, 404);

    // 9b. Duplicate subcategory slug under same parent
    const dupSubRes = await makeRequest(
      "POST",
      "/api/empanelment/admin/categories/cat-civil/subcategories",
      { slug: "rcc-foundations", name: "Duplicate RCC" },
      authCookies
    );
    assert.equal(dupSubRes.status, 409);

    // 9c. Same subcategory slug under a DIFFERENT parent category is ALLOWED
    const sameSlugOtherParentRes = await makeRequest(
      "POST",
      "/api/empanelment/admin/categories/cat-mep/subcategories",
      { slug: "rcc-foundations", name: "Substation RCC Foundations" },
      authCookies
    );
    assert.equal(sameSlugOtherParentRes.status, 201, "Same subcategory slug under different category must succeed");
    console.log("[PASS] 9. Admin Subcategory Creation: Parent check, compound slug uniqueness, and cross-parent reuse verified");
    passed++;

    // 10. ADMIN SUBCATEGORY UPDATE: Parent immutability guard
    // 10a. Attempt to move subcategory to another parent category
    const moveSubRes = await makeRequest(
      "PATCH",
      "/api/empanelment/admin/subcategories/sub-rcc",
      { categoryId: "cat-mep" },
      authCookies
    );
    assert.equal(moveSubRes.status, 400);
    assert.match(moveSubRes.body.error, /parent category movement is not supported/i);

    // 10b. Safe update
    const updateSubRes = await makeRequest(
      "PATCH",
      "/api/empanelment/admin/subcategories/sub-rcc",
      { name: "RCC Reinforced Footings", sortOrder: 5 },
      authCookies
    );
    assert.equal(updateSubRes.status, 200);
    assert.equal(updateSubRes.body.subcategory.name, "RCC Reinforced Footings");
    console.log("[PASS] 10. Admin Subcategory Update: Parent category immutability and safe modification verified");
    passed++;

    console.log("==================================================================");
    console.log(`TOTAL CHECKS: ${passed} | PASSED: ${passed} | FAILED: 0`);
    console.log("==================================================================");
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  if (server) server.close();
  process.exit(1);
});

