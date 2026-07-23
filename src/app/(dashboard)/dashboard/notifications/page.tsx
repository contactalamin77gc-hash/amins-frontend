"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loading from "@/components/ui/loading";
import type { Notification as NotifType } from "@/lib/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotifType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notifications?limit=50").then((res) => {
      setNotifications(res.data.data);
      setLoading(false);
    });
  }, []);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[26px] font-display text-brand-ink">Notifications</h1>
        <button onClick={markAllRead} className="btn-ghost py-2 px-4 text-[13px]">Mark all read</button>
      </div>
      <div className="card overflow-hidden">
        {notifications.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-label">No notifications</div>
        )}
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`px-5 py-4 border-b border-gray-line last:border-0 ${!notif.isRead ? "bg-brand-mist" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-sm text-brand-ink">{notif.title}</div>
                <div className="text-[13px] text-gray-label mt-0.5">{notif.message}</div>
              </div>
              {!notif.isRead && <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0 mt-1.5" />}
            </div>
            <div className="text-[11px] text-gray-label mt-1.5">
              {new Date(notif.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}