"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Compass,
  Globe,
  Share2,
  Code2,
  ShieldCheck
} from "lucide-react";
import type { HbsContent } from "@/lib/types";

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
            body: JSON.stringify({ paths: ["/hbs", "/hbs/about", "/hbs/services", "/hbs/projects", "/hbs/contact"] }),
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
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            SEO & Metadata CMS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
            HBS Search & Social Optimization
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage meta tags, search engine descriptions, canonical domains, and isolated HBS schema data.
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
              value={content.metaTitle || "Hind Building Solutions | Building Repair, Maintenance & Renovation Rajasthan"}
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
                "Hind Building Solutions (HBS), a division of Hindustan Projects, delivers turnkey structural repair, waterproofing, painting, electrical, bird netting, and 19 specialized building maintenance services across Rajasthan."
              }
              onChange={(e) => handleChange("metaDescription", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Optimal length: 140–160 characters. Displayed in Google search snippets.
            </span>
          </div>
        </div>

        {/* Canonical Subdomain & Social Preview */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600" />
            <span>Subdomain & OpenGraph Social Sharing</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Subdomain URL (Post-Subdomain Activation)
              </label>
              <input
                type="text"
                disabled
                value="https://hindbuilding.hindustanprojects.in"
                className="w-full text-xs border border-slate-200 p-2.5 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Reserved for Phase 3 subdomain activation. Currently operating under <code>/hbs</code>.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                OpenGraph Share Image URL
              </label>
              <input
                type="text"
                value="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80"
                disabled
                className="w-full text-xs border border-slate-200 p-2.5 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
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
  "name": "Hind Building Solutions",
  "alternateName": "HBS",
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
                <span>Save SEO Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
