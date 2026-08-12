import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/guard";
import { updatePackageOrderStatus } from "@/lib/db/package-orders";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const cookieStore = await cookies();
    const store_id = cookieStore.get("admin_store_id")?.value;

    if (!store_id) {
      return NextResponse.json(
        { error: "No store selected in admin" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { status } = body;
    const { id } = await params;

    await updatePackageOrderStatus(id, store_id, status);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
