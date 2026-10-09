import { Router, Request, Response } from "express";
import multer from "multer";
import { prisma } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import {
  sendOneEmail,
  processCampaignQueue,
  stopSending,
  getSendingStatus,
  getTodaySentCount,
  testSmtpConnection,
  personalizeContent,
  getBrandConfigs,
  getTransporter,
  BRAND_CONFIGS,
} from "../services/automail/emailSender";
import { parseContactsFile } from "../services/automail/csvParser";
import {
  getAutomailSettings,
  saveAutomailSettings,
  AutomailSettings,
} from "../services/automail/settingsService";
import {
  getCustomTemplates,
  createCustomTemplate,
  updateCustomTemplate,
  deleteCustomTemplate,
} from "../services/automail/customTemplatesService";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Protect all automail endpoints with admin authentication
router.use(authGuard);

// ----------------------------------------------------
// 1. DASHBOARD & STATS
// ----------------------------------------------------
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { brand } = req.query;

    const brandFilter = brand && brand !== "all" ? { brand: String(brand) } : {};

    const [totalContacts, totalCampaigns, totalSent, totalFailed, sentToday, dailyStats] = await Promise.all([
      (prisma as any).automailContact.count({ where: brandFilter }),
      (prisma as any).automailCampaign.count({ where: brandFilter }),
      (prisma as any).automailSendLog.count({ where: { status: "sent", ...(brandFilter.brand ? { brand: brandFilter.brand } : {}) } }),
      (prisma as any).automailSendLog.count({ where: { status: "failed", ...(brandFilter.brand ? { brand: brandFilter.brand } : {}) } }),
      getTodaySentCount(),
      (prisma as any).automailDailyStat.findMany({
        take: 7,
        orderBy: { date: "desc" },
      }),
    ]);

    // Brand distribution
    const [hiproContacts, hbsContacts] = await Promise.all([
      (prisma as any).automailContact.count({ where: { brand: "hipro" } }),
      (prisma as any).automailContact.count({ where: { brand: "hbs" } }),
    ]);

    const settings = getAutomailSettings();
    const dailyLimit = settings.dailyLimit || 200;
    const rateLimit = settings.rateLimitPerMinute || 5;

    const totalProcessed = totalSent + totalFailed;
    const successRate = totalProcessed > 0 ? Math.round((totalSent / totalProcessed) * 100) : 100;

    return res.json({
      success: true,
      stats: {
        totalContacts,
        totalCampaigns,
        totalSent,
        totalFailed,
        sentToday,
        dailyLimit,
        rateLimit,
        successRate,
        brandDistribution: {
          hipro: hiproContacts,
          hbs: hbsContacts,
          general: totalContacts - (hiproContacts + hbsContacts),
        },
        recentStats: dailyStats.reverse(),
      },
      brands: getBrandConfigs(),
      settings: {
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        smtpConfigured: Boolean(settings.smtpPass),
      },
    });
  } catch (err: any) {
    console.error("[AUTOMAIL] Stats error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to load stats" });
  }
});

