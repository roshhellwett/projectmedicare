"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, Phone, Settings, X } from "lucide-react";

const NAV_LINKS = [
  { key: "home", href: "" },
  { key: "medicines", href: "/medicines" },
  { key: "packages", href: "/packages" },
  { key: "patientRates", href: "/patient-rate-chart" },
  { key: "locations", href: "/locations" },
  { key: "doctors", href: "/doctors" },
  { key: "bulletins", href: "/bulletins" },
  { key: "gallery", href: "/gallery" },
  { key: "careers", href: "/careers" },
  { key: "order", href: "/order" },
] as const;

// Cache invalidation comment for Turbopack (Bust cache again 2)
export default function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation without an effect-driven setState.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const switchLocale = (next: string) => {
    if (next === locale) return;
    const rest = pathname.replace(`/${locale}`, "") || "";
    router.push(`/${next}${rest}`);
  };

  const isActive = (href: string) =>
    href === ""
      ? pathname === `/${locale}`
      : pathname.startsWith(`/${locale}${href}`);

  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur"
    >
      {/* Utility strip */}
      <div className="border-b border-line bg-surface-muted">
        <div className="container grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-1.5">
          <div
            suppressHydrationWarning
            className="flex min-w-0 items-center overflow-hidden whitespace-nowrap pb-1 sm:pb-0 text-xs text-muted mask-edges"
          >
            <div className="flex w-max animate-marquee sm:animate-none">
              <div className="flex items-center gap-3 pr-3">
                <a
                  href="tel:+916290745327"
                  className="flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-secondary" />
                  <span>
                    {t("tramDepot")}{" "}
                    <span className="font-semibold text-foreground">
                      +91 62907 45327
                    </span>
                  </span>
                </a>
                <span className="hidden h-3 w-px shrink-0 bg-line sm:block" />
                <a
                  href="tel:+918240804490"
                  className="flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-secondary" />
                  <span>
                    {t("vivekVihar")}{" "}
                    <span className="font-semibold text-foreground">
                      +91 82408 04490
                    </span>
                  </span>
                </a>
                <span className="hidden h-3 w-px shrink-0 bg-line sm:block" />
                <a
                  href="tel:+919123899472"
                  className="flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-secondary" />
                  <span>
                    {t("pilkhana")}{" "}
                    <span className="font-semibold text-foreground">
                      +91 91238 99472
                    </span>
                  </span>
                </a>
              </div>
              
              {/* Duplicated items for seamless marquee on mobile */}
              <div aria-hidden="true" className="flex items-center gap-3 pr-3 sm:hidden">
                <a
                  href="tel:+916290745327"
                  className="flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-secondary" />
                  <span>
                    {t("tramDepot")}{" "}
                    <span className="font-semibold text-foreground">
                      +91 62907 45327
                    </span>
                  </span>
                </a>
                <span className="hidden h-3 w-px shrink-0 bg-line sm:block" />
                <a
                  href="tel:+918240804490"
                  className="flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-secondary" />
                  <span>
                    {t("vivekVihar")}{" "}
                    <span className="font-semibold text-foreground">
                      +91 82408 04490
                    </span>
                  </span>
                </a>
                <span className="hidden h-3 w-px shrink-0 bg-line sm:block" />
                <a
                  href="tel:+919123899472"
                  className="flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-secondary" />
                  <span>
                    {t("pilkhana")}{" "}
                    <span className="font-semibold text-foreground">
                      +91 91238 99472
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center rounded-md border border-line bg-surface p-0.5">
              {(
                [
                  { code: "en", label: "EN" },
                  { code: "hi", label: "हिं" },
                ] as const
              ).map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => switchLocale(l.code)}
                  aria-current={locale === l.code}
                  className={`rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                    locale === l.code
                      ? "bg-primary text-white"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <Link
              href={`/${locale}/admin`}
              className="hidden items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-primary sm:flex"
            >
              <Settings className="h-3.5 w-3.5" /> Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 lg:flex lg:justify-between">
        <Link href={`/${locale}`} className="flex min-w-0 items-center gap-2.5">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line bg-white sm:h-11 sm:w-11">
            <Image
              src="/websitelogo/jantamedicarelogo.webp"
              alt="Janta Medicare LLP"
              fill
              sizes="44px"
              className="object-contain p-0.5"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-heading text-base font-bold leading-tight text-primary-deep sm:text-lg">
              Janta Medicare LLP
            </span>
            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary-dark">
              Sirf Janta Kay Liye
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={`/${locale}${link.href}`}
              className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link href={`/${locale}/doctors`} className="btn btn-primary btn-sm">
            Book consultation
          </Link>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm shrink-0 !px-2.5 lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-7rem)] overflow-y-auto border-t border-line bg-surface shadow-lg lg:hidden">
          <nav className="container flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={`/${locale}${link.href}`}
                onClick={() => setMenuOpen(false)}
                className={`flex min-h-[48px] items-center border-b border-line text-[0.9375rem] font-medium ${
                  isActive(link.href) ? "text-primary" : "text-foreground"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
            <Link
              href={`/${locale}/admin`}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-[48px] items-center gap-2 border-b border-line text-[0.9375rem] font-medium text-muted"
            >
              <Settings className="h-4 w-4" /> Admin
            </Link>
            <div className="flex flex-col gap-2 py-4">
              <Link
                href={`/${locale}/doctors`}
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary w-full"
              >
                Book consultation
              </Link>
              <div className="flex flex-col gap-2 rounded-lg bg-surface-muted p-3">
                <a
                  href="tel:+916290745327"
                  className="flex items-center justify-between rounded-md border border-line bg-surface p-2 text-[0.8125rem] font-medium shadow-sm transition-colors hover:border-primary"
                >
                  <span className="flex items-center gap-2 text-muted">
                    <Phone className="h-3.5 w-3.5 text-secondary" />{" "}
                    {t("tramDepot")}
                  </span>
                  <span className="text-foreground">+91 62907 45327</span>
                </a>
                <a
                  href="tel:+918240804490"
                  className="flex items-center justify-between rounded-md border border-line bg-surface p-2 text-[0.8125rem] font-medium shadow-sm transition-colors hover:border-primary"
                >
                  <span className="flex items-center gap-2 text-muted">
                    <Phone className="h-3.5 w-3.5 text-secondary" />{" "}
                    {t("vivekVihar")}
                  </span>
                  <span className="text-foreground">+91 82408 04490</span>
                </a>
                <a
                  href="tel:+919123899472"
                  className="flex items-center justify-between rounded-md border border-line bg-surface p-2 text-[0.8125rem] font-medium shadow-sm transition-colors hover:border-primary"
                >
                  <span className="flex items-center gap-2 text-muted">
                    <Phone className="h-3.5 w-3.5 text-secondary" />{" "}
                    {t("pilkhana")}
                  </span>
                  <span className="text-foreground">+91 91238 99472</span>
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
