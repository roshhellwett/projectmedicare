"use client";

import { useState } from "react";
import { Lock, Loader2, X } from "lucide-react";

interface SuperAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: string;
  description?: string;
}

export default function SuperAdminDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Super Admin Required",
  description = "This action requires super admin privileges. Please enter the master password to proceed.",
}: SuperAdminDialogProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!password) return;
    setLoading(true);
    try {
      await onConfirm(password);
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-line rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted mt-1">{description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Super Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-4 py-2 bg-surface border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirm();
                if (e.key === "Escape") onClose();
              }}
            />
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-muted rounded-lg transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !password}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
