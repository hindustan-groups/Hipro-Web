import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne } from "../lib/db";
import { validateEmail, validatePhone, validateRequired } from "../lib/validate";
import type { QuoteRequest, ApiResponse } from "../lib/types";

const router = Router();

// POST /api/quote
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, projectType, budget, location, description, timeline } = req.body;

    const missing = validateRequired({ name, email, phone, projectType, budget, description });
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      } as ApiResponse);
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: "Invalid email address" } as ApiResponse);
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ success: false, error: "Invalid phone number" } as ApiResponse);
    }

    const doc = await insertOne<QuoteRequest>("quotes", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      projectType: projectType.trim(),
      budget: budget.trim(),
      location: location?.trim() || "",
      description: description.trim(),
      timeline: timeline?.trim() || "",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Quote request submitted! Our team will contact you within 48 hours.",
      data: doc,
    } as ApiResponse<QuoteRequest>);
  } catch (err) {
    console.error("[/api/quote POST]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// GET /api/quote
router.get("/", async (req: Request, res: Response) => {
  try {
    const quotes = await findAll<QuoteRequest>("quotes");
    quotes.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
    return res.json({ success: true, data: quotes } as ApiResponse<QuoteRequest[]>);
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/quote
router.patch("/", async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, error: "id and status required" } as ApiResponse);
    }
    const updated = await updateOne<QuoteRequest>("quotes", id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, error: "Quote not found" } as ApiResponse);
    }
    return res.json({ success: true, data: updated } as ApiResponse<QuoteRequest>);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;
