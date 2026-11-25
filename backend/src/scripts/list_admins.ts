import { prisma } from "../lib/db";

async function main() {
  const users = await prisma.adminUser.findMany({
    select: { email: true, name: true, role: true, isTwoFactorEnabled: true }
  });
  console.log("=== LOCAL ADMIN USERS ===");
  console.log(JSON.stringify(users, null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
});
