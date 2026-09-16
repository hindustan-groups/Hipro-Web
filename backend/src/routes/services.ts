import { Router, Request, Response } from "express";
import { insertOne, findAll, findById, updateOne, deleteOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import { getSessionUser } from "../lib/auth";
import type { Service, ApiResponse } from "../lib/types";

const router = Router();

function normalizeJson(val: any): string | null {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return null;
    }
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    return trimmed;
  }
  return null;
}

// GET /api/services — Public or Admin
router.get("/", async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === "true";
    const services = await findAll<Service>("services");

    if (includeAll) {
      const user = await getSessionUser(req);
      if (user) {
        const sorted = services.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
        return res.json({ success: true, data: sorted } as ApiResponse<Service[]>);
      }
    }

    const active = services
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return res.json({ success: true, data: active } as ApiResponse<Service[]>);
  } catch (err) {
    console.error("GET /api/services error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// GET /api/services/:id — Single service lookup
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: "id required" } as ApiResponse);
    }
    const service = await findById<Service>("services", id);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" } as ApiResponse);
    }
    return res.json({ success: true, data: service } as ApiResponse<Service>);
  } catch (err) {
    console.error("GET /api/services/:id error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/services — Protected: Admin only
router.post("/", authGuard, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      icon,
      image,
      order,
      active,
      features,
      badge,
      tagline,
      metaTitle,
      metaDescription,
      overviewHeading,
      overviewParagraphs,
      detailedCapabilities,
      applicationsHeading,
      applications,
      stagesHeading,
      stages,
      deliverablesHeading,
      deliverables,
      whyChooseHeading,
      whyChoosePoints,
      faqs,
      indicativeRatesNotice,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: "title and description required" } as ApiResponse);
    }

    const doc = await insertOne<Service>("services", {
      title: title.trim(),
      description: description.trim(),
      category: category?.trim() || "Design & Planning",
      icon: icon?.trim() || "Wrench",
      features: normalizeJson(features) || "[]",
      image: image?.trim() || "",
      order: Number(order) || 1,
      active: active !== false,

      badge: badge ? String(badge).trim() : null,
      tagline: tagline ? String(tagline).trim() : null,
      metaTitle: metaTitle ? String(metaTitle).trim() : null,
      metaDescription: metaDescription ? String(metaDescription).trim() : null,
      overviewHeading: overviewHeading ? String(overviewHeading).trim() : null,
      overviewParagraphs: normalizeJson(overviewParagraphs),
      detailedCapabilities: normalizeJson(detailedCapabilities),
      applicationsHeading: applicationsHeading ? String(applicationsHeading).trim() : null,
      applications: normalizeJson(applications),
      stagesHeading: stagesHeading ? String(stagesHeading).trim() : null,
      stages: normalizeJson(stages),
      deliverablesHeading: deliverablesHeading ? String(deliverablesHeading).trim() : null,
      deliverables: normalizeJson(deliverables),
      whyChooseHeading: whyChooseHeading ? String(whyChooseHeading).trim() : null,
      whyChoosePoints: normalizeJson(whyChoosePoints),
      faqs: normalizeJson(faqs),
      indicativeRatesNotice: normalizeJson(indicativeRatesNotice),
    });

    return res.status(201).json({ success: true, data: doc } as ApiResponse<Service>);
  } catch (err) {
    console.error("POST /api/services error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/services & /api/services/:id — Protected
const handlePatch = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id || req.body.id;
    const id = (Array.isArray(rawId) ? rawId[0] : rawId) as string;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const updates: Record<string, any> = { ...req.body };
    delete updates.id;

    if ("title" in updates && typeof updates.title === "string") updates.title = updates.title.trim();
    if ("description" in updates && typeof updates.description === "string") updates.description = updates.description.trim();
    if ("category" in updates && typeof updates.category === "string") updates.category = updates.category.trim();
    if ("icon" in updates && typeof updates.icon === "string") updates.icon = updates.icon.trim();
    if ("image" in updates && typeof updates.image === "string") updates.image = updates.image.trim();
    if ("order" in updates) updates.order = Number(updates.order) || 0;
    if ("active" in updates) updates.active = Boolean(updates.active);

    const jsonFields = [
      "features",
      "overviewParagraphs",
      "detailedCapabilities",
      "applications",
      "stages",
      "deliverables",
      "whyChoosePoints",
      "faqs",
      "indicativeRatesNotice",
    ];
    for (const jf of jsonFields) {
      if (jf in updates) {
        updates[jf] = normalizeJson(updates[jf]);
      }
    }

    const stringNullableFields = [
      "badge",
      "tagline",
      "metaTitle",
      "metaDescription",
      "overviewHeading",
      "applicationsHeading",
      "stagesHeading",
      "deliverablesHeading",
      "whyChooseHeading",
    ];
    for (const sf of stringNullableFields) {
      if (sf in updates) {
        updates[sf] = updates[sf] ? String(updates[sf]).trim() : null;
      }
    }

    const updated = await updateOne<Service>("services", id, updates);
    if (!updated) return res.status(404).json({ success: false, error: "Service not found" } as ApiResponse);

    return res.json({ success: true, data: updated } as ApiResponse<Service>);
  } catch (err) {
    console.error("PATCH /api/services error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
};

router.patch("/", authGuard, handlePatch);
router.patch("/:id", authGuard, handlePatch);

// DELETE /api/services & /api/services/:id — Protected
const handleDelete = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id || req.body.id;
    const id = (Array.isArray(rawId) ? rawId[0] : rawId) as string;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const deleted = await deleteOne("services", id);
    if (!deleted) return res.status(404).json({ success: false, error: "Service not found" } as ApiResponse);

    return res.json({ success: true, message: "Service deleted" } as ApiResponse);
  } catch (err) {
    console.error("DELETE /api/services error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
};

router.delete("/", authGuard, handleDelete);
router.delete("/:id", authGuard, handleDelete);

export default router;

