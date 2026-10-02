"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Layers,
  Sparkles,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Megaphone,
  ArrowRight,
  Info,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import ProjectsHero, {
  DEFAULT_PROJECTS_HERO,
  type ProjectHeroStat,
} from "@/components/ProjectsHero";
import type { Settings, ProjectsHeroContent, Project } from "@/lib/types";
import { resolveCTA, type CTAConfig } from "@/lib/cta";

interface FormState {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  enabled: boolean;
}

export default function AdminProjectsHeroCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  // Full settings document preserved for non-destructive updates
  const [fullSettings, setFullSettings] = useState<Settings | null>(null);

  // Authoritative site stats for preview
  const [siteStats, setSiteStats] = useState<ProjectHeroStat[]>([]);

  // Real uploaded projects from portfolio
  const [projects, setProjects] = useState<Project[]>([]);

  // Connected CTAs from Central CTA Management
  const [ctaPrimary, setCtaPrimary] = useState<CTAConfig | null>(null);
  const [ctaSecondary, setCtaSecondary] = useState<CTAConfig | null>(null);

  // Form State
  const [form, setForm] = useState<FormState>({
    eyebrow: DEFAULT_PROJECTS_HERO.eyebrow,
    title: DEFAULT_PROJECTS_HERO.title,
    description: DEFAULT_PROJECTS_HERO.description,
    image: DEFAULT_PROJECTS_HERO.image,
    imageAlt: DEFAULT_PROJECTS_HERO.imageAlt,
    enabled: true,
  });

  // Saved baseline for dirty-state tracking
  const [baseline, setBaseline] = useState<FormState>({
    eyebrow: DEFAULT_PROJECTS_HERO.eyebrow,
    title: DEFAULT_PROJECTS_HERO.title,
    description: DEFAULT_PROJECTS_HERO.description,
    image: DEFAULT_PROJECTS_HERO.image,
    imageAlt: DEFAULT_PROJECTS_HERO.imageAlt,
    enabled: true,
  });

  // Preview Layout & Device State
  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [activeTab, setActiveTab] = useState<"split" | "editor" | "preview">(
    "split"
  );

  // Dirty State Calculation: compare form against saved baseline
  const isDirty = useMemo(() => {
    return (
      form.eyebrow !== baseline.eyebrow ||
      form.title !== baseline.title ||
      form.description !== baseline.description ||
      form.image !== baseline.image ||
      form.imageAlt !== baseline.imageAlt ||
      form.enabled !== baseline.enabled
    );
  }, [form, baseline]);

  // Projects with valid images ready for hero rotation
  const validProjectsWithImages = useMemo(() => {
    return projects.filter(
      (p) =>
        p &&
        typeof p.image === "string" &&
        p.image.trim().length > 0 &&
        p.status !== "archived"
    );
  }, [projects]);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setStatusMessage({ text: "", type: "" });

    try {
      const [settingsRes, statsRes, projectsRes] = await Promise.all([
        fetch("/api/settings", { credentials: "include" }),
        fetch("/api/stats"),
        fetch("/api/projects?all=true", { credentials: "include" }).catch(() => null),
      ]);

      const [settingsData, statsData] = await Promise.all([
        settingsRes.json(),
        statsRes.json(),
      ]);

      if (projectsRes && projectsRes.ok) {
        try {
          const pData = await projectsRes.json();
          if (pData.success && Array.isArray(pData.data)) {
            setProjects(pData.data);
          }
        } catch {
          // ignore projects fetch error
        }
      }

      if (settingsData.success && settingsData.data) {
        const s: Settings = settingsData.data;
        setFullSettings(s);

        // Resolve connected CTAs from central registry
        const primary = resolveCTA(s, "projects_hero_primary");
        const secondary = resolveCTA(s, "projects_hero_secondary");
        setCtaPrimary(primary);
        setCtaSecondary(secondary);

        // Parse projectsHero from pageContent
        let pc: any = {};
        if (s.pageContent) {
          try {
            pc =
              typeof s.pageContent === "string"
                ? JSON.parse(s.pageContent)
                : s.pageContent;
          } catch {
            pc = {};
          }
        }

        const hero: ProjectsHeroContent = pc.projectsHero || {};
        const loadedForm: FormState = {
          eyebrow: hero.eyebrow ?? DEFAULT_PROJECTS_HERO.eyebrow,
          title: hero.title ?? DEFAULT_PROJECTS_HERO.title,
          description: hero.description ?? DEFAULT_PROJECTS_HERO.description,
          image: hero.image ?? DEFAULT_PROJECTS_HERO.image,
          imageAlt: hero.imageAlt ?? DEFAULT_PROJECTS_HERO.imageAlt,
          enabled: hero.enabled !== undefined ? hero.enabled : true,
        };

        setForm(loadedForm);
        setBaseline(loadedForm);
      }

      if (statsData.success && Array.isArray(statsData.data)) {
        const sorted = [...statsData.data].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        setSiteStats(sorted);
      }
    } catch {
      setStatusMessage({
        text: "Failed to load hero settings. Please check your network.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: "", type: "" });

    try {
      // 1. Parse current pageContent to preserve all other keys (ctas, contactPage, etc.)
      let currentParsed: any = {};
      if (fullSettings?.pageContent) {
        try {
          currentParsed =
            typeof fullSettings.pageContent === "string"
              ? JSON.parse(fullSettings.pageContent)
              : fullSettings.pageContent;
        } catch {
          currentParsed = {};
        }
      }

      const projectsHeroPayload: ProjectsHeroContent = {
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        imageAlt: form.imageAlt.trim(),
        enabled: form.enabled,
      };

      const updatedPageContent = {
        ...currentParsed,
        projectsHero: projectsHeroPayload,
      };

      const payload = {
        pageContent: JSON.stringify(updatedPageContent),
      };

      // 2. Persist to Settings API
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        // Update local fullSettings
        setFullSettings((prev) =>
          prev
            ? { ...prev, pageContent: JSON.stringify(updatedPageContent) }
            : null
        );

        // Update baseline so Unsaved Changes clears immediately
        setBaseline({ ...form });

        // 3. Trigger on-demand cache revalidation for public /projects
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/projects"], tags: ["settings"] }),
          });
        } catch {
          // non-blocking
        }

        setStatusMessage({
          text: "Projects Page Hero saved successfully! Public /projects updated.",
          type: "success",
        });

        setTimeout(() => {
          setStatusMessage((prev) =>
            prev.type === "success" ? { text: "", type: "" } : prev
          );
        }, 5000);
      } else {
        setStatusMessage({
          text: json.error || "Failed to save hero settings. Please retry.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "Network error occurred while saving. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Discard edits and restore saved baseline
  const handleDiscard = () => {
    setForm({ ...baseline });
    setStatusMessage({ text: "", type: "" });
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TOP ACTION HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono uppercase tracking-wider mb-1">
            <span>Pages &amp; Site CMS</span>
            <span>/</span>
            <span className="text-construction-navy font-bold">
              Projects Page Hero
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-construction-navy" />
            Projects Page Hero CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure the public /projects listing hero banner, copywriting,
            dynamic imagery, and preview live changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dirty State Indicator Badge */}
          {isDirty ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved Changes</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Clean / Saved</span>
            </div>
          )}

          {/* Reset / Discard Edits */}
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
            title="Discard current unsaved edits"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          {/* Public Page View */}
          <Link
            href="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs"
            title="Open public /projects in a new tab"
          >
            <span>View Public</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Save Button */}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 px-5 py-2 bg-construction-navy hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Hero Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ALERTS & FEEDBACK
          ───────────────────────────────────────────────────────────── */}
      {statusMessage.text && (
        <div
          className={`p-3.5 border flex items-center justify-between gap-3 text-xs sm:text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage({ text: "", type: "" })}
            className="text-slate-400 hover:text-slate-700 font-bold px-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW MODE CONTROLS (SPLIT / EDITOR ONLY / PREVIEW ONLY)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-slate-100 p-1.5 border border-slate-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "split"
                ? "bg-white text-construction-navy shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Editor &amp; Live Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "editor"
                ? "bg-white text-construction-navy shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Editor Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "preview"
                ? "bg-white text-construction-navy shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Preview Only
          </button>
        </div>

        {/* Device Switcher for Preview */}
        {(activeTab === "split" || activeTab === "preview") && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-1 py-0.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 px-1.5">
              Device:
            </span>
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`p-1 text-xs transition-colors ${
                previewDevice === "desktop"
                  ? "bg-construction-navy text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Desktop View (100% width)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("tablet")}
              className={`p-1 text-xs transition-colors ${
                previewDevice === "tablet"
                  ? "bg-construction-navy text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Tablet View (768px width)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`p-1 text-xs transition-colors ${
                previewDevice === "mobile"
                  ? "bg-construction-navy text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Mobile View (390px width)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white border border-slate-200">
          <Loader2 className="w-8 h-8 text-construction-navy animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">
            Loading Hero configuration...
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            activeTab === "split"
              ? "grid-cols-1 xl:grid-cols-12"
              : activeTab === "editor"
              ? "grid-cols-1"
              : "grid-cols-1"
          }`}
        >
          {/* ─────────────────────────────────────────────────────────────
              EDITOR FORM PANEL
              ───────────────────────────────────────────────────────────── */}
          {(activeTab === "split" || activeTab === "editor") && (
            <div
              className={`space-y-6 ${
                activeTab === "split" ? "xl:col-span-6" : "max-w-4xl mx-auto w-full"
              }`}
            >
              {/* CARD 1: CONTENT & COPYWRITING */}
              <div className="bg-white border border-slate-200 shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-construction-red" />
                    <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900">
                      1. Hero Copywriting &amp; Content
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    PUBLIC /PROJECTS
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Eyebrow */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Eyebrow Tagline
                    </label>
                    <input
                      type="text"
                      value={form.eyebrow}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, eyebrow: e.target.value }))
                      }
                      placeholder="e.g. PROJECTS / PORTFOLIO"
                      className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Small uppercase badge displayed directly above the main
                      headline.
                    </p>
                  </div>

                  {/* Main Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Primary Headline (Semantic H1)
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        Enter multiple lines if desired
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g. ENGINEERED FOR REAL.&#10;BUILT TO LAST."
                      className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy font-display uppercase font-semibold leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      HiPRO headline. Press Enter to create deliberate line
                      breaks. Single semantic &lt;h1&gt; on the public page.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Supporting Lead Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="e.g. Explore our portfolio of construction, architecture and engineering projects delivered across diverse sectors."
                      className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Concise technical overview explaining HiPRO&apos;s
                      verified engineering capabilities and delivery scope.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 2: AUTOMATED PROJECT SHOWCASE */}
              <div className="bg-white border border-slate-200 shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900">
                      2. Automated Project Image Showcase
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                    AUTO-ROTATING
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Status Banner */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 font-semibold block mb-0.5">
                        Live Auto-Rotating Carousel Enabled
                      </strong>
                      Hero section dynamically cycles through cover images, titles, and categories from your uploaded portfolio projects. Whenever you add or edit projects in the Projects CMS, they automatically appear here!
                    </div>
                  </div>

                  {/* Active Projects Preview Carousel Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Uploaded Projects ({validProjectsWithImages.length} Ready in Hero)
                      </span>
                      <Link
                        href="/admin/projects"
                        className="text-[11px] font-bold text-construction-navy hover:underline inline-flex items-center gap-1"
                      >
                        <span>Manage Projects</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {validProjectsWithImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200">
                        {validProjectsWithImages.map((p, idx) => (
                          <div
                            key={p.id || idx}
                            className="bg-white border border-slate-200 p-2 flex items-center gap-2 text-left"
                          >
                            <div className="w-10 h-10 bg-slate-100 shrink-0 overflow-hidden relative border border-slate-200">
                              <Image
                                src={p.image}
                                alt={p.title}
                                width={40}
                                height={40}
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-bold text-slate-900 truncate">
                                {p.title}
                              </div>
                              <div className="text-[9px] font-mono uppercase text-slate-500 truncate">
                                {p.category || "Project"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                        No projects with images found yet. Upload projects in{" "}
                        <Link href="/admin/projects" className="font-bold underline">
                          Projects CMS
                        </Link>{" "}
                        or set a fallback image below.
                      </div>
                    )}
                  </div>

                  {/* Fallback Static Image (Collapsible / Secondary) */}
                  <div className="pt-3 border-t border-slate-200">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Fallback Hero Image (Used if 0 projects uploaded)
                    </label>
                    <ImageUpload
                      value={form.image}
                      onChange={(newUrl) =>
                        setForm((prev) => ({ ...prev, image: newUrl }))
                      }
                    />
                    <div className="mt-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Fallback Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={form.imageAlt}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            imageAlt: e.target.value,
                          }))
                        }
                        placeholder="e.g. HiPRO Civil & Industrial Engineering Projects Portfolio"
                        className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: CONNECTED CTAS (CENTRAL CTA CMS) */}
              <div className="bg-white border border-slate-200 shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-600" />
                    <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900">
                      3. Connected Call-to-Actions (CTAs)
                    </h2>
                  </div>
                  <Link
                    href="/admin/cta-management"
                    className="text-xs font-bold text-construction-navy hover:underline inline-flex items-center gap-1"
                  >
                    <span>Manage in Central CTA CMS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold">
                        Primary CTA:{" "}
                        <span className="text-construction-navy">
                          projects_hero_primary
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        &quot;{ctaPrimary?.label ?? "Explore Portfolio"}&quot;
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Destination: {ctaPrimary?.destination ?? "#projects-list"}{" "}
                        ({ctaPrimary?.actionType ?? "anchor"})
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          ctaPrimary?.enabled !== false
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {ctaPrimary?.enabled !== false ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold">
                        Secondary CTA:{" "}
                        <span className="text-construction-navy">
                          projects_hero_secondary
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        &quot;{ctaSecondary?.label ?? "Discuss Your Project"}&quot;
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Destination: {ctaSecondary?.destination ?? "/contact"}{" "}
                        ({ctaSecondary?.actionType ?? "internal"})
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          ctaSecondary?.enabled !== false
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {ctaSecondary?.enabled !== false ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      CTA buttons are centrally managed to ensure single-source
                      reliability. Click above to edit labels or destinations.
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 4: HERO VISIBILITY & SETTINGS */}
              <div className="bg-white border border-slate-200 shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-600" />
                    <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900">
                      4. Hero Display &amp; Visibility
                    </h2>
                  </div>
                </div>

                <div className="p-5">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.enabled}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          enabled: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-construction-navy border-slate-300 rounded-none focus:ring-construction-navy"
                    />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Enable Projects Page Hero Section
                      </div>
                      <div className="text-[11px] text-slate-500">
                        When enabled, the full premium architectural hero is
                        displayed. When disabled, a minimal title header is
                        shown.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              LIVE PREVIEW PANEL
              ───────────────────────────────────────────────────────────── */}
          {(activeTab === "split" || activeTab === "preview") && (
            <div
              className={`space-y-4 ${
                activeTab === "split" ? "xl:col-span-6" : "w-full"
              }`}
            >
              <div className="bg-white border border-slate-200 shadow-2xs overflow-hidden sticky top-6">
                <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold">
                      Live Real-Time Hero Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-300">
                      {previewDevice.toUpperCase()} PREVIEW
                    </span>
                    {isDirty && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                </div>

                {/* Device Frame Simulator */}
                <div className="bg-slate-100 p-2 sm:p-4 overflow-x-auto flex justify-center">
                  <div
                    className={`bg-white transition-all shadow-md overflow-hidden ${
                      previewDevice === "desktop"
                        ? "w-full"
                        : previewDevice === "tablet"
                        ? "w-[768px] max-w-full"
                        : "w-[390px] max-w-full"
                    }`}
                  >
                    {/* Live presentation component with current unsaved form state */}
                    <ProjectsHero
                      eyebrow={form.eyebrow}
                      title={form.title}
                      description={form.description}
                      image={form.image}
                      imageAlt={form.imageAlt}
                      ctaPrimary={ctaPrimary}
                      ctaSecondary={ctaSecondary}
                      stats={siteStats}
                      enabled={form.enabled}
                      isPreview={true}
                      projects={projects}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>
                    ✦ Changes appear instantly in preview as you type or change
                    images.
                  </span>
                  <span>Click &quot;Save Hero Settings&quot; to publish.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
