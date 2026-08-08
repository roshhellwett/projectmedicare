import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { adminCreateDoctor } from "@/lib/db/doctors";
import {
  str,
  num,
  oneOf,
  ValidationError,
} from "@/lib/utils/validation";

function parseDoctorInput(body: Record<string, unknown>) {
  const name = str(body.name, "Name", { max: 120 });
  const gender = oneOf(body.gender, "Gender", ["male", "female"] as const);
  const specialty = str(body.specialty, "Specialty", { max: 120 });
  const department = str(body.department, "Department", { max: 120 });
  const contact = body.contact
    ? str(body.contact, "Contact", { max: 60 })
    : null;
  const image_url = body.image_url
    ? str(body.image_url, "Image URL", { max: 600 })
    : null;
  const is_daily_chamber = body.is_daily_chamber === true;
  const daily_fee = num(body.daily_fee ?? 300, "Daily fee", {
    min: 0,
    max: 50000,
  });
  const display_order = num(body.display_order ?? 999, "Display order", {
    min: 0,
    max: 9999,
  });

  // Validate qualifications is a non-empty array of strings
  if (!Array.isArray(body.qualifications) || body.qualifications.length === 0) {
    throw new ValidationError("At least one qualification is required");
  }
  const qualifications = body.qualifications.map((q: unknown, i: number) =>
    str(q, `Qualification ${i + 1}`, { max: 100 }),
  );

  return {
    name,
    gender,
    specialty,
    department,
    qualifications,
    contact,
    image_url,
    is_daily_chamber,
    daily_fee,
    display_order,
  };
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const validated = parseDoctorInput(body);
    await adminCreateDoctor(validated);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
