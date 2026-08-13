"use client";

import { useState, useMemo } from "react";
import { Download, Trash2, Loader2, CheckCircle2, Lock, XCircle, Search } from "lucide-react";
import type { MedicineOrder } from "@/lib/db/orders";
import type { PharmacyStore } from "@/lib/db/stores";
import { showToast } from "../Toast";
import AdminCartEditor from "./AdminCartEditor";
import SuperAdminDialog from "./SuperAdminDialog";

type TabType = "claimed" | "delivered" | "cancelled";

export default function OrdersTable({
  initialData,
  currentStoreId,
  stores,
  mode = "inbox",
}: {
  initialData: MedicineOrder[];
  currentStoreId: string;
  stores: PharmacyStore[];
  mode?: "inbox" | "history";
}) {
  const [items, setItems] = useState<MedicineOrder[]>(initialData);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("claimed");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSelect = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: currentStoreId }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to select order");
      }

      const currentStore = stores.find((s) => s.id === currentStoreId);

      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              assigned_store_id: currentStoreId,
              selected_at: new Date().toISOString(),
              store: currentStore,
              status: "claimed",
            };
          }
          return item;
        }),
      );
      showToast("Order claimed successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "delivered" | "cancelled") => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to update status");
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, status: newStatus };
          }
          return item;
        }),
      );
      showToast(`Order marked as ${newStatus}`, "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (password: string) => {
    if (!deletingId) return;
    const id = deletingId;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ superAdminPassword: password }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast("Order deleted successfully", "success");
      setDeletingId(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete order", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = items;
    
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) => i.name.toLowerCase().includes(q) || i.phone.includes(q)
      );
    }

    return filtered.filter((i) => {
      if (mode === "inbox") {
        const status = i.status || "pending";
        if (status !== "pending") return false;
        return !i.assigned_store_id || i.assigned_store_id === currentStoreId;
      } else {
        if (i.assigned_store_id !== currentStoreId) return false;
        if (activeTab === "claimed") return i.status === "claimed";
        if (activeTab === "delivered") return i.status === "delivered";
        if (activeTab === "cancelled") return i.status === "cancelled";
        return true;
      }
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [items, searchQuery, mode, activeTab, currentStoreId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {mode === "history" ? (
          <div className="flex bg-surface-muted p-1 rounded-lg w-full sm:w-fit border border-line">
            <button
              onClick={() => setActiveTab("claimed")}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "claimed"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("delivered")}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "delivered"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Delivered
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "cancelled"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Cancelled
            </button>
          </div>
        ) : <div />}
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="search"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-line rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <SuperAdminDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        description="Deleting an order is irreversible and requires super admin authorization. Please enter the master password."
      />

      <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="p-4 font-semibold text-secondary-dark w-1/4">
                Customer Info
              </th>
              <th className="p-4 font-semibold text-secondary-dark w-1/3">
                Address, Note & Cart
              </th>
              <th className="p-4 font-semibold text-secondary-dark">Dates</th>
              <th className="p-4 font-semibold text-secondary-dark">Status</th>
              <th className="p-4 text-right font-semibold text-secondary-dark">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No orders found in this category.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isAssigned = !!item.assigned_store_id;
                const isMine = item.assigned_store_id === currentStoreId;
                
                const status = item.status || "pending";

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${isMine && status === "claimed" ? "bg-primary/5" : "hover:bg-surface-muted"}`}
                  >
                    <td className="p-4 align-top">
                      <div className="font-medium text-foreground text-base">
                        {item.name}
                      </div>
                      <div className="text-muted mt-1">{item.phone}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-muted">{item.address}</div>
                      {item.note && (
                        <div className="mt-2 text-sm text-secondary-dark bg-accent/5 p-3 border border-accent/20 rounded-md">
                          <span className="font-semibold block mb-1">Note:</span>
                          {item.note}
                        </div>
                      )}
                      {item.cart_items && item.cart_items.length > 0 && (
                        <AdminCartEditor orderId={item.id} initialCart={item.cart_items} />
                      )}
                    </td>
                    <td className="p-4 align-top whitespace-nowrap">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Ordered At</span>
                        {new Date(item.created_at).toLocaleDateString()}
                        <div className="text-xs text-muted">
                          {new Date(item.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {item.selected_at && (
                        <div>
                          <span className="text-xs font-semibold text-muted uppercase tracking-wider block mt-3">Claimed At</span>
                          {new Date(item.selected_at).toLocaleDateString()}
                          <div className="text-xs text-muted">
                            {new Date(item.selected_at).toLocaleTimeString()}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      {status === "pending" && (
                        <span className="inline-flex px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold border border-accent/20">
                          New Order
                        </span>
                      )}
                      
                      {status === "claimed" && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${isMine ? "bg-primary/10 text-primary border-primary/20" : "bg-surface-muted text-muted border-line"}`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {isMine
                            ? "Claimed by you"
                            : `Claimed by ${item.store?.name || "Another Store"}`}
                        </span>
                      )}

                      {status === "delivered" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Delivered
                        </span>
                      )}

                      {status === "cancelled" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold border border-red-200">
                          <XCircle className="h-3 w-3" />
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        {status === "pending" && (
                          <button
                            onClick={() => handleSelect(item.id)}
                            disabled={processingId === item.id}
                            className="btn btn-primary btn-sm w-full max-w-[140px]"
                          >
                            {processingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              "Select & Prepare"
                            )}
                          </button>
                        )}

                        {status === "claimed" && isMine && (
                           <>
                            <button
                              onClick={() => handleUpdateStatus(item.id, "delivered")}
                              disabled={processingId === item.id}
                              className="btn btn-primary btn-sm w-full max-w-[140px]"
                            >
                              Mark Delivered
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id, "cancelled")}
                              disabled={processingId === item.id}
                              className="btn btn-outline btn-sm w-full max-w-[140px] text-danger border-danger/30 hover:bg-danger/10"
                            >
                              Cancel Order
                            </button>
                           </>
                        )}

                        {(!isAssigned || isMine) && (
                          <div className="flex items-center justify-end gap-2 w-full max-w-[140px] mt-2">
                            <a
                              href={`/api/admin/orders/${item.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline btn-sm !px-2 flex-1 flex justify-center"
                              title="View Prescription"
                            >
                              <Download className="h-4 w-4 text-blue-500" />
                            </a>

                            <button
                              onClick={() => setDeletingId(item.id)}
                              disabled={processingId === item.id}
                              className="btn btn-outline btn-sm !px-2 flex-1 flex justify-center hover:bg-red-500/10 hover:border-red-500/30"
                              title="Delete Order Permanently"
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
    </div>
  );
}
