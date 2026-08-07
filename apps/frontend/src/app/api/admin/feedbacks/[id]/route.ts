import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/auth/guard";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await isAdminAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // First, get the feedback to see if there's an image
    const { data: feedback, error: fetchError } = await supabase
      .from("feedbacks")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    // Delete the row
    const { error: deleteError } = await supabase
      .from("feedbacks")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // If there is an image, delete it from the bucket to save memory!
    if (feedback.image_url) {
      const { error: storageError } = await supabase.storage
        .from("feedbacks")
        .remove([feedback.image_url]);
        
      if (storageError) {
        console.error("Failed to delete feedback image from storage:", storageError);
        // We still return success since the DB row was deleted
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete feedback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
