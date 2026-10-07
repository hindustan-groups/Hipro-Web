"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  LayoutTemplate,
  BarChart3,
  ShieldCheck,
  Building2,
  Plus,
  Trash2,
  Users,
  Award,
  Clock,
  ExternalLink,
  Phone,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  Wrench,
  Check,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import type { HbsContent, HbsHeroConfig } from "@/lib/types";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";

interface StatItem {
  value: string;
  label: string;
}

interface BenefitItem {
  icon: string;
  title: string;
  desc: string;
}

interface AboutStorySection {
  badge: string;
  title: string;
  description: string;
  features: string[];
}

const DEFAULT_HERO_CONFIG: HbsHeroConfig = {
  enabled: true,
  displayMode: "TEXT_AND_IMAGE",
  badge: "COMPLETE CARE FOR YOUR BUILDING",
  headline: "Repair. Protect.\nMaintain. Build Better.",
  subheadline:
    "Hind Building Solutions (HiBUILD) provides professional building repair, waterproofing, painting, plumbing, electrical, renovation and all maintenance services for homes, apartments, offices and commercial buildings.",
  primaryCtaLabel: "Get a Free Site Visit",
  primaryCtaUrl: "/contact",
  secondaryCtaLabel: "Our Services",
  secondaryCtaUrl: "/services",
  heroImage: "/hibuild-hero-full.png",
};

const DEFAULT_STATS: StatItem[] = [
  { value: "8+", label: "Years Experience" },
  { value: "500+", label: "Projects Completed" },
  { value: "1000+", label: "Happy Clients" },
  { value: "50+", label: "Expert Team Members" },
];

const DEFAULT_BENEFITS: BenefitItem[] = [
  {
    icon: "Users",
    title: "Skilled Professionals",
    desc: "Trained & background-verified technicians",
  },
  {
    icon: "Award",
    title: "Quality Materials",
    desc: "Branded ISI-grade products with warranty",
  },
  {
    icon: "Clock",
    title: "On-Time Delivery",
    desc: "Strict milestone tracking & fast turnaround",
  },
  {
    icon: "ShieldCheck",
    title: "Transparent Pricing",
    desc: "Itemized written quotes, zero hidden fees",
  },
  {
    icon: "CheckCircle2",
    title: "Safety First",
    desc: "Strict site safety protocols followed",
  },
  {
    icon: "Sparkles",
    title: "After-Service Support",
    desc: "Free rework guarantee & dedicated support",
  },
];

const DEFAULT_ABOUT_SECTION: AboutStorySection = {
  badge: "ABOUT HiBUILD",
  title: "Your Building, Our Responsibility",
  description:
    "Hind Building Solutions (HiBUILD) is a specialized maintenance and repair brand under Hindustan Projects. We provide reliable, professional and cost-effective building care services for residential, commercial and industrial properties.",
  features: [
    "Trained & Experienced Team",
    "Modern Tools & Technology",
    "Safe & Quality Materials",
    "Timely Project Completion",
  ],
};

const AVAILABLE_ICONS = [
  { id: "Users", label: "Skilled Team", icon: Users },
  { id: "Award", label: "Quality / Certified", icon: Award },
  { id: "Clock", label: "On-Time Speed", icon: Clock },
  { id: "ShieldCheck", label: "Trust & Safety", icon: ShieldCheck },
  { id: "CheckCircle2", label: "Verified Check", icon: CheckCircle2 },
  { id: "Sparkles", label: "Premium Service", icon: Sparkles },
];

type ActiveTab = "hero" | "stats" | "benefits" | "about_preview";

