import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth/guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  
  try {
    const body = await req.json();
    const client = createAdminClient();
    if (!client) throw new Error("Supabase not configured");

    // Expected shape: { patient_name, doctor_name, items: [{ batch_id, quantity, rate, gst_percent, gst_amount, amount }] }
    
    // Fetch custom invoice prefix from global_settings
    const { data: prefixData } = await client.from("global_settings").select("value").eq("key", "invoice_prefix").single();
    let prefix = "INV-";
    if (prefixData && prefixData.value) {
        prefix = typeof prefixData.value === 'string' ? prefixData.value : String(prefixData.value);
        // Clean up quotes if present in jsonb
        prefix = prefix.replace(/^"/, "").replace(/"$/, "");
    }
    
    // Auto-generate invoice number if missing
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoice_no = `${prefix}${dateStr}-${randomSuffix}`;
    
    // Calculate totals on the server just in case
    let subtotal = 0;
    let gst_total = 0;
    let net_amount = 0;
    
    body.items.forEach((item: any) => {
        subtotal += Number(item.rate) * Number(item.quantity);
        gst_total += Number(item.gst_amount);
        net_amount += Number(item.amount);
    });

    const cookieStore = await cookies();
    const storeCookie = cookieStore.get("admin_store_id");
    const storeId = storeCookie?.value || null;

    const { data: invoiceId, error } = await client.rpc("create_invoice", {
        p_invoice_no: invoice_no,
        p_patient_name: body.patient_name || null,
        p_patient_phone: body.patient_phone || null,
        p_doctor_name: body.doctor_name || null,
        p_subtotal: subtotal,
        p_gst_total: gst_total,
        p_discount: Number(body.discount) || 0,
        p_net_amount: net_amount - (Number(body.discount) || 0),
        p_items: body.items,
        p_store_id: storeId,
    });

    if (error) {
        throw new Error(error.message);
    }
      
    revalidateTag("medicines", { expire: 0 });
    revalidateTag("stats", { expire: 0 });
    return NextResponse.json({ 
        ok: true, 
        invoiceId, 
        invoice_no, 
        store_id: storeId,
        date: new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
