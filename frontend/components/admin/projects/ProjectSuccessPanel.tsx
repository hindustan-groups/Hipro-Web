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
  X,
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
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-300 w-full max-w-lg shadow-2xl overflow-hidden rounded-none animate-in fade-in zoom-in-95 duration-150">
        {/* Engineering Header Strip */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-construction-red"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">
              HiPRO WORKBENCH · SYSTEM NOTICE
            </span>
          </div>
          <span
            className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border ${
              isPublished
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-amber-50 text-amber-700 border-amber-300"
            }`}
          >
            {isPublished ? "STATUS: PUBLISHED" : "STATUS: DRAFT SAVED"}
          </span>
        </div>

        {/* Notice Banner (Light Engineering Theme) */}
        <div className="p-6 text-center bg-white border-b border-slate-200">
          <div
            className={`w-12 h-12 flex items-center justify-center mx-auto mb-3 border ${
              isPublished
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-amber-50 border-amber-200 text-amber-600"
            }`}
          >
            {isPublished ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <FileCheck className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-xl font-bold font-display uppercase tracking-tight text-slate-900">
            {isPublished ? "Project Live & Indexed" : "Project Draft Committed"}
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 max-w-sm mx-auto font-normal leading-relaxed">
            {isPublished
              ? `"${title}" is published and accessible across the public HiPRO engineering portfolio.`
              : `"${title}" has been saved to the database. All specifications and media are preserved in draft status.`}
          </p>
        </div>

        {/* URL Card & Actions */}
        <div className="p-5 sm:p-6 space-y-4 bg-slate-50/50">
          <div className="bg-white border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Canonical Project Route
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {isPublished ? "LIVE PUBLIC ENDPOINT" : "PROTECTED DRAFT"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono select-all focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-900 hover:bg-construction-navy text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                title="Copy URL"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            {!isPublished && (
              <p className="text-[11px] text-amber-700 font-mono mt-1 flex items-center gap-1">
                <span>⚠</span> Route is accessible in Admin Preview, but hidden from public visitors until published.
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
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-construction-navy text-white font-bold uppercase tracking-wider text-xs py-2.5 shadow-sm transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Open Live Project Page</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5 text-slate-300" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onContinueEditing}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-construction-navy text-white font-bold uppercase tracking-wider text-xs py-2.5 shadow-sm transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Continue Editing in Workbench</span>
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-xs py-2 border border-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Projects Registry</span>
              </button>

              {isPublished && (
                <button
                  type="button"
                  onClick={onContinueEditing}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-xs py-2 border border-slate-300 transition-colors cursor-pointer"
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
