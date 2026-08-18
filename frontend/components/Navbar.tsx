"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardHat, X, Menu, ChevronDown, ArrowRight } from "lucide-react";
import type { Service } from "@/lib/types";

const defaultNavLinks = [
  { href: "/", label: "Home", isMegaMenu: false },
  { href: "/about", label: "About Us", isMegaMenu: false },
  { 
    href: "/services", 
    label: "Services", 
    isMegaMenu: true,
    megaMenuImage: "https://images.unsplash.com/photo-1541888086925-0c13d42e2c45?w=800&q=80",
    megaMenuTitle: "Turnkey Construction & Engineering",
    megaMenuSubtitle: "Delivering visionary architectural blueprints, BIM modeling, and master infrastructure execution across India.",
    megaMenuLink: "/services",
    megaMenuCategories: [],
  },
  { href: "/projects", label: "Projects", isMegaMenu: false },
  { href: "/careers", label: "Careers", isMegaMenu: false },
  { href: "/contact", label: "Contact", isMegaMenu: false },
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
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) {
      setOpenMobileDropdowns({});
    }
  }, [mobileOpen]);

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

  // Clone it to ensure no mutations of defaultNavLinks
  try {
    navLinks = JSON.parse(JSON.stringify(navLinks));
  } catch {
    navLinks = [...defaultNavLinks];
  }

  const servicesLink = navLinks.find((l: any) => l && l.href === "/services");
  if (servicesLink) {
    if (services && Array.isArray(services) && services.length > 0) {
      const activeServices = services.filter((s) => s && s.active !== false);
      if (activeServices.length > 0) {
        const categoriesMap: { [key: string]: any[] } = {};

        activeServices.forEach((s) => {
          if (!s || !s.title) return;
          const category = s.category || "Our Capabilities";
          if (!categoriesMap[category]) {
            categoriesMap[category] = [];
          }
          
          const slug = String(s.title)
            .toLowerCase()
            .replace(/ & /g, "-")
            .replace(/\s+/g, "-");

          categoriesMap[category].push({
            href: `/services/${slug}`,
            label: s.title,
            order: s.order ?? 99,
          });
        });

        const categoryOrder = ["Design & Planning", "Construction & Execution", "Management & Specialized"];
        const sortedCategories = Object.keys(categoriesMap).sort((a, b) => {
          const idxA = categoryOrder.indexOf(a);
          const idxB = categoryOrder.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });

        servicesLink.megaMenuCategories = sortedCategories.map((title) => ({
          title,
          links: (categoriesMap[title] || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(({ href, label }) => ({ href, label })),
        }));
      }
    }
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
            <img 
              src="/logo.jpg" 
              alt="HiPRO Logo" 
              className="h-10 md:h-12 w-auto object-contain mix-blend-multiply"
            />
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
          <div className="hidden md:flex items-center gap-8 h-full">
            {navLinks.filter(Boolean).map((link) => {
              const isCurrentActive = pathname
                ? (pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/")))
                : false;

              const hasMega = link.isMegaMenu && ((link.megaMenuCategories && link.megaMenuCategories.length > 0) || Boolean(link.megaMenuImage));
              const hasDropdown = (link.subLinks && link.subLinks.length > 0) || hasMega;

              return (
              <div key={link.href} className="relative group h-full flex items-center">
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
                  {hasDropdown && (
                    <ChevronDown className={`w-4 h-4 ml-1.5 transition-transform duration-300 ease-out group-hover:rotate-180 ${isDarkNavbar ? "text-slate-300" : "text-slate-500"}`} />
                  )}

                  {/* Animated Bottom Border with Smooth Transition */}
                  <span 
                    className={`absolute bottom-0 left-0 h-[2.5px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isCurrentActive
                        ? `w-full ${isDarkNavbar ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" : "bg-construction-red shadow-[0_0_8px_rgba(220,38,38,0.4)]"}`
                        : `w-0 group-hover:w-full ${isDarkNavbar ? "bg-white/80" : "bg-construction-red"}`
                    }`} 
                  />
                </Link>
                
                {/* Standard Dropdown Menu Desktop */}
                {link.subLinks && !link.isMegaMenu && (
                  <div className="absolute top-[100%] left-0 w-48 pt-1 opacity-0 invisible translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
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
                  <div className="fixed top-[70px] md:top-[85px] left-0 w-full pt-1 opacity-0 invisible -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[100]">
                    <div className="w-full bg-white shadow-2xl border-t border-slate-200 flex mx-auto">
                      <div className="max-w-[1400px] mx-auto w-full flex">
                        
                        {/* Columns Container */}
                        <div className="flex-1 p-10 grid grid-cols-3 gap-10">
                          {link.megaMenuCategories?.map((category: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-5">
                              <h3 className="text-construction-navy font-display font-bold uppercase tracking-widest text-[15px] mb-1 border-b border-slate-200 pb-3">
                                {category.title}
                              </h3>
                              <div className="flex flex-col gap-3">
                                {category.links.map((sub: any) => (
                                  <Link 
                                    key={sub.href} 
                                    href={sub.href}
                                    className="text-sm font-semibold uppercase tracking-wider text-slate-600 hover:text-construction-red transition-colors py-1.5"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Featured Image Block (Right Side) */}
                        {link.megaMenuImage && (
                          <Link 
                            href={link.megaMenuLink || "/services"}
                            className="w-[420px] shrink-0 bg-slate-100 border-l border-slate-200 p-8 flex flex-col justify-between group/feature cursor-pointer relative overflow-hidden"
                          >
                            <img 
                              src={link.megaMenuImage} 
                              alt={link.megaMenuTitle || "Services Feature"} 
                              className="absolute inset-0 w-full h-full object-cover group-hover/feature:scale-105 transition-all duration-700"
                            />
                            
                            {(link.megaMenuTitle || link.megaMenuSubtitle) && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                            )}
                            
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 text-construction-red font-bold text-xs uppercase tracking-widest mb-3 drop-shadow">
                                <span className="w-8 h-[2px] bg-construction-red"></span> Featured Capabilities
                              </div>
                              {link.megaMenuTitle && (
                                <h3 className="text-2xl font-bold text-white font-display uppercase tracking-tight mb-2 leading-tight drop-shadow-md">
                                  {link.megaMenuTitle}
                                </h3>
                              )}
                              {link.megaMenuSubtitle && (
                                <p className="text-slate-100 font-normal text-xs leading-relaxed drop-shadow">
                                  {link.megaMenuSubtitle}
                                </p>
                              )}
                            </div>
                            
                            <div className="relative z-10 mt-8 pt-4 border-t border-white/20 flex items-center justify-between text-white text-xs font-bold uppercase tracking-wider group-hover/feature:text-construction-red transition-colors drop-shadow">
                              <span>Explore All Services</span>
                              <ArrowRight className="w-4 h-4 group-hover/feature:translate-x-2 transition-transform text-construction-red" />
                            </div>
                          </Link>
                        )}

                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
            <Link 
              href="/contact" 
              className={`relative overflow-hidden group ml-3 px-6 py-2.5 rounded-none font-semibold uppercase tracking-wider text-sm transition-all duration-300 flex items-center gap-2 backdrop-blur-xl ${
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
