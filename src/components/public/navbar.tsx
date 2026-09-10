"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/ui/logo";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/#services", label: "Services" },
  { href: "/packing-instructions", label: "Packing Guide" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand">
      <div className="max-w-[1180px] mx-auto flex items-center justify-between px-6 py-2">
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <Logo color="text-white" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-nav-link transition-colors hover:text-white/70 ${pathname === link.href ? "text-white" : "text-white/85"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 rounded-lg bg-white/10 grid place-items-center text-white cursor-pointer hover:bg-white/20 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-brand border-t border-white/10">
          <nav className="max-w-[1180px] mx-auto px-6 py-4 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-nav-link py-3 border-b border-white/10 last:border-0 transition-colors ${pathname === link.href ? "text-white" : "text-white/85 hover:text-white"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}