import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import { ClipboardList } from "lucide-react";
import { getPackageOrders } from "@/lib/db/package-orders";
import { getPharmacyStores } from "@/lib/db/stores";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PackageOrdersTable from "@/components/admin/PackageOrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminPackageOrdersPage() {
  const t = await getTranslations("AdminPage");
  const [orders, stores] = await Promise.all([
    getPackageOrders(),
    getPharmacyStores(),
  ]);

  const cookieStore = await cookies();
  const currentStoreId = cookieStore.get("admin_store_id")?.value;
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
        eyebrow={t("eyebrow")}
        eyebrowIcon={<ClipboardList className="h-4 w-4" />}
        title="Package Bookings"
        sub="Manage incoming customer bookings for diagnostic packages."
      />
      <div className="mt-8">
        <PackageOrdersTable
          initialOrders={orders}
          currentStoreId={currentStoreId || ""}
          stores={stores}
        />
      </div>
    </div>
  );
}
