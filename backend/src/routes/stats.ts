import { Router, Request, Response } from "express";
import { findAll, insertOne, updateOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { Stats, ApiResponse } from "../lib/types";

const router = Router();

const DEFAULT_STATS = [
  { label: "Years Experience",  value: "25+",   icon: "Trophy",       order: 1 },
  { label: "Projects Done",     value: "500+",  icon: "CheckCircle",  order: 2 },
  { label: "Team Members",      value: "200+",  icon: "Users",        order: 3 },
  { label: "Satisfaction Rate", value: "98%",   icon: "Star",         order: 4 },
  { label: "Awards Won",        value: "150+",  icon: "Award",        order: 5 },
  { label: "Happy Clients",     value: "1000+", icon: "Heart",        order: 6 },
];

// GET /api/stats — Public
router.get("/", async (req: Request, res: Response) => {
  try {
    let stats = await findAll<Stats>("stats");

    // Seed default stats if empty
    if (stats.length === 0) {
      for (const stat of DEFAULT_STATS) {
        await insertOne<Stats>("stats", stat);
      }
      stats = await findAll<Stats>("stats");
    }

    stats.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return res.json({ success: true, data: stats } as ApiResponse<Stats[]>);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/stats — Protected
router.patch("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

    const updated = await updateOne<Stats>("stats", id, updates);
    if (!updated) return res.status(404).json({ success: false, error: "Stat not found" } as ApiResponse);

    return res.json({ success: true, data: updated } as ApiResponse<Stats>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
