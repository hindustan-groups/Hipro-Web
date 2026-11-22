import { Router, Request, Response } from "express";
import { findAll, updateOne, insertOne } from "../lib/db";
import { adminGuard } from "../middleware/authGuard";
import { getSessionUser } from "../lib/auth";
import type { Settings } from "../lib/types";
import {
  getHqSettingsAsync,
  saveHqSettings,
  pingDomainUrl,
} from "../services/hqSettingsService";

const router = Router();

// -------------------------------------------------------------------
// MASTER HQ CORPORATE GOVERNANCE & DOMAIN ROUTING
// -------------------------------------------------------------------

// GET /api/settings/hq — Master HQ Corporate Legal & Domain Settings
router.get("/hq", adminGuard, async (req: Request, res: Response) => {
  try {
    const hq = await getHqSettingsAsync();
    return res.json({ success: true, data: hq });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to load HQ settings" });
  }
});

// PUT /api/settings/hq — Save Master HQ Corporate Settings permanently
router.put("/hq", adminGuard, async (req: Request, res: Response) => {
  try {
    const updated = await saveHqSettings(req.body);
    return res.json({
      success: true,
      message: "Master HQ Corporate settings saved permanently to database!",
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to save HQ settings" });
  }
});

// POST /api/settings/hq/ping — Live Domain Route Health Ping
router.post("/hq/ping", adminGuard, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: "Target domain URL required" });
    }
    const result = await pingDomainUrl(url);
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Ping check failed" });
  }
});

// GET /api/settings/hq/public — Public portal status & maintenance mode checks
router.get("/hq/public", async (req: Request, res: Response) => {
  try {
    const hq = await getHqSettingsAsync();
    return res.json({
      success: true,
      data: {
        holdingName: hq.holdingName,
        headOffice: hq.headOffice,
        centralEmail: hq.centralEmail,
        supportPhone: hq.supportPhone,
        emergencyHelpline: hq.emergencyHelpline,
        maintenanceMode: hq.maintenanceMode,
        portalRouting: hq.portalRouting,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------------
// GENERAL WEBSITE CMS SETTINGS
// -------------------------------------------------------------------

// GET /api/settings — Public safe / Admin full
router.get("/", async (req: Request, res: Response) => {
  try {
    const data = await findAll<Settings>("settings");
    let currentSettings: Settings;

    if (data.length === 0) {
      currentSettings = await insertOne<Settings>("settings", {
        id: "global",
        cloudinaryCloudName: "",
        cloudinaryUploadPreset: "",
      });
    } else {
      currentSettings = data[0];
    }

    // Check if the request comes from an authenticated admin
    const user = await getSessionUser(req);
    if (user && user.role === "admin") {
      return res.json({ success: true, data: currentSettings });
    }

    // Public / Unauthenticated callers: expose only safe public fields
    const safePublicSettings = {
      id: currentSettings.id,
      companyEmail: currentSettings.companyEmail,
      companyPhone: currentSettings.companyPhone,
      companyAddress: currentSettings.companyAddress,
      socialLinks: currentSettings.socialLinks,
      pageContent: currentSettings.pageContent,
      navigationConfig: currentSettings.navigationConfig,
      updatedAt: currentSettings.updatedAt,
    };

    return res.json({ success: true, data: safePublicSettings });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});

// PATCH /api/settings — Protected (Super Admin ONLY)
router.patch("/", adminGuard, async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const data = await findAll<Settings>("settings");
    
    let updated;
    if (data.length === 0) {
      updated = await insertOne<Settings>("settings", {
        id: "global",
        ...body,
      });
    } else {
      updated = await updateOne<Settings>("settings", data[0].id!, body);
    }
    
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update settings" });
  }
});

export default router;
