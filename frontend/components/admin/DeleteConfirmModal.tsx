"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, RefreshCw, X } from "lucide-react";

export interface DeleteConfirmItemDetail {
  label: string;
  value: string;
}

export interface DeleteConfirmRecordDetail {
  title?: string;
  subtitle?: string;
  tag?: string;
  date?: string;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  itemDetails?: DeleteConfirmItemDetail[];
  recordDetail?: DeleteConfirmRecordDetail;
  isDeleting?: boolean;
  errorMessage?: string;
  error?: string;
  confirmButtonText?: string;
  onConfirm: () => void | Promise<void>;
  onClose?: () => void;
  onCancel?: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title = "Permanently Delete Record?",
  description = "This action is irreversible. The record will be permanently purged from the live database.",
  itemName,
  itemDetails,
  recordDetail,
  isDeleting = false,
  errorMessage,
  error,
  confirmButtonText = "Delete Permanently",
  onConfirm,
  onClose,
  onCancel,
}: DeleteConfirmModalProps) {
  const handleDismiss = React.useCallback(() => {
    if (isDeleting) return;
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  }, [isDeleting, onCancel, onClose]);

  const effectiveError = error || errorMessage;
  const effectiveName = itemName || recordDetail?.title;
  const effectiveDetails: DeleteConfirmItemDetail[] | undefined =
    itemDetails ||
    (recordDetail
      ? [
          ...(recordDetail.subtitle ? [{ label: "Contact / Scope", value: recordDetail.subtitle }] : []),
          ...(recordDetail.tag ? [{ label: "Classification", value: recordDetail.tag }] : []),
          ...(recordDetail.date ? [{ label: "Logged Date", value: recordDetail.date }] : []),
        ]
      : undefined);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, handleDismiss]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          handleDismiss();
        }
      }}
    >
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)] relative animate-in zoom-in-95 duration-200 space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Soft Rose Icon */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 ring-1 ring-rose-200/70 shadow-2xs">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="text-base font-bold text-slate-900 font-display tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Item Information Preview Card */}
        {(effectiveName || (effectiveDetails && effectiveDetails.length > 0)) && (
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2 text-xs">
            {effectiveName && (
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Target Record
                </span>
                <span className="font-bold text-slate-900 truncate max-w-[240px]">
                  {effectiveName}
                </span>
              </div>
            )}
            {effectiveDetails &&
              effectiveDetails.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 text-[11px] font-medium">
                    {detail.label}:
                  </span>
                  <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[220px]">
                    {detail.value || "—"}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Inline Error Notice if deletion fails */}
        {effectiveError && (
          <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-700 text-xs font-semibold flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{effectiveError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs shadow-[0_4px_14px_rgba(225,29,72,0.35)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Purging...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmButtonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
