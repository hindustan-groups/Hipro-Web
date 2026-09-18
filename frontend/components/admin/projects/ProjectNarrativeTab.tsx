"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Sparkles,
  ListChecks,
  FileText,
  Eye,
  Edit3,
  ChevronDown,
  ShieldCheck,
  AlignLeft,
} from "lucide-react";
import type { ProjectHighlight, ProjectFaq } from "@/lib/types";

interface ProjectNarrativeTabProps {
  formData: {
    shortDescription: string;
    description: string;
    highlights: ProjectHighlight[];
    faqs: ProjectFaq[];
  };
  onChange: (fields: Partial<ProjectNarrativeTabProps["formData"]>) => void;
}

export default function ProjectNarrativeTab({
  formData,
  onChange,
}: ProjectNarrativeTabProps) {
  const [descViewMode, setDescViewMode] = useState<"edit" | "preview">("edit");
  const [activeFaqPreview, setActiveFaqPreview] = useState<number | null>(null);

  // Highlights Helpers
  const handleAddHighlight = () => {
    onChange({
      highlights: [...formData.highlights, { label: "", value: "" }],
    });
  };

  const handleUpdateHighlight = (index: number, field: "label" | "value", val: string) => {
    const updated = [...formData.highlights];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ highlights: updated });
  };

  const handleRemoveHighlight = (index: number) => {
    onChange({
      highlights: formData.highlights.filter((_, i) => i !== index),
    });
  };

  const handleMoveHighlight = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.highlights.length) return;
    const updated = [...formData.highlights];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange({ highlights: updated });
  };

  // FAQ Helpers
  const handleAddFaq = () => {
    onChange({
      faqs: [...formData.faqs, { question: "", answer: "" }],
    });
  };

  const handleUpdateFaq = (index: number, field: "question" | "answer", val: string) => {
    const updated = [...formData.faqs];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ faqs: updated });
  };

  const handleRemoveFaq = (index: number) => {
    onChange({
      faqs: formData.faqs.filter((_, i) => i !== index),
    });
  };

  const handleMoveFaq = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.faqs.length) return;
    const updated = [...formData.faqs];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange({ faqs: updated });
  };

  const shortDescLen = formData.shortDescription.length;
  const descWordCount = formData.description ? formData.description.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          SECTION A: SHORT FACTUAL SUMMARY / EXECUTIVE BRIEF
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-construction-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              03A · Executive Brief &amp; Card Excerpt
            </h3>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 border ${
              shortDescLen > 240
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : shortDescLen >= 80
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {shortDescLen} / 220 chars recommended
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
              Concise Project Brief
            </label>
            <textarea
              rows={3}
              value={formData.shortDescription}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
              placeholder="e.g. 120,000 sq.ft heavy PEB manufacturing plant with 25-ton EOT crane provisions, built for Sangam Group in Bhilwara."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-xs font-normal rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy leading-relaxed transition-all"
            />
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Appears on directory cards, search engine previews, and in the highlighted executive brief on the case study page.
            </p>
          </div>

          {/* Public Detail Page Executive Brief Simulation */}
          {formData.shortDescription && (
            <div className="p-4 bg-blue-50/60 border border-blue-100 border-l-4 border-l-construction-navy">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-construction-navy mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-construction-navy" />
                <span>Executive Brief Live Excerpt</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-normal">
                {formData.shortDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B: FULL DETAILED CASE STUDY NARRATIVE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-3.5 h-3.5 text-construction-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              03B · Engineering Case Study &amp; Scope Narrative
            </h3>
            <span className="text-construction-red font-bold text-sm">*</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
              {descWordCount} Words
            </span>
            {/* Edit / Preview Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 border border-slate-300">
              <button
                type="button"
                onClick={() => setDescViewMode("edit")}
                className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  descViewMode === "edit"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setDescViewMode("preview")}
                className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  descViewMode === "preview"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span>Full Engineering Scope &amp; Execution Details</span>
              <span className="text-construction-red font-bold">*</span>
            </label>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
              Publish Required
            </span>
          </div>

          {descViewMode === "edit" ? (
            <textarea
              required
              rows={10}
              value={formData.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Detail structural scope, architectural nuances, engineering challenges solved, materials utilized, foundation engineering, heavy machinery provisions, and handover milestones..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-3 text-xs font-normal rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy leading-relaxed transition-all"
            />
          ) : (
            <div className="min-h-[220px] bg-slate-50 border border-slate-200 p-5 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal">
              {formData.description ? (
                formData.description
              ) : (
                <span className="text-slate-400 font-mono italic">
                  No narrative content entered yet. Switch to Edit mode to compose case study.
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              Paragraphs and formatting line breaks are rendered faithfully on the public site.
            </span>
            <span className="font-mono text-slate-600">
              {formData.description.length} Characters
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C: KEY HIGHLIGHTS REPEATER
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ListChecks className="w-3.5 h-3.5 text-construction-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              03C · Key Project Highlights &amp; Technical Metrics
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
            {formData.highlights.length} Metrics Defined
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-600 font-normal">
              Structured specification pairs (e.g. &ldquo;Foundation Depth&rdquo; : &ldquo;4.5 Meters&rdquo;, &ldquo;Crane Capacity&rdquo; : &ldquo;25 Tons&rdquo;).
            </p>
            <button
              type="button"
              onClick={handleAddHighlight}
              className="bg-slate-900 hover:bg-construction-navy text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add Metric
            </button>
          </div>

          {formData.highlights.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
              No technical highlights added yet. Click &ldquo;Add Metric&rdquo; above to create key specification pairs.
            </div>
          ) : (
            <div className="space-y-2.5">
              {formData.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 border border-slate-300 p-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between sm:justify-start gap-1 shrink-0 text-slate-400">
                    <span className="text-[10px] font-mono text-slate-500 mr-1 sm:hidden">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveHighlight(idx, "up")}
                      className="hover:text-slate-900 disabled:opacity-20 cursor-pointer p-1"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === formData.highlights.length - 1}
                      onClick={() => handleMoveHighlight(idx, "down")}
                      className="hover:text-slate-900 disabled:opacity-20 cursor-pointer p-1"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateHighlight(idx, "label", e.target.value)}
                    placeholder="Metric Label (e.g. Crane Capacity)"
                    className="w-full sm:w-2/5 bg-white border border-slate-300 text-slate-900 px-3 py-1.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                  />

                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleUpdateHighlight(idx, "value", e.target.value)}
                    placeholder="Value / Spec (e.g. 25 MT EOT Crane)"
                    className="w-full sm:flex-1 bg-white border border-slate-300 text-slate-900 px-3 py-1.5 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="text-slate-400 hover:text-construction-red p-1.5 shrink-0 cursor-pointer transition-colors self-end sm:self-auto"
                    title="Remove metric"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Public Light Mode Highlights Simulation */}
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2">
                  Public Highlights Preview:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {formData.highlights.map((item, i) => (
                    <div key={i} className="p-2.5 bg-white border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-0.5">
                        {item.label || "Specification"}
                      </span>
                      <span className="text-slate-900 font-semibold text-xs">
                        {item.value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION D: FAQS REPEATER
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-construction-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              03D · Project FAQs &amp; AEO Q&amp;A
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
            FAQ Schema ({formData.faqs.length})
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-600 font-normal">
              Direct technical questions &amp; answers for AI search engines and Schema.org FAQPage rich snippets.
            </p>
            <button
              type="button"
              onClick={handleAddFaq}
              className="bg-slate-900 hover:bg-construction-navy text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add FAQ
            </button>
          </div>

          {formData.faqs.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
              No Q&amp;A entries defined. Click &ldquo;Add FAQ&rdquo; above to structure technical answers for search engines.
            </div>
          ) : (
            <div className="space-y-3.5">
              {formData.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-300 p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                      Technical Q&amp;A #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveFaq(idx, "up")}
                        className="text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer p-1"
                        title="Move up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === formData.faqs.length - 1}
                        onClick={() => handleMoveFaq(idx, "down")}
                        className="text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer p-1"
                        title="Move down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-slate-400 hover:text-construction-red cursor-pointer p-1 ml-1 transition-colors"
                        title="Remove FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
                    placeholder="Question (e.g. What structural steel grade was utilized?)"
                    className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-1.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                  />

                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                    placeholder="Factual answer explaining technical specifics, engineering solutions, or certifications..."
                    className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-1.5 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy leading-relaxed"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
