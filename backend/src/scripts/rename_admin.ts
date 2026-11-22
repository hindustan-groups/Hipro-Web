import { prisma } from "../lib/db";

async function main() {
  const result = await prisma.adminUser.updateMany({
    where: { email: "admin@hindustanprojects.in" },
    data: { name: "Master Admin" },
  });
  console.log(`✔ SUCCESS: Updated ${result.count} admin user(s) to 'Master Admin'`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
