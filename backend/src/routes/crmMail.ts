import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/db";
import { requirePermission } from "../middleware/authGuard";
import type { ApiResponse } from "../lib/types";
import {
  sendOneEmail,
  personalizeContent,
  extractCleanContactName,
  resolveEffectiveMailboxConfig,
  recordDirectDispatch,
  wrapWithCorporateTemplate,
  plainTextToEmailHtml,
  isEmailDeliveryConfigured,
} from "../services/automail/emailSender";
import {
  getAutomailSettingsAsync,
  getDefaultMailboxes,
  CorporateMailbox,
} from "../services/automail/settingsService";
import { getCustomTemplates } from "../services/automail/customTemplatesService";
import { logVendorActivity } from "../services/vendorActivityService";

const router = Router();

// Allow any authorized CRM, portal staff, or AutoMail operator to dispatch 1-on-1 client mail replies
router.use(
  requirePermission([
    "leads",
    "quotes",
    "contacts",
    "applications",
    "hbs",
    "empanelment",
    "automail",
  ])
);

function sanitizeMailboxList(mailboxes: CorporateMailbox[]) {
  return mailboxes
    .filter((m) => m.status === "active")
    .map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      brand: m.brand,
      brandName: m.brandName || "Corporate",
      isDefault: Boolean(m.isDefault),
      deliveryMethod: m.deliveryMethod || "smtp",
      description: m.description || "",
    }));
}

/**
 * GET /api/mail/context
 * Returns safe list of active corporate mailboxes, default sender resolved for the portal/trigger,
 * delivery readiness status, and saved custom templates.
 */
router.get("/context", async (req: Request, res: Response) => {
  try {
    const triggerKey = typeof req.query.triggerKey === "string" ? req.query.triggerKey : undefined;
    const brand = typeof req.query.brand === "string" ? req.query.brand : undefined;

    const settings = await getAutomailSettingsAsync();
    const rawMailboxes =
      settings.mailboxes && settings.mailboxes.length > 0
        ? settings.mailboxes
        : getDefaultMailboxes();

    const safeMailboxes = sanitizeMailboxList(rawMailboxes);
    const resolved = await resolveEffectiveMailboxConfig({ triggerKey, brand });
    const emailConfigured = Boolean(
      (resolved.customConfig && isEmailDeliveryConfigured(resolved.customConfig)) ||
        isEmailDeliveryConfigured()
    );

    const allTemplates = getCustomTemplates();
    const customTemplates =
      brand && brand !== "all"
        ? allTemplates.filter((t) => t.brand === brand || t.brand === "all")
        : allTemplates;

    return res.json({
      success: true,
      data: {
        emailConfigured,
        mailboxes: safeMailboxes,
        defaultMailbox: {
          id: resolved.mailbox?.id || safeMailboxes[0]?.id || "mb_hp_primary",
          name: resolved.senderName,
          email: resolved.senderEmail,
        },
        customTemplates,
      },
    } as ApiResponse);
  } catch (err: any) {
    console.error("[CRM Mail Context error]", err);
    return res.status(500).json({ success: false, error: "Failed to load mail configuration" });
  }
});

/**
 * POST /api/mail/preview
 * Generates exact branded HTML preview identical to what the client receives.
 */
router.post("/preview", async (req: Request, res: Response) => {
  try {
    const {
      to = "client@example.com",
      name = "Valued Client",
      subject = "",
      messageText = "",
      htmlBody = "",
      brand = "hipro",
      mailboxId,
      triggerKey,
    } = req.body;

    const cleanEmail = String(to || "client@example.com").trim().toLowerCase();
    const { fullName } = extractCleanContactName(name, cleanEmail);
    const contactInfo = { name: fullName, email: cleanEmail };

    const resolved = await resolveEffectiveMailboxConfig({ mailboxId, triggerKey, brand });

    const baseContent = htmlBody?.trim()
      ? String(htmlBody)
      : plainTextToEmailHtml(String(messageText || ""));

    const personalizedSubject = personalizeContent(String(subject || ""), contactInfo, brand);
    const personalizedBody = personalizeContent(baseContent, contactInfo, brand);

    const previewHtml = wrapWithCorporateTemplate(personalizedBody, {
      brand,
      subject: personalizedSubject,
      recipientName: fullName,
      recipientEmail: cleanEmail,
      senderName: resolved.senderName,
      senderEmail: resolved.senderEmail,
    });

    return res.json({
      success: true,
      data: {
        senderName: resolved.senderName,
        senderEmail: resolved.senderEmail,
        previewSubject: personalizedSubject,
        previewHtml,
      },
    } as ApiResponse);
  } catch (err: any) {
    console.error("[CRM Mail Preview error]", err);
    return res.status(500).json({ success: false, error: "Failed to render preview" });
  }
});

/**
 * Helper to update source record status / audit trail after successful mail delivery.
 */
