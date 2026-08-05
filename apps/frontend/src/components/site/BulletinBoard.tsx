import Link from "next/link";
import { ArrowRight, Megaphone, Pin, Tag, Timer } from "lucide-react";
import { getVisibleBulletins, type Bulletin } from "@/lib/db/bulletins";
import { formatDateTime, formatShortDate } from "@/lib/utils/ist";

export function BulletinItem({ item }: { item: Bulletin }) {
  const isOffer = item.kind === "offer";
  return (
    <li className={`card card-marked !pl-5 ${isOffer ? "is-green" : ""}`}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className={`badge ${isOffer ? "badge-green" : "badge-blue"}`}>
          {isOffer ? (
            <>
              <Tag className="h-3 w-3" /> Offer
            </>
          ) : (
            <>
              <Megaphone className="h-3 w-3" /> Notice
            </>
          )}
        </span>
        {item.pinned && (
          <span className="badge">
            <Pin className="h-3 w-3" /> Pinned
          </span>
        )}
        <span className="text-xs text-muted-soft">
          {formatDateTime(item.created_at)}
        </span>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
        {item.body}
      </p>
      {isOffer && item.ends_at && (
        <p className="mt-3 inline-flex items-center gap-1.5 border-t border-line pt-3 text-xs font-semibold text-accent">
          <Timer className="h-3.5 w-3.5" />
          Valid till {formatShortDate(item.ends_at)}
        </p>
      )}
    </li>
  );
}

export function BulletinEmpty() {
  return (
    <div className="card flex flex-col items-center gap-2 py-12 text-center">
      <span className="icon-tile">
        <Megaphone className="h-5 w-5" />
      </span>
      <p className="mt-2 font-heading text-base font-bold text-primary-deep">
        No notices right now
      </p>
      <p className="max-w-md text-sm text-muted">
        New offers and announcements appear here as soon as they are published.
      </p>
    </div>
  );
}

export default async function BulletinBoard({
  limit = 4,
  showAllLink = true,
  locale,
}: {
  limit?: number;
  showAllLink?: boolean;
  locale: string;
}) {
  const items = await getVisibleBulletins(limit);

  return (
    <section id="bulletin-board" className="section container">
      <div className="mb-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0 max-w-2xl">
          <span className="eyebrow">
            <span className="live-dot" aria-hidden />
            Live bulletin board
          </span>
          <h2 className="section-title mt-2">Latest notices &amp; offers</h2>
          <p className="section-sub mt-2">
            Updated by our team — every notice carries its exact Indian Standard
            Time date.
          </p>
        </div>
        {showAllLink && (
          <Link
            href={`/${locale}/bulletins`}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            View all notices <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <BulletinEmpty />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <BulletinItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
