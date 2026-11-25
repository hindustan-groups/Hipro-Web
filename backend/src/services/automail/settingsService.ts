import fs from "fs";
import path from "path";
import { prisma } from "../../lib/db";

export interface CorporateMailbox {
  id: string;
  name: string;
  email: string;
  brand: "hipro" | "hbs" | "empanelment" | "all" | string;
  brandName?: string;
  deliveryMethod: "smtp" | "hostinger_api";
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpPassConfigured?: boolean;
  hostingerApiToken?: string;
  hostingerMailboxId?: string;
  isDefault?: boolean;
  status: "active" | "inactive";
  replyTo?: string;
  description?: string;
}

export interface DispatchRoutingRule {
  triggerKey: string;
  name: string;
  portal: string;
  description: string;
  mailboxId: string;
  fallbackMailboxId?: string;
  ccEmail?: string;
  active: boolean;
}

export interface AutomailSettings {
  deliveryMethod: "smtp" | "hostinger_api";
  hostingerApiToken: string;
  hostingerMailboxId: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  senderNameHipro: string;
  senderEmailHipro: string;
  senderNameHbs: string;
  senderEmailHbs: string;
  dailyLimit: number;
  rateLimitPerMinute: number;
  replyTo: string;
  mailboxes?: CorporateMailbox[];
  dispatchRouting?: Record<string, DispatchRoutingRule>;
}

const SETTINGS_FILE_PATH = fs.existsSync(path.resolve(process.cwd(), "automail_settings.json"))
  ? path.resolve(process.cwd(), "automail_settings.json")
  : fs.existsSync(path.resolve(process.cwd(), "backend/automail_settings.json"))
  ? path.resolve(process.cwd(), "backend/automail_settings.json")
  : path.resolve(__dirname, "../../../automail_settings.json");

// In-memory cache for ultra-fast zero-latency reads across requests
let cachedSettings: AutomailSettings | null = null;

export function getDefaultMailboxes(): CorporateMailbox[] {
  return [
    {
      id: "mb_hp_primary",
      name: "Hindustan Projects Corporate & HiPRO Civil",
      email: process.env.SMTP_USER || "info@hindustanprojects.in",
      brand: "hipro",
      brandName: "HiPRO Civil & Holding HQ",
      deliveryMethod: "smtp",
      smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
      smtpPort: parseInt(process.env.SMTP_PORT || "465", 10),
      smtpUser: process.env.SMTP_USER || "info@hindustanprojects.in",
      smtpPass: process.env.SMTP_PASS || "",
      smtpPassConfigured: Boolean(process.env.SMTP_PASS),
      isDefault: true,
      status: "active",
      replyTo: process.env.SMTP_USER || "info@hindustanprojects.in",
      description: "Primary corporate mailbox for civil contracts, corporate inquiries, and master HQ dispatches.",
    },
  ];
}

