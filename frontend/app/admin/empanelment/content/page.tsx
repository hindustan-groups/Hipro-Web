"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Image as ImageIcon,
  ArrowRight,
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

export default function EmpanelmentContentCmsPage() {
  const [activeTab, setActiveTab] = useState<
    | "branding"
    | "hero"
    | "stats"
    | "categories"
    | "process"
    | "benefits"
    | "impact"
    | "documents"
    | "faqs"
    | "banner"
    | "guidelines"
    | "tenders_notice"
  >("hero");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      }
    } catch (_err) {
      // Fallback to defaults
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
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

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
          message: "Portal CMS updated and published live successfully!",
        });
        setFormData({ ...formData, ...data.content });
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
    if (confirm("Are you sure you want to restore the portal to reference defaults?")) {
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
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Save / Preview Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">
              Live Page Builder & CMS
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Empanelment Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Portal Content Management Suite
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Live-edit all texts, banners, images, categories, process steps, and FAQs without touching code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/empanelment"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>View Public Portal</span>
          </Link>

          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-all"
            title="Restore Defaults"
          >
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-red-600/20 disabled:opacity-60 transition-all"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving Changes..." : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: "hero", label: "Hero Banner", icon: LayoutTemplate },
          { id: "stats", label: "Stats Bar", icon: Users },
          { id: "categories", label: "Categories (6)", icon: Layers },
          { id: "process", label: "How It Works (4)", icon: ArrowRight },
          { id: "benefits", label: "Vendor Benefits (6)", icon: Award },
          { id: "impact", label: "Impact Container", icon: Building2 },
          { id: "documents", label: "Documents (6)", icon: FileText },
          { id: "faqs", label: "Quick FAQs", icon: HelpCircle },
          { id: "banner", label: "Red CTA Banner", icon: Sparkles },
          { id: "guidelines", label: "Guidelines & Classes", icon: ShieldCheck },
          { id: "tenders_notice", label: "Tenders Bulletin & Gate Pass", icon: FileText },
          { id: "branding", label: "Brand & Contact", icon: Globe },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* ================================================================ */}
        {/* TAB 1: HERO BANNER */}
        {/* ================================================================ */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Hero Section Settings</h2>
              <p className="text-xs text-slate-500">
                Primary above-the-fold headline, buttons, and engineer photo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Top Red Badge Tag
                </label>
                <input
                  type="text"
                  value={formData.heroBadge}
                  onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="VENDOR PORTAL"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Headline Prefix
                </label>
                <input
                  type="text"
                  value={formData.heroTitlePrefix}
                  onChange={(e) => setFormData({ ...formData, heroTitlePrefix: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Partner with"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Headline Highlight (Red Brand Accent)
                </label>
                <input
                  type="text"
                  value={formData.heroTitleHighlight}
                  onChange={(e) => setFormData({ ...formData, heroTitleHighlight: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Hindustan Projects"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hero Image Path / URL
                </label>
                <input
                  type="text"
                  value={formData.heroImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="/images/empanelment/hero-engineers.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hero Subtitle Paragraph
                </label>
                <textarea
                  rows={3}
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Join our local vendor network for construction materials..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Button Text (Red CTA)
                </label>
                <input
                  type="text"
                  value={formData.heroRegisterBtnText}
                  onChange={(e) => setFormData({ ...formData, heroRegisterBtnText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Register as a Vendor"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Secondary Button Text (Login CTA)
                </label>
                <input
                  type="text"
                  value={formData.heroLoginBtnText}
                  onChange={(e) => setFormData({ ...formData, heroLoginBtnText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Vendor Login"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Bottom-Right Image Ribbon Overlay Text
                </label>
                <input
                  type="text"
                  value={formData.heroOverlayBadge}
                  onChange={(e) => setFormData({ ...formData, heroOverlayBadge: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Building Stronger Partnerships for a Better Rajasthan."
                />
              </div>
            </div>

            {/* Feature Pills */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                4 Feature Pills Below CTAs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {heroPills.map((pill, idx) => (
                  <div key={pill.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Pill #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={pill.title}
                      onChange={(e) => {
                        const updated = [...heroPills];
                        updated[idx].title = e.target.value;
                        setHeroPills(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={pill.iconName}
                      onChange={(e) => {
                        const updated = [...heroPills];
                        updated[idx].iconName = e.target.value;
                        setHeroPills(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-500"
                      placeholder="Icon: Handshake, Users..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: STATS BAR */}
        {/* ================================================================ */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Stats Counter Bar</h2>
              <p className="text-xs text-slate-500">
                The 4 trust metric cards shown right beneath the Hero section
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((st, idx) => (
                <div key={st.id || idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-600 uppercase">
                      Stat #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Counter Value
                    </label>
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => {
                        const updated = [...stats];
                        updated[idx].value = e.target.value;
                        setStats(updated);
                      }}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-base font-black text-slate-900"
                      placeholder="200+"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Label Text
                    </label>
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => {
                        const updated = [...stats];
                        updated[idx].label = e.target.value;
                        setStats(updated);
                      }}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700"
                      placeholder="Trusted Vendors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Icon Name
                    </label>
                    <input
                      type="text"
                      value={st.iconName}
                      onChange={(e) => {
                        const updated = [...stats];
                        updated[idx].iconName = e.target.value;
                        setStats(updated);
                      }}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-500"
                      placeholder="Users, FileText, MapPin, ShieldCheck"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: CATEGORIES */}
        {/* ================================================================ */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Supply Categories (6 Photographic Cards)
              </h2>
              <p className="text-xs text-slate-500">
                Configure section titles and the 6 construction procurement categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={formData.categoriesBadge}
                  onChange={(e) => setFormData({ ...formData, categoriesBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="CATEGORIES"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Title
                </label>
                <input
                  type="text"
                  value={formData.categoriesTitle}
                  onChange={(e) => setFormData({ ...formData, categoriesTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold"
                  placeholder="Supply to Our Construction Projects"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formData.categoriesSubtitle}
                  onChange={(e) => setFormData({ ...formData, categoriesSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="We source high-quality materials, services and solutions..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, idx) => (
                <div key={cat.id || idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Category #{idx + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold">
                      Active
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[idx].title = e.target.value;
                        setCategories(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={cat.description}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[idx].description = e.target.value;
                        setCategories(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Image URL / Path
                    </label>
                    <input
                      type="text"
                      value={cat.imageUrl}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[idx].imageUrl = e.target.value;
                        setCategories(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Target Link
                    </label>
                    <input
                      type="text"
                      value={cat.linkUrl}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[idx].linkUrl = e.target.value;
                        setCategories(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: HOW IT WORKS / PROCESS */}
        {/* ================================================================ */}
        {activeTab === "process" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Vendor Registration Process (4 Steps)
              </h2>
              <p className="text-xs text-slate-500">
                The 4 step sequential roadmap with numbered red badges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={formData.processBadge}
                  onChange={(e) => setFormData({ ...formData, processBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="HOW IT WORKS"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Title
                </label>
                <input
                  type="text"
                  value={formData.processTitle}
                  onChange={(e) => setFormData({ ...formData, processTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold"
                  placeholder="Vendor Registration Process"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formData.processSubtitle}
                  onChange={(e) => setFormData({ ...formData, processSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="Get registered in a few simple steps..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((st, idx) => (
                <div key={st.step || idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-[#dc2626] text-white font-black text-xs flex items-center justify-center">
                      {st.step}
                    </span>
                    <input
                      type="text"
                      value={st.step}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].step = e.target.value;
                        setSteps(updated);
                      }}
                      className="w-12 px-2 py-1 text-center bg-slate-50 rounded-md border border-slate-200 text-xs font-bold"
                      placeholder="01"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Step Title
                    </label>
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].title = e.target.value;
                        setSteps(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={st.description}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].description = e.target.value;
                        setSteps(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Icon Name
                    </label>
                    <input
                      type="text"
                      value={st.iconName}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].iconName = e.target.value;
                        setSteps(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-500"
                      placeholder="UserPlus, FileUp, CheckCircle, Award"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 5: VENDOR BENEFITS */}
        {/* ================================================================ */}
        {activeTab === "benefits" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Benefits for Our Vendors (6 Cards)</h2>
              <p className="text-xs text-slate-500">
                The 2x3 grid highlighting partnership perks
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={formData.benefitsBadge}
                  onChange={(e) => setFormData({ ...formData, benefitsBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="WHY PARTNER WITH US"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Title
                </label>
                <input
                  type="text"
                  value={formData.benefitsTitle}
                  onChange={(e) => setFormData({ ...formData, benefitsTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold"
                  placeholder="Benefits for Our Vendors"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formData.benefitsSubtitle}
                  onChange={(e) => setFormData({ ...formData, benefitsSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="We believe in long-term relationships..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, idx) => (
                <div key={b.id || idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-600 uppercase">
                      Benefit #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={b.title}
                      onChange={(e) => {
                        const updated = [...benefits];
                        updated[idx].title = e.target.value;
                        setBenefits(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={b.description}
                      onChange={(e) => {
                        const updated = [...benefits];
                        updated[idx].description = e.target.value;
                        setBenefits(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Icon Name
                    </label>
                    <input
                      type="text"
                      value={b.iconName}
                      onChange={(e) => {
                        const updated = [...benefits];
                        updated[idx].iconName = e.target.value;
                        setBenefits(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-500"
                      placeholder="Briefcase, ShieldCheck, IndianRupee..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 6: IMPACT CONTAINER */}
        {/* ================================================================ */}
        {activeTab === "impact" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Dark Impact Container (&quot;Building a Stronger Rajasthan Together&quot;)
              </h2>
              <p className="text-xs text-slate-500">
                Industrial crane skyline background, message, and 4 impact pillars
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={formData.impactBadge}
                  onChange={(e) => setFormData({ ...formData, impactBadge: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="OUR IMPACT"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.impactBtnText}
                  onChange={(e) => setFormData({ ...formData, impactBtnText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-red-600"
                  placeholder="Join Our Vendor Network"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Impact Title
                </label>
                <input
                  type="text"
                  value={formData.impactTitle}
                  onChange={(e) => setFormData({ ...formData, impactTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black"
                  placeholder="Building a Stronger Rajasthan Together"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Impact Subtitle
                </label>
                <textarea
                  rows={2}
                  value={formData.impactSubtitle}
                  onChange={(e) => setFormData({ ...formData, impactSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="Empowering local businesses, creating opportunities..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Skyline Background Image URL
                </label>
                <input
                  type="text"
                  value={formData.impactImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, impactImageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="/images/empanelment/impact-skyline.jpg"
                />
              </div>
            </div>

            {/* 4 Impact Pillars */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">4 Impact Pillars</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {impactPillars.map((p, idx) => (
                  <div key={p.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Pillar #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => {
                        const updated = [...impactPillars];
                        updated[idx].title = e.target.value;
                        setImpactPillars(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={p.iconName}
                      onChange={(e) => {
                        const updated = [...impactPillars];
                        updated[idx].iconName = e.target.value;
                        setImpactPillars(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-500"
                      placeholder="Icon: TrendingUp, Building..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 7: DOCUMENTS REQUIRED */}
        {/* ================================================================ */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Required Documents (Left Column)
              </h2>
              <p className="text-xs text-slate-500">
                The 6 document readiness cards shown next to the FAQ section
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={formData.docsBadge}
                  onChange={(e) => setFormData({ ...formData, docsBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="DOCUMENTS REQUIRED"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Title
                </label>
                <input
                  type="text"
                  value={formData.docsTitle}
                  onChange={(e) => setFormData({ ...formData, docsTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold"
                  placeholder="Get Ready for Registration"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formData.docsSubtitle}
                  onChange={(e) => setFormData({ ...formData, docsSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="Keep the following documents ready..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {docsList.map((doc, idx) => (
                <div key={doc.id || idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-600 uppercase">
                      Document #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={doc.title}
                      onChange={(e) => {
                        const updated = [...docsList];
                        updated[idx].title = e.target.value;
                        setDocsList(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Description / Note
                    </label>
                    <input
                      type="text"
                      value={doc.description}
                      onChange={(e) => {
                        const updated = [...docsList];
                        updated[idx].description = e.target.value;
                        setDocsList(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Icon Name
                    </label>
                    <input
                      type="text"
                      value={doc.iconName}
                      onChange={(e) => {
                        const updated = [...docsList];
                        updated[idx].iconName = e.target.value;
                        setDocsList(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-500"
                      placeholder="FileCheck, CreditCard, Building2, Briefcase..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 8: FAQS ACCORDION */}
        {/* ================================================================ */}
        {activeTab === "faqs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Quick Answers (FAQ Accordion)
                </h2>
                <p className="text-xs text-slate-500">
                  Manage common questions shown on the home page
                </p>
              </div>
              <button
                onClick={() => {
                  setFaqsList([
                    ...faqsList,
                    {
                      id: `f_${Date.now()}`,
                      question: "New Question?",
                      answer: "Provide clear answer here.",
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={formData.faqBadge}
                  onChange={(e) => setFormData({ ...formData, faqBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="FREQUENTLY ASKED QUESTIONS"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Title
                </label>
                <input
                  type="text"
                  value={formData.faqTitle}
                  onChange={(e) => setFormData({ ...formData, faqTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold"
                  placeholder="Quick Answers"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formData.faqSubtitle}
                  onChange={(e) => setFormData({ ...formData, faqSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
                  placeholder="Find answers to common questions about vendor registration..."
                />
              </div>
            </div>

            <div className="space-y-4">
              {faqsList.map((faq, idx) => (
                <div key={faq.id || idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      Question #{idx + 1}
                    </span>
                    <button
                      onClick={() => {
                        const updated = faqsList.filter((_, i) => i !== idx);
                        setFaqsList(updated);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const updated = [...faqsList];
                        updated[idx].question = e.target.value;
                        setFaqsList(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                      placeholder="Question text"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => {
                        const updated = [...faqsList];
                        updated[idx].answer = e.target.value;
                        setFaqsList(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed"
                      placeholder="Detailed answer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 9: RED CALLOUT BANNER */}
        {/* ================================================================ */}
        {activeTab === "banner" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Bottom Red Callout Banner
              </h2>
              <p className="text-xs text-slate-500">
                &quot;Let&apos;s Build a Stronger, Self-Reliant Rajasthan.&quot; full-width section
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50/50 p-6 rounded-2xl border border-red-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tagline Badge
                </label>
                <input
                  type="text"
                  value={formData.ctaBadge}
                  onChange={(e) => setFormData({ ...formData, ctaBadge: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  placeholder="BE A PART OF OUR JOURNEY"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Action Button Text (White Button)
                </label>
                <input
                  type="text"
                  value={formData.ctaBtnText}
                  onChange={(e) => setFormData({ ...formData, ctaBtnText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white"
                  placeholder="Register Now"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Banner Headline
                </label>
                <input
                  type="text"
                  value={formData.ctaTitle}
                  onChange={(e) => setFormData({ ...formData, ctaTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base font-black text-slate-900 bg-white"
                  placeholder="Let's Build a Stronger, Self-Reliant Rajasthan."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtitle Paragraph
                </label>
                <textarea
                  rows={2}
                  value={formData.ctaSubtitle}
                  onChange={(e) => setFormData({ ...formData, ctaSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  placeholder="Register as a vendor today and become a part of Hindustan Projects' growing network."
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 10: BRAND & COORDINATES */}
        {/* ================================================================ */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Brand & Contact Coordinates</h2>
              <p className="text-xs text-slate-500">
                Shown in the top header, footer, and automated procurement dispatch emails
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Portal Name
                </label>
                <input
                  type="text"
                  value={formData.portalName}
                  onChange={(e) => setFormData({ ...formData, portalName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  placeholder="Hindustan Projects"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="Engineering – Construction – Infrastructure"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Procurement Helpline Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Procurement Email Address
                </label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="procurement@hindustanprojects.in"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Official Office Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="Hindustan Projects, Bhilwara, Rajasthan, India"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={formData.supportWhatsapp}
                  onChange={(e) => setFormData({ ...formData, supportWhatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 11: GUIDELINES & CAPACITY TIERS */}
        {/* ================================================================ */}
        {activeTab === "guidelines" && (
          <div className="space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Guidelines & Contractor Capacity Standards CMS
              </h2>
              <p className="text-xs text-slate-500">
                Directly configure Class A–D turnover thresholds, statutory documents, and NBC 2016 safety norms displayed on the public Guidelines page.
              </p>
            </div>

            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={formData.guidelinesBadge}
                  onChange={(e) => setFormData({ ...formData, guidelinesBadge: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Title
                </label>
                <input
                  type="text"
                  value={formData.guidelinesTitle}
                  onChange={(e) => setFormData({ ...formData, guidelinesTitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtitle / Preamble
                </label>
                <textarea
                  rows={2}
                  value={formData.guidelinesSubtitle}
                  onChange={(e) => setFormData({ ...formData, guidelinesSubtitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            {/* Capacity Tiers (Class A, B, C, D) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Contractor Capacity Classes</h3>
                  <p className="text-xs text-slate-500">CPWD / HiPRO financial turnover & single order capacity brackets</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newTier: EmpanelmentTier = {
                      code: `CLASS_${String.fromCharCode(65 + guidelinesTiers.length)}`,
                      title: `Class '${String.fromCharCode(65 + guidelinesTiers.length)}' Contractor`,
                      turnover: "₹ 50 Lakhs+",
                      capacity: "Up to ₹ 1.00 Cr",
                      validity: "2 Years",
                      scope: "General construction and civil works.",
                    };
                    setGuidelinesTiers([...guidelinesTiers, newTier]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Class Tier
                </button>
              </div>

              <div className="space-y-4">
                {guidelinesTiers.map((tier, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 font-mono text-xs font-bold rounded">
                          {tier.code || `CLASS_${idx + 1}`}
                        </span>
                        <input
                          type="text"
                          value={tier.title}
                          onChange={(e) => {
                            const updated = [...guidelinesTiers];
                            updated[idx].title = e.target.value;
                            setGuidelinesTiers(updated);
                          }}
                          className="font-bold text-slate-900 text-sm border-b border-transparent hover:border-slate-300 focus:border-red-500 outline-none px-1"
                          placeholder="Class Title"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = guidelinesTiers.filter((_, i) => i !== idx);
                          setGuidelinesTiers(updated);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Code</label>
                        <input
                          type="text"
                          value={tier.code}
                          onChange={(e) => {
                            const updated = [...guidelinesTiers];
                            updated[idx].code = e.target.value;
                            setGuidelinesTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Annual Turnover</label>
                        <input
                          type="text"
                          value={tier.turnover}
                          onChange={(e) => {
                            const updated = [...guidelinesTiers];
                            updated[idx].turnover = e.target.value;
                            setGuidelinesTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Order Capacity</label>
                        <input
                          type="text"
                          value={tier.capacity}
                          onChange={(e) => {
                            const updated = [...guidelinesTiers];
                            updated[idx].capacity = e.target.value;
                            setGuidelinesTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Empanelment Validity</label>
                        <input
                          type="text"
                          value={tier.validity}
                          onChange={(e) => {
                            const updated = [...guidelinesTiers];
                            updated[idx].validity = e.target.value;
                            setGuidelinesTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Eligible Work Scope</label>
                      <textarea
                        rows={2}
                        value={tier.scope}
                        onChange={(e) => {
                          const updated = [...guidelinesTiers];
                          updated[idx].scope = e.target.value;
                          setGuidelinesTiers(updated);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Documents Checklist */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Statutory Documents Checklist</h3>
                  <p className="text-xs text-slate-500">Government compliance certificates required from applicants</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newDoc: EmpanelmentStatutoryDoc = {
                      id: `doc_${Date.now()}`,
                      title: "New Certificate",
                      authority: "Issuing Authority",
                      requiredFor: "All Entities",
                      desc: "Mandatory compliance certificate copy.",
                    };
                    setGuidelinesStatutoryDocs([...guidelinesStatutoryDocs, newDoc]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Document
                </button>
              </div>

              <div className="space-y-3">
                {guidelinesStatutoryDocs.map((doc, idx) => (
                  <div key={doc.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={doc.title}
                        onChange={(e) => {
                          const updated = [...guidelinesStatutoryDocs];
                          updated[idx].title = e.target.value;
                          setGuidelinesStatutoryDocs(updated);
                        }}
                        className="font-bold text-slate-900 text-sm flex-1 border-b border-transparent hover:border-slate-300 focus:border-red-500 outline-none"
                        placeholder="Document Title"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = guidelinesStatutoryDocs.filter((_, i) => i !== idx);
                          setGuidelinesStatutoryDocs(updated);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Issuing Authority</label>
                        <input
                          type="text"
                          value={doc.authority}
                          onChange={(e) => {
                            const updated = [...guidelinesStatutoryDocs];
                            updated[idx].authority = e.target.value;
                            setGuidelinesStatutoryDocs(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Applicable Classes</label>
                        <input
                          type="text"
                          value={doc.requiredFor}
                          onChange={(e) => {
                            const updated = [...guidelinesStatutoryDocs];
                            updated[idx].requiredFor = e.target.value;
                            setGuidelinesStatutoryDocs(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Requirement Note</label>
                        <input
                          type="text"
                          value={doc.desc}
                          onChange={(e) => {
                            const updated = [...guidelinesStatutoryDocs];
                            updated[idx].desc = e.target.value;
                            setGuidelinesStatutoryDocs(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & NBC 2016 Standards */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Safety & NBC 2016 Protocols</h3>
                  <p className="text-xs text-slate-500">On-site occupational safety and statutory insurance standards</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSafe: EmpanelmentSafetyStandard = {
                      id: `safe_${Date.now()}`,
                      title: "Site Safety Mandate",
                      codeRef: "NBC 2016 Standard",
                      desc: "Mandatory personal protective equipment and site safety compliance.",
                    };
                    setGuidelinesSafetyStandards([...guidelinesSafetyStandards, newSafe]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Safety Rule
                </button>
              </div>

              <div className="space-y-3">
                {guidelinesSafetyStandards.map((safe, idx) => (
                  <div key={safe.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={safe.title}
                        onChange={(e) => {
                          const updated = [...guidelinesSafetyStandards];
                          updated[idx].title = e.target.value;
                          setGuidelinesSafetyStandards(updated);
                        }}
                        className="font-bold text-slate-900 text-sm flex-1 border-b border-transparent hover:border-slate-300 focus:border-red-500 outline-none"
                        placeholder="Protocol Title"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = guidelinesSafetyStandards.filter((_, i) => i !== idx);
                          setGuidelinesSafetyStandards(updated);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Code Reference</label>
                        <input
                          type="text"
                          value={safe.codeRef}
                          onChange={(e) => {
                            const updated = [...guidelinesSafetyStandards];
                            updated[idx].codeRef = e.target.value;
                            setGuidelinesSafetyStandards(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Protocol Description</label>
                        <input
                          type="text"
                          value={safe.desc}
                          onChange={(e) => {
                            const updated = [...guidelinesSafetyStandards];
                            updated[idx].desc = e.target.value;
                            setGuidelinesSafetyStandards(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 12: TENDERS BULLETIN & GATE PASS POLICIES */}
        {/* ================================================================ */}
        {activeTab === "tenders_notice" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Tenders Notice Board & Site Gate Pass CMS
              </h2>
              <p className="text-xs text-slate-500">
                Manage the live procurement bulletin broadcasted to contractors, bidding instructions, and on-site gate pass safety rules.
              </p>
            </div>

            {/* Public Tenders Announcement Bulletin */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Live Tenders Notice Board Banner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Notice Badge
                  </label>
                  <input
                    type="text"
                    value={formData.tendersNoticeBadge}
                    onChange={(e) => setFormData({ ...formData, tendersNoticeBadge: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    value={formData.tendersNoticeTitle}
                    onChange={(e) => setFormData({ ...formData, tendersNoticeTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bulletin Text / Broadcast Message
                  </label>
                  <textarea
                    rows={3}
                    value={formData.tendersNoticeText || ""}
                    onChange={(e) => setFormData({ ...formData, tendersNoticeText: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                    placeholder="Broadcast notices, E-bidding timings, EMD guidelines..."
                  />
                </div>
              </div>
            </div>

            {/* Procurement Tender Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl border border-slate-200 bg-white">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tenders Helpline Phone
                </label>
                <input
                  type="text"
                  value={formData.tendersHelplinePhone || ""}
                  onChange={(e) => setFormData({ ...formData, tendersHelplinePhone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tenders Helpline Email
                </label>
                <input
                  type="text"
                  value={formData.tendersHelplineEmail || ""}
                  onChange={(e) => setFormData({ ...formData, tendersHelplineEmail: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="tenders@hindustanprojects.in"
                />
              </div>
            </div>

            {/* Site Gate Pass Policy & Terms */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Site Gate Pass Policies & Disclaimer</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Gate Pass Request Instructions (Shown on Form)
                </label>
                <textarea
                  rows={2}
                  value={formData.gatePassInstructions || ""}
                  onChange={(e) => setFormData({ ...formData, gatePassInstructions: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                  placeholder="Instructions for vehicle registration and personnel entry..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Gate Pass Safety Terms & Liability Disclaimer (Printed on Pass)
                </label>
                <textarea
                  rows={2}
                  value={formData.gatePassTerms || ""}
                  onChange={(e) => setFormData({ ...formData, gatePassTerms: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                  placeholder="Legal indemnity and on-site PPE compliance notice..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
