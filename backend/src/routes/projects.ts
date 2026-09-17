import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { validateRequired } from "../lib/validate";
import { authGuard } from "../middleware/authGuard";
import { getSessionUser } from "../lib/auth";
import type { ApiResponse, Project, ProjectGalleryItem, ProjectHighlight, ProjectFaq } from "../lib/types";

const router = Router();

// Whitelist of allowed writable fields
const ALLOWED_FIELDS = new Set([
  "title",
  "slug",
  "shortDescription",
  "description",
  "category",
  "subCategories",
  "client",
  "owner",
  "area",
  "services",
  "location",
  "date",
  "completionDate",
  "highlights",
  "city",
  "district",
  "state",
  "country",
  "postalCode",
  "targetLocation",
  "latitude",
  "longitude",
  "googleMapsUrl",
  "image",
  "imageAlt",
  "imageCaption",
  "images",
  "galleryDetails",
  "videoUrl",
  "videoType",
  "videoTitle",
  "videoDescription",
  "videoPoster",
  "faqs",
  "status",
  "publishStatus",
  "publishedAt",
  "featured",
  "order",
  "metaTitle",
  "metaDescription",
  "focusKeywords",
  "secondaryKeywords",
  "canonicalUrl",
  "ogImage",
  "noIndex",
  "noFollow",
]);

const VALID_VIDEO_TYPES = new Set(["youtube", "vimeo", "direct", "none"]);
const VALID_PUBLISH_STATUSES = new Set(["draft", "published", "archived"]);
const VALID_OPERATIONAL_STATUSES = new Set(["active", "completed", "ongoing", "archived"]);

// Helpers
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function isValidHttpUrl(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true; // Relative local URL
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeJsonField(
  raw: any,
  fieldName: string,
  validator?: (parsed: any) => boolean
): { value: string | null; error?: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { value: null };
  }

  let parsed: any;
  if (typeof raw === "object") {
    parsed = raw;
  } else if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return { value: null };
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return { value: null, error: `${fieldName} must be a valid JSON string or array` };
    }
  } else {
    return { value: null, error: `${fieldName} must be a JSON array or object` };
  }

  if (validator && !validator(parsed)) {
    return { value: null, error: `${fieldName} structure is invalid` };
  }

  try {
    return { value: JSON.stringify(parsed) };
  } catch {
    return { value: null, error: `${fieldName} could not be stringified` };
  }
}

