"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Phone,
  Building2,
  Image as ImageIcon,
  Share2,
  Shield,
  BarChart3,
  ExternalLink
} from "lucide-react";
import type { HbsContent } from "@/lib/types";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";

export default function HbsAdminSettings() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  // Social links parsed state
  const [socials, setSocials] = useState<{
    instagram: string;
    facebook: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  }>({
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    youtube: "",
  });

  const loadSettings = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/content", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setContent(json.data);
        if (json.data.socialLinks) {
          try {
            const parsed = typeof json.data.socialLinks === "string"
              ? JSON.parse(json.data.socialLinks)
              : json.data.socialLinks;
            setSocials({
              instagram: parsed.instagram || "",
              facebook: parsed.facebook || "",
              linkedin: parsed.linkedin || "",
              twitter: parsed.twitter || "",
              youtube: parsed.youtube || "",
            });
          } catch {
            // keep defaults
          }
        }
      } else {
        setMessage({ text: json.error || "Failed to load HBS settings.", type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to connect to backend API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (field: keyof HbsContent, value: any) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (network: keyof typeof socials, value: string) => {
    const updated = { ...socials, [network]: value };
    setSocials(updated);
    setContent((prev) => ({
      ...prev,
      socialLinks: JSON.stringify(updated),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const payload = {
        ...content,
        socialLinks: JSON.stringify(socials),
      };

      const res = await fetch("/api/hbs/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ text: "HBS general settings saved successfully!", type: "success" });
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/hbs", "/hbs/about", "/hbs/services", "/hbs/projects", "/hbs/contact"] }),
          });
        } catch {}
      } else {
        setMessage({ text: json.error || "Failed to save settings.", type: "error" });
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
        <span className="text-xs uppercase tracking-wider font-mono">Loading HBS Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            General Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
            Hind Build Brand & Contact Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage official Hind Build branding assets, contact hotlines, WhatsApp, social channels, and legal compliance.
          </p>
        </div>

        <button
          onClick={loadSettings}
          type="button"
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

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: Brand Identity & Positioning */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Brand Identity & Positioning</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Sub-Brand Name
              </label>
              <input
                type="text"
                value={content.brandName || "Hind Build"}
                onChange={(e) => handleChange("brandName", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Parent Company Disclosure Tagline
              </label>
              <input
                type="text"
                value={content.tagline || "Complete Building Repair, Maintenance, Protection & Services"}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Official Hind Build Branding Assets */}
        <div className="bg-white border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Official &quot;Hind Build&quot; Brand Logos &amp; Assets</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload and manage dedicated Hind Build branding assets. Hind Build never falls back to the parent HiPRO logo.
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 font-bold uppercase tracking-wider self-start sm:self-auto">
              Folder: hbs/branding
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Logo */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <HbsImageUploader
                value={content.logoPrimary || ""}
                onChange={(url) => handleChange("logoPrimary", url)}
                folder="hbs/branding"
                label="Primary Logo (Light Backgrounds)"
                description="Official Hind Build logo rendered on navbar and main header areas."
                recommendedSize="240×60px"
                aspectRatioHint="4:1"
                previewHeight="h-32"
              />
            </div>

            {/* Dark Mode / Inverted Logo */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <HbsImageUploader
                value={content.logoDark || ""}
                onChange={(url) => handleChange("logoDark", url)}
                folder="hbs/branding"
                label="Dark Background Logo (Footer)"
                description="Light/white Hind Build variant optimized for dark slate-950 footer."
                recommendedSize="240×60px"
                aspectRatioHint="4:1"
                previewHeight="h-32"
              />
            </div>

            {/* Mobile Navigation Logo */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <HbsImageUploader
                value={content.logoMobile || ""}
                onChange={(url) => handleChange("logoMobile", url)}
                folder="hbs/branding"
                label="Mobile Navbar Logo"
                description="Compact Hind Build version shown on mobile screens (360px - 640px)."
                recommendedSize="160×48px"
                aspectRatioHint="3:1"
                previewHeight="h-32"
              />
            </div>

            {/* Symbol / Mark */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <HbsImageUploader
                value={content.logoMark || ""}
                onChange={(url) => handleChange("logoMark", url)}
                folder="hbs/branding"
                label="Brand Icon / Symbol Mark"
                description="Square emblem or brand symbol used in compact widgets and app icons."
                recommendedSize="128×128px"
                aspectRatioHint="1:1"
                previewHeight="h-32"
              />
            </div>

            {/* Hind Build Favicon */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <HbsImageUploader
                value={content.favicon || ""}
                onChange={(url) => handleChange("favicon", url)}
                folder="hbs/branding"
                label="Hind Build Dedicated Favicon"
                description="Isolated browser tab icon. Guarantees Hind Build never inherits parent HiPRO favicon."
                recommendedSize="48×48px"
                aspectRatioHint="1:1"
                previewHeight="h-32"
              />
            </div>

            {/* Default OpenGraph Share Image */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <HbsImageUploader
                value={content.ogDefaultImage || ""}
                onChange={(url) => handleChange("ogDefaultImage", url)}
                folder="hbs/branding"
                label="Default OG & Social Preview Image"
                description="1200×630px social banner used when WhatsApp, Facebook, or Twitter cards share Hind Build."
                recommendedSize="1200×630px"
                aspectRatioHint="1.91:1"
                previewHeight="h-32"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Hotlines & Direct Communication */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-600" />
            <span>Direct Communication & Hotlines</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Engineering Hotline (Phone)
              </label>
              <input
                type="text"
                value={content.phone || "+91 75970 00601"}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Instant WhatsApp Support Number
              </label>
              <input
                type="text"
                value={content.whatsapp || "+91 75970 00601"}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                value={content.email || "hbs@hindustanprojects.in"}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Operating / Inspection Hours
              </label>
              <input
                type="text"
                value={content.businessHours || "Mon - Sat: 9:00 AM - 7:00 PM"}
                onChange={(e) => handleChange("businessHours", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Operational Headquarters Address
            </label>
            <textarea
              rows={2}
              value={content.address || "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001"}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500"
            />
          </div>
        </div>

        {/* SECTION 4: Social Media Channels */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-600" />
              <span>Official Social Media Channels</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Displayed in HBS Footer</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Instagram Profile URL
              </label>
              <input
                type="url"
                placeholder="https://www.instagram.com/hindustan_projects/"
                value={socials.instagram}
                onChange={(e) => handleSocialChange("instagram", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                placeholder="https://facebook.com/hindustanprojects"
                value={socials.facebook}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                LinkedIn Organization URL
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/company/hindustanprojects"
                value={socials.linkedin}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                YouTube Channel URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/@hindustanprojects"
                value={socials.youtube}
                onChange={(e) => handleSocialChange("youtube", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Legal & Compliance URLs */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Legal Compliance & Terms URLs</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Privacy Policy URL
              </label>
              <input
                type="text"
                placeholder="/privacy-policy"
                value={content.privacyPolicyUrl || ""}
                onChange={(e) => handleChange("privacyPolicyUrl", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Leave empty to hide the Privacy Policy link from the footer.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Terms of Service URL
              </label>
              <input
                type="text"
                placeholder="/terms"
                value={content.termsUrl || ""}
                onChange={(e) => handleChange("termsUrl", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Leave empty to hide the Terms link from the footer.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 6: Analytics & Measurement */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Isolated HBS Analytics (GA4)</span>
          </h2>

          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Google Analytics 4 Measurement ID
            </label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={content.gaMeasurementId || ""}
              onChange={(e) => handleChange("gaMeasurementId", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Dedicated measurement ID for HBS traffic isolation. Does not alter parent HiPRO GA4 setup.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving HBS Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All HBS Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
