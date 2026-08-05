import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";
import { num, str, ValidationError } from "@/lib/utils/validation";

const SORTABLE = ["sl_no", "test_name", "vail_name", "jm_rate"];

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
    test_name: str(body.test_name, "Test name", { max: 200 }),
    vail_name: str(body.vail_name, "Vial name", { max: 120, optional: true }),
    jm_rate: str(String(body.jm_rate ?? ""), "Janta rate", { max: 40 }),
    sl_no: num(body.sl_no, "Sl No"),
  };
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
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
      : "test_name";
    const ascending = url.searchParams.get("dir") !== "desc";

    let q = db(false)
      .from("patient_rates")
      .select("*", { count: "exact" })
      .order(sortKey, { ascending });
    if (query) q = q.ilike("test_name", `%${query}%`);

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
    const { data, error } = await db(true)
      .from("patient_rates")
      .insert(parse(await req.json()))
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
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
      .from("patient_rates")
      .update(parse(body))
      .eq("id", id)
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { error } = await db(true)
      .from("patient_rates")
      .delete()
      .in("id", ids);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, deleted: ids.length });
  } catch (err) {
    return fail(err);
  }
}
