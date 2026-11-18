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
  X,
  MapPin,
} from "lucide-react";
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";

export default function GatePassesSecurityLogPage() {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
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

  const activeCount = passes.filter((p) => p.status === "ACTIVE").length;
  const verifiedCount = passes.filter((p) => p.status === "VERIFIED_ENTERED").length;

  return (
    <div className="space-y-6">
      {/* Apple Page Header */}
      <EmpanelmentAdminPageHeader
        badge="Site Security"
        title="Site Security & 24-Hour Gate Pass Registry"
        description="Live log of authorized contractor entries, workforce headcounts, vehicle numbers, and guard scanner verifications."
        breadcrumbs={[
          { label: "Empanelment", href: "/admin/empanelment" },
          { label: "Gate Passes" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPasses}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition-colors shadow-xs disabled:opacity-50"
              title="Refresh Registry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
            </button>

            <a
              href="/empanelment/verify-pass"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.99]"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Guard Scanner Simulator ↗</span>
            </a>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-rose-800 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Segmented Tabs */}
        <div className="inline-flex items-center p-1 bg-slate-200/50 rounded-2xl border border-slate-200/60 max-w-fit">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Passes ({passes.length})
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === "ACTIVE"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("VERIFIED_ENTERED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === "VERIFIED_ENTERED"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Verified On-Site ({verifiedCount})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pass code, vendor, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs"
          />
        </div>
      </div>

      {/* Gate Passes Table */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            Loading security pass registry...
          </div>
        ) : filteredPasses.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">No gate passes found</p>
            <p className="text-xs text-slate-400">Passes generated by empanelled vendors will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Pass Code</th>
                  <th className="px-5 py-3.5">Vendor / Contractor</th>
                  <th className="px-5 py-3.5">Site Location & Purpose</th>
                  <th className="px-5 py-3.5">Labour & Vehicle</th>
                  <th className="px-5 py-3.5">Valid Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredPasses.map((pass) => (
                  <tr key={pass.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
                        {pass.passCode}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{pass.vendor?.companyName || "Vendor"}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {pass.vendor?.phone || "—"} • {pass.vendor?.tier?.replace("_", " ")}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{pass.siteLocation}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{pass.purpose}</p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {pass.workerCount || pass.personsCount || 1} Pers.
                        </span>
                        {(pass.vehicleNo || pass.vehicleNumber) && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200/50">
                            {pass.vehicleNo || pass.vehicleNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {new Date(pass.validTill || pass.validDate || Date.now()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          pass.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                            : pass.status === "VERIFIED_ENTERED"
                            ? "bg-slate-100 text-slate-800 border border-slate-200/80"
                            : "bg-slate-50 text-slate-500 border border-slate-200/60"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            pass.status === "ACTIVE"
                              ? "bg-emerald-500 animate-pulse"
                              : pass.status === "VERIFIED_ENTERED"
                              ? "bg-slate-600"
                              : "bg-slate-400"
                          }`}
                        />
                        {pass.status?.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPass(pass)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 text-amber-900 border border-amber-500/20 font-bold transition-all text-xs inline-flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-700" />
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

      {/* Security QR Pass Modal (Apple Sheet Style) */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => setSelectedPass(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-mono font-bold text-xs text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                {selectedPass.passCode}
              </span>
              <button
                onClick={() => setSelectedPass(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                `https://empanelment.hindustanprojects.in/verify-pass?passCode=${selectedPass.passCode}`
              )}`}
              alt="Gate Pass QR"
              className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl border border-slate-200 shadow-xs"
            />

            <div>
              <h3 className="font-bold text-slate-900 text-sm">{selectedPass.vendor?.companyName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedPass.siteLocation}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                {selectedPass.workerCount || selectedPass.personsCount || 1} Persons • Vehicle: {selectedPass.vehicleNo || selectedPass.vehicleNumber || "None"}
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              Security guards scan this QR on site arrival to verify contractor authorization.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
