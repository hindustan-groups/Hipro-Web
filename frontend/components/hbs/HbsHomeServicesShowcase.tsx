"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { HbsService } from "@/lib/types";

interface HbsHomeServicesShowcaseProps {
  services: HbsService[];
  prefix: string;
  whatsappNumber?: string | null;
  phoneNumber?: string | null;
  headingConfig?: {
    badge?: string;
    title?: string;
    highlightText?: string;
    description?: string;
    ctaText?: string;
  };
}

const BADGE_COLORS: Record<string, { bg: string; text: string; hindiText: string }> = {
  "01": { bg: "bg-red-500", text: "text-white", hindiText: "text-red-600" },
  "02": { bg: "bg-blue-600", text: "text-white", hindiText: "text-blue-600" },
  "03": { bg: "bg-emerald-600", text: "text-white", hindiText: "text-emerald-600" },
  "04": { bg: "bg-rose-500", text: "text-white", hindiText: "text-rose-600" },
  "05": { bg: "bg-indigo-600", text: "text-white", hindiText: "text-indigo-600" },
  "06": { bg: "bg-amber-600", text: "text-white", hindiText: "text-amber-700" },
  "07": { bg: "bg-cyan-600", text: "text-white", hindiText: "text-cyan-600" },
  "08": { bg: "bg-orange-500", text: "text-white", hindiText: "text-orange-600" },
  "09": { bg: "bg-purple-600", text: "text-white", hindiText: "text-purple-600" },
  "10": { bg: "bg-orange-600", text: "text-white", hindiText: "text-orange-600" },
  "11": { bg: "bg-green-600", text: "text-white", hindiText: "text-green-600" },
  "12": { bg: "bg-sky-600", text: "text-white", hindiText: "text-sky-600" },
  "13": { bg: "bg-violet-600", text: "text-white", hindiText: "text-violet-600" },
  "14": { bg: "bg-red-600", text: "text-white", hindiText: "text-red-600" },
  "15": { bg: "bg-blue-700", text: "text-white", hindiText: "text-blue-700" },
  "16": { bg: "bg-slate-700", text: "text-white", hindiText: "text-slate-700" },
};

export default function HbsHomeServicesShowcase({
  services,
  prefix,
  headingConfig,
}: HbsHomeServicesShowcaseProps) {
  // Take up to 16 services
  const displayedServices = services.slice(0, 16);

  const badge = headingConfig?.badge || "OUR SERVICES";
  const titleLead = headingConfig?.title || "Complete";
  const titleHighlight = headingConfig?.highlightText || "Building Care Services";
  const description =
    headingConfig?.description ||
    "From small repairs to complete renovation, HiBUILD provides all building maintenance and construction support services under one roof.";
  const ctaText = headingConfig?.ctaText || "View All Services";

  return (
    <section aria-labelledby="services-showcase-heading" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-red-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                {badge}
              </span>
            </div>
            <h2
              id="services-showcase-heading"
              className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display"
            >
              {titleLead} <span className="text-blue-700">{titleHighlight}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              {description}
            </p>
          </div>

          <Link
            href={`${prefix}/services`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-900 text-blue-900 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider transition-all self-start md:self-end shrink-0"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 16-Card 4x4 Grid (2-column on mobile, 4-column on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {displayedServices.map((service, idx) => {
            const num = service.serviceNumber || String(idx + 1).padStart(2, "0");
            const color = BADGE_COLORS[num] || { bg: "bg-blue-600", text: "text-white", hindiText: "text-blue-600" };
            const serviceSlug = service.slug || `service-${num}`;

            return (
              <Link
                key={service.id || idx}
                href={`${prefix}/services/${serviceSlug}`}
                className="group flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-blue-600 hover:shadow-xl p-3 sm:p-4 transition-all duration-300"
              >
                {/* Header: Badge Number + Title + Hindi Subtitle */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black shrink-0 ${color.bg} ${color.text}`}>
                      {num}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors truncate">
                        {service.title}
                      </h3>
                      {service.hindiTitle && (
                        <p className={`text-[10px] sm:text-[11px] font-semibold leading-tight mt-0.5 truncate ${color.hindiText}`}>
                          {service.hindiTitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Photo Thumbnail with Floating Circle Arrow Button */}
                <div className="relative aspect-[16/11] w-full rounded-xl overflow-hidden bg-slate-900">
                  <Image
                    src={service.image || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop"}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                  {/* Floating White Circle Arrow */}
                  <div className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
