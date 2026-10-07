"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  Plus,
  Trash2,
  ShieldCheck,
  Sparkles,
  Image as ImageIcon,
  Eye,
  SlidersHorizontal,
  ArrowRight,
  MessageSquare,
  Wrench,
  Check,
  Smartphone,
  Monitor,
  ChevronDown,
  Layers,
  Cpu,
  HardHat,
  Clock,
  Award,
  Zap,
  Activity,
  Phone,
  RotateCcw,
  Sparkle,
  Sliders,
  Type,
  Maximize2
} from "lucide-react";
import type { HbsContent, HbsHeroConfig, HbsDiagnosticSection } from "@/lib/types";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";
import HbsHero from "@/components/hbs/HbsHero";

const DEFAULT_DIAGNOSTIC: HbsDiagnosticSection = {
  enabled: true,
  eyebrow: "Diagnostic Principle",
  heading: "Most building repairs fail because surface symptoms are patched while the water pathway stays active.",
  description: "Plastering over dampness or applying generic cement offers only temporary cosmetic relief. Without identifying hydrostatic pressure points or hairline slab fractures, moisture continues to corrode embedded rebar from within.",
  rightMode: "CARD",
  image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
  imageAlt: "Hind Build engineering site diagnosis and moisture tracing",
  imageCaption: "Site Inspection & Non-Destructive Scanning",
  approachBadge: "The Hind Build Engineering Approach",
  approachDescription: "We deploy non-destructive electronic moisture detection, industrial-grade chemical barrier membranes, and calibrated crack injection polymers. Root causes are systematically eliminated before finishing layers are applied.",
  features: [
    "Non-invasive moisture tracing",
    "Certified industrial sealants",
    "Turnkey single-point warranty",
    "Senior engineering sign-off",
  ],
  footerNote: "Backed by Hindustan Projects (HiPRO)",
  ctaLabel: "Book Site Diagnosis",
  ctaUrl: "/contact",
};

interface WhyChooseItem {
  title: string;
  desc: string;
}

interface StatItem {
  value: string;
  label: string;
}

const MODERN_ENGINEERING_HERO_PRESET: HbsHeroConfig = {
  enabled: true,
  displayMode: "TEXT_AND_IMAGE",
  layoutPreset: "split",
  badge: "A Specialized Division of Hindustan Projects (HiPRO)",
  headlineAccent: "Engineering-Grade Protection",
  primaryCtaLabel: "Get Free Quote",
  primaryCtaUrl: "/contact",
  secondaryCtaLabel: "WhatsApp Hind Build",
  secondaryCtaUrl: "",
  emergencyPhone: "+91 75970 00601",
  mobileImage: "",
  altText: "Hind Build engineering site inspection and execution across Rajasthan",
  showCadGrid: true,
  showAmbientGlow: true,
  showFloatingBadges: true,
  floatingBadge1Title: "Structural Diagnostic Hub",
  floatingBadge1Sub: "Calibrated Moisture & Crack Depth Profiling",
  floatingBadge2Title: "150+ Turnkey Works Delivered",
  floatingBadge2Sub: "★★★★★ 4.9/5 Verified Client Trust · Rajasthan",
  coordinatesTag: "BHILWARA · RAJASTHAN [25.3463° N, 74.6360° E]",
  backgroundColor: "#020617",
  highlights: [
    { label: "10-Year Water-Tight Guarantee", icon: "ShieldCheck" },
    { label: "Non-Destructive Diagnostic Scanning", icon: "Cpu" },
    { label: "Civil Engineer Site Supervision", icon: "HardHat" },
    { label: "24-48h Rapid Dispatch", icon: "Clock" },
  ],
};

const COLOR_PRESETS = [
  { name: "Obsidian Slate (Default)", hex: "#020617" },
  { name: "Midnight Navy", hex: "#0B132B" },
  { name: "Pitch Black", hex: "#050505" },
  { name: "Dark Charcoal", hex: "#111827" },
  { name: "Deep Forest Blue", hex: "#07131E" },
  { name: "Royal Sapphire", hex: "#0a192f" },
  { name: "Industrial Slate", hex: "#1e293b" },
];

const AVAILABLE_ICONS = [
  { id: "ShieldCheck", label: "Shield / Warranty", icon: ShieldCheck },
  { id: "Cpu", label: "Diagnostic Scanner", icon: Cpu },
  { id: "HardHat", label: "Civil Engineer", icon: HardHat },
  { id: "Clock", label: "Rapid Dispatch", icon: Clock },
  { id: "Sparkles", label: "Premium Quality", icon: Sparkles },
  { id: "Award", label: "Certified Grade", icon: Award },
  { id: "Zap", label: "Instant Response", icon: Zap },
  { id: "Activity", label: "Health Profiling", icon: Activity },
];