export function getDefaultRoutingRules(): Record<string, DispatchRoutingRule> {
  return {
    quote_requests: {
      triggerKey: "quote_requests",
      name: "Turnkey Civil Quotes & Estimates",
      portal: "HiPRO Flagship Civil",
      description: "Dispatched upon client submission of construction quotation, turnkey villa or PEB estimation.",
      mailboxId: "mb_hp_primary",
      ccEmail: "",
      active: true,
    },
    contact_inquiries: {
      triggerKey: "contact_inquiries",
      name: "General Contact & Website Inquiries",
      portal: "Holding Corporate",
      description: "Client receipt confirmations and internal executive alerts for website contact forms.",
      mailboxId: "mb_hp_primary",
      ccEmail: "",
      active: true,
    },
    hbs_leads: {
      triggerKey: "hbs_leads",
      name: "HBS Waterproofing & Structural Repair Leads",
      portal: "Hind Building (HBS)",
      description: "Inbound leads for basement dampness, roof waterproofing, PU injection grouting & repair quotes.",
      mailboxId: "mb_hbs_waterproofing",
      ccEmail: "",
      active: true,
    },
    vendor_kyc_approvals: {
      triggerKey: "vendor_kyc_approvals",
      name: "Vendor Hub Empanelment & KYC Approvals",
      portal: "Vendor Procurement Hub",
      description: "Contractor KYC clearance certificates, assigned CPWD grade (Class A-D), and bidding authorization.",
      mailboxId: "mb_hp_primary",
      ccEmail: "",
      active: true,
    },
    smart_pvc_cards: {
      triggerKey: "smart_pvc_cards",
      name: "Smart PVC Card Dispatches & Tracking",
      portal: "Vendor Procurement Hub",
      description: "Notification with Speed Post / Blue Dart courier tracking for physical 3D NFC holographic vendor cards.",
      mailboxId: "mb_hp_primary",
      ccEmail: "",
      active: true,
    },
    site_gate_passes: {
      triggerKey: "site_gate_passes",
      name: "Daily Worker Site Gate Passes",
      portal: "Vendor Procurement Hub",
      description: "QR-coded daily access passes sent to site engineers and security check cabins.",
      mailboxId: "mb_hp_primary",
      ccEmail: "",
      active: true,
    },
    security_alerts: {
      triggerKey: "security_alerts",
      name: "Master Admin 2FA & Emergency System Alerts",
      portal: "Company Headquarters",
      description: "Emergency TOTP bypass recovery notices, IP anomaly alerts, and secrets rotation audit summaries.",
      mailboxId: "mb_hp_primary",
      ccEmail: "",
      active: true,
    },
    newsletter_campaigns: {
      triggerKey: "newsletter_campaigns",
      name: "Investor Relations & Monthly Progress Digests",
      portal: "Group Corporate",
      description: "Broadcast monthly infrastructure digests, investor milestones, and active commercial tender notices.",
      mailboxId: "mb_hp_primary",
      ccEmail: "",
      active: true,
    },
  };
}

export function getDefaultSettings(): AutomailSettings {
  return {
    deliveryMethod: ((process.env.DELIVERY_METHOD as any) || "smtp"),
    hostingerApiToken: process.env.HOSTINGER_MAIL_API_TOKEN || process.env.HOSTINGER_API_KEY || "",
    hostingerMailboxId: process.env.HOSTINGER_MAILBOX_ID || "",
    smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
    smtpPort: parseInt(process.env.SMTP_PORT || "465", 10),
    smtpUser: process.env.SMTP_USER || process.env.SENDER_EMAIL || "info@hindustanprojects.in",
    smtpPass: process.env.SMTP_PASS || "",
    senderNameHipro: "Hindustan Projects",
    senderEmailHipro: process.env.SMTP_USER || "info@hindustanprojects.in",
    senderNameHbs: "Hind Building Solutions",
    senderEmailHbs: process.env.HBS_SMTP_USER || "hbs@hindustanprojects.in",
    dailyLimit: parseInt(process.env.DAILY_LIMIT || "200", 10),
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || "15", 10),
    replyTo: process.env.SMTP_USER || "info@hindustanprojects.in",
    mailboxes: getDefaultMailboxes(),
    dispatchRouting: getDefaultRoutingRules(),
  };
}

