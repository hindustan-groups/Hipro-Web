import dns from "dns";
import nodemailer from "nodemailer";
import { prisma } from "../../lib/db";
import { getAutomailSettings, AutomailSettings } from "./settingsService";

// Enforce IPv4 DNS resolution across all SMTP socket operations (fixes ENETUNREACH on IPv6)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

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

// Custom DNS lookup that strictly forces IPv4 resolution (eliminates IPv6 ENETUNREACH errors)
export const ipv4Lookup = (hostname: string, options: any, callback: any) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  return dns.lookup(hostname, { family: 4 }, callback);
};

export function createSmtpTransport(host: string, port: number, user: string, pass: string) {
  const isSecure = port === 465;
  const isConfigured = Boolean(user && pass);

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    requireTLS: !isSecure, // Enforce STARTTLS on port 587
    ...(isConfigured ? { auth: { user, pass } } : {}),
    // FORCE IPv4 to eliminate "connect ENETUNREACH 2606:4700:... - Local (:::0)" errors
    family: 4,
    lookup: ipv4Lookup,
    // Enforce strict timeouts so requests never hang indefinitely
    connectionTimeout: 8000, // 8s to establish socket
    greetingTimeout: 8000,   // 8s for SMTP greeting
    socketTimeout: 12000,    // 12s for socket activity
    // Connection pooling for fast transmission
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
  } as any);
}

export function getTransporter(customConfig?: Partial<AutomailSettings>) {
  const settings = getAutomailSettings();
  const host = (customConfig?.smtpHost || settings.smtpHost || "smtp.hostinger.com").trim();
  const port = parseInt(String(customConfig?.smtpPort ?? settings.smtpPort ?? 465), 10);
  const user = (customConfig?.smtpUser || settings.smtpUser || "").trim();
  const pass = (customConfig?.smtpPass !== undefined ? customConfig.smtpPass : settings.smtpPass || "").trim();

  const isConfigured = Boolean(user && pass);
  const transporter = createSmtpTransport(host, port, user, pass);

  return { transporter, isConfigured, user, host, port, pass };
}

/**
 * Verify SMTP connection and credentials with intelligent diagnostics
 */
export async function testSmtpConnection(customConfig?: Partial<AutomailSettings>) {
  const { transporter, isConfigured, user, host, port, pass } = getTransporter(customConfig);
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
      message: `SMTP Connection verified successfully with Hostinger mail server (${user} on ${host}:${port})!`,
    };
  } catch (error: any) {
    let msg = error.message || "SMTP Verification failed.";

    // If port 465 timed out or connection was refused, check if port 587 works
    if ((error.code === "ETIMEDOUT" || error.code === "ECONNREFUSED" || msg.includes("timeout")) && port === 465) {
      try {
        const altTransporter = createSmtpTransport(host, 587, user, pass);
        await altTransporter.verify();
        return {
          success: true,
          message: `Port 465 timed out on this server network, but Port 587 (STARTTLS) verified successfully! Please change your SMTP Port to 587 in AutoMail Settings and save.`,
        };
      } catch (altError: any) {
        msg = `Connection to ${host}:${port} timed out. Cloud provider network may be throttling SMTP or host is unreachable. (${altError.message})`;
      }
    }

    if (msg.includes('Missing credentials for "PLAIN"') || error.code === "EAUTH" || msg.includes("535") || msg.includes("authentication failed")) {
      msg = `Authentication failed: Invalid Hostinger password or username for ${user}. Please verify your mailbox password at mail.hostinger.com.`;
    } else if (error.code === "ETIMEDOUT" || msg.includes("timeout")) {
      msg = `Connection to ${host}:${port} timed out. Try switching to Port 587 (STARTTLS) in AutoMail Settings.`;
    }

    return { success: false, message: msg };
  }
}

/**
 * Send a single email via SMTP with automatic port fallback (465 -> 587)
 */
export async function sendOneEmail({
  to,
  subject,
  htmlBody,
  textBody,
  senderName,
  senderEmail,
  brand = "all",
  customConfig,
}: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  senderName?: string | null;
  senderEmail?: string | null;
  brand?: string;
  customConfig?: Partial<AutomailSettings>;
}) {
  const brandMap = getBrandConfigs();
  const brandDefaults = brandMap[brand] || brandMap.all;
  const fromName = senderName?.trim() || brandDefaults.name;
  const fromEmail = senderEmail?.trim() || brandDefaults.defaultEmail;

  const { transporter, isConfigured, user, host, port, pass } = getTransporter(customConfig);

  if (!isConfigured) {
    throw new Error(
      "Hostinger SMTP password not set! Please go to Admin -> AutoMail -> Settings tab and enter your Hostinger Email Password before sending."
    );
  }

  // Hostinger requires the envelope/from sender to match the authenticated mailbox (user)
  const authSender = user || fromEmail;
  const mailOptions = {
    from: `"${fromName}" <${authSender}>`,
    replyTo: fromEmail && fromEmail !== authSender ? `"${fromName}" <${fromEmail}>` : undefined,
    to,
    subject,
    text: textBody || (htmlBody ? htmlBody.replace(/<[^>]*>/g, "") : ""),
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err: any) {
    // If port 465 timed out or failed to connect, attempt automatic fallback to port 587
    if ((err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED" || err.message?.includes("timeout")) && port === 465) {
      console.warn(`[AUTOMAIL] Port 465 timed out to ${host}. Attempting auto-fallback to Port 587...`);
      try {
        const fallbackTransporter = createSmtpTransport(host, 587, user, pass);
        const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
        console.log(`[AUTOMAIL] Fallback to Port 587 succeeded for ${to}!`);
        return fallbackInfo;
      } catch (fallbackErr: any) {
        throw new Error(`Email delivery failed on both Port 465 and Port 587: ${fallbackErr.message || err.message}`);
      }
    }

    if (err.message && (err.message.includes("535") || err.code === "EAUTH")) {
      throw new Error(`Authentication failed for ${user}. Check your Hostinger password in AutoMail Settings.`);
    }

    throw err;
  }
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
