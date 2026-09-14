"use client";

import { useState, useEffect } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  X,
  Link as LinkIcon,
  Check,
  Copy,
  ExternalLink
} from "lucide-react";
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
  const [activeMode, setActiveMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setSettings(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName =
      settings?.cloudinaryCloudName ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      "fczoredh";
    const uploadPreset =
      settings?.cloudinaryUploadPreset ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      "ml_default";

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.secure_url) {
        onChange(data.secure_url);
        setUrlInput("");
      } else {
        const msg = data.error?.message || "Upload failed";
        if (
          msg.toLowerCase().includes("unsigned") ||
          msg.toLowerCase().includes("whitelist")
        ) {
          setError(
            `Upload preset '${uploadPreset}' must be set to 'Unsigned' in Cloudinary. Alternatively, paste the image URL directly using the 'Direct URL' tab.`
          );
        } else {
          setError(`${msg} (You can also paste an image URL directly)`);
        }
      }
    } catch {
      setError(
        "Network error during upload. Please check connection or paste an image URL directly."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleApplyUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput("");
    setError("");
  };

  const copyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-28 bg-slate-50 flex items-center justify-center border border-slate-200 animate-pulse text-xs text-slate-400">
        Loading upload provider...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <span className="font-bold">Error:</span>
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {value ? (
        <div className="border border-slate-200 bg-slate-50 p-2.5 space-y-2">
          <div className="relative h-44 w-full bg-slate-900/5 flex items-center justify-center overflow-hidden border border-slate-200">
            <img
              src={value}
              alt="Active selection"
              className="max-h-full max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={value}
              className="flex-1 text-[11px] font-mono px-2 py-1.5 bg-white border border-slate-200 text-slate-600 truncate select-all"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs flex items-center gap-1 transition-colors"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs flex items-center gap-1 transition-colors"
              title="Open link in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="border border-slate-300 bg-white">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveMode("upload")}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 transition-colors ${
                activeMode === "upload"
                  ? "bg-white text-construction-navy border-b-2 border-construction-navy"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" /> Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("url")}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 transition-colors ${
                activeMode === "url"
                  ? "bg-white text-construction-navy border-b-2 border-construction-navy"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Paste Image URL
            </button>
          </div>

          {activeMode === "upload" ? (
            <label
              className={`
                h-32 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50 p-4 text-center
                ${uploading ? "opacity-50 pointer-events-none" : ""}
              `}
            >
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
                  <span className="text-construction-navy text-xs font-bold uppercase tracking-wider">
                    Uploading image...
                  </span>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-600">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                    Click or Drag to Upload
                  </span>
                  <span className="text-slate-400 text-[11px] mt-0.5">
                    Supports JPG, PNG, WEBP, SVG
                  </span>
                </>
              )}
            </label>
          ) : (
            <form onSubmit={handleApplyUrl} className="p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-construction-navy"
                />
                <button
                  type="submit"
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 bg-construction-navy hover:bg-construction-slate text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors"
                >
                  Apply URL
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                You can paste direct image links from Cloudinary, Unsplash, Google Drive, or any image host.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
