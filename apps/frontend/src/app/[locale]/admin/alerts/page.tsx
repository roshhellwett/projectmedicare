import PageHeader from "@/components/PageHeader";
import AdminAlertsTable from "@/components/AdminAlertsTable";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getLocale } from "next-intl/server";

export default async function AdminAlertsPage() {
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
        eyebrow="Monitoring"
        eyebrowIcon={<AlertTriangle className="h-4 w-4" />}
        title="Low Stock & Expiry Alerts"
        sub="Monitor your inventory for items that need to be reordered or discarded."
      />

      <AdminAlertsTable />
    </div>
  );
}
