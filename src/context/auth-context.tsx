"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/api";

interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  companyName?: string;
  address?: string;
}

interface Role {
  id: number;
  name: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "CUSTOMER";
}

interface User {
  id: string;
  phone: string;
  isActive: boolean;
  mustChangePassword: boolean;
  role: Role;
  profile: UserProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/", "/about", "/services", "/import-process", "/pricing", "/contact", "/login", "/packing-instructions", "/terms"];

  const fetchUser = useCallback(async () => {
    const token = Cookies.get("accessToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (loading) return;
    const isPublic = publicPaths.some((p) => pathname === p);
    if (!user && !isPublic) {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  const login = async (phone: string, password: string) => {
    const res = await api.post("/auth/login", { phone, password });
    const { accessToken, refreshToken, mustChangePassword } = res.data;

    Cookies.set("accessToken", accessToken, { sameSite: "lax" });
    Cookies.set("refreshToken", refreshToken, { sameSite: "lax" });

    await fetchUser();

    return { mustChangePassword };
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — clear tokens anyway
    }
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const isRole = (...roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role.name);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}