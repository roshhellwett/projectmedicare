import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  type AnnouncementInput,
} from "@/lib/db/announcements";
import { bool, str, uuid, ValidationError } from "@/lib/utils/validation";

function parseInput(body: Record<string, unknown>): AnnouncementInput {
  return {
    title: str(body.title, "Title", { max: 150 }),
    description: str(body.description, "Description", { max: 600 }),
    is_active: body.is_active !== undefined ? bool(body.is_active) : true,
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
  return NextResponse.json({ items: await getAllAnnouncements() });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const announcement = await createAnnouncement(parseInput(await req.json()));
    return NextResponse.json({ ok: true, announcement });
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = uuid(body.id, "Announcement id");
    const announcement = await updateAnnouncement(id, parseInput(body));
    return NextResponse.json({ ok: true, announcement });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    await deleteAnnouncement(uuid(body.id, "Announcement id"));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
