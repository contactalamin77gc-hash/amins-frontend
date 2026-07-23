"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { ShipmentBadge } from "@/components/ui/status-badge";
import ProgressBar from "@/components/ui/progress-bar";
import KpiCard from "@/components/ui/kpi-card";
import Loading from "@/components/ui/loading";
import type { Shipment, PaginatedResponse } from "@/lib/types";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, inChina: 0, inTransit: 0, delivered: 0, pendingBills: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes] = await Promise.all([
          api.get<PaginatedResponse<Shipment>>("/shipments/my/orders", { params: { limit: 10 } }),
        ]);
        const data = ordersRes.data.data;
        setOrders(data);
        setStats({
          total: data.length,
          inChina: data.filter((o) => ["ORDER_CREATED", "RECEIVED_CHINA_WAREHOUSE", "PACKED"].includes(o.status)).length,
          inTransit: data.filter((o) => ["LEFT_CHINA", "IN_TRANSIT"].includes(o.status)).length,
          delivered: data.filter((o) => o.status === "FULLY_DELIVERED").length,
          pendingBills: 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;

  const firstName = user?.profile?.fullName?.split(" ")[0] || "there";

  return (
    <div>
      <h1 className="text-xl md:text-[26px] font-display text-brand-ink mb-1">
        Assalamu alaikum, {firstName} {"👋"}
      </h1>
      <p className="text-[13px] text-gray-label mb-5">Here&apos;s what&apos;s happening with your shipments today.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <KpiCard label="Total Orders" value={stats.total} sub="All time" />
        <KpiCard label="In China" value={stats.inChina} sub="Being packed" color="bg-[#7A5CF0]" />
        <KpiCard label="In Transit" value={stats.inTransit} sub="On the way" color="bg-warning" />
        <KpiCard label="Delivered" value={stats.delivered} sub="Completed" color="bg-success" />
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-line">
          <h3 className="text-base font-display text-brand-ink">Recent Orders</h3>
          <Link href="/dashboard/orders" className="text-brand text-[13px] font-semibold hover:underline">View all</Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-label text-sm">No orders yet.</div>
        ) : (
          <div className="divide-y divide-gray-line">
            {orders.slice(0, 5).map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center gap-3 p-3 md:p-4 hover:bg-brand-mist transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm tabular-nums text-brand-ink">{order.trackingNumber}</span>
                    <ShipmentBadge status={order.status} />
                  </div>
                  <div className="text-[12px] text-gray-label mt-0.5 truncate">
                    {order.supplierName || "—"} · {order.method}
                  </div>
                </div>
                <div className="shrink-0 hidden sm:block">
                  <ProgressBar delivered={order.boxes?.delivered || 0} total={order.boxes?.total || 0} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}