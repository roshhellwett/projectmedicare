import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
// Use anon key for public RLS tests
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Medicines and Patient Rates Tests", () => {
  let testMedicine = null;
  let testPatientRate = null;

  beforeAll(async () => {
    // Insert some test data using admin client
    const medRes = await adminSupabase
      .from("medicines")
      .insert({
        s_no: 999,
        medicine_name: "Test Paracetamol",
        selling_price: 15.5,
        pack_size: "10 Tabs",
        mrp: 20.0,
        buying_price: 10.0,
        purchase: 1,
        sale: 1,
        quantity: 100,
        gst: 12,
        expiry_date: "30-10-2027",
        batch_number: "TESTBATCH",
      })
      .select()
      .single();
    if (medRes.error) throw new Error(medRes.error.message);
    testMedicine = medRes.data;

    const rateRes = await adminSupabase
      .from("patient_rates")
      .insert({
        sl_no: 999,
        test_name: "Test Blood Count",
        jm_rate: "Rs. 100",
        vail_name: "Purple",
      })
      .select()
      .single();
    if (rateRes.error) throw new Error(rateRes.error.message);
    testPatientRate = rateRes.data;
  });

  afterAll(async () => {
    if (testMedicine)
      await adminSupabase.from("medicines").delete().eq("id", testMedicine.id);
    if (testPatientRate)
      await adminSupabase
        .from("patient_rates")
        .delete()
        .eq("id", testPatientRate.id);
  });

  describe("Medicines Table", () => {
    it("should allow anon users to read medicines", async () => {
      const { data, error } = await anonSupabase
        .from("medicines")
        .select("*")
        .eq("id", testMedicine.id);
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].medicine_name).toBe("Test Paracetamol");
    });

    it("should reject anon users from inserting medicines", async () => {
      const { error } = await anonSupabase.from("medicines").insert({
        s_no: 1000,
        medicine_name: "Hacker Med",
        selling_price: 10,
        pack_size: "1",
        mrp: 10,
        buying_price: 10.0,
        purchase: 1,
        sale: 1,
        quantity: 100,
        gst: 12,
        expiry_date: "30-10-2027",
        batch_number: "TESTBATCH2",
      });
      // RLS should deny this (either returns empty/no rows affected or explicit RLS error)
      expect(error).not.toBeNull();
      // Usually RLS returns 401 or similar for inserts when denied
    });
  });

  describe("Patient Rates Table", () => {
    it("should allow anon users to read patient rates", async () => {
      const { data, error } = await anonSupabase
        .from("patient_rates")
        .select("*")
        .eq("id", testPatientRate.id);
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].test_name).toBe("Test Blood Count");
    });

    it("should reject anon users from deleting patient rates", async () => {
      const { error } = await anonSupabase
        .from("patient_rates")
        .delete()
        .eq("id", testPatientRate.id);
      expect(error).not.toBeNull();
    });
  });
});
