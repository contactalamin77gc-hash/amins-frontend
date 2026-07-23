"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/content";

export default function ContactPage() {
  const [content, setContent] = useState<Record<string, any>>({});
  useEffect(() => { getSiteContent().then(setContent); }, []);

  return (
    <section className="max-w-[1180px] mx-auto px-6 py-20">
      <span className="text-kicker text-brand">Contact</span>
      <h1 className="text-section-title text-brand-ink mt-3 mb-4">Get in touch</h1>
      <p className="text-body-lg max-w-[70ch] mb-8">
        Ready to start shipping? Have questions about our services? Reach out and we&apos;ll get back to you within 24 hours.
      </p>
      <div className="grid md:grid-cols-3 gap-5 max-w-[700px]">
        <div className="card p-6">
          <h3 className="font-display text-brand-ink text-lg mb-2">Phone</h3>
          <p className="text-gray-label text-sm">{content.contact_phone || "+880 1X XXX XXXXX"}</p>
        </div>
        <div className="card p-6">
          <h3 className="font-display text-brand-ink text-lg mb-2">Email</h3>
          <p className="text-gray-label text-sm">{content.contact_email || "hello@aminsbd.com"}</p>
        </div>
        <div className="card p-6">
          <h3 className="font-display text-brand-ink text-lg mb-2">Office</h3>
          <p className="text-gray-label text-sm">{content.contact_address || "Dhaka, Bangladesh"}</p>
        </div>
      </div>
    </section>
  );
}