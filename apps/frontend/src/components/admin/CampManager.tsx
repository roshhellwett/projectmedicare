"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  CalendarHeart,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { showToast } from "@/components/Toast";
import type { CampPost } from "@/lib/db/camp";
import { formatCampDate, nextSundayIST } from "@/lib/utils/ist";

type FormState = {
  title: string;
  description: string;
  venue: string;
  address: string;
  camp_date: string;
  fee: string;
  image_url: string | null;
  image_path: string | null;
  file: File | null;
};

function emptyForm(): FormState {
  return {
    title: "Sunday Free Health Camp",
    description: "",
    venue: "Janta Medicare LLP — Shibpur",
    address: "",
    camp_date: nextSundayIST(),
    fee: "Cost ₹100 only",
    image_url: null,
    image_path: null,
    file: null,
  };
}

function fromCamp(camp: CampPost): FormState {
  return {
    title: camp.title,
    description: camp.description,
    venue: camp.venue,
    address: camp.address,
    camp_date: camp.camp_date,
    fee: camp.fee,
    image_url: camp.image_url,
    image_path: camp.image_path,
    file: null,
  };
}

export default function CampManager({
  initialActive,
  initialArchive,
}: {
  initialActive: CampPost | null;
  initialArchive: CampPost[];
}) {
  const [active, setActive] = useState<CampPost | null>(initialActive);
  const [archive, setArchive] = useState<CampPost[]>(initialArchive);
  const [form, setForm] = useState<FormState>(
    initialActive ? fromCamp(initialActive) : emptyForm(),
  );
  const [mode, setMode] = useState<"edit" | "new">(
    initialActive ? "edit" : "new",
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileSelect = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Only JPG, PNG or WebP images are allowed", "error");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast("Image must be smaller than 4 MB", "error");
      return;
    }
    setForm((prev) => ({ ...prev, file }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let uploadedPath: string | null = null;
    try {
      let finalImageUrl = form.image_url;
      let finalImagePath = form.image_path;

      if (form.file) {
        const body = new FormData();
        body.append("file", form.file);
        const uploadRes = await fetch("/api/admin/camp/upload", {
          method: "POST",
          body,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        
        finalImageUrl = uploadData.url;
        finalImagePath = uploadData.path;
        uploadedPath = uploadData.path;
      }

      const isEdit = mode === "edit" && active;
      const payload = {
        ...form,
        image_url: finalImageUrl,
        image_path: finalImagePath,
      };

      const res = await fetch("/api/admin/camp", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...payload, id: active.id } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (uploadedPath) {
          await fetch("/api/admin/clean-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bucket: "camp", path: uploadedPath }),
          }).catch(() => {});
        }
        throw new Error(data.error || "Could not save the camp post");
      }

      if (!isEdit && active)
        setArchive((prev) => [{ ...active, is_active: false }, ...prev]);
      setActive(data.camp as CampPost);
      setForm(fromCamp(data.camp as CampPost));
      setMode("edit");
      showToast(isEdit ? "Camp post updated" : "New camp published");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeArchived = async (id: string) => {
    if (
      !window.confirm(
        "Delete this archived camp post and its image permanently?",
      )
    )
      return;
    const previous = archive;
    setArchive((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch("/api/admin/camp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
      showToast("Archived post deleted");
    } catch (err) {
      setArchive(previous);
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      {/* Form */}
      <form onSubmit={submit} className="card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">
            {mode === "edit"
              ? "Edit current camp post"
              : "Publish new camp post"}
          </h2>
          {active && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("edit");
                  setForm(fromCamp(active));
                }}
                className={`btn !py-1.5 !px-3 text-xs ${mode === "edit" ? "btn-primary" : "btn-outline"}`}
              >
                Edit current
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("new");
                  setForm({
                    ...emptyForm(),
                    address: active.address,
                    venue: active.venue,
                  });
                }}
                className={`btn !py-1.5 !px-3 text-xs ${mode === "new" ? "btn-primary" : "btn-outline"}`}
              >
                New week
              </button>
            </div>
          )}
        </div>

        <Field label="Title">
          <input
            className="input"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={120}
            required
          />
        </Field>

        <Field label="Details (what will happen at the camp)">
          <textarea
            className="input min-h-[130px] resize-y"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={1200}
            required
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Camp date (Sunday)">
            <input
              type="date"
              className="input"
              value={form.camp_date}
              onChange={(e) => set("camp_date", e.target.value)}
              required
            />
          </Field>
          <Field label="Fee / charges">
            <input
              className="input"
              value={form.fee}
              onChange={(e) => set("fee", e.target.value)}
              maxLength={60}
              required
            />
          </Field>
        </div>

        <Field label="Venue name">
          <input
            className="input"
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
            maxLength={160}
            required
          />
        </Field>

        <Field label="Full address">
          <input
            className="input"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            maxLength={300}
            required
          />
        </Field>

        <Field label="Camp photo">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="btn btn-outline !py-2 !px-4 text-sm"
            >
              <ImagePlus className="h-4 w-4" />
              {form.file || form.image_url
                  ? "Replace image"
                  : "Upload image"}
            </button>
            {(form.image_url || form.file) && (
              <button
                type="button"
                onClick={() => {
                  setForm((p) => ({ ...p, image_url: null, image_path: null, file: null }));
                  if (fileInput.current) fileInput.current.value = "";
                }}
                className="text-xs font-bold text-accent hover:underline"
              >
                Remove image
              </button>
            )}
            <span className="text-xs text-muted">
              JPG / PNG / WebP · up to 4 MB
            </span>
          </div>
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary w-full !py-3"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {mode === "edit" ? "Save changes" : "Publish & archive previous"}
        </button>
      </form>

      {/* Preview + archive */}
      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted">
            Live preview
          </h3>
          <div className="card overflow-hidden !p-0">
            <div className="relative h-48 w-full bg-primary-soft">
              {form.file ? (
                <Image
                  src={URL.createObjectURL(form.file)}
                  alt="Camp preview"
                  fill
                  sizes="480px"
                  className="object-cover"
                />
              ) : form.image_url ? (
                <Image
                  src={form.image_url}
                  alt="Camp preview"
                  fill
                  sizes="480px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-primary">
                  <CalendarHeart className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="space-y-3 p-6">
              <span className="badge badge-green">
                {form.camp_date
                  ? formatCampDate(form.camp_date)
                  : "Pick a date"}
              </span>
              <h4 className="font-heading text-xl font-extrabold">
                {form.title || "Camp title"}
              </h4>
              <p className="whitespace-pre-line text-sm text-muted">
                {form.description || "Camp details will appear here."}
              </p>
              <p className="text-sm font-bold">{form.venue}</p>
              <p className="text-xs text-muted">{form.address}</p>
              <p className="text-sm font-extrabold text-secondary-dark">
                {form.fee}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted">
            Archived camps ({archive.length})
          </h3>
          {archive.length === 0 ? (
            <p className="card text-sm text-muted">
              No archived camp posts yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {archive.map((camp) => (
                <li
                  key={camp.id}
                  className="card flex items-center justify-between gap-4 !py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">
                      {camp.title}
                    </p>
                    <p className="text-xs text-muted">
                      {formatCampDate(camp.camp_date)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArchived(camp.id)}
                    aria-label="Delete archived camp"
                    className="rounded-xl p-2 text-accent transition-colors hover:bg-accent-soft"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
