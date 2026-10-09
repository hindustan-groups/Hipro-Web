import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { ApiResponse } from "../lib/types";

const router = Router();

// Apply auth guard to protect dashboard stats
router.use(authGuard);

// GET /api/dashboard — ultra-fast parallel summary stats for admin
router.get("/", async (req: Request, res: Response) => {
  try {
    const [
      // 1. Contacts counts
      contactsTotal,
      contactsNew,
      contactsRead,
      contactsReplied,

      // 2. Quotes counts
      quotesTotal,
      quotesPending,
      quotesReviewed,
      quotesApproved,
      quotesRejected,

      // 3. Newsletter
      newsletterTotal,

      // 4. Projects
      projectsTotal,
      projectsActive,
      projectsFeatured,

      // 5. Testimonials
      testimonialsTotal,
      testimonialsPending,
      testimonialsApproved,

      // 6. Blogs
      blogsTotal,
      blogsPublished,
      blogsDrafts,

      // 7. Applications
      applicationsTotal,
      applicationsNew,

      // 8. Services
      servicesTotal,
      servicesActive,

      // 9. Recent feeds (lightweight selects, limited to 5)
      recentContacts,
      recentQuotes,
      recentBlogs,
      recentApplications,
    ] = await Promise.all([
      // Contacts
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "new" } }),
      prisma.contactMessage.count({ where: { status: "read" } }),
      prisma.contactMessage.count({ where: { status: "replied" } }),

      // Quotes
      prisma.quoteRequest.count(),
      prisma.quoteRequest.count({ where: { status: "pending" } }),
      prisma.quoteRequest.count({ where: { status: "reviewed" } }),
      prisma.quoteRequest.count({ where: { status: "approved" } }),
      prisma.quoteRequest.count({ where: { status: "rejected" } }),

      // Newsletter
      prisma.newsletterSubscriber.count({ where: { active: true } }),

      // Projects
      prisma.project.count(),
      prisma.project.count({ where: { status: { not: "archived" } } }),
      prisma.project.count({ where: { featured: true } }),

      // Testimonials
      prisma.testimonial.count(),
      prisma.testimonial.count({ where: { approved: false } }),
      prisma.testimonial.count({ where: { approved: true } }),

      // Blogs
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: "published", active: true } }),
      prisma.blogPost.count({ where: { OR: [{ status: "draft" }, { active: false }] } }),

      // Applications
      prisma.jobApplication.count(),
      prisma.jobApplication.count({ where: { status: "new" } }),

      // Services
      prisma.service.count(),
      prisma.service.count({ where: { active: true } }),

      // Recent items (only fetch required lightweight fields)
      prisma.contactMessage.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true, message: true, status: true, createdAt: true },
      }),
      prisma.quoteRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true, projectType: true, budget: true, status: true, createdAt: true },
      }),
      prisma.blogPost.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true, status: true, category: true, date: true, createdAt: true },
      }),
      prisma.jobApplication.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, experience: true, cvUrl: true, status: true, createdAt: true },
      }),
    ]);

    const summary = {
      contacts: {
        total: contactsTotal,
        new: contactsNew,
        read: contactsRead,
        replied: contactsReplied,
      },
      quotes: {
        total: quotesTotal,
        pending: quotesPending,
        reviewed: quotesReviewed,
        approved: quotesApproved,
        rejected: quotesRejected,
      },
      newsletter: {
        total: newsletterTotal,
      },
      projects: {
        total: projectsTotal,
        active: projectsActive,
        featured: projectsFeatured,
      },
      testimonials: {
        total: testimonialsTotal,
        pending: testimonialsPending,
        approved: testimonialsApproved,
      },
      blogs: {
        total: blogsTotal,
        published: blogsPublished,
        drafts: blogsDrafts,
      },
      applications: {
        total: applicationsTotal,
        new: applicationsNew,
      },
      services: {
        total: servicesTotal,
        active: servicesActive,
      },
      recentContacts,
      recentQuotes,
      recentBlogs,
      recentApplications,
    };

    return res.json({ success: true, data: summary } as ApiResponse);
  } catch (err: any) {
    console.error("[Dashboard API error]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
