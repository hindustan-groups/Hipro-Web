"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Droplets,
  Hammer,
  Wrench,
  Paintbrush,
  ShieldCheck,
  Search,
  X,
  ArrowRight,
  ArrowUpRight,
  Check,
  MessageSquare,
  LayoutGrid,
  ListFilter,
  Sparkles,
  Award,
  Phone,
  Clock,
} from "lucide-react";
import type { HbsService } from "@/lib/types";
import { getServiceWhatsAppUrl } from "@/lib/hbsWhatsApp";

interface HbsHomeServicesShowcaseProps {
  services: HbsService[];
  prefix: string;
  whatsappNumber?: string | null;
  phoneNumber?: string | null;
}

type CategoryKey = "ALL" | "WATERPROOFING" | "STRUCTURAL" | "MEP" | "FINISHING" | "SAFETY_CARE";

interface CategoryMeta {
  key: CategoryKey;
  label: string;
  shortLabel: string;
  icon: any;
  color: string;
  slugs: string[];
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: "ALL",
    label: "All 19 Specialist Trades",
    shortLabel: "All Trades",
    icon: Layers,
    color: "amber",
    slugs: [],
  },
  {
    key: "WATERPROOFING",
    label: "Waterproofing & Leakage",
    shortLabel: "Waterproofing",
    icon: Droplets,
    color: "blue",
    slugs: [
      "water-leakage-solution",
      "terrace-and-bird-protection",
      "basement-and-retaining-wall",
      "tile-work",
    ],
  },
  {
    key: "STRUCTURAL",
    label: "Structural & Concrete Repair",
    shortLabel: "Structural",
    icon: Hammer,
    color: "stone",
    slugs: [
      "structure-repair",
      "concrete-core-cutting",
      "fabrication-work",
      "paver-block-and-boundary",
    ],
  },
  {
    key: "MEP",
    label: "Plumbing, Electrical & Solar",
    shortLabel: "MEP & Solar",
    icon: Wrench,
    color: "emerald",
    slugs: [
      "plumbing-and-electrical",
      "ac-lift-and-solar",
      "electrical-and-machine-work",
      "smart-home-automation",
      "drain-and-sewer-pipeline",
    ],
  },
  {
    key: "FINISHING",
    label: "Painting, Facade & Interiors",
    shortLabel: "Finishing & Facade",
    icon: Paintbrush,
    color: "violet",
    slugs: [
      "painting-and-wall-repair",
      "facade-work-acp-glass",
      "furniture-work",
      "wall-decor-and-wallpaper",
    ],
  },
  {
    key: "SAFETY_CARE",
    label: "Safety, Pest & Facility Care",
    shortLabel: "Protection & Care",
    icon: ShieldCheck,
    color: "rose",
    slugs: [
      "termite-control",
      "safety-and-compliance",
      "cctv-and-security",
      "cleaning-services",
      "gardening",
      "packers-and-movers",
    ],
  },
];

