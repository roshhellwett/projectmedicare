import { getTranslations } from "next-intl/server";
import { stores } from "@/data/stores";
import { doctorChamberInfo } from "@/data/doctors";
import PageHeader from "@/components/PageHeader";
import {
  Building2,
  CalendarHeart,
  Clock,
  ExternalLink,
  FlaskConical,
  MapPin,
  Phone,
  Pill,
  Stethoscope,
} from "lucide-react";

const serviceIcons: Record<string, typeof Pill> = {
  Pharmacy: Pill,
  Pathology: FlaskConical,
  "Doctor Chambers": Stethoscope,
};

export default async function LocationsPage() {
  const t = await getTranslations("LocationsPage");

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<MapPin className="h-4 w-4" />}
        title={t("title")}
        sub={t("description")}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <article
            key={store.id}
            className={`card card-hover flex flex-col ${store.isMainHub ? "card-marked !pl-6" : ""}`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="icon-tile">
                <Building2 className="h-5 w-5" />
              </span>
              {store.isMainHub ? (
                <span className="badge badge-green">
                  <Stethoscope className="h-3 w-3" /> Main hub
                </span>
              ) : (
                <span className="badge badge-blue">
                  <Clock className="h-3 w-3" /> 8 AM – 10 PM
                </span>
              )}
            </div>

            <h2 className="text-lg leading-snug">{store.name}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-secondary-dark">
              {store.tagline}
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              {store.address}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {store.services.map((service) => {
                const Icon = serviceIcons[service] ?? Pill;
                return (
                  <span key={service} className="badge">
                    <Icon className="h-3 w-3" /> {service}
                  </span>
                );
              })}
            </div>

            <div className="map-embed mt-4">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(store.mapQuery)}&output=embed`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${store.name}`}
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
              {store.phones.map((phone) => (
                <a
                  key={phone.number}
                  href={`tel:${phone.number}`}
                  className="flex min-w-0 items-center gap-2.5 text-sm"
                >
                  <Phone className="h-4 w-4 shrink-0 text-secondary-dark" />
                  <span className="min-w-0 truncate">
                    <span className="text-muted">{phone.label}: </span>
                    <span className="tnum font-semibold text-foreground">
                      {phone.number}
                    </span>
                  </span>
                </a>
              ))}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm mt-1 w-full"
              >
                <ExternalLink className="h-4 w-4" /> {t("getDirections")}
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="card card-marked !pl-6">
          <span className="icon-tile">
            <Stethoscope className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg">{t("doctorTitle")}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t("drSeema")}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <span className="badge badge-green">
              ₹{doctorChamberInfo.fee}/- per checkup
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Clock className="h-3.5 w-3.5 text-secondary" /> Daily
            </span>
          </div>
        </div>

        <div className="card card-marked is-accent !pl-6">
          <span className="icon-tile is-accent">
            <CalendarHeart className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg">{t("campTitle")}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t("campInfo")}
          </p>
          <div className="mt-5 border-t border-line pt-4">
            <span className="badge badge-magenta">
              ₹100/- registration only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
