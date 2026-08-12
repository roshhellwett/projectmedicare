"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { Link } from "@/i18n/routing";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingCart() {
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  
  // To avoid hydration mismatch, only render after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || totalItems === 0) return null;

  return (
    <Link
      href="/order"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-primary-dark hover:shadow-primary/50 active:scale-95"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="font-semibold">{totalItems} Item{totalItems > 1 ? 's' : ''}</span>
    </Link>
  );
}
