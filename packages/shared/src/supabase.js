import { createClient } from "@supabase/supabase-js";

/** Storage bucket that holds Sunday camp photos. */
export const CAMP_BUCKET = "camp-images";

function pick(env, names) {
  for (const name of names) {
    const value = env[name];
    if (value) return value;
  }
  return undefined;
}

export function resolveSupabaseUrl(env = process.env) {
  return pick(env, ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]);
}

export function resolveAnonKey(env = process.env) {
  return pick(env, [
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
  ]);
}

export function resolveServiceKey(env = process.env) {
  return pick(env, ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"]);
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };

/**
 * Service-role client. SERVER ONLY — bypasses RLS. Returns null when the
 * environment is not configured so callers can degrade gracefully.
 */
export function createAdminClient(env = process.env) {
  const url = resolveSupabaseUrl(env);
  const key = resolveServiceKey(env);
  if (!url || !key) return null;
  return createClient(url, key, options);
}

/** Anon/publishable client for public reads (RLS applies). */
export function createPublicClient(env = process.env) {
  const url = resolveSupabaseUrl(env);
  const key = resolveAnonKey(env);
  if (!url || !key) return null;
  return createClient(url, key, options);
}

/** True when public reads are possible at all. */
export function isSupabaseConfigured(env = process.env) {
  return Boolean(resolveSupabaseUrl(env) && resolveAnonKey(env));
}
