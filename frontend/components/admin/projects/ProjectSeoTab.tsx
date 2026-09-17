"use client";

import React from "react";
import {
  Search,
  Globe,
  Share2,
  AlertTriangle,
  CheckCircle,
  Eye,
  MapPin,
  Sparkles,
  HelpCircle,
  ListChecks,
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
    googleMapsUrl: string;
    client: string;
  };
  onChange: (fields: Partial<ProjectSeoTabProps["formData"]>) => void;
}

export default function ProjectSeoTab({
  formData,
  onChange,
}: ProjectSeoTabProps) {
  const metaTitleLength = formData.metaTitle.length;
  const metaDescLength = formData.metaDescription.length;

  // SERP preview computation
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

  return (
    <div className="space-y-8">
      {/* 1. Google SERP Snippet Preview */}
      <div className="bg-slate-50 border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-600" /> Google Search SERP Snippet Preview
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">Desktop Preview</span>
        </div>

        {/* Live Search Card Simulation */}
        <div className="bg-white border border-slate-200 p-4 shadow-sm max-w-2xl font-sans">
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
            <div className="w-4 h-4 bg-construction-navy text-white rounded-none-full flex items-center justify-center text-[9px] font-bold">
              H
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-700 truncate">
              <span>https://www.hindustanprojects.in</span>
              <span className="text-slate-400">›</span>
              <span>projects</span>
              <span className="text-slate-400">›</span>
              <span className="text-slate-900 font-medium">{previewSlug}</span>
            </div>
          </div>

          <h3 className="text-base text-blue-800 hover:underline font-medium cursor-pointer leading-snug truncate">
            {previewTitle}
          </h3>

          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {previewDescription}
          </p>

          <div className="mt-2.5 flex items-center gap-2 text-[10px]">
            {isTitleFallback && (
              <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 font-medium">
                Title: Auto-fallback active
              </span>
            )}
            {isDescFallback && (
              <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 font-medium">
                Description: Auto-fallback active
              </span>
            )}
            {!isTitleFallback && !isDescFallback && (
              <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Fully Customized SEO Metadata
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. SEO Title & Description */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-construction-navy" /> Search Engine Optimization (SEO) Fields
          </h4>
          <p className="text-xs text-slate-500">
            Fine-tune title tags and descriptions for organic search ranking and click-through optimization.
          </p>
        </div>

        <div className="space-y-4">
          {/* Meta Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Custom SEO Meta Title
              </label>
              <span
                className={`text-[11px] font-mono font-medium ${
                  metaTitleLength > 60
                    ? "text-red-600 font-bold"
                    : metaTitleLength >= 50
                    ? "text-emerald-600 font-bold"
                    : "text-slate-400"
                }`}
              >
                {metaTitleLength} / 60 chars {metaTitleLength > 60 ? "(May be truncated)" : "(Ideal: 50-60)"}
              </span>
            </div>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => onChange({ metaTitle: e.target.value })}
              placeholder="e.g. Modern Logistics Hub Project in Bhilwara | HiPRO"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
            <p className="text-[11px] text-slate-500">
              Leave blank to automatically use project title with brand suffix.
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Custom SEO Meta Description
              </label>
              <span
                className={`text-[11px] font-mono font-medium ${
                  metaDescLength > 160
                    ? "text-red-600 font-bold"
                    : metaDescLength >= 140
                    ? "text-emerald-600 font-bold"
                    : "text-slate-400"
                }`}
              >
                {metaDescLength} / 160 chars {metaDescLength > 160 ? "(May be truncated)" : "(Ideal: 140-160)"}
              </span>
            </div>
            <textarea
              rows={3}
              value={formData.metaDescription}
              onChange={(e) => onChange({ metaDescription: e.target.value })}
              placeholder="e.g. Explore HiPRO's 120,000 sq.ft industrial turnkey logistics facility in Bhilwara. Delivered on schedule with heavy PEB engineering and EOT cranes."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none"
            />
          </div>

          {/* Keywords & Canonical */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Primary Focus Keyword
              </label>
              <input
                type="text"
                value={formData.focusKeywords}
                onChange={(e) => onChange({ focusKeywords: e.target.value })}
                placeholder="e.g. PEB warehouse construction Bhilwara"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Secondary Keywords
              </label>
              <input
                type="text"
                value={formData.secondaryKeywords}
                onChange={(e) => onChange({ secondaryKeywords: e.target.value })}
                placeholder="e.g. industrial shed contractor, turnkey turnkey warehouse"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Canonical URL Override (Optional)
              </label>
              <input
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) => onChange({ canonicalUrl: e.target.value })}
                placeholder="https://www.hindustanprojects.in/projects/canonical-slug"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
              <p className="text-[11px] text-slate-500">
                Only fill if this project content is syndicated or canonicalized from an alternate canonical URL.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Open Graph Social Image & Indexing Directives */}
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-construction-navy" /> Social Sharing (Open Graph) &amp; Crawl Directives
          </h4>
          <p className="text-xs text-slate-500">
            Controls thumbnail display when shared on LinkedIn, WhatsApp, and Twitter/X.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Dedicated Open Graph Image (1200x630 recommended)
            </label>
            <ImageUpload
              value={formData.ogImage}
              onChange={(url) => onChange({ ogImage: url })}
            />
            <p className="text-[11px] text-slate-500">
              Leave blank to automatically utilize the project cover image.
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 border border-slate-200">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Robots &amp; Crawler Directives
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.noIndex}
                onChange={(e) => onChange({ noIndex: e.target.checked })}
                className="w-4 h-4 accent-red-600 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  noindex (Do not index in search engines)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Instructs Google not to index this page in search results.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-200">
              <input
                type="checkbox"
                checked={formData.noFollow}
                onChange={(e) => onChange({ noFollow: e.target.checked })}
                className="w-4 h-4 accent-red-600 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  nofollow (Do not follow outgoing links)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Instructs search engine bots not to follow links on this page.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 4. AEO & GEO Verification Summary */}
      <div className="pt-6 border-t border-slate-200">
        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" /> AEO &amp; GEO Architecture Readiness
        </h4>

        <div className="grid md:grid-cols-2 gap-4 text-xs">
          {/* AEO Summary */}
          <div className="bg-white border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
              <span className="flex items-center gap-1">
                <ListChecks className="w-3.5 h-3.5 text-blue-600" /> AEO (Answer Engine) Status
              </span>
              <span className="text-[10px] text-slate-500">Schema.org Ready</span>
            </div>
            <div className="space-y-1 text-slate-600">
              <p className="flex justify-between">
                <span>Summary Snippet:</span>
                <span className="font-semibold text-slate-900">
                  {formData.shortDescription ? "✓ Defined" : "— Missing"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Structured Highlights:</span>
                <span className="font-semibold text-slate-900">
                  {formData.highlights.length} Defined
                </span>
              </p>
              <p className="flex justify-between">
                <span>Structured FAQs:</span>
                <span className="font-semibold text-slate-900">
                  {formData.faqs.length} Questions
                </span>
              </p>
              <p className="flex justify-between">
                <span>Verified Client:</span>
                <span className="font-semibold text-slate-900">
                  {formData.client || "— Not specified"}
                </span>
              </p>
            </div>
          </div>

          {/* GEO Summary */}
          <div className="bg-white border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> GEO (Local Search) Status
              </span>
              <span className="text-[10px] text-slate-500">Zero Defaults Rule</span>
            </div>
            <div className="space-y-1 text-slate-600">
              <p className="flex justify-between">
                <span>City / State:</span>
                <span className="font-semibold text-slate-900">
                  {[formData.city, formData.state].filter(Boolean).join(", ") || "— None"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>District / Country:</span>
                <span className="font-semibold text-slate-900">
                  {[formData.district, formData.country].filter(Boolean).join(", ") || "— None"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Google Maps URL:</span>
                <span className="font-semibold text-slate-900">
                  {formData.googleMapsUrl ? "✓ Linked" : "— None"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
