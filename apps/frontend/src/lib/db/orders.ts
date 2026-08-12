import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";
import type { PharmacyStore } from "./stores";

export const PRESCRIPTIONS_BUCKET = "prescriptions";

export type MedicineOrder = {
  id: string;
  name: string;
  phone: string;
  address: string;
  note: string | null;
  prescription_url: string;
  assigned_store_id: string | null;
  status: "pending" | "claimed" | "delivered" | "cancelled";
  selected_at: string | null;
  created_at: string;
  cart_items: any[] | null;

  // Joined relation
  store?: PharmacyStore;
};

export async function getMedicineOrders(): Promise<MedicineOrder[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("medicine_orders")
    .select(
      `
      *,
      store:pharmacy_stores(*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as MedicineOrder[];
}

export async function createMedicineOrder(
  name: string,
  phone: string,
  address: string,
  note: string,
  prescription_url: string | null,
  cart_items?: any[] | null,
): Promise<void> {
  const supabase = createPublicClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase.from("medicine_orders").insert({
    name,
    phone,
    address,
    note: note || null,
    prescription_url,
    cart_items: cart_items || null,
  });

  if (error) throw new Error(error.message);
}

export async function selectMedicineOrder(
  orderId: string,
  storeId: string,
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available");

  // Atomic update: only update if assigned_store_id IS NULL
  const { data, error } = await supabase
    .from("medicine_orders")
    .update({
      assigned_store_id: storeId,
      selected_at: new Date().toISOString(),
      status: "claimed",
    })
    .or(`assigned_store_id.is.null,assigned_store_id.eq.${storeId}`)
    .eq("id", orderId)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Order was already selected by another store.");
  }
}

export async function deleteMedicineOrder(id: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available");

  const { data: existing } = await supabase
    .from("medicine_orders")
    .select("prescription_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("medicine_orders")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  const path = (existing as { prescription_url?: string | null } | null)
    ?.prescription_url;
  if (path) {
    await supabase.storage.from(PRESCRIPTIONS_BUCKET).remove([path]);
  }
}

export async function getPrescriptionDownloadUrl(
  path: string,
): Promise<string> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available");

  const { data, error } = await supabase.storage
    .from(PRESCRIPTIONS_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error || !data)
    throw new Error(error?.message || "Failed to generate URL");
  return data.signedUrl;
}
