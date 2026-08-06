import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { createAdminClient, GALLERY_BUCKET } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Image upload needs SUPABASE_SERVICE_ROLE_KEY on the server." },
      { status: 503 },
    );
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!file)
    return NextResponse.json({ error: "No image selected" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG or WebP images are allowed" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be smaller than 5 MB" },
      { status: 400 },
    );
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  
  // Use a clean path format
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // 1. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // 2. Get Public URL
  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
  
  // 3. Save to database
  const { data: dbData, error: dbError } = await supabase
    .from("gallery_images")
    .insert([{ url: data.publicUrl }])
    .select()
    .single();

  if (dbError) {
    // Attempt rollback of uploaded file
    await supabase.storage.from(GALLERY_BUCKET).remove([path]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  revalidatePath("/(locale)/gallery", "page");
  revalidatePath("/(locale)/admin/gallery", "page");

  return NextResponse.json({ ok: true, image: dbData });
}
