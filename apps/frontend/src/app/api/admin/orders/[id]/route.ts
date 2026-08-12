import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { deleteMedicineOrder } from "@/lib/db/orders";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const error = await requireAdmin();
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    
    const envPassword = (process.env.SUPER_ADMIN_PASSWORD || "").trim();
    const providedPassword = (body.superAdminPassword || "").trim();

    if (providedPassword !== envPassword) {
      return NextResponse.json(
        { error: "Invalid super admin password" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteMedicineOrder(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
