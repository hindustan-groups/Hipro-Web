"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  ArrowRight,
  Wrench,
  MessageSquare,
  CheckCircle2,
  Droplets,
  ShieldAlert,
  Paintbrush,
  Bug,
  Layers,
  Sun,
  Zap,
  ShieldCheck,
  Sparkles,
  Truck,
  Camera,
  Smartphone,
  Armchair,
  LayoutGrid,
  Building2,
  Hammer,
  Flower2,
  Bird,
  HelpCircle,
  Phone,
} from "lucide-react";
import type { HbsService } from "@/lib/types";

interface HbsServicesDirectoryProps {
  services: HbsService[];
  prefix: string;
  whatsappRaw: string;
  phoneRaw: string;
  phoneFormatted: string;
}

// Map service icon string to Lucide icon component
function getServiceIcon(iconName?: string | null) {
  switch (iconName?.toLowerCase()) {
    case "shieldalert":
      return ShieldAlert;
    case "droplets":
      return Droplets;
    case "wrench":
      return Wrench;
    case "paintbrush":
      return Paintbrush;
    case "bird":
      return Bird;
    case "bug":
      return Bug;
    case "layers":
      return Layers;
    case "sun":
      return Sun;
    case "zap":
      return Zap;
    case "shieldcheck":
      return ShieldCheck;
    case "flower2":
      return Flower2;
    case "sparkles":
      return Sparkles;
    case "truck":
      return Truck;
    case "camera":
      return Camera;
    case "smartphone":
      return Smartphone;
    case "armchair":
      return Armchair;
    case "layoutgrid":
      return LayoutGrid;
    case "building2":
      return Building2;
    case "hammer":
      return Hammer;
    default:
      return Wrench;
  }
}

