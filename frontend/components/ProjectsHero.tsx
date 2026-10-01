import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { CTAConfig } from "@/lib/cta";
import { resolveCTAHref } from "@/lib/cta";
import { isOptimizableImage } from "@/lib/imageUtils";

export interface ProjectHeroStat {
  id?: string;
  label: string;
  value: string;
  icon?: string;
}

export interface ProjectsHeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  ctaPrimary?: CTAConfig | null;
  ctaSecondary?: CTAConfig | null;
  stats?: ProjectHeroStat[];
  enabled?: boolean;
  isPreview?: boolean;
}

export const DEFAULT_PROJECTS_HERO = {
  eyebrow: "PROJECTS / PORTFOLIO",
  title: "ENGINEERED FOR REAL.\nBUILT TO LAST.",
  description:
    "Explore our portfolio of construction, architecture and engineering projects delivered across diverse sectors.",
  image:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "HiPRO Civil & Industrial Engineering Infrastructure Projects",
  enabled: true,
};

export default function ProjectsHero({
  eyebrow = DEFAULT_PROJECTS_HERO.eyebrow,
  title = DEFAULT_PROJECTS_HERO.title,
  description = DEFAULT_PROJECTS_HERO.description,
  image = DEFAULT_PROJECTS_HERO.image,
  imageAlt = DEFAULT_PROJECTS_HERO.imageAlt,
  ctaPrimary,
  ctaSecondary,
  stats = [],
  enabled = true,
  isPreview = false,
}: ProjectsHeroProps) {
  // If explicitly disabled and not in admin preview, render minimal fallback header
  if (!enabled && !isPreview) {
    return (
      <section className="bg-white pt-28 sm:pt-32 pb-8 px-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold font-display uppercase tracking-tight text-slate-950">
            {title ? title.replace(/\n+/g, " ") : "Projects Portfolio"}
          </h1>
          {description && (
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl font-light">
              {description}
            </p>
          )}
        </div>
      </section>
    );
  }

  const effectiveEyebrow = eyebrow?.trim() || DEFAULT_PROJECTS_HERO.eyebrow;
  const effectiveTitle = title?.trim() || DEFAULT_PROJECTS_HERO.title;
  const effectiveDescription =
    description?.trim() || DEFAULT_PROJECTS_HERO.description;
  const effectiveImage = image?.trim() || DEFAULT_PROJECTS_HERO.image;
  const effectiveImageAlt =
    imageAlt?.trim() || DEFAULT_PROJECTS_HERO.imageAlt;

  // Split title on newlines if provided for controlled multiline hierarchy
  const titleLines = effectiveTitle.split("\n").filter(Boolean);

  // Filter and display top authoritative statistics
  const displayStats = Array.isArray(stats) ? stats.slice(0, 3) : [];

  const primaryHref = ctaPrimary
    ? resolveCTAHref(ctaPrimary)
    : "#projects-list";
  const secondaryHref = ctaSecondary
    ? resolveCTAHref(ctaSecondary)
    : "/contact";

  return (
    <section className="relative bg-white pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/90 overflow-hidden">
      {/* Architectural Drafting Blueprint Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0F2C59 1px, transparent 1px), linear-gradient(to bottom, #0F2C59 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
        aria-hidden="true"
      />

      {/* Ambient Engineering Glows */}
      <div
        className="absolute -top-24 right-0 w-96 h-96 bg-slate-100/70 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 left-0 w-80 h-80 bg-red-50/40 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-center">
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN: Editorial Content & Hierarchy
              ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* 1. Eyebrow Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/90 text-construction-navy self-start mb-4 sm:mb-5 shadow-2xs">
              <span
                className="w-1.5 h-1.5 bg-construction-red shrink-0"
                aria-hidden="true"
              />
              <span className="text-[11px] font-bold uppercase tracking-widest font-mono">
                {effectiveEyebrow}
              </span>
            </div>

            {/* 2. Semantic H1 Header */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-slate-950 font-display uppercase tracking-tight leading-[1.12] mb-4">
              {titleLines.map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {/* 3. HiPRO Two-Tone Architectural Accent Bar */}
            <div className="flex w-28 h-1 mb-5" aria-hidden="true">
              <div className="w-1/3 h-full bg-yellow-500" />
              <div className="w-2/3 h-full bg-construction-navy" />
            </div>

            {/* 4. Supporting Lead Description */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl font-light leading-relaxed mb-7 sm:mb-8">
              {effectiveDescription}
            </p>

            {/* 5. Connected Action Navigation CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 sm:mb-10 max-w-md sm:max-w-none">
              {ctaPrimary?.enabled !== false && (
                isPreview ? (
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-6 py-3.5 rounded-none text-xs uppercase tracking-widest transition-all shadow-sm group"
                  >
                    <span>{ctaPrimary?.label ?? "Explore Portfolio"}</span>
                    <ArrowDown className="w-3.5 h-3.5 text-construction-red group-hover:translate-y-0.5 transition-transform" />
                  </button>
                ) : (
                  <a
                    href={primaryHref}
                    target={ctaPrimary?.openNewTab ? "_blank" : undefined}
                    rel={ctaPrimary?.openNewTab ? "noopener noreferrer" : undefined}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-6 py-3.5 rounded-none text-xs uppercase tracking-widest transition-all shadow-sm group"
                  >
                    <span>{ctaPrimary?.label ?? "Explore Portfolio"}</span>
                    <ArrowDown className="w-3.5 h-3.5 text-construction-red group-hover:translate-y-0.5 transition-transform" />
                  </a>
                )
              )}

              {ctaSecondary?.enabled !== false && (
                isPreview ? (
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-none border border-slate-300 text-xs uppercase tracking-widest transition-all shadow-2xs group"
                  >
                    <span>{ctaSecondary?.label ?? "Discuss Your Project"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <Link
                    href={secondaryHref}
                    target={ctaSecondary?.openNewTab ? "_blank" : undefined}
                    rel={ctaSecondary?.openNewTab ? "noopener noreferrer" : undefined}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-none border border-slate-300 text-xs uppercase tracking-widest transition-all shadow-2xs group"
                  >
                    <span>{ctaSecondary?.label ?? "Discuss Your Project"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )
              )}
            </div>

            {/* 6. Desktop Authoritative Statistics Strip (Hidden on mobile for strict mobile ordering) */}
            {displayStats.length > 0 && (
              <div className="hidden lg:grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/90">
                {displayStats.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    className="bg-slate-50/90 border border-slate-200/80 p-3.5 transition-colors hover:border-slate-300 shadow-2xs"
                  >
                    <div className="text-2xl font-bold font-display text-slate-950 tracking-tight">
                      {st.value}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mt-0.5">
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN: Architectural Hero Frame & Dynamic Imagery
              ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Outer Architectural Double-Border Frame */}
              <div className="relative bg-white border border-slate-200 p-2 sm:p-2.5 shadow-md shadow-slate-200/50">
                {/* Engineering Corner Registration Marks */}
                <div
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-construction-navy pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-construction-navy pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-construction-navy pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-construction-navy pointer-events-none"
                  aria-hidden="true"
                />

                {/* Inner Image Container */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full overflow-hidden bg-slate-100 border border-slate-200">
                  {effectiveImage ? (
                    isOptimizableImage(effectiveImage) ? (
                      <Image
                        src={effectiveImage}
                        alt={effectiveImageAlt}
                        fill
                        priority={!isPreview}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 550px"
                        className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                      />
                    ) : (
                      <img
                        src={effectiveImage}
                        alt={effectiveImageAlt}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <span className="text-xs font-mono uppercase tracking-wider">
                        No Hero Image Selected
                      </span>
                    </div>
                  )}

                  {/* Architectural Overlay Strip */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-3 sm:p-4 text-white flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-bold">
                        CIVIL &amp; INDUSTRIAL
                      </div>
                      <div className="text-xs sm:text-sm font-bold font-display uppercase tracking-tight">
                        VERIFIED PORTFOLIO
                      </div>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold bg-white/10 px-2 py-0.5 backdrop-blur-xs border border-white/20">
                      RAJASTHAN &amp; PAN-INDIA
                    </div>
                  </div>
                </div>
              </div>

              {/* Architectural Technical Detail Badge */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                  <span>STRUCTURED SPECIFICATIONS</span>
                </span>
                <span className="text-slate-400">TURNKEY STANDARDS</span>
              </div>
            </div>

            {/* 7. Mobile Authoritative Statistics Strip (Rendered after Hero Image per specification) */}
            {displayStats.length > 0 && (
              <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-6 border-t border-slate-200/90 mt-8">
                {displayStats.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    className="bg-slate-50 border border-slate-200/80 p-3 text-center shadow-2xs"
                  >
                    <div className="text-xl font-bold font-display text-slate-950 tracking-tight">
                      {st.value}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mt-0.5">
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
