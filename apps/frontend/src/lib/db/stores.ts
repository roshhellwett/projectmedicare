import { createAdminClient } from "@/lib/supabase/admin";

export type PharmacyStore = {
  id: string;
  name: string;
  created_at: string;
};

export async function getPharmacyStores(): Promise<PharmacyStore[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pharmacy_stores")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as PharmacyStore[];
}
