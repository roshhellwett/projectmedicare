import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Content Tables Tests (Camp Posts & Bulletins)", () => {
  let activeCamp = null;
  let inactiveCamp = null;
  let visibleBulletin = null;
  let expiredBulletin = null;

  beforeAll(async () => {
    // 0. Clean up existing active camps (from seed data)
    await adminSupabase.from("camp_posts").delete().eq("is_active", true);

    // 1. Create one active camp
    const c1 = await adminSupabase
      .from("camp_posts")
      .insert({
        title: "Active Camp",
        description: "Desc",
        venue: "Venue",
        address: "Address",
        camp_date: "2030-01-01",
        fee: "Free",
        is_active: true,
      })
      .select()
      .single();
    if (c1.error) throw new Error(c1.error.message);
    activeCamp = c1.data;

    // 2. Create one inactive camp
    const c2 = await adminSupabase
      .from("camp_posts")
      .insert({
        title: "Inactive Camp",
        description: "Desc",
        venue: "Venue",
        address: "Address",
        camp_date: "2020-01-01",
        fee: "Free",
        is_active: false,
      })
      .select()
      .single();
    if (c2.error) throw new Error(c2.error.message);
    inactiveCamp = c2.data;

    // 3. Create a visible bulletin
    const b1 = await adminSupabase
      .from("bulletins")
      .insert({
        body: "Visible Bulletin",
        kind: "info",
      })
      .select()
      .single();
    if (b1.error) throw new Error(b1.error.message);
    visibleBulletin = b1.data;

    // 4. Create an expired bulletin
    const b2 = await adminSupabase
      .from("bulletins")
      .insert({
        body: "Expired Bulletin",
        kind: "info",
        ends_at: new Date(Date.now() - 100000).toISOString(), // Past
      })
      .select()
      .single();
    if (b2.error) throw new Error(b2.error.message);
    expiredBulletin = b2.data;
  });

  afterAll(async () => {
    if (activeCamp)
      await adminSupabase.from("camp_posts").delete().eq("id", activeCamp.id);
    if (inactiveCamp)
      await adminSupabase.from("camp_posts").delete().eq("id", inactiveCamp.id);
    if (visibleBulletin)
      await adminSupabase
        .from("bulletins")
        .delete()
        .eq("id", visibleBulletin.id);
    if (expiredBulletin)
      await adminSupabase
        .from("bulletins")
        .delete()
        .eq("id", expiredBulletin.id);
  });

  describe("Camp Posts", () => {
    it("should prevent inserting a second active camp post (unique constraint)", async () => {
      const { error } = await adminSupabase.from("camp_posts").insert({
        title: "Another Active Camp",
        description: "Desc",
        venue: "Venue",
        address: "Address",
        camp_date: "2031-01-01",
        fee: "Free",
        is_active: true,
      });
      // Should fail due to camp_posts_single_active unique index
      expect(error).not.toBeNull();
      expect(error.code).toBe("23505"); // unique_violation
    });

    it("should allow public to read ONLY active camp posts", async () => {
      const { data, error } = await anonSupabase
        .from("camp_posts")
        .select("id")
        .in("id", [activeCamp.id, inactiveCamp.id]);
      expect(error).toBeNull();
      // Should only see the active one
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(activeCamp.id);
    });
  });

  describe("Bulletins", () => {
    it("should allow public to read ONLY visible bulletins", async () => {
      const { data, error } = await anonSupabase
        .from("bulletins")
        .select("id")
        .in("id", [visibleBulletin.id, expiredBulletin.id]);
      expect(error).toBeNull();
      // Should only see the visible one due to RLS `ends_at > now()`
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(visibleBulletin.id);
    });
  });
});
