import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Doctors Table Tests", () => {
  let testDoctor = null;

  beforeAll(async () => {
    const res = await adminSupabase.from("doctors").insert({
      name: "Dr. Jane Doe",
      gender: "female",
      specialty: "Cardiology",
      department: "Heart Center",
      qualifications: ["MBBS", "MD"],
      contact: "1234567890",
      is_daily_chamber: true,
      daily_fee: 500
    }).select().single();
    
    if (res.error) throw new Error(res.error.message);
    testDoctor = res.data;
  });

  afterAll(async () => {
    if (testDoctor) {
      await adminSupabase.from("doctors").delete().eq("id", testDoctor.id);
    }
  });

  it("should allow anon users to read doctors", async () => {
    const { data, error } = await anonSupabase.from("doctors").select("*").eq("id", testDoctor.id);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Dr. Jane Doe");
    expect(data[0].qualifications).toContain("MBBS");
  });

  it("should reject anon users from inserting doctors", async () => {
    const { error } = await anonSupabase.from("doctors").insert({
      name: "Dr. Hacker",
      gender: "male",
      specialty: "Hacking",
      department: "IT",
      qualifications: ["PhD"],
    });
    expect(error).not.toBeNull();
  });

  it("should reject anon users from updating doctors", async () => {
    const { error } = await anonSupabase.from("doctors").update({ name: "Dr. Hacked" }).eq("id", testDoctor.id);
    expect(error).not.toBeNull();
  });
});
