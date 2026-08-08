"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt, decrypt } from "@/lib/utils/encryption";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth/guard";

export type EnvKeyRecord = {
  id: string;
  key_name: string;
  created_at: string;
  updated_at: string;
  masked_value: string;
};

export async function getEnvKeys(): Promise<EnvKeyRecord[]> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  const { data, error } = await supabase
    .from("app_settings")
    .select("id, key_name, encrypted_value, iv, auth_tag, created_at, updated_at")
    .order("key_name", { ascending: true });

  if (error) {
    console.error("Error fetching env keys:", error);
    throw new Error("Failed to fetch env keys");
  }

  return data.map((row: any) => {
    let masked_value = "••••••••";
    try {
      const decrypted = decrypt(row.encrypted_value, row.iv, row.auth_tag);
      if (decrypted.length > 4) {
        masked_value = `••••••••${decrypted.slice(-4)}`;
      }
    } catch (err) {
      masked_value = "Error: Decryption failed";
    }

    return {
      id: row.id,
      key_name: row.key_name,
      created_at: row.created_at,
      updated_at: row.updated_at,
      masked_value,
    };
  });
}

export async function upsertEnvKey(keyName: string, value: string) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    throw new Error("Unauthorized");
  }

  if (!keyName || !value) {
    throw new Error("Key name and value are required");
  }

  const { encryptedValue, iv, authTag } = encrypt(value);

  const supabase = createAdminClient();
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase
    .from("app_settings")
    .upsert(
      {
        key_name: keyName,
        encrypted_value: encryptedValue,
        iv,
        auth_tag: authTag,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key_name" }
    );

  if (error) {
    console.error("Error upserting env key:", error);
    throw new Error("Failed to save env key");
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteEnvKey(id: string) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase
    .from("app_settings")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting env key:", error);
    throw new Error("Failed to delete env key");
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function getDecryptedKey(keyName: string): Promise<string | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("app_settings")
    .select("encrypted_value, iv, auth_tag")
    .eq("key_name", keyName)
    .single();

  if (error || !data) {
    return null;
  }

  try {
    return decrypt(data.encrypted_value, data.iv, data.auth_tag);
  } catch (err) {
    console.error(`Error decrypting key ${keyName}:`, err);
    return null;
  }
}
