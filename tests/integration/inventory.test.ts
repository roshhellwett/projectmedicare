import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Inventory (Medicine Batches) Tests", () => {
  let testMedicine = null;
  let testBatch = null;

  beforeAll(async () => {
    // 1. Create a base medicine first
    const medRes = await adminSupabase
      .from("medicines")
      .insert({
        id: Math.floor(Math.random() * 1000000) + 10000,
        s_no: Math.floor(Math.random() * 1000000),
        medicine_name: "Test Medicine Inventory",
        pack_size: "10 Tabs",
        gst: 5,
      })
      .select()
      .single();
    if (medRes.error) throw new Error(medRes.error.message);
    testMedicine = medRes.data;

    // 2. Insert a test batch for this medicine
    const batchRes = await adminSupabase
      .from("medicine_batches")
      .insert({
        medicine_id: testMedicine.id,
        barcode: `INV-${Date.now()}`,
        batch_number: "BATCH-888",
        expiry_date: "12-2029",
        buying_price: 50.0,
        selling_price: 60.0,
        mrp: 70.0,
        stock: 100,
      })
      .select()
      .single();
    if (batchRes.error) throw new Error(batchRes.error.message);
    testBatch = batchRes.data;
  });

  afterAll(async () => {
    // Cascade delete handles batches when medicine is deleted
    if (testMedicine)
      await adminSupabase.from("medicines").delete().eq("id", testMedicine.id);
  });

  it("should allow anon users to read medicine batches", async () => {
    const { data, error } = await anonSupabase
      .from("medicine_batches")
      .select("*")
      .eq("id", testBatch.id);
      
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0].barcode).toMatch(/^INV-/);
    expect(data[0].stock).toBe(100);
  });

  it("should reject anon users from inserting medicine batches", async () => {
    const { error } = await anonSupabase.from("medicine_batches").insert({
      medicine_id: testMedicine.id,
      barcode: "HACKER-BARCODE",
      stock: 50,
    });
    
    // RLS should deny this
    expect(error).not.toBeNull();
  });
  
  it("should reject anon users from updating stock", async () => {
    const { error } = await anonSupabase
      .from("medicine_batches")
      .update({ stock: 500 })
      .eq("id", testBatch.id);
      
    // RLS should deny this (or at least no rows updated)
    // Supabase JS sometimes returns null error but 0 rows if RLS blocks update
    // Let's verify stock is still 100
    const { data } = await adminSupabase.from("medicine_batches").select("stock").eq("id", testBatch.id).single();
    expect(data.stock).toBe(100);
  });
});
