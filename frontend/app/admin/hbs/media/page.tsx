"use client";

import { useState } from "react";
import {
  GalleryHorizontalEnd,
  UploadCloud,
  Info,
  FolderOpen,
  RefreshCw,
  Loader2,
  X,
  Check,
  Copy,
  ExternalLink,
  Trash2,
  Search,
  Filter
} from "lucide-react";

interface UploadedAsset {
  url: string;
  folder: string;
  name: string;
  uploadedAt: Date;
  size?: number;
}

const FOLDERS = [
  { key: "hbs/branding", label: "Branding", desc: "Logos, favicon, OG images" },
  { key: "hbs/heroes", label: "Heroes", desc: "Homepage & page hero backgrounds" },
  { key: "hbs/services", label: "Services", desc: "Service card and detail images" },
  { key: "hbs/projects", label: "Projects", desc: "Project case study galleries" },
  { key: "hbs/team", label: "Team", desc: "Team member portraits" },
  { key: "hbs/media", label: "General Media", desc: "Miscellaneous assets" },
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function HbsAdminMedia() {
  const [uploads, setUploads] = useState<UploadedAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState("hbs/media");
  const [filterFolder, setFilterFolder] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;

    for (const file of fileArr) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" exceeds 5MB limit.`);
        continue;
      }
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`Unsupported file type: ${ext}`);
        continue;
      }

      setUploading(true);
      setUploadProgress(0);
      setError("");

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + Math.random() * 20, 85));
      }, 200);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", selectedFolder);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        clearInterval(progressInterval);
        setUploadProgress(100);
        const data = await res.json();
        if (data.success && data.url) {
          setUploads((prev) => [
            {
              url: data.url,
              folder: selectedFolder,
              name: file.name,
              uploadedAt: new Date(),
              size: file.size,
            },
            ...prev,
          ]);
        } else {
          setError(data.error || `Failed to upload "${file.name}".`);
        }
      } catch {
        clearInterval(progressInterval);
        setError(`Network error uploading "${file.name}".`);
      } finally {
        setUploading(false);
        setTimeout(() => setUploadProgress(0), 800);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const removeAsset = (url: string) => {
    setUploads((prev) => prev.filter((a) => a.url !== url));
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  };

  const filteredUploads = uploads.filter((a) => {
    const matchesFolder = filterFolder === "all" || a.folder === filterFolder;
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.url.toLowerCase().includes(search.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            Asset Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
            Media Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload, organise and copy URLs for images used across Hind Build pages. Assets are stored on Cloudinary.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200">
          <GalleryHorizontalEnd className="w-4 h-4" />
          {uploads.length} asset{uploads.length !== 1 ? "s" : ""} this session
        </span>
      </div>

      {/* Info notice */}
      <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <div>
          <strong>Session Media Library:</strong> Uploads here are saved to Cloudinary permanently. Copy the URL and use it in the relevant CMS sections (Home, Branding, SEO, Service detail, etc.). This page shows assets uploaded <em>during this session</em> — to see all Cloudinary assets visit your Cloudinary dashboard.
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <X className="w-3.5 h-3.5 shrink-0 text-red-600" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-500 hover:text-red-700">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upload Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-amber-600" />
              Upload New Asset
            </h2>

            {/* Folder Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Target Folder
              </label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-amber-600 bg-white font-mono"
              >
                {FOLDERS.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label} — {f.key}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                {FOLDERS.find((f) => f.key === selectedFolder)?.desc}
              </p>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-none flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer ${
                dragOver
                  ? "border-amber-500 bg-amber-50"
                  : uploading
                  ? "border-slate-200 bg-slate-50 opacity-60 pointer-events-none"
                  : "border-slate-300 hover:border-amber-400 hover:bg-slate-50"
              }`}
              onClick={() => !uploading && document.getElementById("hbs-media-file-input")?.click()}
            >
              <input
                id="hbs-media-file-input"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                className="hidden"
                onChange={handleInputChange}
                disabled={uploading}
              />
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-2" />
                  <span className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                    Uploading...
                  </span>
                  {uploadProgress > 0 && (
                    <div className="w-full max-w-[120px] h-1.5 bg-slate-200 mt-2">
                      <div
                        className="h-full bg-amber-500 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </>
              ) : dragOver ? (
                <>
                  <GalleryHorizontalEnd className="w-8 h-8 text-amber-600 mb-2" />
                  <span className="text-amber-700 text-xs font-black uppercase tracking-wider">Release to Upload</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-amber-50 border border-amber-200 flex items-center justify-center mb-2">
                    <UploadCloud className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-slate-800 text-xs font-bold uppercase tracking-wider">
                    Click or Drag & Drop
                  </span>
                  <span className="text-slate-400 text-[11px] mt-1">
                    JPG, PNG, WebP, SVG, AVIF
                    <br />Max 5MB per file • Multiple files OK
                  </span>
                </>
              )}
            </div>

            {/* Folder Grid */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Cloudinary Folders</p>
              <div className="space-y-1">
                {FOLDERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSelectedFolder(f.key)}
                    className={`w-full text-left px-2.5 py-2 text-xs flex items-center gap-2 border transition-colors ${
                      selectedFolder === f.key
                        ? "border-amber-400 bg-amber-50 text-amber-800 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="block font-mono truncate">{f.key}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{f.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename or URL..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
                className="px-2.5 py-2 text-xs border border-slate-300 focus:outline-none focus:border-amber-600 bg-white font-mono"
              >
                <option value="all">All Folders</option>
                {FOLDERS.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Asset Grid */}
          {filteredUploads.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed flex flex-col items-center justify-center p-12 text-center">
              <GalleryHorizontalEnd className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No Assets Yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Upload images using the panel on the left. They will appear here with copy-URL functionality.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredUploads.map((asset) => (
                <div
                  key={asset.url}
                  className="bg-white border border-slate-200 overflow-hidden group hover:border-amber-400 transition-colors"
                >
                  {/* Preview */}
                  <div className="h-28 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:10px_10px] flex items-center justify-center overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="max-h-full max-w-full object-contain p-2"
                    />
                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyUrl(asset.url)}
                        className="p-1.5 bg-white text-slate-800 hover:bg-amber-50 transition-colors"
                        title="Copy URL"
                      >
                        {copied === asset.url ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white text-slate-800 hover:bg-amber-50 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => removeAsset(asset.url)}
                        className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        title="Remove from list (does NOT delete from Cloudinary)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="p-2 border-t border-slate-100">
                    <p className="text-[10px] font-mono text-slate-700 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-slate-400 font-mono">{asset.folder.split("/")[1]}</span>
                      {asset.size && (
                        <span className="text-[9px] text-slate-400 font-mono">{formatSize(asset.size)}</span>
                      )}
                    </div>
                    {/* Copy URL bar */}
                    <button
                      type="button"
                      onClick={() => copyUrl(asset.url)}
                      className="mt-1.5 w-full text-left px-1.5 py-1 bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-colors text-[10px] font-mono text-slate-500 truncate flex items-center gap-1"
                      title={asset.url}
                    >
                      {copied === asset.url ? (
                        <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 shrink-0" />
                      )}
                      <span className="truncate">{asset.url.replace("https://res.cloudinary.com/", "...")}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredUploads.length > 0 && (
            <p className="text-[10px] text-slate-400 text-center font-mono">
              ⚠ Removing from this list does NOT delete the asset from Cloudinary. Manage permanent deletions in your Cloudinary dashboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
