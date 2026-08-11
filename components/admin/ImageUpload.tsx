"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, Loader2, X, AlertCircle } from "lucide-react";
import type { Settings } from "@/lib/types";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setSettings(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!settings?.cloudinaryCloudName || !settings?.cloudinaryUploadPreset) {
      setError("Cloudinary is not configured. Please set it up in Settings.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", settings.cloudinaryUploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${settings.cloudinaryCloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        setError(data.error?.message || "Upload failed");
      }
    } catch (err) {
      setError("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="h-32 bg-slate-50 rounded-none-none flex items-center justify-center border border-slate-200 animate-pulse" />;
  }

  const isConfigured = settings?.cloudinaryCloudName && settings?.cloudinaryUploadPreset;

  if (!isConfigured) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-none-none p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-red-400 text-sm font-medium">Image Upload Disabled</p>
          <p className="text-red-400/80 text-xs mt-1">Please configure Cloudinary in the Settings panel to enable image uploads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
      
      {value ? (
        <div className="relative rounded-none-none overflow-hidden border border-slate-200 bg-slate-50 group">
          <img src={value} alt="Uploaded" className="w-full h-48 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-construction-red text-white rounded-none-none flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className={`
          border-2 border-dashed border-slate-300 hover:border-construction-navy bg-slate-50 hover:bg-slate-100 
          rounded-none-none h-32 flex flex-col items-center justify-center cursor-pointer transition-all
          ${uploading ? "opacity-50 pointer-events-none" : ""}
        `}>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-construction-navy animate-spin mb-2" />
              <span className="text-construction-navy text-xs font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-none-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-slate-600 text-sm font-medium">Click to upload image</span>
              <span className="text-slate-400 text-xs mt-1">Supports JPG, PNG, WEBP</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
