"use client";

import React, { useState } from "react";
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  MapPin,
  Calendar,
  Building2,
  Layers,
  Sparkles,
  FileText,
  Play,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  ChevronRight,
  Eye,
  Maximize2,
  User,
  UserCheck,
  Ruler,
  CheckCircle,
  Briefcase,
  Compass,
  Globe,
  Share2,
} from "lucide-react";
import type { ProjectHighlight, ProjectFaq, ProjectGalleryItem } from "@/lib/types";

interface ProjectPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    category: string;
    subCategories: string[];
    client: string;
    owner: string;
    area: string;
    services: string[];
    location: string;
    date: string;
    completionDate: string;
    highlights: ProjectHighlight[];
    city: string;
    district: string;
    state: string;
    country: string;
    postalCode: string;
    targetLocation: string;
    latitude: string | number;
    longitude: string | number;
    googleMapsUrl: string;
    image: string;
    imageAlt: string;
    imageCaption: string;
    galleryDetails: ProjectGalleryItem[];
    videoUrl: string;
    videoType: "youtube" | "vimeo" | "direct" | "none";
    videoTitle: string;
    videoDescription: string;
    videoPoster: string;
    faqs: ProjectFaq[];
    status: string;
    publishStatus: string;
    featured: boolean;
    metaTitle?: string;
    metaDescription?: string;
  };
}

