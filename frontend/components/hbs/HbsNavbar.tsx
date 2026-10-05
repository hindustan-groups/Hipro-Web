"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MessageSquare, Wrench, Menu, X, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import type { HbsContent } from "@/lib/types";

interface HbsNavbarProps {
  content: HbsContent;
}

export default function HbsNavbar({ content }: HbsNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const navLinks = [
    { label: "Home", href: homeHref },
    { label: "About", href: `${prefix}/about` },
    { label: "19 Services", href: `${prefix}/services` },
    { label: "Our Work", href: `${prefix}/projects` },
    { label: "Contact / Quote", href: `${prefix}/contact` },
  ];

  const phoneRaw = content.phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xs border border-amber-500/30">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              HiPRO Sub-Brand
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              A specialized building repair & maintenance division under Hindustan Projects
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href={`tel:${phoneRaw}`}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-500" />
              <span className="font-semibold">{content.phone}</span>
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <a
              href={`https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Building%20Solutions,%20I%20need%20a%20repair%20inspection.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className={`transition-all duration-200 border-b border-slate-100 ${scrolled ? "py-2.5 bg-white/95 backdrop-blur-md" : "py-3.5 bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href={homeHref} className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-900 border-2 border-amber-500 flex items-center justify-center text-white font-black text-base shadow-xs group-hover:bg-slate-800 transition-colors">
              <span className="tracking-tighter text-amber-400">HBS</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase font-display">
                  Hind Building
                </span>
                <span className="text-base sm:text-lg font-black tracking-tight text-amber-600 uppercase font-display">
                  Solutions
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Repair · Maintenance · Protection
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-xs uppercase tracking-wider font-bold transition-all relative ${
                    active
                      ? "text-amber-600 font-black"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/hbs/contact"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-amber-600 text-white text-xs uppercase tracking-wider font-bold px-4 py-2.5 rounded-none shadow-xs transition-colors group"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400 group-hover:text-white transition-colors" />
              <span>Get Free Quote</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={`tel:${phoneRaw}`}
              className="p-2 text-slate-800 hover:text-amber-600"
              aria-label="Call HBS"
            >
              <Phone className="w-5 h-5 text-amber-600" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-900 hover:bg-slate-100 rounded-none focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm font-bold uppercase tracking-wider ${
                    active ? "bg-amber-50 text-amber-700 border-l-4 border-amber-600" : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <Link
              href="/hbs/contact"
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider py-3 shadow-xs"
            >
              <Wrench className="w-4 h-4" />
              <span>Book Site Inspection</span>
            </Link>

            <a
              href={`https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Building%20Solutions,%20I%20need%20a%20repair%20quote.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-500">
              A Sub-Brand of <span className="font-bold text-slate-700">Hindustan Projects</span>
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
