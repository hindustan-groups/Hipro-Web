"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
    image?: string;
    imageAlt?: string;
    shortDescription?: string;
    description?: string;
    location?: string;
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
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          SECTION A: IDENTITY & CANONICAL ROUTING
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-construction-red"></span>
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              Section A · Project Identity &amp; Canonical URL
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Public Router Anchor
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <span>Project Title</span>
                  <span className="text-construction-red font-bold">*</span>
                </label>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
                  Publish Mandatory
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
                The official public engineering title displayed on all listings, SEO meta tags, and hero banners.
              </p>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <span>URL Slug</span>
                  <span className="text-slate-400 font-mono text-[11px] font-normal">(Canonical)</span>
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
                <div className="flex items-center justify-between text-[11px] bg-slate-100/80 border border-slate-200 px-3 py-1.5 font-mono">
                  <span className="text-slate-600 truncate mr-2">
                    https://www.hindustanprojects.in/projects/
                    <span className="text-construction-navy font-bold">
                      {formData.slug || "pending-slug"}
                    </span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyPublicUrl}
                      className="text-[10px] text-slate-700 hover:text-construction-red font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
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
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                    {formData.slug && (
                      <a
                        href={`/projects/${formData.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-800 transition-colors"
                        title="Open canonical route"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B: CLASSIFICATION & TAXONOMY
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              Section B · Industry Classification &amp; Portfolio Taxonomy
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Portfolio Filter Anchor
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Primary Category */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Primary Category
                </label>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Main Filter Group
                </span>
              </div>
              <select
                value={selectCategoryValue}
                onChange={handleCategorySelectChange}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy transition-all"
              >
                <option value="">[ Unassigned / General ]</option>
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">Custom Classification...</option>
              </select>

              {isCustomCategoryMode && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-construction-navy uppercase tracking-wider text-[10px]">
                      Enter Custom Category Name:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategoryMode(false);
                        onChange({ category: "" });
                      }}
                      className="text-slate-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => onChange({ category: e.target.value })}
                    placeholder="e.g. Heavy Civil Infrastructure"
                    className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy"
                    autoFocus
                  />
                </div>
              )}

              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Controls the active category filter pill on the public website and the breadcrumb trail.
              </p>
            </div>

            {/* Subcategories / Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  Subcategories &amp; Engineering Tags
                </label>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {formData.subCategories.length} Registered
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="e.g. Pre-Engineered, Warehousing (Enter to add)"
                  className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-slate-900 hover:bg-construction-navy text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {formData.subCategories.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {formData.subCategories.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-medium rounded-none"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-400 hover:text-construction-red transition-colors ml-1 cursor-pointer"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  No subcategories assigned yet. Type above and press Enter.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C: LIFECYCLE & PUBLICATION GOVERNANCE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              Section C · Operational Lifecycle &amp; Publication Governance
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Dual-Track Isolation
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ground State (Physical) */}
            <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Operational Status (Ground Reality)
                </label>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border rounded-none ${
                    formData.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : formData.status === "archived"
                      ? "bg-slate-200 text-slate-700 border-slate-300"
                      : "bg-amber-50 text-amber-700 border-amber-300"
                  }`}
                >
                  {formData.status}
                </span>
              </div>
              <select
                value={formData.status}
                onChange={(e) => onChange({ status: e.target.value as any })}
                className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              >
                <option value="ongoing">Ongoing (Active Site Engineering &amp; Execution)</option>
                <option value="active">Active (Operational Facility)</option>
                <option value="completed">Completed (Handed Over &amp; Commissioned)</option>
                <option value="archived">Archived (Decommissioned)</option>
              </select>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Reflects physical on-site progress. Determines the public badge (<strong className="text-amber-700">Ongoing</strong> vs <strong className="text-emerald-700">Completed</strong>).
              </p>
            </div>

            {/* Publication State (Digital) */}
            <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Publishing Status (Digital Visibility)
                </label>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border rounded-none ${
                    formData.publishStatus === "published"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : formData.publishStatus === "archived"
                      ? "bg-slate-700 text-white border-slate-700"
                      : "bg-amber-500 text-white border-amber-500"
                  }`}
                >
                  {formData.publishStatus}
                </span>
              </div>
              <select
                value={formData.publishStatus}
                onChange={(e) => onChange({ publishStatus: e.target.value as any })}
                className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              >
                <option value="draft">Draft (Private Internal — Hidden from Public)</option>
                <option value="published">Published (Live Online &amp; Search Indexed)</option>
                <option value="archived">Archived (De-listed from Portfolio Index)</option>
              </select>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                {formData.publishStatus === "published" ? (
                  <span className="text-emerald-700 font-semibold">
                    ✓ Publicly indexed and visible on https://www.hindustanprojects.in/projects
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    ⚠️ Strictly isolated from public visitors until explicitly published.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Featured & Priority Order */}
          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 items-center">
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => onChange({ featured: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-construction-navy cursor-pointer rounded-none"
              />
              <div>
                <label htmlFor="featured" className="text-xs font-bold uppercase tracking-wider text-slate-900 cursor-pointer block">
                  Featured Portfolio Project
                </label>
                <span className="text-[11px] text-slate-500 block leading-relaxed mt-0.5">
                  Pin to the HiPRO homepage showcase carousel and highlight in top search filters.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Display Order Priority
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => onChange({ order: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy transition-all"
              />
              <p className="text-[11px] text-slate-500 font-mono">
                Ascending order sorting (0 = Highest / Priority, 1, 2, 3...).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION D: LIVE PUBLIC PORTFOLIO CARD SIMULATION
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              Live Simulation · Public Grid Card Preview
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            1:1 Public Portfolio Card
          </span>
        </div>

        <div className="p-6 bg-slate-100/60">
          <p className="text-xs text-slate-500 mb-4">
            Below is an exact visual simulation of how this project renders on the public{" "}
            <code className="bg-white px-1.5 py-0.5 border border-slate-300 text-construction-navy font-mono text-[11px]">
              /projects
            </code>{" "}
            grid:
          </p>

          <div className="max-w-md mx-auto bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all flex flex-col overflow-hidden">
            {/* Card Cover Preview */}
            <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
              {formData.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={formData.image}
                  alt={formData.imageAlt || formData.title || "HiPRO Project"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950/80">
                  <Building className="w-10 h-10 text-slate-600 mb-2" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    No Cover Image Uploaded (Tab 04)
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 shadow-xs">
                  {formData.category || "Unassigned"}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                    isOngoing ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
                  }`}
                >
                  {isOngoing ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Ongoing
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3" /> Completed
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 font-display uppercase tracking-tight line-clamp-2 leading-snug">
                  {formData.title || "Project Title Not Set"}
                </h4>

                <p className="text-xs text-slate-600 font-light mt-2 line-clamp-2 leading-relaxed">
                  {formData.shortDescription ||
                    formData.description ||
                    "Enter a summary or detailed case study narrative in Tab 03 to display the excerpt here."}
                </p>
              </div>

              {/* Specifications Footer */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[60%]">
                    <MapPin className="w-3.5 h-3.5 text-construction-red shrink-0" />
                    <span className="truncate">{formData.location || "Location (Tab 02)"}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] shrink-0">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formData.date || "Date (Tab 02)"}</span>
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-construction-navy">
                  <span>View Full Case Study</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
