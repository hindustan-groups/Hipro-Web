"use client";

import { useEffect, useState, useRef } from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowUpRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ShieldCheck,
  Building2,
  Layers,
  MapPin,
  Search,
  ExternalLink,
  Undo2,
  UploadCloud,
  X,
  FileText
} from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";
import type {
  AboutPageContent,
  AboutHighlightItem,
  AboutFactItem,
  AboutPrincipleItem,
  AboutStageItem,
  AboutSectorItem,
  AboutQualityItem
} from "@/lib/types";
import { ABOUT_PAGE_DATA, COMPANY_INFO } from "@/lib/companyData";

const VERIFIED_SERVICES = [
  { name: "Architecture & Planning", slug: "architecture-planning" },
  { name: "Professional Construction Services", slug: "professional-construction-services" },
  { name: "Surveying & Site Measurements", slug: "surveying-site-measurements" },
  { name: "Interior & Exterior Design", slug: "interior-exterior-design" },
  { name: "Water Treatment Plant Construction", slug: "water-treatment-plant-construction" },
  { name: "Project Management & Consultancy", slug: "project-management-consultancy" },
];

function safeParseJson<T>(raw: any, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === "object") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "profile" | "workflow" | "quality" | "seo">("hero");

  // Form state initialized with verified defaults
  const [form, setForm] = useState<AboutPageContent>({
    status: "published",
    heroBadge: ABOUT_PAGE_DATA.hero.badge,
    heroHeadingPrefix: ABOUT_PAGE_DATA.hero.headingPrefix,
    heroHeadingAccent: ABOUT_PAGE_DATA.hero.headingAccent,
    heroHeadingSuffix: ABOUT_PAGE_DATA.hero.headingSuffix,
    heroDescription: ABOUT_PAGE_DATA.hero.description,
    heroHighlights: ABOUT_PAGE_DATA.hero.operationalHighlights,
    heroPrimaryCtaText: "Explore Capabilities",
    heroSecondaryCtaText: "Estimate Build Cost",
    executiveBadge: ABOUT_PAGE_DATA.executiveStatement.badge,
    executiveTitle: ABOUT_PAGE_DATA.executiveStatement.title,
    executiveStatement: ABOUT_PAGE_DATA.executiveStatement.statement,
    founderImage: null,
    founderImageAlt: "Yogesh Kharol, Founder & Director",
    companyFacts: ABOUT_PAGE_DATA.companyAtAGlance,
    missionTag: ABOUT_PAGE_DATA.missionVision.mission.tag,
    missionTitle: ABOUT_PAGE_DATA.missionVision.mission.title,
    missionDescription: ABOUT_PAGE_DATA.missionVision.mission.description,
    visionTag: ABOUT_PAGE_DATA.missionVision.vision.tag,
    visionTitle: ABOUT_PAGE_DATA.missionVision.vision.title,
    visionDescription: ABOUT_PAGE_DATA.missionVision.vision.description,
    engineeringPrinciples: ABOUT_PAGE_DATA.missionVision.principles,
    executionStages: ABOUT_PAGE_DATA.executionStages,
    capabilitiesSectors: ABOUT_PAGE_DATA.capabilitiesAndSectors,
    qualityHeading: ABOUT_PAGE_DATA.qualityCommitment ? "Committed to Quality & Responsible Engineering" : "",
    qualitySubtitle: "Every building represents significant capital investment and enduring responsibility. We approach each phase with disciplined site supervision and transparent coordination.",
    qualityCommitments: ABOUT_PAGE_DATA.qualityCommitment,
    regionalHeading: ABOUT_PAGE_DATA.regionalFocus.city ? "Headquartered in Bhilwara. Serving Rajasthan." : "",
    regionalDescription: ABOUT_PAGE_DATA.regionalFocus.description,
    regionalBullets: [
      "Familiarity with regional soil profiles, structural foundation needs, and Rajasthan climate conditions.",
      "Active coordination with local municipal sanction processes and statutory setback guidelines.",
      "Direct access to regional stone, masonry, cement, and steel supply chains for predictable project procurement.",
    ],
    metaTitle: "About Us | Hindustan Projects (HiPRO) — Engineering & Construction",
    metaDescription: "Hindustan Projects (HiPRO) is an engineering, turnkey construction, and infrastructure firm headquartered in Bhilwara, Rajasthan. Delivering disciplined civil execution, architectural planning, and precision surveying since 2019.",
    canonicalUrl: "/about",
    targetLocation: "Bhilwara, Rajasthan",
    geoKeywords: "construction company Bhilwara, civil engineering Rajasthan, turnkey construction Mewar",
    ogTitle: "About Us | Hindustan Projects (HiPRO) — Engineering & Construction",
    ogDescription: "Engineering, turnkey civil construction, and infrastructure solutions based in Bhilwara, Rajasthan.",
    ogImage: "/logo.jpg",
    twitterTitle: "About Us | Hindustan Projects (HiPRO) — Engineering & Construction",
    twitterDescription: "Engineering, turnkey civil construction, and infrastructure solutions based in Bhilwara, Rajasthan.",
    twitterImage: "/logo.jpg",
  });

  // Track initial state to restore on discard
  const savedStateRef = useRef<AboutPageContent | null>(null);

  // Fetch current CMS content (using ?preview=true so admins get current draft if any)
  useEffect(() => {
    fetch("/api/about?preview=true")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          const parsedForm: AboutPageContent = {
            ...d,
            heroHighlights: safeParseJson<AboutHighlightItem[]>(d.heroHighlights, ABOUT_PAGE_DATA.hero.operationalHighlights),
            executiveStatement: safeParseJson<string[]>(d.executiveStatement, ABOUT_PAGE_DATA.executiveStatement.statement),
            companyFacts: safeParseJson<AboutFactItem[]>(d.companyFacts, ABOUT_PAGE_DATA.companyAtAGlance),
            engineeringPrinciples: safeParseJson<AboutPrincipleItem[]>(d.engineeringPrinciples, ABOUT_PAGE_DATA.missionVision.principles),
            executionStages: safeParseJson<AboutStageItem[]>(d.executionStages, ABOUT_PAGE_DATA.executionStages),
            capabilitiesSectors: safeParseJson<AboutSectorItem[]>(d.capabilitiesSectors, ABOUT_PAGE_DATA.capabilitiesAndSectors),
            qualityCommitments: safeParseJson<AboutQualityItem[]>(d.qualityCommitments, ABOUT_PAGE_DATA.qualityCommitment),
            regionalBullets: safeParseJson<string[]>(d.regionalBullets, [
              "Familiarity with regional soil profiles, structural foundation needs, and Rajasthan climate conditions.",
              "Active coordination with local municipal sanction processes and statutory setback guidelines.",
              "Direct access to regional stone, masonry, cement, and steel supply chains for predictable project procurement.",
            ]),
          };
          setForm(parsedForm);
          savedStateRef.current = JSON.parse(JSON.stringify(parsedForm));
          if (d.updatedAt) {
            setLastSavedTime(new Date(d.updatedAt).toLocaleTimeString());
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch about CMS data:", err);
        setLoading(false);
      });
  }, []);

  // Warn on accidental navigation if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const updateField = <K extends keyof AboutPageContent>(field: K, value: AboutPageContent[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (targetStatus?: "draft" | "published" | "unpublished") => {
    setSaving(true);
    setStatusMessage({ text: "", type: "" });

    const newStatus = targetStatus || form.status || "published";

    // Prepare payload with properly serialized JSON arrays
    const payload = {
      ...form,
      status: newStatus,
      heroHighlights: JSON.stringify(form.heroHighlights),
      executiveStatement: JSON.stringify(form.executiveStatement),
      companyFacts: JSON.stringify(form.companyFacts),
      engineeringPrinciples: JSON.stringify(form.engineeringPrinciples),
      executionStages: JSON.stringify(form.executionStages),
      capabilitiesSectors: JSON.stringify(form.capabilitiesSectors),
      qualityCommitments: JSON.stringify(form.qualityCommitments),
      regionalBullets: JSON.stringify(form.regionalBullets),
    };

    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setForm((prev) => ({ ...prev, status: newStatus }));
        savedStateRef.current = JSON.parse(JSON.stringify({ ...form, status: newStatus }));
        setHasUnsavedChanges(false);
        setLastSavedTime(new Date().toLocaleTimeString());
        setStatusMessage({
          text: newStatus === "published" ? "About Page published successfully!" : "Draft saved successfully.",
          type: "success",
        });

        // Trigger on-demand ISR revalidation for /about
        if (newStatus === "published") {
          try {
            await fetch("/api/revalidate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tag: "about" }),
            });
          } catch {
            /* silent fallback */
          }
        }
      } else {
        setStatusMessage({ text: data.error || "Failed to save content.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Network error occurred while saving.", type: "error" });
    }
    setSaving(false);
    setTimeout(() => setStatusMessage({ text: "", type: "" }), 5000);
  };

  const handleDiscard = () => {
    if (savedStateRef.current && confirm("Discard all unsaved changes and reload last saved version?")) {
      setForm(JSON.parse(JSON.stringify(savedStateRef.current)));
      setHasUnsavedChanges(false);
      setStatusMessage({ text: "Unsaved changes discarded.", type: "success" });
      setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 font-medium">
        <Loader2 className="w-6 h-6 animate-spin mr-3 text-construction-navy" />
        Loading About Page CMS...
      </div>
    );
  }

  const highlights = (form.heroHighlights as AboutHighlightItem[]) || [];
  const execParagraphs = (form.executiveStatement as string[]) || [];
  const facts = (form.companyFacts as AboutFactItem[]) || [];
  const principles = (form.engineeringPrinciples as AboutPrincipleItem[]) || [];
  const stages = (form.executionStages as AboutStageItem[]) || [];
  const sectors = (form.capabilitiesSectors as AboutSectorItem[]) || [];
  const qualityItems = (form.qualityCommitments as AboutQualityItem[]) || [];
  const bullets = (form.regionalBullets as string[]) || [];

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* ── Top Header & Actions Bar ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 font-display uppercase tracking-tight">
              About Page CMS
            </h1>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border ${
                form.status === "published"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {form.status === "published" ? "Published" : "Draft"}
            </span>
            {hasUnsavedChanges && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
                ● Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage public About Page content, leadership statements, workflows, and SEO metadata.
            {lastSavedTime && <span className="ml-2 font-mono">Last saved: {lastSavedTime}</span>}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <Undo2 className="w-3.5 h-3.5" /> Discard
            </button>
          )}

          <a
            href="/about?preview=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" /> Live Preview <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-widest bg-construction-navy hover:bg-slate-900 text-white transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Publish Live
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage.text && (
        <div
          className={`p-4 mb-6 border text-sm flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
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

      {/* ── Tabs Navigation ─────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 mb-8 bg-white overflow-x-auto shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "hero"
              ? "border-construction-navy text-construction-navy bg-slate-50/50"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4" /> 1. Hero &amp; Leadership
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "profile"
              ? "border-construction-navy text-construction-navy bg-slate-50/50"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4" /> 2. Profile &amp; Principles
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("workflow")}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "workflow"
              ? "border-construction-navy text-construction-navy bg-slate-50/50"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" /> 3. Workflow &amp; Sectors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("quality")}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "quality"
              ? "border-construction-navy text-construction-navy bg-slate-50/50"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <MapPin className="w-4 h-4" /> 4. Quality &amp; Regional
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "seo"
              ? "border-construction-navy text-construction-navy bg-slate-50/50"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Search className="w-4 h-4" /> 5. SEO &amp; Social
        </button>
      </div>

      {/* ── TAB 1: HERO & LEADERSHIP ────────────────────────────────────────── */}
      {activeTab === "hero" && (
        <div className="space-y-8">
          {/* Hero Section Card */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-construction-navy" /> Hero Configuration
            </h2>
            <div className="grid gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Hero Tagline Badge
                </label>
                <input
                  type="text"
                  value={form.heroBadge || ""}
                  onChange={(e) => updateField("heroBadge", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-none focus:outline-none focus:border-construction-navy"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Heading Prefix (Black)
                  </label>
                  <input
                    type="text"
                    value={form.heroHeadingPrefix || ""}
                    onChange={(e) => updateField("heroHeadingPrefix", e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-none focus:outline-none focus:border-construction-navy font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Accent Word (Italic Red Serif)
                  </label>
                  <input
                    type="text"
                    value={form.heroHeadingAccent || ""}
                    onChange={(e) => updateField("heroHeadingAccent", e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-none focus:outline-none focus:border-construction-navy text-construction-red font-serif italic"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Heading Suffix (Black)
                  </label>
                  <input
                    type="text"
                    value={form.heroHeadingSuffix || ""}
                    onChange={(e) => updateField("heroHeadingSuffix", e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-none focus:outline-none focus:border-construction-navy font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Hero Authoritative Narrative
                </label>
                <textarea
                  rows={3}
                  value={form.heroDescription || ""}
                  onChange={(e) => updateField("heroDescription", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-none focus:outline-none focus:border-construction-navy"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Primary CTA Label (Links to /services)
                  </label>
                  <input
                    type="text"
                    value={form.heroPrimaryCtaText || ""}
                    onChange={(e) => updateField("heroPrimaryCtaText", e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Secondary CTA Label (Links to /cost-estimator)
                  </label>
                  <input
                    type="text"
                    value={form.heroSecondaryCtaText || ""}
                    onChange={(e) => updateField("heroSecondaryCtaText", e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4 Hero Operational Highlights */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              Operational Fact Highlights (4 Cards)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Only enter verified facts. Do NOT input unverified project counts (e.g. 150+) or arbitrary statistics.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {highlights.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block mb-1">Card 0{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Label (e.g. Established)"
                    value={item.label}
                    onChange={(e) => {
                      const copy = [...highlights];
                      copy[idx] = { ...copy[idx], label: e.target.value };
                      updateField("heroHighlights", copy);
                    }}
                    className="w-full text-xs font-bold uppercase tracking-wider mb-2 px-2.5 py-1.5 border border-slate-300 rounded-none"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 2019)"
                    value={item.value}
                    onChange={(e) => {
                      const copy = [...highlights];
                      copy[idx] = { ...copy[idx], value: e.target.value };
                      updateField("heroHighlights", copy);
                    }}
                    className="w-full text-sm font-bold text-slate-900 px-2.5 py-1.5 border border-slate-300 rounded-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Executive Leadership Spotlight */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              Executive Statement &amp; Founder Portrait
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Leader identity is code-grounded to <strong>Yogesh Kharol (Founder &amp; Director)</strong>. Photo is optional; if none is uploaded, the public page renders the verified architectural monogram crest.
            </p>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Image Upload Column */}
              <div className="lg:col-span-4 bg-slate-50 p-5 border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Founder Portrait Photo
                </label>
                {form.founderImage ? (
                  <div className="relative mb-3">
                    <div className="relative w-full h-64 border border-slate-300 overflow-hidden">
                      <Image
                        src={form.founderImage}
                        alt={form.founderImageAlt || "Yogesh Kharol"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField("founderImage", null)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 shadow-md hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-44 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-4 mb-3 text-center">
                    <Building2 className="w-8 h-8 mb-2 text-slate-300" />
                    <span className="text-xs font-medium text-slate-500">No portrait photo uploaded</span>
                    <span className="text-[10px] text-slate-400 mt-1">Monogram crest active as fallback</span>
                  </div>
                )}
                <ImageUpload
                  value={form.founderImage || ""}
                  onChange={(url) => updateField("founderImage", url)}
                />
                <input
                  type="text"
                  placeholder="Image Alt Text"
                  value={form.founderImageAlt || ""}
                  onChange={(e) => updateField("founderImageAlt", e.target.value)}
                  className="w-full text-xs px-3 py-1.5 mt-2 border border-slate-300"
                />
              </div>

              {/* Leadership Copy Column */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Section Tagline
                  </label>
                  <input
                    type="text"
                    value={form.executiveBadge || ""}
                    onChange={(e) => updateField("executiveBadge", e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Executive Statement Title
                  </label>
                  <input
                    type="text"
                    value={form.executiveTitle || ""}
                    onChange={(e) => updateField("executiveTitle", e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Statement Paragraphs (One per paragraph)
                  </label>
                  <div className="space-y-3">
                    {execParagraphs.map((para, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <textarea
                          rows={2}
                          value={para}
                          onChange={(e) => {
                            const copy = [...execParagraphs];
                            copy[idx] = e.target.value;
                            updateField("executiveStatement", copy);
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-none"
                        />
                        {execParagraphs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = execParagraphs.filter((_, i) => i !== idx);
                              updateField("executiveStatement", copy);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 border border-slate-200"
                            title="Remove paragraph"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateField("executiveStatement", [...execParagraphs, ""])}
                      className="text-xs font-bold uppercase tracking-wider text-construction-navy hover:text-construction-red flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Another Paragraph
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PROFILE & PRINCIPLES ──────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          {/* Company At A Glance Specification Sheet */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              Company At A Glance (8 Specification Rows)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Row labels are structurally fixed to maintain the corporate specification sheet format. Values are editable.
            </p>

            <div className="divide-y divide-slate-200 border border-slate-200">
              {facts.map((item, idx) => (
                <div key={idx} className="p-4 grid sm:grid-cols-3 gap-4 items-center bg-white hover:bg-slate-50">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{item.label}</span>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        const copy = [...facts];
                        copy[idx] = { ...copy[idx], value: e.target.value };
                        updateField("companyFacts", copy);
                      }}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-none font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission & Vision Side-by-Side Cards */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-6">
              Mission &amp; Vision Configuration
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Mission Card */}
              <div className="p-6 bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-construction-red block mb-3">
                  Corporate Mission
                </span>
                <input
                  type="text"
                  placeholder="Mission Title"
                  value={form.missionTitle || ""}
                  onChange={(e) => updateField("missionTitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-none mb-3"
                />
                <textarea
                  rows={4}
                  placeholder="Mission Statement"
                  value={form.missionDescription || ""}
                  onChange={(e) => updateField("missionDescription", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none"
                />
              </div>

              {/* Vision Card */}
              <div className="p-6 bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-construction-navy block mb-3">
                  Corporate Vision
                </span>
                <input
                  type="text"
                  placeholder="Vision Title"
                  value={form.visionTitle || ""}
                  onChange={(e) => updateField("visionTitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-none mb-3"
                />
                <textarea
                  rows={4}
                  placeholder="Vision Statement"
                  value={form.visionDescription || ""}
                  onChange={(e) => updateField("visionDescription", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none"
                />
              </div>
            </div>
          </div>

          {/* Core Engineering Principles */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight">
                  Core Engineering Principles (Maximum 6)
                </h2>
                <p className="text-xs text-slate-500">
                  Ground principles in responsible engineering, site supervision, and transparent communication.
                </p>
              </div>
              {principles.length < 6 && (
                <button
                  type="button"
                  onClick={() =>
                    updateField("engineeringPrinciples", [
                      ...principles,
                      { title: "New Principle", desc: "Description of the engineering standard." },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Principle
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {principles.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 font-mono text-xs font-bold text-construction-navy">
                        0{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...principles];
                              const temp = copy[idx];
                              copy[idx] = copy[idx - 1];
                              copy[idx - 1] = temp;
                              updateField("engineeringPrinciples", copy);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {idx < principles.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...principles];
                              const temp = copy[idx];
                              copy[idx] = copy[idx + 1];
                              copy[idx + 1] = temp;
                              updateField("engineeringPrinciples", copy);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const copy = principles.filter((_, i) => i !== idx);
                            updateField("engineeringPrinciples", copy);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Title (Max 40 chars)"
                      maxLength={45}
                      value={item.title}
                      onChange={(e) => {
                        const copy = [...principles];
                        copy[idx] = { ...copy[idx], title: e.target.value };
                        updateField("engineeringPrinciples", copy);
                      }}
                      className="w-full text-xs font-bold uppercase tracking-wider mb-2 px-2.5 py-1.5 border border-slate-300 rounded-none"
                    />

                    <textarea
                      rows={3}
                      placeholder="Description (Max 160 chars)"
                      maxLength={180}
                      value={item.desc}
                      onChange={(e) => {
                        const copy = [...principles];
                        copy[idx] = { ...copy[idx], desc: e.target.value };
                        updateField("engineeringPrinciples", copy);
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: WORKFLOW & SECTORS ────────────────────────────────────────── */}
      {activeTab === "workflow" && (
        <div className="space-y-8">
          {/* 4 Execution Stages */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              4-Stage Project Lifecycle Workflow
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Service links are constrained to verified routes to prevent broken link generation.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stages.map((stage, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                      <span className="text-xl font-bold font-display text-construction-red">0{idx + 1}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Phase {idx + 1}
                      </span>
                    </div>

                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Stage Title
                    </label>
                    <input
                      type="text"
                      value={stage.title}
                      onChange={(e) => {
                        const copy = [...stages];
                        copy[idx] = { ...copy[idx], title: e.target.value };
                        updateField("executionStages", copy);
                      }}
                      className="w-full text-xs font-bold mb-3 px-2.5 py-1.5 border border-slate-300 rounded-none"
                    />

                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={stage.desc}
                      onChange={(e) => {
                        const copy = [...stages];
                        copy[idx] = { ...copy[idx], desc: e.target.value };
                        updateField("executionStages", copy);
                      }}
                      className="w-full text-xs mb-3 px-2.5 py-1.5 border border-slate-300 rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Linked Verified Service
                    </label>
                    <select
                      value={stage.serviceSlug}
                      onChange={(e) => {
                        const selected = VERIFIED_SERVICES.find((s) => s.slug === e.target.value);
                        const copy = [...stages];
                        copy[idx] = {
                          ...copy[idx],
                          serviceSlug: e.target.value,
                          serviceName: selected?.name || stage.serviceName,
                        };
                        updateField("executionStages", copy);
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-none bg-white font-medium"
                    >
                      {VERIFIED_SERVICES.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities & Sector Quadrants */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              Capabilities &amp; Sectors (4 Quadrants)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Configure the project sectors and map them to verified services.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {sectors.map((sector, idx) => (
                <div key={idx} className="p-6 bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-construction-red">SECTOR 0{idx + 1}</span>
                  </div>

                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Sector Name
                  </label>
                  <input
                    type="text"
                    value={sector.sector}
                    onChange={(e) => {
                      const copy = [...sectors];
                      copy[idx] = { ...copy[idx], sector: e.target.value };
                      updateField("capabilitiesSectors", copy);
                    }}
                    className="w-full text-sm font-bold mb-3 px-3 py-1.5 border border-slate-300 rounded-none"
                  />

                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={sector.description}
                    onChange={(e) => {
                      const copy = [...sectors];
                      copy[idx] = { ...copy[idx], description: e.target.value };
                      updateField("capabilitiesSectors", copy);
                    }}
                    className="w-full text-xs mb-3 px-3 py-1.5 border border-slate-300 rounded-none"
                  />

                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Primary Service Page Link
                  </label>
                  <select
                    value={sector.primarySlug}
                    onChange={(e) => {
                      const copy = [...sectors];
                      copy[idx] = { ...copy[idx], primarySlug: e.target.value };
                      updateField("capabilitiesSectors", copy);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-none bg-white font-medium mb-3"
                  >
                    {VERIFIED_SERVICES.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Service Badges Included
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VERIFIED_SERVICES.map((s) => {
                      const isIncluded = sector.services.includes(s.name);
                      return (
                        <button
                          key={s.slug}
                          type="button"
                          onClick={() => {
                            const copy = [...sectors];
                            const currentServices = copy[idx].services || [];
                            const updatedServices = isIncluded
                              ? currentServices.filter((name) => name !== s.name)
                              : [...currentServices, s.name];
                            copy[idx] = { ...copy[idx], services: updatedServices };
                            updateField("capabilitiesSectors", copy);
                          }}
                          className={`text-[10px] font-bold px-2.5 py-1 border transition-colors ${
                            isIncluded
                              ? "bg-construction-navy text-white border-construction-navy"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {isIncluded ? "✓ " : "+ "}
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: QUALITY & REGIONAL ────────────────────────────────────────── */}
      {activeTab === "quality" && (
        <div className="space-y-8">
          {/* Quality Commitments (Dark Navy Section on Public) */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              Quality &amp; Responsible Execution Section
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Renders as the high-contrast Dark Navy (#091D36) section on the public About page.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={form.qualityHeading || ""}
                  onChange={(e) => updateField("qualityHeading", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Section Subtitle
                </label>
                <textarea
                  rows={2}
                  value={form.qualitySubtitle || ""}
                  onChange={(e) => updateField("qualitySubtitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {qualityItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-900 text-white border border-slate-800">
                  <span className="text-xs font-mono font-bold text-construction-red block mb-2">0{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Commitment Title"
                    value={item.title}
                    onChange={(e) => {
                      const copy = [...qualityItems];
                      copy[idx] = { ...copy[idx], title: e.target.value };
                      updateField("qualityCommitments", copy);
                    }}
                    className="w-full text-xs font-bold uppercase tracking-wider mb-2 px-2.5 py-1.5 bg-white/10 border border-white/20 text-white rounded-none"
                  />
                  <textarea
                    rows={4}
                    placeholder="Description"
                    value={item.desc}
                    onChange={(e) => {
                      const copy = [...qualityItems];
                      copy[idx] = { ...copy[idx], desc: e.target.value };
                      updateField("qualityCommitments", copy);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 bg-white/10 border border-white/20 text-slate-200 rounded-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Regional Focus: Bhilwara & Rajasthan */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              Regional Focus Configuration (Bhilwara HQ)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Highlight local authority and regional soil/climate familiarity.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Regional Section Heading
                </label>
                <input
                  type="text"
                  value={form.regionalHeading || ""}
                  onChange={(e) => updateField("regionalHeading", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Regional Narrative Paragraph
                </label>
                <textarea
                  rows={3}
                  value={form.regionalDescription || ""}
                  onChange={(e) => updateField("regionalDescription", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  3 Local Authority Bullet Points
                </label>
                <div className="space-y-2.5">
                  {bullets.map((bullet, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="w-5 h-5 flex items-center justify-center bg-slate-100 text-construction-navy text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const copy = [...bullets];
                          copy[idx] = e.target.value;
                          updateField("regionalBullets", copy);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 mt-4 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <strong>Head Office Address &amp; Contact:</strong> Pulled dynamically from{" "}
                  <code className="text-construction-navy font-bold">Settings &gt; Global Info</code> to prevent redundant duplicate inputs.
                </div>
                <span className="font-semibold text-slate-700">{COMPANY_INFO.address}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: SEO & SOCIAL ─────────────────────────────────────────────── */}
      {activeTab === "seo" && (
        <div className="space-y-8">
          {/* SERP Search Preview */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              Google Search Snippet Preview
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Real-time simulation of how the About Page appears in search engine results.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 max-w-2xl font-sans">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-1">
                <span>https://www.hindustanprojects.in</span>
                <span className="text-slate-400">› about</span>
              </div>
              <h3 className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer line-clamp-1">
                {form.metaTitle || "About Us | Hindustan Projects (HiPRO) — Engineering & Construction"}
              </h3>
              <p className="text-xs text-[#4d5156] line-clamp-2 mt-1 leading-normal">
                {form.metaDescription ||
                  "Hindustan Projects (HiPRO) delivers comprehensive civil engineering, turnkey construction, and infrastructure solutions..."}
              </p>
            </div>
          </div>

          {/* Meta Inputs */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-4">
              Page Metadata Settings
            </h2>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">SEO Meta Title</label>
                  <span className={`text-[10px] font-mono ${((form.metaTitle || "").length > 60) ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                    {(form.metaTitle || "").length} / 60 recommended
                  </span>
                </div>
                <input
                  type="text"
                  value={form.metaTitle || ""}
                  onChange={(e) => updateField("metaTitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">SEO Meta Description</label>
                  <span className={`text-[10px] font-mono ${((form.metaDescription || "").length > 160) ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                    {(form.metaDescription || "").length} / 160 recommended
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={form.metaDescription || ""}
                  onChange={(e) => updateField("metaDescription", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={form.canonicalUrl || "/about"}
                    onChange={(e) => updateField("canonicalUrl", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-none font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Target Primary Location
                  </label>
                  <input
                    type="text"
                    value={form.targetLocation || "Bhilwara, Rajasthan"}
                    onChange={(e) => updateField("targetLocation", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Local / GEO Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={form.geoKeywords || ""}
                  onChange={(e) => updateField("geoKeywords", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* OpenGraph & Social Media Share */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-4">
              Social Media Card Sharing (OpenGraph &amp; Twitter)
            </h2>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 bg-slate-50 p-4 border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Social Share Image (1200 x 630px)
                </label>
                {form.ogImage ? (
                  <div className="relative mb-3">
                    <div className="relative w-full h-36 border border-slate-300 overflow-hidden">
                      <Image
                        src={form.ogImage}
                        alt="Social Share Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField("ogImage", "/logo.jpg")}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 text-xs"
                      title="Reset to default logo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-28 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs mb-3">
                    No custom OG image
                  </div>
                )}
                <ImageUpload
                  value={form.ogImage || ""}
                  onChange={(url) => {
                    updateField("ogImage", url);
                    updateField("twitterImage", url);
                  }}
                />
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    OpenGraph Title
                  </label>
                  <input
                    type="text"
                    value={form.ogTitle || ""}
                    onChange={(e) => {
                      updateField("ogTitle", e.target.value);
                      updateField("twitterTitle", e.target.value);
                    }}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    OpenGraph Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.ogDescription || ""}
                    onChange={(e) => {
                      updateField("ogDescription", e.target.value);
                      updateField("twitterDescription", e.target.value);
                    }}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
