"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, XCircle, FileText } from "lucide-react";
import { showToast } from "./Toast";

const PAGE_SIZE = 15;

export default function AdminInvoicesTable() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const sp = new URLSearchParams();
        if (query) sp.set("query", query);
        sp.set("page", String(page));
        sp.set("pageSize", String(PAGE_SIZE));

        const res = await fetch(`/api/admin/invoices?${sp.toString()}`, { signal });
        const json = await res.json();
        if (signal?.aborted) return;
        
        setItems(json.items || []);
        setTotal(json.total || 0);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        showToast("Failed to fetch invoices", "error");
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
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchData]);

  const handleCancel = async (id: number, invoice_no: string) => {
    if (!confirm(`Are you sure you want to cancel invoice ${invoice_no}? This will return all items to stock.`)) return;
    
    setCancelling(id);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: id }),
      });
      if (res.ok) {
        showToast("Invoice cancelled successfully");
        fetchData();
      } else {
        const json = await res.json();
        showToast(json.error || "Failed to cancel", "error");
      }
    } catch {
      showToast("Failed to cancel invoice", "error");
    } finally {
      setCancelling(null);
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
            placeholder="Search by Invoice No..."
            className="input !max-w-full"
          />
        </div>
      </div>

      <div className="table-shell overflow-x-auto">
        <table className="whitespace-nowrap">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Patient & Doctor</th>
              <th>Items</th>
              <th className="text-right">Net Amount</th>
              <th className="text-center">Status</th>
              <th className="text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-muted">No invoices found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={item.status === 'cancelled' ? 'bg-accent-soft/30' : ''}>
                  <td>
                      <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted" />
                          <span className="font-mono font-bold">{item.invoice_no}</span>
                      </div>
                  </td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td>
                    <span className="font-semibold">{item.patient_name || 'Walk-in'}</span>
                    <br/><span className="text-xs text-muted">{item.doctor_name ? `Dr. ${item.doctor_name}` : 'No Rx'}</span>
                  </td>
                  <td>
                      <div className="text-xs text-muted max-w-xs truncate" title={item.invoice_items.map((i:any) => i.medicine_batches?.medicines?.medicine_name).join(", ")}>
                          {item.invoice_items.length} items
                      </div>
                  </td>
                  <td className="text-right font-bold text-secondary-dark">₹{Number(item.net_amount).toFixed(2)}</td>
                  <td className="text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-accent-soft text-accent'
                      }`}>
                          {item.status.toUpperCase()}
                      </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      {item.status === 'completed' && (
                          <button 
                            onClick={() => handleCancel(item.id, item.invoice_no)} 
                            disabled={cancelling === item.id}
                            className="p-2 rounded-xl hover:bg-accent-soft text-accent transition-colors flex items-center gap-1 text-xs font-bold" 
                            title="Cancel Bill & Return Stock"
                          >
                            {cancelling === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                            Cancel
                          </button>
                      )}
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
