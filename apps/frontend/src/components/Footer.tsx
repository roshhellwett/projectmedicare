"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone, Stethoscope } from "lucide-react";
import { stores } from "@/data/stores";

export default function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();

  const services = [
    { label: "Pharmacy", href: `/${locale}/medicines` },
    { label: "Pathology & Diagnostics", href: `/${locale}/patient-rate-chart` },
    { label: "Doctor Chambers", href: `/${locale}/doctors` },
    { label: "Notices & Offers", href: `/${locale}/bulletins` },
  ];

  const links = [
    { label: "Store Locations", href: `/${locale}/locations` },
    { label: "Our Doctors", href: `/${locale}/doctors` },
    { label: "Patient Rate Chart", href: `/${locale}/patient-rate-chart` },
    { label: "Leave Feedback", href: `/${locale}/feedback` },
  ];

  return (
    <>
      <footer className="mt-auto border-t border-line bg-surface">
        <div className="container grid gap-10 py-12 md:grid-cols-4 md:gap-8 md:py-14">
          {/* Brand + address */}
          <div>
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                <Image
                  src="/websitelogo/jantamedicarelogo.webp"
                  alt="Janta Medicare"
                  fill
                  sizes="44px"
                  className="object-contain p-0.5"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-heading text-lg font-bold text-primary-deep">
                  Janta Medicare
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary-dark">
                  Sirf Janta Kay Liye
                </span>
              </span>
            </div>

            <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="block font-semibold text-foreground">
                  Main hub — Vivek Vihar
                </span>
                493/C/A, G. T. Road (South), Fazir Bazar More, Vivek Vihar
                Phase-II, Shop No. 4, P.O. &amp; P.S. Shibpur, Dist. Howrah,
                Pin: 711101
              </span>
            </p>

            <div className="mt-5 space-y-4 text-sm">
              {stores.map((store) => (
                <div key={store.id} className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {store.name}
                  </p>
                  {store.phones.map((phone) => (
                    <a
                      key={phone.number}
                      href={`tel:${phone.number}`}
                      className="flex items-center gap-2 text-muted transition-colors hover:text-primary"
                    >
                      {phone.label.includes("Diagnostic") ? (
                        <Stethoscope className="h-3.5 w-3.5 shrink-0 text-secondary" />
                      ) : (
                        <Phone className="h-3.5 w-3.5 shrink-0 text-secondary" />
                      )}
                      <span className="font-semibold text-foreground">
                        {phone.number.replace("+91", "+91 ")}
                      </span>
                      <span className="text-xs">{phone.label}</span>
                    </a>
                  ))}
                </div>
              ))}
              <div className="pt-2">
                <p className="flex items-center gap-2 text-muted">
                  <Clock className="h-4 w-4 shrink-0 text-secondary" />
                  Open daily 8 AM – 10 PM
                </p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Services
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="text-muted transition-colors hover:text-primary"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Quick links
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-muted transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://www.facebook.com/jantamedicarellp"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted transition-colors hover:text-primary"
                >
                  Facebook page
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Legal
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href={`/${locale}/legal/privacy-policy`}
                  className="text-muted transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/terms-and-conditions`}
                  className="text-muted transition-colors hover:text-primary"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="container flex flex-col gap-1 py-5 text-center text-xs text-muted sm:flex-row sm:justify-between sm:text-left">
            <p>{t("rights")}</p>
            <p className="text-muted-soft">
              Design and Build By{" "}
              <a
                href="https://zenithopensourceprojects.vercel.app/site"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-primary"
              >
                Zenith Open Source Projects
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
