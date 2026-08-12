"use client";

import { useState } from "react";
import { CalendarPlus, CheckCircle2, MapPin, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";

export default function PackageBookingModal({
  packageId,
  packageName,
  packagePrice,
}: {
  packageId: string;
  packageName: string;
  packagePrice: number;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const t = useTranslations("Navbar");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      customer_name: formData.get("customer_name") as string,
      phone_number: formData.get("phone_number") as string,
      store_id: formData.get("store_id") as string,
      package_id: packageId,
      cf_turnstile_response: turnstileToken,
    };

    if (data.phone_number.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/packages/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to book package");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const closeDialog = () => {
    setOpen(false);
    setTimeout(() => {
      setSuccess(false);
      setError(null);
    }, 300);
  };

  return (
    <>
      <button className="btn btn-primary w-full" onClick={() => setOpen(true)}>
        Book Package Now <CalendarPlus className="ml-2 h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeDialog}
          />
          <div className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-xl overflow-hidden">
            <button
              onClick={closeDialog}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>

            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Booking Confirmed!
                </h2>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  Thank you for booking the <strong>{packageName}</strong>. Our
                  diagnostic team will contact you shortly to confirm the
                  appointment details.
                </p>
                <button
                  className="btn btn-primary mt-8 w-full"
                  onClick={closeDialog}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-foreground">
                  Book {packageName}
                </h2>
                <div className="mt-4 border-b border-line pb-4 mb-5">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-sm text-muted">
                      Total Payable at Clinic
                    </span>
                    <span className="text-xl text-primary">
                      ₹{packagePrice}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="customer_name"
                      className="text-sm font-medium text-foreground"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customer_name"
                      name="customer_name"
                      className="flex h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Enter patient's full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phone_number"
                      className="text-sm font-medium text-foreground"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                        +91
                      </span>
                      <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        minLength={10}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="flex h-11 w-full rounded-md border border-line bg-surface pl-11 pr-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="10-digit mobile number"
                        required
                        onInvalid={(e) =>
                          (e.target as HTMLInputElement).setCustomValidity(
                            "Please enter exactly 10 digits.",
                          )
                        }
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          target.setCustomValidity("");
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="store_id"
                      className="text-sm font-medium text-foreground"
                    >
                      Preferred Branch (Optional)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                      <select
                        id="store_id"
                        name="store_id"
                        className="flex h-11 w-full appearance-none rounded-md border border-line bg-surface pl-10 pr-10 py-2 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">No preference / Contact me</option>
                        <option value="023058ef-ada0-4ac2-9eaf-7033e318a585">
                          {t("tramDepot")} (Shibpur)
                        </option>
                        <option value="03476cf4-170c-4f06-a1a8-f95620f52b2e">
                          {t("vivekVihar")}
                        </option>
                        <option value="ef40552e-31ad-4bea-bd44-c293fef56ed0">
                          {t("pilkhana")}
                        </option>
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => setTurnstileToken("")}
                      onExpire={() => setTurnstileToken("")}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full mt-4"
                    disabled={isSubmitting || (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== '1x00000000000000000000AA')}
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Booking"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
