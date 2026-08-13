import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guard";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const cookieStore = await cookies();
    const store_id = cookieStore.get("admin_store_id")?.value;

    if (!store_id) {
      return NextResponse.json(
        { error: "No store selected in admin" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { status } = body;
    const { id } = await params;

    const supabase = createAdminClient();
    if (!supabase) throw new Error("Supabase admin client not available");

    const { error } = await supabase
      .from("medicine_orders")
      .update({ status })
      .eq("id", id)
      .eq("assigned_store_id", store_id)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
