import { PrismaClient } from "@prisma/client";
import { assertLocalDatabase } from "../src/lib/databaseSafety";
import {
  CANONICAL_VENDOR_CATEGORIES,
  CanonicalCategory,
  CanonicalSubcategory,
} from "../src/lib/vendorCategories";

export {
  CANONICAL_VENDOR_CATEGORIES,
  CanonicalCategory,
  CanonicalSubcategory,
};

export interface SeedOptions {
  apply?: boolean;
  quiet?: boolean;
}

export interface SeedResult {
  categoriesCreated: number;
  categoriesSkipped: number;
  subcategoriesCreated: number;
  subcategoriesSkipped: number;
  isDryRun: boolean;
}

export interface BackfillResult {
  applications: {
    total: number;
    alreadyLinked: number;
    matched: number;
    unmatched: number;
    nullOrEmpty: number;
  };
  tenders: {
    total: number;
    alreadyLinked: number;
    matched: number;
    unmatched: number;
    nullOrEmpty: number;
  };
  isDryRun: boolean;
}

/**
 * Idempotent, non-destructive seeder for Vendor Categories and Subcategories.
 *
 * Safety rules:
 * - Matches categories on stable unique `slug`.
 * - Matches subcategories on compound unique `[categoryId, slug]`.
 * - Only creates missing records.
 * - If a record exists, NEVER overwrites name, nameHindi, description, icon, sortOrder, or isActive.
 * - Never reactivates an intentionally deactivated record (isActive: false remains false).
 * - Never deletes any records.
 * - Default behavior is DRY-RUN simulation. Real writes require { apply: true }.
 */
export async function seedVendorCategories(
  prisma: any,
  options: SeedOptions = {}
): Promise<SeedResult> {
  const isApply = Boolean(options.apply);
  const isDryRun = !isApply;
  const quiet = Boolean(options.quiet);

  let categoriesCreated = 0;
  let categoriesSkipped = 0;
  let subcategoriesCreated = 0;
  let subcategoriesSkipped = 0;

  if (!quiet) {
    console.log("\n--- [Phase 2C.3] Seeding Master Vendor Categories & Subcategories ---");
    console.log(`Execution Mode: ${isDryRun ? "DRY-RUN (Simulating changes, 0 writes)" : "APPLY (Writing changes to database)"}`);
  }

  for (const cat of CANONICAL_VENDOR_CATEGORIES) {
    const existingCat = await prisma.vendorCategory.findUnique({
      where: { slug: cat.slug },
    });

    let categoryId: string;

    if (existingCat) {
      categoriesSkipped++;
      categoryId = existingCat.id;
      if (!quiet) {
        console.log(
          `[Category] PRESERVED: "${existingCat.name}" (slug: "${existingCat.slug}", id: "${existingCat.id}", active: ${existingCat.isActive})`
        );
      }
    } else {
      categoriesCreated++;
      if (isDryRun) {
        categoryId = `dry-run-${cat.slug}`;
        if (!quiet) {
          console.log(
            `[Category] WOULD CREATE: "${cat.name}" (slug: "${cat.slug}", icon: "${cat.icon}", sortOrder: ${cat.sortOrder})`
          );
        }
      } else {
        const createdCat = await prisma.vendorCategory.create({
          data: {
            slug: cat.slug,
            name: cat.name,
            nameHindi: cat.nameHindi,
            description: cat.description,
            icon: cat.icon,
            sortOrder: cat.sortOrder,
            isActive: true,
          },
        });
        categoryId = createdCat.id;
        if (!quiet) {
          console.log(
            `[Category] CREATED: "${createdCat.name}" (slug: "${createdCat.slug}", id: "${createdCat.id}")`
          );
        }
      }
    }

    // Process subcategories for this category
    for (const sub of cat.subcategories) {
      let existingSub = null;
      if (!existingCat && isDryRun) {
        // If the category didn't exist in dry-run mode, simulate subcategory creation
        existingSub = null;
      } else {
        existingSub = await prisma.vendorSubcategory.findUnique({
          where: {
            categoryId_slug: {
              categoryId: categoryId,
              slug: sub.slug,
            },
          },
        });
      }

      if (existingSub) {
        subcategoriesSkipped++;
        if (!quiet) {
          console.log(
            `  [Subcategory] PRESERVED: "${existingSub.name}" (slug: "${existingSub.slug}", active: ${existingSub.isActive})`
          );
        }
      } else {
        subcategoriesCreated++;
        if (isDryRun) {
          if (!quiet) {
            console.log(
              `  [Subcategory] WOULD CREATE: "${sub.name}" (slug: "${sub.slug}", under category "${cat.slug}")`
            );
          }
        } else {
          const createdSub = await prisma.vendorSubcategory.create({
            data: {
              categoryId: categoryId,
              slug: sub.slug,
              name: sub.name,
              nameHindi: sub.nameHindi,
              description: sub.description,
              sortOrder: sub.sortOrder,
              isActive: true,
            },
          });
          if (!quiet) {
            console.log(
              `  [Subcategory] CREATED: "${createdSub.name}" (slug: "${createdSub.slug}", id: "${createdSub.id}")`
            );
          }
        }
      }
    }
  }

  if (!quiet) {
    console.log("\n--- Seeder Summary ---");
    console.log(`Categories:     ${categoriesCreated} ${isDryRun ? "would create" : "created"}, ${categoriesSkipped} preserved`);
    console.log(`Subcategories:  ${subcategoriesCreated} ${isDryRun ? "would create" : "created"}, ${subcategoriesSkipped} preserved`);
  }

  return {
    categoriesCreated,
    categoriesSkipped,
    subcategoriesCreated,
    subcategoriesSkipped,
    isDryRun,
  };
}

