import type { Metadata } from "next";
import { CalendarHeart } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CampManager from "@/components/admin/CampManager";
import { getActiveCamp, getCampArchive } from "@/lib/db/camp";

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

  return (
    <div className="container py-10 md:py-14">
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
