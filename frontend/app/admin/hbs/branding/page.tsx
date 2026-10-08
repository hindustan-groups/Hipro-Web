"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Palette,
  ExternalLink,
  Info,
  Sparkles,
  RotateCcw,
  Check,
  Eye,
  ImageIcon,
} from "lucide-react";
import type { HbsContent } from "@/lib/types";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";

interface SaveMsg {
  text: string;
  type: "success" | "error" | "";
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {badge && (
          <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function HbsAdminBranding() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [message, setMessage] = useState<SaveMsg>({ text: "", type: "" });

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/content", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setContent(json.data);
      } else {
        setMessage({ text: json.error || "Failed to load branding settings.", type: "error" });
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

  const handleResetToDefaultLogo = () => {
    setContent((prev) => ({
      ...prev,
      logoPrimary: "/hibuild-logo.png",
      logoDark: "/hibuild-logo-white.svg",
    }));
    setMessage({
      text: "Reset to default logo. Click 'Save Branding' below to apply.",
      type: "success",
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    // Only save branding-related fields
    const brandingPayload = {
      brandName: content.brandName,
      tagline: content.tagline,
      logo: content.logo,
      logoPrimary: content.logoPrimary,
      logoDark: content.logoDark,
      logoMark: content.logoMark,
      logoMobile: content.logoMobile,
      favicon: content.favicon,
      ogDefaultImage: content.ogDefaultImage,
    };

    try {
      const res = await fetch("/api/hbs/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(brandingPayload),
      });

      const json = await res.json();
      if (json.success) {
        setSavedRecently(true);
        setTimeout(() => setSavedRecently(false), 2500);
        setMessage({ text: "High-resolution branding assets saved successfully and synchronized across the website!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 4000);

        // Revalidate all HBS pages since branding is global
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              paths: ["/hbs", "/hbs/about", "/hbs/services", "/hbs/projects", "/hbs/contact", "/hbs/why-choose-us"],
              tags: ["hbs-content"],
            }),
          });
        } catch {}
      } else {
        setMessage({ text: json.error || "Failed to save branding settings.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const activeLightLogo = content.logoPrimary || "/hibuild-logo.png";
  const activeDarkLogo = content.logoDark || "/hibuild-logo.png";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
        <span className="text-xs uppercase tracking-widest font-mono text-slate-500 font-semibold">
          Loading Branding &amp; Logo CMS...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-24">
      {/* Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Hind Build" }, { label: "Brand & Logos" }]}
        title="Brand Identity &amp; Logo Management"
        description="Manage official brand logos, navbar logo assets, and social favicons with live instant preview."
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefaultLogo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-200/90 rounded-xl shadow-xs transition-all backdrop-blur-md"
            title="Reset to default HiBUILD logo"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Default Logo</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all shadow-[0_4px_14px_rgba(239,68,68,0.35)] disabled:opacity-50 min-h-[38px]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : savedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Saved Live</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Branding</span>
              </>
            )}
          </button>
        </div>
      </HbsAdminPageHeader>

      {/* Save Message Notification */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${
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
          LIVE PREVIEW: LIGHT & DARK BRAND PRESENTATION
      ───────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Light Surface Preview */}
        <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Live Preview: Light Background (Navbar &amp; Footer)
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Active
            </span>
          </div>
          <div className="h-28 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeLightLogo}
              alt="Active Light Logo"
              className="max-h-16 w-auto object-contain"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Current source: <code className="text-slate-600 font-mono font-bold truncate inline-block max-w-[280px] align-bottom">{activeLightLogo}</code>
          </p>
        </div>

        {/* Dark Surface Preview */}
        <div className="relative bg-[#0D2D5E] border border-blue-900 rounded-3xl p-6 shadow-xs space-y-3 text-white">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-200">
              Live Preview: Deep Blue / Inverted Surface
            </span>
            <span className="text-[10px] font-mono text-blue-200 bg-white/10 px-2 py-0.5 rounded-full font-bold">
              Inverted
            </span>
          </div>
          <div className="h-28 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeDarkLogo}
              alt="Active Dark Logo"
              className="max-h-16 w-auto object-contain"
            />
          </div>
          <p className="text-[11px] text-blue-200/70">
            Current source: <code className="text-white font-mono font-bold truncate inline-block max-w-[280px] align-bottom">{activeDarkLogo}</code>
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Identity */}
        <SectionCard
          title="Brand Identity & Taglines"
          subtitle="Public brand titles used for meta branding, browser titles, and legal credits"
          icon={Palette}
          badge="Global"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Brand Name
              </label>
              <input
                type="text"
                value={content.brandName || ""}
                onChange={(e) => handleChange("brandName", e.target.value)}
                placeholder="Hind Building Solutions (HiBUILD)"
                className="w-full text-xs font-bold p-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-400 focus:bg-white text-slate-900 transition-all"
              />
              <p className="text-[11px] text-slate-400">Used across navigation, footer, and page title tags.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Official Tagline
              </label>
              <input
                type="text"
                value={content.tagline || ""}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="Repair. Protect. Maintain. Build Better."
                className="w-full text-xs p-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-400 focus:bg-white text-slate-700 transition-all"
              />
              <p className="text-[11px] text-slate-400">Displayed in footer description and secondary branding headers.</p>
            </div>
          </div>
        </SectionCard>

        {/* Logo Assets */}
        <SectionCard
          title="High-Resolution Logo Uploaders"
          subtitle="Upload high-res SVG or transparent PNG files. Changes apply immediately to Header & Footer."
          icon={ImageIcon}
          badge="Assets"
        >
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-blue-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Recommended Resolution &amp; Formats:</strong>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                For perfect clarity on Retina and 4K displays, use vector <strong>.SVG</strong> or high-res <strong>.PNG (1200×330px transparent)</strong>. All uploads are securely processed via Cloudinary.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HbsImageUploader
              label="Primary Logo (Light Backgrounds)"
              value={content.logoPrimary || ""}
              onChange={(url) => handleChange("logoPrimary", url)}
              folder="hbs/branding"
              recommendedSize="Vector SVG or 1200×330px PNG"
              aspectRatioHint="3.5:1"
              previewHeight="h-24"
              description="Used in Header Navbar and Footer on white/light backgrounds"
            />

            <HbsImageUploader
              label="Dark / Reverse Logo (Dark Backgrounds)"
              value={content.logoDark || ""}
              onChange={(url) => handleChange("logoDark", url)}
              folder="hbs/branding"
              recommendedSize="Vector SVG or 1200×330px PNG"
              aspectRatioHint="3.5:1"
              previewHeight="h-24"
              description="Used on deep architectural blue hero overlays and dark banners"
            />

            <HbsImageUploader
              label="Mobile Compact Logo (Optional)"
              value={content.logoMobile || ""}
              onChange={(url) => handleChange("logoMobile", url)}
              folder="hbs/branding"
              recommendedSize="Vector SVG or 400×110px PNG"
              aspectRatioHint="3.5:1"
              previewHeight="h-24"
              description="Compact logo used inside the mobile navigation drawer"
            />

            <HbsImageUploader
              label="Logo Mark / Monogram (Optional)"
              value={content.logoMark || ""}
              onChange={(url) => handleChange("logoMark", url)}
              folder="hbs/branding"
              recommendedSize="512×512px Square PNG"
              aspectRatioHint="1:1"
              previewHeight="h-24"
              description="Standalone brand icon emblem without text"
            />
          </div>
        </SectionCard>

        {/* Favicon & Social Meta */}
        <SectionCard
          title="Browser Tab Favicon &amp; Social Previews"
          subtitle="Browser tab icon and default banner displayed when sharing links on WhatsApp / Social Media"
          icon={Palette}
          badge="Meta"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HbsImageUploader
              label="Browser Tab Favicon (.png / .ico)"
              value={content.favicon || ""}
              onChange={(url) => handleChange("favicon", url)}
              folder="hbs/branding"
              recommendedSize="64×64px or 128×128px"
              aspectRatioHint="1:1"
              previewHeight="h-24"
              description="Icon displayed on browser tabs next to page title"
            />

            <HbsImageUploader
              label="Default OpenGraph Banner (Social Share)"
              value={content.ogDefaultImage || ""}
              onChange={(url) => handleChange("ogDefaultImage", url)}
              folder="hbs/branding"
              recommendedSize="1200×630px High-Res"
              aspectRatioHint="1.91:1"
              previewHeight="h-24"
              description="Banner preview displayed when links are shared on WhatsApp and LinkedIn"
            />
          </div>
        </SectionCard>
      </form>

      {/* ─────────────────────────────────────────────────────────────────
          STICKY BOTTOM FLOATING ACTION BAR
      ───────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[calc(100%-2rem)] bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2 pl-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 truncate">
            {savedRecently ? "High-res branding saved & live!" : "Branding & Logos Editor"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all shadow-[0_4px_14px_rgba(239,68,68,0.35)] disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : savedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Saved Live</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Branding</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
