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
            className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="hbs-service-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services — e.g. leakage, cracks, CCTV"
            className="w-full h-12 sm:h-14 pl-11 pr-12 rounded-xl border border-slate-200 bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500" aria-live="polite">
          {isSearching
            ? `${results.length} of ${services.length} services match “${query.trim()}”`
            : `${services.length} services`}
        </p>
      </div>

      {/* ── Featured (server-rendered, hidden during search) ───── */}
      {!isSearching && children}

      {/* ── All services ───────────────────────────────────────── */}
      <section
        aria-labelledby="all-services-heading"
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20"
      >
        <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-slate-200">
          <h2
            id="all-services-heading"
            className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900"
          >
            {isSearching ? "Search results" : "All services"}
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {String(results.length).padStart(2, "0")}
          </span>
        </div>

        {results.length > 0 ? (
          <ul className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
            {results.map((service, i) => {
              const no =
                service.serviceNumber ||
                String(services.indexOf(service) + 1 || i + 1).padStart(2, "0");
              return (
                <li key={service.id || service.slug} className="border-b border-slate-100">
                  <Link
                    href={`${prefix}/services/${service.slug}`}
                    className="group flex items-center gap-4 py-4 min-h-[88px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                  >
                    <div className="relative w-20 h-16 sm:w-24 sm:h-[72px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {service.image ? (
                        <Image
                          src={service.image}
                          alt={`${service.title} — Hind Build`}
                          fill
                          sizes="96px"
                          loading="lazy"
                          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          #{no}
                        </span>
                        <h3 className="text-[15px] sm:text-base font-semibold text-slate-900 truncate">
                          {service.title}
                        </h3>
                      </div>
                      {service.shortDescription && (
                        <p className="mt-1 text-[13px] text-slate-500 leading-snug line-clamp-1 sm:line-clamp-2">
                          {service.shortDescription}
                        </p>
                      )}
                    </div>

                    <span className="hidden sm:inline text-xs font-medium text-slate-400 group-hover:text-slate-900 transition-colors">
                      Explore
                    </span>
                    <ArrowUpRight
                      className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-600">
              No service matches “{query.trim()}”.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setQuery("")}
                className="min-h-[44px] px-5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Show all services
              </button>
              <Link
                href={`${prefix}/contact`}
                data-hbs-cta="quote"
                className="min-h-[44px] px-5 inline-flex items-center rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"
              >
                Describe your problem
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
