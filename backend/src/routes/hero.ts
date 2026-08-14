import { Router, Request, Response } from "express";
import { findAll, insertOne, updateOne, deleteOne } from "../lib/db";
import { validateRequired } from "../lib/validate";
import { authGuard } from "../middleware/authGuard";
import type { HeroSlide, ApiResponse } from "../lib/types";

const router = Router();

// GET /api/hero — Public
router.get("/", async (req: Request, res: Response) => {
  try {
    const slides = await findAll<HeroSlide>("hero");
    slides.sort((a, b) => (a.order || 0) - (b.order || 0));
    return res.json({
      success: true,
      data: slides,
    } as ApiResponse<HeroSlide[]>);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
});

// POST /api/hero — Protected
router.post("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { image, tagline, title, subtitle, order, active } = req.body;

    const missing = validateRequired({ image, tagline, title, subtitle });
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      } as ApiResponse);
    }

    const doc = await insertOne<HeroSlide>("hero", {
      image, tagline, title, subtitle,
      order: order || 0,
      active: active !== false,
    });

    return res.status(201).json({
      success: true,
      data: doc,
    } as ApiResponse<HeroSlide>);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
});

// PATCH /api/hero — Protected
router.patch("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id, ...updates } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "id is required",
      } as ApiResponse);
    }

    const updated = await updateOne<HeroSlide>("hero", id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Slide not found",
      } as ApiResponse);
    }

    return res.json({
      success: true,
      data: updated,
    } as ApiResponse<HeroSlide>);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
});

// DELETE /api/hero — Protected
router.delete("/", authGuard, async (req: Request, res: Response) => {
  try {
    const id = (req.query.id as string) || req.body.id;

    if (!id) {
      return res.status(400).json({ success: false, error: "id is required" } as ApiResponse);
    }

    const deleted = await deleteOne("hero", id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Slide not found" } as ApiResponse);
    }

    return res.json({ success: true } as ApiResponse);
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
