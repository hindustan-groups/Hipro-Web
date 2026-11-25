"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  Inbox,
  FileText,
  Mail,
  Briefcase,
  Send,
  FolderOpen,
  HardHat,
  BookOpen,
  Star,
  Users,
  LayoutTemplate,
  Info,
  MapPin,
  Settings,
  ShieldCheck,
  ExternalLink,
  Search,
  X,
  Layers,
  Calculator,
  Sparkles,
  Palette,
  GalleryHorizontalEnd,
  LogOut,
  Phone,
  Globe,
  Flame,
  KeyRound,
  ArrowLeft,
  Building2,
  Compass,
  PanelLeftClose,
  PanelLeft,
  Database,
  ArrowDownUp,
} from "lucide-react";

export interface SubNavItem {
  href: string;
  label: string;
  badge?: string;
  tabKey?: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  sectionKey?: string;
  subItems?: SubNavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// =========================================================================
// 1. MASTER HEADQUARTERS NAVIGATION (Clean, Uncluttered, Executive Scope)
// =========================================================================
export const MASTER_HQ_NAV_SECTIONS: NavSection[] = [
  {
    title: "COMPANY HEADQUARTERS",
    items: [
      { href: "/admin", label: "Master Cockpit", icon: LayoutDashboard, badge: "HQ", sectionKey: "dashboard" },
    ],
  },
  {
    title: "DIGITAL WEB ASSETS",
    items: [
      { href: "/admin/hipro", label: "HiPRO Corporate", icon: Building2, badge: "Web 1", sectionKey: "hipro" },
      { href: "/admin/hbs", label: "Hind Building (HBS)", icon: Flame, badge: "Web 2", sectionKey: "hbs" },
      { href: "/admin/empanelment", label: "Vendor Procurement", icon: ShieldCheck, badge: "Web 3", sectionKey: "empanelment" },
    ],
  },
  {
    title: "HOLDING TOOLS & DATA",
    items: [
      { href: "/admin/backup", label: "Database Backup Vault", icon: Database, badge: "Snapshots", sectionKey: "backup" },
      { href: "/admin/data-tools", label: "Data Import & Export", icon: ArrowDownUp, badge: "Universal", sectionKey: "data-tools" },
      { href: "/admin/api-keys", label: "API Keys & Secrets", icon: KeyRound, badge: "Vault", sectionKey: "api-keys" },
    ],
  },
  {
    title: "GLOBAL OPERATIONS",
    items: [
      { href: "/admin/automail", label: "AutoMail Studio", icon: Send, badge: "Global", sectionKey: "automail" },
      { href: "/admin/security", label: "Security & 2FA Vault", icon: ShieldCheck, badge: "2FA", sectionKey: "security" },
      { href: "/admin/users", label: "Staff & Roles (RBAC)", icon: Users, badge: "RBAC", sectionKey: "users" },
      { href: "/admin/hq-settings", label: "Master HQ Settings", icon: Settings, badge: "HQ", sectionKey: "hq-settings" },
    ],
  },
];

// =========================================================================
// 2. HiPRO CORPORATE WEB NAVIGATION (Isolated Civil & Mega Infrastructure)
// =========================================================================
export const HIPRO_NAV_SECTIONS: NavSection[] = [
  {
    title: "HIPRO OVERVIEW",
    items: [
      { href: "/admin/hipro", label: "HiPRO Control Center", icon: LayoutDashboard, badge: "HiPRO", sectionKey: "hipro" },
    ],
  },
  {
    title: "PORTFOLIO & CONTENT",
    items: [
      { href: "/admin/projects", label: "Projects Portfolio", icon: FolderOpen, sectionKey: "projects" },
      { href: "/admin/services", label: "Civil Services", icon: HardHat, sectionKey: "services" },
      { href: "/admin/blogs", label: "Blog Insights", icon: BookOpen, sectionKey: "blogs" },
      { href: "/admin/testimonials", label: "Client Reviews", icon: Star, sectionKey: "testimonials" },
      { href: "/admin/team", label: "Leadership & Team", icon: Users, sectionKey: "team" },
    ],
  },
  {
    title: "INQUIRIES & FUNNEL",
    items: [
      { href: "/admin/quotes", label: "Quotes Pipeline", icon: FileText, badge: "Live", sectionKey: "quotes" },
      { href: "/admin/contacts", label: "Direct Inquiries", icon: Mail, sectionKey: "contacts" },
      { href: "/admin/applications", label: "Job Applications", icon: Briefcase, sectionKey: "applications" },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail, sectionKey: "newsletter" },
    ],
  },
  {
    title: "PAGE BUILDER & CMS",
    items: [
      { href: "/admin/hero", label: "Hero Banner", icon: LayoutTemplate, sectionKey: "hero" },
      { href: "/admin/stats", label: "Homepage KPI Counters", icon: BarChart2, sectionKey: "stats" },
      { href: "/admin/about", label: "About Page", icon: Info, sectionKey: "about" },
      { href: "/admin/cost-estimator", label: "Cost Estimator CMS", icon: Calculator, sectionKey: "cost-estimator" },
      { href: "/admin/contact-page", label: "Contact Page CMS", icon: MapPin, sectionKey: "contact-page" },
      { href: "/admin/image-showcase", label: "Image Showcase", icon: Sparkles, sectionKey: "image-showcase" },
      { href: "/admin/navigation", label: "Navigation Menus", icon: Compass, sectionKey: "navigation" },
      { href: "/admin/settings", label: "Site Settings CMS", icon: Settings, sectionKey: "settings" },
    ],
  },
];

