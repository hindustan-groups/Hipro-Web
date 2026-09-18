"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  AlertCircle,
  Check,
  Tag,
  Plus,
  X,
  Copy,
  ExternalLink,
  Building,
  CheckCircle,
  MapPin,
  Calendar,
  ArrowUpRight,
  Eye,
  Layers,
  Sliders,
  ShieldCheck,
  Compass,
  Star,
} from "lucide-react";

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
    location: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    targetLocation?: string;
    image?: string;
    imageAlt?: string;
    shortDescription?: string;
    description?: string;
    date?: string;
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
    const updates: Partial<ProjectGeneralTabProps["formData"]> = { title: newTitle };
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
      // Clipboard fallback
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

  const isOngoing = formData.status === "ongoing" || formData.status === "active";

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          SECTION A: PROJECT IDENTITY
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-construction-red"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              01A · Project Identity &amp; Routing
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
            Primary Spec
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <span>Project Title</span>
                  <span className="text-construction-red font-bold">*</span>
                </label>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
                  Required
                </span>
              </div>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Modern Logistics Hub Phase 2"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy transition-all"
              />
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                The primary public title displayed on portfolio cards, project header, and meta tags.
              </p>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <span>URL Slug</span>
                  <span className="text-slate-400 font-mono text-[11px] font-normal">(Public Route)</span>
                </label>
                {isSlugManuallyEdited && (
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="text-[11px] text-construction-navy hover:text-construction-red font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-sync
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="e.g. modern-logistics-hub-phase-2"
                className={`w-full bg-slate-50 border text-slate-900 font-mono px-4 py-2.5 text-xs rounded-none focus:outline-none focus:ring-1 transition-all ${
                  slugError
                    ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 focus:ring-construction-navy focus:border-construction-navy"
                }`}
              />

              {slugError ? (
                <p className="text-[11px] text-red-600 flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {slugError}
                </p>
              ) : (
                <div className="flex items-center justify-between text-[11px] bg-slate-100/80 border border-slate-200 px-3 py-1.5 font-mono overflow-hidden">
                  <span className="text-slate-600 truncate mr-2">
                    /projects/
                    <span className="text-construction-navy font-bold">
                      {formData.slug || "pending-slug"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPublicUrl}
                    className="text-[10px] text-slate-700 hover:text-construction-red font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    title="Copy full public URL"
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

          <div className="grid md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Primary Category
              </label>
              <select
                value={selectCategoryValue}
                onChange={handleCategorySelectChange}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy transition-all"
              >
                <option value="">[ Unassigned / General ]</option>
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">Custom Category...</option>
              </select>

              {isCustomCategoryMode && (
                <div className="space-y-1 pt-1.5">
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => onChange({ category: e.target.value })}
                    placeholder="Enter custom category name..."
                    className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                  />
                </div>
              )}
            </div>

            {/* Subcategories */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Subcategories &amp; Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tag and press Enter"
                  className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-slate-900 hover:bg-construction-navy text-white px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {formData.subCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.subCategories.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-medium"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-400 hover:text-red-600 transition-colors ml-1"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 pt-4 border-t border-slate-100 items-center">
            {/* Featured */}
            <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => onChange({ featured: e.target.checked })}
                className="w-4 h-4 accent-amber-600 cursor-pointer rounded-none shrink-0"
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Star className={`w-3.5 h-3.5 ${formData.featured ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
                  <span>Featured Project</span>
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Pin to homepage showcase carousel and highlight in search.
                </span>
              </div>
            </label>

            {/* Display Order */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Display Order Priority
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => onChange({ order: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                placeholder="0"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Lower numbers appear first (0 = Top priority).
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B: PROJECT STATUS
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              01B · Operational Lifecycle &amp; Publication Status
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
            Governance
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Operational Status */}
            <div className="bg-slate-50 border border-slate-200 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Operational Lifecycle
                </label>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                    formData.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-blue-50 text-blue-700 border-blue-300"
                  }`}
                >
                  {formData.status}
                </span>
              </div>
              <select
                value={formData.status}
                onChange={(e) => onChange({ status: e.target.value as any })}
                className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              >
                <option value="ongoing">Ongoing (Active Construction &amp; Engineering)</option>
                <option value="active">Active (Operational Facility)</option>
                <option value="completed">Completed (Handed Over &amp; Commissioned)</option>
                <option value="archived">Archived (Decommissioned)</option>
              </select>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Determines the operational status badge shown publicly on project cards.
              </p>
            </div>

            {/* Publish Status */}
            <div className="bg-slate-50 border border-slate-200 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Publication Visibility
                </label>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                    formData.publishStatus === "published"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-amber-500 text-white border-amber-500"
                  }`}
                >
                  {formData.publishStatus}
                </span>
              </div>
              <select
                value={formData.publishStatus}
                onChange={(e) => onChange({ publishStatus: e.target.value as any })}
                className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              >
                <option value="draft">Draft (Private / Unpublished)</option>
                <option value="published">Published (Live Online Portfolio)</option>
                <option value="archived">Archived (De-listed from Public Views)</option>
              </select>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {formData.publishStatus === "published"
                  ? "✓ Visible to all visitors and crawled by search engines."
                  : "⚠ Strictly private in draft. Visible only to logged-in admins."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C: LOCATION SUMMARY
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-3.5 h-3.5 text-construction-red" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              01C · Site Location Summary
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
            Geographic
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Primary Location Display String */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>Site Location Display</span>
                <span className="text-construction-red font-bold">*</span>
              </label>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
                Required
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. RIICO Industrial Area, Bhilwara, Rajasthan"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Primary location label rendered on all portfolio listing cards and breadcrumbs.
            </p>
          </div>

          {/* Granular Geography Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                City / Town
              </label>
              <input
                type="text"
                value={formData.city || ""}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="e.g. Bhilwara"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                District
              </label>
              <input
                type="text"
                value={formData.district || ""}
                onChange={(e) => onChange({ district: e.target.value })}
                placeholder="e.g. Bhilwara District"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                State / Province
              </label>
              <input
                type="text"
                value={formData.state || ""}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="e.g. Rajasthan"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country || ""}
                onChange={(e) => onChange({ country: e.target.value })}
                placeholder="e.g. India"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Postal Code (PIN)
              </label>
              <input
                type="text"
                value={formData.postalCode || ""}
                onChange={(e) => onChange({ postalCode: e.target.value })}
                placeholder="e.g. 311001"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Industrial Hub / Zone
              </label>
              <input
                type="text"
                value={formData.targetLocation || ""}
                onChange={(e) => onChange({ targetLocation: e.target.value })}
                placeholder="e.g. RIICO Phase 3"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
