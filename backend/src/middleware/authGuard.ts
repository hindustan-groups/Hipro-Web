import { Request, Response, NextFunction } from "express";
import { getSessionUser } from "../lib/auth";

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getSessionUser(req);
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
  authGuard(req, res, () => {
    const user = (req as any).user;
    if (user?.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden - Admin access required" });
    }
    next();
  });
}