// =========================================================================
// 3. HIND BUILDING SOLUTIONS (HBS) NAVIGATION (Isolated Waterproofing & BOQ)
// =========================================================================
export const HBS_NAV_SECTIONS: NavSection[] = [
  {
    title: "HBS OVERVIEW",
    items: [
      { href: "/admin/hbs", label: "HBS Control Center", icon: LayoutDashboard, sectionKey: "hbs" },
    ],
  },
  {
    title: "INQUIRIES & LEADS",
    items: [
      { href: "/admin/hbs/leads", label: "Customer Leads", icon: Inbox, badge: "Live", sectionKey: "hbs" },
    ],
  },
  {
    title: "CATALOG & REPAIRS",
    items: [
      { href: "/admin/hbs/services", label: "Waterproofing Specs", icon: HardHat, sectionKey: "hbs" },
      { href: "/admin/hbs/projects", label: "Repair Case Studies", icon: FolderOpen, sectionKey: "hbs" },
      { href: "/admin/hbs/testimonials", label: "Client Reviews", icon: Star, sectionKey: "hbs" },
    ],
  },
  {
    title: "PAGE BUILDER & BRANDING",
    items: [
      { href: "/admin/hbs/home", label: "HBS Homepage CMS", icon: LayoutTemplate, sectionKey: "hbs" },
      { href: "/admin/hbs/about", label: "About Page", icon: Info, sectionKey: "hbs" },
      { href: "/admin/hbs/why-choose-us", label: "Why Choose Us & FAQs", icon: ShieldCheck, sectionKey: "hbs" },
      { href: "/admin/hbs/branding", label: "Brand & Logos", icon: Palette, sectionKey: "hbs" },
      { href: "/admin/hbs/seo", label: "SEO & Metadata", icon: Compass, sectionKey: "hbs" },
      { href: "/admin/hbs/settings", label: "Settings & Hotlines", icon: Settings, sectionKey: "hbs" },
    ],
  },
];

// =========================================================================
// 4. VENDOR EMPANELMENT NAVIGATION (Isolated Procurement, Tenders & PVC)
// =========================================================================
export const EMPANELMENT_NAV_SECTIONS: NavSection[] = [
  {
    title: "PROCUREMENT OVERVIEW",
    items: [
      { href: "/admin/empanelment", label: "Vendor Hub Overview", icon: LayoutDashboard, sectionKey: "empanelment" },
    ],
  },
  {
    title: "CONTRACTORS & KYC",
    items: [
      { href: "/admin/empanelment/applications", label: "Applications Pipeline", icon: Inbox, badge: "KYC", sectionKey: "empanelment" },
      { href: "/admin/empanelment/directory", label: "Partner Directory & PVC", icon: Users, sectionKey: "empanelment" },
      { href: "/admin/empanelment/categories", label: "Trade Categories", icon: Layers, sectionKey: "empanelment" },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { href: "/admin/empanelment/tenders", label: "Tenders & Bids", icon: Briefcase, badge: "Live", sectionKey: "empanelment" },
      { href: "/admin/empanelment/work-orders", label: "Work Orders & Billing", icon: FileText, sectionKey: "empanelment" },
      { href: "/admin/empanelment/gate-passes", label: "Site Gate Passes", icon: ShieldCheck, sectionKey: "empanelment" },
    ],
  },
  {
    title: "STUDIO & DESK",
    items: [
      { href: "/admin/empanelment/content", label: "Portal CMS", icon: LayoutTemplate, sectionKey: "empanelment" },
      { href: "/admin/empanelment/tickets", label: "Support Desk", icon: Mail, sectionKey: "empanelment" },
    ],
  },
];

