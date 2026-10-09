import nodemailer from "nodemailer";
import { prisma } from "../../lib/db";
import { getAutomailSettings, AutomailSettings } from "./settingsService";

// Global sending state for queue management
let isSending = false;
let shouldStop = false;
let currentCampaignId: string | null = null;

// Brand configuration presets
export interface BrandConfig {
  key: string;
  name: string;
  defaultEmail: string;
  website: string;
}

export function getBrandConfigs(): Record<string, BrandConfig> {
  const settings = getAutomailSettings();
  return {
    hipro: {
      key: "hipro",
      name: settings.senderNameHipro || "Hindustan Projects",
      defaultEmail: settings.senderEmailHipro || "info@hindustanprojects.in",
      website: "https://www.hindustanprojects.in",
    },
    hbs: {
      key: "hbs",
      name: settings.senderNameHbs || "Hind Building Solutions",
      defaultEmail: settings.senderEmailHbs || "hbs@hindustanprojects.in",
      website: "https://hindbuilding.hindustanprojects.in",
    },
    all: {
      key: "all",
      name: "Hindustan Projects Group",
      defaultEmail: settings.senderEmailHipro || "info@hindustanprojects.in",
      website: "https://www.hindustanprojects.in",
    },
  };
}

export const BRAND_CONFIGS: Record<string, BrandConfig> = {
  hipro: {
    key: "hipro",
    name: "Hindustan Projects",
    defaultEmail: process.env.SMTP_USER || "info@hindustanprojects.in",
    website: "https://www.hindustanprojects.in",
  },
  hbs: {
    key: "hbs",
    name: "Hind Building Solutions",
    defaultEmail: process.env.HBS_SMTP_USER || process.env.SMTP_USER || "hbs@hindustanprojects.in",
    website: "https://hindbuilding.hindustanprojects.in",
  },
  all: {
    key: "all",
    name: "Hindustan Projects Group",
    defaultEmail: process.env.SMTP_USER || "info@hindustanprojects.in",
    website: "https://www.hindustanprojects.in",
  },
};

export function getTransporter(customConfig?: Partial<AutomailSettings>) {
  const settings = getAutomailSettings();
  const host = customConfig?.smtpHost || settings.smtpHost || "smtp.hostinger.com";
  const port = parseInt(String(customConfig?.smtpPort ?? settings.smtpPort ?? 465), 10);
  const user = (customConfig?.smtpUser || settings.smtpUser || "").trim();
  const pass = (customConfig?.smtpPass !== undefined ? customConfig.smtpPass : settings.smtpPass || "").trim();

  const isConfigured = Boolean(user && pass);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    ...(isConfigured ? { auth: { user, pass } } : {}),
    tls: {
      rejectUnauthorized: false,
    },
  });

  return { transporter, isConfigured, user, host, port };
}

/**
 * Verify SMTP connection and credentials
 */
export async function testSmtpConnection(customConfig?: Partial<AutomailSettings>) {
  const { transporter, isConfigured, user } = getTransporter(customConfig);
  if (!isConfigured) {
    return {
      success: false,
      message: "Hostinger SMTP password or email is missing! Please enter your Hostinger Email & Password in AutoMail Settings tab.",
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: `SMTP Connection verified successfully with Hostinger mail server (${user})!`,
    };
  } catch (error: any) {
    let msg = error.message || "SMTP Verification failed.";
    if (msg.includes('Missing credentials for "PLAIN"') || error.code === "EAUTH") {
      msg = "Authentication failed: Invalid Hostinger email or password. Please verify your credentials in AutoMail Settings.";
    }
    return { success: false, message: msg };
  }
}

/**
 * Send a single email via SMTP
 */
export async function sendOneEmail({
  to,
  subject,
  htmlBody,
  textBody,
  senderName,
  senderEmail,
  brand = "all",
}: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  senderName?: string | null;
  senderEmail?: string | null;
  brand?: string;
}) {
  const brandMap = getBrandConfigs();
  const brandDefaults = brandMap[brand] || brandMap.all;
  const fromName = senderName?.trim() || brandDefaults.name;
  const fromEmail = senderEmail?.trim() || brandDefaults.defaultEmail;

  const { transporter, isConfigured, user } = getTransporter();

  if (!isConfigured) {
    throw new Error(
      "Hostinger SMTP password not set! Please go to Admin -> AutoMail -> Settings tab and enter your Hostinger Email Password before sending."
    );
  }

  // Hostinger requires the envelope/from sender to match the authenticated mailbox (user)
  const authSender = user || fromEmail;
  const info = await transporter.sendMail({
    from: `"${fromName}" <${authSender}>`,
    replyTo: fromEmail && fromEmail !== authSender ? `"${fromName}" <${fromEmail}>` : undefined,
    to,
    subject,
    text: textBody || (htmlBody ? htmlBody.replace(/<[^>]*>/g, "") : ""),
    html: htmlBody,
  });

  return info;
}

/**
 * Replace dynamic personalization tokens
 */
export function personalizeContent(content: string, contact: { name?: string | null; email: string }, brand: string = "all"): string {
  if (!content) return "";
  const brandConfig = BRAND_CONFIGS[brand] || BRAND_CONFIGS.all;
  const name = contact.name?.trim() || "Valued Client";

  return content
    .replace(/\{\{name\}\}/gi, name)
    .replace(/\{\{email\}\}/gi, contact.email)
    .replace(/\{\{brand\}\}/gi, brandConfig.name)
    .replace(/\{\{website\}\}/gi, brandConfig.website);
}