export default function HbsServicesDirectory({
  services,
  prefix,
  whatsappRaw,
  phoneRaw,
  phoneFormatted,
}: HbsServicesDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter services by title, hindiTitle, shortDescription, fullDescription, features
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return services;

    return services.filter((service) => {
      const matchTitle = service.title?.toLowerCase().includes(q);
      const matchHindi = service.hindiTitle?.toLowerCase().includes(q);
      const matchShort = service.shortDescription?.toLowerCase().includes(q);
      const matchFull = service.fullDescription?.toLowerCase().includes(q);
      const matchNumber = service.serviceNumber?.toLowerCase().includes(q);

      let matchFeatures = false;
      try {
        if (service.features) {
          const feats =
            typeof service.features === "string"
              ? JSON.parse(service.features)
              : service.features;
          if (Array.isArray(feats)) {
            matchFeatures = feats.some((f: any) =>
              String(f).toLowerCase().includes(q)
            );
          }
        }
      } catch {}

      return (
        matchTitle ||
        matchHindi ||
        matchShort ||
        matchFull ||
        matchNumber ||
        matchFeatures
      );
    });
  }, [services, searchQuery]);

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────────
          SEARCH & DISCOVERY CONTROLS
      ───────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input Box */}
          <div className="relative flex-1 max-w-2xl">
            <label htmlFor="hbs-service-search" className="sr-only">
              Search Services
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="hbs-service-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by trade, issue, or Hindi keyword (e.g. waterproofing, crack, सीलन)..."
                className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-10 py-3 rounded-none focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search input"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results Badge */}
          <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
            <span className="text-slate-400 font-mono">
              Showing{" "}
              <strong className="text-amber-400 font-bold">
                {filteredServices.length}
              </strong>{" "}
              of {services.length} services
            </span>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Quick Inquiries:
          </span>
          {[
            { label: "Waterproofing", q: "waterproofing" },
            { label: "Crack Repair", q: "crack" },
            { label: "Plumbing", q: "plumbing" },
            { label: "Painting", q: "painting" },
            { label: "Solar & HVAC", q: "solar" },
            { label: "Termite Defense", q: "termite" },
            { label: "Facade & ACP", q: "facade" },
          ].map((chip) => (
            <button
              key={chip.q}
              type="button"
              onClick={() => setSearchQuery(chip.q)}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors border ${
                searchQuery.toLowerCase() === chip.q.toLowerCase()
                  ? "bg-amber-500 text-slate-950 font-bold border-amber-500"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {chip.label}
            </button>
          ))}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-2.5 py-1 text-[11px] font-mono bg-slate-800 text-rose-300 border border-slate-700 hover:bg-slate-700"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SERVICE CARDS GRID (19 SERVICES DYNAMICALLY RENDERED)
      ───────────────────────────────────────────────────────────────── */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => {
            const serviceNo =
              service.serviceNumber || String(index + 1).padStart(2, "0");
            const IconComponent = getServiceIcon(service.icon);

            // Safely parse features
            let featuresArray: string[] = [];
            try {
              if (service.features) {
                featuresArray =
                  typeof service.features === "string"
                    ? JSON.parse(service.features)
                    : (service.features as string[]);
              }
            } catch {}

            return (
              <article
                key={service.id || service.slug}
                id={service.slug}
                className="bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-500 transition-all flex flex-col justify-between group scroll-mt-28"
              >
                <div>
                  {/* Top Image or Industrial Blueprint Frame */}
                  {service.image ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 border-b border-slate-200">
                      <Image
                        src={service.image}
                        alt={`${service.title} - Hind Build`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-slate-950/90 text-amber-400 font-mono text-[10px] font-bold px-2 py-0.5 border border-amber-500/40">
                        TRADE {serviceNo}
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-200 p-4 flex items-center justify-between overflow-hidden">
                      {/* Subtle Grid overlay */}
                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage:
                            "radial-gradient(#ffffff 1px, transparent 1px)",
                          backgroundSize: "16px 16px",
                        }}
                        aria-hidden="true"
                      />
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                          HIND BUILD CODE #
                        </span>
                        <div className="text-xl font-mono font-black text-white">
                          #{serviceNo}
                        </div>
                      </div>
                      <div className="relative z-10 w-12 h-12 bg-slate-800/90 border border-slate-700 flex items-center justify-center text-amber-400">
                        <IconComponent className="w-6 h-6" aria-hidden="true" />
                      </div>
                    </div>
                  )}

                  {/* Card Content Body */}
                  <div className="p-6 space-y-3">
                    {/* Header Row: Service Number & Tag */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
                        SERVICE {serviceNo}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-semibold">
                        HB-TRD-{serviceNo}
                      </span>
                    </div>

                    {/* Titles */}
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase font-display tracking-tight group-hover:text-amber-700 transition-colors">
                        <Link
                          href={`${prefix}/services/${service.slug}`}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                          {service.title}
                        </Link>
                      </h2>
                      {service.hindiTitle && (
                        <p className="text-xs text-amber-800 font-semibold mt-0.5">
                          {service.hindiTitle}
                        </p>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {service.shortDescription ||
                        service.fullDescription ||
                        "Specialized engineering trade executed with certified materials and written warranty."}
                    </p>

                    {/* Key Deliverables Pills */}
                    {featuresArray.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                          Key Deliverables:
                        </p>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {featuresArray.slice(0, 3).map((feat, fIdx) => (
                            <li
                              key={fIdx}
                              className="flex items-center gap-1.5 line-clamp-1"
                            >
                              <CheckCircle2
                                className="w-3.5 h-3.5 text-amber-600 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions (Accessible 44px+ touch targets) */}
                <div className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`${prefix}/services/${service.slug}`}
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-3 transition-colors group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href={`${prefix}/contact?service=${encodeURIComponent(
                        service.title
                      )}`}
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Quote</span>
                    </Link>
                  </div>

                  <a
                    href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
                      `Hello Hind Build, I would like to inquire about Service #${serviceNo}: ${service.title}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-wider px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <MessageSquare
                      className="w-3.5 h-3.5 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>Inquire via WhatsApp</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State when search has 0 results */
        <div className="bg-white border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full mx-auto flex items-center justify-center">
            <HelpCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 uppercase font-display">
              No Matching Service Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              No trade directly matches &ldquo;{searchQuery}&rdquo;. Hind Building
              Solutions handles turnkey custom engineering solutions across all
              civil and electrical domains.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="hbs-btn-primary min-h-[44px] px-5 text-xs font-bold uppercase tracking-wider"
            >
              Reset Search & View All {services.length} Services
            </button>
            <a
              href={`tel:${phoneRaw}`}
              className="hbs-btn-secondary min-h-[44px] px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Call Technical Desk: {phoneFormatted}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
