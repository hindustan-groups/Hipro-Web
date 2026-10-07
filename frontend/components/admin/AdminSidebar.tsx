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
  Megaphone,
  Compass,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronRight,
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

export interface HbsNavSection {
  title: string;
  items: NavItem[];
}

export const HBS_NAV_SECTIONS: HbsNavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { href: "/admin/hbs", label: "Dashboard Overview", icon: LayoutDashboard },
    ],
  },
  {
    title: "CLIENT CRM & PIPELINE",
    items: [
      { href: "/admin/hbs/leads", label: "Customer Leads & CRM", icon: Inbox, badge: "Pipeline" },
    ],
  },
  {
    title: "HOMEPAGE SECTIONS",
    items: [
      {
        href: "/admin/hbs/home",
        label: "Home Page (8 Sections)",
        icon: LayoutTemplate,
        badge: "8 Sec",
        subItems: [
          { href: "/admin/hbs/home?tab=hero", label: "1. Hero Banner", tabKey: "hero" },
          { href: "/admin/hbs/home?tab=categories", label: "2. Categories Ribbon (5)", tabKey: "categories" },
          { href: "/admin/hbs/home?tab=services_showcase", label: "3. Services Showcase", tabKey: "services_showcase" },
          { href: "/admin/hbs/home?tab=about_preview", label: "4. About & Bento Collage", tabKey: "about_preview" },
          { href: "/admin/hbs/home?tab=stats", label: "5. 4 Stat Counters", tabKey: "stats" },
          { href: "/admin/hbs/home?tab=benefits", label: "6. Why Choose Us (6)", tabKey: "benefits" },
          { href: "/admin/hbs/home?tab=projects_showcase", label: "7. Projects Showcase", tabKey: "projects_showcase" },
          { href: "/admin/hbs/home?tab=prefooter_cta", label: "8. Pre-Footer Master CTA", tabKey: "prefooter_cta" },
        ],
      },
    ],
  },
  {
    title: "HEADER & FOOTER",
    items: [
      { href: "/admin/hbs/settings?tab=navbar", label: "Header & Navbar CMS", icon: Compass, badge: "Nav" },
      { href: "/admin/hbs/settings?tab=footer", label: "Footer & Legal CMS", icon: MapPin, badge: "4 Cols" },
    ],
  },
  {
    title: "PAGES & CATALOG",
    items: [
      { href: "/admin/hbs/about", label: "About Page CMS", icon: Info },
      { href: "/admin/hbs/why-choose-us", label: "Why Choose Us & FAQs", icon: ShieldCheck },
      { href: "/admin/hbs/services", label: "19 Services Catalog", icon: HardHat, badge: "19" },
      { href: "/admin/hbs/projects", label: "Projects / Case Studies", icon: FolderOpen },
      { href: "/admin/hbs/testimonials", label: "Client Reviews", icon: Star },
    ],
  },
  {
    title: "SETTINGS & BRANDING",
    items: [
      { href: "/admin/hbs/branding", label: "Logos & Brand Identity", icon: Palette },
      { href: "/admin/hbs/settings?tab=contact", label: "Hotlines, WhatsApp & Hours", icon: Phone },
      { href: "/admin/hbs/seo", label: "SEO & Social Meta", icon: Globe },
      { href: "/admin/hbs/media", label: "Media & Asset Library", icon: GalleryHorizontalEnd },
    ],
  },
];

export interface NavCategory {
  id: string;
  title: string;
  items: NavItem[];
}

