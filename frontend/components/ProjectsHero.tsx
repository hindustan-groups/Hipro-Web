"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import type { CTAConfig } from "@/lib/cta";
import { resolveCTAHref } from "@/lib/cta";
import { isOptimizableImage } from "@/lib/imageUtils";
import type { Project } from "@/lib/types";

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
  projects?: Project[];
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

interface HeroSlideItem {
  id: string;
  image: string;
  imageAlt: string;
  title: string;
  category: string;
  location: string;
  href?: string;
}

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
  projects = [],
}: ProjectsHeroProps) {
  const effectiveEyebrow = eyebrow?.trim() || DEFAULT_PROJECTS_HERO.eyebrow;
  const effectiveTitle = title?.trim() || DEFAULT_PROJECTS_HERO.title;
  const effectiveDescription =
    description?.trim() || DEFAULT_PROJECTS_HERO.description;
  const effectiveFallbackImage = image?.trim() || DEFAULT_PROJECTS_HERO.image;
  const effectiveFallbackAlt =
    imageAlt?.trim() || DEFAULT_PROJECTS_HERO.imageAlt;

  // Build rotating slides from active/published projects
  const activeSlides = useMemo<HeroSlideItem[]>(() => {
    if (Array.isArray(projects) && projects.length > 0) {
      const validProjects = projects.filter(
        (p) =>
          p &&
          typeof p.image === "string" &&
          p.image.trim().length > 0 &&
          p.status !== "archived"
      );

      if (validProjects.length > 0) {
        return validProjects.map((p, idx) => ({
          id: p.id || p.slug || `project-${idx}`,
          image: p.image.trim(),
          imageAlt:
            p.imageAlt?.trim() ||
            `${p.title} - ${p.category || "Turnkey Engineering"} Project by HiPRO`,
          title: p.title || "Turnkey Industrial Project",
          category: p.category || "CIVIL & INDUSTRIAL",
          location: p.location || p.city || "RAJASTHAN & PAN-INDIA",
          href: p.slug
            ? `/projects/${p.slug}`
            : p.id
            ? `/projects/${p.id}`
            : undefined,
        }));
      }
    }

    // Fallback if no projects with images are available
    if (effectiveFallbackImage) {
      return [
        {
          id: "default-hero-slide",
          image: effectiveFallbackImage,
          imageAlt: effectiveFallbackAlt,
          title: "ENGINEERED FOR REAL. BUILT TO LAST.",
          category: "CIVIL & INDUSTRIAL",
          location: "RAJASTHAN & PAN-INDIA",
          href: undefined,
        },
      ];
    }

    return [];
  }, [projects, effectiveFallbackImage, effectiveFallbackAlt]);

  // Slideshow State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Keep index within bounds if slide count changes
  useEffect(() => {
    if (currentIdx >= activeSlides.length) {
      setCurrentIdx(0);
    }
  }, [activeSlides.length, currentIdx]);

  // Auto-advance slideshow every 4.5 seconds
  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeSlides.length, isPaused]);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCurrentIdx((prev) =>
        prev === 0 ? activeSlides.length - 1 : prev - 1
      );
    },
    [activeSlides.length]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCurrentIdx((prev) => (prev + 1) % activeSlides.length);
    },
    [activeSlides.length]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

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

  const currentSlide = activeSlides[currentIdx] || activeSlides[0];

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
              {ctaPrimary?.enabled !== false &&
                (isPreview ? (
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-6 py-3.5 rounded-none text-xs uppercase tracking-widest transition-all shadow-sm group cursor-pointer"
                  >
                    <span>{ctaPrimary?.label ?? "Explore Portfolio"}</span>
                    <ArrowDown className="w-3.5 h-3.5 text-construction-red group-hover:translate-y-0.5 transition-transform" />
                  </button>
                ) : (
                  <a
                    href={primaryHref}
                    target={ctaPrimary?.openNewTab ? "_blank" : undefined}
                    rel={
                      ctaPrimary?.openNewTab ? "noopener noreferrer" : undefined
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-6 py-3.5 rounded-none text-xs uppercase tracking-widest transition-all shadow-sm group"
                  >
                    <span>{ctaPrimary?.label ?? "Explore Portfolio"}</span>
                    <ArrowDown className="w-3.5 h-3.5 text-construction-red group-hover:translate-y-0.5 transition-transform" />
                  </a>
                ))}

              {ctaSecondary?.enabled !== false &&
                (isPreview ? (
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-none border border-slate-300 text-xs uppercase tracking-widest transition-all shadow-2xs group cursor-pointer"
                  >
                    <span>{ctaSecondary?.label ?? "Discuss Your Project"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <Link
                    href={secondaryHref}
                    target={ctaSecondary?.openNewTab ? "_blank" : undefined}
                    rel={
                      ctaSecondary?.openNewTab
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-none border border-slate-300 text-xs uppercase tracking-widest transition-all shadow-2xs group"
                  >
                    <span>{ctaSecondary?.label ?? "Discuss Your Project"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
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
              RIGHT COLUMN: Architectural Hero Frame & Auto-Rotating Projects
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

                {/* Inner Image Container (Auto-Rotating Project Carousel) */}
                <div
                  className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full overflow-hidden bg-slate-950 border border-slate-200 select-none group"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {activeSlides.length > 0 ? (
                    <>
                      {/* Render all slides with cross-fade opacity transitions */}
                      {activeSlides.map((slide, idx) => {
                        const isActive = idx === currentIdx;
                        return (
                          <div
                            key={slide.id || idx}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                              isActive
                                ? "opacity-100 z-10 pointer-events-auto"
                                : "opacity-0 z-0 pointer-events-none"
                            }`}
                            aria-hidden={!isActive}
                          >
                            {isOptimizableImage(slide.image) ? (
                              <Image
                                src={slide.image}
                                alt={slide.imageAlt}
                                fill
                                priority={idx === 0 && !isPreview}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 550px"
                                className={`object-cover transition-transform duration-700 ${
                                  isActive ? "scale-100" : "scale-105"
                                }`}
                              />
                            ) : (
                              <img
                                src={slide.image}
                                alt={slide.imageAlt}
                                className={`w-full h-full object-cover transition-transform duration-700 ${
                                  isActive ? "scale-100" : "scale-105"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}

                      {/* Top Header Badge & Live Rotating Counter */}
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-white/20 px-2.5 py-1 text-white text-[10px] font-mono uppercase tracking-wider shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>PROJECT SHOWCASE</span>
                        {activeSlides.length > 1 && (
                          <span className="text-yellow-400 font-bold ml-1 font-mono">
                            {String(currentIdx + 1).padStart(2, "0")} /{" "}
                            {String(activeSlides.length).padStart(2, "0")}
                          </span>
                        )}
                      </div>

                      {/* Navigation Arrow Controls (Previous / Next) */}
                      {activeSlides.length > 1 && (
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={handlePrev}
                            aria-label="Previous project"
                            className="w-7 h-7 bg-slate-950/80 hover:bg-construction-navy text-white flex items-center justify-center border border-white/20 transition-colors backdrop-blur-xs cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Next project"
                            className="w-7 h-7 bg-slate-950/80 hover:bg-construction-navy text-white flex items-center justify-center border border-white/20 transition-colors backdrop-blur-xs cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Architectural Overlay Strip with Current Project Details */}
                      {currentSlide && (
                        <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent pt-8 pb-3.5 px-3.5 sm:px-4 text-white">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-yellow-400 font-bold truncate">
                              {currentSlide.category}
                            </div>
                            {currentSlide.location && (
                              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold bg-white/10 px-2 py-0.5 backdrop-blur-xs border border-white/20 shrink-0">
                                {currentSlide.location}
                              </div>
                            )}
                          </div>

                          <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              {currentSlide.href && !isPreview ? (
                                <Link
                                  href={currentSlide.href}
                                  className="text-xs sm:text-sm font-bold font-display uppercase tracking-tight text-white hover:text-yellow-300 transition-colors truncate block group/link"
                                >
                                  <span>{currentSlide.title}</span>
                                  <ArrowUpRight className="inline-block w-3.5 h-3.5 ml-1 text-yellow-400 opacity-90 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                </Link>
                              ) : (
                                <div className="text-xs sm:text-sm font-bold font-display uppercase tracking-tight text-white truncate">
                                  {currentSlide.title}
                                </div>
                              )}
                            </div>

                            {/* Interactive Progress Indicator Dots / Bars */}
                            {activeSlides.length > 1 && (
                              <div className="flex items-center gap-1 shrink-0 mb-1">
                                {activeSlides.map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setCurrentIdx(i)}
                                    aria-label={`Jump to project ${i + 1}`}
                                    className={`h-1.5 transition-all duration-300 cursor-pointer ${
                                      i === currentIdx
                                        ? "w-5 bg-yellow-400"
                                        : "w-1.5 bg-white/40 hover:bg-white/80"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                      <span className="text-xs font-mono uppercase tracking-wider">
                        No Project Imagery Found
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Architectural Technical Detail Badge */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                  <span>AUTO-ROTATING PORTFOLIO</span>
                </span>
                <span className="text-slate-400">
                  {activeSlides.length > 1
                    ? `${activeSlides.length} PROJECTS SHOWCASED`
                    : "STRUCTURED SPECIFICATIONS"}
                </span>
              </div>
            </div>

            {/* 7. Mobile Authoritative Statistics Strip */}
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
