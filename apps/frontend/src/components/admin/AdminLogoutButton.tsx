"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      window.location.reload();
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="btn btn-outline !py-2 !px-4 text-sm"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
