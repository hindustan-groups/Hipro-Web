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
      icon: Globe2,
      color: "text-amber-500",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      id: "hipro",
      label: "HiPRO Master (Civil)",
      shortLabel: "HiPRO Master",
      icon: Building2,
      color: "text-blue-600",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    },
    {
      id: "hbs",
      label: "Hind Build (HiBUILD)",
      shortLabel: "Hind Build (HiBUILD)",
      icon: Hammer,
      color: "text-red-600",
      badgeColor: "bg-red-50 text-red-800 border-red-200",
    },
  ];

  const selectedBrandObj = brandOptions.find((b) => b.id === currentBrand) || brandOptions[0];
  const CurrentIcon = selectedBrandObj.icon;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        {/* Brand Selector Compact Dropdown (No horizontal scrollbar!) */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 transition-all shadow-2xs"
            title="Switch Brand Context"
          >
            <span className="text-[10px] uppercase font-bold text-slate-400">Brand:</span>
            <CurrentIcon className={`w-3.5 h-3.5 ${selectedBrandObj.color}`} />
            <span className="max-w-[150px] truncate">{selectedBrandObj.shortLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active Brand Scope
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : b.color}`} />
                      <span>{b.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
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
