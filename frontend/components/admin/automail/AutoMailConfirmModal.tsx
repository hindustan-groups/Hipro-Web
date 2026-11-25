"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export interface AutoMailConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "primary";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function AutoMailConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: AutoMailConfirmModalProps) {
  if (!open) return null;

  const toneStyles =
    tone === "danger"
      ? {
          iconBg: "bg-red-50 text-red-600 border-red-200",
          btn: "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20",
          Icon: Trash2,
        }
      : tone === "warning"
      ? {
          iconBg: "bg-amber-50 text-amber-600 border-amber-200",
          btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
          Icon: AlertTriangle,
        }
      : {
          iconBg: "bg-blue-50 text-blue-600 border-blue-200",
          btn: "bg-slate-900 hover:bg-blue-600 text-white shadow-slate-900/20",
          Icon: AlertTriangle,
        };

  const Icon = toneStyles.Icon;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.35)] border border-slate-200/90 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${toneStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
            aria-label="Close confirmation dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 ${toneStyles.btn}`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
