"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  PanelLeft,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Building2,
  Flame,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import AdminSpotlightModal from "@/components/admin/AdminSpotlightModal";

const titles: Record<string, string> = {
  "/admin":             "Company Headquarters",
  "/admin/hipro":       "HiPRO Corporate Web Studio",
  "/admin/security":    "Security & 2FA Vault",
  "/admin/backup":      "Database Backup Vault",
  "/admin/data-tools":  "Universal Data Import & Export",
  "/admin/api-keys":    "API Keys & Secrets Vault",
  "/admin/hq-settings": "Master HQ Settings",
  "/admin/stats":       "HiPRO · Homepage Counters CMS",
  "/admin/leads":       "Leads Hub",
  "/admin/automail":    "AutoMail Studio",
  "/admin/quotes":      "Quote Requests",
  "/admin/contacts":    "Contact Inquiries",
  "/admin/applications":"Job Applications",
  "/admin/newsletter":  "Newsletter Subscribers",
  "/admin/projects":    "Projects Portfolio",
  "/admin/projects-hero":"Projects Hero CMS",
  "/admin/services":    "Services Management",
  "/admin/blogs":       "Blog Articles",
  "/admin/blogs-hero":  "Blogs Hero CMS",
  "/admin/testimonials":"Client Reviews",
  "/admin/team":        "Team Members",
  "/admin/hero":        "Hero Section CMS",
  "/admin/about":       "About Page CMS",
  "/admin/contact-page":"Contact Page CMS",
  "/admin/cost-estimator": "Cost Estimator CMS",
  "/admin/image-showcase": "Image Showcase CMS",
  "/admin/jobs":        "Job Openings",
  "/admin/cta-management": "CTA Management",
  "/admin/navigation":  "Navigation Menus",
  "/admin/users":       "Users & Roles",
  "/admin/settings":    "Site Settings",
  "/admin/snaptech":    "SnapTech Digital Portal",
  "/admin/hbs":             "Hind Build Dashboard",
  "/admin/hbs/home":        "Hind Build · Homepage CMS",
  "/admin/hbs/about":       "Hind Build · About Page CMS",
  "/admin/hbs/why-choose-us":"Hind Build · Why Choose Us",
  "/admin/hbs/services":    "Hind Build · Services Catalog",
  "/admin/hbs/projects":    "Hind Build · Projects & Case Studies",
  "/admin/hbs/testimonials":"Hind Build · Testimonials",
  "/admin/hbs/leads":       "Hind Build · Leads & Quotes",
  "/admin/hbs/branding":    "Hind Build · Branding & Logos",
  "/admin/hbs/media":       "Hind Build · Media Library",
  "/admin/hbs/seo":         "Hind Build · SEO & Metadata",
  "/admin/hbs/settings":    "Hind Build · Settings",
  "/admin/empanelment":             "Vendor Empanelment",
  "/admin/empanelment/applications":"KYC Applications Pipeline",
  "/admin/empanelment/directory":   "Verified Partners Directory",
  "/admin/empanelment/categories":  "Trade Category Studio",
  "/admin/empanelment/tenders":     "Tenders & Bidding Radar",
  "/admin/empanelment/gate-passes": "Daily Site Gate Passes",
  "/admin/empanelment/work-orders": "Work Orders & Billing",
  "/admin/empanelment/content":     "Portal CMS & Content",
  "/admin/empanelment/tickets":     "Vendor Helpdesk & Tickets",
  "/admin/empanelment/settings":    "Empanelment Settings",
};