export function getAutomailSettingsFromFile(): AutomailSettings {
  const defaults = getDefaultSettings();
  try {
    const candidatePaths = [
      SETTINGS_FILE_PATH,
      path.resolve(process.cwd(), "automail_settings.json"),
      path.resolve(process.cwd(), "backend/automail_settings.json"),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(data);
        return {
          ...defaults,
          ...parsed,
          deliveryMethod: (parsed.deliveryMethod || defaults.deliveryMethod || "smtp"),
          hostingerApiToken: (parsed.hostingerApiToken || defaults.hostingerApiToken || "").trim(),
          hostingerMailboxId: (parsed.hostingerMailboxId || defaults.hostingerMailboxId || "").trim(),
          smtpPass: (parsed.smtpPass || defaults.smtpPass || "").trim(),
          smtpUser: (parsed.smtpUser || defaults.smtpUser || "").trim(),
          smtpPort: parseInt(String(parsed.smtpPort || defaults.smtpPort), 10),
          dailyLimit: parseInt(String(parsed.dailyLimit || defaults.dailyLimit), 10),
          rateLimitPerMinute: parseInt(String(parsed.rateLimitPerMinute || defaults.rateLimitPerMinute), 10),
          mailboxes: Array.isArray(parsed.mailboxes) && parsed.mailboxes.length > 0 ? parsed.mailboxes : defaults.mailboxes,
          dispatchRouting: parsed.dispatchRouting && Object.keys(parsed.dispatchRouting).length > 0 ? parsed.dispatchRouting : defaults.dispatchRouting,
        };
      }
    }
  } catch (err) {
    console.error("[AUTOMAIL] Error reading fallback settings file:", err);
  }
  return defaults;
}

/**
 * Primary asynchronous getter: Reads from PostgreSQL database and synchronizes with local multi-mailbox state
 */
export async function getAutomailSettingsAsync(): Promise<AutomailSettings> {
  const fileFallback = getAutomailSettingsFromFile();
  try {
    const dbRecord = await (prisma as any).automailSetting.findUnique({
      where: { id: "singleton" },
    });

    if (dbRecord) {
      const dbSettings: AutomailSettings = {
        deliveryMethod: (dbRecord.deliveryMethod as any) || fileFallback.deliveryMethod || "smtp",
        hostingerApiToken: (dbRecord.hostingerApiToken || fileFallback.hostingerApiToken || "").trim(),
        hostingerMailboxId: (dbRecord.hostingerMailboxId || fileFallback.hostingerMailboxId || "").trim(),
        smtpHost: dbRecord.smtpHost || fileFallback.smtpHost || "smtp.hostinger.com",
        smtpPort: Number(dbRecord.smtpPort || fileFallback.smtpPort || 465),
        smtpUser: (dbRecord.smtpUser || fileFallback.smtpUser || "info@hindustanprojects.in").trim(),
        smtpPass: (dbRecord.smtpPass || fileFallback.smtpPass || "").trim(),
        senderNameHipro: dbRecord.senderNameHipro || fileFallback.senderNameHipro || "Hindustan Projects",
        senderEmailHipro: dbRecord.senderEmailHipro || fileFallback.senderEmailHipro || "info@hindustanprojects.in",
        senderNameHbs: dbRecord.senderNameHbs || fileFallback.senderNameHbs || "Hind Building Solutions",
        senderEmailHbs: dbRecord.senderEmailHbs || fileFallback.senderEmailHbs || "hbs@hindustanprojects.in",
        dailyLimit: Number(dbRecord.dailyLimit || fileFallback.dailyLimit || 200),
        rateLimitPerMinute: Number(dbRecord.rateLimitPerMinute || fileFallback.rateLimitPerMinute || 15),
        replyTo: dbRecord.replyTo || fileFallback.replyTo || "info@hindustanprojects.in",
        mailboxes: fileFallback.mailboxes && fileFallback.mailboxes.length > 0 ? fileFallback.mailboxes : getDefaultMailboxes(),
        dispatchRouting: fileFallback.dispatchRouting || getDefaultRoutingRules(),
      };
      cachedSettings = dbSettings;
      process.env.DELIVERY_METHOD = dbSettings.deliveryMethod;
      if (dbSettings.hostingerApiToken) process.env.HOSTINGER_MAIL_API_TOKEN = dbSettings.hostingerApiToken;
      if (dbSettings.smtpPass) process.env.SMTP_PASS = dbSettings.smtpPass;
      return dbSettings;
    }

    try {
      // Prisma-compatible payload (only known schema fields)
      const { mailboxes: _m, dispatchRouting: _d, ...prismaData } = fileFallback;
      await (prisma as any).automailSetting.create({
        data: {
          id: "singleton",
          ...prismaData,
        },
      });
      console.log("[AUTOMAIL] Initialized persistent AutomailSetting row in database.");
    } catch {
      // Ignore conflict
    }
    cachedSettings = fileFallback;
    return fileFallback;
  } catch (err) {
    console.error("[AUTOMAIL] Database settings lookup failed, using file fallback:", err);
    cachedSettings = fileFallback;
    return fileFallback;
  }
}