/**
 * Get today's total sent count across system
 */
export async function getTodaySentCount(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const stat = await (prisma as any).automailDailyStat.findUnique({
      where: { date: today },
    });
    return stat?.totalSent || 0;
  } catch (err) {
    console.error("[AUTOMAIL] Failed to get today sent count:", err);
    return 0;
  }
}

/**
 * Increment daily delivery stats
 */
export async function incrementDailyStats(success: boolean) {
  const today = new Date().toISOString().split("T")[0];
  try {
    await (prisma as any).automailDailyStat.upsert({
      where: { date: today },
      create: {
        date: today,
        totalSent: success ? 1 : 0,
        totalFailed: success ? 0 : 1,
      },
      update: {
        totalSent: success ? { increment: 1 } : undefined,
        totalFailed: !success ? { increment: 1 } : undefined,
      },
    });
  } catch (err) {
    console.error("[AUTOMAIL] Failed to increment daily stats:", err);
  }
}

/**
 * Asynchronously process campaign delivery queue with rate limiting
 */
export async function processCampaignQueue(campaignId: string) {
  if (isSending) {
    throw new Error("Another campaign transmission is already in progress.");
  }

  isSending = true;
  shouldStop = false;
  currentCampaignId = campaignId;

  const settings = getAutomailSettings();
  const rateLimit = settings.rateLimitPerMinute > 0 ? settings.rateLimitPerMinute : 5;
  const dailyLimit = settings.dailyLimit > 0 ? settings.dailyLimit : 200;
  const delayMs = Math.ceil(60000 / rateLimit);

  try {
    const campaign = await (prisma as any).automailCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Set campaign status to sending
    await (prisma as any).automailCampaign.update({
      where: { id: campaignId },
      data: { status: "sending", sentAt: new Date() },
    });

    const queuedLogs = await (prisma as any).automailSendLog.findMany({
      where: { campaignId, status: "queued" },
    });

    console.log(`[AUTOMAIL] Starting transmission for "${campaign.name}" (${queuedLogs.length} queued)`);

    const { isConfigured } = getTransporter();
    if (!isConfigured) {
      const errorMsg = "Hostinger SMTP credentials missing. Please enter your Hostinger Email & Password in AutoMail Settings tab.";
      await (prisma as any).automailSendLog.updateMany({
        where: { campaignId, status: "queued" },
        data: { status: "failed", error: errorMsg },
      });
      await (prisma as any).automailCampaign.update({
        where: { id: campaignId },
        data: { status: "failed", failedCount: queuedLogs.length },
      });
      isSending = false;
      currentCampaignId = null;
      return;
    }

    let sentCount = campaign.sentCount || 0;
    let failedCount = campaign.failedCount || 0;

    for (const entry of queuedLogs) {
      if (shouldStop) {
        console.log(`[AUTOMAIL] Transmission paused/stopped by user for campaign ${campaignId}`);
        break;
      }

      // Check daily rate limit
      const todaySent = await getTodaySentCount();
      if (todaySent >= dailyLimit) {
        console.warn(`[AUTOMAIL] Daily limit of ${dailyLimit} reached. Pausing campaign.`);
        await (prisma as any).automailCampaign.update({
          where: { id: campaignId },
          data: { status: "paused" },
        });
        break;
      }

      try {
        const personalizedHtml = personalizeContent(
          campaign.htmlBody,
          { name: entry.contactName, email: entry.contactEmail },
          campaign.brand
        );
        const personalizedText = campaign.textBody
          ? personalizeContent(
              campaign.textBody,
              { name: entry.contactName, email: entry.contactEmail },
              campaign.brand
            )
          : undefined;

        await sendOneEmail({
          to: entry.contactEmail,
          subject: campaign.subject,
          htmlBody: personalizedHtml,
          textBody: personalizedText,
          senderName: campaign.senderName,
          senderEmail: campaign.senderEmail,
          brand: campaign.brand,
        });

        // Mark as sent
        await (prisma as any).automailSendLog.update({
          where: { id: entry.id },
          data: { status: "sent", sentAt: new Date() },
        });
        await incrementDailyStats(true);
        sentCount++;
      } catch (err: any) {
        // Mark as failed
        await (prisma as any).automailSendLog.update({
          where: { id: entry.id },
          data: { status: "failed", error: err.message || "Delivery failed" },
        });
        await incrementDailyStats(false);
        failedCount++;

        if (err.message && err.message.includes("429")) {
          console.warn("[AUTOMAIL] 429 Rate limit hit, sleeping for 60 seconds...");
          await new Promise((r) => setTimeout(r, 60000));
        }
      }

      // Update counters on campaign
      await (prisma as any).automailCampaign.update({
        where: { id: campaignId },
        data: { sentCount, failedCount },
      });

      // Throttle delay between sends
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const finalStatus = shouldStop ? "paused" : "completed";
    await (prisma as any).automailCampaign.update({
      where: { id: campaignId },
      data: { status: finalStatus },
    });

    console.log(`[AUTOMAIL] Campaign "${campaign.name}" ${finalStatus}. Sent: ${sentCount}, Failed: ${failedCount}`);
  } catch (err) {
    console.error("[AUTOMAIL] Transmission processor failed:", err);
  } finally {
    isSending = false;
    currentCampaignId = null;
  }
}

export function stopSending() {
  shouldStop = true;
}

export function getSendingStatus() {
  return {
    isSending,
    shouldStop,
    currentCampaignId,
  };
}
