import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { adminGuard } from "../middleware/authGuard";
import { getSessionUser } from "../lib/auth";
import type { ApiResponse } from "../lib/types";

const router = Router();

// Lightweight column selection for listing endpoints (omits heavy article content and large structured payloads)
const LISTING_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  image: true,
  imageAlt: true,
  date: true,
  author: true,
  category: true,
  active: true,
  status: true,
  publishDate: true,
  primaryKeyword: true,
  targetLocation: true,
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
  "imageAlt",
  "imageCaption",
  "date",
  "author",
  "category",
  "active",
  "status",
  "publishDate",
  "metaTitle",
  "metaDescription",
  "keywords",
  "primaryKeyword",
  "secondaryKeywords",
  "geoKeywords",
  "targetLocation",
  "searchIntent",
  "faqs",
  "internalLinks",
  "relatedPostIds",
  "customCta",
]);

const VALID_STATUSES = new Set(["draft", "published", "unpublished"]);
const VALID_SEARCH_INTENTS = new Set(["informational", "commercial", "transactional", "navigational"]);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeJsonField(raw: any, fieldName: string): { value: string | null; error?: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { value: null };
  }
  if (typeof raw === "object") {
    try {
      return { value: JSON.stringify(raw) };
    } catch {
      return { value: null, error: `Invalid ${fieldName} object format` };
    }
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return { value: null };
    try {
      JSON.parse(trimmed);
      return { value: trimmed };
    } catch {
      return { value: null, error: `${fieldName} must be a valid JSON string` };
    }
  }
  return { value: null, error: `${fieldName} must be a string or JSON object` };
}

