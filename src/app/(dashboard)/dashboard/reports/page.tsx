"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import KpiCard from "@/components/ui/kpi-card";
import Loading from "@/components/ui/loading";

export default function ReportsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ovRes, topRes, pendRes] = await Promise.all([
          api.get("/reports/dashboard"),
          api.get("/reports/top-customers?limit=8"),
          api.get("/reports/pending-payments"),
        ]);
        setOverview(ovRes.data);
        setTopCustomers(topRes.data);
        setPending(pendRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;

  const c = overview?.customers || {};
  const s = overview?.shipments || {};
  const r = overview?.revenue || {};

  return (
    <div>
      <h1 className="text-[26px] font-display text-brand-ink mb-6">Reports</h1>

      {/* Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Customers" value={c.total || 0} sub={`${c.active || 0} active`} />
        <KpiCard label="Total Shipments" value={s.total || 0} sub={`${s.thisMonth || 0} this month`} color="bg-[#7A5CF0]" />
        <KpiCard label="Total Revenue" value={`৳${((r.total || 0) / 100000).toFixed(1)}L`} sub={`৳${((r.paid || 0) / 100000).toFixed(1)}L collected`} color="bg-success" />
        <KpiCard label="Outstanding" value={`৳${((r.outstanding || 0) / 100000).toFixed(1)}L`} sub={`${r.unpaidInvoices || 0} unpaid`} color="bg-danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Customers */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-line">
            <h3 className="text-base font-display text-brand-ink">Top Customers by Revenue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Shipments</th>
                  <th className="text-left px-4 py-3">Revenue</th>
                  <th className="text-left px-4 py-3">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((tc, i) => (
                  <tr key={tc.customerId || i} className="border-b border-gray-line last:border-0">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-semibold text-brand-ink">{tc.fullName || "—"}</div>
                      <div className="text-[12px] text-gray-label">{tc.companyName || tc.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums">{tc.totalShipments}</td>
                    <td className="px-4 py-3 text-sm font-semibold tabular-nums">{"৳"}{Number(tc.totalRevenue).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold tabular-nums text-danger">{"৳"}{Number(tc.outstanding).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-line">
            <h3 className="text-base font-display text-brand-ink">Pending Payments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                  <th className="text-left px-4 py-3">Invoice</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Due</th>
                  <th className="text-left px-4 py-3">Days</th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-label text-sm">No pending payments</td></tr>
                )}
                {pending.slice(0, 10).map((p, i) => (
                  <tr key={i} className="border-b border-gray-line last:border-0">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-semibold tabular-nums">{p.invoiceNumber}</div>
                      <div className="text-[12px] text-gray-label">{p.trackingNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{p.customer}</td>
                    <td className="px-4 py-3 text-sm font-semibold tabular-nums text-danger">{"৳"}{Number(p.due).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.daysPending > 30 ? "bg-danger-soft text-danger" : p.daysPending > 14 ? "bg-warning-soft text-warning" : "bg-brand-soft text-brand"}`}>
                        {p.daysPending}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shipment Method Breakdown */}
      <div className="card overflow-hidden mt-5">
        <div className="px-4 py-3.5 border-b border-gray-line">
          <h3 className="text-base font-display text-brand-ink">Shipment Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {[
            { label: "Air Freight", value: s.byMethod?.AIR || 0, color: "text-brand" },
            { label: "Sea Freight", value: s.byMethod?.SEA || 0, color: "text-[#2E9BD6]" },
            { label: "Land", value: s.byMethod?.LAND || 0, color: "text-warning" },
            { label: "This Month", value: s.thisMonth || 0, color: "text-success" },
          ].map((item, i) => (
            <div key={item.label} className={`p-5 ${i < 3 ? "border-r border-gray-line" : ""}`}>
              <div className={`text-[28px] font-display ${item.color}`}>{item.value}</div>
              <div className="text-[12px] text-gray-label mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}