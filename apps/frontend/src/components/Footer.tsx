"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone, Stethoscope } from "lucide-react";
import { mainContact } from "@/data/stores";

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
  ];

  return (
    <>
      <footer className="mt-auto border-t border-line bg-surface">
        <div className="container grid gap-10 py-12 md:grid-cols-3 md:gap-8 md:py-14">
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
                  Main hub — Shibpur
                </span>
                53, Kalikumar Mukharjee Lane, Tram Depot More, P.O. &amp; P.S.
                Shibpur, Howrah — 711102
              </span>
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <a
                href={`tel:${mainContact.tollFree}`}
                className="flex items-center gap-2 text-muted transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0 text-secondary" />
                <span className="font-semibold text-foreground">
                  +91 62907 45327
                </span>
                <span className="text-xs">Toll free</span>
              </a>
              <a
                href={`tel:${mainContact.diagnostic}`}
                className="flex items-center gap-2 text-muted transition-colors hover:text-primary"
              >
                <Stethoscope className="h-4 w-4 shrink-0 text-secondary" />
                <span className="font-semibold text-foreground">
                  +91 62907 45327
                </span>
                <span className="text-xs">Diagnostics</span>
              </a>
              <p className="flex items-center gap-2 text-muted">
                <Clock className="h-4 w-4 shrink-0 text-secondary" />
                Open daily 8 AM – 10 PM
              </p>
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
