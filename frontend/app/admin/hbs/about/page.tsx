"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Plus,
  Trash2,
  Users,
  Target,
  Sparkles,
  Image as ImageIcon,
  ShieldCheck,
  Award,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import type { HbsContent } from "@/lib/types";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";

interface TeamMember {
  name: string;
  role: string;
  desc: string;
}

interface WhyChoosePoint {
  title: string;
  description: string;
  icon?: string;
}

interface KeyMetric {
  value: string;
  label: string;
  desc: string;
}

interface AboutCmsData {
  heroMode?: "SPLIT" | "IMAGE_ONLY";
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  storyTitle: string;
  storyImage: string;
  keyMetrics: KeyMetric[];
}

const DEFAULT_ABOUT_CMS_DATA: AboutCmsData = {
  heroMode: "SPLIT",
  heroBadge: "Specialized Division of Hindustan Projects (HiPRO)",
  heroTitle: "Engineering Heritage & About Hind Build",
  heroSubtitle:
    "Bridging the gap between unorganized local handymen and large-scale civil contractors with turnkey engineering discipline, non-destructive diagnostic testing, itemized BOQs, and written warranties across Rajasthan.",
  heroImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=1200&auto=format&fit=crop",
  storyTitle: "Why We Founded Hind Build",
  storyImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop",
  keyMetrics: [
    {
      value: "HiPRO",
      label: "Parent Oversight",
      desc: "Supervised under senior engineering governance and quality benchmarks.",
    },
    {
      value: "All Trades",
      label: "Turnkey Solutions",
      desc: "Single window accountability for waterproofing, cracks, and restoration.",
    },
    {
      value: "NDT First",
      label: "Diagnosis Origin",
      desc: "Electronic moisture scanners to identify root cause before treatment.",
    },
    {
      value: "Written",
      label: "Documented Warranty",
      desc: "Formal certificate issued with post-execution quality test sign-off.",
    },
  ],
};

const DEFAULT_WHY_CHOOSE_POINTS: WhyChoosePoint[] = [
  {
    title: "Parent Company Engineering Oversight",
    description: "Backed by Hindustan Projects (HiPRO) civil engineers and certified site supervisors.",
    icon: "ShieldCheck",
  },
  {
    title: "Non-Destructive Modern Diagnosis",
    description: "Advanced moisture meters and acoustic pipe leak scanners prevent unnecessary breaking.",
    icon: "Cpu",
  },
  {
    title: "Guaranteed Work & Verified Materials",
    description: "Only industrial-grade chemicals, certified sealants, and premium hardware used.",
    icon: "Award",
  },
  {
    title: "Rapid Turnaround Across Rajasthan",
    description: "Dedicated quick-response technicians stationed in Bhilwara and central regions.",
    icon: "Clock",
  },
];

