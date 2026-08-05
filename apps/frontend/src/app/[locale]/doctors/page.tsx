import { getTranslations } from "next-intl/server";
import { doctors, doctorChamberInfo } from "@/data/doctors";
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

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<Stethoscope className="h-4 w-4" />}
        title={t("title")}
        sub={t("description")}
      />

      {/* Chamber banner */}
      <div className="card card-marked mb-8 grid gap-5 !pl-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <span className="icon-tile shrink-0">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg leading-snug">{doctorChamberInfo.name}</h2>
            <p className="mt-1 text-sm text-muted">{t("chamberInfo")}</p>
            <span className="badge badge-green mt-3">
              ₹{doctorChamberInfo.fee}/- per checkup · Daily
            </span>
          </div>
        </div>
        <a
          href={`tel:${mainContact.diagnostic}`}
          className="btn btn-primary btn-sm shrink-0"
        >
          <Phone className="h-4 w-4" /> {t("bookAppointment")}
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <article key={doctor.name} className="card card-hover flex flex-col">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="icon-tile">
                <Stethoscope className="h-5 w-5" />
              </span>
              <span className="badge badge-blue">{doctor.department}</span>
            </div>
            <h2 className="text-base leading-snug">{doctor.name}</h2>
            <p className="mt-1.5 text-sm font-semibold text-secondary-dark">
              {doctor.specialty}
            </p>
            {doctor.qualifications.length > 0 && (
              <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                {doctor.qualifications.map((q) => (
                  <li
                    key={q}
                    className="flex items-start gap-2 text-xs leading-relaxed text-muted"
                  >
                    <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="min-w-0">{q}</span>
                  </li>
                ))}
              </ul>
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
