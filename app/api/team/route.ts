import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll } from "@/lib/db";
import type { TeamMember, ApiResponse } from "@/lib/types";

// GET /api/team
export async function GET() {
  try {
    const team = await findAll<TeamMember>("team");
    const active = team
      .filter((m) => m.active !== false)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return NextResponse.json<ApiResponse<TeamMember[]>>({ success: true, data: active });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/team
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, img, bio, order, active } = body;

    if (!name || !role || !img) {
      return NextResponse.json<ApiResponse>({ success: false, error: "name, role, and img required" }, { status: 400 });
    }

    const doc = await insertOne<TeamMember>("team", {
      name: name.trim(),
      role: role.trim(),
      img: img.trim(),
      bio: bio?.trim() || "",
      order: order ?? 99,
      active: active ?? true,
    });

    return NextResponse.json<ApiResponse<TeamMember>>({ success: true, data: doc }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
