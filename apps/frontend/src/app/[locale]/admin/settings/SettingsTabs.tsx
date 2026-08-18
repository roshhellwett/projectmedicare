"use client";

import { useState } from "react";
import SettingsClient from "./SettingsClient";
import StoreProfileTab from "./StoreProfileTab";
import OperationsTab from "./OperationsTab";
import StaffAccountsTab from "./StaffAccountsTab";
import SEOTab from "./SEOTab";
import { Store, Settings2, Users, Search, Key } from "lucide-react";

export default function SettingsTabs({
  initialKeys,
  initialGlobalSettings,
  initialStores,
  initialStaff,
}: {
  initialKeys: any[];
  initialGlobalSettings: any;
  initialStores: any[];
  initialStaff: any[];
}) {
  const [activeTab, setActiveTab] = useState("operations");

  const TABS = [
    { id: "operations", label: "Operations & Billing", icon: Settings2 },
    { id: "stores", label: "Store Profiles", icon: Store },
    { id: "seo", label: "SEO Metadata", icon: Search },
    { id: "staff", label: "Staff Accounts", icon: Users },
    { id: "keys", label: "API Keys", icon: Key },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-line gap-2 pb-px no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground hover:border-line"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2 animate-fade-in">
        {activeTab === "operations" && <OperationsTab settings={initialGlobalSettings} />}
        {activeTab === "stores" && <StoreProfileTab stores={initialStores} />}
        {activeTab === "seo" && <SEOTab settings={initialGlobalSettings} />}
        {activeTab === "staff" && <StaffAccountsTab staff={initialStaff} />}
        {activeTab === "keys" && <SettingsClient keys={initialKeys} />}
      </div>
    </div>
  );
}
