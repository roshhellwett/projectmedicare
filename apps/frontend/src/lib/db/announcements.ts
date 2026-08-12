import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type Announcement = {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
};

export type AnnouncementInput = Omit<Announcement, "id" | "created_at">;

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  
  if (error || !data) return [];
  return data as Announcement[];
}

export async function getAllAnnouncements(limit = 20): Promise<Announcement[]> {
  const supabase = createAdminClient() ?? createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
    
  if (error || !data) return [];
  return data as Announcement[];
}

export async function createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase service role key is not configured on the server.");

  const { data, error } = await supabase
    .from("announcements")
    .insert([input])
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  // Memory Saving Trick: Delete inactive announcements older than the 10 most recent ones
  try {
    const { data: keepData } = await supabase
      .from("announcements")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (keepData && keepData.length === 10) {
      const keepIds = keepData.map(r => r.id);
      await supabase
        .from("announcements")
        .delete()
        .eq("is_active", false)
        .not("id", "in", `(${keepIds.join(",")})`);
    }
  } catch (err) {
    console.error("Failed to prune old announcements", err);
  }

  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/admin/announcements", "page");
  
  return data as Announcement;
}

export async function updateAnnouncement(id: string, input: Partial<AnnouncementInput>): Promise<Announcement> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase service role key is not configured on the server.");

  const { data, error } = await supabase
    .from("announcements")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/admin/announcements", "page");

  return data as Announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase service role key is not configured on the server.");

  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/admin/announcements", "page");
}
