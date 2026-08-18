import PageHeader from "@/components/PageHeader";
import AdminPOS from "@/components/AdminPOS";
import { MonitorSmartphone } from "lucide-react";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export default async function AdminPOSPage() {
  const locale = await getLocale();

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const client = createAdminClient();
  
  let globalSettings: Record<string, string> = {};
  let stores: any[] = [];
  
  if (client) {
    const [settingsRes, storesRes] = await Promise.all([
      client.from("global_settings").select("key, value"),
      client.from("pharmacy_stores").select("*").order("name")
    ]);
    
    if (settingsRes.data) {
      settingsRes.data.forEach(s => {
        globalSettings[s.key] = s.value;
      });
    }
    
    if (storesRes.data) {
      stores = storesRes.data;
    }
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-6">
        <Link
          href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <PageHeader
        eyebrow="Point of Sale"
        eyebrowIcon={<MonitorSmartphone className="h-4 w-4" />}
        title="POS & Billing"
        sub="Scan barcodes to add items to the bill, check stock, and generate invoices."
      />

      <AdminPOS globalSettings={globalSettings} dbStores={stores} />
    </div>
  );
}
