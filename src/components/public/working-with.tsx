"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/content";
import Reveal from "./reveal";

interface Partner {
  name: string;
  logo: string;
  link?: string;
}

export default function WorkingWith() {
  const [content, setContent] = useState<Record<string, any>>({});
  useEffect(() => { getSiteContent().then(setContent); }, []);

  const title = content.partners_title || "We Are Working With";
  const partners: Partner[] = (content.partners || []).filter((p: Partner) => p.name || p.logo);

  if (partners.length === 0) return null;

  return (
    <section className="bg-brand-mist py-12 sm:py-16">
      <div className="max-w-[1180px] mx-auto px-6">
        <Reveal className="text-center mb-8 sm:mb-10">
          <h2 className="text-section-title text-brand-ink mb-3">{title}</h2>
          <div className="w-16 h-1 bg-brand mx-auto" />
        </Reveal>

        <div className="flex flex-wrap items-stretch justify-center gap-3 sm:gap-6">
          {partners.map((p, i) => {
            const card = (
              <Reveal delay={(i % 6) * 70} className="relative rounded-xl overflow-hidden border border-gray-line w-[130px] sm:w-[160px] aspect-square group hover:shadow-[var(--shadow-card)] transition-shadow">
                {/* Full card background — logo photo, or a brand-colored fallback with the initial */}
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-ink grid place-items-center text-white font-bold text-3xl">
                    {p.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                {/* Scrim for name legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                  <div className="text-[11px] sm:text-[12px] font-semibold text-white text-center leading-tight">{p.name}</div>
                </div>
              </Reveal>
            );
            return p.link ? (
              <a key={i} href={p.link} target="_blank" rel="noopener noreferrer">{card}</a>
            ) : (
              <div key={i}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
