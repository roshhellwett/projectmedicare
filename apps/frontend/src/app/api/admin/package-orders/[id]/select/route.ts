import { NextRequest, NextResponse } from "next/server";
import { selectPackageOrder } from "@/lib/db/package-orders";
import { requireAdmin } from "@/lib/auth/guard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const error = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const { storeId } = await req.json();

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    await selectPackageOrder(id, storeId);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
