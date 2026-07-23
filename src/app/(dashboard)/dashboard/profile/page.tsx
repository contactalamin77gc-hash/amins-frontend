"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Loader2, Check } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.profile?.fullName || "",
    email: user?.profile?.email || "",
    companyName: user?.profile?.companyName || "",
    address: user?.profile?.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      await api.patch("/users/profile", form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-[26px] font-display text-brand-ink mb-6">My Profile</h1>

      <div className="card p-8 max-w-[560px]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-brand text-white grid place-items-center text-2xl font-bold">
            {user?.profile?.fullName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-ink">{user?.profile?.fullName}</div>
            <div className="text-sm text-gray-label">{user?.phone} · {user?.role.name.replace("_", " ")}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="field-label">Full Name</label>
            <input className="field-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="field-input" type="email" placeholder="Optional" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Company Name</label>
            <input className="field-input" placeholder="Optional" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Address</label>
            <input className="field-input" placeholder="Optional" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Phone Number</label>
            <input className="field-input bg-brand-mist text-gray-label cursor-not-allowed" value={user?.phone || ""} disabled />
            <p className="text-[12px] text-gray-label mt-1">Phone number cannot be changed. Contact admin.</p>
          </div>
        </div>

        {error && <div className="mt-4 p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}

        <button className="btn-blue w-full justify-center mt-6" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}