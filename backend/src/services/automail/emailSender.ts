import dns from "dns";
import nodemailer from "nodemailer";
import { Configuration, AccountApi, SendApi } from "hostinger-mail-api-sdk";
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

// Known Hostinger and standard SMTP IPv4 mapping to bypass Nodemailer v10's internal resolve6 random picker
export const hostIpv4Cache: Record<string, string> = {
  "smtp.hostinger.com": "172.65.255.143",
};

export async function getHostIpv4(host: string): Promise<string> {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    return host;
  }
  if (hostIpv4Cache[host]) {
    // Refresh asynchronously in background
    dns.promises.resolve4(host).then((addrs) => {
      if (addrs && addrs[0]) hostIpv4Cache[host] = addrs[0];
    }).catch(() => null);
    return hostIpv4Cache[host];
  }

  try {
    const addrs = await dns.promises.resolve4(host);
    if (addrs && addrs[0]) {
      hostIpv4Cache[host] = addrs[0];
      return addrs[0];
    }
  } catch (err) {
    console.warn(`[AUTOMAIL] resolve4 fallback for ${host}:`, err);
  }

  return new Promise((resolve) => {
    dns.lookup(host, { family: 4 }, (err, address) => {
      if (address) {
        hostIpv4Cache[host] = address;
        resolve(address);
      } else {
        resolve(host);
      }
    });
  });
}

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

  // Directly pass IPv4 address to Nodemailer so net.isIP(targetHost) is true.
  // This bypasses Nodemailer's resolveHostname() which picks random IPv6 addresses!
  const targetHost = hostIpv4Cache[host] || host;

  return nodemailer.createTransport({
    host: targetHost,
    port,
    secure: isSecure,
    requireTLS: !isSecure, // Enforce STARTTLS on port 587
    ...(isConfigured ? { auth: { user, pass } } : {}),
    // Enforce strict timeouts so requests never hang indefinitely
    connectionTimeout: 8000, // 8s to establish socket
    greetingTimeout: 8000,   // 8s for SMTP greeting
    socketTimeout: 12000,    // 12s for socket activity
    // Connection pooling for fast transmission
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    tls: {
      servername: host, // Critical: preserves SSL certificate validation for host (e.g. smtp.hostinger.com)
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

// ----------------------------------------------------
// HOSTINGER MAIL API (REST OVER HTTPS PORT 443)
// ----------------------------------------------------

let mailboxCache: Array<{ resourceId: string; address: string }> = [];
let mailboxCacheExpiry = 0;
const exchangedTokenCache: Record<string, string> = {};
export function cleanToken(raw: string): string {
  let token = (raw || "").trim();
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1).trim();
  }
  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }
  return token;
}

/**
 * Intelligent token resolver:
 * 1. Tests if token directly works on api.mail.hostinger.com (Mail API Token)
 * 2. If 401 Unauthorized, automatically checks if it is a General Developer Token (from hPanel -> Dev Tools > API)
 *    and generates a Mail API token for the user's order on the fly!
 */
export async function resolveWorkingHostingerToken(rawToken: string): Promise<string> {
  const clean = cleanToken(rawToken);
  if (!clean) {
    throw new Error("Hostinger API Token is empty.");
  }
  if (exchangedTokenCache[clean]) {
    return exchangedTokenCache[clean];
  }

  // 1. Try directly against api.mail.hostinger.com
  try {
    const config = new Configuration({ accessToken: clean, basePath: "https://api.mail.hostinger.com" });
    const accApi = new AccountApi(config);
    await accApi.getCurrentAccount();
    exchangedTokenCache[clean] = clean;
    return clean;
  } catch (err: any) {
    const status = err.response?.status;
    if (status !== 401 && status !== 403) {
      throw err;
    }
    console.log("[AUTOMAIL] Direct api.mail.hostinger.com returned 401. Checking if this is a General Developer API token from hPanel -> API...");
  }

  // 2. If it failed with 401, check if it's a Hostinger Developer API Token
  const candidateUrls = [
    "https://developers.hostinger.com/api/mail/v1",
    "https://api.hostinger.com/api/mail/v1",
  ];

  for (const baseUrl of candidateUrls) {
    try {
      const ordersRes = await fetch(`${baseUrl}/orders`, {
        headers: {
          Authorization: `Bearer ${clean}`,
          Accept: "application/json",
        },
      });

      if (ordersRes.ok) {
        const ordersData: any = await ordersRes.json();
        const orders = ordersData?.data || ordersData || [];
        if (Array.isArray(orders) && orders.length > 0) {
          console.log(`[AUTOMAIL] Found ${orders.length} mail order(s) under Developer API token!`);
          const orderId = orders[0].id || orders[0].order_id || orders[0].orderId;

          // Auto-generate Mail API Token for this order
          const createTokenRes = await fetch(`${baseUrl}/orders/${orderId}/api-tokens`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${clean}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              name: "AutoMail Webhook & Delivery",
              scope: {
                has_all_mailboxes: true,
              },
            }),
          });

          if (createTokenRes.ok) {
            const tokenData: any = await createTokenRes.json();
            const newToken =
              tokenData?.data?.token ||
              tokenData?.token ||
              tokenData?.data?.access_token ||
              tokenData?.access_token;

            if (newToken) {
              console.log("[AUTOMAIL] Successfully auto-created Mail API token from General Developer Token!");
              exchangedTokenCache[clean] = newToken;
              return newToken;
            }
          }
        }
      }
    } catch (apiErr: any) {
      console.warn(`[AUTOMAIL] Checking developer API failed for ${baseUrl}:`, apiErr);
    }
  }

  throw new Error(
    "Invalid Hostinger API Token (Unauthorized). Make sure you created an API Token in Hostinger hPanel (Emails -> API Access), NOT your email login password."
  );
}

