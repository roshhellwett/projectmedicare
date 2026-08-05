"use client";

import { useState, useEffect, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

let globalSetToast: ((t: ToastItem) => void) | null = null;
let nextId = 1;

export function showToast(message: string, type: ToastType = "success") {
  if (globalSetToast) {
    globalSetToast({ id: nextId++, message, type });
  }
}

const typeStyles: Record<ToastType, string> = {
  success:
    "bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg shadow-secondary/30",
  error:
    "bg-gradient-to-r from-accent to-[#E8338A] text-white shadow-lg shadow-accent/30",
  info: "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30",
};

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((t: ToastItem) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 3500);
  }, []);

  useEffect(() => {
    globalSetToast = addToast;
    return () => {
      globalSetToast = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-fade-up rounded-2xl px-6 py-3.5 text-sm font-bold ${typeStyles[t.type]}`}
        >
          {t.type === "success" && "✓  "}
          {t.type === "error" && "✕  "}
          {t.type === "info" && "ℹ  "}
          {t.message}
        </div>
      ))}
    </div>
  );
}
