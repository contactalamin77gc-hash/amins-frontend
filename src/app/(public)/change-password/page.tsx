"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import Logo from "@/components/ui/logo";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (oldPassword === newPassword) {
      setError("New password must be different from the current one");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password", { oldPassword, newPassword });
      await logout();
      router.push("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[480px] mx-auto px-6 py-20">
      <div className="card p-10">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h2 className="text-2xl font-display text-brand-ink text-center mb-2">
          Set your new password
        </h2>
        <p className="text-sm text-gray-label text-center mb-8">
          You&apos;re using a temporary password. Please set a new one to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="old" className="field-label">Current (temporary) password</label>
            <input
              id="old"
              className="field-input"
              type={showPw ? "text" : "password"}
              placeholder="Enter your temporary password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="new" className="field-label">New password</label>
            <input
              id="new"
              className="field-input"
              type={showPw ? "text" : "password"}
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirm" className="field-label">Confirm new password</label>
            <div className="relative">
              <input
                id="confirm"
                className="field-input pr-11"
                type={showPw ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-label hover:text-brand transition-colors"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-soft text-danger text-sm font-medium">
              {error}
            </div>
          )}

          <button type="submit" className="btn-blue w-full justify-center mt-2" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? "Saving..." : "Set password & continue"}
          </button>
        </form>
      </div>
    </section>
  );
}