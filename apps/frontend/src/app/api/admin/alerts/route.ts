import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";

function db(write: boolean) {
  const client = write
    ? createAdminClient()
    : (createAdminClient() ?? createPublicClient());
  if (!client) throw new Error("Supabase is not configured on the server.");
  return client;
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  
  try {
    const client = db(false);
    
    // Get low_stock_threshold from global_settings
    const { data: settingsData } = await client.from("global_settings").select("key, value").eq("key", "low_stock_threshold").single();
    const threshold = settingsData ? Number(settingsData.value) || 3 : 3;

    // Fetch all batches (handling >1000 rows limit)
    let allBatches: any[] = [];
    let from = 0;
    const step = 1000;
    
    while (true) {
        const { data, error } = await client
            .from("medicine_batches")
            .select("id, medicine_id, barcode, batch_number, expiry_date, stock, medicines!inner(medicine_name, pack_size)")
            .range(from, from + step - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        if (!data || data.length === 0) break;
        allBatches.push(...data);
        
        if (data.length < step) break;
        from += step;
    }

    // Current date for expiry comparison (MM/YY format)
    const now = new Date();
    const currentYear = now.getFullYear() % 100; // last two digits
    const currentMonth = now.getMonth() + 1; // 1-12

    const alerts = allBatches.map((row: any) => {
        let isExpired = false;
        
        // Parse expiry_date (MM/YY)
        if (row.expiry_date && row.expiry_date.includes("/")) {
            const [mm, yy] = row.expiry_date.split("/");
            const month = parseInt(mm, 10);
            const year = parseInt(yy, 10);
            
            if (!isNaN(month) && !isNaN(year)) {
                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    isExpired = true;
                }
            }
        }
        
        const isLowStock = row.stock <= threshold;
        
        return {
            ...row,
            medicine_name: row.medicine_name || (row.medicines as any)?.medicine_name,
            pack_size: row.pack_size || (row.medicines as any)?.pack_size,
            isExpired,
            isLowStock
        };
    }).filter((item: any) => item.isExpired || item.isLowStock);
    
    // Sort by expired first, then low stock
    alerts.sort((a: any, b: any) => {
        if (a.isExpired && !b.isExpired) return -1;
        if (!a.isExpired && b.isExpired) return 1;
        return a.stock - b.stock;
    });

    return NextResponse.json({ alerts, threshold });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
