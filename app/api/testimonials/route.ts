import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll, updateOne, deleteOne } from "@/lib/db";
import { validateEmail, validateRequired } from "@/lib/validate";
import type { Testimonial, ApiResponse } from "@/lib/types";

// GET /api/testimonials — get approved testimonials
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    let testimonials = await findAll<Testimonial>("testimonials");

    if (!all) {
      testimonials = testimonials.filter((t) => t.approved === true);
    }

    testimonials.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );

    return NextResponse.json<ApiResponse<Testimonial[]>>({ success: true, data: testimonials });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/testimonials — submit testimonial
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, text, rating, image } = body;

    const missing = validateRequired({ name, role, text });
    if (missing.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const doc = await insertOne<Testimonial>("testimonials", {
      name: name.trim(),
      role: role.trim(),
      text: text.trim(),
      rating: Number(rating),
      image: image?.trim() || "",
      approved: body.approved ?? false,
    });

    return NextResponse.json<ApiResponse<Testimonial>>({
      success: true,
      message: "Thank you for your review! It will appear after approval.",
      data: doc,
    }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/testimonials — approve/update
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const updated = await updateOne<Testimonial>("testimonials", id, updates);
    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: "Testimonial not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<Testimonial>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/testimonials
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const deleted = await deleteOne("testimonials", id);
    if (!deleted) return NextResponse.json<ApiResponse>({ success: false, error: "Testimonial not found" }, { status: 404 });

    return NextResponse.json<ApiResponse>({ success: true, message: "Testimonial deleted" });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
