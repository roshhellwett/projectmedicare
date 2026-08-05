import {
  createAdminClient,
  createPublicClient,
  CAMP_BUCKET,
} from "@/lib/supabase/admin";

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

/** Publish a new camp post; the previous active one is archived atomically enough. */
export async function publishCamp(input: CampInput): Promise<CampPost> {
  const supabase = createAdminClient();
  if (!supabase)
    throw new Error(
      "Supabase service role key is not configured on the server.",
    );

  const { error: archiveError } = await supabase
    .from("camp_posts")
    .update({ is_active: false })
    .eq("is_active", true);
  if (archiveError) throw new Error(archiveError.message);

  const { data, error } = await supabase
    .from("camp_posts")
    .insert({ ...input, is_active: true })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as CampPost;
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
  const { data, error } = await supabase
    .from("camp_posts")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
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
}
