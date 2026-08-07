import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMedicineOrder, PRESCRIPTIONS_BUCKET } from "@/lib/db/orders";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const note = formData.get("note") as string;
    const imgFile = formData.get("image") as File;

    if (!name || !phone || !address || !imgFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!imgFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
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

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 },
      );
    }

    const arrayBuffer = await imgFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extension from mime type
    const ext = imgFile.type.split("/")[1] || "jpeg";
    const fileName = `${crypto.randomUUID()}.${ext}`;

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

    try {
      await createMedicineOrder(name, formattedPhone, address, note, fileName);
    } catch (dbError: any) {
      await supabase.storage.from(PRESCRIPTIONS_BUCKET).remove([fileName]);
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
