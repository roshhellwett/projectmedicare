import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createSessionToken } from "../../apps/frontend/src/lib/auth/session";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const API_BASE = "http://127.0.0.1:3000/api";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

describe("Alerts API Tests", () => {
  let testMedicine = null;
  let batches = [];
  let adminCookie = "";

  beforeAll(async () => {
    // Generate valid session tokens for testing
    const adminSession = createSessionToken("admin_user", "ADMIN");
    adminCookie = `jm_admin_session=${adminSession.token}`;

    const medRes = await adminSupabase
      .from("medicines")
      .insert({
        id: Math.floor(Math.random() * 1000000) + 20000,
        s_no: Math.floor(Math.random() * 1000000),
        medicine_name: "Test Medicine Alerts",
        pack_size: "10 Tabs",
        gst: 10,
      })
      .select()
      .single();
    if (medRes.error) throw new Error(medRes.error.message);
    testMedicine = medRes.data;

    // Normal Batch
    const b1 = await adminSupabase.from("medicine_batches").insert({
      medicine_id: testMedicine.id,
      batch_number: "BATCH-NORMAL",
      stock: 50,
      expiry_date: "12/99", // Way in the future
      buying_price: 10, selling_price: 20, mrp: 30
    }).select().single();
    if (b1.error) throw new Error("Normal batch insert failed: " + b1.error.message);
    batches.push(b1.data);

    // Low Stock Batch
    const b2 = await adminSupabase.from("medicine_batches").insert({
      medicine_id: testMedicine.id,
      batch_number: "BATCH-LOW",
      stock: 0, // 0 is always below any threshold
      expiry_date: "12/99",
      buying_price: 10, selling_price: 20, mrp: 30
    }).select().single();
    if (b2.error) throw new Error("Low batch insert failed: " + b2.error.message);
    batches.push(b2.data);

    // Expired Batch
    const b3 = await adminSupabase.from("medicine_batches").insert({
      medicine_id: testMedicine.id,
      batch_number: "BATCH-EXPIRED",
      stock: 50, 
      expiry_date: "01/20", // Past
      buying_price: 10, selling_price: 20, mrp: 30
    }).select().single();
    if (b3.error) throw new Error("Expired batch insert failed: " + b3.error.message);
    batches.push(b3.data);
  });

  afterAll(async () => {
    if (testMedicine) {
      await adminSupabase.from("medicines").delete().eq("id", testMedicine.id);
    }
  });

  it("should return low stock and expired batches but not normal batches", async () => {
    const res = await fetch(`${API_BASE}/admin/alerts`, {
      headers: { Cookie: adminCookie },
    });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    
    const returnedAlerts = json.alerts || [];
    console.log("RETURNED ALERTS:", returnedAlerts);
    
    // BATCH-NORMAL should NOT be in the results
    const normal = returnedAlerts.find(a => a.batch_number === "BATCH-NORMAL");
    expect(normal).toBeUndefined();

    // BATCH-LOW should be in the results and flagged as low stock
    const low = returnedAlerts.find(a => a.batch_number === "BATCH-LOW");
    expect(low).toBeDefined();
    expect(low.isLowStock).toBe(true);

    // BATCH-EXPIRED should be in the results and flagged as expired
    const expired = returnedAlerts.find(a => a.batch_number === "BATCH-EXPIRED");
    expect(expired).toBeDefined();
    expect(expired.isExpired).toBe(true);
  });
});
