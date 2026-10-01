import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne, deleteOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { TeamMember, ApiResponse } from "../lib/types";

const router = Router();

// GET /api/team — Public / Admin
router.get("/", async (req: Request, res: Response) => {
    try {
        const team = await findAll<TeamMember>("team");
        const includeAll = req.query.all === "true";
        const members = includeAll
            ? team.sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
            : team
                .filter((m) => m.active !== false)
                .sort((a, b) => (a.order ?? 1) - (b.order ?? 1));

        return res.json({ success: true, data: members } as ApiResponse<TeamMember[]>);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
});

// POST /api/team — Protected
router.post("/", authGuard, async (req: Request, res: Response) => {
    try {
        const { name, role, img, bio, isFounder, instagram, linkedin, facebook, order, active } = req.body;

        if (!name || !role) {
            return res.status(400).json({ success: false, error: "name and role required" } as ApiResponse);
        }

        const doc = await insertOne<TeamMember>("team", {
            name: name.trim(),
            role: role.trim(),
            img: (img || "").trim(),
            bio: bio?.trim() || "",
            isFounder: Boolean(isFounder),
            instagram: instagram?.trim() || "",
            linkedin: linkedin?.trim() || "",
            facebook: facebook?.trim() || "",
            order: Number(order) || 1,
            active: active !== false,
        });

        return res.status(201).json({ success: true, data: doc } as ApiResponse<TeamMember>);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
});

// PATCH /api/team/:id & /api/team — Protected
const handlePatch = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id || req.body.id) as string;
        if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

        const updates = { ...req.body };
        delete updates.id;

        // Type normalization for Prisma
        if (updates.order !== undefined) {
            updates.order = Number(updates.order) || 1;
        }
        if (updates.active !== undefined) {
            updates.active = Boolean(updates.active);
        }
        if (updates.isFounder !== undefined) {
            updates.isFounder = Boolean(updates.isFounder);
        }
        if (typeof updates.name === "string") updates.name = updates.name.trim();
        if (typeof updates.role === "string") updates.role = updates.role.trim();
        if (typeof updates.img === "string") updates.img = updates.img.trim();
        if (typeof updates.bio === "string") updates.bio = updates.bio.trim();
        if (typeof updates.linkedin === "string") updates.linkedin = updates.linkedin.trim();
        if (typeof updates.instagram === "string") updates.instagram = updates.instagram.trim();
        if (typeof updates.facebook === "string") updates.facebook = updates.facebook.trim();

        const updated = await updateOne<TeamMember>("team", id, updates);
        if (!updated) return res.status(404).json({ success: false, error: "Team member not found" } as ApiResponse);

        return res.json({ success: true, data: updated } as ApiResponse<TeamMember>);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
};

router.patch("/:id", authGuard, handlePatch);
router.patch("/", authGuard, handlePatch);

// DELETE /api/team/:id & /api/team — Protected
const handleDelete = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id || req.body.id) as string;
        if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

        const deleted = await deleteOne("team", id);
        if (!deleted) return res.status(404).json({ success: false, error: "Team member not found" } as ApiResponse);

        return res.json({ success: true, message: "Team member deleted" } as ApiResponse);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
};

router.delete("/:id", authGuard, handleDelete);
router.delete("/", authGuard, handleDelete);

export default router;
