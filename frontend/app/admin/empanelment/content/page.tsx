"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";
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
  ChevronLeft,
  ChevronRight,
  Check,
  Share2,
  Copy,
  Briefcase,
  QrCode,
  UploadCloud,
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

interface StudioImagePickerProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (url: string) => void;
  presets?: { label: string; url: string; category?: string }[];
}

function StudioImagePicker({
  label,
  sublabel,
  value,
  onChange,
  presets = IMAGE_LIBRARY_PRESETS,
}: StudioImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit. Please upload a smaller image.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed. Please enter URL manually.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while uploading image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
          <span>{label}</span>
        </label>
        {sublabel && <span className="text-[10px] text-slate-400">{sublabel}</span>}
      </div>

      {error && (
        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-rose-500 hover:text-rose-700 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Image Preview & Upload Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Preview Thumbnail */}
        {value ? (
          <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 group shadow-2xs">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-md text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove Image"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
            <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
            <span className="text-[9px] font-bold">No Image</span>
          </div>
        )}

        {/* Input & Upload Button */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              placeholder="/images/... or https://..."
            />
            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Image</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[9.5px] text-slate-400">
            Upload any image directly from device (JPG, PNG, WebP up to 5MB) or pick from certified presets below.
          </p>
        </div>
      </div>

      {/* 1-Click Library Presets */}
      {presets && presets.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
          <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
            1-Click Certified Presets:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => onChange(p.url)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                  value === p.url
                    ? "bg-amber-500 text-white font-bold border-amber-600 shadow-2xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MAIN_GROUPS = [
  { key: "landing", label: "Landing CMS", icon: LayoutTemplate, badge: "10 Sections" },
  { key: "guidelines", label: "Tiers & Standards", icon: FileText, badge: "CPWD Tiers" },
  { key: "tenders", label: "Tenders Notice", icon: Briefcase, badge: "Public RFQs" },
  { key: "gatepass", label: "Gate Pass Policy", icon: QrCode, badge: "Security" },
  { key: "branding", label: "Branding & Nav", icon: Globe, badge: "Logos & Menus" },
  { key: "seo", label: "SEO & Social", icon: Search, badge: "Meta & OG" },
  { key: "visibility", label: "Section Switches", icon: SlidersHorizontal, badge: "Switches" },
] as const;

const LANDING_SECTIONS = [
  { key: "hero", label: "Hero Banner", icon: LayoutTemplate, num: "01" },
  { key: "hero_pills", label: "Key Pills", icon: Sparkles, num: "02" },
  { key: "stats", label: "Counter Stats", icon: Award, num: "03" },
  { key: "categories", label: "Trade Categories", icon: Layers, num: "04" },
  { key: "process", label: "4-Step Pipeline", icon: CheckCircle2, num: "05" },
  { key: "benefits", label: "Growth Benefits", icon: ShieldCheck, num: "06" },
  { key: "impact", label: "Impact Story", icon: Building2, num: "07" },
  { key: "docs", label: "Statutory Docs", icon: FileText, num: "08" },
  { key: "faqs", label: "FAQs Accordion", icon: HelpCircle, num: "09" },
  { key: "cta", label: "Bottom CTA", icon: ArrowRight, num: "10" },
] as const;

export default function EmpanelmentContentCmsPage() {
  // Navigation & Page Selector
  const [selectedGroup, setSelectedGroup] = useState<
    "landing" | "guidelines" | "tenders" | "gatepass" | "branding" | "seo" | "visibility"
  >("landing");

  const [activeSubTab, setActiveSubTab] = useState<string>("hero");

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

  // Social Links state parsed from formData.socialLinks
  const socialLinksParsed = useMemo(() => {
    return parseJsonField(formData.socialLinks, {
      linkedin: "https://linkedin.com/company/hindustanprojects",
      facebook: "https://facebook.com/hindustanprojects",
      instagram: "https://instagram.com/hindustan_projects",
      youtube: "https://youtube.com/@hindustanprojects",
    });
  }, [formData.socialLinks]);

  const updateSocialLink = (network: string, val: string) => {
    const updated = { ...socialLinksParsed, [network]: val };
    setFormData({ ...formData, socialLinks: JSON.stringify(updated) });
    markDirty();
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || (res.redirected && res.url.includes("admin-login"))) {
        window.location.href = "/admin-login";
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Unable to save CMS changes (Session expired or server error)");
      }

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
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* ── 1. APPLE GLASS HEADER ── */}
      <EmpanelmentAdminPageHeader
        breadcrumbs={[{ label: "Portal Studio CMS" }]}
        title="Vendor Portal CMS & Content Studio"
        description="Unified Content Studio for public contractor onboarding pages, CPWD trade capacity standards, commercial tender bulletins, and gate pass security rules."
        badge={hasUnsavedChanges ? "Unsaved Changes" : "Published & Synced"}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/empanelment"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md bg-white/80 border border-slate-200/80 hover:bg-white hover:text-slate-900 transition-all rounded-xl shadow-2xs"
            title="Open live portal in new window"
          >
            <span>Visit Live Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md bg-white/80 border border-slate-200/80 hover:bg-white hover:text-slate-900 transition-all rounded-xl shadow-2xs cursor-pointer"
            title="Reset to certified reference standards"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Standards</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-xl transition-all shadow-[0_4px_14px_rgba(245,158,11,0.35)] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            )}
            <span>{saving ? "Publishing..." : "Publish Live Changes"}</span>
          </button>
        </div>
      </EmpanelmentAdminPageHeader>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="underline opacity-70 hover:opacity-100 text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 2. PRIMARY NAVIGATION TABS (Horizontal Apple Cupertino Glass) ── */}
      <div className="p-1.5 bg-slate-200/50 backdrop-blur-2xl rounded-2xl border border-white/80 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-inner">
        {MAIN_GROUPS.map((grp) => {
          const Icon = grp.icon;
          const isActive = selectedGroup === grp.key;
          return (
            <button
              key={grp.key}
              type="button"
              onClick={() => {
                setSelectedGroup(grp.key as any);
                if (grp.key === "landing") setActiveSubTab("hero");
                else if (grp.key === "guidelines") setActiveSubTab("tiers");
                else if (grp.key === "tenders") setActiveSubTab("notice");
                else if (grp.key === "gatepass") setActiveSubTab("policy");
                else if (grp.key === "branding") setActiveSubTab("branding");
                else if (grp.key === "seo") setActiveSubTab("meta");
                else if (grp.key === "visibility") setActiveSubTab("switches");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-600" : "text-slate-400"}`} />
              <span>{grp.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "text-slate-400 bg-slate-100"
                }`}
              >
                {grp.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 3. SECONDARY SUB-SECTION PILLS (When Landing CMS is active) ── */}
      {selectedGroup === "landing" && (
        <div className="p-3.5 bg-white/80 backdrop-blur-2xl border border-white/90 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">
              Landing Page Sections (10 Modules):
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const tabs = LANDING_SECTIONS.map((s) => s.key);
                  const idx = tabs.indexOf(activeSubTab as any);
                  if (idx > 0) setActiveSubTab(tabs[idx - 1]);
                }}
                disabled={activeSubTab === "hero"}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Previous section"
              >
                ← Prev
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-500 px-1">
                {LANDING_SECTIONS.findIndex((s) => s.key === activeSubTab) + 1} / 10
              </span>
              <button
                type="button"
                onClick={() => {
                  const tabs = LANDING_SECTIONS.map((s) => s.key);
                  const idx = tabs.indexOf(activeSubTab as any);
                  if (idx < tabs.length - 1) setActiveSubTab(tabs[idx + 1]);
                }}
                disabled={activeSubTab === "cta"}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Next section"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {LANDING_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isCurrent = activeSubTab === sec.key;
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => setActiveSubTab(sec.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-slate-900 text-white font-bold shadow-xs scale-[1.02]"
                      : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 font-medium"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isCurrent
                        ? "bg-amber-400 text-slate-950"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {sec.num}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-amber-400" : "text-slate-500"}`} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. MAIN FORM WORKSPACE (Full-Width Luxurious Apple Glass Card) ── */}
      <div className="relative bg-white/85 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#dc2626] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Hero Right Graphic Image Uploader */}
                  <StudioImagePicker
                    label="Hero Right Graphic Image"
                    sublabel="Upload from device, paste URL, or pick certified presets"
                    value={formData.heroImageUrl || ""}
                    onChange={(url) => {
                      setFormData({ ...formData, heroImageUrl: url });
                      markDirty();
                    }}
                    presets={IMAGE_LIBRARY_PRESETS}
                  />
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
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[9px] uppercase font-bold text-slate-400">Photo Image URL</label>
                            <label className="text-[9.5px] text-amber-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
                              <UploadCloud className="w-3 h-3" />
                              <span>Upload from device</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    const fd = new FormData();
                                    fd.append("file", file);
                                    const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
                                    const data = await res.json();
                                    if (data.success && data.url) {
                                      const next = [...categories];
                                      next[idx].imageUrl = data.url;
                                      setCategories(next);
                                      markDirty();
                                    }
                                  } catch (_e) {}
                                }}
                              />
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            {cat.imageUrl && (
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
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
                              placeholder="/images/... or https://..."
                            />
                          </div>
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
              {/* SECTION: DARK IMPACT SECTION & PILLARS */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "impact" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Dark Impact Section & Vision Pillars</h2>
                      <p className="text-xs text-slate-500">
                        Controls impact headline, background graphic, CTA button, and key corporate pillars
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">Section 07</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Impact Section Badge
                      </label>
                      <input
                        type="text"
                        value={formData.impactBadge}
                        onChange={(e) => {
                          setFormData({ ...formData, impactBadge: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Action Button Label
                      </label>
                      <input
                        type="text"
                        value={formData.impactBtnText}
                        onChange={(e) => {
                          setFormData({ ...formData, impactBtnText: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Impact Headline Title
                    </label>
                    <input
                      type="text"
                      value={formData.impactTitle}
                      onChange={(e) => {
                        setFormData({ ...formData, impactTitle: e.target.value });
                        markDirty();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Impact Subtitle Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.impactSubtitle}
                      onChange={(e) => {
                        setFormData({ ...formData, impactSubtitle: e.target.value });
                        markDirty();
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Impact Background Image Uploader */}
                  <StudioImagePicker
                    label="Impact Background Graphic Image"
                    sublabel="Upload night skyline/drone site photo, paste URL, or pick preset"
                    value={formData.impactImageUrl || ""}
                    onChange={(url) => {
                      setFormData({ ...formData, impactImageUrl: url });
                      markDirty();
                    }}
                    presets={IMAGE_LIBRARY_PRESETS}
                  />

                  {/* Impact Pillars Editor */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800">Impact Strategic Pillars ({impactPillars.length})</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newId = `p_${Date.now()}`;
                          setImpactPillars([
                            ...impactPillars,
                            { id: newId, title: "New Strategic Pillar", iconName: "ShieldCheck" },
                          ]);
                          markDirty();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Pillar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {impactPillars.map((pillar, idx) => (
                        <div key={pillar.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-700">Pillar #{idx + 1}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveItem(impactPillars, idx, "up", setImpactPillars)}
                                disabled={idx === 0}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(impactPillars, idx, "down", setImpactPillars)}
                                disabled={idx === impactPillars.length - 1}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setImpactPillars(impactPillars.filter((_, i) => i !== idx));
                                  markDirty();
                                }}
                                className="p-1 rounded-lg hover:bg-red-50 text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Pillar Title</label>
                            <input
                              type="text"
                              value={pillar.title}
                              onChange={(e) => {
                                const next = [...impactPillars];
                                next[idx].title = e.target.value;
                                setImpactPillars(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Lucide Icon</label>
                            <input
                              type="text"
                              value={pillar.iconName || "ShieldCheck"}
                              onChange={(e) => {
                                const next = [...impactPillars];
                                next[idx].iconName = e.target.value;
                                setImpactPillars(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SECTION: DOCUMENTS REQUIRED CHECKLIST */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "docs" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Required Documents Checklist ({docsList.length})</h2>
                      <p className="text-xs text-slate-500">
                        Guidance for vendors on what documents to keep ready before applying
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">Section 08</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={formData.docsBadge}
                        onChange={(e) => {
                          setFormData({ ...formData, docsBadge: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Section Headline
                      </label>
                      <input
                        type="text"
                        value={formData.docsTitle}
                        onChange={(e) => {
                          setFormData({ ...formData, docsTitle: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Section Subtitle Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.docsSubtitle}
                      onChange={(e) => {
                        setFormData({ ...formData, docsSubtitle: e.target.value });
                        markDirty();
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Documents List Editor */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800">Required Documents ({docsList.length})</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newId = `doc_${Date.now()}`;
                          setDocsList([
                            ...docsList,
                            { id: newId, title: "New Document Requirement", description: "Brief details on validity and format required.", iconName: "FileText" },
                          ]);
                          markDirty();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Document</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {docsList.map((doc, idx) => (
                        <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-700">Document #{idx + 1}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveItem(docsList, idx, "up", setDocsList)}
                                disabled={idx === 0}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(docsList, idx, "down", setDocsList)}
                                disabled={idx === docsList.length - 1}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDocsList(docsList.filter((_, i) => i !== idx));
                                  markDirty();
                                }}
                                className="p-1 rounded-lg hover:bg-red-50 text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Title</label>
                              <input
                                type="text"
                                value={doc.title}
                                onChange={(e) => {
                                  const next = [...docsList];
                                  next[idx].title = e.target.value;
                                  setDocsList(next);
                                  markDirty();
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Icon Name</label>
                              <input
                                type="text"
                                value={doc.iconName || "FileText"}
                                onChange={(e) => {
                                  const next = [...docsList];
                                  next[idx].iconName = e.target.value;
                                  setDocsList(next);
                                  markDirty();
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Description / Validity Details</label>
                            <textarea
                              rows={2}
                              value={doc.description}
                              onChange={(e) => {
                                const next = [...docsList];
                                next[idx].description = e.target.value;
                                setDocsList(next);
                                markDirty();
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
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
              {/* SECTION: BOTTOM RED CTA BANNER */}
              {/* ================================================================ */}
              {selectedGroup === "landing" && activeSubTab === "cta" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Bottom Brand CTA Callout Banner</h2>
                      <p className="text-xs text-slate-500">High-converting red action banner placed at the bottom of the portal home</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">Section 10</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={formData.ctaBadge}
                        onChange={(e) => {
                          setFormData({ ...formData, ctaBadge: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Register CTA Button Label
                      </label>
                      <input
                        type="text"
                        value={formData.ctaBtnText}
                        onChange={(e) => {
                          setFormData({ ...formData, ctaBtnText: e.target.value });
                          markDirty();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Main Headline Title
                    </label>
                    <input
                      type="text"
                      value={formData.ctaTitle}
                      onChange={(e) => {
                        setFormData({ ...formData, ctaTitle: e.target.value });
                        markDirty();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Banner Subtitle Text
                    </label>
                    <textarea
                      rows={2}
                      value={formData.ctaSubtitle}
                      onChange={(e) => {
                        setFormData({ ...formData, ctaSubtitle: e.target.value });
                        markDirty();
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
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

                  {/* Social Media Channels */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] uppercase font-bold text-slate-700 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Corporate Social Media Profiles</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Displayed in footer and contact desks</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">LinkedIn Page URL</label>
                        <input
                          type="text"
                          value={socialLinksParsed.linkedin || ""}
                          onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 bg-white"
                          placeholder="https://linkedin.com/company/hindustanprojects"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Facebook Page URL</label>
                        <input
                          type="text"
                          value={socialLinksParsed.facebook || ""}
                          onChange={(e) => updateSocialLink("facebook", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 bg-white"
                          placeholder="https://facebook.com/hindustanprojects"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Instagram Profile URL</label>
                        <input
                          type="text"
                          value={socialLinksParsed.instagram || ""}
                          onChange={(e) => updateSocialLink("instagram", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 bg-white"
                          placeholder="https://instagram.com/hindustan_projects"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">YouTube Channel URL</label>
                        <input
                          type="text"
                          value={socialLinksParsed.youtube || ""}
                          onChange={(e) => updateSocialLink("youtube", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 bg-white"
                          placeholder="https://youtube.com/@hindustanprojects"
                        />
                      </div>
                    </div>
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

                  {/* Social Share OG Image */}
                  <StudioImagePicker
                    label="Social Share & OpenGraph Image (WhatsApp, LinkedIn, Twitter)"
                    sublabel="Image shown when empanelment links are shared on social platforms"
                    value={formData.ogImageUrl || ""}
                    onChange={(url) => {
                      setFormData({ ...formData, ogImageUrl: url });
                      markDirty();
                    }}
                    presets={IMAGE_LIBRARY_PRESETS}
                  />

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

      {/* ── 5. FLOATING SAVE BAR (Shows when changes are unsaved) ── */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 z-40 max-w-lg bg-slate-900/95 backdrop-blur-2xl text-white p-3.5 sm:px-5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">Unsaved Content Changes</p>
              <p className="text-[10px] text-slate-300">Publish to push updates to live portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <Sparkles className="w-3.5 h-3.5 text-slate-950" />}
              <span>{saving ? "Publishing..." : "Publish Live"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
