"use client";

import { useState } from "react";
import type { MedicineOrder } from "@/lib/db/orders";
import type { PackageOrder } from "@/lib/db/package-orders";
import type { PharmacyStore } from "@/lib/db/stores";
import OrdersTable from "./OrdersTable";
import PackageOrdersTable from "./PackageOrdersTable";
import { ShoppingBag, ClipboardList } from "lucide-react";

type CategoryTab = "medicines" | "packages";

export default function StoreOrdersTable({
  medicineOrders,
  packageOrders,
  currentStoreId,
  stores,
}: {
  medicineOrders: MedicineOrder[];
  packageOrders: PackageOrder[];
  currentStoreId: string;
  stores: PharmacyStore[];
}) {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("medicines");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category Tabs */}
      <div className="flex bg-surface-muted p-1.5 rounded-xl w-full sm:w-fit border border-line">
        <button
          onClick={() => setActiveCategory("medicines")}
          className={`flex items-center gap-2 flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
            activeCategory === "medicines"
              ? "bg-surface text-foreground shadow-sm ring-1 ring-black/5"
              : "text-muted hover:text-foreground"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Medicine Orders
        </button>
        <button
          onClick={() => setActiveCategory("packages")}
          className={`flex items-center gap-2 flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
            activeCategory === "packages"
              ? "bg-surface text-foreground shadow-sm ring-1 ring-black/5"
              : "text-muted hover:text-foreground"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Package Bookings
        </button>
      </div>

      {activeCategory === "medicines" ? (
        <OrdersTable 
          initialData={medicineOrders} 
          currentStoreId={currentStoreId} 
          stores={stores} 
          mode="history" 
        />
      ) : (
        <PackageOrdersTable 
          initialOrders={packageOrders} 
          currentStoreId={currentStoreId} 
          stores={stores} 
          mode="history" 
        />
      )}
    </div>
  );
}
