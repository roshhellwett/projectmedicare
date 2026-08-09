import {
  createAdminClient,
  createPublicClient,
  CAMP_BUCKET,
} from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type CampPost = {
  id: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  camp_date: string; // YYYY-MM-DD
  fee: string;
  image_url: string | null;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
};

export type CampInput = Omit<CampPost, "id" | "created_at" | "is_active">;

/** The single currently published camp post (or null). */
export async function getActiveCamp(): Promise<CampPost | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("camp_posts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data as CampPost) ?? null;
}

/** Archived camps, newest first (admin view). */
export async function getCampArchive(limit = 12): Promise<CampPost[]> {
  const supabase = createAdminClient() ?? createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("camp_posts")
    .select("*")
    .eq("is_active", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as CampPost[];
}

/**
 * Publish a new camp post atomically via RPC.
 * The previous active one is archived in the same transaction,
 * so there's no window where zero camps are active.
 */
export async function publishCamp(input: CampInput): Promise<CampPost> {
  const supabase = createAdminClient();
  if (!supabase)
    throw new Error(
      "Supabase service role key is not configured on the server.",
    );

  const { data, error } = await supabase.rpc("publish_camp", {
    p_title: input.title,
    p_description: input.description,
    p_venue: input.venue,
    p_address: input.address,
    p_camp_date: input.camp_date,
    p_fee: input.fee,
    p_image_url: input.image_url,
    p_image_path: input.image_path,
  });

  if (error) throw new Error(error.message);

  // Fetch the newly created camp to return the full object
  const newId = data as string;
  const { data: camp, error: fetchError } = await supabase
    .from("camp_posts")
    .select("*")
    .eq("id", newId)
    .single();
  if (fetchError || !camp) throw new Error("Camp published but could not be fetched");

  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/admin/camp", "page");
  revalidatePath("/[locale]/admin", "page");

  return camp as CampPost;
}

export async function updateCamp(
  id: string,
  input: Partial<CampInput>,
): Promise<CampPost> {
  const supabase = createAdminClient();
  if (!supabase)
    throw new Error(
      "Supabase service role key is not configured on the server.",
    );

  const { data: existing } = await supabase
    .from("camp_posts")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("camp_posts")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  if (
    existing?.image_path &&
    input.image_path !== undefined &&
    existing.image_path !== input.image_path
  ) {
    try {
      await supabase.storage.from(CAMP_BUCKET).remove([existing.image_path]);
    } catch (err) {
      console.error("Failed to delete old camp image from storage:", err);
    }
  }

  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/admin/camp", "page");
  revalidatePath("/[locale]/admin", "page");

  return data as CampPost;
}

export async function deleteCamp(id: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase)
    throw new Error(
      "Supabase service role key is not configured on the server.",
    );

  const { data: existing } = await supabase
    .from("camp_posts")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("camp_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const path = (existing as { image_path?: string | null } | null)?.image_path;
  if (path) await supabase.storage.from(CAMP_BUCKET).remove([path]);

  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/admin/camp", "page");
  revalidatePath("/[locale]/admin", "page");
}
