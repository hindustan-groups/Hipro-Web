"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
      { href: "/admin", label: "Master Dashboard", icon: LayoutDashboard, badge: "HQ", sectionKey: "dashboard" },
      { href: "/admin/stats", label: "Global Analytics", icon: BarChart2, sectionKey: "stats" },
    ],
  },
  {
    title: "DIGITAL WEB ASSETS (SELECT TO MANAGE)",
    items: [
      { href: "/admin/projects", label: "1. HiPRO Corporate Web", icon: Building2, badge: "Civil", sectionKey: "projects" },
      { href: "/admin/hbs", label: "2. Hind Building (HBS)", icon: Flame, badge: "Repair", sectionKey: "hbs" },
      { href: "/admin/empanelment", label: "3. Vendor Procurement Hub", icon: ShieldCheck, badge: "KYC", sectionKey: "empanelment" },
    ],
  },
  {
    title: "GLOBAL OPERATIONS",
    items: [
      { href: "/admin/automail", label: "AutoMail Studio", icon: Send, badge: "Global", sectionKey: "automail" },
      { href: "/admin/settings", label: "Security & 2FA", icon: KeyRound, badge: "2FA", sectionKey: "settings" },
      { href: "/admin/users", label: "Staff & Roles (RBAC)", icon: Users, sectionKey: "users" },
      { href: "/admin/settings?tab=contact", label: "Company Profile", icon: Settings, sectionKey: "settings" },
    ],
  },
];

// =========================================================================
// 2. HiPRO CORPORATE WEB NAVIGATION (Isolated Civil & Mega Infrastructure)
// =========================================================================
export const HIPRO_NAV_SECTIONS: NavSection[] = [
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
      { href: "/admin/about", label: "About Page", icon: Info, sectionKey: "about" },
      { href: "/admin/cost-estimator", label: "Cost Estimator CMS", icon: Calculator, sectionKey: "cost-estimator" },
      { href: "/admin/contact-page", label: "Contact Page CMS", icon: MapPin, sectionKey: "contact-page" },
      { href: "/admin/image-showcase", label: "Image Showcase", icon: Sparkles, sectionKey: "image-showcase" },
      { href: "/admin/navigation", label: "Navigation Menus", icon: Compass, sectionKey: "navigation" },
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
      { href: "/admin/automail?brand=hbs", label: "AutoMail Studio", icon: Send, badge: "HBS", sectionKey: "automail" },
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
      { href: "/admin/hbs/settings?tab=contact", label: "Hotlines & WhatsApp", icon: Phone, sectionKey: "hbs" },
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
      { href: "/admin/automail?brand=empanelment", label: "AutoMail Studio", icon: Send, badge: "Auto", sectionKey: "automail" },
    ],
  },
];

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      if (key.startsWith("hbs") && (userPermissions.includes("hbs") || userPermissions.includes(key))) return true;
      if (key.startsWith("empanelment") && (userPermissions.includes("empanelment") || userPermissions.includes(key))) return true;
      if (userPermissions.includes(key)) return true;
      return false;
    },
    [isAdmin, userPermissions]
  );

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-admin-sidebar", handleToggle);
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
    (pathname === "/admin/projects" ||
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
      pathname === "/admin/leads");

  // Select the appropriate navigation structure
  const activeSections = useMemo(() => {
    if (isEmpanelment) return EMPANELMENT_NAV_SECTIONS;
    if (isHbs) return HBS_NAV_SECTIONS;
    if (isHipro) return HIPRO_NAV_SECTIONS;
    return MASTER_HQ_NAV_SECTIONS; // Default for /admin, /admin/stats, /admin/automail, /admin/users, /admin/settings
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 md:z-20 w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-[4px_0_24px_rgba(15,23,42,0.02)] transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* ── HEADER ACCORDING TO ACTIVE MODE ──────────────────── */}
        {isEmpanelment ? (
          // Mode: Empanelment Hub
          <div className="p-4 border-b border-slate-100 bg-amber-50/40">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 hover:text-amber-950 transition-colors mb-2 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to Master HQ</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-tight text-slate-900 font-display">Vendor Procurement</p>
                <p className="text-[10px] text-amber-700 font-semibold font-mono">KYC & Tenders Hub</p>
              </div>
            </div>
          </div>
        ) : isHbs ? (
          // Mode: Hind Building Solutions
          <div className="p-4 border-b border-slate-100 bg-orange-50/40">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-800 hover:text-orange-950 transition-colors mb-2 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to Master HQ</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-tight text-slate-900 font-display">Hind Building (HBS)</p>
                <p className="text-[10px] text-orange-700 font-semibold font-mono">Repair & BOQ Studio</p>
              </div>
            </div>
          </div>
        ) : isHipro ? (
          // Mode: HiPRO Corporate Site Manager
          <div className="p-4 border-b border-slate-100 bg-blue-50/40">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-800 hover:text-blue-950 transition-colors mb-2 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to Master HQ</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-construction-navy text-white flex items-center justify-center font-bold text-xs shadow-xs border border-construction-red/40">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-tight text-slate-900 font-display">HiPRO Corporate</p>
                <p className="text-[10px] text-blue-700 font-semibold font-mono">Site & CMS Studio</p>
              </div>
            </div>
          </div>
        ) : (
          // Mode: Master Company Headquarters (Login Default)
          <div className="h-16 px-4 border-b border-slate-100 flex items-center gap-3 bg-white">
            <div className="h-9 w-9 bg-construction-navy p-1 flex items-center justify-center shrink-0 border border-construction-red/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="HiPRO" className="h-full w-full object-contain mix-blend-multiply bg-white" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 font-black text-xs uppercase tracking-wider font-display truncate">
                Hindustan Group
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-construction-navy font-extrabold text-[10px] uppercase tracking-widest font-mono">
                  Master HQ
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase font-mono border border-emerald-200">
                  3 Portals
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search Filter */}
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections..."
              className="w-full bg-white text-[11px] font-medium text-slate-800 placeholder-slate-400 pl-8 pr-7 py-1.5 border border-slate-200 rounded-none focus:outline-none focus:border-construction-navy transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── NAVIGATION LIST ─────────────────────────────────── */}
        <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono select-none">
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
                      prefetch={true}
                      className={`flex items-center justify-between px-3 py-2 rounded-none text-xs transition-colors min-h-[36px] ${
                        active
                          ? "bg-construction-navy text-white font-bold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
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
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
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

        {/* ── FOOTER: LOGOUT ──────────────────────────────────── */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
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
