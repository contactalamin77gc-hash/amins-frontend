"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/content";

export default function AboutPage() {
  const [content, setContent] = useState<Record<string, any>>({});
  useEffect(() => { getSiteContent().then(setContent); }, []);

  return (
    <section className="max-w-[1180px] mx-auto px-6 py-20">
      <span className="text-kicker text-brand">About Us</span>
      <h1 className="text-section-title text-brand-ink mt-3 mb-4">
        {content.about_title || "Connecting Chinese suppliers to Bangladeshi businesses since 2018."}
      </h1>
      <p className="text-body-lg max-w-[70ch]">
        {content.about_content || "Amin's Cargo & Shipping is a Dhaka-based logistics company."}
      </p>
    </section>
  );
}