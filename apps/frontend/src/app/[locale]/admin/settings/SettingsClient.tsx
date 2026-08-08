"use client";

import { useState, useTransition } from "react";
import { Key, Plus, Trash2, Shield, X, Save } from "lucide-react";
import {
  EnvKeyRecord,
  upsertEnvKey,
  deleteEnvKey,
} from "@/lib/actions/settings";

export default function SettingsClient({
  keys,
}: {
  keys: EnvKeyRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!keyName || !keyValue) {
      setError("Name and value are required");
      return;
    }

    startTransition(async () => {
      try {
        await upsertEnvKey(keyName, keyValue);
        setIsOpen(false);
        setKeyName("");
        setKeyValue("");
        setError("");
      } catch (e: any) {
        setError(e.message || "Failed to save key");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this key?")) {
      startTransition(async () => {
        try {
          await deleteEnvKey(id);
        } catch (e: any) {
          alert("Failed to delete key");
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary-deep flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Encrypted Environment Keys
        </h2>
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary btn-sm"
          disabled={isPending}
        >
          <Plus className="h-4 w-4" /> Add Key
        </button>
      </div>

      {isOpen && (
        <div className="card border-primary/20 bg-primary-soft/30 p-6 animate-fade-up">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-primary-deep">Add / Update Key</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Key Name</label>
              <input
                type="text"
                placeholder="e.g. GROQ_API_KEY"
                className="admin-input uppercase"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="label">Value</label>
              <input
                type="password"
                placeholder="Paste key here..."
                className="admin-input"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p className="mt-3 text-sm text-accent font-medium">{error}</p>}
          
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? "Saving..." : <><Save className="h-4 w-4" /> Save Securely</>}
            </button>
          </div>
        </div>
      )}

      <div className="table-shell">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold uppercase">Key Name</th>
              <th className="px-4 py-3 font-semibold uppercase">Masked Value</th>
              <th className="px-4 py-3 font-semibold uppercase">Updated</th>
              <th className="px-4 py-3 text-right font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No encrypted keys stored yet.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="border-t border-line hover:bg-surface-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      {k.key_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-soft">
                    {k.masked_value}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(k.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setKeyName(k.key_name);
                        setKeyValue("");
                        setIsOpen(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn btn-ghost btn-sm mr-2"
                      disabled={isPending}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="btn btn-danger btn-sm !px-2"
                      title="Delete Key"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
