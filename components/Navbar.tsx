"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardHat, X, Menu } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav
        className={`w-[75%] rounded-full transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-2xl shadow-3d-md border border-white/90"
            : "bg-white/40 backdrop-blur-xl border border-white/60"
        }`}
        style={{ boxShadow: scrolled ? "0 8px 32px rgba(37,99,235,0.08), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)" : "none" }}
      >
        <div className="flex items-center justify-between h-14 px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-glow-red">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-gray-900 font-display">
              Hindustan <span className="text-gradient-red">Projects</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center">
            {navLinks.map((link, i) => (
              <div key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className={`px-3.5 py-1.5 text-[13.5px] font-medium rounded-full transition-all duration-200 ${
                    pathname === link.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                  }`}
                >
                  {link.label}
                </Link>
                {i < navLinks.length - 1 && (
                  <span className="text-gray-300 text-[10px] select-none">●</span>
                )}
              </div>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-700 p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden px-4 pb-4 pt-1 flex flex-col gap-1 border-t border-gray-100/80">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
