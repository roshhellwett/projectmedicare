"use client";

import { useState, useTransition } from "react";
import { upsertAdminUser, deleteAdminUser } from "@/lib/actions/settings";
import { Save, Loader2, UserPlus, Trash2, Shield, X } from "lucide-react";
import { showToast } from "@/components/Toast";

export default function StaffAccountsTab({ staff }: { staff: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  
  const [form, setForm] = useState({
    id: "",
    username: "",
    password: "",
    role: "BILLER"
  });

  const handleEdit = (user: any) => {
    setForm({
      id: user.id,
      username: user.username,
      password: "", // Don't populate password
      role: user.role
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.username) {
      showToast("Username is required", "error");
      return;
    }
    
    startTransition(async () => {
      try {
        await upsertAdminUser(form);
        showToast("Staff account saved successfully");
        setIsOpen(false);
      } catch (e: any) {
        showToast(e.message, "error");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    
    startTransition(async () => {
      try {
        await deleteAdminUser(id);
        showToast("Account deleted successfully");
      } catch (e: any) {
        showToast(e.message, "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-primary-deep">Manage Staff Access</h3>
        <button
          onClick={() => {
            setForm({ id: "", username: "", password: "", role: "BILLER" });
            setIsOpen(true);
          }}
          className="btn btn-primary btn-sm"
          disabled={isPending}
        >
          <UserPlus className="h-4 w-4" /> Add Staff
        </button>
      </div>

      {isOpen && (
        <div className="card border-primary/20 bg-primary-soft/30 p-6 animate-fade-up">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-primary-deep">{form.id ? 'Edit Account' : 'New Account'}</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Username</label>
              <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})} className="admin-input lowercase" placeholder="e.g. roshan" />
            </div>
            <div>
              <label className="label">{form.id ? 'New Password (leave blank to keep current)' : 'Password'}</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="admin-input" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="label">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="admin-input">
                <option value="BILLER">Biller (POS & Inbox Only)</option>
                <option value="ADMIN">Admin (Full Access)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setIsOpen(false)} className="btn btn-ghost" disabled={isPending}>Cancel</button>
            <button onClick={handleSave} className="btn btn-primary" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Account
            </button>
          </div>
        </div>
      )}

      <div className="table-shell">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold uppercase">Username</th>
              <th className="px-4 py-3 font-semibold uppercase">Role</th>
              <th className="px-4 py-3 font-semibold uppercase">Created</th>
              <th className="px-4 py-3 text-right font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 font-bold text-primary">admin</td>
              <td className="px-4 py-3"><span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">SUPER ADMIN</span></td>
              <td className="px-4 py-3 text-muted">System Default</td>
              <td className="px-4 py-3 text-right text-xs text-muted font-semibold italic">Managed via .env</td>
            </tr>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-line hover:bg-surface-muted/50 transition-colors">
                <td className="px-4 py-3 font-bold">{s.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${s.role === 'ADMIN' ? 'bg-primary-soft text-primary-deep' : 'bg-slate-100 text-slate-700'}`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(s)} className="btn btn-ghost btn-sm mr-2" disabled={isPending}>Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm !px-2" disabled={isPending}><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
