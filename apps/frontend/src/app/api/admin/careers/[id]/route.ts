import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { deleteJobApplication } from "@/lib/db/careers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await deleteJobApplication(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete career application error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
