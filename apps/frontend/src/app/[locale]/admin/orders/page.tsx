import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import PageHeader from "@/components/PageHeader";
import { ShoppingBag } from "lucide-react";
import OrdersTable from "@/components/admin/OrdersTable";
import { getMedicineOrders } from "@/lib/db/orders";
import { getPharmacyStores } from "@/lib/db/stores";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const t = await getTranslations("AdminPage.orders");
  const [orders, stores] = await Promise.all([
    getMedicineOrders(),
    getPharmacyStores(),
  ]);

  const cookieStore = await cookies();
  const currentStoreId = cookieStore.get("admin_store_id")?.value;
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
        eyebrowIcon={<ShoppingBag className="h-4 w-4" />}
        title={t("title")}
        sub={t("desc")}
      />

      <div className="card mt-8 !p-0 overflow-hidden">
        <OrdersTable
          initialData={orders}
          currentStoreId={currentStoreId || ""}
          stores={stores}
        />
      </div>
    </div>
  );
}
