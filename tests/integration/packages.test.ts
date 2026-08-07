import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Packages Integration Tests", () => {
  let testPackage = null;
  let testStore = null;
  let testOrder = null;

  beforeAll(async () => {
    // 1. Create a Package
    const pRes = await adminSupabase
      .from("packages")
      .insert({
        name: "Test Package Booking",
        tests: ["Test 1"],
        market_price: 100,
        janta_price: 50,
      })
      .select()
      .single();
    if (pRes.error) throw new Error(pRes.error.message);
    testPackage = pRes.data;

    // 2. Create a Store
    const sRes = await adminSupabase
      .from("pharmacy_stores")
      .insert({
        name: "Booking Test Store",
        address: "123 Test",
        phone: "9999999999",
        lat: 0,
        lng: 0,
      })
      .select()
      .single();
    if (sRes.error) throw new Error(sRes.error.message);
    testStore = sRes.data;
  });

  afterAll(async () => {
    if (testOrder)
      await adminSupabase
        .from("package_orders")
        .delete()
        .eq("id", testOrder.id);
    if (testPackage)
      await adminSupabase.from("packages").delete().eq("id", testPackage.id);
    if (testStore)
      await adminSupabase
        .from("pharmacy_stores")
        .delete()
        .eq("id", testStore.id);
  });

  it("should allow public to read packages", async () => {
    const { data, error } = await anonSupabase
      .from("packages")
      .select("*")
      .eq("id", testPackage.id);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("should allow anonymous user to insert a package order (since API uses service_role, wait... direct supabase insert fails)", async () => {
    // Frontend uses server action which uses admin client to bypass RLS for inserts
    // So direct anon insert should fail
    const { error } = await anonSupabase.from("package_orders").insert({
      customer_name: "Test User",
      phone_number: "9999999999",
      package_id: testPackage.id,
      store_id: testStore.id,
      status: "pending",
    });
    expect(error).not.toBeNull();
  });
});
