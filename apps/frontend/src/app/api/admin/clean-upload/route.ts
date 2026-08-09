import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { bucket, path } = await req.json();
    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Bucket and path are required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    if (!supabase) throw new Error("Supabase admin client not configured");

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete file" },
      { status: 500 },
    );
  }
}
