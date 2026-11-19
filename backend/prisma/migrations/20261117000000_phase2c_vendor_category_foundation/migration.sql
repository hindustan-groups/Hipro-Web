-- Phase 2C.2: Additive Relational Vendor Categories & Subcategories Migration
-- Creates VendorCategory, VendorSubcategory, and VendorApplicationSubcategory tables.
-- Extends VendorApplication and EmpanelmentTender with nullable categoryId foreign keys.
-- All operations are strictly additive and non-destructive.

-- AlterTable
ALTER TABLE "VendorApplication" ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "EmpanelmentTender" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "VendorCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHindi" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorSubcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHindi" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorApplicationSubcategory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorApplicationSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorCategory_slug_key" ON "VendorCategory"("slug");

-- CreateIndex
CREATE INDEX "VendorCategory_isActive_idx" ON "VendorCategory"("isActive");

-- CreateIndex
CREATE INDEX "VendorCategory_sortOrder_idx" ON "VendorCategory"("sortOrder");

-- CreateIndex
CREATE INDEX "VendorSubcategory_categoryId_idx" ON "VendorSubcategory"("categoryId");

-- CreateIndex
CREATE INDEX "VendorSubcategory_isActive_idx" ON "VendorSubcategory"("isActive");

-- CreateIndex
CREATE INDEX "VendorSubcategory_sortOrder_idx" ON "VendorSubcategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubcategory_categoryId_slug_key" ON "VendorSubcategory"("categoryId", "slug");

-- CreateIndex
CREATE INDEX "VendorApplicationSubcategory_applicationId_idx" ON "VendorApplicationSubcategory"("applicationId");

-- CreateIndex
CREATE INDEX "VendorApplicationSubcategory_subcategoryId_idx" ON "VendorApplicationSubcategory"("subcategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorApplicationSubcategory_applicationId_subcategoryId_key" ON "VendorApplicationSubcategory"("applicationId", "subcategoryId");

-- CreateIndex
CREATE INDEX "VendorApplication_categoryId_idx" ON "VendorApplication"("categoryId");

-- CreateIndex
CREATE INDEX "EmpanelmentTender_categoryId_idx" ON "EmpanelmentTender"("categoryId");

-- AddForeignKey
ALTER TABLE "VendorSubcategory" ADD CONSTRAINT "VendorSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VendorCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorApplicationSubcategory" ADD CONSTRAINT "VendorApplicationSubcategory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "VendorApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorApplicationSubcategory" ADD CONSTRAINT "VendorApplicationSubcategory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "VendorSubcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorApplication" ADD CONSTRAINT "VendorApplication_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VendorCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentTender" ADD CONSTRAINT "EmpanelmentTender_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VendorCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
