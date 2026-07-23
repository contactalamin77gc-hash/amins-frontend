"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { getSiteContent } from "@/lib/content";

export default function Footer() {
  const [content, setContent] = useState<Record<string, any>>({});
  useEffect(() => { getSiteContent().then(setContent); }, []);

  return (
    <footer className="bg-brand text-white/80 mt-10">
      <div className="max-w-[1180px] mx-auto px-6 py-1 grid grid-cols-1 md:grid-cols-4 gap-9 text-sm">
        <div>
          <div className="mb-4"><Logo color="text-white" size="small" /></div>
          <p className="max-w-[34ch] leading-relaxed">{content.footer_description || "Cargo & shipping company connecting Chinese suppliers to Bangladeshi businesses."}</p>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-3.5">Company</h4>
          <Link href="/about" className="block py-1 hover:text-white transition-colors">About Us</Link>
          <Link href="/services" className="block py-1 hover:text-white transition-colors">Services</Link>
          <Link href="/packing-instructions" className="block py-1 hover:text-white transition-colors">Packing Guide</Link>
          <Link href="/terms" className="block py-1 hover:text-white transition-colors">Terms & Conditions</Link>
          
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-3.5">Support</h4>
          <Link href="/" className="block py-1 hover:text-white transition-colors">Track Shipment</Link>
          <Link href="/contact" className="block py-1 hover:text-white transition-colors">Contact</Link>
          <Link href="/" className="block py-1 hover:text-white transition-colors">FAQ</Link>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-3.5">Contact</h4>
          <p className="py-1">{content.contact_address || "Dhaka, Bangladesh"}</p>
          <p className="py-1">{content.contact_phone || "+880 1X XXX XXXXX"}</p>
          <p className="py-1">{content.contact_email || "hello@aminsbd.com"}</p>
        </div>
      </div>
      <div className="border-t border-white/20 text-center py-3 text-xs text-white/70">
        © {new Date().getFullYear()} Amin&apos;s Cargo & Shipping. All rights reserved.
      </div>
    </footer>
  );
}