async function generateUniqueProjectSlug(
  title: string,
  location?: string | null,
  excludeId?: string
): Promise<string> {
  let base = slugify(title || "");
  if (!base) {
    base = "project";
  }

  const existing = await prisma.project.findFirst({
    where: {
      slug: base,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (!existing) return base;

  // Disambiguation using verified location if available
  if (location && location.trim()) {
    const locSlug = slugify(location.trim());
    if (locSlug) {
      const withLoc = `${base}-${locSlug}`;
      const locMatch = await prisma.project.findFirst({
        where: {
          slug: withLoc,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (!locMatch) return withLoc;
    }
  }

  // Numerical counter fallback
  let count = 2;
  while (true) {
    const candidate = `${base}-${count}`;
    const match = await prisma.project.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!match) return candidate;
    count++;
  }
}

// ─────────────────────────────────────────────────────────────
// 1. GET /api/projects — Public list (or admin list with all=true)
// ─────────────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === "true";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : null;
    const status = typeof req.query.status === "string" ? req.query.status.trim().toLowerCase() : null;
    const publishStatusFilter = typeof req.query.publishStatus === "string" ? req.query.publishStatus.trim().toLowerCase() : null;
    const featured = req.query.featured === "true";
    const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : null;

    let user = null;
    if (includeAll) {
      user = await getSessionUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized — Authentication required to view draft or all projects.",
        } as ApiResponse);
      }
    }

    // Build Prisma where filter
    const where: any = {};

    // Public safety: Unauthenticated requests ONLY receive published projects
    if (!user) {
      where.publishStatus = "published";
      where.status = { not: "archived" };
    } else if (publishStatusFilter && VALID_PUBLISH_STATUSES.has(publishStatusFilter)) {
      where.publishStatus = publishStatusFilter;
    }

    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (status && VALID_OPERATIONAL_STATUSES.has(status)) {
      where.status = status;
    }

    if (featured) {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { client: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { order: "asc" },
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    return res.json({
      success: true,
      data: projects,
    } as ApiResponse<Project[]>);
  } catch (err: any) {
    console.error("[Projects API] GET / error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// ─────────────────────────────────────────────────────────────
// 2. GET /api/projects/:slugOrId — Single project lookup
// ─────────────────────────────────────────────────────────────
router.get("/:slugOrId", async (req: Request, res: Response) => {
  try {
    const rawParam = req.params.slugOrId;
    const rawSlugOrId = (Array.isArray(rawParam) ? rawParam[0] : rawParam) || "";
    if (!rawSlugOrId.trim()) {
      return res.status(400).json({ success: false, error: "Project identifier is required" } as ApiResponse);
    }

    const identifier = decodeURIComponent(rawSlugOrId.trim());

    // Dual lookup: First by slug, then fallback to id
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { slug: identifier },
          { id: identifier },
        ],
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" } as ApiResponse);
    }

    // Public protection: If not published or operationally archived, require admin session
    if (project.publishStatus !== "published" || project.status === "archived") {
      const user = await getSessionUser(req);
      if (!user) {
        return res.status(404).json({ success: false, error: "Project not found" } as ApiResponse);
      }
    }

    // Determine if matched via legacy ID
    const isLegacyId = project.id === identifier && project.slug !== identifier;

    return res.json({
      success: true,
      data: project,
      canonicalSlug: project.slug || project.id,
      isLegacyId,
    });
  } catch (err: any) {
    console.error("[Projects API] GET /:slugOrId error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// ─────────────────────────────────────────────────────────────
// 3. POST /api/projects — Create project (Protected)
// ─────────────────────────────────────────────────────────────
router.post("/", authGuard, async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    // 1. Validate publishing and operational statuses
    const publishStatus = (body.publishStatus || "draft").toLowerCase().trim();
    if (!VALID_PUBLISH_STATUSES.has(publishStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid publishStatus. Allowed values: draft, published, archived",
      } as ApiResponse);
    }

    const operationalStatus = (body.status || "active").toLowerCase().trim();
    if (!VALID_OPERATIONAL_STATUSES.has(operationalStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Allowed values: active, completed, ongoing, archived",
      } as ApiResponse);
    }

    // 2. Minimum structural validation: title and location required for all records (including drafts)
    const baseMissing = validateRequired({
      title: body.title,
      location: body.location,
    });

    if (baseMissing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${baseMissing.join(", ")}`,
      } as ApiResponse);
    }

    // 3. Strict Live Publishing Gate: date and description required before publishing
    if (publishStatus === "published") {
      const publishMissing = validateRequired({
        date: body.date,
        description: body.description,
      });

      if (publishMissing.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot publish without required fields: ${publishMissing.join(", ")}`,
        } as ApiResponse);
      }
    }

    // 4. Validate URLs
    if (body.image && typeof body.image === "string" && !isValidHttpUrl(body.image)) {
      return res.status(400).json({ success: false, error: "Invalid cover image URL" } as ApiResponse);
    }
    if (body.videoUrl && typeof body.videoUrl === "string" && !isValidHttpUrl(body.videoUrl)) {
      return res.status(400).json({ success: false, error: "Invalid videoUrl" } as ApiResponse);
    }
    if (body.videoPoster && typeof body.videoPoster === "string" && !isValidHttpUrl(body.videoPoster)) {
      return res.status(400).json({ success: false, error: "Invalid videoPoster URL" } as ApiResponse);
    }
    if (body.ogImage && typeof body.ogImage === "string" && !isValidHttpUrl(body.ogImage)) {
      return res.status(400).json({ success: false, error: "Invalid ogImage URL" } as ApiResponse);
    }
    if (body.canonicalUrl && typeof body.canonicalUrl === "string" && !isValidHttpUrl(body.canonicalUrl)) {
      return res.status(400).json({ success: false, error: "Invalid canonicalUrl" } as ApiResponse);
    }

    // 5. Validate videoType
    const videoType = (body.videoType || "none").toLowerCase().trim();
    if (!VALID_VIDEO_TYPES.has(videoType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid videoType. Allowed values: youtube, vimeo, direct, none",
      } as ApiResponse);
    }

    // 5. Validate & normalize JSON fields
    const subCategoriesNorm = normalizeJsonField(body.subCategories, "subCategories", (p) => Array.isArray(p));
    if (subCategoriesNorm.error) return res.status(400).json({ success: false, error: subCategoriesNorm.error } as ApiResponse);

    const servicesNorm = normalizeJsonField(body.services, "services", (p) => Array.isArray(p));
    if (servicesNorm.error) return res.status(400).json({ success: false, error: servicesNorm.error } as ApiResponse);

    const highlightsNorm = normalizeJsonField(body.highlights, "highlights", (p) =>
      Array.isArray(p) && p.every((h: any) => typeof h === "object" && h !== null && "label" in h && "value" in h)
    );
    if (highlightsNorm.error) return res.status(400).json({ success: false, error: highlightsNorm.error } as ApiResponse);

    const faqsNorm = normalizeJsonField(body.faqs, "faqs", (p) =>
      Array.isArray(p) && p.every((f: any) => typeof f === "object" && f !== null && "question" in f && "answer" in f)
    );
    if (faqsNorm.error) return res.status(400).json({ success: false, error: faqsNorm.error } as ApiResponse);

    const galleryDetailsNorm = normalizeJsonField(body.galleryDetails, "galleryDetails", (p) =>
      Array.isArray(p) && p.every((g: any) => typeof g === "object" && g !== null && "url" in g)
    );
    if (galleryDetailsNorm.error) return res.status(400).json({ success: false, error: galleryDetailsNorm.error } as ApiResponse);

    // 6. Handle legacy `images` synchronization
    let imagesStr = body.images || "";
    if (galleryDetailsNorm.value) {
      try {
        const parsed = JSON.parse(galleryDetailsNorm.value) as ProjectGalleryItem[];
        imagesStr = JSON.stringify(parsed.map((p) => p.url).filter(Boolean));
      } catch {
        /* silent */
      }
    } else if (imagesStr && typeof imagesStr === "string" && !galleryDetailsNorm.value) {
      try {
        const urls = imagesStr.trim().startsWith("[") ? JSON.parse(imagesStr) : imagesStr.split("\n").map((s) => s.trim()).filter(Boolean);
        galleryDetailsNorm.value = JSON.stringify(urls.map((u: string, idx: number) => ({ url: u, alt: `${body.title.trim()} photo ${idx + 1}` })));
      } catch {
        /* silent */
      }
    }

    // 7. Resolve or generate unique slug
    let finalSlug: string;
    if (body.slug && typeof body.slug === "string" && body.slug.trim()) {
      const cleanSlug = body.slug.trim().toLowerCase();
      if (!isValidSlug(cleanSlug)) {
        return res.status(400).json({
          success: false,
          error: "Slug must contain only lowercase letters, numbers, and hyphens (e.g. 'cyber-tower-phase-2')",
        } as ApiResponse);
      }

      const conflict = await prisma.project.findUnique({ where: { slug: cleanSlug } });
      if (conflict) {
        return res.status(409).json({
          success: false,
          error: `Slug "${cleanSlug}" is already in use by another project.`,
        } as ApiResponse);
      }
      finalSlug = cleanSlug;
    } else {
      finalSlug = await generateUniqueProjectSlug(body.title.trim(), body.location.trim());
    }

    // 8. Construct sanitized create payload
    const publishedAt = publishStatus === "published"
      ? (body.publishedAt ? new Date(body.publishedAt) : new Date())
      : null;

    const doc = await prisma.project.create({
      data: {
        title: body.title.trim(),
        slug: finalSlug,
        shortDescription: body.shortDescription ? body.shortDescription.trim() : null,
        description: body.description && typeof body.description === "string" ? body.description.trim() : "",
        category: body.category && typeof body.category === "string" ? body.category.trim() : "",
        subCategories: subCategoriesNorm.value,
        client: body.client ? body.client.trim() : null,
        owner: body.owner ? body.owner.trim() : null,
        area: body.area ? body.area.trim() : null,
        services: servicesNorm.value,
        location: body.location.trim(),
        date: body.date && typeof body.date === "string" ? body.date.trim() : "",
        completionDate: body.completionDate ? body.completionDate.trim() : null,
        highlights: highlightsNorm.value,
        city: body.city ? body.city.trim() : null,
        district: body.district ? body.district.trim() : null,
        state: body.state ? body.state.trim() : null,
        country: body.country ? body.country.trim() : null,
        postalCode: body.postalCode ? body.postalCode.trim() : null,
        targetLocation: body.targetLocation ? body.targetLocation.trim() : null,
        latitude: body.latitude !== undefined && body.latitude !== null && !isNaN(Number(body.latitude)) ? Number(body.latitude) : null,
        longitude: body.longitude !== undefined && body.longitude !== null && !isNaN(Number(body.longitude)) ? Number(body.longitude) : null,
        googleMapsUrl: body.googleMapsUrl ? body.googleMapsUrl.trim() : null,
        image: body.image ? body.image.trim() : "",
        imageAlt: body.imageAlt ? body.imageAlt.trim() : null,
        imageCaption: body.imageCaption ? body.imageCaption.trim() : null,
        images: imagesStr,
        galleryDetails: galleryDetailsNorm.value,
        videoUrl: body.videoUrl ? body.videoUrl.trim() : null,
        videoType,
        videoTitle: body.videoTitle ? body.videoTitle.trim() : null,
        videoDescription: body.videoDescription ? body.videoDescription.trim() : null,
        videoPoster: body.videoPoster ? body.videoPoster.trim() : null,
        faqs: faqsNorm.value,
        status: operationalStatus,
        publishStatus,
        publishedAt,
        featured: Boolean(body.featured),
        order: body.order !== undefined && !isNaN(Number(body.order)) ? Number(body.order) : 0,
        metaTitle: body.metaTitle ? body.metaTitle.trim() : null,
        metaDescription: body.metaDescription ? body.metaDescription.trim() : null,
        focusKeywords: body.focusKeywords ? body.focusKeywords.trim() : null,
        secondaryKeywords: body.secondaryKeywords ? body.secondaryKeywords.trim() : null,
        canonicalUrl: body.canonicalUrl ? body.canonicalUrl.trim() : null,
        ogImage: body.ogImage ? body.ogImage.trim() : null,
        noIndex: Boolean(body.noIndex),
        noFollow: Boolean(body.noFollow),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: doc,
    } as ApiResponse<Project>);
  } catch (err: any) {
    console.error("[Projects API] POST / error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// ─────────────────────────────────────────────────────────────
// 4. PATCH /api/projects & PATCH /api/projects/:id — Update project (Protected)
// ─────────────────────────────────────────────────────────────
const handlePatch = async (req: Request, res: Response) => {
  try {
    const rawParam = req.params.id;
    const paramId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    const id = String(paramId || req.body?.id || "").trim();
    if (!id) {
      return res.status(400).json({ success: false, error: "id is required" } as ApiResponse);
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Project not found" } as ApiResponse);
    }

    const updates: Record<string, any> = {};
    const body = req.body || {};

    // 1. Filter against strict whitelist
    for (const key of Object.keys(body)) {
      if (ALLOWED_FIELDS.has(key)) {
        updates[key] = body[key];
      }
    }

    // 2. Validate URLs if updating
    if (updates.image !== undefined && updates.image !== null && updates.image !== "" && !isValidHttpUrl(updates.image)) {
      return res.status(400).json({ success: false, error: "Invalid cover image URL" } as ApiResponse);
    }
    if (updates.videoUrl !== undefined && updates.videoUrl !== null && updates.videoUrl !== "" && !isValidHttpUrl(updates.videoUrl)) {
      return res.status(400).json({ success: false, error: "Invalid videoUrl" } as ApiResponse);
    }
    if (updates.videoPoster !== undefined && updates.videoPoster !== null && updates.videoPoster !== "" && !isValidHttpUrl(updates.videoPoster)) {
      return res.status(400).json({ success: false, error: "Invalid videoPoster URL" } as ApiResponse);
    }
    if (updates.ogImage !== undefined && updates.ogImage !== null && updates.ogImage !== "" && !isValidHttpUrl(updates.ogImage)) {
      return res.status(400).json({ success: false, error: "Invalid ogImage URL" } as ApiResponse);
    }
    if (updates.canonicalUrl !== undefined && updates.canonicalUrl !== null && updates.canonicalUrl !== "" && !isValidHttpUrl(updates.canonicalUrl)) {
      return res.status(400).json({ success: false, error: "Invalid canonicalUrl" } as ApiResponse);
    }

    // 3. Validate videoType if updating
    if (updates.videoType !== undefined) {
      const vt = (updates.videoType || "none").toLowerCase().trim();
      if (!VALID_VIDEO_TYPES.has(vt)) {
        return res.status(400).json({
          success: false,
          error: "Invalid videoType. Allowed values: youtube, vimeo, direct, none",
        } as ApiResponse);
      }
      updates.videoType = vt;
    }

    // 4. Validate publishing / operational status if updating
    if (updates.publishStatus !== undefined) {
      const ps = (updates.publishStatus || "draft").toLowerCase().trim();
      if (!VALID_PUBLISH_STATUSES.has(ps)) {
        return res.status(400).json({
          success: false,
          error: "Invalid publishStatus. Allowed values: draft, published, archived",
        } as ApiResponse);
      }
      updates.publishStatus = ps;

      // Auto-populate publishedAt if transitioning to published
      if (ps === "published" && !existing.publishedAt && updates.publishedAt === undefined) {
        updates.publishedAt = new Date();
      }
    }

    if (updates.status !== undefined) {
      const os = (updates.status || "active").toLowerCase().trim();
      if (!VALID_OPERATIONAL_STATUSES.has(os)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status. Allowed values: active, completed, ongoing, archived",
        } as ApiResponse);
      }
      updates.status = os;
    }

    // Safely normalize string fields on update (Prisma non-nullable strings)
    if (updates.category !== undefined) {
      updates.category = updates.category && typeof updates.category === "string" ? updates.category.trim() : "";
    }
    if (updates.date !== undefined) {
      updates.date = updates.date && typeof updates.date === "string" ? updates.date.trim() : "";
    }
    if (updates.description !== undefined) {
      updates.description = updates.description && typeof updates.description === "string" ? updates.description.trim() : "";
    }

    // Strict Live Publishing Gate: If publishing, verify the 4 hard-required fields
    const effectivePublishStatus = updates.publishStatus || existing.publishStatus;
    if (effectivePublishStatus === "published") {
      const targetTitle = updates.title !== undefined ? updates.title : existing.title;
      const targetLocation = updates.location !== undefined ? updates.location : existing.location;
      const targetDate = updates.date !== undefined ? updates.date : existing.date;
      const targetDescription = updates.description !== undefined ? updates.description : existing.description;

      const publishMissing = validateRequired({
        title: targetTitle,
        location: targetLocation,
        date: targetDate,
        description: targetDescription,
      });

      if (publishMissing.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot publish without required fields: ${publishMissing.join(", ")}`,
        } as ApiResponse);
      }
    }

    // 5. Validate and normalize JSON fields if updating
    if (updates.subCategories !== undefined) {
      const norm = normalizeJsonField(updates.subCategories, "subCategories", (p) => Array.isArray(p));
      if (norm.error) return res.status(400).json({ success: false, error: norm.error } as ApiResponse);
      updates.subCategories = norm.value;
    }

    if (updates.services !== undefined) {
      const norm = normalizeJsonField(updates.services, "services", (p) => Array.isArray(p));
      if (norm.error) return res.status(400).json({ success: false, error: norm.error } as ApiResponse);
      updates.services = norm.value;
    }

    if (updates.highlights !== undefined) {
      const norm = normalizeJsonField(updates.highlights, "highlights", (p) =>
        Array.isArray(p) && p.every((h: any) => typeof h === "object" && h !== null && "label" in h && "value" in h)
      );
      if (norm.error) return res.status(400).json({ success: false, error: norm.error } as ApiResponse);
      updates.highlights = norm.value;
    }

    if (updates.faqs !== undefined) {
      const norm = normalizeJsonField(updates.faqs, "faqs", (p) =>
        Array.isArray(p) && p.every((f: any) => typeof f === "object" && f !== null && "question" in f && "answer" in f)
      );
      if (norm.error) return res.status(400).json({ success: false, error: norm.error } as ApiResponse);
      updates.faqs = norm.value;
    }

    if (updates.galleryDetails !== undefined) {
      const norm = normalizeJsonField(updates.galleryDetails, "galleryDetails", (p) =>
        Array.isArray(p) && p.every((g: any) => typeof g === "object" && g !== null && "url" in g)
      );
      if (norm.error) return res.status(400).json({ success: false, error: norm.error } as ApiResponse);
      updates.galleryDetails = norm.value;

      // Sync legacy `images`
      if (norm.value) {
        try {
          const parsed = JSON.parse(norm.value) as ProjectGalleryItem[];
          updates.images = JSON.stringify(parsed.map((p) => p.url).filter(Boolean));
        } catch {
          /* silent */
        }
      }
    }

    // 6. Validate slug update & collision
    if (updates.slug !== undefined) {
      const cleanSlug = String(updates.slug).trim().toLowerCase();
      if (!cleanSlug) {
        // If emptied, re-generate from title
        updates.slug = await generateUniqueProjectSlug(updates.title || existing.title, updates.location || existing.location, id);
      } else {
        if (!isValidSlug(cleanSlug)) {
          return res.status(400).json({
            success: false,
            error: "Slug must contain only lowercase letters, numbers, and hyphens (e.g. 'cyber-tower-phase-2')",
          } as ApiResponse);
        }

        const conflict = await prisma.project.findFirst({
          where: {
            slug: cleanSlug,
            id: { not: id },
          },
          select: { id: true },
        });

        if (conflict) {
          return res.status(409).json({
            success: false,
            error: `Slug "${cleanSlug}" is already in use by another project.`,
          } as ApiResponse);
        }
        updates.slug = cleanSlug;
      }
    }

    // 7. Numeric type conversions
    if (updates.latitude !== undefined && updates.latitude !== null) {
      updates.latitude = !isNaN(Number(updates.latitude)) ? Number(updates.latitude) : null;
    }
    if (updates.longitude !== undefined && updates.longitude !== null) {
      updates.longitude = !isNaN(Number(updates.longitude)) ? Number(updates.longitude) : null;
    }
    if (updates.order !== undefined) {
      updates.order = !isNaN(Number(updates.order)) ? Number(updates.order) : 0;
    }
    if (updates.featured !== undefined) {
      updates.featured = Boolean(updates.featured);
    }
    if (updates.noIndex !== undefined) {
      updates.noIndex = Boolean(updates.noIndex);
    }
    if (updates.noFollow !== undefined) {
      updates.noFollow = Boolean(updates.noFollow);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updates,
    });

    return res.json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    } as ApiResponse<Project>);
  } catch (err: any) {
    console.error("[Projects API] PATCH error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
};

router.patch("/:id", authGuard, handlePatch);
router.patch("/", authGuard, handlePatch);

// ─────────────────────────────────────────────────────────────
// 5. DELETE /api/projects & DELETE /api/projects/:id — Archive or Permanent Delete (Protected)
// ─────────────────────────────────────────────────────────────
const handleDelete = async (req: Request, res: Response) => {
  try {
    const rawParam = req.params.id;
    const paramId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    const id = String(paramId || req.body?.id || "").trim();
    if (!id) {
      return res.status(400).json({ success: false, error: "id is required" } as ApiResponse);
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Project not found" } as ApiResponse);
    }

    const isPermanent = req.query.permanent === "true" || req.body.permanent === true;

    if (isPermanent) {
      // Hard delete from database
      await prisma.project.delete({ where: { id } });
      return res.json({
        success: true,
        message: "Project permanently deleted",
      } as ApiResponse);
    } else {
      // Safe archive: Unpublishes and marks operational status as archived
      const archived = await prisma.project.update({
        where: { id },
        data: {
          publishStatus: "archived",
          status: "archived",
        },
      });

      return res.json({
        success: true,
        message: "Project safely archived",
        data: archived,
      } as ApiResponse<Project>);
    }
  } catch (err: any) {
    console.error("[Projects API] DELETE error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
};

router.delete("/:id", authGuard, handleDelete);
router.delete("/", authGuard, handleDelete);

export default router;
