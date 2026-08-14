import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne, deleteOne } from "../lib/db";
import { validateRequired } from "../lib/validate";
import { authGuard } from "../middleware/authGuard";
import type { Project, ApiResponse } from "../lib/types";

const router = Router();

// GET /api/projects — get all projects (Public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const featured = req.query.featured as string;

    let projects = await findAll<Project>("projects");

    if (category && category !== "All") {
      projects = projects.filter((p) =>
        p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (featured === "true") {
      projects = projects.filter((p) => p.featured === true);
    }

    projects.sort((a, b) => new Date(b.date).getFullYear() - new Date(a.date).getFullYear());

    return res.json({
      success: true,
      data: projects,
    } as ApiResponse<Project[]>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/projects — create project (Protected)
router.post("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { title, category, location, date, image, description } = req.body;

    const missing = validateRequired({ title, category, location, date, description });
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      } as ApiResponse);
    }

    const doc = await insertOne<Project>("projects", {
      title: title.trim(),
      category: category.trim(),
      location: location.trim(),
      date: date.trim(),
      image: image?.trim() || "",
      images: req.body.images || "",
      description: description.trim(),
      featured: req.body.featured ?? false,
      status: req.body.status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: doc,
    } as ApiResponse<Project>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/projects — update project (Protected)
router.patch("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id is required" } as ApiResponse);

    const updated = await updateOne<Project>("projects", id, updates);
    if (!updated) return res.status(404).json({ success: false, error: "Project not found" } as ApiResponse);

    return res.json({ success: true, data: updated } as ApiResponse<Project>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/projects — delete project (Protected)
router.delete("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id is required" } as ApiResponse);

    const deleted = await deleteOne("projects", id);
    if (!deleted) return res.status(404).json({ success: false, error: "Project not found" } as ApiResponse);

    return res.json({ success: true, message: "Project deleted" } as ApiResponse);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
