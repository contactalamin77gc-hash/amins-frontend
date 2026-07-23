"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function DashboardChangePasswordPage() {
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (oldPassword === newPassword) { setError("New password must be different"); return; }

    setLoading(true);
    try {
      await api.post("/auth/change-password", { oldPassword, newPassword });
      alert("Password changed. You will be logged out.");
      await logout();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-[26px] font-display text-brand-ink mb-6">Change Password</h1>

      <div className="card p-8 max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Current Password</label>
            <input className="field-input" type={showPw ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="field-label">New Password</label>
            <input className="field-input" type={showPw ? "text" : "password"} placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="field-label">Confirm New Password</label>
            <div className="relative">
              <input className="field-input pr-11" type={showPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-label hover:text-brand" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <div className="p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}
          <button type="submit" className="btn-blue w-full justify-center" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
        <p className="text-[12px] text-gray-label mt-4 text-center">
          You will be logged out after changing your password.
        </p>
      </div>
    </div>
  );
}