import fs from "fs";
import path from "path";
import { prisma } from "../../lib/db";

export interface AutomailSettings {
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
}

const SETTINGS_FILE_PATH = fs.existsSync(path.resolve(process.cwd(), "automail_settings.json"))
  ? path.resolve(process.cwd(), "automail_settings.json")
  : path.resolve(__dirname, "../../../automail_settings.json");

// In-memory cache for ultra-fast zero-latency reads across requests
let cachedSettings: AutomailSettings | null = null;

export function getDefaultSettings(): AutomailSettings {
  return {
    smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
    smtpPort: parseInt(process.env.SMTP_PORT || "465", 10),
    smtpUser: process.env.SMTP_USER || process.env.SENDER_EMAIL || "info@hindustanprojects.in",
    smtpPass: process.env.SMTP_PASS || process.env.HOSTINGER_API_KEY || "",
    senderNameHipro: "Hindustan Projects",
    senderEmailHipro: process.env.SMTP_USER || "info@hindustanprojects.in",
    senderNameHbs: "Hind Building Solutions",
    senderEmailHbs: process.env.HBS_SMTP_USER || "hbs@hindustanprojects.in",
    dailyLimit: parseInt(process.env.DAILY_LIMIT || "200", 10),
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || "15", 10),
    replyTo: process.env.SMTP_USER || "info@hindustanprojects.in",
  };
}

export function getAutomailSettingsFromFile(): AutomailSettings {
  const defaults = getDefaultSettings();
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      return {
        ...defaults,
        ...parsed,
        smtpPass: (parsed.smtpPass || defaults.smtpPass || "").trim(),
        smtpUser: (parsed.smtpUser || defaults.smtpUser || "").trim(),
        smtpPort: parseInt(String(parsed.smtpPort || defaults.smtpPort), 10),
        dailyLimit: parseInt(String(parsed.dailyLimit || defaults.dailyLimit), 10),
        rateLimitPerMinute: parseInt(String(parsed.rateLimitPerMinute || defaults.rateLimitPerMinute), 10),
      };
    }
  } catch (err) {
    console.error("[AUTOMAIL] Error reading fallback settings file:", err);
  }
  return defaults;
}

/**
 * Primary asynchronous getter: Reads from PostgreSQL database (persistent across Render restarts)
 */
export async function getAutomailSettingsAsync(): Promise<AutomailSettings> {
  // If we already have cached settings with configured password, return immediately
  if (cachedSettings && cachedSettings.smtpPass) {
    return cachedSettings;
  }

  try {
    const dbRecord = await (prisma as any).automailSetting.findUnique({
      where: { id: "singleton" },
    });

    if (dbRecord) {
      const dbSettings: AutomailSettings = {
        smtpHost: dbRecord.smtpHost || "smtp.hostinger.com",
        smtpPort: Number(dbRecord.smtpPort || 465),
        smtpUser: (dbRecord.smtpUser || "info@hindustanprojects.in").trim(),
        smtpPass: (dbRecord.smtpPass || process.env.SMTP_PASS || "").trim(),
        senderNameHipro: dbRecord.senderNameHipro || "Hindustan Projects",
        senderEmailHipro: dbRecord.senderEmailHipro || "info@hindustanprojects.in",
        senderNameHbs: dbRecord.senderNameHbs || "Hind Building Solutions",
        senderEmailHbs: dbRecord.senderEmailHbs || "hbs@hindustanprojects.in",
        dailyLimit: Number(dbRecord.dailyLimit || 200),
        rateLimitPerMinute: Number(dbRecord.rateLimitPerMinute || 15),
        replyTo: dbRecord.replyTo || "info@hindustanprojects.in",
      };
      cachedSettings = dbSettings;
      return dbSettings;
    }

    // If not in database yet, initialize it from file or env
    const fileSettings = getAutomailSettingsFromFile();
    try {
      await (prisma as any).automailSetting.create({
        data: {
          id: "singleton",
          ...fileSettings,
        },
      });
      console.log("[AUTOMAIL] Initialized persistent AutomailSetting row in database.");
    } catch {
      // Ignore conflict if created concurrently
    }
    cachedSettings = fileSettings;
    return fileSettings;
  } catch (err) {
    console.error("[AUTOMAIL] Database settings lookup failed, using file fallback:", err);
    const fallback = getAutomailSettingsFromFile();
    cachedSettings = fallback;
    return fallback;
  }
}

