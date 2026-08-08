import { getTranslations } from "next-intl/server";
import { getPackages } from "@/lib/db/packages";
import {
  CheckCircle2,
  ShieldCheck,
  Clock,
  MapPin,
  Pill,
  FlaskConical,
} from "lucide-react";
import PackageBookingModal from "@/components/site/PackageBookingModal";
import Link from "next/link";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Health Packages — Janta Medicare LLP",
  description:
    "Comprehensive diagnostic health packages with transparent Janta pricing.",
};

export default async function PackagesPage() {
  const packages = await getPackages();
  const t = await getTranslations("HomePage");
  const locale = await getLocale();

  return (
    <div className="bg-surface pb-20">
      {/* Header */}
      <section className="border-b border-line bg-surface-muted py-12 md:py-20">
        <div className="container max-w-4xl text-center">
          <span className="eyebrow">Health Packages</span>
          <h1 className="mt-4 text-[2rem] leading-tight sm:text-5xl">
            Complete Checkups at{" "}
            <span className="text-primary">Honest Prices</span>
          </h1>
          <p className="section-sub mx-auto mt-6 max-w-2xl text-base sm:text-lg">
            Preventive care is the best care. Choose from our specialized
            diagnostic packages designed to give you a complete overview of your
            health. No hidden charges.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="container mt-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {packages.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted">
              <FlaskConical className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p>
                No health packages available at the moment. Please check back
                later.
              </p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className="card flex flex-col justify-between shadow-sm border border-line p-6 hover:border-primary/30 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-primary-deep">
                        {pkg.name}
                      </h3>
                      {pkg.description && (
                        <p className="mt-2 text-sm text-muted">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-muted line-through mb-1">
                        MRP ₹{pkg.market_price}
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        ₹{pkg.janta_price}
                      </div>
                      <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md mt-1 inline-block border border-green-200">
                        Save ₹{pkg.market_price - pkg.janta_price}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-line pt-6">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      Includes {pkg.tests.length} Parameters
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-y-3 gap-x-4">
                      {pkg.tests.map((test, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-muted"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{test}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-line">
                  <PackageBookingModal
                    packageId={pkg.id}
                    packageName={pkg.name}
                    packagePrice={pkg.janta_price}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mt-20">
        <div className="rounded-2xl border border-line bg-surface-muted p-8 text-center sm:p-12">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary opacity-80" />
          <h2 className="mt-6 text-2xl font-bold text-foreground">
            Why Book With Us?
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <span className="icon-tile is-green mb-4">
                <Clock className="h-5 w-5" />
              </span>
              <h3 className="font-semibold">Fast Reports</h3>
              <p className="mt-2 text-sm text-muted">
                Get your detailed test reports quickly and securely via WhatsApp
                or SMS.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="icon-tile mb-4">
                <MapPin className="h-5 w-5" />
              </span>
              <h3 className="font-semibold">3 Convenient Locations</h3>
              <p className="mt-2 text-sm text-muted">
                Visit Shibpur, Vivek Vihar, or Pilkhana for your sample
                collection.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="icon-tile is-accent mb-4">
                <Pill className="h-5 w-5" />
              </span>
              <h3 className="font-semibold">Transparent Pricing</h3>
              <p className="mt-2 text-sm text-muted">
                What you see is what you pay. Honest Janta pricing with zero
                hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
