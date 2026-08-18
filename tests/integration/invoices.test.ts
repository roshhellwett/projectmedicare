import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

describe("Invoice Cancellation Tests", () => {
  let testMedicine = null;
  let testBatch = null;
  let invoiceId = null;

  beforeAll(async () => {
    const medRes = await adminSupabase
      .from("medicines")
      .insert({
        id: Math.floor(Math.random() * 1000000) + 10000,
        s_no: Math.floor(Math.random() * 1000000),
        medicine_name: "Test Medicine Invoice",
        pack_size: "10 Tabs",
        gst: 0,
      })
      .select()
      .single();
    if (medRes.error) throw new Error(medRes.error.message);
    testMedicine = medRes.data;

    const batchRes = await adminSupabase
      .from("medicine_batches")
      .insert({
        medicine_id: testMedicine.id,
        barcode: `CANC-${Date.now()}`,
        batch_number: "BATCH-CANC",
        buying_price: 10.0,
        selling_price: 20.0,
        mrp: 30.0,
        stock: 50, // Starting stock
      })
      .select()
      .single();
    if (batchRes.error) throw new Error(batchRes.error.message);
    testBatch = batchRes.data;

    // Create a mock invoice that deducted 15 items
    const { data: invId, error: invError } = await adminSupabase.rpc("create_invoice", {
        p_invoice_no: `INV-CANC-${Date.now()}`,
        p_patient_name: "Test",
        p_patient_phone: "9999999999",
        p_doctor_name: "Test",
        p_subtotal: 300,
        p_gst_total: 0,
        p_discount: 0,
        p_net_amount: 300,
        p_items: [
          {
            batch_id: testBatch.id,
            quantity: 15, // Will deduct 15, stock becomes 35
            rate: 20.0,
            gst_percent: 0,
            gst_amount: 0,
            amount: 300.0
          }
        ],
        p_store_id: null
      });
      
    if (invError) throw new Error(invError.message);
    invoiceId = invId;
  });

  afterAll(async () => {
    // Delete medicine (cascades to batches and potentially invoices if configured, else manually clean)
    if (testMedicine) {
      await adminSupabase.from("medicines").delete().eq("id", testMedicine.id);
    }
  });

  it("should successfully cancel an invoice and restore stock", async () => {
    // 1. Verify stock is currently 35 (50 - 15)
    let { data: batchCheck } = await adminSupabase
      .from("medicine_batches")
      .select("stock")
      .eq("id", testBatch.id)
      .single();
    expect(batchCheck.stock).toBe(35);

    // 2. Call cancel_invoice RPC
    const { error } = await adminSupabase.rpc("cancel_invoice", {
        p_invoice_id: invoiceId
    });
    expect(error).toBeNull();

    // 3. Verify stock is restored to 50
    const { data: batchRestored } = await adminSupabase
      .from("medicine_batches")
      .select("stock")
      .eq("id", testBatch.id)
      .single();
    expect(batchRestored.stock).toBe(50);

    // 4. Verify invoice status is 'cancelled'
    const { data: invoiceData } = await adminSupabase
      .from("invoices")
      .select("status")
      .eq("id", invoiceId)
      .single();
    expect(invoiceData.status).toBe("cancelled");
  });

  it("should fail if trying to cancel an already cancelled invoice", async () => {
    const { error } = await adminSupabase.rpc("cancel_invoice", {
        p_invoice_id: invoiceId
    });
    
    expect(error).not.toBeNull();
    expect(error.message).toContain("already cancelled");
  });
});
