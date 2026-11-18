"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileCheck2,
  Search,
  Filter,
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  FileText,
  Building2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useVendorPortal } from "../context";

function TendersPortalContent() {
  const { vendor } = useVendorPortal();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "bids" ? "bids" : "tenders";

  const [activeTab, setActiveTab] = useState<"tenders" | "bids">(initialTab);
  const [tenders, setTenders] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Bid Modal State
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [completionDays, setCompletionDays] = useState("");
  const [remarks, setRemarks] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState("");
  const [bidError, setBidError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tendersRes, bidsRes] = await Promise.all([
        fetch("/api/vendor/portal/tenders", { credentials: "include", cache: "no-store" }),
        fetch("/api/vendor/portal/bids", { credentials: "include", cache: "no-store" }),
      ]);

      if (tendersRes.ok) {
        const json = await tendersRes.json();
        if (json.success && json.data) {
          setTenders(json.data);
        }
      }

      if (bidsRes.ok) {
        const json = await bidsRes.json();
        if (json.success && json.data) {
          setMyBids(json.data);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load tenders and bidding data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenBidModal = (tender: any) => {
    setSelectedTender(tender);
    setBidAmount("");
    setCompletionDays("");
    setRemarks("");
    setDocumentUrl("");
    setBidSuccess("");
    setBidError("");
  };

  const handleCloseBidModal = () => {
    setSelectedTender(null);
    setBidSuccess("");
    setBidError("");
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender) return;

    const amountNum = parseFloat(bidAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setBidError("Please enter a valid bid amount in INR.");
      return;
    }

    setSubmittingBid(true);
    setBidError("");
    setBidSuccess("");

    try {
      const res = await fetch(`/api/vendor/portal/tenders/${selectedTender.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: amountNum,
          completionDays: completionDays ? parseInt(completionDays, 10) : undefined,
          remarks: remarks.trim() || undefined,
          documentUrl: documentUrl.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit tender bid");
      }

      setBidSuccess("Your bid proposal has been submitted successfully!");
      fetchData();
      setTimeout(() => {
        handleCloseBidModal();
        setActiveTab("bids");
      }, 1500);
    } catch (err: any) {
      setBidError(err.message || "An error occurred while submitting your bid.");
    } finally {
      setSubmittingBid(false);
    }
  };

  const app = vendor?.application;
  const vendorCategory = app?.category?.toLowerCase() || "";

  // Filter tenders
  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.tenderNo?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase()) ||
      t.location?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" ||
      (categoryFilter === "MATCHED" && vendorCategory && t.category?.toLowerCase() === vendorCategory) ||
      t.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Procurement Tenders & Bidding
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse published construction tender packages and submit competitive proposals.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab("tenders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "tenders"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Available Tenders ({filteredTenders.length})
          </button>
          <button
            onClick={() => setActiveTab("bids")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "bids"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            My Submitted Bids ({myBids.length})
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AVAILABLE TENDERS */}
      {/* ============================================================== */}
      {activeTab === "tenders" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tender packages by keyword, reference, location..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20"
              >
                <option value="ALL">All Categories</option>
                {vendorCategory && <option value="MATCHED">My Category Matches</option>}
                <option value="Civil Construction">Civil Construction</option>
                <option value="Electrical & MEP">Electrical & MEP</option>
                <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
                <option value="Fabrication & PEB">Fabrication & PEB</option>
                <option value="Flooring & Finishing">Flooring & Finishing</option>
                <option value="Material Supply">Material Supply</option>
              </select>
            </div>
          </div>

          {/* Tenders Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading tenders radar...</div>
          ) : filteredTenders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500 space-y-2">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-950">No Tenders Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No tender packages matched your active filters. Try clearing your search or selecting all categories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTenders.map((tender) => {
                const isMatched =
                  vendorCategory && tender.category?.toLowerCase() === vendorCategory;
                const existingBid = myBids.find((b) => b.tenderId === tender.id);

                return (
                  <div
                    key={tender.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              {tender.tenderNo || tender.tenderNumber || "TNDR"}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {tender.category || "General"}
                            </span>
                            {isMatched && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>Category Match</span>
                              </span>
                            )}
                          </div>
                          <h3 className="font-black text-base text-slate-950 tracking-tight leading-snug">
                            {tender.title}
                          </h3>
                        </div>
                      </div>

                      {tender.scopeOfWork && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {tender.scopeOfWork}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Estimated Value
                          </span>
                          <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                            {tender.estimatedBudget || "Competitive"}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Submission Due
                          </span>
                          <span className="font-mono font-bold text-amber-700 mt-0.5 block">
                            {tender.dueDate || tender.deadline
                              ? new Date(tender.dueDate || tender.deadline).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Open"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tender.location || "Jaipur, Rajasthan"}</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      {existingBid ? (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Bid Submitted</span>
                          </span>
                          <span className="font-mono">
                            ₹{existingBid.amount?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenBidModal(tender)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs group"
                        >
                          <span>Submit Official Bid</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY SUBMITTED BIDS */}
      {/* ============================================================== */}
      {activeTab === "bids" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <h2 className="font-black text-sm text-slate-950">My Submitted Tender Proposals</h2>
            <p className="text-xs text-slate-500">Tracking record of your bidding submissions</p>
          </div>

          {myBids.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              You haven't submitted any bids yet. Explore active tenders and submit your first proposal.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Tender Details</th>
                    <th className="py-3 px-5">Quoted Amount</th>
                    <th className="py-3 px-5">Timeline</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {myBids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-slate-950">{bid.tender?.title || "Tender"}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                          Ref: {bid.tender?.tenderNo || bid.tenderId}
                        </p>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        ₹{bid.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {bid.completionDays ? `${bid.completionDays} Days` : "Standard"}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                          {bid.status || "SUBMITTED"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-500 text-[11px]">
                        {new Date(bid.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* BID SUBMISSION MODAL */}
      {/* ============================================================== */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={handleCloseBidModal} />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#dc2626]">
                  {selectedTender.tenderNo || "TENDER"}
                </span>
                <h3 className="font-black text-slate-950 text-base mt-0.5 line-clamp-1">
                  {selectedTender.title}
                </h3>
              </div>
              <button
                onClick={handleCloseBidModal}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bidError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{bidError}</div>
              </div>
            )}

            {bidSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-semibold">{bidSuccess}</div>
              </div>
            )}

            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Proposed Bid Amount (INR ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="e.g. 450000"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Execution / Completion Days
                </label>
                <input
                  type="number"
                  value={completionDays}
                  onChange={(e) => setCompletionDays(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technical Proposal & Commercial Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide scope assumptions, machinery deployment, or commercial terms..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quotation Document / Drive Link (Optional)
                </label>
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or document URL"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] text-slate-900 bg-slate-50/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseBidModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {submittingBid ? "Submitting Bid..." : "Confirm & Submit Bid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TendersPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading tenders...</div>}>
      <TendersPortalContent />
    </Suspense>
  );
}