// GET /api/blogs (Public listing, lightweight payload without content)
router.get("/", async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === "true";
    const includeFull = req.query.full === "true";
    const statusFilter = typeof req.query.status === "string" ? req.query.status.toLowerCase() : null;

    // When all=true is requested, require valid admin authentication
    if (includeAll) {
      const user = await getSessionUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" } as ApiResponse);
      }
      const whereClause: any = {};
      if (statusFilter && VALID_STATUSES.has(statusFilter)) {
        whereClause.status = statusFilter;
      }
      const blogs = await prisma.blogPost.findMany({
        where: whereClause,
        select: includeFull ? undefined : LISTING_SELECT,
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: blogs } as ApiResponse<any[]>);
    }

    // Public request: return only active, published blogs whose publishDate is null OR <= now
    const now = new Date();
    const active = await prisma.blogPost.findMany({
      where: {
        AND: [
          { active: true },
          { status: "published" },
          {
            OR: [
              { publishDate: null },
              { publishDate: { lte: now } },
            ],
          },
        ],
      },
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

    // If authenticated admin, allow previewing drafts, unpublished, or future-dated posts
    // Otherwise, public users only see active, published articles where publishDate <= now
    const now = new Date();
    const whereClause: any = user
      ? {
          OR: [{ slug: decodedSlug }, { id: decodedSlug }],
        }
      : {
          AND: [
            { OR: [{ slug: decodedSlug }, { id: decodedSlug }] },
            { active: true },
            { status: "published" },
            {
              OR: [
                { publishDate: null },
                { publishDate: { lte: now } },
              ],
            },
          ],
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
      imageAlt,
      imageCaption,
      date,
      author,
      category,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      status,
      publishDate,
      primaryKeyword,
      secondaryKeywords,
      geoKeywords,
      targetLocation,
      searchIntent,
      faqs,
      internalLinks,
      relatedPostIds,
      customCta,
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

    // Status and active synchronization
    let finalStatus = "published";
    if (status && typeof status === "string") {
      const s = status.toLowerCase().trim();
      if (!VALID_STATUSES.has(s)) {
        return res.status(400).json({ success: false, error: `Invalid status: "${status}". Must be draft, published, or unpublished.` });
      }
      finalStatus = s;
    } else if (active === false) {
      finalStatus = "draft";
    }

    const finalActive = finalStatus === "published";

    // publishDate parsing
    let parsedPublishDate: Date | null = null;
    if (publishDate) {
      const d = new Date(publishDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ success: false, error: "Invalid publishDate format" });
      }
      parsedPublishDate = d;
    }

    // Search intent validation
    let finalSearchIntent: string | null = null;
    if (searchIntent && typeof searchIntent === "string") {
      const si = searchIntent.toLowerCase().trim();
      if (si && !VALID_SEARCH_INTENTS.has(si)) {
        return res.status(400).json({
          success: false,
          error: `Invalid searchIntent: "${searchIntent}". Must be informational, commercial, transactional, or navigational.`,
        });
      }
      finalSearchIntent = si || null;
    }

    // JSON fields validation & normalization
    const faqsRes = normalizeJsonField(faqs, "faqs");
    if (faqsRes.error) return res.status(400).json({ success: false, error: faqsRes.error });

    const internalLinksRes = normalizeJsonField(internalLinks, "internalLinks");
    if (internalLinksRes.error) return res.status(400).json({ success: false, error: internalLinksRes.error });

    const relatedPostIdsRes = normalizeJsonField(relatedPostIds, "relatedPostIds");
    if (relatedPostIdsRes.error) return res.status(400).json({ success: false, error: relatedPostIdsRes.error });

    const customCtaRes = normalizeJsonField(customCta, "customCta");
    if (customCtaRes.error) return res.status(400).json({ success: false, error: customCtaRes.error });

    const doc = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        excerpt: (excerpt || "").trim(),
        content: content.trim(),
        image: (image || "").trim(),
        imageAlt: imageAlt ? String(imageAlt).trim() : null,
        imageCaption: imageCaption ? String(imageCaption).trim() : null,
        date: (date || "").trim() || new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        author: (author || "Hindustan Projects").trim(),
        category: category.trim(),
        active: finalActive,
        status: finalStatus,
        publishDate: parsedPublishDate,
        slug: cleanSlug,
        metaTitle: metaTitle ? String(metaTitle).trim() : null,
        metaDescription: metaDescription ? String(metaDescription).trim() : null,
        keywords: keywords ? String(keywords).trim() : null,
        primaryKeyword: primaryKeyword ? String(primaryKeyword).trim() : null,
        secondaryKeywords: secondaryKeywords ? String(secondaryKeywords).trim() : null,
        geoKeywords: geoKeywords ? String(geoKeywords).trim() : null,
        targetLocation: targetLocation ? String(targetLocation).trim() : null,
        searchIntent: finalSearchIntent,
        faqs: faqsRes.value,
        internalLinks: internalLinksRes.value,
        relatedPostIds: relatedPostIdsRes.value,
        customCta: customCtaRes.value,
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
        safeUpdates[key] = value;
      }
    }

    // String fields trimming
    const stringFields = [
      "title",
      "excerpt",
      "content",
      "image",
      "imageAlt",
      "imageCaption",
      "date",
      "author",
      "category",
      "metaTitle",
      "metaDescription",
      "keywords",
      "primaryKeyword",
      "secondaryKeywords",
      "geoKeywords",
      "targetLocation",
    ];
    for (const field of stringFields) {
      if (field in safeUpdates) {
        safeUpdates[field] = typeof safeUpdates[field] === "string" ? safeUpdates[field].trim() : safeUpdates[field];
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

    // Status and active synchronization
    if ("status" in safeUpdates) {
      if (typeof safeUpdates.status !== "string") {
        return res.status(400).json({ success: false, error: "status must be a string" });
      }
      const s = safeUpdates.status.toLowerCase().trim();
      if (!VALID_STATUSES.has(s)) {
        return res.status(400).json({ success: false, error: `Invalid status: "${safeUpdates.status}". Must be draft, published, or unpublished.` });
      }
      safeUpdates.status = s;
      safeUpdates.active = s === "published";
    } else if ("active" in safeUpdates && !("status" in safeUpdates)) {
      // If client only updated active
      safeUpdates.status = safeUpdates.active ? "published" : "draft";
    }

    // publishDate parsing
    if ("publishDate" in safeUpdates) {
      if (!safeUpdates.publishDate) {
        safeUpdates.publishDate = null;
      } else {
        const d = new Date(safeUpdates.publishDate);
        if (isNaN(d.getTime())) {
          return res.status(400).json({ success: false, error: "Invalid publishDate format" });
        }
        safeUpdates.publishDate = d;
      }
    }

    // searchIntent validation
    if ("searchIntent" in safeUpdates) {
      if (!safeUpdates.searchIntent) {
        safeUpdates.searchIntent = null;
      } else {
        const si = String(safeUpdates.searchIntent).toLowerCase().trim();
        if (si && !VALID_SEARCH_INTENTS.has(si)) {
          return res.status(400).json({
            success: false,
            error: `Invalid searchIntent: "${safeUpdates.searchIntent}". Must be informational, commercial, transactional, or navigational.`,
          });
        }
        safeUpdates.searchIntent = si || null;
      }
    }

    // JSON fields normalization
    const jsonFields = ["faqs", "internalLinks", "relatedPostIds", "customCta"];
    for (const jf of jsonFields) {
      if (jf in safeUpdates) {
        const resNorm = normalizeJsonField(safeUpdates[jf], jf);
        if (resNorm.error) {
          return res.status(400).json({ success: false, error: resNorm.error });
        }
        safeUpdates[jf] = resNorm.value;
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
