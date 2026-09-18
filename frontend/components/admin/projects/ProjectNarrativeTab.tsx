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
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: SHORT FACTUAL SUMMARY / EXECUTIVE BRIEF
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              01 · Executive Brief &amp; Card Excerpt
            </h3>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 border ${
              shortDescLen > 240
                ? "bg-amber-950 text-amber-400 border-amber-800"
                : shortDescLen >= 80
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {shortDescLen} / 220 chars recommended
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
              Concise Project Brief
            </label>
            <textarea
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
              placeholder="e.g. 120,000 sq.ft heavy PEB manufacturing plant with 25-ton EOT crane provisions, built for Sangam Group in Bhilwara."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-normal rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy resize-none leading-relaxed transition-all"
            />
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Appears on directory listing cards, search engine snippets, and in the highlighted executive brief on the case study page.
            </p>
          </div>

          {/* Public Detail Page Executive Brief Simulation */}
          {formData.shortDescription && (
            <div className="pt-2">
              <div className="p-5 bg-slate-900/90 border border-slate-800 border-l-4 border-l-amber-500 shadow-inner">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Executive Brief Live Simulation (/projects/[slug])</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-light">
                  {formData.shortDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: FULL DETAILED CASE STUDY NARRATIVE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              02 · Engineering Case Study &amp; Technical Scope Narrative
            </h3>
            <span className="text-construction-red font-bold text-sm">*</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
              {descWordCount} Words
            </span>
            {/* Edit / Preview Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setDescViewMode("edit")}
                className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  descViewMode === "edit"
                    ? "bg-amber-500 text-black shadow-xs"
                    : "text-slate-400 hover:text-white"
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
                    ? "bg-amber-500 text-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Live Preview</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span>Engineering Execution Scope</span>
              <span className="text-construction-red font-bold">*</span>
            </label>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
              Publish Mandatory
            </span>
          </div>

          {descViewMode === "edit" ? (
            <textarea
              required
              rows={9}
              value={formData.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Detail structural scope, architectural nuances, engineering challenges solved, materials utilized, foundation engineering, heavy machinery provisions, and handover milestones..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-3 text-sm font-normal rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy leading-relaxed transition-all"
            />
          ) : (
            <div className="min-h-[220px] bg-slate-950 border border-slate-800 p-6 text-sm text-slate-200 leading-relaxed whitespace-pre-line font-light shadow-inner">
              {formData.description ? (
                formData.description
              ) : (
                <span className="text-slate-500 font-mono italic">
                  No narrative content entered yet. Switch to Edit mode to compose case study.
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              Plain text paragraphs and line breaks are faithfully preserved in public rendering.
            </span>
            <span className="font-mono text-slate-600">
              {formData.description.length} Characters
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: KEY HIGHLIGHTS REPEATER
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ListChecks className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              03 · Key Project Highlights &amp; Technical Metrics
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            {formData.highlights.length} Metrics Defined
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 font-normal">
              Structured specification pairs (e.g. &ldquo;Foundation Depth&rdquo; : &ldquo;4.5 Meters&rdquo;, &ldquo;Crane Capacity&rdquo; : &ldquo;25 Tons&rdquo;).
            </p>
            <button
              type="button"
              onClick={handleAddHighlight}
              className="bg-slate-900 hover:bg-construction-navy text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1 cursor-pointer shrink-0"
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
                  className="flex items-center gap-2 bg-slate-50 border border-slate-300 p-2 shadow-xs"
                >
                  <div className="flex flex-col gap-0.5 shrink-0 text-slate-400">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveHighlight(idx, "up")}
                      className="hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === formData.highlights.length - 1}
                      onClick={() => handleMoveHighlight(idx, "down")}
                      className="hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateHighlight(idx, "label", e.target.value)}
                    placeholder="Metric Label (e.g. Total Steel Tonnage)"
                    className="w-2/5 bg-white border border-slate-300 text-slate-900 px-3 py-1.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                  />

                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleUpdateHighlight(idx, "value", e.target.value)}
                    placeholder="Value / Spec (e.g. 1,450 MT)"
                    className="flex-1 bg-white border border-slate-300 text-slate-900 px-3 py-1.5 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="text-slate-400 hover:text-construction-red p-1.5 shrink-0 cursor-pointer transition-colors"
                    title="Remove metric"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Public Darkroom Highlights Grid Simulation */}
              <div className="mt-4 p-4 bg-slate-950 border border-slate-800 shadow-md">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-3">
                  Live Public Highlights Grid Simulation (/projects/[slug]):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {formData.highlights.map((item, i) => (
                    <div key={i} className="p-3 bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block mb-0.5">
                        {item.label || "Specification"}
                      </span>
                      <span className="text-slate-100 font-medium font-mono text-xs">
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
          SECTION 4: AEO & FAQ REPEATER
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              04 · Project Execution FAQs &amp; AEO Knowledge Q&amp;A
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            FAQPage Schema Anchor ({formData.faqs.length})
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 font-normal">
              Direct technical questions &amp; answers for AI search engines (Perplexity, ChatGPT, Gemini) and Schema.org FAQPage rich snippets.
            </p>
            <button
              type="button"
              onClick={handleAddFaq}
              className="bg-slate-900 hover:bg-construction-navy text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add FAQ
            </button>
          </div>

          {formData.faqs.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
              No Q&amp;A entries defined. Click &ldquo;Add FAQ&rdquo; above to structure technical answers for search engines.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-300 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                      Technical Q&amp;A Record #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveFaq(idx, "up")}
                        className="text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer p-0.5"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === formData.faqs.length - 1}
                        onClick={() => handleMoveFaq(idx, "down")}
                        className="text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer p-0.5"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-slate-400 hover:text-construction-red cursor-pointer p-0.5 ml-1 transition-colors"
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
                    placeholder="Question (e.g. What structural steel grade was utilized for the clear span trusses?)"
                    className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                  />

                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                    placeholder="Factual answer explaining technical specifics, engineering solutions, or certifications..."
                    className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy resize-none leading-relaxed"
                  />
                </div>
              ))}

              {/* Live Darkroom Accordion Preview */}
              <div className="mt-4 p-5 bg-slate-950 border border-slate-800 shadow-md">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-3">
                  Live Public Accordion Simulation (/projects/[slug]):
                </span>
                <div className="space-y-2">
                  {formData.faqs.map((faq, idx) => {
                    const isOpen = activeFaqPreview === idx;
                    return (
                      <div key={idx} className="border border-slate-800 bg-slate-900/90">
                        <button
                          type="button"
                          onClick={() => setActiveFaqPreview(isOpen ? null : idx)}
                          className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-100 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <span>{faq.question || `FAQ #${idx + 1} Question`}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-amber-400 shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-3.5 text-xs text-slate-300 font-light leading-relaxed border-t border-slate-800/80 pt-2.5 whitespace-pre-line">
                            {faq.answer || "No answer provided yet."}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
