import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import PageHeader from "@/components/PageHeader";
import { ShoppingBag } from "lucide-react";
import OrdersTable from "@/components/admin/OrdersTable";
import { getMedicineOrders } from "@/lib/db/orders";
import { getPharmacyStores } from "@/lib/db/stores";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const t = await getTranslations("AdminPage.orders");
  const [orders, stores] = await Promise.all([
    getMedicineOrders(),
    getPharmacyStores(),
  ]);

  const cookieStore = await cookies();
  const currentStoreId = cookieStore.get("admin_store_id")?.value;

  return (
    <div className="container py-10">
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