export default function HbsAdminHome() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [heroConfig, setHeroConfig] = useState<HbsHeroConfig>(DEFAULT_HERO_CONFIG);
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [benefits, setBenefits] = useState<BenefitItem[]>(DEFAULT_BENEFITS);
  const [aboutStory, setAboutStory] = useState<AboutStorySection>(DEFAULT_ABOUT_SECTION);

  const [activeTab, setActiveTab] = useState<ActiveTab>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
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

        // Parse Hero Config
        if (d.heroCtas) {
          try {
            const parsedHero = typeof d.heroCtas === "string" ? JSON.parse(d.heroCtas) : d.heroCtas;
            setHeroConfig({ ...DEFAULT_HERO_CONFIG, ...parsedHero });
          } catch {
            setHeroConfig(DEFAULT_HERO_CONFIG);
          }
        }

        // Parse Stats
        if (d.stats) {
          try {
            const parsedStats = typeof d.stats === "string" ? JSON.parse(d.stats) : d.stats;
            if (Array.isArray(parsedStats) && parsedStats.length > 0) {
              setStats(parsedStats);
            }
          } catch {
            setStats(DEFAULT_STATS);
          }
        }

        // Parse Why Choose Us benefits
        if (d.whyChooseUs) {
          try {
            const parsedWhy = typeof d.whyChooseUs === "string" ? JSON.parse(d.whyChooseUs) : d.whyChooseUs;
            if (Array.isArray(parsedWhy) && parsedWhy.length > 0) {
              setBenefits(
                parsedWhy.map((b: any, idx: number) => ({
                  icon: b.icon || DEFAULT_BENEFITS[idx % DEFAULT_BENEFITS.length].icon,
                  title: b.title || "",
                  desc: b.description || b.desc || "",
                }))
              );
            } else if (
              parsedWhy &&
              typeof parsedWhy === "object" &&
              Array.isArray(parsedWhy.homepageBenefits) &&
              parsedWhy.homepageBenefits.length > 0
            ) {
              setBenefits(parsedWhy.homepageBenefits);
            }
          } catch {
            setBenefits(DEFAULT_BENEFITS);
          }
        }

        // Parse About Story Section
        if (d.aboutStory) {
          try {
            const parsedStory = typeof d.aboutStory === "string" ? JSON.parse(d.aboutStory) : d.aboutStory;
            if (typeof parsedStory === "object" && parsedStory !== null) {
              setAboutStory({
                badge: parsedStory.badge || DEFAULT_ABOUT_SECTION.badge,
                title: parsedStory.title || DEFAULT_ABOUT_SECTION.title,
                description: parsedStory.description || DEFAULT_ABOUT_SECTION.description,
                features:
                  Array.isArray(parsedStory.features) && parsedStory.features.length > 0
                    ? parsedStory.features
                    : DEFAULT_ABOUT_SECTION.features,
              });
            } else if (typeof parsedStory === "string" && parsedStory.trim()) {
              setAboutStory({
                ...DEFAULT_ABOUT_SECTION,
                description: parsedStory,
              });
            }
          } catch {
            setAboutStory(DEFAULT_ABOUT_SECTION);
          }
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      // Safely preserve existing whyChooseUs object (which may hold comparisonRows, pillars, faqs, protocol)
      let existingWhyChooseUsObj: any = {};
      try {
        if (content.whyChooseUs) {
          existingWhyChooseUsObj =
            typeof content.whyChooseUs === "string"
              ? JSON.parse(content.whyChooseUs)
              : content.whyChooseUs;
        }
      } catch {}

      const mergedWhyChooseUs =
        typeof existingWhyChooseUsObj === "object" && !Array.isArray(existingWhyChooseUsObj)
          ? {
              ...existingWhyChooseUsObj,
              homepageBenefits: benefits,
            }
          : {
              homepageBenefits: benefits,
            };

      const payload = {
        ...content,
        heroTitle: heroConfig.headline || content.heroTitle,
        heroSubtitle: heroConfig.subheadline || content.heroSubtitle,
        heroImage: heroConfig.heroImage || content.heroImage,
        heroCtas: JSON.stringify(heroConfig),
        stats: JSON.stringify(stats),
        whyChooseUs: JSON.stringify(mergedWhyChooseUs),
        aboutStory: JSON.stringify(aboutStory),
      };

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
        setMessage({ text: "Homepage data updated & verified successfully!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 4000);

        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/hbs"] }),
          });
        } catch {}
      } else {
        setMessage({ text: json.error || "Failed to update homepage content.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Stats helpers
  const updateStat = (index: number, field: keyof StatItem, val: string) => {
    setStats((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addStat = () => {
    if (stats.length >= 6) {
      alert("Recommended maximum 4-6 counters for clean layout.");
      return;
    }
    setStats((prev) => [...prev, { value: "100+", label: "New Metric" }]);
  };

  const removeStat = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
  };

  // Benefits helpers
  const updateBenefit = (index: number, field: keyof BenefitItem, val: string) => {
    setBenefits((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addBenefit = () => {
    if (benefits.length >= 8) {
      alert("Maximum 8 benefits recommended for layout symmetry.");
      return;
    }
    setBenefits((prev) => [
      ...prev,
      {
        icon: "ShieldCheck",
        title: "New Benefit Advantage",
        desc: "Certified process and verified quality delivered on time.",
      },
    ]);
  };

  const removeBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  // About feature helpers
  const updateAboutFeature = (index: number, val: string) => {
    setAboutStory((prev) => {
      const copy = [...prev.features];
      copy[index] = val;
      return { ...prev, features: copy };
    });
  };

  const addAboutFeature = () => {
    if (aboutStory.features.length >= 6) return;
    setAboutStory((prev) => ({
      ...prev,
      features: [...prev.features, "New Quality Standard Checkpoint"],
    }));
  };

  const removeAboutFeature = (index: number) => {
    setAboutStory((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
        <span className="text-xs uppercase tracking-widest font-mono text-slate-500 font-semibold">
          Loading Hind Build Home CMS...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ─────────────────────────────────────────────────────────────────
          HEADER BAR (Glassmorphism)
      ───────────────────────────────────────────────────────────────── */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Hind Build" }, { label: "Home Page CMS" }]}
        title="Homepage Command Center"
        description="Manage the public hero messaging, counter statistics, 6 verified benefit cards, and brand story with zero fake claims."
      >
        <div className="flex items-center gap-3">
          <Link
            href="/hbs"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-200/90 rounded-xl shadow-xs transition-all backdrop-blur-md"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View Public Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-95 ${
              savedRecently
                ? "bg-emerald-600"
                : "bg-red-600 hover:bg-red-700 shadow-red-500/20"
            }`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : savedRecently ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Publishing..." : savedRecently ? "Published!" : "Publish Changes"}</span>
          </button>
        </div>
      </HbsAdminPageHeader>

      {/* Toast Alert */}
      {message.text && (
        <div
          className={`p-4 text-xs flex items-center gap-2.5 rounded-2xl border backdrop-blur-md ${
            message.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-sm"
              : "bg-red-50/90 border-red-200 text-red-900 shadow-sm"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          GLASS TABS NAVIGATION
      ───────────────────────────────────────────────────────────────── */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/80 rounded-2xl p-1.5 shadow-md shadow-slate-200/40 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "hero"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <LayoutTemplate className="w-4 h-4 text-amber-400" />
          <span>1. Hero Banner & Messaging</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "stats"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span>2. Live Statistics Counters</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-md bg-white/20 text-white font-mono">
            {stats.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("benefits")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "benefits"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>3. Why Choose HiBUILD (6 Benefits)</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-md bg-white/20 text-white font-mono">
            {benefits.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about_preview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "about_preview"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <Building2 className="w-4 h-4 text-red-400" />
          <span>4. Brand Responsibility & Story</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TAB 1: HERO BANNER & MESSAGING
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-5">
              <div className="border-b border-slate-100/80 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    <span>Hero Copy & Headlines</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controls the primary public presentation at the very top of Hind Build.
                  </p>
                </div>
              </div>

              {/* Eyebrow badge */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Top Red Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={heroConfig.badge}
                  onChange={(e) => setHeroConfig((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="COMPLETE CARE FOR YOUR BUILDING"
                  className="w-full text-xs font-semibold p-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white transition-all text-slate-900"
                />
              </div>

              {/* Main Headline */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Main Hero Headline (H1)
                </label>
                <textarea
                  rows={2}
                  value={heroConfig.headline}
                  onChange={(e) => setHeroConfig((prev) => ({ ...prev, headline: e.target.value }))}
                  placeholder="Repair. Protect. Maintain. Build Better."
                  className="w-full text-xs font-bold p-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white transition-all text-slate-900 leading-snug resize-none"
                />
                <span className="text-[11px] text-slate-400">
                  Tip: Use line breaks or keep punchy for maximum conversion.
                </span>
              </div>

              {/* Subtitle / Paragraph */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Supporting Overview Narrative
                </label>
                <textarea
                  rows={3}
                  value={heroConfig.subheadline}
                  onChange={(e) => setHeroConfig((prev) => ({ ...prev, subheadline: e.target.value }))}
                  placeholder="Hind Building Solutions (HiBUILD) provides professional building repair..."
                  className="w-full text-xs p-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white transition-all text-slate-700 leading-relaxed resize-none"
                />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700">
                    Primary CTA Label (Red Button)
                  </label>
                  <input
                    type="text"
                    value={heroConfig.primaryCtaLabel}
                    onChange={(e) =>
                      setHeroConfig((prev) => ({ ...prev, primaryCtaLabel: e.target.value }))
                    }
                    placeholder="Get a Free Site Visit"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                  <input
                    type="text"
                    value={heroConfig.primaryCtaUrl}
                    onChange={(e) =>
                      setHeroConfig((prev) => ({ ...prev, primaryCtaUrl: e.target.value }))
                    }
                    placeholder="/contact"
                    className="w-full text-xs font-mono p-2 bg-slate-100/80 border border-slate-200 rounded-lg text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                    Secondary CTA Label (Outlined Button)
                  </label>
                  <input
                    type="text"
                    value={heroConfig.secondaryCtaLabel}
                    onChange={(e) =>
                      setHeroConfig((prev) => ({ ...prev, secondaryCtaLabel: e.target.value }))
                    }
                    placeholder="Our Services"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <input
                    type="text"
                    value={heroConfig.secondaryCtaUrl}
                    onChange={(e) =>
                      setHeroConfig((prev) => ({ ...prev, secondaryCtaUrl: e.target.value }))
                    }
                    placeholder="/services"
                    className="w-full text-xs font-mono p-2 bg-slate-100/80 border border-slate-200 rounded-lg text-slate-600"
                  />
                </div>
              </div>

              {/* Emergency Hotline Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Emergency Call Number</span>
                  </label>
                  <input
                    type="text"
                    value={content.phone || ""}
                    onChange={(e) => setContent((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 94625 77757"
                    className="w-full text-xs font-mono p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Booking Hotline</span>
                  </label>
                  <input
                    type="text"
                    value={content.whatsapp || ""}
                    onChange={(e) => setContent((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="919462577757"
                    className="w-full text-xs font-mono p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Hero Cutout Artwork</h3>
              <p className="text-xs text-slate-500">
                Transparent PNG or WebP image rendered on the right side of the hero section.
              </p>
              <HbsImageUploader
                value={heroConfig.heroImage || content.heroImage || "/hibuild-hero-full.png"}
                onChange={(url) => {
                  setHeroConfig((prev) => ({ ...prev, heroImage: url }));
                  setContent((prev) => ({ ...prev, heroImage: url }));
                }}
                folder="hbs/heroes"
                label="Hero Cutout Artwork"
                description="Upload an official high-res cutout with transparent background"
                previewHeight="h-48"
              />
            </div>
          </div>

          {/* Right Live Visual Simulation: 5 cols */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-5 shadow-lg shadow-slate-200/50 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-red-600" />
                  <span>Real-Time Hero Preview</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  Synchronized
                </span>
              </div>

              {/* Mockup Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3.5 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-red-600 rounded-full" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600">
                    {heroConfig.badge || "COMPLETE CARE FOR YOUR BUILDING"}
                  </span>
                </div>

                <div className="text-lg font-black text-slate-900 tracking-tight leading-snug whitespace-pre-line font-display">
                  {heroConfig.headline || "Repair. Protect.\nMaintain. Build Better."}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {heroConfig.subheadline}
                </p>

                {/* 4 Trust Badges Mini */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reliable Team</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quality Work</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>On-Time Service</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Transparent Pricing</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="px-3 py-1.5 bg-red-600 text-white font-bold text-[11px] rounded-lg">
                    {heroConfig.primaryCtaLabel || "Get a Free Site Visit"}
                  </span>
                  <span className="px-3 py-1.5 border border-blue-600 text-blue-700 font-bold text-[11px] rounded-lg bg-white">
                    {heroConfig.secondaryCtaLabel || "Our Services"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 2: LIVE STATISTICS COUNTERS (ZERO FAKE CLAIMS!)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Public Counter Statistics Bar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These 4 big numbers are displayed right below the About section on the homepage. Change any number here to ensure zero false claims.
                </p>
              </div>
              <button
                type="button"
                onClick={addStat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Metric Counter</span>
              </button>
            </div>

            {/* Editable Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((st, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Counter #{idx + 1}
                    </span>
                    {stats.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeStat(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        title="Remove counter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                      Display Number / Value
                    </label>
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => updateStat(idx, "value", e.target.value)}
                      placeholder="e.g. 500+ or 8+"
                      className="w-full text-lg font-black p-2.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 text-blue-700 font-display text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                      Label Description
                    </label>
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => updateStat(idx, "label", e.target.value)}
                      placeholder="e.g. Projects Completed"
                      className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-800 text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Live Preview Bar */}
            <div className="mt-6 pt-6 border-t border-slate-200/80">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Live Public Render Simulation:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                {stats.map((st, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-black text-blue-700 font-display">
                      {st.value || "0"}
                    </div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {st.label || "Metric Label"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 3: WHY CHOOSE HIBUILD (6 HOMEPAGE BENEFITS)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "benefits" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Homepage Benefit Cards (Why Choose HiBUILD)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controls the 6 highlight benefit cards shown inside the deep architectural blue section on the public homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={addBenefit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Benefit Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-3.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Benefit Card #{idx + 1}
                    </span>
                    {benefits.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        title="Remove benefit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Icon Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                      Icon Emblem
                    </label>
                    <select
                      value={b.icon}
                      onChange={(e) => updateBenefit(idx, "icon", e.target.value)}
                      className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 text-slate-800"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic.id} value={ic.id}>
                          {ic.id} — {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                      Card Title
                    </label>
                    <input
                      type="text"
                      value={b.title}
                      onChange={(e) => updateBenefit(idx, "title", e.target.value)}
                      placeholder="e.g. Skilled Professionals"
                      className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 text-slate-900"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                      Brief Description
                    </label>
                    <textarea
                      rows={2}
                      value={b.desc}
                      onChange={(e) => updateBenefit(idx, "desc", e.target.value)}
                      placeholder="e.g. Trained & background-verified technicians"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-600 leading-snug resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 4: BRAND RESPONSIBILITY & STORY (SECTION 4 PREVIEW)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "about_preview" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>Homepage Brand Responsibility Section ("Your Building, Our Responsibility")</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls the narrative, heading, and 4 feature check badges right above the counter statistics on the homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Section Pill Badge
                </label>
                <input
                  type="text"
                  value={aboutStory.badge}
                  onChange={(e) => setAboutStory((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="ABOUT HiBUILD"
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Section Headline (H2)
                </label>
                <input
                  type="text"
                  value={aboutStory.title}
                  onChange={(e) => setAboutStory((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Your Building, Our Responsibility"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                Detailed Brand Narrative
              </label>
              <textarea
                rows={3}
                value={aboutStory.description}
                onChange={(e) => setAboutStory((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Hind Building Solutions (HiBUILD) is a specialized maintenance and repair brand..."
                className="w-full text-xs p-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white text-slate-700 leading-relaxed resize-none"
              />
            </div>

            {/* 4 Feature Badges */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                  4 Feature Check Badges (2x2 Grid)
                </label>
                {aboutStory.features.length < 6 && (
                  <button
                    type="button"
                    onClick={addAboutFeature}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Badge</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aboutStory.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    </div>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => updateAboutFeature(idx, e.target.value)}
                      placeholder="e.g. Trained & Experienced Team"
                      className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800"
                    />
                    {aboutStory.features.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAboutFeature(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md"
                        title="Remove badge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
