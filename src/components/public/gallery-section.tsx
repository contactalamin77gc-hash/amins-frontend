"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import Reveal from "./reveal";

interface Photo {
  url: string;
  caption: string;
  category: string;
}

export default function GallerySection() {
  const [content, setContent] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  useEffect(() => { getSiteContent().then(setContent); }, []);

  const title = content.gallery_title || "Our Gallery";
  const photos: Photo[] = (content.gallery_photos || []).filter((p: Photo) => p.url);

  if (photos.length === 0) return null;

  const categories = ["All", ...Array.from(new Set(photos.map((p) => p.category).filter(Boolean)))];
  const filtered = activeCategory === "All" ? photos : photos.filter((p) => p.category === activeCategory);

  return (
    <section className="bg-white py-12 sm:py-20">
      <div className="max-w-[1180px] mx-auto px-6">
        <Reveal className="text-center mb-8">
          <h2 className="text-section-title text-brand-ink mb-3">{title}</h2>
          <div className="w-16 h-1 bg-brand mx-auto" />
        </Reveal>

        {categories.length > 2 && (
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold border-[1.5px] transition-colors cursor-pointer ${
                  activeCategory === cat ? "bg-brand border-brand text-white" : "bg-white border-gray-line text-gray-label hover:border-brand hover:text-brand"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4 lg:gap-6">
          {filtered.map((p, i) => (
            <Reveal key={i} delay={(i % 4) * 80}>
              <button
                onClick={() => setLightbox(p)}
                className="relative rounded-xl overflow-hidden aspect-square group cursor-pointer border border-gray-line w-full"
              >
                <img src={p.url} alt={p.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {p.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[12px] lg:text-sm font-semibold px-3 py-2 lg:px-4 lg:py-3 text-left">
                    {p.caption}
                  </div>
                )}
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] bg-black/85 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center cursor-pointer"
          >
            <X size={22} />
          </button>
          <div className="max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption} className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg mx-auto" />
            {lightbox.caption && (
              <div className="text-white text-center text-sm mt-3">{lightbox.caption}</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
