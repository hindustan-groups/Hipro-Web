"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardHat, X, Menu, ChevronDown, ArrowRight } from "lucide-react";

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
    megaMenuCategories: [
      {
        title: "Design & Planning",
        links: [
          { href: "/services/architecture-planning", label: "Architecture Planning" },
          { href: "/services/structure-analysis", label: "Structure Analysis" },
          { href: "/services/interior-exterior", label: "Interior & Exterior" },
          { href: "/services/estimation", label: "Estimation" },
          { href: "/services/surveying", label: "Surveying" },
        ]
      },
      {
        title: "Construction & Execution",
        links: [
          { href: "/services/construction-services", label: "Construction Services" },
          { href: "/services/property-developer", label: "Property Developer" },
          { href: "/services/civil-structure-testing", label: "Civil Structure Testing" },
        ]
      },
      {
        title: "Management & Specialized",
        links: [
          { href: "/services/project-management", label: "Project Management" },
          { href: "/services/water-treatment-plant", label: "Water Treatment Plant" },
        ]
      }
    ],
  },
  { href: "/projects", label: "Projects", isMegaMenu: false },
  { href: "/careers", label: "Careers", isMegaMenu: false },
  { href: "/contact", label: "Contact", isMegaMenu: false },
];

export default function Navbar({ 
  navConfigString,
  previewMode = false
}: { 
  navConfigString?: string | null;
  previewMode?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  let navLinks: any[] = defaultNavLinks;
  if (navConfigString) {
    try {
      navLinks = JSON.parse(navConfigString);
    } catch (e) {
      console.error("Failed to parse navConfigString", e);
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header 
      className={
        previewMode 
        ? "relative z-50 bg-white py-2 border border-gray-200 shadow-sm rounded-lg overflow-visible w-full"
        : `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-white py-2 border-b border-gray-100 shadow-sm" 
            : isHome 
              ? "bg-transparent py-4 border-b border-white/10"
              : "bg-white/90 backdrop-blur-sm py-4 border-b border-gray-100"
        }`
      }
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 transition-transform hover:scale-[1.02] group">
            <img 
              src="/logo.jpg" 
              alt="HiPRO Logo" 
              className="h-10 md:h-12 w-auto object-contain mix-blend-multiply"
            />
            <div className="hidden md:block w-[1px] h-10 bg-slate-200/50"></div>
            <div className="hidden md:flex flex-col justify-center">
              <span className="font-bold text-[17px] leading-tight tracking-[0.08em] text-construction-red font-display uppercase">
                Hindustan
              </span>
              <span className="font-bold text-[13px] leading-tight tracking-[0.1em] text-construction-navy font-display uppercase">
                Projects
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 h-full">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group h-full flex items-center">
                <Link
                  href={link.href}
                  className={`flex items-center text-[15px] font-semibold uppercase tracking-wider transition-colors duration-200 py-4 border-b-[3px] ${
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"))
                      ? (isHome && !scrolled ? "text-white font-bold border-white" : "text-construction-navy font-bold border-construction-navy")
                      : (isHome && !scrolled ? "text-slate-200 hover:text-white border-transparent hover:border-white/50" : "text-slate-600 hover:text-black border-transparent hover:border-slate-300")
                  }`}
                >
                  {link.label}
                  {(link.subLinks || link.isMegaMenu) && <ChevronDown className="w-4 h-4 ml-1" />}
                </Link>
                
                {/* Standard Dropdown Menu Desktop */}
                {link.subLinks && !link.isMegaMenu && (
                  <div className="absolute top-[100%] left-0 w-48 pt-1 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
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
                {link.isMegaMenu && (
                  <div className="fixed top-[70px] md:top-[85px] left-0 w-full pt-1 opacity-0 invisible -translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-[100]">
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
                            className="w-[420px] shrink-0 bg-slate-900 border-l border-slate-800 p-8 flex flex-col justify-between group/feature cursor-pointer relative overflow-hidden"
                          >
                            {/* Background Image with Dark Overlay */}
                            <img 
                              src={link.megaMenuImage} 
                              alt={link.megaMenuTitle || "Services Feature"} 
                              className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover/feature:scale-105 group-hover/feature:opacity-45 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 text-construction-red font-bold text-xs uppercase tracking-widest mb-3">
                                <span className="w-8 h-[2px] bg-construction-red"></span> Featured Capabilities
                              </div>
                              <h3 className="text-2xl font-bold text-white font-display uppercase tracking-tight mb-2 leading-tight drop-shadow-md">
                                {link.megaMenuTitle}
                              </h3>
                              <p className="text-slate-300 font-light text-xs leading-relaxed">
                                {link.megaMenuSubtitle}
                              </p>
                            </div>
                            
                            <div className="relative z-10 mt-8 pt-4 border-t border-white/15 flex items-center justify-between text-white text-xs font-bold uppercase tracking-wider group-hover/feature:text-construction-red transition-colors">
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
            ))}
            <Link 
              href="/contact" 
              className="bg-construction-navy btn-sweep text-white px-6 py-2.5 rounded-none font-semibold uppercase tracking-wider text-sm shadow-md shadow-blue-900/20 ml-2"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden flex items-center justify-center p-2 transition-colors ${
              isHome && !scrolled ? "text-white hover:text-gray-200" : "text-slate-700 hover:text-black"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-4 flex flex-col gap-2 bg-white max-h-[80vh] overflow-y-auto shadow-xl">
            {navLinks.map((link) => (
              <div key={link.href} className="flex flex-col">
                <Link
                  href={link.href}
                  onClick={() => !link.subLinks && !link.isMegaMenu && setMobileOpen(false)}
                  className={`px-4 py-3 rounded-none text-base font-semibold uppercase tracking-wider transition-colors ${
                    pathname === link.href
                      ? "text-construction-navy bg-slate-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
                {link.subLinks && !link.isMegaMenu && (
                  <div className="pl-6 flex flex-col bg-slate-50">
                    {link.subLinks.map((sub: { label: string; href: string }) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-slate-500 hover:text-construction-red border-l border-slate-200"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
                {/* Mobile version of Mega Menu */}
                {link.isMegaMenu && link.megaMenuCategories && (
                  <div className="pl-6 flex flex-col bg-slate-50 py-2 gap-4">
                    {link.megaMenuCategories.map((category: any, idx: number) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 px-4">
                          {category.title}
                        </span>
                        {category.links.map((sub: any) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-construction-red border-l-2 border-slate-200 ml-4"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link 
              href="/contact" 
              onClick={() => setMobileOpen(false)}
              className="mt-4 mb-2 mx-4 bg-construction-navy btn-sweep text-white px-4 py-3.5 rounded-none font-semibold text-center uppercase tracking-wider shadow-md shadow-blue-900/20"
            >
              Get a Quote
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
