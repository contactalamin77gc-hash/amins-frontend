"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loading from "@/components/ui/loading";
import { Search, Plus, RotateCcw, X } from "lucide-react";
import type { User, PaginatedResponse } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ phone: "", tempPassword: "", fullName: "", companyName: "", email: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<User>>("/users/customers", {
        params: { limit: 50, search: search || undefined },
      });
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async () => {
    setError("");
    if (!form.phone || !form.tempPassword || !form.fullName) {
      setError("Phone, password, and full name are required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/users/customers", form);
      setShowCreate(false);
      setForm({ phone: "", tempPassword: "", fullName: "", companyName: "", email: "", address: "" });
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPw = prompt("Enter new temporary password (min 6 chars):");
    if (!newPw || newPw.length < 6) return;
    try {
      await api.post(`/users/customers/${id}/reset-password`, { newPassword: newPw });
      alert("Password reset. Customer must change it on next login.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to reset password");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/users/customers/${id}/${isActive ? "deactivate" : "reactivate"}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  if (loading && customers.length === 0) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-[26px] font-display text-brand-ink">Customers</h1>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-line rounded-[10px] px-3.5 py-2.5 min-w-[260px]">
            <Search size={16} className="text-gray-label" />
            <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Search name, phone, company…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn-blue" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create customer
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[480px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display text-brand-ink">Create Customer</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="field-label">Full Name *</label>
                <input className="field-input" placeholder="Rahim Khan" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
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
                <label className="field-label">Company Name</label>
                <input className="field-input" placeholder="Optional" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input className="field-input" placeholder="Optional" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Address</label>
                <input className="field-input" placeholder="Optional" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            {error && <div className="mt-3 p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}
            <button className="btn-blue w-full justify-center mt-5" onClick={handleCreate} disabled={saving}>
              {saving ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-label text-sm">No customers found</td></tr>
              )}
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-line last:border-0 hover:bg-brand-mist transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-sm text-brand-ink">{c.profile?.fullName || "—"}</td>
                  <td className="px-4 py-3.5 text-sm tabular-nums">{c.phone}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-label">{c.profile?.companyName || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${c.isActive ? "bg-success-soft text-success" : "bg-gray-100 text-gray-label"}`}>
                      <span className="w-[7px] h-[7px] rounded-full bg-current" />
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-label">
                    {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <button onClick={() => handleResetPassword(c.id)} title="Reset password"
                        className="w-8 h-8 rounded-lg bg-brand-soft text-brand grid place-items-center hover:bg-brand hover:text-white transition-colors cursor-pointer">
                        <RotateCcw size={14} />
                      </button>
                      <button onClick={() => handleToggleActive(c.id, c.isActive)} title={c.isActive ? "Deactivate" : "Reactivate"}
                        className={`w-8 h-8 rounded-lg grid place-items-center transition-colors cursor-pointer ${
                          c.isActive ? "bg-danger-soft text-danger hover:bg-danger hover:text-white" : "bg-success-soft text-success hover:bg-success hover:text-white"
                        }`}>
                        {c.isActive ? "⏻" : "✓"}
                      </button>
                    </div>
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