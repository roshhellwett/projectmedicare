import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin, requireAuth } from "@/lib/auth/guard";
import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";
import { num, str, ValidationError } from "@/lib/utils/validation";

const SORTABLE = ["s_no", "medicine_name", "pack_size", "hsn_code", "gst", "mrp", "selling_price"];

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
    s_no: num(body.s_no, "S No"),
    medicine_name: str(body.medicine_name, "Medicine name", { max: 200 }),
    pack_size: str(body.pack_size, "Pack size", { max: 60, optional: true }),
    hsn_code: str(body.hsn_code, "HSN Code", { max: 50, optional: true }),
    gst: num(body.gst, "GST"),
    mrp: body.mrp ? num(body.mrp, "MRP") : 0,
    selling_price: body.selling_price ? num(body.selling_price, "Selling Price") : 0,
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
    const sortKey = SORTABLE.includes(url.searchParams.get("sortKey") || "")
      ? (url.searchParams.get("sortKey") as string)
      : "medicine_name";
    const ascending = url.searchParams.get("dir") !== "desc";

    let q = db(false)
      .from("medicines")
      .select("*", { count: "exact" })
      .order(sortKey, { ascending });
    if (query) q = q.ilike("medicine_name", `%${query}%`);

    const { data, error, count } = await q.range(
      (page - 1) * pageSize,
      page * pageSize - 1,
    );
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [], total: count ?? 0 });
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

    if (parsed.s_no === 0) {
      const { data: maxData, error: maxError } = await client
        .from("medicines")
        .select("s_no")
        .order("s_no", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!maxError && maxData) {
        parsed.s_no = (maxData.s_no || 0) + 1;
      } else {
        parsed.s_no = 1;
      }
    }

    const { data, error } = await client
      .from("medicines")
      .insert(parsed)
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

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = num(body.id, "id", { max: Number.MAX_SAFE_INTEGER });
    const parsedBody = parse(body);
    const client = db(true);
    
    const { data, error } = await client
      .from("medicines")
      .update(parsedBody)
      .eq("id", id)
      .select()
      .single();
      
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
      
    // Sync to medicine_batches
    await client
      .from("medicine_batches")
      .update({
          mrp: parsedBody.mrp,
          selling_price: parsedBody.selling_price
      })
      .eq("medicine_id", id);
      
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
    const { error } = await db(true).from("medicines").delete().in("id", ids);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("medicines", { expire: 0 });
    revalidateTag("stats", { expire: 0 });
    return NextResponse.json({ ok: true, deleted: ids.length });
  } catch (err) {
    return fail(err);
  }
}
