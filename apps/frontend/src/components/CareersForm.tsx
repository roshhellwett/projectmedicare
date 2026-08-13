"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { stores } from "@/data/stores";
import { showToast } from "./Toast";
import { Turnstile } from "@marsidev/react-turnstile";

export default function CareersForm() {
  const t = useTranslations("CareersPage.form");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const cvFile = formData.get("cv") as File;

      if (cvFile && cvFile.type !== "application/pdf") {
        throw new Error(t("errorType"));
      }
      if (cvFile && cvFile.size > 2 * 1024 * 1024) {
        throw new Error(t("errorSize"));
      }
      
      if (turnstileToken) {
        formData.append("cf-turnstile-response", turnstileToken);
      }

      const res = await fetch("/api/careers", {
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
          Submit another application
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
        <label
          htmlFor="store_id"
          className="text-sm font-medium text-foreground"
        >
          {t("storeLabel")}
        </label>
        <div className="relative">
          <select
            id="store_id"
            name="store_id"
            required
            defaultValue=""
            className="flex h-11 w-full appearance-none rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="" disabled>
              {t("storePlaceholder")}
            </option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <label className="text-sm font-medium text-foreground">
          {t("cvLabel")}
        </label>
        <div className="relative group rounded-lg border-2 border-dashed border-line bg-surface-muted transition-colors hover:border-primary/50 hover:bg-primary/5">
          <input
            type="file"
            name="cv"
            id="cv"
            required
            accept=".pdf,application/pdf"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFileName(file.name);
            }}
          />
          <div className="pointer-events-none flex flex-col items-center justify-center p-8 text-center">
            <UploadCloud className="h-8 w-8 text-muted mb-3 group-hover:text-primary transition-colors" />
            <p className="text-sm font-medium text-foreground">
              {fileName || "Click or drag file to this area to upload"}
            </p>
            <p className="text-xs text-muted mt-1">Supports PDF up to 2MB</p>
          </div>
        </div>
      </div>

        <div className="mt-8 flex justify-center flex-col items-center gap-2">
          {!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
            <div className="text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded border border-amber-200">
              Security check configuration is missing. Please contact support.
            </div>
          ) : (
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken("")}
              onExpire={() => setTurnstileToken("")}
            />
          )}
        </div>

      <button
        type="submit"
        disabled={submitting || (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== '1x00000000000000000000AA')}
        className="btn btn-primary w-full mt-4"
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
