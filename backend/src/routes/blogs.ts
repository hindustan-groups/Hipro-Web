import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne, deleteOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { BlogPost, ApiResponse } from "../lib/types";

const router = Router();

// GET /api/blogs
router.get("/", async (req: Request, res: Response) => {
  try {
    const blogs = await findAll<BlogPost>("blogs");
    const active = blogs
      .filter((b) => b.active !== false)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.json({ success: true, data: active } as ApiResponse<BlogPost[]>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/blogs (Protected)
router.post("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, image, date, author, category, slug, metaTitle, metaDescription, keywords } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ success: false, error: "title, content, and category required" } as ApiResponse);
    }

    const doc = await insertOne<BlogPost>("blogs", {
      title: title.trim(),
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      image: image?.trim() || "",
      date: date?.trim() || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      author: author?.trim() || "Admin",
      category: category.trim(),
      active: true,
      slug: slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      keywords: keywords || null,
    });

    return res.status(201).json({ success: true, data: doc } as ApiResponse<BlogPost>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/blogs (Protected)
router.patch("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    if (updates.slug) {
      updates.slug = updates.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }
    
    const updated = await updateOne<BlogPost>("blogs", id, updates);
    if (!updated) return res.status(404).json({ success: false, error: "Blog post not found" } as ApiResponse);

    return res.json({ success: true, data: updated } as ApiResponse<BlogPost>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/blogs (Protected)
router.delete("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const deleted = await deleteOne("blogs", id);
    if (!deleted) return res.status(404).json({ success: false, error: "Blog post not found" } as ApiResponse);

    return res.json({ success: true, message: "Blog post deleted" } as ApiResponse);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
