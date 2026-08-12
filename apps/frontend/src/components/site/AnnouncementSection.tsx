import { getActiveAnnouncements, type Announcement } from "@/lib/db/announcements";
import { Megaphone } from "lucide-react";
import { formatDateTime } from "@/lib/utils/ist";

function AnnouncementItem({ item }: { item: Announcement }) {
  return (
    <li className="card card-marked is-accent !pl-5">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="badge badge-accent">
          <span className="live-dot is-accent mr-1" aria-hidden />
          <Megaphone className="h-3 w-3" /> Announcement
        </span>
        <span className="text-xs text-muted-soft">
          {formatDateTime(item.created_at)}
        </span>
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <h3 className="font-bold text-foreground text-base">
          {item.title}
        </h3>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
          {item.description}
        </p>
      </div>
    </li>
  );
}

export default async function AnnouncementSection({
  locale,
}: {
  locale: string;
}) {
  const items = await getActiveAnnouncements();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="section container bg-surface-muted border-b border-t border-line">
      <div className="mb-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0 max-w-2xl">
          <span className="eyebrow">
            <span className="live-dot is-accent" aria-hidden />
            Important Updates
          </span>
          <h2 className="section-title mt-2 text-foreground">Announcements</h2>
          <p className="section-sub mt-2">
            Read the latest critical updates and store announcements.
          </p>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {items.map((item) => (
          <AnnouncementItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}
