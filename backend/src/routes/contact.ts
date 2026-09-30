import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne } from "../lib/db";
import { validateEmail, validateRequired } from "../lib/validate";
import { authGuard } from "../middleware/authGuard";
import { contactLimiter } from "../middleware/rateLimiter";
import type { ContactMessage, ApiResponse } from "../lib/types";

const router = Router();

// POST /api/contact — submit contact form (Public, Rate-Limited)
router.post("/", contactLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, phone, service, message } = req.body;

    const missing = validateRequired({ name, email, message });
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      } as ApiResponse);
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address",
      } as ApiResponse);
    }

    const doc = await insertOne<ContactMessage>("contacts", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      service: service?.trim() || "",
      message: message.trim(),
      status: "new",
    });

    return res.status(201).json({
      success: true,
      message: "Message received! We'll get back to you within 24 hours.",
      data: doc,
    } as ApiResponse<ContactMessage>);

  } catch (err) {
    console.error("[/api/contact POST]", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
});

// GET /api/contact — get all messages (Protected)
router.get("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { status, search, page, limit } = req.query;
    let messages = await findAll<ContactMessage>("contacts");

    // Filter by status if provided
    if (status && status !== "all") {
      messages = messages.filter((m) => m.status === status);
    }

    // Filter by search query if provided
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      messages = messages.filter((m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        (m.service && m.service.toLowerCase().includes(q)) ||
        (m.message && m.message.toLowerCase().includes(q)) ||
        (m.id && m.id.toLowerCase().includes(q))
      );
    }

    messages.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );

    // If pagination requested
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);
      const total = messages.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = messages.slice(startIndex, startIndex + limitNum);

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

    return res.json({
      success: true,
      data: messages,
    } as ApiResponse<ContactMessage[]>);
  } catch (err) {
    console.error("[/api/contact GET]", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
});

// PATCH /api/contact — update message status (Protected)
router.patch("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: "id and status are required",
      } as ApiResponse);
    }

    const updated = await updateOne<ContactMessage>("contacts", id, { status });
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      } as ApiResponse);
    }

    return res.json({
      success: true,
      data: updated,
    } as ApiResponse<ContactMessage>);
  } catch (err) {
    console.error("[/api/contact PATCH]", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
});

// DELETE /api/contact/:id — delete message (Protected)
router.delete("/:id", authGuard, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Record ID is required",
      } as ApiResponse);
    }

    const { deleteOne } = await import("../lib/db");
    const ok = await deleteOne("contacts", id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: "Message not found or already deleted",
      } as ApiResponse);
    }

    return res.json({
      success: true,
      message: "Message deleted successfully",
    } as ApiResponse);
  } catch (err) {
    console.error("[/api/contact DELETE /:id]", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
});

// DELETE /api/contact — delete message by body { id } (Protected)
router.delete("/", authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Record ID is required",
      } as ApiResponse);
    }

    const { deleteOne } = await import("../lib/db");
    const ok = await deleteOne("contacts", id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: "Message not found or already deleted",
      } as ApiResponse);
    }

    return res.json({
      success: true,
      message: "Message deleted successfully",
    } as ApiResponse);
  } catch (err) {
    console.error("[/api/contact DELETE]", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
});

export default router;

