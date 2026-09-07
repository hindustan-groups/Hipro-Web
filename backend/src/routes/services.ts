import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne, deleteOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { Service, ApiResponse } from "../lib/types";

const router = Router();

// GET /api/services — Public
router.get("/", async (req: Request, res: Response) => {
    try {
        const services = await findAll<Service>("services");
        const active = services
            .filter((s) => s.active !== false)
            .sort((a, b) => (a.order ?? 1) - (b.order ?? 1));

        return res.json({ success: true, data: active } as ApiResponse<Service[]>);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
});

// POST /api/services — Protected
router.post("/", authGuard, async (req: Request, res: Response) => {
    try {
        const { title, description, category, icon, features, image, order } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, error: "title and description required" } as ApiResponse);
        }

        const doc = await insertOne<Service>("services", {
            title: title.trim(),
            description: description.trim(),
            category: category?.trim() || "Design & Planning",
            icon: icon?.trim() || "Wrench",
            features: JSON.stringify(features || []),
            image: image?.trim() || "",
            order: Number(order) || 1,
            active: true,
        });

        return res.status(201).json({ success: true, data: doc } as ApiResponse<Service>);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
});

// PATCH /api/services & /api/services/:id — Protected
const handlePatch = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id || req.body.id) as string;
        if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

        const updates = { ...req.body };
        delete updates.id;

        if (updates.features && Array.isArray(updates.features)) {
            updates.features = JSON.stringify(updates.features);
        }
        const updated = await updateOne<Service>("services", id, updates);
        if (!updated) return res.status(404).json({ success: false, error: "Service not found" } as ApiResponse);

        return res.json({ success: true, data: updated } as ApiResponse<Service>);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
};

router.patch("/", authGuard, handlePatch);
router.patch("/:id", authGuard, handlePatch);

// DELETE /api/services & /api/services/:id — Protected
const handleDelete = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id || req.body.id) as string;
        if (!id) return res.status(400).json({ success: false, error: "id required" } as ApiResponse);

        const deleted = await deleteOne("services", id);
        if (!deleted) return res.status(404).json({ success: false, error: "Service not found" } as ApiResponse);

        return res.json({ success: true, message: "Service deleted" } as ApiResponse);
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
    }
};

router.delete("/", authGuard, handleDelete);
router.delete("/:id", authGuard, handleDelete);

export default router;
