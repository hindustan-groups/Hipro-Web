"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  PenSquare,
  Users,
  Building2,
  Hammer,
  Globe2,
  Mail,
  Settings,
  Layers,
  ChevronDown,
  Check,
} from "lucide-react";

export default function AutoMailNav({
  activeBrand,
  onBrandChange,
}: {
  activeBrand?: string;
  onBrandChange?: (brand: string) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlBrand = searchParams?.get("brand") || "all";
  const currentBrand = activeBrand || urlBrand;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/admin/automail", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/automail/campaigns", label: "Campaigns", icon: Send },
    { href: "/admin/automail/compose", label: "Compose Studio", icon: PenSquare },
    { href: "/admin/automail/templates", label: "Templates", icon: Layers },
    { href: "/admin/automail/contacts", label: "Audience & Leads", icon: Users },
    { href: "/admin/automail/settings", label: "Settings & SMTP", icon: Settings },
  ];

  const brandOptions = [
    {
      id: "all",
      label: "All Brands (Global)",
      shortLabel: "All Brands",
      subtitle: "Universal mail pipeline across all lists",
      icon: Globe2,
      color: "text-amber-500",
      bgLight: "bg-amber-50",
    },
    {
      id: "hipro",
      label: "HiPRO Master (Civil)",
      shortLabel: "HiPRO Master",
      subtitle: "Hindustan Projects civil construction leads",
      icon: Building2,
      color: "text-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      id: "hbs",
      label: "Hind Build (HiBUILD)",
      shortLabel: "Hind Build",
      subtitle: "Building solutions, hardware & materials",
      icon: Hammer,
      color: "text-red-600",
      bgLight: "bg-red-50",
    },
  ];

  const selectedBrandObj = brandOptions.find((b) => b.id === currentBrand) || brandOptions[0];
  const CurrentIcon = selectedBrandObj.icon;

  return (
    <div className="relative z-20 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-30">
        {/* Title & Brand Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-construction-navy to-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">AutoMail Engine</h1>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                Multi-Brand Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">
              High-deliverability Hostinger SMTP automation for HiPRO, Hind Build & all campaigns
            </p>
          </div>
        </div>

        {/* Brand Selector Compact Dropdown */}
        <div className="relative z-50 shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
              dropdownOpen
                ? "bg-white border-blue-500 text-blue-900 ring-2 ring-blue-500/20"
                : "bg-slate-100 hover:bg-slate-200/80 border-slate-200/80 text-slate-800"
            }`}
            title="Switch Brand Context"
          >
            <span className="text-[10px] uppercase font-bold text-slate-400">Brand:</span>
            <CurrentIcon className={`w-3.5 h-3.5 ${selectedBrandObj.color}`} />
            <span className="max-w-[150px] truncate">{selectedBrandObj.shortLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                <span>Select Brand Scope</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  3 Brands
                </span>
              </div>
              {brandOptions.map((b) => {
                const Icon = b.icon;
                const isSelected = currentBrand === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      if (onBrandChange) onBrandChange(b.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-white/15 text-white" : `${b.bgLight} ${b.color}`
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight truncate">{b.label}</div>
                        <div
                          className={`text-[10px] leading-tight truncate mt-0.5 ${
                            isSelected ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {b.subtitle}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Primary Sub-Nav Tabs */}
      <div className="flex items-center gap-1 border-t border-slate-100 pt-3 overflow-x-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          const hrefWithBrand = currentBrand !== "all" ? `${link.href}?brand=${currentBrand}` : link.href;

          return (
            <Link
              key={link.href}
              href={hrefWithBrand}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
