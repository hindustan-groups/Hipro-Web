import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import type { JobApplication, ApiResponse } from "../lib/types";

const router = Router();

// POST /api/applications — Submit Job Application (Public)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, experience, cvUrl } = req.body;

    if (!name || !email || !phone || !role || !experience || !cvUrl) {
      return res.status(400).json({ 
        success: false, 
        error: "All fields are required (name, email, phone, role, experience, cvUrl)" 
      } as ApiResponse);
    }

    const doc = await insertOne<JobApplication>("applications", {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role.trim(),
      experience: experience.trim(),
      cvUrl: cvUrl.trim(),
      status: "new",
    });

    return res.status(201).json({ 
      success: true, 
      data: doc 
    } as ApiResponse<JobApplication>);
  } catch (error) {
    console.error("Job Application Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    } as ApiResponse);
  }
});

// GET /api/applications — List Applications (Protected)
router.get("/", authGuard, async (req: Request, res: Response) => {
  try {
    const items = await findAll<JobApplication>("applications");
    items.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
    return res.json({ success: true, data: items } as ApiResponse<JobApplication[]>);
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/applications — Update Application Status (Protected)
router.patch("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, error: "id and status required" } as ApiResponse);
    }
    const updated = await updateOne<JobApplication>("applications", id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, error: "Application not found" } as ApiResponse);
    }
    return res.json({ success: true, data: updated } as ApiResponse<JobApplication>);
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
