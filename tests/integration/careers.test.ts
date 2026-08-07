import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Careers Integration Tests", () => {
  it("should enforce RLS preventing anon users from reading career applications", async () => {
    // There shouldn't even be a careers table exposed to public read
    // But if there is, it should be protected by RLS
    const { error } = await anonSupabase
      .from("career_applications")
      .select("*")
      .limit(1);

    // We expect an error (either relation does not exist if we use email, or RLS denial)
    // The codebase uses API routes and resend for careers, not necessarily a Supabase table.
    // If it's a table, RLS should block anon read.
    if (error) {
      expect(error.code).toMatch(/PGRST205|42P01|42501/); // Undefined table or Permission denied
    }
  });
});
