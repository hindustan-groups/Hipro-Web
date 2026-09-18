"use client";

import React, { useState } from "react";
import {
  ImageIcon,
  Video,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  X,
  Play,
  ExternalLink,
  Film,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import type { ProjectGalleryItem } from "@/lib/types";

interface ProjectMediaTabProps {
  formData: {
    title: string;
    image: string;
    imageAlt: string;
    imageCaption: string;
    galleryDetails: ProjectGalleryItem[];
    videoUrl: string;
    videoType: "youtube" | "vimeo" | "direct" | "none";
    videoTitle: string;
    videoDescription: string;
    videoPoster: string;
  };
  onChange: (fields: Partial<ProjectMediaTabProps["formData"]>) => void;
}

export default function ProjectMediaTab({
  formData,
  onChange,
}: ProjectMediaTabProps) {
  const [manualGalleryUrl, setManualGalleryUrl] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Gallery Helpers
  const handleAddMultiUpload = (urls: string[]) => {
    const existingUrls = new Set(formData.galleryDetails.map((g) => g.url));
    const newItems: ProjectGalleryItem[] = [];

    urls.forEach((url, i) => {
      if (!existingUrls.has(url)) {
        newItems.push({
          url,
          alt: `${formData.title || "Project"} photo ${formData.galleryDetails.length + i + 1}`,
          caption: "",
          order: formData.galleryDetails.length + i + 1,
        });
      }
    });

    if (newItems.length > 0) {
      onChange({ galleryDetails: [...formData.galleryDetails, ...newItems] });
    }
  };

  const handleAddManualUrl = () => {
    const trimmed = manualGalleryUrl.trim();
    if (!trimmed) return;
    onChange({
      galleryDetails: [
        ...formData.galleryDetails,
        {
          url: trimmed,
          alt: `${formData.title || "Project"} photo ${formData.galleryDetails.length + 1}`,
          caption: "",
          order: formData.galleryDetails.length + 1,
        },
      ],
    });
    setManualGalleryUrl("");
  };

  const handleUpdateGalleryItem = (
    index: number,
    field: keyof ProjectGalleryItem,
    value: any
  ) => {
    const updated = [...formData.galleryDetails];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ galleryDetails: updated });
  };

  const handleRemoveGalleryItem = (index: number) => {
    onChange({
      galleryDetails: formData.galleryDetails.filter((_, i) => i !== index),
    });
  };

  // Reorder while preserving all item metadata (alt, caption, url)
  const handleMoveGalleryItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= formData.galleryDetails.length) return;
    const updated = [...formData.galleryDetails];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    // update order sequence
    updated.forEach((item, i) => {
      item.order = i + 1;
    });
    onChange({ galleryDetails: updated });
  };

  const handleSetCover = (item: ProjectGalleryItem) => {
    onChange({
      image: item.url,
      imageAlt: item.alt || formData.imageAlt || `${formData.title} cover photo`,
      imageCaption: item.caption || formData.imageCaption,
    });
  };

  // Video URL Auto-Detection Helper
  const handleVideoUrlChange = (url: string) => {
    const trimmed = url.trim();
    const updates: Partial<ProjectMediaTabProps["formData"]> = { videoUrl: trimmed };

    if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
      updates.videoType = "youtube";
    } else if (trimmed.includes("vimeo.com")) {
      updates.videoType = "vimeo";
    } else if (trimmed.endsWith(".mp4") || trimmed.includes("res.cloudinary.com")) {
      updates.videoType = "direct";
    } else if (!trimmed) {
      updates.videoType = "none";
    }
    onChange(updates);
  };

  // Video embed url helpers
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0` : null;
  };

  const getVimeoEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  const youtubeEmbedUrl = formData.videoUrl ? getYoutubeEmbedUrl(formData.videoUrl) : null;
  const vimeoEmbedUrl = formData.videoUrl ? getVimeoEmbedUrl(formData.videoUrl) : null;

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO & MAIN COVER PLATE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              01 · Hero Cover Plate &amp; Primary Media
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Portfolio Showcase Anchor
          </span>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Primary landscape photograph displayed on portfolio cards, project detail hero, and social share previews.
          </p>

          <div className="grid md:grid-cols-12 gap-6 items-start">
            {/* Upload Zone & Visual Preview */}
            <div className="md:col-span-7 space-y-4">
              <ImageUpload
                value={formData.image}
                onChange={(url) => onChange({ image: url })}
              />

              {/* Cover Image 16:9 Showcase Preview Card */}
              {formData.image && (
                <div className="bg-slate-950 p-3 border border-slate-800 shadow-lg relative group">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image}
                      alt={formData.imageAlt || "Cover Preview"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(formData.image)}
                        className="bg-black/80 hover:bg-black text-white p-2 rounded-none text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="Enlarge Cover"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ image: "", imageAlt: "", imageCaption: "" })}
                        className="bg-red-600/90 hover:bg-red-600 text-white p-2 rounded-none text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="Remove Cover Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {formData.imageCaption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 text-xs text-slate-200 p-3 font-mono tracking-wide border-t border-slate-800 truncate">
                        {formData.imageCaption}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Alt & Caption Metadata */}
            <div className="md:col-span-5 space-y-4 bg-slate-50 border border-slate-200 p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                    Cover Alt Text
                  </label>
                  {formData.imageAlt ? (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Configured
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> SEO Missing
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.imageAlt}
                  onChange={(e) => onChange({ imageAlt: e.target.value })}
                  placeholder="e.g. Modern industrial PEB warehouse exterior perspective"
                  className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Essential for Google Image search ranking, SEO audits, and accessibility compliance.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Cover Caption &amp; Field Note
                </label>
                <input
                  type="text"
                  value={formData.imageCaption}
                  onChange={(e) => onChange({ imageCaption: e.target.value })}
                  placeholder="e.g. Architectural elevation view with multi-bay loading docks"
                  className="w-full bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Displayed as a technical engineering caption over the hero showcase image on the public page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: FIELD EXECUTION & ARCHITECTURAL GALLERY
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              02 · Field Execution &amp; Architectural Gallery Photos
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            {formData.galleryDetails.length} Photographs
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-600 font-normal">
              Upload multi-angle field photography, structural fabrication phases, and site execution progress.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={manualGalleryUrl}
                onChange={(e) => setManualGalleryUrl(e.target.value)}
                placeholder="Paste direct image URL..."
                className="bg-slate-50 border border-slate-300 text-slate-900 px-3 py-1.5 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy w-56 font-mono"
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                className="bg-slate-900 hover:bg-construction-navy text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add URL
              </button>
            </div>
          </div>

          {/* Multi-upload dropzone */}
          <div>
            <MultiImageUpload
              value={formData.galleryDetails.map((g) => g.url)}
              onChange={handleAddMultiUpload}
            />
          </div>

          {/* Gallery Items Grid */}
          {formData.galleryDetails.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Gallery Sequence &amp; Plate Metadata:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.galleryDetails.map((item, idx) => {
                  const isCurrentCover = formData.image === item.url;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3.5 border transition-all ${
                        isCurrentCover
                          ? "bg-amber-50/40 border-amber-300 shadow-sm"
                          : "bg-white border-slate-200 shadow-xs"
                      }`}
                    >
                      {/* Thumbnail & Reorder controls */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <div
                          onClick={() => setLightboxUrl(item.url)}
                          className="relative w-20 h-20 bg-slate-100 border border-slate-300 overflow-hidden cursor-pointer group"
                          title="Click to zoom"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.alt || "Gallery"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isCurrentCover && (
                            <span
                              className="absolute top-0 right-0 bg-construction-navy text-white text-[8px] font-mono font-bold px-1 py-0.5"
                              title="Current Cover Image"
                            >
                              COVER
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-slate-500">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveGalleryItem(idx, "up")}
                            className="hover:text-slate-900 disabled:opacity-20 cursor-pointer p-0.5"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono font-bold text-slate-600">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            disabled={idx === formData.galleryDetails.length - 1}
                            onClick={() => handleMoveGalleryItem(idx, "down")}
                            className="hover:text-slate-900 disabled:opacity-20 cursor-pointer p-0.5"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Metadata Inputs */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-mono text-slate-400 truncate max-w-[160px]">
                            {item.url}
                          </p>
                          <div className="flex items-center gap-2">
                            {!isCurrentCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(item)}
                                className="text-[10px] font-bold text-construction-navy hover:text-construction-red flex items-center gap-0.5 uppercase tracking-wider cursor-pointer transition-colors"
                                title="Set as Main Cover Image"
                              >
                                <Star className="w-3 h-3" /> Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryItem(idx)}
                              className="text-slate-400 hover:text-construction-red p-0.5 cursor-pointer transition-colors"
                              title="Remove image from gallery"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={item.alt || ""}
                          onChange={(e) => handleUpdateGalleryItem(idx, "alt", e.target.value)}
                          placeholder="Image Alt Text (SEO & Accessibility)"
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-2.5 py-1.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                        />

                        <input
                          type="text"
                          value={item.caption || ""}
                          onChange={(e) => handleUpdateGalleryItem(idx, "caption", e.target.value)}
                          placeholder="Caption (e.g. Heavy structural truss erection)"
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-2.5 py-1.5 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: VIDEO SHOWCASE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
              03 · Field Video Showcase &amp; Drone Walkthrough
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Interactive Showcase
          </span>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Embed drone flythroughs, aerial progress reels, or technical inspection videos.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Video Stream URL
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=... or Vimeo link"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
              <p className="text-[11px] text-slate-500 font-normal">
                Auto-detects YouTube, Vimeo, or direct MP4 stream endpoints.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Video Embed Engine
              </label>
              <select
                value={formData.videoType}
                onChange={(e) => onChange({ videoType: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              >
                <option value="none">None / Inactive</option>
                <option value="youtube">YouTube Embed (Recommended)</option>
                <option value="vimeo">Vimeo Embed</option>
                <option value="direct">Direct Video Stream (MP4 / Cloudinary)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Video Title (Optional)
              </label>
              <input
                type="text"
                value={formData.videoTitle}
                onChange={(e) => onChange({ videoTitle: e.target.value })}
                placeholder="e.g. 4K Drone Walkthrough & Site Construction Progress"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Video Poster Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.videoPoster}
                onChange={(e) => onChange({ videoPoster: e.target.value })}
                placeholder="https://... cover placeholder image"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Video Description / Context
              </label>
              <textarea
                rows={2}
                value={formData.videoDescription}
                onChange={(e) => onChange({ videoDescription: e.target.value })}
                placeholder="Contextual summary of footage..."
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Live Video Embed Preview */}
          {formData.videoUrl && formData.videoType !== "none" && (
            <div className="mt-4 p-5 bg-slate-950 border border-slate-800 shadow-md">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-3">
                <Play className="w-3.5 h-3.5" />
                <span>Live Public Video Player Simulation (/projects/[slug]):</span>
              </div>
              <div className="relative aspect-video max-w-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl">
                {youtubeEmbedUrl ? (
                  <iframe
                    src={youtubeEmbedUrl}
                    title="YouTube Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : vimeoEmbedUrl ? (
                  <iframe
                    src={vimeoEmbedUrl}
                    title="Vimeo Preview"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    controls
                    poster={formData.videoPoster || undefined}
                    preload="metadata"
                    className="w-full h-full object-cover"
                  >
                    <source src={formData.videoUrl} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 cursor-pointer backdrop-blur-xs"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 bg-slate-900 text-white p-2.5 hover:bg-construction-red cursor-pointer transition-colors border border-slate-800 rounded-none"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Enlarged Architectural Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain border border-slate-800 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
