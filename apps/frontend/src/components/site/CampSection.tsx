import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CalendarHeart, IndianRupee, MapPin, Navigation } from "lucide-react";
import { getActiveCamp } from "@/lib/db/camp";
import { formatCampDate } from "@/lib/utils/ist";

export default async function CampSection() {
  const camp = await getActiveCamp();
  const t = await getTranslations("CampSection");

  return (
    <section id="sunday-camp" className="section container">
      <div className="mb-8 max-w-2xl">
        <span className="eyebrow">
          <CalendarHeart className="h-3.5 w-3.5" />
          {t("eyebrow")}
        </span>
        <h2 className="section-title mt-2">{t("title")}</h2>
        <p className="section-sub mt-2">{t("sub")}</p>
      </div>

      {!camp ? (
        <div className="card flex flex-col items-center gap-2 py-12 text-center">
          <span className="icon-tile">
            <CalendarHeart className="h-5 w-5" />
          </span>
          <p className="mt-2 font-heading text-base font-bold text-primary-deep">
            {t("emptyTitle")}
          </p>
          <p className="max-w-md text-sm text-muted">{t("emptyDesc")}</p>
        </div>
      ) : (
        <article className="card overflow-hidden !p-0">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-16/10 w-full bg-surface-muted md:aspect-auto md:min-h-[340px]">
              {camp.image_url ? (
                <Image
                  src={camp.image_url}
                  alt={`${camp.title} — ${camp.venue}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-soft">
                  <CalendarHeart className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-line p-5 md:border-l md:border-t-0 md:p-7">
              <span className="badge badge-green w-fit">
                {formatCampDate(camp.camp_date)}
              </span>
              <h3 className="text-xl leading-snug md:text-2xl">{camp.title}</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                {camp.description}
              </p>

              <div className="space-y-3 border-t border-line pt-4 text-sm">
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground">
                      {camp.venue}
                    </span>
                    <span className="text-muted">{camp.address}</span>
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <IndianRupee className="h-4 w-4 shrink-0 text-secondary" />
                  <span className="font-semibold text-foreground">
                    {camp.fee}
                  </span>
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${camp.venue} ${camp.address}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm w-fit"
              >
                <Navigation className="h-4 w-4" />
                {t("getDirections")}
              </a>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
