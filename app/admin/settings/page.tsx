"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Cloud } from "lucide-react";
import type { Settings } from "@/lib/types";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({ cloudinaryCloudName: "", cloudinaryUploadPreset: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
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
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Global Settings</h1>
        <p className="text-slate-500 text-sm">Manage site-wide configuration and third-party integrations.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Cloudinary Section */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Cloud className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Cloudinary Integration</h2>
              <p className="text-slate-500 text-xs mt-0.5">Configure cloud storage for image uploads.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Cloud Name</label>
              <input 
                type="text" 
                value={settings.cloudinaryCloudName || ""} 
                onChange={(e) => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
                placeholder="e.g. dxyz123ab"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all placeholder:text-slate-400" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Unsigned Upload Preset</label>
              <input 
                type="text" 
                value={settings.cloudinaryUploadPreset || ""} 
                onChange={(e) => setSettings({ ...settings, cloudinaryUploadPreset: e.target.value })}
                placeholder="e.g. my_preset"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all placeholder:text-slate-400" 
              />
              <p className="text-slate-500 text-xs mt-2">
                Make sure your Upload Preset in Cloudinary is set to <strong className="text-slate-700">Unsigned</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
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
            className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
