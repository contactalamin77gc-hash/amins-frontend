"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import Reveal from "./reveal";

export default function ContactDetails() {
  const [content, setContent] = useState<Record<string, any>>({});
  useEffect(() => { getSiteContent().then(setContent); }, []);

  const phone = content.contact_phone || "+880 1X XXX XXXXX";
  const email = content.contact_email || "hello@aminsbd.com";
  const address = content.contact_address || "Dhaka, Bangladesh";
  const hours = content.contact_hours || "Sun-Thu: 10AM-6PM";
  const mapEmbed = content.contact_map_embed || "";

  return (
    <section id="contact" className="bg-white py-12 sm:py-20 scroll-mt-20">
      <div className="max-w-[1180px] mx-auto px-6">
        <Reveal className="text-center mb-8 sm:mb-12">
          <span className="text-kicker text-brand">Get In Touch</span>
          <h2 className="text-section-title text-brand-ink mt-3 mb-3">Contact Us</h2>
          <div className="w-16 h-1 bg-brand mx-auto" />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left — details */}
          <Reveal className="space-y-4">
            <div className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0"><Phone size={20} /></div>
              <div>
                <div className="text-sm font-bold text-brand-ink">Phone</div>
                <div className="text-gray-label text-sm mt-0.5">{phone}</div>
              </div>
            </div>
            <div className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0"><Mail size={20} /></div>
              <div>
                <div className="text-sm font-bold text-brand-ink">Email</div>
                <div className="text-gray-label text-sm mt-0.5">{email}</div>
              </div>
            </div>
            <div className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0"><MapPin size={20} /></div>
              <div>
                <div className="text-sm font-bold text-brand-ink">Address</div>
                <div className="text-gray-label text-sm mt-0.5">{address}</div>
              </div>
            </div>
            <div className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0"><Clock size={20} /></div>
              <div>
                <div className="text-sm font-bold text-brand-ink">Office Hours</div>
                <div className="text-gray-label text-sm mt-0.5">{hours}</div>
              </div>
            </div>
          </Reveal>

          {/* Right — map */}
          <Reveal delay={120} className="card overflow-hidden min-h-[320px] h-full">
            {mapEmbed ? (
              <iframe
                src={mapEmbed}
                className="w-full h-full min-h-[320px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office location map"
              />
            ) : (
              <div className="w-full h-full min-h-[320px] flex items-center justify-center bg-brand-mist text-gray-label text-sm text-center p-6">
                Map location coming soon.
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
