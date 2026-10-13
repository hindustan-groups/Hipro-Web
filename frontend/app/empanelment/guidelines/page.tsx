"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  HardHat,
  Scale,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import {
  EmpanelmentContent,
  EmpanelmentTier,
  EmpanelmentStatutoryDoc,
  EmpanelmentSafetyStandard,
  DEFAULT_EMPANELMENT_CONTENT,
  parseJsonField,
} from "@/lib/empanelmentContent";

export default function EmpanelmentGuidelinesPage() {
  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const cleanUrl = rawUrl.replace(/\/+$/, "");
        const res = await fetch(`${cleanUrl}/api/empanelment/content`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content) {
            setContent({ ...DEFAULT_EMPANELMENT_CONTENT, ...json.content });
          }
        }
      } catch (_e) {
        // Fallback to default content
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const tiers: EmpanelmentTier[] = parseJsonField(
    content.guidelinesTiers,
    parseJsonField(DEFAULT_EMPANELMENT_CONTENT.guidelinesTiers, [])
  );

  const statutoryDocs: EmpanelmentStatutoryDoc[] = parseJsonField(
    content.guidelinesStatutoryDocs,
    parseJsonField(DEFAULT_EMPANELMENT_CONTENT.guidelinesStatutoryDocs, [])
  );

  const safetyStandards: EmpanelmentSafetyStandard[] = parseJsonField(
    content.guidelinesSafetyStandards,
    parseJsonField(DEFAULT_EMPANELMENT_CONTENT.guidelinesSafetyStandards, [])
  );

  return (
    <div className="py-10 bg-slate-50/70 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{content.guidelinesBadge || "Procurement Code & Standards"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            {content.guidelinesTitle || "Vendor Empanelment Guidelines & Compliance Criteria"}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {content.guidelinesSubtitle ||
              "Standard operating procedure, eligibility benchmarks, and statutory documentation guidelines prescribed by Hindustan Projects for civil, MEP, and industrial contracts."}
          </p>
        </div>

        {/* Capacity Tiers Matrix */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                1. Capacity Classification & Thresholds
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vendors are classified into {tiers.length} standardized capacity brackets based on statutory audit scoring.
              </p>
            </div>
            <Link
              href="/empanelment/apply"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <span>Apply for Empanelment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tiers.map((tier, idx) => {
              const borderClass =
                tier.code === "CLASS_A"
                  ? "border-amber-300"
                  : tier.code === "CLASS_B"
                  ? "border-blue-200"
                  : tier.code === "CLASS_C"
                  ? "border-emerald-200"
                  : "border-slate-200";

              return (
                <div
                  key={tier.code || idx}
                  className={`bg-white rounded-3xl p-6 border ${borderClass} shadow-2xs hover:shadow-md transition-all space-y-4 relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                        {tier.code}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{tier.title}</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                      Validity: {tier.validity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Annual Turnover</span>
                      <span className="font-bold text-slate-800">{tier.turnover}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Order Capability</span>
                      <span className="font-bold text-amber-700">{tier.capacity}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-1">Eligible Work Scope:</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{tier.scope}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statutory Documents Required */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              2. Mandatory Statutory Documentation Checklist
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ensure high-resolution photocopies or digital PDF scans are prepared prior to starting the online registration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statutoryDocs.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-xs text-slate-900">{doc.title}</h3>
                </div>
                <div className="text-[11px] font-mono text-amber-700 bg-amber-50/50 px-2 py-0.5 rounded w-fit">
                  {doc.authority} &bull; {doc.requiredFor}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NBC 2016 Safety & Site Protocols */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  3. Site Safety & Quality Protocols (NBC 2016)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  National Building Code of India & Directorate of Industrial Safety Guidelines
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Harm Tolerance Policy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-300">
            {safetyStandards.map((safe, idx) => (
              <div key={safe.id || idx} className="space-y-2">
                <span className="text-[10px] font-mono text-amber-400 font-bold block">{safe.codeRef}</span>
                <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  {String.fromCharCode(65 + idx)}. {safe.title}
                </h3>
                <p>{safe.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer Card */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-display">
              Ready to Partner with Hindustan Projects?
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              Complete your online empanelment in under 10 minutes with our 1-click GST auto-decoder and instant statutory verification.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/empanelment/apply"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>Start Application Now</span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