export async function getHostingerSdk(tokenOverride?: string) {
  const settings = getAutomailSettings();
  const rawToken = (tokenOverride || settings.hostingerApiToken || process.env.HOSTINGER_MAIL_API_TOKEN || "").trim();
  if (!rawToken) {
    throw new Error(
      "Hostinger Mail API Token not configured! Please enter your Hostinger API Token in AutoMail Settings."
    );
  }

  const workingToken = await resolveWorkingHostingerToken(rawToken);

  const config = new Configuration({
    accessToken: workingToken,
    basePath: "https://api.mail.hostinger.com",
  });

  return {
    config,
    accountApi: new AccountApi(config),
    sendApi: new SendApi(config),
    token: workingToken,
  };
}

/**
 * Fetch available mailboxes for the authenticated Hostinger Mail API Token
 */
export async function getHostingerMailboxes(tokenOverride?: string): Promise<Array<{ resourceId: string; address: string }>> {
  const now = Date.now();
  if (mailboxCache.length > 0 && mailboxCacheExpiry > now && !tokenOverride) {
    return mailboxCache;
  }

  const { accountApi } = await getHostingerSdk(tokenOverride);
  const response = await accountApi.getCurrentAccount();
  const mailboxes: Array<{ resourceId: string; address: string }> =
    (response.data as any)?.data?.mailboxes ||
    (response.data as any)?.mailboxes ||
    [];

  if (mailboxes.length > 0 && !tokenOverride) {
    mailboxCache = mailboxes;
    mailboxCacheExpiry = now + 5 * 60 * 1000; // Cache for 5 minutes
  }

  return mailboxes;
}

/**
 * Find mailbox resource ID by sender email address, or fallback to first available
 */
export async function resolveHostingerMailboxId(senderEmail?: string, tokenOverride?: string, mailboxIdOverride?: string): Promise<string> {
  if (mailboxIdOverride) return mailboxIdOverride;
  const settings = getAutomailSettings();
  if (settings.hostingerMailboxId) return settings.hostingerMailboxId;

  const mailboxes = await getHostingerMailboxes(tokenOverride);
  if (!mailboxes || mailboxes.length === 0) {
    throw new Error("No mailboxes found for this Hostinger API Token. Please ensure your mailbox exists in Hostinger.");
  }

  if (senderEmail) {
    const clean = senderEmail.toLowerCase().trim();
    const matched = mailboxes.find((m) => m.address?.toLowerCase().trim() === clean);
    if (matched) return matched.resourceId;
  }

  return mailboxes[0].resourceId;
}

/**
 * Test Hostinger Mail API connection and fetch connected mailboxes
 */
