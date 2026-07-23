"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ShipmentBadge, BoxBadge } from "@/components/ui/status-badge";
import Loading from "@/components/ui/loading";
import { Search } from "lucide-react";
import type { Shipment, PaginatedResponse } from "@/lib/types";

export default function BoxesPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<PaginatedResponse<Shipment>>("/shipments", {
          params: { limit: 50, search: search || undefined },
        });
        setShipments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search]);

  if (loading) return <Loading />;

  const shipmentsWithBoxes = shipments.filter((s) => s.boxes.total > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-[26px] font-display text-brand-ink">Boxes / Cartons</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-line rounded-[10px] px-3.5 py-2.5 min-w-[260px]">
          <Search size={16} className="text-gray-label" />
          <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Search shipment…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {shipmentsWithBoxes.length === 0 ? (
        <div className="card p-12 text-center text-gray-label">No shipments with boxes found</div>
      ) : (
        <div className="space-y-5">
          {shipmentsWithBoxes.map((s) => (
            <div key={s.id} className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-line bg-brand-mist">
                <div className="flex items-center gap-3">
                  <Link href={`/dashboard/orders/${s.id}`} className="font-semibold text-sm hover:text-brand">{s.trackingNumber}</Link>
                  <ShipmentBadge status={s.status} />
                  <span className="text-[13px] text-gray-label">{s.customer?.fullName || s.customer?.phone}</span>
                </div>
                <div className="text-[13px] text-gray-label">
                  <b className="text-success">{s.boxes.delivered}</b> / {s.boxes.total} delivered
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 p-3">
                {s.boxes.items.map((box) => (
                  <div
                    key={box.id}
                    className={`border-[1.5px] rounded-lg p-2 text-center text-[11px] ${
                      box.status === "DELIVERED"
                        ? "border-success bg-success-soft"
                        : box.status === "IN_TRANSIT"
                        ? "border-warning bg-warning-soft"
                        : box.status === "ARRIVED"
                        ? "border-brand bg-brand-soft"
                        : "border-gray-line"
                    }`}
                  >
                    <div className="font-semibold text-brand-ink text-[12px]">{box.boxNumber}</div>
                    <div className="text-gray-label mt-0.5">{box.weightKg ? `${box.weightKg}kg` : "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}