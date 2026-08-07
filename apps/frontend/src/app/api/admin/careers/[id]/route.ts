import { NextResponse } from "next/server";
import { deleteJobApplication } from "@/lib/db/careers";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteJobApplication(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete career application error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
