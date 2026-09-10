"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Logo from "@/components/ui/logo";
import {
  LayoutDashboard, Ship, Package, FileText, Users, BarChart3,
  Bell, Shield, ScrollText, Settings, LogOut, Calculator, Menu, X, MessageSquareText,
} from "lucide-react";
import { useState } from "react";

const opsMenu = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/lots", label: "Lots", icon: Ship },
  { href: "/dashboard/boxes", label: "Boxes / Cartons", icon: Package },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/rates", label: "Shipping Rates", icon: Calculator },
  { href: "/dashboard/quotes", label: "Quotes", icon: MessageSquareText },
];

const insightMenu = [
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const systemMenu = [
  { href: "/dashboard/staff", label: "Users & Roles", icon: Shield },
  { href: "/dashboard/activity-logs", label: "Activity Logs", icon: ScrollText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const initials = user?.profile?.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "A";

  const renderMenu = (items: typeof opsMenu) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.href);
      return (
        <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium mb-0.5 transition-colors ${
            active ? "bg-brand text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
          }`}>
          <Icon size={18} />
          {item.label}
        </Link>
      );
    });

  const sidebarContent = (
    <>
      <div className="px-5 pt-5 pb-4">
        <Logo color="text-white" size="small" />
        <div className="text-[11px] text-white/50 mt-1.5 uppercase tracking-wider font-semibold">Admin Panel</div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold px-3 mb-2">Operations</div>
        {renderMenu(opsMenu)}

        <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold px-3 mb-2 mt-5">Insights</div>
        {renderMenu(insightMenu)}

        <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold px-3 mb-2 mt-5">System</div>
        {renderMenu(systemMenu)}

        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors w-full mt-1 cursor-pointer">
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand text-white grid place-items-center text-sm font-bold shrink-0">{initials}</div>
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold truncate">{user?.profile?.fullName}</div>
          <div className="text-white/50 text-[11px]">{user?.role?.name?.replace("_", " ")}</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-brand-ink h-14 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo color="text-white" size="small" />
        </Link>
        <button onClick={() => setOpen(!open)} className="w-9 h-9 rounded-lg bg-white/10 grid place-items-center text-white cursor-pointer">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-[260px] h-full bg-brand-ink flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[230px] bg-brand-ink flex-col fixed top-0 left-0 h-screen z-30">
        {sidebarContent}
      </aside>
    </>
  );
}