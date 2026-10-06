"use client";

import { useEffect, useState } from "react";
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
  Sliders,
  Eye,
  SlidersHorizontal
} from "lucide-react";
import type { HbsContent } from "@/lib/types";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";

interface WhyChooseItem {
  title: string;
  desc: string;
}

interface StatItem {
  value: string;
  label: string;
}

export interface HeroConfig {
  enabled: boolean;
  displayMode: "TEXT_AND_IMAGE" | "TEXT_ONLY" | "IMAGE_ONLY";
  imagePosition: "right" | "left" | "background";
  imageFit: "cover" | "contain";
  overlayStrength: "none" | "light" | "medium" | "dark";
  badge: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  mobileImage: string;
  backgroundImage: string;
}

const DEFAULT_HERO_CONFIG: HeroConfig = {
  enabled: true,
  displayMode: "TEXT_AND_IMAGE",
  imagePosition: "right",
  imageFit: "cover",
  overlayStrength: "medium",
  badge: "A Specialized Division of Hindustan Projects (HiPRO)",
  primaryCtaLabel: "Book Site Inspection",
  primaryCtaUrl: "/contact",
  secondaryCtaLabel: "Chat on WhatsApp",
  secondaryCtaUrl: "",
  mobileImage: "",
  backgroundImage: "",
};

