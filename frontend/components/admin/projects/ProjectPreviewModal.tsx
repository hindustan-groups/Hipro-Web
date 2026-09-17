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
    desktop: "w-full max-w-7xl",
    tablet: "w-full max-w-[768px]",
    mobile: "w-full max-w-[390px]",
  }[viewport];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          PREVIEW CONTROLS HEADER BAR (Admin Chrome)
      ───────────────────────────────────────────────────────────── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-mono font-bold text-amber-400">
            <Eye className="w-3.5 h-3.5" />
            <span>DRAFT-SAFE PREVIEW</span>
          </div>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
            {project.publishStatus === "published" ? "Status: Published" : "Status: Draft (In-Memory)"}
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center bg-slate-800 p-1 border border-slate-700">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors ${
              viewport === "desktop"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors ${
              viewport === "tablet"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors ${
              viewport === "mobile"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Mobile View (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Exit Preview</span>
        </button>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          PREVIEW CANVAS (Replicates /projects/[slug] exact public layout)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-900/60 p-2 sm:p-6 flex justify-center items-start">
        <div
          className={`${containerWidthClass} transition-all duration-300 bg-slate-950 text-slate-100 shadow-2xl border border-slate-800/80 font-sans min-h-full overflow-hidden`}
        >
          {/* Breadcrumb banner */}
          <div className="border-b border-slate-900 bg-slate-950/90 py-3 px-4 sm:px-8 text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Home</span>
            <span className="text-slate-600">/</span>
            <span>Projects</span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-medium truncate">
              {project.title || "Untitled Project"}
            </span>
          </div>

          {/* 1. PROJECT HERO */}
          <header className="pt-8 pb-10 px-4 sm:px-8 lg:px-12 border-b border-slate-900 bg-gradient-to-b from-slate-900/40 to-slate-950">
            <div className="max-w-5xl">
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {project.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    {project.category}
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border bg-slate-900 text-slate-300 border-slate-800">
                  {project.status || "active"}
                </span>
                {project.featured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border bg-amber-500/20 text-amber-300 border-amber-500/40">
                    ★ Featured Showcase
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white leading-tight mb-4 font-display">
                {project.title || "Untitled Project (Fill Title)"}
              </h1>

              {/* Location & Date */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-medium">
                {project.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200">{project.location}</span>
                  </span>
                )}
                {(project.completionDate || project.date) && (
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200">{project.completionDate || project.date}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Cover Hero Showcase */}
            {project.image ? (
              <figure className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[520px] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl mt-8">
                <img
                  src={project.image}
                  alt={project.imageAlt || `${project.title} execution perspective`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                {project.imageCaption && (
                  <figcaption className="absolute bottom-4 left-4 right-4 text-xs text-slate-300 font-mono bg-black/80 backdrop-blur-sm p-3 border-l-2 border-amber-500 max-w-xl">
                    {project.imageCaption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <div className="mt-8 p-8 border border-dashed border-slate-800 text-center text-slate-500 text-xs font-mono">
                No hero cover image provided yet (Recommended).
              </div>
            )}
          </header>

          {/* 2. MAIN CONTENT & FACTS LEDGER */}
          <div className="px-4 sm:px-8 lg:px-12 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              
              {/* MAIN NARRATIVE COLUMN (8 COLS) */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* Executive Brief (if shortDescription exists) */}
                {project.shortDescription && (
                  <section className="p-6 bg-slate-900/80 border-l-4 border-amber-500 border-y border-r border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Executive Brief</span>
                    </div>
                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-light">
                      {project.shortDescription}
                    </p>
                  </section>
                )}

                {/* Case Study Narrative */}
                {project.description ? (
                  <section>
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-display">
                        Project Execution &amp; Engineering Narrative
                      </h2>
                    </div>
                    <div className="text-slate-300 text-base leading-relaxed font-light whitespace-pre-line space-y-4">
                      {project.description}
                    </div>
                  </section>
                ) : (
                  <div className="p-6 border border-dashed border-red-900/40 text-red-400 text-xs font-mono">
                    ⚠ Full Description is a required field and is currently empty.
                  </div>
                )}

                {/* Key Technical Highlights (if non-empty) */}
                {project.highlights && project.highlights.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-display">
                        Key Execution Highlights
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors"
                        >
                          {item.label && (
                            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-1">
                              {item.label}
                            </span>
                          )}
                          <p className="text-sm font-medium text-slate-200">
                            {item.value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Services Deployed (if non-empty) */}
                {project.services && project.services.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
                      <Layers className="w-5 h-5 text-amber-400" />
                      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-display">
                        Engineering Disciplines &amp; Services Deployed
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {project.services.map((svc, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono uppercase tracking-wider hover:border-amber-500/50 transition-colors"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Video Showcase (if exists) */}
                {hasVideo && (
                  <section>
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
                      <Play className="w-5 h-5 text-amber-400" />
                      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-display">
                        {project.videoTitle || "Execution Video Showcase"}
                      </h2>
                    </div>

                    {project.videoDescription && (
                      <p className="text-sm text-slate-400 font-light mb-4">
                        {project.videoDescription}
                      </p>
                    )}

                    <div className="relative aspect-video w-full bg-black border border-slate-800 overflow-hidden shadow-2xl">
                      {youtubeEmbedUrl ? (
                        <iframe
                          src={youtubeEmbedUrl}
                          title={project.videoTitle || `${project.title} Video`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : vimeoEmbedUrl ? (
                        <iframe
                          src={vimeoEmbedUrl}
                          title={project.videoTitle || `${project.title} Video`}
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <video
                          controls
                          poster={project.videoPoster || undefined}
                          preload="metadata"
                          className="w-full h-full object-cover"
                        >
                          <source src={project.videoUrl} />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </section>
                )}

                {/* Field Execution & Architectural Gallery */}
                {project.galleryDetails && project.galleryDetails.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-amber-400" />
                        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-display">
                          Field Execution &amp; Architectural Gallery
                        </h2>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {project.galleryDetails.length} Photos
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {project.galleryDetails.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxImage(item.url)}
                          className="group relative aspect-[4/3] bg-slate-900 border border-slate-800 overflow-hidden cursor-pointer hover:border-amber-500/60 transition-all"
                        >
                          <img
                            src={item.url}
                            alt={item.alt || `Gallery photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-amber-400" />
                          </div>
                          {item.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/75 p-1.5 text-[10px] text-slate-300 truncate">
                              {item.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Verified Site Geography */}
                {hasVerifiedGeo && (
                  <section>
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
                      <MapPin className="w-5 h-5 text-amber-400" />
                      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-display">
                        Verified Site Geography
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                      {geoDetails.map((geo, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                            {geo.label}
                          </span>
                          <p className="text-sm font-semibold text-slate-200">{geo.value}</p>
                        </div>
                      ))}
                    </div>

                    {project.googleMapsUrl && (
                      <div className="mt-3">
                        <a
                          href={project.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-amber-500 hover:text-black text-white text-xs font-mono uppercase tracking-wider border border-slate-800 hover:border-amber-500 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-amber-400" />
                          <span>Open Coordinates in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-1" />
                        </a>
                      </div>
                    )}
                  </section>
                )}

                {/* Project FAQs (Accordion) */}
                {project.faqs && project.faqs.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
                      <HelpCircle className="w-5 h-5 text-amber-400" />
                      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-display">
                        Project Engineering &amp; Technical FAQs
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {project.faqs.map((faq, idx) => {
                        const isOpen = activeFaq === idx;
                        return (
                          <div
                            key={idx}
                            className="border border-slate-800 bg-slate-900/40 overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => setActiveFaq(isOpen ? null : idx)}
                              className="w-full text-left p-4 flex items-center justify-between gap-3 text-sm font-medium text-slate-200 hover:text-white cursor-pointer"
                            >
                              <span>{faq.question || "Untitled Question"}</span>
                              <ChevronDown
                                className={`w-4 h-4 text-amber-400 shrink-0 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                                {faq.answer || "No answer provided yet."}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* SIDEBAR: EXECUTIVE FACTS LEDGER (4 COLS) */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 p-6 sticky top-6">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-5 pb-3 border-b border-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Executive Facts Ledger</span>
                  </h3>

                  <dl className="space-y-4 text-xs font-mono">
                    {project.client && (
                      <div className="pb-3 border-b border-slate-800/80">
                        <dt className="text-slate-400 uppercase text-[10px] tracking-wider mb-0.5">
                          Client
                        </dt>
                        <dd className="text-slate-100 font-semibold">{project.client}</dd>
                      </div>
                    )}

                    {project.owner && (
                      <div className="pb-3 border-b border-slate-800/80">
                        <dt className="text-slate-400 uppercase text-[10px] tracking-wider mb-0.5">
                          Owner / Developer
                        </dt>
                        <dd className="text-slate-100 font-semibold">{project.owner}</dd>
                      </div>
                    )}

                    {project.area && (
                      <div className="pb-3 border-b border-slate-800/80">
                        <dt className="text-slate-400 uppercase text-[10px] tracking-wider mb-0.5">
                          Built-up Area / Scale
                        </dt>
                        <dd className="text-slate-100 font-semibold">{project.area}</dd>
                      </div>
                    )}

                    {project.category && (
                      <div className="pb-3 border-b border-slate-800/80">
                        <dt className="text-slate-400 uppercase text-[10px] tracking-wider mb-0.5">
                          Sector / Category
                        </dt>
                        <dd className="text-slate-100 font-semibold">{project.category}</dd>
                      </div>
                    )}

                    {project.location && (
                      <div className="pb-3 border-b border-slate-800/80">
                        <dt className="text-slate-400 uppercase text-[10px] tracking-wider mb-0.5">
                          Location
                        </dt>
                        <dd className="text-slate-100 font-semibold">{project.location}</dd>
                      </div>
                    )}

                    {(project.date || project.completionDate) && (
                      <div className="pb-3 border-b border-slate-800/80">
                        <dt className="text-slate-400 uppercase text-[10px] tracking-wider mb-0.5">
                          Timeline / Delivery
                        </dt>
                        <dd className="text-slate-100 font-semibold">
                          {project.completionDate || project.date}
                        </dd>
                      </div>
                    )}

                    <div>
                      <dt className="text-slate-400 uppercase text-[10px] tracking-wider mb-0.5">
                        Execution Status
                      </dt>
                      <dd className="text-amber-400 font-semibold uppercase">
                        {project.status || "active"}
                      </dd>
                    </div>
                  </dl>

                  {/* Contact / CTA Button */}
                  <div className="mt-8 pt-5 border-t border-slate-800">
                    <a
                      href="#contact"
                      onClick={(e) => e.preventDefault()}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider text-xs py-3 transition-colors cursor-pointer"
                    >
                      <span>Inquire About Similar Scope</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Gallery Images */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 bg-slate-800 text-white p-2 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged view"
            className="max-h-[90vh] max-w-[90vw] object-contain border border-slate-800 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
