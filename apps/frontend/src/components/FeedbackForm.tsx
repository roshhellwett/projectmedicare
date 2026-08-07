"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, ImageIcon } from "lucide-react";
import { showToast } from "./Toast";
import { compressImage } from "@/lib/imageCompression";

export default function FeedbackForm() {
  const t = useTranslations("FeedbackPage.form");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setFileName("");
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const rawFormData = new FormData(form);
      const rawFile = rawFormData.get("image") as File | null;

      const formData = new FormData();
      formData.append("name", rawFormData.get("name") as string);
      formData.append("phone", rawFormData.get("phone") as string);
      formData.append("note", rawFormData.get("note") as string);

      if (rawFile && rawFile.size > 0) {
        if (!rawFile.type.startsWith("image/")) {
          throw new Error("Please upload a valid image file.");
        }
        // Compress image client-side!
        const compressedFile = await compressImage(rawFile);
        formData.append("image", compressedFile);
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Submission failed");
      }

      setSuccess(true);
      form.reset();
      setFileName("");
      setPreview(null);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card text-center !py-12 animate-fade-in flex flex-col items-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {t("successTitle")}
        </h3>
        <p className="text-muted max-w-sm mx-auto">{t("successDesc")}</p>
        <button
          onClick={() => setSuccess(false)}
          className="btn btn-outline mt-8"
        >
          Submit another feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card !p-6 sm:!p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            {t("nameLabel")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder={t("namePlaceholder")}
            className="flex h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-foreground"
          >
            {t("phoneLabel")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              +91
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              minLength={10}
              maxLength={10}
              pattern="[0-9]{10}"
              placeholder={t("phonePlaceholder")}
              className="flex h-11 w-full rounded-md border border-line bg-surface pl-11 pr-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              onInvalid={(e) =>
                (e.target as HTMLInputElement).setCustomValidity(
                  t("errorPhone"),
                )
              }
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/\D/g, "").slice(0, 10);
                target.setCustomValidity("");
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <label htmlFor="note" className="text-sm font-medium text-foreground">
          {t("noteLabel")}
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder={t("notePlaceholder")}
          className="flex w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <div className="space-y-2 mt-6">
        <label className="text-sm font-medium text-foreground flex items-center justify-between">
          <span>{t("imageLabel")}</span>
        </label>
        <div
          className={`relative group overflow-hidden rounded-lg border-2 border-dashed border-line bg-surface-muted transition-colors hover:border-primary/50 hover:bg-primary/5 ${preview ? "border-primary/50 bg-primary/5" : ""}`}
        >
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            onChange={handleImageChange}
          />

          {preview ? (
            <div className="relative flex flex-col items-center justify-center p-4">
              <div className="h-32 w-full max-w-sm rounded overflow-hidden shadow-sm mb-3">
                <img
                  src={preview}
                  alt="Feedback preview"
                  className="h-full w-full object-cover opacity-80"
                />
              </div>
              <p className="text-sm font-medium text-foreground bg-surface/90 px-3 py-1 rounded shadow-sm backdrop-blur">
                {fileName}
              </p>
            </div>
          ) : (
            <div className="pointer-events-none flex flex-col items-center justify-center p-8 text-center">
              <ImageIcon className="h-8 w-8 text-muted mb-3 group-hover:text-primary transition-colors" />
              <p className="text-sm font-medium text-foreground">
                Click or tap here to upload an optional photo
              </p>
              <p className="text-xs text-muted mt-1">
                Supports all images (Auto-compressed)
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full mt-8"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </button>
    </form>
  );
}
