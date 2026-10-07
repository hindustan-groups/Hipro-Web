"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Palette,
  ExternalLink,
  Info
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
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 p-6 space-y-5">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
            {title}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function HbsAdminBranding() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setMessage({ text: "Branding settings saved successfully. Changes are now live.", type: "success" });
        // Revalidate all HBS pages since branding is global
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/hbs", "/hbs/about", "/hbs/services", "/hbs/projects", "/hbs/contact"] }),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-xs uppercase tracking-wider font-mono">Loading Branding CMS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Apple-minimal Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Branding" }]}
        title="Branding & Logos"
        description="Manage logos, favicon, OG images, and visual brand identity assets."
      >
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </HbsAdminPageHeader>

      {/* Save Message */}
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

        {/* Brand Identity */}
        <SectionCard
          title="Brand Name & Tagline"
          subtitle="Public-facing brand name and tagline used across all pages"
          icon={Palette}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={content.brandName || ""}
                onChange={(e) => handleChange("brandName", e.target.value)}
                placeholder="Hind Build"
                className="w-full px-3 py-2.5 text-sm border border-slate-300 focus:outline-none focus:border-amber-600 font-sans"
              />
              <p className="text-[10px] text-slate-400 mt-1">Used in navbar, footer, page titles.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={content.tagline || ""}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="Repair. Restore. Reinforce."
                className="w-full px-3 py-2.5 text-sm border border-slate-300 focus:outline-none focus:border-amber-600 font-sans"
              />
              <p className="text-[10px] text-slate-400 mt-1">Appears in footer and some hero variants.</p>
            </div>
          </div>
        </SectionCard>

        {/* Logos */}
        <SectionCard
          title="Logo Assets"
          subtitle="Upload logo variants for different contexts. All logos are served from Cloudinary."
          icon={Palette}
        >
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2 mb-4">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <strong>Logo Usage Guide:</strong>
              <ul className="mt-1 space-y-0.5 text-[11px]">
                <li><strong>Primary Logo</strong> — Main logo on light backgrounds (navbar, header)</li>
                <li><strong>Dark Logo</strong> — Logo variant for dark backgrounds (hero overlays, dark navbar)</li>
                <li><strong>Logo Mark</strong> — Icon/symbol only, no text (favicon-like, small space usage)</li>
                <li><strong>Mobile Logo</strong> — Compact version for mobile navbar</li>
                <li><strong>Legacy Logo</strong> — Previous/fallback logo URL (used if Primary not set)</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HbsImageUploader
              label="Primary Logo (Light BG)"
              value={content.logoPrimary}
              onChange={(url) => handleChange("logoPrimary", url)}
              folder="hbs/branding"
              recommendedSize="320×80px"
              aspectRatioHint="4:1"
              previewHeight="h-24"
              description="Used in navbar on light/white backgrounds"
            />
            <HbsImageUploader
              label="Dark / Inverted Logo"
              value={content.logoDark}
              onChange={(url) => handleChange("logoDark", url)}
              folder="hbs/branding"
              recommendedSize="320×80px"
              aspectRatioHint="4:1"
              previewHeight="h-24"
              description="Used on dark hero sections or dark navbar"
            />
            <HbsImageUploader
              label="Logo Mark (Icon Only)"
              value={content.logoMark}
              onChange={(url) => handleChange("logoMark", url)}
              folder="hbs/branding"
              recommendedSize="128×128px"
              aspectRatioHint="1:1"
              previewHeight="h-24"
              description="Standalone icon without brand text"
            />
            <HbsImageUploader
              label="Mobile Logo"
              value={content.logoMobile}
              onChange={(url) => handleChange("logoMobile", url)}
              folder="hbs/branding"
              recommendedSize="160×40px"
              aspectRatioHint="4:1"
              previewHeight="h-24"
              description="Compact logo for mobile navigation"
            />
            <HbsImageUploader
              label="Legacy / Fallback Logo"
              value={content.logo}
              onChange={(url) => handleChange("logo", url)}
              folder="hbs/branding"
              recommendedSize="320×80px"
              aspectRatioHint="4:1"
              previewHeight="h-24"
              description="Used as fallback if Primary Logo is not set"
            />
          </div>
        </SectionCard>

        {/* Favicon & OG Image */}
        <SectionCard
          title="Favicon & Social Sharing"
          subtitle="Browser tab icon and default Open Graph image for social sharing previews"
          icon={Palette}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HbsImageUploader
              label="Favicon (.ico / .png)"
              value={content.favicon}
              onChange={(url) => handleChange("favicon", url)}
              folder="hbs/branding"
              recommendedSize="32×32px or 64×64px"
              aspectRatioHint="1:1"
              previewHeight="h-24"
              description="Browser tab icon. PNG or ICO format recommended. Minimum 32×32px."
            />
            <HbsImageUploader
              label="Default OG Image (Social Share)"
              value={content.ogDefaultImage}
              onChange={(url) => handleChange("ogDefaultImage", url)}
              folder="hbs/branding"
              recommendedSize="1200×630px"
              aspectRatioHint="1.91:1"
              previewHeight="h-24"
              description="Shown when Hind Build pages are shared on WhatsApp, Facebook, Twitter, LinkedIn."
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              OG images display when pages are shared on social media. The default OG Image is used for all pages unless a page-specific one is set in the SEO section.
              <a
                href="https://developers.facebook.com/tools/debug/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-0.5 text-amber-700 hover:underline font-medium"
              >
                Test on Facebook Debugger <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        </SectionCard>

        {/* Save Button */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Branding...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Branding Settings</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400">
            Saves brand name, tagline, logos, favicon & OG image. All other settings are unchanged.
          </p>
        </div>

      </form>
    </div>
  );
}
