"use client";

import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, Sparkles, ListChecks, FileText } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Short Summary Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Short Factual Summary (AEO / Snippet)
          </label>
          <span className="text-[11px] text-slate-400">
            {formData.shortDescription.length} / 220 characters recommended
          </span>
        </div>
        <textarea
          rows={2}
          value={formData.shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          placeholder="e.g. 120,000 sq.ft heavy PEB manufacturing plant with 25-ton EOT crane provisions, built for Sangam Group in Bhilwara."
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none"
        />
        <p className="text-[11px] text-slate-500">
          Used on portfolio cards, meta previews, and AI answer engine snippets.
        </p>
      </div>

      {/* Full Detailed Description */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-construction-navy" /> Full Project Case Study & Scope Narrative <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={6}
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Detail structural scope, architectural nuances, engineering challenges solved, materials utilized, foundation engineering, and handover milestones..."
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
        />
        <p className="text-[11px] text-slate-500">
          Main descriptive body on the project detail page.
        </p>
      </div>

      {/* Structured Key Highlights */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-construction-navy" /> Key Technical Highlights & Metrics
            </h4>
            <p className="text-xs text-slate-500">
              Structured specification pairs (e.g. &quot;Floor Load Capacity&quot; : &quot;8 Ton/sq.m&quot;).
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddHighlight}
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:border-construction-navy hover:text-construction-navy text-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Highlight
          </button>
        </div>

        {formData.highlights.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 p-6 text-center text-slate-400 text-xs">
            No technical highlights added yet. Click &quot;Add Highlight&quot; to define verifiable key facts.
          </div>
        ) : (
          <div className="space-y-2">
            {formData.highlights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white border border-slate-200 p-2 shadow-sm"
              >
                <div className="flex flex-col gap-0.5 shrink-0 text-slate-400">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveHighlight(idx, "up")}
                    className="hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === formData.highlights.length - 1}
                    onClick={() => handleMoveHighlight(idx, "down")}
                    className="hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleUpdateHighlight(idx, "label", e.target.value)}
                  placeholder="Metric Label (e.g. Crane Capacity)"
                  className="w-1/3 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />

                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleUpdateHighlight(idx, "value", e.target.value)}
                  placeholder="Value / Spec (e.g. 25 Ton Double Girder)"
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(idx)}
                  className="text-slate-400 hover:text-red-600 p-1.5 shrink-0 cursor-pointer"
                  title="Remove highlight"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project FAQs (AEO) */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-construction-navy" /> Project-Specific FAQs (AEO & Schema)
            </h4>
            <p className="text-xs text-slate-500">
              Direct factual Q&amp;A for this specific project. (Will generate FAQPage structured data).
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddFaq}
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:border-construction-navy hover:text-construction-navy text-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add FAQ
          </button>
        </div>

        {formData.faqs.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 p-6 text-center text-slate-400 text-xs">
            No project FAQs defined. Add verified questions &amp; answers to enrich AI answers and search rich snippets.
          </div>
        ) : (
          <div className="space-y-3">
            {formData.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-3 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500">
                    FAQ #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveFaq(idx, "up")}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer p-0.5"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === formData.faqs.length - 1}
                      onClick={() => handleMoveFaq(idx, "down")}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer p-0.5"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-slate-400 hover:text-red-600 cursor-pointer p-0.5 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
                  placeholder="Question (e.g. What foundation technique was employed for the heavy press machinery?)"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />

                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                  placeholder="Factual answer explaining technical specifics, engineering solutions, or certifications..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
