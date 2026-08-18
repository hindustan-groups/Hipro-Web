import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne, deleteOne } from "../lib/db";
import type { TeamMember, ApiResponse } from "../lib/types";

const router = Router();

// GET /api/team
router.get("/", async (req: Request, res: Response) => {
    try {
        const team = await findAll<TeamMember>("team");
        const active = team
            .filter((m) => m.active !== false)
            .sort((a, b) => (a.order ?? 1) - (b.order ?? 1));

        return res.json({ success: true, data: active } as ApiResponse<TeamMember[]>);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
});

// POST /api/team
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, role, img, bio, isFounder, instagram, linkedin, facebook, order, active } = req.body;

        if (!name || !role || !img) {
            return res.status(400).json({ success: false, error: "name, role, and img required" } as ApiResponse);
        }

        const doc = await insertOne<TeamMember>("team", {
            name: name.trim(),
            role: role.trim(),
            img: img.trim(),
            bio: bio?.trim() || "",
            isFounder: isFounder ?? false,
            instagram: instagram?.trim() || "",
            linkedin: linkedin?.trim() || "",
            facebook: facebook?.trim() || "",
            order: Number(order) || 1,
            active: active ?? true,
        });

        return res.status(201).json({ success: true, data: doc } as ApiResponse<TeamMember>);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
});

// PATCH /api/team/:id
router.patch("/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

        const updates = req.body;

        const updated = await updateOne<TeamMember>("team", id, updates);
        if (!updated) return res.status(404).json({ success: false, error: "Team member not found" } as ApiResponse);

        return res.json({ success: true, data: updated } as ApiResponse<TeamMember>);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
});

// DELETE /api/team/:id
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

        const deleted = await deleteOne("team", id);
        if (!deleted) return res.status(404).json({ success: false, error: "Team member not found" } as ApiResponse);

        return res.json({ success: true, message: "Team member deleted" } as ApiResponse);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
});

export default router;
