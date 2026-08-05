import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BulletinManager from "@/components/admin/BulletinManager";
import { getAllBulletins } from "@/lib/db/bulletins";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bulletin Board Manager — Janta Medicare Admin",
  description:
    "Publish, edit and remove notices and time-limited offers on the live bulletin board.",
  robots: { index: false, follow: false },
};

export default async function AdminBulletinsPage() {
  const items = await getAllBulletins();

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow="Admin"
        eyebrowIcon={<Megaphone className="h-4 w-4" />}
        title="Live Bulletin Board"
        sub="Notices stay until you delete them. Offers hide automatically after their end time and are cleaned up by the worker."
      />
      <BulletinManager initialItems={items} />
    </div>
  );
}
