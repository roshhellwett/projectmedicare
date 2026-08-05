import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { BulletinEmpty, BulletinItem } from "@/components/site/BulletinBoard";
import { getVisibleBulletins } from "@/lib/db/bulletins";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Notices & Offers — Janta Medicare Bulletin Board",
  description:
    "Live bulletin board from Janta Medicare: current offers, camp announcements and pharmacy notices with exact Indian Standard Time dates.",
  openGraph: {
    title: "Notices & Offers — Janta Medicare Bulletin Board",
    description:
      "Current offers, camp announcements and notices from Janta Medicare.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function BulletinsPage() {
  const items = await getVisibleBulletins(60);

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow="Live Bulletin Board"
        eyebrowIcon={<Megaphone className="h-4 w-4" />}
        title="Notices & Offers"
        sub="Everything currently active, newest first. Offers disappear automatically once they expire."
      />
      {items.length === 0 ? (
        <BulletinEmpty />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <BulletinItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
