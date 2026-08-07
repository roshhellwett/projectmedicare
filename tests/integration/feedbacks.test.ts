import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Feedbacks Integration Tests", () => {
  let testFeedback = null;
  const testPhone = "9999999999";

  beforeAll(async () => {
    // Clean up any potential leftover from previous failed tests
    await adminSupabase.from("feedbacks").delete().eq("phone", testPhone);
    
    // Create an initial feedback
    const { data, error } = await adminSupabase.from("feedbacks").insert({
      name: "Integration Test User",
      phone: testPhone,
      note: "This is a test feedback"
    }).select().single();
    
    if (error) throw new Error(error.message);
    testFeedback = data;
  });

  afterAll(async () => {
    // Cleanup
    if (testFeedback) {
      await adminSupabase.from("feedbacks").delete().eq("id", testFeedback.id);
    }
    await adminSupabase.from("feedbacks").delete().eq("phone", "8888888888"); // cleanup for constraint test
  });

  describe("Constraints", () => {
    it("should prevent inserting a second feedback with the same phone (unique constraint)", async () => {
      const { error } = await adminSupabase.from("feedbacks").insert({
        name: "Another User",
        phone: testPhone, // Same phone
        note: "Trying to submit again"
      });
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe("23505"); // unique_violation
    });
  });

  describe("Row Level Security (RLS)", () => {
    it("should allow public to read feedbacks (if policy allows)", async () => {
      // The policy "Allow public read access on feedbacks" exists
      const { data, error } = await anonSupabase.from("feedbacks").select("id").eq("id", testFeedback.id);
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data?.[0].id).toBe(testFeedback.id);
    });

    it("should allow admin to delete feedbacks", async () => {
      // Create a temporary feedback to delete
      const tempRes = await adminSupabase.from("feedbacks").insert({
        name: "Temp User",
        phone: "8888888888",
        note: "To be deleted"
      }).select().single();
      
      expect(tempRes.error).toBeNull();

      // Delete it
      const { error: deleteError } = await adminSupabase.from("feedbacks").delete().eq("id", tempRes.data.id);
      expect(deleteError).toBeNull();
      
      // Verify it's gone
      const { data } = await adminSupabase.from("feedbacks").select("id").eq("id", tempRes.data.id);
      expect(data).toHaveLength(0);
    });
  });

  describe("Storage Buckets RLS", () => {
    it("should allow public to read from feedbacks bucket", async () => {
      // We don't need to actually have a file to test the policy, just trying to list or read
      // But testing actual access is easiest by seeing if we get a policy error or just empty list
      const { error } = await anonSupabase.storage.from("feedbacks").list();
      expect(error).toBeNull();
    });
  });
});
