"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { PaymentBadge } from "@/components/ui/status-badge";
import Loading from "@/components/ui/loading";
import { Search, Download } from "lucide-react";
import type { Invoice, PaginatedResponse } from "@/lib/types";

export default function InvoicesPage() {
  const { isRole } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const isCustomer = isRole("CUSTOMER");

  useEffect(() => {
    async function load() {
      try {
        const url = isCustomer ? "/invoices/my/invoices" : "/invoices";
        const res = await api.get<PaginatedResponse<Invoice>>(url, {
          params: { limit: 50, search: search || undefined },
        });
        setInvoices(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, isCustomer]);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-[26px] font-display text-brand-ink">
          {isCustomer ? "My Invoices" : "Invoices"}
        </h1>
        <div className="flex items-center gap-2 bg-white border border-gray-line rounded-[10px] px-3.5 py-2.5 min-w-[260px]">
          <Search size={16} className="text-gray-label" />
          <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Search invoice, tracking…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                <th className="text-left px-4 py-3">Invoice №</th>
                {!isCustomer && <th className="text-left px-4 py-3">Customer</th>}
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Due</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-label text-sm">No invoices found</td></tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-line last:border-0 hover:bg-brand-mist transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-sm tabular-nums">{inv.invoiceNumber}</td>
                  {!isCustomer && (
                    <td className="px-4 py-3.5 text-sm">{inv.shipment?.customer?.fullName || inv.shipment?.customer?.phone || "—"}</td>
                  )}
                  <td className="px-4 py-3.5 text-sm tabular-nums text-gray-label">{inv.shipment?.trackingNumber || "—"}</td>
                  <td className="px-4 py-3.5 text-sm">{inv.description}</td>
                  <td className="px-4 py-3.5 font-semibold text-sm tabular-nums">৳{inv.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-semibold text-sm tabular-nums text-danger">৳{inv.due.toLocaleString()}</td>
                  <td className="px-4 py-3.5"><PaymentBadge status={inv.paymentStatus} /></td>
                  <td className="px-4 py-3.5 text-sm text-gray-label">
                    {new Date(inv.invoiceDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.get(`/invoices/${inv.id}/pdf`, { responseType: "blob" });
                          const blob = new Blob([res.data], { type: "application/pdf" });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `${inv.invoiceNumber}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch {
                          alert("Failed to download PDF");
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-brand-soft text-brand grid place-items-center hover:bg-brand hover:text-white transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download size={14} />
                    </button>
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