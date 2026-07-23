"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plane, Ship, Truck, Calculator, Package, Loader2 } from "lucide-react";

interface CalcResult {
  found: boolean;
  method?: string;
  category?: string;
  estimatedCost?: number;
  estimatedDays?: string;
  ratePerKg?: number;
  ratePerCbm?: number;
  costByWeight?: number;
  costByCbm?: number;
  minCharge?: number;
  note?: string;
  message?: string;
}

interface Categories {
  categories: string[];
  containsTypes: string[];
  methods: string[];
}

const METHOD_ICONS: Record<string, any> = { AIR: Plane, SEA: Ship };
const METHOD_LABELS: Record<string, string> = { AIR: "Air Freight", SEA: "Sea Freight" };
const CONTAINS_LABELS: Record<string, string> = {
  GENERAL: "General / No Restriction",
  LIQUID: "Contains Liquid",
  BATTERY: "Contains Battery",
  POWDER: "Contains Powder",
  FRAGILE: "Fragile Items",
};

export default function ShippingCalculator() {
  const [cats, setCats] = useState<Categories>({ categories: [], containsTypes: [], methods: [] });
  const [method, setMethod] = useState("AIR");
  const [category, setCategory] = useState("");
  const [contains, setContains] = useState("GENERAL");
  const [weightKg, setWeightKg] = useState("");
  const [cbm, setCbm] = useState("");
  const [calcMode, setCalcMode] = useState<"kg" | "cbm">("kg");
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/shipping-rates/categories").then((res) => {
      setCats(res.data);
      if (res.data.categories.length > 0) setCategory(res.data.categories[0]);
    });
  }, []);

  const handleCalculate = async () => {
    if (!category) return;
    if (calcMode === "kg" && !weightKg) return;
    if (calcMode === "cbm" && !cbm) return;

    setLoading(true);
    try {
      const res = await api.post("/shipping-rates/calculate", {
        method,
        category,
        contains,
        weightKg: calcMode === "kg" ? parseFloat(weightKg) : undefined,
        cbm: calcMode === "cbm" ? parseFloat(cbm) : undefined,
      });
      setResult(res.data);
    } catch {
      setResult({ found: false, message: "Failed to calculate. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border-b border-gray-line">
      <div className="max-w-[1180px] mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="text-kicker text-brand">Cost Calculator</span>
          <h2 className="text-section-title text-brand-ink mt-3 mb-3">Shipping Cost Calculator</h2>
          <div className="w-16 h-1 bg-brand mx-auto mb-4" />
          <p className="text-body-lg max-w-[50ch] mx-auto">
            Estimate your shipping cost from China to Bangladesh instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Calculator Form */}
          <div className="card p-6 space-y-5">
            {/* Shipping Method */}
            <div>
              <label className="field-label">Shipping Method *</label>
              <div className="grid grid-cols-3 gap-3">
                {(cats.methods.length > 0 ? cats.methods : ["AIR", "SEA"]).map((m) => {
                  const Icon = METHOD_ICONS[m] || Package;
                  return (
                    <button
                      key={m}
                      onClick={() => { setMethod(m); setResult(null); }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        method === m
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-gray-line text-gray-label hover:border-brand/50"
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-sm font-bold">{METHOD_LABELS[m] || m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Category */}
            <div>
              <label className="field-label">Product Category *</label>
              <select className="field-input" value={category} onChange={(e) => { setCategory(e.target.value); setResult(null); }}>
                <option value="">Select category</option>
                {cats.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Contains */}
            <div>
              <label className="field-label">Product Contains</label>
              <select className="field-input" value={contains} onChange={(e) => { setContains(e.target.value); setResult(null); }}>
                {(cats.containsTypes.length > 0 ? cats.containsTypes : ["GENERAL"]).map((c) => (
                  <option key={c} value={c}>{CONTAINS_LABELS[c] || c}</option>
                ))}
              </select>
            </div>

            {/* Weight / CBM Toggle */}
            <div>
              <label className="field-label">Calculate By</label>
              <div className="flex gap-2 mb-3">
                <button onClick={() => { setCalcMode("kg"); setResult(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border-[1.5px] transition-colors cursor-pointer ${calcMode === "kg" ? "bg-brand border-brand text-white" : "bg-white border-gray-line text-gray-label"}`}>
                  Weight (KG)
                </button>
                <button onClick={() => { setCalcMode("cbm"); setResult(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border-[1.5px] transition-colors cursor-pointer ${calcMode === "cbm" ? "bg-brand border-brand text-white" : "bg-white border-gray-line text-gray-label"}`}>
                  Volume (CBM)
                </button>
              </div>
              {calcMode === "kg" ? (
                <div className="relative">
                  <input className="field-input pr-12 text-lg font-semibold" placeholder="0" value={weightKg}
                    onChange={(e) => { setWeightKg(e.target.value); setResult(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCalculate()} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-label font-semibold">KG</span>
                </div>
              ) : (
                <div className="relative">
                  <input className="field-input pr-16 text-lg font-semibold" placeholder="0.00" value={cbm}
                    onChange={(e) => { setCbm(e.target.value); setResult(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCalculate()} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-label font-semibold">CBM</span>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <button onClick={handleCalculate} disabled={loading || !category}
              className="text-btn bg-brand text-white w-full py-3.5 rounded-[10px] hover:bg-brand-deep transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
              {loading ? "CALCULATING..." : "GET SHIPPING RATE"}
            </button>
          </div>

          {/* Result Card */}
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="bg-brand text-white p-5 text-center">
                <div className="text-sm font-bold uppercase tracking-wide opacity-80 mb-1">Estimated Shipping Cost</div>
                <div className="text-[42px] font-bold leading-none">
                  {result?.found ? `৳${result.estimatedCost?.toLocaleString()}` : "৳ —"}
                </div>
                {result?.found && (
                  <div className="text-sm opacity-80 mt-2">China → Bangladesh</div>
                )}
              </div>
              <div className="p-5">
                {!result && (
                  <div className="text-center text-gray-label text-sm py-6">
                    Select options and enter weight to see the estimated cost.
                  </div>
                )}
                {result && !result.found && (
                  <div className="text-center text-danger text-sm py-6">
                    {result.message || "No rate found for this combination. Contact us for a custom quote."}
                  </div>
                )}
                {result?.found && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-label">Method</span>
                      <span className="font-semibold text-brand-ink">{METHOD_LABELS[result.method || ""] || result.method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-label">Category</span>
                      <span className="font-semibold text-brand-ink">{result.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-label">Rate per KG</span>
                      <span className="font-semibold text-brand-ink">{"৳"}{result.ratePerKg?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-label">Rate per CBM</span>
                      <span className="font-semibold text-brand-ink">{"৳"}{result.ratePerCbm?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-label">Minimum Charge</span>
                      <span className="font-semibold text-brand-ink">{"৳"}{result.minCharge?.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-line pt-3 flex justify-between text-sm">
                      <span className="text-gray-label">Estimated Delivery</span>
                      <span className="font-bold text-brand">{result.estimatedDays}</span>
                    </div>
                    <div className="text-[11px] text-gray-label text-center pt-2 italic">
                      {result.note} · Actual cost may vary based on dimensions and customs
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info card */}
            <div className="card p-5">
              <h4 className="text-sm font-bold text-brand-ink mb-3">How it works</h4>
              <div className="space-y-2 text-[13px] text-gray-label">
                <p>{"•"} Cost is calculated by whichever is greater: weight (KG) or volume (CBM)</p>
                <p>{"•"} Minimum charge applies if calculated cost is lower</p>
                <p>{"•"} Battery, liquid, and powder items have special rates</p>
                <p>{"•"} Contact us for exact quotes on large shipments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}