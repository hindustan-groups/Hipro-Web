"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowUpRight } from "lucide-react";
import type { HbsService } from "@/lib/types";

interface HbsServicesDirectoryProps {
  services: HbsService[];
  prefix: string;
  /** Server-rendered featured section. Hidden while a search query is active. */
  children?: ReactNode;
}

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function HbsServicesDirectory({
  services,
  prefix,
  children,
}: HbsServicesDirectoryProps) {
  const [query, setQuery] = useState("");

  // Build the search index once: name + description + scope (features).
  const index = useMemo(
    () =>
      services.map((s) => ({
        service: s,
        haystack: [
          s.serviceNumber,
          s.title,
          s.hindiTitle,
          s.shortDescription,
          s.fullDescription,
          ...parseList(s.features),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      })),
    [services]
  );

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return services;
    const terms = q.split(/\s+/);
    return index
      .filter((entry) => terms.every((t) => entry.haystack.includes(t)))
      .map((entry) => entry.service);
  }, [index, q, services]);

  const isSearching = q.length > 0;

  return (
    <div>
      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative">
          <label htmlFor="hbs-service-search" className="sr-only">
            Search services
          </label>
          <Search
            className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="hbs-service-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services — e.g. leakage, waterproofing, cracks, CCTV, painting..."
            className="w-full h-13 sm:h-14 pl-12 pr-12 rounded-2xl border border-slate-200 bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-500/10 shadow-xs transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <p aria-live="polite">
            {isSearching ? (
              <span className="font-medium text-slate-700">
                Found <span className="text-red-600 font-bold">{results.length}</span> of {services.length} services matching “{query.trim()}”
              </span>
            ) : (
              <span>Showing all <strong className="text-slate-900 font-bold">{services.length}</strong> specialized engineering services</span>
            )}
          </p>
          {isSearching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
            >
              Reset search
            </button>
          )}
        </div>
      </div>

      {/* ── Featured (server-rendered, hidden during search) ───── */}
      {!isSearching && children}

      {/* ── All services ───────────────────────────────────────── */}
      <section
        aria-labelledby="all-services-heading"
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 font-mono block">
              Catalog Directory
            </span>
            <h2
              id="all-services-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
            >
              {isSearching ? "Matching Solutions" : "All 19 Engineering Services"}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
            {String(results.length).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
          </span>
        </div>

        {results.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((service, i) => {
              const no =
                service.serviceNumber ||
                String(services.indexOf(service) + 1 || i + 1).padStart(2, "0");
              return (
                <div key={service.id || service.slug}>
                  <Link
                    href={`${prefix}/services/${service.slug}`}
                    className="group relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/60">
                      {service.image ? (
                        <Image
                          src={service.image}
                          alt={`${service.title} — Hind Build`}
                          fill
                          sizes="96px"
                          loading="lazy"
                          className="object-cover transition-transform duration-500 group-hover:scale-108 motion-reduce:transition-none"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-xs font-bold">
                          HB
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[11px] font-mono font-bold text-red-600 bg-red-50 border border-red-200/70 px-2 py-0.5 rounded-md">
                            #{no}
                          </span>
                          {service.hindiTitle && (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                              {service.hindiTitle}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                          {service.title}
                        </h3>
                        {service.shortDescription && (
                          <p className="mt-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-2">
                            {service.shortDescription}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500 font-medium group-hover:text-red-600 transition-colors">
                          Explore Scope &amp; Warranty
                        </span>
                        <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-red-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all">
                          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-slate-50/60 rounded-2xl border border-slate-200/80 mt-6 px-4">
            <p className="text-base font-semibold text-slate-800">
              No service matches “{query.trim()}”.
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Our engineering team handles custom civil, commercial, and structural problems. Contact us directly for a custom site evaluation.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setQuery("")}
                className="min-h-[44px] px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
              >
                Show All 19 Services
              </button>
              <Link
                href={`${prefix}/contact`}
                data-hbs-cta="quote"
                className="min-h-[44px] px-6 inline-flex items-center rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 shadow-sm transition-colors"
              >
                Request Custom Inspection
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