/**
 * Safe backfill function for existing VendorApplication and EmpanelmentTender records.
 *
 * Safety rules:
 * - Matches legacy `category` string exactly against canonical `VendorCategory.name`.
 * - Populates `categoryId` ONLY when it is currently null.
 * - Never overwrites an existing non-null `categoryId`.
 * - Preserves existing legacy `category` strings completely untouched.
 * - Preserves unmatched, empty, or null category values without alteration.
 * - Uses parameterized queries or safe Prisma updates.
 * - Reports already linked, matched, unmatched, and unclassified counts.
 */
export async function backfillVendorCategoryLinks(
  prisma: any,
  options: SeedOptions = {}
): Promise<BackfillResult> {
  const isApply = Boolean(options.apply);
  const isDryRun = !isApply;
  const quiet = Boolean(options.quiet);

  if (!quiet) {
    console.log("\n--- [Phase 2C.3] Safe Relational Category Backfill ---");
    console.log(`Execution Mode: ${isDryRun ? "DRY-RUN (Simulating backfill, 0 writes)" : "APPLY (Executing backfill updates)"}`);
  }

  // Retrieve canonical categories to build lookup map
  const dbCategories = await prisma.vendorCategory.findMany({
    select: { id: true, name: true, slug: true },
  });

  const categoryByName = new Map<string, { id: string; name: string }>();
  for (const cat of dbCategories) {
    categoryByName.set(cat.name.trim().toLowerCase(), { id: cat.id, name: cat.name });
  }

  // 1. BACKFILL VENDOR APPLICATIONS
  const totalApps = await prisma.vendorApplication.count();
  const alreadyLinkedApps = await prisma.vendorApplication.count({
    where: { categoryId: { not: null } },
  });

  const unlinkedApps = await prisma.vendorApplication.findMany({
    where: { categoryId: null },
    select: { id: true, trackingId: true, category: true },
  });

  let matchedAppsCount = 0;
  let unmatchedAppsCount = 0;
  let nullOrEmptyAppsCount = 0;

  // Group applications needing update by target categoryId
  const appUpdatesByCategory = new Map<string, string[]>(); // categoryId -> [appIds]

  for (const app of unlinkedApps) {
    const rawCategory = app.category ? app.category.trim() : "";
    if (!rawCategory) {
      nullOrEmptyAppsCount++;
      continue;
    }

    const matchedCat = categoryByName.get(rawCategory.toLowerCase());
    if (matchedCat) {
      matchedAppsCount++;
      const currentList = appUpdatesByCategory.get(matchedCat.id) || [];
      currentList.push(app.id);
      appUpdatesByCategory.set(matchedCat.id, currentList);
    } else {
      unmatchedAppsCount++;
      if (!quiet) {
        console.log(`[Application] UNMATCHED: trackingId=${app.trackingId}, category="${app.category}" (preserved untouched)`);
      }
    }
  }

  if (isApply && appUpdatesByCategory.size > 0) {
    for (const [targetCatId, appIds] of appUpdatesByCategory.entries()) {
      await prisma.vendorApplication.updateMany({
        where: {
          id: { in: appIds },
          categoryId: null, // Double check null guard
        },
        data: {
          categoryId: targetCatId,
        },
      });
    }
  }

  // 2. BACKFILL EMPANELMENT TENDERS
  const totalTenders = await prisma.empanelmentTender.count();
  const alreadyLinkedTenders = await prisma.empanelmentTender.count({
    where: { categoryId: { not: null } },
  });

  const unlinkedTenders = await prisma.empanelmentTender.findMany({
    where: { categoryId: null },
    select: { id: true, tenderNo: true, category: true },
  });

  let matchedTendersCount = 0;
  let unmatchedTendersCount = 0;
  let nullOrEmptyTendersCount = 0;

  const tenderUpdatesByCategory = new Map<string, string[]>(); // categoryId -> [tenderIds]

  for (const tender of unlinkedTenders) {
    const rawCategory = tender.category ? tender.category.trim() : "";
    if (!rawCategory) {
      nullOrEmptyTendersCount++;
      continue;
    }

    const matchedCat = categoryByName.get(rawCategory.toLowerCase());
    if (matchedCat) {
      matchedTendersCount++;
      const currentList = tenderUpdatesByCategory.get(matchedCat.id) || [];
      currentList.push(tender.id);
      tenderUpdatesByCategory.set(matchedCat.id, currentList);
    } else {
      unmatchedTendersCount++;
      if (!quiet) {
        console.log(`[Tender] UNMATCHED: tenderNo=${tender.tenderNo}, category="${tender.category}" (preserved untouched)`);
      }
    }
  }

  if (isApply && tenderUpdatesByCategory.size > 0) {
    for (const [targetCatId, tenderIds] of tenderUpdatesByCategory.entries()) {
      await prisma.empanelmentTender.updateMany({
        where: {
          id: { in: tenderIds },
          categoryId: null, // Double check null guard
        },
        data: {
          categoryId: targetCatId,
        },
      });
    }
  }

  if (!quiet) {
    console.log("\n--- Application Backfill Summary ---");
    console.log(`Total Applications:      ${totalApps}`);
    console.log(`Already Linked:          ${alreadyLinkedApps}`);
    console.log(`Matched (${isDryRun ? "Would Link" : "Linked"}):       ${matchedAppsCount}`);
    console.log(`Unmatched (Preserved):   ${unmatchedAppsCount}`);
    console.log(`Null/Empty (Preserved):  ${nullOrEmptyAppsCount}`);

    console.log("\n--- Tender Backfill Summary ---");
    console.log(`Total Tenders:           ${totalTenders}`);
    console.log(`Already Linked:          ${alreadyLinkedTenders}`);
    console.log(`Matched (${isDryRun ? "Would Link" : "Linked"}):       ${matchedTendersCount}`);
    console.log(`Unmatched (Preserved):   ${unmatchedTendersCount}`);
    console.log(`Null/Empty (Preserved):  ${nullOrEmptyTendersCount}`);
  }

  return {
    applications: {
      total: totalApps,
      alreadyLinked: alreadyLinkedApps,
      matched: matchedAppsCount,
      unmatched: unmatchedAppsCount,
      nullOrEmpty: nullOrEmptyAppsCount,
    },
    tenders: {
      total: totalTenders,
      alreadyLinked: alreadyLinkedTenders,
      matched: matchedTendersCount,
      unmatched: unmatchedTendersCount,
      nullOrEmpty: nullOrEmptyTendersCount,
    },
    isDryRun,
  };
}

/**
 * CLI Entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");
  const isDryRun = !isApply || args.includes("--dry-run");

  console.log("========================================================================");
  console.log("HiPRO Vendor Portal — Category Seeder & Safe Relational Backfill");
  if (isDryRun) {
    console.log("MODE: DRY-RUN (Default — Read-only simulation. No database writes.)");
    console.log("To execute actual database writes, provide the explicit --apply flag.");
  } else {
    console.log("MODE: LIVE EXECUTION (--apply flag provided. Writing to database.)");
  }
  console.log("========================================================================");

  if (isApply) {
    // Assert loopback safety before opening connection
    assertLocalDatabase();
  }

  const prisma = new PrismaClient();
  try {
    await seedVendorCategories(prisma, { apply: isApply });
    await backfillVendorCategoryLinks(prisma, { apply: isApply });
    console.log("\nAll operations finished successfully.");
  } catch (error: any) {
    console.error("\nExecution failed:", error?.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute when invoked directly from CLI
if (require.main === module || (process.argv[1] && process.argv[1].endsWith("seedVendorCategories.ts"))) {
  main();
}
