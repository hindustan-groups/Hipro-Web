import { prisma } from "../lib/db";

async function main() {
  console.log("Checking and applying 2FA columns to AdminUser table...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "twoFactorTempSecret" TEXT;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "isTwoFactorEnabled" BOOLEAN DEFAULT false;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT;
  `);
  console.log("2FA columns added successfully or already exist!");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
