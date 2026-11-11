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

export const SLIDING_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days sliding window
export const ABSOLUTE_MAX_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days absolute maximum lifetime
export const RENEWAL_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 1 day renewal throttle threshold

/**
 * Safely derives session creation timestamp from Prisma CUID v1 format.
 * In Prisma CUID v1 ('c' + 8 base-36 timestamp chars), the exact creation millisecond is encoded.
 * Returns null if the session ID is not a valid CUID v1 with a verifiable epoch timestamp.
 */
export function getSessionCreatedAt(session: { id: string; expiresAt: Date }): Date | null {
  if (session.id && typeof session.id === "string" && session.id.startsWith("c") && session.id.length >= 9) {
    const timestampBase36 = session.id.slice(1, 9);
    const parsedTimestamp = parseInt(timestampBase36, 36);
    // Reasonable epoch bounds check: between 2020-01-01 and 2050-01-01
    if (!isNaN(parsedTimestamp) && parsedTimestamp > 1577836800000 && parsedTimestamp < 2524608000000) {
      return new Date(parsedTimestamp);
    }
  }
  return null;
}

export async function createSession(userId: string, res: Response) {
  const expiresAt = new Date(Date.now() + SLIDING_SESSION_TTL_MS);

  const session = await prisma.adminSession.create({
    data: { userId, expiresAt },
  });

  res.cookie("admin_session", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return session;
}

export async function getSessionUser(req: Request, res?: Response) {
  const sessionId = req.cookies?.admin_session;
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) return null;

  const now = Date.now();

  // 1. Expired session check: Do not allow expired sessions to become valid again
  if (session.expiresAt.getTime() <= now) {
    // Asynchronously delete expired session record
    prisma.adminSession.deleteMany({ where: { id: sessionId } }).catch(() => {});
    if (res && !res.headersSent) {
      res.clearCookie("admin_session", { path: "/" });
    }
    return null;
  }

  // 2. Absolute maximum lifetime check: Prevent indefinite sliding extension (SEC-01)
  const createdAt = getSessionCreatedAt(session);
  if (!createdAt) {
    // Non-CUID or malformed session ID cannot be safely validated against absolute lifetime ceiling:
    // Fail closed to prevent unlimited sliding renewals
    await prisma.adminSession.deleteMany({ where: { id: sessionId } }).catch(() => {});
    if (res && !res.headersSent) {
      res.clearCookie("admin_session", { path: "/" });
    }
    return null;
  }

  const absoluteExpiryTime = createdAt.getTime() + ABSOLUTE_MAX_SESSION_TTL_MS;
  if (now >= absoluteExpiryTime) {
    // Reached absolute lifetime limit: delete and clear
    await prisma.adminSession.deleteMany({ where: { id: sessionId } }).catch(() => {});
    if (res && !res.headersSent) {
      res.clearCookie("admin_session", { path: "/" });
    }
    return null;
  }

  // 3. User lookup
  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    await prisma.adminSession.deleteMany({ where: { id: sessionId } }).catch(() => {});
    if (res && !res.headersSent) {
      res.clearCookie("admin_session", { path: "/" });
    }
    return null;
  }

  // 4. Sliding Renewal with Throttle Check & Atomic Conditional Update (SEC-02)
  // Only slide if session remaining time is less than (SLIDING_SESSION_TTL_MS - RENEWAL_THRESHOLD_MS)
  const remainingMs = session.expiresAt.getTime() - now;
  const isEligibleForRenewal = remainingMs < (SLIDING_SESSION_TTL_MS - RENEWAL_THRESHOLD_MS);

  if (isEligibleForRenewal) {
    const proposedExpiryTime = now + SLIDING_SESSION_TTL_MS;
    // Cap proposed expiry at absolute maximum lifetime
    const newExpiresAt = new Date(Math.min(proposedExpiryTime, absoluteExpiryTime));

    // Only update if it pushes expiration forward
    if (newExpiresAt.getTime() > session.expiresAt.getTime()) {
      try {
        // Atomic conditional update (SEC-02): matches both ID and current expiresAt.
        // If concurrent requests attempt renewal simultaneously, exactly one succeeds (count === 1),
        // and subsequent requests update 0 rows without conflict or redundant writes.
        const updateResult = await prisma.adminSession.updateMany({
          where: {
            id: sessionId,
            expiresAt: session.expiresAt,
          },
          data: {
            expiresAt: newExpiresAt,
          },
        });

        if (updateResult.count > 0) {
          // Winning request: issue refreshed cookie
          if (res && !res.headersSent) {
            res.cookie("admin_session", sessionId, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              expires: newExpiresAt,
              sameSite: "lax",
              path: "/",
            });
          }
        } else {
          // Losing request (zero-row update):
          // A concurrent request modified or deleted the session.
          // Re-read session to verify it was renewed and not concurrently logged out or expired.
          const latestSession = await prisma.adminSession.findUnique({
            where: { id: sessionId },
          });

          // 1. Confirm session still exists (not concurrently logged out/deleted)
          if (!latestSession) {
            if (res && !res.headersSent) {
              res.clearCookie("admin_session", { path: "/" });
            }
            return null;
          }

          // 2. Confirm expiresAt is in the future
          if (latestSession.expiresAt.getTime() <= now) {
            await prisma.adminSession.deleteMany({ where: { id: sessionId } }).catch(() => {});
            if (res && !res.headersSent) {
              res.clearCookie("admin_session", { path: "/" });
            }
            return null;
          }

          // 3. Revalidate CUID-derived creation time and 30-day absolute ceiling
          const latestCreatedAt = getSessionCreatedAt(latestSession);
          if (!latestCreatedAt || now >= latestCreatedAt.getTime() + ABSOLUTE_MAX_SESSION_TTL_MS) {
            await prisma.adminSession.deleteMany({ where: { id: sessionId } }).catch(() => {});
            if (res && !res.headersSent) {
              res.clearCookie("admin_session", { path: "/" });
            }
            return null;
          }

          // Do NOT issue refreshed cookie from the losing request (handled by winning request)
        }
      } catch (err) {
        // Safe logging without exposing session tokens or sensitive values
        console.error("[Session Renewal] Sliding renewal skipped or encountered conflict");
      }
    }
  }

  return user;
}

export async function logout(req: Request, res: Response) {
  const sessionId = req.cookies?.admin_session;
  if (sessionId) {
    await prisma.adminSession.deleteMany({
      where: { id: sessionId },
    }).catch(() => {});
  }
  res.clearCookie("admin_session", { path: "/" });
}
