import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import {
  createBulletin,
  deleteBulletin,
  getAllBulletins,
  updateBulletin,
  type BulletinInput,
} from "@/lib/db/bulletins";
import {
  bool,
  isoOrNull,
  oneOf,
  str,
  uuid,
  ValidationError,
} from "@/lib/utils/validation";

function parseInput(body: Record<string, unknown>): BulletinInput {
  const kind = oneOf(body.kind, "Type", ["info", "offer"] as const);
  const starts_at = isoOrNull(body.starts_at, "Start date");
  const ends_at = isoOrNull(body.ends_at, "End date");

  if (kind === "offer" && !ends_at) {
    throw new ValidationError(
      "An offer needs an end date so it can expire automatically",
    );
  }
  if (starts_at && ends_at && new Date(ends_at) <= new Date(starts_at)) {
    throw new ValidationError("End date must be after the start date");
  }

  return {
    body: str(body.body, "Message", { max: 600 }),
    kind,
    starts_at,
    ends_at,
    pinned: bool(body.pinned),
  };
}

function fail(err: unknown) {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  const message = err instanceof Error ? err.message : "Something went wrong";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ items: await getAllBulletins() });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const bulletin = await createBulletin(parseInput(await req.json()));
    return NextResponse.json({ ok: true, bulletin });
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = uuid(body.id, "Bulletin id");
    const bulletin = await updateBulletin(id, parseInput(body));
    return NextResponse.json({ ok: true, bulletin });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    await deleteBulletin(uuid(body.id, "Bulletin id"));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
