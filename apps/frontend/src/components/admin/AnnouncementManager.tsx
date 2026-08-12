"use client";

import { useState } from "react";
import { Loader2, Megaphone, Pencil, Plus, Trash2, X } from "lucide-react";
import { showToast } from "@/components/Toast";
import type { Announcement } from "@/lib/db/announcements";
import { formatDateTime } from "@/lib/utils/ist";

type FormState = {
  id: string | null;
  title: string;
  description: string;
  is_active: boolean;
};

const emptyForm = (): FormState => ({
  id: null,
  title: "",
  description: "",
  is_active: true,
});

export default function AnnouncementManager({
  initialItems,
}: {
  initialItems: Announcement[];
}) {
  const [items, setItems] = useState<Announcement[]>(initialItems);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          title: form.title,
          description: form.description,
          is_active: form.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not save");
      }
      const saved = data.announcement as Announcement;
      setItems((prev) => {
        const rest = prev.filter((i) => i.id !== saved.id);
        return [saved, ...rest].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      });
      setForm(emptyForm());
      showToast(form.id ? "Updated successfully" : "Published successfully");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not delete");
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (form.id === id) setForm(emptyForm());
      showToast("Deleted successfully");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Form */}
      <form onSubmit={submit} className="card p-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">
          {form.id ? "Edit Announcement" : "New Announcement"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-muted">
              Title
            </label>
            <input
              type="text"
              required
              maxLength={150}
              placeholder="e.g., Free Sugar Checkup Today!"
              className="input w-full"
              value={form.title}
              onChange={(e) => set(e.target.name as any, e.target.value)}
              name="title"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-muted">
              Description
            </label>
            <textarea
              required
              maxLength={600}
              placeholder="Write the full announcement here..."
              className="input min-h-[100px] w-full resize-y py-3"
              value={form.description}
              onChange={(e) => set(e.target.name as any, e.target.value)}
              name="description"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={form.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
              />
              <div className="peer h-6 w-11 rounded-full bg-line after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
              <span className="ml-3 text-sm font-medium text-foreground">
                Active (Shows on Homepage)
              </span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyForm())}
              className="btn bg-surface hover:bg-surface-muted text-foreground"
            >
              Cancel Edit
            </button>
          )}
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : form.id ? (
              "Save Changes"
            ) : (
              <>
                <Plus className="h-4 w-4" /> Publish Announcement
              </>
            )}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Recent Announcements</h3>
        {items.length === 0 ? (
          <div className="card flex items-center justify-center p-12 text-muted">
            No announcements yet.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`card flex flex-col gap-4 p-5 sm:flex-row sm:items-start ${
                form.id === item.id ? "ring-2 ring-primary" : ""
              } ${!item.is_active ? "opacity-60 grayscale-[50%]" : ""}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-bold text-foreground truncate">{item.title}</h4>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.is_active
                        ? "bg-primary/10 text-primary"
                        : "bg-muted-soft text-muted"
                    }`}
                  >
                    {item.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 break-words mb-2">
                  {item.description}
                </p>
                <div className="text-xs font-semibold text-muted">
                  Posted {formatDateTime(item.created_at)}
                </div>
              </div>
              <div className="flex shrink-0 gap-2 border-t border-line pt-4 sm:border-t-0 sm:pt-0">
                <button
                  onClick={() =>
                    setForm({
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      is_active: item.is_active,
                    })
                  }
                  className="btn bg-surface hover:bg-surface-muted px-3"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="btn bg-surface hover:bg-red-50 hover:text-red-600 px-3"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
