import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import { Pill } from "lucide-react";
import OrderForm from "@/components/OrderForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OrderPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function OrderPage() {
  const t = await getTranslations("OrderPage");

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<Pill className="h-4 w-4" />}
        title={t("title")}
        sub={t("sub")}
      />

      <div className="mx-auto max-w-2xl mt-10">
        <OrderForm />
      </div>
    </div>
  );
}
