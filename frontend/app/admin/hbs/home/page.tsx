"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, CheckCircle2, AlertCircle, LayoutTemplate, Plus, Trash2, ShieldCheck, Sparkles } from "lucide-react";
import type { HbsContent } from "@/lib/types";

interface WhyChooseItem {
  title: string;
  desc: string;
}

interface StatItem {
  value: string;
  label: string;
}

export default function HbsAdminHome() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
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
          if (json.data.whyChoosePoints) {
            setWhyChoose(JSON.parse(json.data.whyChoosePoints));
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
        setMessage({ text: "HBS Home page CMS saved successfully!", type: "success" });
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
            HBS Homepage CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage the hero banner headlines, value propositions, key statistics, and call-to-actions.
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
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-amber-600" />
            <span>Hero Banner Content</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Top Badge / Tagline
            </label>
            <input
              type="text"
              value={content.tagline || "Complete Building Care · Repair · Protection · Renovation"}
              onChange={(e) => handleChange("tagline", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Main Hero Heading
            </label>
            <input
              type="text"
              value={content.heroTitle || "Precision Building Care, Repair & Protection Solutions"}
              onChange={(e) => handleChange("heroTitle", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Hero Subtitle / Description
            </label>
            <textarea
              rows={3}
              value={
                content.heroSubtitle ||
                "Specialized turnkey engineering services for commercial complexes, high-rise apartments, industrial facilities, and luxury residences across Rajasthan."
              }
              onChange={(e) => handleChange("heroSubtitle", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500"
            />
          </div>
        </div>

        {/* Why Choose HBS Points */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Why Choose HBS (Key Highlights)</span>
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
