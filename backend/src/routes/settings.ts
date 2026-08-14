import { Router, Request, Response } from "express";
import { findAll, updateOne, insertOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { Settings } from "../lib/types";

const router = Router();

// GET /api/settings — Public
router.get("/", async (req: Request, res: Response) => {
  try {
    const data = await findAll<Settings>("settings");
    if (data.length === 0) {
      const defaultSettings = await insertOne<Settings>("settings", {
        id: "global",
        cloudinaryCloudName: "",
        cloudinaryUploadPreset: "",
      });
      return res.json({ success: true, data: defaultSettings });
    }
    return res.json({ success: true, data: data[0] });
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
