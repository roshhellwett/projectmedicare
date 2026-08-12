"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { showToast } from "./Toast";
import { useEffect, useState } from "react";

type AddToCartButtonProps = {
  medicine: {
    id: string | number;
    medicine_name: string;
    pack_size: string;
    price: number;
    is_rx: boolean;
  };
};

export default function AddToCartButton({ medicine }: AddToCartButtonProps) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Avoid hydration mismatch by waiting for mount before reading cart state
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="btn btn-primary btn-sm flex items-center gap-2 opacity-50 cursor-not-allowed">
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">Add</span>
      </button>
    );
  }

  const existingItem = items.find((i) => i.id === medicine.id);
  
  const shortName = medicine.medicine_name.length > 30 
    ? medicine.medicine_name.substring(0, 30) + "..." 
    : medicine.medicine_name;

  const handleAdd = () => {
    addItem(medicine);
    showToast(`✅ ${shortName} added to cart!`, "success");
  };

  const handleMinus = () => {
    if (existingItem) {
      if (existingItem.quantity > 1) {
        updateQuantity(medicine.id, existingItem.quantity - 1);
      } else {
        removeItem(medicine.id);
        showToast(`Removed ${shortName} from cart.`, "success");
      }
    }
  };

  const handlePlus = () => {
    if (existingItem) {
      updateQuantity(medicine.id, existingItem.quantity + 1);
    }
  };

  if (existingItem) {
    return (
      <div className="flex items-center justify-between gap-2 bg-surface border border-primary rounded-md p-1 shadow-sm w-[100px] ml-auto">
        <button
          onClick={handleMinus}
          className="p-1 hover:bg-primary/10 text-primary rounded"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="font-semibold text-foreground text-sm flex-1 text-center select-none">
          {existingItem.quantity}
        </span>
        <button
          onClick={handlePlus}
          className="p-1 hover:bg-primary/10 text-primary rounded"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="btn btn-primary btn-sm flex items-center justify-center gap-2 w-[100px] ml-auto"
      aria-label="Add to cart"
    >
      <ShoppingCart className="h-4 w-4" />
      <span>Add</span>
    </button>
  );
}
