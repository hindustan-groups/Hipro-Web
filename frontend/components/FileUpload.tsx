"use client";

import { useState } from "react";
import { Link2, FileText, X, Check } from "lucide-react";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function FileUpload({ value, onChange, label = "Resume / CV Document URL" }: FileUploadProps) {
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError("Please enter a valid document link.");
      return;
    }

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("Please provide a valid web link starting with https://");
      return;
    }

    setError("");
    onChange(trimmed);
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

      {value ? (
        <div className="relative rounded-none overflow-hidden border border-slate-200 bg-slate-50 flex items-center p-4">
          <FileText className="w-8 h-8 text-construction-red mr-4 shrink-0" />
          <div className="flex-1 truncate pr-8">
            <p className="text-sm font-bold text-slate-800 truncate">Resume Attached</p>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline font-mono truncate block"
            >
              {value}
            </a>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-none flex items-center justify-center transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border border-slate-300 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-construction-navy shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {label}
            </span>
          </div>

          <form onSubmit={handleApply} className="flex gap-2">
            <input
              type="url"
              placeholder="Paste link to your CV (Google Drive, Dropbox, OneDrive, etc.)"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (error) setError("");
              }}
              className="flex-1 bg-white border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-construction-navy"
            />
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="px-4 py-2 bg-construction-navy hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors flex items-center gap-1 shrink-0"
            >
              <Check className="w-3.5 h-3.5" /> Attach
            </button>
          </form>
          <p className="text-[11px] text-slate-500">
            Please make sure sharing permissions are set to &quot;Anyone with the link can view&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
