"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Search,
  Building2,
  Users,
  Truck,
  MapPin,
  Clock,
  Calendar,
} from "lucide-react";

function VerifyPassContent() {
  const searchParams = useSearchParams();
  const initialPassCode = searchParams?.get("passCode") || "";

  const [passCodeInput, setPassCodeInput] = useState(initialPassCode);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async (codeToUse?: string) => {
    const raw = (codeToUse || passCodeInput).trim().toUpperCase();
    if (!raw) {
      setError("Please enter a Gate Pass code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/empanelment/gate-pass/verify/${encodeURIComponent(raw)}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok || !json.valid) {
        setVerificationResult({
          valid: false,
          error: json.error || "Gate Pass not found in Hindustan Projects registry.",
          passCode: raw,
        });
      } else {
        setVerificationResult({
          valid: true,
          pass: json.pass,
        });
      }
    } catch (err: any) {
      setError("Network error connecting to security registry.");
    } finally {
      setLoading(false);
    }
  }, [passCodeInput]);

  useEffect(() => {
    if (initialPassCode) {
      handleVerify(initialPassCode);
    }
  }, [initialPassCode, handleVerify]);

  return (
    <div className="max-w-xl mx-auto px-4 py-12 md:py-20 space-y-6 text-xs text-center">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>HINDUSTAN PROJECTS SECURITY DESK</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
          Gate Pass Verification Scanner
        </h1>
        <p className="text-slate-500 text-[11px]">
          गार्ड चेकिंग: क्यूआर कोड स्कैन करें या गेट पास कोड दर्ज करें
        </p>
      </div>

      {/* Manual Code Input Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="HP-GP-XXXXXX"
            value={passCodeInput}
            onChange={(e) => setPassCodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs"
          />
          <button
            onClick={() => handleVerify()}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-colors"
          >
            {loading ? "Checking..." : "Verify Pass"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-[11px] font-semibold mt-2 text-left">
            {error}
          </p>
        )}
      </div>

      {/* High-Contrast Verification Card */}
      {verificationResult && (
        <div className="animate-in zoom-in-95 duration-200">
          {verificationResult.valid ? (
            /* VALID PASS GREEN SCREEN */
            <div className="bg-emerald-600 text-white rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 text-left">
              <div className="text-center space-y-2 pb-4 border-b border-emerald-500">
                <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight font-display">
                  VALID GATE PASS — ENTRY ALLOWED
                </h2>
                <span className="font-mono font-black text-sm px-3 py-1 rounded-full bg-emerald-700 border border-emerald-400 inline-block">
                  {verificationResult.pass.passCode}
                </span>
              </div>

              {/* Verified Details */}
              <div className="space-y-3 bg-emerald-700/60 p-4 rounded-2xl border border-emerald-500/60 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-200">Contractor / Vendor</p>
                  <p className="text-sm font-black">{verificationResult.pass.vendor?.companyName}</p>
                  <p className="text-[11px] text-emerald-100">
                    {verificationResult.pass.vendor?.contactName} • {verificationResult.pass.vendor?.phone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-600">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-200">Authorized Headcount</p>
                    <p className="font-bold text-sm">{verificationResult.pass.personsCount} Persons</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-200">Vehicle Number</p>
                    <p className="font-mono font-bold text-sm">{verificationResult.pass.vehicleNumber || "None"}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-600">
                  <p className="text-[10px] uppercase font-bold text-emerald-200">Site Location & Purpose</p>
                  <p className="font-semibold">{verificationResult.pass.siteLocation}</p>
                  <p className="text-[11px] text-emerald-100">{verificationResult.pass.purpose}</p>
                </div>
              </div>

              <div className="text-center text-[11px] text-emerald-100 font-medium">
                ✓ Recorded in Central Security Registry • Date:{" "}
                {new Date(verificationResult.pass.validDate).toLocaleDateString("en-IN")}
              </div>
            </div>
          ) : (
            /* INVALID PASS RED SCREEN */
            <div className="bg-red-600 text-white rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white text-red-600 flex items-center justify-center mx-auto shadow-lg">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight font-display">
                ENTRY DENIED — INVALID / EXPIRED PASS
              </h2>
              <p className="text-xs text-red-100 max-w-sm mx-auto">
                {verificationResult.error}
              </p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-red-200 pt-2">
                DO NOT PERMIT SITE ACCESS WITHOUT OFFICIAL AUTHORIZATION
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SecurityPassVerificationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading scanner...</div>}>
      <VerifyPassContent />
    </Suspense>
  );
}
