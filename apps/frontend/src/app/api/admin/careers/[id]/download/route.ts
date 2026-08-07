import { NextResponse } from "next/server";
import { getCvDownloadUrl } from "@/lib/db/careers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const signedUrl = await getCvDownloadUrl(id);
    return NextResponse.redirect(signedUrl);
  } catch (error: any) {
    console.error("Download CV error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
