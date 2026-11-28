"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  QrCode,
  FolderOpen,
  Building2,
  Clock,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink,
  User,
  AlertCircle,
} from "lucide-react";
import { VendorPortalContext, VendorPortalUser, vendorFetch } from "./context";

export default function VendorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [vendor, setVendor] = useState<VendorPortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gatePassEnabled, setGatePassEnabled] = useState(false);

  const fetchVendorProfile = async () => {
    try {
      const res = await vendorFetch("/api/vendor/auth/me", {
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace(`/empanelment/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        throw new Error("Failed to load profile");
      }

      const json = await res.json();
      if (json.success && json.data) {
        setVendor(json.data);
      }
    } catch (_err) {
      // In case of network glitch or unauthorized
      router.replace(`/empanelment/login?redirect=${encodeURIComponent(pathname)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
    fetch("/api/empanelment/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setGatePassEnabled(Boolean(j?.content?.gatePassEnabled)))
      .catch(() => setGatePassEnabled(false));
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await vendorFetch("/api/vendor/auth/logout", {
        method: "POST",
      });
      localStorage.removeItem("vendor_token");
      localStorage.removeItem("vendor_account");
      localStorage.removeItem("hipro_vendor_token");
    } catch (_e) {}
    router.replace("/empanelment/login");
  };

  const navItems = [
    {
      href: "/empanelment/portal",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/empanelment/portal/tenders",
      label: "Live Tenders & Bids",
      icon: FileCheck2,
    },
    ...(gatePassEnabled
      ? [
          {
            href: "/empanelment/portal/gate-pass",
            label: "Daily Site Gate Pass",
            icon: QrCode,
          },
        ]
      : []),
    {
      href: "/empanelment/portal/documents",
      label: "Document Vault",
      icon: FolderOpen,
    },
    {
      href: "/empanelment/portal/profile",
      label: "Company Profile",
      icon: Building2,
    },
    {
      href: "/empanelment/portal/activity",
      label: "Audit Timeline",
      icon: Clock,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-red-200 border-t-[#dc2626] rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading Vendor Portal...
          </p>
        </div>
      </div>
    );
  }

  const app = vendor?.application;
  const isDocsRequested = app?.status === "DOCS_REQUESTED";

  return (
    <VendorPortalContext.Provider
      value={{
        vendor,
        loading,
        refreshVendor: fetchVendorProfile,
        logout: handleLogout,
      }}
    >
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased selection:bg-red-100 selection:text-red-900">
        {/* ============================================================== */}
        {/* MOBILE HEADER (Fixed top for 360px - 768px) */}
        {/* ============================================================== */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
          <Link href="/empanelment/portal" className="flex flex-col min-w-0">
            <span className="font-black text-sm text-slate-950 tracking-tight leading-none">
              HiPRO <span className="text-[#dc2626]">PORTAL</span>
            </span>
            <span className="text-[10px] text-slate-500 truncate max-w-[190px] mt-0.5">
              {app?.companyName || vendor?.email}
            </span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                app?.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : app?.status === "DOCS_REQUESTED"
                  ? "bg-purple-100 text-purple-800 animate-pulse"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {app?.status || "ACTIVE"}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -mr-1 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="fixed inset-y-0 right-0 w-72 max-w-[82vw] bg-white shadow-2xl p-5 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[#dc2626]" />
                    <span className="font-black text-base tracking-tight text-slate-950">
                      HiPRO <span className="text-[#dc2626]">VENDOR</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Company Mini Card */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="font-bold text-xs text-slate-900 truncate">
                    {app?.companyName || "Vendor Account"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                    {app?.trackingId || vendor?.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                      {app?.tier?.replace("_", " ") || "CLASS C"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-[#dc2626] truncate max-w-[120px]">
                      {app?.category || "General"}
                    </span>
                  </div>
                </div>

                {/* Mobile Links */}
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const active = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          active
                            ? "bg-[#dc2626] text-white shadow-xs"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {item.href === "/empanelment/portal/documents" && isDocsRequested && (
                          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Link
                  href="/empanelment"
                  className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <span>Empanelment Homepage</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* DESKTOP SIDEBAR (768px+) */}
        {/* ============================================================== */}
        <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-white border-r border-slate-200/90 h-screen sticky top-0 shrink-0 p-5 z-20">
          <div className="space-y-6">
            {/* Brand Logo */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <Link href="/empanelment/portal" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-[#dc2626] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm lg:text-base text-slate-950 tracking-tight leading-tight">
                    HiPRO <span className="text-[#dc2626]">PORTAL</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Vendor Partner System
                  </span>
                </div>
              </Link>
            </div>

            {/* Vendor Company Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-amber-300 font-bold uppercase tracking-wider truncate max-w-[140px]">
                  {app?.trackingId || "VENDOR"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                    app?.status === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : app?.status === "DOCS_REQUESTED"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {app?.status || "ACTIVE"}
                </span>
              </div>
              <p className="font-bold text-xs text-white line-clamp-1">
                {app?.companyName || "Vendor Enterprise"}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-300 border-t border-slate-800">
                <span className="font-medium truncate max-w-[100px]">{app?.category || "Contractor"}</span>
                <span className="font-bold text-amber-400">{app?.tier?.replace("_", " ") || "CLASS C"}</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? "bg-[#dc2626] text-white shadow-xs shadow-red-600/20 translate-x-1"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.href === "/empanelment/portal/documents" && isDocsRequested && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                        Action
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Footer Actions */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link
              href="/empanelment"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <span>Empanelment Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* MAIN CONTENT AREA */}
        {/* ============================================================== */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {/* Action Banner if Documents are Requested */}
          {isDocsRequested && (
            <div className="bg-purple-600 text-white px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
                <span className="font-bold">
                  Action Required: Document Revision Requested by HiPRO Procurement Review Team.
                </span>
              </div>
              <Link
                href="/empanelment/portal/documents"
                className="px-3 py-1 bg-white text-purple-900 rounded-lg font-bold text-[11px] hover:bg-purple-50 transition-colors shrink-0 shadow-2xs"
              >
                Upload Documents &rarr;
              </Link>
            </div>
          )}

          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </VendorPortalContext.Provider>
  );
}
