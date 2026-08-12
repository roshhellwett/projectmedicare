import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";
import type { Package } from "./packages";
import type { PharmacyStore } from "./stores";

export type PackageOrder = {
  id: string;
  customer_name: string;
  phone_number: string;
  package_id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  store_id: string | null;
  selected_at: string | null;
  created_at: string;

  // Joined relation
  pkg?: Package;
  store?: PharmacyStore;
};

export async function getPackageOrders(): Promise<PackageOrder[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("package_orders")
    .select(
      `
      *,
      pkg:packages(*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as PackageOrder[];
}

export async function createPackageOrder(
  customer_name: string,
  phone_number: string,
  package_id: string,
  store_id?: string,
): Promise<void> {
  const supabase = createPublicClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase.from("package_orders").insert({
    customer_name,
    phone_number,
    package_id,
    store_id: store_id || null,
  });

  if (error) throw new Error(error.message);
}

export async function selectPackageOrder(
  orderId: string,
  storeId: string,
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available");

  // Atomic update: only update if store_id IS NULL
  const { data, error } = await supabase
    .from("package_orders")
    .update({
      store_id: storeId,
      selected_at: new Date().toISOString(),
      status: "confirmed",
    })
    // Atomic update: only update if store_id IS NULL or already belongs to this store
    .or(`store_id.is.null,store_id.eq.${storeId}`)
    .eq("id", orderId)
    .select("id")
    .single();

  if (error || !data) {
    console.error("selectPackageOrder error:", error);
    throw new Error(error?.message || "Order was already selected by another store.");
  }
}

export async function deletePackageOrder(id: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available");

  const { error } = await supabase.from("package_orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updatePackageOrderStatus(
  orderId: string,
  storeId: string,
  status: "pending" | "confirmed" | "completed" | "cancelled"
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available");

  const { error } = await supabase
    .from("package_orders")
    .update({ status })
    .eq("id", orderId)
    .eq("store_id", storeId);

  if (error) throw new Error(error.message);
}
