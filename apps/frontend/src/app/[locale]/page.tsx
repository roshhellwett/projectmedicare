import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import {
  ArrowRight,
  Award,
  Clock,
  FlaskConical,
  MapPin,
  Megaphone,
  Phone,
  Pill,
  Shield,
  ShieldCheck,
  Stethoscope,
  Store,
  Users,
  ShoppingBag,
} from "lucide-react";
import CampSection from "@/components/site/CampSection";
import BulletinBoard from "@/components/site/BulletinBoard";
import FeaturedPackages from "@/components/site/FeaturedPackages";
import { getGalleryImages } from "@/lib/db/gallery";

const stats = [
  { value: "3", label: "stores", icon: Store },
  { value: "12+", label: "doctors", icon: Users },
  { value: "1900+", label: "medicines", icon: Pill },
  { value: "210+", label: "tests", icon: FlaskConical },
];

const services = [
  {
    icon: Pill,
    key: "pharmacy",
    href: "/medicines",
    tone: "",
  },
  {
    icon: FlaskConical,
    key: "pathology",
    href: "/packages",
    tone: "is-green",
  },
  {
    icon: Stethoscope,
    key: "doctors",
    href: "/doctors",
    tone: "is-accent",
  },
];

const trustItems = [
  {
    icon: ShieldCheck,
    key: "genuine",
    tone: "is-green",
  },
  {
    icon: Award,
    key: "prices",
    tone: "",
  },
  {
    icon: Shield,
    key: "licensed",
    tone: "is-accent",
  },
  {
    icon: Users,
    key: "doctors",
    tone: "is-green",
  },
];

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();
  const gallery = await getGalleryImages();

  // Mix uploaded gallery images with static fallbacks, always keeping exactly 4
  const fallbackImages = [
    { src: "/images/hero-1.webp", altKey: "imgAlt1" },
    { src: "/images/hero-2.webp", altKey: "imgAlt2" },
    { src: "/images/hero-3.webp", altKey: "imgAlt3" },
    { src: "/images/hero-4.webp", altKey: "imgAlt4" },
  ];
  const galleryImages = gallery.map((g, i) => ({
    src: g.url,
    altKey: `imgAlt${(i % 4) + 1}`,
  }));
  const finalImages = galleryImages.length > 0
    ? galleryImages.slice(0, 4)
    : fallbackImages;

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="border-b border-line bg-surface">
        <div className="container grid gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <span className="eyebrow">
              <span className="live-dot" aria-hidden />
              {t("hero.eyebrow")}
            </span>
            <h1 className="mt-4 text-[1.9rem] leading-[1.15] sm:text-4xl lg:text-[3rem]">
              {t("hero.title1")}
              <span className="block text-primary">{t("hero.title2")}</span>
            </h1>
            <p className="section-sub mt-4 text-base">{t("welcome")}</p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href={`/${locale}/order`}
                className="btn btn-green relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full skew-x-[30deg] transition-transform duration-500 group-hover:translate-x-full"></span>
                <ShoppingBag className="h-4 w-4 relative z-10" />
                <span className="relative z-10">{t("hero.order")}</span>
              </Link>
              <Link href={`/${locale}/medicines`} className="btn btn-primary">
                <Pill className="h-4 w-4" /> {t("hero.browse")}
              </Link>
              <Link href={`/${locale}/locations`} className="btn btn-outline">
                <MapPin className="h-4 w-4" /> {t("hero.stores")}
              </Link>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-3">
              {[
                { icon: Clock, k: t("hero.timeKey"), v: t("hero.timeVal") },
                {
                  icon: ShieldCheck,
                  k: t("hero.trustKey"),
                  v: t("hero.trustVal"),
                },
                {
                  icon: Phone,
                  k: t("hero.tramDepot"),
                  v: "+91 62907 45327",
                  href: "tel:+916290745327",
                },
                {
                  icon: Phone,
                  k: t("hero.vivekVihar"),
                  v: "+91 82408 04490",
                  href: "tel:+918240804490",
                },
                {
                  icon: Phone,
                  k: t("hero.pilkhana"),
                  v: "+91 91238 99472",
                  href: "tel:+919123899472",
                },
              ].map((item) => (
                <div key={item.v} className="flex min-w-0 items-center gap-2.5">
                  <span className="icon-tile is-plain !h-9 !w-9">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <dt className="truncate text-sm font-semibold text-foreground">
                      {item.href ? (
                        <a href={item.href} className="hover:text-primary">
                          {item.k}
                        </a>
                      ) : (
                        item.k
                      )}
                    </dt>
                    <dd className="text-xs text-muted">{item.v}</dd>
                  </span>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3">
            {finalImages.map((img, i) => (
              <div
                key={img.src}
                className="relative aspect-square overflow-hidden rounded-[12px] border border-line"
              >
                <Image
                  src={img.src}
                  alt={t(`hero.${img.altKey}`)}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Stats strip ---------- */}
      <section className="border-b border-line bg-surface-muted">
        <div className="container grid grid-cols-2 gap-x-4 gap-y-5 py-7 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 items-center gap-3">
              <span className="icon-tile">
                <stat.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="tnum block font-heading text-xl font-bold leading-none text-primary-deep">
                  {stat.value}
                </span>
                <span className="block truncate text-xs text-muted">
                  {t(`stats.${stat.label}`)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      <section className="section bg-surface">
        <div className="container">
          <div className="mb-8 max-w-2xl">
            <span className="eyebrow">{t("trust.eyebrow")}</span>
            <h2 className="section-title mt-2">{t("trust.title")}</h2>
            <p className="section-sub mt-2">{t("trust.sub")}</p>
          </div>
          <div className="trust-grid">
            {trustItems.map((item) => (
              <div key={item.key} className="trust-card">
                <span className={`icon-tile ${item.tone}`}>
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {t(`trust.items.${item.key}.title`)}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                    {t(`trust.items.${item.key}.desc`)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Services card grid ---------- */}
      <section className="section container">
        <div className="mb-8 max-w-2xl">
          <span className="eyebrow">{t("services.eyebrow")}</span>
          <h2 className="section-title mt-2">{t("services.title")}</h2>
          <p className="section-sub mt-2">{t("services.sub")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.key}
              href={`/${locale}${service.href}`}
              className="card card-hover group flex flex-col"
            >
              <span className={`icon-tile ${service.tone}`}>
                <service.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg">
                {t(`services.list.${service.key}.title`)}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {t(`services.list.${service.key}.desc`)}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {t(`services.list.${service.key}.cta`)}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Featured Packages ---------- */}
      <FeaturedPackages locale={locale} />

      {/* ---------- Doctor checkup + CTA ---------- */}
      <section className="section container">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card card-marked is-accent flex flex-col justify-between gap-6 !pl-6">
            <div>
              <span className="icon-tile is-accent">
                <Stethoscope className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg">{t("cta.doctorTitle")}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                {t("cta.doctorDesc")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <p className="tnum font-heading text-2xl font-bold text-primary-deep">
                {t("cta.doctorPrice")}
                <span className="ml-1 font-sans text-xs font-medium text-muted">
                  {t("cta.doctorPriceSub")}
                </span>
              </p>
              <Link
                href={`/${locale}/doctors`}
                className="btn btn-outline btn-sm"
              >
                {t("cta.doctorLink")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="card card-marked flex flex-col justify-between gap-6 !pl-6">
            <div>
              <span className="icon-tile">
                <Megaphone className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg">{t("cta.searchTitle")}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                {t("cta.searchDesc")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 border-t border-line pt-5">
              <Link
                href={`/${locale}/medicines`}
                className="btn btn-primary btn-sm"
              >
                <Pill className="h-4 w-4" /> {t("cta.searchMed")}
              </Link>
              <Link
                href={`/${locale}/patient-rate-chart`}
                className="btn btn-green btn-sm"
              >
                <FlaskConical className="h-4 w-4" /> {t("cta.searchTest")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Sunday camp (admin managed) ---------- */}
      <div className="border-t border-line bg-surface">
        <CampSection />
      </div>

      {/* ---------- Live bulletin board (admin managed) ---------- */}
      <BulletinBoard locale={locale} />
    </div>
  );
}
