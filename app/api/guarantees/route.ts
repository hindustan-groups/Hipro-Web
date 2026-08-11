import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll, updateOne, deleteOne } from "@/lib/db";
import type { Guarantee, ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/guarantees
export async function GET() {
  try {
    const items = await findAll<Guarantee>("guarantees");
    const active = items
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return NextResponse.json<ApiResponse<Guarantee[]>>({ success: true, data: active });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/guarantees
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, badge, bg, accent, image, hasShield, order } = body;

    if (!title || !description || !badge) {
      return NextResponse.json<ApiResponse>({ success: false, error: "title, description and badge required" }, { status: 400 });
    }

    const doc = await insertOne<Guarantee>("guarantees", {
      title: title.trim(),
      description: description.trim(),
      badge: badge.trim(),
      bg: bg?.trim() || "bg-black",
      accent: accent?.trim() || "text-white",
      hasShield: !!hasShield,
      image: image?.trim() || "",
      order: order ?? 99,
      active: true,
    });

    return NextResponse.json<ApiResponse<Guarantee>>({ success: true, data: doc }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/guarantees
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const updated = await updateOne<Guarantee>("guarantees", id, updates);
    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: "Guarantee not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<Guarantee>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/guarantees
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const deleted = await deleteOne("guarantees", id);
    if (!deleted) return NextResponse.json<ApiResponse>({ success: false, error: "Guarantee not found" }, { status: 404 });

    return NextResponse.json<ApiResponse>({ success: true, message: "Guarantee deleted" });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
