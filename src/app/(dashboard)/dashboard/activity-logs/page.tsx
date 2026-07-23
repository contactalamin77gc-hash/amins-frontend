"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loading from "@/components/ui/loading";
import { Search } from "lucide-react";
import type { ActivityLog } from "@/lib/types";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/activity-logs", { params: { limit: 50, search: search || undefined } })
      .then((res) => { setLogs(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search]);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-[26px] font-display text-brand-ink">Activity Logs</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-line rounded-[10px] px-3.5 py-2.5 min-w-[260px]">
          <Search size={16} className="text-gray-label" />
          <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Search actions, users…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-mist text-[11px] uppercase tracking-wider text-gray-label font-bold">
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">By</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-label text-sm">No activity yet</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-line last:border-0 hover:bg-brand-mist transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="badge bg-brand-soft text-brand">{log.actionLabel}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-brand-ink">{log.description}</td>
                  <td className="px-4 py-3.5 text-sm font-medium">{log.actor?.fullName || "System"}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-label">{log.actor?.role || "—"}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-label whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
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