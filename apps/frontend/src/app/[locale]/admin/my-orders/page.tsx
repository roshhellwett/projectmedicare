import { getTranslations } from "next-intl/server";
import { getMedicineOrders } from "@/lib/db/orders";
import { getPackageOrders } from "@/lib/db/package-orders";
import { getPharmacyStores } from "@/lib/db/stores";
import PageHeader from "@/components/PageHeader";
import { Store, ShieldAlert } from "lucide-react";
import StoreOrdersTable from "@/components/admin/StoreOrdersTable";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  noStore();
  const t = await getTranslations("AdminPage");
  
  const cookieStore = await cookies();
  const currentStoreId = cookieStore.get("admin_store_id")?.value;

  if (!currentStoreId) {
    return (
      <div className="container py-10 md:py-14">
        <PageHeader
          eyebrow="My Store"
          eyebrowIcon={<Store className="h-4 w-4" />}
          title="Store Selection Required"
          sub="You must select a store from the top navigation to view your active and completed orders."
        />
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-line bg-surface p-12 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <ShieldAlert className="h-8 w-8 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Store Selected</h3>
          <p className="text-muted max-w-md mx-auto">
            Please use the store selector at the top right of the navigation bar to choose your pharmacy store before viewing this page.
          </p>
        </div>
      </div>
    );
  }

  const [medicineOrders, packageOrders, stores] = await Promise.all([
    getMedicineOrders(),
    getPackageOrders(),
    getPharmacyStores(),
  ]);

  const currentStore = stores.find((s) => s.id === currentStoreId);

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow="Store Management"
        eyebrowIcon={<Store className="h-4 w-4" />}
        title="My Store Orders"
        sub={`Manage active and historical orders for ${currentStore?.name || "your store"}.`}
      />

      <StoreOrdersTable 
        medicineOrders={medicineOrders}
        packageOrders={packageOrders}
        currentStoreId={currentStoreId}
        stores={stores}
      />
    </div>
  );
}
