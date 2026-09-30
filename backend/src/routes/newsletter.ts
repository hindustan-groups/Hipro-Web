import { Router, Request, Response } from "express";
import { insertOne, findAll, readDB } from "../lib/db";
import { prisma } from "../lib/db";
import { validateEmail } from "../lib/validate";
import { authGuard } from "../middleware/authGuard";
import type { NewsletterSubscriber, ApiResponse } from "../lib/types";

const router = Router();

// POST /api/newsletter — subscribe (Public)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" } as ApiResponse);
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: "Invalid email address" } as ApiResponse);
    }

    const normalised = email.trim().toLowerCase();

    // Check duplicate
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalised }
    });

    if (existing) {
      if (existing.active) {
        return res.status(409).json({
          success: false,
          error: "This email is already subscribed",
        } as ApiResponse);
      } else {
        // Re-activate existing subscriber
        const updated = await prisma.newsletterSubscriber.update({
          where: { email: normalised },
          data: { active: true }
        });
        return res.json({
          success: true,
          message: "Successfully subscribed to our newsletter!",
          data: updated,
        } as any);
      }
    }

    const doc = await insertOne<NewsletterSubscriber>("newsletter", {
      email: normalised,
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Successfully subscribed to our newsletter!",
      data: doc,
    } as any);

  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// GET /api/newsletter — get all subscribers (Protected)
router.get("/", authGuard, async (req: Request, res: Response) => {
  try {
    const subscribers = await findAll<NewsletterSubscriber>("newsletter");
    const active = subscribers.filter((s) => s.active !== false);
    return res.json({
      success: true,
      data: { subscribers: active, total: active.length },
    } as ApiResponse);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/newsletter/:id — delete subscriber by ID (Protected)
router.delete("/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: "ID required" } as ApiResponse);

    const { deleteOne } = await import("../lib/db");
    const ok = await deleteOne("newsletter", id as string);
    if (!ok) {
      return res.status(404).json({ success: false, error: "Subscriber not found" } as ApiResponse);
    }

    return res.json({ success: true, message: "Subscriber deleted successfully" } as ApiResponse);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/newsletter — unsubscribe (Public or Protected with body { id } or { email })
router.delete("/", async (req: Request, res: Response) => {
  try {
    const { email, id } = req.body;
    if (id) {
      const { deleteOne } = await import("../lib/db");
      const ok = await deleteOne("newsletter", id as string);
      if (!ok) {
        return res.status(404).json({ success: false, error: "Subscriber not found" } as ApiResponse);
      }
      return res.json({ success: true, message: "Subscriber deleted successfully" } as ApiResponse);
    }

    if (!email) return res.status(400).json({ success: false, error: "Email or ID required" } as ApiResponse);

    const normalised = email.trim().toLowerCase();
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalised }
    });

    if (!subscriber) {
      return res.status(404).json({ success: false, error: "Email not found" } as ApiResponse);
    }

    await prisma.newsletterSubscriber.update({
      where: { email: normalised },
      data: { active: false }
    });

    return res.json({ success: true, message: "Unsubscribed successfully" } as ApiResponse);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;

