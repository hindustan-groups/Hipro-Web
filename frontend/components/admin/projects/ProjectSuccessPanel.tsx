"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Edit3,
  Globe,
  FileCheck,
} from "lucide-react";

interface ProjectSuccessPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueEditing: () => void;
  title: string;
  slug: string;
  publishStatus: "draft" | "published" | "archived";
}

export default function ProjectSuccessPanel({
  isOpen,
  onClose,
  onContinueEditing,
  title,
  slug,
  publishStatus,
}: ProjectSuccessPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicUrl = `https://www.hindustanprojects.in/projects/${slug || ""}`;
  const isPublished = publishStatus === "published";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner */}
        <div
          className={`p-6 text-center ${
            isPublished ? "bg-emerald-600 text-white" : "bg-construction-navy text-white"
          }`}
        >
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            {isPublished ? (
              <CheckCircle2 className="w-7 h-7 text-white" />
            ) : (
              <FileCheck className="w-7 h-7 text-white" />
            )}
          </div>
          <h3 className="text-xl font-bold font-display uppercase tracking-tight">
            {isPublished ? "Project Successfully Published!" : "Project Draft Saved!"}
          </h3>
          <p className="text-xs text-white/80 mt-1 max-w-sm mx-auto">
            {isPublished
              ? `"${title}" is now live on the public website and available for search engines.`
              : `"${title}" draft saved — complete the required publishing fields before publishing.`}
          </p>
        </div>

        {/* URL Card */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-3.5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Public Canonical URL:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-1.5 text-xs font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                title="Copy URL"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            {!isPublished && (
              <p className="text-[11px] text-amber-700 mt-1">
                Note: This URL returns 404 for public visitors until the project is published.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {isPublished ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs py-2.5 shadow-sm transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Open Public Project in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onContinueEditing}
                className="w-full flex items-center justify-center gap-2 bg-construction-navy hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-xs py-2.5 shadow-sm transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Continue Editing to Publish</span>
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs py-2 border border-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Projects List</span>
              </button>

              {isPublished && (
                <button
                  type="button"
                  onClick={onContinueEditing}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-xs py-2 border border-slate-300 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Keep Editing</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
