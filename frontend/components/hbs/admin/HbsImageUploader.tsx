"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  UploadCloud,
  Loader2,
  X,
  Link as LinkIcon,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  Image as ImageIcon,
  ClipboardPaste
} from "lucide-react";

interface HbsImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: "hbs/branding" | "hbs/services" | "hbs/projects" | "hbs/team" | "hbs/heroes" | "hbs/media" | string;
  label?: string;
  description?: string;
  recommendedSize?: string;
  aspectRatioHint?: string;
  previewHeight?: string;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
}

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const FOLDER_LABELS: Record<string, string> = {
  "hbs/branding": "Branding",
  "hbs/services": "Services",
  "hbs/projects": "Projects",
  "hbs/team": "Team",
  "hbs/heroes": "Heroes",
  "hbs/media": "Media",
};

export default function HbsImageUploader({
  value,
  onChange,
  folder = "hbs/branding",
  label,
  description,
  recommendedSize,
  aspectRatioHint,
  previewHeight = "h-40",
  altText,
  onAltTextChange,
}: HbsImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [activeMode, setActiveMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const folderLabel = FOLDER_LABELS[folder] || folder.split("/").pop() || folder;

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "File exceeds 5MB limit. Please compress or select a smaller image.";
    }
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported format (${ext}). Allowed: JPG, PNG, WebP, GIF, SVG, AVIF.`;
    }
    return null;
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    // Simulate progress for UX (real progress via XHR would require more plumbing)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + Math.random() * 15, 85));
    }, 200);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      clearInterval(progressInterval);
      setUploadProgress(95);

      const data = await res.json();

      if (data.success && data.url) {
        setUploadProgress(100);
        onChange(data.url);
        setUrlInput("");
        setTimeout(() => setUploadProgress(0), 800);
      } else {
        setError(data.error || "Upload failed. You can also paste a direct image URL.");
        setUploadProgress(0);
      }
    } catch {
      clearInterval(progressInterval);
      setError("Network error during upload. Please verify connection or paste an image URL directly.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only trigger if leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    } else if (file) {
      setError("Please drop an image file (JPG, PNG, WebP, GIF, SVG, AVIF).");
    }
  }, [folder]); // eslint-disable-line react-hooks/exhaustive-deps

  // Paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `pasted-image.${imageType.split("/")[1] || "png"}`, { type: imageType });
          handleUpload(file);
          return;
        }
      }
      // Try text (URL)
      const text = await navigator.clipboard.readText();
      if (text.startsWith("http")) {
        setUrlInput(text);
        setActiveMode("url");
      }
    } catch {
      setError("Could not access clipboard. Use 'Paste Image URL' mode or drag a file instead.");
    }
  }, [folder]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setUrlInput("");
    setError("");
  };

  const copyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      {/* Label and Hint Header */}
      {(label || recommendedSize || description) && (
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          {label && (
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
              {label}
            </label>
          )}
          <div className="flex items-center gap-2">
            {/* Folder Badge */}
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-mono">
              <FolderOpen className="w-2.5 h-2.5" />
              {folderLabel}
            </span>
            {(recommendedSize || aspectRatioHint) && (
              <span className="text-[10px] font-mono text-slate-500">
                {recommendedSize && `Rec: ${recommendedSize}`}
                {recommendedSize && aspectRatioHint && " • "}
                {aspectRatioHint && `Ratio: ${aspectRatioHint}`}
              </span>
            )}
          </div>
        </div>
      )}

      {description && (
        <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <span className="font-bold shrink-0">Error:</span>
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700 p-0.5 shrink-0"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {value ? (
        /* Saved Image Preview Card */
        <div className="border border-slate-300 bg-slate-50 p-3 space-y-3 rounded-none shadow-xs">
          <div
            className={`relative ${previewHeight} w-full bg-slate-900/5 flex items-center justify-center overflow-hidden border border-slate-200 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px]`}
          >
            <img
              src={value}
              alt={altText || label || "Uploaded asset preview"}
              className="max-h-full max-w-full object-contain p-2"
            />
            {uploading && (
              <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading replacement...</span>
                {uploadProgress > 0 && (
                  <div className="w-32 h-1.5 bg-white/30 rounded-none overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Alt Text Input */}
          {onAltTextChange !== undefined && (
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Alt Text (Accessibility & SEO)
              </label>
              <input
                type="text"
                value={altText || ""}
                onChange={(e) => onAltTextChange(e.target.value)}
                placeholder="Describe this image for screen readers..."
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-amber-600 bg-white"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handlePaste}
                disabled={uploading}
                title="Paste image or URL from clipboard"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            {/* URL Display and Copy */}
            <div className="flex items-center gap-1 flex-1 min-w-[200px] justify-end">
              <input
                type="text"
                readOnly
                value={value}
                className="text-[11px] font-mono px-2 py-1 bg-white border border-slate-200 text-slate-600 truncate max-w-[220px] select-all"
                title={value}
              />
              <button
                type="button"
                onClick={copyUrl}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs transition-colors"
                title="Copy URL"
                aria-label="Copy image URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs transition-colors"
                title="Open in new tab"
                aria-label="Open image in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Upload or Direct URL */
        <div className="border border-slate-300 bg-white shadow-xs">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveMode("upload")}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 transition-colors ${
                activeMode === "upload"
                  ? "bg-white text-slate-900 border-b-2 border-amber-600 font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("url")}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 transition-colors ${
                activeMode === "url"
                  ? "bg-white text-slate-900 border-b-2 border-amber-600 font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Paste Image URL</span>
            </button>
          </div>

          {activeMode === "upload" ? (
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`h-32 flex flex-col items-center justify-center transition-all p-4 text-center relative cursor-pointer group ${
                isDragOver
                  ? "bg-amber-50 border-2 border-dashed border-amber-500"
                  : uploading
                  ? "opacity-50 pointer-events-none bg-slate-50"
                  : "hover:bg-slate-50"
              }`}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-amber-600 animate-spin mb-2" />
                  <span className="text-slate-900 text-xs font-bold uppercase tracking-wider">
                    Uploading to {folderLabel}...
                  </span>
                  {uploadProgress > 0 && (
                    <div className="w-32 h-1 bg-slate-200 mt-2">
                      <div
                        className="h-full bg-amber-500 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </>
              ) : isDragOver ? (
                <>
                  <ImageIcon className="w-7 h-7 text-amber-600 mb-2" />
                  <span className="text-amber-700 text-xs font-black uppercase tracking-wider">
                    Drop Image Here
                  </span>
                  <span className="text-amber-600 text-[11px] mt-0.5">
                    Release to upload to {folderLabel}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-none bg-amber-50 border border-amber-200 flex items-center justify-center mb-2 text-amber-700 group-hover:bg-amber-100 transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-slate-800 text-xs font-bold uppercase tracking-wider">
                    Click to Select or Drag & Drop
                  </span>
                  <span className="text-slate-400 text-[11px] mt-0.5">
                    JPG, PNG, WebP, SVG, AVIF (Max 5MB)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePaste(); }}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-700 transition-colors"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    Paste from Clipboard
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleApplyUrl} className="p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://res.cloudinary.com/... or https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-amber-600 font-mono"
                />
                <button
                  type="submit"
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors shrink-0"
                >
                  Apply URL
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Direct Cloudinary URL, Unsplash URL, or any publicly hosted image.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
