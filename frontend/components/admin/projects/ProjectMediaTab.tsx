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
  ExternalLink,
  Layers,
  CheckCircle2,
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

  return (
    <div className="space-y-8">
      {/* 1. Main Cover Image */}
      <div>
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-construction-navy" /> Main Cover / Hero Image <span className="text-red-500">*</span>
          </h4>
          <p className="text-xs text-slate-500">
            Primary landscape photograph displayed on portfolio cards, project detail hero, and social shares.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <ImageUpload
              value={formData.image}
              onChange={(url) => onChange({ image: url })}
            />
          </div>

          <div className="space-y-3 bg-slate-50 p-4 border border-slate-200">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Cover Image Alt Text
              </label>
              <input
                type="text"
                value={formData.imageAlt}
                onChange={(e) => onChange({ imageAlt: e.target.value })}
                placeholder="e.g. Modern logistics warehouse exterior facade"
                className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
              <p className="text-[10px] text-slate-400">Essential for SEO and accessibility.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Cover Image Caption
              </label>
              <input
                type="text"
                value={formData.imageCaption}
                onChange={(e) => onChange({ imageCaption: e.target.value })}
                placeholder="e.g. North elevation view with multi-bay loading docks"
                className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Multiple Image Gallery */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-construction-navy" /> Project Gallery Photos ({formData.galleryDetails.length})
            </h4>
            <p className="text-xs text-slate-500">
              Upload multi-angle construction photography. Automatically synchronizes with legacy images.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="url"
              value={manualGalleryUrl}
              onChange={(e) => setManualGalleryUrl(e.target.value)}
              placeholder="Paste direct image URL..."
              className="bg-white border border-slate-200 text-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy w-48"
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-slate-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Multi-upload dropzone */}
        <div className="mb-4">
          <MultiImageUpload
            value={formData.galleryDetails.map((g) => g.url)}
            onChange={handleAddMultiUpload}
          />
        </div>

        {/* Gallery Items Table / Cards */}
        {formData.galleryDetails.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.galleryDetails.map((item, idx) => {
                const isCurrentCover = formData.image === item.url;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 border transition-all ${
                      isCurrentCover
                        ? "bg-blue-50/50 border-blue-300 shadow-sm"
                        : "bg-white border-slate-200 shadow-sm"
                    }`}
                  >
                    {/* Thumbnail & Reorder controls */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="relative w-16 h-16 bg-slate-100 border border-slate-200 overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.alt || "Gallery"}
                          className="w-full h-full object-cover"
                        />
                        {isCurrentCover && (
                          <span
                            className="absolute top-0 right-0 bg-construction-navy text-white text-[9px] font-bold px-1 py-0.2"
                            title="Current Cover Image"
                          >
                            COVER
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveGalleryItem(idx, "up")}
                          className="hover:text-slate-800 disabled:opacity-20 cursor-pointer p-0.5"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          disabled={idx === formData.galleryDetails.length - 1}
                          onClick={() => handleMoveGalleryItem(idx, "down")}
                          className="hover:text-slate-800 disabled:opacity-20 cursor-pointer p-0.5"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Inputs */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                          {item.url}
                        </p>
                        <div className="flex items-center gap-1">
                          {!isCurrentCover && (
                            <button
                              type="button"
                              onClick={() => handleSetCover(item)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                              title="Set as Main Cover Image"
                            >
                              <Star className="w-3 h-3" /> Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryItem(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
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
                        placeholder="Image Alt Text (e.g. Foundation pile caps inspection)"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy"
                      />

                      <input
                        type="text"
                        value={item.caption || ""}
                        onChange={(e) => handleUpdateGalleryItem(idx, "caption", e.target.value)}
                        placeholder="Caption (e.g. Structural steel erection progress)"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Project Video Integration */}
      <div className="pt-6 border-t border-slate-200">
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-construction-navy" /> Project Video Showcase
          </h4>
          <p className="text-xs text-slate-500">
            Embed drone walkthroughs, timelapse reels, or site inspection videos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Video URL
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or Vimeo link"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
            <p className="text-[11px] text-slate-500">
              Auto-detects YouTube, Vimeo, or direct video streams.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Video Type
            </label>
            <select
              value={formData.videoType}
              onChange={(e) => onChange({ videoType: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            >
              <option value="none">None / No Video</option>
              <option value="youtube">YouTube Embed</option>
              <option value="vimeo">Vimeo Embed</option>
              <option value="direct">Direct Video Stream (MP4 / Cloudinary)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Video Title (Optional)
            </label>
            <input
              type="text"
              value={formData.videoTitle}
              onChange={(e) => onChange({ videoTitle: e.target.value })}
              placeholder="e.g. Site Erection & PEB Installation Drone Walkthrough"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Custom Video Poster / Thumbnail URL (Optional)
            </label>
            <input
              type="url"
              value={formData.videoPoster}
              onChange={(e) => onChange({ videoPoster: e.target.value })}
              placeholder="https://... image for video poster"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Video Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.videoDescription}
              onChange={(e) => onChange({ videoDescription: e.target.value })}
              placeholder="Brief contextual summary of the video showcase..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
