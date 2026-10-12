"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Menu,
  X,
  Inbox,
  Clock,
  Briefcase,
  QrCode,
  Phone,
  ExternalLink,
} from "lucide-react";

export default function EmpanelmentNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/empanelment", label: "Overview", labelHi: "होम" },
    { href: "/empanelment/apply", label: "Register / Apply", labelHi: "नया पंजीकरण", highlight: true },
    { href: "/empanelment/track", label: "Track & Smart ID", labelHi: "स्थिति जांचें" },
    { href: "/empanelment/tenders", label: "Active Tenders", labelHi: "चालू टेंडर" },
    { href: "/empanelment/gate-pass", label: "Daily Gate Pass", labelHi: "डेली गेट पास" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/empanelment" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-sm tracking-tight font-display uppercase">
                Hindustan Projects
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                PORTAL
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              Vendor & Contractor Empanelment
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  link.highlight
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs font-bold"
                    : active
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{link.label}</span>
                <span className="text-[10px] text-slate-400 font-normal ml-1">
                  {link.labelHi}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right Help / Contact Button & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <a
            href="tel:+919829000000"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span>Procurement Desk</span>
          </a>

          <Link
            href="/admin/empanelment"
            className="hidden sm:inline-flex text-[11px] font-semibold text-slate-400 hover:text-slate-700 px-2 py-1"
            title="Master Admin Login"
          >
            Staff Portal ↗
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-2xl px-4 py-4 space-y-2 text-xs">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold ${
                pathname === link.href
                  ? "bg-amber-50 text-amber-900 font-bold border border-amber-200/60"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{link.label}</span>
              <span className="text-[11px] text-slate-400 font-medium">{link.labelHi}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/admin/empanelment"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Staff & Admin Login ↗
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