export default function AdminSidebar({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved === "true") {
        setIsDesktopCollapsed(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const userPermissions = useMemo<string[]>(() => {
    if (Array.isArray(user?.permissions)) {
      return user.permissions;
    } else if (typeof user?.permissions === "string") {
      try {
        return JSON.parse(user.permissions);
      } catch {
        return [];
      }
    }
    return [];
  }, [user?.permissions]);

  const isAdmin = user?.role === "admin";

  const checkAccess = useCallback(
    (href: string, sectionKey?: string) => {
      if (isAdmin) return true;
      const key = sectionKey || href.split("/")[2] || "dashboard";
      if (key === "dashboard") return true;
      if (key === "leads") return userPermissions.includes("leads");
      if (key === "automail") return userPermissions.includes("automail");
      if (key.startsWith("hbs") && (userPermissions.includes("hbs") || userPermissions.includes(key))) return true;
      if (key.startsWith("empanelment") && (userPermissions.includes("empanelment") || userPermissions.includes(key))) return true;
      if (userPermissions.includes(key)) return true;
      return false;
    },
    [isAdmin, userPermissions]
  );

  useEffect(() => {
    const handleToggle = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsOpen((prev) => !prev);
      } else {
        setIsDesktopCollapsed((prev) => {
          const next = !prev;
          try {
            localStorage.setItem("admin_sidebar_collapsed", String(next));
          } catch {
            // Ignore
          }
          return next;
        });
      }
    };
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-admin-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        window.dispatchEvent(new Event("toggle-admin-sidebar"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Determine Active Mode with Strict Separation
  const isEmpanelment = pathname?.startsWith("/admin/empanelment");
  const isHbs = pathname?.startsWith("/admin/hbs");
  const isHipro =
    !isEmpanelment &&
    !isHbs &&
    (pathname?.startsWith("/admin/hipro") ||
      pathname === "/admin/projects" ||
      pathname?.startsWith("/admin/projects/") ||
      pathname === "/admin/services" ||
      pathname?.startsWith("/admin/services/") ||
      pathname === "/admin/quotes" ||
      pathname?.startsWith("/admin/quotes/") ||
      pathname === "/admin/contacts" ||
      pathname?.startsWith("/admin/contacts/") ||
      pathname === "/admin/applications" ||
      pathname?.startsWith("/admin/applications/") ||
      pathname === "/admin/blogs" ||
      pathname?.startsWith("/admin/blogs/") ||
      pathname === "/admin/hero" ||
      pathname === "/admin/about" ||
      pathname === "/admin/contact-page" ||
      pathname === "/admin/cost-estimator" ||
      pathname === "/admin/image-showcase" ||
      pathname === "/admin/projects-hero" ||
      pathname === "/admin/blogs-hero" ||
      pathname === "/admin/jobs" ||
      pathname === "/admin/cta-management" ||
      pathname === "/admin/navigation" ||
      pathname === "/admin/testimonials" ||
      pathname === "/admin/team" ||
      pathname === "/admin/newsletter" ||
      pathname === "/admin/leads" ||
      pathname === "/admin/stats" ||
      pathname === "/admin/settings");

  // Select the appropriate navigation structure
  const activeSections = useMemo(() => {
    if (isEmpanelment) return EMPANELMENT_NAV_SECTIONS;
    if (isHbs) return HBS_NAV_SECTIONS;
    if (isHipro) return HIPRO_NAV_SECTIONS;
    return MASTER_HQ_NAV_SECTIONS; // Default for /admin, /admin/automail, /admin/users, /admin/security
  }, [isEmpanelment, isHbs, isHipro]);

  // Filter items by search query and permissions
  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeSections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter((item) => {
          if (!checkAccess(item.href, item.sectionKey)) return false;
          if (!q) return true;
          return item.label.toLowerCase().includes(q) || sec.title.toLowerCase().includes(q);
        }),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [activeSections, searchQuery, checkAccess]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin-login";
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 md:z-20 bg-white/80 backdrop-blur-2xl border-r border-slate-200/70 flex flex-col h-full shadow-[4px_0_24px_rgba(15,23,42,0.03)] transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0 "
        } ${
          isDesktopCollapsed
            ? "md:w-0 md:opacity-0 md:pointer-events-none md:border-r-0 overflow-hidden"
            : "md:w-72 md:opacity-100 shrink-0"
        }`}
      >
        {/* ── HEADER ACCORDING TO ACTIVE MODE (Apple Squircle Aesthetics) ── */}
        {isEmpanelment ? (
          // Mode: Empanelment Hub
          <div className="p-4 border-b border-slate-200/60 bg-gradient-to-b from-amber-50/60 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <Link
                href="/admin"
                scroll={false}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-amber-200/80 text-[11px] font-bold text-amber-900 hover:bg-white hover:shadow-2xs transition-all group shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to Master HQ</span>
              </Link>
              <button
                onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
                className="p-1 rounded-lg text-amber-700 hover:bg-amber-100/60 transition-colors cursor-pointer"
                title="Collapse Sidebar (Ctrl + B)"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-amber-600/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-tight text-slate-900 font-display truncate">Vendor Procurement</p>
                <p className="text-[10px] text-amber-700 font-bold font-mono">KYC & Tenders Hub</p>
              </div>
            </div>
          </div>
        ) : isHbs ? (
          // Mode: Hind Building Solutions
          <div className="p-4 border-b border-slate-200/60 bg-gradient-to-b from-orange-50/60 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <Link
                href="/admin"
                scroll={false}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-orange-200/80 text-[11px] font-bold text-orange-900 hover:bg-white hover:shadow-2xs transition-all group shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to Master HQ</span>
              </Link>
              <button
                onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
                className="p-1 rounded-lg text-orange-700 hover:bg-orange-100/60 transition-colors cursor-pointer"
                title="Collapse Sidebar (Ctrl + B)"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-orange-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hibuild-logo.png" alt="Hind Building" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-tight text-slate-900 font-display truncate">Hind Building (HBS)</p>
                <p className="text-[10px] text-orange-700 font-bold font-mono">Repair & BOQ Studio</p>
              </div>
            </div>
          </div>
        ) : isHipro ? (
          // Mode: HiPRO Corporate Site Manager
          <div className="p-4 border-b border-slate-200/60 bg-gradient-to-b from-blue-50/60 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <Link
                href="/admin"
                scroll={false}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-blue-200/80 text-[11px] font-bold text-blue-900 hover:bg-white hover:shadow-2xs transition-all group shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to Master HQ</span>
              </Link>
              <button
                onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
                className="p-1 rounded-lg text-blue-700 hover:bg-blue-100/60 transition-colors cursor-pointer"
                title="Collapse Sidebar (Ctrl + B)"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0F2C59] to-[#0B2545] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-blue-900/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-tight text-slate-900 font-display truncate">HiPRO Corporate</p>
                <p className="text-[10px] text-blue-700 font-bold font-mono">Site & CMS Studio</p>
              </div>
            </div>
          </div>
        ) : (
          // Mode: Master Company Headquarters (Login Default)
          <div className="h-[72px] px-4 border-b border-slate-200/60 flex items-center justify-between bg-white/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-200/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="HiPRO" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 font-black text-xs uppercase tracking-wider font-display truncate">
                  Hindustan Group
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-construction-navy font-black text-[10px] uppercase tracking-widest font-mono">
                    HQ Cockpit
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase font-mono rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    3 Portals
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Collapse Sidebar (Ctrl + B)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Apple Spotlight Search Filter */}
        <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/40">
          <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all duration-200">
            <Search className="w-3.5 h-3.5 text-slate-400 pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search..."
              className="w-full bg-transparent text-[11px] font-medium text-slate-800 placeholder-slate-400 pl-2 pr-4 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── NAVIGATION LIST (Apple iPadOS Sidebar Pill Items) ── */}
        <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono select-none">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon, badge }) => {
                  const [pathOnly, queryString] = href.split("?");
                  const targetBrand = queryString ? new URLSearchParams(queryString).get("brand") : null;
                  const active = targetBrand
                    ? pathname === pathOnly && searchParams?.get("brand") === targetBrand
                    : pathname === href;

                  return (
                    <Link
                      key={href}
                      href={href}
                      scroll={false}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 min-h-[38px] group ${
                        active
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                          }`}
                        />
                        <span className="truncate">{label}</span>
                      </div>
                      {badge && (
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-slate-200/60 text-slate-600 border border-slate-200/80 group-hover:bg-slate-200"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── FOOTER: APPLE PROFILE / SIGNOUT CHIP ────────────── */}
        <div className="p-3 border-t border-slate-200/70 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/80 hover:bg-rose-50/80 border border-slate-200/70 hover:border-rose-200 transition-all text-xs font-semibold text-slate-600 hover:text-rose-700 shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-600" />
              </div>
              <span>Sign Out</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono font-normal">v2.0</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/**
 * High-performance, lightweight navigation progress indicator.
 * Provides instant visual feedback on link click matching Master Admin brand colors.
 */
export function AdminNavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setIsNavigating(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isNavigating]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;

      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin === window.location.origin && url.pathname.startsWith("/admin")) {
          const currentUrl = window.location.pathname + window.location.search;
          const targetUrl = url.pathname + url.search;
          if (currentUrl !== targetUrl) {
            setIsNavigating(true);
            setVisible(true);
            setProgress(25);
          }
        }
      } catch {
        // Safe fallback
      }
    };

    window.addEventListener("click", handleLinkClick, { capture: true });
    return () => window.removeEventListener("click", handleLinkClick, { capture: true });
  }, []);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Navigation progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[99999] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-construction-navy via-[#0D50B8] to-construction-red transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
