import { NextRequest, NextResponse } from "next/server";
import { insertOne, findAll, readDB, writeDB } from "@/lib/db";
import { validateEmail } from "@/lib/validate";
import type { NewsletterSubscriber, ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// POST /api/newsletter — subscribe
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Email is required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    // Check duplicate
    const existing = await readDB<NewsletterSubscriber>("newsletter");
    const dupe = existing.find((s) => s.email === normalised && s.active !== false);
    if (dupe) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "This email is already subscribed",
      }, { status: 409 });
    }

    const doc = await insertOne<NewsletterSubscriber>("newsletter", {
      email: normalised,
      active: true,
    });

    return NextResponse.json<ApiResponse<NewsletterSubscriber>>({
      success: true,
      message: "Successfully subscribed to our newsletter!",
      data: doc,
    }, { status: 201 });

  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/newsletter — get all subscribers (admin)
export async function GET() {
  try {
    const subscribers = await findAll<NewsletterSubscriber>("newsletter");
    const active = subscribers.filter((s) => s.active !== false);
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { subscribers: active, total: active.length },
    });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/newsletter — unsubscribe
export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json<ApiResponse>({ success: false, error: "Email required" }, { status: 400 });

    const all = await readDB<NewsletterSubscriber>("newsletter");
    const idx = all.findIndex((s) => s.email === email.trim().toLowerCase());
    if (idx === -1) return NextResponse.json<ApiResponse>({ success: false, error: "Email not found" }, { status: 404 });

    all[idx].active = false;
    await writeDB("newsletter", all);

    return NextResponse.json<ApiResponse>({ success: true, message: "Unsubscribed successfully" });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
