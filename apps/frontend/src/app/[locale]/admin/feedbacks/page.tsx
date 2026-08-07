import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import { MessageCircle, ArrowLeft } from "lucide-react";
import FeedbacksTable from "@/components/admin/FeedbacksTable";
import { getFeedbacks } from "@/lib/db/feedbacks";
import Link from "next/link";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminFeedbacksPage() {
  const t = await getTranslations("AdminPage.feedbacks");
  const feedbacks = await getFeedbacks();
  const locale = await getLocale();

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link
          href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
      <PageHeader
        eyebrow="Management"
        eyebrowIcon={<MessageCircle className="h-4 w-4" />}
        title={t("title")}
        sub={t("desc")}
      />
      
      <div className="card mt-8 !p-0 overflow-hidden">
        <FeedbacksTable initialData={feedbacks} />
      </div>
    </div>
  );
}
