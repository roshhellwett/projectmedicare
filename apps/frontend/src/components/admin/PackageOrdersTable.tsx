"use client";

import { useState } from "react";
import type { PackageOrder } from "@/lib/db/package-orders";
import type { PharmacyStore } from "@/lib/db/stores";
import { Trash2, Phone, Box, Loader2, CheckCircle2, Lock } from "lucide-react";
import { showToast } from "../Toast";

export default function PackageOrdersTable({ 
  initialOrders,
  currentStoreId,
  stores
}: { 
  initialOrders: PackageOrder[],
  currentStoreId: string,
  stores: PharmacyStore[]
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/package-orders/${id}/select`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: currentStoreId })
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to select booking");
      }
      
      const currentStore = stores.find(s => s.id === currentStoreId);
      
      setOrders((prev) => prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            store_id: currentStoreId,
            store: currentStore
          };
        }
        return item;
      }));
      showToast("Booking claimed successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/package-orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete");
      }
      setOrders((prev) => prev.filter((item) => item.id !== id));
      showToast("Booking deleted successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-surface-muted text-xs uppercase text-muted">
          <tr>
            <th className="p-4 font-semibold">Customer</th>
            <th className="p-4 font-semibold">Package</th>
            <th className="p-4 font-semibold">Date</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted">
                No bookings found.
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const isAssigned = !!order.store_id;
              const isMine = order.store_id === currentStoreId;
              const isOthers = isAssigned && !isMine;

              return (
                <tr key={order.id} className={`transition-colors ${isMine ? 'bg-primary/5' : 'hover:bg-surface/50'}`}>
                  <td className="p-4 align-top">
                    {isOthers ? (
                      <div className="flex items-center gap-2 text-muted italic">
                        <Lock className="h-4 w-4" /> Hidden for privacy
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-foreground">{order.customer_name}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-muted">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${order.phone_number}`} className="hover:text-primary transition-colors">
                            {order.phone_number}
                          </a>
                        </div>
                      </>
                    )}
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex items-center gap-2">
                      <span className="icon-tile !h-8 !w-8">
                        <Box className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-foreground">{order.pkg?.name || "Unknown Package"}</span>
                    </div>
                  </td>
                  <td className="p-4 align-top text-muted whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                    <div className="text-xs mt-1">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    {isAssigned ? (
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${isMine ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-muted'}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          {isMine ? 'Claimed by you' : `Claimed by ${order.store?.name || stores.find(s => s.id === order.store_id)?.name || 'Another Store'}`}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                        New Booking
                      </span>
                    )}
                  </td>
                  <td className="p-4 align-top text-right">
                    <div className="flex flex-col items-end gap-2">
                      {!isAssigned && (
                        <button
                          onClick={() => handleSelect(order.id)}
                          disabled={loadingId === order.id}
                          className="btn btn-primary btn-sm"
                        >
                          {loadingId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Claim Booking"
                          )}
                        </button>
                      )}
                      
                      {(!isAssigned || isMine) && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          disabled={loadingId === order.id}
                          className="btn btn-outline btn-sm !px-2 hover:bg-red-500/10 hover:border-red-500/30 text-red-500 border-red-200"
                          title="Delete Booking"
                        >
                          {loadingId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
