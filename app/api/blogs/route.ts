import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll, updateOne, deleteOne } from "@/lib/db";
import type { BlogPost, ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/blogs
export async function GET() {
  try {
    const blogs = await findAll<BlogPost>("blogs");
    const active = blogs
      .filter((b) => b.active !== false)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json<ApiResponse<BlogPost[]>>({ success: true, data: active });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/blogs
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, excerpt, content, image, date, author, category, slug, metaTitle, metaDescription, keywords } = body;

    if (!title || !content || !category) {
      return NextResponse.json<ApiResponse>({ success: false, error: "title, content, and category required" }, { status: 400 });
    }

    const doc = await insertOne<BlogPost>("blogs", {
      title: title.trim(),
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      image: image?.trim() || "",
      date: date?.trim() || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      author: author?.trim() || "Admin",
      category: category.trim(),
      active: true,
      slug: slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      keywords: keywords || null,
    });

    return NextResponse.json<ApiResponse<BlogPost>>({ success: true, data: doc }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/blogs
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    if (updates.slug) {
      updates.slug = updates.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }
    
    const updated = await updateOne<BlogPost>("blogs", id, updates);
    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: "Blog post not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<BlogPost>>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/blogs
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "id required" }, { status: 400 });

    const deleted = await deleteOne("blogs", id);
    if (!deleted) return NextResponse.json<ApiResponse>({ success: false, error: "Blog post not found" }, { status: 404 });

    return NextResponse.json<ApiResponse>({ success: true, message: "Blog post deleted" });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
