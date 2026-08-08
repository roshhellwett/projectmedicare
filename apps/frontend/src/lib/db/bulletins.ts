import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type BulletinKind = "product" | "offer" | "info";

export type Bulletin = {
  id: string;
  body: string;
  kind: BulletinKind;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  pinned: boolean;
  created_at: string;
};

export type BulletinInput = {
  body: string;
  kind: BulletinKind;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  pinned: boolean;
};

/**
 * Public board: expiry is enforced on read, so an expired offer disappears
 * immediately even if the cleanup worker is stopped.
 */
export async function getVisibleBulletins(limit = 30): Promise<Bulletin[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("bulletins")
    .select("*")
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Bulletin[];
}

/** Everything, including scheduled and expired items (admin view). */
export async function getAllBulletins(limit = 200): Promise<Bulletin[]> {
  const supabase = createAdminClient() ?? createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bulletins")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Bulletin[];
}

function client() {
  const supabase = createAdminClient();
  if (!supabase)
    throw new Error(
      "Supabase service role key is not configured on the server.",
    );
  return supabase;
}

function revalidateBulletins() {
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/bulletins", "page");
  revalidatePath("/[locale]/admin/bulletins", "page");
  revalidatePath("/[locale]/admin", "page");
}

export async function createBulletin(input: BulletinInput): Promise<Bulletin> {
  const { data, error } = await client()
    .from("bulletins")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  revalidateBulletins();
  return data as Bulletin;
}

export async function updateBulletin(
  id: string,
  input: Partial<BulletinInput>,
): Promise<Bulletin> {
  const { data, error } = await client()
    .from("bulletins")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  revalidateBulletins();
  return data as Bulletin;
}

export async function deleteBulletin(id: string): Promise<void> {
  const { error } = await client().from("bulletins").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateBulletins();
}
