import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

describe("POS and Invoicing Tests", () => {
  let testMedicine = null;
  let testBatch = null;
  let prefixSetting = "TEST-";

  beforeAll(async () => {
    const medRes = await adminSupabase
      .from("medicines")
      .insert({
        id: Math.floor(Math.random() * 1000000) + 10000,
        s_no: Math.floor(Math.random() * 1000000),
        medicine_name: "Test Medicine POS",
        pack_size: "10 Tabs",
        gst: 10,
      })
      .select()
      .single();
    if (medRes.error) throw new Error(medRes.error.message);
    testMedicine = medRes.data;

    const batchRes = await adminSupabase
      .from("medicine_batches")
      .insert({
        medicine_id: testMedicine.id,
        barcode: `POS-${Date.now()}`,
        batch_number: "BATCH-POS",
        buying_price: 10.0,
        selling_price: 20.0,
        mrp: 30.0,
        stock: 50, // Starting stock
      })
      .select()
      .single();
    if (batchRes.error) throw new Error(batchRes.error.message);
    testBatch = batchRes.data;

    // Set custom prefix in global_settings
    await adminSupabase.from("global_settings").upsert({
      key: "invoice_prefix",
      value: '"TEST-"'
    });
  });

  afterAll(async () => {
    // Delete medicine (cascades to batches and potentially invoices if configured, else manually clean)
    if (testMedicine) {
      await adminSupabase.from("medicines").delete().eq("id", testMedicine.id);
    }
  });

  it("should successfully create an invoice and deduct stock with custom prefix", async () => {
    // Generate valid session token
    const { createSessionToken } = await import("../../apps/frontend/src/lib/auth/session");
    const adminSession = createSessionToken("admin_user", "ADMIN");
    const adminCookie = `jm_admin_session=${adminSession.token}`;

    const res = await fetch("http://127.0.0.1:3000/api/admin/pos", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Cookie: adminCookie
      },
      body: JSON.stringify({
        patient_name: "Test Patient",
        doctor_name: "Test Doc",
        discount: 0,
        items: [
          {
            batch_id: testBatch.id,
            quantity: 10,
            rate: 20.0,
            gst_percent: 10,
            gst_amount: 2.0,
            amount: 22.0
          }
        ]
      })
    });

    const json = await res.json();
    expect(res.ok).toBe(true);
    expect(json.invoice_no).toContain("TEST-");
    // Verify stock was deducted (50 - 10 = 40)
    const { data: batchCheck } = await adminSupabase
      .from("medicine_batches")
      .select("stock")
      .eq("id", testBatch.id)
      .single();
      
    expect(batchCheck.stock).toBe(40);
  });

  it("should throw error and rollback if requested quantity exceeds stock", async () => {
    const invoiceNo = `TEST-INV-OVER-${Date.now()}`;
    const { error } = await adminSupabase.rpc("create_invoice", {
      p_invoice_no: invoiceNo,
      p_patient_name: "Greedy Patient",
      p_patient_phone: "9999999999",
      p_doctor_name: "None",
      p_subtotal: 100,
      p_gst_total: 10,
      p_discount: 0,
      p_net_amount: 110,
      p_items: [
        {
          batch_id: testBatch.id,
          quantity: 100, // We only have 40 left!
          rate: 20.0,
          gst_percent: 10,
          gst_amount: 2.0,
          amount: 22.0
        }
      ],
      p_store_id: null
    });

    // Should error out
    expect(error).not.toBeNull();
    expect(error.message).toContain("Insufficient stock");

    // Verify stock was NOT deducted (should still be 40)
    const { data: batchCheck } = await adminSupabase
      .from("medicine_batches")
      .select("stock")
      .eq("id", testBatch.id)
      .single();
      
    expect(batchCheck.stock).toBe(40);
  });
});
