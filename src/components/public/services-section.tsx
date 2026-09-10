"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/content";
import { Plane, Ship, Warehouse, ClipboardList, Package, Truck } from "lucide-react";
import Reveal from "./reveal";

const ICONS: Record<string, any> = { Plane, Ship, Warehouse, ClipboardList, Package, Truck };

interface Service {
  icon: string;
  title: string;
  image?: string;
}

export default function ServicesSection() {
  const [content, setContent] = useState<Record<string, any>>({});
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => { getSiteContent().then(setContent); }, []);

  const servicesTitle = content.services_title || "Everything between the supplier and your warehouse.";
  const servicesSubtitle = content.services_subtitle || "We handle the full logistics chain so you only deal with one company — us.";
  const services: Service[] = content.services || [];
  const fallbackImage = content.services_image || "";

  const activeService = services[activeIdx];

  return (
    <section id="services" className="py-12 sm:py-20 scroll-mt-20">
      <Reveal className="max-w-[1180px] mx-auto px-6 text-center mb-8 sm:mb-12">
        <h2 className="text-section-title text-brand-ink mb-3">{servicesTitle}</h2>
        <div className="w-16 h-1 bg-brand mx-auto mb-5" />
        <p className="text-body-lg max-w-[60ch] mx-auto">{servicesSubtitle}</p>
      </Reveal>

      <Reveal delay={100} className="max-w-[1180px] mx-auto px-6">
        <div className="relative rounded-2xl overflow-hidden min-h-[400px] bg-[#1a2332]">
          {/* Base/fallback layer — shown when the active service has no image of its own */}
          <div
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: activeService?.image ? 0 : 1,
              background: fallbackImage ? `url(${fallbackImage}) center/cover no-repeat` : "linear-gradient(135deg, #1a2332 0%, #0E1B33 100%)",
            }}
          />

          {/* Cross-fading per-service background images */}
          {services.filter((svc) => svc.image).map((svc) => (
            <div
              key={svc.image}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{
                opacity: activeService?.image === svc.image ? 1 : 0,
                background: `url(${svc.image}) center/cover no-repeat`,
              }}
            />
          ))}

          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-0 min-h-[340px] sm:min-h-[400px]">
            {services.map((svc, i) => {
              const Icon = ICONS[svc.icon] || Package;
              const isActive = i === activeIdx;
              // 2-col mobile grid: right border on left column, bottom border on all but the last row
              const mobileRightBorder = i % 2 === 0 && i + 1 < services.length;
              const mobileBottomBorder = i < services.length - (services.length % 2 === 0 ? 2 : services.length % 2 || 1);
              // md+ single-row grid: right border on all but the last card
              const desktopRightBorder = i < services.length - 1;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-white text-center transition-all hover:bg-white/10 cursor-pointer border-white/15 ${mobileRightBorder ? "border-r" : ""} ${mobileBottomBorder ? "border-b" : ""} md:border-b-0 ${desktopRightBorder ? "md:border-r" : "md:border-r-0"} ${isActive ? "bg-white/10" : ""}`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 grid place-items-center mb-3 sm:mb-4 md:mb-5 transition-colors ${isActive ? "border-white bg-brand/30" : "border-white/40"}`}>
                    <Icon size={22} strokeWidth={1.5} className="sm:hidden" />
                    <Icon size={28} strokeWidth={1.5} className="hidden sm:block" />
                  </div>
                  <h3 className="text-[14px] sm:text-[15px] md:text-[17px] font-bold leading-tight">{svc.title}</h3>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
