import { setRequestLocale } from "next-intl/server";
import { getEnvKeys } from "@/lib/actions/settings";
import PageHeader from "@/components/PageHeader";
import { Settings } from "lucide-react";
import SettingsTabs from "./SettingsTabs";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings & Configuration — Janta Medicare Admin",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const client = createAdminClient();

  // Fetch all data
  let keys: any[] = [];
  let globalSettings: any = {};
  let stores: any[] = [];
  let staff: any[] = [];

  try {
    keys = await getEnvKeys();
    
    if (client) {
      const [settingsRes, storesRes, staffRes] = await Promise.all([
        client.from("global_settings").select("*"),
        client.from("pharmacy_stores").select("*").order("name"),
        client.from("admin_users").select("id, username, role, created_at").order("created_at")
      ]);
      
      if (settingsRes.data) {
        settingsRes.data.forEach(s => {
          globalSettings[s.key] = s.value;
        });
      }
      if (storesRes.data) stores = storesRes.data;
      if (staffRes.data) staff = staffRes.data;
    }
  } catch (err) {
    // Expected to throw "Unauthorized" during testing or if unauthenticated
  }

  return (
    <div className="container py-8 md:py-12">
      <PageHeader
        eyebrow="System Configuration"
        eyebrowIcon={<Settings className="h-4 w-4" />}
        title="Settings & Configurations"
        sub="Manage stores, staff roles, billing operations, and system integrations."
      />

      <div className="mt-8">
        <SettingsTabs 
          initialKeys={keys} 
          initialGlobalSettings={globalSettings} 
          initialStores={stores} 
          initialStaff={staff} 
        />
      </div>
    </div>
  );
}
