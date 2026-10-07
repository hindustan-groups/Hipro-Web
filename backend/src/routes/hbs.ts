import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import { contactLimiter } from "../middleware/rateLimiter";
import { getSessionUser } from "../lib/auth";
import { seedHbsServicesIfEmpty, seedHbsServicesAlways } from "../lib/hbsSeedData";
import {
  safeJsonParse,
  safeJsonStringify,
  safeStringArray,
  normalizeLeadStatus,
  HBS_LEAD_STATUSES,
} from "../lib/jsonSafety";
import type {
  HbsContent,
  HbsService,
  HbsProject,
  HbsTestimonial,
  HbsLead,
  HbsInternalNote,
  ApiResponse,
} from "../lib/types";

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
    const data = { ...req.body };
    delete data.id; // protect ID

    // Safely serialize complex JSON objects if provided as objects
    const jsonFields = [
      "heroCtas",
      "heroHighlights",
      "whyChooseUs",
      "stats",
      "processSteps",
      "guaranteeSection",
      "homeFinalCta",
      "team",
      "whyChoosePoints",
      "aboutImages",
      "socialLinks",
      "ctaSettings",
      "jsonLd",
    ];

    for (const field of jsonFields) {
      if (data[field] !== undefined && typeof data[field] === "object") {
        data[field] = safeJsonStringify(data[field]);
      }
    }

    const updated = await prisma.hbsContent.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    return res.json({
      success: true,
      message: "HBS content updated successfully",
      data: updated,
    } as ApiResponse<HbsContent>);
  } catch (err) {
    console.error("[/api/hbs/content PATCH]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// ==================================================
// 2. HBS SERVICES
// ==================================================

// POST /api/hbs/seed — Manual Idempotent Seed Trigger
router.post("/seed", async (req: Request, res: Response) => {
  try {
    const totalCount = await seedHbsServicesAlways(prisma);
    return res.json({
      success: true,
      message: `Successfully seeded/updated all ${totalCount} HBS services`,
      count: totalCount,
    });
  } catch (err) {
    console.error("[/api/hbs/seed POST]", err);
    return res.status(500).json({ success: false, error: "Failed to seed HBS services" });
  }
});

// GET /api/hbs/services — Public / Admin
router.get("/services", async (req: Request, res: Response) => {
  try {
    // If services table is empty, idempotently auto-seed the 19 default services
    await seedHbsServicesIfEmpty(prisma);

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

// GET /api/hbs/services/:slug — Single Service (Enriched with Parsed Detail)
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

    // Return parsed helper arrays for detail consumption
    const parsedFeatures = safeStringArray(service.features);
    const parsedBenefits = safeStringArray(service.benefits);
    const parsedProcessSteps = safeJsonParse(service.processSteps, []);
    const parsedFaqs = safeJsonParse(service.faqs, []);
    const parsedGalleryImages = safeStringArray(service.galleryImages);

    const enrichedService = {
      ...service,
      features: parsedFeatures,
      benefits: parsedBenefits,
      processSteps: parsedProcessSteps,
      faqs: parsedFaqs,
      galleryImages: parsedGalleryImages,
    };

    return res.json({ success: true, data: enrichedService });
  } catch (err) {
    console.error("[/api/hbs/services/:slug GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/hbs/services — Protected: Admin
router.post("/services", authGuard, async (req: Request, res: Response) => {
  try {
    const {
      title,
      hindiTitle,
      slug,
      serviceNumber,
      shortDescription,
      fullDescription,
      image,
      icon,
      features,
      benefits,
      processSteps,
      warrantyDetails,
      pricingEstimate,
      faqs,
      galleryImages,
      ogImage,
      whatsappCtaText,
      active,
      order,
      metaTitle,
      metaDescription,
    } = req.body;

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
        features: typeof features === "object" ? safeJsonStringify(features) : (features || null),
        benefits: typeof benefits === "object" ? safeJsonStringify(benefits) : (benefits || null),
        processSteps: typeof processSteps === "object" ? safeJsonStringify(processSteps) : (processSteps || null),
        warrantyDetails: warrantyDetails?.trim() || null,
        pricingEstimate: pricingEstimate?.trim() || null,
        faqs: typeof faqs === "object" ? safeJsonStringify(faqs) : (faqs || null),
        galleryImages: typeof galleryImages === "object" ? safeJsonStringify(galleryImages) : (galleryImages || null),
        ogImage: ogImage || null,
        whatsappCtaText: whatsappCtaText?.trim() || null,
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

    // Safely serialize complex JSON arrays
    const jsonFields = ["features", "benefits", "processSteps", "faqs", "galleryImages"];
    for (const field of jsonFields) {
      if (data[field] !== undefined && typeof data[field] === "object") {
        data[field] = safeJsonStringify(data[field]);
      }
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

// GET /api/hbs/projects/:slug — Single Project / Case Study Detail
router.get("/projects/:slug", async (req: Request, res: Response) => {
  try {
    const slug = getParam(req.params.slug);
    const project = await prisma.hbsProject.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" } as ApiResponse);
    }

    // Return parsed helper arrays for client consumption
    const parsedImages = safeStringArray(project.images);
    const parsedBeforeAfter = safeJsonParse(project.beforeAfterImages, []);
    const parsedScopeOfWork = safeStringArray(project.scopeOfWork);

    const enrichedProject = {
      ...project,
      images: parsedImages,
      beforeAfterImages: parsedBeforeAfter,
      scopeOfWork: parsedScopeOfWork,
    };

    return res.json({ success: true, data: enrichedProject });
  } catch (err) {
    console.error("[/api/hbs/projects/:slug GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/hbs/projects — Protected: Admin
router.post("/projects", authGuard, async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      location,
      serviceCategory,
      clientType,
      description,
      scopeOfWork,
      problemStatement,
      solutionStatement,
      resultStatement,
      areaTreated,
      durationDays,
      images,
      beforeAfterImages,
      date,
      status,
      featured,
      active,
      order,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: "Title is required" } as ApiResponse);
    }

    const created = await prisma.hbsProject.create({
      data: {
        title: title.trim(),
        slug: slug?.trim() || null,
        location: location?.trim() || null,
        serviceCategory: serviceCategory?.trim() || null,
        clientType: clientType?.trim() || null,
        description: description?.trim() || null,
        scopeOfWork: typeof scopeOfWork === "object" ? safeJsonStringify(scopeOfWork) : (scopeOfWork || null),
        problemStatement: problemStatement?.trim() || null,
        solutionStatement: solutionStatement?.trim() || null,
        resultStatement: resultStatement?.trim() || null,
        areaTreated: areaTreated?.trim() || null,
        durationDays: durationDays !== undefined ? Number(durationDays) : null,
        images: typeof images === "object" ? safeJsonStringify(images) : (images || null),
        beforeAfterImages: typeof beforeAfterImages === "object" ? safeJsonStringify(beforeAfterImages) : (beforeAfterImages || null),
        date: date || null,
        status: status || "completed",
        featured: Boolean(featured),
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
      data.images = safeJsonStringify(data.images);
    }
    if (data.beforeAfterImages && typeof data.beforeAfterImages === "object") {
      data.beforeAfterImages = safeJsonStringify(data.beforeAfterImages);
    }
    if (data.scopeOfWork && typeof data.scopeOfWork === "object") {
      data.scopeOfWork = safeJsonStringify(data.scopeOfWork);
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
    const {
      name,
      designation,
      content,
      image,
      rating,
      serviceSlug,
      serviceCategory,
      location,
      projectType,
      projectDate,
      featured,
      active,
      order,
    } = req.body;

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
        serviceSlug: serviceSlug?.trim() || null,
        serviceCategory: serviceCategory?.trim() || null,
        location: location?.trim() || null,
        projectType: projectType?.trim() || null,
        projectDate: projectDate?.trim() || null,
        featured: Boolean(featured),
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
// 5. HBS LEADS / CRM INQUIRIES
// ==================================================

// POST /api/hbs/leads — Public (Rate-Limited)
router.post("/leads", contactLimiter, async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      selectedService,
      selectedServices,
      location,
      preferredContact,
      message,
      source,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: "Name and phone number are required" } as ApiResponse);
    }

    const cleanPhone = phone.trim().replace(/[^\d+]/g, "");
    if (cleanPhone.length < 8) {
      return res.status(400).json({ success: false, error: "Please provide a valid contact number" } as ApiResponse);
    }

    // Support both single service and multiple service selection without arbitrary limits
    let finalService: string | null = null;
    if (Array.isArray(selectedServices) && selectedServices.length > 0) {
      finalService = selectedServices
        .filter((s: any) => typeof s === "string" && s.trim().length > 0)
        .map((s: string) => s.trim())
        .join(", ");
    } else if (typeof selectedService === "string" && selectedService.trim()) {
      finalService = selectedService.trim();
    }

    // Assemble location and preferred contact metadata into message body
    const metaPrefixParts: string[] = [];
    if (location && typeof location === "string" && location.trim()) {
      metaPrefixParts.push(`Location: ${location.trim()}`);
    }
    if (preferredContact && typeof preferredContact === "string" && preferredContact.trim()) {
      metaPrefixParts.push(`Preferred Contact: ${preferredContact.trim()}`);
    }

    let finalMessage = message && typeof message === "string" ? message.trim() : "";
    if (metaPrefixParts.length > 0) {
      const prefixStr = `[${metaPrefixParts.join(" | ")}]`;
      finalMessage = finalMessage ? `${prefixStr}\n\n${finalMessage}` : prefixStr;
    }

    // Public lead creation strictly excludes internalNotes and sets standardized status
    const created = await prisma.hbsLead.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: email?.trim().toLowerCase() || null,
        selectedService: finalService || null,
        message: finalMessage || null,
        source: source || "hbs_website",
        status: "NEW",
        priority: "MEDIUM",
      },
    });

    // Strip internalNotes from public response if present
    const { internalNotes: _hidden, ...safePublicLead } = created;

    return res.status(201).json({
      success: true,
      message: "Quote request received! Our engineering repair team will contact you shortly.",
      data: safePublicLead,
    } as ApiResponse<any>);
  } catch (err) {
    console.error("[/api/hbs/leads POST]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// GET /api/hbs/leads — Protected: Admin (With Status/Service/Search Filters & Pagination)
router.get("/leads", authGuard, async (req: Request, res: Response) => {
  try {
    const { status, service, search, page, limit } = req.query;

    const where: any = {};

    // 1. Status Filter (normalizing legacy/case variations)
    if (status && typeof status === "string" && status.toLowerCase() !== "all") {
      const normalized = normalizeLeadStatus(status);
      where.OR = [
        { status: normalized },
        { status: normalized.toLowerCase() },
      ];
    }

    // 2. Service Filter
    if (service && typeof service === "string" && service.trim().length > 0) {
      where.selectedService = {
        contains: service.trim(),
        mode: "insensitive",
      };
    }

    // 3. Search Filter across customer info
    if (search && typeof search === "string" && search.trim().length > 0) {
      const q = search.trim();
      where.AND = [
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
            { selectedService: { contains: q, mode: "insensitive" } },
          ],
        },
      ];
    }

    // Pagination support
    const hasPagination = page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, parseInt(String(page || 1), 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(String(limit || 50), 10)));

    if (hasPagination) {
      const total = await prisma.hbsLead.count({ where });
      const rawLeads = await prisma.hbsLead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      });

      // Parse internalNotes into JSON for admin convenience
      const leads = rawLeads.map((l) => ({
        ...l,
        internalNotes: safeJsonParse<HbsInternalNote[]>(l.internalNotes, []),
      }));

      return res.json({
        success: true,
        data: leads,
        pagination: {
          total,
          page: pageNum,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    }

    // Unpaginated fallback for backward compatibility
    const rawLeads = await prisma.hbsLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const leads = rawLeads.map((l) => ({
      ...l,
      internalNotes: safeJsonParse<HbsInternalNote[]>(l.internalNotes, []),
    }));

    return res.json({ success: true, data: leads } as ApiResponse<HbsLead[]>);
  } catch (err) {
    console.error("[/api/hbs/leads GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// POST /api/hbs/leads/:id/notes — Protected: Admin (Add Private Internal Note)
router.post("/leads/:id/notes", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const { note } = req.body;

    if (!note || typeof note !== "string" || !note.trim()) {
      return res.status(400).json({ success: false, error: "Note content is required" } as ApiResponse);
    }

    const lead = await prisma.hbsLead.findUnique({
      where: { id },
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" } as ApiResponse);
    }

    const sessionUser = await getSessionUser(req);
    const authorName = sessionUser?.name || sessionUser?.email || "Supervisor";

    const existingNotes: HbsInternalNote[] = safeJsonParse(lead.internalNotes, []);
    const newNote: HbsInternalNote = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      author: authorName,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [...existingNotes, newNote];

    await prisma.hbsLead.update({
      where: { id },
      data: {
        internalNotes: JSON.stringify(updatedNotes),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Internal note recorded successfully",
      data: updatedNotes,
    });
  } catch (err) {
    console.error("[/api/hbs/leads/:id/notes POST]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/hbs/leads/:id — Protected: Admin
router.patch("/leads/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const { status, message, assignedTo, quotationAmount, priority } = req.body;

    const data: any = {};
    if (status !== undefined) {
      data.status = normalizeLeadStatus(status);
    }
    if (message !== undefined) {
      data.message = message;
    }
    if (assignedTo !== undefined) {
      data.assignedTo = assignedTo ? String(assignedTo).trim() : null;
    }
    if (quotationAmount !== undefined) {
      data.quotationAmount = quotationAmount !== null ? Number(quotationAmount) : null;
    }
    if (priority !== undefined) {
      data.priority = String(priority).toUpperCase();
    }

    const updated = await prisma.hbsLead.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      data: {
        ...updated,
        internalNotes: safeJsonParse<HbsInternalNote[]>(updated.internalNotes, []),
      },
    } as ApiResponse<HbsLead>);
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
