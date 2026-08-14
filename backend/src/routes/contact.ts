import { Router, Request, Response } from "express";
import { insertOne, findAll, updateOne } from "../lib/db";
import { validateEmail, validateRequired } from "../lib/validate";
import { authGuard } from "../middleware/authGuard";
import type { ContactMessage, ApiResponse } from "../lib/types";

const router = Router();

// POST /api/contact — submit contact form (Public)
router.post("/", async (req: Request, res: Response) => {
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
    const messages = await findAll<ContactMessage>("contacts");
    messages.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
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

export default router;
