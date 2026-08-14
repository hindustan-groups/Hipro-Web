import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { Request, Response } from "express";
import { prisma } from "./db";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, key] = hash.split(":");
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch (e) {
    return false;
  }
}

export async function createSession(userId: string, res: Response) {
  // Session expires in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await prisma.adminSession.create({
    data: {
      userId,
      expiresAt,
    },
  });

  res.cookie("admin_session", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSessionUser(req: Request) {
  const sessionId = req.cookies?.admin_session;
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId },
  });

  return user;
}

export async function logout(req: Request, res: Response) {
  const sessionId = req.cookies?.admin_session;
  if (sessionId) {
    await prisma.adminSession.deleteMany({
      where: { id: sessionId },
    });
  }
  res.clearCookie("admin_session");
}
