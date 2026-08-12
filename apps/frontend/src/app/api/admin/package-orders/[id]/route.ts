import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { deletePackageOrder } from "@/lib/db/package-orders";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const error = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    
    const envPassword = (process.env.SUPER_ADMIN_PASSWORD || "").trim();
    const providedPassword = (body.superAdminPassword || "").trim();

    console.log("SUPER_ADMIN_PASSWORD env (trimmed):", envPassword);
    console.log("Password received (trimmed):", providedPassword);
    
    if (providedPassword !== envPassword) {
      return NextResponse.json(
        { error: "Invalid super admin password" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deletePackageOrder(id);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