/**
 * Synchronous getter: Returns in-memory cache or file fallback
 */
export function getAutomailSettings(): AutomailSettings {
  if (cachedSettings) {
    return cachedSettings;
  }

  const fallback = getAutomailSettingsFromFile();
  cachedSettings = fallback;

  getAutomailSettingsAsync().catch((err) => {
    console.error("[AUTOMAIL] Background settings cache sync failed:", err);
  });

  return fallback;
}

/**
 * Primary saver: Persists to PostgreSQL database and local multi-mailbox JSON registry
 */
export async function saveAutomailSettings(newSettings: Partial<AutomailSettings>): Promise<AutomailSettings> {
  let current: AutomailSettings;
  try {
    current = await getAutomailSettingsAsync();
  } catch {
    current = cachedSettings || getDefaultSettings();
  }

  // Determine password to persist: preserve existing if new is empty or masked
  const passToSave =
    newSettings.smtpPass !== undefined &&
    newSettings.smtpPass !== "••••••••••••" &&
    newSettings.smtpPass.trim() !== ""
      ? newSettings.smtpPass.trim()
      : current.smtpPass;

  // Determine Hostinger Mail API token to persist
  let rawTokenToSave =
    newSettings.hostingerApiToken !== undefined &&
    newSettings.hostingerApiToken !== "••••••••••••" &&
    newSettings.hostingerApiToken.trim() !== ""
      ? newSettings.hostingerApiToken.trim()
      : current.hostingerApiToken;

  let tokenToSave = (rawTokenToSave || "").trim();
  if ((tokenToSave.startsWith('"') && tokenToSave.endsWith('"')) || (tokenToSave.startsWith("'") && tokenToSave.endsWith("'"))) {
    tokenToSave = tokenToSave.slice(1, -1).trim();
  }
  if (tokenToSave.toLowerCase().startsWith("bearer ")) {
    tokenToSave = tokenToSave.slice(7).trim();
  }

  const chosenDeliveryMethod =
    newSettings.deliveryMethod ||
    (tokenToSave ? "hostinger_api" : current.deliveryMethod || "smtp");

  // Merge mailboxes and routing
  const mergedMailboxes = newSettings.mailboxes !== undefined
    ? newSettings.mailboxes
    : (current.mailboxes && current.mailboxes.length > 0 ? current.mailboxes : getDefaultMailboxes());

  const mergedRouting = newSettings.dispatchRouting !== undefined
    ? newSettings.dispatchRouting
    : (current.dispatchRouting || getDefaultRoutingRules());

  const merged: AutomailSettings = {
    deliveryMethod: chosenDeliveryMethod,
    hostingerApiToken: tokenToSave,
    hostingerMailboxId: (newSettings.hostingerMailboxId !== undefined ? newSettings.hostingerMailboxId : current.hostingerMailboxId || "").trim(),
    smtpHost: (newSettings.smtpHost || current.smtpHost || "smtp.hostinger.com").trim(),
    smtpPort: parseInt(String(newSettings.smtpPort ?? current.smtpPort ?? 465), 10),
    smtpUser: (newSettings.smtpUser || current.smtpUser || "info@hindustanprojects.in").trim(),
    smtpPass: passToSave,
    senderNameHipro: (newSettings.senderNameHipro || current.senderNameHipro || "Hindustan Projects").trim(),
    senderEmailHipro: (newSettings.senderEmailHipro || current.senderEmailHipro || "info@hindustanprojects.in").trim(),
    senderNameHbs: (newSettings.senderNameHbs || current.senderNameHbs || "Hind Building Solutions").trim(),
    senderEmailHbs: (newSettings.senderEmailHbs || current.senderEmailHbs || "hbs@hindustanprojects.in").trim(),
    dailyLimit: parseInt(String(newSettings.dailyLimit ?? current.dailyLimit ?? 200), 10),
    rateLimitPerMinute: parseInt(String(newSettings.rateLimitPerMinute ?? current.rateLimitPerMinute ?? 15), 10),
    replyTo: (newSettings.replyTo || current.replyTo || "info@hindustanprojects.in").trim(),
    mailboxes: mergedMailboxes,
    dispatchRouting: mergedRouting,
  };

  // 1. Persist to PostgreSQL database (Only Prisma model columns)
  try {
    const { mailboxes: _m, dispatchRouting: _d, ...prismaData } = merged;
    await (prisma as any).automailSetting.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        ...prismaData,
      },
      update: {
        ...prismaData,
      },
    });
    console.log("[AUTOMAIL] Settings saved permanently to PostgreSQL database.");
  } catch (dbErr) {
    console.error("[AUTOMAIL] Failed to upsert settings to PostgreSQL database:", dbErr);
  }

  // 2. Update memory cache
  cachedSettings = merged;

  // 3. Update runtime process environment
  process.env.DELIVERY_METHOD = merged.deliveryMethod;
  if (merged.hostingerApiToken) process.env.HOSTINGER_MAIL_API_TOKEN = merged.hostingerApiToken;
  process.env.SMTP_HOST = merged.smtpHost;
  process.env.SMTP_PORT = String(merged.smtpPort);
  process.env.SMTP_USER = merged.smtpUser;
  if (merged.smtpPass) process.env.SMTP_PASS = merged.smtpPass;
  process.env.DAILY_LIMIT = String(merged.dailyLimit);
  process.env.RATE_LIMIT_PER_MINUTE = String(merged.rateLimitPerMinute);

  // 4. Update local JSON file backups
  const jsonPaths = [
    SETTINGS_FILE_PATH,
    path.resolve(process.cwd(), "automail_settings.json"),
    path.resolve(process.cwd(), "backend/automail_settings.json"),
    path.resolve(__dirname, "../../../automail_settings.json"),
  ];
  for (const jPath of jsonPaths) {
    try {
      fs.writeFileSync(jPath, JSON.stringify(merged, null, 2), "utf-8");
    } catch {
      // Ignore
    }
  }

  return merged;
}

