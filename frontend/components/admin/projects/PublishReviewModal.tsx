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

  // 1. EVALUATE REQUIRED (STRICT 4 ONLY)
  const requiredChecks = [
    {
      id: "title",
      label: "Project Title",
      tabIndex: 0,
      tabName: "01 / General",
      isComplete: Boolean(project.title && project.title.trim()),
    },
    {
      id: "location",
      label: "General Location Display",
      tabIndex: 1,
      tabName: "02 / Specifications",
      isComplete: Boolean(project.location && project.location.trim()),
    },
    {
      id: "date",
      label: "Project Date / Timeline Display",
      tabIndex: 1,
      tabName: "02 / Specifications",
      isComplete: Boolean(project.date && project.date.trim()),
    },
    {
      id: "description",
      label: "Full Case Study & Scope Narrative",
      tabIndex: 2,
      tabName: "03 / Narrative",
      isComplete: Boolean(project.description && project.description.trim()),
    },
  ];

  const requiredCount = requiredChecks.filter((r) => r.isComplete).length;
  const allRequiredMet = requiredCount === requiredChecks.length;

  // 2. EVALUATE RECOMMENDED (12 ITEMS)
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
      label: "Multi-Angle Gallery Photographs",
      tabIndex: 3,
      isComplete: project.galleryDetails && project.galleryDetails.length > 0,
      tip: "Visual proof of engineering execution.",
    },
    {
      id: "faqs",
      label: "Technical Project FAQs",
      tabIndex: 2,
      isComplete: project.faqs && project.faqs.length > 0,
      tip: "Powers Schema.org FAQPage rich snippets.",
    },
    {
      id: "metaTitle",
      label: "Custom SEO Meta Title",
      tabIndex: 4,
      isComplete: Boolean(project.metaTitle && project.metaTitle.trim()),
      tip: "Optimizes SERP click-through rates.",
    },
    {
      id: "metaDesc",
      label: "Custom SEO Meta Description",
      tabIndex: 4,
      isComplete: Boolean(project.metaDescription && project.metaDescription.trim()),
      tip: "Snippet preview in Google search results.",
    },
    {
      id: "keywords",
      label: "Primary Focus Keywords",
      tabIndex: 4,
      isComplete: Boolean(project.focusKeywords && project.focusKeywords.trim()),
      tip: "Target keywords for search queries.",
    },
    {
      id: "cityState",
      label: "Granular Site Geography (City & State)",
      tabIndex: 1,
      isComplete: Boolean(project.city && project.state),
      tip: "Enables regional search targeting in Rajasthan & India.",
    },
    {
      id: "mapsUrl",
      label: "Google Maps Coordinates or URL",
      tabIndex: 1,
      isComplete: Boolean(project.googleMapsUrl || (project.latitude && project.longitude)),
      tip: "Enables interactive map anchor and verified GEO entity.",
    },
  ];

  const recommendedCount = recommendedChecks.filter((r) => r.isComplete).length;

  // Informational readiness score (0 - 100%)
  const totalScore = Math.round((requiredCount * 15) + (recommendedCount * (40 / 12)));
  const readinessPercent = Math.min(100, totalScore);

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-300 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 flex items-center justify-center border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-construction-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-construction-red"></span>
                <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-900">
                  PUBLISH READINESS AUDIT
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Validation check before deploying to live public portfolio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
            title="Close Audit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Readiness Gauge Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <div>
              <span className="text-slate-500 font-mono uppercase text-[10px] block">Readiness</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{readinessPercent}%</span>
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 font-mono uppercase text-[10px] block">Mandatory</span>
              <span
                className={`font-bold font-mono text-sm ${
                  allRequiredMet ? "text-emerald-700" : "text-construction-red"
                }`}
              >
                {requiredCount}/4 {allRequiredMet ? "✓ Ready" : "⚠ Gaps"}
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 font-mono uppercase text-[10px] block">Recommended</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {recommendedCount}/{recommendedChecks.length}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${
              allRequiredMet
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-red-50 text-construction-red border-red-300"
            }`}
          >
            {allRequiredMet ? "APPROVED FOR LIVE" : "PUBLISH BLOCKED"}
          </span>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* SECTION 1: REQUIRED (BLOCKING) */}
          <div>
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span className="text-construction-red font-bold">*</span> Mandatory Publish Requirements ({requiredCount}/4)
              </h4>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {allRequiredMet ? "All 4 Complete" : "Blocks Publishing"}
              </span>
            </div>

            <div className="border border-slate-200 divide-y divide-slate-200">
              {requiredChecks.map((req) => (
                <div
                  key={req.id}
                  className={`p-3 flex items-center justify-between gap-2 ${
                    req.isComplete ? "bg-white" : "bg-red-50/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {req.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-construction-red shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`font-bold text-xs truncate ${
                          req.isComplete ? "text-slate-900" : "text-red-950"
                        }`}
                      >
                        {req.label}
                      </p>
                      {!req.isComplete && (
                        <p className="text-[10px] text-red-700 font-mono mt-0.5">
                          Missing value. Configure in {req.tabName}.
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
                      className="px-2.5 py-1 bg-construction-red hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: RECOMMENDED (NON-BLOCKING) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Recommended Specifications ({recommendedCount}/{recommendedChecks.length})
              </h4>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Optional
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {recommendedChecks.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-2.5 border flex items-start gap-2 ${
                    rec.isComplete ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  {rec.isComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 text-[11px] truncate">
                      {rec.label}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {rec.tip}
                    </p>
                  </div>
                  {!rec.isComplete && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onJumpToTab(rec.tabIndex);
                      }}
                      className="text-[10px] font-bold uppercase text-construction-navy hover:text-construction-red shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="w-full sm:w-auto text-left">
            {!allRequiredMet ? (
              <p className="text-xs font-bold text-construction-red flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {4 - requiredCount} required field(s) missing.
              </p>
            ) : (
              <p className="text-xs text-emerald-800 font-semibold font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Ready to publish.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!allRequiredMet || isPublishing}
              onClick={onConfirmPublish}
              className="flex-1 sm:flex-none px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
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
