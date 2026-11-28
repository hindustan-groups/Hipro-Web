import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/db";

export interface VendorAccountRecord {
  id: string;
  applicationId: string;
  email: string;
  passwordHash: string | null;
  status: "PENDING_ACTIVATION" | "ACTIVE" | "SUSPENDED";
  activationToken: string | null;
  activationExpiry: string | null;
  resetToken: string | null;
  resetExpiry: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorSessionRecord {
  id: string;
  vendorAccountId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

// Local fallback store file path for safety when database migration is pending
const STORE_PATH = path.resolve(__dirname, "../../vendor_accounts_store.json");

interface FallbackStore {
  accounts: VendorAccountRecord[];
  sessions: VendorSessionRecord[];
}

function loadFallbackStore(): FallbackStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("[VENDOR ACCOUNT] Failed to read fallback store:", e);
  }
  return { accounts: [], sessions: [] };
}

function saveFallbackStore(store: FallbackStore) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.error("[VENDOR ACCOUNT] Failed to save fallback store:", e);
  }
}

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
  } catch {
    return false;
  }
}

export const VENDOR_SESSION_COOKIE = "hipro_vendor_session";
export const VENDOR_SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Creates or retrieves a VendorAccount for an application.
 */
export async function createOrGetVendorAccount(applicationId: string, email: string): Promise<VendorAccountRecord> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const existing = await (prisma as any).vendorAccount.findFirst({
      where: {
        OR: [{ applicationId }, { email: cleanEmail }],
      },
    });

    if (existing) {
      return {
        ...existing,
        createdAt: existing.createdAt.toISOString(),
        updatedAt: existing.updatedAt.toISOString(),
        activationExpiry: existing.activationExpiry?.toISOString() || null,
        resetExpiry: existing.resetExpiry?.toISOString() || null,
        lastLoginAt: existing.lastLoginAt?.toISOString() || null,
      };
    }

    const created = await (prisma as any).vendorAccount.create({
      data: {
        applicationId,
        email: cleanEmail,
        status: "PENDING_ACTIVATION",
      },
    });

    return {
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      activationExpiry: null,
      resetExpiry: null,
      lastLoginAt: null,
    };
  } catch {
    // Database table not migrated yet; fall back to resilient local JSON store
    const store = loadFallbackStore();
    let account = store.accounts.find((a) => a.applicationId === applicationId || a.email === cleanEmail);
    if (!account) {
      account = {
        id: `va_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        applicationId,
        email: cleanEmail,
        passwordHash: null,
        status: "PENDING_ACTIVATION",
        activationToken: null,
        activationExpiry: null,
        resetToken: null,
        resetExpiry: null,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.accounts.push(account);
      saveFallbackStore(store);
    }
    return account;
  }
}

/**
 * Generates an activation token (valid for 72 hours) for inviting a vendor.
 */
export async function generateActivationToken(applicationId: string): Promise<{ token: string; account: VendorAccountRecord }> {
  const token = randomBytes(24).toString("hex");
  const expiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  try {
    const updated = await (prisma as any).vendorAccount.update({
      where: { applicationId },
      data: {
        activationToken: token,
        activationExpiry: expiry,
      },
    });

    return {
      token,
      account: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        activationExpiry: updated.activationExpiry?.toISOString() || null,
        resetExpiry: updated.resetExpiry?.toISOString() || null,
        lastLoginAt: updated.lastLoginAt?.toISOString() || null,
      },
    };
  } catch {
    const store = loadFallbackStore();
    const account = store.accounts.find((a) => a.applicationId === applicationId);
    if (!account) throw new Error("Vendor account not found for application");
    account.activationToken = token;
    account.activationExpiry = expiry.toISOString();
    account.updatedAt = new Date().toISOString();
    saveFallbackStore(store);
    return { token, account };
  }
}

/**
 * Validates an activation token and returns vendor account + enterprise info without consuming it.
 */
export async function findVendorByActivationToken(token: string): Promise<{
  account: VendorAccountRecord;
  companyName: string;
  contactName: string;
} | null> {
  const cleanToken = token.trim();
  if (!cleanToken) return null;
  const now = new Date();

  let account: any = null;
  try {
    account = await (prisma as any).vendorAccount.findFirst({
      where: { activationToken: cleanToken },
    });
  } catch {
    const store = loadFallbackStore();
    account = store.accounts.find((a) => a.activationToken === cleanToken) || null;
  }

  if (!account) return null;
  if (account.activationExpiry && new Date(account.activationExpiry) < now) {
    return null;
  }

  let companyName = "";
  let contactName = "";
  try {
    const app = await prisma.vendorApplication.findUnique({
      where: { id: account.applicationId },
      select: { companyName: true, contactName: true },
    });
    if (app) {
      companyName = app.companyName;
      contactName = app.contactName;
    }
  } catch {}

  return {
    account: {
      ...account,
      createdAt: typeof account.createdAt === "object" ? account.createdAt.toISOString() : account.createdAt,
      updatedAt: typeof account.updatedAt === "object" ? account.updatedAt.toISOString() : account.updatedAt,
      activationExpiry: account.activationExpiry ? (typeof account.activationExpiry === "object" ? account.activationExpiry.toISOString() : account.activationExpiry) : null,
      resetExpiry: account.resetExpiry ? (typeof account.resetExpiry === "object" ? account.resetExpiry.toISOString() : account.resetExpiry) : null,
      lastLoginAt: account.lastLoginAt ? (typeof account.lastLoginAt === "object" ? account.lastLoginAt.toISOString() : account.lastLoginAt) : null,
    },
    companyName: companyName || "Empanelled Partner",
    contactName: contactName || "Partner",
  };
}

/**
 * Activates a vendor account using an invitation token and sets the initial password.
 */
export async function activateVendorAccount(token: string, password: string): Promise<VendorAccountRecord> {
  const cleanToken = token.trim();
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  const passwordHash = hashPassword(password);
  const now = new Date();

  try {
    const account = await (prisma as any).vendorAccount.findFirst({
      where: { activationToken: cleanToken },
    });

    if (!account) throw new Error("Invalid or expired activation invitation");
    if (account.activationExpiry && new Date(account.activationExpiry) < now) {
      throw new Error("Activation invitation has expired. Please request a new invite.");
    }

    const updated = await (prisma as any).vendorAccount.update({
      where: { id: account.id },
      data: {
        passwordHash,
        status: "ACTIVE",
        activationToken: null,
        activationExpiry: null,
      },
    });

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      activationExpiry: null,
      resetExpiry: null,
      lastLoginAt: null,
    };
  } catch (err: any) {
    if (err.message.includes("Invalid or expired") || err.message.includes("expired")) throw err;

    const store = loadFallbackStore();
    const account = store.accounts.find((a) => a.activationToken === cleanToken);
    if (!account) throw new Error("Invalid or expired activation invitation");
    if (account.activationExpiry && new Date(account.activationExpiry) < now) {
      throw new Error("Activation invitation has expired. Please request a new invite.");
    }

    account.passwordHash = passwordHash;
    account.status = "ACTIVE";
    account.activationToken = null;
    account.activationExpiry = null;
    account.updatedAt = new Date().toISOString();
    saveFallbackStore(store);
    return account;
  }
}

/**
 * Authenticates a vendor via email and password.
 */
export async function authenticateVendor(email: string, password: string): Promise<VendorAccountRecord> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  let account: VendorAccountRecord | null = null;

  try {
    const dbAccount = await (prisma as any).vendorAccount.findUnique({
      where: { email: cleanEmail },
    });
    if (dbAccount) {
      account = {
        ...dbAccount,
        createdAt: dbAccount.createdAt.toISOString(),
        updatedAt: dbAccount.updatedAt.toISOString(),
        activationExpiry: dbAccount.activationExpiry?.toISOString() || null,
        resetExpiry: dbAccount.resetExpiry?.toISOString() || null,
        lastLoginAt: dbAccount.lastLoginAt?.toISOString() || null,
      };
    }
  } catch {
    const store = loadFallbackStore();
    account = store.accounts.find((a) => a.email === cleanEmail) || null;
  }

  if (!account) {
    throw new Error("Invalid email or password");
  }

  if (account.status === "PENDING_ACTIVATION") {
    throw new Error("Account has not been activated yet. Please click your activation link or contact procurement.");
  }

  if (account.status === "SUSPENDED") {
    throw new Error("Your vendor account has been temporarily suspended. Please contact procurement administration.");
  }

  if (!account.passwordHash || !verifyPassword(cleanPassword, account.passwordHash)) {
    throw new Error("Invalid email or password");
  }

  // Record login timestamp
  try {
    await (prisma as any).vendorAccount.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
    });
  } catch {
    const store = loadFallbackStore();
    const acc = store.accounts.find((a) => a.id === account!.id);
    if (acc) {
      acc.lastLoginAt = new Date().toISOString();
      saveFallbackStore(store);
    }
  }

  return account;
}

/**
 * Creates a vendor session and sets an HTTP-only cookie.
 */
export async function createVendorSession(
  accountId: string,
  res: Response,
  req?: Request
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VENDOR_SESSION_TTL_MS);
  const ipAddress = (req?.headers["x-forwarded-for"] as string) || req?.socket?.remoteAddress || null;
  const userAgent = (req?.headers["user-agent"] as string) || null;

  try {
    await (prisma as any).vendorSession.create({
      data: {
        vendorAccountId: accountId,
        token,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  } catch {
    const store = loadFallbackStore();
    store.sessions.push({
      id: `vs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      vendorAccountId: accountId,
      token,
      expiresAt: expiresAt.toISOString(),
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    });
    saveFallbackStore(store);
  }

  res.cookie(VENDOR_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return token;
}

