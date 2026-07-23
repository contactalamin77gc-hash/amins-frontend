"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { ShipmentBadge, PaymentBadge, BoxBadge } from "@/components/ui/status-badge";
import ProgressBar from "@/components/ui/progress-bar";
import Loading from "@/components/ui/loading";
import { ArrowLeft, Download, Plus, X, Loader2, Trash2 } from "lucide-react";
import type { Shipment } from "@/lib/types";

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

const BOX_STATUS_OPTIONS = [
  { value: "IN_CHINA", label: "In China" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "ARRIVED", label: "Arrived" },
  { value: "DELIVERED", label: "Delivered" },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isRole } = useAuth();
  const router = useRouter();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  const [productTypes, setProductTypes] = useState<string[]>([]);

  const [showAddBoxes, setShowAddBoxes] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const [showEditInvoice, setShowEditInvoice] = useState<any>(null);
  const [editInvoiceForm, setEditInvoiceForm] = useState({ paidAmount: "", paymentStatus: "" });

  const [boxRows, setBoxRows] = useState([{ boxNumber: "", weightKg: "", cbm: "", productName: "", productType: "", productPrice: "", shippingCharge: "", remarks: "" }]);
  const [statusForm, setStatusForm] = useState({ status: "", remark: "" });
  const [bulkStatus, setBulkStatus] = useState("DELIVERED");
  const [invoiceForm, setInvoiceForm] = useState({
    description: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    paidAmount: "0",
    items: [{ productName: "", description: "", price: "", quantity: "1" }],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = isRole("SUPER_ADMIN", "ADMIN");
  const isStaff = isRole("SUPER_ADMIN", "ADMIN", "MANAGER");

  const loadShipment = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/shipments/${id}`);
      setShipment(res.data);
    } catch {
      router.push("/dashboard/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadShipment(); }, [id]);

  useEffect(() => {
    api.get("/shipping-rates/categories")
      .then((res) => setProductTypes(res.data.categories || []))
      .catch(() => setProductTypes([]));
  }, []);

  const addBoxRow = () => {
    const nextNum = boxRows.length + (shipment?.boxes.total || 0) + 1;
    setBoxRows([...boxRows, { boxNumber: `Box-${String(nextNum).padStart(2, "0")}`, weightKg: "", cbm: "", productName: "", productType: "", productPrice: "", shippingCharge: "", remarks: "" }]);
  };

  const removeBoxRow = (i: number) => {
    if (boxRows.length <= 1) return;
    setBoxRows(boxRows.filter((_, idx) => idx !== i));
  };

  const handleAddBoxes = async () => {
    setError("");
    const valid = boxRows.filter((b) => b.boxNumber.trim());
    if (valid.length === 0) { setError("Add at least one box with a number"); return; }
    setSaving(true);
    try {
      await api.post(`/shipments/${id}/boxes`, valid.map((b) => ({
        boxNumber: b.boxNumber.trim(),
        weightKg: b.weightKg ? parseFloat(b.weightKg) : undefined,
        cbm: b.cbm ? parseFloat(b.cbm) : undefined,
        productName: b.productName || undefined,
        productType: b.productType || undefined,
        productPrice: b.productPrice ? parseFloat(b.productPrice) : undefined,
        shippingCharge: b.shippingCharge ? parseFloat(b.shippingCharge) : undefined,
        remarks: b.remarks || undefined,
      })));
      setShowAddBoxes(false);
      setBoxRows([{ boxNumber: "", weightKg: "", cbm: "", productName: "", productType: "", productPrice: "", shippingCharge: "", remarks: "" }]);
      loadShipment();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add boxes");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusForm.status) return;
    setSaving(true);
    try {
      await api.patch(`/shipments/${id}/status`, statusForm);
      setShowStatusUpdate(false);
      setStatusForm({ status: "", remark: "" });
      loadShipment();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBoxStatusChange = async (boxId: string, newStatus: string) => {
    try {
      await api.patch(`/shipments/${id}/boxes/${boxId}`, { status: newStatus });
      loadShipment();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update box");
    }
  };

  const toggleBoxSelect = (boxId: string) => {
    setSelectedBoxIds((prev) =>
      prev.includes(boxId) ? prev.filter((i) => i !== boxId) : [...prev, boxId]
    );
  };

  const selectAllBoxes = () => {
    if (!shipment) return;
    const undelivered = shipment.boxes.items.filter((b) => b.status !== "DELIVERED").map((b) => b.id);
    setSelectedBoxIds(undelivered);
  };

  const handleBulkUpdate = async () => {
    if (selectedBoxIds.length === 0) return;
    setSaving(true);
    try {
      await api.patch(`/shipments/${id}/boxes/bulk-status`, { boxIds: selectedBoxIds, status: bulkStatus });
      setShowBulkUpdate(false);
      setSelectedBoxIds([]);
      loadShipment();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBox = async (boxId: string, boxNumber: string) => {
    if (!confirm(`Delete ${boxNumber}? This cannot be undone.`)) return;
    try {
      await api.delete(`/shipments/${id}/boxes/${boxId}`);
      loadShipment();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { productName: "", description: "", price: "", quantity: "1" }],
    });
  };

  const removeInvoiceItem = (i: number) => {
    if (invoiceForm.items.length <= 1) return;
    setInvoiceForm({ ...invoiceForm, items: invoiceForm.items.filter((_, idx) => idx !== i) });
  };

  const handleCreateInvoice = async () => {
    setError("");
    if (!invoiceForm.description) { setError("Description is required"); return; }
    const validItems = invoiceForm.items.filter((item) => item.productName && item.price);
    if (validItems.length === 0) { setError("Add at least one item with product name and price"); return; }
    const paidAmount = parseFloat(invoiceForm.paidAmount) || 0;
    setSaving(true);
    try {
      await api.post("/invoices", {
        shipmentId: id,
        description: invoiceForm.description,
        invoiceDate: invoiceForm.invoiceDate,
        paidAmount,
        items: validItems.map((item) => ({
          description: `${item.productName}${item.description ? ' — ' + item.description : ''}`,
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.price),
        })),
      });
      setShowCreateInvoice(false);
      setInvoiceForm({ description: "", invoiceDate: new Date().toISOString().split("T")[0], paidAmount: "0", items: [{ productName: "", description: "", price: "", quantity: "1" }] });
      loadShipment();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const res = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF");
    }
  };

  const handleEditInvoice = async () => {
    if (!showEditInvoice) return;
    setSaving(true);
    try {
      await api.patch(`/invoices/${showEditInvoice.id}`, {
        paidAmount: parseFloat(editInvoiceForm.paidAmount) || 0,
        paymentStatus: editInvoiceForm.paymentStatus || undefined,
      });
      setShowEditInvoice(null);
      loadShipment();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return;
    try {
      await api.delete(`/invoices/${invoiceId}`);
      loadShipment();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete invoice");
    }
  };

  if (loading || !shipment) return <Loading />;
  const boxes = shipment.boxes;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-white border border-gray-line grid place-items-center hover:bg-brand-soft transition-colors cursor-pointer">
          <ArrowLeft size={18} className="text-brand" />
        </button>
        <div className="flex-1">
          <h1 className="text-[26px] font-display text-brand-ink">{shipment.trackingNumber}</h1>
          <p className="text-[13px] text-gray-label">{shipment.orderNumber} · {shipment.supplierName}</p>
        </div>
        <ShipmentBadge status={shipment.status} />
        {isStaff && <button className="btn-ghost py-2 px-4 text-[13px]" onClick={() => setShowStatusUpdate(true)}>Update Status</button>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4"><div className="text-[12px] text-gray-label font-semibold">Method</div><div className="text-lg font-display text-brand-ink mt-1">{shipment.method}</div></div>
        <div className="card p-4"><div className="text-[12px] text-gray-label font-semibold">Customer</div><div className="text-sm font-semibold text-brand-ink mt-1">{shipment.customer?.fullName || shipment.customer?.phone}</div><div className="text-[12px] text-gray-label">{shipment.customer?.companyName || ""}</div></div>
        <div className="card p-4"><div className="text-[12px] text-gray-label font-semibold">Route</div><div className="text-sm text-brand-ink mt-1">{shipment.chinaWarehouse || "China"} {"→"} {shipment.bangladeshWarehouse || "Dhaka"}</div></div>
        <div className="card p-4"><div className="text-[12px] text-gray-label font-semibold">ETA</div><div className="text-sm text-brand-ink mt-1">{shipment.actualArrival ? `Arrived ${new Date(shipment.actualArrival).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : shipment.estimatedArrival ? new Date(shipment.estimatedArrival).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-line bg-brand-mist flex-wrap">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-success to-warning grid place-items-center shrink-0">
                <span className="w-10 h-10 bg-white rounded-full grid place-items-center text-xs font-extrabold text-brand-ink">{boxes.delivered}/{boxes.total}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-display text-brand-ink">Box Status</h3>
                <p className="text-[13px] text-gray-label"><b className="text-success">{boxes.delivered} delivered</b> · <b className="text-warning">{boxes.remaining} remaining</b> · {boxes.total} total</p>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button className="btn-blue py-1.5 px-3 text-[12px]" onClick={() => setShowAddBoxes(true)}><Plus size={14} /> Add Boxes</button>
                  {boxes.total > 0 && <button className="btn-ghost py-1.5 px-3 text-[12px]" onClick={() => { setShowBulkUpdate(true); selectAllBoxes(); }}>Bulk Update</button>}
                </div>
              )}
            </div>
            {boxes.total === 0 ? (
              <div className="px-4 py-10 text-center text-gray-label text-sm">No boxes added yet.{isAdmin && " Click \"Add Boxes\" to add cartons."}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4">
                {boxes.items.map((box) => (
                  <div key={box.id} className={`border-[1.5px] rounded-xl p-3 text-center text-[12px] transition-all relative group ${box.status === "DELIVERED" ? "border-success bg-success-soft" : box.status === "IN_TRANSIT" ? "border-warning bg-warning-soft" : box.status === "ARRIVED" ? "border-brand bg-brand-soft" : "border-gray-line bg-white"}`}>
                    <div className="font-semibold text-[13px] text-brand-ink mb-1.5">{box.boxNumber}</div>
                    <BoxBadge status={box.status} />
                    <div className="text-gray-label mt-1.5">{box.weightKg ? `${box.weightKg} kg` : "—"}{box.cbm ? ` · ${box.cbm} CBM` : ""}</div>
                    {box.remarks && <div className="text-[11px] text-gray-label mt-1 italic">{box.remarks}</div>}
                    {isAdmin && (
                      <div className="absolute inset-0 bg-white/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                        <select className="text-[11px] border border-gray-line rounded-lg px-2 py-1 bg-white cursor-pointer" value={box.status} onChange={(e) => handleBoxStatusChange(box.id, e.target.value)}>
                          {BOX_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <button onClick={() => handleDeleteBox(box.id, box.boxNumber)} className="text-[11px] text-danger hover:underline cursor-pointer">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-line">
              <h3 className="text-base font-display text-brand-ink">Invoices</h3>
              {isAdmin && <button className="btn-blue py-1.5 px-3 text-[12px]" onClick={() => setShowCreateInvoice(true)}><Plus size={14} /> Create Invoice</button>}
            </div>
            {shipment.invoices.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-label text-sm">No invoices yet.{isAdmin && " Click \"Create Invoice\" to generate one."}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                      <th className="text-left px-4 py-3">Invoice №</th>
                      <th className="text-left px-4 py-3">Description</th>
                      <th className="text-left px-4 py-3">Amount</th>
                      <th className="text-left px-4 py-3">Paid</th>
                      <th className="text-left px-4 py-3">Due</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipment.invoices.map((inv: any) => (
                      <tr key={inv.id} className="border-b border-gray-line last:border-0">
                        <td className="px-4 py-3 font-semibold text-sm tabular-nums">{inv.invoiceNumber}</td>
                        <td className="px-4 py-3 text-sm">{inv.description}</td>
                        <td className="px-4 py-3 font-semibold text-sm tabular-nums">{"৳"}{Number(inv.totalAmount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm tabular-nums text-success">{"৳"}{Number(inv.paidAmount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-sm tabular-nums text-danger">{"৳"}{(Number(inv.totalAmount) - Number(inv.paidAmount || 0)).toLocaleString()}</td>
                        <td className="px-4 py-3"><PaymentBadge status={inv.paymentStatus} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => downloadPdf(inv.id, inv.invoiceNumber)} title="Download PDF" className="w-8 h-8 rounded-lg bg-brand-soft text-brand grid place-items-center hover:bg-brand hover:text-white transition-colors cursor-pointer"><Download size={14} /></button>
                            {isAdmin && (
                              <>
                                <button onClick={() => { setShowEditInvoice(inv); setEditInvoiceForm({ paidAmount: String(inv.paidAmount || 0), paymentStatus: inv.paymentStatus }); }} title="Edit" className="w-8 h-8 rounded-lg bg-warning-soft text-warning grid place-items-center hover:bg-warning hover:text-white transition-colors cursor-pointer">{"✎"}</button>
                                <button onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)} title="Delete" className="w-8 h-8 rounded-lg bg-danger-soft text-danger grid place-items-center hover:bg-danger hover:text-white transition-colors cursor-pointer"><Trash2 size={12} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {shipment.notes && <div className="card p-5"><h3 className="text-sm font-semibold text-brand-ink mb-2">Shipment Notes</h3><p className="text-sm text-gray-label">{shipment.notes}</p></div>}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-line">
            <h3 className="text-base font-display text-brand-ink">Tracking Timeline</h3>
          </div>
          {shipment.trackingHistory.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-label text-sm">No tracking history</div>
          ) : (
            <ul className="px-5 py-4 space-y-0">
              {shipment.trackingHistory.map((entry, i) => {
                const isLast = i === shipment.trackingHistory.length - 1;
                return (
                  <li key={entry.id} className="flex gap-4 relative pb-6 last:pb-1">
                    {!isLast && <div className={`absolute left-[10px] top-6 bottom-0 w-[2px] ${!isLast ? "bg-brand" : "bg-gray-line"}`} />}
                    <div className={`w-[22px] h-[22px] rounded-full shrink-0 grid place-items-center text-[11px] relative z-10 ${isLast ? "bg-white border-[3px] border-brand shadow-[0_0_0_5px_var(--color-brand-soft)]" : "bg-brand text-white"}`}>{!isLast ? "✓" : ""}</div>
                    <div>
                      <div className={`text-sm font-semibold ${isLast ? "text-brand" : "text-brand-ink"}`}>{entry.remark || entry.status}</div>
                      <div className="text-[12.5px] text-gray-label">{new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{entry.updatedByName ? ` · by ${entry.updatedByName}` : ""}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ═══ MODAL: ADD BOXES ═══ */}
      {showAddBoxes && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowAddBoxes(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[900px] shadow-xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-brand-ink">Add Boxes to {shipment.trackingNumber}</h2>
              <button onClick={() => setShowAddBoxes(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <p className="text-[13px] text-gray-label mb-4">Add one or more boxes. Each box gets its own tracking status.</p>

            {/* Column headers */}
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
              {boxRows.map((row: any, i: number) => (
                <div key={i} className="grid grid-cols-[70px_1fr_1fr_70px_70px_90px_80px_30px] gap-1 items-center">
                  <input className="field-input text-[12px] py-1.5" placeholder="Box-01"
                    value={row.boxNumber} onChange={(e) => { const r = [...boxRows]; r[i].boxNumber = e.target.value; setBoxRows(r); }} />
                  <input className="field-input text-[12px] py-1.5" placeholder="e.g. iPhones"
                    value={row.productName || ""} onChange={(e) => { const r = [...boxRows]; r[i].productName = e.target.value; setBoxRows(r); }} />
                  <select className="field-input text-[12px] py-1.5"
                    value={row.productType || ""} onChange={(e) => { const r = [...boxRows]; r[i].productType = e.target.value; setBoxRows(r); }}>
                    <option value="">Select</option>
                    {productTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input className="field-input text-[12px] py-1.5 text-right" placeholder="kg"
                    value={row.weightKg} onChange={(e) => { const r = [...boxRows]; r[i].weightKg = e.target.value; setBoxRows(r); }} />
                  <input className="field-input text-[12px] py-1.5 text-right" placeholder="cbm"
                    value={row.cbm} onChange={(e) => { const r = [...boxRows]; r[i].cbm = e.target.value; setBoxRows(r); }} />
                  <input className="field-input text-[12px] py-1.5 text-right" placeholder="0"
                    value={row.productPrice || ""} onChange={(e) => { const r = [...boxRows]; r[i].productPrice = e.target.value; setBoxRows(r); }} />
                  <input className="field-input text-[12px] py-1.5 text-right" placeholder="0"
                    value={row.shippingCharge || ""} onChange={(e) => { const r = [...boxRows]; r[i].shippingCharge = e.target.value; setBoxRows(r); }} />
                  <button onClick={() => removeBoxRow(i)} className="text-danger hover:text-danger/70 cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addBoxRow} className="text-brand text-[13px] font-semibold mt-3 hover:underline cursor-pointer">+ Add another box</button>

            {error && <div className="mt-3 p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}

            <button className="btn-blue w-full justify-center mt-5" onClick={handleAddBoxes} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? "Adding..." : `Add ${boxRows.filter((b) => b.boxNumber.trim()).length} Box(es)`}
            </button>
          </div>
        </div>
      )}

      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowStatusUpdate(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[420px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-brand-ink">Update Status</h2>
              <button onClick={() => setShowStatusUpdate(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-label mb-4">Current: <ShipmentBadge status={shipment.status} /></p>
            <div className="space-y-3.5">
              <div><label className="field-label">New Status *</label><select className="field-input" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}><option value="">Select status</option>{STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              <div><label className="field-label">Remark</label><input className="field-input" placeholder="e.g. Flight CZ-3091" value={statusForm.remark} onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })} /></div>
            </div>
            <button className="btn-blue w-full justify-center mt-5" onClick={handleStatusUpdate} disabled={saving || !statusForm.status}>{saving ? "Updating..." : "Update Status"}</button>
          </div>
        </div>
      )}

      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowBulkUpdate(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[480px] shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-brand-ink">Bulk Update Boxes</h2>
              <button onClick={() => setShowBulkUpdate(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <div className="mb-4"><label className="field-label">Set status to</label><select className="field-input" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>{BOX_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div className="mb-3 flex items-center justify-between"><span className="text-sm text-gray-label">{selectedBoxIds.length} selected</span><button onClick={selectAllBoxes} className="text-brand text-[13px] font-semibold cursor-pointer hover:underline">Select all undelivered</button></div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {boxes.items.map((box) => (
                <button key={box.id} onClick={() => toggleBoxSelect(box.id)} className={`border-[1.5px] rounded-lg p-2 text-center text-[12px] cursor-pointer transition-all ${selectedBoxIds.includes(box.id) ? "border-brand bg-brand-soft" : "border-gray-line bg-white"}`}>
                  <div className="font-semibold text-brand-ink">{box.boxNumber}</div><div className="text-[11px] text-gray-label">{box.status}</div>
                </button>
              ))}
            </div>
            <button className="btn-blue w-full justify-center" onClick={handleBulkUpdate} disabled={saving || selectedBoxIds.length === 0}>{saving ? "Updating..." : `Update ${selectedBoxIds.length} Boxes`}</button>
          </div>
        </div>
      )}

      {showCreateInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowCreateInvoice(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[780px] shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-brand-ink">Create Invoice</h2>
              <button onClick={() => setShowCreateInvoice(false)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <p className="text-[13px] text-gray-label mb-4">For shipment {shipment.trackingNumber} — {shipment.customer?.fullName}</p>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="field-label">Invoice Description *</label><input className="field-input" placeholder="e.g. Product cost, Shipping charge" value={invoiceForm.description} onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })} /></div>
                <div><label className="field-label">Invoice Date</label><input className="field-input" type="date" value={invoiceForm.invoiceDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })} /></div>
              </div>
              <div>
                <label className="field-label">Line Items</label>
                <div className="flex gap-2 mb-1.5">
                  <div className="w-10 text-[11px] text-gray-label font-semibold uppercase tracking-wide">S/N</div>
                  <div className="flex-[3] text-[11px] text-gray-label font-semibold uppercase tracking-wide">Product Name</div>
                  <div className="flex-[2] text-[11px] text-gray-label font-semibold uppercase tracking-wide">Description</div>
                  <div className="w-24 text-[11px] text-gray-label font-semibold uppercase tracking-wide">Price</div>
                  <div className="w-16 text-[11px] text-gray-label font-semibold uppercase tracking-wide">Qty</div>
                  <div className="w-24 text-[11px] text-gray-label font-semibold uppercase tracking-wide text-right">Total</div>
                  <div className="w-8"></div>
                </div>
                <div className="space-y-2">
                  {invoiceForm.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="w-10 mt-2.5 text-sm font-semibold text-brand-ink">{i + 1}</div>
                      <div className="flex-[3]"><input className="field-input text-[13px]" placeholder="Product name" value={item.productName} onChange={(e) => { const items = [...invoiceForm.items]; items[i] = { ...items[i], productName: e.target.value }; setInvoiceForm({ ...invoiceForm, items }); }} /></div>
                      <div className="flex-[2]"><input className="field-input text-[13px]" placeholder="Optional" value={item.description} onChange={(e) => { const items = [...invoiceForm.items]; items[i] = { ...items[i], description: e.target.value }; setInvoiceForm({ ...invoiceForm, items }); }} /></div>
                      <div className="w-24"><input className="field-input text-[13px]" placeholder="৳ 0" value={item.price} onChange={(e) => { const items = [...invoiceForm.items]; items[i] = { ...items[i], price: e.target.value }; setInvoiceForm({ ...invoiceForm, items }); }} /></div>
                      <div className="w-16"><input className="field-input text-[13px]" placeholder="1" value={item.quantity} onChange={(e) => { const items = [...invoiceForm.items]; items[i] = { ...items[i], quantity: e.target.value }; setInvoiceForm({ ...invoiceForm, items }); }} /></div>
                      <div className="w-24 text-right text-sm font-semibold text-brand-ink mt-2.5">{"৳"}{((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)).toLocaleString()}</div>
                      <button onClick={() => removeInvoiceItem(i)} className="text-danger hover:text-danger/70 mt-2.5 cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
                <button onClick={addInvoiceItem} className="text-brand text-[13px] font-semibold mt-2 hover:underline cursor-pointer">+ Add line item</button>
              </div>
              <div className="border-t border-gray-line pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-brand-ink">Intotal</span>
                  <span className="text-lg font-display text-brand-ink">{"৳"}{invoiceForm.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-sm font-semibold text-success">Paid Amount</span>
                  <div className="w-40"><input className="field-input text-[13px] text-right font-semibold text-success" placeholder="৳ 0" value={invoiceForm.paidAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, paidAmount: e.target.value })} /></div>
                </div>
                <div className="flex justify-between items-center bg-brand text-white rounded-lg px-4 py-2.5">
                  <span className="text-sm font-bold">Due</span>
                  <span className="text-lg font-display font-bold">{"৳"}{(invoiceForm.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0), 0) - (parseFloat(invoiceForm.paidAmount) || 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {error && <div className="mt-3 p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}
            <button className="btn-blue w-full justify-center mt-5" onClick={handleCreateInvoice} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : null}{saving ? "Creating..." : "Create Invoice"}</button>
          </div>
        </div>
      )}

      {showEditInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={() => setShowEditInvoice(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[420px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-brand-ink">Edit Invoice</h2>
              <button onClick={() => setShowEditInvoice(null)} className="text-gray-label hover:text-brand cursor-pointer"><X size={20} /></button>
            </div>
            <div className="card p-4 mb-4">
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-label">Invoice</span><span className="font-semibold text-brand-ink">{showEditInvoice.invoiceNumber}</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-label">Description</span><span className="text-brand-ink">{showEditInvoice.description}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-label">Total Amount</span><span className="font-semibold text-brand-ink">{"৳"}{Number(showEditInvoice.totalAmount).toLocaleString()}</span></div>
            </div>
            <div className="space-y-3.5">
              <div><label className="field-label">Paid Amount (৳)</label><input className="field-input text-right font-semibold" value={editInvoiceForm.paidAmount} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, paidAmount: e.target.value })} /></div>
              <div><label className="field-label">Payment Status</label><select className="field-input" value={editInvoiceForm.paymentStatus} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, paymentStatus: e.target.value })}><option value="UNPAID">Unpaid</option><option value="PARTIAL">Partial</option><option value="PAID">Paid</option></select></div>
              <div className="flex justify-between items-center bg-brand text-white rounded-lg px-4 py-2.5">
                <span className="text-sm font-bold">Due</span>
                <span className="text-lg font-display font-bold">{"৳"}{(Number(showEditInvoice.totalAmount) - (parseFloat(editInvoiceForm.paidAmount) || 0)).toLocaleString()}</span>
              </div>
            </div>
            <button className="btn-blue w-full justify-center mt-5" onClick={handleEditInvoice} disabled={saving}>{saving ? "Updating..." : "Update Invoice"}</button>
          </div>
        </div>
      )}
    </div>
  );
}