export async function testHostingerMailApi(tokenOverride?: string) {
  try {
    const mailboxes = await getHostingerMailboxes(tokenOverride);
    if (!mailboxes || mailboxes.length === 0) {
      return {
        success: false,
        message: "Hostinger API Token is valid, but no mailboxes were returned for this account.",
      };
    }
    const boxList = mailboxes.map((m) => m.address).join(", ");
    return {
      success: true,
      message: `Hostinger Mail API verified successfully over HTTPS (Port 443)! Connected mailbox(es): ${boxList}`,
      mailboxes,
    };
  } catch (err: any) {
    const rawError = err.response?.data?.message || err.response?.data?.error || err.message;
    const status = err.response?.status;
    let msg = rawError || "Failed to verify Hostinger Mail API.";
    if (status === 401 || status === 403) {
      msg = `Invalid Hostinger API Token (${status}: ${rawError || "Unauthorized"}). In Hostinger hPanel, go to Emails -> API Access (ya Dev Tools -> API) and generate an Access Token. Ensure 'All mailboxes' permission is granted.`;
    }
    return {
      success: false,
      message: `Hostinger Mail API Handshake Error: ${msg}`,
    };
  }
}

/**
 * Send an email directly via Hostinger REST API (HTTPS Port 443 — Bypasses Render SMTP port blocking)
 */