export default function HbsAdminHome() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [heroConfig, setHeroConfig] = useState<HbsHeroConfig>(MODERN_ENGINEERING_HERO_PRESET);
  const [whyChoose, setWhyChoose] = useState<WhyChooseItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [diagnosticSection, setDiagnosticSection] = useState<HbsDiagnosticSection>(DEFAULT_DIAGNOSTIC);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  // Tabbed studio navigation: "layout" | "copy" | "highlights" | "ctas" | "media" | "homepage" | "diagnostic"
  const [activeTab, setActiveTab] = useState<
    "layout" | "copy" | "highlights" | "ctas" | "media" | "homepage" | "diagnostic"
  >("layout");

  // Baseline snapshot for tracking unsaved changes
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");

  // Live preview viewport switcher: "desktop" | "mobile"
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/content", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setContent(json.data);

        let parsedHero: HbsHeroConfig = MODERN_ENGINEERING_HERO_PRESET;
        try {
          if (json.data.heroCtas) {
            const parsed = typeof json.data.heroCtas === "string" ? JSON.parse(json.data.heroCtas) : json.data.heroCtas;
            parsedHero = { ...MODERN_ENGINEERING_HERO_PRESET, ...parsed };
          }
        } catch {
          parsedHero = MODERN_ENGINEERING_HERO_PRESET;
        }
        setHeroConfig(parsedHero);

        let parsedWhyChoose: WhyChooseItem[] = [];
        try {
          if (json.data.whyChooseUs) {
            parsedWhyChoose = JSON.parse(json.data.whyChooseUs);
          }
        } catch {
          parsedWhyChoose = [];
        }
        setWhyChoose(parsedWhyChoose);

        let parsedStats: StatItem[] = [];
        try {
          if (json.data.stats) {
            parsedStats = JSON.parse(json.data.stats);
          }
        } catch {
          parsedStats = [];
        }
        setStats(parsedStats);

        let parsedDiagnostic: HbsDiagnosticSection = DEFAULT_DIAGNOSTIC;
        try {
          if (json.data.guaranteeSection) {
            const parsed =
              typeof json.data.guaranteeSection === "string"
                ? JSON.parse(json.data.guaranteeSection)
                : json.data.guaranteeSection;
            parsedDiagnostic = { ...DEFAULT_DIAGNOSTIC, ...parsed };
          }
        } catch {
          parsedDiagnostic = DEFAULT_DIAGNOSTIC;
        }
        setDiagnosticSection(parsedDiagnostic);

        setInitialSnapshot(
          JSON.stringify({
            content: json.data,
            heroConfig: parsedHero,
            whyChoose: parsedWhyChoose,
            stats: parsedStats,
            diagnosticSection: parsedDiagnostic,
          })
        );
      }
    } catch {
      setMessage({ text: "Failed to connect to backend API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute dirty/unsaved state
  const isDirty = useMemo(() => {
    if (!initialSnapshot) return false;
    const currentSnapshot = JSON.stringify({
      content,
      heroConfig,
      whyChoose,
      stats,
      diagnosticSection,
    });
    return currentSnapshot !== initialSnapshot;
  }, [initialSnapshot, content, heroConfig, whyChoose, stats, diagnosticSection]);

  // Warn user if leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (field: keyof HbsContent, value: any) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  // Preset Reset Handler
  const handleApplyPreset = () => {
    if (confirm("Reset Hero configuration to Modern Engineering High-Conversion Preset?")) {
      setHeroConfig((prev) => ({
        ...prev,
        ...MODERN_ENGINEERING_HERO_PRESET,
      }));
      handleChange("heroTitle", "Complete Building Repair, Maintenance & Protection");
      handleChange(
        "heroSubtitle",
        "Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions for homes, commercial complexes, and institutions across Rajasthan."
      );
      setMessage({ text: "Applied Modern Engineering Preset! Remember to click Save.", type: "success" });
    }
  };

  // Highlights handlers
  const handleHighlightChange = (index: number, field: "label" | "icon", val: string) => {
    setHeroConfig((prev) => {
      const current = prev.highlights ? [...prev.highlights] : [];
      if (!current[index]) return prev;
      current[index] = { ...current[index], [field]: val };
      return { ...prev, highlights: current };
    });
  };

  const addHighlightItem = () => {
    setHeroConfig((prev) => {
      const current = prev.highlights ? [...prev.highlights] : [];
      if (current.length >= 6) {
        alert("Maximum 6 highlights recommended for visual balance.");
        return prev;
      }
      return {
        ...prev,
        highlights: [...current, { label: "Certified Material Benchmark", icon: "ShieldCheck" }],
      };
    });
  };

  const removeHighlightItem = (index: number) => {
    setHeroConfig((prev) => {
      const current = prev.highlights ? [...prev.highlights] : [];
      return { ...prev, highlights: current.filter((_, i) => i !== index) };
    });
  };

  // Why Choose handlers
  const handleWhyChooseChange = (index: number, field: keyof WhyChooseItem, val: string) => {
    setWhyChoose((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addWhyChooseItem = () => {
    setWhyChoose((prev) => [
      ...prev,
      { title: "Engineering Diagnostics", desc: "Calibrated electronic moisture testing and crack depth scanning." },
    ]);
  };

  const removeWhyChooseItem = (index: number) => {
    setWhyChoose((prev) => prev.filter((_, i) => i !== index));
  };

  // Stats handlers
  const handleStatChange = (index: number, field: keyof StatItem, val: string) => {
    setStats((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addStatItem = () => {
    setStats((prev) => [...prev, { value: "19+", label: "Repair Services" }]);
  };

  const removeStatItem = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
  };

  // Diagnostic Section handlers
  const handleDiagnosticChange = (field: keyof HbsDiagnosticSection, val: any) => {
    setDiagnosticSection((prev) => ({ ...prev, [field]: val }));
  };

  const handleDiagnosticFeatureChange = (index: number, val: string) => {
    setDiagnosticSection((prev) => {
      const copy = [...(prev.features || [])];
      copy[index] = val;
      return { ...prev, features: copy };
    });
  };

  const addDiagnosticFeature = () => {
    setDiagnosticSection((prev) => {
      const copy = [...(prev.features || [])];
      if (copy.length >= 6) {
        alert("Maximum 6 bullet points recommended for visual layout.");
        return prev;
      }
      return { ...prev, features: [...copy, "Certified engineering benchmark"] };
    });
  };

  const removeDiagnosticFeature = (index: number) => {
    setDiagnosticSection((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  // Save handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    const payload = {
      ...content,
      heroCtas: JSON.stringify(heroConfig),
      whyChooseUs: JSON.stringify(whyChoose),
      whyChoosePoints: JSON.stringify(whyChoose),
      stats: JSON.stringify(stats),
      guaranteeSection: JSON.stringify(diagnosticSection),
    };

    try {
      const res = await fetch("/api/hbs/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSavedRecently(true);
        setTimeout(() => setSavedRecently(false), 2500);

        setInitialSnapshot(
          JSON.stringify({
            content: json.data || content,
            heroConfig,
            whyChoose,
            stats,
            diagnosticSection,
          })
        );

        setMessage({ text: "Hind Build Hero CMS published successfully!", type: "success" });
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/hbs"] }),
          });
        } catch {}
      } else {
        setMessage({ text: json.error || "Failed to save home content.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-xs uppercase tracking-widest font-mono text-slate-300">
          Loading Hind Build Studio...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ─────────────────────────────────────────────────────────────────
          HEADER BAR
      ───────────────────────────────────────────────────────────────── */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Hind Build" }, { label: "Home Hero Studio" }]}
        title="Home Hero Command Center"
        description="Design, customize, and publish the modern engineering public hero experience with realtime 1:1 preview."
      >
        <div className="flex items-center gap-2.5">
          {isDirty ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved changes</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live on production</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleApplyPreset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Populate modern high-conversion presets"
          >
            <Sparkle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Apply Preset</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 rounded-lg transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] disabled:opacity-50 min-h-[36px]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : savedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Published!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save &amp; Publish</span>
              </>
            )}
          </button>
        </div>
      </HbsAdminPageHeader>

      {/* Toast Feedback */}
      {message.text && (
        <div
          className={`p-3.5 text-xs flex items-center gap-2 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-2xs"
              : "bg-red-50 border-red-200 text-red-900 shadow-2xs"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TWO-COLUMN STUDIO LAYOUT (Left: Controls, Right: Live Realtime Preview)
      ───────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS & SETTINGS (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Studio Tab Navigation */}
          <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("layout")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "layout"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
              <span>Layout &amp; Style</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("copy")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "copy"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Type className="w-3.5 h-3.5 text-amber-400" />
              <span>Headline &amp; Copy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("highlights")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "highlights"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trust Badges</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ctas")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "ctas"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              <span>CTAs &amp; Hotline</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "media"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Visuals &amp; HUD</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("homepage")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "homepage"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Stats &amp; Pillars</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("diagnostic")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "diagnostic"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnostic &amp; Banner</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* ─────────────────────────────────────────────────────────────
                TAB 1: LAYOUT & PRESENTATION STYLE
            ───────────────────────────────────────────────────────────── */}
            {activeTab === "layout" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-amber-600" />
                      <span>Hero Layout &amp; Atmospheric Effects</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose between cinematic split, centered showcase, or minimal editorial modes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHeroConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border min-h-[34px] ${
                      heroConfig.enabled
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {heroConfig.enabled ? "Status: Enabled" : "Status: Disabled"}
                  </button>
                </div>

                {/* 1. Core Display Mode Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Hero Display Mode (3 Core Formats)
                    </label>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                      Active: {heroConfig.displayMode || "TEXT_AND_IMAGE"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setHeroConfig((prev) => ({ ...prev, displayMode: "TEXT_AND_IMAGE" }))
                      }
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        heroConfig.displayMode === "TEXT_AND_IMAGE" || !heroConfig.displayMode
                          ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">1. Text + Image</span>
                      <span className="block text-[11px] text-slate-500 mt-1">
                        High-impact headline, trust chips &amp; floating HUD imagery.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setHeroConfig((prev) => ({ ...prev, displayMode: "IMAGE_ONLY" }))
                      }
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        heroConfig.displayMode === "IMAGE_ONLY"
                          ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">2. Image Only</span>
                      <span className="block text-[11px] text-slate-500 mt-1">
                        Full-width visual banner without text or buttons.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setHeroConfig((prev) => ({ ...prev, displayMode: "TEXT_ONLY" }))
                      }
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        heroConfig.displayMode === "TEXT_ONLY"
                          ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">3. Text Only</span>
                      <span className="block text-[11px] text-slate-500 mt-1">
                        Pure editorial typography &amp; action deck (no image).
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Layout Presets (Shown when Text + Image is selected) */}
                {heroConfig.displayMode !== "IMAGE_ONLY" && heroConfig.displayMode !== "TEXT_ONLY" && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Presentation Layout Preset
                    </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setHeroConfig((prev) => ({ ...prev, layoutPreset: "split" }))}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        heroConfig.layoutPreset === "split" || !heroConfig.layoutPreset
                          ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">Cinematic Split</span>
                      <span className="block text-[11px] text-slate-500 mt-1">
                        High-impact left editorial + right floating HUD frame.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHeroConfig((prev) => ({ ...prev, layoutPreset: "centered" }))}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        heroConfig.layoutPreset === "centered"
                          ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">Centered Showcase</span>
                      <span className="block text-[11px] text-slate-500 mt-1">
                        Centered typography + wide cinematic visual below.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHeroConfig((prev) => ({ ...prev, layoutPreset: "minimal" }))}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        heroConfig.layoutPreset === "minimal"
                          ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">Minimal Editorial</span>
                      <span className="block text-[11px] text-slate-500 mt-1">
                        Ultra-clean technical copy with focused action deck.
                      </span>
                    </button>
                  </div>
                </div>
              )}

                {/* Atmosphere Toggles */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Atmosphere &amp; Engineering Aesthetics
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={heroConfig.showCadGrid !== false}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, showCadGrid: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">CAD Blueprint Grid</span>
                        <span className="text-[10px] text-slate-500 block">Subtle 32px line pattern</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={heroConfig.showAmbientGlow !== false}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, showAmbientGlow: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Specular Ambient Glow</span>
                        <span className="text-[10px] text-slate-500 block">Amber + Emerald beams</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={heroConfig.showFloatingBadges !== false}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, showFloatingBadges: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Floating HUD Badges</span>
                        <span className="text-[10px] text-slate-500 block">Glass islands on image</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3. Hero Background Color & Custom Canvas Theme */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Hero Canvas Background Color
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Choose a dark engineering preset or pick any custom HEX color.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setHeroConfig((prev) => ({ ...prev, backgroundColor: "#020617" }))
                      }
                      className="text-[11px] font-mono text-amber-700 hover:text-amber-800 font-bold bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200 transition-colors"
                      title="Reset to default obsidian #020617"
                    >
                      Reset Default (#020617)
                    </button>
                  </div>

                  {/* Preset Swatches */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {COLOR_PRESETS.map((col) => {
                      const isSelected =
                        (heroConfig.backgroundColor || "#020617").toLowerCase() ===
                        col.hex.toLowerCase();
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() =>
                            setHeroConfig((prev) => ({ ...prev, backgroundColor: col.hex }))
                          }
                          className={`p-2 rounded-xl text-left border transition-all flex flex-col gap-1.5 ${
                            isSelected
                              ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div
                            className="w-full h-6 rounded-lg border border-white/20 shadow-xs flex items-center justify-center"
                            style={{ backgroundColor: col.hex }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-800 truncate block">
                            {col.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 block">
                            {col.hex}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color Input & Native Color Picker */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="color"
                        value={heroConfig.backgroundColor || "#020617"}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))
                        }
                        className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                        title="Pick custom color"
                      />
                      <span className="text-xs font-bold text-slate-700">Custom Picker:</span>
                    </label>

                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">HEX:</span>
                      <input
                        type="text"
                        value={heroConfig.backgroundColor || "#020617"}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))
                        }
                        placeholder="#020617"
                        className="w-32 text-xs font-mono font-bold border border-slate-300 p-1.5 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      <div
                        className="w-6 h-6 rounded border border-slate-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: heroConfig.backgroundColor || "#020617" }}
                        title="Active color swatch"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 2: HEADLINE & COPY
            ───────────────────────────────────────────────────────────── */}
            {activeTab === "copy" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                    <Type className="w-4 h-4 text-amber-600" />
                    <span>Eyebrow, Main Headline &amp; Subtitle</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure typography and highlight accent words with gradient gold styling.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Eyebrow Pill Badge
                  </label>
                  <input
                    type="text"
                    value={heroConfig.badge || ""}
                    onChange={(e) => setHeroConfig((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="A Specialized Division of Hindustan Projects (HiPRO)"
                    className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Displays alongside pulsing live status indicator beacon.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Master Headline (H1)
                  </label>
                  <input
                    type="text"
                    value={content.heroTitle || ""}
                    onChange={(e) => handleChange("heroTitle", e.target.value)}
                    placeholder="Complete Building Repair, Maintenance & Protection"
                    className="w-full text-sm font-bold border border-slate-300 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Gradient Accent Phrase (Optional)
                    </label>
                    <span className="text-[10px] text-amber-700 font-mono font-semibold bg-amber-50 px-2 py-0.5 rounded">
                      Glows in metallic amber
                    </span>
                  </div>
                  <input
                    type="text"
                    value={heroConfig.headlineAccent || ""}
                    onChange={(e) =>
                      setHeroConfig((prev) => ({ ...prev, headlineAccent: e.target.value }))
                    }
                    placeholder="Engineering-Grade Protection"
                    className="w-full text-xs font-medium border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Words matching this text inside the headline will render in radiant amber-gold gradient.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Engineering Subtitle
                  </label>
                  <textarea
                    rows={3}
                    value={content.heroSubtitle || ""}
                    onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                    placeholder="Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions across Rajasthan."
                    className="w-full text-xs border border-slate-300 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 rounded-xl text-slate-700 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 3: TRUST BADGES & HIGHLIGHTS
            ───────────────────────────────────────────────────────────── */}
            {activeTab === "highlights" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Interactive Trust Proof Micro-Chips</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Displayed below the subtitle as frosted glass cards with interactive hover effects.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addHighlightItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Badge</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(heroConfig.highlights || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3"
                    >
                      <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>

                      {/* Icon selector */}
                      <select
                        value={item.icon || "ShieldCheck"}
                        onChange={(e) => handleHighlightChange(idx, "icon", e.target.value)}
                        className="text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium text-slate-700"
                      >
                        {AVAILABLE_ICONS.map((ic) => (
                          <option key={ic.id} value={ic.id}>
                            {ic.label}
                          </option>
                        ))}
                      </select>

                      {/* Label input */}
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleHighlightChange(idx, "label", e.target.value)}
                        placeholder="Trust highlight text"
                        className="flex-1 text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                      />

                      <button
                        type="button"
                        onClick={() => removeHighlightItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove badge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 4: CTAS & DIRECT HOTLINE
            ───────────────────────────────────────────────────────────── */}
            {activeTab === "ctas" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                    <span>Call-to-Action Buttons &amp; Priority Hotline</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lead capture buttons with metallic gold shimmer, live WhatsApp beacons, and direct dial hotline.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary CTA */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Primary Quote Button
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                        Shimmering Amber
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="Get Free Quote"
                        value={heroConfig.primaryCtaLabel || ""}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, primaryCtaLabel: e.target.value }))
                        }
                        className="w-full text-xs font-bold border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Destination Link
                      </label>
                      <input
                        type="text"
                        placeholder="/contact"
                        value={heroConfig.primaryCtaUrl || ""}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, primaryCtaUrl: e.target.value }))
                        }
                        className="w-full text-xs font-mono border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  {/* Secondary WhatsApp CTA */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        WhatsApp Consultation
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                        Live Pulse Beacon
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="WhatsApp Hind Build"
                        value={heroConfig.secondaryCtaLabel || ""}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, secondaryCtaLabel: e.target.value }))
                        }
                        className="w-full text-xs font-bold border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        WhatsApp Link (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Leave empty for auto-WhatsApp link"
                        value={heroConfig.secondaryCtaUrl || ""}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, secondaryCtaUrl: e.target.value }))
                        }
                        className="w-full text-xs font-mono border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Dial Hotline */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Emergency Site Dispatch Hotline
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="+91 75970 00601"
                    value={heroConfig.emergencyPhone || content.phone || ""}
                    onChange={(e) =>
                      setHeroConfig((prev) => ({ ...prev, emergencyPhone: e.target.value }))
                    }
                    className="w-full text-xs font-mono border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Displays right beside CTA buttons with click-to-call mobile trigger.
                  </span>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 5: VISUALS & FLOATING HUD BADGES
            ───────────────────────────────────────────────────────────── */}
            {activeTab === "media" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Visual Assets &amp; Specular Glass HUD Badges</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload high-res imagery and customize floating engineering cards superimposed over the visual frame.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <HbsImageUploader
                      value={content.heroImage || ""}
                      onChange={(url) => handleChange("heroImage", url)}
                      folder="hbs/hero"
                      label="Desktop Hero Visual"
                      description="High-resolution architecture image (1200×900px or 16:9)."
                      recommendedSize="1200×900px"
                      aspectRatioHint="16:9"
                      previewHeight="h-28"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <HbsImageUploader
                      value={heroConfig.mobileImage || ""}
                      onChange={(url) => setHeroConfig((prev) => ({ ...prev, mobileImage: url }))}
                      folder="hbs/hero"
                      label="Mobile Hero Visual (Optional)"
                      description="Optimized crop for smartphones (360px-430px)."
                      recommendedSize="800×600px"
                      aspectRatioHint="4:3"
                      previewHeight="h-28"
                    />
                  </div>
                </div>

                {/* Floating HUD Badges Customizer */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                    Floating Glass HUD Cards Configuration
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Badge 1 */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <span className="text-[11px] font-bold font-mono text-amber-700 block">
                        Top-Right Card (Diagnostic Hub)
                      </span>
                      <input
                        type="text"
                        placeholder="Title"
                        value={heroConfig.floatingBadge1Title || ""}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, floatingBadge1Title: e.target.value }))
                        }
                        className="w-full text-xs font-bold border border-slate-300 p-1.5 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Subtitle description"
                        value={heroConfig.floatingBadge1Sub || ""}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, floatingBadge1Sub: e.target.value }))
                        }
                        className="w-full text-[11px] border border-slate-300 p-1.5 rounded"
                      />
                    </div>

                    {/* Badge 2 */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <span className="text-[11px] font-bold font-mono text-amber-700 block">
                        Bottom-Left Card (Projects &amp; Rating)
                      </span>
                      <input
                        type="text"
                        placeholder="Title"
                        value={heroConfig.floatingBadge2Title || ""}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, floatingBadge2Title: e.target.value }))
                        }
                        className="w-full text-xs font-bold border border-slate-300 p-1.5 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Subtitle or rating"
                        value={heroConfig.floatingBadge2Sub || ""}
                        onChange={(e) =>
                          setHeroConfig((prev) => ({ ...prev, floatingBadge2Sub: e.target.value }))
                        }
                        className="w-full text-[11px] border border-slate-300 p-1.5 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                      Technical Coordinates Tag (Bottom Right)
                    </label>
                    <input
                      type="text"
                      placeholder="BHILWARA · RAJASTHAN [25.3463° N, 74.6360° E]"
                      value={heroConfig.coordinatesTag || ""}
                      onChange={(e) =>
                        setHeroConfig((prev) => ({ ...prev, coordinatesTag: e.target.value }))
                      }
                      className="w-full text-xs font-mono border border-slate-300 p-2 bg-white rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 6: HOMEPAGE STATS & PILLARS
            ───────────────────────────────────────────────────────────── */}
            {activeTab === "homepage" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
                {/* Stats Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase text-slate-800 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Homepage Metric Strip Bar</span>
                    </span>
                    <button
                      type="button"
                      onClick={addStatItem}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 uppercase"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Stat</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {stats.map((st, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 relative"
                      >
                        <button
                          type="button"
                          onClick={() => removeStatItem(idx)}
                          className="absolute top-1.5 right-1.5 text-slate-300 hover:text-red-600 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={st.value}
                          onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                          placeholder="Value (19+)"
                          className="w-full text-xs font-bold font-mono border border-slate-300 p-1.5 bg-white rounded-lg"
                        />
                        <input
                          type="text"
                          value={st.label}
                          onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                          placeholder="Label"
                          className="w-full text-[11px] border border-slate-300 p-1.5 bg-white rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why Choose Us */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase text-slate-800 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Why Choose Hind Build Engineering Pillars</span>
                    </span>
                    <button
                      type="button"
                      onClick={addWhyChooseItem}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 uppercase"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Pillar</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {whyChoose.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5 items-start"
                      >
                        <span className="font-mono text-xs font-bold text-slate-400 mt-2">#{idx + 1}</span>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleWhyChooseChange(idx, "title", e.target.value)}
                            placeholder="Title"
                            className="w-full text-xs font-bold border border-slate-300 p-2 bg-white rounded-lg"
                          />
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => handleWhyChooseChange(idx, "desc", e.target.value)}
                            placeholder="Description"
                            className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWhyChooseItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors mt-1"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 7: DIAGNOSTIC PRINCIPLE & SOLUTION BANNER STUDIO
            ───────────────────────────────────────────────────────────── */}
            {activeTab === "diagnostic" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                      <span>Diagnostic Principle &amp; Solution Banner Studio</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Section 3 on Home: Edit problem statement, switch right side between Dark Card and Image Banner.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDiagnosticSection((prev) => ({
                        ...prev,
                        enabled: prev.enabled === false ? true : false,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border min-h-[34px] ${
                      diagnosticSection.enabled !== false
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {diagnosticSection.enabled !== false ? "Status: Enabled" : "Status: Disabled"}
                  </button>
                </div>

                {/* Left Column Problem Statement */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block font-mono">
                    Left Column: Diagnostic Principle Statement
                  </span>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      placeholder="Diagnostic Principle"
                      value={diagnosticSection.eyebrow || ""}
                      onChange={(e) =>
                        handleDiagnosticChange("eyebrow", e.target.value)
                      }
                      className="w-full text-xs font-bold border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                      Headline Statement
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Most building repairs fail because surface symptoms are patched while the water pathway stays active."
                      value={diagnosticSection.heading || ""}
                      onChange={(e) =>
                        handleDiagnosticChange("heading", e.target.value)
                      }
                      className="w-full text-xs font-bold border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                      Supporting Paragraph
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Plastering over dampness or applying generic cement offers only temporary cosmetic relief..."
                      value={diagnosticSection.description || ""}
                      onChange={(e) =>
                        handleDiagnosticChange("description", e.target.value)
                      }
                      className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                {/* Right Column Presentation Format Switcher */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
                      Right Column Mode (Dark Card vs Image Banner)
                    </label>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                      Active: {diagnosticSection.rightMode || "CARD"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Option 1: Dark Card */}
                    <button
                      type="button"
                      onClick={() => handleDiagnosticChange("rightMode", "CARD")}
                      className={`p-3.5 rounded-xl border text-left transition-all relative ${
                        (diagnosticSection.rightMode || "CARD") === "CARD"
                          ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-1.5 rounded-lg bg-slate-900 text-white">
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                        </div>
                        {(diagnosticSection.rightMode || "CARD") === "CARD" && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Dark Approach Card
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Original sleek dark card with technical badge &amp; 4 checkmark bullets.
                      </p>
                    </button>

                    {/* Option 2: Image Banner */}
                    <button
                      type="button"
                      onClick={() => handleDiagnosticChange("rightMode", "IMAGE")}
                      className={`p-3.5 rounded-xl border text-left transition-all relative ${
                        diagnosticSection.rightMode === "IMAGE"
                          ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        {diagnosticSection.rightMode === "IMAGE" && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Image / Photo Banner
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Architectural photo banner with technical inspection tag &amp; caption.
                      </p>
                    </button>

                    {/* Option 3: Image with Overlay */}
                    <button
                      type="button"
                      onClick={() => handleDiagnosticChange("rightMode", "IMAGE_OVERLAY")}
                      className={`p-3.5 rounded-xl border text-left transition-all relative ${
                        diagnosticSection.rightMode === "IMAGE_OVERLAY"
                          ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-amber-300">
                          <Layers className="w-4 h-4" />
                        </div>
                        {diagnosticSection.rightMode === "IMAGE_OVERLAY" && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Photo Banner + Overlay
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Background photo banner with semi-transparent approach card on top.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Image Banner Media Settings */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span>Photo Banner Media Settings</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Recommended: 1200×800 px Landscape
                    </span>
                  </div>

                  <HbsImageUploader
                    folder="hbs/media"
                    label="Upload Diagnostic Photo Banner"
                    description="Upload high-res site inspection, thermal scanning, or crack depth profiling photo."
                    value={diagnosticSection.image || ""}
                    onChange={(url) => handleDiagnosticChange("image", url)}
                    altText={diagnosticSection.imageAlt || ""}
                    onAltTextChange={(alt) => handleDiagnosticChange("imageAlt", alt)}
                    previewHeight="h-44"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Image Alt Text (SEO &amp; Accessibility)
                      </label>
                      <input
                        type="text"
                        placeholder="Hind Build site inspection and moisture tracing"
                        value={diagnosticSection.imageAlt || ""}
                        onChange={(e) =>
                          handleDiagnosticChange("imageAlt", e.target.value)
                        }
                        className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Banner Caption / Status Tag
                      </label>
                      <input
                        type="text"
                        placeholder="Site Inspection & Non-Destructive Scanning"
                        value={diagnosticSection.imageCaption || ""}
                        onChange={(e) =>
                          handleDiagnosticChange("imageCaption", e.target.value)
                        }
                        className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Approach Card Content */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Approach Card Content &amp; Bullets</span>
                    </span>
                    <button
                      type="button"
                      onClick={addDiagnosticFeature}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 uppercase"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Bullet</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                      Approach Badge Title
                    </label>
                    <input
                      type="text"
                      placeholder="The Hind Build Engineering Approach"
                      value={diagnosticSection.approachBadge || ""}
                      onChange={(e) =>
                        handleDiagnosticChange("approachBadge", e.target.value)
                      }
                      className="w-full text-xs font-bold border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                      Approach Summary Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="We deploy non-destructive electronic moisture detection..."
                      value={diagnosticSection.approachDescription || ""}
                      onChange={(e) =>
                        handleDiagnosticChange("approachDescription", e.target.value)
                      }
                      className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">
                      Technical Verification Bullet Points
                    </label>
                    {(diagnosticSection.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => handleDiagnosticFeatureChange(idx, e.target.value)}
                          placeholder="Feature / verification standard"
                          className="flex-1 text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => removeDiagnosticFeature(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove bullet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Note & CTA */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block font-mono">
                    Sub-Bar Note &amp; Action CTA
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Left Footer Note
                      </label>
                      <input
                        type="text"
                        placeholder="Backed by Hindustan Projects (HiPRO)"
                        value={diagnosticSection.footerNote || ""}
                        onChange={(e) =>
                          handleDiagnosticChange("footerNote", e.target.value)
                        }
                        className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        CTA Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="Book Site Diagnosis"
                        value={diagnosticSection.ctaLabel || ""}
                        onChange={(e) =>
                          handleDiagnosticChange("ctaLabel", e.target.value)
                        }
                        className="w-full text-xs font-bold border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        CTA Destination Link
                      </label>
                      <input
                        type="text"
                        placeholder="/contact"
                        value={diagnosticSection.ctaUrl || ""}
                        onChange={(e) =>
                          handleDiagnosticChange("ctaUrl", e.target.value)
                        }
                        className="w-full text-xs font-mono border border-slate-300 p-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Action Bar */}
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-2">
                {isDirty ? (
                  <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>You have unsaved changes</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Synchronized with database</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadData}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] disabled:opacity-50 min-h-[40px]"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save &amp; Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT COLUMN: STICKY REAL-TIME 1:1 LIVE PREVIEW (5 cols)
        ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            {/* Live Preview Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Live 1:1 Studio Preview
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Realtime</span>
                </span>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("desktop")}
                  className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                    previewViewport === "desktop"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-2xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                    previewViewport === "mobile"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-2xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Mock Hardware Frame Container */}
            <div
              className={`rounded-xl overflow-hidden border border-slate-800 bg-slate-950 transition-all ${
                previewViewport === "mobile"
                  ? "max-w-[340px] mx-auto shadow-2xl ring-1 ring-slate-800"
                  : "w-full shadow-2xl"
              }`}
            >
              {/* Simulated Browser Address Bar */}
              <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/70" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
                </div>
                <span className="truncate max-w-[170px] text-slate-400">
                  hindbuilding.hindustanprojects.in
                </span>
                <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">
                  {activeTab === "diagnostic"
                    ? `DIAGNOSTIC · ${diagnosticSection.rightMode || "CARD"}`
                    : heroConfig.layoutPreset || "split"}
                </span>
              </div>

              {/* Exact 1:1 Public Component Rendered Live */}
              <div className="overflow-x-hidden">
                {activeTab === "diagnostic" ? (
                  <div className="p-4 bg-white text-slate-900 space-y-4">
                    <div className="space-y-1.5 border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 block">
                        {diagnosticSection.eyebrow || "Diagnostic Principle"}
                      </span>
                      <h4 className="text-sm font-semibold tracking-tight text-slate-900 leading-snug font-display">
                        {diagnosticSection.heading ||
                          "Most building repairs fail because surface symptoms are patched..."}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {diagnosticSection.description}
                      </p>
                    </div>

                    {diagnosticSection.rightMode === "IMAGE" ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/10]">
                        {diagnosticSection.image ? (
                          <img
                            src={diagnosticSection.image}
                            alt="Diagnostic Banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-4 text-center font-mono text-[10px]">
                            <ShieldCheck className="w-6 h-6 text-amber-400 mb-1" />
                            <span>No image banner uploaded yet</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded bg-slate-900/85 text-amber-400 font-mono text-[9px] font-bold">
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                          <span>{diagnosticSection.approachBadge || "Approach"}</span>
                        </div>
                        {(diagnosticSection.imageCaption || diagnosticSection.approachDescription) && (
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-lg bg-slate-950/80 backdrop-blur-xs text-white space-y-0.5">
                            {diagnosticSection.imageCaption && (
                              <span className="text-[9px] font-mono text-amber-400 font-bold block uppercase">
                                {diagnosticSection.imageCaption}
                              </span>
                            )}
                            {diagnosticSection.approachDescription && (
                              <p className="text-[10px] text-slate-200 line-clamp-2">
                                {diagnosticSection.approachDescription}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : diagnosticSection.rightMode === "IMAGE_OVERLAY" ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 space-y-2 text-white">
                        {diagnosticSection.image && (
                          <img
                            src={diagnosticSection.image}
                            alt="Diagnostic Banner"
                            className="absolute inset-0 w-full h-full object-cover opacity-20"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 to-slate-900/90" />
                        <div className="relative space-y-2">
                          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{diagnosticSection.approachBadge || "Approach"}</span>
                          </div>
                          <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                            {diagnosticSection.approachDescription}
                          </p>
                          <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-300 font-mono pt-1">
                            {(diagnosticSection.features || []).map((feat, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 shadow-sm border border-slate-800">
                        <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{diagnosticSection.approachBadge || "The Hind Build Engineering Approach"}</span>
                        </div>
                        <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                          {diagnosticSection.approachDescription}
                        </p>
                        <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-300 font-mono pt-1">
                          {(diagnosticSection.features || []).map((feat, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>{diagnosticSection.footerNote || "Backed by Hindustan Projects (HiPRO)"}</span>
                      <span className="font-bold text-slate-900 flex items-center gap-0.5">
                        {diagnosticSection.ctaLabel || "Book Site Diagnosis"}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <HbsHero
                    content={content}
                    heroConfig={heroConfig}
                    prefix="/hbs"
                    phoneRaw="+917597000601"
                    homeWaUrl="https://wa.me/917597000601"
                    isInteractivePreview={true}
                  />
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal pt-1">
              Every keystroke and toggle updates the preview in real-time. Hit{" "}
              <strong className="text-amber-400">Save &amp; Publish</strong> to deploy changes directly to the public website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
