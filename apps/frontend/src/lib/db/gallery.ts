import { createPublicClient } from "@jm/shared/supabase";

export interface GalleryImage {
  id: string;
  url: string;
  created_at: string;
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch gallery images:", error);
    return [];
  }

  return data || [];
}