/**
 * Manage Corporate Mailboxes
 */
export async function saveCorporateMailbox(mailbox: Partial<CorporateMailbox>): Promise<CorporateMailbox> {
  const settings = await getAutomailSettingsAsync();
  const list: CorporateMailbox[] = [...(settings.mailboxes || getDefaultMailboxes())];

  let savedMailbox: CorporateMailbox;

  if (mailbox.id) {
    // Update existing
    const idx = list.findIndex((m: CorporateMailbox) => m.id === mailbox.id);
    if (idx >= 0) {
      const existing = list[idx];
      const pass = mailbox.smtpPass && mailbox.smtpPass !== "••••••••••••"
        ? mailbox.smtpPass
        : existing.smtpPass;

      savedMailbox = {
        ...existing,
        ...mailbox,
        id: existing.id,
        smtpPass: pass,
        smtpPassConfigured: Boolean(pass),
      } as CorporateMailbox;

      if (mailbox.isDefault) {
        list.forEach((m: CorporateMailbox) => { m.isDefault = false; });
        savedMailbox.isDefault = true;
      }
      list[idx] = savedMailbox;
    } else {
      // Create with given ID
      savedMailbox = createMailboxObject(mailbox);
      if (savedMailbox.isDefault) list.forEach((m: CorporateMailbox) => { m.isDefault = false; });
      list.push(savedMailbox);
    }
  } else {
    // Create brand new
    savedMailbox = createMailboxObject(mailbox);
    if (savedMailbox.isDefault) list.forEach((m: CorporateMailbox) => { m.isDefault = false; });
    list.push(savedMailbox);
  }

  await saveAutomailSettings({ mailboxes: list });
  return savedMailbox;
}

