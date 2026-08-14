import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne, deleteOne } from "../lib/db";
import { validateRequired } from "../lib/validate";
import { authGuard } from "../middleware/authGuard";
import { getSessionUser } from "../lib/auth";
import type { Testimonial, ApiResponse } from "../lib/types";

const router = Router();

// GET /api/testimonials — get approved/all testimonials (Public/Protected dynamically)
router.get("/", async (req: Request, res: Response) => {
  try {
    const all = req.query.all === "true";
    
    if (all) {
      // Check auth if requesting unapproved ones
      const user = await getSessionUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" } as ApiResponse);
      }
    }

    let testimonials = await findAll<Testimonial>("testimonials");

    if (!all) {
      testimonials = testimonials.filter((t) => t.approved === true);
    }

    testimonials.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );

    return res.json({ success: true, data: testimonials } as ApiResponse<Testimonial[]>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/testimonials — submit testimonial (Public)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, role, text, rating, image } = req.body;

    const missing = validateRequired({ name, role, text });
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      } as ApiResponse);
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: "Rating must be between 1 and 5" } as ApiResponse);
    }

    const doc = await insertOne<Testimonial>("testimonials", {
      name: name.trim(),
      role: role.trim(),
      text: text.trim(),
      rating: Number(rating),
      image: image?.trim() || "",
      approved: req.body.approved ?? false,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for your review! It will appear after approval.",
      data: doc,
    } as ApiResponse<Testimonial>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/testimonials — approve/update (Protected)
router.patch("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const updated = await updateOne<Testimonial>("testimonials", id, updates);
    if (!updated) return res.status(404).json({ success: false, error: "Testimonial not found" } as ApiResponse);

    return res.json({ success: true, data: updated } as ApiResponse<Testimonial>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/testimonials (Protected)
router.delete("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const deleted = await deleteOne("testimonials", id);
    if (!deleted) return res.status(404).json({ success: false, error: "Testimonial not found" } as ApiResponse);

    return res.json({ success: true, message: "Testimonial deleted" } as ApiResponse);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
