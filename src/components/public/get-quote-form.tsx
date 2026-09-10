"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import api from "@/lib/api";
import { getSiteContent } from "@/lib/content";
import Reveal from "./reveal";

export default function GetQuoteForm() {
  const [content, setContent] = useState<Record<string, any>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", productType: "", estimatedWeight: "", method: "AIR", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSiteContent().then(setContent);
    api.get("/shipping-rates/categories").then((res) => setCategories(res.data.categories || []));
  }, []);

  const title = content.quote_title || "Get a Free Quote";
  const subtitle = content.quote_subtitle || "Fill in the details and we'll get back to you";

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      setError("Full name and phone number are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/quotes", form);
      setSubmitted(true);
      setForm({ fullName: "", phone: "", email: "", productType: "", estimatedWeight: "", method: "AIR", message: "" });
    } catch {
      setError("Failed to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-brand py-12 sm:py-20">
      <Reveal className="max-w-[640px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-section-title text-white mb-3">{title}</h2>
          <div className="w-16 h-1 bg-white mx-auto mb-4" />
          <p className="text-white/85 text-[16px]">{subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,20,80,.35)]">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
              <h3 className="text-card-title text-brand-ink mb-2">Request Received!</h3>
              <p className="text-gray-label text-sm mb-5">We&apos;ll get back to you shortly with a quote.</p>
              <button onClick={() => setSubmitted(false)} className="btn-ghost">Submit Another Request</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Full Name *</label>
                  <input className="field-input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="field-label">Phone *</label>
                  <input className="field-input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+880 1XXX XXXXXX" />
                </div>
              </div>

              <div>
                <label className="field-label">Email (optional)</label>
                <input className="field-input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Product Type</label>
                  <select className="field-input" value={form.productType} onChange={(e) => update("productType", e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Estimated Weight (kg)</label>
                  <input className="field-input" value={form.estimatedWeight} onChange={(e) => update("estimatedWeight", e.target.value)} placeholder="e.g. 50" />
                </div>
              </div>

              <div>
                <label className="field-label">Shipping Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {["AIR", "SEA"].map((m) => (
                    <button
                      key={m} type="button"
                      onClick={() => update("method", m)}
                      className={`py-2.5 rounded-lg text-sm font-bold border-[1.5px] transition-colors cursor-pointer ${form.method === m ? "bg-brand border-brand text-white" : "bg-white border-gray-line text-gray-label"}`}
                    >
                      {m === "AIR" ? "Air Freight" : "Sea Freight"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">Message</label>
                <textarea className="field-input min-h-[90px]" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us more about your shipment" />
              </div>

              {error && <div className="p-3 rounded-lg bg-danger-soft text-danger text-sm">{error}</div>}

              <button type="submit" disabled={submitting}
                className="text-btn bg-brand text-white w-full py-3.5 rounded-[10px] hover:bg-brand-deep transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {submitting ? "SUBMITTING..." : "REQUEST QUOTE"}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
