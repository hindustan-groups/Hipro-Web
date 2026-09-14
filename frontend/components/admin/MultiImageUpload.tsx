"use client";

import { useState } from "react";
import { UploadCloud, Loader2, X, Plus } from "lucide-react";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function MultiImageUpload({ value = [], onChange }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 5MB maximum limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        } else {
          setError(data.error || "Error uploading some images");
        }
      } catch {
        setError("Error uploading some images");
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
    }
    setUploading(false);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...value, urlInput.trim()]);
    setUrlInput("");
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

      {/* Grid of uploaded images */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {value.map((url, idx) => (
            <div key={idx} className="relative group h-24 rounded-none-none overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
              <img src={url} alt={`Project photo ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-none-none flex items-center justify-center transition-colors z-10"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-none-none">
                #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button & URL Add option */}
      <div className="space-y-3">
        <label className={`
          border-2 border-dashed border-slate-300 hover:border-construction-navy bg-slate-50 hover:bg-slate-100 
          rounded-none-none py-6 flex flex-col items-center justify-center cursor-pointer transition-all
          ${uploading ? "opacity-50 pointer-events-none" : ""}
        `}>
          <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
          {uploading ? (
            <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
              <Loader2 className="w-5 h-5 animate-spin text-construction-navy" /> Uploading project images...
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Click to select multiple project images
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP (Upload multiple files at once, max 5MB each)</span>
            </div>
          )}
        </label>

        {/* Option to add by URL */}
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="flex items-center gap-1 bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-none-none text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Image
          </button>
        </div>
      </div>
    </div>
  );
}
