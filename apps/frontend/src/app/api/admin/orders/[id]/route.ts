import { NextResponse } from "next/server";
import { deleteMedicineOrder } from "@/lib/db/orders";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteMedicineOrder(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
