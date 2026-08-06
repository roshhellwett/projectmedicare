"use client";

import { useState } from "react";
import type { Package } from "@/lib/db/packages";
import { Plus, Edit2, Trash2, CheckCircle2, X } from "lucide-react";

export default function PackageManager({ initialPackages }: { initialPackages: Package[] }) {
  const [packages, setPackages] = useState(initialPackages);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPkg, setCurrentPkg] = useState<Partial<Package>>({});
  const [testsInput, setTestsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNew = () => {
    setIsEditing(false);
    setCurrentPkg({ is_featured: false });
    setTestsInput("");
    setIsOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setIsEditing(true);
    setCurrentPkg(pkg);
    setTestsInput(pkg.tests.join("\\n"));
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      if (res.ok) setPackages((prev) => prev.filter((p) => p.id !== id));
      else alert("Failed to delete package.");
    } catch (e) {
      alert("Error deleting package.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tests = testsInput
      .split("\\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = { ...currentPkg, tests };

    try {
      if (isEditing && currentPkg.id) {
        const res = await fetch(`/api/admin/packages/${currentPkg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setPackages((prev) =>
            prev.map((p) => (p.id === currentPkg.id ? { ...p, ...payload } as Package : p))
          );
          setIsOpen(false);
        }
      } else {
        const res = await fetch("/api/admin/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          window.location.reload(); // Quick refresh to get new ID
        }
      }
    } catch (e) {
      alert("An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Package
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
            <div className="relative w-full max-w-lg rounded-xl bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
              
              <h2 className="text-xl font-bold text-foreground mb-6">{isEditing ? "Edit Package" : "New Package"}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Package Name</label>
                  <input
                    type="text"
                    className="flex h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={currentPkg.name || ""}
                    onChange={(e) => setCurrentPkg({ ...currentPkg, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                  <input
                    type="text"
                    className="flex h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={currentPkg.description || ""}
                    onChange={(e) => setCurrentPkg({ ...currentPkg, description: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Market Price (₹)</label>
                    <input
                      type="number"
                      className="flex h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={currentPkg.market_price || ""}
                      onChange={(e) => setCurrentPkg({ ...currentPkg, market_price: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Janta Price (₹)</label>
                    <input
                      type="number"
                      className="flex h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={currentPkg.janta_price || ""}
                      onChange={(e) => setCurrentPkg({ ...currentPkg, janta_price: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tests (One per line)</label>
                  <textarea
                    className="flex min-h-[150px] w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                    value={testsInput}
                    onChange={(e) => setTestsInput(e.target.value)}
                    placeholder="CBC\nLiver Function Test\nThyroid Profile..."
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2 mt-4 bg-surface-muted p-3 rounded border border-line">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={currentPkg.is_featured || false}
                    onChange={(e) => setCurrentPkg({ ...currentPkg, is_featured: e.target.checked })}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-foreground cursor-pointer">
                    Feature on Homepage (Max 4 recommended)
                  </label>
                </div>
                
                <div className="pt-4 mt-4 border-t border-line">
                  <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Package"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card p-5 relative group">
            {pkg.is_featured && (
              <span className="absolute top-4 right-24 text-xs font-bold text-white bg-primary px-2 py-1 rounded-md shadow-sm">
                Featured
              </span>
            )}
            <div className="flex justify-between items-start pr-16">
              <h3 className="font-bold text-lg text-primary-deep leading-tight">{pkg.name}</h3>
              <div className="absolute right-4 top-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(pkg)}
                  className="flex h-8 w-8 items-center justify-center rounded bg-surface-muted text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex h-8 w-8 items-center justify-center rounded bg-surface-muted text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-3 flex items-end gap-3 text-sm font-medium">
              <span className="text-primary text-xl font-bold leading-none">₹{pkg.janta_price}</span>
              <span className="text-muted line-through text-xs mb-0.5">₹{pkg.market_price}</span>
            </div>

            <div className="mt-5 pt-4 border-t border-line">
              <p className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {pkg.tests.length}
                </span>
                Tests Included
              </p>
              <div className="max-h-32 overflow-y-auto text-sm text-muted space-y-2 pr-2">
                {pkg.tests.map((test, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                    <span className="leading-snug">{test}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted border-2 border-dashed border-line rounded-xl bg-surface/50">
            No packages created yet. Click "Add Package" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
