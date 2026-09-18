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
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: GOOGLE SERP SNIPPET SIMULATION
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              01 · Google Search SERP Snippet Simulation
            </h3>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setSerpDevice("desktop")}
              className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                serpDevice === "desktop"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setSerpDevice("mobile")}
              className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                serpDevice === "mobile"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-100/60">
          <div
            className={`bg-white border border-slate-300 p-5 shadow-sm font-sans transition-all mx-auto ${
              serpDevice === "mobile" ? "max-w-sm" : "max-w-2xl"
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-1.5">
              <div className="w-4 h-4 bg-construction-navy text-white flex items-center justify-center text-[9px] font-bold">
                H
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-700 truncate font-mono">
                <span>https://www.hindustanprojects.in</span>
                <span className="text-slate-400">›</span>
                <span>projects</span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-900 font-bold">{previewSlug}</span>
              </div>
            </div>

            <h4 className="text-base text-blue-800 hover:underline font-medium cursor-pointer leading-snug truncate">
              {previewTitle}
            </h4>

            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
              {previewDescription}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-mono pt-2 border-t border-slate-100">
              {isTitleFallback && (
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                  Title: Auto-fallback active
                </span>
              )}
              {isDescFallback && (
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                  Description: Auto-fallback active
                </span>
              )}
              {!isTitleFallback && !isDescFallback && (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Fully Customized Organic Search Snippet
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: CORE SEO FIELDS & METADATA
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              02 · Search Engine Optimization (SEO) Meta Tags
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Organic Search Optimization
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
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
                {metaTitleLength} / 60 chars {metaTitleLength > 60 ? "(May be truncated by Google)" : "(Ideal: 50-60)"}
              </span>
            </div>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => onChange({ metaTitle: e.target.value })}
              placeholder="e.g. Modern Logistics Hub Project in Bhilwara | HiPRO"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy transition-all"
            />
            <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
              Leave blank to automatically compose: &ldquo;{formData.title || "Project Title"} | Hindustan Projects (HiPRO)&rdquo;.
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
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
                {metaDescLength} / 160 chars {metaDescLength > 160 ? "(May be truncated by Google)" : "(Ideal: 140-160)"}
              </span>
            </div>
            <textarea
              rows={3}
              value={formData.metaDescription}
              onChange={(e) => onChange({ metaDescription: e.target.value })}
              placeholder="e.g. Explore HiPRO's 120,000 sq.ft industrial turnkey logistics facility in Bhilwara. Delivered on schedule with heavy PEB engineering and EOT cranes."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-normal rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy resize-none leading-relaxed transition-all"
            />
          </div>

          {/* Keywords & Canonical */}
          <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Primary Focus Keyword
              </label>
              <input
                type="text"
                value={formData.focusKeywords}
                onChange={(e) => onChange({ focusKeywords: e.target.value })}
                placeholder="e.g. PEB warehouse construction Bhilwara"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Secondary Keywords
              </label>
              <input
                type="text"
                value={formData.secondaryKeywords}
                onChange={(e) => onChange({ secondaryKeywords: e.target.value })}
                placeholder="e.g. industrial shed contractor, turnkey warehouse"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Canonical URL Override (Optional)
              </label>
              <input
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) => onChange({ canonicalUrl: e.target.value })}
                placeholder="https://www.hindustanprojects.in/projects/canonical-slug"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
              <div className="text-[11px] font-mono text-slate-600 bg-slate-100 px-3 py-1.5 border border-slate-200">
                Resolved Canonical Anchor: <strong className="text-construction-navy">{resolvedCanonical}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: OPEN GRAPH & CRAWLER DIRECTIVES
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              03 · Social Sharing (Open Graph) &amp; Search Directives
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Bot Governance
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-12 gap-6 items-start">
            {/* OG Image Upload & Card Simulation */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Dedicated Open Graph Image (1200x630 Recommended)
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
              <div className="border border-slate-300 bg-white shadow-md overflow-hidden max-w-sm rounded-none">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 px-3 py-1.5 bg-slate-100 block border-b border-slate-200">
                  Social Share Card Preview (LinkedIn / WhatsApp / X)
                </span>
                {resolvedOgImage ? (
                  <div className="aspect-[1.91/1] w-full bg-slate-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvedOgImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[1.91/1] w-full bg-slate-950 flex items-center justify-center text-xs text-slate-400 font-mono">
                    No Preview Image Available
                  </div>
                )}
                <div className="p-3.5 space-y-1 bg-white">
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
            <div className="md:col-span-5 space-y-4 bg-slate-50 border border-slate-200 p-5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block border-b border-slate-200 pb-2">
                Search Engine Crawler Directives
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
                    Instructs Google, Bing, and search crawlers NOT to index this page in search results.
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
                    Instructs search bots not to crawl or pass authority through outgoing links on this page.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: AEO & GEO ARCHITECTURE READINESS (READ-ONLY)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              04 · AEO &amp; GEO Architecture Readiness Certificate
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-950 border border-emerald-800 px-2 py-0.5">
            Read-Only Audit
          </span>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Consolidated verification of structured knowledge signals configured across Specifications and Narrative tabs.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-xs">
            {/* AEO Summary */}
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <ListChecks className="w-3.5 h-3.5 text-construction-navy" /> AEO (Answer Engine) Readiness
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Schema.org / JSON-LD</span>
              </div>
              <div className="space-y-2 text-slate-700 font-mono">
                <p className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Executive Brief:</span>
                  <span className="font-bold text-slate-900">
                    {formData.shortDescription ? "✓ Structured" : "— Missing"}
                  </span>
                </p>
                <p className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Key Specifications:</span>
                  <span className="font-bold text-slate-900">
                    {formData.highlights.length} Metrics Defined
                  </span>
                </p>
                <p className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Structured FAQs:</span>
                  <span className="font-bold text-slate-900">
                    {formData.faqs.length} Questions Defined
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Client Attribution:</span>
                  <span className="font-bold text-slate-900">
                    {formData.client || "— Not specified"}
                  </span>
                </p>
              </div>
            </div>

            {/* GEO Summary */}
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-construction-red" /> GEO (Local Search) Precision
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Verified Coordinates</span>
              </div>
              <div className="space-y-2 text-slate-700 font-mono">
                <p className="flex justify-between border-b border-slate-200 pb-1">
                  <span>City / State:</span>
                  <span className="font-bold text-slate-900">
                    {[formData.city, formData.state].filter(Boolean).join(", ") || "— None"}
                  </span>
                </p>
                <p className="flex justify-between border-b border-slate-200 pb-1">
                  <span>District / Country:</span>
                  <span className="font-bold text-slate-900">
                    {[formData.district, formData.country].filter(Boolean).join(", ") || "— None"}
                  </span>
                </p>
                <p className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Postal Code (PIN):</span>
                  <span className="font-bold text-slate-900">
                    {formData.postalCode || "— None"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Google Maps:</span>
                  <span className="font-bold text-slate-900">
                    {formData.googleMapsUrl ? "✓ Verified Link" : "— None"}
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