export default function HbsAdminHome() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(DEFAULT_HERO_CONFIG);
  const [whyChoose, setWhyChoose] = useState<WhyChooseItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/content", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setContent(json.data);

        try {
          if (json.data.heroCtas) {
            const parsed = typeof json.data.heroCtas === "string" ? JSON.parse(json.data.heroCtas) : json.data.heroCtas;
            setHeroConfig({ ...DEFAULT_HERO_CONFIG, ...parsed });
          }
        } catch {
          setHeroConfig(DEFAULT_HERO_CONFIG);
        }

        try {
          if (json.data.whyChooseUs) {
            setWhyChoose(JSON.parse(json.data.whyChooseUs));
          }
        } catch {
          setWhyChoose([]);
        }

        try {
          if (json.data.stats) {
            setStats(JSON.parse(json.data.stats));
          }
        } catch {
          setStats([]);
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

  const handleWhyChooseChange = (index: number, field: keyof WhyChooseItem, val: string) => {
    setWhyChoose((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addWhyChooseItem = () => {
    setWhyChoose((prev) => [...prev, { title: "New Feature", desc: "Detailed engineering description" }]);
  };

  const removeWhyChooseItem = (index: number) => {
    setWhyChoose((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStatChange = (index: number, field: keyof StatItem, val: string) => {
    setStats((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addStatItem = () => {
    setStats((prev) => [...prev, { value: "100%", label: "Client Satisfaction" }]);
  };

  const removeStatItem = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    const payload = {
      ...content,
      heroCtas: JSON.stringify(heroConfig),
      whyChooseUs: JSON.stringify(whyChoose),
      whyChoosePoints: JSON.stringify(whyChoose),
      stats: JSON.stringify(stats),
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
        setMessage({ text: "Hind Build Home page CMS saved successfully!", type: "success" });
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
      <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-xs uppercase tracking-wider font-mono">Loading Home CMS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            Home Page Editor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
            Hind Build Homepage CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage the hero presentation modes, headlines, value propositions, key statistics, and call-to-actions.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 text-xs flex items-center gap-2 border ${
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
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-amber-600" />
              <span>Hero Presentation &amp; Content (CMS-First)</span>
            </h2>
            <button
              type="button"
              onClick={() => setHeroConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-colors border ${
                heroConfig.enabled
                  ? "bg-emerald-600 text-white border-emerald-700"
                  : "bg-slate-200 text-slate-700 border-slate-300"
              }`}
            >
              {heroConfig.enabled ? "Hero: ENABLED" : "Hero: DISABLED"}
            </button>
          </div>

          {/* Display Mode & Composition Controls */}
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-600 tracking-wider block">
              1. Hero Layout Mode &amp; Composition
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Display Mode
                </label>
                <select
                  value={heroConfig.displayMode}
                  onChange={(e) =>
                    setHeroConfig((prev) => ({
                      ...prev,
                      displayMode: e.target.value as any,
                    }))
                  }
                  className="w-full text-xs border border-slate-300 p-2.5 bg-white focus:outline-amber-500 font-semibold"
                >
                  <option value="TEXT_AND_IMAGE">TEXT AND IMAGE (Split)</option>
                  <option value="TEXT_ONLY">TEXT ONLY (Centered / Clean)</option>
                  <option value="IMAGE_ONLY">IMAGE ONLY (Prominent Visual)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Image Position
                </label>
                <select
                  value={heroConfig.imagePosition}
                  onChange={(e) =>
                    setHeroConfig((prev) => ({
                      ...prev,
                      imagePosition: e.target.value as any,
                    }))
                  }
                  className="w-full text-xs border border-slate-300 p-2.5 bg-white focus:outline-amber-500 font-semibold"
                >
                  <option value="right">Right Column (Default)</option>
                  <option value="left">Left Column</option>
                  <option value="background">Full Background</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Image Fit
                </label>
                <select
                  value={heroConfig.imageFit}
                  onChange={(e) =>
                    setHeroConfig((prev) => ({
                      ...prev,
                      imageFit: e.target.value as any,
                    }))
                  }
                  className="w-full text-xs border border-slate-300 p-2.5 bg-white focus:outline-amber-500 font-semibold"
                >
                  <option value="cover">Cover (Fills container)</option>
                  <option value="contain">Contain (Full aspect view)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Background / Image Overlay Strength
              </label>
              <select
                value={heroConfig.overlayStrength}
                onChange={(e) =>
                  setHeroConfig((prev) => ({
                    ...prev,
                    overlayStrength: e.target.value as any,
                  }))
                }
                className="w-full text-xs border border-slate-300 p-2 bg-white focus:outline-amber-500"
              >
                <option value="none">None (0% overlay)</option>
                <option value="light">Light (30% Dark Tint)</option>
                <option value="medium">Medium (60% Dark Tint - Recommended for readability)</option>
                <option value="dark">Dark (85% Dark Tint - Maximum text contrast)</option>
              </select>
            </div>
          </div>

          {/* Copy Controls */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-600 tracking-wider block">
              2. Headlines &amp; Messaging
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Hero Eyebrow / Top Badge
                </label>
                <input
                  type="text"
                  value={heroConfig.badge || ""}
                  onChange={(e) => setHeroConfig((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="e.g. A Specialized Division of Hindustan Projects (HiPRO)"
                  className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Top Tagline (Legacy / Subtitle strip)
                </label>
                <input
                  type="text"
                  value={content.tagline || ""}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Main Hero Heading (H1)
              </label>
              <input
                type="text"
                value={content.heroTitle || ""}
                onChange={(e) => handleChange("heroTitle", e.target.value)}
                placeholder="Complete Building Repair, Maintenance & Protection"
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Hero Subtitle / Description
              </label>
              <textarea
                rows={3}
                value={content.heroSubtitle || ""}
                onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                placeholder="Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions across Rajasthan."
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500"
              />
            </div>
          </div>

          {/* CTA Buttons Management */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-600 tracking-wider block">
              3. Call-to-Action Buttons
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Primary Action Button
                </label>
                <input
                  type="text"
                  placeholder="Label (e.g. Book Site Inspection)"
                  value={heroConfig.primaryCtaLabel || ""}
                  onChange={(e) =>
                    setHeroConfig((prev) => ({ ...prev, primaryCtaLabel: e.target.value }))
                  }
                  className="w-full text-xs border border-slate-300 p-2 bg-white"
                />
                <input
                  type="text"
                  placeholder="URL Destination (e.g. /contact)"
                  value={heroConfig.primaryCtaUrl || ""}
                  onChange={(e) =>
                    setHeroConfig((prev) => ({ ...prev, primaryCtaUrl: e.target.value }))
                  }
                  className="w-full text-xs border border-slate-300 p-2 bg-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Secondary Action Button
                </label>
                <input
                  type="text"
                  placeholder="Label (e.g. Chat on WhatsApp)"
                  value={heroConfig.secondaryCtaLabel || ""}
                  onChange={(e) =>
                    setHeroConfig((prev) => ({ ...prev, secondaryCtaLabel: e.target.value }))
                  }
                  className="w-full text-xs border border-slate-300 p-2 bg-white"
                />
                <input
                  type="text"
                  placeholder="URL (optional, left empty for auto-WhatsApp)"
                  value={heroConfig.secondaryCtaUrl || ""}
                  onChange={(e) =>
                    setHeroConfig((prev) => ({ ...prev, secondaryCtaUrl: e.target.value }))
                  }
                  className="w-full text-xs border border-slate-300 p-2 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Hero Media Uploaders */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-600 tracking-wider block">
              4. Hero Media Management (Authenticated Cloudinary Upload / Preview / Replace)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200">
                <HbsImageUploader
                  value={content.heroImage || ""}
                  onChange={(url) => handleChange("heroImage", url)}
                  folder="hbs/hero"
                  label="Primary Hero Image"
                  description="High-resolution visual for desktop split or image-only mode."
                  recommendedSize="1200×900px"
                  aspectRatioHint="4:3"
                  previewHeight="h-28"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <HbsImageUploader
                  value={heroConfig.mobileImage || ""}
                  onChange={(url) => setHeroConfig((prev) => ({ ...prev, mobileImage: url }))}
                  folder="hbs/hero"
                  label="Mobile Hero Image (Optional)"
                  description="Optimized crop for mobile viewports (360px-430px)."
                  recommendedSize="800×600px"
                  aspectRatioHint="4:3"
                  previewHeight="h-28"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <HbsImageUploader
                  value={heroConfig.backgroundImage || ""}
                  onChange={(url) => setHeroConfig((prev) => ({ ...prev, backgroundImage: url }))}
                  folder="hbs/hero"
                  label="Background Hero Image (Optional)"
                  description="Full-bleed background when Position is set to Background."
                  recommendedSize="1920×1080px"
                  aspectRatioHint="16:9"
                  previewHeight="h-28"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Hind Build Points */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Why Choose Hind Build (Key Highlights)</span>
            </h2>
            <button
              type="button"
              onClick={addWhyChooseItem}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Point</span>
            </button>
          </div>

          <div className="space-y-3">
            {whyChoose.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 flex gap-3 items-start">
                <span className="font-mono text-xs font-bold text-slate-400 mt-2">
                  #{idx + 1}
                </span>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleWhyChooseChange(idx, "title", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.desc}
                      onChange={(e) => handleWhyChooseChange(idx, "desc", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeWhyChooseItem(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors mt-4"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Homepage Statistics Bar</span>
            </h2>
            <button
              type="button"
              onClick={addStatItem}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((st, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => removeStatItem(idx)}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-600 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Value (e.g. 19+)
                  </label>
                  <input
                    type="text"
                    value={st.value}
                    onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 p-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                    className="w-full text-xs border border-slate-300 p-1.5 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Homepage Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