export default function ProjectPreviewModal({
  isOpen,
  onClose,
  project,
}: ProjectPreviewModalProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Video embed url helpers matching public page
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0` : null;
  };

  const getVimeoEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  const youtubeEmbedUrl = project.videoUrl ? getYoutubeEmbedUrl(project.videoUrl) : null;
  const vimeoEmbedUrl = project.videoUrl ? getVimeoEmbedUrl(project.videoUrl) : null;
  const hasVideo = Boolean(project.videoUrl && project.videoUrl.trim() && project.videoType !== "none");

  // Geographic facts
  const geoDetails = [
    project.city ? { label: "City", value: project.city } : null,
    project.district ? { label: "District", value: project.district } : null,
    project.state ? { label: "State", value: project.state } : null,
    project.country ? { label: "Country", value: project.country } : null,
    project.postalCode ? { label: "Postal PIN", value: project.postalCode } : null,
    project.targetLocation ? { label: "Industrial Hub / Zone", value: project.targetLocation } : null,
    project.latitude && project.longitude
      ? { label: "Coordinates", value: `${project.latitude}° N, ${project.longitude}° E` }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const hasVerifiedGeo = geoDetails.length > 0 || Boolean(project.googleMapsUrl);

  const containerWidthClass = {
    desktop: "w-full max-w-6xl",
    tablet: "w-full max-w-[768px]",
    mobile: "w-full max-w-[390px]",
  }[viewport];

  const isOngoing = project.status === "active" || project.status === "ongoing";

  // Public facts ledger
  const factsLedger: { label: string; value: string; icon: any }[] = [];
  if (project.client && project.client.trim()) {
    factsLedger.push({ label: "Client Organization", value: project.client.trim(), icon: Briefcase });
  }
  if (project.owner && project.owner.trim()) {
    factsLedger.push({ label: "Project Principal / Owner", value: project.owner.trim(), icon: UserCheck });
  }
  if (project.area && project.area.trim()) {
    factsLedger.push({ label: "Gross Built-Up Area", value: project.area.trim(), icon: Ruler });
  }
  if (project.category && project.category.trim()) {
    factsLedger.push({ label: "Sector Classification", value: project.category.trim(), icon: Building2 });
  }
  if (project.completionDate && project.completionDate.trim()) {
    factsLedger.push({ label: "Handover / Completion", value: project.completionDate.trim(), icon: Calendar });
  } else if (project.date && project.date.trim()) {
    factsLedger.push({ label: "Project Timeline", value: project.date.trim(), icon: Calendar });
  }
  if (project.location && project.location.trim()) {
    factsLedger.push({ label: "Site Location", value: project.location.trim(), icon: MapPin });
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* ─────────────────────────────────────────────────────────────
          PREVIEW CONTROLS HEADER BAR (Workbench Light Chrome)
          ───────────────────────────────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 select-none shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 bg-construction-red"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-900">
              PUBLIC PROJECT PREVIEW
            </span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
            <Eye className="w-3 h-3 text-amber-600" />
            <span>Draft Simulation (Light)</span>
          </span>
          <span className="hidden md:inline-block text-xs text-slate-500 font-mono truncate max-w-xs">
            /projects/{project.slug || "slug-pending"}
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 border border-slate-300">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                viewport === "desktop"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Desktop View (1280px)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                viewport === "tablet"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                viewport === "mobile"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Close Preview Action */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          PREVIEW CANVAS (LIGHT / OFF-WHITE THEME)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-2 sm:p-6 flex justify-center items-start">
        <div
          className={`${containerWidthClass} transition-all duration-300 bg-white text-slate-900 shadow-xl border border-slate-200 font-sans min-h-full overflow-hidden relative`}
        >
          {/* Breadcrumb banner */}
          <div className="border-b border-slate-200 bg-slate-50 py-3 px-4 sm:px-8 text-xs font-mono text-slate-500 flex items-center gap-2">
            <span>Home</span>
            <span className="text-slate-400">/</span>
            <span>Projects</span>
            <span className="text-slate-400">/</span>
            <span className="text-construction-navy font-semibold truncate">
              {project.title || "Untitled Project"}
            </span>
          </div>

          {/* 1. PROJECT HERO (LIGHT MODE) */}
          <header className="relative pt-8 pb-10 px-4 sm:px-8 lg:px-12 border-b border-slate-200 bg-gradient-to-b from-slate-50/80 to-white">
            <div className="max-w-4xl">
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {project.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-construction-red text-xs font-mono uppercase tracking-wider font-bold">
                    <Building2 className="w-3.5 h-3.5 text-construction-red" />
                    {project.category}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase tracking-wider font-bold border ${
                    isOngoing
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {isOngoing ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Ongoing Operation
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Completed Handover
                    </>
                  )}
                </span>
                {project.featured && (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-mono uppercase tracking-wider border bg-amber-50 text-amber-800 border-amber-300 font-bold">
                    ★ Featured Showcase
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-slate-900 leading-tight mb-4 font-display">
                {project.title || "Untitled Project Specification"}
              </h1>

              {/* Location & Date */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 font-medium">
                {project.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-construction-red shrink-0" />
                    <span className="text-slate-900 font-semibold">{project.location}</span>
                  </span>
                )}
                {(project.completionDate || project.date) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-700">{project.completionDate || project.date}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Cover Hero Showcase */}
            {project.image ? (
              <figure className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[500px] overflow-hidden bg-slate-100 border border-slate-200 shadow-sm mt-6 sm:mt-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.imageAlt || `${project.title} cover perspective`}
                  className="w-full h-full object-cover"
                />
                {project.imageCaption && (
                  <figcaption className="absolute bottom-3 left-3 right-3 text-xs text-slate-800 font-mono bg-white/95 backdrop-blur-sm p-3 border-l-4 border-construction-red shadow-md max-w-xl">
                    {project.imageCaption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <div className="mt-6 p-8 border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 text-xs font-mono">
                No hero cover image uploaded yet. (Configure in Tab 04 Media)
              </div>
            )}
          </header>

          {/* 2. MAIN CONTENT & FACTS LEDGER (LIGHT MODE) */}
          <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* MAIN NARRATIVE COLUMN (8 COLS) */}
              <div className="lg:col-span-8 space-y-10">
                {/* Executive Brief (if shortDescription exists) */}
                {project.shortDescription && (
                  <section className="p-5 sm:p-6 bg-blue-50/60 border-l-4 border-construction-navy border-y border-r border-blue-100">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-construction-navy mb-2">
                      <ShieldCheck className="w-4 h-4 text-construction-navy" />
                      <span>Executive Brief</span>
                    </div>
                    <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
                      {project.shortDescription}
                    </p>
                  </section>
                )}

                {/* Case Study Narrative */}
                {project.description ? (
                  <section>
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
                      <FileText className="w-5 h-5 text-construction-navy" />
                      <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-slate-900 font-display">
                        Engineering Case Study &amp; Scope Narrative
                      </h2>
                    </div>
                    <div className="text-slate-700 text-base leading-relaxed whitespace-pre-line space-y-4">
                      {project.description}
                    </div>
                  </section>
                ) : (
                  <div className="p-5 border border-dashed border-red-200 bg-red-50/50 text-red-700 text-xs font-mono">
                    ⚠ Full Description is a mandatory publish requirement and is currently empty.
                  </div>
                )}

                {/* Key Technical Highlights (if non-empty) */}
                {project.highlights && project.highlights.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-slate-900 font-display">
                        Key Execution Highlights
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {project.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors"
                        >
                          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                            {item.label || `Highlight #${idx + 1}`}
                          </div>
                          <div className="text-sm font-semibold text-slate-900 leading-snug">
                            {item.value || "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Media Gallery Showcase (if non-empty) */}
                {project.galleryDetails && project.galleryDetails.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-5 h-5 text-construction-navy" />
                        <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-slate-900 font-display">
                          Project Media &amp; Execution Plates
                        </h2>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 border border-slate-200">
                        {project.galleryDetails.length} Photos
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {project.galleryDetails.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxImage(item.url)}
                          className="group relative aspect-4/3 bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer shadow-sm hover:border-slate-400 transition-all"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.alt || `${project.title} photo ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-white" />
                          </div>
                          {item.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-white/95 text-slate-800 text-[10px] font-mono p-1.5 truncate border-t border-slate-200">
                              {item.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Video Presentation (if available) */}
                {hasVideo && (
                  <section>
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
                      <Play className="w-5 h-5 text-construction-red" />
                      <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-slate-900 font-display">
                        Video Presentation &amp; Site Walkthrough
                      </h2>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                      {project.videoTitle && (
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                          {project.videoTitle}
                        </h3>
                      )}
                      {project.videoDescription && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {project.videoDescription}
                        </p>
                      )}

                      <div className="relative aspect-video w-full bg-black overflow-hidden border border-slate-200">
                        {youtubeEmbedUrl ? (
                          <iframe
                            src={youtubeEmbedUrl}
                            title={project.videoTitle || "Project Video"}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : vimeoEmbedUrl ? (
                          <iframe
                            src={vimeoEmbedUrl}
                            title={project.videoTitle || "Project Video"}
                            className="w-full h-full border-0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        ) : project.videoUrl ? (
                          <video
                            src={project.videoUrl}
                            poster={project.videoPoster || undefined}
                            controls
                            className="w-full h-full"
                          />
                        ) : null}
                      </div>
                    </div>
                  </section>
                )}

                {/* Technical FAQs (if available) */}
                {project.faqs && project.faqs.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
                      <HelpCircle className="w-5 h-5 text-construction-navy" />
                      <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-slate-900 font-display">
                        Frequently Asked Questions
                      </h2>
                    </div>

                    <div className="space-y-2.5">
                      {project.faqs.map((faq, idx) => {
                        const isOpenFaq = activeFaq === idx;
                        return (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 shadow-sm overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => setActiveFaq(isOpenFaq ? null : idx)}
                              className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <span className="text-sm font-bold text-slate-900 leading-snug">
                                {faq.question || `Question #${idx + 1}`}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                                  isOpenFaq ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {isOpenFaq && (
                              <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50">
                                {faq.answer || "No answer provided."}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* SIDEBAR FACTS & GEO INTELLIGENCE (4 COLS) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Card 1: Project Facts Ledger */}
                {factsLedger.length > 0 && (
                  <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                      <Briefcase className="w-4 h-4 text-construction-navy" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                        Project Specifications Ledger
                      </h3>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {factsLedger.map((fact, idx) => {
                        const Icon = fact.icon;
                        return (
                          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                            <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                                {fact.label}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-slate-900 break-words">
                                {fact.value}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Card 2: Services / Scope Tags */}
                {project.services && project.services.length > 0 && (
                  <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                      <Layers className="w-4 h-4 text-construction-navy" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                        Services Delivered
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.services.map((svc, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-mono border border-slate-200"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card 3: Verified Geographic & Location Intelligence */}
                {hasVerifiedGeo && (
                  <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                      <Compass className="w-4 h-4 text-construction-red" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                        Site &amp; Location Intelligence
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {geoDetails.map((geo, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                          <span className="text-slate-500 font-mono text-[11px]">{geo.label}:</span>
                          <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                            {geo.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {project.googleMapsUrl && (
                      <a
                        href={project.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>View on Google Maps</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Card 4: Search & Social Preview Summary */}
                <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                      Public Search Index Card
                    </h3>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 text-xs space-y-1 font-sans">
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      https://www.hindustanprojects.in/projects/{project.slug || "slug"}
                    </div>
                    <div className="text-sm font-semibold text-blue-800 line-clamp-1">
                      {project.metaTitle || `${project.title || "Project"} | Hindustan Projects`}
                    </div>
                    <div className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                      {project.metaDescription || project.shortDescription || "Hindustan Projects portfolio specification."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer simulation */}
          <footer className="border-t border-slate-200 bg-slate-50 py-6 px-4 sm:px-8 text-center text-xs text-slate-500 font-mono">
            <span>© {new Date().getFullYear()} Hindustan Projects (HiPRO) · Engineering &amp; Infrastructure Portfolio</span>
          </footer>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImage} alt="Expanded Plate" className="w-full h-full object-contain max-h-[85vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
