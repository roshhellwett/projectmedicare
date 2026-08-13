"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, MapPin, Phone, Stethoscope } from "lucide-react";
import { stores } from "@/data/stores";

export default function Footer() {
  const t = useTranslations("Footer");
  const ts = useTranslations("Stores");
  const locale = useLocale();
  const pathname = usePathname();

  if (pathname?.includes("/admin")) {
    return null;
  }

  const services = [
    { label: t("pharmacy"), href: `/${locale}/medicines` },
    { label: t("pathology"), href: `/${locale}/patient-rate-chart` },
    { label: t("doctorChambers"), href: `/${locale}/doctors` },
    { label: t("productsOffers"), href: `/${locale}/bulletins` },
  ];

  const links = [
    { label: t("storeLocations"), href: `/${locale}/locations` },
    { label: t("ourDoctors"), href: `/${locale}/doctors` },
    { label: t("rateChart"), href: `/${locale}/patient-rate-chart` },
    { label: t("leaveFeedback"), href: `/${locale}/feedback` },
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
                  alt="Janta Medicare LLP"
                  fill
                  sizes="44px"
                  className="object-contain p-0.5"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-heading text-lg font-bold text-primary-deep">
                  Janta Medicare LLP
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary-dark">
                  {t("tagline")}
                </span>
              </span>
            </div>

            <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="block font-semibold text-foreground">
                  {t("mainHubLabel")}
                </span>
                {t("mainHubAddress")}
              </span>
            </p>

            <div className="mt-5 space-y-4 text-sm">
              {stores.map((store) => (
                <div key={store.id} className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {ts(`${store.id}.name`)}
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
                  {t("openDaily")}
                </p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {t("servicesTitle")}
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
              {t("quickLinksTitle")}
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
                  {t("facebookPage")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {t("legalTitle")}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href={`/${locale}/legal/privacy-policy`}
                  className="text-muted transition-colors hover:text-primary"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/terms-and-conditions`}
                  className="text-muted transition-colors hover:text-primary"
                >
                  {t("termsConditions")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="container flex flex-col gap-1 py-5 text-center text-xs text-muted sm:flex-row sm:justify-between sm:text-left">
            <p>{t("rights")}</p>
            <p className="text-muted-soft">
              {t("designBy")}{" "}
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
