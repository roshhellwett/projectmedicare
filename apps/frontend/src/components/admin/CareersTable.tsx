"use client";

import { useState } from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import type { JobApplication } from "@/lib/db/careers";
import { showToast } from "../Toast";

export default function CareersTable({
  initialData,
}: {
  initialData: JobApplication[];
}) {
  const [items, setItems] = useState<JobApplication[]>(initialData);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this application? The CV will also be deleted to free up space.",
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/careers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast("Application deleted successfully");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface">
            <th className="p-4 font-semibold text-secondary-dark">Name</th>
            <th className="p-4 font-semibold text-secondary-dark">Phone</th>
            <th className="p-4 font-semibold text-secondary-dark">
              Applied Store
            </th>
            <th className="p-4 font-semibold text-secondary-dark">Date</th>
            <th className="p-4 text-center font-semibold text-secondary-dark">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted">
                No job applications received yet.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-surface/50"
              >
                <td className="p-4 font-medium text-foreground">{item.name}</td>
                <td className="p-4 text-muted">{item.phone}</td>
                <td className="p-4 text-muted capitalize">{item.store_id}</td>
                <td className="p-4 text-muted">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <a
                      href={`/api/admin/careers/${item.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm !px-2"
                      title="Download CV"
                    >
                      <Download className="h-4 w-4 text-blue-500" />
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="btn btn-outline btn-sm !px-2 hover:bg-red-500/10 hover:border-red-500/30"
                      title="Delete Application"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