export default function HbsAdminAbout() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [aboutData, setAboutData] = useState<AboutCmsData>(DEFAULT_ABOUT_CMS_DATA);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [whyChoose, setWhyChoose] = useState<WhyChoosePoint[]>(DEFAULT_WHY_CHOOSE_POINTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/content", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setContent(d);

        // Parse aboutImages (structured object or array fallback)
        try {
          if (d.aboutImages) {
            const raw = typeof d.aboutImages === "string" ? JSON.parse(d.aboutImages) : d.aboutImages;
            if (Array.isArray(raw)) {
              setAboutData({
                ...DEFAULT_ABOUT_CMS_DATA,
                heroImage: raw[0] || DEFAULT_ABOUT_CMS_DATA.heroImage,
                storyImage: raw[1] || DEFAULT_ABOUT_CMS_DATA.storyImage,
              });
            } else if (typeof raw === "object" && raw !== null) {
              setAboutData({
                ...DEFAULT_ABOUT_CMS_DATA,
                ...raw,
                heroMode: raw.heroMode === "IMAGE_ONLY" ? "IMAGE_ONLY" : "SPLIT",
                heroImage: raw.heroImage || DEFAULT_ABOUT_CMS_DATA.heroImage,
                storyImage: raw.storyImage || DEFAULT_ABOUT_CMS_DATA.storyImage,
                keyMetrics:
                  Array.isArray(raw.keyMetrics) && raw.keyMetrics.length > 0
                    ? raw.keyMetrics
                    : DEFAULT_ABOUT_CMS_DATA.keyMetrics,
              });
            }
          }
        } catch {
          setAboutData(DEFAULT_ABOUT_CMS_DATA);
        }

        // Parse Team
        try {
          if (d.team) {
            const t = typeof d.team === "string" ? JSON.parse(d.team) : d.team;
            if (Array.isArray(t) && t.length > 0) setTeam(t);
          }
        } catch {
          setTeam([]);
        }

        // Parse Why Choose / Core Principles
        try {
          const rawWhy = d.whyChoosePoints || d.whyChooseUs;
          if (rawWhy) {
            const parsedWhy = typeof rawWhy === "string" ? JSON.parse(rawWhy) : rawWhy;
            if (Array.isArray(parsedWhy) && parsedWhy.length > 0) setWhyChoose(parsedWhy);
          }
        } catch {
          setWhyChoose(DEFAULT_WHY_CHOOSE_POINTS);
        }
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

  const handleChange = (field: keyof HbsContent, value: any) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleAboutDataChange = (field: keyof AboutCmsData, value: any) => {
    setAboutData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMetricChange = (index: number, field: keyof KeyMetric, value: string) => {
    setAboutData((prev) => {
      const copy = [...prev.keyMetrics];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, keyMetrics: copy };
    });
  };

  // Team Handlers
  const handleTeamChange = (index: number, field: keyof TeamMember, val: string) => {
    setTeam((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addTeamMember = () => {
    setTeam((prev) => [
      ...prev,
      {
        name: "Technical Supervisor",
        role: "Certified Structural Specialist",
        desc: "Quality audits, on-site execution supervision, and warranty certification.",
      },
    ]);
  };

  const removeTeamMember = (index: number) => {
    setTeam((prev) => prev.filter((_, i) => i !== index));
  };

  // Why Choose Handlers
  const handleWhyChooseChange = (index: number, field: keyof WhyChoosePoint, val: string) => {
    setWhyChoose((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addWhyChoosePoint = () => {
    setWhyChoose((prev) => [
      ...prev,
      {
        title: "Engineering Excellence",
        description: "Certified civil engineering oversight with non-destructive verification standards.",
        icon: "ShieldCheck",
      },
    ]);
  };

  const removeWhyChoosePoint = (index: number) => {
    setWhyChoose((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    const payload = {
      ...content,
      aboutImages: JSON.stringify(aboutData),
      team: JSON.stringify(team),
      whyChoosePoints: JSON.stringify(whyChoose),
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
        setMessage({ text: "Hind Build About page saved successfully!", type: "success" });
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ paths: ["/hbs", "/hbs/about"], tags: ["hbs-content"] }),
          });
        } catch {}
      } else {
        setMessage({ text: json.error || "Failed to save about content.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
        <span className="text-xs uppercase tracking-wider font-mono">Loading About CMS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "About" }]}
        title="About Page CMS"
        description="Manage the light-themed Hero section, imagery, company heritage narrative, corporate mission/vision, guiding principles, and supervisory team structure."
      >
        <div className="flex items-center gap-2">
          <Link
            href="/hbs/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>Preview Page</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            onClick={loadData}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </div>
      </HbsAdminPageHeader>

      {message.text && (
        <div
          className={`p-4 text-xs flex items-center gap-2.5 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
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

      <form onSubmit={handleSave} className="space-y-8">
        {/* ── SECTION 1: HERO SECTION MANAGER (LIGHT MODERN THEME) ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>1. Hero Section (Light Architectural Layout)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configures the light-themed top hero banner with badge, headline, overview paragraph, and high-res image showcase.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Hero Top Badge
              </label>
              <input
                type="text"
                value={aboutData.heroBadge}
                onChange={(e) => handleAboutDataChange("heroBadge", e.target.value)}
                placeholder="Specialized Division of Hindustan Projects (HiPRO)"
                className="w-full text-xs font-medium border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Top pill badge shown above headline.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Hero Headline
              </label>
              <input
                type="text"
                value={aboutData.heroTitle}
                onChange={(e) => handleAboutDataChange("heroTitle", e.target.value)}
                placeholder="Engineering Heritage & About Hind Build"
                className="w-full text-xs font-bold border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Primary H1 headline on About page.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hero Overview Narrative
            </label>
            <textarea
              rows={3}
              value={aboutData.heroSubtitle}
              onChange={(e) => handleAboutDataChange("heroSubtitle", e.target.value)}
              placeholder="Bridging the gap between unorganized local handymen..."
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg leading-relaxed"
            />
          </div>

          {/* Hero Display Mode Toggle */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              Hero Layout Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAboutDataChange("heroMode", "SPLIT")}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  aboutData.heroMode !== "IMAGE_ONLY"
                    ? "border-amber-500 bg-amber-50/50 text-slate-950 shadow-xs ring-1 ring-amber-500"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Split Layout (Text + Photo)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Text narrative and CTAs on left + Photo card on right.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAboutDataChange("heroMode", "IMAGE_ONLY")}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  aboutData.heroMode === "IMAGE_ONLY"
                    ? "border-amber-500 bg-amber-50/50 text-slate-950 shadow-xs ring-1 ring-amber-500"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Full-Width Image Banner</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Headlines and CTAs at top + Single full-width architectural photo banner below.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Hero Single Image Uploader */}
          <div className="pt-2 border-t border-slate-100">
            <HbsImageUploader
              label="Hero Image"
              description="High-resolution site photo for the hero (displayed in Split mode or as Full-Width banner)"
              value={aboutData.heroImage}
              onChange={(url) => handleAboutDataChange("heroImage", url)}
              folder="hbs/about"
              recommendedSize="1200×800px or 1600×900px"
              aspectRatioHint="16:9"
              previewHeight="h-44"
            />
          </div>

          {/* Hero Fact Cards / Key Metrics */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              Hero 4-Key Metrics / Fact Badges
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {aboutData.keyMetrics.map((km, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Stat #{idx + 1} Value
                    </label>
                    <input
                      type="text"
                      value={km.value}
                      onChange={(e) => handleMetricChange(idx, "value", e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 p-1.5 bg-white rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Label
                    </label>
                    <input
                      type="text"
                      value={km.label}
                      onChange={(e) => handleMetricChange(idx, "label", e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-300 p-1.5 bg-white rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Description
                    </label>
                    <input
                      type="text"
                      value={km.desc}
                      onChange={(e) => handleMetricChange(idx, "desc", e.target.value)}
                      className="w-full text-[11px] border border-slate-300 p-1.5 bg-white rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 2: STORY & PHILOSOPHY ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span>2. Story & Foundation Narrative</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Detailed story of why Hind Build was founded, along with an accompanying on-site diagnostic photo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Story Section Headline
              </label>
              <input
                type="text"
                value={aboutData.storyTitle}
                onChange={(e) => handleAboutDataChange("storyTitle", e.target.value)}
                placeholder="Why We Founded Hind Build"
                className="w-full text-xs font-bold border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
              />
            </div>
            <div>
              <HbsImageUploader
                label="Story / Field Inspection Photo"
                description="Photo showing engineers or diagnostic equipment in action"
                value={aboutData.storyImage}
                onChange={(url) => handleAboutDataChange("storyImage", url)}
                folder="hbs/about"
                recommendedSize="1000×750px (4:3)"
                aspectRatioHint="4:3"
                previewHeight="h-32"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Foundation Story Text
            </label>
            <textarea
              rows={5}
              value={
                content.aboutStory ||
                "Hind Build was founded under Hindustan Projects (HiPRO) to bridge the massive gap between informal local handymen and large civil contractors. Modern buildings represent substantial investments, yet minor moisture ingress, foundation settlements, and electrical wear frequently turn into catastrophic structural hazards. Hind Build brings certified engineering discipline, non-destructive diagnosis, and turnkey accountability to building maintenance across Rajasthan."
              }
              onChange={(e) => handleChange("aboutStory", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg leading-relaxed"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Core narrative explaining our engineering origin, problem statement, and solution.
            </span>
          </div>
        </div>

        {/* ── SECTION 3: MISSION & VISION ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-600" />
              <span>3. Corporate Mission & Vision Statements</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Guiding institutional goals and long-term vision across Rajasthan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate Mission
              </label>
              <textarea
                rows={4}
                value={
                  content.mission ||
                  "To extend the functional life, aesthetic dignity, and structural safety of every residential, commercial, and industrial property through dependable, engineering-grade maintenance."
                }
                onChange={(e) => handleChange("mission", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate Vision
              </label>
              <textarea
                rows={4}
                value={
                  content.vision ||
                  "To be Rajasthan's most trusted single-window building maintenance and protection brand, synonymous with integrity, speed, and lasting craftsmanship."
                }
                onChange={(e) => handleChange("vision", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 4: CORE GUIDING PRINCIPLES (WHY CHOOSE) ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>4. Core Guiding Principles (Why Choose Hind Build)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Value proposition cards displayed in the principles grid.
              </p>
            </div>
            <button
              type="button"
              onClick={addWhyChoosePoint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors uppercase tracking-wider shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Principle</span>
            </button>
          </div>

          <div className="space-y-3">
            {whyChoose.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start group hover:border-slate-300 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 font-mono font-bold text-xs shrink-0 mt-1">
                  0{idx + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Principle Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleWhyChooseChange(idx, "title", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleWhyChooseChange(idx, "description", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeWhyChoosePoint(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors mt-2"
                  title="Remove principle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 5: SUPERVISORY & OPERATIONAL BACKBONE ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>5. Supervisory Structure & Operational Backbone</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Roles and divisions executing civil and maintenance supervision.
              </p>
            </div>
            <button
              type="button"
              onClick={addTeamMember}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors uppercase tracking-wider shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>

          <div className="space-y-3">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start group hover:border-slate-300 transition-colors"
              >
                <span className="font-mono text-xs font-bold text-slate-400 mt-2 shrink-0">
                  #{idx + 1}
                </span>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Division / Title
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleTeamChange(idx, "name", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Role / Certification
                    </label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleTeamChange(idx, "role", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Description / Responsibility
                    </label>
                    <input
                      type="text"
                      value={member.desc}
                      onChange={(e) => handleTeamChange(idx, "desc", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTeamMember(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors mt-2"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── ACTION FOOTER ── */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border shadow-lg z-20">
          <p className="text-xs text-slate-500">
            Changes will take effect instantly on <strong className="text-slate-800">/hbs/about</strong> after saving.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-950 hover:bg-slate-850 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
