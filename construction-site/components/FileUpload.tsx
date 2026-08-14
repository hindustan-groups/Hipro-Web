"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileText, Loader2, X, AlertCircle } from "lucide-react";
import type { Settings } from "@/lib/types";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function FileUpload({ value, onChange, label = "Upload Resume/CV" }: FileUploadProps) {
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
      setError("Cloudinary is not configured. Please contact the administrator.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", settings.cloudinaryUploadPreset);

    try {
      // Using /auto/upload to support pdf, doc, docx instead of just /image/upload
      const res = await fetch(`https://api.cloudinary.com/v1_1/${settings.cloudinaryCloudName}/auto/upload`, {
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
    return <div className="h-32 bg-slate-50 rounded-none flex items-center justify-center border border-slate-200 animate-pulse" />;
  }

  const isConfigured = settings?.cloudinaryCloudName && settings?.cloudinaryUploadPreset;

  if (!isConfigured) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-none p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-red-400 text-sm font-medium">Upload Disabled</p>
          <p className="text-red-400/80 text-xs mt-1">Our system is currently missing configuration to process uploads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
      
      {value ? (
        <div className="relative rounded-none overflow-hidden border border-slate-200 bg-slate-50 flex items-center p-4">
          <FileText className="w-8 h-8 text-construction-red mr-4 shrink-0" />
          <div className="flex-1 truncate pr-8">
            <p className="text-sm font-bold text-slate-800 truncate">Document Uploaded Successfully</p>
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
              View File
            </a>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-none flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className={`
          border-2 border-dashed border-slate-300 hover:border-construction-navy bg-slate-50 hover:bg-slate-100 
          rounded-none h-32 flex flex-col items-center justify-center cursor-pointer transition-all
          ${uploading ? "opacity-50 pointer-events-none" : ""}
        `}>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx" 
            className="hidden" 
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-construction-navy animate-spin mb-2" />
              <span className="text-construction-navy text-xs font-medium">Uploading Document...</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-slate-600 text-sm font-medium">{label}</span>
              <span className="text-slate-400 text-xs mt-1">Supports PDF, DOC, DOCX</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
