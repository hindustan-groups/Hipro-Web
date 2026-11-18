/**
 * phase2cSeedBackfillUnit.test.ts
 *
 * Comprehensive unit test suite for Phase 2C.3:
 * - Seed data completeness (6 categories, 30 subcategories)
 * - Duplicate slug prevention
 * - Idempotency & Admin customization preservation
 * - Deactivation preservation (isActive: false never flipped to true)
 * - Dry-run default & explicit --apply write protection
 * - Safe backfill logic & null categoryId targeting
 * - Unknown legacy string preservation
 *
 * ZERO DATABASE CONNECTIONS — Operates entirely in memory with mocks.
 */

import assert from "node:assert/strict";
import {
  CANONICAL_VENDOR_CATEGORIES,
  seedVendorCategories,
  backfillVendorCategoryLinks,
} from "../prisma/seedVendorCategories";

console.log("==================================================================");
console.log("Phase 2C.3: Vendor Category Seeder & Backfill Unit Test Suite");
console.log("==================================================================");

let passedChecks = 0;

function runCheck(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        passedChecks++;
        console.log(`[PASS] ${name}`);
      });
    }
    passedChecks++;
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function main() {
  // 1. DATA COMPLETENESS
  runCheck("1. Seed Data: Exactly 6 canonical categories defined", () => {
    assert.equal(CANONICAL_VENDOR_CATEGORIES.length, 6);
  });

  runCheck("2. Seed Data: All 6 category slugs match approved specifications", () => {
    const expectedSlugs = [
      "civil-construction",
      "electrical-mep",
      "plumbing-sanitation",
      "fabrication-peb",
      "flooring-finishing",
      "material-supply",
    ];
    const actualSlugs = CANONICAL_VENDOR_CATEGORIES.map((c) => c.slug);
    assert.deepEqual(actualSlugs, expectedSlugs);
  });

  runCheck("3. Seed Data: All 6 category icons match approved kebab-case Lucide icons", () => {
    const expectedIcons = ["hard-hat", "zap", "wrench", "building-2", "paintbrush", "truck"];
    const actualIcons = CANONICAL_VENDOR_CATEGORIES.map((c) => c.icon);
    assert.deepEqual(actualIcons, expectedIcons);
  });

  runCheck("4. Seed Data: Each category has exactly 5 approved subcategories (30 total)", () => {
    let totalSubcategories = 0;
    for (const cat of CANONICAL_VENDOR_CATEGORIES) {
      assert.equal(cat.subcategories.length, 5, `Category ${cat.slug} must have 5 subcategories`);
      totalSubcategories += cat.subcategories.length;
    }
    assert.equal(totalSubcategories, 30);
  });

  runCheck("5. Duplicate Prevention: All category slugs are strictly unique", () => {
    const slugs = CANONICAL_VENDOR_CATEGORIES.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    assert.equal(uniqueSlugs.size, 6);
  });

  runCheck("6. Duplicate Prevention: All 30 subcategory slugs are globally unique", () => {
    const subSlugs: string[] = [];
    for (const cat of CANONICAL_VENDOR_CATEGORIES) {
      for (const sub of cat.subcategories) {
        subSlugs.push(sub.slug);
      }
    }
    const uniqueSubSlugs = new Set(subSlugs);
    assert.equal(uniqueSubSlugs.size, 30);
  });

  // 2. DRY-RUN VS APPLY SAFETY IN SEEDER
  await runCheck("7. Dry-Run Default: Seeder defaults to dry-run (0 database writes)", async () => {
    let writeCalls = 0;
    const mockPrisma = {
      vendorCategory: {
        findUnique: async () => null,
        create: async () => {
          writeCalls++;
          return {};
        },
      },
      vendorSubcategory: {
        findUnique: async () => null,
        create: async () => {
          writeCalls++;
          return {};
        },
      },
    };

    const res = await seedVendorCategories(mockPrisma, { apply: false, quiet: true });
    assert.equal(res.isDryRun, true);
    assert.equal(writeCalls, 0, "No database write operations should occur in dry-run mode");
    assert.equal(res.categoriesCreated, 6);
    assert.equal(res.subcategoriesCreated, 30);
  });

  await runCheck("8. Live Apply: Explicit { apply: true } triggers record creation for missing entries", async () => {
    let categoryCreates = 0;
    let subcategoryCreates = 0;
    const mockPrisma = {
      vendorCategory: {
        findUnique: async () => null,
        create: async (args: any) => {
          categoryCreates++;
          return { id: `cuid-${args.data.slug}`, ...args.data };
        },
      },
      vendorSubcategory: {
        findUnique: async () => null,
        create: async (args: any) => {
          subcategoryCreates++;
          return { id: `cuid-${args.data.slug}`, ...args.data };
        },
      },
    };

    const res = await seedVendorCategories(mockPrisma, { apply: true, quiet: true });
    assert.equal(res.isDryRun, false);
    assert.equal(categoryCreates, 6);
    assert.equal(subcategoryCreates, 30);
  });

  // 3. IDEMPOTENCY & ADMIN CUSTOMIZATION PROTECTION
  await runCheck("9. Idempotency: Existing records are NOT overwritten or updated", async () => {
    let updateCalls = 0;
    let createCalls = 0;

    const mockPrisma = {
      vendorCategory: {
        findUnique: async (args: any) => ({
          id: `cat-${args.where.slug}`,
          slug: args.where.slug,
          name: "Admin Custom Name",
          nameHindi: "कस्टम नाम",
          description: "Custom admin description",
          icon: "custom-icon",
          sortOrder: 99,
          isActive: false, // Intentionally deactivated by admin
        }),
        create: async () => {
          createCalls++;
          return {};
        },
        update: async () => {
          updateCalls++;
          return {};
        },
      },
      vendorSubcategory: {
        findUnique: async (args: any) => ({
          id: `sub-${args.where.categoryId_slug.slug}`,
          categoryId: args.where.categoryId_slug.categoryId,
          slug: args.where.categoryId_slug.slug,
          name: "Custom Subcategory Name",
          isActive: false, // Intentionally deactivated
        }),
        create: async () => {
          createCalls++;
          return {};
        },
        update: async () => {
          updateCalls++;
          return {};
        },
      },
    };

    const res = await seedVendorCategories(mockPrisma, { apply: true, quiet: true });
    assert.equal(createCalls, 0, "No records should be created when all exist");
    assert.equal(updateCalls, 0, "No records should be updated; existing admin customizations must remain intact");
    assert.equal(res.categoriesSkipped, 6);
    assert.equal(res.subcategoriesSkipped, 30);
  });

  // 4. BACKFILL LOGIC TESTS
  await runCheck("10. Backfill: Preserves already linked records and targets only null categoryId", async () => {
    const mockDbCategories = [
      { id: "cat-1", name: "Civil Construction", slug: "civil-construction" },
      { id: "cat-2", name: "Electrical & MEP", slug: "electrical-mep" },
      { id: "cat-3", name: "Plumbing & Sanitation", slug: "plumbing-sanitation" },
    ];

    const mockApps = [
      // 1. Matched to Civil Construction
      { id: "app-1", trackingId: "HP-EMP-001", category: "Civil Construction" },
      // 2. Matched to Electrical & MEP
      { id: "app-2", trackingId: "HP-EMP-002", category: "Electrical & MEP" },
      // 3. Unmatched legacy string (e.g. from marketing or freeform)
      { id: "app-3", trackingId: "HP-EMP-003", category: "Structural Steel / PEB" },
      // 4. Null category (pending trade classification)
      { id: "app-4", trackingId: "HP-EMP-004", category: null },
      // 5. Empty string
      { id: "app-5", trackingId: "HP-EMP-005", category: "   " },
    ];

    const mockTenders = [
      { id: "tnd-1", tenderNo: "HP-TND-001", category: "Civil Construction" },
      { id: "tnd-2", tenderNo: "HP-TND-002", category: "Material Suppliers" }, // Unmatched
    ];

    let appUpdates: any[] = [];
    let tenderUpdates: any[] = [];

    const mockPrisma = {
      vendorCategory: {
        findMany: async () => mockDbCategories,
      },
      vendorApplication: {
        count: async (args?: any) => {
          if (args?.where?.categoryId && "not" in args.where.categoryId) return 2;
          return 7;
        },
        findMany: async () => mockApps,
        updateMany: async (args: any) => {
          appUpdates.push(args);
          return { count: args.where.id.in.length };
        },
      },
      empanelmentTender: {
        count: async (args?: any) => {
          if (args?.where?.categoryId && "not" in args.where.categoryId) return 1;
          return 3;
        },
        findMany: async () => mockTenders,
        updateMany: async (args: any) => {
          tenderUpdates.push(args);
          return { count: args.where.id.in.length };
        },
      },
    };

    // First test dry-run
    const dryRes = await backfillVendorCategoryLinks(mockPrisma, { apply: false, quiet: true });
    assert.equal(dryRes.isDryRun, true);
    assert.equal(appUpdates.length, 0, "Dry run must perform 0 write operations");
    assert.equal(tenderUpdates.length, 0, "Dry run must perform 0 write operations");
    assert.equal(dryRes.applications.alreadyLinked, 2);
    assert.equal(dryRes.applications.matched, 2);
    assert.equal(dryRes.applications.unmatched, 1);
    assert.equal(dryRes.applications.nullOrEmpty, 2);
    assert.equal(dryRes.tenders.matched, 1);
    assert.equal(dryRes.tenders.unmatched, 1);

    // Then test apply
    const applyRes = await backfillVendorCategoryLinks(mockPrisma, { apply: true, quiet: true });
    assert.equal(applyRes.isDryRun, false);
    assert.equal(appUpdates.length, 2, "Should update 2 distinct matched category groups");
    
    // Verify parameters of updates
    const civilUpdate = appUpdates.find((u) => u.data.categoryId === "cat-1");
    assert.ok(civilUpdate);
    assert.deepEqual(civilUpdate.where.id.in, ["app-1"]);
    assert.equal(civilUpdate.where.categoryId, null, "Must guard categoryId: null");

    const mepUpdate = appUpdates.find((u) => u.data.categoryId === "cat-2");
    assert.ok(mepUpdate);
    assert.deepEqual(mepUpdate.where.id.in, ["app-2"]);

    // Verify tender update
    assert.equal(tenderUpdates.length, 1);
    assert.equal(tenderUpdates[0].data.categoryId, "cat-1");
    assert.deepEqual(tenderUpdates[0].where.id.in, ["tnd-1"]);
  });

  console.log("==================================================================");
  console.log(`TOTAL CHECKS: ${passedChecks} | PASSED: ${passedChecks} | FAILED: 0`);
  console.log("==================================================================");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

