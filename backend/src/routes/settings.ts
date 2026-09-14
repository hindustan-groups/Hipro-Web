import { Router, Request, Response } from "express";
import { findAll, updateOne, insertOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import { getSessionUser } from "../lib/auth";
import type { Settings } from "../lib/types";

const router = Router();

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
    // Strictly omit upload presets, API secrets, and private configs
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

// PATCH /api/settings — Protected
router.patch("/", authGuard, async (req: Request, res: Response) => {
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
