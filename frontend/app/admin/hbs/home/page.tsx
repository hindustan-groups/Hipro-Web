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
  Building,
  Factory,
  Home,
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
  Layers,
  HardHat,
  FolderOpen,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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

interface CategoryRibbonItem {
  icon: string;
  title: string;
  subtitle: string;
}

interface ServicesShowcaseConfig {
  badge: string;
  title: string;
  highlightText: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
}

interface AboutImagesConfig {
  leftImage: string;
  rightTopImage: string;
  rightBottomImage: string;
}

interface ProjectsShowcaseConfig {
  badge: string;
  title: string;
  highlightText: string;
  description: string;
}

interface PreFooterCtaConfig {
  headline: string;
  subheadline: string;
  callLabel: string;
  whatsappLabel: string;
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

const DEFAULT_CATEGORIES: CategoryRibbonItem[] = [
  { icon: "Home", title: "Residential", subtitle: "Homes & Apartments" },
  { icon: "Building2", title: "Commercial", subtitle: "Offices & Showrooms" },
  { icon: "Building", title: "Societies", subtitle: "Apartments & Gated Communities" },
  { icon: "Factory", title: "Industrial", subtitle: "Factories & Warehouses" },
  { icon: "Home", title: "Independent House", subtitle: "From Repair to Renovation" },
];

const DEFAULT_SERVICES_SHOWCASE: ServicesShowcaseConfig = {
  badge: "OUR SERVICES",
  title: "Complete",
  highlightText: "Building Care Services",
  description:
    "From small repairs to complete renovation, HiBUILD provides all building maintenance and construction support services under one roof.",
  ctaText: "View All Services",
  ctaUrl: "/services",
};

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

const DEFAULT_ABOUT_IMAGES: AboutImagesConfig = {
  leftImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
  rightTopImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
  rightBottomImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
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

const DEFAULT_PROJECTS_SHOWCASE: ProjectsShowcaseConfig = {
  badge: "OUR PROJECTS",
  title: "Our Recent",
  highlightText: "Work",
  description:
    "Browse verified field repairs, chemical waterproofing, and structural rehabilitation case studies across Rajasthan.",
};

const DEFAULT_PREFOOTER_CTA: PreFooterCtaConfig = {
  headline: "Need Professional Building Services?",
  subheadline:
    "Let's take care of your property. Fast doorstep site inspection across Bhilwara & Rajasthan.",
  callLabel: "Call",
  whatsappLabel: "WhatsApp Us",
};

const AVAILABLE_ICONS = [
  { id: "Users", label: "Skilled Team", icon: Users },
  { id: "Award", label: "Quality / Certified", icon: Award },
  { id: "Clock", label: "On-Time Speed", icon: Clock },
  { id: "ShieldCheck", label: "Trust & Safety", icon: ShieldCheck },
  { id: "CheckCircle2", label: "Verified Check", icon: CheckCircle2 },
  { id: "Sparkles", label: "Premium Service", icon: Sparkles },
];

const AVAILABLE_CATEGORY_ICONS = [
  { id: "Home", label: "Home / Residential", icon: Home },
  { id: "Building2", label: "Commercial Office", icon: Building2 },
  { id: "Building", label: "Societies / Gated", icon: Building },
  { id: "Factory", label: "Industrial / Factory", icon: Factory },
];

type ActiveTab =
  | "hero"
  | "categories"
  | "services_showcase"
  | "about_preview"
  | "stats"
  | "benefits"
  | "projects_showcase"
  | "prefooter_cta";

const VALID_TABS: ActiveTab[] = [
  "hero",
  "categories",
  "services_showcase",
  "about_preview",
  "stats",
  "benefits",
  "projects_showcase",
  "prefooter_cta",
];

export default function HbsAdminHome() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [heroConfig, setHeroConfig] = useState<HbsHeroConfig>(DEFAULT_HERO_CONFIG);
  const [categories, setCategories] = useState<CategoryRibbonItem[]>(DEFAULT_CATEGORIES);
  const [servicesShowcase, setServicesShowcase] = useState<ServicesShowcaseConfig>(DEFAULT_SERVICES_SHOWCASE);
  const [aboutStory, setAboutStory] = useState<AboutStorySection>(DEFAULT_ABOUT_SECTION);
  const [aboutImages, setAboutImages] = useState<AboutImagesConfig>(DEFAULT_ABOUT_IMAGES);
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [benefits, setBenefits] = useState<BenefitItem[]>(DEFAULT_BENEFITS);
  const [projectsShowcase, setProjectsShowcase] = useState<ProjectsShowcaseConfig>(DEFAULT_PROJECTS_SHOWCASE);
  const [preFooterCta, setPreFooterCta] = useState<PreFooterCtaConfig>(DEFAULT_PREFOOTER_CTA);

  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromQuery = searchParams?.get("tab") as ActiveTab | null;

  const [activeTab, setActiveTab] = useState<ActiveTab>(
    tabFromQuery && VALID_TABS.includes(tabFromQuery) ? tabFromQuery : "hero"
  );

  useEffect(() => {
    if (tabFromQuery && VALID_TABS.includes(tabFromQuery)) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    router.replace(`/admin/hbs/home?tab=${tab}`, { scroll: false });
  };
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

        // 1. Hero
        if (d.heroCtas) {
          try {
            const parsedHero = typeof d.heroCtas === "string" ? JSON.parse(d.heroCtas) : d.heroCtas;
            setHeroConfig({ ...DEFAULT_HERO_CONFIG, ...parsedHero });
          } catch {
            setHeroConfig(DEFAULT_HERO_CONFIG);
          }
        }

        // 2. Categories Ribbon
        if (d.processSteps) {
          try {
            const parsedCat = typeof d.processSteps === "string" ? JSON.parse(d.processSteps) : d.processSteps;
            if (Array.isArray(parsedCat) && parsedCat.length > 0) {
              setCategories(parsedCat);
            }
          } catch {
            setCategories(DEFAULT_CATEGORIES);
          }
        }

        // 3. Services Showcase
        if (d.guaranteeSection) {
          try {
            const parsedServices =
              typeof d.guaranteeSection === "string" ? JSON.parse(d.guaranteeSection) : d.guaranteeSection;
            if (parsedServices && typeof parsedServices === "object") {
              setServicesShowcase({ ...DEFAULT_SERVICES_SHOWCASE, ...parsedServices });
            }
          } catch {
            setServicesShowcase(DEFAULT_SERVICES_SHOWCASE);
          }
        }

        // 4. About Story & Images
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

        if (d.aboutImages) {
          try {
            const parsedImgs = typeof d.aboutImages === "string" ? JSON.parse(d.aboutImages) : d.aboutImages;
            if (parsedImgs && typeof parsedImgs === "object") {
              setAboutImages({ ...DEFAULT_ABOUT_IMAGES, ...parsedImgs });
            }
          } catch {
            setAboutImages(DEFAULT_ABOUT_IMAGES);
          }
        }

        // 5. Stats
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

        // 6. Benefits
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

        // 7. Projects Showcase
        if (d.heroHighlights) {
          try {
            const parsedProj =
              typeof d.heroHighlights === "string" ? JSON.parse(d.heroHighlights) : d.heroHighlights;
            if (parsedProj && typeof parsedProj === "object" && !Array.isArray(parsedProj)) {
              setProjectsShowcase({ ...DEFAULT_PROJECTS_SHOWCASE, ...parsedProj });
            }
          } catch {
            setProjectsShowcase(DEFAULT_PROJECTS_SHOWCASE);
          }
        }

        // 8. Pre-Footer CTA
        if (d.homeFinalCta) {
          try {
            const parsedCta = typeof d.homeFinalCta === "string" ? JSON.parse(d.homeFinalCta) : d.homeFinalCta;
            if (parsedCta && typeof parsedCta === "object") {
              setPreFooterCta({ ...DEFAULT_PREFOOTER_CTA, ...parsedCta });
            }
          } catch {
            setPreFooterCta(DEFAULT_PREFOOTER_CTA);
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
        processSteps: JSON.stringify(categories),
        guaranteeSection: JSON.stringify(servicesShowcase),
        aboutStory: JSON.stringify(aboutStory),
        aboutImages: JSON.stringify(aboutImages),
        stats: JSON.stringify(stats),
        whyChooseUs: JSON.stringify(mergedWhyChooseUs),
        heroHighlights: JSON.stringify(projectsShowcase),
        homeFinalCta: JSON.stringify(preFooterCta),
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
        setMessage({ text: "All 8 Homepage sections saved and synchronized successfully!", type: "success" });
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

  // Helpers
  const updateCategory = (index: number, field: keyof CategoryRibbonItem, val: string) => {
    setCategories((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const updateStat = (index: number, field: keyof StatItem, val: string) => {
    setStats((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

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
    <div className="space-y-6 max-w-7xl pb-24">
      {/* ─────────────────────────────────────────────────────────────────
          HEADER BAR (Glassmorphic)
      ───────────────────────────────────────────────────────────────── */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Hind Build" }, { label: "Home Page CMS" }]}
        title="Homepage Command Center (All 8 Sections)"
        description="Comprehensive management for every single section from Hero to Pre-Footer with instant live previews."
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
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 min-h-[38px]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : savedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved All Sections</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Sections</span>
              </>
            )}
          </button>
        </div>
      </HbsAdminPageHeader>

      {message.text && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
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
          8 SECTIONS TABS NAVIGATION (Matches Public Frontend 1:1)
      ───────────────────────────────────────────────────────────────── */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/80 rounded-2xl p-1.5 shadow-md shadow-slate-200/40 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => switchTab("hero")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "hero"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-red-400" />
          <span>1. Hero Banner</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("categories")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "categories"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>2. Category Ribbon (5)</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("services_showcase")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "services_showcase"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <HardHat className="w-3.5 h-3.5 text-amber-400" />
          <span>3. Services Showcase</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("about_preview")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "about_preview"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-rose-400" />
          <span>4. About &amp; Bento Collage</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("stats")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "stats"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>5. 4 Stat Counters</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("benefits")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "benefits"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>6. Why Choose Us (6 Benefits)</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("projects_showcase")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "projects_showcase"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>7. Projects Showcase</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("prefooter_cta")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "prefooter_cta"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-red-400" />
          <span>8. Pre-Footer Master CTA</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TAB 1: HERO BANNER & MESSAGING
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-red-600" />
                  <span>Hero Header Copy &amp; Badges</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  Section #1
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Top Red Pill Badge
                </label>
                <input
                  type="text"
                  value={heroConfig.badge || ""}
                  onChange={(e) => setHeroConfig({ ...heroConfig, badge: e.target.value })}
                  placeholder="COMPLETE CARE FOR YOUR BUILDING"
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Main Headline (Use \n for line break)
                </label>
                <textarea
                  rows={2}
                  value={heroConfig.headline || ""}
                  onChange={(e) => setHeroConfig({ ...heroConfig, headline: e.target.value })}
                  placeholder="Repair. Protect.\nMaintain. Build Better."
                  className="w-full text-xs font-black p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white text-slate-900 font-display leading-tight"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Subheadline / Paragraph Story
                </label>
                <textarea
                  rows={3}
                  value={heroConfig.subheadline || ""}
                  onChange={(e) => setHeroConfig({ ...heroConfig, subheadline: e.target.value })}
                  placeholder="Hind Building Solutions (HiBUILD) provides professional building repair..."
                  className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white text-slate-600 leading-relaxed font-sans resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    Primary CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={heroConfig.primaryCtaLabel || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, primaryCtaLabel: e.target.value })}
                    placeholder="Get a Free Site Visit"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    Secondary CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={heroConfig.secondaryCtaLabel || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, secondaryCtaLabel: e.target.value })}
                    placeholder="Our Services"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <HbsImageUploader
                  label="Hero Graphic / Architectural Showcase Image"
                  value={heroConfig.heroImage || ""}
                  onChange={(url) => setHeroConfig({ ...heroConfig, heroImage: url })}
                  description="Recommended: 1200x800px transparent PNG or high-res showcase photo."
                />
              </div>
            </div>
          </div>

          {/* Right: Live Light Hero Card Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-red-600" />
                  <span>Live Hero Preview</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Instant Render</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 text-left">
                <div className="inline-block px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] font-black tracking-wider uppercase font-mono">
                  {heroConfig.badge || "COMPLETE CARE FOR YOUR BUILDING"}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display whitespace-pre-line leading-tight">
                  {heroConfig.headline || "Repair. Protect.\nMaintain. Build Better."}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {heroConfig.subheadline || "Specialized civil engineering care..."}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="px-3.5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-sm">
                    {heroConfig.primaryCtaLabel || "Get a Free Site Visit"}
                  </div>
                  <div className="px-3.5 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl">
                    {heroConfig.secondaryCtaLabel || "Our Services"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 2: CATEGORY RIBBON (5 BUILDING CATEGORIES)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Section #2: Building Categories Full-Width Ribbon</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The deep architectural blue bar directly beneath the Hero showcase displaying 5 property categories.
                </p>
              </div>
            </div>

            {/* Live Deep Blue Ribbon Preview */}
            <div className="p-5 rounded-2xl bg-[#0D2D5E] text-white shadow-inner space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-200 font-bold block">
                Live Deep Blue Ribbon Preview
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
                {categories.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      {c.icon === "Building2" && <Building2 className="w-4 h-4 text-white" />}
                      {c.icon === "Building" && <Building className="w-4 h-4 text-white" />}
                      {c.icon === "Factory" && <Factory className="w-4 h-4 text-white" />}
                      {c.icon !== "Building2" && c.icon !== "Building" && c.icon !== "Factory" && (
                        <Home className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-white">{c.title || `Category #${idx + 1}`}</div>
                      <div className="text-[10px] text-blue-200/90 truncate">{c.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Form Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {categories.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">Slot #{idx + 1}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Icon Emblem</label>
                    <select
                      value={c.icon}
                      onChange={(e) => updateCategory(idx, "icon", e.target.value)}
                      className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    >
                      {AVAILABLE_CATEGORY_ICONS.map((ic) => (
                        <option key={ic.id} value={ic.id}>
                          {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-700">Category Title</label>
                    <input
                      type="text"
                      value={c.title}
                      onChange={(e) => updateCategory(idx, "title", e.target.value)}
                      placeholder="e.g. Residential"
                      className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Subtitle</label>
                    <input
                      type="text"
                      value={c.subtitle}
                      onChange={(e) => updateCategory(idx, "subtitle", e.target.value)}
                      placeholder="e.g. Homes & Apartments"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 3: SERVICES SHOWCASE (HEADER & CATALOG LINK)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "services_showcase" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-amber-600" />
                  <span>Section #3: 16-Card Services Showcase Header</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controls the section headline and introductory narrative right above the 16 colorful service badges.
                </p>
              </div>
              <Link
                href="/admin/hbs/services"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
              >
                <span>Edit 19 Services Catalog →</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Section Pill Badge
                </label>
                <input
                  type="text"
                  value={servicesShowcase.badge}
                  onChange={(e) => setServicesShowcase({ ...servicesShowcase, badge: e.target.value })}
                  placeholder="OUR SERVICES"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={servicesShowcase.ctaText}
                  onChange={(e) => setServicesShowcase({ ...servicesShowcase, ctaText: e.target.value })}
                  placeholder="View All Services"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Headline Lead Text
                </label>
                <input
                  type="text"
                  value={servicesShowcase.title}
                  onChange={(e) => setServicesShowcase({ ...servicesShowcase, title: e.target.value })}
                  placeholder="Complete"
                  className="w-full text-xs font-black p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl font-display"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                  Headline Highlight (Blue Text)
                </label>
                <input
                  type="text"
                  value={servicesShowcase.highlightText}
                  onChange={(e) => setServicesShowcase({ ...servicesShowcase, highlightText: e.target.value })}
                  placeholder="Building Care Services"
                  className="w-full text-xs font-black p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-blue-700 font-display"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Section Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={servicesShowcase.description}
                  onChange={(e) => setServicesShowcase({ ...servicesShowcase, description: e.target.value })}
                  placeholder="From small repairs to complete renovation, HiBUILD provides all building maintenance..."
                  className="w-full text-xs p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-600 leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 4: ABOUT STORY & 3-PHOTO COLLAGE
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "about_preview" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>Section #4: Brand Responsibility Narrative &amp; 3-Photo Bento Collage</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls the story copy, 4 feature badges, and 3 gallery photos in the Bento collage.
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

            {/* 3 Collage Image Uploaders */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>3 Photo Bento Collage (Left Portrait &amp; Right Two Landscapes)</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HbsImageUploader
                  label="Left Main Portrait Photo"
                  value={aboutImages.leftImage}
                  onChange={(url) => setAboutImages({ ...aboutImages, leftImage: url })}
                  description="Aspect: 3/4 (e.g. Technician on site)"
                />
                <HbsImageUploader
                  label="Right Top Landscape Photo"
                  value={aboutImages.rightTopImage}
                  onChange={(url) => setAboutImages({ ...aboutImages, rightTopImage: url })}
                  description="Aspect: 4/3 (e.g. Structural inspection)"
                />
                <HbsImageUploader
                  label="Right Bottom Landscape Photo"
                  value={aboutImages.rightBottomImage}
                  onChange={(url) => setAboutImages({ ...aboutImages, rightBottomImage: url })}
                  description="Aspect: 4/3 (e.g. Protected building)"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 5: 4 COUNTER STATISTICS BAR
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Section #5: 4 Counter Statistics Bar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified metric counters displayed directly beneath the brand story strip. Zero fake claims.
                </p>
              </div>
            </div>

            {/* Live Strip Preview */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((st, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-3xl font-black text-blue-700 font-display">{st.value}</div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{st.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((st, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Counter #{idx + 1}</span>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-700">Display Value</label>
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => updateStat(idx, "value", e.target.value)}
                      placeholder="e.g. 500+"
                      className="w-full text-base font-black p-2 bg-white border border-slate-200 rounded-lg text-blue-700 font-display"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Metric Label</label>
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => updateStat(idx, "label", e.target.value)}
                      placeholder="e.g. Projects Completed"
                      className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 6: WHY CHOOSE HiBUILD (6 BENEFITS)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "benefits" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Section #6: Why Choose HiBUILD (6 Benefits &amp; Quote Form Section)</span>
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
          TAB 7: PROJECTS SHOWCASE HEADER
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "projects_showcase" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-purple-600" />
                  <span>Section #7: Recent Work / Projects Showcase Header</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controls the section titles and narrative above the 5-card filterable projects gallery.
                </p>
              </div>
              <Link
                href="/admin/hbs/projects"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all"
              >
                <span>Manage Case Studies &amp; Projects →</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Section Pill Badge
                </label>
                <input
                  type="text"
                  value={projectsShowcase.badge}
                  onChange={(e) => setProjectsShowcase({ ...projectsShowcase, badge: e.target.value })}
                  placeholder="OUR PROJECTS"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Headline Lead Text
                </label>
                <input
                  type="text"
                  value={projectsShowcase.title}
                  onChange={(e) => setProjectsShowcase({ ...projectsShowcase, title: e.target.value })}
                  placeholder="Our Recent"
                  className="w-full text-xs font-black p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl font-display"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                  Headline Highlight (Blue Text)
                </label>
                <input
                  type="text"
                  value={projectsShowcase.highlightText}
                  onChange={(e) => setProjectsShowcase({ ...projectsShowcase, highlightText: e.target.value })}
                  placeholder="Work"
                  className="w-full text-xs font-black p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-blue-700 font-display"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Section Subtitle / Description
                </label>
                <input
                  type="text"
                  value={projectsShowcase.description}
                  onChange={(e) => setProjectsShowcase({ ...projectsShowcase, description: e.target.value })}
                  placeholder="Browse verified field repairs and case studies..."
                  className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 8: PRE-FOOTER MASTER CONVERSION BANNER
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === "prefooter_cta" && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600" />
                <span>Section #8: Pre-Footer Master Conversion Banner</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The high-conversion blue banner directly preceding the footer with instant Call and WhatsApp triggers.
              </p>
            </div>

            {/* Live Architectural Preview */}
            <div className="p-6 rounded-2xl bg-[#0D2D5E] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white font-display">
                  {preFooterCta.headline || "Need Professional Building Services?"}
                </h4>
                <p className="text-xs text-blue-100/90 font-sans">
                  {preFooterCta.subheadline || "Let's take care of your property. Fast doorstep site inspection."}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{preFooterCta.callLabel || "Call"}: {content.phone || "+91 94625 77757"}</span>
                </div>
                <div className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{preFooterCta.whatsappLabel || "WhatsApp Us"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={preFooterCta.headline}
                  onChange={(e) => setPreFooterCta({ ...preFooterCta, headline: e.target.value })}
                  placeholder="Need Professional Building Services?"
                  className="w-full text-xs font-black p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl font-display text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Subtitle Story
                </label>
                <input
                  type="text"
                  value={preFooterCta.subheadline}
                  onChange={(e) => setPreFooterCta({ ...preFooterCta, subheadline: e.target.value })}
                  placeholder="Let's take care of your property. Fast doorstep site inspection across Bhilwara & Rajasthan."
                  className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Call Button Prefix
                </label>
                <input
                  type="text"
                  value={preFooterCta.callLabel}
                  onChange={(e) => setPreFooterCta({ ...preFooterCta, callLabel: e.target.value })}
                  placeholder="Call"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  WhatsApp Button Label
                </label>
                <input
                  type="text"
                  value={preFooterCta.whatsappLabel}
                  onChange={(e) => setPreFooterCta({ ...preFooterCta, whatsappLabel: e.target.value })}
                  placeholder="WhatsApp Us"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