function parseFeatures(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export default function HbsHomeServicesShowcase({
  services,
  prefix,
  whatsappNumber,
  phoneNumber,
}: HbsHomeServicesShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "matrix">("grid");

  // Determine category for each service
  const serviceCategoryMap = useMemo(() => {
    const map = new Map<string, CategoryKey>();
    services.forEach((s) => {
      const slug = s.slug || "";
      const cat = CATEGORIES.find(
        (c) => c.key !== "ALL" && c.slugs.includes(slug)
      );
      map.set(slug, cat ? cat.key : "ALL");
    });
    return map;
  }, [services]);

  // Compute category count badges
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      ALL: services.length,
      WATERPROOFING: 0,
      STRUCTURAL: 0,
      MEP: 0,
      FINISHING: 0,
      SAFETY_CARE: 0,
    };
    services.forEach((s) => {
      const cat = serviceCategoryMap.get(s.slug || "");
      if (cat && cat !== "ALL") {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [services, serviceCategoryMap]);

  // Filtered list
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      // Category filter
      if (activeCategory !== "ALL") {
        const cat = serviceCategoryMap.get(s.slug || "");
        if (cat !== activeCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const features = parseFeatures(s.features).join(" ").toLowerCase();
        const hay = `${s.serviceNumber || ""} ${s.title || ""} ${s.hindiTitle || ""} ${s.shortDescription || ""} ${features}`.toLowerCase();
        return hay.includes(q);
      }

      return true;
    });
  }, [services, activeCategory, searchQuery, serviceCategoryMap]);

  return (
    <section
      id="services-section"
      aria-labelledby="services-showcase-heading"
      className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-50/50 relative overflow-hidden"
    >
      {/* Background Architectural Accent Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10 sm:space-y-12">
        {/* ── Section Header ────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200/70 pb-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-900 text-xs font-mono font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>19 SPECIALIST BUILDING TRADES</span>
            </div>

            <h2
              id="services-showcase-heading"
              className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 font-display leading-[1.15]"
            >
              Comprehensive Building Maintenance &amp; Protection
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              From precision leak diagnosis and structural rebar strengthening to interior finishes and facility upkeep. All 19 trades execute under our single-window warranty.
            </p>
          </div>

          {/* Quick Stats & View Mode Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Card Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                aria-label="Matrix Table View"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "matrix"
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Specs Matrix</span>
              </button>
            </div>

            <Link
              href={`${prefix}/services`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-md"
            >
              <span>All 19 Specs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Emergency Diagnostic Ribbon ─────────────────────────────────── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>Rapid Engineering Dispatch</span>
                <span className="text-slate-400">· 24 to 48 Hours</span>
              </p>
              <h3 className="text-sm sm:text-base font-bold text-white font-display">
                Active Water Seepage, Structural Cracks, or Aging Facade Issues?
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call Engineer</span>
              </a>
            )}
            <Link
              href={`${prefix}/contact`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Book Site Diagnosis</span>
            </Link>
          </div>
        </div>

        {/* ── Interactive Category Filter Tabs & Quick Search ──────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Tabs (Horizontally scrollable on mobile) */}
            <div className="overflow-x-auto pb-1.5 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-2 min-w-max">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.key;
                  const count = categoryCounts[cat.key] || 0;

                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveCategory(cat.key)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                        isActive
                          ? "bg-slate-900 border-slate-900 text-white font-bold shadow-sm"
                          : "bg-white border-slate-200/90 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-amber-400" : "text-slate-400"
                        }`}
                      />
                      <span>{cat.shortLabel}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? "bg-slate-800 text-amber-300"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Live Search Filter */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter trades (e.g. leakage, crack, paint)..."
                className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Result Status */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <span>
              Showing {filteredServices.length} of {services.length} specialized trades
              {searchQuery && ` for “${searchQuery}”`}
            </span>
            {(activeCategory !== "ALL" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("ALL");
                  setSearchQuery("");
                }}
                className="text-amber-700 hover:text-amber-900 font-semibold underline underline-offset-2"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* ── View Mode: 1. Rich Card Grid ─────────────────────────────────── */}
        {viewMode === "grid" ? (
          filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredServices.map((service, idx) => {
                const sNumber =
                  service.serviceNumber ||
                  String(services.indexOf(service) + 1 || idx + 1).padStart(2, "0");
                const featuresList = parseFeatures(service.features).slice(0, 3);
                const waUrl = getServiceWhatsAppUrl(whatsappNumber, service.title);
                const imageUrl =
                  service.image ||
                  "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=800&auto=format&fit=crop";

                return (
                  <article
                    key={service.slug || service.id || idx}
                    className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:border-amber-400 hover:shadow-hbs-card hover:-translate-y-1.5 transition-all duration-300 relative"
                  >
                    {/* Top Media Container */}
                    <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden shrink-0">
                      <Image
                        src={imageUrl}
                        alt={`${service.title} — Hind Build`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Gentle Architectural Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-1 bg-slate-950/85 backdrop-blur-md rounded-md text-[11px] font-mono font-bold text-amber-400 border border-amber-500/30 shadow-xs">
                          TRADE #{sNumber}
                        </span>

                        {service.warrantyDetails && (
                          <span className="px-2 py-0.5 bg-emerald-950/85 backdrop-blur-md rounded-md text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                            <Award className="w-3 h-3 text-emerald-400" />
                            <span>Warranty</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Title on Image for immediate recognition */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 pointer-events-none">
                        {service.hindiTitle && (
                          <p className="text-[11px] font-medium text-amber-300/90 tracking-wide font-sans line-clamp-1">
                            {service.hindiTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-display line-clamp-1">
                          <Link href={`${prefix}/services/${service.slug}`}>
                            {service.title}
                          </Link>
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {service.shortDescription ||
                            "Engineering diagnostics, certified barrier application, and guaranteed long-term rehabilitation."}
                        </p>

                        {/* Micro Spec Pills */}
                        {featuresList.length > 0 && (
                          <div className="pt-1 space-y-1.5">
                            {featuresList.map((feat, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-start gap-1.5 text-[11px] text-slate-600"
                              >
                                <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-1 font-medium">{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          href={`${prefix}/services/${service.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-amber-700 transition-colors group/btn"
                        >
                          <span>Explore Specs</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Inquire about ${service.title} on WhatsApp`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold transition-colors"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>Inquire</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                No matching trade found for “{searchQuery}”
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-amber-700 font-bold hover:underline"
              >
                Clear filter &amp; view all 19 trades
              </button>
            </div>
          )
        ) : (
          /* ── View Mode: 2. Architectural Specs Matrix (Table View) ──────── */
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th scope="col" className="py-3.5 px-4 w-16">Trade</th>
                    <th scope="col" className="py-3.5 px-4">Service &amp; Hindi Title</th>
                    <th scope="col" className="py-3.5 px-4 hidden md:table-cell">Key Specifications</th>
                    <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">Warranty</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map((service, idx) => {
                    const sNumber =
                      service.serviceNumber ||
                      String(services.indexOf(service) + 1 || idx + 1).padStart(2, "0");
                    const featuresList = parseFeatures(service.features).slice(0, 2);
                    const waUrl = getServiceWhatsAppUrl(whatsappNumber, service.title);

                    return (
                      <tr
                        key={service.slug || service.id || idx}
                        className="hover:bg-amber-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                          #{sNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`${prefix}/services/${service.slug}`}
                            className="font-bold text-slate-900 hover:text-amber-800 transition-colors font-display text-sm block"
                          >
                            {service.title}
                          </Link>
                          {service.hindiTitle && (
                            <span className="text-[11px] text-slate-400 font-sans block pt-0.5">
                              {service.hindiTitle}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell text-slate-600">
                          {featuresList.length > 0 ? (
                            <ul className="space-y-0.5">
                              {featuresList.map((f, i) => (
                                <li key={i} className="line-clamp-1 text-[11px]">
                                  • {f}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">
                              Turnkey engineering protocol
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold">
                            <Award className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate max-w-[120px]">
                              {service.warrantyDetails || "Turnkey Guarantee"}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`${prefix}/services/${service.slug}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-semibold text-[11px] transition-colors"
                            >
                              Specs
                            </Link>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] transition-colors"
                            >
                              Inquire
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Bottom Multi-Trade Consultation Card ──────────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700">
              Single-Window Turnkey Contract
            </span>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 font-display">
              Executing Multiple Renovation &amp; Maintenance Trades Together?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Eliminate disputes between independent masons, plumbers, and painters. Hind Build assigns a dedicated civil engineer with consolidated itemized estimates, standardized chemical brands, and a unified written guarantee.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={`${prefix}/services`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href={`${prefix}/contact`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <span>Request Custom BOQ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
