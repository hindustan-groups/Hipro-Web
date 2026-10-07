"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Droplets,
  Hammer,
  Paintbrush,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Award,
} from "lucide-react";
import type { HbsService } from "@/lib/types";
import { getServiceWhatsAppUrl } from "@/lib/hbsWhatsApp";

interface HbsHomeServicesShowcaseProps {
  services: HbsService[];
  prefix: string;
  whatsappNumber?: string | null;
  phoneNumber?: string | null;
}

interface TabGroup {
  id: string;
  label: string;
  icon: any;
  slugs: string[];
}

const TAB_GROUPS: TabGroup[] = [
  {
    id: "featured",
    label: "Top Requested",
    icon: Sparkles,
    slugs: [
      "water-leakage-solution",
      "structure-repair",
      "painting-and-wall-repair",
      "plumbing-and-electrical",
    ],
  },
  {
    id: "waterproofing",
    label: "Waterproofing",
    icon: Droplets,
    slugs: [
      "water-leakage-solution",
      "terrace-and-bird-protection",
      "basement-and-retaining-wall",
      "tile-work",
    ],
  },
  {
    id: "structural",
    label: "Structural Repair",
    icon: Hammer,
    slugs: [
      "structure-repair",
      "concrete-core-cutting",
      "fabrication-work",
      "paver-block-and-boundary",
    ],
  },
  {
    id: "finishing",
    label: "Finishing & Facade",
    icon: Paintbrush,
    slugs: [
      "painting-and-wall-repair",
      "facade-work-acp-glass",
      "furniture-work",
      "wall-decor-and-wallpaper",
    ],
  },
  {
    id: "protection",
    label: "MEP & Protection",
    icon: ShieldCheck,
    slugs: [
      "termite-control",
      "ac-lift-and-solar",
      "electrical-and-machine-work",
      "safety-and-compliance",
    ],
  },
];

export default function HbsHomeServicesShowcase({
  services,
  prefix,
  whatsappNumber,
}: HbsHomeServicesShowcaseProps) {
  const [activeTab, setActiveTab] = useState("featured");

  // Get active tab definition
  const currentTab = TAB_GROUPS.find((t) => t.id === activeTab) || TAB_GROUPS[0];

  // Resolve services for active tab (fallback to first 4 if slug matching yields fewer)
  const tabServices = services
    .filter((s) => currentTab.slugs.includes(s.slug))
    .slice(0, 4);

  const displayServices =
    tabServices.length > 0 ? tabServices : services.slice(0, 4);

  return (
    <section
      id="services-section"
      aria-labelledby="services-heading"
      className="py-14 sm:py-20 border-b border-slate-200/80 bg-slate-50/50 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ── Compact Modern Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-[11px] font-mono font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span>19 SPECIALIST TRADES</span>
            </div>

            <h2
              id="services-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 font-display"
            >
              Building Repair &amp; Protection Services
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Certified non-destructive diagnostics, branded chemical barriers, and unified single-window warranty.
            </p>
          </div>

          <Link
            href={`${prefix}/services`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-amber-700 uppercase tracking-wider shrink-0 transition-colors group"
          >
            <span>View All 19 Trades</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* ── Sleek Category Tab Switcher (Alive & Interactive) ─────────── */}
        <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            {TAB_GROUPS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    isActive
                      ? "bg-slate-900 border-slate-900 text-white font-bold shadow-xs scale-[1.02]"
                      : "bg-white border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? "text-amber-400" : "text-slate-400"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Compact 4-Card Modern Grid (Short & Punchy) ───────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayServices.map((service, idx) => {
            const sNumber =
              service.serviceNumber ||
              String(services.indexOf(service) + 1 || idx + 1).padStart(2, "0");
            const waUrl = getServiceWhatsAppUrl(whatsappNumber, service.title);
            const imageUrl =
              service.image ||
              "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=800&auto=format&fit=crop";

            return (
              <div
                key={service.slug || idx}
                className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:border-amber-400 hover:shadow-hbs-card hover:-translate-y-1 transition-all duration-300 relative"
              >
                {/* Compact Thumbnail Container */}
                <div className="relative aspect-[16/11] w-full bg-slate-100 overflow-hidden shrink-0">
                  <Image
                    src={imageUrl}
                    alt={`${service.title} — Hind Build`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Trade Number Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-950/85 backdrop-blur-md rounded text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                    #{sNumber}
                  </div>

                  {/* Warranty Tag */}
                  {service.warrantyDetails && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-emerald-950/85 backdrop-blur-md rounded text-[9px] font-mono font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Award className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Warranty</span>
                    </div>
                  )}

                  {/* Hindi Subtitle On Image */}
                  {service.hindiTitle && (
                    <div className="absolute bottom-2 left-2.5 right-2.5">
                      <p className="text-[11px] font-medium text-amber-300/90 tracking-wide truncate">
                        {service.hindiTitle}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-display line-clamp-1">
                      <Link href={`${prefix}/services/${service.slug}`}>
                        {service.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {service.shortDescription ||
                        "Engineering diagnostics, certified chemicals, and guaranteed restoration."}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`${prefix}/services/${service.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-amber-700 transition-colors"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Inquire about ${service.title} on WhatsApp`}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                      title="Quick WhatsApp Inquiry"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Compact All 19 Trades Capsule Strip (Modern, Not Ruka) ───── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
            <span className="font-semibold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>All 19 Building Maintenance Trades</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Click any trade to view specifications
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {services.map((svc, idx) => {
              const sNum =
                svc.serviceNumber ||
                String(idx + 1).padStart(2, "0");

              return (
                <Link
                  key={svc.slug || idx}
                  href={`${prefix}/services/${svc.slug}`}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-300 text-xs transition-all duration-150 hover:-translate-y-0.5"
                >
                  <span className="text-[10px] font-mono font-bold text-amber-700">
                    #{sNum}
                  </span>
                  <span className="text-slate-700 group-hover:text-amber-900 font-medium">
                    {svc.title}
                  </span>
                  <ArrowRight className="w-2.5 h-2.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
