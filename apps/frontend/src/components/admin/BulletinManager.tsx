"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  Tag,
  Trash2,
  X,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import { showToast } from "@/components/Toast";
import type { Bulletin, BulletinKind } from "@/lib/db/bulletins";
import { formatDateTime, windowStatus } from "@/lib/utils/ist";
import { compressImage } from "@/lib/imageCompression";

type FormState = {
  id: string | null;
  body: string;
  kind: BulletinKind;
  starts_at: string;
  ends_at: string;
  pinned: boolean;
  image_url: string | null;
  file: File | null;
};

const emptyForm = (): FormState => ({
  id: null,
  body: "",
  kind: "product",
  starts_at: "",
  ends_at: "",
  pinned: false,
  image_url: null,
  file: null,
});

/** Converts an ISO timestamp to the value a datetime-local input expects, in IST. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const ist = new Date(d.getTime() + (330 + d.getTimezoneOffset()) * 60000);
  return ist.toISOString().slice(0, 16);
}

const statusStyles = {
  live: "badge-green",
  scheduled: "badge-blue",
  expired: "badge-magenta",
} as const;

export default function BulletinManager({
  initialItems,
}: {
  initialItems: Bulletin[];
}) {
  const [items, setItems] = useState<Bulletin[]>(initialItems);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "live" | "scheduled" | "expired"
  >("all");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => windowStatus(i.starts_at, i.ends_at) === filter);
  }, [items, filter]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.kind === "offer" && !form.ends_at) {
      showToast(
        "An offer needs an end date so it expires automatically",
        "error",
      );
      return;
    }
    setSaving(true);
    let uploadedUrl: string | null = null;
    try {
      let finalImageUrl = form.image_url;

      // Upload image if a new one is selected
      if (form.file) {
        const compressed = await compressImage(form.file);
        const uploadForm = new FormData();
        uploadForm.append("file", compressed);

        const uploadRes = await fetch("/api/admin/bulletins/upload", {
          method: "POST",
          body: uploadForm,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadData.error || "Failed to upload image");
        finalImageUrl = uploadData.url;
        uploadedUrl = uploadData.url;
      }

      const res = await fetch("/api/admin/bulletins", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          body: form.body,
          kind: form.kind,
          image_url: finalImageUrl,
          starts_at: form.starts_at || null,
          ends_at: form.ends_at || null,
          pinned: form.pinned,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (uploadedUrl) {
          const urlParts = uploadedUrl.split("/products/");
          if (urlParts.length > 1) {
            await fetch("/api/admin/clean-upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bucket: "products", path: urlParts[1] }),
            }).catch(() => {});
          }
        }
        throw new Error(data.error || "Could not save");
      }
      const saved = data.bulletin as Bulletin;
      setItems((prev) => {
        const rest = prev.filter((i) => i.id !== saved.id);
        return [saved, ...rest].sort(
          (a, b) =>
            Number(b.pinned) - Number(a.pinned) ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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

  const startEdit = (item: Bulletin) => {
    setForm({
      id: item.id,
      body: item.body,
      kind: item.kind,
      starts_at: toLocalInput(item.starts_at),
      ends_at: toLocalInput(item.ends_at),
      pinned: item.pinned,
      image_url: item.image_url,
      file: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this permanently?")) return;
    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (form.id === id) setForm(emptyForm());
    try {
      const res = await fetch("/api/admin/bulletins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
      showToast("Deleted successfully");
    } catch (err) {
      setItems(previous);
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  return (
    <div className="space-y-9">
      <form onSubmit={submit} className="card space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">
            {form.id ? "Edit Item" : "New Item"}
          </h2>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyForm())}
              className="btn btn-outline !py-1.5 !px-3 text-xs"
            >
              <X className="h-3.5 w-3.5" /> Cancel edit
            </button>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-muted">
            {form.kind === "product"
              ? "Product Title / Details"
              : "Offer Details"}
          </span>
          <textarea
            className="input min-h-[110px] resize-y"
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            maxLength={600}
            placeholder="e.g. 20% off on all thyroid profile tests this week."
            required
          />
          <span className="mt-1 block text-right text-xs text-muted">
            {form.body.length}/600
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-line bg-white p-1">
            {(["product", "offer"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  set("kind", kind);
                  if (kind !== "product") {
                    set("file", null);
                    set("image_url", null);
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-extrabold transition-all ${
                  form.kind === kind
                    ? "bg-primary text-white"
                    : "text-muted hover:text-primary"
                }`}
              >
                {kind === "offer" ? (
                  <Tag className="h-3.5 w-3.5" />
                ) : (
                  <Megaphone className="h-3.5 w-3.5" />
                )}
                {kind === "offer" ? "Offer" : "Product"}
              </button>
            ))}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => set("pinned", e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <Pin className="h-4 w-4 text-primary" /> Pin to top
          </label>
        </div>

        {form.kind === "product" && (
          <div className="block">
            <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-muted">
              Product Image
            </span>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-white p-6 text-center transition-colors hover:border-primary">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    set("file", e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className="mb-3 h-8 w-8 text-muted transition-colors group-hover:text-primary" />
              <span className="text-sm font-bold text-foreground">
                {form.file ? form.file.name : "Click or tap to upload an image"}
              </span>
              <span className="mt-1 text-xs text-muted">
                Images are automatically optimized and compressed to save space.
              </span>
            </label>
            {(form.image_url || form.file) && (
              <div className="mt-3 overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    form.file
                      ? URL.createObjectURL(form.file)
                      : form.image_url || ""
                  }
                  alt="Preview"
                  className="h-40 w-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-muted">
              Show from (IST, optional)
            </span>
            <input
              type="datetime-local"
              className="input"
              value={form.starts_at}
              onChange={(e) => set("starts_at", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-muted">
              Show until (IST
              {form.kind === "offer" ? ", required" : ", optional"})
            </span>
            <input
              type="datetime-local"
              className="input"
              value={form.ends_at}
              onChange={(e) => set("ends_at", e.target.value)}
              required={form.kind === "offer"}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary w-full !py-3"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {form.id ? "Save changes" : "Publish"}
        </button>
      </form>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["all", "live", "scheduled", "expired"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-extrabold capitalize transition-all ${
                filter === key
                  ? "bg-primary text-white"
                  : "bg-primary-soft text-primary hover:bg-primary/15"
              }`}
            >
              {key}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold text-muted">
            {visible.length} item(s)
          </span>
        </div>

        {visible.length === 0 ? (
          <p className="card text-sm text-muted">Nothing here yet.</p>
        ) : (
          <ul className="space-y-4">
            {visible.map((item) => {
              const status = windowStatus(item.starts_at, item.ends_at);
              return (
                <li key={item.id} className="card !py-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`badge ${item.kind === "offer" ? "badge-green" : "badge-blue"}`}
                    >
                      {item.kind === "offer" ? "Offer" : "Product"}
                    </span>
                    <span className={`badge ${statusStyles[status]}`}>
                      {status}
                    </span>
                    {item.pinned && (
                      <span className="badge badge-white">Pinned</span>
                    )}
                    <span className="text-xs font-bold text-muted">
                      {formatDateTime(item.created_at)}
                    </span>
                    <div className="ml-auto flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label="Edit"
                        className="rounded-xl p-2 text-primary transition-colors hover:bg-primary-soft"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label="Delete"
                        className="rounded-xl p-2 text-accent transition-colors hover:bg-accent-soft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-sm font-medium leading-relaxed">
                    {item.body}
                  </p>
                  {item.image_url && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        className="h-40 w-full object-cover"
                        alt="Product"
                      />
                    </div>
                  )}
                  {(item.starts_at || item.ends_at) && (
                    <p className="mt-3 text-xs font-bold text-muted">
                      {item.starts_at
                        ? `From ${formatDateTime(item.starts_at)}`
                        : "From now"}
                      {" · "}
                      {item.ends_at
                        ? `until ${formatDateTime(item.ends_at)}`
                        : "no end date"}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
