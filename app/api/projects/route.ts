import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll, updateOne, deleteOne } from "@/lib/db";
import { validateRequired } from "@/lib/validate";
import type { Project, ApiResponse } from "@/lib/types";

// GET /api/projects — get all projects
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    let projects = await findAll<Project>("projects");

    if (category && category !== "All") {
      projects = projects.filter((p) =>
        p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (featured === "true") {
      projects = projects.filter((p) => p.featured === true);
    }

    projects = projects.filter((p) => p.status !== "archived");
    projects.sort((a, b) => new Date(b.date).getFullYear() - new Date(a.date).getFullYear());

    return NextResponse.json<ApiResponse<Project[]>>({
      success: true,
      data: projects,
    });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects — create project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, location, date, image, description } = body;

    const missing = validateRequired({ title, category, location, date, description });
    if (missing.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      }, { status: 400 });
    }

    const doc = await insertOne<Project>("projects", {
      title: title.trim(),
      category: category.trim(),
      location: location.trim(),
      date: date.trim(),
      image: image?.trim() || "",
      description: description.trim(),
      featured: body.featured ?? false,
      status: "active",
    });

    return NextResponse.json<ApiResponse<Project>>({
      success: true,
      message: "Project created successfully",
      data: doc,
    }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/projects — update project
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id is required" }, { status: 400 });

    const updated = await updateOne<Project>("projects", id, updates);
    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: "Project not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<Project>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/projects — delete project
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id is required" }, { status: 400 });

    const deleted = await deleteOne("projects", id);
    if (!deleted) return NextResponse.json<ApiResponse>({ success: false, error: "Project not found" }, { status: 404 });

    return NextResponse.json<ApiResponse>({ success: true, message: "Project deleted" });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
