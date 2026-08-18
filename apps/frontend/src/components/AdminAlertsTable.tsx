"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertTriangle, ShieldAlert } from "lucide-react";
import { showToast } from "./Toast";

export default function AdminAlertsTable() {
  const [items, setItems] = useState<any[]>([]);
  const [threshold, setThreshold] = useState<number>(3);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/alerts`, { signal });
        const json = await res.json();
        
        if (signal?.aborted) return;
        setItems(json.alerts || []);
        setThreshold(json.threshold || 3);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        showToast("Failed to fetch alerts", "error");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [],
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

  return (
    <div>
      <div className="card bg-orange-50 border-orange-200 mb-6 flex items-start gap-4 p-4 rounded-xl">
        <ShieldAlert className="text-orange-500 h-6 w-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-orange-900">Inventory Monitoring</h3>
          <p className="text-sm text-orange-800">
            Showing batches with stock ≤ <strong>{threshold}</strong> or those that have expired. You can change this threshold in the Settings page.
          </p>
        </div>
      </div>

      <div className="table-shell overflow-x-auto">
        <table className="whitespace-nowrap w-full">
          <thead>
            <tr>
              <th>Status</th>
              <th>Medicine Name</th>
              <th>Batch / Barcode</th>
              <th>Expiry</th>
              <th className="text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-muted">All clear! No low stock or expired batches.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={item.isExpired ? "bg-red-50" : "bg-orange-50/30"}>
                  <td>
                    {item.isExpired ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1 w-max">
                        <AlertTriangle className="h-3 w-3" /> EXPIRED
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1 w-max">
                        <AlertTriangle className="h-3 w-3" /> LOW STOCK
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="font-semibold">{item.medicine_name}</span>
                    <br/><span className="text-xs text-muted">{item.pack_size}</span>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{item.batch_number}</span>
                    <br/><span className="text-xs text-muted">BC: {item.barcode || 'N/A'}</span>
                  </td>
                  <td className={item.isExpired ? "font-bold text-red-600" : ""}>{item.expiry_date}</td>
                  <td className={`text-right font-bold ${item.stock === 0 ? "text-red-600" : "text-orange-600"}`}>
                    {item.stock}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
