import fs from "fs";
import path from "path";
import { findAll, updateOne, insertOne } from "../lib/db";
import type { Settings } from "../lib/types";

export interface MasterHqSettings {
  holdingName: string;
  holdingCin: string;
  holdingGst: string;
  headOffice: string;
  centralEmail: string;
  supportPhone: string;
  emergencyHelpline: string;
  portalRouting: {
    hiproDomain: string;
    hbsDomain: string;
    vendorDomain: string;
  };
  maintenanceMode: {
    hipro: boolean;
    hbs: boolean;
    vendor: boolean;
    maintenanceNotice: string;
  };
  brandAssets: {
    logoUrl: string;
    faviconUrl: string;
    letterheadHeader: string;
    officialDisclaimer: string;
  };
  adminSecretKey?: string;
  updatedAt?: string;
}

const HQ_SETTINGS_FILE_PATHS = [
  path.resolve(process.cwd(), "hq_settings.json"),
  path.resolve(process.cwd(), "backend/hq_settings.json"),
  path.resolve(__dirname, "../../hq_settings.json"),
];

let cachedHqSettings: MasterHqSettings | null = null;

export function getDefaultHqSettings(): MasterHqSettings {
  return {
    holdingName: "Hindustan Projects Group",
    holdingCin: "U45201RJ2020PTC068942",
    holdingGst: "08AABCH1234F1Z8",
    headOffice: "Near Circuit House, Subhash Nagar, Bhilwara, Rajasthan 311001",
    centralEmail: "info@hindustanprojects.in",
    supportPhone: "+91 94141 12345",
    emergencyHelpline: "+91 1482 234567",
    portalRouting: {
      hiproDomain: "https://www.hindustanprojects.in",
      hbsDomain: "https://hindbuilding.hindustanprojects.in",
      vendorDomain: "https://empanelment.hindustanprojects.in",
    },
    maintenanceMode: {
      hipro: false,
      hbs: false,
      vendor: false,
      maintenanceNotice: "This portal is currently undergoing scheduled infrastructure maintenance. Normal operations will resume shortly.",
    },
    brandAssets: {
      logoUrl: "/logo.jpg",
      faviconUrl: "/favicon.ico",
      letterheadHeader: "Hindustan Projects Group · Architectural Engineering, Turnkey Construction & Civil Infrastructure",
      officialDisclaimer: "Confidentiality Notice: This digital transmission and any accompanying credentials are confidential and legally privileged. Strictly governed by Hindustan Projects Group central corporate governance protocols.",
    },
    adminSecretKey: process.env.ADMIN_SECRET_KEY || "hp-admin-gateway-key-2026",
    updatedAt: new Date().toISOString(),
  };
}

export function getHqSettingsFromFile(): MasterHqSettings {
  const defaults = getDefaultHqSettings();
  for (const p of HQ_SETTINGS_FILE_PATHS) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          ...defaults,
          ...parsed,
          portalRouting: { ...defaults.portalRouting, ...(parsed.portalRouting || {}) },
          maintenanceMode: { ...defaults.maintenanceMode, ...(parsed.maintenanceMode || {}) },
          brandAssets: { ...defaults.brandAssets, ...(parsed.brandAssets || {}) },
        };
      }
    } catch (e) {
      console.warn(`[HQ SETTINGS] Failed to parse file at ${p}:`, e);
    }
  }
  return defaults;
}

