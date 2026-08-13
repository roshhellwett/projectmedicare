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

type Rate = {
  id: number;
  sl_no: number;
  test_name: string;
  jm_rate: number | string;
};

const PAGE_SIZE = 15;

export default function AdminRatesTable() {
  const [items, setItems] = useState<Rate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Rate>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newRate, setNewRate] = useState({
    test_name: "",
    jm_rate: "",
    sl_no: "",
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
        sp.set("sortKey", "test_name");
        sp.set("dir", "asc");

        const res = await fetch(`/api/admin/rates?${sp.toString()}`, {
          signal,
        });
        const json = await res.json();
        if (signal?.aborted) return;
        setItems(json.items || []);
        setTotal(json.total || 0);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        showToast("Failed to fetch rates", "error");
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

  const handleSave = async (item: Rate) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, ...editData }),
      });
      if (res.ok) {
        showToast("Rate updated successfully");
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
    if (!newRate.test_name.trim()) {
      showToast("Test name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_name: newRate.test_name,
          jm_rate: newRate.jm_rate,
          sl_no: Number(newRate.sl_no) || 0,
        }),
      });
      if (res.ok) {
        showToast("Rate added successfully");
        setShowAdd(false);
        setNewRate({ test_name: "", jm_rate: "", sl_no: "" });
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
      const res = await fetch("/api/admin/rates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast("Rate deleted");
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
            placeholder="Search tests..."
            className="input !max-w-full"
          />
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-primary shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Test
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card mb-6 animate-fade-up">
          <h3 className="font-extrabold text-lg mb-4">Add New Test</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              value={newRate.test_name}
              onChange={(e) =>
                setNewRate({ ...newRate, test_name: e.target.value })
              }
              placeholder="Test Name *"
              className="admin-input lg:col-span-2"
            />
            <input
              type="text"
              value={newRate.jm_rate}
              onChange={(e) =>
                setNewRate({ ...newRate, jm_rate: e.target.value })
              }
              placeholder="Janta Rate (₹)"
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
              <th className="w-16">Sl.No</th>
              <th aria-sort="ascending">Test Name</th>
              <th className="text-right">Janta Rate (₹)</th>
              <th className="text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-muted">
                  No tests found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={editId === item.id ? "bg-primary-soft" : ""}
                >
                  <td className="text-muted text-sm">{item.sl_no}</td>
                  <td>
                    {editId === item.id ? (
                      <input
                        type="text"
                        defaultValue={item.test_name}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            test_name: e.target.value,
                          })
                        }
                        className="admin-input"
                      />
                    ) : (
                      <span className="font-semibold">{item.test_name}</span>
                    )}
                  </td>
                  <td className="text-right">
                    {editId === item.id ? (
                      <input
                        type="text"
                        defaultValue={String(item.jm_rate)}
                        onChange={(e) =>
                          setEditData({ ...editData, jm_rate: e.target.value })
                        }
                        className="admin-input !w-28 text-right"
                      />
                    ) : (
                      <span className="font-bold text-secondary-dark">
                        {typeof item.jm_rate === "number" ||
                        !isNaN(Number(item.jm_rate))
                          ? `₹${item.jm_rate}`
                          : item.jm_rate}
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
                              handleDelete(item.id, item.test_name)
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
