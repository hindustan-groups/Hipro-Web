import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Master Admin";

  if (adminEmail && adminPassword) {
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const admin = await prisma.adminUser.create({
        data: {
          email: adminEmail,
          password: hashPassword(adminPassword),
          name: adminName,
          role: "admin",
          permissions: "[]",
        },
      });
      console.log("Created admin user:", admin.email);
    } else {
      console.log(`Admin user (${adminEmail}) already exists.`);
    }
  } else {
    console.log("No ADMIN_EMAIL and ADMIN_PASSWORD provided in environment. Skipping default admin creation.");
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
