"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogIn,
  ArrowRight,
  Menu,
  X,
  Phone,
  User,
} from "lucide-react";

export default function EmpanelmentNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/empanelment", label: "Home" },
    { href: "/empanelment/guidelines", label: "About" },
    { href: "/empanelment/apply", label: "Vendor Registration" },
    { href: "/empanelment/tenders", label: "Procurement" },
    { href: "/empanelment/guidelines", label: "Guidelines" },
    { href: "/empanelment#faqs", label: "FAQs" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/empanelment" className="flex flex-col group">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 flex items-center">
            HINDUSTAN&nbsp;<span className="text-[#dc2626]">PROJECTS</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-slate-500 uppercase mt-0.5">
            Engineering · Construction · Infrastructure
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-slate-700">
          {navLinks.map((link) => {
            const isHome = link.href === "/empanelment";
            const active = isHome ? pathname === "/empanelment" : pathname.startsWith(link.href) && link.href !== "/empanelment";
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative transition-colors pb-1.5 ${
                  active
                    ? "text-[#dc2626] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#dc2626] after:rounded-full"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/empanelment/track"
            className="inline-flex items-center gap-2 bg-[#0e1a2f] hover:bg-[#1a2d4c] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-lg transition-all shadow-sm group"
          >
            <User className="w-4 h-4 text-white" />
            <span>Vendor Login</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 text-sm shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50 font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/admin/empanelment"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Admin & Staff Workspace ↗
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
