"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Compass,
  Globe,
  Code2,
  Share2
} from "lucide-react";
import type { HbsContent } from "@/lib/types";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";

export default function HbsAdminSeo() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
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

    try {
      const res = await fetch("/api/hbs/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(content),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ text: "HBS SEO settings saved successfully!", type: "success" });
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
        setMessage({ text: json.error || "Failed to save SEO settings.", type: "error" });
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
        <span className="text-xs uppercase tracking-wider font-mono">Loading SEO Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-5xl">
      {/* Apple-minimal Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "SEO" }]}
        title="SEO & Metadata"
        description="Manage meta tags, search engine descriptions, OpenGraph share previews, and JSON-LD schema data."
      >
        <button
          onClick={loadData}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </HbsAdminPageHeader>

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
        {/* Meta Tags */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600" />
            <span>Search Engine Meta Tags</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Default Meta Title (Title Tag)
            </label>
            <input
              type="text"
              value={content.metaTitle || "Hind Build | Building Repair, Maintenance & Renovation Rajasthan"}
              onChange={(e) => handleChange("metaTitle", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-medium"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Optimal length: 50–60 characters. Recommended format: Brand | Core Services | Region.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={
                content.metaDescription ||
                "Hind Build, an engineering division under Hindustan Projects, delivers turnkey structural repair, waterproofing, painting, electrical, bird netting, and turnkey specialized building maintenance services across Rajasthan."
              }
              onChange={(e) => handleChange("metaDescription", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Optimal length: 140–160 characters. Displayed in Google search snippets.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Canonical Subdomain URL
            </label>
            <input
              type="text"
              value={content.canonicalUrl || "https://hindbuilding.hindustanprojects.in"}
              onChange={(e) => handleChange("canonicalUrl", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Social Card Images (OG & Twitter) */}
        <div className="bg-white border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-600" />
                <span>Social Share Cards (OpenGraph & Twitter)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload custom social banners. If left empty, HBS uses the Default OG Image from Brand Settings.
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 font-bold uppercase tracking-wider self-start sm:self-auto">
              Folder: hbs/seo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <HbsImageUploader
                value={content.ogImage || ""}
                onChange={(url) => handleChange("ogImage", url)}
                folder="hbs/seo"
                label="OpenGraph Share Image (WhatsApp / Facebook / LinkedIn)"
                description="Preview card banner when links to HBS are shared on WhatsApp, Facebook, or LinkedIn."
                recommendedSize="1200×630px"
                aspectRatioHint="1.91:1"
                previewHeight="h-36"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <HbsImageUploader
                value={content.twitterImage || ""}
                onChange={(url) => handleChange("twitterImage", url)}
                folder="hbs/seo"
                label="Twitter / X Summary Card Image"
                description="High-resolution banner displayed in Twitter summary_large_image cards."
                recommendedSize="1200×600px"
                aspectRatioHint="2:1"
                previewHeight="h-36"
              />
            </div>
          </div>
        </div>

        {/* Isolated Schema Markup Preview */}
        <div className="bg-white border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-600" />
              <span>Isolated JSON-LD Structured Data Schema</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-bold">
              Isolated from HiPRO Root
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            HBS uses dedicated <code>HomeAndConstructionBusiness</code> / <code>GeneralContractor</code> structured data linked hierarchically via <code>parentOrganization</code> to Hindustan Projects. This guarantees zero schema conflicts with HiPRO flagship pages.
          </p>

          <pre className="bg-slate-950 text-amber-400 p-4 text-[11px] font-mono overflow-x-auto rounded-none">
{`{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "Hind Build",
  "alternateName": "Hind Build Rajasthan",
  "description": "Complete building maintenance, structural repair, and turnkey facility care.",
  "parentOrganization": {
    "@type": "Organization",
    "name": "Hindustan Projects (HiPRO)",
    "url": "https://www.hindustanprojects.in"
  },
  "areaServed": "Rajasthan, India",
  "priceRange": "₹₹"
}`}
          </pre>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving SEO Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All SEO Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
