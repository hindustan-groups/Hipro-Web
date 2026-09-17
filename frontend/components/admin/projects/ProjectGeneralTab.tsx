"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, AlertCircle, Check, HelpCircle, Tag, Plus, X, Globe, Copy, ExternalLink } from "lucide-react";

interface ProjectGeneralTabProps {
  formData: {
    title: string;
    slug: string;
    category: string;
    subCategories: string[];
    status: "active" | "ongoing" | "completed" | "archived";
    publishStatus: "draft" | "published" | "archived";
    featured: boolean;
    order: number;
  };
  onChange: (fields: Partial<ProjectGeneralTabProps["formData"]>) => void;
  slugError?: string;
  isSlugManuallyEdited: boolean;
  setIsSlugManuallyEdited: (edited: boolean) => void;
  generateSlug: (title: string) => string;
}

const PRESET_CATEGORIES = [
  "Commercial",
  "Residential",
  "Industrial",
  "Industrial Construction",
  "Infrastructure",
  "Institutional",
  "Designing and Planning",
  "Design, Planning & Structural",
];

export default function ProjectGeneralTab({
  formData,
  onChange,
  slugError,
  isSlugManuallyEdited,
  setIsSlugManuallyEdited,
  generateSlug,
}: ProjectGeneralTabProps) {
  const [tagInput, setTagInput] = useState("");
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState<boolean>(
    Boolean(formData.category && !PRESET_CATEGORIES.includes(formData.category))
  );

  useEffect(() => {
    if (formData.category && !PRESET_CATEGORIES.includes(formData.category)) {
      setIsCustomCategoryMode(true);
    } else if (formData.category === "") {
      setIsCustomCategoryMode(false);
    }
  }, [formData.category]);

  const selectCategoryValue = isCustomCategoryMode
    ? "__custom__"
    : PRESET_CATEGORIES.includes(formData.category)
    ? formData.category
    : "";

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustomCategoryMode(true);
    } else {
      setIsCustomCategoryMode(false);
      onChange({ category: val });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const updates: any = { title: newTitle };
    if (!isSlugManuallyEdited) {
      updates.slug = generateSlug(newTitle);
    }
    onChange(updates);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    onChange({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") });
  };

  const handleRegenerateSlug = () => {
    setIsSlugManuallyEdited(false);
    onChange({ slug: generateSlug(formData.title) });
  };

  const handleCopyPublicUrl = async () => {
    const fullUrl = `https://www.hindustanprojects.in/projects/${formData.slug || ""}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (!formData.subCategories.includes(trimmed)) {
      onChange({ subCategories: [...formData.subCategories, trimmed] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      subCategories: formData.subCategories.filter((t) => t !== tagToRemove),
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Slug Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>
              Project Title <span className="text-red-500 font-bold">*</span>
            </span>
            <span className="text-[10px] text-red-500 font-normal uppercase">Required</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g. Modern Logistics Hub Phase 2"
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
          />
          <p className="text-[11px] text-slate-500">
            The official public name of the project.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              URL Slug
            </label>
            {isSlugManuallyEdited && (
              <button
                type="button"
                onClick={handleRegenerateSlug}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Auto-sync with Title
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="e.g. modern-logistics-hub-phase-2"
              className={`w-full bg-slate-50 border text-slate-900 font-mono px-4 py-2.5 text-xs focus:outline-none focus:ring-2 transition-all ${
                slugError
                  ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                  : "border-slate-200 focus:ring-construction-navy/20 focus:border-construction-navy"
              }`}
            />
          </div>
          {slugError ? (
            <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" /> {slugError}
            </p>
          ) : (
            <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200 px-2.5 py-1.5 font-mono">
              <span className="text-slate-600 truncate mr-2">
                https://www.hindustanprojects.in/projects/
                <span className="text-construction-navy font-bold">
                  {formData.slug || "your-slug"}
                </span>
              </span>
              <button
                type="button"
                onClick={handleCopyPublicUrl}
                className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 font-semibold cursor-pointer"
                title="Copy public URL"
              >
                {copiedSlug ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category & Tags Section */}
      <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>Primary Category</span>
            <span className="text-[10px] text-blue-600 font-normal uppercase">Recommended</span>
          </label>
          <select
            value={selectCategoryValue}
            onChange={handleCategorySelectChange}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
          >
            <option value="">[ Select category / Unassigned ]</option>
            {PRESET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__custom__">Custom...</option>
          </select>

          {isCustomCategoryMode && (
            <div className="space-y-1 pt-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-semibold text-construction-navy">Custom Category:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategoryMode(false);
                    onChange({ category: "" });
                  }}
                  className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  Clear to Unassigned
                </button>
              </div>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => onChange({ category: e.target.value })}
                placeholder="e.g. Industrial Construction, Designing and Planning, etc."
                className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                autoFocus
              />
            </div>
          )}

          <p className="text-[11px] text-slate-500">
            Controls main portfolio filter tab and breadcrumb categorization. Leave empty if unassigned.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            Subcategories / Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="e.g. Pre-Engineered, Warehousing (Press Enter)"
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-bold uppercase tracking-wider border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {formData.subCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.subCategories.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-construction-navy text-xs font-medium"
                >
                  <Tag className="w-3 h-3 text-blue-500" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-red-600 transition-colors ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Operational Lifecycle Status vs Publishing Status */}
      <div className="pt-4 border-t border-slate-100">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-900">Project Status &amp; Publication Workflow</h4>
          <p className="text-xs text-slate-500">
            HiPRO strictly decouples physical project execution from online website publication.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Operational Status */}
          <div className="bg-slate-50/70 border border-slate-200 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Operational Status (Physical State)
              </label>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-0.5 border ${
                  formData.status === "completed"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : formData.status === "archived"
                    ? "bg-slate-100 text-slate-600 border-slate-300"
                    : "bg-blue-50 text-blue-700 border-blue-300"
                }`}
              >
                {formData.status}
              </span>
            </div>
            <select
              value={formData.status}
              onChange={(e) => onChange({ status: e.target.value as any })}
              className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            >
              <option value="ongoing">Ongoing (Active Construction)</option>
              <option value="active">Active (Standard)</option>
              <option value="completed">Completed (Delivered &amp; Commissioned)</option>
              <option value="archived">Archived (Decommissioned)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Reflects the actual ground status for engineering &amp; portfolio timelines.
            </p>
          </div>

          {/* Publishing Status */}
          <div className="bg-slate-50/70 border border-slate-200 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Publishing Status (Website Visibility)
              </label>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-0.5 border ${
                  formData.publishStatus === "published"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : formData.publishStatus === "archived"
                    ? "bg-purple-50 text-purple-700 border-purple-300"
                    : "bg-amber-50 text-amber-700 border-amber-300"
                }`}
              >
                {formData.publishStatus}
              </span>
            </div>
            <select
              value={formData.publishStatus}
              onChange={(e) => onChange({ publishStatus: e.target.value as any })}
              className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            >
              <option value="draft">Draft (Private — Hidden from Public Website)</option>
              <option value="published">Published (Publicly Visible &amp; Indexed)</option>
              <option value="archived">Archived (Unpublished / De-listed)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              {formData.publishStatus === "published"
                ? "✓ This project is visible to website visitors and search engines."
                : "⚠️ This project is strictly hidden from website visitors."}
            </p>
          </div>
        </div>
      </div>

      {/* Featured & Display Order */}
      <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 items-center">
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-3.5 shadow-sm">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => onChange({ featured: e.target.checked })}
            className="w-4 h-4 accent-construction-navy cursor-pointer"
          />
          <div>
            <label htmlFor="featured" className="text-sm font-bold text-slate-800 cursor-pointer block">
              Featured Project
            </label>
            <span className="text-[11px] text-slate-500 block">
              Highlight on Homepage featured showcase carousel &amp; priority listing.
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Display Order Priority
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => onChange({ order: parseInt(e.target.value) || 0 })}
            placeholder="0"
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
          />
          <p className="text-[11px] text-slate-500">
            Lower numbers display first (e.g. 1, 2, 3). Default is 0.
          </p>
        </div>
      </div>
    </div>
  );
}
