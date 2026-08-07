import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";

export type Package = {
  id: string;
  name: string;
  description: string | null;
  tests: string[];
  market_price: number;
  janta_price: number;
  is_featured: boolean;
  created_at: string;
};

export async function getPackages(): Promise<Package[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as Package[];
}

export async function getFeaturedPackages(): Promise<Package[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_featured", true)
    .limit(4)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as Package[];
}

export async function createPackage(
  pkg: Omit<Package, "id" | "created_at">,
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available");

  const { error } = await supabase.from("packages").insert(pkg);
  if (error) throw new Error(error.message);
}

export async function updatePackage(
  id: string,
  pkg: Partial<Package>,
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available");

  const { error } = await supabase.from("packages").update(pkg).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePackage(id: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available");

  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
