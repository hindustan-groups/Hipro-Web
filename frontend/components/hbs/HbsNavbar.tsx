"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  MessageSquare,
  Wrench,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import type { HbsContent } from "@/lib/types";

interface HbsNavbarProps {
  content: HbsContent;
}

export default function HbsNavbar({ content }: HbsNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for compact navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Escape key handler for accessible dialog closing
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    },
    [mobileMenuOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const navLinks = [
    { label: "Home", href: homeHref },
    { label: "About", href: `${prefix}/about` },
    { label: "Services", href: `${prefix}/services` },
    { label: "Projects", href: `${prefix}/projects` },
    { label: "Contact", href: `${prefix}/contact` },
  ];

  const phoneRaw = content.phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-xs">
      {/* 1. TOP UTILITY BAR (Engineering Heritage & Urgent Contacts) */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/15 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
              <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
              <span>HiPRO Division</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[280px] sm:max-w-none">
              Specialized building repair, waterproofing & protection under Hindustan Projects
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <a
              href={`tel:${phoneRaw}`}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label={`Call Hind Build Hotline at ${content.phone}`}
            >
              <Phone className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="font-semibold">{content.phone}</span>
            </a>
            <span className="text-slate-700 hidden sm:inline" aria-hidden="true">
              |
            </span>
            <a
              href={`https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Build,%20I%20need%20a%20repair%20inspection.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Chat with Hind Build on WhatsApp"
            >
              <MessageSquare className="w-3 h-3 shrink-0" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div
        className={`transition-all duration-200 border-b border-slate-200 ${
          scrolled ? "py-2 bg-white/98 backdrop-blur-md shadow-xs" : "py-3 bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Identity / Official Hind Build Logo (Never HiPRO Fallback) */}
          <Link
            href={homeHref}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 p-1"
            aria-label="Hind Build Home"
          >
            {content.logoPrimary || content.logoMobile ? (
              <div className="flex items-center">
                {/* Mobile-dedicated logo when configured in CMS */}
                {content.logoMobile ? (
                  <img
                    src={content.logoMobile}
                    alt={content.brandName || "Hind Build"}
                    className="h-8 sm:hidden w-auto max-w-[140px] object-contain"
                  />
                ) : null}
                {/* Primary logo for desktop, or mobile fallback if no mobile-specific logo */}
                <img
                  src={content.logoPrimary || content.logoMobile || ""}
                  alt={content.brandName || "Hind Build"}
                  className={`h-8 sm:h-9 md:h-10 w-auto max-w-[160px] sm:max-w-[210px] object-contain ${
                    content.logoMobile ? "hidden sm:block" : ""
                  }`}
                />
              </div>
            ) : content.logoMark ? (
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img
                  src={content.logoMark}
                  alt={content.brandName || "Hind Build"}
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-900 uppercase font-display">
                      Hind
                    </span>
                    <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-amber-600 uppercase font-display">
                      Build
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">
                    Repair · Maintenance · Protection
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-950 border-2 border-amber-500 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-xs group-hover:bg-slate-900 transition-colors shrink-0">
                  <span className="tracking-tighter text-amber-400 font-mono">HB</span>
                </div>
                <div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-900 uppercase font-display">
                      Hind
                    </span>
                    <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-amber-600 uppercase font-display">
                      Build
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">
                    Repair · Maintenance · Protection
                  </p>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 text-xs uppercase tracking-wider font-bold transition-all relative min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    active
                      ? "text-amber-700 font-black"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-500"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href={`${prefix}/contact`}
              className="hbs-btn-primary min-h-[44px] px-4 py-2.5 text-xs uppercase tracking-wider font-black shadow-xs group"
            >
              <Wrench className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span>Book Inspection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>

          {/* Mobile Action Buttons (Call + Hamburger Menu) */}
          <div className="flex md:hidden items-center gap-1">
            <a
              href={`tel:${phoneRaw}`}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-800 hover:text-amber-700 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Call Hind Build Office"
            >
              <Phone className="w-5 h-5 text-amber-600" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-colors"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="hbs-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. ACCESSIBLE MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div
          id="hbs-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="md:hidden bg-white border-b-2 border-amber-500 px-4 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top-2 duration-150"
        >
          {/* Navigation Links List */}
          <nav aria-label="Mobile Menu Links" className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-3 text-sm font-bold uppercase tracking-wider min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    active
                      ? "bg-amber-50 text-amber-800 border-l-4 border-amber-600"
                      : "text-slate-800 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5">
            <Link
              href={`${prefix}/contact`}
              className="hbs-btn-primary w-full min-h-[44px] text-xs font-black uppercase tracking-wider shadow-xs"
            >
              <Wrench className="w-4 h-4 shrink-0" />
              <span>Book Site Inspection</span>
            </Link>

            <a
              href={`https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Build,%20I%20need%20a%20repair%20quote.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hbs-btn-whatsapp w-full min-h-[44px] text-xs font-bold uppercase tracking-wider shadow-xs"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Endorsement Note */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              A Specialized Division of <strong className="text-slate-800">Hindustan Projects (HiPRO)</strong>
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
