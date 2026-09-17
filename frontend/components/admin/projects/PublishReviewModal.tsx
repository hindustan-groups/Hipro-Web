"use client";

import React from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Globe,
  Upload,
} from "lucide-react";
import type { ProjectHighlight, ProjectFaq, ProjectGalleryItem } from "@/lib/types";

interface PublishReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish: () => void;
  onJumpToTab: (tabIndex: number) => void;
  isPublishing?: boolean;
  project: {
    title: string;
    location: string;
    date: string;
    description: string;
    category: string;
    image: string;
    imageAlt: string;
    shortDescription: string;
    highlights: ProjectHighlight[];
    galleryDetails: ProjectGalleryItem[];
    faqs: ProjectFaq[];
    metaTitle: string;
    metaDescription: string;
    focusKeywords: string;
    city: string;
    state: string;
    googleMapsUrl: string;
    latitude: string | number;
    longitude: string | number;
    videoUrl: string;
    client: string;
    owner: string;
    area: string;
    postalCode: string;
    canonicalUrl: string;
  };
}

export default function PublishReviewModal({
  isOpen,
  onClose,
  onConfirmPublish,
  onJumpToTab,
  isPublishing = false,
  project,
}: PublishReviewModalProps) {
  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────
  // 1. EVALUATE REQUIRED (STRICT 4 ONLY)
  // ─────────────────────────────────────────────────────────────
  const requiredChecks = [
    {
      id: "title",
      label: "Project Title",
      tabIndex: 0,
      tabName: "General",
      isComplete: Boolean(project.title && project.title.trim()),
    },
    {
      id: "location",
      label: "General Location Display",
      tabIndex: 1,
      tabName: "Specifications",
      isComplete: Boolean(project.location && project.location.trim()),
    },
    {
      id: "date",
      label: "Project Date / Timeline Display",
      tabIndex: 1,
      tabName: "Specifications",
      isComplete: Boolean(project.date && project.date.trim()),
    },
    {
      id: "description",
      label: "Full Case Study & Scope Narrative",
      tabIndex: 2,
      tabName: "Narrative",
      isComplete: Boolean(project.description && project.description.trim()),
    },
  ];

  const requiredCount = requiredChecks.filter((r) => r.isComplete).length;
  const allRequiredMet = requiredCount === requiredChecks.length;

  // ─────────────────────────────────────────────────────────────
  // 2. EVALUATE RECOMMENDED (12 ITEMS)
  // ─────────────────────────────────────────────────────────────
  const recommendedChecks = [
    {
      id: "category",
      label: "Primary Industry Category Selected",
      tabIndex: 0,
      isComplete: Boolean(project.category && project.category.trim()),
      tip: "Categorizes project in portfolio filters.",
    },
    {
      id: "coverImage",
      label: "Main Cover / Hero Image Uploaded",
      tabIndex: 3,
      isComplete: Boolean(project.image && project.image.trim()),
      tip: "Provides visual showcase on portfolio card and header.",
    },
    {
      id: "coverAlt",
      label: "Cover Image Descriptive Alt Text",
      tabIndex: 3,
      isComplete: Boolean(project.imageAlt && project.imageAlt.trim()),
      tip: "Required for web accessibility and Google Image SEO.",
    },
    {
      id: "shortDescription",
      label: "Executive Summary / Short Snippet",
      tabIndex: 2,
      isComplete: Boolean(project.shortDescription && project.shortDescription.trim()),
      tip: "Enriches AI search engines (AEO) and card previews.",
    },
    {
      id: "highlights",
      label: "Key Technical / Execution Highlights",
      tabIndex: 2,
      isComplete: project.highlights && project.highlights.length > 0,
      tip: "Structured specification pairs for client trust.",
    },
    {
      id: "gallery",
      label: "Project Gallery Photography (1+ photos)",
      tabIndex: 3,
      isComplete: project.galleryDetails && project.galleryDetails.length > 0,
      tip: "Visual proof of site work and architectural finish.",
    },
    {
      id: "faqs",
      label: "Project Engineering FAQs",
      tabIndex: 2,
      isComplete: project.faqs && project.faqs.length > 0,
      tip: "Powers Schema.org FAQPage rich search snippets.",
    },
    {
      id: "metaTitle",
      label: "Custom SEO Meta Title (50-60 chars)",
      tabIndex: 4,
      isComplete: Boolean(project.metaTitle && project.metaTitle.trim()),
      tip: "Optimizes SERP headline; falls back to brand title.",
    },
    {
      id: "metaDesc",
      label: "Custom SEO Meta Description (140-160 chars)",
      tabIndex: 4,
      isComplete: Boolean(project.metaDescription && project.metaDescription.trim()),
      tip: "Organic search click-through snippet.",
    },
    {
      id: "focusKeywords",
      label: "Primary Focus Keyword Defined",
      tabIndex: 4,
      isComplete: Boolean(project.focusKeywords && project.focusKeywords.trim()),
      tip: "Keywords for search intent targeting.",
    },
    {
      id: "geoCityState",
      label: "Verified Geographic City & State",
      tabIndex: 1,
      isComplete: Boolean(project.city && project.state),
      tip: "Powers local GEO search ranking.",
    },
    {
      id: "geoMap",
      label: "Google Maps Link or GPS Coordinates",
      tabIndex: 1,
      isComplete: Boolean(project.googleMapsUrl || (project.latitude && project.longitude)),
      tip: "Verifiable project location coordinate.",
    },
  ];

  const recommendedCount = recommendedChecks.filter((r) => r.isComplete).length;

  // ─────────────────────────────────────────────────────────────
  // 3. OPTIONAL FIELDS SUMMARY
  // ─────────────────────────────────────────────────────────────
  const optionalItems = [
    { label: "Execution Video Showcase", provided: Boolean(project.videoUrl) },
    { label: "Built-up Area / Scale", provided: Boolean(project.area) },
    { label: "Client Name", provided: Boolean(project.client) },
    { label: "Owner / Developer", provided: Boolean(project.owner) },
    { label: "Postal PIN Code", provided: Boolean(project.postalCode) },
    { label: "Canonical URL Override", provided: Boolean(project.canonicalUrl) },
  ];

  // Informational readiness score (0 - 100%)
  const totalScore = Math.round((requiredCount * 15) + (recommendedCount * (40 / 12)));
  const readinessPercent = Math.min(100, totalScore);

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold tracking-tight">Pre-Publish Quality Review</h3>
              <p className="text-xs text-slate-400 font-mono">
                Verify data completeness before making project public
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Readiness Overview Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 font-medium">Project Readiness: </span>
              <span className="font-bold text-slate-900 font-mono">{readinessPercent}%</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 font-medium">Required: </span>
              <span
                className={`font-bold font-mono ${
                  allRequiredMet ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {requiredCount}/4 {allRequiredMet ? "✓" : "⚠"}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 font-medium">Recommended: </span>
              <span className="font-bold text-slate-900 font-mono">
                {recommendedCount}/{recommendedChecks.length}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* SECTION 1: REQUIRED */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span className="text-red-500 font-bold">*</span> 1. Hard-Required Fields ({requiredCount}/4)
              </h4>
              <span className="text-[11px] text-slate-500">
                {allRequiredMet ? "All 4 required fields satisfied" : "Must be completed to publish"}
              </span>
            </div>

            <div className="border border-slate-200 divide-y divide-slate-100">
              {requiredChecks.map((req) => (
                <div
                  key={req.id}
                  className={`p-3 flex items-center justify-between ${
                    req.isComplete ? "bg-white" : "bg-red-50/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {req.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <div>
                      <p
                        className={`font-semibold ${
                          req.isComplete ? "text-slate-800" : "text-red-900"
                        }`}
                      >
                        {req.label}
                      </p>
                      {!req.isComplete && (
                        <p className="text-[10px] text-red-700">
                          Required field is missing. Please provide in {req.tabName} tab.
                        </p>
                      )}
                    </div>
                  </div>

                  {!req.isComplete && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onJumpToTab(req.tabIndex);
                      }}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Fix in {req.tabName}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: RECOMMENDED */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> 2. Recommended Fields ({recommendedCount}/{recommendedChecks.length})
              </h4>
              <span className="text-[10px] text-slate-500">
                Informational • Does NOT block publishing
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Completing recommended items maximizes SEO ranking, rich search snippets, and visitor engagement.
            </p>

            <div className="border border-slate-200 divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {recommendedChecks.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2.5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {rec.isComplete ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-amber-400 bg-amber-50 text-amber-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                        !
                      </span>
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-xs ${
                          rec.isComplete ? "text-slate-800 font-medium" : "text-slate-600"
                        }`}
                      >
                        {rec.label}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{rec.tip}</p>
                    </div>
                  </div>

                  {!rec.isComplete && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onJumpToTab(rec.tabIndex);
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 shrink-0 px-2 py-0.5 border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      Fill
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: OPTIONAL SUMMARY */}
          <div className="bg-slate-50 border border-slate-200 p-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" /> 3. Optional Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              {optionalItems.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-600">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      opt.provided ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  <span className="truncate">{opt.label}:</span>
                  <span className="font-semibold text-slate-900">
                    {opt.provided ? "Yes" : "None"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            {!allRequiredMet ? (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Cannot publish: {4 - requiredCount} required field(s) missing.
              </p>
            ) : recommendedCount < 6 ? (
              <p className="text-xs text-amber-700">
                Ready to publish. (Tip: Adding cover image &amp; summary boosts visibility).
              </p>
            ) : (
              <p className="text-xs text-emerald-700 font-medium">
                High data quality. Ready for live indexing.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel / Review
            </button>

            <button
              type="button"
              disabled={!allRequiredMet || isPublishing}
              onClick={onConfirmPublish}
              className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Publish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
