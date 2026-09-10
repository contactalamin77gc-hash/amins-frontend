"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/content";
import Reveal from "./reveal";

interface VideoItem {
  title: string;
  url: string;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function AboutVideos() {
  const [content, setContent] = useState<Record<string, any>>({});

  useEffect(() => { getSiteContent().then(setContent); }, []);

  const title = content.about_videos_title || "About Us";
  const description = content.about_videos_description || "";
  const videos: VideoItem[] = (content.about_videos || []).filter((v: VideoItem) => v.url && extractYouTubeId(v.url));

  return (
    <section className="bg-white py-12 sm:py-20">
      <div className="max-w-[1180px] mx-auto px-6">
        <Reveal className="text-center mb-10">
          <h2 className="text-section-title text-brand-ink mb-3">{title}</h2>
          <div className="w-16 h-1 bg-brand mx-auto mb-5" />
          {description && (
            <p className="text-body-lg max-w-[70ch] mx-auto whitespace-pre-line">{description}</p>
          )}
        </Reveal>

        {videos.length > 0 && (
          <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${videos.length >= 3 ? "lg:grid-cols-3" : ""}`}>
            {videos.map((v, i) => {
              const id = extractYouTubeId(v.url)!;
              return (
                <Reveal key={i} delay={i * 100} className="rounded-2xl overflow-hidden shadow-[var(--shadow-card)] border border-gray-line bg-white">
                  <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${id}`}
                      title={v.title || `Video ${i + 1}`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {v.title && (
                    <div className="p-4">
                      <div className="text-sm font-semibold text-brand-ink">{v.title}</div>
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
