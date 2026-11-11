import { Request, Response, NextFunction } from "express";
import { getSessionUser } from "../lib/auth";

/**
 * Safely parses and normalizes user permissions into a clean string array.
 * Fails closed (returns empty array) on null, undefined, malformed JSON,
 * non-array JSON, or arrays containing invalid/non-string values.
 */
export function getUserPermissions(user: any): string[] {
  if (!user || !user.permissions) return [];

  // Case 1: Already an array
  if (Array.isArray(user.permissions)) {
    return user.permissions
      .filter((p: any) => typeof p === "string" && p.trim().length > 0)
      .map((p: string) => p.trim());
  }

  // Case 2: Stored as JSON string
  if (typeof user.permissions === "string") {
    const raw = user.permissions.trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((p: any) => typeof p === "string" && p.trim().length > 0)
          .map((p: string) => p.trim());
      }
      return [];
    } catch {
      // Malformed JSON fails closed
      return [];
    }
  }

  return [];
}

/**
 * Checks whether an authenticated user has the required permission(s).
 * - Role "admin" retains unrestricted Super Admin access (returns true).
 * - Role "employee" is checked strictly against their assigned permissions.
 * - Any unknown role, missing user, or empty requirement fails closed (returns false).
 * - Array of permissions evaluates with any-of semantics (at least one must match).
 */
export function hasPermission(user: any, requiredPermission: string | string[]): boolean {
  if (!user || typeof user !== "object") return false;

  // Super Admin bypass: full unrestricted authorization
  if (user.role === "admin") return true;

  // Least-privilege: employee role check
  if (user.role !== "employee") return false;

  const userPerms = getUserPermissions(user);
  if (userPerms.length === 0) return false;

  if (Array.isArray(requiredPermission)) {
    const validRequired = requiredPermission
      .filter((p) => typeof p === "string" && p.trim().length > 0)
      .map((p) => p.trim());
    if (validRequired.length === 0) return false;
    return validRequired.some((p) => userPerms.includes(p));
  }

  if (typeof requiredPermission === "string") {
    const cleanReq = requiredPermission.trim();
    if (!cleanReq) return false;
    return userPerms.includes(cleanReq);
  }

  return false;
}

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getSessionUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    
    // Attach user to req object
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
}

export function adminGuard(req: Request, res: Response, next: NextFunction) {
  return authGuard(req, res, () => {
    const user = (req as any).user;
    if (user?.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden - Admin access required" });
    }
    next();
  });
}

/**
 * Middleware factory enforcing granular role and permission checks.
 * Requires authenticated session; denies access with HTTP 403 Forbidden
 * if the user lacks the required permission(s).
 */
export function requirePermission(permission: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    return authGuard(req, res, () => {
      const user = (req as any).user;
      if (!hasPermission(user, permission)) {
        return res.status(403).json({
          success: false,
          error: "Forbidden — Insufficient permissions",
        });
      }
      next();
    });
  };
}

// Alias for semantic flexibility
export const permissionGuard = requirePermission;