/**
 * Synchronous getter: Returns in-memory cache or file fallback, while kicking off async DB sync
 */
export function getAutomailSettings(): AutomailSettings {
  if (cachedSettings) {
    return cachedSettings;
  }

  const fallback = getAutomailSettingsFromFile();
  cachedSettings = fallback;

  // Background sync from database if not initialized
  getAutomailSettingsAsync().catch((err) => {
    console.error("[AUTOMAIL] Background settings cache sync failed:", err);
  });

  return fallback;
}

/**
 * Primary saver: Persists permanently to PostgreSQL database (survives Render restarts)
 */
export async function saveAutomailSettings(newSettings: Partial<AutomailSettings>): Promise<AutomailSettings> {
  const current = await getAutomailSettingsAsync();

  // Determine password to persist: preserve existing if new is empty or masked
  const passToSave =
    newSettings.smtpPass !== undefined &&
    newSettings.smtpPass !== "••••••••••••" &&
    newSettings.smtpPass.trim() !== ""
      ? newSettings.smtpPass.trim()
      : current.smtpPass;

  const merged: AutomailSettings = {
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
  };

  // 1. Persist to PostgreSQL database (Primary persistent storage)
  try {
    await (prisma as any).automailSetting.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        ...merged,
      },
      update: {
        ...merged,
      },
    });
    console.log("[AUTOMAIL] Settings saved permanently to PostgreSQL database.");
  } catch (dbErr) {
    console.error("[AUTOMAIL] Failed to upsert settings to PostgreSQL database:", dbErr);
  }

  // 2. Update memory cache
  cachedSettings = merged;

  // 3. Update runtime process environment
  process.env.SMTP_HOST = merged.smtpHost;
  process.env.SMTP_PORT = String(merged.smtpPort);
  process.env.SMTP_USER = merged.smtpUser;
  if (merged.smtpPass) {
    process.env.SMTP_PASS = merged.smtpPass;
  }
  process.env.DAILY_LIMIT = String(merged.dailyLimit);
  process.env.RATE_LIMIT_PER_MINUTE = String(merged.rateLimitPerMinute);

  // 4. Update local JSON file as backup
  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch (fileErr) {
    // Ignore in read-only / ephemeral environments
  }

  // 5. Update local .env if available
  try {
    const envPath = fs.existsSync(path.resolve(process.cwd(), ".env"))
      ? path.resolve(process.cwd(), ".env")
      : path.resolve(__dirname, "../../../.env");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf-8");
      const setEnvVar = (key: string, val: string) => {
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}="${val}"`);
        } else {
          envContent += `\n${key}="${val}"`;
        }
      };
      setEnvVar("SMTP_HOST", merged.smtpHost);
      setEnvVar("SMTP_PORT", String(merged.smtpPort));
      setEnvVar("SMTP_USER", merged.smtpUser);
      if (merged.smtpPass) setEnvVar("SMTP_PASS", merged.smtpPass);
      setEnvVar("DAILY_LIMIT", String(merged.dailyLimit));
      setEnvVar("RATE_LIMIT_PER_MINUTE", String(merged.rateLimitPerMinute));
      fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");
    }
  } catch {
    // Ignore in read-only / ephemeral environments
  }

  return merged;
}

/**
 * Initialize on server bootstrap
 */
export async function initAutomailSettings() {
  try {
    await getAutomailSettingsAsync();
    console.log("[AUTOMAIL] Engine settings initialized and persistent in PostgreSQL.");
  } catch (err) {
    console.warn("[AUTOMAIL] Initial settings load warning:", err);
  }
}
