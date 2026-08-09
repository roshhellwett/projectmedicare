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
  const supabase = client();

  // Fetch the old bulletin to check if the image URL is changing
  const { data: oldBulletin } = await supabase
    .from("bulletins")
    .select("image_url")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("bulletins")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  // If the update was successful, and the old image_url is different from the new input.image_url,
  // and the old image was in the products bucket, delete it.
  if (
    oldBulletin?.image_url &&
    input.image_url !== undefined &&
    oldBulletin.image_url !== input.image_url &&
    oldBulletin.image_url.includes("/storage/v1/object/public/products/")
  ) {
    try {
      const urlParts = oldBulletin.image_url.split("/products/");
      if (urlParts.length > 1) {
        const objectPath = urlParts[1];
        await supabase.storage.from("products").remove([objectPath]);
      }
    } catch (err) {
      console.error("Failed to delete old bulletin image from storage:", err);
    }
  }

  revalidateBulletins();
  return data as Bulletin;
}

export async function deleteBulletin(id: string): Promise<void> {
  const supabase = client();

  // First, get the bulletin to see if they have a custom image
  const { data: bulletin } = await supabase
    .from("bulletins")
    .select("image_url")
    .eq("id", id)
    .single();

  // If they have a custom image in the products bucket, delete it
  if (
    bulletin?.image_url &&
    bulletin.image_url.includes("/storage/v1/object/public/products/")
  ) {
    try {
      const urlParts = bulletin.image_url.split("/products/");
      if (urlParts.length > 1) {
        const objectPath = urlParts[1];
        await supabase.storage.from("products").remove([objectPath]);
      }
    } catch (err) {
      console.error("Failed to delete bulletin image from storage:", err);
    }
  }

  const { error } = await supabase.from("bulletins").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateBulletins();
}
