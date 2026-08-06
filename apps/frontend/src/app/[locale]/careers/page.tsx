import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import { Briefcase } from "lucide-react";
import CareersForm from "@/components/CareersForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CareersPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function CareersPage() {
  const t = await getTranslations("CareersPage");

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<Briefcase className="h-4 w-4" />}
        title={t("title")}
        sub={t("sub")}
      />

      <div className="mx-auto max-w-2xl mt-10">
        <CareersForm />
      </div>
    </div>
  );
}
