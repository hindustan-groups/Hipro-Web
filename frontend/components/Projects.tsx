"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  MapPin,
  Maximize2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import type { Project } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";
import { resolveCTA, resolveCTAHref } from "@/lib/cta";

// Curated authoritative landmark projects fallback (ensures home page never displays an empty state)
export const CURATED_LANDMARKS: Project[] = [
  {
    id: "jaipur-industrial-logistics-park",
    slug: "jaipur-industrial-logistics-park",
    title: "Jaipur Industrial Logistics Park",
    category: "Industrial",
    location: "Mahapura Industrial Corridor, Jaipur, Rajasthan",
    date: "2024",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85",
    description: "450,000 sq.ft pre-engineered steel warehousing hub with heavy-duty laser-screed flooring and automated multi-dock logistics bays.",
    area: "450,000 sq.ft",
    status: "completed",
    featured: true,
  },
  {
    id: "the-grand-horizon-luxury-villas",
    slug: "the-grand-horizon-luxury-villas",
    title: "The Grand Horizon Luxury Villas",
    category: "Residential",
    location: "Bhilwara & Udaipur Foothills, Rajasthan",
    date: "2024",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
    description: "Ultra-luxury gated enclave featuring bespoke private villas with climate-adaptive local stone facades and integrated solar micro-grids.",
    area: "185,000 sq.ft",
    status: "completed",
    featured: true,
  },
  {
    id: "apex-nexus-commercial-it-tower",
    slug: "apex-nexus-commercial-it-tower",
    title: "Apex Nexus Commercial IT Tower",
    category: "Commercial",
    location: "Subhash Nagar Commercial Hub, Bhilwara, Rajasthan",
    date: "2024",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85",
    description: "12-story Grade-A commercial IT headquarters engineered with double-glazed acoustic curtain walls and seismic structural damping.",
    area: "260,000 sq.ft",
    status: "completed",
    featured: true,
  },
  {
    id: "chambal-river-elevated-transit-viaduct-flyover",
    slug: "chambal-river-elevated-transit-viaduct-flyover",
    title: "Chambal Elevated Transit Viaduct & Flyover",
    category: "Infrastructure",
    location: "Kota-Bhilwara Expressway Corridor, Rajasthan",
    date: "2024",
    image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200&q=85",
    description: "Major civil infrastructure milestone encompassing 4.8 km of prestressed girder elevated transit corridor and river span viaduct.",
    area: "4.8 km span",
    status: "ongoing",
    featured: true,
  },
  {
    id: "zenith-pre-engineered-manufacturing-facility",
    slug: "zenith-pre-engineered-manufacturing-facility",
    title: "Zenith Precision Heavy Manufacturing Complex",
    category: "Industrial",
    location: "RIICO Growth Centre, Hamirgarh, Bhilwara",
    date: "2023",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=85",
    description: "Turnkey structural steel manufacturing facility engineered for high-capacity overhead gantry cranes and continuous industrial operations.",
    area: "320,000 sq.ft",
    status: "completed",
    featured: true,
  },
  {
    id: "the-royal-pavilion-high-street-retail-hub",
    slug: "the-royal-pavilion-high-street-retail-hub",
    title: "The Royal Pavilion High-Street Retail Hub",
    category: "Commercial",
    location: "Ajmer Road Commercial Boulevard, Jaipur, Rajasthan",
    date: "2024",
    image: "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1200&q=85",
    description: "Contemporary multi-level commercial galleria featuring open-concept central atrium, subterranean parking, and high-efficiency HVAC.",
    area: "210,000 sq.ft",
    status: "ongoing",
    featured: false,
  },
];

interface ProjectsProps {
  projects?: Project[];
  title?: string;
  settings?: any;
}

