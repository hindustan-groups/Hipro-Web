"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  RefreshCw,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  AlertCircle,
  Clock,
  IndianRupee,
  CheckCircle2,
  Trash2,
  Users,
} from "lucide-react";
import TenderCreateModal from "@/components/admin/empanelment/TenderCreateModal";

export default function TendersRadarPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchTenders = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/empanelment/admin/tenders", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401 || (res.redirected && res.url.includes("admin-login"))) {
        window.location.href = "/admin-login";
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Unable to load tenders (Session expired or server error)");
      }

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load tenders");

      const tList = json.tenders || [];
      setTenders(tList);
      if (tList.length > 0 && !selectedTender) {
        setSelectedTender(tList[0]);
        fetchBids(tList[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch tenders");
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async (tenderId: string) => {
    setBidsLoading(true);
    try {
      const res = await fetch(`/api/empanelment/admin/tenders/${tenderId}/bids`, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401 || (res.redirected && res.url.includes("admin-login"))) {
        window.location.href = "/admin-login";
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return;

      const json = await res.json();
      if (json.success) {
        setBids(json.bids || []);
      }
    } catch (err) {
      console.error("Failed to fetch bids", err);
    } finally {
      setBidsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTender = (tender: any) => {
    setSelectedTender(tender);
    fetchBids(tender.id);
  };

  const handleDeleteTender = async (tenderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this tender package?")) return;

    try {
      const res = await fetch(`/api/empanelment/admin/tenders/${tenderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setTenders((prev) => prev.filter((t) => t.id !== tenderId));
        if (selectedTender?.id === tenderId) {
          setSelectedTender(null);
          setBids([]);
        }
      }
    } catch (err) {
      alert("Failed to delete tender");
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Tenders Radar & L1/L2 Bidding Comparison
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Publish site work packages, collect commercial quotes, and identify lowest compliant L1 bids
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTenders}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Create New Tender</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Split Layout: Tenders List (Left) + Bids Comparison (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Published Tenders */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Active Procurement Packages ({tenders.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="p-8 text-center text-slate-400 bg-white/70 rounded-2xl border border-slate-200/60">
                Loading tenders...
              </div>
            ) : tenders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-white/70 rounded-2xl border border-slate-200/60 space-y-2">
                <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700">No active tenders published</p>
                <p className="text-[11px] text-slate-400">Click &quot;Create New Tender&quot; to publish your first package.</p>
              </div>
            ) : (
              tenders.map((tender) => {
                const isSelected = selectedTender?.id === tender.id;
                return (
                  <div
                    key={tender.id}
                    onClick={() => handleSelectTender(tender)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-500/10"
                        : "bg-white/80 hover:bg-white border-slate-200/70 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[10px] font-bold text-amber-900 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-200/70">
                            {tender.tenderNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {tender.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-xs line-clamp-1">
                          {tender.title}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => handleDeleteTender(tender.id, e)}
                        className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                        title="Delete Tender"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{tender.location || "Jaipur"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{tender.estimatedBudget || "—"}</span>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {tender.bidsCount || 0} bids
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Bids Radar & L1 Comparison */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTender ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-5">
              {/* Selected Tender Overview Banner */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-200/70">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-amber-800">
                      {selectedTender.tenderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 font-bold text-[10px] uppercase">
                      {selectedTender.status}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">{selectedTender.title}</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Est. Budget: <span className="font-semibold text-slate-800">{selectedTender.estimatedBudget}</span> • Deadline:{" "}
                    {new Date(selectedTender.deadline).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase text-amber-800">Total Quotations</p>
                  <p className="text-xl font-black text-amber-950 font-display">
                    {bids.length}
                  </p>
                </div>
              </div>

              {/* Scope of Work */}
              {selectedTender.scopeOfWork && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800 block mb-0.5">Scope of Work:</span>
                  {selectedTender.scopeOfWork}
                </div>
              )}

              {/* Bids Table with L1 Ranking */}
              <div className="space-y-2">
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                  Commercial Bids Comparison (Lowest L1 First)
                </h3>

                {bidsLoading ? (
                  <div className="p-8 text-center text-slate-400">Comparing commercial quotes...</div>
                ) : bids.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                    No partner bids received yet for this tender package.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bids.map((bid, index) => {
                      const isL1 = index === 0;
                      const isL2 = index === 1;

                      return (
                        <div
                          key={bid.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isL1
                              ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-400/80 shadow-xs"
                              : isL2
                              ? "bg-amber-50/40 border-amber-200"
                              : "bg-white border-slate-200/80"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* L1 / L2 / L3 Badge */}
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-xs shrink-0 ${
                                isL1
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : isL2
                                  ? "bg-amber-600 text-white"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              L{index + 1}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 line-clamp-1">
                                  {bid.vendor?.companyName || "Vendor"}
                                </h4>
                                {isL1 && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase tracking-wider">
                                    Lowest Compliant
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {bid.vendor?.contactName} • {bid.vendor?.phone} • {bid.proposedDays ? `${bid.proposedDays} Days timeline` : "Timeline TBD"}
                              </p>
                              {bid.remarks && (
                                <p className="text-[10px] text-slate-400 italic mt-0.5">&quot;{bid.remarks}&quot;</p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-sm font-black font-mono text-slate-900 tracking-tight">
                              ₹{Number(bid.bidAmount).toLocaleString("en-IN")}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(bid.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-white/70 rounded-2xl border border-slate-200/60 text-slate-400 text-xs">
              Select a tender from the left to view quotes & L1 ranking.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <TenderCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => fetchTenders()}
      />
    </div>
  );
}
