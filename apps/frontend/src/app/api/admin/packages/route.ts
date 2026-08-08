import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { createPackage, getPackages } from "@/lib/db/packages";
import {
  str,
  num,
  bool,
  ValidationError,
} from "@/lib/utils/validation";

function parsePackageInput(body: Record<string, unknown>) {
  const name = str(body.name, "Package name", { max: 200 });
  const description = body.description
    ? str(body.description, "Description", { max: 1000 })
    : null;
  const market_price = num(body.market_price, "Market price", {
    min: 0,
    max: 1_000_000,
  });
  const janta_price = num(body.janta_price, "Janta price", {
    min: 0,
    max: 1_000_000,
  });
  const is_featured = bool(body.is_featured);

  // Validate tests is an array of strings
  if (!Array.isArray(body.tests)) {
    throw new ValidationError("Tests must be a list");
  }
  const tests = body.tests.map((t: unknown, i: number) =>
    str(t, `Test ${i + 1}`, { max: 200 }),
  );

  if (janta_price > market_price) {
    throw new ValidationError(
      "Janta price should not exceed market price",
    );
  }

  return { name, description, tests, market_price, janta_price, is_featured };
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const packages = await getPackages();
    return NextResponse.json(packages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const validated = parsePackageInput(body);
    await createPackage(validated);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