async function updateSourceRecordAfterSend(params: {
  leadId?: string;
  leadType?: string;
  updateStatus?: string;
  subject: string;
  recipientEmail: string;
  adminName: string;
}) {
  const { leadId, leadType, updateStatus, subject, recipientEmail, adminName } = params;
  if (!leadId || !leadType) return undefined;

  const cleanType = leadType.toLowerCase().trim();
  const nextStatus = updateStatus?.trim();

  try {
    if (cleanType === "quote" || cleanType === "estimator") {
      if (nextStatus) {
        await prisma.quoteRequest.update({ where: { id: leadId }, data: { status: nextStatus } });
        return nextStatus;
      }
    } else if (cleanType === "contact" || cleanType === "project" || cleanType === "service") {
      if (nextStatus) {
        await prisma.contactMessage.update({ where: { id: leadId }, data: { status: nextStatus } });
        return nextStatus;
      }
    } else if (cleanType === "application") {
      if (nextStatus) {
        await prisma.jobApplication.update({ where: { id: leadId }, data: { status: nextStatus } });
        return nextStatus;
      }
    } else if (cleanType === "hbs_lead") {
      const lead = await prisma.hbsLead.findUnique({ where: { id: leadId } });
      if (lead) {
        let notes: any[] = [];
        try {
          notes = lead.internalNotes ? JSON.parse(lead.internalNotes) : [];
          if (!Array.isArray(notes)) notes = [];
        } catch {
          notes = [];
        }
        notes.push({
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          author: adminName,
          note: `📧 Email sent to ${recipientEmail} — Subject: "${subject}"`,
          createdAt: new Date().toISOString(),
        });

        await prisma.hbsLead.update({
          where: { id: leadId },
          data: {
            ...(nextStatus ? { status: nextStatus.toUpperCase() } : {}),
            internalNotes: JSON.stringify(notes),
          },
        });
        return nextStatus ? nextStatus.toUpperCase() : lead.status;
      }
    } else if (cleanType === "vendor_app") {
      await logVendorActivity({
        applicationId: leadId,
        actorType: "ADMIN",
        actorName: adminName,
        action: "EMAIL_DISPATCHED",
        details: `Sent official email "${subject}" to ${recipientEmail}`,
      }).catch(() => null);
      return nextStatus;
    }
  } catch (updateErr) {
    console.warn("[CRM Mail] Status/audit update non-blocking warning:", updateErr);
  }

  return undefined;
}

/**
 * POST /api/mail/send
 * Dispatches 1-on-1 corporate-branded email directly in-place without redirecting
 * to AutoMail campaign pages. Logs to AutomailSendLog & AutomailDailyStat and
 * updates optional lead status / internal audit trail.
 */
router.post("/send", async (req: Request, res: Response) => {
  try {
    const {
      to,
      name,
      subject,
      messageText,
      htmlBody,
      brand = "hipro",
      mailboxId,
      triggerKey,
      leadId,
      leadType,
      updateStatus,
    } = req.body;

    if (!to || typeof to !== "string" || !to.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid recipient email address is required." });
    }
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({ success: false, error: "Email subject line is required." });
    }
    const rawContent = (htmlBody && String(htmlBody).trim()) || (messageText && String(messageText).trim());
    if (!rawContent) {
      return res.status(400).json({ success: false, error: "Email message content cannot be empty." });
    }

    const cleanEmail = to.trim().toLowerCase();
    const { fullName } = extractCleanContactName(name, cleanEmail);
    const contactInfo = { name: fullName, email: cleanEmail };

    const resolved = await resolveEffectiveMailboxConfig({
      mailboxId,
      triggerKey,
      brand,
    });

    const baseHtml = htmlBody?.trim()
      ? String(htmlBody)
      : plainTextToEmailHtml(String(messageText));

    const personalizedSubject = personalizeContent(subject.trim(), contactInfo, brand);
    const personalizedHtml = personalizeContent(baseHtml, contactInfo, brand);
    const personalizedText = messageText
      ? personalizeContent(String(messageText), contactInfo, brand)
      : undefined;

    let info: any = null;
    try {
      info = await sendOneEmail({
        to: cleanEmail,
        subject: personalizedSubject,
        htmlBody: personalizedHtml,
        textBody: personalizedText,
        senderName: resolved.senderName,
        senderEmail: resolved.senderEmail,
        brand,
        customConfig: resolved.customConfig,
      });

      await recordDirectDispatch({
        to: cleanEmail,
        name: fullName,
        subject: personalizedSubject,
        brand,
        senderName: resolved.senderName,
        senderEmail: resolved.senderEmail,
        source: leadType ? `crm_${leadType}` : "crm_direct_reply",
        success: true,
      });
    } catch (sendErr: any) {
      await recordDirectDispatch({
        to: cleanEmail,
        name: fullName,
        subject: personalizedSubject,
        brand,
        senderName: resolved.senderName,
        senderEmail: resolved.senderEmail,
        source: leadType ? `crm_${leadType}` : "crm_direct_reply",
        success: false,
        errorMessage: sendErr?.message || "Delivery failed",
      });
      return res.status(500).json({
        success: false,
        error: sendErr?.message || "Failed to send email. Check AutoMail Settings.",
      });
    }

    const adminUser = (req as any).user;
    const adminName = adminUser?.name || adminUser?.email || "Admin";
    const updatedStatus = await updateSourceRecordAfterSend({
      leadId,
      leadType,
      updateStatus,
      subject: personalizedSubject,
      recipientEmail: cleanEmail,
      adminName,
    });

    return res.json({
      success: true,
      message: `Email delivered to ${cleanEmail} via ${resolved.senderEmail}!`,
      data: {
        messageId: info?.messageId,
        senderEmail: resolved.senderEmail,
        senderName: resolved.senderName,
        updatedStatus,
        isMock: Boolean(info?.isMock),
      },
    } as ApiResponse);
  } catch (err: any) {
    console.error("[CRM Mail Send error]", err);
    return res.status(500).json({ success: false, error: err?.message || "Failed to dispatch email" });
  }
});

export default router;