export async function getHqSettingsAsync(): Promise<MasterHqSettings> {
  const defaults = getDefaultHqSettings();
  try {
    const data = await findAll<Settings>("settings");
    if (data.length > 0 && data[0].pageContent) {
      try {
        const parsedContent = JSON.parse(data[0].pageContent);
        if (parsedContent?.hqSettings) {
          const merged: MasterHqSettings = {
            ...defaults,
            ...parsedContent.hqSettings,
            headOffice: data[0].companyAddress || parsedContent.hqSettings.headOffice || defaults.headOffice,
            centralEmail: data[0].companyEmail || parsedContent.hqSettings.centralEmail || defaults.centralEmail,
            supportPhone: data[0].companyPhone || parsedContent.hqSettings.supportPhone || defaults.supportPhone,
            portalRouting: { ...defaults.portalRouting, ...(parsedContent.hqSettings.portalRouting || {}) },
            maintenanceMode: { ...defaults.maintenanceMode, ...(parsedContent.hqSettings.maintenanceMode || {}) },
            brandAssets: { ...defaults.brandAssets, ...(parsedContent.hqSettings.brandAssets || {}) },
          };
          cachedHqSettings = merged;
          return merged;
        }
      } catch {
        // Fallback to file if JSON parse fails
      }
    }

    // Fallback to file
    const fileSettings = getHqSettingsFromFile();
    cachedHqSettings = fileSettings;
    return fileSettings;
  } catch (err) {
    console.error("[HQ SETTINGS] DB lookup failed, using fallback:", err);
    return cachedHqSettings || getHqSettingsFromFile();
  }
}

export async function saveHqSettings(incoming: Partial<MasterHqSettings>): Promise<MasterHqSettings> {
  const current = await getHqSettingsAsync();
  const merged: MasterHqSettings = {
    ...current,
    ...incoming,
    portalRouting: {
      ...current.portalRouting,
      ...(incoming.portalRouting || {}),
    },
    maintenanceMode: {
      ...current.maintenanceMode,
      ...(incoming.maintenanceMode || {}),
    },
    brandAssets: {
      ...current.brandAssets,
      ...(incoming.brandAssets || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  // 1. Persist to PostgreSQL Database Settings record
  try {
    const data = await findAll<Settings>("settings");
    let existingContent: Record<string, any> = {};
    let settingsId = "global";

    if (data.length > 0) {
      settingsId = data[0].id || "global";
      if (data[0].pageContent) {
        try {
          existingContent = JSON.parse(data[0].pageContent);
        } catch {
          existingContent = {};
        }
      }
    }

    existingContent.hqSettings = merged;

    const payloadToDb: Partial<Settings> = {
      companyEmail: merged.centralEmail,
      companyPhone: merged.supportPhone,
      companyAddress: merged.headOffice,
      pageContent: JSON.stringify(existingContent),
    };

    if (data.length === 0) {
      await insertOne<Settings>("settings", {
        id: settingsId,
        cloudinaryCloudName: "",
        cloudinaryUploadPreset: "",
        ...payloadToDb,
      });
    } else {
      await updateOne<Settings>("settings", settingsId, payloadToDb);
    }
    console.log("[HQ SETTINGS] Saved permanently to database settings table.");
  } catch (dbErr) {
    console.error("[HQ SETTINGS] Failed to persist to database:", dbErr);
  }

  // 2. Persist to local JSON file backups
  for (const p of HQ_SETTINGS_FILE_PATHS) {
    try {
      fs.writeFileSync(p, JSON.stringify(merged, null, 2), "utf-8");
    } catch {
      // Ignore write errors to optional backup locations
    }
  }

  // 3. Update memory cache
  cachedHqSettings = merged;
  return merged;
}

export async function pingDomainUrl(targetUrl: string): Promise<{
  online: boolean;
  statusCode: number;
  statusText: string;
  latencyMs: number;
  url: string;
  timestamp: string;
}> {
  const start = Date.now();
  let cleanUrl = (targetUrl || "").trim();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(cleanUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "HindustanProjects-MasterHQ-HealthRadar/2.0",
        Accept: "*/*",
      },
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    return {
      online: res.status < 500,
      statusCode: res.status,
      statusText: res.statusText || (res.ok ? "OK" : `HTTP ${res.status}`),
      latencyMs,
      url: cleanUrl,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const isTimeout = err.name === "AbortError";
    return {
      online: false,
      statusCode: 0,
      statusText: isTimeout ? "Timeout (>6000ms)" : err.message || "Connection Refused / Offline",
      latencyMs,
      url: cleanUrl,
      timestamp: new Date().toISOString(),
    };
  }
}
