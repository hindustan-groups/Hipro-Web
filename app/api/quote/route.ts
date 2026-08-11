import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll, updateOne } from "@/lib/db";
import { validateEmail, validatePhone, validateRequired } from "@/lib/validate";
import type { QuoteRequest, ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// POST /api/quote — submit quote request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, projectType, budget, location, description, timeline } = body;

    const missing = validateRequired({ name, email, phone, projectType, budget, description });
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

    if (!validatePhone(phone)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "Invalid phone number",
      }, { status: 400 });
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

    return NextResponse.json<ApiResponse<QuoteRequest>>({
      success: true,
      message: "Quote request submitted! Our team will contact you within 48 hours.",
      data: doc,
    }, { status: 201 });

  } catch (err) {
    console.error("[/api/quote POST]", err);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// GET /api/quote — get all quote requests
export async function GET() {
  try {
    const quotes = await findAll<QuoteRequest>("quotes");
    quotes.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
    return NextResponse.json<ApiResponse<QuoteRequest[]>>({
      success: true,
      data: quotes,
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// PATCH /api/quote — update quote status
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json<ApiResponse>({ success: false, error: "id and status required" }, { status: 400 });
    }
    const updated = await updateOne<QuoteRequest>("quotes", id, { status });
    if (!updated) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Quote not found" }, { status: 404 });
    }
    return NextResponse.json<ApiResponse<QuoteRequest>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
