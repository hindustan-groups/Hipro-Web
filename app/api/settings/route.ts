import { NextResponse } from "next/server";
import { findAll, updateOne, insertOne } from "@/lib/db";
import type { Settings } from "@/lib/types";

export async function GET() {
  try {
    const data = await findAll<Settings>("settings");
    if (data.length === 0) {
      const defaultSettings = await insertOne<Settings>("settings", {
        id: "global",
        cloudinaryCloudName: "",
        cloudinaryUploadPreset: "",
      });
      return NextResponse.json({ success: true, data: defaultSettings });
    }
    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const data = await findAll<Settings>("settings");
    
    let updated;
    if (data.length === 0) {
      updated = await insertOne<Settings>("settings", {
        id: "global",
        ...body,
      });
    } else {
      updated = await updateOne<Settings>("settings", data[0].id!, body);
    }
    
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
