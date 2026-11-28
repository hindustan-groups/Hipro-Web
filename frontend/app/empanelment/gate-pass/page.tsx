"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  QrCode,
  ArrowRight,
  HardHat,
  Truck,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  Building2,
} from "lucide-react";
import {
  EmpanelmentContent,
  DEFAULT_EMPANELMENT_CONTENT,
} from "@/lib/empanelmentContent";

function GatePassContent() {
  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);
  const [cmsLoaded, setCmsLoaded] = useState(false);

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
      } catch (_e) {
      } finally {
        setCmsLoaded(true);
      }
    }
    fetchCms();
  }, []);

  if (cmsLoaded && !content.gatePassEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="bg-white rounded-3xl border border-amber-200/90 p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            TEMPORARILY UNAVAILABLE
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Site Gate Pass Module is Currently Disabled
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Daily 24-hour site gate pass self-service is temporarily turned off by Hindustan Projects administration while the site access workflow is being finalized. Please coordinate with your site engineer or procurement desk.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/empanelment/tenders"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors"
            >
              Browse Active Tenders
            </Link>
            <Link
              href="/empanelment"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Back to Portal Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-8 text-xs">
      {/* Header */}
      <div className="text-center space-y-2.5 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#dc2626] bg-red-50 px-3 py-1 rounded-full border border-red-200">
          SITE ACCESS & SECURITY CLEARANCE
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight font-display">
          24-Hour Site Gate Pass Gateway (डेली साइट पास)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Official digital gate clearance system for Hindustan Projects construction sites, authorized contractor teams, machinery operators, and security checkpoints.
        </p>
      </div>

      {/* Primary Gateway Cards (2-Column Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Empanelled Contractor Official Pass Issuance */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#dc2626] border border-red-200 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                AUTHORIZED PARTNERS
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Empanelled Contractor Daily Passes
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Approved vendors can instantly issue verified 24-hour QR gate passes for field supervisors, labour teams, and delivery trucks directly through their partner dashboard.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>24-Hour valid printable pass with security QR code</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Headcount tracking & vehicle registration numbers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Automatic entry logging in project site register</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/empanelment/login?redirect=/empanelment/portal/gate-pass"
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs text-center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Partner Login to Issue Pass</span>
                </Link>
                <Link
                  href="/empanelment/apply"
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
                >
                  Register
                </Link>
              </div>
          </div>
        </div>

        {/* Card 2: Security Gate Guard QR Scanner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-700 border border-violet-200 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200">
                SECURITY DESK
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Security Guard Gate Pass Scanner
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Project site security guards and gate officers can verify incoming contractor passes, inspect validity countdowns, and check approved worker numbers in real time.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <span>Instant QR code scanning from smartphone camera</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <span>6-character Pass Code lookup tool</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <span>Active vs Expired status detection</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/empanelment/verify-pass"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-rose-400" />
              <span>Open Gate Pass Scanner Tool ↗</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Site Access & Safety Compliance Guidelines */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <HardHat className="w-4 h-4 text-amber-600" />
          <span>Construction Site Entry Protocols & PPE Compliance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
            <span className="font-mono text-[10px] font-bold text-[#dc2626]">01. PASS CODE</span>
            <h4 className="font-bold text-slate-900">Valid Digital Pass</h4>
            <p className="text-[11px] text-slate-500">Every worker group must present an active 24-hr QR gate pass at the security booth.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
            <span className="font-mono text-[10px] font-bold text-amber-600">02. MANDATORY PPE</span>
            <h4 className="font-bold text-slate-900">Safety Gear Required</h4>
            <p className="text-[11px] text-slate-500">Hard hats, reflective safety jackets, and steel-toe safety boots are strictly mandatory.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
            <span className="font-mono text-[10px] font-bold text-violet-600">03. VEHICLE LOG</span>
            <h4 className="font-bold text-slate-900">Machinery & Trucks</h4>
            <p className="text-[11px] text-slate-500">Commercial vehicles must record PUC and driver credentials with the site gate register.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
            <span className="font-mono text-[10px] font-bold text-emerald-600">04. ID SMART CARD</span>
            <h4 className="font-bold text-slate-900">Contractor Verification</h4>
            <p className="text-[11px] text-slate-500">Empanelled supervisors must carry their official HiPRO PVC Contractor Smart ID.</p>
          </div>
        </div>
      </div>

      {/* Central Support Desk */}
      <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-white border border-slate-200/80 text-center space-y-2 shadow-2xs">
        <p className="text-xs text-slate-500">
          For project site gate access inquiries or security supervisor coordination, contact:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-700">
          {content.phone && (
            <a href={`tel:${content.phone.replace(/\s+/g, "")}`} className="hover:text-amber-600 transition-colors">
              📞 {content.phone}
            </a>
          )}
          {content.email && (
            <a href={`mailto:${content.email}`} className="hover:text-amber-600 transition-colors">
              ✉️ {content.email}
            </a>
          )}
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