const navCategories: NavCategory[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, sectionKey: "dashboard" },
      { href: "/admin/stats", label: "Site Analytics", icon: BarChart2, sectionKey: "stats" },
    ],
  },
  {
    id: "crm",
    title: "Leads & CRM",
    items: [
      { href: "/admin/leads", label: "Leads Hub", icon: Inbox, badge: "All", sectionKey: "leads" },
      { href: "/admin/quotes", label: "Quote Requests", icon: FileText, sectionKey: "quotes" },
      { href: "/admin/contacts", label: "Contact Inquiries", icon: Mail, sectionKey: "contacts" },
      { href: "/admin/applications", label: "Job Applications", icon: Briefcase, sectionKey: "applications" },
      { href: "/admin/newsletter", label: "Newsletter", icon: Send, sectionKey: "newsletter" },
    ],
  },
  {
    id: "content",
    title: "Content & Portfolio",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderOpen, sectionKey: "projects" },
      { href: "/admin/services", label: "Services", icon: HardHat, sectionKey: "services" },
      { href: "/admin/blogs", label: "Blog Articles", icon: BookOpen, sectionKey: "blogs" },
      { href: "/admin/testimonials", label: "Client Reviews", icon: Star, sectionKey: "testimonials" },
      { href: "/admin/team", label: "Team Members", icon: Users, sectionKey: "team" },
    ],
  },
  {
    id: "pages",
    title: "Pages & Site CMS",
    items: [
      { href: "/admin/hero", label: "Hero Banner", icon: LayoutTemplate, sectionKey: "hero" },
      { href: "/admin/image-showcase", label: "Image Showcase", icon: Sparkles, sectionKey: "image-showcase" },
      { href: "/admin/projects-hero", label: "Projects Page Hero", icon: Layers, sectionKey: "projects-hero" },
      { href: "/admin/blogs-hero", label: "Blogs Page Hero", icon: BookOpen, sectionKey: "blogs-hero" },
      { href: "/admin/about", label: "About Page", icon: Info, sectionKey: "about" },
      { href: "/admin/contact-page", label: "Contact Page CMS", icon: MapPin, sectionKey: "contact-page" },
      { href: "/admin/cost-estimator", label: "Cost Estimator CMS", icon: Calculator, sectionKey: "cost-estimator" },
      { href: "/admin/jobs", label: "Job Postings", icon: Briefcase, sectionKey: "jobs" },
      { href: "/admin/cta-management", label: "CTA Management", icon: Megaphone, sectionKey: "cta-management" },
      { href: "/admin/navigation", label: "Navigation Menus", icon: Compass, sectionKey: "navigation" },
    ],
  },
];

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Section collapsed state (default: all open)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const userPermissions = useMemo<string[]>(() => {
    if (Array.isArray(user?.permissions)) {
      return user.permissions;
    } else if (typeof user?.permissions === "string") {
      try {
        return JSON.parse(user.permissions);
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [user?.permissions]);

  const isAdmin = user?.role === "admin";

  const checkAccess = useCallback((href: string, sectionKey?: string) => {
    if (isAdmin) return true;
    const key = sectionKey || href.split("/")[2] || "dashboard";
    if (key === "dashboard") return true;
    if (key.startsWith("hbs") && (userPermissions.includes("hbs") || userPermissions.includes(key))) return true;
    if (userPermissions.includes(key)) return true;
    if (
      key === "projects-hero" &&
      (userPermissions.includes("projects-hero") ||
        userPermissions.includes("projects") ||
        userPermissions.includes("hero"))
    ) {
      return true;
    }
    if (
      key === "image-showcase" &&
      (userPermissions.includes("image-showcase") ||
        userPermissions.includes("hero") ||
        userPermissions.includes("settings") ||
        userPermissions.includes("projects"))
    ) {
      return true;
    }
    if (key === "leads") {
      return (
        userPermissions.includes("leads") ||
        userPermissions.includes("contacts") ||
        userPermissions.includes("quotes") ||
        userPermissions.includes("applications")
      );
    }
    return false;
  }, [isAdmin, userPermissions]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-admin-sidebar", handleToggle);
  }, []);

  // Close sidebar on route change in mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Filter items based on permissions and search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return navCategories
      .map((cat) => {
        const allowedItems = cat.items.filter((item) => {
          if (!checkAccess(item.href, item.sectionKey)) return false;
          if (!q) return true;
          return (
            item.label.toLowerCase().includes(q) ||
            cat.title.toLowerCase().includes(q)
          );
        });

        return {
          ...cat,
          items: allowedItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [searchQuery, checkAccess]);

  const totalVisibleTabs = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-white/75 backdrop-blur-2xl border-r border-white/80 flex flex-col h-full shadow-[4px_0_24px_rgba(15,23,42,0.03)] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {pathname?.startsWith("/admin/hbs") ? (
          <>
            {/* 1. Hind Build Admin Header (Frosted Glass) */}
            <div className="h-16 px-4 border-b border-white/80 flex items-center justify-between bg-white/50 backdrop-blur-md shrink-0">
              <Link href="/admin/hbs" className="flex items-center gap-2.5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hibuild-logo.png"
                  alt="HiBUILD"
                  className="h-9 w-auto object-contain group-hover:scale-[1.02] transition-transform"
                />
                <span className="text-[10px] bg-red-500/10 text-red-700 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border border-red-500/20 backdrop-blur-xs shadow-2xs">
                  CMS
                </span>
              </Link>
            </div>

            {/* 2. Dual Brand Switcher: HiPRO Master vs Hind Build CMS */}
            <div className="px-3 py-2.5 bg-slate-100/40 backdrop-blur-md border-b border-white/80">
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/50 backdrop-blur-md rounded-xl text-[11px] font-bold border border-white/60 shadow-inner">
                <Link
                  href="/admin"
                  className="py-1.5 px-2 text-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all flex items-center justify-center gap-1"
                >
                  <span>🏢 HiPRO</span>
                </Link>
                <Link
                  href="/admin/hbs"
                  className="py-1.5 px-2 text-center rounded-lg bg-gradient-to-r from-[#0D2D5E] to-[#123974] text-white shadow-md shadow-[#0D2D5E]/25 flex items-center justify-center gap-1 font-extrabold border border-blue-400/25"
                >
                  <span>🏗️ HiBUILD</span>
                </Link>
              </div>
            </div>

            {/* 3. Navigation Links (OVERVIEW, PAGES, HEADER & FOOTER, LEADS, SETTINGS) */}
            <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto">
              {HBS_NAV_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  <p className="px-2.5 text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400/90">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map(({ href, label, icon: Icon, badge, subItems }) => {
                      const [pathOnly, queryString] = href.split("?");
                      const targetTab = queryString ? new URLSearchParams(queryString).get("tab") : null;

                      let active = false;
                      if (targetTab) {
                        active =
                          pathname === pathOnly &&
                          (currentTab === targetTab ||
                            (!currentTab && targetTab === "navbar" && pathOnly === "/admin/hbs/settings"));
                      } else if (href === "/admin/hbs") {
                        active = pathname === "/admin/hbs";
                      } else {
                        active = pathname === pathOnly && !currentTab;
                      }

                      const isParentOfCurrent = pathname === pathOnly || pathname.startsWith(pathOnly + "/");

                      return (
                        <div key={href} className="space-y-0.5">
                          <Link
                            href={href}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[38px] ${
                              active && !subItems
                                ? "bg-gradient-to-r from-[#0D2D5E] via-[#0E356E] to-[#123E82] text-white font-bold shadow-md shadow-[#0D2D5E]/25 border border-white/20"
                                : isParentOfCurrent && subItems
                                ? "bg-white/80 backdrop-blur-md text-slate-900 font-extrabold border border-white/90 shadow-2xs"
                                : "text-slate-600 hover:text-slate-950 hover:bg-white/70 hover:backdrop-blur-xs hover:border hover:border-white/70"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  active && !subItems
                                    ? "text-red-400"
                                    : isParentOfCurrent && subItems
                                    ? "text-red-600"
                                    : "text-slate-400"
                                }`}
                              />
                              <span>{label}</span>
                            </div>
                            {badge && (
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                  active && !subItems
                                    ? "bg-red-500/25 text-white border border-red-400/30"
                                    : "backdrop-blur-xs bg-slate-100/80 text-slate-600 border border-slate-200/60"
                                }`}
                              >
                                {badge}
                              </span>
                            )}
                          </Link>

                          {/* Expandable Sub-items (All 8 Homepage Sections) */}
                          {subItems && isParentOfCurrent && (
                            <div className="pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-red-400/40 ml-4 my-1.5">
                              {subItems.map((sub) => {
                                const isSubActive =
                                  pathname === pathOnly &&
                                  (currentTab === sub.tabKey || (!currentTab && sub.tabKey === "hero"));

                                return (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                      isSubActive
                                        ? "bg-gradient-to-r from-[#0D2D5E] to-[#143973] text-white font-bold shadow-xs border border-white/20"
                                        : "text-slate-600 hover:text-slate-950 hover:bg-white/70 hover:backdrop-blur-xs"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          isSubActive ? "bg-red-400 animate-pulse shadow-xs" : "bg-slate-300"
                                        }`}
                                      />
                                      <span className="truncate">{sub.label}</span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* 4. Bottom System Controls */}
            <div className="p-3 border-t border-white/80 space-y-1 bg-white/40 backdrop-blur-xl shrink-0">
              <Link
                href="/hbs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-white/80 rounded-xl transition-all min-h-[38px] hover:shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Website</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">/hbs ↗</span>
              </Link>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", { method: "POST" });
                  } finally {
                    window.location.href = "/admin-login";
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-500/10 rounded-xl transition-all text-left min-h-[38px]"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Brand Header (Frosted Glass) */}
        <div className="h-16 px-5 border-b border-white/80 flex items-center justify-between bg-white/50 backdrop-blur-md shrink-0">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 shrink-0 bg-construction-navy border-2 border-construction-red flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <span className="text-white font-black text-xs tracking-tighter">Hi</span>
            </div>
            <div>
              <p className="text-slate-900 font-bold text-[13px] leading-tight uppercase tracking-wider font-display">
                Hindustan
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-construction-navy font-bold text-[10px] leading-tight uppercase tracking-widest font-display">
                  Projects
                </span>
                <span className="inline-block px-1.5 py-0.5 bg-construction-red/10 text-construction-red text-[8px] font-mono font-bold tracking-tight rounded-md border border-construction-red/20">
                  ADMIN
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Dual Brand Switcher: HiPRO Master vs Hind Build CMS */}
        <div className="px-3 py-2.5 bg-slate-100/40 backdrop-blur-md border-b border-white/80">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/50 backdrop-blur-md rounded-xl text-[11px] font-bold border border-white/60 shadow-inner">
            <Link
              href="/admin"
              className="py-1.5 px-2 text-center rounded-lg bg-white text-slate-900 shadow-xs flex items-center justify-center gap-1 font-bold border border-slate-200/60"
            >
              <span>🏢 HiPRO</span>
            </Link>
            <Link
              href="/admin/hbs"
              className="py-1.5 px-2 text-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all flex items-center justify-center gap-1 group font-semibold"
            >
              <span>🏗️ Hind Build</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </Link>
          </div>
        </div>

        {/* Quick Filter Box */}
        <div className="px-3 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tabs..."
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

        {/* Categorized Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {filteredCategories.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No matching tabs</p>
              <p className="text-[11px] text-slate-400 mt-1">Try another search term</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-[10px] font-bold text-construction-red uppercase tracking-wider hover:underline"
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredCategories.map((category) => {
              const isCollapsed = collapsedSections[category.id] && !searchQuery;
              // Check if any child item is active; if active, do not allow it to stay collapsed
              const hasActiveChild = category.items.some((item) =>
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname ? pathname.startsWith(item.href) : false
              );
              const effectiveCollapsed = isCollapsed && !hasActiveChild;

              return (
                <div key={category.id} className="space-y-1">
                  {/* Category Header */}
                  <div
                    onClick={() => toggleSection(category.id)}
                    className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer select-none hover:text-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>{category.title}</span>
                      <span className="text-[9px] font-medium text-slate-400 group-hover:text-slate-600 bg-slate-100 px-1 py-0.2 rounded-none">
                        {category.items.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                      aria-label="Toggle section"
                    >
                      {effectiveCollapsed ? (
                        <ChevronRight className="w-3 h-3 transition-transform" />
                      ) : (
                        <ChevronDown className="w-3 h-3 transition-transform" />
                      )}
                    </button>
                  </div>

                  {/* Category Items */}
                  {!effectiveCollapsed && (
                    <div className="space-y-0.5">
                      {category.items.map(({ href, label, icon: Icon, badge }) => {
                        const active = pathname
                          ? href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(href)
                          : false;

                        return (
                          <Link
                            key={href}
                            href={href}
                            className={`flex items-center justify-between px-3 py-2 rounded-none text-xs font-semibold uppercase tracking-wider transition-all group relative ${
                              active
                                ? "bg-construction-navy text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  active
                                    ? "text-construction-red"
                                    : "text-slate-400 group-hover:text-slate-700"
                                }`}
                              />
                              <span className="truncate">{label}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {badge && (
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none font-mono ${
                                    active
                                      ? "bg-construction-red text-white"
                                      : "bg-construction-red/10 text-construction-red border border-construction-red/20"
                                  }`}
                                >
                                  {badge}
                                </span>
                              )}
                              {active && (
                                <div className="w-1.5 h-1.5 bg-construction-red shrink-0" />
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Footer / System Controls */}
        <div className="px-3 py-3 border-t border-slate-200 space-y-1 bg-slate-50/80 shrink-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2.5 mb-1 font-mono">
            System & Settings
          </p>

          {isAdmin && (
            <Link
              href="/admin/users"
              className={`flex items-center justify-between px-3 py-1.5 rounded-none text-xs font-semibold uppercase tracking-wider transition-all group ${
                pathname === "/admin/users"
                  ? "bg-construction-navy text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck
                  className={`w-4 h-4 shrink-0 ${
                    pathname === "/admin/users"
                      ? "text-construction-red"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
                <span>Users & Roles</span>
              </div>
              {pathname === "/admin/users" && (
                <div className="w-1.5 h-1.5 bg-construction-red shrink-0" />
              )}
            </Link>
          )}

          <Link
            href="/admin/settings"
            className={`flex items-center justify-between px-3 py-1.5 rounded-none text-xs font-semibold uppercase tracking-wider transition-all group ${
              pathname === "/admin/settings"
                ? "bg-construction-navy text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings
                className={`w-4 h-4 shrink-0 ${
                  pathname === "/admin/settings"
                    ? "text-construction-red"
                    : "text-slate-400 group-hover:text-slate-700"
                }`}
              />
              <span>Site Settings</span>
            </div>
            {pathname === "/admin/settings" && (
              <div className="w-1.5 h-1.5 bg-construction-red shrink-0" />
            )}
          </Link>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-1.5 rounded-none text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
              <span>Live Website</span>
            </div>
            <span className="text-[9px] text-slate-400 uppercase font-mono group-hover:text-slate-600">
              Visit ↗
            </span>
          </Link>
        </div>
          </>
        )}
      </aside>
    </>
  );
}
