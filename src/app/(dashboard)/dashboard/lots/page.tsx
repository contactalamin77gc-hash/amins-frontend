"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ShipmentBadge } from "@/components/ui/status-badge";
import ProgressBar from "@/components/ui/progress-bar";
import Loading from "@/components/ui/loading";
import { Search, Plus, X, Loader2, Plane, Ship, ExternalLink } from "lucide-react";
import type { Lot } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ORDER_CREATED", label: "Order Created" },
  { value: "RECEIVED_CHINA_WAREHOUSE", label: "China Warehouse" },
  { value: "PACKED", label: "Packed" },
  { value: "LEFT_CHINA", label: "Left China" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "ARRIVED_BANGLADESH", label: "Arrived BD" },
  { value: "CUSTOMS_CLEARANCE", label: "Customs" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "PARTIALLY_DELIVERED", label: "Partial Delivery" },
  { value: "FULLY_DELIVERED", label: "Delivered" },
];

export default function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    lotNumber: "",
    method: "AIR",
    notes: "",
  });

  const load = async () => {
    try {
      const res = await api.get("/lots", {
        params: {
          limit: 50,
          search: search || undefined,
          status: statusFilter || undefined,
          method: methodFilter || undefined,
        },
      });
      setLots(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, statusFilter, methodFilter]);

  const handleCreate = async () => {
    setError("");
    if (!form.lotNumber) { setError("Lot number is required"); return; }
    setSaving(true);
    try {
      await api.post("/lots", form);
      setShowCreate(false);
      setForm({ lotNumber: "", method: "AIR", notes: "" });
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create lot");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-display text-brand-ink">Lots</h1>
          <p className="text-[13px] text-gray-label">Manage shipping batches. Each lot contains multiple customers.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-line rounded-[10px] px-3.5 py-2.5 min-w-[240px]">
            <Search size={16} className="text-gray-label" />
            <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Search lot number, container…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="field-input w-auto min-w-[140px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="field-input w-auto min-w-[110px]" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="">All Methods</option>
            <option value="AIR">Air</option>
            <option value="SEA">Sea</option>
          </select>
          <button className="btn-blue" onClick={() => setShowCreate(true)}><Plus size={16} /> New Lot</button>
        </div>
      </div>

      {/* Create Lot Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[520px] shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display text-brand-ink">Create New Lot</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Lot Number *</label>
                  <input className="field-input" placeholder="e.g. 420" value={form.lotNumber} onChange={(e) => setForm({ ...form, lotNumber: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Method *</label>
                  <select className="field-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    <option value="AIR">Air Freight</option>
                    <option value="SEA">Sea Freight</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">Notes</label>
                <textarea className="field-input min-h-[100px]" placeholder="Optional notes about this lot" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            {error && <div className="mt-3 p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}
            <button className="btn-blue w-full justify-center mt-5" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? "Creating..." : "Create Lot"}
            </button>
          </div>
        </div>
      )}

      {/* Lots Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                <th className="text-left px-4 py-3">Lot №</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Container</th>
                <th className="text-left px-4 py-3">Customers</th>
                <th className="text-left px-4 py-3">Boxes</th>
                <th className="text-left px-4 py-3">Progress</th>
                <th className="text-left px-4 py-3">ETA</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {lots.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-label text-sm">
                  No lots found. Click <b>New Lot</b> to create one.
                </td></tr>
              )}
              {lots.map((lot) => (
                <tr key={lot.id} className="border-b border-gray-line last:border-0 hover:bg-brand-mist transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/lots/${lot.id}`} className="font-semibold text-sm tabular-nums hover:text-brand">{lot.lotNumber}</Link>
                    <div className="text-[12px] text-gray-label">{new Date(lot.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge inline-flex items-center gap-1.5 ${lot.method === "AIR" ? "bg-brand-soft text-brand" : "bg-gray-100 text-gray-label"}`}>
                      {lot.method === "AIR" ? <Plane size={12} /> : <Ship size={12} />}
                      {lot.method}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm tabular-nums text-gray-label">{lot.containerNumber || "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-semibold text-brand-ink">{lot.customerCount}</div>
                    <div className="text-[12px] text-gray-label">customers</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-semibold text-brand-ink">{lot.totalBoxes}</div>
                    <div className="text-[12px] text-gray-label">{lot.deliveredBoxes} delivered</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <ProgressBar delivered={lot.deliveredBoxes} total={lot.totalBoxes} />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-label">
                    {lot.actualArrival ? "Arrived" : lot.estimatedArrival ? new Date(lot.estimatedArrival).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                  </td>
                  <td className="px-4 py-3.5"><ShipmentBadge status={lot.status as any} /></td>
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/lots/${lot.id}`} className="btn-blue py-1.5 px-3 text-[12px] inline-flex items-center gap-1.5">
                      View <ExternalLink size={12} />
                    </Link>
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