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
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Enterprise Command Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span className="text-slate-400">Admin</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>Hindustan Projects Procurement Board</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PostgreSQL Connected
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
            Contractor Empanelment & Procurement Hub
          </h1>
          <p className="text-xs text-slate-500">
            End-to-end management of vendor registrations, statutory document audits, tender RFPs, site access passes & live portal CMS.
          </p>
        </div>

        {/* Global Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/empanelment"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Open Live Public Portal"
          >
            <span>Public Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href="/empanelment/verify-pass"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Open Guard Scanner Simulator"
          >
            <QrCode className="w-3.5 h-3.5 text-rose-600" />
            <span>Guard Scanner</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href="/admin/automail?brand=empanelment"
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
            title="AutoMail Dispatcher"
          >
            <Send className="w-3.5 h-3.5 text-amber-600" />
            <span>AutoMail</span>
          </Link>

          <Link
            href="/admin/empanelment/content"
            className="px-3.5 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs shadow-red-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Studio</span>
          </Link>
        </div>
      </div>

      {/* Main Page Slot */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