export default function Projects({ projects = [], title, settings }: ProjectsProps) {
  // Use DB projects if available, otherwise seamlessly use curated landmark portfolio
  const allProjects = useMemo(() => {
    const valid = (projects || []).filter(
      (p) => p && p.image && p.image.trim().length > 0 && p.status !== "archived"
    );
    return valid.length > 0 ? valid : CURATED_LANDMARKS;
  }, [projects]);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Mobile 3D Stacked Deck state
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");

  // Touch gesture state for mobile stack
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Filtered projects list (up to 6 items on desktop, 3 to 5 on mobile)
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") {
      return allProjects.slice(0, 6);
    }
    const matching = allProjects.filter(
      (p) =>
        p.category &&
        p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
    return matching.length > 0 ? matching.slice(0, 6) : allProjects.slice(0, 6);
  }, [allProjects, selectedCategory]);

  // Mobile-specific subset (up to 5 cards for the 3D stack)
  const mobileProjects = useMemo(() => {
    return filteredProjects.slice(0, 5);
  }, [filteredProjects]);

  // Distinct available categories for filter tabs
  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    allProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [allProjects]);

  // Reset active mobile card when category tab is switched
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setActiveCardIndex(0);
    setTouchDeltaX(0);
  };

  // Stack navigation handlers
  const handleNext = () => {
    if (mobileProjects.length <= 1 || isFlipping) return;
    setIsFlipping(true);
    setFlipDirection("next");
    setTimeout(() => {
      setActiveCardIndex((prev) => (prev + 1) % mobileProjects.length);
      setIsFlipping(false);
      setTouchDeltaX(0);
    }, 280);
  };

  const handlePrev = () => {
    if (mobileProjects.length <= 1 || isFlipping) return;
    setIsFlipping(true);
    setFlipDirection("prev");
    setTimeout(() => {
      setActiveCardIndex((prev) => (prev - 1 + mobileProjects.length) % mobileProjects.length);
      setIsFlipping(false);
      setTouchDeltaX(0);
    }, 280);
  };

  // Mobile touch gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setTouchDeltaX(0);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;

    // Only engage horizontal drag if horizontal motion is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      setTouchDeltaX(deltaX);
    }
  };

  const onTouchEnd = () => {
    if (touchDeltaX < -45) {
      handleNext();
    } else if (touchDeltaX > 45) {
      handlePrev();
    } else {
      setTouchDeltaX(0);
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setIsDragging(false);
  };

  // CTA CMS resolution
  const ctaViewAll = resolveCTA(settings, "home_projects_view_all");
  const portfolioHref = ctaViewAll ? resolveCTAHref(ctaViewAll) : "/projects";
  const portfolioLabel = ctaViewAll?.label ?? "View Full Portfolio";

  return (
    <section
      id="section-projects"
      aria-label="Landmarks In The Making - Featured Projects"
      className="relative py-16 sm:py-20 md:py-24 bg-white overflow-hidden"
    >
      {/* Subtle architectural background blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#0F2C59 1px, transparent 1px), linear-gradient(to right, #0F2C59 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ROW 1: Eyebrow Badge, Main Title, and Desktop CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-slate-100 border border-slate-200 text-construction-navy text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-construction-red animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-construction-red" />
              FEATURED PORTFOLIO
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-construction-navy font-display uppercase tracking-tight leading-tight">
              {title ? (
                title
              ) : (
                <>
                  Landmarks In The{" "}
                  <span className="font-serif italic font-normal text-construction-red normal-case">
                    Making
                  </span>
                </>
              )}
            </h2>
          </div>

          {/* Desktop "View Full Portfolio" Action Button */}
          <div className="hidden md:block shrink-0">
            <Link
              href={portfolioHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-construction-navy text-white hover:bg-slate-900 transition-all text-xs font-bold uppercase tracking-widest shadow-sm"
            >
              <span>{portfolioLabel}</span>
              <ArrowUpRight className="w-4 h-4 text-construction-red" />
            </Link>
          </div>
        </div>

        {/* ROW 2: Subtitle on Left, Clean Category Filter Tabs on Right */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sm:mb-12 pb-6 border-b border-slate-200">
          <p className="max-w-xl text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            Transforming skylines, industrial corridors, and commercial hubs across Rajasthan
            and Western India with precision civil engineering and turnkey execution.
          </p>

          {/* Category Filter Tabs: Smooth Horizontal Scroll on Mobile, Invisible Native Scrollbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-construction-navy text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE 3D STACKED CARD DECK (Visible only on < md screens)                */}
        {/* User can swipe left/right or tap arrows to flip cards in 3D perspective   */}
        {/* ========================================================================= */}
        <div className="block md:hidden">
          {/* Stack Deck Top Header / Counter Bar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-construction-navy text-[11px] font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-construction-red" />
              <span>Project {activeCardIndex + 1} of {mobileProjects.length}</span>
            </div>

            {/* Prev / Next Flip Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Project"
                className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 active:scale-90 transition-all shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Project"
                className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 active:scale-90 transition-all shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Stack Stage (Cards stacked in 3D space) */}
          <div
            className="relative w-full h-[470px] touch-pan-y select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {mobileProjects.map((project, idx) => {
              const diff = (idx - activeCardIndex + mobileProjects.length) % mobileProjects.length;
              const projectLink = project.slug
                ? `/projects/${project.slug}`
                : `/projects/${project.id}`;
              const isOngoing =
                project.status?.toLowerCase() === "ongoing" ||
                project.status?.toLowerCase() === "active";

              // 3D Card positioning styles based on stack depth
              let transform = "";
              let opacity = 1;
              let zIndex = 30;
              let pointerEvents: "auto" | "none" = "none";
              let overlayOpacity = 0;

              if (diff === 0) {
                // ACTIVE TOP CARD
                zIndex = 30;
                pointerEvents = "auto";
                if (isFlipping) {
                  transform =
                    flipDirection === "next"
                      ? "translateX(-115%) rotate(-12deg) scale(0.92)"
                      : "translateX(115%) rotate(12deg) scale(0.92)";
                  opacity = 0;
                } else {
                  transform = `translateX(${touchDeltaX}px) rotate(${touchDeltaX * 0.04}deg) translateY(0) scale(1)`;
                  opacity = 1;
                }
              } else if (diff === 1) {
                // CARD 2 (Right behind top card)
                zIndex = 20;
                transform = "translateY(14px) scale(0.94)";
                opacity = 0.88;
                overlayOpacity = 0.15;
              } else if (diff === 2) {
                // CARD 3 (Back of stack)
                zIndex = 10;
                transform = "translateY(28px) scale(0.88)";
                opacity = 0.6;
                overlayOpacity = 0.3;
              } else {
                // Hidden beyond 3 cards
                zIndex = 0;
                transform = "translateY(36px) scale(0.82)";
                opacity = 0;
              }

              const transitionStyle = isDragging && diff === 0
                ? "none"
                : "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease";

              return (
                <article
                  key={project.id || idx}
                  style={{
                    transform,
                    opacity,
                    zIndex,
                    pointerEvents,
                    transition: transitionStyle,
                  }}
                  className="absolute inset-0 bg-white border border-slate-200 shadow-xl flex flex-col justify-between overflow-hidden origin-bottom will-change-transform"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900 shrink-0">
                    <Image
                      src={project.image}
                      alt={project.imageAlt || project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized={!isOptimizableImage(project.image)}
                      loading="lazy"
                      className="object-cover"
                    />

                    {/* Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-construction-navy/90 text-white backdrop-blur-xs shadow-xs border border-white/10">
                        {project.category || "Engineering"}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs ${
                          isOngoing
                            ? "bg-amber-500/90 text-slate-950"
                            : "bg-emerald-600/90 text-white"
                        }`}
                      >
                        {isOngoing ? "In Execution" : "Completed"}
                      </span>
                    </div>

                    {/* Area Pill */}
                    {project.area && (
                      <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-slate-950/80 text-slate-200 border border-white/10 backdrop-blur-xs">
                          <Maximize2 className="w-2.5 h-2.5 text-construction-red" />
                          {project.area}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ambient Depth Lighting Overlay for Behind Cards */}
                  {overlayOpacity > 0 && (
                    <div
                      className="absolute inset-0 bg-slate-950 pointer-events-none z-20"
                      style={{ opacity: overlayOpacity }}
                    />
                  )}

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
                        <MapPin className="w-3.5 h-3.5 text-construction-red shrink-0" />
                        <span className="truncate">{project.location || "Rajasthan, India"}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 font-display line-clamp-2 mb-2 leading-snug">
                        <Link
                          href={projectLink}
                          onClick={(e) => {
                            if (Math.abs(touchDeltaX) > 10) e.preventDefault();
                          }}
                        >
                          {project.title}
                        </Link>
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {project.shortDescription || project.description}
                      </p>
                    </div>

                    {/* Bottom Meta & Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{project.date || "Turnkey Project"}</span>
                      </div>

                      <Link
                        href={projectLink}
                        onClick={(e) => {
                          if (Math.abs(touchDeltaX) > 10) e.preventDefault();
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-construction-navy hover:text-construction-red uppercase tracking-wider transition-colors"
                      >
                        <span>Explore</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Flip Hint & Segment Indicator Dots */}
          <div className="mt-6 flex flex-col items-center gap-2.5">
            {/* Segment Dots */}
            <div className="flex items-center gap-1.5">
              {mobileProjects.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => {
                    setActiveCardIndex(dotIdx);
                    setTouchDeltaX(0);
                  }}
                  aria-label={`Go to project ${dotIdx + 1}`}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    dotIdx === activeCardIndex
                      ? "w-6 bg-construction-navy"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Gesture Hint */}
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <span>←</span>
              <span>Swipe or tap arrows to flip card</span>
              <span>→</span>
            </span>
          </div>

          {/* Full-Width Mobile Portfolio Button */}
          <div className="mt-6 text-center">
            <Link
              href={portfolioHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-construction-navy hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-widest shadow-sm w-full transition-colors"
            >
              <span>{portfolioLabel}</span>
              <ArrowUpRight className="w-4 h-4 text-construction-red" />
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP ARCHITECTURAL CARDS GRID (Visible only on md: and above)          */}
        {/* ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project, index) => {
            const projectLink = project.slug
              ? `/projects/${project.slug}`
              : `/projects/${project.id}`;

            const isOngoing =
              project.status?.toLowerCase() === "ongoing" ||
              project.status?.toLowerCase() === "active";

            return (
              <article
                key={project.id || index}
                className="group relative flex flex-col bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-500 overflow-hidden"
              >
                {/* Image Showcase Container */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                  <Image
                    src={project.image}
                    alt={project.imageAlt || project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={!isOptimizableImage(project.image)}
                    loading="lazy"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                    {/* Category Tag */}
                    <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-construction-navy/90 text-white backdrop-blur-xs shadow-xs border border-white/10">
                      {project.category || "Engineering"}
                    </span>

                    {/* Operational Status Tag */}
                    <span
                      className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs ${
                        isOngoing
                          ? "bg-amber-500/90 text-slate-950"
                          : "bg-emerald-600/90 text-white"
                      }`}
                    >
                      {isOngoing ? "In Execution" : "Completed"}
                    </span>
                  </div>

                  {/* Area / Size Pill (Bottom-Right of Image) */}
                  {project.area && (
                    <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-slate-950/80 text-slate-200 border border-white/10 backdrop-blur-xs">
                        <Maximize2 className="w-2.5 h-2.5 text-construction-red" />
                        {project.area}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content Body (Always visible & accessible) */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Location Grounding */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5">
                      <MapPin className="w-3.5 h-3.5 text-construction-red shrink-0" />
                      <span className="truncate">{project.location || "Rajasthan, India"}</span>
                    </div>

                    {/* Project Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-construction-red transition-colors line-clamp-2 font-display mb-2.5">
                      <Link href={projectLink} className="hover:underline focus:outline-none">
                        {project.title}
                      </Link>
                    </h3>

                    {/* Description Snippet */}
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed line-clamp-2 mb-5">
                      {project.shortDescription || project.description}
                    </p>
                  </div>

                  {/* Card Bottom Meta & CTA Action */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    {/* Completion / Date */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{project.date || "Turnkey Project"}</span>
                    </div>

                    {/* View Details Link */}
                    <Link
                      href={projectLink}
                      className="inline-flex items-center gap-1 text-xs font-bold text-construction-navy group-hover:text-construction-red uppercase tracking-wider transition-colors"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
