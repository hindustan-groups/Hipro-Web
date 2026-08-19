import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { tag } = await request.json();
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ success: true, revalidated: true, tag });
    }
    return NextResponse.json({ success: false, message: "No tag provided" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error revalidating" }, { status: 500 });
  }
}
