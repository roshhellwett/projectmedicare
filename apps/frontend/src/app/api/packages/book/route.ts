import { NextRequest, NextResponse } from "next/server";
import { createPackageOrder } from "@/lib/db/package-orders";

export async function POST(req: NextRequest) {
  try {
    const { customer_name, phone_number, package_id, store_id } =
      await req.json();

    if (!customer_name || !phone_number || !package_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await createPackageOrder(customer_name, phone_number, package_id, store_id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
