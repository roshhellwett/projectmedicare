"use client";

import { useState } from "react";
import { Trash2, ImageIcon } from "lucide-react";
import { showToast } from "../Toast";
import type { Feedback } from "@/lib/db/feedbacks";

export default function FeedbacksTable({ initialData }: { initialData: Feedback[] }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialData);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this feedback? This will also remove the image to save space.")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/feedbacks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete");
      }

      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      showToast("Feedback deleted successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  const getImageUrl = (fileName: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
    return `${supabaseUrl}/storage/v1/object/public/feedbacks/${fileName}`;
  };

  if (feedbacks.length === 0) {
    return (
      <div className="p-8 text-center text-muted">
        <p>No feedback entries found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto table-shell">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="w-16">Date</th>
            <th>Name & Phone</th>
            <th>Feedback Note</th>
            <th className="w-24">Image</th>
            <th className="w-20 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface text-sm">
          {feedbacks.map((f) => {
            const dateStr = new Date(f.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
            return (
              <tr key={f.id} className="transition-colors hover:bg-surface-muted">
                <td className="whitespace-nowrap font-medium text-muted">{dateStr}</td>
                <td>
                  <div className="font-semibold text-foreground">{f.name}</div>
                  <div className="text-xs text-muted font-mono mt-1">{f.phone}</div>
                </td>
                <td className="max-w-md">
                  <p className="whitespace-pre-wrap text-muted break-words">
                    {f.note || <span className="italic opacity-50">No note provided</span>}
                  </p>
                </td>
                <td>
                  {f.image_url ? (
                    <a href={getImageUrl(f.image_url)} target="_blank" rel="noreferrer" className="block relative h-12 w-12 rounded border border-line overflow-hidden hover:opacity-80 transition-opacity">
                      <img src={getImageUrl(f.image_url)} alt="Feedback image" className="object-cover h-full w-full" />
                    </a>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-muted border border-line text-muted">
                      <ImageIcon className="h-4 w-4 opacity-50" />
                    </div>
                  )}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={deleting === f.id}
                    className="btn-page text-accent hover:text-accent disabled:opacity-50"
                    title="Delete feedback"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
