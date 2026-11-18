"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Users,
  Truck,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Phone,
  FileText,
} from "lucide-react";
import { useVendorPortal, vendorFetch } from "../context";

export default function VendorGatePassPage() {
  const { vendor } = useVendorPortal();
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New Pass Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [workerCount, setWorkerCount] = useState("1");
  const [vehicleNo, setVehicleNo] = useState("");
  const [purpose, setPurpose] = useState("");
  const [phone, setPhone] = useState(vendor?.application?.phone || "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await vendorFetch("/api/vendor/portal/gate-passes", {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        const passList = json.data || json.passes || [];
        setPasses(passList);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load site gate passes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const handleCreatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setFormError("Project / Construction Site name is required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await vendorFetch("/api/vendor/portal/gate-passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: projectName.trim(),
          workerCount: parseInt(workerCount, 10) || 1,
          vehicleNo: vehicleNo.trim() || undefined,
          purpose: purpose.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to issue gate pass");
      }

      setIsModalOpen(false);
      setProjectName("");
      setWorkerCount("1");
      setVehicleNo("");
      setPurpose("");
      fetchPasses();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while creating gate pass.");
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();
  const activePass = passes.find(
    (p) => p.status === "ACTIVE" && new Date(p.validTill) > now
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Daily Site Gate Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate 24-hour QR-verified entry credentials for Hindustan Projects site access.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Gate Pass</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ACTIVE 24-HOUR PASS VISUAL CARD */}
      {/* ============================================================== */}
      {activePass ? (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {activePass.passId || activePass.id}
                </span>
                <h2 className="text-base font-black text-white mt-0.5">
                  ACTIVE 24-HOUR SITE GATE PASS
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>AUTHORISED</span>
              </span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Pass Metadata */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Assigned Site
                  </span>
                  <span className="font-bold text-white mt-1 block">
                    {activePass.siteName}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Valid Until
                  </span>
                  <span className="font-mono font-bold text-amber-300 mt-1 block">
                    {new Date(activePass.validTill).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Worker Count
                  </span>
                  <span className="font-bold text-white mt-0.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activePass.workerCount || 1} Persons</span>
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Vehicle Number
                  </span>
                  <span className="font-mono font-bold text-white mt-0.5 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activePass.vehicleNo || "N/A (Pedestrian)"}</span>
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Vendor Partner
                  </span>
                  <span className="font-bold text-white mt-0.5 truncate block">
                    {activePass.vendorName}
                  </span>
                </div>
              </div>

              {activePass.securityRemarks && (
                <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Security Scope / Remarks
                  </span>
                  <p>{activePass.securityRemarks}</p>
                </div>
              )}
            </div>

            {/* QR Code Verification Display */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl text-slate-950 text-center shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  `https://www.hindustanprojects.in/empanelment/verify-pass?passCode=${encodeURIComponent(
                    activePass.passCode || activePass.passId || activePass.id
                  )}`
                )}`}
                alt="Gate Pass QR Code"
                className="w-36 h-36 mx-auto rounded-lg"
              />
              <span className="font-mono text-[10px] font-bold text-slate-500 mt-2">
                SCAN AT SECURITY GATE
              </span>
              <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                HiPRO Guard Inspection
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-3">
          <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="font-black text-sm text-slate-950">No Active 24-Hour Gate Pass</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not currently have an active site gate pass. If your team is mobilizing to a site today, click &quot;New Daily Gate Pass&quot; to issue entry credentials.
          </p>
        </div>
      )}

      {/* ============================================================== */}
      {/* PASS HISTORY TABLE */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-sm text-slate-950">Site Pass History</h2>
            <p className="text-xs text-slate-500">Record of previously generated site entry passes</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Total: {passes.length}
          </span>
        </div>

        {passes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No gate passes on record yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-5">Pass ID</th>
                  <th className="py-3 px-5">Project Site</th>
                  <th className="py-3 px-5">Workers</th>
                  <th className="py-3 px-5">Vehicle No</th>
                  <th className="py-3 px-5">Valid Till</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {passes.map((p) => {
                  const isExpired = new Date(p.validTill) < now;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#dc2626]">
                        {p.passId || p.id}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">{p.siteName}</td>
                      <td className="py-3.5 px-5 text-slate-600">{p.workerCount || 1}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-600">
                        {p.vehicleNo || "—"}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-600">
                        {new Date(p.validTill).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            !isExpired && p.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {!isExpired && p.status === "ACTIVE" ? "ACTIVE" : "EXPIRED"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* NEW GATE PASS MODAL */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-950 text-base">Issue 24-Hr Site Pass</h3>
                <p className="text-xs text-slate-500">Authorized for immediate site entry</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{formError}</div>
              </div>
            )}

            <form onSubmit={handleCreatePass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Project Site Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Adani Gas Chamber, Jaipur"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Worker Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={workerCount}
                    onChange={(e) => setWorkerCount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="e.g. RJ14 AB 1234"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs uppercase font-mono focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Reinforcement tying and shuttering inspection"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Supervisor Contact Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Generating..." : "Generate 24-Hr Pass"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
