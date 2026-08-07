import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BulletinManager from "@/components/admin/BulletinManager";
import { getAllBulletins } from "@/lib/db/bulletins";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bulletin Board Manager — Janta Medicare Admin",
  description:
    "Publish, edit and remove products and time-limited offers on the live bulletin board.",
  robots: { index: false, follow: false },
};

export default async function AdminBulletinsPage() {
  const items = await getAllBulletins();
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Products & Offers
            </h1>
            <p className="text-sm font-medium text-muted">
              Manage latest products, offers, and store announcements
            </p>
          </div>
        </div>
        <BulletinManager initialItems={items} />
      </div>
    </div>
  );
}
