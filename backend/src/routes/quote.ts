import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne } from "../lib/db";
import { validateEmail, validatePhone, validateRequired } from "../lib/validate";
import { authGuard } from "../middleware/authGuard";
import { quoteLimiter } from "../middleware/rateLimiter";
import type { QuoteRequest, ApiResponse } from "../lib/types";

const router = Router();

// POST /api/quote — submit quote request (Public, Rate-Limited)
router.post("/", quoteLimiter, async (req: Request, res: Response) => {
  try {
    let { name, email, phone, projectType, budget, location, description, timeline } = req.body;

    // Support phone-only lead capture (e.g. from cost estimator phone modal)
    const isPhoneOnlyLead = (!email || (typeof email === "string" && email.trim().toLowerCase() === "not provided")) && phone;
    if (isPhoneOnlyLead && validatePhone(phone)) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      email = `lead-${cleanPhone || "phone"}@hindustanprojects.in`;
    }

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

// GET /api/quote — list quotes (Protected)
router.get("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { status, search, page, limit } = req.query;
    let quotes = await findAll<QuoteRequest>("quotes");

    // Filter by status if specified
    if (status && status !== "all") {
      quotes = quotes.filter((q) => q.status === status);
    }

    // Filter by search query if specified
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      quotes = quotes.filter((item) =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        (item.projectType && item.projectType.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q))
      );
    }

    quotes.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );

    // If pagination requested
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);
      const total = quotes.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = quotes.slice(startIndex, startIndex + limitNum);

      return res.json({
        success: true,
        data: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    return res.json({ success: true, data: quotes } as ApiResponse<QuoteRequest[]>);
  } catch (err) {
    console.error("[/api/quote GET]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// PATCH /api/quote — update quote status (Protected)
router.patch("/", authGuard, async (req: Request, res: Response) => {
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
  } catch (err) {
    console.error("[/api/quote PATCH]", err);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/quote/:id — delete quote (Protected)
router.delete("/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "id parameter required" } as ApiResponse);
    }
    const { deleteOne } = await import("../lib/db");
    const ok = await deleteOne("quotes", id as string);
    if (!ok) {
      return res.status(404).json({ success: false, error: "Quote not found" } as ApiResponse);
    }
    return res.json({ success: true, message: "Quote deleted successfully" } as ApiResponse);
  } catch (error) {
    console.error("[/api/quote DELETE /:id]", error);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

// DELETE /api/quote — delete quote by body { id } (Protected)
router.delete("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: "Record ID required" } as ApiResponse);
    }
    const { deleteOne } = await import("../lib/db");
    const ok = await deleteOne("quotes", id as string);
    if (!ok) {
      return res.status(404).json({ success: false, error: "Quote not found" } as ApiResponse);
    }
    return res.json({ success: true, message: "Quote deleted successfully" } as ApiResponse);
  } catch (error) {
    console.error("[/api/quote DELETE]", error);
    return res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse);
  }
});

export default router;

