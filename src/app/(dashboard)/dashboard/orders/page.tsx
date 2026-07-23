"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { ShipmentBadge } from "@/components/ui/status-badge";
import ProgressBar from "@/components/ui/progress-bar";
import Loading from "@/components/ui/loading";
import { Search } from "lucide-react";
import type { Shipment, PaginatedResponse } from "@/lib/types";

export default function OrdersPage() {
  const { user, isRole } = useAuth();
  const [orders, setOrders] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isCustomer = isRole("CUSTOMER");

  useEffect(() => {
    async function load() {
      try {
        const url = isCustomer ? "/shipments/my/orders" : "/shipments";
        const res = await api.get<PaginatedResponse<Shipment>>(url, {
          params: { limit: 50, search: search || undefined },
        });
        setOrders(res.data.data);
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
          {isCustomer ? "My Orders" : "Shipments"}
        </h1>
        <div className="flex items-center gap-2 bg-white border border-gray-line rounded-[10px] px-3.5 py-2.5 min-w-[280px]">
          <Search size={16} className="text-gray-label" />
          <input
            className="flex-1 text-sm outline-none bg-transparent"
            placeholder="Search tracking, order, supplier…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                <th className="text-left px-4 py-3">Tracking №</th>
                {!isCustomer && <th className="text-left px-4 py-3">Customer</th>}
                <th className="text-left px-4 py-3">Supplier</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Boxes</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-label text-sm">No shipments found</td></tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-line last:border-0 hover:bg-brand-mist transition-colors">
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/orders/${order.id}`} className="font-semibold text-sm tabular-nums hover:text-brand">
                      {order.trackingNumber}
                    </Link>
                    <div className="text-[12px] text-gray-label">{order.orderNumber}</div>
                  </td>
                  {!isCustomer && (
                    <td className="px-4 py-3.5 text-sm">
                      {order.customer?.fullName || order.customer?.phone || "—"}
                    </td>
                  )}
                  <td className="px-4 py-3.5 text-sm">{order.supplierName}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${order.method === "AIR" ? "bg-brand-soft text-brand" : "bg-gray-100 text-gray-label"}`}>
                      {order.method}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <ProgressBar delivered={order.boxes.delivered} total={order.boxes.total} />
                  </td>
                  <td className="px-4 py-3.5">
                    <ShipmentBadge status={order.status} />
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