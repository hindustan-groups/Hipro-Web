"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  MapPin,
  Maximize2,
  Calendar,
  Sparkles,
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

  // Filtered projects list (up to 6 items on home page)
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

  // Distinct available categories for filter tabs
  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    allProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [allProjects]);

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
                onClick={() => setSelectedCategory(cat)}
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

        {/* Premium Project Cards Grid (Mobile limits to 3 cards, Desktop shows up to 6) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project, index) => {
            const projectLink = project.slug
              ? `/projects/${project.slug}`
              : `/projects/${project.id}`;

            const isOngoing =
              project.status?.toLowerCase() === "ongoing" ||
              project.status?.toLowerCase() === "active";

            // Mobile limit: on screens < 768px (mobile), hide cards beyond index 2 (show only 3 cards)
            // On desktop (md:), display all 6 cards
            const mobileVisibilityClass = index >= 3 ? "hidden md:flex" : "flex";

            return (
              <article
                key={project.id || index}
                className={`${mobileVisibilityClass} group relative flex-col bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-500 overflow-hidden`}
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

        {/* Mobile "View All Projects" Button (clean full-width button below the 3 mobile cards) */}
        <div className="mt-8 md:hidden text-center">
          <Link
            href={portfolioHref}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-construction-navy hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-widest shadow-sm w-full transition-colors"
          >
            <span>{portfolioLabel}</span>
            <ArrowUpRight className="w-4 h-4 text-construction-red" />
          </Link>
        </div>

        {/* Bottom Trust & Portfolio Metric Strip */}
        <div className="mt-12 sm:mt-16 pt-10 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-4 bg-slate-50 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-construction-navy font-display">
                150+
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Landmarks Delivered
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-construction-navy font-display">
                12M+
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Sq.Ft. Built
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-construction-navy font-display">
                100%
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Turnkey Execution
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-construction-red font-display">
                0 Days
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Zero Safety Incidents
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
