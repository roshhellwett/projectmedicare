import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  
  try {
    const url = new URL(req.url);
    const query = (url.searchParams.get("query") || "").slice(0, 100);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = 20;

    const client = createAdminClient() ?? createPublicClient();
    if (!client) throw new Error("Supabase is not configured on the server.");

    let q = client
      .from("invoices")
      .select("*, invoice_items(*, medicine_batches(*, medicines(*)))", { count: "exact" })
      .order("created_at", { ascending: false });

    if (query) {
      q = q.ilike("invoice_no", `%${query}%`);
    }

    const { data, error, count } = await q.range(
      (page - 1) * pageSize,
      page * pageSize - 1,
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [], total: count ?? 0 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  
  try {
    const body = await req.json();
    const invoice_id = body.invoice_id;
    if (!invoice_id) throw new Error("invoice_id is required");

    const client = createAdminClient();
    if (!client) throw new Error("Supabase not configured");

    const { data, error } = await client.rpc("cancel_invoice", {
        p_invoice_id: invoice_id
    });

    if (error) {
        throw new Error(error.message);
    }
      
    revalidateTag("medicines", { expire: 0 });
    revalidateTag("stats", { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
