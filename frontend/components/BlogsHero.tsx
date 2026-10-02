"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Building2,
  Calculator,
  Compass,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { BlogPost, BlogsHeroContent } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

export const DEFAULT_BLOGS_HERO: BlogsHeroContent = {
  eyebrow: "ENGINEERING & CONSTRUCTION INTELLIGENCE · RAJASTHAN",
  title: "Building Knowledge &\nConstruction Insights",
  description:
    "Practical civil engineering guidance, construction cost planning frameworks, architectural guidelines, and site execution insights for residential and commercial projects in Rajasthan.",
  image:
    "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=1600&auto=format&fit=crop",
  imageAlt: "Civil Engineering and Structural Construction in Rajasthan by HiPRO",
  ctaText: "Explore Articles",
  ctaLink: "#articles-feed",
  enabled: true,
};

export interface BlogsHeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  enabled?: boolean;
  featuredBlog?: BlogPost | null;
  totalBlogs?: number;
  isPreview?: boolean;
}

export default function BlogsHero({
  eyebrow = DEFAULT_BLOGS_HERO.eyebrow,
  title = DEFAULT_BLOGS_HERO.title,
  description = DEFAULT_BLOGS_HERO.description,
  image = DEFAULT_BLOGS_HERO.image,
  imageAlt = DEFAULT_BLOGS_HERO.imageAlt,
  ctaText = DEFAULT_BLOGS_HERO.ctaText,
  ctaLink = DEFAULT_BLOGS_HERO.ctaLink,
  enabled = true,
  featuredBlog,
  totalBlogs = 0,
  isPreview = false,
}: BlogsHeroProps) {
  const effectiveEyebrow = eyebrow?.trim() || DEFAULT_BLOGS_HERO.eyebrow!;
  const effectiveTitle = title?.trim() || DEFAULT_BLOGS_HERO.title!;
  const effectiveDescription =
    description?.trim() || DEFAULT_BLOGS_HERO.description!;

  // Dynamic image fallback: CMS image -> Featured Blog image -> Brand default image
  const effectiveImage = useMemo(() => {
    if (image && image.trim().length > 0) return image.trim();
    if (featuredBlog?.image && featuredBlog.image.trim().length > 0)
      return featuredBlog.image.trim();
    return DEFAULT_BLOGS_HERO.image!;
  }, [image, featuredBlog]);

  const effectiveImageAlt = useMemo(() => {
    if (imageAlt && imageAlt.trim().length > 0) return imageAlt.trim();
    if (featuredBlog?.imageAlt && featuredBlog.imageAlt.trim().length > 0)
      return featuredBlog.imageAlt.trim();
    if (featuredBlog?.title) return `${featuredBlog.title} - HiPRO Insights`;
    return DEFAULT_BLOGS_HERO.imageAlt!;
  }, [imageAlt, featuredBlog]);

  const effectiveCtaText = ctaText?.trim() || DEFAULT_BLOGS_HERO.ctaText!;
  const effectiveCtaLink = ctaLink?.trim() || DEFAULT_BLOGS_HERO.ctaLink!;

  // Split title on newline for controlled typographic hierarchy if provided
  const titleLines = effectiveTitle.split("\n").filter(Boolean);

  const handleScrollToFeed = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (effectiveCtaLink.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(effectiveCtaLink);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // If explicitly disabled in CMS and not in admin preview mode, do not render
  if (enabled === false && !isPreview) {
    return null;
  }

  return (
    <section className="relative bg-white pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-14 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/90 overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          Architectural Blueprint Grid Background
          ───────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0F2C59 1px, transparent 1px), linear-gradient(to bottom, #0F2C59 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
        aria-hidden="true"
      />

      {/* Ambient Lighting Accents */}
      <div
        className="absolute -top-24 right-0 w-96 h-96 bg-slate-100/70 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 left-0 w-80 h-80 bg-red-50/40 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN: Editorial Copywriting, Badges & CTAs
              ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* 1. Eyebrow Tagline Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200/90 text-construction-navy self-start mb-5 sm:mb-6 shadow-2xs">
              <span
                className="w-1.5 h-1.5 bg-construction-red shrink-0 animate-pulse"
                aria-hidden="true"
              />
              <BookOpen className="w-3.5 h-3.5 text-construction-navy" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider font-mono">
                {effectiveEyebrow}
              </span>
            </div>

            {/* 2. Primary H1 Editorial Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-950 mb-5 font-display uppercase tracking-tight leading-[1.12]">
              {titleLines.length > 1 ? (
                <>
                  <span className="block">{titleLines[0]}</span>
                  <span className="font-serif italic font-normal text-construction-red normal-case tracking-normal block mt-1">
                    {titleLines.slice(1).join(" ")}
                  </span>
                </>
              ) : (
                effectiveTitle
              )}
            </h1>

            {/* 3. Supporting Lead Description */}
            <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed max-w-2xl mb-8">
              {effectiveDescription}
            </p>

            {/* 4. Action Row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
              <a
                href={effectiveCtaLink}
                onClick={handleScrollToFeed}
                className="inline-flex items-center justify-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-7 py-3.5 rounded-none text-xs uppercase tracking-widest transition-all shadow-sm group border border-construction-navy"
              >
                <span>{effectiveCtaText}</span>
                <ArrowDown className="w-3.5 h-3.5 text-construction-red group-hover:translate-y-0.5 transition-transform" />
              </a>

              <Link
                href="/cost-estimator"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-none border border-slate-300 text-xs uppercase tracking-widest transition-all shadow-2xs group"
              >
                <Calculator className="w-3.5 h-3.5 text-construction-navy" />
                <span>Estimate Build Cost</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* 5. Domain Knowledge Anchors (3 Proof Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200/90">
              <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-construction-red" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 font-display">
                    RCC &amp; Structure
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">
                  Disciplined civil execution, reinforcement standards &amp; quality.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="w-3.5 h-3.5 text-construction-red" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 font-display">
                    Cost Frameworks
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">
                  Budget planning, material pricing &amp; contractor contract models.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="w-3.5 h-3.5 text-construction-red" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 font-display">
                    Rajasthan Context
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">
                  Local building norms, climate adaptations &amp; site conditions.
                </p>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN: Image-Led Architectural Frame
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
                <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full overflow-hidden bg-slate-950 border border-slate-200 select-none group">
                  <Image
                    src={effectiveImage}
                    alt={effectiveImageAlt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 42vw"
                    unoptimized={!isOptimizableImage(effectiveImage)}
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Sophisticated Editorial Vignette & Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent pointer-events-none" />

                  {/* Floating Knowledge Badge (Top Left) */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="inline-flex items-center gap-1.5 bg-construction-navy/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 shadow-sm border border-white/10">
                      <Sparkles className="w-3 h-3 text-construction-red" />
                      Field Intelligence
                    </span>
                  </div>

                  {/* Drafting Watermark (Top Right) */}
                  <div className="absolute top-3.5 right-3.5 z-10 hidden sm:block text-[9px] font-mono tracking-widest text-white/70 uppercase">
                    HiPRO · 25.34°N, 74.63°E
                  </div>

                  {/* Bottom Editorial Caption Strip */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 flex flex-col justify-end text-left">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-construction-red font-bold mb-1">
                      {featuredBlog ? "Featured Research Topic" : "Architecture & Civil Execution"}
                    </div>
                    <div className="text-white font-display uppercase tracking-tight text-sm sm:text-base font-bold line-clamp-2 leading-snug">
                      {featuredBlog ? featuredBlog.title : "Disciplined Engineering For High-Performance Structures"}
                    </div>
                    {featuredBlog && (
                      <Link
                        href={`/blogs/${featuredBlog.slug || featuredBlog.id}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-200 hover:text-white uppercase tracking-wider mt-2 group-hover:text-construction-red transition-colors"
                      >
                        <span>Read Featured Guide</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Subtle Frame Footer Meta */}
                <div className="flex items-center justify-between px-2 pt-2 text-[10px] text-slate-500 font-mono">
                  <span>HIPRO KNOWLEDGE PLATFORM</span>
                  <span>{totalBlogs > 0 ? `${totalBlogs} GUIDES` : "ARCHIVED & CURRENT"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
