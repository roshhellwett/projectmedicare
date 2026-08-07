import { createAdminClient } from "../supabase/admin";

export interface Feedback {
  id: string;
  name: string;
  phone: string;
  note: string | null;
  image_url: string | null;
  created_at: string;
}

export async function getFeedbacks(): Promise<Feedback[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch feedbacks:", error);
    return [];
  }
  return data || [];
}
