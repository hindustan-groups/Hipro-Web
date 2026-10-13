"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ExternalLink,
  QrCode,
  Sparkles,
  ChevronRight,
  Send,
} from "lucide-react";

export default function EmpanelmentAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* macOS Translucent Command Bar */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-slate-200/60 p-3.5 sm:px-4.5 sm:py-3.5 shadow-[0_2px_16px_rgba(15,23,42,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold text-slate-500">
            <span className="text-slate-400">Admin</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-amber-800 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>Procurement Board</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[9.5px] text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full border border-slate-200/60 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              PostgreSQL Connected
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Contractor Empanelment & Procurement Hub
          </h1>
          <p className="text-[11.5px] text-slate-500 max-w-2xl leading-relaxed">
            End-to-end management of vendor registrations, statutory document audits, tender RFPs & site access passes.
          </p>
        </div>

        {/* macOS Action Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/empanelment"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
            title="Open Live Public Portal"
          >
            <span>Public Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/empanelment/verify-pass"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
            title="Open Guard Scanner Simulator"
          >
            <QrCode className="w-3 h-3 text-slate-500" />
            <span>Guard Scanner</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/admin/automail?brand=empanelment"
            className="px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
            title="AutoMail Dispatcher"
          >
            <Send className="w-3 h-3 text-slate-500" />
            <span>AutoMail</span>
          </Link>

          <Link
            href="/admin/empanelment/content"
            className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Portal Studio</span>
          </Link>
        </div>
      </div>

      {/* Main Page Slot */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
