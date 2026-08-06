import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import { FileText } from "lucide-react";
import CareersTable from "@/components/admin/CareersTable";
import { getJobApplications } from "@/lib/db/careers";

export const dynamic = "force-dynamic";

export default async function AdminCareersPage() {
  const t = await getTranslations("AdminPage.careers");
  const applications = await getJobApplications();

  return (
    <div className="container py-10">
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
