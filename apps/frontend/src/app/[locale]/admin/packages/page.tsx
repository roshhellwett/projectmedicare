import { getTranslations, getLocale } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import { Box, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPackages } from "@/lib/db/packages";
import PackageManager from "@/components/admin/PackageManager";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  const t = await getTranslations("AdminPage");
  const locale = await getLocale();
  const packages = await getPackages();

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
        eyebrow={t("eyebrow")}
        eyebrowIcon={<Box className="h-4 w-4" />}
        title="Health Packages"
        sub="Manage diagnostic health packages, their tests, and pricing."
      />
      <div className="mt-8">
        <PackageManager initialPackages={packages} />
      </div>
    </div>
  );
}
