import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/utils/encryption";

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
