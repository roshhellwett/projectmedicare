"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { showToast } from "./Toast";
import type { Medicine } from "@/lib/data";

const PAGE_SIZE = 15;

export default function AdminMedicinesTable() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Medicine>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({
    medicine_name: "",
    pack_size: "",
    hsn_code: "",
    gst: "",
    mrp: "",
    selling_price: "",
    s_no: "",
  });
  const [saving, setSaving] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const sp = new URLSearchParams();
        if (query) sp.set("query", query);
        sp.set("page", String(page));
        sp.set("pageSize", String(PAGE_SIZE));
        sp.set("sortKey", "medicine_name");
        sp.set("dir", "asc");

        const res = await fetch(`/api/admin/medicines?${sp.toString()}`, {
          signal,
        });
        const json = await res.json();
        if (signal?.aborted) return;
        setItems(json.items || []);
        setTotal(json.total || 0);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        showToast("Failed to fetch medicines", "error");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [query, page],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void fetchData(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const normalizeData = (data: Partial<Medicine> | typeof newMed) => {
    return {
      ...data,
      pack_size: data.pack_size
        ? data.pack_size.replace(/\s*[xX*]\s*/g, " x ").trim()
        : "",
    };
  };

  const handleSave = async (item: Medicine) => {
    setSaving(true);
    try {
      const merged = { ...item, ...editData };
      const normalized = normalizeData(merged);
      const res = await fetch("/api/admin/medicines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });
      if (res.ok) {
        showToast("Medicine updated successfully");
        setEditId(null);
        setEditData({});
        fetchData();
      } else {
        const json = await res.json();
        showToast(json.error || "Failed to update", "error");
      }
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newMed.medicine_name.trim()) {
      showToast("Medicine name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const normalized = normalizeData(newMed) as typeof newMed;
      const res = await fetch("/api/admin/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine_name: normalized.medicine_name.trim(),
          pack_size: normalized.pack_size,
          hsn_code: normalized.hsn_code,
          gst: Number(normalized.gst) || 0,
          mrp: Number(normalized.mrp) || 0,
          selling_price: Number(normalized.selling_price) || 0,
          s_no: Number(normalized.s_no) || 0,
        }),
      });
      if (res.ok) {
        showToast("Medicine added successfully");
        setShowAdd(false);
        setNewMed({
          medicine_name: "",
          pack_size: "",
          hsn_code: "",
          gst: "",
          mrp: "",
          selling_price: "",
          s_no: "",
        });
        fetchData();
      } else {
        const json = await res.json();
        showToast(json.error || "Failed to add", "error");
      }
    } catch {
      showToast("Failed to add", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/medicines", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast("Medicine deleted");
        fetchData();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines..."
            className="input !max-w-full"
          />
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-primary shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Medicine
        </button>
      </div>

      {showAdd && (
        <div className="card mb-6 animate-fade-up">
          <h3 className="font-extrabold text-lg mb-4">Add New Medicine</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Medicine Name *</label>
              <input
                type="text"
                value={newMed.medicine_name}
                onChange={(e) =>
                  setNewMed({ ...newMed, medicine_name: e.target.value })
                }
                placeholder="Medicine Name"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">S.No</label>
              <input
                type="number"
                value={newMed.s_no}
                onChange={(e) =>
                  setNewMed({ ...newMed, s_no: e.target.value })
                }
                placeholder="S.No"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Pack Size</label>
              <input
                type="text"
                value={newMed.pack_size}
                onChange={(e) =>
                  setNewMed({ ...newMed, pack_size: e.target.value })
                }
                placeholder="e.g. 10x10"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">HSN Code</label>
              <input
                type="text"
                value={newMed.hsn_code}
                onChange={(e) =>
                  setNewMed({ ...newMed, hsn_code: e.target.value })
                }
                placeholder="HSN Code"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">MRP (₹)</label>
              <input
                type="number"
                value={newMed.mrp}
                onChange={(e) => setNewMed({ ...newMed, mrp: e.target.value })}
                placeholder="MRP"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Price (₹)</label>
              <input
                type="number"
                value={newMed.selling_price}
                onChange={(e) => setNewMed({ ...newMed, selling_price: e.target.value })}
                placeholder="Selling Price"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">GST %</label>
              <input
                type="number"
                value={newMed.gst}
                onChange={(e) => setNewMed({ ...newMed, gst: e.target.value })}
                placeholder="e.g. 5"
                className="admin-input w-full"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="btn btn-green"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="btn btn-outline !border-line !text-muted !bg-transparent"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="table-shell overflow-x-auto">
        <table className="whitespace-nowrap">
          <thead>
            <tr>
              <th className="w-16">S.No</th>
              <th>Medicine Name</th>
              <th>Pack Size</th>
              <th>HSN Code</th>
              <th className="text-right">MRP (₹)</th>
              <th className="text-right">Price (₹)</th>
              <th className="text-right">GST %</th>
              <th className="text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-muted">
                  No medicines found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={editId === item.id ? "bg-primary-soft" : ""}
                >
                  <td className="text-muted text-sm">
                    {editId === item.id ? (
                      <input
                        type="number"
                        defaultValue={item.s_no}
                        placeholder="S.No"
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            s_no: Number(e.target.value),
                          })
                        }
                        className="admin-input !w-16"
                      />
                    ) : (
                      item.s_no || "-"
                    )}
                  </td>
                  <td>
                    {editId === item.id ? (
                      <input
                        type="text"
                        defaultValue={item.medicine_name}
                        placeholder="Medicine Name"
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            medicine_name: e.target.value,
                          })
                        }
                        className="admin-input"
                      />
                    ) : (
                      <span className="font-semibold">
                        {item.medicine_name}
                      </span>
                    )}
                  </td>
                  <td>
                    {editId === item.id ? (
                      <input
                        type="text"
                        defaultValue={item.pack_size}
                        placeholder="Pack Size"
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            pack_size: e.target.value,
                          })
                        }
                        className="admin-input !w-24"
                      />
                    ) : (
                      <span className="text-muted text-sm">
                        {item.pack_size || "-"}
                      </span>
                    )}
                  </td>
                  <td>
                    {editId === item.id ? (
                      <input
                        type="text"
                        defaultValue={item.hsn_code}
                        placeholder="HSN Code"
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            hsn_code: e.target.value,
                          })
                        }
                        className="admin-input !w-24"
                      />
                    ) : (
                      <span className="text-muted text-sm">
                        {item.hsn_code || "-"}
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {editId === item.id ? (
                      <input
                        type="number"
                        defaultValue={item.mrp}
                        placeholder="MRP"
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            mrp: Number(e.target.value),
                          })
                        }
                        className="admin-input !w-20 text-right"
                      />
                    ) : (
                      <span className="text-muted text-sm line-through">
                        ₹{item.mrp || 0}
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {editId === item.id ? (
                      <input
                        type="number"
                        defaultValue={item.selling_price}
                        placeholder="Price"
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            selling_price: Number(e.target.value),
                          })
                        }
                        className="admin-input !w-20 text-right"
                      />
                    ) : (
                      <span className="font-bold text-secondary-dark">
                        ₹{item.selling_price || 0}
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {editId === item.id ? (
                      <input
                        type="number"
                        defaultValue={item.gst}
                        placeholder="GST %"
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            gst: Number(e.target.value),
                          })
                        }
                        className="admin-input !w-16 text-right"
                      />
                    ) : (
                      <span className="text-muted text-sm font-bold">
                        {item.gst || 0}%
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      {editId === item.id ? (
                        <>
                          <button
                            onClick={() => handleSave(item)}
                            disabled={saving}
                            className="p-2 rounded-xl bg-secondary-soft text-secondary-dark hover:bg-secondary/20 transition-colors"
                            title="Save"
                          >
                            {saving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditId(null);
                              setEditData({});
                            }}
                            className="p-2 rounded-xl bg-primary-soft text-primary hover:bg-primary/10 transition-colors"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditId(item.id);
                              setEditData({});
                            }}
                            className="p-2 rounded-xl hover:bg-primary-soft text-muted hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(item.id, item.medicine_name)
                            }
                            className="p-2 rounded-xl hover:bg-accent-soft text-muted hover:text-accent transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {total > 0
            ? `Showing ${(page - 1) * PAGE_SIZE + 1} to ${Math.min(
                page * PAGE_SIZE,
                total,
              )} of ${total}`
            : "No results"}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm font-bold text-muted">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
