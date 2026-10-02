"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
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
  BookOpen,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import BlogsHero, { DEFAULT_BLOGS_HERO } from "@/components/BlogsHero";
import type { Settings, BlogsHeroContent, BlogPost } from "@/lib/types";

interface FormState {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
}

export default function AdminBlogsHeroCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  // Full settings document preserved for non-destructive updates
  const [fullSettings, setFullSettings] = useState<Settings | null>(null);

  // Real published blogs for previewing dynamic hero content
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  // Form State
  const [form, setForm] = useState<FormState>({
    eyebrow: DEFAULT_BLOGS_HERO.eyebrow || "",
    title: DEFAULT_BLOGS_HERO.title || "",
    description: DEFAULT_BLOGS_HERO.description || "",
    image: DEFAULT_BLOGS_HERO.image || "",
    imageAlt: DEFAULT_BLOGS_HERO.imageAlt || "",
    ctaText: DEFAULT_BLOGS_HERO.ctaText || "Explore Articles",
    ctaLink: DEFAULT_BLOGS_HERO.ctaLink || "#articles-feed",
    enabled: true,
  });

  // Saved baseline for dirty-state tracking
  const [baseline, setBaseline] = useState<FormState>({
    eyebrow: DEFAULT_BLOGS_HERO.eyebrow || "",
    title: DEFAULT_BLOGS_HERO.title || "",
    description: DEFAULT_BLOGS_HERO.description || "",
    image: DEFAULT_BLOGS_HERO.image || "",
    imageAlt: DEFAULT_BLOGS_HERO.imageAlt || "",
    ctaText: DEFAULT_BLOGS_HERO.ctaText || "Explore Articles",
    ctaLink: DEFAULT_BLOGS_HERO.ctaLink || "#articles-feed",
    enabled: true,
  });

  // Preview Layout & Device State
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"split" | "editor" | "preview">("split");

  // Dirty State Calculation
  const isDirty = useMemo(() => {
    return (
      form.eyebrow !== baseline.eyebrow ||
      form.title !== baseline.title ||
      form.description !== baseline.description ||
      form.image !== baseline.image ||
      form.imageAlt !== baseline.imageAlt ||
      form.ctaText !== baseline.ctaText ||
      form.ctaLink !== baseline.ctaLink ||
      form.enabled !== baseline.enabled
    );
  }, [form, baseline]);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setStatusMessage({ text: "", type: "" });

    try {
      const [settingsRes, blogsRes] = await Promise.all([
        fetch("/api/settings", { credentials: "include" }),
        fetch("/api/blogs?all=true", { credentials: "include" }).catch(() => null),
      ]);

      const [settingsData, blogsData] = await Promise.all([
        settingsRes.json(),
        blogsRes ? blogsRes.json() : { data: [] },
      ]);

      if (blogsData && Array.isArray(blogsData.data)) {
        setBlogs(blogsData.data);
      }

      if (settingsData.success && settingsData.data) {
        const s: Settings = settingsData.data;
        setFullSettings(s);

        // Parse blogsHero from pageContent
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

        const hero: BlogsHeroContent = pc.blogsHero || {};
        const loadedForm: FormState = {
          eyebrow: hero.eyebrow ?? DEFAULT_BLOGS_HERO.eyebrow ?? "",
          title: hero.title ?? DEFAULT_BLOGS_HERO.title ?? "",
          description: hero.description ?? DEFAULT_BLOGS_HERO.description ?? "",
          image: hero.image ?? DEFAULT_BLOGS_HERO.image ?? "",
          imageAlt: hero.imageAlt ?? DEFAULT_BLOGS_HERO.imageAlt ?? "",
          ctaText: hero.ctaText ?? DEFAULT_BLOGS_HERO.ctaText ?? "Explore Articles",
          ctaLink: hero.ctaLink ?? DEFAULT_BLOGS_HERO.ctaLink ?? "#articles-feed",
          enabled: hero.enabled !== undefined ? hero.enabled : true,
        };

        setForm(loadedForm);
        setBaseline(loadedForm);
      }
    } catch (err) {
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

  // Save handler: non-destructive update preserving all other pageContent keys
  const handleSave = async () => {
    setSaving(true);
    setStatusMessage({ text: "", type: "" });

    try {
      let pc: Record<string, any> = {};
      if (fullSettings?.pageContent) {
        try {
          pc =
            typeof fullSettings.pageContent === "string"
              ? JSON.parse(fullSettings.pageContent)
              : fullSettings.pageContent;
        } catch {
          pc = {};
        }
      }

      const blogsHeroPayload: BlogsHeroContent = {
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        imageAlt: form.imageAlt.trim(),
        ctaText: form.ctaText.trim(),
        ctaLink: form.ctaLink.trim(),
        enabled: form.enabled,
      };

      const updatedPageContent = {
        ...pc,
        blogsHero: blogsHeroPayload,
      };

      const payload = {
        ...(fullSettings || {}),
        pageContent: JSON.stringify(updatedPageContent),
      };

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setBaseline(form);
        if (fullSettings) {
          setFullSettings({
            ...fullSettings,
            pageContent: JSON.stringify(updatedPageContent),
          });
        }

        // On-demand revalidation
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag: "settings", paths: ["/blogs"] }),
          });
        } catch {
          // silent revalidation fallback
        }

        setStatusMessage({
          text: "Blogs Page Hero saved successfully! Public /blogs is updated.",
          type: "success",
        });
      } else {
        setStatusMessage({
          text: json.error || "Failed to save hero settings. Please retry.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "Network error occurred while saving.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Revert changes
  const handleRevert = () => {
    setForm(baseline);
    setStatusMessage({
      text: "Reverted unsaved changes to last saved state.",
      type: "success",
    });
  };

  // Reset to default template
  const handleResetToDefault = () => {
    setForm({
      eyebrow: DEFAULT_BLOGS_HERO.eyebrow || "",
      title: DEFAULT_BLOGS_HERO.title || "",
      description: DEFAULT_BLOGS_HERO.description || "",
      image: DEFAULT_BLOGS_HERO.image || "",
      imageAlt: DEFAULT_BLOGS_HERO.imageAlt || "",
      ctaText: DEFAULT_BLOGS_HERO.ctaText || "Explore Articles",
      ctaLink: DEFAULT_BLOGS_HERO.ctaLink || "#articles-feed",
      enabled: true,
    });
    setStatusMessage({
      text: "Form reset to architectural defaults. Click 'Save' to apply.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL BAR & ACTIONS
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 px-6 py-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Site CMS / Pages /
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-construction-navy font-mono">
                Blogs Page Hero
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-slate-900 mt-1">
              Blogs Page Hero CMS
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure the public /blogs hero section, copywriting, featured visual image, and actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dirty State Indicator */}
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved Changes
              </span>
            )}

            {/* Revert Button */}
            {isDirty && (
              <button
                type="button"
                onClick={handleRevert}
                disabled={saving}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert</span>
              </button>
            )}

            {/* Public Link */}
            <Link
              href="/blogs"
              target="_blank"
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <span>View Public /blogs</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer ${
                isDirty
                  ? "bg-construction-navy hover:bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-construction-red" />
                  <span>Save Hero Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage.text && (
          <div
            className={`mt-4 p-3 text-xs flex items-center gap-2 border ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VIEW TABS & DEVICE SWITCHER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 px-5 py-3">
        <div className="flex items-center gap-1 border border-slate-200 p-0.5 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === "split"
                ? "bg-white text-construction-navy shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === "editor"
                ? "bg-white text-construction-navy shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Editor Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-construction-navy shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Live Preview
          </button>
        </div>

        {/* Device Switcher (Preview Mode) */}
        {activeTab !== "editor" && (
          <div className="flex items-center gap-1 border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              title="Desktop Preview (Full)"
              className={`p-1.5 text-xs font-bold transition-colors cursor-pointer ${
                previewDevice === "desktop"
                  ? "bg-white text-construction-navy shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("tablet")}
              title="Tablet Preview (768px)"
              className={`p-1.5 text-xs font-bold transition-colors cursor-pointer ${
                previewDevice === "tablet"
                  ? "bg-white text-construction-navy shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              title="Mobile Preview (390px)"
              className={`p-1.5 text-xs font-bold transition-colors cursor-pointer ${
                previewDevice === "mobile"
                  ? "bg-white text-construction-navy shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA (EDITOR + PREVIEW)
          ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white border border-slate-200 p-16 text-center shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-construction-navy mx-auto mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Loading Hero configuration...
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            activeTab === "split"
              ? "grid-cols-1 xl:grid-cols-12"
              : activeTab === "editor"
              ? "grid-cols-1 max-w-4xl mx-auto"
              : "grid-cols-1"
          }`}
        >
          {/* ─────────────────────────────────────────────────────────
              FORM EDITOR PANEL
              ───────────────────────────────────────────────────────── */}
          {(activeTab === "split" || activeTab === "editor") && (
            <div
              className={`space-y-6 ${
                activeTab === "split" ? "xl:col-span-6" : ""
              }`}
            >
              {/* CARD 1: SECTION VISIBILITY & COPYWRITING */}
              <div className="bg-white border border-slate-200 shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-construction-navy" />
                    <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900">
                      1. Hero Copywriting &amp; Content
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-xs text-slate-500 hover:text-construction-red font-mono uppercase underline cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Enable / Disable Switch */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Enable Blogs Hero Section
                      </div>
                      <div className="text-[11px] text-slate-500">
                        When enabled, the premium hero banner displays at the top of /blogs.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.enabled}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            enabled: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-construction-navy"></div>
                    </label>
                  </div>

                  {/* Eyebrow Tagline */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Eyebrow Tagline Badge
                    </label>
                    <input
                      type="text"
                      value={form.eyebrow}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          eyebrow: e.target.value,
                        }))
                      }
                      placeholder="e.g. ENGINEERING & CONSTRUCTION INTELLIGENCE · RAJASTHAN"
                      className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy font-mono"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Hero Primary Title (H1)
                    </label>
                    <textarea
                      rows={2}
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Building Knowledge &amp;\nConstruction Insights"
                      className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy font-sans"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tip: Use a line break (<code className="text-slate-600">\n</code>) to split the headline. The second line will render in the elegant serif italic accent.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Lead Description
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
                      placeholder="Practical civil engineering guidance, construction cost planning frameworks, architectural guidelines..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy font-sans leading-relaxed"
                    />
                  </div>

                  {/* Actions / CTA Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Primary CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={form.ctaText}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            ctaText: e.target.value,
                          }))
                        }
                        placeholder="Explore Articles"
                        className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Primary CTA Anchor / Link
                      </label>
                      <input
                        type="text"
                        value={form.ctaLink}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            ctaLink: e.target.value,
                          }))
                        }
                        placeholder="#articles-feed"
                        className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: HERO MEDIA & IMAGE SHOWCASE */}
              <div className="bg-white border border-slate-200 shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-construction-red" />
                    <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900">
                      2. Visual Media &amp; Featured Frame
                    </h2>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <strong>Dynamic Fallback Hierarchy:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-slate-500">
                      <li>If a custom image is set below, it takes highest precedence.</li>
                      <li>If empty, the hero dynamically features the latest published article&apos;s cover image.</li>
                      <li>If no articles are published, the brand civil engineering fallback photo is used.</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Custom Hero Image (Cloudinary or Direct URL)
                    </label>
                    <ImageUpload
                      value={form.image}
                      onChange={(newUrl) =>
                        setForm((prev) => ({ ...prev, image: newUrl }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Hero Image Alt Text
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
                      placeholder="e.g. Civil Engineering and Structural Construction in Rajasthan"
                      className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              LIVE PREVIEW PANEL
              ───────────────────────────────────────────────────────── */}
          {(activeTab === "split" || activeTab === "preview") && (
            <div
              className={`space-y-4 ${
                activeTab === "split" ? "xl:col-span-6" : ""
              }`}
            >
              <div className="bg-white border border-slate-200 shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-construction-navy" />
                    <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900">
                      Real-Time Live Hero Preview
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    Device: {previewDevice}
                  </span>
                </div>

                <div className="p-3 bg-slate-100/70 overflow-hidden flex justify-center">
                  <div
                    className={`bg-white border border-slate-300 shadow-sm transition-all duration-300 overflow-hidden ${
                      previewDevice === "desktop"
                        ? "w-full"
                        : previewDevice === "tablet"
                        ? "w-[768px] max-w-full"
                        : "w-[390px] max-w-full"
                    }`}
                  >
                    <BlogsHero
                      eyebrow={form.eyebrow}
                      title={form.title}
                      description={form.description}
                      image={form.image}
                      imageAlt={form.imageAlt}
                      ctaText={form.ctaText}
                      ctaLink={form.ctaLink}
                      enabled={form.enabled}
                      featuredBlog={blogs[0] || null}
                      totalBlogs={blogs.length}
                      isPreview={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
