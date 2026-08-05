import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import {
  publishCamp,
  updateCamp,
  deleteCamp,
  getCampArchive,
  getActiveCamp,
} from "@/lib/db/camp";
import { dateOnly, str, uuid, ValidationError } from "@/lib/utils/validation";

function parseInput(body: Record<string, unknown>) {
  return {
    title: str(body.title, "Title", { max: 120 }),
    description: str(body.description, "Description", { max: 1200 }),
    venue: str(body.venue, "Venue", { max: 160 }),
    address: str(body.address, "Address", { max: 300 }),
    camp_date: dateOnly(body.camp_date, "Camp date"),
    fee: str(body.fee, "Fee", { max: 60 }),
    image_url: body.image_url
      ? str(body.image_url, "Image URL", { max: 600 })
      : null,
    image_path: body.image_path
      ? str(body.image_path, "Image path", { max: 300 })
      : null,
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
  const [active, archive] = await Promise.all([
    getActiveCamp(),
    getCampArchive(),
  ]);
  return NextResponse.json({ active, archive });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const camp = await publishCamp(parseInput(body));
    return NextResponse.json({ ok: true, camp });
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = uuid(body.id, "Camp id");
    const camp = await updateCamp(id, parseInput(body));
    return NextResponse.json({ ok: true, camp });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    await deleteCamp(uuid(body.id, "Camp id"));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
