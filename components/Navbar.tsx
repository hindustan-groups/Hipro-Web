"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardHat, X, Menu, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About", subLinks: [
    { href: "/about#team", label: "Our Team" },
    { href: "/about#history", label: "History" },
    { href: "/about#careers", label: "Careers" },
  ]},
  { href: "/services", label: "Services", subLinks: [
    { href: "/services#architecture-planning", label: "Architecture Planning" },
    { href: "/services#structure-analysis", label: "Structure Analysis" },
    { href: "/services#interior-exterior", label: "Interior & Exterior" },
    { href: "/services#construction-services", label: "Construction Services" },
    { href: "/services#property-developer", label: "Property Developer" },
    { href: "/services#surveying", label: "Surveying" },
    { href: "/services#estimation", label: "Estimation" },
    { href: "/services#civil-structure-testing", label: "Civil Structure Testing" },
    { href: "/services#project-management", label: "Project Management" },
    { href: "/services#water-treatment-plant", label: "Water Treatment Plant" },
  ]},
  { href: "/projects", label: "Projects", subLinks: [
    { href: "/projects#ongoing", label: "Ongoing" },
    { href: "/projects#completed", label: "Completed" },
  ]},
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-white py-2 border-b border-gray-100 shadow-sm" 
          : isHome 
            ? "bg-transparent py-4 border-b border-white/10"
            : "bg-white/90 backdrop-blur-sm py-4 border-b border-gray-100"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 bg-white md:px-5 md:py-1.5 rounded-2xl md:border md:border-slate-100 transition-transform hover:scale-[1.02]">
            <img 
              src="/logo.jpg" 
              alt="HiPRO Logo" 
              className="h-10 md:h-12 w-auto object-contain mix-blend-multiply" 
            />
            <div className="hidden md:block w-[1px] h-10 bg-slate-200"></div>
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
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className={`flex items-center text-[15px] font-semibold uppercase tracking-wider transition-colors duration-200 py-4 border-b-[3px] ${
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"))
                      ? (isHome && !scrolled ? "text-white font-bold border-white" : "text-construction-navy font-bold border-construction-navy")
                      : (isHome && !scrolled ? "text-slate-200 hover:text-white border-transparent hover:border-white/50" : "text-slate-600 hover:text-black border-transparent hover:border-slate-300")
                  }`}
                >
                  {link.label}
                  {link.subLinks && <ChevronDown className="w-4 h-4 ml-1" />}
                </Link>
                {/* Dropdown Menu Desktop */}
                {link.subLinks && (
                  <div className="absolute top-[100%] left-0 w-48 pt-1 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                    <div className="bg-white shadow-xl flex flex-col py-2 rounded-b-md border border-slate-100">
                      {link.subLinks.map(sub => (
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
              </div>
            ))}
            <Link 
              href="/contact" 
              className="bg-construction-navy btn-sweep text-white px-6 py-2.5 rounded-none font-semibold uppercase tracking-wider text-sm shadow-md shadow-blue-900/20"
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
          <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-4 flex flex-col gap-2 bg-white">
            {navLinks.map((link) => (
              <div key={link.href} className="flex flex-col">
                <Link
                  href={link.href}
                  onClick={() => !link.subLinks && setMobileOpen(false)}
                  className={`px-4 py-3 rounded-none text-base font-semibold uppercase tracking-wider transition-colors ${
                    pathname === link.href
                      ? "text-construction-navy bg-slate-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
                {link.subLinks && (
                  <div className="pl-6 flex flex-col">
                    {link.subLinks.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-2 text-sm font-semibold uppercase tracking-wider text-slate-500 hover:text-construction-red border-l-2 border-slate-100"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link 
              href="/contact" 
              onClick={() => setMobileOpen(false)}
              className="mt-2 mx-4 bg-construction-navy btn-sweep text-white px-4 py-3 rounded-none font-semibold text-center uppercase tracking-wider shadow-md shadow-blue-900/20"
            >
              Get a Quote
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
