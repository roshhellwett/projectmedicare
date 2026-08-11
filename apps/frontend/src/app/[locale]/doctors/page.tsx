import { getTranslations } from "next-intl/server";
import { getDoctors } from "@/lib/db/doctors";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import PageHeader from "@/components/PageHeader";
import {
  BadgeCheck,
  CalendarCheck,
  GraduationCap,
  Phone,
  Stethoscope,
} from "lucide-react";
import { mainContact } from "@/data/stores";

export default async function DoctorsPage() {
  const t = await getTranslations("DoctorsPage");

  const allDoctors = await getDoctors();
  const dailyChamberDoctors = allDoctors.filter((d) => d.is_daily_chamber);
  const visitingDoctors = allDoctors.filter((d) => !d.is_daily_chamber);

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<Stethoscope className="h-4 w-4" />}
        title={t("title")}
        sub={t("description")}
      />

      {/* Chamber banners */}
      {dailyChamberDoctors.map((doctor) => (
        <div
          key={doctor.id}
          className="group relative mb-10 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md sm:flex sm:items-center sm:justify-between gap-6"
        >
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-transform duration-500 group-hover:scale-150"></div>

          <div className="relative z-10 flex min-w-0 items-start gap-5">
            <Link href={`/doctors/${doctor.id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-sm ring-1 ring-black/5 dark:border-surface-muted block transition-transform duration-500 hover:scale-105">
              <Image
                src={
                  doctor.image_url ||
                  (doctor.gender === "female"
                    ? "/assets/femaledoctor.webp"
                    : "/assets/maledoctor.webp")
                }
                alt={doctor.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </Link>
            <div className="min-w-0 pt-1">
              <div className="flex items-center gap-2">
                <Link href={`/doctors/${doctor.id}`} className="hover:text-primary transition-colors">
                  <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                    {doctor.name}
                  </h2>
                </Link>
                <BadgeCheck className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-1.5 text-sm md:text-base font-medium text-secondary-dark/90">
                {doctor.specialty}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-inset ring-primary/20 backdrop-blur-sm dark:bg-surface-muted">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Sits Every Day
                </span>
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400">
                  ₹{doctor.daily_fee}/- per checkup
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 shrink-0 sm:mt-0">
            <a
              href={`tel:${mainContact.diagnostic}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto hover:scale-[1.02]"
            >
              <Phone className="h-4 w-4" />
              {t("bookAppointment")}
            </a>
          </div>
        </div>
      ))}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visitingDoctors.map((doctor) => (
          <article
            key={doctor.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
          >
            {/* Top Bar */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400">
                {doctor.department}
              </span>
            </div>

            {/* Middle Section */}
            <div className="flex min-w-0 gap-4 mb-5">
              <Link href={`/doctors/${doctor.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-muted shadow-sm block transition-transform duration-300 hover:scale-105">
                <Image
                  src={
                    doctor.image_url ||
                    (doctor.gender === "female"
                      ? "/assets/femaledoctor.webp"
                      : "/assets/maledoctor.webp")
                  }
                  alt={doctor.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1 pt-1">
                <Link href={`/doctors/${doctor.id}`} className="hover:text-primary transition-colors">
                  <h2 className="text-lg font-bold tracking-tight text-foreground leading-tight">
                    {doctor.name}
                  </h2>
                </Link>
                <p className="mt-1.5 text-sm font-medium text-secondary-dark line-clamp-2 leading-relaxed">
                  {doctor.specialty}
                </p>
              </div>
            </div>

            {/* Qualifications */}
            {doctor.qualifications.length > 0 && (
              <div className="mt-auto mb-6 rounded-xl bg-surface-muted/50 p-4">
                <ul className="space-y-2.5">
                  {doctor.qualifications.map((q) => (
                    <li
                      key={q}
                      className="flex items-start gap-2.5 text-xs font-medium leading-relaxed text-muted-foreground"
                    >
                      <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                      <span className="min-w-0">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            {doctor.contact ? (
              <a
                href={`tel:${doctor.contact.replace(/\s+/g, "")}`}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                <Phone className="h-4 w-4" /> {t("bookDoctor")}
              </a>
            ) : (
              <div className="mt-auto h-11" /> /* Spacer if no button */
            )}
          </article>
        ))}
      </div>

      <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted">
        <BadgeCheck className="h-4 w-4 shrink-0 text-secondary" />
        {t("footerNote")}
      </p>
    </div>
  );
}
