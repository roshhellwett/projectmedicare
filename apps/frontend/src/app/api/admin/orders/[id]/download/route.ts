import { NextResponse } from "next/server";
import { getPrescriptionDownloadUrl } from "@/lib/db/orders";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const supabase = createAdminClient();
    if (!supabase) throw new Error("Supabase admin client not available");

    const { data, error } = await supabase
      .from("medicine_orders")
      .select("prescription_url")
      .eq("id", id)
      .single();
      
    if (error || !data?.prescription_url) {
      throw new Error("Prescription not found");
    }

    const signedUrl = await getPrescriptionDownloadUrl(data.prescription_url);
    return NextResponse.redirect(signedUrl);
  } catch (error: any) {
    console.error("Download prescription error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
