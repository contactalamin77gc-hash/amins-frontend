"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/content";
import Reveal from "./reveal";

interface GlobalCountry {
  name: string;
  image: string;
  description: string;
}

export default function OperatingGlobally() {
  const [content, setContent] = useState<Record<string, any>>({});
  useEffect(() => { getSiteContent().then(setContent); }, []);

  const title = content.global_title || "Now We Are Operating Globally";
  const subtitle = content.global_subtitle || "";
  const countries: GlobalCountry[] = content.global_countries || [];

  if (countries.length === 0 && !title) return null;

  return (
    <section className="bg-brand py-12 sm:py-20">
      <div className="max-w-[1180px] mx-auto px-6 text-center">
        <Reveal>
          <h2 className="text-section-title text-white mb-3">{title}</h2>
          <div className="w-16 h-1 bg-white mx-auto mb-5" />
          {subtitle && <p className="text-white/85 text-[17px] leading-relaxed max-w-[60ch] mx-auto mb-8 sm:mb-12">{subtitle}</p>}
        </Reveal>

        {countries.length > 0 && (
          <div className={`grid gap-6 ${countries.length === 1 ? "grid-cols-1 max-w-[320px] mx-auto" : countries.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-[620px] mx-auto" : "grid-cols-1 sm:grid-cols-3"}`}>
            {countries.map((c, i) => (
              <Reveal key={i} delay={i * 100} className="relative rounded-2xl overflow-hidden border border-white/15 hover:border-white/30 transition-all group min-h-[240px] flex items-end">
                {/* Full card background — country photo/flag, or a soft fallback with the initial */}
                {c.image ? (
                  <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-white/10 grid place-items-center text-white/50 font-bold text-6xl">
                    {c.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                {/* Scrim for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <div className="relative z-10 p-6 text-center w-full">
                  <h3 className="text-white font-bold text-lg mb-2">{c.name}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{c.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
