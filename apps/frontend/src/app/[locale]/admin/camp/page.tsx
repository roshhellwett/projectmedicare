import type { Metadata } from "next";
import { CalendarHeart } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CampManager from "@/components/admin/CampManager";
import { getActiveCamp, getCampArchive } from "@/lib/db/camp";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sunday Camp Manager — Janta Medicare Admin",
  description:
    "Publish and update the weekly Sunday free health camp post shown on the website.",
  robots: { index: false, follow: false },
};

export default async function AdminCampPage() {
  const [active, archive] = await Promise.all([
    getActiveCamp(),
    getCampArchive(),
  ]);

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
      <PageHeader
        eyebrow="Admin"
        eyebrowIcon={<CalendarHeart className="h-4 w-4" />}
        title="Sunday Camp Post"
        sub="Publish the upcoming camp. Publishing a new week automatically archives the previous post."
      />
      <CampManager initialActive={active} initialArchive={archive} />
    </div>
  );
}
