"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Printer,
  QrCode,
  ArrowRight,
  Award,
  RefreshCw,
  Phone,
} from "lucide-react";
import SmartCardPreviewModal from "@/components/admin/empanelment/SmartCardPreviewModal";
import {
  EmpanelmentContent,
  DEFAULT_EMPANELMENT_CONTENT,
} from "@/lib/empanelmentContent";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get("id") || "";

  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);
  const [trackingQuery, setTrackingQuery] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [isSmartCardOpen, setIsSmartCardOpen] = useState(false);

  useEffect(() => {
    async function loadCms() {
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
    loadCms();
  }, []);

  const handleTrack = useCallback(async (queryToUse?: string) => {
    const q = (queryToUse || trackingQuery).trim();
    if (!q) {
      setError("Please enter your Tracking ID or registered Phone Number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/empanelment/track/${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "No empanelment application found for this reference.");
      }

      setResult(json.application);
    } catch (err: any) {
      setError(err.message || "Could not track application");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [trackingQuery]);

  useEffect(() => {
    if (initialId) {
      handleTrack(initialId);
    }
  }, [initialId, handleTrack]);

  const stages = [
    { title: "Application Submitted", sub: "पंजीकरण प्राप्त हुआ" },
    { title: "Document KYC Verification", sub: "दस्तावेज़ सत्यापन" },
    { title: "Capacity Tier Assessment", sub: "श्रेणी निर्धारण" },
    { title: "Empanelled Partner Active", sub: "आधिकारिक अनुबंध भागीदार" },
  ];

  const getStageIndex = (status: string) => {
    if (status === "SUBMITTED") return 0;
    if (status === "UNDER_REVIEW" || status === "DOCS_REQUESTED") return 1;
    if (status === "APPROVED") return 3;
    return 1;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 space-y-8 text-xs">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          REAL-TIME CONTRACTOR STATUS
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">
          Track Empanelment & Download Smart ID Card
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          आवेदन की लाइव स्थिति जांचें एवं स्वीकृत होने पर अपना डिजिटल स्मार्ट कार्ड डाउनलोड करें
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <label className="block text-[10px] uppercase font-bold text-slate-500">
          Enter Tracking ID (e.g. HP-EMP-849201) or Registered Phone Number
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="HP-EMP-XXXXXX or 98290XXXXX"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <button
            onClick={() => handleTrack()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shrink-0 transition-colors shadow-xs"
          >
            {loading ? "Checking..." : "Track Status"}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          {/* Top Bar: Company Name & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {result.trackingId}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {result.category}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                {result.companyName}
              </h2>
              <p className="text-slate-500 text-[11px]">
                Proprietor: {result.contactName} • City: {result.city || "Jaipur"}
              </p>
            </div>

            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  result.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : result.status === "REJECTED"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : result.status === "DOCS_REQUESTED"
                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {result.status}
              </span>
            </div>
          </div>

          {/* 4-Stage Stepper Bar */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Onboarding Workflow Progress
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stages.map((st, i) => {
                const currentIdx = getStageIndex(result.status);
                const isPassed = i <= currentIdx;
                const isCurrent = i === currentIdx;

                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 ${
                      isPassed
                        ? "bg-emerald-50/50 border-emerald-300 text-emerald-900"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px]">STAGE 0{i + 1}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs">{st.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{st.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workflow Stage Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-700 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400">Current Remarks / स्थिति विवरण</p>
            <p className="text-xs font-semibold text-slate-900">{result.currentStage || result.status}</p>
          </div>

          {/* When APPROVED: Show PVC Smart Card Action & Gate Pass Launch */}
          {result.status === "APPROVED" && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-amber-950 text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm tracking-wide text-amber-300">
                  Partner Credentials Active • {result.tier?.replace("_", " ")}
                </h3>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Congratulations! Your empanelment dossier has been verified and approved by Hindustan Projects. You can now generate your official PVC Smart Card and daily 24-hr site gate passes.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => setIsSmartCardOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View & Print PVC Smart Card</span>
                </button>

                <Link
                  href={`/empanelment/gate-pass?trackingId=${result.trackingId}`}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Daily Site Gate Pass</span>
                </Link>

                <Link
                  href="/empanelment/tenders"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Participate in Active Tenders ↗</span>
                </Link>
              </div>
            </div>
          )}

          {/* Smart Card Modal */}
          <SmartCardPreviewModal
            vendor={result}
            isOpen={isSmartCardOpen}
            onClose={() => setIsSmartCardOpen(false)}
          />
        </div>
      )}

      {/* Procurement Helpline Support Box */}
      <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
        <p className="text-xs text-slate-500">
          Need help with your empanelment application status? Contact the procurement helpdesk:
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

export default function EmpanelmentTrackingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading tracker...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
