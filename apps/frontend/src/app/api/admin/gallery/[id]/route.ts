import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { createAdminClient, GALLERY_BUCKET } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Needs SUPABASE_SERVICE_ROLE_KEY on the server." },
      { status: 503 },
    );
  }

  // 1. Get the image URL from DB
  const { data: image, error: fetchError } = await supabase
    .from("gallery_images")
    .select("url")
    .eq("id", id)
    .single();

  if (fetchError || !image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  // 2. Delete from DB first
  const { error: dbError } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // 3. Delete from Storage
  // Extract path from URL. Example URL:
  // https://xyz.supabase.co/storage/v1/object/public/gallery/123-abc.jpg
  try {
    const urlObj = new URL(image.url);
    const pathParts = urlObj.pathname.split(`/${GALLERY_BUCKET}/`);
    if (pathParts.length === 2) {
      const storagePath = pathParts[1];
      await supabase.storage.from(GALLERY_BUCKET).remove([storagePath]);
    }
  } catch (e) {
    // If storage deletion fails, we still deleted the DB row, which is the main thing.
    console.error("Failed to delete from storage:", e);
  }

  revalidatePath("/(locale)/gallery", "page");
  revalidatePath("/(locale)/admin/gallery", "page");

  return NextResponse.json({ ok: true });
}