function createMailboxObject(input: Partial<CorporateMailbox>): CorporateMailbox {
  const id = input.id || `mb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const pass = input.smtpPass && input.smtpPass !== "••••••••••••" ? input.smtpPass : "";
  return {
    id,
    name: input.name || "Corporate Outgoing Mailbox",
    email: input.email || "info@hindustanprojects.in",
    brand: input.brand || "hipro",
    brandName: input.brandName || "HiPRO Flagship Civil",
    deliveryMethod: input.deliveryMethod || "smtp",
    smtpHost: input.smtpHost || "smtp.hostinger.com",
    smtpPort: Number(input.smtpPort || 465),
    smtpUser: input.smtpUser || input.email || "info@hindustanprojects.in",
    smtpPass: pass,
    smtpPassConfigured: Boolean(pass),
    hostingerApiToken: input.hostingerApiToken || "",
    hostingerMailboxId: input.hostingerMailboxId || "",
    isDefault: Boolean(input.isDefault),
    status: input.status || "active",
    replyTo: input.replyTo || input.email || "info@hindustanprojects.in",
    description: input.description || "",
  };
}

export async function deleteCorporateMailbox(mailboxId: string): Promise<boolean> {
  const settings = await getAutomailSettingsAsync();
  const list: CorporateMailbox[] = [...(settings.mailboxes || getDefaultMailboxes())];

  if (list.length <= 1) {
    throw new Error("Cannot delete the only configured mailbox. At least one corporate mailbox must remain.");
  }

  const remaining = list.filter((m: CorporateMailbox) => m.id !== mailboxId);
  if (remaining.length === list.length) {
    return false; // Not found
  }

  // If deleted was default, make first remaining default
  if (!remaining.some((m: CorporateMailbox) => m.isDefault)) {
    remaining[0].isDefault = true;
  }

  // Update routing rules referencing this mailbox
  const routing = { ...(settings.dispatchRouting || getDefaultRoutingRules()) };
  for (const key of Object.keys(routing)) {
    if (routing[key].mailboxId === mailboxId) {
      routing[key].mailboxId = remaining[0].id;
    }
  }

  await saveAutomailSettings({ mailboxes: remaining, dispatchRouting: routing });
  return true;
}

export async function saveDispatchRouting(routing: Record<string, DispatchRoutingRule>): Promise<Record<string, DispatchRoutingRule>> {
  await saveAutomailSettings({ dispatchRouting: routing });
  return routing;
}

/**
 * Resolve which mailbox and CC to use for any given system event trigger
 */
export function resolveSenderForTrigger(triggerKey: string): {
  mailbox: CorporateMailbox;
  ccEmail?: string;
} {
  const settings = getAutomailSettings();
  const mailboxes: CorporateMailbox[] = settings.mailboxes && settings.mailboxes.length > 0 ? settings.mailboxes : getDefaultMailboxes();
  const routing = settings.dispatchRouting || getDefaultRoutingRules();

  const rule = routing[triggerKey];
  const targetMailboxId = rule?.mailboxId;
  let mailbox = mailboxes.find((m: CorporateMailbox) => m.id === targetMailboxId && m.status === "active");

  if (!mailbox) {
    mailbox = mailboxes.find((m: CorporateMailbox) => m.isDefault && m.status === "active") || mailboxes[0];
  }

  return {
    mailbox,
    ccEmail: rule?.ccEmail,
  };
}

/**
 * Initialize on server bootstrap
 */
export async function initAutomailSettings() {
  try {
    await getAutomailSettingsAsync();
    console.log("[AUTOMAIL] Engine settings & dynamic multi-mailbox matrix initialized.");
  } catch (err) {
    console.warn("[AUTOMAIL] Initial settings load warning:", err);
  }
}
