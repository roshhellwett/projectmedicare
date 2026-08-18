"use client";

import { useState, useMemo } from "react";
import type { PackageOrder } from "@/lib/db/package-orders";
import type { PharmacyStore } from "@/lib/db/stores";
import { Trash2, Phone, Box, Loader2, CheckCircle2, Search, XCircle } from "lucide-react";
import { showToast } from "../Toast";
import SuperAdminDialog from "./SuperAdminDialog";

type TabType = "claimed" | "completed" | "cancelled";

export default function PackageOrdersTable({
  initialOrders,
  currentStoreId,
  stores,
  mode = "inbox",
}: {
  initialOrders: PackageOrder[];
  currentStoreId: string;
  stores: PharmacyStore[];
  mode?: "inbox" | "history";
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("claimed");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/package-orders/${id}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: currentStoreId }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to select booking");
      }

      const currentStore = stores.find((s) => s.id === currentStoreId);

      setOrders((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              store_id: currentStoreId,
              selected_at: new Date().toISOString(),
              store: currentStore,
              status: "confirmed",
            };
          }
          return item;
        }),
      );
      showToast("Booking claimed successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "preparing" | "out_for_delivery" | "completed" | "cancelled") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/package-orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to update status");
      }

      setOrders((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, status: newStatus };
          }
          return item;
        }),
      );
      showToast(`Booking marked as ${newStatus}`, "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (password: string) => {
    if (!deletingId) return;
    const id = deletingId;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/package-orders/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ superAdminPassword: password }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete");
      }
      setOrders((prev) => prev.filter((item) => item.id !== id));
      showToast("Booking deleted successfully", "success");
      setDeletingId(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete booking", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = orders;
    
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) => i.customer_name.toLowerCase().includes(q) || i.phone_number.includes(q)
      );
    }

    return filtered.filter((i) => {
      if (mode === "inbox") {
        const status = i.status || "pending";
        if (status !== "pending") return false;
        return !i.store_id || i.store_id === currentStoreId;
      } else {
        if (i.store_id !== currentStoreId) return false;
        const status = i.status || "pending";
        if (activeTab === "claimed") return ["confirmed", "preparing", "out_for_delivery"].includes(status);
        if (activeTab === "completed") return status === "completed";
        if (activeTab === "cancelled") return status === "cancelled";
        return true;
      }
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, searchQuery, mode, activeTab, currentStoreId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {mode === "history" ? (
          <div className="flex bg-surface-muted p-1 rounded-lg w-full sm:w-fit border border-line">
            <button
              onClick={() => setActiveTab("claimed")}
              className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "claimed"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "completed"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
        title="Delete Package Booking"
        description="Deleting a package booking is irreversible and requires super admin authorization. Please enter the master password."
      />

      <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-muted text-xs uppercase text-muted">
            <tr>
              <th className="p-4 font-semibold w-1/4">Customer</th>
              <th className="p-4 font-semibold w-1/3">Package</th>
              <th className="p-4 font-semibold">Dates</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No bookings found in this category.
                </td>
              </tr>
            ) : (
              filteredItems.map((order) => {
                const isAssigned = !!order.store_id;
                const isMine = order.store_id === currentStoreId;
                const status = order.status || "pending";

                return (
                  <tr
                    key={order.id}
                    className={`transition-colors ${isMine && ["confirmed", "preparing", "out_for_delivery"].includes(status) ? "bg-primary/5" : "hover:bg-surface/50"}`}
                  >
                    <td className="p-4 align-top">
                      <div className="font-semibold text-foreground text-base">
                        {order.customer_name}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-muted">
                        <Phone className="h-3.5 w-3.5" />
                        <a
                          href={`tel:${order.phone_number}`}
                          className="hover:text-primary transition-colors"
                        >
                          {order.phone_number}
                        </a>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="icon-tile !h-8 !w-8">
                          <Box className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-foreground">
                          {order.pkg?.name || "Unknown Package"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-top whitespace-nowrap">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Booked At</span>
                        {new Date(order.created_at).toLocaleDateString()}
                        <div className="text-xs text-muted mt-0.5">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {order.selected_at && (
                        <div>
                          <span className="text-xs font-semibold text-muted uppercase tracking-wider block mt-3">Claimed At</span>
                          {new Date(order.selected_at).toLocaleDateString()}
                          <div className="text-xs text-muted mt-0.5">
                            {new Date(order.selected_at).toLocaleTimeString()}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      {status === "pending" && (
                        <span className="inline-flex px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold border border-accent/20">
                          New Booking
                        </span>
                      )}
                      
                      {status === "confirmed" && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${isMine ? "bg-primary/10 text-primary border-primary/20" : "bg-surface-muted text-muted border-line"}`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {isMine
                            ? "Claimed by you"
                            : `Claimed by another store`}
                        </span>
                      )}

                      {status === "preparing" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
                          Preparing
                        </span>
                      )}

                      {status === "out_for_delivery" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200">
                          Out for Delivery
                        </span>
                      )}

                      {status === "completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
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
                            onClick={() => handleSelect(order.id)}
                            disabled={loadingId === order.id}
                            className="btn btn-primary btn-sm w-full max-w-[140px]"
                          >
                            {loadingId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              "Claim Booking"
                            )}
                          </button>
                        )}

                        {["confirmed", "preparing", "out_for_delivery"].includes(status) && isMine && (
                           <>
                            {status === "confirmed" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "preparing")}
                                disabled={loadingId === order.id}
                                className="btn btn-primary btn-sm w-full max-w-[140px]"
                              >
                                Mark Preparing
                              </button>
                            )}
                            {status === "preparing" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "out_for_delivery")}
                                disabled={loadingId === order.id}
                                className="btn btn-primary btn-sm w-full max-w-[140px]"
                              >
                                Out for Delivery
                              </button>
                            )}
                            {status === "out_for_delivery" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "completed")}
                                disabled={loadingId === order.id}
                                className="btn btn-primary btn-sm w-full max-w-[140px]"
                              >
                                Mark Completed
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(order.id, "cancelled")}
                              disabled={loadingId === order.id}
                              className="btn btn-outline btn-sm w-full max-w-[140px] text-danger border-danger/30 hover:bg-danger/10"
                            >
                              Cancel Booking
                            </button>
                           </>
                        )}

                        {(!isAssigned || isMine) && (
                          <button
                            onClick={() => setDeletingId(order.id)}
                            disabled={loadingId === order.id}
                            className="btn btn-outline btn-sm hover:bg-red-500/10 hover:border-red-500/30 text-red-500 border-red-200 w-full max-w-[140px] mt-2 flex justify-center"
                            title="Delete Booking"
                          >
                            {loadingId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </>
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
    </div>
  );
}
