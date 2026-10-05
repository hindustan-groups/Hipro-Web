"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Sparkles
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  sectionKey?: string;
}

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
  {
    id: "hbs",
    title: "Hind Building Solutions",
    items: [
      { href: "/admin/hbs", label: "HBS Dashboard", icon: LayoutDashboard, sectionKey: "hbs" },
      { href: "/admin/hbs/settings", label: "General Settings", icon: Settings, sectionKey: "hbs-settings" },
      { href: "/admin/hbs/home", label: "Home Page CMS", icon: LayoutTemplate, sectionKey: "hbs-home" },
      { href: "/admin/hbs/about", label: "About Page CMS", icon: Info, sectionKey: "hbs-about" },
      { href: "/admin/hbs/services", label: "Services (19)", icon: HardHat, sectionKey: "hbs-services" },
      { href: "/admin/hbs/projects", label: "Projects / Work", icon: FolderOpen, sectionKey: "hbs-projects" },
      { href: "/admin/hbs/testimonials", label: "Testimonials", icon: Star, sectionKey: "hbs-testimonials" },
      { href: "/admin/hbs/leads", label: "Leads & Quotes", icon: Inbox, sectionKey: "hbs-leads" },
      { href: "/admin/hbs/seo", label: "SEO & Meta", icon: Compass, sectionKey: "hbs-seo" },
    ],
  },
];

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
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
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
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
                <span className="inline-block px-1 py-0.2 bg-construction-red/10 text-construction-red text-[8px] font-mono font-bold tracking-tight rounded-none">
                  ADMIN
                </span>
              </div>
            </div>
          </Link>
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
      </aside>
    </>
  );
}
