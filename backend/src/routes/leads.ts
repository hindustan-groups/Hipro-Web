import { Router, Request, Response } from "express";
import { prisma, findAll, updateOne, deleteOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { ContactMessage, QuoteRequest, JobApplication, NewsletterSubscriber, ApiResponse } from "../lib/types";

const router = Router();

// Apply authGuard to all lead management endpoints
router.use(authGuard);

export interface UnifiedLead {
  id: string;
  type: "contact" | "quote" | "estimator" | "project" | "service" | "application" | "newsletter";
  source: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  details: {
    service?: string;
    projectType?: string;
    budget?: string;
    location?: string;
    timeline?: string;
    role?: string;
    experience?: string;
    cvUrl?: string;
    message?: string;
    description?: string;
    active?: boolean;
    [key: string]: any;
  };
}

function normalizeContactMessage(c: any): UnifiedLead {
  let type: UnifiedLead["type"] = "contact";
  let source = "Contact Page Form";

  const s = (c.service || "").toLowerCase();
  const m = (c.message || "").toLowerCase();

  if (s.includes("project enquiry") || s.includes("project inquiry") || m.includes("project enquiry")) {
    type = "project";
    source = "Project Detail Page";
  } else if (s.includes("service enquiry") || s.includes("service inquiry") || m.includes("service enquiry")) {
    type = "service";
    source = "Service Detail Page";
  } else if (m.includes("quick quote requested from hero") || m.includes("[custom requirement")) {
    type = "quote";
    source = "Hero Quote Form";
  } else if (c.service) {
    source = `Contact Form: ${c.service}`;
  }

  return {
    id: c.id,
    type,
    source,
    name: c.name || "Anonymous",
    email: c.email || "",
    phone: c.phone || "",
    status: c.status || "new",
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
    details: {
      service: c.service || "",
      message: c.message || "",
    },
  };
}

function normalizeQuoteRequest(q: any): UnifiedLead {
  let type: UnifiedLead["type"] = "quote";
  let source = "Quote Request Form";

  const p = (q.projectType || "").toLowerCase();
  const d = (q.description || "").toLowerCase();

  if (p.includes("cost estimator") || d.includes("cost calculator") || d.includes("cost estimator")) {
    type = "estimator";
    source = "Cost Estimator Calculator";
  } else if (p.includes("consultation request") || d.includes("free consultation via website popup")) {
    type = "quote";
    source = "Consultation Popup Modal";
  } else {
    source = q.projectType ? `Quote: ${q.projectType}` : "Request A Quote";
  }

  return {
    id: q.id,
    type,
    source,
    name: q.name || "Anonymous",
    email: q.email || "",
    phone: q.phone || "",
    status: q.status || "pending",
    createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: q.updatedAt ? new Date(q.updatedAt).toISOString() : undefined,
    details: {
      projectType: q.projectType || "",
      budget: q.budget || "",
      location: q.location || "",
      timeline: q.timeline || "",
      description: q.description || "",
    },
  };
}

function normalizeJobApplication(a: any): UnifiedLead {
  return {
    id: a.id,
    type: "application",
    source: `Careers: ${a.role || "Job Applicant"}`,
    name: a.name || "Candidate",
    email: a.email || "",
    phone: a.phone || "",
    status: a.status || "new",
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
    details: {
      role: a.role || "",
      experience: a.experience || "",
      cvUrl: a.cvUrl || "",
    },
  };
}

function normalizeNewsletter(s: any): UnifiedLead {
  return {
    id: s.id,
    type: "newsletter",
    source: "Newsletter Subscription",
    name: s.email ? s.email.split("@")[0] : "Subscriber",
    email: s.email || "",
    phone: "",
    status: s.active !== false ? "active" : "archived",
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    details: {
      active: s.active !== false,
    },
  };
}

// GET /api/leads — Unified Lead Management Hub list
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      type,
      status,
      search,
      page = "1",
      limit = "25",
      sort = "newest",
    } = req.query;

    const [contacts, quotes, applications, subscribers] = await Promise.all([
      findAll<ContactMessage>("contacts").catch(() => []),
      findAll<QuoteRequest>("quotes").catch(() => []),
      findAll<JobApplication>("applications").catch(() => []),
      findAll<NewsletterSubscriber>("newsletter").catch(() => []),
    ]);

    // Normalize all records
    const allLeads: UnifiedLead[] = [
      ...contacts.map(normalizeContactMessage),
      ...quotes.map(normalizeQuoteRequest),
      ...applications.map(normalizeJobApplication),
      ...subscribers.map(normalizeNewsletter),
    ];

    // Compute category counts for tab badges (before filters)
    const counts = {
      all: allLeads.length,
      contact: allLeads.filter((l) => l.type === "contact").length,
      quote: allLeads.filter((l) => l.type === "quote").length,
      estimator: allLeads.filter((l) => l.type === "estimator").length,
      project: allLeads.filter((l) => l.type === "project").length,
      service: allLeads.filter((l) => l.type === "service").length,
      application: allLeads.filter((l) => l.type === "application").length,
      newsletter: allLeads.filter((l) => l.type === "newsletter").length,
      new: allLeads.filter((l) => ["new", "pending"].includes((l.status || "").toLowerCase())).length,
      archived: allLeads.filter((l) => (l.status || "").toLowerCase() === "archived").length,
    };

    // Apply Type Filter
    let filtered = allLeads;
    if (type && type !== "all") {
      filtered = filtered.filter((l) => l.type === type);
    }

    // Apply Status Filter
    if (status && status !== "all") {
      const targetStatus = (status as string).toLowerCase();
      filtered = filtered.filter((l) => {
        const current = (l.status || "").toLowerCase();
        if (targetStatus === "new") return current === "new" || current === "pending";
        if (targetStatus === "contacted") return current === "contacted" || current === "reviewed";
        if (targetStatus === "converted") return current === "converted" || current === "approved" || current === "interviewed";
        if (targetStatus === "closed") return current === "closed" || current === "rejected";
        return current === targetStatus;
      });
    }

    // Apply Search Query
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((l) => {
        return (
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          (l.details.service && l.details.service.toLowerCase().includes(q)) ||
          (l.details.projectType && l.details.projectType.toLowerCase().includes(q)) ||
          (l.details.role && l.details.role.toLowerCase().includes(q)) ||
          (l.details.message && l.details.message.toLowerCase().includes(q)) ||
          (l.details.description && l.details.description.toLowerCase().includes(q))
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sort === "oldest" ? timeA - timeB : timeB - timeA;
    });

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 25);
    const total = filtered.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedLeads = filtered.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      data: paginatedLeads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      counts,
    });
  } catch (err) {
    console.error("[/api/leads GET]", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
});

