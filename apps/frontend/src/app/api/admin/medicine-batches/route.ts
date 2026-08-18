import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin, requireAuth } from "@/lib/auth/guard";
import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";
import { num, str, ValidationError } from "@/lib/utils/validation";

const SORTABLE = ["medicine_name", "batch_number", "expiry_date", "mrp", "selling_price", "buying_price", "stock"];

function db(write: boolean) {
  const client = write
    ? createAdminClient()
    : (createAdminClient() ?? createPublicClient());
  if (!client) throw new Error("Supabase is not configured on the server.");
  return client;
}

function fail(err: unknown) {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Something went wrong" },
    { status: 500 },
  );
}

function parse(body: Record<string, unknown>) {
  return {
    medicine_id: num(body.medicine_id, "Medicine ID"),
    barcode: str(body.barcode, "Barcode", { max: 100, optional: true }),
    batch_number: str(body.batch_number, "Batch Number", { max: 100, optional: true }),
    expiry_date: str(body.expiry_date, "Expiry Date", { max: 50, optional: true }),
    buying_price: num(body.buying_price, "Buying Price"),
    selling_price: num(body.selling_price, "Selling price"),
    mrp: num(body.mrp, "MRP"),
    purchase: num(body.purchase, "Purchase"),
    sale: num(body.sale, "Sale"),
    stock: num(body.stock, "Stock"),
  };
}

export async function GET(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const url = new URL(req.url);
    const query = (url.searchParams.get("query") || "").slice(0, 100);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Number(url.searchParams.get("pageSize")) || 20,
    );
    // Sort logic is simplified for join, usually you'd sort on the joined view
    const ascending = url.searchParams.get("dir") !== "desc";

    let queryBuilder;
    
    if (query) {
      queryBuilder = db(false).rpc("search_pos_batches", { search_query: query });
    } else {
      queryBuilder = db(false)
        .from("medicine_batches")
        .select("id, medicine_id, barcode, batch_number, expiry_date, buying_price, selling_price, mrp, purchase, sale, stock, created_at, updated_at, medicines!inner(medicine_name, pack_size, hsn_code, gst)", { count: "exact" })
        .gt("stock", 0)
        .order("medicine_id", { ascending: true });
    }

    const { data, error, count } = await queryBuilder.range(
      (page - 1) * pageSize,
      page * pageSize - 1,
    );
    
    if (error) {
      console.error("MEDICINE BATCHES API ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
      
    // Flatten the response for the frontend table
    const items = (data || []).map((row: any) => ({
        ...row,
        medicine_name: row.medicine_name || (row.medicines as any)?.medicine_name,
        pack_size: row.pack_size || (row.medicines as any)?.pack_size,
        hsn_code: row.hsn_code || (row.medicines as any)?.hsn_code,
        gst: row.gst || (row.medicines as any)?.gst,
    }));
    
    return NextResponse.json({ items, total: count ?? data?.length ?? 0 });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const parsed = parse(await req.json());
    const client = db(true);

    const { data, error } = await client
      .from("medicine_batches")
      .insert(parsed)
      .select("*, medicines(medicine_name)")
      .single();
      
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
      
    revalidateTag("medicines", { expire: 0 });
    revalidateTag("stats", { expire: 0 });
    return NextResponse.json({ item: data });
  } catch (err) {
    return fail(err);
  }
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = num(body.id, "id", { max: Number.MAX_SAFE_INTEGER });
    const { data, error } = await db(true)
      .from("medicine_batches")
      .update(parse(body))
      .eq("id", id)
      .select()
      .single();
      
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
      
    revalidateTag("medicines", { expire: 0 });
    revalidateTag("stats", { expire: 0 });
    return NextResponse.json({ item: data });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const raw: unknown[] = Array.isArray(body.ids) ? body.ids : [body.id];
    const ids = raw.map((v) => num(v, "id", { max: Number.MAX_SAFE_INTEGER }));
    if (ids.length === 0) throw new ValidationError("No rows selected");
    
    const { error } = await db(true).from("medicine_batches").delete().in("id", ids);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
      
    revalidateTag("medicines", { expire: 0 });
    revalidateTag("stats", { expire: 0 });
    return NextResponse.json({ ok: true, deleted: ids.length });
  } catch (err) {
    return fail(err);
  }
}
