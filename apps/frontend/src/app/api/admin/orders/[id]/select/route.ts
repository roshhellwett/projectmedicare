import { NextResponse } from "next/server";
import { selectMedicineOrder } from "@/lib/db/orders";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const storeId = body.storeId;
    
    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    await selectMedicineOrder(id, storeId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Select order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
