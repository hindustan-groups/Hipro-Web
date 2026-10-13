"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Printer,
  Clock,
  MapPin,
  Users,
  Truck,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  EmpanelmentContent,
  DEFAULT_EMPANELMENT_CONTENT,
} from "@/lib/empanelmentContent";

function GatePassContent() {
  const searchParams = useSearchParams();
  const defaultTrackingId = searchParams?.get("trackingId") || "";

  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);
  const [trackingId, setTrackingId] = useState(defaultTrackingId);
  const [siteLocation, setSiteLocation] = useState("Mansarovar Commercial Site, Jaipur");
  const [purpose, setPurpose] = useState("RCC & Civil Structural Works");
  const [personsCount, setPersonsCount] = useState(8);
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedPass, setGeneratedPass] = useState<any | null>(null);

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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/empanelment/gate-pass/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingId.trim().toUpperCase(),
          siteLocation,
          purpose,
          personsCount: parseInt(personsCount.toString(), 10) || 1,
          vehicleNumber: vehicleNumber.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate site gate pass");
      }

      setGeneratedPass(json.pass);
    } catch (err: any) {
      setError(err.message || "Could not generate gate pass");
      setGeneratedPass(null);
    } finally {
      setLoading(false);
    }
  };

  const qrUrl = generatedPass
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        `https://empanelment.hindustanprojects.in/verify-pass?passCode=${generatedPass.passCode}`
      )}`
    : "";

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
          Empanelled contractors must generate a daily digital QR pass before site entry for security logging.
        </p>
      </div>

      {content.gatePassInstructions && (
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-900 leading-relaxed">{content.gatePassInstructions}</p>
        </div>
      )}

      {!generatedPass ? (
        <form
          onSubmit={handleGenerate}
          className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-4"
        >
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Your Empanelment Tracking ID *
            </label>
            <input
              type="text"
              required
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              placeholder="e.g. HP-EMP-849201"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Must be an approved active empanelled partner.
            </p>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Hindustan Projects Site Location *
            </label>
            <select
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
            >
              <option value="Mansarovar Commercial Site, Jaipur">Mansarovar Commercial Hub, Jaipur</option>
              <option value="Jagatpura PEB Warehouse Project, Jaipur">Jagatpura PEB Warehouse, Jaipur</option>
              <option value="Sitapura Industrial Complex, Jaipur">Sitapura Industrial Complex, Jaipur</option>
              <option value="Vaishali Nagar High-Rise Site, Jaipur">Vaishali Nagar High-Rise, Jaipur</option>
              <option value="Ajmer Highway Logistics Park">Ajmer Highway Logistics Park</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Purpose of Site Entry *
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. RCC Column Casting / Plumbing Inspection"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Total Persons / Labour Count *
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={personsCount}
                onChange={(e) => setPersonsCount(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Vehicle Number (If any)
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g. RJ-14-XX-1234"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 uppercase focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all text-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>{loading ? "Generating Security Pass..." : "Generate Today's Gate Pass (पास बनाएं)"}</span>
          </button>
        </form>
      ) : (
        /* Generated Gate Pass Badge Card */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-rose-500/40 p-6 md:p-8 shadow-2xl space-y-6 text-center select-none">
            {/* Header Ribbon */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-left">
                <p className="text-[10px] font-mono font-black text-rose-600 uppercase tracking-widest">
                  HINDUSTAN PROJECTS SECURITY
                </p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">24-HOUR SITE ACCESS PASS</p>
              </div>

              <span className="font-mono font-black text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            </div>

            {/* Dynamic Security QR */}
            <div className="py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Gate Pass QR"
                className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl border border-slate-200 shadow-md"
              />
              <p className="font-mono font-black text-sm text-slate-900 mt-2 tracking-wider">
                {generatedPass.passCode}
              </p>
            </div>

            {/* Pass Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Site Location</p>
                <p className="font-semibold text-slate-900 line-clamp-1">{generatedPass.siteLocation}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Work Purpose</p>
                <p className="font-semibold text-slate-900 line-clamp-1">{generatedPass.purpose}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Headcount</p>
                <p className="font-bold text-slate-900">{generatedPass.personsCount} Persons Authorized</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Vehicle</p>
                <p className="font-mono font-bold text-slate-900">{generatedPass.vehicleNumber || "None"}</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
              {content.gatePassTerms || "Valid for today only. Show this QR screen to site security guards at the entry gate."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save Pass</span>
            </button>

            <button
              onClick={() => setGeneratedPass(null)}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold transition-colors"
            >
              Generate Another Pass
            </button>
          </div>
        </div>
      )}
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