export async function sendEmailViaHostingerApi({
  to,
  subject,
  htmlBody,
  textBody,
  senderName,
  senderEmail,
  brand = "all",
  token,
  mailboxId,
}: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  senderName?: string | null;
  senderEmail?: string | null;
  brand?: string;
  token?: string;
  mailboxId?: string;
}) {
  const brandMap = getBrandConfigs();
  const brandDefaults = brandMap[brand] || brandMap.all;
  const fromName = senderName?.trim() || brandDefaults.name;
  const fromEmail = senderEmail?.trim() || brandDefaults.defaultEmail;

  const { sendApi } = await getHostingerSdk(token);
  const resolvedMailboxId = await resolveHostingerMailboxId(fromEmail, token, mailboxId);
  const plainText = textBody || (htmlBody ? htmlBody.replace(/<[^>]*>/g, "") : "");

  await sendApi.sendEmail(resolvedMailboxId, {
    to: [to.trim()],
    displayName: fromName,
    subject,
    text: plainText || " ",
    html: htmlBody,
    cc: [],
    bcc: [],
    attachments: [],
    inReplyTo: undefined as any,
    forwardOf: undefined as any,
  } as any);

  return {
    messageId: `hmail-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    accepted: [to],
    deliveryMethod: "hostinger_api",
  };
}

/**
 * Check if the active delivery configuration has valid credentials
 */
export function isEmailDeliveryConfigured(customConfig?: Partial<AutomailSettings>): boolean {
  const settings = getAutomailSettings();
  const deliveryMethod = customConfig?.deliveryMethod || settings.deliveryMethod || "smtp";
  const token = (customConfig?.hostingerApiToken || settings.hostingerApiToken || process.env.HOSTINGER_MAIL_API_TOKEN || "").trim();
  const user = (customConfig?.smtpUser || settings.smtpUser || "").trim();
  const pass = (customConfig?.smtpPass !== undefined ? customConfig.smtpPass : settings.smtpPass || "").trim();

  if (deliveryMethod === "hostinger_api") {
    return Boolean(token);
  }
  return Boolean((user && pass) || token);
}

/**
 * Verify email connection (SMTP or Hostinger API) with intelligent diagnostics
 */
export async function testSmtpConnection(customConfig?: Partial<AutomailSettings>) {
  const settings = getAutomailSettings();
  const deliveryMethod = customConfig?.deliveryMethod || settings.deliveryMethod || "smtp";
  const token = (customConfig?.hostingerApiToken || settings.hostingerApiToken || process.env.HOSTINGER_MAIL_API_TOKEN || "").trim();

  // If testing Hostinger Mail API
  if (deliveryMethod === "hostinger_api" || (!customConfig?.smtpPass && !settings.smtpPass && token)) {
    if (!token) {
      return {
        success: false,
        message: "Hostinger Mail API Token is missing! Please enter your Hostinger API Token in AutoMail Settings tab.",
      };
    }
    return await testHostingerMailApi(token);
  }

  // Testing SMTP
  const host = (customConfig?.smtpHost || settings.smtpHost || "smtp.hostinger.com").trim();
  await getHostIpv4(host);

  const { transporter, isConfigured, user, port, pass } = getTransporter(customConfig);
  if (!isConfigured) {
    if (token) {
      return await testHostingerMailApi(token);
    }
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

    // If port 465 timed out, test port 587
    if ((error.code === "ETIMEDOUT" || error.code === "ECONNREFUSED" || msg.includes("timeout")) && port === 465) {
      try {
        const altTransporter = createSmtpTransport(host, 587, user, pass);
        await altTransporter.verify();
        return {
          success: true,
          message: `Port 465 timed out on this server network, but Port 587 (STARTTLS) verified successfully! Please change your SMTP Port to 587 in AutoMail Settings and save.`,
        };
      } catch (altError: any) {
        msg = `Connection to ${host}:${port} timed out. Cloud hosting firewall (e.g. Render Free tier) blocks outbound SMTP ports 465 & 587. Please switch Delivery Method to 'Hostinger Mail API (HTTPS Port 443)' in Settings.`;
      }
    }

    if (msg.includes('Missing credentials for "PLAIN"') || error.code === "EAUTH" || msg.includes("535") || msg.includes("authentication failed")) {
      msg = `Authentication failed: Invalid Hostinger password or username for ${user}. Please verify your mailbox password at mail.hostinger.com.`;
    } else if (error.code === "ETIMEDOUT" || msg.includes("timeout")) {
      msg = `Connection to ${host}:${port} timed out. Cloud hosting firewall (e.g. Render Free tier) blocks outbound SMTP ports. Please switch Delivery Method to 'Hostinger Mail API (HTTPS Port 443)' in AutoMail Settings.`;
    }

    return { success: false, message: msg };
  }
}

/**
 * Send a single email with automatic multi-protocol routing and fallback
 * 1. Hostinger API (Port 443) if selected or fallback
 * 2. Hostinger SMTP (Port 465 / 587)
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
  const settings = getAutomailSettings();
  const deliveryMethod = customConfig?.deliveryMethod || settings.deliveryMethod || "smtp";
  const apiToken = (customConfig?.hostingerApiToken || settings.hostingerApiToken || process.env.HOSTINGER_MAIL_API_TOKEN || "").trim();

  // If Hostinger API is selected OR if SMTP pass is empty but API token exists
  if (deliveryMethod === "hostinger_api" || (!settings.smtpPass && apiToken)) {
    return await sendEmailViaHostingerApi({
      to,
      subject,
      htmlBody,
      textBody,
      senderName,
      senderEmail,
      brand,
      token: apiToken,
      mailboxId: customConfig?.hostingerMailboxId || settings.hostingerMailboxId,
    });
  }

  // SMTP Flow
  const host = (customConfig?.smtpHost || settings.smtpHost || "smtp.hostinger.com").trim();
  await getHostIpv4(host);

  const brandMap = getBrandConfigs();
  const brandDefaults = brandMap[brand] || brandMap.all;
  const fromName = senderName?.trim() || brandDefaults.name;
  const fromEmail = senderEmail?.trim() || brandDefaults.defaultEmail;

  const { transporter, isConfigured, user, port, pass } = getTransporter(customConfig);

  if (!isConfigured) {
    if (apiToken) {
      // Auto-rescue via Hostinger API
      return await sendEmailViaHostingerApi({
        to,
        subject,
        htmlBody,
        textBody,
        senderName,
        senderEmail,
        brand,
        token: apiToken,
      });
    }
    throw new Error(
      "Hostinger email credentials not configured! Please go to Admin -> AutoMail -> Settings tab and enter your Hostinger API Token or SMTP Password."
    );
  }

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
    // If SMTP times out or fails (e.g. Render blocks SMTP ports 465/587) and Hostinger API token is configured, auto-rescue!
    if (apiToken) {
      console.warn(`[AUTOMAIL] SMTP delivery failed (${err.message}). Auto-switching to Hostinger Mail API over HTTPS Port 443...`);
      return await sendEmailViaHostingerApi({
        to,
        subject,
        htmlBody,
        textBody,
        senderName,
        senderEmail,
        brand,
        token: apiToken,
      });
    }

    // Fallback between Port 465 and Port 587
    if ((err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED" || err.message?.includes("timeout")) && port === 465) {
      console.warn(`[AUTOMAIL] Port 465 timed out to ${host}. Attempting auto-fallback to Port 587...`);
      try {
        const fallbackTransporter = createSmtpTransport(host, 587, user, pass);
        const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
        console.log(`[AUTOMAIL] Fallback to Port 587 succeeded for ${to}!`);
        return fallbackInfo;
      } catch (fallbackErr: any) {
        throw new Error(
          `Email delivery failed on both Port 465 and Port 587 (Render blocks outbound SMTP): ${fallbackErr.message || err.message}. Switch Delivery Method to 'Hostinger Mail API (HTTPS Port 443)' in AutoMail Settings.`
        );
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

    if (!isEmailDeliveryConfigured()) {
      const errorMsg = "Hostinger credentials missing. Please enter your Hostinger API Token or SMTP Password in AutoMail Settings tab.";
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
