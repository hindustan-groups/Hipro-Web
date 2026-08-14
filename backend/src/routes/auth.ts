import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { hashPassword, verifyPassword, createSession, logout, getSessionUser } from "../lib/auth";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    // Normal login flow
    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Create session (this sets the cookie)
    await createSession(user.id, res);

    return res.json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  try {
    await logout(req, res);
    return res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }
    return res.json({ 
      success: true, 
      data: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
