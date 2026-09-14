"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  HardHat, X, Menu, ChevronDown, ArrowRight, Compass, Ruler, 
  Paintbrush, Droplets, Briefcase, ExternalLink, Calculator, 
  Sparkles, CheckCircle2, ShieldCheck, FileCheck2, Globe2
} from "lucide-react";
import type { Service } from "@/lib/types";
import { cleanServiceTitle } from "@/lib/companyData";
import { isOptimizableImage } from "@/lib/imageUtils";

// Metadata mapping for rich visual mega menu items
const serviceMetaMap: Record<string, { icon: any; tagline: string }> = {
  "Architecture & Planning": {
    icon: Compass,
    tagline: "3D BIM, structural blueprints & municipal plans",
  },
  "Professional Construction Services": {
    icon: HardHat,
    tagline: "Turnkey civil RCC, structural & commercial builds",
  },
  "Surveying & Site Measurements": {
    icon: Ruler,
    tagline: "Digital total station & contour topographic surveys",
  },
  "Interior & Exterior Design": {
    icon: Paintbrush,
    tagline: "Turnkey luxury interiors, facades & elevation styling",
  },
  "Water Treatment Plant Construction": {
    icon: Droplets,
    tagline: "Industrial ETP, STP, hydraulic tanks & piping plants",
  },
  "Project Management & Consultancy": {
    icon: Briefcase,
    tagline: "PMC audit, cost estimation & on-site quality control",
  },
};

const defaultNavLinks = [
  { href: "/", label: "Home", isMegaMenu: false },
  { href: "/about", label: "About Us", isMegaMenu: false },
  { 
    href: "/services", 
    label: "Services", 
    isMegaMenu: true,
    megaMenuImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=75&auto=format",
    megaMenuTitle: "Turnkey Construction & Engineering",
    megaMenuSubtitle: "Delivering visionary architectural blueprints, BIM modeling, and master infrastructure execution across India.",
    megaMenuLink: "/services",
    megaMenuCategories: [],
  },
  { href: "/projects", label: "Projects", isMegaMenu: false },
  { href: "/cost-estimator", label: "Cost Estimator", isMegaMenu: false },
  { href: "/blogs", label: "Blog", isMegaMenu: false },
  { href: "/careers", label: "Careers", isMegaMenu: false },
];