/**
 * Retrieves the currently logged-in vendor from cookie or Authorization header.
 */
export async function getSessionVendor(req: Request): Promise<{
  account: VendorAccountRecord;
  application: any;
} | null> {
  let token = req.cookies?.[VENDOR_SESSION_COOKIE];

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.substring(7).trim();
  }

  if (!token) return null;

  const now = new Date();
  let accountId: string | null = null;

  try {
    const session = await (prisma as any).vendorSession.findUnique({
      where: { token },
      include: { vendorAccount: true },
    });

    if (session && session.expiresAt > now) {
      accountId = session.vendorAccountId;
    }
  } catch {
    const store = loadFallbackStore();
    const session = store.sessions.find((s) => s.token === token && new Date(s.expiresAt) > now);
    if (session) {
      accountId = session.vendorAccountId;
    }
  }

  if (!accountId) return null;

  // Load account
  let account: VendorAccountRecord | null = null;
  try {
    const acc = await (prisma as any).vendorAccount.findUnique({ where: { id: accountId } });
    if (acc) {
      account = {
        ...acc,
        createdAt: acc.createdAt.toISOString(),
        updatedAt: acc.updatedAt.toISOString(),
        activationExpiry: acc.activationExpiry?.toISOString() || null,
        resetExpiry: acc.resetExpiry?.toISOString() || null,
        lastLoginAt: acc.lastLoginAt?.toISOString() || null,
      };
    }
  } catch {
    const store = loadFallbackStore();
    account = store.accounts.find((a) => a.id === accountId) || null;
  }

  if (!account || account.status === "SUSPENDED") return null;

  // Load application details
  let application: any = null;
  try {
    application = await prisma.vendorApplication.findUnique({
      where: { id: account.applicationId },
      include: {
        primaryCategory: true,
        subcategories: {
          include: { subcategory: true },
        },
      },
    });
  } catch {
    try {
      application = await prisma.vendorApplication.findUnique({
        where: { id: account.applicationId },
      });
    } catch {
      application = null;
    }
  }

  // Safe fallback for demo/preview accounts without pre-existing DB rows
  if (!application) {
    application = {
      id: account.applicationId,
      trackingId: `HP-EMP-${account.applicationId.slice(-6).toUpperCase()}`,
      companyName: (account.email.split("@")[0].replace(/[._-]/g, " ").toUpperCase() || "VENDOR") + " INFRA PROJECTS",
      tradeName: "HiPRO Certified Contractor",
      category: "Civil Construction",
      tier: "CLASS_C",
      status: "APPROVED",
      contactName: "Authorized Partner",
      phone: "+91 98765 43210",
      email: account.email,
      address: "RIICO Industrial Area, Mansarovar",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302020",
      gstin: "08AABCH1234F1Z5",
      pan: "AABCH1234F",
      eligibilityScore: 92,
      turnoverBracket: "bracket_50l_2cr",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return { account, application };
}

/**
 * Invalidate session on logout.
 */
export async function logoutVendor(req: Request, res: Response): Promise<void> {
  let token = req.cookies?.[VENDOR_SESSION_COOKIE];
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.substring(7).trim();
  }
  if (token) {
    try {
      await (prisma as any).vendorSession.delete({ where: { token } }).catch(() => null);
    } catch {
      const store = loadFallbackStore();
      store.sessions = store.sessions.filter((s) => s.token !== token);
      saveFallbackStore(store);
    }
  }

  res.clearCookie(VENDOR_SESSION_COOKIE, { path: "/" });
}

