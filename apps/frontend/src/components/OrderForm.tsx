"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, UploadCloud, ImageIcon, Trash2, Plus, Minus } from "lucide-react";
import { showToast } from "./Toast";
import { Turnstile } from "@marsidev/react-turnstile";
import { useCartStore } from "@/lib/store/cartStore";
import { useUserStore } from "@/lib/store/userStore";

// Helper: compress image client-side before upload to save space
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return resolve(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".webp"),
                {
                  type: "image/webp",
                  lastModified: Date.now(),
                },
              );
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback
            }
          },
          "image/webp",
          0.7,
        );
      };
      img.onerror = () => reject(new Error("Failed to read image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};

export default function OrderForm() {
  const t = useTranslations("OrderPage.form");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  
  const { name, phone, address, setUserInfo } = useUserStore();

  // If the cart is empty, a prescription is strictly REQUIRED.
  // If the cart has items, we make it OPTIONAL. If a restricted medicine is ordered, 
  // the pharmacy will manually call the patient to ask for the prescription.
  const needsPrescription = cartItems.length === 0;


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
      const rawFile = rawFormData.get("image") as File;

      if (needsPrescription && (!rawFile || !rawFile.type.startsWith("image/"))) {
        throw new Error("Please upload a valid image file.");
      }

      const formData = new FormData();
      if (rawFile && rawFile.size > 0) {
        const compressedFile = await compressImage(rawFile);
        formData.append("image", compressedFile);
      }
      formData.append("name", rawFormData.get("name") as string);
      formData.append("phone", rawFormData.get("phone") as string);
      formData.append("address", rawFormData.get("address") as string);
      formData.append("note", rawFormData.get("note") as string);

      if (cartItems.length > 0) {
        formData.append("cart_items", JSON.stringify(cartItems));
      }

      if (turnstileToken) {
        formData.append("cf-turnstile-response", turnstileToken);
      }

      const dbRes = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      if (!dbRes.ok) {
        const json = await dbRes.json();
        throw new Error(json.error || "Submission failed");
      }

      setSuccess(true);
      // We don't clear the user info from local storage because they might order again
      // Only clear the file and cart
      form.reset();
      setFileName("");
      setPreview(null);
      clearCart();
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
          Submit another order
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {cartItems.length > 0 && (
        <div className="card !p-6 sm:!p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 border-b border-line pb-4">
            Order Summary
          </h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-line last:border-0">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{item.medicine_name}</h4>
                  <p className="text-sm text-muted">{item.pack_size}</p>
                  <p className="text-sm font-medium text-primary mt-1">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-surface border border-line rounded-md p-1">
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 hover:bg-surface-muted rounded"
                    >
                      <Minus className="h-4 w-4 text-muted" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-surface-muted rounded"
                    >
                      <Plus className="h-4 w-4 text-muted" />
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-line flex justify-between items-center">
            <span className="font-bold text-lg text-foreground">Total (Est.)</span>
            <span className="font-bold text-2xl text-secondary-dark">₹{getTotalPrice().toFixed(2)}</span>
          </div>
        </div>
      )}

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
            value={name}
            onChange={(e) => setUserInfo({ name: e.target.value })}
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
              value={phone}
              placeholder={t("phonePlaceholder")}
              className="flex h-11 w-full rounded-md border border-line bg-surface pl-11 pr-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              onInvalid={(e) =>
                (e.target as HTMLInputElement).setCustomValidity(
                  t("errorPhone"),
                )
              }
              onChange={(e) => setUserInfo({ phone: e.target.value })}
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
          htmlFor="address"
          className="text-sm font-medium text-foreground"
        >
          {t("addressLabel")}
        </label>
        <textarea
          id="address"
          name="address"
          required
          rows={3}
          value={address}
          onChange={(e) => setUserInfo({ address: e.target.value })}
          placeholder={t("addressPlaceholder")}
          className="flex w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <div className="space-y-2 mt-6">
        <label htmlFor="note" className="text-sm font-medium text-foreground">
          {t("noteLabel")}
        </label>
        <input
          id="note"
          name="note"
          type="text"
          placeholder={t("notePlaceholder")}
          className="flex h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-2 mt-6">
        <label className="text-sm font-medium text-foreground">
          {t("imageLabel")} {needsPrescription ? "" : "(Optional)"}
        </label>
        <div
          className={`relative group overflow-hidden rounded-lg border-2 border-dashed border-line bg-surface-muted transition-colors hover:border-primary/50 hover:bg-primary/5 ${preview ? "border-primary/50 bg-primary/5" : ""}`}
        >
          <input
            type="file"
            name="image"
            id="image"
            required={needsPrescription}
            accept="image/*"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            onChange={handleImageChange}
          />

          {preview ? (
            <div className="relative flex flex-col items-center justify-center p-4">
              <div className="h-32 w-full max-w-sm rounded overflow-hidden shadow-sm mb-3">
                <img
                  src={preview}
                  alt="Prescription preview"
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
                Click or tap here to take a photo or upload
              </p>
              <p className="text-xs text-muted mt-1">
                Supports all images (Auto-compressed)
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={(token) => setTurnstileToken(token)}
          onError={() => setTurnstileToken("")}
          onExpire={() => setTurnstileToken("")}
        />
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
    </div>
  );
}
