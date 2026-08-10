"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Cloud, Share2, Phone, MapPin, Mail } from "lucide-react";
import type { Settings } from "@/lib/types";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({ cloudinaryCloudName: "", cloudinaryUploadPreset: "" });
  
  // Structured state for socials
  const [socials, setSocials] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: ""
  });

  const [projectsHeader, setProjectsHeader] = useState("Landmarks In The Making");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
          
          if (data.data.socialLinks) {
            try {
              const parsedSocials = JSON.parse(data.data.socialLinks);
              setSocials((prev) => ({ ...prev, ...parsedSocials }));
            } catch { /* silent fallback */ }
          }

          if (data.data.pageContent) {
            try {
              const parsedContent = JSON.parse(data.data.pageContent);
              if (parsedContent.projectsHeader) setProjectsHeader(parsedContent.projectsHeader);
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

    // Preserve existing pageContent keys when updating projectsHeader
    let currentParsed = {};
    try {
      if (settings.pageContent) currentParsed = JSON.parse(settings.pageContent);
    } catch { /* silent */ }

    const payload = {
      ...settings,
      socialLinks: JSON.stringify(socials),
      pageContent: JSON.stringify({
        ...currentParsed,
        projectsHeader,
      }),
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Settings saved successfully!", type: "success" });
      } else {
        setMessage({ text: data.error || "Failed to save settings.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    }
    setSaving(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 font-medium">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-construction-navy" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Global Settings</h1>
        <p className="text-slate-500 text-sm">Manage site-wide contact info, social channels, and Cloudinary keys.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden space-y-0">
        
        {/* ── 1. Cloudinary Integration ────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none bg-blue-50 flex items-center justify-center border border-blue-100">
              <Cloud className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Cloudinary Integration</h2>
              <p className="text-slate-500 text-xs mt-0.5">Configure cloud storage for image uploads.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Cloud Name</label>
              <input 
                type="text" 
                value={settings.cloudinaryCloudName || ""} 
                onChange={(e) => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
                placeholder="e.g. dxyz123ab"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all placeholder:text-slate-400 font-mono" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Unsigned Upload Preset</label>
              <input 
                type="text" 
                value={settings.cloudinaryUploadPreset || ""} 
                onChange={(e) => setSettings({ ...settings, cloudinaryUploadPreset: e.target.value })}
                placeholder="e.g. my_preset"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all placeholder:text-slate-400 font-mono" 
              />
            </div>
          </div>
        </div>

        {/* ── 2. Contact Details ───────────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none bg-slate-100 flex items-center justify-center border border-slate-200">
              <Phone className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Company Contact Information</h2>
              <p className="text-slate-500 text-xs mt-0.5">Appears in footer and on the Contact page.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Email Address</label>
              <input 
                type="email" 
                value={settings.companyEmail || ""} 
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                placeholder="contact@hindustanprojects.com"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Phone Number</label>
              <input 
                type="text" 
                value={settings.companyPhone || ""} 
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Headquarters Address</label>
              <input 
                type="text" 
                value={settings.companyAddress || ""} 
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                placeholder="101 Executive Tower, Infrastructure Complex, New Delhi, India"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
          </div>
        </div>

        {/* ── 3. Social Media Links ────────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none bg-red-50 flex items-center justify-center border border-red-100">
              <Share2 className="w-5 h-5 text-construction-red" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Social Media Links</h2>
              <p className="text-slate-500 text-xs mt-0.5">Links will render in the website footer.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Facebook URL</label>
              <input 
                type="url" 
                value={socials.facebook} 
                onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                placeholder="https://facebook.com/your-page"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Twitter / X URL</label>
              <input 
                type="url" 
                value={socials.twitter} 
                onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                placeholder="https://twitter.com/your-handle"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Instagram URL</label>
              <input 
                type="url" 
                value={socials.instagram} 
                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                placeholder="https://instagram.com/your-profile"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">LinkedIn URL</label>
              <input 
                type="url" 
                value={socials.linkedin} 
                onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/your-company"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
          </div>
        </div>

        {/* ── 4. Homepage Headings ────────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/20">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Homepage Section Titles</h2>
            <p className="text-slate-500 text-xs mt-0.5">Customize default section headings on the homepage.</p>
          </div>

          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Projects Section Title</label>
            <input 
              type="text" 
              value={projectsHeader} 
              onChange={(e) => setProjectsHeader(e.target.value)}
              placeholder="e.g. Landmarks In The Making"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-medium" 
            />
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
            className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-6 py-2.5 rounded-none text-sm font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
