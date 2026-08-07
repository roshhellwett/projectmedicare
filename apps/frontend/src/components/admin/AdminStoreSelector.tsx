"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store } from "lucide-react";
import type { PharmacyStore } from "@/lib/db/stores";

export default function AdminStoreSelector({
  stores,
}: {
  stores: PharmacyStore[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (storeId: string) => {
    setLoading(true);
    // Set cookie using a quick fetch to a small API route or just document.cookie
    document.cookie = `admin_store_id=${storeId}; path=/; max-age=86400`;
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md shadow-xl animate-scale-in">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Store className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Select Active Store
          </h2>
          <p className="text-sm text-muted mt-2">
            You must select which store you are currently operating from to
            manage medicine orders.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => handleSelect(store.id)}
              disabled={loading}
              className="flex items-center justify-between rounded-lg border border-line bg-surface p-4 text-left transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <span className="font-medium text-foreground">{store.name}</span>
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted" />
              )}
            </button>
          ))}
          {stores.length === 0 && (
            <p className="text-center text-sm text-muted py-4">
              No stores found in database.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
