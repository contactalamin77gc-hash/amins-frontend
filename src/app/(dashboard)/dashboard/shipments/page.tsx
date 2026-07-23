"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ShipmentBadge } from "@/components/ui/status-badge";
import ProgressBar from "@/components/ui/progress-bar";
import Loading from "@/components/ui/loading";
import { Search, Plus, X, Loader2 } from "lucide-react";
import type { Shipment, PaginatedResponse, User, ShipmentStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
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

const METHOD_OPTIONS = [
  { value: "", label: "All Methods" },
  { value: "AIR", label: "Air" },
  { value: "SEA", label: "Sea" },
  { value: "LAND", label: "Land" },
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<Shipment | null>(null);
  const [customers, setCustomers] = useState<User[]>([]);

  const [form, setForm] = useState({
    customerId: "", trackingNumber: "", supplierName: "", chinaWarehouse: "", bangladeshWarehouse: "",
    method: "AIR", containerNumber: "", estimatedArrival: "", notes: "",
  });
  const [statusForm, setStatusForm] = useState({ status: "", remark: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get<PaginatedResponse<Shipment>>("/shipments", {
        params: {
          limit: 50,
          search: search || undefined,
          status: statusFilter || undefined,
          method: methodFilter || undefined,
        },
      });
      setShipments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, statusFilter, methodFilter]);

  const openCreate = async () => {
    try {
      const res = await api.get("/users/customers?limit=200");
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setShowCreate(true);
  };

  const handleCreate = async () => {
    setError("");
    if (!form.customerId || !form.trackingNumber || !form.supplierName) {
      setError("Customer, tracking number, and supplier name are required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/shipments", form);
      setShowCreate(false);
      setForm({ customerId: "", trackingNumber: "", supplierName: "", chinaWarehouse: "", bangladeshWarehouse: "", method: "AIR", containerNumber: "", estimatedArrival: "", notes: "" });
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create shipment");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!showStatusModal || !statusForm.status) return;
    setSaving(true);
    try {
      await api.patch(`/shipments/${showStatusModal.id}/status`, statusForm);
      setShowStatusModal(null);
      setStatusForm({ status: "", remark: "" });
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-[26px] font-display text-brand-ink">Shipments</h1>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-line rounded-[10px] px-3.5 py-2.5 min-w-[240px]">
            <Search size={16} className="text-gray-label" />
            <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Search tracking, customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="field-input w-auto min-w-[140px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="field-input w-auto min-w-[120px]" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn-blue" onClick={openCreate}><Plus size={16} /> New Shipment</button>
        </div>
      </div>

      {/* Create Shipment Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[520px] shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display text-brand-ink">Create Shipment</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="field-label">Customer *</label>
                <select className="field-input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.profile?.fullName || c.phone} — {c.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Tracking Number *</label>
                <input className="field-input" placeholder="e.g. AMN-2600001" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Supplier Name *</label>
                <input className="field-input" placeholder="Yiwu Electronics Co." value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">China Warehouse</label>
                  <input className="field-input" placeholder="Guangzhou WH-2" value={form.chinaWarehouse} onChange={(e) => setForm({ ...form, chinaWarehouse: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">BD Warehouse</label>
                  <input className="field-input" placeholder="Dhaka Main" value={form.bangladeshWarehouse} onChange={(e) => setForm({ ...form, bangladeshWarehouse: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Method</label>
                  <select className="field-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    <option value="AIR">Air</option>
                    <option value="SEA">Sea</option>
                    <option value="LAND">Land</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Container / Flight №</label>
                  <input className="field-input" placeholder="Optional" value={form.containerNumber} onChange={(e) => setForm({ ...form, containerNumber: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="field-label">Estimated Arrival</label>
                <input className="field-input" type="date" value={form.estimatedArrival} onChange={(e) => setForm({ ...form, estimatedArrival: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Notes</label>
                <textarea className="field-input min-h-[80px]" placeholder="Optional notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            {error && <div className="mt-3 p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}
            <button className="btn-blue w-full justify-center mt-5" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? "Creating..." : "Create Shipment"}
            </button>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowStatusModal(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[420px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-brand-ink">Update Status</h2>
              <button onClick={() => setShowStatusModal(null)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-label mb-4">
              {showStatusModal.trackingNumber} — currently: <ShipmentBadge status={showStatusModal.status} />
            </p>
            <div className="space-y-3.5">
              <div>
                <label className="field-label">New Status *</label>
                <select className="field-input" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Remark</label>
                <input className="field-input" placeholder="e.g. Flight CZ-3091, 5/10 boxes delivered" value={statusForm.remark} onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })} />
              </div>
            </div>
            <button className="btn-blue w-full justify-center mt-5" onClick={handleStatusUpdate} disabled={saving}>
              {saving ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      )}

      {/* Shipments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                <th className="text-left px-4 py-3">Tracking №</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Container</th>
                <th className="text-left px-4 py-3">Boxes</th>
                <th className="text-left px-4 py-3">ETA</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-label text-sm">No shipments found</td></tr>
              )}
              {shipments.map((s) => (
                <tr key={s.id} className="border-b border-gray-line last:border-0 hover:bg-brand-mist transition-colors">
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/orders/${s.id}`} className="font-semibold text-sm tabular-nums hover:text-brand">{s.trackingNumber}</Link>
                    <div className="text-[12px] text-gray-label">{s.orderNumber}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm">
                    {s.customer?.fullName || s.customer?.phone || "—"}
                    {s.customer?.phone && <div className="text-[12px] text-gray-label">{s.customer.phone}</div>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${s.method === "AIR" ? "bg-brand-soft text-brand" : s.method === "SEA" ? "bg-gray-100 text-gray-label" : "bg-warning-soft text-warning"}`}>
                      {s.method}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm tabular-nums text-gray-label">{s.containerNumber || "—"}</td>
                  <td className="px-4 py-3.5">
                    <ProgressBar delivered={s.boxes.delivered} total={s.boxes.total} />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-label">
                    {s.actualArrival ? "Arrived" : s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                  </td>
                  <td className="px-4 py-3.5"><ShipmentBadge status={s.status} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <button onClick={() => { setShowStatusModal(s); setStatusForm({ status: "", remark: "" }); }} title="Update status" className="w-8 h-8 rounded-lg bg-brand-soft text-brand grid place-items-center hover:bg-brand hover:text-white transition-colors cursor-pointer">
                        {"✎"}
                      </button>
                      <Link href={`/dashboard/orders/${s.id}`} title="View details" className="w-8 h-8 rounded-lg bg-brand-soft text-brand grid place-items-center hover:bg-brand hover:text-white transition-colors">
                        {"→"}
                      </Link>
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