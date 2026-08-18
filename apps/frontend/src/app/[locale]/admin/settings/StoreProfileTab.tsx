"use client";

import { useState, useTransition } from "react";
import { updatePharmacyStore } from "@/lib/actions/settings";
import { Save, Loader2, Store as StoreIcon } from "lucide-react";
import { showToast } from "@/components/Toast";

export default function StoreProfileTab({ stores }: { stores: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [activeStoreId, setActiveStoreId] = useState(stores[0]?.id || "");
  
  const [storeData, setStoreData] = useState<Record<string, any>>(() => {
    const initial: any = {};
    stores.forEach(s => {
      initial[s.id] = { ...s };
      if (!initial[s.id].contact_numbers) initial[s.id].contact_numbers = [];
    });
    return initial;
  });

  const activeStore = storeData[activeStoreId];

  const handleUpdate = (field: string, value: any) => {
    setStoreData(prev => ({
      ...prev,
      [activeStoreId]: {
        ...prev[activeStoreId],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updatePharmacyStore(activeStoreId, activeStore);
        showToast("Store profile updated successfully");
      } catch (e: any) {
        showToast(e.message, "error");
      }
    });
  };

  if (!activeStore) return <div className="p-8 text-center text-muted">No stores found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 space-y-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-muted px-2 mb-3">Select Store</h3>
        {stores.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveStoreId(s.id)}
            className={`w-full flex items-center gap-2 text-left px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              activeStoreId === s.id ? "bg-primary text-white shadow-md" : "bg-surface hover:bg-surface-muted text-foreground/80"
            }`}
          >
            <StoreIcon className="h-4 w-4" />
            {s.name}
          </button>
        ))}
      </div>

      <div className="md:col-span-3 card">
        <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
          <h3 className="font-bold text-xl text-primary-deep">{activeStore.name} Profile</h3>
          <button onClick={handleSave} disabled={isPending} className="btn btn-primary btn-sm">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Store Name</label>
            <input type="text" value={activeStore.name || ""} onChange={e => handleUpdate('name', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="label">Legal Entity Name</label>
            <input type="text" value={activeStore.legal_name || ""} onChange={e => handleUpdate('legal_name', e.target.value)} className="admin-input" placeholder="e.g. Janta Medicare LLP" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Full Address</label>
            <textarea value={activeStore.address || ""} onChange={e => handleUpdate('address', e.target.value)} className="admin-input min-h-[80px]" />
          </div>
          <div>
            <label className="label">Primary Phone</label>
            <input type="text" value={activeStore.phone || ""} onChange={e => handleUpdate('phone', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="label">GST Number</label>
            <input type="text" value={activeStore.gst_number || ""} onChange={e => handleUpdate('gst_number', e.target.value)} className="admin-input uppercase" />
          </div>
          <div>
            <label className="label">Operating Hours</label>
            <input type="text" value={activeStore.operating_hours || ""} onChange={e => handleUpdate('operating_hours', e.target.value)} className="admin-input" placeholder="e.g. 10:00 AM - 10:00 PM" />
          </div>
          <div>
            <label className="label">Google Maps URL</label>
            <input type="url" value={activeStore.directions_url || ""} onChange={e => handleUpdate('directions_url', e.target.value)} className="admin-input" />
          </div>
        </div>
      </div>
    </div>
  );
}