// Settings Management
router.get("/settings", (req: Request, res: Response) => {
  try {
    const settings = getAutomailSettings();
    return res.json({
      success: true,
      settings: {
        ...settings,
        smtpPassConfigured: Boolean(settings.smtpPass),
        smtpPass: settings.smtpPass ? "••••••••••••" : "",
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/settings", (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    if (body.smtpPass === "••••••••••••" || !body.smtpPass) {
      delete body.smtpPass;
    }
    const updated = saveAutomailSettings(body);
    return res.json({
      success: true,
      message: "AutoMail settings saved successfully!",
      settings: {
        ...updated,
        smtpPassConfigured: Boolean(updated.smtpPass),
        smtpPass: updated.smtpPass ? "••••••••••••" : "",
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/settings/test", async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    if (body.smtpPass === "••••••••••••" || !body.smtpPass) {
      const current = getAutomailSettings();
      body.smtpPass = current.smtpPass;
    }
    const result = await testSmtpConnection(body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// CUSTOM & IMPORTED EMAIL TEMPLATES
// ----------------------------------------------------
router.get("/custom-templates", (req: Request, res: Response) => {
  try {
    const templates = getCustomTemplates();
    const { brand } = req.query;
    const filtered = brand && brand !== "all"
      ? templates.filter((t) => t.brand === brand || t.brand === "all")
      : templates;
    return res.json({ success: true, templates: filtered });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/custom-templates", (req: Request, res: Response) => {
  try {
    const { title, category, brand, description, subject, senderName, senderEmail, html } = req.body;
    if (!title || !subject || !html) {
      return res.status(400).json({ success: false, error: "Title, subject, and HTML body are required" });
    }
    const template = createCustomTemplate({
      title,
      category,
      brand,
      description,
      subject,
      senderName,
      senderEmail,
      html,
    });
    return res.status(201).json({ success: true, template, message: "Custom template created successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/custom-templates/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = updateCustomTemplate(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }
    return res.json({ success: true, template: updated, message: "Template updated successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/custom-templates/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = deleteCustomTemplate(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }
    return res.json({ success: true, message: "Template deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/custom-templates/import-file", upload.single("file"), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No HTML file provided" });
    }

    const htmlContent = req.file.buffer.toString("utf-8");
    const filename = req.file.originalname || "imported_template.html";
    const brand = (req.body.brand as any) || "all";
    const category = req.body.category || "Imported Design";

    // Auto extract title from <title> tag if available
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const extractedTitle = titleMatch ? titleMatch[1].trim() : filename.replace(/\.(html|htm)$/i, "");

    // Auto extract subject if provided or fallback
    const subject = req.body.subject || extractedTitle || "Official Update from Hindustan Projects";

    const template = createCustomTemplate({
      title: req.body.title || extractedTitle || "Imported Email Template",
      category,
      brand,
      description: `Imported from ${filename} on ${new Date().toLocaleDateString()}`,
      subject,
      senderName: req.body.senderName,
      senderEmail: req.body.senderEmail,
      html: htmlContent,
    });

    return res.status(201).json({
      success: true,
      template,
      message: `HTML template "${template.title}" imported successfully!`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Test SMTP connection status
router.get("/test-connection", async (req: Request, res: Response) => {
  try {
    const result = await testSmtpConnection();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Send single test email
router.post("/send-test", async (req: Request, res: Response) => {
  try {
    const { to, subject, htmlBody, brand = "all" } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: "Recipient email is required" });
    }

    const testSubject = subject ? `[TEST] ${subject}` : "[TEST] Hindustan Projects Email Test";
    const testBody = htmlBody || `<p>This is a test email sent from <strong>Hindustan Projects AutoMail Engine</strong>.</p>`;

    const info = await sendOneEmail({
      to,
      subject: testSubject,
      htmlBody: testBody,
      brand,
    });

    return res.json({ success: true, message: `Test email sent to ${to}!`, messageId: info.messageId });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to send test email" });
  }
});

// Direct single email send (for CRM Leads, Inquiries, Quotes)
router.post("/send-single", async (req: Request, res: Response) => {
  try {
    const { to, name, subject, htmlBody, textBody, brand = "all", senderName, senderEmail } = req.body;
    if (!to || !to.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid recipient email address is required" });
    }
    if (!subject) {
      return res.status(400).json({ success: false, error: "Subject line is required" });
    }
    if (!htmlBody) {
      return res.status(400).json({ success: false, error: "Email body content is required" });
    }

    const cleanEmail = to.trim().toLowerCase();
    const contactName = name ? String(name).trim() : cleanEmail.split("@")[0];

    // Personalize content
    const personalizedHtml = personalizeContent(htmlBody, { name: contactName, email: cleanEmail }, brand);
    const personalizedText = textBody ? personalizeContent(textBody, { name: contactName, email: cleanEmail }, brand) : undefined;

    // Send single email via SMTP
    const info = await sendOneEmail({
      to: cleanEmail,
      subject,
      htmlBody: personalizedHtml,
      textBody: personalizedText,
      senderName,
      senderEmail,
      brand,
    });

    // Upsert contact so audience database updates automatically
    await (prisma as any).automailContact.upsert({
      where: { email: cleanEmail },
      create: { email: cleanEmail, name: contactName, brand, source: "crm_single_send" },
      update: { name: contactName || undefined },
    }).catch(() => null);

    // Increment today stats
    const today = new Date().toISOString().split("T")[0];
    await (prisma as any).automailDailyStat.upsert({
      where: { date: today },
      create: { date: today, totalSent: 1, totalFailed: 0 },
      update: { totalSent: { increment: 1 } },
    }).catch(() => null);

    return res.json({
      success: true,
      message: `Email successfully delivered to ${cleanEmail}!`,
      messageId: info.messageId,
    });
  } catch (err: any) {
    console.error("[AUTOMAIL] Send single email error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to deliver email" });
  }
});

// ----------------------------------------------------
// 2. CAMPAIGN MANAGEMENT
// ----------------------------------------------------
router.get("/campaigns", async (req: Request, res: Response) => {
  try {
    const { brand, search, status } = req.query;

    const where: any = {};
    if (brand && brand !== "all") where.brand = String(brand);
    if (status && status !== "all") where.status = String(status);
    if (search && typeof search === "string" && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { subject: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const campaigns = await (prisma as any).automailCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, campaigns });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await (prisma as any).automailCampaign.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 500,
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, error: "Campaign not found" });
    }

    const queued = campaign.logs.filter((l: any) => l.status === "queued").length;
    const sent = campaign.logs.filter((l: any) => l.status === "sent").length;
    const failed = campaign.logs.filter((l: any) => l.status === "failed").length;

    return res.json({
      success: true,
      campaign,
      summary: {
        total: campaign.logs.length,
        queued,
        sent,
        failed,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/campaigns", async (req: Request, res: Response) => {
  try {
    const { name, subject, brand = "all", senderName, senderEmail, replyTo, htmlBody, textBody, template = "custom" } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ success: false, error: "Campaign name and subject are required" });
    }

    const campaign = await (prisma as any).automailCampaign.create({
      data: {
        name,
        subject,
        brand,
        senderName: senderName || null,
        senderEmail: senderEmail || null,
        replyTo: replyTo || null,
        htmlBody: htmlBody || "",
        textBody: textBody || "",
        template,
        status: "draft",
      },
    });

    return res.status(201).json({ success: true, campaign, message: "Campaign created successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, subject, brand, senderName, senderEmail, replyTo, htmlBody, textBody, template } = req.body;

    const existing = await (prisma as any).automailCampaign.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Campaign not found" });
    }

    if (existing.status === "sending") {
      return res.status(400).json({ success: false, error: "Cannot edit a campaign currently in transmission" });
    }

    const updated = await (prisma as any).automailCampaign.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        subject: subject !== undefined ? subject : existing.subject,
        brand: brand !== undefined ? brand : existing.brand,
        senderName: senderName !== undefined ? senderName : existing.senderName,
        senderEmail: senderEmail !== undefined ? senderEmail : existing.senderEmail,
        replyTo: replyTo !== undefined ? replyTo : existing.replyTo,
        htmlBody: htmlBody !== undefined ? htmlBody : existing.htmlBody,
        textBody: textBody !== undefined ? textBody : existing.textBody,
        template: template !== undefined ? template : existing.template,
      },
    });

    return res.json({ success: true, campaign: updated, message: "Campaign updated" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (prisma as any).automailCampaign.delete({ where: { id } });
    return res.json({ success: true, message: "Campaign deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3. DIRECT 1-CLICK SEND & QUEUE ENGINE
// ----------------------------------------------------
router.post("/send-direct", async (req: Request, res: Response) => {
  try {
    const {
      name,
      subject,
      brand = "all",
      senderName,
      senderEmail,
      htmlBody,
      textBody,
      targetAudience = "all",
      contactIds,
      customRecipients,
    } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, error: "Subject line is required" });
    }

    const { isConfigured } = getTransporter();
    if (!isConfigured) {
      return res.status(400).json({
        success: false,
        error: "Hostinger SMTP password is missing! Please go to AutoMail Settings and enter your password before sending.",
      });
    }

    const { isSending } = getSendingStatus();
    if (isSending) {
      return res.status(400).json({ success: false, error: "Another campaign is currently transmitting. Please wait or stop it." });
    }

    // Determine recipients
    let contacts: any[] = [];

    if (customRecipients) {
      const parsedRecipients: { email: string; name?: string }[] = [];
      if (typeof customRecipients === "string") {
        const rawList = customRecipients.split(/[\n,;]+/);
        for (const item of rawList) {
          const trimmed = item.trim();
          if (!trimmed) continue;
          const match = trimmed.match(/^(.*?)\s*<([^\s>]+@[^\s>]+)>$/);
          if (match) {
            parsedRecipients.push({ name: match[1].trim(), email: match[2].trim().toLowerCase() });
          } else if (trimmed.includes("@")) {
            parsedRecipients.push({ name: trimmed.split("@")[0], email: trimmed.toLowerCase() });
          }
        }
      } else if (Array.isArray(customRecipients)) {
        for (const item of customRecipients) {
          if (typeof item === "string" && item.includes("@")) {
            parsedRecipients.push({ name: item.split("@")[0], email: item.trim().toLowerCase() });
          } else if (item && typeof item === "object" && item.email) {
            parsedRecipients.push({ name: item.name || item.email.split("@")[0], email: item.email.trim().toLowerCase() });
          }
        }
      }

      if (parsedRecipients.length > 0) {
        for (const r of parsedRecipients) {
          await (prisma as any).automailContact.upsert({
            where: { email: r.email },
            create: { email: r.email, name: r.name || null, brand, source: "direct_send" },
            update: { name: r.name || undefined },
          }).catch(() => null);
        }
        contacts = parsedRecipients;
      }
    } else if (Array.isArray(contactIds) && contactIds.length > 0) {
      contacts = await (prisma as any).automailContact.findMany({
        where: { id: { in: contactIds } },
      });
    } else if (targetAudience && targetAudience !== "all") {
      contacts = await (prisma as any).automailContact.findMany({
        where: { brand: { in: [targetAudience, "all"] } },
      });
    } else {
      contacts = await (prisma as any).automailContact.findMany();
    }

    if (contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Audience is empty! Please enter recipient emails, click '1-Click Sync from CRM' in Audience tab, or upload contacts before sending.",
      });
    }

    // Create campaign
    const campaign = await (prisma as any).automailCampaign.create({
      data: {
        name: name?.trim() || subject,
        subject,
        brand,
        senderName: senderName || null,
        senderEmail: senderEmail || null,
        htmlBody: htmlBody || "",
        textBody: textBody || "",
        status: "queued",
        totalRecipients: contacts.length,
        sentCount: 0,
        failedCount: 0,
      },
    });

    // Create send_log entries
    const logData = contacts.map((c: any) => ({
      campaignId: campaign.id,
      contactEmail: c.email,
      contactName: c.name || "",
      brand,
      status: "queued",
    }));

    await (prisma as any).automailSendLog.createMany({
      data: logData,
    });

    // Start background queue immediately
    processCampaignQueue(String(campaign.id)).catch((err) => {
      console.error("[AUTOMAIL] Background queue error:", err);
    });

    return res.status(201).json({
      success: true,
      campaign,
      totalRecipients: contacts.length,
      message: `Broadcasting started! Delivering safely to ${contacts.length} recipients.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/send/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { contactIds, brandAudience } = req.body;

    const campaign = await (prisma as any).automailCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return res.status(404).json({ success: false, error: "Campaign not found" });
    }

    if (campaign.status === "sending") {
      return res.status(400).json({ success: false, error: "Campaign is already transmitting" });
    }

    const { isConfigured } = getTransporter();
    if (!isConfigured) {
      return res.status(400).json({
        success: false,
        error: "Hostinger SMTP password is missing! Please go to AutoMail Settings and enter your password before sending.",
      });
    }

    const { isSending } = getSendingStatus();
    if (isSending) {
      return res.status(400).json({ success: false, error: "Another campaign is currently sending. Please wait or stop it." });
    }

    // Determine target contacts
    let contacts: any[] = [];

    if (Array.isArray(contactIds) && contactIds.length > 0) {
      contacts = await (prisma as any).automailContact.findMany({
        where: { id: { in: contactIds } },
      });
    } else if (brandAudience && brandAudience !== "all") {
      contacts = await (prisma as any).automailContact.findMany({
        where: { brand: { in: [brandAudience, "all"] } },
      });
    } else if (campaign.brand && campaign.brand !== "all") {
      // Default to campaign's brand audience + general contacts
      contacts = await (prisma as any).automailContact.findMany({
        where: { brand: { in: [campaign.brand, "all"] } },
      });
    } else {
      // All contacts
      contacts = await (prisma as any).automailContact.findMany();
    }

    if (contacts.length === 0) {
      return res.status(400).json({ success: false, error: "No audience contacts found to send to." });
    }

    // Clear previous logs for fresh/resumed transmission
    await (prisma as any).automailSendLog.deleteMany({ where: { campaignId: id } });

    // Prepare batch logs
    const logData = contacts.map((c: any) => ({
      campaignId: id,
      contactEmail: c.email,
      contactName: c.name || "",
      brand: campaign.brand,
      status: "queued",
    }));

    await (prisma as any).automailSendLog.createMany({
      data: logData,
    });

    // Update campaign counters
    await (prisma as any).automailCampaign.update({
      where: { id },
      data: {
        totalRecipients: contacts.length,
        sentCount: 0,
        failedCount: 0,
        status: "queued",
      },
    });

    // Launch background processor
    processCampaignQueue(String(id)).catch((err) => {
      console.error("[AUTOMAIL] Background queue error:", err);
    });

    return res.json({
      success: true,
      message: `Transmission queued for "${campaign.name}" to ${contacts.length} recipients.`,
      totalRecipients: contacts.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/send/stop/current", (req: Request, res: Response) => {
  stopSending();
  return res.json({ success: true, message: "Stop signal dispatched. Transmission will safely halt after current email." });
});

router.get("/send/status/current", (req: Request, res: Response) => {
  const status = getSendingStatus();
  return res.json({ success: true, ...status });
});

// ----------------------------------------------------
// 4. CONTACTS & AUDIENCE HUB
// ----------------------------------------------------
router.get("/contacts", async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "50", search, brand, source } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (brand && brand !== "all") where.brand = String(brand);
    if (source && source !== "all") where.source = String(source);
    if (search && typeof search === "string" && search.trim()) {
      where.OR = [
        { email: { contains: search.trim(), mode: "insensitive" } },
        { name: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [contacts, total] = await Promise.all([
      (prisma as any).automailContact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      (prisma as any).automailContact.count({ where }),
    ]);

    return res.json({
      success: true,
      contacts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/contacts", async (req: Request, res: Response) => {
  try {
    const { email, name, brand = "all", tags, source = "manual" } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const contact = await (prisma as any).automailContact.upsert({
      where: { email: cleanEmail },
      create: {
        email: cleanEmail,
        name: name ? String(name).trim() : null,
        brand,
        tags: tags || null,
        source,
      },
      update: {
        name: name ? String(name).trim() : undefined,
        brand: brand !== "all" ? brand : undefined,
      },
    });

    return res.status(201).json({ success: true, contact, message: "Contact added" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// CSV / Excel File Upload
router.post("/contacts/import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded. Please upload a .csv or .xlsx file." });
    }

    const brand = req.body.brand || "all";
    const filename = req.file.originalname || "contacts.csv";

    const { contacts, errors, totalParsed } = parseContactsFile(req.file.buffer, filename);

    if (contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid contacts found in the uploaded file.",
        errors,
        totalParsed,
      });
    }

    // Insert contacts in chunks using Prisma upsert/createMany
    let inserted = 0;
    const chunkSize = 100;

    for (let i = 0; i < contacts.length; i += chunkSize) {
      const chunk = contacts.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map((c) =>
          (prisma as any).automailContact.upsert({
            where: { email: c.email },
            create: {
              email: c.email,
              name: c.name || null,
              brand,
              source: "csv_import",
            },
            update: {
              name: c.name || undefined,
            },
          })
        )
      );
      inserted += results.filter((r) => r.status === "fulfilled").length;
    }

    return res.json({
      success: true,
      message: `Imported and updated ${inserted} contacts successfully!`,
      totalParsed,
      validEmails: contacts.length,
      inserted,
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 1-Click Sync from CRM Leads (HiPRO + Hind Build)
router.post("/contacts/sync-crm", async (req: Request, res: Response) => {
  try {
    const { syncHiproLeads = true, syncHiproNewsletter = true, syncHbsLeads = true } = req.body;

    let syncedCount = 0;

    // 1. Sync HiPRO Newsletter Subscribers
    if (syncHiproNewsletter) {
      const subscribers = await (prisma as any).newsletterSubscriber.findMany({
        where: { active: true },
        select: { email: true },
      });

      for (const s of subscribers) {
        if (!s.email) continue;
        const clean = s.email.toLowerCase().trim();
        await (prisma as any).automailContact.upsert({
          where: { email: clean },
          create: {
            email: clean,
            name: clean.split("@")[0],
            brand: "hipro",
            source: "newsletter",
          },
          update: {},
        }).catch(() => null);
        syncedCount++;
      }
    }

    // 2. Sync HiPRO Inquiries and Quotes
    if (syncHiproLeads) {
      const [messages, quotes] = await Promise.all([
        (prisma as any).contactMessage.findMany({ select: { email: true, name: true } }),
        (prisma as any).quoteRequest.findMany({ select: { email: true, name: true } }),
      ]);

      for (const m of messages) {
        if (!m.email) continue;
        const clean = m.email.toLowerCase().trim();
        await (prisma as any).automailContact.upsert({
          where: { email: clean },
          create: {
            email: clean,
            name: m.name || null,
            brand: "hipro",
            source: "contact_inquiry",
          },
          update: { name: m.name || undefined },
        }).catch(() => null);
        syncedCount++;
      }

      for (const q of quotes) {
        if (!q.email) continue;
        const clean = q.email.toLowerCase().trim();
        await (prisma as any).automailContact.upsert({
          where: { email: clean },
          create: {
            email: clean,
            name: q.name || null,
            brand: "hipro",
            source: "quote_lead",
          },
          update: { name: q.name || undefined },
        }).catch(() => null);
        syncedCount++;
      }
    }

    // 3. Sync Hind Build (HBS) Leads
    if (syncHbsLeads) {
      const hbsLeads = await (prisma as any).hbsLead.findMany({
        select: { email: true, name: true },
      });

      for (const hl of hbsLeads) {
        if (!hl.email) continue;
        const clean = hl.email.toLowerCase().trim();
        await (prisma as any).automailContact.upsert({
          where: { email: clean },
          create: {
            email: clean,
            name: hl.name || null,
            brand: "hbs",
            source: "hbs_lead",
          },
          update: { name: hl.name || undefined },
        }).catch(() => null);
        syncedCount++;
      }
    }

    return res.json({
      success: true,
      message: `Synced ${syncedCount} contacts across HiPRO and Hind Build (HBS)!`,
      syncedCount,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/contacts/delete-batch", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "No contact IDs specified" });
    }
    const result = await (prisma as any).automailContact.deleteMany({
      where: { id: { in: ids } },
    });
    return res.json({ success: true, count: result.count, message: `Deleted ${result.count} contacts` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (prisma as any).automailContact.delete({ where: { id } });
    return res.json({ success: true, message: "Contact deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/contacts", async (req: Request, res: Response) => {
  try {
    const { brand } = req.query;
    if (brand && brand !== "all") {
      await (prisma as any).automailContact.deleteMany({ where: { brand: String(brand) } });
      return res.json({ success: true, message: `All ${brand} contacts deleted` });
    }

    await (prisma as any).automailContact.deleteMany();
    return res.json({ success: true, message: "All contacts deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
