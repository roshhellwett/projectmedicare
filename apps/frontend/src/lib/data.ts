import {
  createPublicClient,
  isSupabaseConfigured as supabaseReady,
} from "@/lib/supabase/admin";
import medicinesJson from "@/data/medicines.json";
import ratesJson from "@/data/rates.json";
import { unstable_cache } from "next/cache";

export type Medicine = {
  id: number;
  s_no: number;
  medicine_name: string;
  selling_price: number;
  pack_size: string;
  mrp: number;
};

export type RateTest = {
  id: number;
  sl_no: number;
  test_name: string;
  jm_rate: number | string;
  vail_name: string;
};

export const PAGE_SIZE = 20;

function isSupabaseConfigured() {
  return supabaseReady();
}

async function _getMedicines(
  query = "",
  page = 1,
  sort: { key: string; dir: "asc" | "desc" } = {
    key: "medicine_name",
    dir: "asc",
  },
): Promise<{ items: Medicine[]; total: number }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createPublicClient();
      if (!supabase) throw new Error("Supabase is not configured");
      const q = supabase
        .from("medicines")
        .select("*", { count: "exact" })
        .ilike("medicine_name", `%${query}%`)
        .order(sort.key, { ascending: sort.dir === "asc" });

      const { data, error, count } = await q.range(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE - 1,
      );
      if (!error && data) {
        return { items: data as Medicine[], total: count ?? data.length };
      }
    } catch {
      // fall through to JSON
    }
  }

  return paginateJson(medicinesJson as Medicine[], query, page, sort);
}

export const getMedicines = unstable_cache(
  _getMedicines,
  ['medicines-data'],
  { revalidate: 3600, tags: ['medicines', 'stats'] } // cache for 1 hour
);

async function _getRates(
  query = "",
  page = 1,
  sort: { key: string; dir: "asc" | "desc" } = { key: "test_name", dir: "asc" },
): Promise<{ items: RateTest[]; total: number }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createPublicClient();
      if (!supabase) throw new Error("Supabase is not configured");
      const q = supabase
        .from("patient_rates")
        .select("*", { count: "exact" })
        .ilike("test_name", `%${query}%`)
        .order(sort.key, { ascending: sort.dir === "asc" });

      const { data, error, count } = await q.range(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE - 1,
      );
      if (!error && data) {
        return { items: data as RateTest[], total: count ?? data.length };
      }
    } catch {
      // fall through to JSON
    }
  }

  return paginateJson(ratesJson as RateTest[], query, page, sort);
}

export const getRates = unstable_cache(
  _getRates,
  ['rates-data'],
  { revalidate: 3600, tags: ['rates', 'stats'] }
);

async function _getStats(): Promise<{
  medicinesCount: number;
  ratesCount: number;
  supabaseConnected: boolean;
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createPublicClient();
      if (!supabase) throw new Error("Supabase is not configured");
      const [medRes, rateRes] = await Promise.all([
        supabase.from("medicines").select("*", { count: "exact", head: true }),
        supabase
          .from("patient_rates")
          .select("*", { count: "exact", head: true }),
      ]);
      return {
        medicinesCount: medRes.count ?? 0,
        ratesCount: rateRes.count ?? 0,
        supabaseConnected: !medRes.error && !rateRes.error,
      };
    } catch {
      // fall through
    }
  }
  return {
    medicinesCount: (medicinesJson as Medicine[]).length,
    ratesCount: (ratesJson as RateTest[]).length,
    supabaseConnected: false,
  };
}

export const getStats = unstable_cache(
  _getStats,
  ['stats-data'],
  { revalidate: 3600, tags: ['stats'] }
);

function paginateJson<T>(
  all: T[],
  query: string,
  page: number,
  sort: { key: string; dir: "asc" | "desc" },
): { items: T[]; total: number } {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? all.filter((row) =>
        Object.values(row as Record<string, unknown>)
          .filter((v) => typeof v === "string")
          .some((v) => (v as string).toLowerCase().includes(q)),
      )
    : all;

  const sorted = [...filtered].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sort.key];
    const bv = (b as Record<string, unknown>)[sort.key];
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av ?? "").localeCompare(String(bv ?? ""));
    return sort.dir === "asc" ? cmp : -cmp;
  });

  const start = (page - 1) * PAGE_SIZE;
  return {
    items: sorted.slice(start, start + PAGE_SIZE),
    total: sorted.length,
  };
}
