"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  EmpanelmentContent,
  DEFAULT_EMPANELMENT_CONTENT,
} from "@/lib/empanelmentContent";

function GatePassContent() {
  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);

  useEffect(() => {
    async function fetchCms() {
      try {
        const res = await fetch("/api/empanelment/content", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content) {
            setContent({ ...DEFAULT_EMPANELMENT_CONTENT, ...json.content });
          }
        }
      } catch (_e) {}
    }
    fetchCms();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-16 space-y-8 text-xs">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          24-HOUR SITE SECURITY CLEARANCE
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">
          Daily Site Gate Pass Generator (डेली गेट पास)
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Digital security clearance portal for project sites and authorized personnel.
        </p>
      </div>

      {content.gatePassInstructions && (
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-900 leading-relaxed">{content.gatePassInstructions}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Self-Service Gate Pass Generation Temporarily Suspended
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Online self-service gate pass generation is temporarily suspended pending portal authentication and security upgrades.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2 text-xs">
          <p className="font-bold text-slate-800">Site Access & Clearance Guidelines:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
            <li>
              Online self-service gate pass generation is temporarily suspended pending portal authentication and security upgrades.
            </li>
            <li>
              Contractors and vendor personnel requiring site access must contact their respective project site administration or project management team for approved site clearance procedures.
            </li>
            <li>
              Verification of previously issued digital passes remains active and can be verified using the link below.
            </li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/empanelment/verify-pass"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs text-xs"
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Verify Existing Gate Pass (पास जांचें)</span>
          </Link>
          <Link
            href="/empanelment"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold transition-colors text-xs text-center"
          >
            Empanelment Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DailyGatePassGeneratorPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading pass generator...</div>}>
      <GatePassContent />
    </Suspense>
  );
}