// GET /api/leads/:id — get lead details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!id) return res.status(400).json({ success: false, error: "Lead ID required" });

    // Try finding in ContactMessage
    const contact = await prisma.contactMessage.findUnique({ where: { id } }).catch(() => null);
    if (contact) return res.json({ success: true, data: normalizeContactMessage(contact) });

    // Try finding in QuoteRequest
    const quote = await prisma.quoteRequest.findUnique({ where: { id } }).catch(() => null);
    if (quote) return res.json({ success: true, data: normalizeQuoteRequest(quote) });

    // Try finding in JobApplication
    const app = await prisma.jobApplication.findUnique({ where: { id } }).catch(() => null);
    if (app) return res.json({ success: true, data: normalizeJobApplication(app) });

    // Try finding in NewsletterSubscriber
    const sub = await prisma.newsletterSubscriber.findUnique({ where: { id } }).catch(() => null);
    if (sub) return res.json({ success: true, data: normalizeNewsletter(sub) });

    return res.status(404).json({ success: false, error: "Lead record not found" });
  } catch (err) {
    console.error("[/api/leads/:id GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/leads/:id — update lead status
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ success: false, error: "id and status are required" });
    }

    // Try updating ContactMessage
    const contact = await prisma.contactMessage.findUnique({ where: { id } }).catch(() => null);
    if (contact) {
      const updated = await prisma.contactMessage.update({ where: { id }, data: { status } });
      return res.json({ success: true, data: normalizeContactMessage(updated) });
    }

    // Try updating QuoteRequest
    const quote = await prisma.quoteRequest.findUnique({ where: { id } }).catch(() => null);
    if (quote) {
      const updated = await prisma.quoteRequest.update({ where: { id }, data: { status } });
      return res.json({ success: true, data: normalizeQuoteRequest(updated) });
    }

    // Try updating JobApplication
    const app = await prisma.jobApplication.findUnique({ where: { id } }).catch(() => null);
    if (app) {
      const updated = await prisma.jobApplication.update({ where: { id }, data: { status } });
      return res.json({ success: true, data: normalizeJobApplication(updated) });
    }

    // Try updating NewsletterSubscriber
    const sub = await prisma.newsletterSubscriber.findUnique({ where: { id } }).catch(() => null);
    if (sub) {
      const active = status !== "archived" && status !== "unsubscribed";
      const updated = await prisma.newsletterSubscriber.update({ where: { id }, data: { active } });
      return res.json({ success: true, data: normalizeNewsletter(updated) });
    }

    return res.status(404).json({ success: false, error: "Lead record not found" });
  } catch (err) {
    console.error("[/api/leads/:id PATCH]", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/leads/:id — safely delete lead by ID
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!id) return res.status(400).json({ success: false, error: "Lead ID is required" });

    // Try deleting from ContactMessage
    const contact = await prisma.contactMessage.findUnique({ where: { id } }).catch(() => null);
    if (contact) {
      await prisma.contactMessage.delete({ where: { id } });
      return res.json({ success: true, message: "Contact lead deleted successfully", deletedId: id });
    }

    // Try deleting from QuoteRequest
    const quote = await prisma.quoteRequest.findUnique({ where: { id } }).catch(() => null);
    if (quote) {
      await prisma.quoteRequest.delete({ where: { id } });
      return res.json({ success: true, message: "Quote lead deleted successfully", deletedId: id });
    }

    // Try deleting from JobApplication
    const app = await prisma.jobApplication.findUnique({ where: { id } }).catch(() => null);
    if (app) {
      await prisma.jobApplication.delete({ where: { id } });
      return res.json({ success: true, message: "Job application lead deleted successfully", deletedId: id });
    }

    // Try deleting from NewsletterSubscriber
    const sub = await prisma.newsletterSubscriber.findUnique({ where: { id } }).catch(() => null);
    if (sub) {
      await prisma.newsletterSubscriber.delete({ where: { id } });
      return res.json({ success: true, message: "Newsletter subscriber deleted successfully", deletedId: id });
    }

    return res.status(404).json({ success: false, error: "Lead record not found or already deleted" });
  } catch (err) {
    console.error("[/api/leads/:id DELETE]", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});


export default router;
