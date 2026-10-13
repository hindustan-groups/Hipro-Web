"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  User,
  FileText,
  Briefcase,
  Search,
  QrCode,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  MessageSquare,
  Building2,
} from "lucide-react";
import {
  EmpanelmentContent,
  DEFAULT_EMPANELMENT_CONTENT,
} from "@/lib/empanelmentContent";

export default function EmpanelmentNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);

  useEffect(() => {
    async function loadCms() {
      try {
        const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const cleanUrl = rawUrl.replace(/\/+$/, "");
        const res = await fetch(`${cleanUrl}/api/empanelment/content`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content) {
            setContent({ ...DEFAULT_EMPANELMENT_CONTENT, ...json.content });
          }
        }
      } catch (_e) {}
    }
    loadCms();
  }, []);

  const navLinks = [
    { href: "/empanelment", label: "Home" },
    { href: "/empanelment/guidelines", label: "Guidelines" },
    { href: "/empanelment/tenders", label: "Tenders" },
    { href: "/empanelment/apply", label: "Registration" },
    { href: "/empanelment/track", label: "Track Status" },
    { href: "/empanelment/gate-pass", label: "Gate Pass" },
    { href: "/empanelment#faqs", label: "FAQs" },
  ];

  const phoneClean = (content.phone || "+919876543210").replace(/\s+/g, "");
  const whatsappClean = (content.supportWhatsapp || "+919876543210").replace(/[^0-9]/g, "");

  return (
    <>
      {/* Live Announcement Ticker Banner from CMS */}
      {content.noticeAlertActive && content.noticeAlertBanner && (
        <div className="bg-amber-400 text-slate-950 px-4 py-1.5 text-center text-[11px] sm:text-xs font-bold tracking-tight border-b border-amber-500/30 flex items-center justify-center gap-2">
          <span>{content.noticeAlertBanner}</span>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/empanelment" className="flex flex-col group shrink-0">
          <div className="text-lg sm:text-2xl font-black tracking-tight text-slate-950 flex items-center">
            HINDUSTAN&nbsp;<span className="text-[#dc2626]">PROJECTS</span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-medium tracking-wide text-slate-500 uppercase mt-0.5">
            Engineering · Construction · Infrastructure
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-[13px] xl:text-[14px] font-medium text-slate-700">
          {navLinks.map((link) => {
            const isHome = link.href === "/empanelment";
            const active = isHome
              ? pathname === "/empanelment"
              : pathname.startsWith(link.href) && link.href !== "/empanelment";
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative transition-colors pb-1 ${
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

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Vendor Login / Track */}
          <Link
            href="/empanelment/track"
            className="hidden sm:inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-lg transition-all border border-slate-200/80"
          >
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span>Track & Login</span>
          </Link>

          {/* Desktop Register CTA */}
          <Link
            href="/empanelment/apply"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-xs"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Tap-to-Call Quick Button */}
          <a
            href={`tel:${phoneClean}`}
            className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Call Procurement Desk"
            aria-label="Call Helpline"
          >
            <Phone className="w-4 h-4 text-[#dc2626]" />
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Ultra-friendly mobile UI) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-5 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Quick Action Tiles (2x2 Grid) */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Services / त्वरित सेवाएं
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/empanelment/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-red-50/70 border border-red-200/80 hover:bg-red-100/70 transition-colors flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-[#dc2626] text-white flex items-center justify-center mb-2 shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">Vendor Registration</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">नया वेंडर पंजीकरण</p>
                </div>
              </Link>

              <Link
                href="/empanelment/tenders"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-violet-50/70 border border-violet-200/80 hover:bg-violet-100/70 transition-colors flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center mb-2 shadow-2xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">Active Tenders</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">चालू टेंडर व कोटेशन</p>
                </div>
              </Link>

              <Link
                href="/empanelment/track"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/70 transition-colors flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-2 shadow-2xs">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">Track Application</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">आवेदन स्थिति व Smart ID</p>
                </div>
              </Link>

              <Link
                href="/empanelment/gate-pass"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 hover:bg-rose-100/70 transition-colors flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center mb-2 shadow-2xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">Daily Site Pass</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">24-Hr डेली साइट पास</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Standard Page Links */}
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <Link
              href="/empanelment"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <span>Portal Home (होम पेज)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/empanelment/guidelines"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <span>Capacity Guidelines & NBC Standards (पात्रता नियम)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            </Link>

            <Link
              href="/empanelment#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <span>Frequently Asked Questions (प्रश्न व उत्तर)</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Direct Procurement Helpline Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#dc2626]" />
              <span>Procurement Support Desk</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${phoneClean}`}
                className="py-2 px-3 rounded-lg bg-white border border-slate-200 text-center font-bold text-[11px] text-slate-800 hover:border-slate-300 shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3 h-3 text-[#dc2626]" />
                <span>Call Desk</span>
              </a>
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-lg bg-emerald-600 text-white text-center font-bold text-[11px] hover:bg-emerald-700 shadow-2xs flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3 h-3 text-white" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Admin link */}
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hindustan Projects Empanelment</span>
            <Link
              href="/admin/empanelment"
              onClick={() => setMobileMenuOpen(false)}
              className="font-bold text-slate-600 hover:text-slate-900"
            >
              Staff Admin Workspace ↗
            </Link>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
