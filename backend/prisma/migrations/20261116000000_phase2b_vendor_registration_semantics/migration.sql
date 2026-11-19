-- Phase 2B: Vendor Registration Data Contract & Field Semantics Migration
-- Safely make category nullable for unclassified local vendors,
-- add dedicated turnoverBracket column, and add msmeDocUrl column.

-- AlterTable
ALTER TABLE "VendorApplication" ALTER COLUMN "category" DROP NOT NULL;
ALTER TABLE "VendorApplication" ADD COLUMN "turnoverBracket" TEXT;
ALTER TABLE "VendorApplication" ADD COLUMN "msmeDocUrl" TEXT;