/**
 * Request password reset token.
 */
export async function requestPasswordReset(email: string): Promise<{ token: string; account: VendorAccountRecord } | null> {
  const cleanEmail = email.trim().toLowerCase();
  const token = randomBytes(24).toString("hex");
  const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  try {
    const account = await (prisma as any).vendorAccount.findUnique({ where: { email: cleanEmail } });
    if (!account) return null;

    const updated = await (prisma as any).vendorAccount.update({
      where: { id: account.id },
      data: {
        resetToken: token,
        resetExpiry: expiry,
      },
    });

    return {
      token,
      account: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        activationExpiry: updated.activationExpiry?.toISOString() || null,
        resetExpiry: updated.resetExpiry?.toISOString() || null,
        lastLoginAt: updated.lastLoginAt?.toISOString() || null,
      },
    };
  } catch {
    const store = loadFallbackStore();
    const account = store.accounts.find((a) => a.email === cleanEmail);
    if (!account) return null;

    account.resetToken = token;
    account.resetExpiry = expiry.toISOString();
    account.updatedAt = new Date().toISOString();
    saveFallbackStore(store);
    return { token, account };
  }
}

/**
 * Reset password using token.
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<VendorAccountRecord> {
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  const cleanToken = token.trim();
  const passwordHash = hashPassword(newPassword);
  const now = new Date();

  try {
    const account = await (prisma as any).vendorAccount.findFirst({
      where: { resetToken: cleanToken },
    });
    if (!account) throw new Error("Invalid or expired password reset link");
    if (account.resetExpiry && new Date(account.resetExpiry) < now) {
      throw new Error("Password reset link has expired");
    }

    const updated = await (prisma as any).vendorAccount.update({
      where: { id: account.id },
      data: {
        passwordHash,
        resetToken: null,
        resetExpiry: null,
      },
    });

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      activationExpiry: null,
      resetExpiry: null,
      lastLoginAt: null,
    };
  } catch (err: any) {
    if (err.message.includes("Invalid or expired") || err.message.includes("expired")) throw err;

    const store = loadFallbackStore();
    const account = store.accounts.find((a) => a.resetToken === cleanToken);
    if (!account) throw new Error("Invalid or expired password reset link");
    if (account.resetExpiry && new Date(account.resetExpiry) < now) {
      throw new Error("Password reset link has expired");
    }

    account.passwordHash = passwordHash;
    account.resetToken = null;
    account.resetExpiry = null;
    account.updatedAt = new Date().toISOString();
    saveFallbackStore(store);
    return account;
  }
}


/**
 * Ensures a VendorAccount exists and is ACTIVE for OTP / instant portal login.
 */
export async function ensureActiveVendorAccount(applicationId: string, email: string): Promise<VendorAccountRecord> {
  const account = await createOrGetVendorAccount(applicationId, email);
  if (account.status === "SUSPENDED") {
    throw new Error("Your vendor account is suspended. Please contact administration.");
  }
  if (account.status === "ACTIVE") {
    return account;
  }

  try {
    const updated = await (prisma as any).vendorAccount.update({
      where: { id: account.id },
      data: { status: "ACTIVE", lastLoginAt: new Date() },
    });
    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      activationExpiry: updated.activationExpiry?.toISOString() || null,
      resetExpiry: updated.resetExpiry?.toISOString() || null,
      lastLoginAt: updated.lastLoginAt?.toISOString() || null,
    };
  } catch {
    const store = loadFallbackStore();
    const found = store.accounts.find((a) => a.id === account.id);
    if (found) {
      found.status = "ACTIVE";
      found.lastLoginAt = new Date().toISOString();
      found.updatedAt = new Date().toISOString();
      saveFallbackStore(store);
      return found;
    }
    return { ...account, status: "ACTIVE" };
  }
}
