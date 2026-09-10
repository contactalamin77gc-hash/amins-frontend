"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loading from "@/components/ui/loading";
import { Trash2, X } from "lucide-react";

interface Quote {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  productType?: string;
  estimatedWeight?: string;
  method?: string;
  message?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "CLOSED"];

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-brand-soft text-brand",
  CONTACTED: "bg-warning-soft text-warning",
  QUOTED: "bg-success-soft text-success",
  CLOSED: "bg-gray-100 text-gray-label",
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [active, setActive] = useState<Quote | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/quotes", { params: statusFilter ? { status: statusFilter } : {} });
      setQuotes(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/quotes/${id}`, { status });
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    if (active?.id === id) setActive({ ...active, status });
  };

  const saveNotes = async () => {
    if (!active) return;
    await api.patch(`/quotes/${active.id}`, { adminNotes: notesDraft });
    setQuotes((prev) => prev.map((q) => (q.id === active.id ? { ...q, adminNotes: notesDraft } : q)));
    setActive({ ...active, adminNotes: notesDraft });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this quote request?")) return;
    await api.delete(`/quotes/${id}`);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    if (active?.id === id) setActive(null);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-[26px] font-display text-brand-ink">Quote Requests</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter("")}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold border-[1.5px] transition-colors cursor-pointer ${!statusFilter ? "bg-brand border-brand text-white" : "bg-white border-gray-line text-gray-label hover:border-brand hover:text-brand"}`}>
            All
          </button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold border-[1.5px] transition-colors cursor-pointer ${statusFilter === s ? "bg-brand border-brand text-white" : "bg-white border-gray-line text-gray-label hover:border-brand hover:text-brand"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-label text-sm">No quote requests found</td></tr>
              )}
              {quotes.map((q) => (
                <tr key={q.id} className="border-b border-gray-line last:border-0 hover:bg-brand-mist transition-colors cursor-pointer"
                  onClick={() => { setActive(q); setNotesDraft(q.adminNotes || ""); }}>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-sm text-brand-ink">{q.fullName}</div>
                    {q.email && <div className="text-[12px] text-gray-label">{q.email}</div>}
                  </td>
                  <td className="px-4 py-3.5 text-sm">{q.phone}</td>
                  <td className="px-4 py-3.5 text-sm">{q.productType || "—"}</td>
                  <td className="px-4 py-3.5">
                    {q.method && (
                      <span className={`badge ${q.method === "AIR" ? "bg-brand-soft text-brand" : "bg-gray-100 text-gray-label"}`}>{q.method}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={q.status}
                      onChange={(e) => updateStatus(q.id, e.target.value)}
                      className={`badge border-0 cursor-pointer ${STATUS_STYLES[q.status] || "bg-gray-100 text-gray-label"}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-gray-label">
                    {new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => remove(q.id)} className="text-danger hover:text-danger/70 cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setActive(null)}>
          <div className="w-full max-w-[440px] h-full bg-white overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display text-brand-ink">Quote Request</h2>
              <button onClick={() => setActive(null)} className="cursor-pointer text-gray-label hover:text-brand-ink"><X size={20} /></button>
            </div>

            <div className="space-y-4 text-sm">
              <div><span className="text-gray-label">Name</span><div className="font-semibold text-brand-ink">{active.fullName}</div></div>
              <div><span className="text-gray-label">Phone</span><div className="font-semibold text-brand-ink">{active.phone}</div></div>
              {active.email && <div><span className="text-gray-label">Email</span><div className="font-semibold text-brand-ink">{active.email}</div></div>}
              {active.productType && <div><span className="text-gray-label">Product Type</span><div className="font-semibold text-brand-ink">{active.productType}</div></div>}
              {active.estimatedWeight && <div><span className="text-gray-label">Estimated Weight</span><div className="font-semibold text-brand-ink">{active.estimatedWeight} kg</div></div>}
              {active.method && <div><span className="text-gray-label">Method</span><div className="font-semibold text-brand-ink">{active.method}</div></div>}
              {active.message && <div><span className="text-gray-label">Message</span><div className="text-brand-ink mt-1 whitespace-pre-line">{active.message}</div></div>}

              <div>
                <span className="text-gray-label">Status</span>
                <select
                  value={active.status}
                  onChange={(e) => updateStatus(active.id, e.target.value)}
                  className="field-input mt-1"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="field-label">Admin Notes</label>
                <textarea className="field-input min-h-[100px]" value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} />
                <button onClick={saveNotes} className="btn-blue mt-2 py-2 px-4 text-[13px]">Save Notes</button>
              </div>

              <div className="text-[11px] text-gray-label pt-2 border-t border-gray-line">
                Submitted {new Date(active.createdAt).toLocaleString("en-GB")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
