import type { Metadata } from "next";
import { Megaphone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import AnnouncementManager from "@/components/admin/AnnouncementManager";
import { getAllAnnouncements } from "@/lib/db/announcements";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Announcements Manager — Janta Medicare LLP Admin",
  description: "Publish and manage dynamic announcements on the homepage.",
  robots: { index: false, follow: false },
};

export default async function AdminAnnouncementsPage() {
  const items = await getAllAnnouncements(20);
  const locale = await getLocale();

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-6">
        <Link
          href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
      <div className="mx-auto max-w-4xl space-y-9">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Announcements
            </h1>
            <p className="text-sm font-medium text-muted">
              Publish critical announcements to appear prominently on the homepage.
            </p>
          </div>
        </div>
        <AnnouncementManager initialItems={items} />
      </div>
    </div>
  );
}
