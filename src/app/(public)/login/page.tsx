"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.match(/^01[3-9]\d{8}$/)) {
      setError("Enter a valid BD phone number (01XXXXXXXXX)");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await login(phone, password);
      if (result.mustChangePassword) {
        router.push("/change-password");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Invalid phone number or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="card p-10 w-full max-w-[420px]">
        

        <h2 className="text-2xl font-display text-brand-ink text-center mb-2">Welcome back</h2>
        <p className="text-sm text-gray-label text-center mb-8">Log in with your phone number and password</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="phone" className="field-label">Phone number</label>
            <input
              id="phone"
              className="field-input"
              placeholder="01XXXXXXXXX"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="field-label">Password</label>
            <div className="relative">
              <input
                id="password"
                className="field-input pr-11"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            className="btn-blue w-full justify-center mt-2"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button className="text-brand text-[13px] font-semibold hover:underline">
            Forgot password?
          </button>
        </div>
      </div>
    </section>
  );
}