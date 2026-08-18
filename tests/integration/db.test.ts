import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

// The local supabase URL and service key
// These are standard defaults for local supabase
const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Database Integration Tests", () => {
  describe("RLS Tests", () => {
    it("should allow public to read packages but not modify them", async () => {
      // 1. Can read packages
      const { error: readError } = await anonSupabase
        .from("packages")
        .select("*")
        .limit(1);
      expect(readError).toBeNull();

      // 2. Cannot insert packages
      const { error: insertError } = await anonSupabase
        .from("packages")
        .insert({
          name: "Hacker Package",
          market_price: 10,
          janta_price: 10,
        });
      expect(insertError).not.toBeNull();
    });
  });

  describe("Package Orders Race Condition", () => {
    let testOrder = null;
    let testPackage = null;
    let testStore1 = null;
    let testStore2 = null;

    beforeAll(async () => {
      // 1. Create a dummy store 1
      const s1 = await supabase
        .from("pharmacy_stores")
        .insert({
          name: "Test Store 1"
        })
        .select("id")
        .single();
      if (s1.error) throw new Error(s1.error.message);
      testStore1 = s1.data;

      // 2. Create a dummy store 2
      const s2 = await supabase
        .from("pharmacy_stores")
        .insert({
          name: "Test Store 2"
        })
        .select("id")
        .single();
      if (s2.error) throw new Error(s2.error.message);
      testStore2 = s2.data;

      // 3. Create a dummy package
      const p = await supabase
        .from("packages")
        .insert({
          name: "Test Package",
          description: "Test",
          tests: ["A"],
          market_price: 100,
          janta_price: 50,
          is_featured: false,
        })
        .select("id")
        .single();
      if (p.error) throw new Error(p.error.message);
      testPackage = p.data;
    });

    afterAll(async () => {
      // Cleanup
      if (testOrder)
        await supabase.from("package_orders").delete().eq("id", testOrder.id);
      if (testPackage)
        await supabase.from("packages").delete().eq("id", testPackage.id);
      if (testStore1)
        await supabase.from("pharmacy_stores").delete().eq("id", testStore1.id);
      if (testStore2)
        await supabase.from("pharmacy_stores").delete().eq("id", testStore2.id);
    });

    it("should allow only one store to claim an order concurrently", async () => {
      // 1. Insert a pending order (no store_id)
      const orderRes = await supabase
        .from("package_orders")
        .insert({
          customer_name: "John Doe",
          phone_number: "9999999999",
          package_id: testPackage.id,
          status: "pending",
        })
        .select("id")
        .single();

      expect(orderRes.error).toBeNull();
      testOrder = orderRes.data;

      // 2. Simulate two stores trying to claim the order at the EXACT SAME TIME
      // using the atomic update logic: .is("store_id", null)

      const claimOrder = async (storeId) => {
        const { data, error } = await supabase
          .from("package_orders")
          .update({ store_id: storeId, status: "confirmed" }) // We changed this to claim logic
          .is("store_id", null)
          .eq("id", testOrder.id)
          .select("id")
          .maybeSingle();

        if (error || !data) {
          throw new Error("Already claimed");
        }
        return storeId;
      };

      // Run concurrently
      const results = await Promise.allSettled([
        claimOrder(testStore1.id),
        claimOrder(testStore2.id),
      ]);

      // 3. Assertions
      const successfulClaims = results.filter((r) => r.status === "fulfilled");
      const failedClaims = results.filter((r) => r.status === "rejected");

      // EXACTLY one must succeed, and one must fail.
      expect(successfulClaims.length).toBe(1);
      expect(failedClaims.length).toBe(1);

      // Verify the database state shows the correct store_id
      const finalOrder = await supabase
        .from("package_orders")
        .select("store_id")
        .eq("id", testOrder.id)
        .single();
      expect(finalOrder.data.store_id).toBe(successfulClaims[0].value);
    });
  });
});
