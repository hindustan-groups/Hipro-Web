import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { ApiResponse } from "../lib/types";
import { getAutomailSettings, getDefaultMailboxes } from "../services/automail/settingsService";

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

      // 9. All Quotes, Contacts, Leads & Applications for Real Velocity & Pipeline Analytics
      allQuotesForStats,
      allContactsForStats,
      allHbsLeadsForStats,
      allVendorAppsForStats,
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

      // 9. All Quotes and Contacts for Real Velocity & Pipeline Analytics
      prisma.quoteRequest.findMany({
        select: { id: true, budget: true, location: true, status: true, createdAt: true, description: true, projectType: true },
      }),
      prisma.contactMessage.findMany({
        select: { id: true, createdAt: true },
      }),
      prisma.hbsLead.findMany({
        select: { id: true, status: true, createdAt: true },
      }),
      prisma.vendorApplication.findMany({
        select: { id: true, status: true, submittedAt: true },
      }),
    ]);

    // Calculate Real Monthly Velocity (Past 6 Calendar Months)
    const now = new Date();
    const velocityMonths: Array<{ month: string; year: number; quotes: number; contacts: number; label: string }> = [];
    const multiPortalMonths: Array<{
      month: string;
      year: number;
      hipro: number;
      hbs: number;
      vendor: number;
      totalInbound: number;
      converted: number;
      label: string;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      const monthShort = d.toLocaleString("en-US", { month: "short" });
      const monthFull = d.toLocaleString("en-US", { month: "long" });

      const qCount = allQuotesForStats.filter((q) => {
        const qd = new Date(q.createdAt);
        return qd.getMonth() === mIdx && qd.getFullYear() === y;
      }).length;

      const cCount = allContactsForStats.filter((c) => {
        const cd = new Date(c.createdAt);
        return cd.getMonth() === mIdx && cd.getFullYear() === y;
      }).length;

      const hbsCount = allHbsLeadsForStats.filter((h) => {
        const hd = new Date(h.createdAt);
        return hd.getMonth() === mIdx && hd.getFullYear() === y;
      }).length;

      const vendorCount = allVendorAppsForStats.filter((v) => {
        const vd = new Date(v.submittedAt);
        return vd.getMonth() === mIdx && vd.getFullYear() === y;
      }).length;

      const approvedQuotes = allQuotesForStats.filter((q) => {
        const qd = new Date(q.createdAt);
        return qd.getMonth() === mIdx && qd.getFullYear() === y && q.status === "approved";
      }).length;

      const convertedHbs = allHbsLeadsForStats.filter((h) => {
        const hd = new Date(h.createdAt);
        return hd.getMonth() === mIdx && hd.getFullYear() === y && h.status === "CONVERTED";
      }).length;

      const approvedVendors = allVendorAppsForStats.filter((v) => {
        const vd = new Date(v.submittedAt);
        return vd.getMonth() === mIdx && vd.getFullYear() === y && v.status === "APPROVED";
      }).length;

      const hiproCount = qCount + cCount;
      const totalInbound = hiproCount + hbsCount + vendorCount;
      const converted = approvedQuotes + convertedHbs + approvedVendors;

      velocityMonths.push({
        month: monthShort,
        year: y,
        quotes: qCount,
        contacts: cCount,
        label: i === 0 ? `${monthFull} ${y} (Current)` : `${monthFull} ${y}`,
      });

      multiPortalMonths.push({
        month: monthShort,
        year: y,
        hipro: hiproCount,
        hbs: hbsCount,
        vendor: vendorCount,
        totalInbound,
        converted,
        label: i === 0 ? `${monthFull} ${y} (Current)` : `${monthFull} ${y}`,
      });
    }

    // Calculate Real Pipeline Budget Sum
    let totalRupees = 0;
    for (const q of allQuotesForStats) {
      const b = q.budget || "";
      const crMatch = b.match(/([0-9.]+)\s*Cr/i);
      if (crMatch) {
        totalRupees += parseFloat(crMatch[1]) * 10000000;
        continue;
      }
      const lakhMatch = b.match(/([0-9.]+)\s*Lakh/i);
      if (lakhMatch) {
        totalRupees += parseFloat(lakhMatch[1]) * 100000;
        continue;
      }
      const cleaned = b.replace(/[^0-9]/g, "");
      if (cleaned.length >= 5) {
        totalRupees += parseInt(cleaned, 10);
      }
    }

    let pipelineBudget = "₹0";
    if (totalRupees >= 10000000) {
      pipelineBudget = `₹${(totalRupees / 10000000).toFixed(2)} Cr`;
    } else if (totalRupees >= 100000) {
      pipelineBudget = `₹${(totalRupees / 100000).toFixed(1)} Lakhs`;
    } else if (allQuotesForStats.length > 0) {
      pipelineBudget = `${allQuotesForStats.length} Inbound Requests`;
    }

    // Leading Territories from Real Quote Request Locations
    const locMap: Record<string, number> = {};
    let totalSqFt = 0;
    let sqFtCount = 0;

    for (const q of allQuotesForStats) {
      const loc = (q.location || "").trim();
      if (loc) {
        const match = loc.match(/(Bhilwara|Jaipur|Udaipur|Ranchi|Jamshedpur|Delhi|Kota|Ajmer|Jodhpur)/i);
        const name = match ? match[1] : loc.split(",")[0].trim();
        if (name) {
          locMap[name] = (locMap[name] || 0) + 1;
        }
      }

      // Extract Scope Area if mentioned in quote description or type
      const text = `${q.description || ""} ${q.projectType || ""}`;
      const sqftMatch = text.match(/([0-9,]+)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i);
      if (sqftMatch) {
        const parsed = parseInt(sqftMatch[1].replace(/,/g, ""), 10);
        if (parsed > 100 && parsed < 200000) {
          totalSqFt += parsed;
          sqFtCount++;
        }
      }
    }

    const avgScope =
      sqFtCount > 0
        ? `${Math.round(totalSqFt / sqFtCount).toLocaleString("en-IN")} sq.ft`
        : allQuotesForStats.length > 0
        ? "Turnkey Civil Specs"
        : "Turnkey Scope";

    const topLocations = Object.entries(locMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name]) => name);

    const leadingTerritories = topLocations.length > 0 ? topLocations.join(" / ") : "Bhilwara (HQ)";

    // Real Portal Conversion Status
    let portalConversion = "Verified Healthy";
    if (quotesTotal > 0) {
      if (quotesApproved > 0) {
        portalConversion = `${Math.round((quotesApproved / quotesTotal) * 100)}% Approved (${quotesApproved}/${quotesTotal})`;
      } else {
        portalConversion = `${quotesPending} Pending Review`;
      }
    }

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
        monthlyMetrics: multiPortalMonths,
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
        velocity: {
          months: velocityMonths,
          pipelineBudget,
          avgScope,
          leadingTerritories,
          portalConversion,
        },
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

      // ✉️ Global AutoMail & Dynamic Mailbox Radar
      automail: (() => {
        const automailConfig = getAutomailSettings();
        const rawMailboxes =
          automailConfig?.mailboxes && automailConfig.mailboxes.length > 0
            ? automailConfig.mailboxes
            : getDefaultMailboxes();

        const mailboxesWithConfig = rawMailboxes.map((mb, idx) => {
          const isConfigured = Boolean(
            mb.smtpPassConfigured ||
            (mb.smtpPass && mb.smtpPass.length > 0) ||
            Boolean(process.env.SMTP_PASS) ||
            (mb.deliveryMethod === "hostinger_api" && automailConfig?.hostingerApiToken)
          );
          const isLive = mb.status === "active" && isConfigured;

          return {
            id: mb.id || `mb_${idx}`,
            name: mb.name,
            email: mb.email,
            brand: mb.brand,
            brandName: mb.brandName || (mb.brand === "hbs" ? "HBS Repairs" : "Flagship Civil"),
            deliveryMethod: mb.deliveryMethod || "smtp",
            smtpPort: mb.smtpPort || 465,
            smtpHost: mb.smtpHost || "smtp.hostinger.com",
            status: isLive ? "active" : "needs_setup",
            isConfigured,
            description:
              mb.description ||
              (mb.brand === "hbs"
                ? "Waterproofing Inspections, Crack Repair BOQ & Quotes"
                : "Turnkey Quotes, Job Applications & Holding Master Notifications"),
            isDefault: mb.isDefault ?? (idx === 0),
          };
        });

        const activeMailboxes = mailboxesWithConfig.filter((m) => m.status === "active");

        return {
          campaigns: automailCampaignsTotal,
          dispatchesToday: automailLogsToday,
          connectedCount: activeMailboxes.length,
          totalCount: mailboxesWithConfig.length,
          mailboxes: mailboxesWithConfig,
        };
      })(),

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
