"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  Building2,
  Users,
  Layers,
  HelpCircle,
  FileText,
  ShieldCheck,
  Award,
  Globe,
  Sparkles,
  Plus,
  Trash2,
  ImageIcon,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Search,
  Bell,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  HardHat,
  Sliders,
  SlidersHorizontal,
  ChevronRight,
  Check,
  Share2,
  Copy,
} from "lucide-react";
import {
  EmpanelmentContent,
  EmpanelmentStat,
  EmpanelmentCategory,
  EmpanelmentProcessStep,
  EmpanelmentBenefit,
  EmpanelmentDocument,
  EmpanelmentFAQ,
  EmpanelmentImpactPillar,
  EmpanelmentHeroPill,
  EmpanelmentTier,
  EmpanelmentStatutoryDoc,
  EmpanelmentSafetyStandard,
  DEFAULT_EMPANELMENT_CONTENT,
  parseJsonField,
} from "@/lib/empanelmentContent";

// Pre-configured High-Resolution Construction Library for 1-Click Image Picking
const IMAGE_LIBRARY_PRESETS = [
  {
    label: "Engineers on Site (Hero Primary)",
    url: "/images/empanelment/hero-engineers-perfect.jpg",
    category: "Hero",
  },
  {
    label: "Building Materials (Cement & Steel)",
    url: "/images/empanelment/cat-building-materials.jpg",
    category: "Category",
  },
  {
    label: "Civil & Structural (RCC & Fabrication)",
    url: "/images/empanelment/cat-civil-structural.jpg",
    category: "Category",
  },
  {
    label: "Machinery & Equipment (Plant Rental)",
    url: "/images/empanelment/cat-machinery-equipment.jpg",
    category: "Category",
  },
  {
    label: "Electrical & Plumbing (MEP Works)",
    url: "/images/empanelment/cat-electrical-plumbing.jpg",
    category: "Category",
  },
  {
    label: "Interior & Finishing (Flooring & Paints)",
    url: "/images/empanelment/cat-interior-finishing.jpg",
    category: "Category",
  },
  {
    label: "Logistics & Fleet (Dumper & Bulk Haulage)",
    url: "/images/empanelment/cat-logistics-transport.jpg",
    category: "Category",
  },
  {
    label: "Night Skyline Cranes (Our Impact)",
    url: "/images/empanelment/impact-skyline.jpg",
    category: "Impact",
  },
];

