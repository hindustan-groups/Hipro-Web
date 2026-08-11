import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll, updateOne } from "@/lib/db";
import { validateEmail, validateRequired } from "@/lib/validate";
import type { ContactMessage, ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// POST /api/contact — submit contact form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, service, message } = body;

    // Validation
    const missing = validateRequired({ name, email, message });
    if (missing.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "Invalid email address",
      }, { status: 400 });
    }

    const doc = await insertOne<ContactMessage>("contacts", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      service: service?.trim() || "",
      message: message.trim(),
      status: "new",
    });

    return NextResponse.json<ApiResponse<ContactMessage>>({
      success: true,
      message: "Message received! We'll get back to you within 24 hours.",
      data: doc,
    }, { status: 201 });

  } catch (err) {
    console.error("[/api/contact POST]", err);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// GET /api/contact — get all messages (admin)
export async function GET() {
  try {
    const messages = await findAll<ContactMessage>("contacts");
    // Sort newest first
    messages.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
    return NextResponse.json<ApiResponse<ContactMessage[]>>({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.error("[/api/contact GET]", err);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// PATCH /api/contact — update message status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "id and status are required",
      }, { status: 400 });
    }

    const updated = await updateOne<ContactMessage>("contacts", id, { status });
    if (!updated) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "Message not found",
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<ContactMessage>>({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("[/api/contact PATCH]", err);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}
