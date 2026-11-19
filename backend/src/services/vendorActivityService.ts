import fs from "fs";
import path from "path";
import { prisma } from "../lib/db";

export interface ActivityLogEntry {
  id: string;
  applicationId: string;
  vendorAccountId?: string | null;
  actorType: "ADMIN" | "VENDOR" | "SYSTEM";
  actorId?: string | null;
  actorName: string;
  action: string;
  details?: string | null;
  createdAt: string;
}

const STORE_PATH = path.resolve(__dirname, "../../vendor_activity_store.json");

function loadFallbackStore(): ActivityLogEntry[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("[VENDOR ACTIVITY] Failed to read activity store:", e);
  }
  return [];
}

function saveFallbackStore(entries: ActivityLogEntry[]) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(entries, null, 2), "utf-8");
  } catch (e) {
    console.error("[VENDOR ACTIVITY] Failed to save activity store:", e);
  }
}

/**
 * Log an audit activity event for a vendor application.
 */
export async function logVendorActivity(params: {
  applicationId: string;
  vendorAccountId?: string | null;
  actorType: "ADMIN" | "VENDOR" | "SYSTEM";
  actorId?: string | null;
  actorName: string;
  action: string;
  details?: string | null;
}): Promise<ActivityLogEntry> {
  const entry: ActivityLogEntry = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    applicationId: params.applicationId,
    vendorAccountId: params.vendorAccountId || null,
    actorType: params.actorType,
    actorId: params.actorId || null,
    actorName: params.actorName,
    action: params.action,
    details: params.details || null,
    createdAt: new Date().toISOString(),
  };

  try {
    const created = await (prisma as any).vendorActivityLog.create({
      data: {
        applicationId: entry.applicationId,
        vendorAccountId: entry.vendorAccountId,
        actorType: entry.actorType,
        actorId: entry.actorId,
        actorName: entry.actorName,
        action: entry.action,
        details: entry.details,
      },
    });
    return {
      ...created,
      createdAt: created.createdAt.toISOString(),
    };
  } catch {
    const store = loadFallbackStore();
    store.unshift(entry);
    saveFallbackStore(store);
    return entry;
  }
}

/**
 * Get all activity log entries for a specific vendor application.
 */
export async function getVendorActivityLogs(applicationId: string): Promise<ActivityLogEntry[]> {
  try {
    const records = await (prisma as any).vendorActivityLog.findMany({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    const store = loadFallbackStore();
    return store.filter((r) => r.applicationId === applicationId);
  }
}

