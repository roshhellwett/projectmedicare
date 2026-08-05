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

type Medicine = {
  id: number;
  s_no: number;
  medicine_name: string;
  selling_price: number;
  pack_size: string;
  mrp: number;
};

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
    selling_price: "",
    pack_size: "",
    mrp: "",
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
    // Deferred so the request (and its state updates) never run synchronously
    // inside the effect body, and stale responses are dropped on re-run.
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

  const handleSave = async (item: Medicine) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/medicines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, ...editData }),
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
      const res = await fetch("/api/admin/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine_name: newMed.medicine_name,
          selling_price: Number(newMed.selling_price) || 0,
          pack_size: newMed.pack_size,
          mrp: Number(newMed.mrp) || 0,
          s_no: Number(newMed.s_no) || 0,
        }),
      });
      if (res.ok) {
        showToast("Medicine added successfully");
        setShowAdd(false);
        setNewMed({
          medicine_name: "",
          selling_price: "",
          pack_size: "",
          mrp: "",
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
      {/* Toolbar */}
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

      {/* Add Form */}
      {showAdd && (
        <div className="card mb-6 animate-fade-up">
          <h3 className="font-extrabold text-lg mb-4">Add New Medicine</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              value={newMed.medicine_name}
              onChange={(e) =>
                setNewMed({ ...newMed, medicine_name: e.target.value })
              }
              placeholder="Medicine Name *"
              className="admin-input col-span-1 lg:col-span-2"
            />
            <input
              type="number"
              value={newMed.selling_price}
              onChange={(e) =>
                setNewMed({ ...newMed, selling_price: e.target.value })
              }
              placeholder="Selling Price"
              className="admin-input"
            />
            <input
              type="text"
              value={newMed.pack_size}
              onChange={(e) =>
                setNewMed({ ...newMed, pack_size: e.target.value })
              }
              placeholder="Pack Size"
              className="admin-input"
            />
            <input
              type="number"
              value={newMed.mrp}
              onChange={(e) => setNewMed({ ...newMed, mrp: e.target.value })}
              placeholder="MRP"
              className="admin-input"
            />
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

      {/* Table */}
      <div className="table-shell overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="w-16">S.No</th>
              <th>Medicine Name</th>
              <th>Pack Size</th>
              <th className="text-right">MRP (₹)</th>
              <th className="text-right">Selling Price (₹)</th>
              <th className="text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-muted">
                  No medicines found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={editId === item.id ? "bg-primary-soft" : ""}
                >
                  <td className="text-muted text-sm">{item.s_no}</td>
                  <td>
                    {editId === item.id ? (
                      <input
                        type="text"
                        defaultValue={item.medicine_name}
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
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            pack_size: e.target.value,
                          })
                        }
                        className="admin-input !w-28"
                      />
                    ) : (
                      <span className="text-muted text-sm">
                        {item.pack_size || "-"}
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {editId === item.id ? (
                      <input
                        type="number"
                        defaultValue={item.mrp}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            mrp: Number(e.target.value),
                          })
                        }
                        className="admin-input !w-24 text-right"
                      />
                    ) : (
                      <span className="text-muted line-through text-sm">
                        ₹{item.mrp}
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {editId === item.id ? (
                      <input
                        type="number"
                        defaultValue={item.selling_price}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            selling_price: Number(e.target.value),
                          })
                        }
                        className="admin-input !w-24 text-right"
                      />
                    ) : (
                      <span className="font-bold text-secondary-dark">
                        ₹{Number(item.selling_price).toFixed(2)}
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

      {/* Pagination */}
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
