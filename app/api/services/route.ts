import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll, updateOne, deleteOne } from "@/lib/db";
import type { Service, ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/services
export async function GET() {
  try {
    const services = await findAll<Service>("services");
    const active = services
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return NextResponse.json<ApiResponse<Service[]>>({ success: true, data: active });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/services
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, icon, features, image, order } = body;

    if (!title || !description) {
      return NextResponse.json<ApiResponse>({ success: false, error: "title and description required" }, { status: 400 });
    }

    const doc = await insertOne<Service>("services", {
      title: title.trim(),
      description: description.trim(),
      icon: icon?.trim() || "Wrench",
      features: JSON.stringify(features || []),
      image: image?.trim() || "",
      order: order ?? 99,
      active: true,
    });

    return NextResponse.json<ApiResponse<Service>>({ success: true, data: doc }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/services
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    if (updates.features && Array.isArray(updates.features)) {
      updates.features = JSON.stringify(updates.features);
    }
    const updated = await updateOne<Service>("services", id, updates);
    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: "Service not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<Service>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/services
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const deleted = await deleteOne("services", id);
    if (!deleted) return NextResponse.json<ApiResponse>({ success: false, error: "Service not found" }, { status: 404 });

    return NextResponse.json<ApiResponse>({ success: true, message: "Service deleted" });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
