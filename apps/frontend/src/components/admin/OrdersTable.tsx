"use client";

import { useState } from "react";
import { Download, Trash2, Loader2, CheckCircle2, Lock } from "lucide-react";
import type { MedicineOrder } from "@/lib/db/orders";
import type { PharmacyStore } from "@/lib/db/stores";
import { showToast } from "../Toast";

export default function OrdersTable({ 
  initialData, 
  currentStoreId,
  stores 
}: { 
  initialData: MedicineOrder[],
  currentStoreId: string,
  stores: PharmacyStore[]
}) {
  const [items, setItems] = useState<MedicineOrder[]>(initialData);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSelect = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}/select`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: currentStoreId })
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to select order");
      }
      
      const currentStore = stores.find(s => s.id === currentStoreId);
      
      setItems((prev) => prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            assigned_store_id: currentStoreId,
            selected_at: new Date().toISOString(),
            store: currentStore
          };
        }
        return item;
      }));
      showToast("Order claimed successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order? The prescription image will also be deleted to free up space.")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast("Order deleted successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface">
            <th className="p-4 font-semibold text-secondary-dark">Customer Info</th>
            <th className="p-4 font-semibold text-secondary-dark">Address & Note</th>
            <th className="p-4 font-semibold text-secondary-dark">Date</th>
            <th className="p-4 font-semibold text-secondary-dark">Status</th>
            <th className="p-4 text-right font-semibold text-secondary-dark">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted">
                No orders received yet.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const isAssigned = !!item.assigned_store_id;
              const isMine = item.assigned_store_id === currentStoreId;
              const isOthers = isAssigned && !isMine;

              return (
                <tr key={item.id} className={`transition-colors ${isMine ? 'bg-primary/5' : 'hover:bg-surface/50'}`}>
                  <td className="p-4 align-top">
                    {isOthers ? (
                      <div className="flex items-center gap-2 text-muted italic">
                        <Lock className="h-4 w-4" /> Hidden for privacy
                      </div>
                    ) : (
                      <>
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-muted mt-1">{item.phone}</div>
                      </>
                    )}
                  </td>
                  <td className="p-4 align-top max-w-xs">
                    {isOthers ? (
                      <div className="text-muted italic">Hidden</div>
                    ) : (
                      <>
                        <div className="text-muted">{item.address}</div>
                        {item.note && (
                          <div className="mt-2 text-xs text-secondary-dark bg-surface p-2 border border-line rounded">
                            {item.note}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="p-4 align-top text-muted whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString()}
                    <div className="text-xs mt-1">
                      {new Date(item.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    {isAssigned ? (
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${isMine ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-muted'}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          {isMine ? 'Claimed by you' : `Claimed by ${item.store?.name || 'Another Store'}`}
                        </span>
                        {item.selected_at && (
                          <div className="text-[10px] text-muted mt-1.5 ml-1">
                            {new Date(item.selected_at).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                        New Order
                      </span>
                    )}
                  </td>
                  <td className="p-4 align-top text-right">
                    <div className="flex flex-col items-end gap-2">
                      {!isAssigned && (
                        <button
                          onClick={() => handleSelect(item.id)}
                          disabled={processingId === item.id}
                          className="btn btn-primary btn-sm"
                        >
                          {processingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Select & Prepare"
                          )}
                        </button>
                      )}
                      
                      {(!isAssigned || isMine) && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/admin/orders/${item.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm !px-2"
                            title="View Prescription"
                          >
                            <Download className="h-4 w-4 text-blue-500" />
                          </a>
                          
                          {/* Only the store that selected it can delete it (or if unassigned, anyone can delete it just in case it's spam) */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={processingId === item.id}
                            className="btn btn-outline btn-sm !px-2 hover:bg-red-500/10 hover:border-red-500/30"
                            title="Delete Order"
                          >
                            {processingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </button>
                        </div>
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
