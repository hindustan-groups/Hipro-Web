import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Security check: require either active admin session or matching secret
    const user = await getSessionUser();
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const secretHeader = request.headers.get("x-revalidate-secret");
    const secretBody = body?.secret;
    const providedSecret = secretHeader || secretBody;
    const expectedSecret = process.env.REVALIDATE_SECRET;

    const isAuthorized =
      (user && (user.role === "admin" || user.role === "manager")) ||
      (expectedSecret && providedSecret === expectedSecret) ||
      (!expectedSecret && user); // In dev/default, requires logged-in user

    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { tag, tags, path, paths } = body;
    const tagsToRevalidate = tags ? (Array.isArray(tags) ? tags : [tags]) : tag ? [tag] : [];
    const pathsToRevalidate = paths ? (Array.isArray(paths) ? paths : [paths]) : path ? [path] : [];

    tagsToRevalidate.forEach((t: string) => {
      if (t && typeof t === "string") {
        revalidateTag(t);
      }
    });

    pathsToRevalidate.forEach((p: string) => {
      if (p && typeof p === "string") {
        revalidatePath(p);
      }
    });

    if (tagsToRevalidate.length === 0 && pathsToRevalidate.length === 0) {
      return NextResponse.json({ success: false, message: "No tag or path provided" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      tags: tagsToRevalidate,
      paths: pathsToRevalidate,
    });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json({ success: false, message: "Error revalidating" }, { status: 500 });
  }
}

