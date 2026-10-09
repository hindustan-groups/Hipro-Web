import fs from "fs";
import path from "path";

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
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || "5", 10),
    replyTo: process.env.SMTP_USER || "info@hindustanprojects.in",
  };
}

export function getAutomailSettings(): AutomailSettings {
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
        // Ensure numbers are properly typed
        smtpPort: parseInt(String(parsed.smtpPort || defaults.smtpPort), 10),
        dailyLimit: parseInt(String(parsed.dailyLimit || defaults.dailyLimit), 10),
        rateLimitPerMinute: parseInt(String(parsed.rateLimitPerMinute || defaults.rateLimitPerMinute), 10),
      };
    }
  } catch (err) {
    console.error("[AUTOMAIL] Error reading settings file, using defaults:", err);
  }
  return defaults;
}

export function saveAutomailSettings(newSettings: Partial<AutomailSettings>): AutomailSettings {
  const current = getAutomailSettings();
  const merged: AutomailSettings = {
    ...current,
    ...newSettings,
    smtpPort: parseInt(String(newSettings.smtpPort ?? current.smtpPort), 10),
    dailyLimit: parseInt(String(newSettings.dailyLimit ?? current.dailyLimit), 10),
    rateLimitPerMinute: parseInt(String(newSettings.rateLimitPerMinute ?? current.rateLimitPerMinute), 10),
  };

  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
    console.log("[AUTOMAIL] Settings saved successfully to disk.");

    // Update active runtime process environment
    process.env.SMTP_HOST = merged.smtpHost;
    process.env.SMTP_PORT = String(merged.smtpPort);
    process.env.SMTP_USER = merged.smtpUser;
    process.env.SMTP_PASS = merged.smtpPass;
    process.env.DAILY_LIMIT = String(merged.dailyLimit);
    process.env.RATE_LIMIT_PER_MINUTE = String(merged.rateLimitPerMinute);

    // Also update backend/.env so it persists across dev server restarts
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
      setEnvVar("SMTP_PASS", merged.smtpPass);
      setEnvVar("DAILY_LIMIT", String(merged.dailyLimit));
      setEnvVar("RATE_LIMIT_PER_MINUTE", String(merged.rateLimitPerMinute));
      fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");
    }
  } catch (err) {
    console.error("[AUTOMAIL] Failed to write settings to disk:", err);
    throw err;
  }

  return merged;
}
