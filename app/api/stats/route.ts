import { NextRequest, NextResponse } from "next/server";
import { findAll, readDB, writeDB, updateOne } from "@/lib/db";
import type { Stats, ApiResponse } from "@/lib/types";

const DEFAULT_STATS: Stats[] = [
  { id: "1", label: "Years Experience",  value: "25+",   icon: "Trophy",       order: 1, updatedAt: new Date().toISOString() },
  { id: "2", label: "Projects Done",     value: "500+",  icon: "CheckCircle",  order: 2, updatedAt: new Date().toISOString() },
  { id: "3", label: "Team Members",      value: "200+",  icon: "Users",        order: 3, updatedAt: new Date().toISOString() },
  { id: "4", label: "Satisfaction Rate", value: "98%",   icon: "Star",         order: 4, updatedAt: new Date().toISOString() },
  { id: "5", label: "Awards Won",        value: "150+",  icon: "Award",        order: 5, updatedAt: new Date().toISOString() },
  { id: "6", label: "Happy Clients",     value: "1000+", icon: "Heart",        order: 6, updatedAt: new Date().toISOString() },
];

// GET /api/stats
export async function GET() {
  try {
    let stats = readDB<Stats>("stats");

    // Seed default stats if empty
    if (stats.length === 0) {
      const { writeDB } = await import("@/lib/db");
      writeDB("stats", DEFAULT_STATS);
      stats = DEFAULT_STATS;
    }

    stats.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return NextResponse.json<ApiResponse<Stats[]>>({ success: true, data: stats });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/stats — update a stat
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const updated = updateOne<Stats>("stats", id, updates);
    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: "Stat not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<Stats>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
