import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMedicineOrder, PRESCRIPTIONS_BUCKET } from "@/lib/db/orders";
import { validateTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const note = formData.get("note") as string;
    const imgFile = formData.get("image") as File | null;
    const cartItemsRaw = formData.get("cart_items") as string | null;

    if (!name || !phone || !address || (!imgFile && !cartItemsRaw)) {
      return NextResponse.json(
        { error: "Missing required fields or order items" },
        { status: 400 },
      );
    }
    
    const turnstileToken = formData.get("cf-turnstile-response") as string;

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

    let fileName: string | null = null;
    
    if (imgFile && imgFile.size > 0) {
      const arrayBuffer = await imgFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extension from mime type
      const ext = imgFile.type.split("/")[1] || "jpeg";
      fileName = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(PRESCRIPTIONS_BUCKET)
        .upload(fileName, buffer, {
          contentType: imgFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload prescription" },
          { status: 500 },
        );
      }
    }

    let parsedCartItems = null;
    if (cartItemsRaw) {
      try {
        parsedCartItems = JSON.parse(cartItemsRaw);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid cart data" },
          { status: 400 },
        );
      }
    }

    try {
      await createMedicineOrder(name, formattedPhone, address, note, fileName, parsedCartItems);
    } catch (dbError: any) {
      if (fileName) {
        await supabase.storage.from(PRESCRIPTIONS_BUCKET).remove([fileName]);
      }
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Order submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
