"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/content";

// Simple inline icons so we don't need to add a new icon dependency
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M16.001 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.487.68 4.816 1.865 6.812L2.667 29.333l6.703-1.827A13.29 13.29 0 0 0 16.001 29.333c7.36 0 13.333-5.973 13.333-13.333S23.361 2.667 16.001 2.667Zm0 24.222a11.02 11.02 0 0 1-5.86-1.687l-.42-.25-4.114 1.122 1.14-4.008-.274-.41a10.947 10.947 0 0 1-1.68-5.856c0-6.084 4.951-11.036 11.208-11.036 6.084 0 11.036 4.951 11.036 11.036 0 6.257-4.952 11.09-11.036 11.09Zm6.03-8.19c-.33-.166-1.955-.965-2.258-1.075-.303-.11-.523-.166-.744.166-.22.331-.853 1.075-1.046 1.296-.193.221-.386.248-.716.083-.33-.166-1.393-.513-2.653-1.637-.98-.874-1.642-1.953-1.834-2.284-.193-.331-.02-.51.145-.675.15-.148.331-.386.497-.58.166-.192.22-.33.331-.55.11-.222.055-.415-.028-.581-.083-.166-.744-1.792-1.02-2.454-.269-.645-.542-.558-.744-.568l-.634-.011c-.22 0-.58.083-.883.415-.303.33-1.157 1.13-1.157 2.756 0 1.626 1.185 3.197 1.35 3.418.166.221 2.333 3.563 5.654 4.996.79.341 1.407.545 1.888.697.793.253 1.514.217 2.084.132.636-.095 1.955-.8 2.23-1.572.276-.773.276-1.435.193-1.573-.083-.138-.303-.221-.634-.386Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.522 1.492-3.917 3.777-3.917 1.094 0 2.238.197 2.238.197v2.475h-1.26c-1.243 0-1.63.775-1.63 1.57v1.888h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
    </svg>
  );
}

export default function FloatingButtons() {
  const [content, setContent] = useState<Record<string, any>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getSiteContent().then(setContent);
    // trigger slide-in on next tick after mount
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const whatsappNumber = (content.whatsapp_number || "").replace(/[^0-9]/g, "");
  const facebookUrl = content.facebook_url || "";

  if (!whatsappNumber && !facebookUrl) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-3 items-end">
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:scale-105 transition-all duration-500 ${
            mounted ? "translate-x-0 opacity-100" : "translate-x-24 opacity-0"
          }`}
        >
          <WhatsAppIcon />
        </a>
      )}
      {facebookUrl && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on Facebook"
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1877F2] text-white grid place-items-center shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:scale-105 transition-all duration-500 ${
            mounted ? "translate-x-0 opacity-100" : "translate-x-24 opacity-0"
          }`}
          style={{ transitionDelay: "80ms" }}
        >
          <FacebookIcon />
        </a>
      )}
    </div>
  );
}
