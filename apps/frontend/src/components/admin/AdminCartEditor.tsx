"use client";

import { useState } from "react";
import { Plus, Minus, Trash2, Save, Loader2 } from "lucide-react";
import { showToast } from "../Toast";

interface CartItem {
  medicine_name: string;
  pack_size: string;
  price: number | string;
  quantity: number;
  [key: string]: any;
}

export default function AdminCartEditor({
  orderId,
  initialCart,
}: {
  orderId: string;
  initialCart: CartItem[];
}) {
  const [items, setItems] = useState<CartItem[]>(initialCart || []);
  const [saving, setSaving] = useState(false);

  const updateQuantity = (idx: number, qty: number) => {
    const newItems = [...items];
    newItems[idx].quantity = Math.max(1, qty);
    setItems(newItems);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_items: items }),
      });
      if (!res.ok) throw new Error("Failed to save cart");
      showToast("Cart updated successfully", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!items.length) return <div className="text-sm text-muted italic">No items in cart</div>;

  return (
    <details className="mt-4 bg-surface-muted rounded-md border border-line group">
      <summary className="text-sm font-semibold p-3 cursor-pointer select-none outline-none list-none flex items-center justify-between">
        <span>Cart Items ({items.length})</span>
        <span className="text-xs text-primary group-open:hidden">View</span>
        <span className="text-xs text-primary hidden group-open:block">Hide</span>
      </summary>
      <div className="p-4 pt-0 border-t border-line mt-2 space-y-3 max-h-60 overflow-y-auto">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0">
            <div className="text-sm flex-1 min-w-[120px]">
              <span className="font-medium">{item.medicine_name}</span>
              <div className="text-xs text-muted">{item.pack_size} - ₹{Number(item.price).toFixed(2)}</div>
            </div>
            
            <div className="flex items-center gap-2 bg-surface border border-line rounded px-1">
              <button 
                onClick={() => updateQuantity(idx, item.quantity - 1)}
                className="p-1 hover:bg-surface-muted rounded"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(idx, item.quantity + 1)}
                className="p-1 hover:bg-surface-muted rounded"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            
            <button 
              onClick={() => removeItem(idx)}
              className="text-danger p-1.5 hover:bg-danger/10 rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-line flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save Changes
        </button>
      </div>
    </details>
  );
}
