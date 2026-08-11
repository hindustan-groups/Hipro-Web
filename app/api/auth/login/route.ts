import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }

    // Check if any users exist, if not, create the master admin
    const userCount = await prisma.adminUser.count();
    
    if (userCount === 0) {
      if (email === "admin@hindustan.com" && password === "password123") {
        const newAdmin = await prisma.adminUser.create({
          data: {
            email: "admin@hindustan.com",
            password: hashPassword("password123"),
            name: "Master Admin",
            role: "admin",
            permissions: "[]", // Admin has access to everything by default
          },
        });
        await createSession(newAdmin.id);
        return NextResponse.json({ success: true, message: "Master Admin created and logged in" });
      } else {
        return NextResponse.json({ success: false, error: "No users exist. Use default master credentials." }, { status: 401 });
      }
    }

    // Normal login flow
    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Create session (this sets the cookie)
    await createSession(user.id);

    return NextResponse.json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
