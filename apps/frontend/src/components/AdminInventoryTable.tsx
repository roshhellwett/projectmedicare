"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [editId, setEditId] = useState<number | null>(null);
  
  const [medSearch, setMedSearch] = useState("");
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [newBatch, setNewBatch] = useState({
    medicine_id: "",
    barcode: "",
    batch_number: "",
    expiry_date: "",
    buying_price: "",
    selling_price: "",
    mrp: "",
    stock: "",
    gst: "",
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMedDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!newBatch.medicine_id) {
      showToast("Select a medicine first", "error");
      return;
    }
    setSaving(true);
    try {
      const medId = Number(newBatch.medicine_id);
      const selectedMed = medicines.find(m => m.id === medId);
      
      // Sync GST back to medicines table if changed
      const newGst = Number(newBatch.gst) || 0;
      if (selectedMed && selectedMed.gst !== newGst) {
          await fetch("/api/admin/medicines", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: medId, gst: newGst })
          }).catch(console.error);
      }

      const method = editId ? "PUT" : "POST";
      const body = {
          id: editId || undefined,
          medicine_id: medId,
          barcode: newBatch.barcode,
          batch_number: newBatch.batch_number,
          expiry_date: newBatch.expiry_date,
          buying_price: Number(newBatch.buying_price) || 0,
          selling_price: Number(newBatch.selling_price) || 0,
          mrp: Number(newBatch.mrp) || 0,
          stock: Number(newBatch.stock) || 0,
      };

      const res = await fetch("/api/admin/medicine-batches", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast(`Batch ${editId ? 'updated' : 'added'} successfully`);
        resetForm();
        fetchData();
      } else {
        const json = await res.json();
        showToast(json.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
      setEditId(item.id);
      setNewBatch({
          medicine_id: String(item.medicine_id),
          barcode: item.barcode || "",
          batch_number: item.batch_number || "",
          expiry_date: item.expiry_date || "",
          buying_price: String(item.buying_price || ""),
          selling_price: String(item.selling_price || ""),
          mrp: String(item.mrp || ""),
          stock: String(item.stock || ""),
          gst: String(item.gst || 0),
      });
      setMedSearch(item.medicine_name || "");
      setShowAdd(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const resetForm = () => {
      setShowAdd(false);
      setEditId(null);
      setMedSearch("");
      setNewBatch({
        medicine_id: "", barcode: "", batch_number: "", expiry_date: "", buying_price: "", selling_price: "", mrp: "", stock: "", gst: ""
      });
  };

  const filteredMedicines = medicines.filter(m => 
      m.medicine_name.toLowerCase().includes(medSearch.toLowerCase())
  );

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
          onClick={() => {
              if (showAdd) resetForm();
              else setShowAdd(true);
          }}
          className="btn btn-primary shrink-0"
        >
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} 
          {showAdd ? "Close" : "Add Stock (Batch)"}
        </button>
      </div>

      {showAdd && (
        <div className="card mb-6 animate-fade-up border-primary/20 bg-slate-50">
          <h3 className="font-extrabold text-lg mb-4">{editId ? 'Edit Batch' : 'Add New Batch / Stock'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-1 lg:col-span-2 relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Medicine *</label>
              <input
                  type="text"
                  placeholder="Type to search medicine..."
                  value={medSearch}
                  onFocus={() => setShowMedDropdown(true)}
                  onChange={(e) => {
                      setMedSearch(e.target.value);
                      setNewBatch({ ...newBatch, medicine_id: "" });
                      setShowMedDropdown(true);
                  }}
                  className="admin-input w-full bg-white"
              />
              {showMedDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-line rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredMedicines.length > 0 ? filteredMedicines.map((m) => (
                          <div 
                              key={m.id} 
                              className="p-3 border-b border-line last:border-0 hover:bg-slate-50 cursor-pointer"
                              onClick={() => {
                                  setNewBatch({ ...newBatch, medicine_id: String(m.id), gst: String(m.gst || 0) });
                                  setMedSearch(m.medicine_name);
                                  setShowMedDropdown(false);
                              }}
                          >
                              <div className="font-semibold text-sm">{m.medicine_name}</div>
                              <div className="text-xs text-muted">Pack: {m.pack_size} | GST: {m.gst}%</div>
                          </div>
                      )) : (
                          <div className="p-3 text-sm text-muted text-center">No medicines found.</div>
                      )}
                  </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Barcode</label>
              <input
                type="text"
                value={newBatch.barcode}
                onChange={(e) => setNewBatch({ ...newBatch, barcode: e.target.value })}
                placeholder="Scan Barcode"
                className="admin-input w-full bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Batch Number</label>
              <input
                type="text"
                value={newBatch.batch_number}
                onChange={(e) => setNewBatch({ ...newBatch, batch_number: e.target.value })}
                placeholder="Batch No."
                className="admin-input w-full bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Expiry Date</label>
              <input
                type="text"
                value={newBatch.expiry_date}
                onChange={(e) => setNewBatch({ ...newBatch, expiry_date: e.target.value })}
                placeholder="MM/YY"
                className="admin-input w-full bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">MRP (₹)</label>
              <input
                type="number"
                value={newBatch.mrp}
                onChange={(e) => setNewBatch({ ...newBatch, mrp: e.target.value })}
                className="admin-input w-full bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Selling Price (₹)</label>
              <input
                type="number"
                value={newBatch.selling_price}
                onChange={(e) => setNewBatch({ ...newBatch, selling_price: e.target.value })}
                className="admin-input w-full bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Add Stock Qty</label>
              <input
                type="number"
                value={newBatch.stock}
                onChange={(e) => setNewBatch({ ...newBatch, stock: e.target.value })}
                className="admin-input w-full bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">GST (%)</label>
              <input
                type="number"
                value={newBatch.gst}
                onChange={(e) => setNewBatch({ ...newBatch, gst: e.target.value })}
                placeholder="0"
                className="admin-input w-full bg-white"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving} className="btn btn-green">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : editId ? "Update Batch" : "Save Batch"}
            </button>
            <button onClick={resetForm} className="btn btn-outline !border-line !text-muted !bg-transparent">
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
              <tr><td colSpan={8} className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
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
                      <button onClick={() => handleEdit(item)} className="p-2 rounded-xl hover:bg-accent-soft text-muted hover:text-accent transition-colors" title="Edit">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl hover:bg-red-50 text-muted hover:text-red-500 transition-colors" title="Delete">
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
