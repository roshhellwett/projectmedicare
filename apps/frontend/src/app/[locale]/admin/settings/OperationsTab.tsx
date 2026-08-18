"use client";

import { useState, useTransition } from "react";
import { updateGlobalSettings } from "@/lib/actions/settings";
import { Save, Loader2 } from "lucide-react";
import { showToast } from "@/components/Toast";

export default function OperationsTab({ settings }: { settings: any }) {
  const [isPending, startTransition] = useTransition();
  
  const [form, setForm] = useState({
    invoice_prefix: settings.invoice_prefix || "INV-",
    invoice_terms: settings.invoice_terms || "",
    default_gst_percent: settings.default_gst_percent || "5",
    online_ordering_enabled: settings.online_ordering_enabled === "true" || settings.online_ordering_enabled === true,
    flat_delivery_charge: settings.flat_delivery_charge || "50",
    free_delivery_min: settings.free_delivery_min || "500",
    low_stock_threshold: settings.low_stock_threshold || "3",
    global_discount_active: settings.global_discount_active === "true" || settings.global_discount_active === true,
    global_discount_name: settings.global_discount_name || "Festival Offer",
    global_discount_percent: settings.global_discount_percent || "10",
    global_discount_start: settings.global_discount_start || "",
    global_discount_end: settings.global_discount_end || "",
  });

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateGlobalSettings(form);
        showToast("Operations settings updated successfully");
      } catch (e: any) {
        showToast(e.message, "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-lg mb-4 text-primary-deep border-b border-line pb-2">Global Discount</h3>
        <p className="text-sm text-muted mb-4">Set a global discount that applies to all POS invoices. Automatically expires after the end date.</p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 flex items-center justify-between bg-primary-soft/30 p-4 rounded-xl border border-primary/20">
            <div>
              <p className="font-bold">Enable Global Discount</p>
              <p className="text-xs text-muted">Turn the discount on or off instantly.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.global_discount_active} onChange={e => setForm({...form, global_discount_active: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div>
            <label className="label">Discount Name</label>
            <input type="text" value={form.global_discount_name} onChange={e => setForm({...form, global_discount_name: e.target.value})} className="admin-input" placeholder="e.g. Diwali Special" />
          </div>
          <div>
            <label className="label">Discount Percentage (%)</label>
            <input type="number" value={form.global_discount_percent} onChange={e => setForm({...form, global_discount_percent: e.target.value})} className="admin-input" />
          </div>
          <div>
            <label className="label">Start Date & Time (Optional)</label>
            <input type="datetime-local" value={form.global_discount_start} onChange={e => setForm({...form, global_discount_start: e.target.value})} className="admin-input" />
          </div>
          <div>
            <label className="label">End Date & Time (Optional)</label>
            <input type="datetime-local" value={form.global_discount_end} onChange={e => setForm({...form, global_discount_end: e.target.value})} className="admin-input" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-lg mb-4 text-primary-deep border-b border-line pb-2">Billing & POS</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Invoice Prefix</label>
            <input type="text" value={form.invoice_prefix} onChange={e => setForm({...form, invoice_prefix: e.target.value})} className="admin-input" />
          </div>
          <div>
            <label className="label">Default GST (%) for New Medicines</label>
            <input type="number" value={form.default_gst_percent} onChange={e => setForm({...form, default_gst_percent: e.target.value})} className="admin-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Invoice Footer Terms & Conditions</label>
            <textarea value={form.invoice_terms} onChange={e => setForm({...form, invoice_terms: e.target.value})} className="admin-input min-h-[80px]" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-lg mb-4 text-primary-deep border-b border-line pb-2">Online Operations</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 flex items-center justify-between bg-accent-soft/30 p-4 rounded-xl border border-accent/20">
            <div>
              <p className="font-bold">Accept Online Orders</p>
              <p className="text-xs text-muted">Toggle to disable incoming online orders (Medicine Requests & Packages).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.online_ordering_enabled} onChange={e => setForm({...form, online_ordering_enabled: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
          <div>
            <label className="label">Flat Delivery Charge (₹)</label>
            <input type="number" value={form.flat_delivery_charge} onChange={e => setForm({...form, flat_delivery_charge: e.target.value})} className="admin-input" />
          </div>
          <div>
            <label className="label">Free Delivery Minimum Order (₹)</label>
            <input type="number" value={form.free_delivery_min} onChange={e => setForm({...form, free_delivery_min: e.target.value})} className="admin-input" />
          </div>
        </div>

        <h3 className="font-bold text-lg mb-4 mt-8 text-primary-deep border-b border-line pb-2">Inventory Alerts</h3>
        <p className="text-sm text-muted mb-4">Configure thresholds for the low stock & expiry alerts dashboard.</p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Low Stock Threshold</label>
            <input 
              type="number" 
              value={form.low_stock_threshold} 
              onChange={e => setForm({...form, low_stock_threshold: e.target.value})} 
              className="admin-input" 
              placeholder="e.g. 3" 
            />
            <p className="text-xs text-muted mt-1">Batches with stock at or below this value will be flagged.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={handleSave} disabled={isPending} className="btn btn-primary">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Operations Settings
        </button>
      </div>
    </div>
  );
}
