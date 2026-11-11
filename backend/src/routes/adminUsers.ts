import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth";
import { adminGuard } from "../middleware/authGuard";

const router = Router();

// Protect all admin-user routes
router.use(adminGuard);

// GET /api/admin-users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/admin-users
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, permissions } = req.body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();
    const cleanName = (name || "").trim();

    if (!normalizedEmail || !cleanPassword || !cleanName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await prisma.adminUser.findFirst({
      where: { email: { equals: normalizedEmail } }
    });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser = await prisma.adminUser.create({
      data: {
        email: normalizedEmail,
        password: hashPassword(cleanPassword),
        name: cleanName,
        role: role || "employee",
        permissions: JSON.stringify(permissions || []),
      }
    });

    return res.json({ success: true, user: { id: newUser.id } });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
});

// DELETE /api/admin-users/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (currentUser.id === id) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    // Inspect target user before deletion (SEC-B2B-04)
    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (targetUser.role === "admin") {
      return res.status(403).json({ error: "Cannot delete a Super Admin account through staff management" });
    }

    // Invalidate all active sessions for the deleted staff user (Implementation C)
    await prisma.adminSession.deleteMany({
      where: { userId: id as string },
    }).catch(() => {});

    await prisma.adminUser.delete({
      where: { id: id as string }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
