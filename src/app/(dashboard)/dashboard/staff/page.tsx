"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loading from "@/components/ui/loading";
import { Plus, X, Trash2, RotateCcw, Loader2 } from "lucide-react";
import type { User } from "@/lib/types";

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ phone: "", tempPassword: "", fullName: "", role: "ADMIN", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/users/staff");
      setStaff(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setError("");
    if (!form.phone || !form.tempPassword || !form.fullName) {
      setError("Phone, password, and name are required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/users/staff", form);
      setShowCreate(false);
      setForm({ phone: "", tempPassword: "", fullName: "", role: "ADMIN", email: "" });
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create staff");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (id: string) => {
    const pw = prompt("Enter new temporary password (min 6 chars):");
    if (!pw || pw.length < 6) return;
    try {
      await api.post(`/users/staff/${id}/reset-password`, { newPassword: pw });
      alert("Password reset successfully.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete staff member "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/staff/${id}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-display text-brand-ink">Users & Roles</h1>
          <p className="text-[13px] text-gray-label">Manage admin and manager accounts</p>
        </div>
        <button className="btn-blue" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Staff</button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[420px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display text-brand-ink">Create Staff</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="field-label">Full Name *</label>
                <input className="field-input" placeholder="Fahim Ahmed" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Phone Number *</label>
                <input className="field-input" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Temporary Password *</label>
                <input className="field-input" placeholder="Min 6 characters" value={form.tempPassword} onChange={(e) => setForm({ ...form, tempPassword: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Role</label>
                <select className="field-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <div>
                <label className="field-label">Email</label>
                <input className="field-input" placeholder="Optional" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            {error && <div className="mt-3 p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}
            <button className="btn-blue w-full justify-center mt-5" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-label text-sm">No staff members</td></tr>
              )}
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-gray-line last:border-0 hover:bg-brand-mist transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-sm text-brand-ink">{s.profile?.fullName || "—"}</td>
                  <td className="px-4 py-3.5 text-sm tabular-nums">{s.phone}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${s.role.name === "ADMIN" ? "bg-brand-soft text-brand" : "bg-warning-soft text-warning"}`}>
                      {s.role.name === "ADMIN" ? "Admin" : s.role.name === "SUPER_ADMIN" ? "Super Admin" : "Manager"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${s.isActive ? "bg-success-soft text-success" : "bg-gray-100 text-gray-label"}`}>
                      <span className="w-[7px] h-[7px] rounded-full bg-current" />
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-label">
                    {new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    {s.role.name !== "SUPER_ADMIN" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleResetPassword(s.id)} title="Reset password" className="w-8 h-8 rounded-lg bg-brand-soft text-brand grid place-items-center hover:bg-brand hover:text-white transition-colors cursor-pointer">
                          <RotateCcw size={14} />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.profile?.fullName || s.phone)} title="Delete" className="w-8 h-8 rounded-lg bg-danger-soft text-danger grid place-items-center hover:bg-danger hover:text-white transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}