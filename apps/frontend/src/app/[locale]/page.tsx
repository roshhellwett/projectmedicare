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
} from "lucide-react";
import CampSection from "@/components/site/CampSection";
import BulletinBoard from "@/components/site/BulletinBoard";

const stats = [
  { value: "3", label: "stores", icon: Store },
  { value: "12+", label: "doctors", icon: Users },
  { value: "1900+", label: "medicines", icon: Pill },
  { value: "210+", label: "tests", icon: FlaskConical },
];

const services = [
  {
    icon: Pill,
    title: "Pharmacy",
    desc: "1900+ medicines at honest Janta prices, every day from 8 AM to 10 PM.",
    href: "/medicines",
    cta: "View medicine list",
    tone: "",
  },
  {
    icon: FlaskConical,
    title: "Pathology & diagnostics",
    desc: "210+ lab tests with transparent patient rates across all three stores.",
    href: "/patient-rate-chart",
    cta: "View rate chart",
    tone: "is-green",
  },
  {
    icon: Stethoscope,
    title: "Doctor chambers",
    desc: "12+ specialist doctors sit through the week at the Shibpur main hub.",
    href: "/doctors",
    cta: "Meet our doctors",
    tone: "is-accent",
  },
];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "100% genuine medicines",
    desc: "Sourced only from verified pharmaceutical companies.",
    tone: "is-green",
  },
  {
    icon: Award,
    title: "Best prices in Howrah",
    desc: "Compare Janta prices against MRP — save up to 70%.",
    tone: "",
  },
  {
    icon: Shield,
    title: "Licensed & certified",
    desc: "Registered LLP holding all required pharmaceutical licenses.",
    tone: "is-accent",
  },
  {
    icon: Users,
    title: "12+ specialist doctors",
    desc: "General physicians to urologists, all under one roof.",
    tone: "is-green",
  },
];

const heroImages = [
  {
    src: "/dashboardimg/imagesourceone.webp",
    alt: "Janta Medicare pharmacy counter",
  },
  {
    src: "/dashboardimg/imagesourcetwo.webp",
    alt: "Janta Medicare diagnostics desk",
  },
  {
    src: "/dashboardimg/imagesourcethree.webp",
    alt: "Janta Medicare storefront",
  },
  {
    src: "/dashboardimg/imagesourcefour.webp",
    alt: "Janta Medicare doctor chamber",
  },
];

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="border-b border-line bg-surface">
        <div className="container grid gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <span className="eyebrow">
              <span className="live-dot" aria-hidden />
              Sirf Janta Kay Liye
            </span>
            <h1 className="mt-4 text-[1.9rem] leading-[1.15] sm:text-4xl lg:text-[3rem]">
              Healthcare for every citizen,
              <span className="block text-primary">at honest prices.</span>
            </h1>
            <p className="section-sub mt-4 text-base">{t("welcome")}</p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href={`/${locale}/medicines`} className="btn btn-primary">
                <Pill className="h-4 w-4" /> Browse medicines
              </Link>
              <Link href={`/${locale}/locations`} className="btn btn-outline">
                <MapPin className="h-4 w-4" /> Find our stores
              </Link>
            </div>

            <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3">
              {[
                { icon: Clock, k: "8 AM – 10 PM", v: "Open daily" },
                {
                  icon: Phone,
                  k: "+91 62907 45327",
                  v: "Toll free",
                  href: "tel:+916290745327",
                },
                { icon: ShieldCheck, k: "100% genuine", v: "Quality assured" },
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
            {heroImages.map((img, i) => (
              <div
                key={img.src}
                className="relative aspect-square overflow-hidden rounded-[12px] border border-line"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
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
              key={service.title}
              href={`/${locale}${service.href}`}
              className="card card-hover group flex flex-col"
            >
              <span className={`icon-tile ${service.tone}`}>
                <service.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg">{service.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {service.desc}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {service.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Sunday camp (admin managed) ---------- */}
      <div className="border-y border-line bg-surface">
        <CampSection />
      </div>

      {/* ---------- Live bulletin board (admin managed) ---------- */}
      <BulletinBoard locale={locale} />

      {/* ---------- Trust ---------- */}
      <section className="section border-t border-line bg-surface">
        <div className="container">
          <div className="mb-8 max-w-2xl">
            <span className="eyebrow">Why choose us</span>
            <h2 className="section-title mt-2">A trusted healthcare partner</h2>
            <p className="section-sub mt-2">
              Serving the people of Howrah with affordable, genuine and
              accessible care.
            </p>
          </div>
          <div className="trust-grid">
            {trustItems.map((item) => (
              <div key={item.title} className="trust-card">
                <span className={`icon-tile ${item.tone}`}>
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                    {item.desc}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Doctor checkup + CTA ---------- */}
      <section className="section container">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card card-marked is-accent flex flex-col justify-between gap-6 !pl-6">
            <div>
              <span className="icon-tile is-accent">
                <Stethoscope className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg">Doctor checkup</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                Dr. Seema Farhin sits every day at the Shibpur chamber, with 12+
                visiting specialists through the week.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <p className="tnum font-heading text-2xl font-bold text-primary-deep">
                ₹300
                <span className="ml-1 font-sans text-xs font-medium text-muted">
                  per checkup
                </span>
              </p>
              <Link
                href={`/${locale}/doctors`}
                className="btn btn-outline btn-sm"
              >
                Meet our doctors <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="card card-marked flex flex-col justify-between gap-6 !pl-6">
            <div>
              <span className="icon-tile">
                <Megaphone className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg">
                Looking for a medicine or a lab test?
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                Search our full list of 1900+ medicines and 210+ pathology tests
                at honest Janta prices — no hidden charges.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 border-t border-line pt-5">
              <Link
                href={`/${locale}/medicines`}
                className="btn btn-primary btn-sm"
              >
                <Pill className="h-4 w-4" /> Medicines
              </Link>
              <Link
                href={`/${locale}/patient-rate-chart`}
                className="btn btn-green btn-sm"
              >
                <FlaskConical className="h-4 w-4" /> Rate chart
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