export default function EmpanelmentContentCmsPage() {
  // Navigation & Page Selector
  const [selectedGroup, setSelectedGroup] = useState<
    "landing" | "guidelines" | "tenders" | "gatepass" | "branding" | "seo" | "visibility"
  >("landing");

  const [activeSubTab, setActiveSubTab] = useState<string>("hero");

  // View Mode: 'edit' (standard), 'split' (side-by-side preview), 'preview' (full live preview)
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewPage, setPreviewPage] = useState<"home" | "guidelines" | "tenders" | "gatepass" | "track">("home");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);

  // Parsed Array States for interactive editors
  const [heroPills, setHeroPills] = useState<EmpanelmentHeroPill[]>([]);
  const [stats, setStats] = useState<EmpanelmentStat[]>([]);
  const [categories, setCategories] = useState<EmpanelmentCategory[]>([]);
  const [steps, setSteps] = useState<EmpanelmentProcessStep[]>([]);
  const [benefits, setBenefits] = useState<EmpanelmentBenefit[]>([]);
  const [impactPillars, setImpactPillars] = useState<EmpanelmentImpactPillar[]>([]);
  const [docsList, setDocsList] = useState<EmpanelmentDocument[]>([]);
  const [faqsList, setFaqsList] = useState<EmpanelmentFAQ[]>([]);
  const [guidelinesTiers, setGuidelinesTiers] = useState<EmpanelmentTier[]>([]);
  const [guidelinesStatutoryDocs, setGuidelinesStatutoryDocs] = useState<EmpanelmentStatutoryDoc[]>([]);
  const [guidelinesSafetyStandards, setGuidelinesSafetyStandards] = useState<EmpanelmentSafetyStandard[]>([]);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    showHeroPills: true,
    showStats: true,
    showCategories: true,
    showProcess: true,
    showBenefits: true,
    showImpact: true,
    showDocs: true,
    showFaqs: true,
    showCta: true,
    showTendersNotice: true,
    showAnnouncementTicker: true,
  });

  // Fetch CMS Content
  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/empanelment/content", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.content) {
        const c = { ...DEFAULT_EMPANELMENT_CONTENT, ...data.content };
        setFormData(c);
        setHeroPills(parseJsonField(c.heroPills, []));
        setStats(parseJsonField(c.stats, []));
        setCategories(parseJsonField(c.categoriesList, []));
        setSteps(parseJsonField(c.processSteps, []));
        setBenefits(parseJsonField(c.benefitsList, []));
        setImpactPillars(parseJsonField(c.impactPillars, []));
        setDocsList(parseJsonField(c.docsList, []));
        setFaqsList(parseJsonField(c.faqsList, []));
        setGuidelinesTiers(parseJsonField(c.guidelinesTiers, []));
        setGuidelinesStatutoryDocs(parseJsonField(c.guidelinesStatutoryDocs, []));
        setGuidelinesSafetyStandards(parseJsonField(c.guidelinesSafetyStandards, []));
        if (c.sectionVisibility) {
          setVisibility(parseJsonField(c.sectionVisibility, visibility));
        }
      }
    } catch (_err) {
      // Fallback to reference defaults
      setHeroPills(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.heroPills, []));
      setStats(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.stats, []));
      setCategories(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.categoriesList, []));
      setSteps(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.processSteps, []));
      setBenefits(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.benefitsList, []));
      setImpactPillars(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.impactPillars, []));
      setDocsList(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.docsList, []));
      setFaqsList(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.faqsList, []));
      setGuidelinesTiers(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.guidelinesTiers, []));
      setGuidelinesStatutoryDocs(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.guidelinesStatutoryDocs, []));
      setGuidelinesSafetyStandards(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.guidelinesSafetyStandards, []));
    } finally {
      setLoading(false);
      setHasUnsavedChanges(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const markDirty = () => {
    setHasUnsavedChanges(true);
  };

  // Reordering helpers
  const moveItem = <T,>(arr: T[], index: number, direction: "up" | "down", setter: (v: T[]) => void) => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === arr.length - 1)) return;
    const newArr = [...arr];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setter(newArr);
    markDirty();
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setNotification(null);

    const payload = {
      ...formData,
      heroPills: JSON.stringify(heroPills),
      stats: JSON.stringify(stats),
      categoriesList: JSON.stringify(categories),
      processSteps: JSON.stringify(steps),
      benefitsList: JSON.stringify(benefits),
      impactPillars: JSON.stringify(impactPillars),
      docsList: JSON.stringify(docsList),
      faqsList: JSON.stringify(faqsList),
      guidelinesTiers: JSON.stringify(guidelinesTiers),
      guidelinesStatutoryDocs: JSON.stringify(guidelinesStatutoryDocs),
      guidelinesSafetyStandards: JSON.stringify(guidelinesSafetyStandards),
      sectionVisibility: JSON.stringify(visibility),
    };

    try {
      const res = await fetch("/api/empanelment/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({
          type: "success",
          message: "✓ All public pages updated and published live across the portal successfully!",
        });
        setFormData({ ...formData, ...data.content });
        setHasUnsavedChanges(false);
      } else {
        setNotification({
          type: "error",
          message: data.error || "Failed to update CMS content",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Network error while saving CMS",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to restore the portal to certified reference defaults?")) {
      setFormData(DEFAULT_EMPANELMENT_CONTENT);
      setHeroPills(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.heroPills, []));
      setStats(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.stats, []));
      setCategories(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.categoriesList, []));
      setSteps(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.processSteps, []));
      setBenefits(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.benefitsList, []));
      setImpactPillars(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.impactPillars, []));
      setDocsList(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.docsList, []));
      setFaqsList(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.faqsList, []));
      setGuidelinesTiers(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.guidelinesTiers, []));
      setGuidelinesStatutoryDocs(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.guidelinesStatutoryDocs, []));
      setGuidelinesSafetyStandards(parseJsonField(DEFAULT_EMPANELMENT_CONTENT.guidelinesSafetyStandards, []));
      markDirty();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ================================================================ */}
      {/* 1. TOP COMMAND BAR (Title, Status, View Modes & Publish Live) */}
      {/* ================================================================ */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 sticky top-2 z-40 backdrop-blur-md bg-white/95">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-50 text-[#dc2626] border border-red-200/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
              <span>Advanced Enterprise CMS</span>
            </span>
            <span className="text-slate-300">•</span>
            {hasUnsavedChanges ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                ● Unsaved Changes Pending
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ Live & Published in Sync
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Public Empanelment Portal Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control all public pages, capacity criteria, tenders bulletin, and site pass terms in real time without code edits.
          </p>
        </div>

        {/* View Switchers & Save Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80 text-xs font-bold text-slate-600">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "edit" ? "bg-white text-slate-950 shadow-2xs" : "hover:text-slate-900"
              }`}
            >
              Editor Only
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "split" ? "bg-white text-slate-950 shadow-2xs" : "hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#dc2626]" />
              <span>Split Preview</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "preview" ? "bg-white text-slate-950 shadow-2xs" : "hover:text-slate-900"
              }`}
            >
              Full Preview
            </button>
          </div>

          {/* External Public Link */}
          <Link
            href="/empanelment"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            title="Open portal in new window"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Visit Live</span>
          </Link>

          {/* Reset Defaults */}
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
            title="Reset all sections to verified reference standards"
          >
            Reset
          </button>

          {/* Publish Live Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 disabled:opacity-60 transition-all"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Publishing..." : "Publish Live (तुरंत लागू करें)"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="underline opacity-70 hover:opacity-100 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* 2. PRIMARY PAGE GROUP SELECTOR TABS */}
      {/* ================================================================ */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
        {[
          { id: "landing", label: "🏠 Home / Landing Page", count: `${categories.length} Categories` },
          { id: "guidelines", label: "📜 Capacity Guidelines", count: `${guidelinesTiers.length} Tiers` },
          { id: "tenders", label: "📢 Tenders Radar Notice", count: "Live Bulletin" },
          { id: "gatepass", label: "🎫 Daily Site Gate Pass", count: "Security Policy" },
          { id: "branding", label: "🌐 Global Branding & Desk", count: "Header / Footer" },
          { id: "seo", label: "🔍 SEO & Meta Tags", count: "Google Search" },
          { id: "visibility", label: "⚙️ Section Switches", count: "Show / Hide" },
        ].map((grp) => {
          const isActive = selectedGroup === grp.id;
          return (
            <button
              key={grp.id}
              onClick={() => {
                setSelectedGroup(grp.id as any);
                if (grp.id === "landing") setActiveSubTab("hero");
                if (grp.id === "guidelines") setActiveSubTab("tiers");
                if (grp.id === "tenders") setActiveSubTab("notice");
                if (grp.id === "gatepass") setActiveSubTab("terms");
                if (grp.id === "branding") setActiveSubTab("contacts");
                if (grp.id === "seo") setActiveSubTab("meta");
                if (grp.id === "visibility") setActiveSubTab("switches");
              }}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{grp.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {grp.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* 3. MAIN WORKSPACE (Form Editor + Split / Full Live Preview) */}
      {/* ================================================================ */}
      <div
        className={`grid gap-6 ${
          viewMode === "split"
            ? "grid-cols-1 xl:grid-cols-12"
            : viewMode === "preview"
            ? "grid-cols-1"
            : "grid-cols-1"
        }`}
      >
        {/* LEFT PANE: Form Editors (Visible in 'edit' and 'split' modes) */}
        {viewMode !== "preview" && (
          <div className={`${viewMode === "split" ? "xl:col-span-7" : "w-full"} space-y-6`}>
            {/* SUB-TABS BAR FOR LANDING PAGE */}
            {selectedGroup === "landing" && (
              <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto text-xs font-semibold text-slate-600">
                {[
                  { id: "hero", label: "Hero Banner" },
                  { id: "hero_pills", label: "4 Feature Pills" },
                  { id: "stats", label: "Stats Bar" },
                  { id: "categories", label: "Supply Categories" },
                  { id: "process", label: "4-Step Process" },
                  { id: "benefits", label: "Vendor Benefits" },
                  { id: "impact", label: "Impact Container" },
                  { id: "documents", label: "Required Docs" },
                  { id: "faqs", label: "Portal FAQs" },
                  { id: "cta", label: "Bottom CTA Banner" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setActiveSubTab(st.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      activeSubTab === st.id
                        ? "bg-red-50 text-[#dc2626] font-bold border border-red-200"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}

            {/* FORM CARD CONTAINER */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
              {/* ================================================================ */}
              {/* SECTION: HERO BANNER */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "hero" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Hero Section Primary Settings</h2>
                      <p className="text-xs text-slate-500">
                        Controls headline, subtitle, buttons, and site image
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">Section 01</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Top Red Badge Text
                      </label>
                      <input
                        type="text"
                        value={formData.heroBadge}
                        onChange={(e) => {
                          setFormData({ ...formData, heroBadge: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Headline Prefix
                      </label>
                      <input
                        type="text"
                        value={formData.heroTitlePrefix}
                        onChange={(e) => {
                          setFormData({ ...formData, heroTitlePrefix: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Headline Brand Highlight (Red)
                      </label>
                      <input
                        type="text"
                        value={formData.heroTitleHighlight}
                        onChange={(e) => {
                          setFormData({ ...formData, heroTitleHighlight: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#dc2626] focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Registration Button Label
                      </label>
                      <input
                        type="text"
                        value={formData.heroRegisterBtnText}
                        onChange={(e) => {
                          setFormData({ ...formData, heroRegisterBtnText: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Hero Paragraph Subtitle
                    </label>
                    <textarea
                      rows={2}
                      value={formData.heroSubtitle}
                      onChange={(e) => {
                        setFormData({ ...formData, heroSubtitle: e.target.value });
                        markDirty();
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Hero Background Image Picker with 1-Click Library Presets */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] uppercase font-bold text-slate-700 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#dc2626]" />
                        <span>Hero Right Graphic Image URL</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Supports direct URLs or presets</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.heroImageUrl || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, heroImageUrl: e.target.value });
                          markDirty();
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none"
                        placeholder="/images/empanelment/hero-engineers-perfect.jpg"
                      />
                    </div>

                    {/* Presets Gallery */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400">1-Click Certified Presets:</p>
                      <div className="flex flex-wrap gap-2">
                        {IMAGE_LIBRARY_PRESETS.map((p) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, heroImageUrl: p.url });
                              markDirty();
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              formData.heroImageUrl === p.url
                                ? "bg-red-50 text-[#dc2626] border-red-300"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SECTION: 4 HERO FEATURE PILLS */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "hero_pills" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">4 Feature Pills (Below Buttons)</h2>
                      <p className="text-xs text-slate-500">Key pillars with red outline icons</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `p_${Date.now()}`;
                        setHeroPills([...heroPills, { id: newId, title: "New Feature\nPillar", iconName: "ShieldCheck" }]);
                        markDirty();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Pill</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {heroPills.map((pill, idx) => (
                      <div
                        key={pill.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-red-100 text-[#dc2626] text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Title Text</label>
                            <input
                              type="text"
                              value={pill.title}
                              onChange={(e) => {
                                const next = [...heroPills];
                                next[idx].title = e.target.value;
                                setHeroPills(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Icon Key</label>
                            <select
                              value={pill.iconName}
                              onChange={(e) => {
                                const next = [...heroPills];
                                next[idx].iconName = e.target.value;
                                setHeroPills(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-900"
                            >
                              <option value="Handshake">Handshake (Trust & Transparency)</option>
                              <option value="Users">Users (Local Partners)</option>
                              <option value="Building2">Building2 (Infrastructure)</option>
                              <option value="TrendingUp">TrendingUp (Long-term Growth)</option>
                              <option value="ShieldCheck">ShieldCheck (Compliance)</option>
                              <option value="Settings">Settings (Quality)</option>
                            </select>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItem(heroPills, idx, "up", setHeroPills)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(heroPills, idx, "down", setHeroPills)}
                            disabled={idx === heroPills.length - 1}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHeroPills(heroPills.filter((_, i) => i !== idx));
                              markDirty();
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SECTION: FLOATING STATS BAR */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "stats" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Stats Counter Bar (200+, 150+...)</h2>
                      <p className="text-xs text-slate-500">Key metrics displayed in floating bottom banner</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `s_${Date.now()}`;
                        setStats([...stats, { id: newId, value: "100+", label: "New Metric", iconName: "Award" }]);
                        markDirty();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Metric</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {stats.map((stat, idx) => (
                      <div
                        key={stat.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Value (e.g. 200+)</label>
                            <input
                              type="text"
                              value={stat.value}
                              onChange={(e) => {
                                const next = [...stats];
                                next[idx].value = e.target.value;
                                setStats(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black bg-white text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Label (e.g. Trusted Vendors)</label>
                            <input
                              type="text"
                              value={stat.label}
                              onChange={(e) => {
                                const next = [...stats];
                                next[idx].label = e.target.value;
                                setStats(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Icon Key</label>
                            <select
                              value={stat.iconName}
                              onChange={(e) => {
                                const next = [...stats];
                                next[idx].iconName = e.target.value;
                                setStats(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-900"
                            >
                              <option value="Users">Users (Vendors / Manpower)</option>
                              <option value="FileText">FileText (Projects Supplied)</option>
                              <option value="MapPin">MapPin (Cities & Footprint)</option>
                              <option value="ShieldCheck">ShieldCheck (Transparency)</option>
                              <option value="Award">Award (Certifications)</option>
                            </select>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItem(stats, idx, "up", setStats)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(stats, idx, "down", setStats)}
                            disabled={idx === stats.length - 1}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStats(stats.filter((_, i) => i !== idx));
                              markDirty();
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SECTION: SUPPLY CATEGORIES */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "categories" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Supply Categories Matrix ({categories.length})</h2>
                      <p className="text-xs text-slate-500">Photographic cards with live trade badges & tags</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `c_${Date.now()}`;
                        setCategories([
                          ...categories,
                          {
                            id: newId,
                            title: "New Supply Trade",
                            description: "Supply description here",
                            imageUrl: "/images/empanelment/cat-building-materials.jpg",
                            linkUrl: "/empanelment/apply",
                          },
                        ]);
                        markDirty();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Trade</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {categories.map((cat, idx) => (
                      <div
                        key={cat.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-xs text-slate-900">
                            Trade #{idx + 1}: {cat.title}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveItem(categories, idx, "up", setCategories)}
                              disabled={idx === 0}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(categories, idx, "down", setCategories)}
                              disabled={idx === categories.length - 1}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCategories(categories.filter((_, i) => i !== idx));
                                markDirty();
                              }}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Title</label>
                            <input
                              type="text"
                              value={cat.title}
                              onChange={(e) => {
                                const next = [...categories];
                                next[idx].title = e.target.value;
                                setCategories(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Description</label>
                            <input
                              type="text"
                              value={cat.description}
                              onChange={(e) => {
                                const next = [...categories];
                                next[idx].description = e.target.value;
                                setCategories(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Photo Image URL</label>
                          <input
                            type="text"
                            value={cat.imageUrl}
                            onChange={(e) => {
                              const next = [...categories];
                              next[idx].imageUrl = e.target.value;
                              setCategories(next);
                              markDirty();
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SECTION: 4-STEP PROCESS */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "process" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900">Registration Process Steps</h2>
                    <p className="text-xs text-slate-500">Step 01 to 04 shown in connected sequence</p>
                  </div>

                  <div className="space-y-3">
                    {steps.map((st, idx) => (
                      <div key={st.step} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-[#dc2626] text-white">
                            STEP {st.step}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Title</label>
                            <input
                              type="text"
                              value={st.title}
                              onChange={(e) => {
                                const next = [...steps];
                                next[idx].title = e.target.value;
                                setSteps(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Description</label>
                            <input
                              type="text"
                              value={st.description}
                              onChange={(e) => {
                                const next = [...steps];
                                next[idx].description = e.target.value;
                                setSteps(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SECTION: VENDOR BENEFITS */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "benefits" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Vendor Benefits ({benefits.length})</h2>
                      <p className="text-xs text-slate-500">Why partner with Hindustan Projects cards</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {benefits.map((b, idx) => (
                      <div key={b.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <label className="block text-[9px] uppercase font-bold text-slate-400">Benefit Title</label>
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => {
                            const next = [...benefits];
                            next[idx].title = e.target.value;
                            setBenefits(next);
                            markDirty();
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                        />
                        <label className="block text-[9px] uppercase font-bold text-slate-400">Description</label>
                        <textarea
                          rows={2}
                          value={b.description}
                          onChange={(e) => {
                            const next = [...benefits];
                            next[idx].description = e.target.value;
                            setBenefits(next);
                            markDirty();
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SECTION: PORTAL FAQS */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "faqs" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Frequently Asked Questions ({faqsList.length})</h2>
                      <p className="text-xs text-slate-500">Interactive accordion questions on portal home</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `f_${Date.now()}`;
                        setFaqsList([
                          ...faqsList,
                          { id: newId, question: "New FAQ Question?", answer: "Detailed answer goes here." },
                        ]);
                        markDirty();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {faqsList.map((faq, idx) => (
                      <div key={faq.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-700">FAQ #{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveItem(faqsList, idx, "up", setFaqsList)}
                              disabled={idx === 0}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(faqsList, idx, "down", setFaqsList)}
                              disabled={idx === faqsList.length - 1}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFaqsList(faqsList.filter((_, i) => i !== idx));
                                markDirty();
                              }}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const next = [...faqsList];
                              next[idx].question = e.target.value;
                              setFaqsList(next);
                              markDirty();
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Answer</label>
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => {
                              const next = [...faqsList];
                              next[idx].answer = e.target.value;
                              setFaqsList(next);
                              markDirty();
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* PAGE: CAPACITY GUIDELINES & TIERS */}
              {/* ================================================================ */}
              {selectedGroup === "guidelines" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Capacity Classification Standards & Tiers ({guidelinesTiers.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Controls /empanelment/guidelines tiers, statutory checklist, and NBC 2016 rules
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGuidelinesTiers([
                          ...guidelinesTiers,
                          {
                            code: "CLASS_NEW",
                            title: "New Capacity Tier",
                            turnover: "₹ 50 Lakhs+",
                            capacity: "Single Work Order",
                            validity: "2 Years",
                            scope: "Scope description",
                          },
                        ]);
                        markDirty();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {guidelinesTiers.map((tier, idx) => (
                      <div key={tier.code || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                            {tier.code}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveItem(guidelinesTiers, idx, "up", setGuidelinesTiers)}
                              disabled={idx === 0}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(guidelinesTiers, idx, "down", setGuidelinesTiers)}
                              disabled={idx === guidelinesTiers.length - 1}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setGuidelinesTiers(guidelinesTiers.filter((_, i) => i !== idx));
                                markDirty();
                              }}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Tier Title</label>
                            <input
                              type="text"
                              value={tier.title}
                              onChange={(e) => {
                                const next = [...guidelinesTiers];
                                next[idx].title = e.target.value;
                                setGuidelinesTiers(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Annual Turnover</label>
                            <input
                              type="text"
                              value={tier.turnover}
                              onChange={(e) => {
                                const next = [...guidelinesTiers];
                                next[idx].turnover = e.target.value;
                                setGuidelinesTiers(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Order Capability</label>
                            <input
                              type="text"
                              value={tier.capacity}
                              onChange={(e) => {
                                const next = [...guidelinesTiers];
                                next[idx].capacity = e.target.value;
                                setGuidelinesTiers(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#dc2626] bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Validity Period</label>
                            <input
                              type="text"
                              value={tier.validity}
                              onChange={(e) => {
                                const next = [...guidelinesTiers];
                                next[idx].validity = e.target.value;
                                setGuidelinesTiers(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Eligible Scope</label>
                          <textarea
                            rows={2}
                            value={tier.scope}
                            onChange={(e) => {
                              const next = [...guidelinesTiers];
                              next[idx].scope = e.target.value;
                              setGuidelinesTiers(next);
                              markDirty();
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* PAGE: TENDERS RADAR NOTICE & DIRECT HELPDESK */}
              {/* ================================================================ */}
              {selectedGroup === "tenders" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Procurement Directorate Live Bulletin & Contact Desk
                    </h2>
                    <p className="text-xs text-slate-500">
                      Dynamic notification banner displayed above the active tenders radar
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Notice Badge Tag
                      </label>
                      <input
                        type="text"
                        value={formData.tendersNoticeBadge || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, tendersNoticeBadge: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Notice Title
                      </label>
                      <input
                        type="text"
                        value={formData.tendersNoticeTitle || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, tendersNoticeTitle: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Notice Bulletin Text
                    </label>
                    <textarea
                      rows={3}
                      value={formData.tendersNoticeText || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, tendersNoticeText: e.target.value });
                        markDirty();
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Tenders Helpline Phone
                      </label>
                      <input
                        type="text"
                        value={formData.tendersHelplinePhone || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, tendersHelplinePhone: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Tenders Helpline Email
                      </label>
                      <input
                        type="text"
                        value={formData.tendersHelplineEmail || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, tendersHelplineEmail: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* PAGE: DAILY GATE PASS TERMS */}
              {/* ================================================================ */}
              {selectedGroup === "gatepass" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Daily Site Gate Pass Policies & Security Terms
                    </h2>
                    <p className="text-xs text-slate-500">
                      Displayed on the pass generation form and bottom of printed QR badge
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Entry Instructions (Blue/Rose Info Callout)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.gatePassInstructions || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, gatePassInstructions: e.target.value });
                        markDirty();
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Security Pass Terms & Conditions (Printed Footer)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.gatePassTerms || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, gatePassTerms: e.target.value });
                        markDirty();
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* PAGE: GLOBAL BRANDING & HELPDESK */}
              {/* ================================================================ */}
              {selectedGroup === "branding" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900">Global Corporate Identity & Helpdesk</h2>
                    <p className="text-xs text-slate-500">Synchronized across navbar, drawer, footer, and tracker</p>
                  </div>

                  {/* Announcement Ticker */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] uppercase font-bold text-slate-700">
                        Top Announcement Ticker Bar
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, noticeAlertActive: !formData.noticeAlertActive });
                          markDirty();
                        }}
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          formData.noticeAlertActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {formData.noticeAlertActive ? "ACTIVE" : "HIDDEN"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.noticeAlertBanner || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, noticeAlertBanner: e.target.value });
                        markDirty();
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                      placeholder="📢 FY 2026-27 Vendor & Contractor Empanelment is now open..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Portal Official Name
                      </label>
                      <input
                        type="text"
                        value={formData.portalName}
                        onChange={(e) => {
                          setFormData({ ...formData, portalName: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Official Tagline
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => {
                          setFormData({ ...formData, tagline: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Primary Phone / Helpdesk
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Procurement Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Support WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={formData.supportWhatsapp}
                        onChange={(e) => {
                          setFormData({ ...formData, supportWhatsapp: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Head Office Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        markDirty();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* PAGE: SEO & META TAGS */}
              {/* ================================================================ */}
              {selectedGroup === "seo" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900">SEO & Social Meta Tag Configuration</h2>
                    <p className="text-xs text-slate-500">
                      Directly optimizes Google search rank, WhatsApp preview cards, and social links
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Browser Page Title &lt;title&gt;
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, metaTitle: e.target.value });
                        markDirty();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Meta Description (Search Snippet)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.metaDescription || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, metaDescription: e.target.value });
                        markDirty();
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Target Search Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.metaKeywords || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, metaKeywords: e.target.value });
                        markDirty();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                    />
                  </div>

                  {/* Google Snippet Live Simulation */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Google Search Snippet Simulation:
                    </p>
                    <p className="text-[11px] text-slate-500">empanelment.hindustanprojects.in</p>
                    <h3 className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer">
                      {formData.metaTitle || "Vendor & Contractor Empanelment Portal | Hindustan Projects"}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {formData.metaDescription ||
                        "Official contractor empanelment, live construction tenders, and daily site access pass portal for Hindustan Projects across Rajasthan."}
                    </p>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* PAGE: SECTION VISIBILITY SWITCHES */}
              {/* ================================================================ */}
              {selectedGroup === "visibility" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900">Section Visibility Switches</h2>
                    <p className="text-xs text-slate-500">
                      Instantly turn entire sections ON or OFF without touching frontend code
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "showHeroPills", label: "Hero 4 Feature Pills", desc: "Fair procurement, local partners..." },
                      { key: "showStats", label: "Floating Stats Bar", desc: "200+ Vendors, 150+ Projects..." },
                      { key: "showCategories", label: "Supply Categories Matrix", desc: "6 Trade photographic cards" },
                      { key: "showProcess", label: "4-Step Registration Process", desc: "Profile, KYC, Review, List" },
                      { key: "showBenefits", label: "Vendor Benefits", desc: "6 Partnership advantage cards" },
                      { key: "showImpact", label: "Dark Skyline Impact Container", desc: "Building stronger Rajasthan" },
                      { key: "showDocs", label: "Required Documents Matrix", desc: "GST, PAN, Cheque, MSME" },
                      { key: "showFaqs", label: "Portal FAQ Accordions", desc: "Frequently asked questions" },
                      { key: "showCta", label: "Bottom Red Callout Banner", desc: "Be a part of our journey" },
                      { key: "showTendersNotice", label: "Tenders Directorate Bulletin", desc: "Active notice board on /tenders" },
                    ].map((sec) => {
                      const isVisible = visibility[sec.key] !== false;
                      return (
                        <div
                          key={sec.key}
                          className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                        >
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{sec.label}</h4>
                            <p className="text-[10px] text-slate-500">{sec.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setVisibility({ ...visibility, [sec.key]: !isVisible });
                              markDirty();
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isVisible
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            }`}
                          >
                            {isVisible ? "VISIBLE" : "HIDDEN"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* RIGHT PANE: LIVE INTERACTIVE PREVIEW (In Split or Full mode) */}
        {/* ================================================================ */}
        {viewMode !== "edit" && (
          <div
            className={`${
              viewMode === "split" ? "xl:col-span-5" : "w-full max-w-5xl mx-auto"
            } space-y-4 sticky top-28`}
          >
            {/* Preview Toolbar */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold tracking-wide">Live Preview Engine</span>
              </div>

              {/* Page Selector */}
              <div className="flex items-center gap-1.5">
                <select
                  value={previewPage}
                  onChange={(e) => setPreviewPage(e.target.value as any)}
                  className="bg-slate-800 text-white border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none"
                >
                  <option value="home">Landing (Home)</option>
                  <option value="guidelines">Guidelines Standards</option>
                  <option value="tenders">Tenders Notice</option>
                  <option value="gatepass">Gate Pass Preview</option>
                </select>

                {/* Device Selector */}
                <div className="bg-slate-800 p-0.5 rounded-xl flex items-center border border-slate-700 text-xs">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-lg ${previewDevice === "desktop" ? "bg-slate-700 text-white" : "text-slate-400"}`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-lg ${previewDevice === "mobile" ? "bg-slate-700 text-white" : "text-slate-400"}`}
                    title="Mobile Viewport (390px)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Live Viewport Container */}
            <div
              className={`mx-auto bg-white border-4 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
                previewDevice === "mobile"
                  ? "w-[390px] border-slate-800 min-h-[700px] max-h-[820px] overflow-y-auto"
                  : "w-full border-slate-200 min-h-[700px] max-h-[820px] overflow-y-auto"
              }`}
            >
              {/* Simulated Mobile Notch / Browser Header */}
              {previewDevice === "mobile" && (
                <div className="bg-slate-900 text-white text-[10px] py-1 px-4 flex items-center justify-between font-mono">
                  <span>9:41</span>
                  <div className="w-14 h-3 bg-black rounded-full" />
                  <span>5G 100%</span>
                </div>
              )}

              {/* RENDER SELECTED PREVIEW PAGE */}
              {previewPage === "home" && (
                <div className="bg-white text-slate-900 font-sans text-xs">
                  {/* Announcement Bar */}
                  {formData.noticeAlertActive && formData.noticeAlertBanner && (
                    <div className="bg-amber-500 text-slate-950 px-3 py-1.5 text-center text-[10px] font-bold">
                      {formData.noticeAlertBanner}
                    </div>
                  )}

                  {/* Header Mockup */}
                  <div className="border-b border-slate-100 p-3 flex items-center justify-between">
                    <div>
                      <span className="font-black text-xs text-slate-950">HINDUSTAN </span>
                      <span className="font-black text-xs text-[#dc2626]">PROJECTS</span>
                      <p className="text-[8px] text-slate-400">{formData.tagline}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#dc2626] font-bold text-[9px]">
                      PORTAL
                    </span>
                  </div>

                  {/* Hero Section Live */}
                  <div className="p-4 sm:p-6 space-y-3 bg-gradient-to-b from-white via-white to-slate-50">
                    <span className="text-[10px] font-bold text-[#dc2626] uppercase tracking-wider block">
                      — {formData.heroBadge}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight">
                      <span>{formData.heroTitlePrefix} </span>
                      <span className="text-[#dc2626]">{formData.heroTitleHighlight}</span>
                    </h2>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {formData.heroSubtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button className="px-4 py-2.5 rounded-xl bg-[#dc2626] text-white font-bold text-center">
                        {formData.heroRegisterBtnText}
                      </button>
                      <button className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-center">
                        {formData.heroLoginBtnText}
                      </button>
                    </div>

                    {/* Feature Pills */}
                    {visibility.showHeroPills !== false && (
                      <div className="pt-3 grid grid-cols-2 gap-2 border-t border-slate-100">
                        {heroPills.slice(0, 4).map((p) => (
                          <div key={p.id} className="flex items-start gap-1.5">
                            <span className="text-[#dc2626] font-bold">✓</span>
                            <span className="text-[10px] font-bold text-slate-800 leading-tight">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats Bar Live */}
                  {visibility.showStats !== false && (
                    <div className="m-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-2">
                      {stats.slice(0, 4).map((s) => (
                        <div key={s.id} className="p-1.5 text-center">
                          <p className="text-base font-black text-slate-950">{s.value}</p>
                          <p className="text-[9px] text-slate-500 font-semibold">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Supply Categories */}
                  {visibility.showCategories !== false && (
                    <div className="p-3 space-y-2 bg-slate-50/70">
                      <p className="text-[10px] font-bold text-[#dc2626] uppercase">— {formData.categoriesBadge}</p>
                      <h3 className="font-black text-sm text-slate-900">{formData.categoriesTitle}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categories.slice(0, 4).map((c) => (
                          <div key={c.id} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                            <p className="font-bold text-[11px] text-slate-900">{c.title}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{c.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQs */}
                  {visibility.showFaqs !== false && (
                    <div className="p-3 space-y-2">
                      <p className="text-[10px] font-bold text-[#dc2626] uppercase">— {formData.faqBadge}</p>
                      <div className="space-y-1.5">
                        {faqsList.slice(0, 3).map((f) => (
                          <div key={f.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <p className="font-bold text-[11px] text-slate-900">{f.question}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{f.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RENDER GUIDELINES PREVIEW */}
              {previewPage === "guidelines" && (
                <div className="p-4 space-y-4 bg-slate-50 text-xs">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#dc2626]">
                      {formData.guidelinesBadge}
                    </span>
                    <h2 className="text-base font-black text-slate-900">{formData.guidelinesTitle}</h2>
                  </div>

                  <div className="space-y-2.5">
                    {guidelinesTiers.map((t) => (
                      <div key={t.code} className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {t.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">Validity: {t.validity}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">{t.title}</h4>
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded-xl">
                          <div>
                            <span className="text-slate-400 block">Turnover:</span>
                            <span className="font-bold text-slate-800">{t.turnover}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Capability:</span>
                            <span className="font-bold text-[#dc2626]">{t.capacity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RENDER TENDERS PREVIEW */}
              {previewPage === "tenders" && (
                <div className="p-4 space-y-4 text-xs">
                  {formData.tendersNoticeText && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold uppercase">
                        {formData.tendersNoticeBadge || "NOTICE"}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{formData.tendersNoticeTitle}</h4>
                      <p className="text-[10px] text-slate-600 leading-relaxed">{formData.tendersNoticeText}</p>
                    </div>
                  )}
                  <p className="text-center text-slate-400 text-[11px] pt-4">
                    Active tenders from database rendered below this bulletin.
                  </p>
                </div>
              )}

              {/* RENDER GATE PASS PREVIEW */}
              {previewPage === "gatepass" && (
                <div className="p-4 space-y-4 text-xs">
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                    <p className="font-bold text-[11px] text-rose-900">Security Checkpoint Notice</p>
                    <p className="text-[10px] text-rose-700 leading-relaxed">
                      {formData.gatePassInstructions}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <div className="w-24 h-24 mx-auto bg-white border border-slate-300 rounded-xl flex items-center justify-center font-mono font-bold text-slate-400 text-xs">
                      [QR SCAN]
                    </div>
                    <p className="text-[10px] text-slate-500">{formData.gatePassTerms}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
