"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ShipmentBadge } from "@/components/ui/status-badge";
import ProgressBar from "@/components/ui/progress-bar";
import Loading from "@/components/ui/loading";
import { Search } from "lucide-react";
import type { Shipment, PaginatedResponse } from "@/lib/types";

const FILTER_TABS = [
  { value: "", label: "All" },
  { value: "FULLY_DELIVERED", label: "Delivered" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function HistoryPage() {
  const [orders, setOrders] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<PaginatedResponse<Shipment>>("/shipments/my/orders", {
          params: { limit: 100, search: search || undefined, status: filter || undefined },
        });
        setOrders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, filter]);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-[26px] font-display text-brand-ink">Order History</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-line rounded-[10px] px-3.5 py-2.5 min-w-[260px]">
          <Search size={16} className="text-gray-label" />
          <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Search tracking, order…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold border-[1.5px] transition-colors cursor-pointer ${
              filter === tab.value
                ? "bg-brand border-brand text-white"
                : "bg-white border-gray-line text-gray-label hover:border-brand hover:text-brand"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-label">No orders found</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
          <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="card p-5 flex items-center gap-5 hover:border-brand transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-sm tabular-nums text-brand-ink">{order.trackingNumber}</span>
                  <ShipmentBadge status={order.status} />
                </div>
                <div className="text-[13px] text-gray-label">
                  {order.supplierName} · {order.method} · {order.orderNumber}
                </div>
              </div>
              <div className="text-right shrink-0">
                <ProgressBar delivered={order.boxes.delivered} total={order.boxes.total} />
              </div>
              <div className="text-sm text-gray-label shrink-0 hidden md:block">
                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}