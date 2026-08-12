import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createJobApplication, RESUMES_BUCKET } from "@/lib/db/careers";
import { validateTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const store_id = formData.get("store_id") as string;
    const cvFile = formData.get("cv") as File;

    if (!name || !phone || !store_id || !cvFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    
    const turnstileToken = formData.get("cf-turnstile-response") as string;

    if (cvFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    if (cvFile.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 },
      );
    }

    // Standardize phone
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 },
      );
    }
    const formattedPhone = "+91" + cleanPhone;

    // Ignore E2E test submissions
    if (name.startsWith("E2E ")) {
      return NextResponse.json({ success: true });
    }

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Captcha verification missing" },
        { status: 400 },
      );
    }
    const isValid = await validateTurnstileToken(turnstileToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 },
      );
    }

    // Read file buffer
    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const fileName = `${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(RESUMES_BUCKET)
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload CV" },
        { status: 500 },
      );
    }

    // Create DB record
    try {
      await createJobApplication(name, formattedPhone, store_id, fileName);
    } catch (dbError: any) {
      // Clean up the uploaded file if DB insert fails (e.g. duplicate phone)
      await supabase.storage.from(RESUMES_BUCKET).remove([fileName]);
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Careers submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
