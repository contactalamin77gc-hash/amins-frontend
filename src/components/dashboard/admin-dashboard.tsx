"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import KpiCard from "@/components/ui/kpi-card";
import Loading from "@/components/ui/loading";
import type { ActivityLog } from "@/lib/types";

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overviewRes, logsRes] = await Promise.all([
          api.get("/reports/dashboard"),
          api.get("/activity-logs/recent?limit=6"),
        ]);
        setOverview(overviewRes.data);
        setRecentLogs(logsRes.data);
      } catch (err) {
        console.error("Admin dashboard error:", err);
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

  const statusData = s.byStatus || {};
  const maxStatus = Math.max(...Object.values(statusData).map(Number), 1);

  const statusLabels: Record<string, { label: string; color: string }> = {
    ORDER_CREATED: { label: "China Warehouse", color: "bg-[#7A5CF0]" },
    RECEIVED_CHINA_WAREHOUSE: { label: "Received", color: "bg-[#7A5CF0]" },
    IN_TRANSIT: { label: "In Transit", color: "bg-warning" },
    CUSTOMS_CLEARANCE: { label: "Customs", color: "bg-brand" },
    WAREHOUSE: { label: "BD Warehouse", color: "bg-[#2E9BD6]" },
    PARTIALLY_DELIVERED: { label: "Partial", color: "bg-[#E06A9F]" },
    FULLY_DELIVERED: { label: "Delivered", color: "bg-success" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-display text-brand-ink">Dashboard</h1>
          <p className="text-[13.5px] text-gray-label">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · overview of all operations
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/dashboard/customers" className="btn-ghost py-2 px-4 text-[13px]">＋ New Customer</Link>
          <Link href="/dashboard/shipments" className="btn-blue py-2 px-4 text-[13px]">＋ New Shipment</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <KpiCard label="Total Customers" value={c.total || 0} sub={c.newThisMonth ? `↑ ${c.newThisMonth} this month` : "—"} />
        <KpiCard label="Total Orders" value={s.total || 0} sub="All time" color="bg-[#7A5CF0]" />
        <KpiCard label="In Transit" value={statusData.IN_TRANSIT || 0} sub={`${statusData.LEFT_CHINA || 0} left China`} color="bg-warning" />
        <KpiCard
          label="Revenue"
          value={`৳${((r.total || 0) / 100000).toFixed(1)}L`}
          sub={r.paid > 0 ? `↑ ৳${((r.paid || 0) / 100000).toFixed(1)}L collected` : "—"}
          color="bg-success"
        />
        <KpiCard
          label="Outstanding"
          value={`৳${((r.outstanding || 0) / 100000).toFixed(1)}L`}
          sub={`${r.unpaidInvoices || 0} unpaid invoices`}
          color="bg-danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          {/* Status Distribution */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-line">
              <h3 className="text-base font-display text-brand-ink">Shipment status distribution</h3>
            </div>
            <div className="p-5 space-y-3.5">
              {Object.entries(statusLabels).map(([key, { label, color }]) => {
                const val = Number(statusData[key] || 0);
                const pct = maxStatus > 0 ? (val / maxStatus) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-3 text-[13px]">
                    <span className="w-[120px] text-brand-ink font-semibold shrink-0">{label}</span>
                    <div className="flex-1 h-[9px] bg-brand-mist rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-[34px] text-right text-gray-label font-semibold">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-line">
              <h3 className="text-base font-display text-brand-ink">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              {[
                { label: "Active Customers", value: c.active || 0 },
                { label: "Inactive", value: c.inactive || 0 },
                { label: "Air Shipments", value: s.byMethod?.AIR || 0 },
                { label: "Sea Shipments", value: s.byMethod?.SEA || 0 },
              ].map((item, i) => (
                <div key={item.label} className={`p-4 ${i < 3 ? "border-r border-gray-line" : ""}`}>
                  <div className="text-[22px] font-display text-brand-ink">{item.value}</div>
                  <div className="text-[12px] text-gray-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Activity Logs */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-line">
            <h3 className="text-base font-display text-brand-ink">Activity log</h3>
            <Link href="/dashboard/activity-logs" className="text-[13px] text-brand font-semibold">View all →</Link>
          </div>
          <div>
            {recentLogs.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-label text-sm">No activity yet</div>
            )}
            {recentLogs.map((log) => (
              <div key={log.id} className="px-4 py-3 border-b border-gray-line last:border-0 text-[13px]">
                <div>
                  <b className="text-brand-ink">{log.actor?.fullName || "System"}</b>{" "}
                  <span className="text-gray-label">{log.description}</span>
                </div>
                <div className="text-gray-label text-[11px] mt-1">
                  {new Date(log.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}