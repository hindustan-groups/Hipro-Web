import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";
import readline from "readline";

const prisma = new PrismaClient();

async function prompt(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let email = args[0] || process.env.ADMIN_EMAIL;
  let password = args[1] || process.env.ADMIN_PASSWORD;
  let name = args[2] || process.env.ADMIN_NAME;
  let role = args[3] || "admin";

  if (!email) {
    email = await prompt("Enter Admin Email: ");
  }

  if (!email || !email.includes("@")) {
    console.error("Error: A valid email address is required.");
    process.exit(1);
  }

  if (!password) {
    password = await prompt("Enter Admin Password: ");
  }

  if (!password || password.length < 6) {
    console.error("Error: Password must be at least 6 characters.");
    process.exit(1);
  }

  if (!name) {
    name = await prompt("Enter Admin Name (default: Admin): ");
    if (!name) name = "Admin";
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existing) {
    await prisma.adminUser.update({
      where: { email },
      data: {
        password: hashPassword(password),
        name,
        role,
      },
    });
    console.log(`Successfully updated admin user: ${email}`);
  } else {
    const user = await prisma.adminUser.create({
      data: {
        email,
        password: hashPassword(password),
        name,
        role,
        permissions: "[]",
      },
    });
    console.log(`Successfully created admin user: ${user.email} (${user.name}, role: ${user.role})`);
  }
}

main()
  .catch((err) => {
    console.error("Error managing admin user:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
