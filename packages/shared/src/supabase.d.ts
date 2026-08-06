import type { SupabaseClient } from "@supabase/supabase-js";

type Env = Record<string, string | undefined>;

export declare const CAMP_BUCKET: "camp-images";
export declare const GALLERY_BUCKET: "gallery";
export declare function resolveSupabaseUrl(env?: Env): string | undefined;
export declare function resolveAnonKey(env?: Env): string | undefined;
export declare function resolveServiceKey(env?: Env): string | undefined;
export declare function createAdminClient(env?: Env): SupabaseClient | null;
export declare function createPublicClient(env?: Env): SupabaseClient | null;
export declare function isSupabaseConfigured(env?: Env): boolean;
