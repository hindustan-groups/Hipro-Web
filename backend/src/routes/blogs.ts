import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { adminGuard } from "../middleware/authGuard";
import { getSessionUser } from "../lib/auth";
import type { BlogPost, ApiResponse } from "../lib/types";

const router = Router();

// Lightweight column selection for listing endpoints (omits heavy article content)
const LISTING_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  image: true,
  date: true,
  author: true,
  category: true,
  active: true,
  metaTitle: true,
  metaDescription: true,
  keywords: true,
  createdAt: true,
  updatedAt: true,
};

// Allowed fields for PATCH updates (strict whitelist)
const ALLOWED_UPDATE_FIELDS = new Set([
  "title",
  "slug",
  "excerpt",
  "content",
  "image",
  "date",
  "author",
  "category",
  "active",
  "metaTitle",
  "metaDescription",
  "keywords",
]);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// GET /api/blogs (Public listing, lightweight payload without content)
router.get("/", async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === "true";
    const includeFull = req.query.full === "true";

    // When all=true is requested, require valid admin authentication
    if (includeAll) {
      const user = await getSessionUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" } as ApiResponse);
      }
      const blogs = await prisma.blogPost.findMany({
        select: includeFull ? undefined : LISTING_SELECT,
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: blogs } as ApiResponse<any[]>);
    }

    // Public request: return only active blogs with lightweight metadata
    const active = await prisma.blogPost.findMany({
      where: { active: true },
      select: includeFull ? undefined : LISTING_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: active } as ApiResponse<any[]>);
  } catch (err) {
    console.error("GET /api/blogs error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// GET /api/blogs/:slug (Dedicated parameterized article detail lookup)
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    if (!rawSlug) {
      return res.status(400).json({ success: false, error: "Slug required" });
    }

    const decodedSlug = decodeURIComponent(rawSlug);
    const user = await getSessionUser(req);

    // If authenticated admin, allow previewing inactive drafts; otherwise active only
    const whereClause = user
      ? {
          OR: [{ slug: decodedSlug }, { id: decodedSlug }],
        }
      : {
          OR: [{ slug: decodedSlug }, { id: decodedSlug }],
          active: true,
        };

    const post = await prisma.blogPost.findFirst({
      where: whereClause,
    });

    if (!post) {
      return res.status(404).json({ success: false, error: "Blog post not found" });
    }

    return res.json({ success: true, data: post });
  } catch (err) {
    console.error(`GET /api/blogs/:slug error:`, err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/blogs (Protected: Admin only)
router.post("/", adminGuard, async (req: Request, res: Response) => {
  try {
    const {
      title,
      excerpt,
      content,
      image,
      date,
      author,
      category,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      active,
    } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, error: "Title is required" } as ApiResponse);
    }
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ success: false, error: "Content is required" } as ApiResponse);
    }
    if (!category || typeof category !== "string" || !category.trim()) {
      return res.status(400).json({ success: false, error: "Category is required" } as ApiResponse);
    }

    const cleanSlug = slug ? slugify(slug) : slugify(title);
    if (!cleanSlug) {
      return res.status(400).json({ success: false, error: "A valid slug is required" } as ApiResponse);
    }

    // Check duplicate slug
    const existing = await prisma.blogPost.findUnique({
      where: { slug: cleanSlug },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A blog post with the slug "${cleanSlug}" already exists`,
      } as ApiResponse);
    }

    const doc = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        excerpt: (excerpt || "").trim(),
        content: content.trim(),
        image: (image || "").trim(),
        date: (date || "").trim() || new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        author: (author || "Hindustan Projects").trim(),
        category: category.trim(),
        active: active !== false,
        slug: cleanSlug,
        metaTitle: metaTitle ? metaTitle.trim() : null,
        metaDescription: metaDescription ? metaDescription.trim() : null,
        keywords: keywords ? keywords.trim() : null,
      },
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "A blog post with this slug already exists",
      });
    }
    console.error("POST /api/blogs error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/blogs (Protected: Admin only)
router.patch("/", adminGuard, async (req: Request, res: Response) => {
  try {
    const { id, ...rawUpdates } = req.body;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ success: false, error: "id is required" });
    }

    // Filter only whitelisted fields
    const safeUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawUpdates)) {
      if (ALLOWED_UPDATE_FIELDS.has(key)) {
        if (typeof value === "string") {
          safeUpdates[key] = value.trim();
        } else {
          safeUpdates[key] = value;
        }
      }
    }

    // Slug validation and uniqueness check if slug is updated
    if (safeUpdates.slug) {
      safeUpdates.slug = slugify(safeUpdates.slug);
      if (!safeUpdates.slug) {
        return res.status(400).json({ success: false, error: "Invalid slug provided" });
      }

      const existing = await prisma.blogPost.findUnique({
        where: { slug: safeUpdates.slug },
      });
      if (existing && existing.id !== id) {
        return res.status(409).json({
          success: false,
          error: `A blog post with the slug "${safeUpdates.slug}" already exists`,
        });
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: safeUpdates,
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "A blog post with this slug already exists",
      } as ApiResponse);
    }
    if (err?.code === "P2025") {
      return res.status(404).json({ success: false, error: "Blog post not found" } as ApiResponse);
    }
    console.error("PATCH /api/blogs error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/blogs (Protected: Admin only)
router.delete("/", adminGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ success: false, error: "id is required" } as ApiResponse);
    }

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Blog post not found" } as ApiResponse);
    }

    await prisma.blogPost.delete({ where: { id } });

    return res.json({ success: true, message: "Blog post deleted successfully" } as ApiResponse);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ success: false, error: "Blog post not found" } as ApiResponse);
    }
    console.error("DELETE /api/blogs error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
