"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import KpiCard from "@/components/ui/kpi-card";
import Loading from "@/components/ui/loading";
import CustomerDashboard from "@/components/dashboard/customer-dashboard";
import AdminDashboard from "@/components/dashboard/admin-dashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return <Loading />;

  if (user.role.name === "CUSTOMER") {
    return <CustomerDashboard />;
  }

  return <AdminDashboard />;
}