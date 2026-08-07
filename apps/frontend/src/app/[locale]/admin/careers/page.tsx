import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import { FileText } from "lucide-react";
import CareersTable from "@/components/admin/CareersTable";
import { getJobApplications } from "@/lib/db/careers";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCareersPage() {
  const t = await getTranslations("AdminPage.careers");
  const applications = await getJobApplications();
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
        eyebrowIcon={<FileText className="h-4 w-4" />}
        title={t("title")}
        sub={t("desc")}
      />

      <div className="card mt-8 !p-0 overflow-hidden">
        <CareersTable initialData={applications} />
      </div>
    </div>
  );
}
