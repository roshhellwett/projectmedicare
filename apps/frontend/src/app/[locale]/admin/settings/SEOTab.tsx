"use client";

import { useState, useTransition } from "react";
import { updateGlobalSettings } from "@/lib/actions/settings";
import { Save, Loader2 } from "lucide-react";
import { showToast } from "@/components/Toast";

export default function SEOTab({ settings }: { settings: any }) {
  const [isPending, startTransition] = useTransition();
  
  const [form, setForm] = useState({
    seo_title: settings.seo_title || "Janta Medicare LLP",
    seo_description: settings.seo_description || "Your trusted neighborhood pharmacy.",
  });

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateGlobalSettings(form);
        showToast("SEO settings updated successfully");
      } catch (e: any) {
        showToast(e.message, "error");
      }
    });
  };

  return (
    <div className="card space-y-6">
      <h3 className="font-bold text-lg mb-2 text-primary-deep border-b border-line pb-2">Global SEO Metadata</h3>
      <p className="text-sm text-muted">Update the title and description that appear in Google Search and when sharing your website on WhatsApp/Facebook.</p>
      
      <div className="grid gap-4">
        <div>
          <label className="label">Homepage Title (Max 60 chars)</label>
          <input type="text" value={form.seo_title} onChange={e => setForm({...form, seo_title: e.target.value})} className="admin-input" placeholder="e.g. Best Pharmacy in Kolkata | Janta Medicare" />
          <p className="text-xs text-muted text-right mt-1">{form.seo_title.length}/60</p>
        </div>
        <div>
          <label className="label">Homepage Meta Description (Max 160 chars)</label>
          <textarea value={form.seo_description} onChange={e => setForm({...form, seo_description: e.target.value})} className="admin-input min-h-[100px]" placeholder="Briefly describe your services..." />
          <p className="text-xs text-muted text-right mt-1">{form.seo_description.length}/160</p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} disabled={isPending} className="btn btn-primary">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save SEO Settings
        </button>
      </div>
    </div>
  );
}
