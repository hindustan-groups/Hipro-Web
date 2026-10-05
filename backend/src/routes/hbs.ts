import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import { contactLimiter } from "../middleware/rateLimiter";
import { getSessionUser } from "../lib/auth";
import type { HbsContent, HbsService, HbsProject, HbsTestimonial, HbsLead, ApiResponse } from "../lib/types";

const router = Router();

function getParam(val: any): string {
  if (Array.isArray(val)) return String(val[0] || "");
  return typeof val === "string" ? val : String(val || "");
}

// ==================================================
// 1. HBS CONTENT (General Settings, Home, About, SEO)
// ==================================================

// GET /api/hbs/content — Public
router.get("/content", async (req: Request, res: Response) => {
  try {
    let content = await prisma.hbsContent.findUnique({
      where: { id: "singleton" },
    });

    if (!content) {
      content = await prisma.hbsContent.create({
        data: { id: "singleton" },
      });
    }

    return res.json({ success: true, data: content } as ApiResponse<HbsContent>);
  } catch (err) {
    console.error("[/api/hbs/content GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/hbs/content — Protected: Admin
router.patch("/content", authGuard, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    delete data.id; // protect ID

    const updated = await prisma.hbsContent.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    return res.json({ success: true, message: "HBS content updated successfully", data: updated } as ApiResponse<HbsContent>);
  } catch (err) {
    console.error("[/api/hbs/content PATCH]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// ==================================================
// 2. HBS SERVICES
// ==================================================

// GET /api/hbs/services — Public / Admin
router.get("/services", async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === "true";
    if (includeAll) {
      const user = await getSessionUser(req);
      if (user) {
        const allServices = await prisma.hbsService.findMany({
          orderBy: { order: "asc" },
        });
        return res.json({ success: true, data: allServices } as ApiResponse<HbsService[]>);
      }
    }

    const services = await prisma.hbsService.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    return res.json({ success: true, data: services } as ApiResponse<HbsService[]>);
  } catch (err) {
    console.error("[/api/hbs/services GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// GET /api/hbs/services/:slug — Single Service
router.get("/services/:slug", async (req: Request, res: Response) => {
  try {
    const slug = getParam(req.params.slug);
    const service = await prisma.hbsService.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" } as ApiResponse);
    }

    return res.json({ success: true, data: service } as ApiResponse<HbsService>);
  } catch (err) {
    console.error("[/api/hbs/services/:slug GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/hbs/services — Protected: Admin
router.post("/services", authGuard, async (req: Request, res: Response) => {
  try {
    const { title, hindiTitle, slug, serviceNumber, shortDescription, fullDescription, image, icon, features, active, order, metaTitle, metaDescription } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ success: false, error: "Title and slug are required" } as ApiResponse);
    }

    const created = await prisma.hbsService.create({
      data: {
        title: title.trim(),
        hindiTitle: hindiTitle?.trim() || null,
        slug: slug.trim().toLowerCase(),
        serviceNumber: serviceNumber || null,
        shortDescription: shortDescription?.trim() || null,
        fullDescription: fullDescription?.trim() || null,
        image: image || null,
        icon: icon || null,
        features: typeof features === "object" ? JSON.stringify(features) : (features || null),
        active: active !== undefined ? Boolean(active) : true,
        order: Number(order) || 0,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    return res.status(201).json({ success: true, data: created } as ApiResponse<HbsService>);
  } catch (err: any) {
    console.error("[/api/hbs/services POST]", err);
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, error: "Service with this slug already exists" } as ApiResponse);
    }
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/hbs/services/:id — Protected: Admin
router.patch("/services/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const data = { ...req.body };
    delete data.id;

    if (data.features && typeof data.features === "object") {
      data.features = JSON.stringify(data.features);
    }

    const updated = await prisma.hbsService.update({
      where: { id },
      data,
    });

    return res.json({ success: true, data: updated } as ApiResponse<HbsService>);
  } catch (err) {
    console.error("[/api/hbs/services/:id PATCH]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/hbs/services/:id — Protected: Admin
router.delete("/services/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    await prisma.hbsService.delete({ where: { id } });
    return res.json({ success: true, message: "Service deleted successfully" } as ApiResponse);
  } catch (err) {
    console.error("[/api/hbs/services/:id DELETE]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// ==================================================
// 3. HBS PROJECTS / OUR WORK
// ==================================================

// GET /api/hbs/projects — Public / Admin
router.get("/projects", async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === "true";
    if (includeAll) {
      const user = await getSessionUser(req);
      if (user) {
        const allProjects = await prisma.hbsProject.findMany({
          orderBy: { order: "asc" },
        });
        return res.json({ success: true, data: allProjects } as ApiResponse<HbsProject[]>);
      }
    }

    const projects = await prisma.hbsProject.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    return res.json({ success: true, data: projects } as ApiResponse<HbsProject[]>);
  } catch (err) {
    console.error("[/api/hbs/projects GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/hbs/projects — Protected: Admin
router.post("/projects", authGuard, async (req: Request, res: Response) => {
  try {
    const { title, slug, location, serviceCategory, description, images, beforeAfterImages, date, status, active, order, metaTitle, metaDescription } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: "Title is required" } as ApiResponse);
    }

    const created = await prisma.hbsProject.create({
      data: {
        title: title.trim(),
        slug: slug?.trim() || null,
        location: location?.trim() || null,
        serviceCategory: serviceCategory?.trim() || null,
        description: description?.trim() || null,
        images: typeof images === "object" ? JSON.stringify(images) : (images || null),
        beforeAfterImages: typeof beforeAfterImages === "object" ? JSON.stringify(beforeAfterImages) : (beforeAfterImages || null),
        date: date || null,
        status: status || "completed",
        active: active !== undefined ? Boolean(active) : true,
        order: Number(order) || 0,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    return res.status(201).json({ success: true, data: created } as ApiResponse<HbsProject>);
  } catch (err) {
    console.error("[/api/hbs/projects POST]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/hbs/projects/:id — Protected: Admin
router.patch("/projects/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const data = { ...req.body };
    delete data.id;

    if (data.images && typeof data.images === "object") {
      data.images = JSON.stringify(data.images);
    }
    if (data.beforeAfterImages && typeof data.beforeAfterImages === "object") {
      data.beforeAfterImages = JSON.stringify(data.beforeAfterImages);
    }

    const updated = await prisma.hbsProject.update({
      where: { id },
      data,
    });

    return res.json({ success: true, data: updated } as ApiResponse<HbsProject>);
  } catch (err) {
    console.error("[/api/hbs/projects/:id PATCH]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/hbs/projects/:id — Protected: Admin
router.delete("/projects/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    await prisma.hbsProject.delete({ where: { id } });
    return res.json({ success: true, message: "Project deleted successfully" } as ApiResponse);
  } catch (err) {
    console.error("[/api/hbs/projects/:id DELETE]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// ==================================================
// 4. HBS TESTIMONIALS
// ==================================================

// GET /api/hbs/testimonials — Public / Admin
router.get("/testimonials", async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === "true";
    if (includeAll) {
      const user = await getSessionUser(req);
      if (user) {
        const allTestimonials = await prisma.hbsTestimonial.findMany({
          orderBy: { order: "asc" },
        });
        return res.json({ success: true, data: allTestimonials } as ApiResponse<HbsTestimonial[]>);
      }
    }

    const testimonials = await prisma.hbsTestimonial.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    return res.json({ success: true, data: testimonials } as ApiResponse<HbsTestimonial[]>);
  } catch (err) {
    console.error("[/api/hbs/testimonials GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/hbs/testimonials — Protected: Admin
router.post("/testimonials", authGuard, async (req: Request, res: Response) => {
  try {
    const { name, designation, content, image, rating, active, order } = req.body;
    if (!name || !content) {
      return res.status(400).json({ success: false, error: "Name and content are required" } as ApiResponse);
    }

    const created = await prisma.hbsTestimonial.create({
      data: {
        name: name.trim(),
        designation: designation?.trim() || null,
        content: content.trim(),
        image: image || null,
        rating: Number(rating) || 5,
        active: active !== undefined ? Boolean(active) : true,
        order: Number(order) || 0,
      },
    });

    return res.status(201).json({ success: true, data: created } as ApiResponse<HbsTestimonial>);
  } catch (err) {
    console.error("[/api/hbs/testimonials POST]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/hbs/testimonials/:id — Protected: Admin
router.patch("/testimonials/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const data = { ...req.body };
    delete data.id;

    const updated = await prisma.hbsTestimonial.update({
      where: { id },
      data,
    });

    return res.json({ success: true, data: updated } as ApiResponse<HbsTestimonial>);
  } catch (err) {
    console.error("[/api/hbs/testimonials/:id PATCH]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/hbs/testimonials/:id — Protected: Admin
router.delete("/testimonials/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    await prisma.hbsTestimonial.delete({ where: { id } });
    return res.json({ success: true, message: "Testimonial deleted successfully" } as ApiResponse);
  } catch (err) {
    console.error("[/api/hbs/testimonials/:id DELETE]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// ==================================================
// 5. HBS LEADS / QUOTE INQUIRIES
// ==================================================

// POST /api/hbs/leads — Public (Rate-Limited)
router.post("/leads", contactLimiter, async (req: Request, res: Response) => {
  try {
    const { name, phone, email, selectedService, message, source } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: "Name and phone number are required" } as ApiResponse);
    }

    const cleanPhone = phone.trim().replace(/[^\d+]/g, "");
    if (cleanPhone.length < 8) {
      return res.status(400).json({ success: false, error: "Please provide a valid contact number" } as ApiResponse);
    }

    const created = await prisma.hbsLead.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: email?.trim().toLowerCase() || null,
        selectedService: selectedService?.trim() || null,
        message: message?.trim() || null,
        source: source || "hbs_website",
        status: "new",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Quote request received! Our engineering repair team will contact you shortly.",
      data: created,
    } as ApiResponse<HbsLead>);
  } catch (err) {
    console.error("[/api/hbs/leads POST]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// GET /api/hbs/leads — Protected: Admin
router.get("/leads", authGuard, async (req: Request, res: Response) => {
  try {
    const leads = await prisma.hbsLead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: leads } as ApiResponse<HbsLead[]>);
  } catch (err) {
    console.error("[/api/hbs/leads GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/hbs/leads/:id — Protected: Admin
router.patch("/leads/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const { status, message } = req.body;

    const updated = await prisma.hbsLead.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(message !== undefined ? { message } : {}),
      },
    });

    return res.json({ success: true, data: updated } as ApiResponse<HbsLead>);
  } catch (err) {
    console.error("[/api/hbs/leads/:id PATCH]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/hbs/leads/:id — Protected: Admin
router.delete("/leads/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    await prisma.hbsLead.delete({ where: { id } });
    return res.json({ success: true, message: "Lead removed successfully" } as ApiResponse);
  } catch (err) {
    console.error("[/api/hbs/leads/:id DELETE]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
