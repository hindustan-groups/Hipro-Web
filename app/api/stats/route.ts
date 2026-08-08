import { NextRequest, NextResponse } from "next/server";
import { findAll, insertOne, updateOne } from "@/lib/db";
import type { Stats, ApiResponse } from "@/lib/types";

const DEFAULT_STATS = [
  { label: "Years Experience",  value: "25+",   icon: "Trophy",       order: 1 },
  { label: "Projects Done",     value: "500+",  icon: "CheckCircle",  order: 2 },
  { label: "Team Members",      value: "200+",  icon: "Users",        order: 3 },
  { label: "Satisfaction Rate", value: "98%",   icon: "Star",         order: 4 },
  { label: "Awards Won",        value: "150+",  icon: "Award",        order: 5 },
  { label: "Happy Clients",     value: "1000+", icon: "Heart",        order: 6 },
];

// GET /api/stats
export async function GET() {
  try {
    let stats = await findAll<Stats>("stats");

    // Seed default stats if empty
    if (stats.length === 0) {
      for (const stat of DEFAULT_STATS) {
        await insertOne<Stats>("stats", stat);
      }
      stats = await findAll<Stats>("stats");
    }

    stats.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return NextResponse.json<ApiResponse<Stats[]>>({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/stats — update a stat
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const updated = await updateOne<Stats>("stats", id, updates);
    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: "Stat not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<Stats>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
