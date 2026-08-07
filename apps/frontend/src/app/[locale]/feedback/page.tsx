import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import { MessageCircle } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FeedbackPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function FeedbackPage() {
  const t = await getTranslations("FeedbackPage");

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<MessageCircle className="h-4 w-4" />}
        title={t("title")}
        sub={t("sub")}
      />

      <div className="mx-auto max-w-2xl mt-10">
        <FeedbackForm />
      </div>
    </div>
  );
}
