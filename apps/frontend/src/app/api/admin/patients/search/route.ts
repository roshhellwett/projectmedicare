import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone || phone.length < 10) {
      return NextResponse.json({ ok: false, error: "Invalid phone number" }, { status: 400 });
    }

    const client = createAdminClient();
    
    if (!client) {
      return NextResponse.json({ ok: false, error: "Database client error" }, { status: 500 });
    }
    // Find the most recent invoice with this phone number to get the patient name
    const { data, error } = await client
      .from("invoices")
      .select("patient_name")
      .eq("patient_phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // It's okay if not found
      if (error.code === 'PGRST116') {
        return NextResponse.json({ ok: true, name: null });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, name: data.patient_name });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
