import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Announcements Integration Tests", () => {
  let testAnnouncement: any = null;

  beforeAll(async () => {
    // Insert a test announcement
    const { data, error } = await adminSupabase
      .from("announcements")
      .insert({
        title: "Test Announcement",
        description: "This is a test announcement",
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    testAnnouncement = data;
  });

  afterAll(async () => {
    if (testAnnouncement) {
      await adminSupabase
        .from("announcements")
        .delete()
        .eq("id", testAnnouncement.id);
    }
  });

  it("should allow anon users to read announcements", async () => {
    const { data, error } = await anonSupabase
      .from("announcements")
      .select("*")
      .eq("id", testAnnouncement.id);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].title).toBe("Test Announcement");
  });

  it("should prevent anon users from inserting announcements", async () => {
    const { error } = await anonSupabase.from("announcements").insert({
      title: "Hacker Announcement",
      description: "Should fail",
    });

    expect(error).not.toBeNull();
  });

  it("should prevent anon users from updating announcements", async () => {
    await anonSupabase
      .from("announcements")
      .update({ title: "Hacked Title" })
      .eq("id", testAnnouncement.id);

    // Verify it was not updated
    const { data } = await adminSupabase
      .from("announcements")
      .select("title")
      .eq("id", testAnnouncement.id)
      .single();
    expect(data?.title).toBe("Test Announcement");
  });

  it("should prevent anon users from deleting announcements", async () => {
    await anonSupabase
      .from("announcements")
      .delete()
      .eq("id", testAnnouncement.id);

    // Verify it still exists
    const { data } = await adminSupabase
      .from("announcements")
      .select("id")
      .eq("id", testAnnouncement.id)
      .single();
    expect(data).toBeDefined();
    expect(data?.id).toBe(testAnnouncement.id);
  });
});
