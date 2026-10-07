"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  ArrowRight,
  Wrench,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Maximize2,
  FolderKanban,
  FileText,
  Phone,
  MessageSquare,
  ShieldCheck,
  HardHat,
} from "lucide-react";
import type { HbsProject, HbsService } from "@/lib/types";
import { buildHbsWhatsAppUrl } from "@/lib/hbsWhatsApp";

interface HbsProjectsDirectoryProps {
  projects: HbsProject[];
  services: HbsService[];
  prefix: string;
  whatsappRaw: string;
  phoneRaw: string;
  phoneFormatted: string;
}

export default function HbsProjectsDirectory({
  projects,
  services,
  prefix,
  whatsappRaw,
  phoneRaw,
  phoneFormatted,
}: HbsProjectsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Map serviceCategory to actual service slug if one exists
  const serviceSlugMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of services) {
      if (s.title && s.slug) {
        map.set(s.title.toLowerCase().trim(), s.slug);
        map.set(s.slug.toLowerCase().trim(), s.slug);
      }
    }
    return map;
  }, [services]);

  // Filter projects by title, location, clientType, serviceCategory, description
  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((project) => {
      const matchTitle = project.title?.toLowerCase().includes(q);
      const matchLocation = project.location?.toLowerCase().includes(q);
      const matchClient = project.clientType?.toLowerCase().includes(q);
      const matchCategory = project.serviceCategory?.toLowerCase().includes(q);
      const matchDesc = project.description?.toLowerCase().includes(q);

      let matchScope = false;
      try {
        if (project.scopeOfWork) {
          const scope =
            typeof project.scopeOfWork === "string"
              ? JSON.parse(project.scopeOfWork)
              : project.scopeOfWork;
          if (Array.isArray(scope)) {
            matchScope = scope.some((item: any) =>
              (typeof item === "string" ? item : item?.title || item?.desc || "")
                .toLowerCase()
                .includes(q)
            );
          }
        }
      } catch {}

      return (
        matchTitle ||
        matchLocation ||
        matchClient ||
        matchCategory ||
        matchDesc ||
        matchScope
      );
    });
  }, [projects, searchQuery]);

  // ─────────────────────────────────────────────────────────────────
  // ZERO-PROJECT EMPTY STATE (When no projects exist in CMS)
  // ─────────────────────────────────────────────────────────────────
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-14 text-center space-y-6 max-w-4xl mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200/80 mx-auto flex items-center justify-center shadow-xs">
          <FolderKanban className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200/70 text-red-600 font-mono text-xs font-bold uppercase tracking-wider rounded-full">
            <span>Portfolio Archive</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Field Records Are Being Prepared
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Project case studies, non-destructive audit reports, and technical
            documentation will appear here as they are published through the Hind Build
            project management system.
          </p>
        </div>

        {/* Technical Guarantee Note */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4.5 max-w-lg mx-auto text-left flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-800 font-bold block">
              Standardized Quality Protocol
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every site executed by Hind Build undergoes itemized
              BOQ accounting, certified material usage, and written warranty
              handover.
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`${prefix}/contact`}
            data-hbs-cta="quote"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider w-full sm:w-auto rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Book a Site Inspection</span>
          </Link>

          <Link
            href={`${prefix}/contact`}
            data-hbs-cta="quote"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0D2D5E] hover:bg-[#0A2349] text-white text-xs font-bold uppercase tracking-wider w-full sm:w-auto rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Request Itemized Quote</span>
          </Link>

          <a
            href={buildHbsWhatsAppUrl(
              whatsappRaw,
              "Hi Hind Build, I would like to schedule a site inspection for my property."
            )}
            target="_blank"
            rel="noopener noreferrer"
            data-hbs-cta="whatsapp"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider w-full sm:w-auto rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // ACTIVE PROJECT DIRECTORY (When projects exist in CMS)
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Search & Results Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <label htmlFor="hbs-project-search" className="sr-only">
              Search Projects
            </label>
            <div className="relative">
              <Search
                className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="hbs-project-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by project name, location, client, or scope..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm pl-12 pr-12 py-3.5 rounded-xl focus:outline-none focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-500/10 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search input"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 focus:outline-none transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
            <span className="text-slate-500 font-mono">
              Showing{" "}
              <strong className="text-red-600 font-bold">
                {filteredProjects.length}
              </strong>{" "}
              of {projects.length} field records
            </span>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline cursor-pointer"
              >
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            const projectNo = String(index + 1).padStart(2, "0");

            // Extract primary image
            let primaryImage: string | null = null;
            try {
              if (project.images) {
                const parsed =
                  typeof project.images === "string"
                    ? JSON.parse(project.images)
                    : project.images;
                if (Array.isArray(parsed) && parsed.length > 0) {
                  primaryImage = parsed[0];
                }
              }
            } catch {}

            // Parse scope of work if available
            let scopeItems: string[] = [];
            try {
              if (project.scopeOfWork) {
                const parsed =
                  typeof project.scopeOfWork === "string"
                    ? JSON.parse(project.scopeOfWork)
                    : project.scopeOfWork;
                if (Array.isArray(parsed)) {
                  scopeItems = parsed.map((item: any) =>
                    typeof item === "string" ? item : item?.title || item?.desc || ""
                  ).filter(Boolean);
                }
              }
            } catch {}

            // Check if serviceCategory maps to a known service
            const matchedSlug = project.serviceCategory
              ? serviceSlugMap.get(project.serviceCategory.toLowerCase().trim())
              : null;

            return (
              <article
                key={project.id || project.slug || index}
                id={project.slug || `record-${index}`}
                className="group relative flex flex-col justify-between bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 scroll-mt-28"
              >
                <div>
                  {/* Top Image or Technical Blueprint Frame */}
                  {primaryImage ? (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 border-b border-slate-200/80">
                      <Image
                        src={primaryImage}
                        alt={`${project.title} - Hind Build`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-[#0D2D5E]/90 backdrop-blur-md text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                          RECORD #{projectNo}
                        </span>
                        {project.featured && (
                          <span className="bg-red-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-32 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200/80 p-5 flex items-center justify-between overflow-hidden">
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-mono text-red-600 uppercase tracking-widest font-bold">
                          FIELD RECORD
                        </span>
                        <div className="text-2xl font-mono font-black text-slate-900">
                          #{projectNo}
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center gap-2">
                        {project.featured && (
                          <span className="bg-red-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                            Featured
                          </span>
                        )}
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-red-600">
                          <HardHat className="w-5 h-5" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Content Body */}
                  <div className="p-5 sm:p-6 space-y-3">
                    {/* Header Row: Category Badge & Location */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      {project.serviceCategory ? (
                        matchedSlug ? (
                          <Link
                            href={`${prefix}/services/${matchedSlug}`}
                            className="font-mono text-[11px] uppercase font-bold text-red-700 bg-red-50 px-2.5 py-0.5 border border-red-200/70 hover:bg-red-100 transition-colors rounded-md"
                          >
                            {project.serviceCategory}
                          </Link>
                        ) : (
                          <span className="font-mono text-[11px] uppercase font-bold text-red-700 bg-red-50 px-2.5 py-0.5 border border-red-200/70 rounded-md">
                            {project.serviceCategory}
                          </span>
                        )
                      ) : (
                        <span className="font-mono text-[11px] uppercase font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          Engineering Record
                        </span>
                      )}

                      {project.location && (
                        <span className="flex items-center gap-1 font-mono text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />
                          <span className="truncate max-w-[140px]">{project.location}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-red-600 transition-colors leading-snug">
                      {project.slug ? (
                        <Link
                          href={`${prefix}/projects/${project.slug}`}
                          className="focus-visible:outline-none focus-visible:underline underline-offset-4"
                        >
                          {project.title}
                        </Link>
                      ) : (
                        project.title
                      )}
                    </h3>

                    {/* Optional Client / Date Row */}
                    {(project.clientType || project.date) && (
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                        {project.clientType && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" aria-hidden="true" />
                            <span>{project.clientType}</span>
                          </span>
                        )}
                        {project.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" aria-hidden="true" />
                            <span>{project.date}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {project.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 font-sans">
                        {project.description}
                      </p>
                    )}

                    {/* Key Technical Scope Points */}
                    {scopeItems.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                          Executed Scope:
                        </p>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {scopeItems.slice(0, 2).map((item, sIdx) => (
                            <li key={sIdx} className="flex items-center gap-1.5 line-clamp-1 font-medium">
                              <CheckCircle2
                                className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technical Specifications (Area / Duration) */}
                    {(project.areaTreated || project.durationDays) && (
                      <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-slate-600">
                        {project.areaTreated && (
                          <span className="flex items-center gap-1">
                            <Maximize2 className="w-3 h-3 text-red-600" aria-hidden="true" />
                            <span>Area: {project.areaTreated}</span>
                          </span>
                        )}
                        {project.durationDays && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#0D2D5E]" aria-hidden="true" />
                            <span>{project.durationDays} Days</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono font-medium">
                    {project.status ? `Status: ${project.status}` : "Verified Field Work"}
                  </span>

                  {project.slug ? (
                    <Link
                      href={`${prefix}/projects/${project.slug}`}
                      data-hbs-cta="explore"
                      className="min-h-[40px] inline-flex items-center gap-1 font-bold text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-wider text-xs px-2.5 py-1 rounded-lg focus-visible:outline-none"
                    >
                      <span>Explore Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      href={`${prefix}/contact?project=${encodeURIComponent(project.title)}`}
                      data-hbs-cta="quote"
                      className="min-h-[40px] inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 uppercase tracking-wider text-xs px-2.5 py-1 rounded-lg"
                    >
                      <span>Inquire About Scope</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty search results */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              No Matching Field Records Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              No project records match &ldquo;{searchQuery}&rdquo;. Try another term
              or reset the search filter.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="min-h-[44px] px-5 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
          >
            Reset Search &amp; View All {projects.length} Records
          </button>
        </div>
      )}
    </div>
  );
}

