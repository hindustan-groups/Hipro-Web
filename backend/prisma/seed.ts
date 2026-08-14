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

  // Check if admin user already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: "admin@hindustan.com" },
  });

  if (!existingAdmin) {
    const admin = await prisma.adminUser.create({
      data: {
        email: "admin@hindustan.com",
        password: hashPassword("password123"),
        name: "Master Admin",
        role: "admin",
        permissions: "[]",
      },
    });
    console.log("Created master admin:", admin.email);
  } else {
    console.log("Master admin already exists.");
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
