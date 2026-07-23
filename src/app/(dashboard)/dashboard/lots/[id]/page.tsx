"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { ShipmentBadge, PaymentBadge, BoxBadge } from "@/components/ui/status-badge";
import ProgressBar from "@/components/ui/progress-bar";
import Loading from "@/components/ui/loading";
import { ArrowLeft, Plus, X, Loader2, User as UserIcon, UserCheck, ChevronDown, ChevronRight, ExternalLink, Plane, Ship, Trash2, Download, FileSpreadsheet } from "lucide-react";
import type { LotDetail, User } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "ORDER_CREATED", label: "Order Created" },
  { value: "RECEIVED_CHINA_WAREHOUSE", label: "Received in China Warehouse" },
  { value: "PACKED", label: "Packed" },
  { value: "READY_FOR_SHIPMENT", label: "Ready for Shipment" },
  { value: "LEFT_CHINA", label: "Left China" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "ARRIVED_BANGLADESH", label: "Arrived Bangladesh" },
  { value: "CUSTOMS_CLEARANCE", label: "Customs Clearance" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "PARTIALLY_DELIVERED", label: "Partially Delivered" },
  { value: "FULLY_DELIVERED", label: "Fully Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function LotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isRole } = useAuth();
  const router = useRouter();
  const [lot, setLot] = useState<LotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  // Categories (product types) from shipping rates
  const [productTypes, setProductTypes] = useState<string[]>([]);

  // Modals
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showAddParcel, setShowAddParcel] = useState(false);

  // Forms
  const [statusForm, setStatusForm] = useState({ status: "", remark: "" });
  const [customerType, setCustomerType] = useState<"registered" | "walkin">("registered");
  const [customers, setCustomers] = useState<User[]>([]);
  const [addParcelForm, setAddParcelForm] = useState({
    customerId: "", walkInName: "", walkInPhone: "", notes: "",
  });

  // Tracking groups: each with a tracking number + boxes
  const [trackingGroups, setTrackingGroups] = useState<any[]>([
    { trackingNumber: "", supplierName: "", boxes: [{ boxNumber: "Box-01", weightKg: "", cbm: "", productName: "", productType: "", productPrice: "", shippingCharge: "", remarks: "" }] },
  ]);

  const [undeliveredGroups, setUndeliveredGroups] = useState<any[]>([]);
  const [selectedCarryOverIds, setSelectedCarryOverIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = isRole("SUPER_ADMIN", "ADMIN");

  const loadLot = async () => {
    try {
      const res = await api.get(`/lots/${id}`);
      setLot(res.data);
    } catch {
      router.push("/dashboard/lots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLot(); }, [id]);

  // Load product types from shipping rate categories
  useEffect(() => {
    api.get("/shipping-rates/categories")
      .then((res) => setProductTypes(res.data.categories || []))
      .catch(() => setProductTypes([]));
  }, []);

  // Load undelivered boxes when a registered customer is picked
  useEffect(() => {
    if (customerType === "registered" && addParcelForm.customerId) {
      api.get(`/lots/customer/${addParcelForm.customerId}/undelivered-boxes`)
        .then((res) => setUndeliveredGroups(res.data))
        .catch(() => setUndeliveredGroups([]));
    } else {
      setUndeliveredGroups([]);
      setSelectedCarryOverIds([]);
    }
  }, [addParcelForm.customerId, customerType]);

  const handleStatusUpdate = async () => {
    if (!statusForm.status) return;
    setSaving(true);
    try {
      await api.patch(`/lots/${id}/status`, statusForm);
      setShowStatusUpdate(false);
      setStatusForm({ status: "", remark: "" });
      loadLot();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  const openAddParcel = async () => {
    try {
      const res = await api.get("/users/customers?limit=200");
      setCustomers(res.data.data);
    } catch { console.error("Failed to load customers"); }
    setShowAddParcel(true);
  };

  const resetParcelForm = () => {
    setAddParcelForm({ customerId: "", walkInName: "", walkInPhone: "", notes: "" });
    setTrackingGroups([
      { trackingNumber: "", supplierName: "", boxes: [{ boxNumber: "Box-01", weightKg: "", cbm: "", productName: "", productType: "", productPrice: "", shippingCharge: "", remarks: "" }] },
    ]);
    setSelectedCarryOverIds([]);
    setUndeliveredGroups([]);
    setCustomerType("registered");
    setError("");
  };

  const addTrackingGroup = () => {
    setTrackingGroups([...trackingGroups, {
      trackingNumber: "", supplierName: "",
      boxes: [{ boxNumber: "Box-01", weightKg: "", cbm: "", productName: "", productType: "", productPrice: "", shippingCharge: "", remarks: "" }],
    }]);
  };

  const removeTrackingGroup = (gi: number) => {
    setTrackingGroups(trackingGroups.filter((_, i) => i !== gi));
  };

  const addBoxToGroup = (gi: number) => {
    const groups = [...trackingGroups];
    const nextNum = groups[gi].boxes.length + 1;
    groups[gi].boxes.push({
      boxNumber: `Box-${String(nextNum).padStart(2, "0")}`,
      weightKg: "", cbm: "", productName: "", productType: "", productPrice: "", shippingCharge: "", remarks: "",
    });
    setTrackingGroups(groups);
  };

  const removeBoxFromGroup = (gi: number, bi: number) => {
    const groups = [...trackingGroups];
    if (groups[gi].boxes.length <= 1) return;
    groups[gi].boxes.splice(bi, 1);
    setTrackingGroups(groups);
  };

  const updateGroup = (gi: number, field: string, value: string) => {
    const groups = [...trackingGroups];
    groups[gi][field] = value;
    setTrackingGroups(groups);
  };

  const updateBox = (gi: number, bi: number, field: string, value: string) => {
    const groups = [...trackingGroups];
    groups[gi].boxes[bi][field] = value;
    setTrackingGroups(groups);
  };

  const handleAddParcel = async () => {
    setError("");
    if (customerType === "registered" && !addParcelForm.customerId) { setError("Select a customer"); return; }
    if (customerType === "walkin" && !addParcelForm.walkInName) { setError("Walk-in name is required"); return; }

    // Validate tracking groups — either at least one valid group or carry-over selected
    const validGroups = trackingGroups.filter((g) => g.trackingNumber.trim() && g.boxes.some((b: any) => b.boxNumber.trim()));
    const hasCarryOver = selectedCarryOverIds.length > 0;

    if (validGroups.length === 0 && !hasCarryOver) {
      setError("Add at least one tracking group with boxes OR select carry-over cartons");
      return;
    }

    setSaving(true);
    try {
      const payload: any = { notes: addParcelForm.notes || undefined };
      if (customerType === "registered") {
        payload.customerId = addParcelForm.customerId;
        if (hasCarryOver) payload.carryOverBoxIds = selectedCarryOverIds;
      } else {
        payload.walkInName = addParcelForm.walkInName;
        if (addParcelForm.walkInPhone) payload.walkInPhone = addParcelForm.walkInPhone;
      }
      if (validGroups.length > 0) {
        payload.trackingGroups = validGroups.map((g) => ({
          trackingNumber: g.trackingNumber.trim(),
          supplierName: g.supplierName || undefined,
          boxes: g.boxes
            .filter((b: any) => b.boxNumber.trim())
            .map((b: any) => ({
              boxNumber: b.boxNumber.trim(),
              weightKg: b.weightKg ? parseFloat(b.weightKg) : undefined,
              cbm: b.cbm ? parseFloat(b.cbm) : undefined,
              productName: b.productName || undefined,
              productType: b.productType || undefined,
              productPrice: b.productPrice ? parseFloat(b.productPrice) : undefined,
              shippingCharge: b.shippingCharge ? parseFloat(b.shippingCharge) : undefined,
              remarks: b.remarks || undefined,
            })),
        }));
      }

      await api.post(`/lots/${id}/customers`, payload);
      setShowAddParcel(false);
      resetParcelForm();
      loadLot();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add parcel");
    } finally { setSaving(false); }
  };

  const handleDownloadReport = async () => {
    try {
      const res = await api.get(`/lots/${id}/report`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Lot-${lot?.lotNumber || id}-Report.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download report");
    }
  };

  if (loading || !lot) return <Loading />;

  const totalCarryOverIds = undeliveredGroups.flatMap((g: any) => g.boxes.map((b: any) => b.id));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-white border border-gray-line grid place-items-center hover:bg-brand-soft transition-colors cursor-pointer">
          <ArrowLeft size={18} className="text-brand" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[26px] font-display text-brand-ink">{lot.lotNumber}</h1>
            <span className={`badge inline-flex items-center gap-1.5 ${lot.method === "AIR" ? "bg-brand-soft text-brand" : "bg-gray-100 text-gray-label"}`}>
              {lot.method === "AIR" ? <Plane size={12} /> : <Ship size={12} />}
              {lot.method}
            </span>
          </div>
          <p className="text-[13px] text-gray-label">
            {lot.customerGroups.length} customer{lot.customerGroups.length !== 1 ? "s" : ""} · {lot.totals.totalBoxes} boxes
          </p>
        </div>
        <ShipmentBadge status={lot.status as any} />
        {isAdmin && (
          <>
            <button className="btn-ghost py-2 px-4 text-[13px] flex items-center gap-1.5" onClick={handleDownloadReport}>
              <FileSpreadsheet size={14} /> Download Report
            </button>
            <button className="btn-ghost py-2 px-4 text-[13px]" onClick={() => setShowStatusUpdate(true)}>Update Status</button>
            <button className="btn-blue py-2 px-4 text-[13px]" onClick={openAddParcel}>
              <Plus size={14} /> Add Parcel
            </button>
          </>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-[12px] text-gray-label font-semibold">Total Customers</div>
          <div className="text-lg font-display text-brand-ink mt-1">{lot.customerGroups.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-gray-label font-semibold">Total Boxes</div>
          <div className="text-lg font-display text-brand-ink mt-1">{lot.totals.totalBoxes}</div>
          <div className="text-[12px] text-gray-label">{lot.totals.delivered} delivered</div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-gray-label font-semibold">Revenue</div>
          <div className="text-sm text-brand-ink mt-1">{"৳"}{Number(lot.totals.totalRevenue).toLocaleString()}</div>
          <div className="text-[12px] text-danger">{"৳"}{Number(lot.totals.totalOutstanding).toLocaleString()} due</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          {/* Progress Overview */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-display text-brand-ink">Overall Progress</h3>
              <ProgressBar delivered={lot.totals.delivered} total={lot.totals.totalBoxes} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-brand-mist rounded-lg">
                <div className="text-lg font-bold text-brand-ink">{lot.totals.inChina}</div>
                <div className="text-[11px] text-gray-label">In China</div>
              </div>
              <div className="text-center p-3 bg-warning-soft rounded-lg">
                <div className="text-lg font-bold text-warning">{lot.totals.inTransit}</div>
                <div className="text-[11px] text-gray-label">In Transit</div>
              </div>
              <div className="text-center p-3 bg-brand-soft rounded-lg">
                <div className="text-lg font-bold text-brand">{lot.totals.arrived}</div>
                <div className="text-[11px] text-gray-label">Arrived</div>
              </div>
              <div className="text-center p-3 bg-success-soft rounded-lg">
                <div className="text-lg font-bold text-success">{lot.totals.delivered}</div>
                <div className="text-[11px] text-gray-label">Delivered</div>
              </div>
            </div>
          </div>

          {/* Customer Groups */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-line">
              <h3 className="text-base font-display text-brand-ink">Customers ({lot.customerGroups.length})</h3>
            </div>

            {lot.customerGroups.length === 0 ? (
              <div className="p-8 text-center text-gray-label text-sm">
                No customers yet.{isAdmin && " Click \"Add Parcel\" to add customers with their boxes."}
              </div>
            ) : (
              <div className="divide-y divide-gray-line">
                {lot.customerGroups.map((group, gi) => (
                  <div key={gi} className="p-4">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-brand-ink">{group.customer.fullName || group.customer.phone || "—"}</span>
                        {group.customer.isWalkIn ? (
                          <span className="badge bg-warning-soft text-warning text-[10px] inline-flex items-center gap-1"><UserIcon size={10} /> Walk-in</span>
                        ) : (
                          <span className="badge bg-success-soft text-success text-[10px] inline-flex items-center gap-1"><UserCheck size={10} /> Registered</span>
                        )}
                      </div>
                      <div className="text-[12px] text-gray-label mt-0.5">
                        {group.customer.companyName || group.customer.phone || "—"}
                      </div>
                    </div>

                    <div className="space-y-2 ml-2 border-l-2 border-brand-soft pl-4">
                      {group.entries.map((c: any) => {
                        const isExpanded = expandedCustomer === c.shipmentId;
                        const isCarried = c.belongsToLotId !== lot.id;
                        return (
                          <div key={c.shipmentId} className="border border-gray-line rounded-xl overflow-hidden">
                            <div className="p-3 hover:bg-brand-mist cursor-pointer" onClick={() => setExpandedCustomer(isExpanded ? null : c.shipmentId)}>
                              <div className="flex items-center gap-2 flex-wrap">
                                {isExpanded ? <ChevronDown size={14} className="text-gray-label" /> : <ChevronRight size={14} className="text-gray-label" />}
                                <span className="text-[12px] tabular-nums font-bold text-brand">{c.trackingNumber}</span>
                                {isCarried && <span className="badge bg-warning-soft text-warning text-[10px]">Carried Over</span>}
                                {c.supplierName && <><span className="text-[12px] text-gray-label">·</span><span className="text-[12px] text-gray-label">{c.supplierName}</span></>}
                                <div className="ml-auto flex items-center gap-3">
                                  <span className="text-[12px] font-semibold text-brand-ink">{c.boxes.total} boxes · {c.boxes.delivered} delivered</span>
                                  <ProgressBar delivered={c.boxes.delivered} total={c.boxes.total} />
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="bg-brand-mist p-3 border-t border-gray-line">
                                {c.boxes.total > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-[11px]">
                                      <thead>
                                        <tr className="text-gray-label font-semibold text-left">
                                          <th className="px-2 py-1.5">Box</th>
                                          <th className="px-2 py-1.5">Product</th>
                                          <th className="px-2 py-1.5">Type</th>
                                          <th className="px-2 py-1.5 text-right">Weight</th>
                                          <th className="px-2 py-1.5 text-right">CBM</th>
                                          <th className="px-2 py-1.5 text-right">Value</th>
                                          <th className="px-2 py-1.5">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {c.boxes.items.map((box: any) => (
                                          <tr key={box.id} className="border-t border-gray-line/50">
                                            <td className="px-2 py-1.5 font-semibold text-brand-ink">{box.boxNumber}</td>
                                            <td className="px-2 py-1.5 text-gray-label">{box.productName || "—"}</td>
                                            <td className="px-2 py-1.5 text-gray-label">{box.productType || "—"}</td>
                                            <td className="px-2 py-1.5 text-right text-gray-label">{box.weightKg ? `${box.weightKg}kg` : "—"}</td>
                                            <td className="px-2 py-1.5 text-right text-gray-label">{box.cbm || "—"}</td>
                                            <td className="px-2 py-1.5 text-right text-gray-label">{box.productPrice ? `৳${Number(box.productPrice).toLocaleString()}` : "—"}</td>
                                            <td className="px-2 py-1.5"><BoxBadge status={box.status as any} /></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-label text-sm py-3">No boxes</div>
                                )}

                                {c.invoices.length > 0 && (
                                  <div className="mt-3">
                                    <div className="text-[11px] text-gray-label font-semibold uppercase tracking-wide mb-1.5">Invoices</div>
                                    <div className="space-y-1.5">
                                      {c.invoices.map((inv: any) => (
                                        <div key={inv.id} className="bg-white rounded-lg p-2 flex items-center justify-between text-[12px]">
                                          <span className="font-semibold tabular-nums">{inv.invoiceNumber}</span>
                                          <span className="text-gray-label">{inv.description}</span>
                                          <span className="font-semibold tabular-nums">{"৳"}{Number(inv.totalAmount).toLocaleString()}</span>
                                          <PaymentBadge status={inv.paymentStatus as any} />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-3">
                                  <Link href={`/dashboard/orders/${c.shipmentId}`} className="btn-blue py-1.5 px-3 text-[12px] inline-flex items-center gap-1.5">
                                    <ExternalLink size={12} /> Manage Boxes & Invoices
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lot.notes && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-brand-ink mb-2">Lot Notes</h3>
              <p className="text-sm text-gray-label">{lot.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-line">
            <h3 className="text-base font-display text-brand-ink">Lot Timeline</h3>
          </div>
          {lot.trackingHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-label text-sm">No history yet</div>
          ) : (
            <ul className="px-5 py-4 space-y-0">
              {lot.trackingHistory.map((entry, i) => {
                const isLast = i === lot.trackingHistory.length - 1;
                return (
                  <li key={entry.id} className="flex gap-4 relative pb-6 last:pb-1">
                    {!isLast && <div className="absolute left-[10px] top-6 bottom-0 w-[2px] bg-brand" />}
                    <div className={`w-[22px] h-[22px] rounded-full shrink-0 grid place-items-center text-[11px] relative z-10 ${isLast ? "bg-white border-[3px] border-brand shadow-[0_0_0_5px_var(--color-brand-soft)]" : "bg-brand text-white"}`}>{!isLast ? "✓" : ""}</div>
                    <div>
                      <div className={`text-sm font-semibold ${isLast ? "text-brand" : "text-brand-ink"}`}>{entry.remark || entry.status}</div>
                      <div className="text-[12px] text-gray-label">
                        {new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {entry.updatedByName ? ` · by ${entry.updatedByName}` : ""}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ═══ MODAL: UPDATE STATUS ═══ */}
      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowStatusUpdate(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[420px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-brand-ink">Update Lot Status</h2>
              <button onClick={() => setShowStatusUpdate(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-label mb-4">
              This will update the status for <b>all {lot.customerGroups.length} customer(s)</b> and send them notifications.
            </p>
            <div className="space-y-3.5">
              <div>
                <label className="field-label">New Status *</label>
                <select className="field-input" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Remark</label>
                <input className="field-input" placeholder="e.g. Flight departed 6PM" value={statusForm.remark} onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })} />
              </div>
            </div>
            <button className="btn-blue w-full justify-center mt-5" onClick={handleStatusUpdate} disabled={saving || !statusForm.status}>
              {saving ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      )}

      {/* ═══ MODAL: ADD PARCEL ═══ */}
      {showAddParcel && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowAddParcel(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[900px] shadow-xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-brand-ink">Add Parcel to {lot.lotNumber}</h2>
              <button onClick={() => setShowAddParcel(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>

            {/* Customer Type Toggle */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setCustomerType("registered")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border-[1.5px] cursor-pointer transition-colors ${customerType === "registered" ? "bg-brand text-white border-brand" : "bg-white border-gray-line text-gray-label"}`}>
                <UserCheck size={16} className="inline mr-1.5" /> Registered Customer
              </button>
              <button onClick={() => setCustomerType("walkin")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border-[1.5px] cursor-pointer transition-colors ${customerType === "walkin" ? "bg-brand text-white border-brand" : "bg-white border-gray-line text-gray-label"}`}>
                <UserIcon size={16} className="inline mr-1.5" /> Walk-in
              </button>
            </div>

            <div className="space-y-3.5">
              {customerType === "registered" ? (
                <div>
                  <label className="field-label">Select Customer *</label>
                  <select className="field-input" value={addParcelForm.customerId} onChange={(e) => setAddParcelForm({ ...addParcelForm, customerId: e.target.value })}>
                    <option value="">Choose customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.profile?.fullName || c.phone} — {c.phone}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Walk-in Name *</label>
                    <input className="field-input" placeholder="e.g. Rahim Traders" value={addParcelForm.walkInName} onChange={(e) => setAddParcelForm({ ...addParcelForm, walkInName: e.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Walk-in Phone</label>
                    <input className="field-input" placeholder="01XXXXXXXXX" value={addParcelForm.walkInPhone} onChange={(e) => setAddParcelForm({ ...addParcelForm, walkInPhone: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Carry-Over */}
              {customerType === "registered" && addParcelForm.customerId && undeliveredGroups.length > 0 && (
                <div className="border border-warning rounded-xl p-3 bg-warning-soft/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-brand-ink">Carry Over Undelivered Cartons</div>
                    <button type="button"
                      onClick={() => setSelectedCarryOverIds(selectedCarryOverIds.length === totalCarryOverIds.length ? [] : totalCarryOverIds)}
                      className="text-brand text-[12px] font-semibold hover:underline cursor-pointer">
                      {selectedCarryOverIds.length === totalCarryOverIds.length ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto">
                    {undeliveredGroups.map((group: any) => (
                      <div key={group.shipmentId} className="bg-white rounded-lg p-2">
                        <div className="text-[11px] text-gray-label font-semibold mb-1">
                          Tracking <span className="tabular-nums font-bold text-brand">{group.trackingNumber}</span>
                          {group.originalLotNumber ? ` · from ${group.originalLotNumber}` : ""}
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          {group.boxes.map((box: any) => {
                            const isSelected = selectedCarryOverIds.includes(box.id);
                            return (
                              <button key={box.id} type="button"
                                onClick={() => setSelectedCarryOverIds((prev) => prev.includes(box.id) ? prev.filter((i) => i !== box.id) : [...prev, box.id])}
                                className={`border-[1.5px] rounded p-1 text-center text-[11px] cursor-pointer ${isSelected ? "border-brand bg-brand-soft" : "border-gray-line bg-white"}`}>
                                <div className="font-semibold">{box.boxNumber}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tracking Groups */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="field-label mb-0">Tracking Groups (new cartons)</label>
                  <button type="button" onClick={addTrackingGroup} className="text-brand text-[13px] font-semibold hover:underline cursor-pointer">
                    + Add another tracking number
                  </button>
                </div>

                <div className="space-y-4">
                  {trackingGroups.map((group, gi) => (
                    <div key={gi} className="border border-gray-line rounded-xl p-3 bg-brand-mist">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input className="field-input text-[13px] bg-white" placeholder="Tracking Number *"
                            value={group.trackingNumber} onChange={(e) => updateGroup(gi, "trackingNumber", e.target.value)} />
                          <input className="field-input text-[13px] bg-white" placeholder="Supplier Name (optional)"
                            value={group.supplierName} onChange={(e) => updateGroup(gi, "supplierName", e.target.value)} />
                        </div>
                        {trackingGroups.length > 1 && (
                          <button type="button" onClick={() => removeTrackingGroup(gi)} className="text-danger hover:text-danger/70 cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {/* Box headers */}
                      <div className="grid grid-cols-[70px_1fr_1fr_70px_70px_90px_80px_30px] gap-1 mb-1 text-[10px] text-gray-label font-semibold uppercase tracking-wide">
                        <div>Box №</div>
                        <div>Product</div>
                        <div>Type</div>
                        <div className="text-right">Weight</div>
                        <div className="text-right">CBM</div>
                        <div className="text-right">Value ৳</div>
                        <div className="text-right">Shipping ৳</div>
                        <div></div>
                      </div>

                      <div className="space-y-1.5">
                        {group.boxes.map((box: any, bi: number) => (
                          <div key={bi} className="grid grid-cols-[70px_1fr_1fr_70px_70px_90px_80px_30px] gap-1 items-center">
                            <input className="field-input text-[12px] py-1.5 bg-white" placeholder="Box-01"
                              value={box.boxNumber} onChange={(e) => updateBox(gi, bi, "boxNumber", e.target.value)} />
                            <input className="field-input text-[12px] py-1.5 bg-white" placeholder="e.g. iPhones"
                              value={box.productName} onChange={(e) => updateBox(gi, bi, "productName", e.target.value)} />
                            <select className="field-input text-[12px] py-1.5 bg-white"
                              value={box.productType} onChange={(e) => updateBox(gi, bi, "productType", e.target.value)}>
                              <option value="">Select</option>
                              {productTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <input className="field-input text-[12px] py-1.5 bg-white text-right" placeholder="kg"
                              value={box.weightKg} onChange={(e) => updateBox(gi, bi, "weightKg", e.target.value)} />
                            <input className="field-input text-[12px] py-1.5 bg-white text-right" placeholder="cbm"
                              value={box.cbm} onChange={(e) => updateBox(gi, bi, "cbm", e.target.value)} />
                            <input className="field-input text-[12px] py-1.5 bg-white text-right" placeholder="0"
                              value={box.productPrice} onChange={(e) => updateBox(gi, bi, "productPrice", e.target.value)} />
                            <input className="field-input text-[12px] py-1.5 bg-white text-right" placeholder="0"
                              value={box.shippingCharge} onChange={(e) => updateBox(gi, bi, "shippingCharge", e.target.value)} />
                            <button type="button" onClick={() => removeBoxFromGroup(gi, bi)} className="text-danger hover:text-danger/70 cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={() => addBoxToGroup(gi)} className="text-brand text-[12px] font-semibold mt-2 hover:underline cursor-pointer">
                        + Add box to this tracking
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">Parcel Notes</label>
                <textarea className="field-input min-h-[60px]" placeholder="Optional" value={addParcelForm.notes} onChange={(e) => setAddParcelForm({ ...addParcelForm, notes: e.target.value })} />
              </div>
            </div>

            {error && <div className="mt-3 p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}

            <button className="btn-blue w-full justify-center mt-5" onClick={handleAddParcel} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? "Adding..." : "Add Parcel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}