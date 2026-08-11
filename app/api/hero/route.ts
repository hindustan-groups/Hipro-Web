import { NextRequest, NextResponse } from "next/server";
import { findAll, insertOne, updateOne, deleteOne } from "@/lib/db";
import { validateRequired } from "@/lib/validate";
import type { HeroSlide, ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/hero
export async function GET() {
  try {
    const slides = await findAll<HeroSlide>("hero");
    // Sort by order
    slides.sort((a, b) => (a.order || 0) - (b.order || 0));
    return NextResponse.json<ApiResponse<HeroSlide[]>>({
      success: true,
      data: slides,
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// POST /api/hero
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, tagline, title, subtitle, order, active } = body;

    const missing = validateRequired({ image, tagline, title, subtitle });
    if (missing.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      }, { status: 400 });
    }

    const doc = await insertOne<HeroSlide>("hero", {
      image, tagline, title, subtitle,
      order: order || 0,
      active: active !== false,
    });

    return NextResponse.json<ApiResponse<HeroSlide>>({
      success: true,
      data: doc,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// PATCH /api/hero
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "id is required",
      }, { status: 400 });
    }

    const updated = await updateOne<HeroSlide>("hero", id, updates);
    if (!updated) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "Slide not found",
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<HeroSlide>>({
      success: true,
      data: updated,
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// DELETE /api/hero
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json<ApiResponse>({ success: false, error: "id is required" }, { status: 400 });
    }

    const deleted = await deleteOne("hero", id);
    if (!deleted) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (err) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
