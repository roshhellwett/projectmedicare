"use client";

import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // The session lives in an httpOnly cookie — reload so the server
        // renders the dashboard.
        window.location.reload();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Incorrect password");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card text-center animate-fade-up">
          <div className="mx-auto mb-6 w-fit rounded-3xl bg-primary-soft p-5 text-primary">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold">Admin Access</h1>
          {!configured ? (
            <p className="rounded-2xl bg-accent-soft px-5 py-4 text-left text-sm font-semibold text-accent">
              Admin login is not configured yet. Set <code>ADMIN_PASSWORD</code>{" "}
              and <code>ADMIN_SESSION_SECRET</code> in your environment, then
              reload this page.
            </p>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="input !pl-11"
                  autoComplete="current-password"
                  aria-label="Admin password"
                  autoFocus
                />
              </div>
              {error && (
                <p role="alert" className="text-sm font-bold text-accent">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || password.length === 0}
                className="btn btn-primary w-full !py-3"
              >
                {loading ? "Verifying…" : "Unlock Dashboard"}
              </button>
            </form>
          )}
        </div>
        <p className="mt-5 text-center text-xs font-semibold text-muted">
          Sessions expire automatically after 8 hours.
        </p>
      </div>
    </div>
  );
}
