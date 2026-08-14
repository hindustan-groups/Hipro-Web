import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne, deleteOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { Guarantee, ApiResponse } from "../lib/types";

const router = Router();

// GET /api/guarantees — Public
router.get("/", async (req: Request, res: Response) => {
  try {
    const items = await findAll<Guarantee>("guarantees");
    const active = items
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return res.json({ success: true, data: active } as ApiResponse<Guarantee[]>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/guarantees — Protected
router.post("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { title, description, badge, bg, accent, image, hasShield, order } = req.body;

    if (!title || !description || !badge) {
      return res.status(400).json({ success: false, error: "title, description and badge required" } as ApiResponse);
    }

    const doc = await insertOne<Guarantee>("guarantees", {
      title: title.trim(),
      description: description.trim(),
      badge: badge.trim(),
      bg: bg?.trim() || "bg-black",
      accent: accent?.trim() || "text-white",
      hasShield: !!hasShield,
      image: image?.trim() || "",
      order: order ?? 99,
      active: true,
    });

    return res.status(201).json({ success: true, data: doc } as ApiResponse<Guarantee>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/guarantees — Protected
router.patch("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const updated = await updateOne<Guarantee>("guarantees", id, updates);
    if (!updated) return res.status(404).json({ success: false, error: "Guarantee not found" } as ApiResponse);

    return res.json({ success: true, data: updated } as ApiResponse<Guarantee>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/guarantees — Protected
router.delete("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const deleted = await deleteOne("guarantees", id);
    if (!deleted) return res.status(404).json({ success: false, error: "Guarantee not found" } as ApiResponse);

    return res.json({ success: true, message: "Guarantee deleted" } as ApiResponse);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
