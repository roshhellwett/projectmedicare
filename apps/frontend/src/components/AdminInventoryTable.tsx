"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Edit3, Loader2, Plus, Save, Search, Trash2, X, Package } from "lucide-react";
import { showToast } from "./Toast";

const PAGE_SIZE = 15;

export default function AdminInventoryTable() {
  const [items, setItems] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newBatch, setNewBatch] = useState({
    medicine_id: "",
    barcode: "",
    batch_number: "",
    expiry_date: "",
    buying_price: "",
    selling_price: "",
    mrp: "",
    stock: "",
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const sp = new URLSearchParams();
        if (query) sp.set("query", query);
        sp.set("page", String(page));
        sp.set("pageSize", String(PAGE_SIZE));

        const [resBatches, resMeds] = await Promise.all([
            fetch(`/api/admin/medicine-batches?${sp.toString()}`, { signal }),
            fetch(`/api/admin/medicines?pageSize=1000`, { signal })
        ]);
        
        const jsonBatches = await resBatches.json();
        const jsonMeds = await resMeds.json();
        
        if (signal?.aborted) return;
        setItems(jsonBatches.items || []);
        setTotal(jsonBatches.total || 0);
        setMedicines(jsonMeds.items || []);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        showToast("Failed to fetch inventory", "error");
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

  const handleAdd = async () => {
    if (!newBatch.medicine_id) {
      showToast("Select a medicine first", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/medicine-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            medicine_id: Number(newBatch.medicine_id),
            barcode: newBatch.barcode,
            batch_number: newBatch.batch_number,
            expiry_date: newBatch.expiry_date,
            buying_price: Number(newBatch.buying_price) || 0,
            selling_price: Number(newBatch.selling_price) || 0,
            mrp: Number(newBatch.mrp) || 0,
            stock: Number(newBatch.stock) || 0,
        }),
      });
      if (res.ok) {
        showToast("Batch added successfully");
        setShowAdd(false);
        setNewBatch({
          medicine_id: "", barcode: "", batch_number: "", expiry_date: "", buying_price: "", selling_price: "", mrp: "", stock: ""
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

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete this batch? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/medicine-batches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast("Batch deleted");
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
            placeholder="Search batches or scan barcode..."
            className="input !max-w-full"
            autoFocus
          />
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-primary shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Stock (Batch)
        </button>
      </div>

      {showAdd && (
        <div className="card mb-6 animate-fade-up">
          <h3 className="font-extrabold text-lg mb-4">Add New Batch / Stock</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Medicine *</label>
              <select
                value={newBatch.medicine_id}
                onChange={(e) => setNewBatch({ ...newBatch, medicine_id: e.target.value })}
                className="admin-input w-full"
              >
                <option value="">Select Medicine...</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>{m.medicine_name} ({m.pack_size})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Barcode</label>
              <input
                type="text"
                value={newBatch.barcode}
                onChange={(e) => setNewBatch({ ...newBatch, barcode: e.target.value })}
                placeholder="Scan Barcode"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Batch Number</label>
              <input
                type="text"
                value={newBatch.batch_number}
                onChange={(e) => setNewBatch({ ...newBatch, batch_number: e.target.value })}
                placeholder="Batch No."
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Expiry Date</label>
              <input
                type="text"
                value={newBatch.expiry_date}
                onChange={(e) => setNewBatch({ ...newBatch, expiry_date: e.target.value })}
                placeholder="MM/YY"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">MRP (₹)</label>
              <input
                type="number"
                value={newBatch.mrp}
                onChange={(e) => setNewBatch({ ...newBatch, mrp: e.target.value })}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Selling Price (₹)</label>
              <input
                type="number"
                value={newBatch.selling_price}
                onChange={(e) => setNewBatch({ ...newBatch, selling_price: e.target.value })}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Add Stock Qty</label>
              <input
                type="number"
                value={newBatch.stock}
                onChange={(e) => setNewBatch({ ...newBatch, stock: e.target.value })}
                className="admin-input w-full"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} disabled={saving} className="btn btn-green">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Batch"}
            </button>
            <button onClick={() => setShowAdd(false)} className="btn btn-outline !border-line !text-muted !bg-transparent">
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="table-shell overflow-x-auto">
        <table className="whitespace-nowrap">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Barcode / Batch</th>
              <th>Expiry</th>
              <th className="text-right">Stock</th>
              <th className="text-right">MRP (₹)</th>
              <th className="text-right">Price (₹)</th>
              <th className="text-right">GST (%)</th>
              <th className="text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center text-muted">No inventory found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td><span className="font-semibold">{item.medicine_name}</span><br/><span className="text-xs text-muted">{item.pack_size}</span></td>
                  <td><span className="font-mono text-sm">{item.barcode || 'No Barcode'}</span><br/><span className="text-xs text-muted">Batch: {item.batch_number}</span></td>
                  <td>{item.expiry_date}</td>
                  <td className="text-right font-bold text-primary">{item.stock}</td>
                  <td className="text-right text-muted line-through text-sm">₹{item.mrp}</td>
                  <td className="text-right font-bold text-secondary-dark">₹{item.selling_price}</td>
                  <td className="text-right font-bold text-muted">{item.gst ?? 0}%</td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl hover:bg-accent-soft text-muted hover:text-accent transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-end gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-page"><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-3 text-sm font-bold text-muted">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-page"><ChevronRight className="h-4 w-4" /></button>
          </div>
      )}
    </div>
  );
}