export default function AdminHeader({ user }: { user: any }) {
  const pathname = usePathname();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const notifRef = useRef<HTMLDivElement>(null);

  // Global Ctrl + K / Cmd + K spotlight shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin-login";
  };

  const getTitle = () => {
    if (!pathname) return "Admin Panel";
    if (titles[pathname]) return titles[pathname];
    const match = Object.entries(titles).find(
      ([key]) => key !== "/admin" && pathname?.startsWith(key)
    );
    return match ? match[1] : "Admin Panel";
  };
  const title = getTitle();

  return (
    <header className="h-16 shrink-0 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-6 z-30 sticky top-0 shadow-[0_2px_16px_rgba(15,23,42,0.02)]">
      {/* ── Left: Sidebar Collapse Toggle & Page Title ── */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
          aria-label="Toggle Sidebar Navigation"
          title="Toggle Sidebar (Ctrl + B)"
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all focus:outline-none shrink-0 cursor-pointer shadow-2xs"
        >
          <PanelLeft className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pathname?.startsWith("/admin/hbs") ? "/hibuild-brand-logo.png" : "/logo.jpg"}
            alt="Brand Logo"
            className="h-7 w-auto object-contain md:hidden mix-blend-multiply shrink-0"
          />
          <h1 className="text-slate-900 font-bold text-base md:text-lg tracking-tight whitespace-nowrap">
            {pathname?.startsWith("/admin/hbs") ? (
              <>
                <span className="md:hidden">Hind Build Admin</span>
                <span className="hidden md:inline">{title}</span>
              </>
            ) : pathname?.startsWith("/admin/empanelment") ? (
              <>
                <span className="md:hidden">Vendor Portal</span>
                <span className="hidden md:inline">{title}</span>
              </>
            ) : (
              title
            )}
          </h1>
        </div>
      </div>

      {/* ── Right: Spotlight Search, Live Status, Interactive Notification Center & Profile ── */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Apple Spotlight Capsule Search Trigger */}
        <button
          onClick={() => setIsSpotlightOpen(true)}
          type="button"
          aria-label="Open Spotlight Search"
          title="Search pages and portals (Ctrl + K)"
          className="hidden lg:flex items-center gap-2 bg-slate-100/70 hover:bg-slate-100/90 rounded-full px-3.5 py-1.5 border border-slate-200/60 w-44 xl:w-56 transition-all duration-200 backdrop-blur-md cursor-pointer text-left group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
          <span className="text-xs text-slate-400 group-hover:text-slate-600 truncate flex-1">
            Search command...
          </span>
          <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white border border-slate-200/80 rounded shadow-3xs shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Live Operational Status Capsule */}
        <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>3 Portals Online</span>
        </div>

        {/* ── Interactive Notification Center Popover ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="View notifications"
            className="relative w-9 h-9 rounded-xl bg-white/80 hover:bg-white border border-slate-200/70 flex items-center justify-center hover:text-slate-900 transition-all text-slate-500 shadow-2xs cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-construction-red rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Apple Frosted Notification Center Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    HQ Notifications
                  </p>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                {/* Notification 1: HiPRO Quote */}
                <Link
                  href="/admin/quotes"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-3 transition-colors block"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">New Civil Quote Request</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">Industrial PEB shed construction in Bhilwara</p>
                    <span className="text-[10px] text-slate-400 font-mono">5 mins ago · HiPRO</span>
                  </div>
                </Link>

                {/* Notification 2: HBS Lead */}
                <Link
                  href="/admin/hbs/leads"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-3 transition-colors block"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">New Waterproofing Lead</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">Basement crack repair & injection grouting</p>
                    <span className="text-[10px] text-slate-400 font-mono">22 mins ago · HBS</span>
                  </div>
                </Link>

                {/* Notification 3: Vendor KYC */}
                <Link
                  href="/admin/empanelment/applications"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-3 transition-colors block"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">Contractor KYC Submitted</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">Class-B Civil Subcontractor vetting required</p>
                    <span className="text-[10px] text-slate-400 font-mono">1 hr ago · Vendor Hub</span>
                  </div>
                </Link>

                {/* Notification 4: 2FA */}
                <Link
                  href="/admin/security"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-3 transition-colors block"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">2FA Vault Operational</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">RFC 6238 TOTP two-factor security is active</p>
                    <span className="text-[10px] text-emerald-600 font-mono">Protected · Master HQ</span>
                  </div>
                </Link>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">Hindustan Group Master HQ</span>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Apple Glass Pill */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="relative w-9 h-9 rounded-xl bg-white/80 hover:bg-red-50 border border-slate-200/70 hover:border-red-200 flex items-center justify-center hover:text-red-600 transition-all text-slate-500 shadow-2xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center font-bold text-xs uppercase tracking-wider shadow-xs ring-1 ring-black/5">
            M
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">Master Admin</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">HOLDING HQ</p>
          </div>
        </div>
      </div>

      <AdminSpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />
    </header>
  );
}
