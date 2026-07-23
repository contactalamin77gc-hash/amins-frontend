"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loading from "@/components/ui/loading";
import { Plus, X, Trash2, Loader2 } from "lucide-react";

interface Rate {
  id: string;
  category: string;
  method: string;
  contains: string;
  ratePerKg: number;
  ratePerCbm: number;
  minCharge: number;
  estimatedDays: string;
  isActive: boolean;
}

const METHODS = ["AIR", "SEA"];
const CONTAINS = ["GENERAL", "LIQUID", "BATTERY", "POWDER", "FRAGILE"];

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category: "", method: "AIR", contains: "GENERAL",
    ratePerKg: "", ratePerCbm: "", minCharge: "", estimatedDays: "7-12 days",
  });
  const [filterMethod, setFilterMethod] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/shipping-rates/admin");
      setRates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const categories = [...new Set(rates.map((r) => r.category))].sort();

  const filtered = rates.filter((r) => {
    if (filterMethod && r.method !== filterMethod) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    return true;
  });

  const handleCreate = async () => {
    setError("");
    if (!form.category || !form.ratePerKg) { setError("Category and rate per KG are required"); return; }
    setSaving(true);
    try {
      await api.post("/shipping-rates", {
        ...form,
        ratePerKg: parseFloat(form.ratePerKg) || 0,
        ratePerCbm: parseFloat(form.ratePerCbm) || 0,
        minCharge: parseFloat(form.minCharge) || 0,
      });
      setShowCreate(false);
      setForm({ category: "", method: "AIR", contains: "GENERAL", ratePerKg: "", ratePerCbm: "", minCharge: "", estimatedDays: "7-12 days" });
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await api.patch(`/shipping-rates/${id}`, { isActive: !isActive });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rate?")) return;
    await api.delete(`/shipping-rates/${id}`);
    load();
  };

  const handleInlineEdit = async (id: string, field: string, value: string) => {
    await api.patch(`/shipping-rates/${id}`, { [field]: parseFloat(value) || 0 });
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-display text-brand-ink">Shipping Rates</h1>
          <p className="text-[13px] text-gray-label">Manage pricing for the public cost calculator. Rates are in BDT.</p>
        </div>
        <button className="btn-blue" onClick={() => setShowCreate(true)}><Plus size={16} /> Add Rate</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setFilterMethod("")} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] cursor-pointer ${!filterMethod ? "bg-brand border-brand text-white" : "bg-white border-gray-line text-gray-label"}`}>All Methods</button>
        {METHODS.map((m) => (
          <button key={m} onClick={() => setFilterMethod(m)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] cursor-pointer ${filterMethod === m ? "bg-brand border-brand text-white" : "bg-white border-gray-line text-gray-label"}`}>{m}</button>
        ))}
        <span className="text-gray-line">|</span>
        <select className="field-input w-auto text-[13px] py-1.5" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[520px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display text-brand-ink">Add Shipping Rate</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="field-label">Product Category *</label>
                <input className="field-input" placeholder="e.g. Electronics, Clothing & Textiles" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} list="cat-list" />
                <datalist id="cat-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Method</label>
                  <select className="field-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Contains</label>
                  <select className="field-input" value={form.contains} onChange={(e) => setForm({ ...form, contains: e.target.value })}>
                    {CONTAINS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="field-label">Rate / KG (৳) *</label>
                  <input className="field-input" placeholder="700" value={form.ratePerKg} onChange={(e) => setForm({ ...form, ratePerKg: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Rate / CBM (৳)</label>
                  <input className="field-input" placeholder="7000" value={form.ratePerCbm} onChange={(e) => setForm({ ...form, ratePerCbm: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Min Charge (৳)</label>
                  <input className="field-input" placeholder="1500" value={form.minCharge} onChange={(e) => setForm({ ...form, minCharge: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="field-label">Estimated Delivery Days</label>
                <input className="field-input" placeholder="7-12 days" value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} />
              </div>
            </div>
            {error && <div className="mt-3 p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}
            <button className="btn-blue w-full justify-center mt-5" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? "Creating..." : "Add Rate"}
            </button>
          </div>
        </div>
      )}

      {/* Rates Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Contains</th>
                <th className="text-left px-4 py-3">৳/KG</th>
                <th className="text-left px-4 py-3">৳/CBM</th>
                <th className="text-left px-4 py-3">Min Charge</th>
                <th className="text-left px-4 py-3">ETA</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-label text-sm">No rates found</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className={`border-b border-gray-line last:border-0 hover:bg-brand-mist transition-colors ${!r.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 text-sm font-semibold text-brand-ink">{r.category}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${r.method === "AIR" ? "bg-brand-soft text-brand" : r.method === "SEA" ? "bg-blue-50 text-blue-600" : "bg-warning-soft text-warning"}`}>{r.method}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-label">{r.contains}</td>
                  <td className="px-4 py-3">
                    <input className="w-20 border border-gray-line rounded px-2 py-1 text-sm text-right font-semibold" defaultValue={r.ratePerKg}
                      onBlur={(e) => handleInlineEdit(r.id, "ratePerKg", e.target.value)} />
                  </td>
                  <td className="px-4 py-3">
                    <input className="w-20 border border-gray-line rounded px-2 py-1 text-sm text-right font-semibold" defaultValue={r.ratePerCbm}
                      onBlur={(e) => handleInlineEdit(r.id, "ratePerCbm", e.target.value)} />
                  </td>
                  <td className="px-4 py-3">
                    <input className="w-20 border border-gray-line rounded px-2 py-1 text-sm text-right font-semibold" defaultValue={r.minCharge}
                      onBlur={(e) => handleInlineEdit(r.id, "minCharge", e.target.value)} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-label">{r.estimatedDays}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(r.id, r.isActive)}
                      className={`badge cursor-pointer ${r.isActive ? "bg-success-soft text-success" : "bg-gray-100 text-gray-label"}`}>
                      <span className="w-[7px] h-[7px] rounded-full bg-current" />
                      {r.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(r.id)} className="w-8 h-8 rounded-lg bg-danger-soft text-danger grid place-items-center hover:bg-danger hover:text-white transition-colors cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-[12px] text-gray-label">
        <b>How pricing works:</b> The calculator charges whichever is higher — weight-based cost (KG × rate) or volume-based cost (CBM × rate). If both are lower than the minimum charge, the minimum applies. Rates with "Contains" options (Battery, Liquid, etc.) are shown when the customer selects that type.
      </div>
    </div>
  );
}