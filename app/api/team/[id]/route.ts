import { NextRequest, NextResponse } from "next/server";
import { updateOne, deleteOne } from "@/lib/db";
import type { TeamMember, ApiResponse } from "@/lib/types";

// PATCH /api/team/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const updates = await req.json();

    const updated = await updateOne<TeamMember>("team", id, updates);
    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: "Team member not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<TeamMember>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/team/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const deleted = await deleteOne("team", id);
    if (!deleted) return NextResponse.json<ApiResponse>({ success: false, error: "Team member not found" }, { status: 404 });

    return NextResponse.json<ApiResponse>({ success: true, message: "Team member deleted" });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
