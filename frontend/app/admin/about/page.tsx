"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Info, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Settings } from "@/lib/types";

export default function AdminAbout() {
  const [settings, setSettings] = useState<Settings>({ cloudinaryCloudName: "", cloudinaryUploadPreset: "" });

  const [content, setContent] = useState({
    aboutHero: "Building sustainable infrastructure, landmark commercial developments, and luxury residences across India with uncompromising integrity.",
    aboutHeritageTag: "Our Heritage",
    aboutStoryTitle: "Building Infrastructure Since 1999",
    aboutStory: "Founded in 1999, Hindustan Projects began with a vision to revolutionize urban infrastructure and civil engineering. Over two decades of relentless commitment to craftsmanship has earned us a reputation as one of the most trusted construction firms in the nation.\n\nWe have successfully executed over 500 high-impact projects ranging from luxury residential communities to multi-story commercial towers and state-of-the-art industrial logistics hubs.\n\nOur multidisciplinary team of 200+ structural engineers, chartered architects, and project directors ensures every project is delivered on schedule, within budget, and to international safety benchmarks.",
    aboutChecklist: "ISO 9001:2015 Certified Operations\nNational Excellence Awards Winner\nZero-Accident Safety Protocol\nComprehensive 10-Year Warranty",
    aboutImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=85",
    aboutBadge1Label: "ESTABLISHED",
    aboutBadge1Value: "1999",
    aboutBadge2Label: "PROJECTS HANDED OVER",
    aboutBadge2Value: "500+",
    valuesTag: "Principles",
    valuesTitle: "Our Core Values",
    valuesSubtitle: "The foundational pillars guiding every blueprint, site inspection, and client relationship."
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
          
          if (data.data.pageContent) {
            try {
              const parsedContent = JSON.parse(data.data.pageContent);
              setContent((prev) => ({ ...prev, ...parsedContent }));
            } catch { /* silent fallback */ }
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    // Read current settings' pageContent and merge
    let currentParsed = {};
    try {
      if (settings.pageContent) currentParsed = JSON.parse(settings.pageContent);
    } catch { /* silent */ }

    const mergedContent = {
      ...currentParsed,
      ...content,
    };

    const payload = {
      ...settings,
      pageContent: JSON.stringify(mergedContent),
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "About Us page content saved successfully!", type: "success" });
      } else {
        setMessage({ text: data.error || "Failed to save content.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    }
    setSaving(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 font-medium">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-construction-navy" /> Loading About Us settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">About Us Content Editor</h1>
          <p className="text-slate-500 text-sm">Customize all text sections, story paragraphs, and images for the public About page.</p>
        </div>
        
        {/* View Toggle Tabs */}
        <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-none-none w-fit">
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "editor" ? "bg-white text-construction-navy shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "preview" ? "bg-white text-construction-navy shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {activeTab === "preview" ? (
        <div className="w-full bg-slate-100 border border-slate-200 rounded-none-none overflow-hidden relative" style={{ height: "calc(100vh - 180px)", minHeight: "800px" }}>
          <div className="absolute top-0 left-0 right-0 bg-slate-800 text-white text-xs font-bold px-4 py-2 flex items-center justify-between z-10">
            <span>LIVE PAGE PREVIEW</span>
            <span className="text-slate-400 font-normal">Save changes in Editor tab to refresh</span>
          </div>
          <iframe 
            src="/about" 
            className="w-full h-full pt-8 border-none bg-white" 
            title="About Us Preview"
          />
        </div>
      ) : (
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-none-none shadow-sm overflow-hidden space-y-0">
        
        {/* ── 1. Hero Section ─────────────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none-none bg-blue-50 flex items-center justify-center border border-blue-100">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Hero Header Section</h2>
              <p className="text-slate-500 text-xs mt-0.5">Top banner text displayed at the start of the About Us page.</p>
            </div>
          </div>

          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Hero Subtitle / Main Description</label>
            <textarea 
              rows={3}
              value={content.aboutHero} 
              onChange={(e) => setContent({ ...content, aboutHero: e.target.value })}
              placeholder="Building sustainable infrastructure..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all leading-relaxed" 
            />
          </div>
        </div>

        {/* ── 2. Our Heritage / Story Section ────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none-none bg-red-50 flex items-center justify-center border border-red-100">
              <ShieldCheck className="w-5 h-5 text-construction-red" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Our Heritage & Story Section</h2>
              <p className="text-slate-500 text-xs mt-0.5">Company history, narrative paragraphs, and team photo.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Badge Tag Text</label>
                <input 
                  type="text" 
                  value={content.aboutHeritageTag} 
                  onChange={(e) => setContent({ ...content, aboutHeritageTag: e.target.value })}
                  placeholder="e.g. Our Heritage"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-medium" 
                />
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Main Section Heading</label>
                <input 
                  type="text" 
                  value={content.aboutStoryTitle} 
                  onChange={(e) => setContent({ ...content, aboutStoryTitle: e.target.value })}
                  placeholder="e.g. Building Infrastructure Since 1999"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-medium" 
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                Story Paragraphs (Separate paragraphs with blank lines / double Enter)
              </label>
              <textarea 
                rows={7}
                value={content.aboutStory} 
                onChange={(e) => setContent({ ...content, aboutStory: e.target.value })}
                placeholder="Paragraph 1...\n\nParagraph 2...\n\nParagraph 3..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all leading-relaxed" 
              />
            </div>

            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                Checklist Bullet Points (One point per line)
              </label>
              <textarea 
                rows={4}
                value={content.aboutChecklist} 
                onChange={(e) => setContent({ ...content, aboutChecklist: e.target.value })}
                placeholder="ISO 9001:2015 Certified Operations\nNational Excellence Awards Winner\nZero-Accident Safety Protocol"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>

            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Heritage Image Photo</label>
              <ImageUpload 
                value={content.aboutImage} 
                onChange={(url) => setContent({ ...content, aboutImage: url })} 
              />
            </div>

            {/* Floating Badges on Image */}
            <div className="pt-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-3 font-bold">Image Floating Badge Overlays</label>
              <div className="grid md:grid-cols-2 gap-4 bg-slate-100/70 p-4 border border-slate-200">
                <div>
                  <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1 font-bold">Bottom-Left Badge Label</label>
                  <input 
                    type="text" 
                    value={content.aboutBadge1Label} 
                    onChange={(e) => setContent({ ...content, aboutBadge1Label: e.target.value })}
                    placeholder="e.g. ESTABLISHED"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-none-none px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy" 
                  />
                  <label className="text-slate-500 text-[11px] uppercase tracking-wider block mt-2 mb-1 font-bold">Bottom-Left Badge Value</label>
                  <input 
                    type="text" 
                    value={content.aboutBadge1Value} 
                    onChange={(e) => setContent({ ...content, aboutBadge1Value: e.target.value })}
                    placeholder="e.g. 1999"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-none-none px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy font-bold" 
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1 font-bold">Top-Right Badge Label</label>
                  <input 
                    type="text" 
                    value={content.aboutBadge2Label} 
                    onChange={(e) => setContent({ ...content, aboutBadge2Label: e.target.value })}
                    placeholder="e.g. PROJECTS HANDED OVER"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-none-none px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy" 
                  />
                  <label className="text-slate-500 text-[11px] uppercase tracking-wider block mt-2 mb-1 font-bold">Top-Right Badge Value</label>
                  <input 
                    type="text" 
                    value={content.aboutBadge2Value} 
                    onChange={(e) => setContent({ ...content, aboutBadge2Value: e.target.value })}
                    placeholder="e.g. 500+"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-none-none px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy font-bold text-construction-red" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Core Values Section ──────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none-none bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Core Values Header</h2>
              <p className="text-slate-500 text-xs mt-0.5">Title and badge text for the Principles & Core Values section.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Badge Tag Text</label>
                <input 
                  type="text" 
                  value={content.valuesTag} 
                  onChange={(e) => setContent({ ...content, valuesTag: e.target.value })}
                  placeholder="e.g. Principles"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-medium" 
                />
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Main Section Heading</label>
                <input 
                  type="text" 
                  value={content.valuesTitle} 
                  onChange={(e) => setContent({ ...content, valuesTitle: e.target.value })}
                  placeholder="e.g. Our Core Values"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-medium" 
                />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Section Subtitle</label>
              <input 
                type="text" 
                value={content.valuesSubtitle} 
                onChange={(e) => setContent({ ...content, valuesSubtitle: e.target.value })}
                placeholder="e.g. The foundational pillars guiding every blueprint..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
          </div>
        </div>

        {/* ── Form Actions ───────────────────────────────────── */}
        <div className="bg-slate-50 p-6 flex items-center justify-between">
          <div>
            {message.text && (
              <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            )}
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-6 py-2.5 rounded-none-none text-sm font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save About Us Content"}
          </button>
        </div>

      </form>
      )}
    </div>
  );
}
