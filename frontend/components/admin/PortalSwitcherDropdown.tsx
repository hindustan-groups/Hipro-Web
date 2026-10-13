"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ChevronDown, Check, ExternalLink } from "lucide-react";

export interface PortalOption {
  id: "hipro" | "hbs" | "empanelment" | "snaptech";
  name: string;
  shortName: string;
  badge: string;
  description: string;
  href: string;
  externalHref?: string;
  logo?: string;
  icon?: any;
  themeColor: "emerald" | "red" | "amber" | "blue";
}

export const PORTAL_OPTIONS: PortalOption[] = [
  {
    id: "hipro",
    name: "HiPRO Master Admin",
    shortName: "HiPRO Master",
    badge: "Master Console",
    description: "Core website CMS, customer leads & operations",
    href: "/admin",
    logo: "/logo.jpg",
    themeColor: "emerald",
  },
  {
    id: "hbs",
    name: "HiBUILD (HBS) CMS",
    shortName: "HiBUILD (HBS)",
    badge: "Construction CMS",
    description: "Turnkey building solutions & trade catalogs",
    href: "/admin/hbs",
    logo: "/hbs-icon.jpg",
    themeColor: "red",
  },
  {
    id: "empanelment",
    name: "Vendor Empanelment Hub",
    shortName: "Empanelment",
    badge: "Partner Portal",
    description: "Contractor KYC, tenders & daily gate passes",
    href: "/admin/empanelment",
    icon: ShieldCheck,
    themeColor: "amber",
  },
  {
    id: "snaptech",
    name: "SnapTech Digital Console",
    shortName: "SnapTech Portal",
    badge: "IT & Tech Portal",
    description: "Digital agency, cloud apps & tech infrastructure",
    href: "/admin/snaptech",
    externalHref: "https://www.snaptech.digital/admin-hp9z7k5w8v3q2m4x",
    logo: "/snaptech-icon.png",
    themeColor: "blue",
  },
];

export function getActivePortal(pathname: string | null): PortalOption {
  if (pathname?.startsWith("/admin/hbs")) {
    return PORTAL_OPTIONS[1];
  }
  if (pathname?.startsWith("/admin/empanelment")) {
    return PORTAL_OPTIONS[2];
  }
  if (pathname?.startsWith("/admin/snaptech")) {
    return PORTAL_OPTIONS[3];
  }
  // Default to HiPRO Master
  return PORTAL_OPTIONS[0];
}

interface PortalSwitcherDropdownProps {
  variant?: "header" | "sidebar";
  className?: string;
}

export default function PortalSwitcherDropdown({
  variant = "header",
  className = "",
}: PortalSwitcherDropdownProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const activePortal = getActivePortal(pathname);

  // Close when pressing ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className={`relative ${className}`}>
      {/* Transparent backdrop to cleanly dismiss on outside clicks without DOM node race conditions */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ─── VARIANT 1: HEADER TRIGGER ───────────────────────────── */}
      {variant === "header" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative z-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-2xs focus:outline-none cursor-pointer ${
            isOpen
              ? "bg-slate-100 text-slate-900 border-slate-300"
              : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90"
          }`}
          title={`Active Portal: ${activePortal.name} (Click to switch)`}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono hidden sm:inline">
            Portal:
          </span>

          {activePortal.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={activePortal.logo}
              alt={activePortal.shortName}
              className="w-4 h-4 object-contain rounded shrink-0 bg-white shadow-2xs"
            />
          ) : (
            <div className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-3 h-3" />
            </div>
          )}

          <span className="font-bold truncate text-xs text-slate-900">
            {activePortal.shortName}
          </span>

          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold font-mono bg-slate-100 text-slate-600 border border-slate-200/80">
            Active
          </span>

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* ─── VARIANT 2: SIDEBAR TRIGGER ───────────────────────────── */}
      {variant === "sidebar" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative z-50 w-full flex items-center justify-between p-2 rounded-lg border text-xs font-semibold transition-all shadow-2xs focus:outline-none cursor-pointer ${
            isOpen
              ? "bg-slate-100 text-slate-900 border-slate-300"
              : "bg-white hover:bg-slate-50 text-slate-900 border-slate-200/90"
          }`}
          title={`Switch Ecosystem Portal — Current: ${activePortal.name}`}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {activePortal.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activePortal.logo}
                alt={activePortal.shortName}
                className="w-6 h-6 object-contain rounded-md shrink-0 bg-white p-0.5 border border-slate-200/80 shadow-2xs"
              />
            ) : (
              <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold truncate text-xs text-slate-900 leading-tight">
                  {activePortal.shortName}
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                {activePortal.badge}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-mono bg-slate-100 text-slate-600 border border-slate-200/80">
              Active
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
      )}

      {/* ─── FLOATING DROPDOWN MENU ───────────────────────────────── */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 rounded-xl bg-white border border-slate-200/90 shadow-2xl p-2.5 z-50 animate-in fade-in duration-100 ${
            variant === "header"
              ? "right-0 w-80 sm:w-96 max-w-[calc(100vw-2rem)]"
              : "left-0 w-72 sm:w-80 max-w-[calc(100vw-2rem)]"
          }`}
        >
          {/* Menu Header */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 mb-1.5">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono block">
                Hindustan Projects Ecosystem
              </span>
              <span className="text-xs font-bold text-slate-900">
                Switch Portal / Console
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
              4 Portals
            </span>
          </div>

          {/* List of Portals */}
          <div className="space-y-1">
            {PORTAL_OPTIONS.map((portal) => {
              const isActive = portal.id === activePortal.id;
              const isExternal = Boolean(portal.externalHref);

              const itemClass = `w-full flex items-center justify-between p-2.5 rounded-lg transition-all border group ${
                isActive
                  ? "bg-slate-50 border-slate-200/90 text-slate-900"
                  : "bg-white hover:bg-slate-50 border-transparent hover:border-slate-200/70 text-slate-800"
              }`;

              const content = (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    {portal.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={portal.logo}
                        alt={portal.name}
                        className="w-8 h-8 object-contain rounded-lg p-0.5 shrink-0 bg-white border border-slate-200"
                      />
                    ) : portal.icon ? (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-500 text-white">
                        <portal.icon className="w-4 h-4" />
                      </div>
                    ) : null}

                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs truncate leading-tight ${isActive ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                          {portal.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {portal.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[2.5]" /> Active
                      </span>
                    ) : isExternal ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold flex items-center gap-1 border border-blue-200/60 group-hover:bg-blue-100 transition-colors">
                        Launch <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold group-hover:bg-slate-200 transition-colors">
                        Switch ➔
                      </span>
                    )}
                  </div>
                </>
              );

              return (
                <div key={portal.id} className="relative">
                  {isExternal ? (
                    <a
                      href={portal.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className={itemClass}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      href={portal.href}
                      onClick={() => setIsOpen(false)}
                      className={itemClass}
                    >
                      {content}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
