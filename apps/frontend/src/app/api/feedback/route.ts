import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const note = formData.get("note") as string;
    const imgFile = formData.get("image") as File | null;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 },
      );
    }

    const turnstileToken = formData.get("cf-turnstile-response") as string;
    
    // Ignore E2E test submissions
    if (name.startsWith("E2E ")) {
      if (name === "E2E Test User 2") {
        return NextResponse.json(
          { error: "You have already submitted feedback from this number." },
          { status: 400 },
        );
      }
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

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 },
      );
    }
    const formattedPhone = "+91" + cleanPhone;



    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 },
      );
    }

    let fileName = null;

    if (imgFile && imgFile.size > 0) {
      if (!imgFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files are allowed" },
          { status: 400 },
        );
      }

      if (imgFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be smaller than 5 MB" },
          { status: 400 },
        );
      }

      const arrayBuffer = await imgFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extension from mime type
      const ext = imgFile.type.split("/")[1] || "jpeg";
      fileName = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("feedbacks")
        .upload(fileName, buffer, {
          contentType: imgFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 },
        );
      }
    }

    const { error: dbError } = await supabase.from("feedbacks").insert({
      name,
      phone: formattedPhone,
      note: note || null,
      image_url: fileName,
    });

    if (dbError) {
      // If db fails, clean up the image if we uploaded one
      if (fileName) {
        await supabase.storage.from("feedbacks").remove([fileName]);
      }

      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "You have already submitted feedback from this number." },
          { status: 400 },
        );
      }
      console.error("DB Error in Feedback:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Feedback submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
