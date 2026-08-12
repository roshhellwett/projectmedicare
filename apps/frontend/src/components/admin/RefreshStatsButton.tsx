"use client";

import { useFormStatus } from "react-dom";
import { RefreshCw } from "lucide-react";

export default function RefreshStatsButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-outline btn-sm" disabled={pending}>
      <RefreshCw
        className={`mr-2 h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`}
      />
      {pending ? "Refreshing..." : "Refresh Stats"}
    </button>
  );
}
