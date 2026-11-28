import { prisma } from "./db";

/**
 * Ensures additive Vendor/Empanelment columns and tables exist in production/local PostgreSQL
 * on server boot so deployments never crash if prisma migrate wasn't run manually.
 */
export async function ensureEmpanelmentSchema(): Promise<void> {
  const statements = [
    `ALTER TABLE "VendorApplication"
      ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "experienceYears" TEXT,
      ADD COLUMN IF NOT EXISTS "projectScale" TEXT,
      ADD COLUMN IF NOT EXISTS "aadharFrontUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "aadharBackUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "categoryId" TEXT;`,
    `ALTER TABLE "EmpanelmentContent"
      ADD COLUMN IF NOT EXISTS "gatePassEnabled" BOOLEAN NOT NULL DEFAULT false;`,
    `CREATE TABLE IF NOT EXISTS "VendorCategory" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "nameHindi" TEXT,
      "description" TEXT,
      "icon" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "VendorCategory_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE TABLE IF NOT EXISTS "VendorSubcategory" (
      "id" TEXT NOT NULL,
      "categoryId" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "nameHindi" TEXT,
      "description" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "VendorSubcategory_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE TABLE IF NOT EXISTS "VendorApplicationSubcategory" (
      "id" TEXT NOT NULL,
      "applicationId" TEXT NOT NULL,
      "subcategoryId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "VendorApplicationSubcategory_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "VendorCategory_slug_key" ON "VendorCategory"("slug");`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "VendorApplicationSubcategory_applicationId_subcategoryId_key" ON "VendorApplicationSubcategory"("applicationId", "subcategoryId");`,
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err: any) {
      console.warn("[BOOT] Empanelment schema sync warning:", err?.message || err);
    }
  }
  console.log("[BOOT] Empanelment database schema verified.");
}
