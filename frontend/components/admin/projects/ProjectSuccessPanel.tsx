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
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 w-full max-w-lg shadow-2xl overflow-hidden rounded-none animate-in fade-in zoom-in-95 duration-150">
        {/* Banner */}
        <div
          className={`p-6 text-center ${
            isPublished ? "bg-emerald-700 text-white" : "bg-construction-navy text-white"
          }`}
        >
          <div className="w-12 h-12 bg-white/10 flex items-center justify-center mx-auto mb-3 border border-white/20">
            {isPublished ? (
              <CheckCircle2 className="w-7 h-7 text-white" />
            ) : (
              <FileCheck className="w-7 h-7 text-white" />
            )}
          </div>
          <h3 className="text-xl font-bold font-display uppercase tracking-tight">
            {isPublished ? "Project Live & Indexed" : "Project Draft Saved"}
          </h3>
          <p className="text-xs text-white/90 mt-1 max-w-sm mx-auto font-normal leading-relaxed">
            {isPublished
              ? `"${title}" is officially published and publicly visible in the HiPRO portfolio directory.`
              : `"${title}" changes have been safely committed to the database in draft mode.`}
          </p>
        </div>

        {/* URL Card */}
        <div className="p-6 space-y-5">
          <div className="bg-slate-50 border border-slate-200 p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Canonical URL Route:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-900 hover:bg-construction-navy text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                title="Copy URL"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
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
              <p className="text-[11px] text-amber-800 font-mono mt-1">
                Note: This canonical route remains hidden from public visitors until published.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {isPublished ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase tracking-wider text-xs py-3 shadow-xs transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Open Public Project Page</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onContinueEditing}
                className="w-full flex items-center justify-center gap-2 bg-construction-navy hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs py-3 shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Continue Editing Project</span>
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold uppercase tracking-wider text-xs py-2.5 border border-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Projects List</span>
              </button>

              {isPublished && (
                <button
                  type="button"
                  onClick={onContinueEditing}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-xs py-2.5 border border-slate-300 transition-colors cursor-pointer"
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
