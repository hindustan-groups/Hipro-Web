"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  RefreshCw,
  Calendar,
  MapPin,
  TrendingUp,
  AlertCircle,
  Clock,
  IndianRupee,
  CheckCircle2,
  Trash2,
  Users,
  Search,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import TenderCreateModal from "@/components/admin/empanelment/TenderCreateModal";
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";

export default function TendersRadarPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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
    if (!confirm("Are you sure you want to delete this procurement package?")) return;

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
    } catch (_err) {
      alert("Failed to delete tender");
    }
  };

  const filteredTenders = tenders.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.tenderNumber?.toLowerCase().includes(q) ||
      t.title?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Apple Page Header */}
      <EmpanelmentAdminPageHeader
        badge="Procurement Radar"
        title="Tenders & Bidding Radar"
        description="Publish site procurement packages, review competitive vendor quotations, and evaluate lowest compliant L1/L2 bids."
        breadcrumbs={[
          { label: "Tenders Radar" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTenders}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition-colors shadow-xs disabled:opacity-50"
              title="Refresh tenders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create Tender</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-rose-800 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Split Layout: Tenders List (Left) + Bids Comparison (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Published Packages */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-semibold text-xs tracking-wider uppercase text-slate-400">
              Active Packages ({filteredTenders.length})
            </h2>
            {tenders.length > 3 && (
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search package..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="p-10 text-center text-slate-400 bg-white/80 rounded-3xl border border-slate-200/80 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                Loading procurement packages...
              </div>
            ) : filteredTenders.length === 0 ? (
              <div className="p-10 text-center bg-white/80 rounded-3xl border border-slate-200/80 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                  <Briefcase className="w-5 h-5" />
                </div>
                <p className="font-bold text-slate-800 text-xs">No procurement packages found</p>
                <p className="text-[11px] text-slate-400">Click &quot;Create Tender&quot; to publish your first site package.</p>
              </div>
            ) : (
              filteredTenders.map((tender) => {
                const isSelected = selectedTender?.id === tender.id;
                return (
                  <div
                    key={tender.id}
                    onClick={() => handleSelectTender(tender)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? "bg-white border-amber-500/60 shadow-[0_4px_20px_rgba(245,158,11,0.08)] ring-2 ring-amber-500/10"
                        : "bg-white/80 hover:bg-white border-slate-200/70 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-amber-900 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-200/70">
                            {tender.tenderNumber}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {tender.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-xs line-clamp-1">
                          {tender.title}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => handleDeleteTender(tender.id, e)}
                        className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 shrink-0"
                        title="Delete Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]">{tender.location || "Jaipur Site"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{tender.estimatedBudget || "—"}</span>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {tender.bidsCount || 0} quotes
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
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-5">
              {/* Selected Tender Overview Banner */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-900 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {selectedTender.tenderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 font-bold text-[10px] uppercase">
                      {selectedTender.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight pt-1">
                    {selectedTender.title}
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <span>Est. Budget: <strong className="text-slate-800 font-semibold">{selectedTender.estimatedBudget}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>
                      Deadline:{" "}
                      <strong className="text-slate-800 font-semibold">
                        {selectedTender.deadline && !isNaN(new Date(selectedTender.deadline).getTime())
                          ? new Date(selectedTender.deadline).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Rolling / Open Submission"}
                      </strong>
                    </span>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Commercial Quotes</p>
                  <p className="text-2xl font-black text-amber-950 font-display mt-0.5">
                    {bids.length}
                  </p>
                </div>
              </div>

              {/* Scope of Work */}
              {selectedTender.scopeOfWork && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-1">Scope of Work:</span>
                  {selectedTender.scopeOfWork}
                </div>
              )}

              {/* Bids Table with L1 Ranking */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">
                    Commercial Quotes (Lowest L1 Compliant First)
                  </h3>
                  {bids.length > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Ordered by lowest price
                    </span>
                  )}
                </div>

                {bidsLoading ? (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                    Comparing contractor quotes...
                  </div>
                ) : bids.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs space-y-1">
                    <p className="font-medium text-slate-600">No partner quotes received yet for this package</p>
                    <p className="text-[11px]">Empanelled vendors can submit commercial quotes through their portal.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {bids.map((bid, index) => {
                      const isL1 = index === 0;
                      const isL2 = index === 1;

                      return (
                        <div
                          key={bid.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isL1
                              ? "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-400/80 shadow-xs"
                              : isL2
                              ? "bg-amber-50/40 border-amber-200/80"
                              : "bg-white border-slate-200/80 hover:shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            {/* L1 / L2 / L3 Badge */}
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-xs shrink-0 ${
                                isL1
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : isL2
                                  ? "bg-amber-600 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              L{index + 1}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-xs">
                                  {bid.vendor?.companyName || "Vendor"}
                                </h4>
                                {isL1 && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase tracking-wider">
                                    Lowest Compliant (L1)
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                {bid.vendor?.contactName} • {bid.vendor?.phone} • {bid.proposedDays ? `${bid.proposedDays} Days timeline` : "Timeline TBD"}
                              </p>
                              {bid.remarks && (
                                <p className="text-[10px] text-slate-500 italic mt-0.5">&quot;{bid.remarks}&quot;</p>
                              )}
                            </div>
                          </div>

                          <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                            <p className="text-base font-black font-mono text-slate-900 tracking-tight">
                              ₹{Number(bid.bidAmount).toLocaleString("en-IN")}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              Submitted {new Date(bid.submittedAt || bid.createdAt || Date.now()).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
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
            <div className="p-16 flex flex-col items-center justify-center bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 text-slate-400 text-xs text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-700">Select a tender package</p>
              <p className="text-[11px]">Click any package on the left to inspect quotations and commercial L1 ranking.</p>
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
