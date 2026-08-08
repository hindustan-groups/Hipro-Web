import { NextRequest, NextResponse } from "next/server";
import { insertOne } from "@/lib/db";
import type { JobApplication, ApiResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role, experience, cvUrl } = body;

    if (!name || !email || !phone || !role || !experience || !cvUrl) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: "All fields are required (name, email, phone, role, experience, cvUrl)" 
      }, { status: 400 });
    }

    const doc = await insertOne<JobApplication>("applications", {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role.trim(),
      experience: experience.trim(),
      cvUrl: cvUrl.trim(),
      status: "new",
    });

    return NextResponse.json<ApiResponse<JobApplication>>({ 
      success: true, 
      data: doc 
    }, { status: 201 });
  } catch (error) {
    console.error("Job Application Error:", error);
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
