"use client";

import React, { useRef } from "react";
import { X, Printer, Download, ShieldCheck, QrCode, CheckCircle2, Sparkles } from "lucide-react";

interface SmartCardPreviewModalProps {
  vendor: {
    companyName: string;
    contactName: string;
    trackingId: string;
    tier: string;
    category: string;
    phone: string;
    city?: string | null;
    approvedAt?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartCardPreviewModal({ vendor, isOpen, onClose }: SmartCardPreviewModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !vendor) return null;

  const tierLabels: Record<string, { label: string; color: string; bg: string }> = {
    TIER_A: { label: "TIER A • MEGA CONTRACTOR", color: "text-amber-300", bg: "bg-amber-500/20 border-amber-400/40" },
    TIER_B: { label: "TIER B • CORE CIVIL & MEP", color: "text-blue-300", bg: "bg-blue-500/20 border-blue-400/40" },
    TIER_C: { label: "TIER C • SPECIALIZED TRADE", color: "text-emerald-300", bg: "bg-emerald-500/20 border-emerald-400/40" },
    TIER_D: { label: "TIER D • LOCAL CONTRACTOR", color: "text-slate-300", bg: "bg-slate-500/20 border-slate-400/40" },
  };

  const currentTier = tierLabels[vendor.tier] || tierLabels.TIER_C;

  const issueDate = vendor.approvedAt
    ? new Date(vendor.approvedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "CURRENT";
  const validThru = "OCT 2027";

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `https://empanelment.hindustanprojects.in/verify-partner?trackingId=${vendor.trackingId}`
  )}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Official PVC Smart Partner Card</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card Canvas */}
        <div className="p-6 bg-slate-100/70 flex flex-col items-center">
          {/* Credit Card Aspect Ratio (85.6mm x 53.98mm ~ 1.58 ratio) */}
          <div
            ref={cardRef}
            className="w-full aspect-[1.586] rounded-2xl p-5 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white flex flex-col justify-between border border-amber-500/30 select-none print:shadow-none"
          >
            {/* Holographic Subtle Foil Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-500/10 via-amber-500/10 to-transparent blur-2xl pointer-events-none" />

            {/* Top Bar: Hindustan Projects & Chip */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[10px] tracking-widest uppercase font-mono font-black text-amber-400">
                  HINDUSTAN PROJECTS
                </p>
                <p className="text-[8px] tracking-wider text-slate-400 uppercase font-semibold">
                  EMPANELLED PARTNER CREDENTIAL
                </p>
              </div>

              {/* Digital Gold Chip */}
              <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 border border-amber-100/60 shadow-xs flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-[1px] bg-amber-600/40 absolute top-2" />
                <div className="w-full h-[1px] bg-amber-600/40 absolute bottom-2" />
                <div className="h-full w-[1px] bg-amber-600/40 absolute left-3" />
                <div className="h-full w-[1px] bg-amber-600/40 absolute right-3" />
              </div>
            </div>

            {/* Middle: Vendor Name & Category */}
            <div className="relative z-10 my-auto py-2">
              <span
                className={`text-[8px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${currentTier.bg} ${currentTier.color} uppercase inline-block mb-1.5`}
              >
                {currentTier.label}
              </span>
              <h3 className="text-sm font-black tracking-tight text-white line-clamp-1">
                {vendor.companyName}
              </h3>
              <p className="text-[10px] text-slate-300 font-medium">
                {vendor.contactName} • {vendor.category}
              </p>
            </div>

            {/* Bottom Bar: QR Code + Tracking ID + Validity */}
            <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/10">
              <div>
                <p className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">
                  EMPANELMENT ID
                </p>
                <p className="text-xs font-mono font-black text-amber-300 tracking-wider">
                  {vendor.trackingId}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[8px] text-slate-400 font-mono">
                  <span>ISSUED: {issueDate}</span>
                  <span>•</span>
                  <span>VALID: {validThru}</span>
                </div>
              </div>

              {/* Dynamic Verification QR */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-12 h-12 rounded-lg bg-white p-0.5 shadow-sm shrink-0 border border-white/20"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 text-center">
            Standard ISO 7810 ID-1 PVC dimensions (85.6 × 54 mm). Suitable for smart card thermal printing.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PVC Card</span>
          </button>
        </div>
      </div>
    </div>
  );
}
