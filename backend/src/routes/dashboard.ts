import { Router, Request, Response } from "express";
import { readDB } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { ContactMessage, QuoteRequest, NewsletterSubscriber, Project, Testimonial, ApiResponse } from "../lib/types";

const router = Router();

// Apply auth guard to protect dashboard stats
router.use(authGuard);

// GET /api/dashboard — summary stats for admin
router.get("/", async (req: Request, res: Response) => {
  try {
    const contacts     = await readDB<ContactMessage>("contacts");
    const quotes       = await readDB<QuoteRequest>("quotes");
    const subscribers  = await readDB<NewsletterSubscriber>("newsletter");
    const projects     = await readDB<Project>("projects");
    const testimonials = await readDB<Testimonial>("testimonials");

    const summary = {
      contacts: {
        total: contacts.length,
        new:     contacts.filter((c) => c.status === "new").length,
        read:    contacts.filter((c) => c.status === "read").length,
        replied: contacts.filter((c) => c.status === "replied").length,
      },
      quotes: {
        total:    quotes.length,
        pending:  quotes.filter((q) => q.status === "pending").length,
        reviewed: quotes.filter((q) => q.status === "reviewed").length,
        approved: quotes.filter((q) => q.status === "approved").length,
        rejected: quotes.filter((q) => q.status === "rejected").length,
      },
      newsletter: {
        total: subscribers.filter((s) => s.active !== false).length,
      },
      projects: {
        total:    projects.length,
        active:   projects.filter((p) => p.status !== "archived").length,
        featured: projects.filter((p) => p.featured).length,
      },
      testimonials: {
        total:    testimonials.length,
        pending:  testimonials.filter((t) => !t.approved).length,
        approved: testimonials.filter((t) => t.approved).length,
      },
      recentContacts:  contacts.slice(-5).reverse(),
      recentQuotes:    quotes.slice(-5).reverse(),
    };

    return res.json({ success: true, data: summary } as ApiResponse);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
