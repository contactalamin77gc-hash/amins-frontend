"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { getSiteContent } from "@/lib/content";

const links = [
  { href: "/about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/packing-instructions", label: "Packing Guide" },
  { href: "/terms", label: "Terms" },
  { href: "/#contact", label: "Contact" },
];

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M16.001 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.487.68 4.816 1.865 6.812L2.667 29.333l6.703-1.827A13.29 13.29 0 0 0 16.001 29.333c7.36 0 13.333-5.973 13.333-13.333S23.361 2.667 16.001 2.667Zm0 24.222a11.02 11.02 0 0 1-5.86-1.687l-.42-.25-4.114 1.122 1.14-4.008-.274-.41a10.947 10.947 0 0 1-1.68-5.856c0-6.084 4.951-11.036 11.208-11.036 6.084 0 11.036 4.951 11.036 11.036 0 6.257-4.952 11.09-11.036 11.09Zm6.03-8.19c-.33-.166-1.955-.965-2.258-1.075-.303-.11-.523-.166-.744.166-.22.331-.853 1.075-1.046 1.296-.193.221-.386.248-.716.083-.33-.166-1.393-.513-2.653-1.637-.98-.874-1.642-1.953-1.834-2.284-.193-.331-.02-.51.145-.675.15-.148.331-.386.497-.58.166-.192.22-.33.331-.55.11-.222.055-.415-.028-.581-.083-.166-.744-1.792-1.02-2.454-.269-.645-.542-.558-.744-.568l-.634-.011c-.22 0-.58.083-.883.415-.303.33-1.157 1.13-1.157 2.756 0 1.626 1.185 3.197 1.35 3.418.166.221 2.333 3.563 5.654 4.996.79.341 1.407.545 1.888.697.793.253 1.514.217 2.084.132.636-.095 1.955-.8 2.23-1.572.276-.773.276-1.435.193-1.573-.083-.138-.303-.221-.634-.386Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.522 1.492-3.917 3.777-3.917 1.094 0 2.238.197 2.238.197v2.475h-1.26c-1.243 0-1.63.775-1.63 1.57v1.888h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
    </svg>
  );
}

export default function Footer() {
  const [content, setContent] = useState<Record<string, any>>({});
  useEffect(() => { getSiteContent().then(setContent); }, []);

  const whatsappNumber = (content.whatsapp_number || "").replace(/[^0-9]/g, "");
  const facebookUrl = content.facebook_url || "";

  return (
    <footer className="bg-brand text-white/85 mt-10">
      <div className="max-w-[1180px] mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Row 1 on mobile (logo + social icons); becomes ordered flex items on desktop via md:contents */}
        <div className="flex items-center justify-between md:contents">
          <Logo color="text-white" size="small" />

          <div className="flex items-center gap-3 md:order-3">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/15 grid place-items-center hover:bg-white/25 transition-colors">
                <FacebookIcon />
              </a>
            )}
            {whatsappNumber && (
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-white/15 grid place-items-center hover:bg-white/25 transition-colors">
                <WhatsAppIcon />
              </a>
            )}
          </div>
        </div>

        {/* Row 2 on mobile; center column on desktop */}
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[13px] font-medium md:order-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/20 text-center py-2.5 text-[11px] text-white/70">
        © {new Date().getFullYear()} Amin&apos;s Cargo & Shipping. All rights reserved by <a href="https://nyalamin.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Alamin</a>.
      </div>
    </footer>
  );
}
