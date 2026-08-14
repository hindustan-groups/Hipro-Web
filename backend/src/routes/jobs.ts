import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne, deleteOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { JobPosting, ApiResponse } from "../lib/types";

const router = Router();

// GET /api/jobs — Public
router.get("/", async (req: Request, res: Response) => {
  try {
    const items = await findAll<JobPosting>("jobs");
    const sorted = items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return res.json({ success: true, data: sorted } as ApiResponse<JobPosting[]>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/jobs — Protected
router.post("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { title, type, location, description, order } = req.body;

    if (!title || !type || !location) {
      return res.status(400).json({ success: false, error: "title, type and location required" } as ApiResponse);
    }

    const doc = await insertOne<JobPosting>("jobs", {
      title: title.trim(),
      type: type.trim(),
      location: location.trim(),
      description: description?.trim() || "",
      order: order ?? 99,
      active: true,
    });

    return res.status(201).json({ success: true, data: doc } as ApiResponse<JobPosting>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/jobs — Protected
router.patch("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const updated = await updateOne<JobPosting>("jobs", id, updates);
    if (!updated) return res.status(404).json({ success: false, error: "Job not found" } as ApiResponse);

    return res.json({ success: true, data: updated } as ApiResponse<JobPosting>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/jobs — Protected
router.delete("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const deleted = await deleteOne("jobs", id);
    if (!deleted) return res.status(404).json({ success: false, error: "Job not found" } as ApiResponse);

    return res.json({ success: true, message: "Job deleted" } as ApiResponse);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
