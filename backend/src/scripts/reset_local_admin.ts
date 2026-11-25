import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth";

async function main() {
  const newPassword = "Admin@123";
  const hashedPassword = hashPassword(newPassword);

  const updated = await prisma.adminUser.upsert({
    where: { email: "admin@hindustanprojects.in" },
    update: {
      password: hashedPassword,
      name: "HiPRO Master Admin",
      role: "admin",
      permissions: "[]",
      isTwoFactorEnabled: false, // Ensure fresh state so user can setup 2FA
      twoFactorSecret: null,
      twoFactorTempSecret: null,
      twoFactorBackupCodes: null,
    },
    create: {
      email: "admin@hindustanprojects.in",
      password: hashedPassword,
      name: "HiPRO Master Admin",
      role: "admin",
      permissions: "[]",
      isTwoFactorEnabled: false,
    },
  });

  console.log(`✔ SUCCESS: Admin user set up cleanly:`);
  console.log(`   Email: ${updated.email}`);
  console.log(`   Password: ${newPassword}`);
  console.log(`   2FA Enabled: ${updated.isTwoFactorEnabled}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
