import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Bulletins (Products & Offers) Integration Tests", () => {
  let testProduct = null;
  let testOffer = null;

  beforeAll(async () => {
    // 1. Create a Product
    const pRes = await adminSupabase
      .from("bulletins")
      .insert({
        body: "Test Product",
        kind: "product",
        pinned: true,
      })
      .select()
      .single();
    if (pRes.error) throw new Error(pRes.error.message);
    testProduct = pRes.data;

    // 2. Create an Offer
    const oRes = await adminSupabase
      .from("bulletins")
      .insert({
        body: "Test Offer",
        kind: "offer",
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      })
      .select()
      .single();
    if (oRes.error) throw new Error(oRes.error.message);
    testOffer = oRes.data;
  });

  afterAll(async () => {
    if (testProduct)
      await adminSupabase.from("bulletins").delete().eq("id", testProduct.id);
    if (testOffer)
      await adminSupabase.from("bulletins").delete().eq("id", testOffer.id);
  });

  it("should allow public to read active products and offers", async () => {
    const { data, error } = await anonSupabase
      .from("bulletins")
      .select("*")
      .in("id", [testProduct.id, testOffer.id]);

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
  });

  it("should enforce RLS to prevent public from inserting bulletins", async () => {
    const { error } = await anonSupabase.from("bulletins").insert({
      body: "Hacked Bulletin",
      kind: "product",
    });

    expect(error).not.toBeNull();
  });
});
