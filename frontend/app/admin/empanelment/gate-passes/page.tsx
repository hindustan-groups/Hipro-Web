"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Clock,
  Truck,
  Building2,
  Calendar,
} from "lucide-react";

export default function GatePassesSecurityLogPage() {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPass, setSelectedPass] = useState<any | null>(null);

  const fetchPasses = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/empanelment/admin/gate-passes", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401 || (res.redirected && res.url.includes("admin-login"))) {
        window.location.href = "/admin-login";
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Unable to load gate passes (Session expired or server error)");
      }

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load gate passes");
      setPasses(json.passes || []);
    } catch (err: any) {
      setError(err.message || "Failed to load gate passes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const filteredPasses = passes.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const vNum = (p.vehicleNo || p.vehicleNumber || "").toLowerCase();
    return (
      p.passCode?.toLowerCase().includes(q) ||
      p.vendor?.companyName?.toLowerCase().includes(q) ||
      p.visitorName?.toLowerCase().includes(q) ||
      p.supervisor?.toLowerCase().includes(q) ||
      p.purpose?.toLowerCase().includes(q) ||
      vNum.includes(q) ||
      p.siteLocation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Site Security & 24-Hour Gate Pass Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Live log of authorized contractor entries, labour counts, vehicle numbers, and guard scanner verifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPasses}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <a
            href="/empanelment/verify-pass"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1.5 shadow-md shadow-slate-900/20 transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open Guard Scanner Simulator ↗</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by pass code (HP-GP-...), company name, vehicle number, site..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        />
      </div>

      {/* Gate Passes Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading site access registry...</div>
        ) : filteredPasses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <ShieldCheck className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No gate passes logged</p>
            <p className="text-[11px] text-slate-400">Passes generated by empanelled vendors will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Pass Code</th>
                  <th className="px-4 py-3">Vendor / Contractor</th>
                  <th className="px-4 py-3">Site Location & Purpose</th>
                  <th className="px-4 py-3">Labour & Vehicle</th>
                  <th className="px-4 py-3">Valid Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">QR Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPasses.map((pass) => (
                  <tr key={pass.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {pass.passCode}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{pass.vendor?.companyName || "Vendor"}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {pass.vendor?.phone || "—"} • {pass.vendor?.tier?.replace("_", " ")}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{pass.siteLocation}</p>
                      <p className="text-[11px] text-slate-500">{pass.purpose}</p>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3 h-3 text-slate-400" />
                          {pass.workerCount || pass.personsCount || 1} Pers.
                        </span>
                        {(pass.vehicleNo || pass.vehicleNumber) && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {pass.vehicleNo || pass.vehicleNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {new Date(pass.validTill || pass.validDate || Date.now()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          pass.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : pass.status === "VERIFIED_ENTERED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {pass.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedPass(pass)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors text-[11px] inline-flex items-center gap-1"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Security QR</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security QR Pass Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedPass(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-mono font-bold text-xs text-rose-600">{selectedPass.passCode}</span>
              <button
                onClick={() => setSelectedPass(null)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                `https://empanelment.hindustanprojects.in/verify-pass?passCode=${selectedPass.passCode}`
              )}`}
              alt="Gate Pass QR"
              className="w-48 h-48 mx-auto p-2 bg-white rounded-2xl border border-slate-200 shadow-sm"
            />

            <div>
              <h3 className="font-bold text-slate-900 text-sm">{selectedPass.vendor?.companyName}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{selectedPass.siteLocation}</p>
              <p className="text-[11px] font-semibold text-slate-700 mt-1">
                {selectedPass.personsCount} Persons • Vehicle: {selectedPass.vehicleNumber || "None"}
              </p>
            </div>

            <p className="text-[10px] text-slate-400">
              Security guards scan this QR on arrival to verify identity against Hindustan Projects registry.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