export default function Navbar({ 
  navConfigString,
  previewMode = false,
  services = []
}: { 
  navConfigString?: string | null;
  previewMode?: boolean;
  services?: Service[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<{[key: string]: boolean}>({});
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) {
      setOpenMobileDropdowns({});
    }
  }, [mobileOpen]);

  useEffect(() => {
    setActiveDesktopDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("header")) {
        setActiveDesktopDropdown(null);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const toggleMobileDropdown = (href: string) => {
    setOpenMobileDropdowns(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  let navLinks: any[] = defaultNavLinks;
  if (navConfigString) {
    try {
      const parsed = JSON.parse(navConfigString);
      if (Array.isArray(parsed)) {
        navLinks = parsed;
      }
    } catch (e) {
      console.error("Failed to parse navConfigString", e);
    }
  }

  // Remove "Contact" from nav links — the "Get a Quote" button already links to /contact
  navLinks = navLinks.filter((l: any) => !(l && l.href === "/contact"));

  // Ensure Cost Estimator link is always present
  if (!navLinks.some((l: any) => l && l.href === "/cost-estimator")) {
    const insertIdx = navLinks.findIndex((l: any) => l && (l.href === "/blogs" || l.href === "/careers"));
    const estimatorLink = { href: "/cost-estimator", label: "Cost Estimator", isMegaMenu: false };
    if (insertIdx !== -1) {
      navLinks.splice(insertIdx, 0, estimatorLink);
    } else {
      navLinks.push(estimatorLink);
    }
  }

  // Ensure Blog link is always present
  if (!navLinks.some((l: any) => l && l.href === "/blogs")) {
    const insertIdx = navLinks.findIndex((l: any) => l && l.href === "/careers");
    const blogLink = { href: "/blogs", label: "Blog", isMegaMenu: false };
    if (insertIdx !== -1) {
      navLinks.splice(insertIdx, 0, blogLink);
    } else {
      navLinks.push(blogLink);
    }
  }

  // Clone it to ensure no mutations of defaultNavLinks
  try {
    navLinks = JSON.parse(JSON.stringify(navLinks));
  } catch {
    navLinks = [...defaultNavLinks];
  }

  const servicesLink = navLinks.find((l: any) => l && l.href === "/services");
  if (servicesLink) {
    // Default fallback services if none passed or empty
    const sourceServices = (services && Array.isArray(services) && services.length > 0)
      ? services.filter((s) => s && s.active !== false)
      : [
          { title: "Architecture & Planning", category: "Design & Planning", order: 1 },
          { title: "Interior & Exterior Design", category: "Design & Planning", order: 2 },
          { title: "Surveying & Site Measurements", category: "Design & Planning", order: 3 },
          { title: "Professional Construction Services", category: "Civil & Infrastructure", order: 4 },
          { title: "Water Treatment Plant Construction", category: "Civil & Infrastructure", order: 5 },
          { title: "Project Management & Consultancy", category: "Civil & Infrastructure", order: 6 },
        ];

    const designPlanningLinks: any[] = [];
    const civilExecutionLinks: any[] = [];

    sourceServices.forEach((s) => {
      if (!s || !s.title) return;
      const cleanTitle = cleanServiceTitle(s.title);
      const slug = String(cleanTitle)
        .toLowerCase()
        .replace(/ & /g, "-")
        .replace(/\s+/g, "-");

      const meta = serviceMetaMap[cleanTitle] || {
        icon: HardHat,
        tagline: ("description" in s && s.description) || "Turnkey engineering and quality execution",
      };

      const item = {
        href: `/services/${slug}`,
        label: cleanTitle,
        tagline: meta.tagline,
        icon: meta.icon,
        order: s.order ?? 99,
        isExternal: false,
      };

      const lower = cleanTitle.toLowerCase();
      if (
        lower.includes("architecture") ||
        lower.includes("interior") ||
        lower.includes("surveying")
      ) {
        designPlanningLinks.push(item);
      } else {
        civilExecutionLinks.push(item);
      }
    });

    designPlanningLinks.sort((a, b) => a.order - b.order);
    civilExecutionLinks.sort((a, b) => a.order - b.order);

    // 3rd Pillar: Specialized Portals & Interactive Utilities
    const ecosystemLinks = [
      {
        href: "https://empanelment.hindustanprojects.in/",
        label: "Hindustan Empanelment",
        tagline: "Govt, vendor & contractor empanelment gateway",
        icon: FileCheck2,
        isExternal: true,
        badge: "Live Portal",
      },
      {
        href: "https://www.itservices.hindustanprojects.in/",
        label: "HiPro IT Services",
        tagline: "Software, web platforms & digital engineering",
        icon: Globe2,
        isExternal: true,
        badge: "Live Portal",
      },
      {
        href: "/cost-estimator",
        label: "Instant Cost Estimator",
        tagline: "Calculate construction budgets in under 60 seconds",
        icon: Calculator,
        isExternal: false,
        badge: "Free Tool",
      },
    ];

    servicesLink.megaMenuCategories = [
      {
        title: "Design & Planning",
        description: "Visionary Architecture & Surveys",
        links: designPlanningLinks,
      },
      {
        title: "Civil & Infrastructure",
        description: "Turnkey Execution & Treatment Plants",
        links: civilExecutionLinks,
      },
      {
        title: "Portals & Ecosystem",
        description: "Empanelment, IT & Smart Tools",
        links: ecosystemLinks,
      },
    ];
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";
  const isDarkNavbar = isHome && !scrolled && !previewMode;

  return (
    <header 
      suppressHydrationWarning
      className={
        previewMode 
        ? "relative z-50 bg-white py-2 border border-gray-200 shadow-sm rounded-lg overflow-visible w-full"
        : `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isDarkNavbar 
            ? "bg-transparent py-4 border-b border-white/10" 
            : "bg-white/95 backdrop-blur-md py-3 border-b border-slate-200/80 shadow-sm"
        }`
      }
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 transition-transform hover:scale-[1.02] group">
            <Image src="/logo.jpg" alt="HiPRO Logo" width={48} height={48} className="h-10 md:h-12 w-auto object-contain mix-blend-multiply" />
            <div className="w-[1px] h-9 bg-slate-200/50"></div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-[14px] sm:text-[17px] leading-tight tracking-[0.08em] text-construction-red font-display uppercase">
                Hindustan
              </span>
              <span className={`font-bold text-[10px] sm:text-[13px] leading-tight tracking-[0.1em] font-display uppercase transition-colors ${
                isDarkNavbar ? "text-white" : "text-construction-navy"
              }`}>
                Projects
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-8 h-full">
            {navLinks.filter(Boolean).map((link) => {
              const isCurrentActive = pathname
                ? (pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/")))
                : false;

              const hasMega = link.isMegaMenu && ((link.megaMenuCategories && link.megaMenuCategories.length > 0) || Boolean(link.megaMenuImage));
              const hasDropdown = (link.subLinks && link.subLinks.length > 0) || hasMega;

              const isOpenDesktop = activeDesktopDropdown === link.href;

              return (
              <div 
                key={link.href} 
                className="relative group h-full flex items-center"
                onMouseEnter={() => {
                  if (hasDropdown) setActiveDesktopDropdown(link.href);
                }}
                onMouseLeave={() => {
                  if (hasDropdown) setActiveDesktopDropdown(null);
                }}
              >
                <div className="flex items-center h-full">
                  <Link
                    href={link.href}
                    className={`relative flex items-center text-[15px] font-semibold uppercase tracking-wider transition-colors duration-200 py-3 ${
                      isCurrentActive
                        ? (isDarkNavbar 
                            ? "text-white font-bold" 
                            : "text-construction-red font-bold")
                        : (isDarkNavbar 
                            ? "text-slate-200 hover:text-white" 
                            : "text-slate-700 hover:text-construction-red")
                    }`}
                  >
                    <span>{link.label}</span>
                    {/* Animated Bottom Border with Smooth Transition */}
                    <span 
                      className={`absolute bottom-0 left-0 h-[2.5px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isCurrentActive
                          ? `w-full ${isDarkNavbar ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" : "bg-construction-red shadow-[0_0_8px_rgba(220,38,38,0.4)]"}`
                          : `w-0 group-hover:w-full ${isDarkNavbar ? "bg-white/80" : "bg-construction-red"}`
                      }`} 
                    />
                  </Link>
                  {hasDropdown && (
                    <button
                      type="button"
                      aria-label={`Toggle ${link.label} menu`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDesktopDropdown(prev => prev === link.href ? null : link.href);
                      }}
                      className="p-1 -mr-1 focus:outline-none cursor-pointer"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-out ${isOpenDesktop ? "rotate-180 text-construction-red" : "group-hover:rotate-180"} ${isDarkNavbar ? "text-slate-300" : "text-slate-500"}`} />
                    </button>
                  )}
                </div>
                
                {/* Standard Dropdown Menu Desktop */}
                {link.subLinks && !link.isMegaMenu && (
                  <div className={`absolute top-full left-0 w-48 pt-2 transition-all duration-200 z-50 ${
                    isOpenDesktop 
                      ? "opacity-100 visible translate-y-0 pointer-events-auto" 
                      : "opacity-0 invisible translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto"
                  }`}>
                    <div className="bg-white shadow-xl flex flex-col py-2 rounded-b-md border border-slate-100">
                      {link.subLinks.map((sub: { label: string; href: string }) => (
                        <Link 
                          key={sub.href} 
                          href={sub.href} 
                          className="px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-construction-red transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mega Menu Dropdown */}
                {hasMega && (
                  <div 
                    className={`fixed top-full left-0 w-full pt-2 transition-all duration-200 z-[100] ${
                      isOpenDesktop 
                        ? "opacity-100 visible translate-y-0 pointer-events-auto" 
                        : "opacity-0 invisible -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto"
                    }`}
                    onMouseEnter={() => setActiveDesktopDropdown(link.href)}
                    onMouseLeave={() => setActiveDesktopDropdown(null)}
                  >
                    {/* Invisible hover bridge buffer to ensure mouse doesn't drop during fast motion */}
                    <div className="absolute -top-4 left-0 w-full h-4 pointer-events-auto" />
                    <div className="w-full bg-white shadow-2xl border-t border-slate-200 flex flex-col mx-auto overflow-hidden">
                      <div className="max-w-[1520px] mx-auto w-full flex">
                        
                        {/* 3 Balanced Columns Container */}
                        <div className="flex-1 p-7 lg:p-8 grid grid-cols-3 gap-6 lg:gap-8">
                          {link.megaMenuCategories?.map((category: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-3">
                              <div className="border-b border-slate-200 pb-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-construction-navy font-display font-bold uppercase tracking-wider text-[13px] sm:text-[14px]">
                                    {category.title}
                                  </h3>
                                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                                    0{idx + 1}
                                  </span>
                                </div>
                                {category.description && (
                                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                    {category.description}
                                  </p>
                                )}
                              </div>

                              {/* Service Item Cards */}
                              <div className="flex flex-col gap-1.5">
                                {category.links.map((sub: any, itemIdx: number) => {
                                  const ItemIcon = sub.icon || HardHat;
                                  const isExternal = Boolean(sub.isExternal);

                                  return (
                                    <Link 
                                      key={itemIdx} 
                                      href={sub.href}
                                      target={isExternal ? "_blank" : undefined}
                                      rel={isExternal ? "noopener noreferrer" : undefined}
                                      className="group/item flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200/60"
                                    >
                                      <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover/item:bg-construction-red group-hover/item:text-white transition-all duration-200 shadow-sm mt-0.5">
                                        <ItemIcon className="w-4 h-4 transition-transform group-hover/item:scale-110" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[13px] font-bold text-slate-800 group-hover/item:text-construction-red transition-colors leading-tight">
                                            {sub.label}
                                          </span>
                                          {sub.badge && (
                                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                                              {sub.badge}
                                            </span>
                                          )}
                                          {isExternal && (
                                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover/item:text-construction-red shrink-0" />
                                          )}
                                        </div>
                                        {sub.tagline && (
                                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 mt-0.5 group-hover/item:text-slate-600">
                                            {sub.tagline}
                                          </p>
                                        )}
                                      </div>
                                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:text-construction-red transition-all duration-200 shrink-0 mt-1" />
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Featured Showcase Card (Right Side) */}
                        {link.megaMenuImage && (
                          <div className="w-[330px] xl:w-[360px] shrink-0 bg-slate-900 border-l border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden group/feature">
                            <Image 
                              src={link.megaMenuImage} 
                              alt={link.megaMenuTitle || "Services Feature"} 
                              fill
                              sizes="400px"
                              unoptimized={!isOptimizableImage(link.megaMenuImage)}
                              className="object-cover opacity-45 group-hover/feature:scale-105 group-hover/feature:opacity-55 transition-all duration-700"
                            />
                            
                            {/* Rich Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent pointer-events-none" />
                            
                            {/* Top Badge */}
                            <div className="relative z-10">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-construction-red/20 border border-construction-red/40 text-construction-red text-[11px] font-bold uppercase tracking-wider mb-4">
                                <Sparkles className="w-3 h-3" />
                                <span>Turnkey Capabilities</span>
                              </div>

                              <h3 className="text-xl xl:text-2xl font-bold text-white font-display uppercase tracking-tight mb-2 leading-tight drop-shadow-md">
                                {link.megaMenuTitle || "Turnkey Construction & Engineering"}
                              </h3>

                              <p className="text-slate-300 font-normal text-xs leading-relaxed drop-shadow line-clamp-3 mb-4">
                                {link.megaMenuSubtitle || "Delivering visionary architectural blueprints, BIM modeling, and master infrastructure execution across India."}
                              </p>

                              {/* Highlight Pills */}
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px] text-slate-300">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-construction-red shrink-0" />
                                  <span>BIM 3D Modeling</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-construction-red shrink-0" />
                                  <span>Turnkey RCC Build</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-construction-red shrink-0" />
                                  <span>Contour Surveys</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-construction-red shrink-0" />
                                  <span>Industrial ETP/STP</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions footer */}
                            <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
                              <Link 
                                href={link.megaMenuLink || "/services"}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-construction-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                              >
                                <span>All Services</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                              <Link 
                                href="/cost-estimator"
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/20"
                              >
                                <Calculator className="w-3.5 h-3.5 text-construction-red" />
                                <span>Estimate</span>
                              </Link>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Mega Menu Bottom Corporate Utility Bar */}
                      <div className="bg-slate-50 border-t border-slate-200/80 px-8 py-3">
                        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="font-semibold text-slate-800">Direct Consultation:</span>
                            <span className="hidden sm:inline">Have a commercial or residential blueprint in mind? Talk with our senior project engineers.</span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <Link 
                              href="/contact"
                              className="font-bold text-construction-navy hover:text-construction-red flex items-center gap-1 transition-colors uppercase tracking-wider"
                            >
                              <span>Request Engineering Consultation</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
            <Link 
              href="/contact" 
              className={`relative overflow-hidden group ml-2 lg:ml-3 px-5 lg:px-6 py-2.5 rounded-none font-semibold uppercase tracking-wider text-sm transition-all duration-300 flex items-center gap-2 backdrop-blur-xl whitespace-nowrap shrink-0 ${
                isDarkNavbar
                  ? "bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.15)]"
                  : "bg-construction-navy/95 hover:bg-construction-navy text-white border border-blue-900/40 shadow-md shadow-blue-900/20"
              }`}
            >
              {/* Glass subtle shimmer highlight on hover */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              
              <span className="relative z-10">Get a Quote</span>
              <ArrowRight className="w-4 h-4 relative z-10 text-construction-red transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile toggle button with smooth rotate transition */}
          <button
            className={`md:hidden flex items-center justify-center p-2 transition-all duration-300 ${
              isDarkNavbar ? "text-white hover:text-gray-200" : "text-slate-700 hover:text-black"
            } ${mobileOpen ? "rotate-90 text-construction-red" : "rotate-0"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-7 h-7 transition-transform duration-300" /> : <Menu className="w-7 h-7 transition-transform duration-300" />}
          </button>
        </div>

        {/* Mobile Menu with Smooth Open/Close Animation */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileOpen 
              ? "max-h-[85vh] opacity-100 translate-y-0 pt-4 pb-2 border-t border-gray-100 shadow-2xl pointer-events-auto" 
              : "max-h-0 opacity-0 -translate-y-2 pointer-events-none border-transparent py-0"
          } flex flex-col bg-white overflow-y-auto mt-2`}
        >
          {navLinks.filter(Boolean).map((link) => {
            const hasDropdown = (link.subLinks && link.subLinks.length > 0) || (link.isMegaMenu && link.megaMenuCategories && link.megaMenuCategories.length > 0);
            const isOpen = !!openMobileDropdowns[link.href];

            return (
              <div key={link.href} className="flex flex-col border-b border-slate-100 last:border-0">
                <div className="flex items-center justify-between w-full">
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex-1 px-4 py-3 text-base font-semibold uppercase tracking-wider transition-colors ${
                      pathname === link.href
                        ? "text-construction-navy font-bold"
                        : "text-slate-600 hover:text-black"
                    }`}
                  >
                    {link.label}
                  </Link>
                  {hasDropdown && (
                    <button
                      onClick={() => toggleMobileDropdown(link.href)}
                      className="px-5 py-3 text-slate-500 hover:text-black focus:outline-none border-l border-slate-100"
                      aria-label={`Toggle ${link.label} menu`}
                    >
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-300 ease-out ${
                          isOpen ? "rotate-180 text-construction-red" : ""
                        }`} 
                      />
                    </button>
                  )}
                </div>

                {/* Accordion Sub-links with Smooth Transition */}
                {hasDropdown && (
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[600px] opacity-100 py-2" : "max-h-0 opacity-0 py-0"
                    } bg-slate-50/50 pl-4 border-t border-slate-100 flex flex-col gap-1`}
                  >
                    {/* Standard Sub-links */}
                    {link.subLinks && !link.isMegaMenu && (
                      <div className="flex flex-col">
                        {link.subLinks.map((sub: { label: string; href: string }) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className={`px-4 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                              pathname === sub.href
                                ? "text-construction-red font-bold"
                                : "text-slate-500 hover:text-construction-red"
                            } border-l border-slate-200`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {/* Mega Menu Categories */}
                    {link.isMegaMenu && link.megaMenuCategories && (
                      <div className="flex flex-col gap-4 py-2">
                        {link.megaMenuCategories.map((category: any, idx: number) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 px-4">
                              {category.title}
                            </span>
                            <div className="flex flex-col">
                              {category.links.map((sub: any) => (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                                    pathname === sub.href
                                      ? "text-construction-red font-bold"
                                      : "text-slate-600 hover:text-construction-red"
                                  } border-l-2 border-slate-200 ml-4`}
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <Link 
            href="/contact" 
            onClick={() => setMobileOpen(false)}
            className="mt-4 mb-2 mx-4 bg-construction-navy text-white px-4 py-3.5 rounded-none font-semibold text-center uppercase tracking-wider shadow-md shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <span>Get a Quote</span>
            <ArrowRight className="w-4 h-4 text-construction-red" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
