import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { ApiResponse } from "../lib/types";

const router = Router();

// Apply auth guard to protect dashboard stats
router.use(authGuard);

// GET /api/dashboard — Ultra-fast parallel multi-portal corporate executive summary
router.get("/", async (req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      // 1. HiPRO: Contacts counts
      contactsTotal,
      contactsNew,
      contactsReplied,

      // 2. HiPRO: Quotes counts
      quotesTotal,
      quotesPending,
      quotesApproved,

      // 3. HiPRO: Projects & Services
      projectsTotal,
      projectsActive,
      projectsFeatured,
      servicesTotal,
      servicesActive,

      // 4. HiPRO: Blogs, Careers, Testimonials, Team, Hero, Stats & Guarantees
      blogsTotal,
      blogsPublished,
      applicationsTotal,
      applicationsNew,
      jobPostingsTotal,
      testimonialsTotal,
      teamTotal,
      heroSlidesTotal,
      statsTotal,
      guaranteesTotal,
      subscribersTotal,

      // 5. HBS: Leads & Services
      hbsLeadsTotal,
      hbsLeadsNew,
      hbsLeadsConverted,
      hbsServicesTotal,
      hbsProjectsTotal,

      // 6. Vendor Hub: Applications, Tenders & Passes
      vendorAppsTotal,
      vendorAppsSubmitted,
      vendorAppsApproved,
      tendersTotal,
      tendersActive,
      gatePassesTotal,
      gatePassesToday,

      // 7. AutoMail Engine
      automailCampaignsTotal,
      automailLogsToday,

      // 8. Recent Feeds across all 3 portals
      recentQuotes,
      recentContacts,
      recentProjects,
      recentServices,
      recentHbsLeads,
      recentVendorApps,
      recentApplications,
    ] = await Promise.all([
      // HiPRO Contacts
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "new" } }),
      prisma.contactMessage.count({ where: { status: "replied" } }),

      // HiPRO Quotes
      prisma.quoteRequest.count(),
      prisma.quoteRequest.count({ where: { status: "pending" } }),
      prisma.quoteRequest.count({ where: { status: "approved" } }),

      // HiPRO Projects & Services
      prisma.project.count(),
      prisma.project.count({ where: { status: { not: "archived" } } }),
      prisma.project.count({ where: { featured: true } }),
      prisma.service.count(),
      prisma.service.count({ where: { active: true } }),

      // HiPRO Blogs, Careers, Testimonials, Team, Hero, Stats & Guarantees
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: "published", active: true } }),
      prisma.jobApplication.count(),
      prisma.jobApplication.count({ where: { status: "new" } }),
      prisma.jobPosting.count(),
      prisma.testimonial.count(),
      prisma.teamMember.count(),
      prisma.heroSlide.count(),
      prisma.stats.count(),
      prisma.guarantee.count(),
      prisma.newsletterSubscriber.count(),

      // HBS (Hind Building Solutions)
      prisma.hbsLead.count(),
      prisma.hbsLead.count({ where: { status: "NEW" } }),
      prisma.hbsLead.count({ where: { status: "CONVERTED" } }),
      prisma.hbsService.count({ where: { active: true } }),
      prisma.hbsProject.count(),

      // Vendor Empanelment & Procurement Hub
      prisma.vendorApplication.count(),
      prisma.vendorApplication.count({ where: { status: "SUBMITTED" } }),
      prisma.vendorApplication.count({ where: { status: "APPROVED" } }),
      prisma.empanelmentTender.count(),
      prisma.empanelmentTender.count({ where: { status: "PUBLISHED" } }),
      prisma.siteGatePass.count(),
      prisma.siteGatePass.count({ where: { createdAt: { gte: todayStart } } }),

      // AutoMail Engine
      prisma.automailCampaign.count(),
      prisma.automailSendLog.count({ where: { createdAt: { gte: todayStart } } }),

      // Recent 5 Quotes (HiPRO)
      prisma.quoteRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true, projectType: true, budget: true, status: true, createdAt: true },
      }),

      // Recent 5 Contacts (HiPRO)
      prisma.contactMessage.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true, message: true, status: true, createdAt: true },
      }),

      // Recent 6 Projects (HiPRO)
      prisma.project.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, category: true, location: true, client: true, featured: true, status: true, createdAt: true },
      }),

      // Recent 6 Services (HiPRO)
      prisma.service.findMany({
        take: 6,
        orderBy: { order: "asc" },
        select: { id: true, title: true, category: true, active: true, order: true },
      }),

      // Recent 5 HBS Leads
      prisma.hbsLead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, phone: true, email: true, selectedService: true, status: true, createdAt: true },
      }),

      // Recent 5 Vendor Applications
      prisma.vendorApplication.findMany({
        take: 5,
        orderBy: { submittedAt: "desc" },
        select: { id: true, trackingId: true, companyName: true, contactName: true, email: true, phone: true, category: true, tier: true, status: true, submittedAt: true },
      }),

      // Recent 5 Job Applications
      prisma.jobApplication.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, experience: true, cvUrl: true, status: true, createdAt: true },
      }),
    ]);

    // High-Level Cross-Company Metrics
    const totalInquiries = quotesTotal + contactsTotal + hbsLeadsTotal + vendorAppsTotal;
    const pendingActions = quotesPending + contactsNew + hbsLeadsNew + vendorAppsSubmitted + applicationsNew;

    const summary = {
      // 🏢 Corporate Executive Totals
      executive: {
        totalInquiries,
        pendingActions,
        activePortalsCount: 3,
        systemHealth: "100% Operational",
      },

      // 🌐 Portal 1: HiPRO Corporate
      hipro: {
        projects: { total: projectsTotal, active: projectsActive, featured: projectsFeatured },
        services: { total: servicesTotal, active: servicesActive },
        quotes: { total: quotesTotal, pending: quotesPending, approved: quotesApproved },
        contacts: { total: contactsTotal, new: contactsNew, replied: contactsReplied },
        blogs: { total: blogsTotal, published: blogsPublished },
        careers: { total: applicationsTotal, new: applicationsNew, openJobs: jobPostingsTotal },
        testimonials: { total: testimonialsTotal },
        team: { total: teamTotal },
        hero: { total: heroSlidesTotal },
        stats: { total: statsTotal },
        guarantees: { total: guaranteesTotal },
        subscribers: { total: subscribersTotal },
      },

      // 🏢 Portal 2: Hind Building Solutions (HBS)
      hbs: {
        leads: { total: hbsLeadsTotal, new: hbsLeadsNew, converted: hbsLeadsConverted },
        services: { total: hbsServicesTotal },
        projects: { total: hbsProjectsTotal },
      },

      // 🛡️ Portal 3: Vendor Empanelment & Procurement Hub
      vendorHub: {
        applications: { total: vendorAppsTotal, submitted: vendorAppsSubmitted, approved: vendorAppsApproved },
        tenders: { total: tendersTotal, active: tendersActive },
        gatePasses: { total: gatePassesTotal, today: gatePassesToday },
      },

      // ✉️ Global AutoMail
      automail: {
        campaigns: automailCampaignsTotal,
        dispatchesToday: automailLogsToday,
      },

      // Cross-Portal Recent Feed
      recentQuotes,
      recentContacts,
      recentProjects,
      recentServices,
      recentHbsLeads,
      recentVendorApps,
      recentApplications,
    };

    return res.json({ success: true, data: summary } as ApiResponse);
  } catch (err: any) {
    console.error("[Dashboard API error]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
