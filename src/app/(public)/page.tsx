"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plane, Ship, Warehouse, ClipboardList, Package, Truck, Loader2 } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import ShippingCalculator from "@/components/public/shipping-calculator";
import api from "@/lib/api";

const ICONS: Record<string, any> = { Plane, Ship, Warehouse, ClipboardList, Package, Truck };

export default function HomePage() {
  const [trackingInput, setTrackingInput] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [content, setContent] = useState<Record<string, any>>({});
  const router = useRouter();
  const servicesImage = content.services_image || "";

  useEffect(() => {
    getSiteContent().then(setContent);
  }, []);

  const handleTrack = async () => {
    if (!trackingInput.trim()) return;
    setTrackLoading(true);
    setTrackResult(null);
    try {
      const res = await api.get(`/shipments/track/${trackingInput.trim()}`);
      setTrackResult(res.data);
    } catch {
      setTrackResult({ found: false, message: "Failed to fetch. Please try again." });
    } finally {
      setTrackLoading(false);
    }
  };


  const heroImage = content.hero_image || "";
  
  const servicesTitle = content.services_title || "Everything between the supplier and your warehouse.";
  const servicesSubtitle = content.services_subtitle || "We handle the full logistics chain so you only deal with one company — us.";
  const services = content.services || [];
  const ctaTitle = content.cta_title || "Ready to ship from China?";
  const ctaSubtitle = content.cta_subtitle || "Contact us to set up your account.";
  const testimonialsTitle = content.testimonials_title || "What Our Clients Say";
  const testimonials = content.testimonials || [];
  const concernTitle = content.concern_title || "Our Concern";
  const concerns = content.concerns || [];

  return (
    <>
      <section className="relative overflow-hidden flex items-center" style={{ minHeight: "550px" }}>
        {heroImage && (
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {!heroImage && <div className="absolute inset-0 bg-[#1a2332]" />}
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-[1180px] mx-auto px-6 py-20 md:py-28 relative z-10 flex justify-end w-full">
          <div className="w-full max-w-[440px]">
            <div className="bg-white rounded-2xl p-6 shadow-[0_24px_60px_rgba(0,20,80,.35)] text-ink max-h-[80vh] overflow-y-auto">
              <h3 className="text-card-title text-brand-ink mb-1">Track your shipment</h3>
              <p className="text-[13px] text-gray-label mb-3.5">Enter your tracking or order number to see live status.</p>
              <div className="flex gap-2.5">
                <input className="field-input flex-1" placeholder="e.g. AMN-24001 or ORD-24001"
                  value={trackingInput}
                  onChange={(e) => { setTrackingInput(e.target.value); if (trackResult) setTrackResult(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()} />
                <button className="text-btn bg-brand text-white px-5 py-2.5 rounded-[10px] hover:bg-brand-deep transition-colors cursor-pointer flex items-center gap-2"
                  onClick={handleTrack} disabled={trackLoading}>
                  {trackLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  TRACK
                </button>
              </div>

              {/* Default badges — show when no result */}
              {!trackResult && !trackLoading && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  <span className="badge bg-brand-soft text-brand"><span className="w-[7px] h-[7px] rounded-full bg-current" />In Transit</span>
                  <span className="badge bg-success-soft text-success"><span className="w-[7px] h-[7px] rounded-full bg-current" />Delivered</span>
                  <span className="badge bg-warning-soft text-warning"><span className="w-[7px] h-[7px] rounded-full bg-current" />Customs</span>
                </div>
              )}

              {/* Loading */}
              {trackLoading && (
                <div className="mt-4 text-center text-gray-label text-sm py-3">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2 text-brand" />
                  Searching...
                </div>
              )}

              {/* Not Found */}
              {trackResult && !trackResult.found && (
                <div className="mt-4 p-3 rounded-lg bg-danger-soft text-danger text-sm">
                  {trackResult.message || "No shipment found with this tracking number."}
                </div>
              )}

              {/* Found — Show Result */}
              {trackResult?.found && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-brand-soft">
                    <div>
                      <div className="text-sm font-bold text-brand-ink">{trackResult.trackingNumber}</div>
                      <div className="text-[11px] text-gray-label">{trackResult.orderNumber}{trackResult.lotNumber ? ` · Lot ${trackResult.lotNumber}` : ""}</div>
                    </div>
                    <span className={`badge text-[11px] ${
                      trackResult.status === "FULLY_DELIVERED" ? "bg-success-soft text-success"
                        : trackResult.status === "IN_TRANSIT" || trackResult.status === "LEFT_CHINA" ? "bg-warning-soft text-warning"
                        : trackResult.status === "CANCELLED" ? "bg-danger-soft text-danger"
                        : "bg-brand-soft text-brand"
                    }`}>
                      {trackResult.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 text-center p-2 rounded-lg bg-brand-mist">
                      <div className="text-lg font-bold text-brand-ink">{trackResult.boxes.total}</div>
                      <div className="text-[10px] text-gray-label">Total</div>
                    </div>
                    <div className="flex-1 text-center p-2 rounded-lg bg-success-soft">
                      <div className="text-lg font-bold text-success">{trackResult.boxes.delivered}</div>
                      <div className="text-[10px] text-gray-label">Delivered</div>
                    </div>
                    <div className="flex-1 text-center p-2 rounded-lg bg-warning-soft">
                      <div className="text-lg font-bold text-warning">{trackResult.boxes.remaining}</div>
                      <div className="text-[10px] text-gray-label">Remaining</div>
                    </div>
                  </div>

                  {trackResult.boxes.items.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                      {trackResult.boxes.items.map((box: any, i: number) => (
                        <div key={i} className={`border-[1.5px] rounded-lg p-1.5 text-center text-[10px] ${
                          box.status === "DELIVERED" ? "border-success bg-success-soft"
                            : box.status === "IN_TRANSIT" ? "border-warning bg-warning-soft"
                            : box.status === "ARRIVED" ? "border-brand bg-brand-soft"
                            : "border-gray-line bg-white"
                        }`}>
                          <div className="font-bold text-brand-ink">{box.boxNumber}</div>
                          <div className="text-gray-label">{box.status.replace(/_/g, " ")}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {trackResult.timeline.length > 0 && (
                    <div className="border-t border-gray-line pt-3">
                      <div className="text-[11px] font-semibold text-gray-label uppercase tracking-wide mb-2">Timeline</div>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto">
                        {trackResult.timeline.map((t: any, i: number) => {
                          const isLast = i === trackResult.timeline.length - 1;
                          return (
                            <div key={i} className="flex gap-2.5 items-start">
                              <div className={`w-[14px] h-[14px] rounded-full shrink-0 mt-0.5 ${isLast ? "bg-white border-[2px] border-brand" : "bg-brand"}`} />
                              <div>
                                <div className={`text-[12px] font-semibold ${isLast ? "text-brand" : "text-brand-ink"}`}>
                                  {t.remark || t.status.replace(/_/g, " ")}
                                </div>
                                <div className="text-[10px] text-gray-label">
                                  {new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-2 border-t border-gray-line">
                    <a href="/login" className="text-brand text-[12px] font-semibold hover:underline">
                      Log in for full details, invoices & more {"→"}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ShippingCalculator />

      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-6 text-center mb-12">
          <h2 className="text-section-title text-brand-ink mb-3">{servicesTitle}</h2>
          <div className="w-16 h-1 bg-brand mx-auto mb-5" />
          <p className="text-body-lg max-w-[60ch] mx-auto">{servicesSubtitle}</p>
        </div>

        <div className="max-w-[1180px] mx-auto px-6">
          <div className="relative rounded-2xl overflow-hidden min-h-[400px]" style={{
            background: servicesImage
              ? `url(${servicesImage}) center/cover no-repeat`
              : "linear-gradient(135deg, #1a2332 0%, #0E1B33 100%)",
          }}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-0 min-h-[400px]">
              {services.map((svc: any, i: number) => {
                const Icon = ICONS[svc.icon] || Package;
                return (
                  <div key={i} className={`flex flex-col items-center justify-center p-8 text-white text-center transition-all hover:bg-white/10 cursor-pointer ${i < services.length - 1 ? "border-r border-white/15" : ""}`}>
                    <div className="w-16 h-16 rounded-full border-2 border-white/40 grid place-items-center mb-5">
                      <Icon size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[17px] font-bold leading-tight">{svc.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      {testimonials.length > 0 && (
        <section className="bg-brand-ink py-20">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-kicker text-white/60">Testimonials</span>
              <h2 className="text-section-title text-white mt-3 mb-3">{testimonialsTitle}</h2>
              <div className="w-16 h-1 bg-brand mx-auto" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t: any, i: number) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-7 border border-white/10 hover:bg-white/15 transition-colors">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-base ${s <= (t.rating || 5) ? "text-yellow-400" : "text-white/20"}`}>{"★"}</span>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white/85 text-[15px] leading-relaxed mb-6 min-h-[80px]">
                    {`"${t.text}"`}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-11 h-11 rounded-full bg-brand text-white grid place-items-center font-bold text-lg">
                      {t.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{t.name}</div>
                      <div className="text-white/50 text-[12px]">{t.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-[1180px] mx-auto px-6 py-20 text-center">

        <h2 className="text-section-title text-brand-ink mb-4">{ctaTitle}</h2>
        <p className="text-body-lg max-w-[50ch] mx-auto mb-8">{ctaSubtitle}</p>
        <div className="flex gap-3.5 justify-center">
          <button className="text-btn bg-brand text-white px-8 py-3.5 rounded-[10px] hover:bg-brand-deep transition-colors cursor-pointer">Contact Us</button>
          <button className="text-btn px-8 py-3.5 rounded-[10px] border-[1.5px] border-brand text-brand hover:bg-brand-soft transition-colors cursor-pointer">Learn More</button>
        </div>
      </section>

      {/* ═══ OUR CONCERN ═══ */}
      {concerns.length > 0 && (
        <section className="bg-brand-ink py-16">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-section-title text-white mb-3">{concernTitle}</h2>
              <div className="w-16 h-1 bg-brand mx-auto" />
            </div>
            <div className={`grid gap-6 ${concerns.length === 1 ? "grid-cols-1 max-w-[400px] mx-auto" : concerns.length === 2 ? "grid-cols-2 max-w-[700px] mx-auto" : "md:grid-cols-3"}`}>
              {concerns.map((c: any, i: number) => {
                const card = (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/15 transition-all text-center group">
                    {c.logo ? (
                      <div className="w-20 h-20 rounded-xl bg-white mx-auto mb-5 p-2 flex items-center justify-center">
                        <img src={c.logo} alt={c.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-brand mx-auto mb-5 grid place-items-center text-white font-bold text-2xl">
                        {c.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <h3 className="text-white font-bold text-lg mb-2">{c.name}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{c.description}</p>
                    {c.link && (
                      <div className="mt-4 text-brand text-sm font-semibold group-hover:underline">
                        Visit Website {"→"}
                      </div>
                    )}
                  </div>
                );

                return c.link ? (
                  <a key={i} href={c.link} target="_blank" rel="noopener noreferrer">{card}</a>
                ) : (
                  <div key={i}>{card}</div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}