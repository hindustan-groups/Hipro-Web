import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll, updateOne, deleteOne } from "@/lib/db";
import type { JobPosting, ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await findAll<JobPosting>("jobs");
    const sorted = items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return NextResponse.json<ApiResponse<JobPosting[]>>({ success: true, data: sorted });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, type, location, description, order } = body;

    if (!title || !type || !location) {
      return NextResponse.json<ApiResponse>({ success: false, error: "title, type and location required" }, { status: 400 });
    }

    const doc = await insertOne<JobPosting>("jobs", {
      title: title.trim(),
      type: type.trim(),
      location: location.trim(),
      description: description?.trim() || "",
      order: order ?? 99,
      active: true,
    });

    return NextResponse.json<ApiResponse<JobPosting>>({ success: true, data: doc }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const updated = await updateOne<JobPosting>("jobs", id, updates);
    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: "Job not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<JobPosting>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const deleted = await deleteOne("jobs", id);
    if (!deleted) return NextResponse.json<ApiResponse>({ success: false, error: "Job not found" }, { status: 404 });

    return NextResponse.json<ApiResponse>({ success: true, message: "Job deleted" });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
