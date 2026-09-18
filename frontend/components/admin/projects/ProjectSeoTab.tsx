"use client";

import React, { useState } from "react";
import {
  Search,
  Globe,
  Share2,
  CheckCircle,
  MapPin,
  Sparkles,
  ListChecks,
  Smartphone,
  Monitor,
  ShieldCheck,
  Radio,
  FileCheck,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { ProjectHighlight, ProjectFaq } from "@/lib/types";

interface ProjectSeoTabProps {
  formData: {
    title: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    focusKeywords: string;
    secondaryKeywords: string;
    canonicalUrl: string;
    ogImage: string;
    noIndex: boolean;
    noFollow: boolean;

    // Context for AEO & GEO Preview summaries
    shortDescription: string;
    highlights: ProjectHighlight[];
    faqs: ProjectFaq[];
    city: string;
    district: string;
    state: string;
    country: string;
    postalCode?: string;
    targetLocation?: string;
    latitude?: string | number;
    longitude?: string | number;
    googleMapsUrl: string;
    client: string;
    image?: string;
  };
  onChange: (fields: Partial<ProjectSeoTabProps["formData"]>) => void;
}

export default function ProjectSeoTab({
  formData,
  onChange,
}: ProjectSeoTabProps) {
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");

  const metaTitleLength = formData.metaTitle.length;
  const metaDescLength = formData.metaDescription.length;

  // SERP preview computation following public site metadata exact logic
  const previewTitle =
    formData.metaTitle.trim() ||
    `${formData.title.trim() || "Project Title"} | Hindustan Projects (HiPRO)`;
  const isTitleFallback = !formData.metaTitle.trim();

  const previewDescription =
    formData.metaDescription.trim() ||
    formData.shortDescription.trim() ||
    "Hindustan Projects (HiPRO) portfolio case study. Industrial, commercial, and turnkey construction engineering excellence in Rajasthan and India.";
  const isDescFallback = !formData.metaDescription.trim();

  const previewSlug = formData.slug || "project-slug";
  const resolvedCanonical =
    formData.canonicalUrl.trim() || `https://www.hindustanprojects.in/projects/${previewSlug}`;

  // Social card image: ogImage || cover image
  const resolvedOgImage = formData.ogImage || formData.image;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 05A: GOOGLE SERP SNIPPET SIMULATION
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-none bg-slate-900 text-white font-mono text-xs font-bold">
              5A
            </span>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Google Search SERP Simulation
              </h3>
            </div>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-none border border-slate-300">
            <button
              type="button"
              onClick={() => setSerpDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none ${
                serpDevice === "desktop"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-300"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setSerpDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none ${
                serpDevice === "mobile"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-300"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div
            className={`bg-white border border-slate-300 p-4 sm:p-5 shadow-sm font-sans transition-all mx-auto ${
              serpDevice === "mobile" ? "max-w-sm" : "max-w-2xl"
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-1.5 overflow-hidden">
              <div className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                H
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-700 truncate font-mono">
                <span>https://www.hindustanprojects.in</span>
                <span className="text-slate-400">›</span>
                <span>projects</span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-900 font-semibold">{previewSlug}</span>
              </div>
            </div>

            <h4 className="text-base sm:text-lg text-blue-800 hover:underline cursor-pointer font-medium leading-snug line-clamp-1">
              {previewTitle}
            </h4>

            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
              {previewDescription}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-mono pt-2 border-t border-slate-100">
              {isTitleFallback && (
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                  Title: Auto-generated from Project Name
                </span>
              )}
              {isDescFallback && (
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                  Description: Auto-generated from Brief
                </span>
              )}
              {!isTitleFallback && !isDescFallback && (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Fully Custom Search Snippet
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 05B: CORE SEO FIELDS & METADATA
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-none bg-slate-900 text-white font-mono text-xs font-bold">
              5B
            </span>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Search Engine Optimization (SEO) Meta Tags
              </h3>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
            Organic Search
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Meta Title */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Custom SEO Meta Title
              </label>
              <span
                className={`text-[11px] font-mono ${
                  metaTitleLength > 60
                    ? "text-red-600 font-bold"
                    : metaTitleLength >= 50
                    ? "text-emerald-600 font-bold"
                    : "text-slate-400"
                }`}
              >
                {metaTitleLength} / 60 chars {metaTitleLength > 60 ? "(May truncate in Google)" : "(Optimal: 50-60)"}
              </span>
            </div>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => onChange({ metaTitle: e.target.value })}
              placeholder="e.g. Modern Logistics Hub Project in Bhilwara | HiPRO"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy transition-all"
            />
            <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
              Recommended: 50 to 60 characters. If left empty, HiPRO creates an automated standard title.
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Custom SEO Meta Description
              </label>
              <span
                className={`text-[11px] font-mono ${
                  metaDescLength > 160
                    ? "text-red-600 font-bold"
                    : metaDescLength >= 140
                    ? "text-emerald-600 font-bold"
                    : "text-slate-400"
                }`}
              >
                {metaDescLength} / 160 chars {metaDescLength > 160 ? "(May truncate in Google)" : "(Optimal: 140-160)"}
              </span>
            </div>
            <textarea
              rows={3}
              value={formData.metaDescription}
              onChange={(e) => onChange({ metaDescription: e.target.value })}
              placeholder="e.g. Explore HiPRO's 120,000 sq.ft industrial turnkey logistics facility in Bhilwara. Delivered on schedule with heavy PEB engineering and EOT cranes."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-normal rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy resize-none leading-relaxed transition-all"
            />
            <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
              Recommended: 140 to 160 characters summarizing the project&apos;s scope and key industrial capabilities.
            </p>
          </div>

          {/* Keywords & Canonical */}
          <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Primary Focus Keyword
              </label>
              <input
                type="text"
                value={formData.focusKeywords}
                onChange={(e) => onChange({ focusKeywords: e.target.value })}
                placeholder="e.g. PEB warehouse construction Bhilwara"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Secondary Keywords
              </label>
              <input
                type="text"
                value={formData.secondaryKeywords}
                onChange={(e) => onChange({ secondaryKeywords: e.target.value })}
                placeholder="e.g. industrial shed contractor, turnkey warehouse"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Canonical URL Override (Optional)
              </label>
              <input
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) => onChange({ canonicalUrl: e.target.value })}
                placeholder="https://www.hindustanprojects.in/projects/canonical-slug"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
              <div className="text-[11px] font-mono text-slate-600 bg-slate-50 px-3 py-1.5 border border-slate-200 break-all">
                Resolved Canonical Route: <strong className="text-slate-900">{resolvedCanonical}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 05C: OPEN GRAPH & CRAWLER DIRECTIVES
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-none bg-slate-900 text-white font-mono text-xs font-bold">
              5C
            </span>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Social Sharing (Open Graph) &amp; Bot Governance
              </h3>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
            Social Cards
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid md:grid-cols-12 gap-5 items-start">
            {/* OG Image Upload & Card Simulation */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Dedicated Open Graph Image (1200×630 Recommended)
                </label>
                <ImageUpload
                  value={formData.ogImage}
                  onChange={(url) => onChange({ ogImage: url })}
                />
                <p className="text-[11px] text-slate-500 font-normal">
                  Leave empty to automatically utilize the project hero cover image.
                </p>
              </div>

              {/* Social Share Card Preview */}
              <div className="border border-slate-200 bg-white shadow-sm overflow-hidden max-w-sm rounded-none">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 px-3 py-1.5 bg-slate-100 block border-b border-slate-200">
                  Social Share Preview (LinkedIn / WhatsApp / X)
                </span>
                {resolvedOgImage ? (
                  <div className="aspect-[1.91/1] w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvedOgImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[1.91/1] w-full bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono border-b border-slate-200">
                    No Social Image Configured
                  </div>
                )}
                <div className="p-3 space-y-1 bg-white">
                  <span className="text-[10px] uppercase text-slate-400 font-mono block">
                    hindustanprojects.in
                  </span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">
                    {previewTitle}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {previewDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Crawler Directives */}
            <div className="md:col-span-5 space-y-3.5 bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-none">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block border-b border-slate-200 pb-2">
                Search Bot Indexing Directives
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.noIndex}
                  onChange={(e) => onChange({ noIndex: e.target.checked })}
                  className="w-4 h-4 accent-red-600 mt-0.5 cursor-pointer rounded-none"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-mono">
                    noindex
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-relaxed mt-0.5">
                    Instructs Google, Bing, and crawlers NOT to index this project publicly.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer pt-3 border-t border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.noFollow}
                  onChange={(e) => onChange({ noFollow: e.target.checked })}
                  className="w-4 h-4 accent-red-600 mt-0.5 cursor-pointer rounded-none"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-mono">
                    nofollow
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-relaxed mt-0.5">
                    Instructs crawlers not to follow external outbound links from this page.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 05D: AEO & GEO ARCHITECTURE READINESS (READ-ONLY)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-none bg-slate-900 text-white font-mono text-xs font-bold">
              5D
            </span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                AEO & GEO Architecture Readiness
              </h3>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold uppercase bg-emerald-50 border border-emerald-200 px-2 py-0.5">
            Readiness
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Read-only summary and consolidated verification of structured data signals configured across Specifications and Narrative phases.
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            {/* AEO Summary */}
            <div className="bg-slate-50 border border-slate-200 p-4 space-y-2.5 rounded-none">
              <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <ListChecks className="w-3.5 h-3.5 text-slate-900" /> AEO (AI Answers) Signals
                </span>
                <span className="text-[10px] text-slate-500 font-mono">JSON-LD</span>
              </div>
              <div className="space-y-1.5 text-slate-700 font-mono">
                <p className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Executive Brief:</span>
                  <span className="font-bold text-slate-900">
                    {formData.shortDescription ? "✓ Configured" : "— Missing"}
                  </span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Key Specifications:</span>
                  <span className="font-bold text-slate-900">
                    {formData.highlights.length} Highlights
                  </span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Structured FAQs:</span>
                  <span className="font-bold text-slate-900">
                    {formData.faqs.length} FAQs
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Client Attribution:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">
                    {formData.client || "— Not set"}
                  </span>
                </p>
              </div>
            </div>

            {/* GEO Summary */}
            <div className="bg-slate-50 border border-slate-200 p-4 space-y-2.5 rounded-none">
              <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-red-600" /> GEO (Local Search) Signals
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Managed in Tab 02</span>
              </div>
              <div className="space-y-1.5 text-slate-700 font-mono">
                <p className="flex justify-between border-b border-slate-100 pb-1">
                  <span>City / State:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">
                    {[formData.city, formData.state].filter(Boolean).join(", ") || "— None"}
                  </span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-1">
                  <span>District / Country:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">
                    {[formData.district, formData.country].filter(Boolean).join(", ") || "— None"}
                  </span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Postal PIN:</span>
                  <span className="font-bold text-slate-900">
                    {formData.postalCode || "— None"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Google Maps:</span>
                  <span className="font-bold text-slate-900">
                    {formData.googleMapsUrl ? "✓ Configured" : "— None"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
