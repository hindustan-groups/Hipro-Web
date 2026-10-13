"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  X,
  Bell,
  Phone,
  Mail,
} from "lucide-react";
import {
  EmpanelmentContent,
  DEFAULT_EMPANELMENT_CONTENT,
} from "@/lib/empanelmentContent";

export default function PublicTendersRadarPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Bidding Modal State
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [trackingId, setTrackingId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [proposedDays, setProposedDays] = useState("");
  const [remarks, setRemarks] = useState("");
  const [biddingSubmitting, setBiddingSubmitting] = useState(false);
  const [bidSuccess, setBidSuccess] = useState("");
  const [bidError, setBidError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [tendersRes, contentRes] = await Promise.all([
        fetch("/api/empanelment/tenders", { cache: "no-store" }),
        fetch("/api/empanelment/content", { cache: "no-store" }),
      ]);

      const tendersJson = await tendersRes.json();
      if (tendersRes.ok && tendersJson.success) {
        setTenders(tendersJson.tenders || []);
      }

      if (contentRes.ok) {
        const contentJson = await contentRes.json();
        if (contentJson.success && contentJson.content) {
          setContent({ ...DEFAULT_EMPANELMENT_CONTENT, ...contentJson.content });
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load active tenders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenBid = (tender: any) => {
    setSelectedTender(tender);
    setBidSuccess("");
    setBidError("");
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender) return;

    setBiddingSubmitting(true);
    setBidError("");
    setBidSuccess("");

    try {
      const res = await fetch(`/api/empanelment/tenders/${selectedTender.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingId.trim(),
          bidAmount: parseFloat(bidAmount),
          proposedDays: proposedDays ? parseInt(proposedDays, 10) : undefined,
          remarks,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit commercial bid");
      }

      setBidSuccess("Your quotation has been submitted successfully for procurement review.");
      setTimeout(() => {
        setSelectedTender(null);
        setBidAmount("");
        setProposedDays("");
        setRemarks("");
      }, 2000);
    } catch (err: any) {
      setBidError(err.message || "Failed to submit bid");
    } finally {
      setBiddingSubmitting(false);
    }
  };

  const filteredTenders = tenders.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) ||
      t.tenderNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8 text-xs">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
          LIVE PROCUREMENT OPPORTUNITIES
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">
          Active Construction Tenders Radar (चालू टेंडर)
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Only verified empanelled partners can submit commercial quotations & timelines.
        </p>
      </div>

      {/* Live Procurement Notice Bulletin Banner */}
      {content.tendersNoticeText && (
        <div className="max-w-4xl mx-auto bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-2xs">
          <div className="px-2.5 py-1 bg-amber-500 text-white font-mono text-[11px] font-bold uppercase rounded-lg shrink-0 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" />
            <span>{content.tendersNoticeBadge || "NOTICE"}</span>
          </div>
          <div className="space-y-0.5 flex-1">
            <h4 className="font-bold text-xs text-slate-900">
              {content.tendersNoticeTitle || "Procurement Directorate Bulletin"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {content.tendersNoticeText}
            </p>
          </div>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by tender package, category, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-2xs"
        />
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 max-w-xl mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tenders Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading procurement opportunities...</div>
      ) : filteredTenders.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-2 max-w-md mx-auto">
          <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
          <p className="font-bold text-slate-800">No open tenders matching your criteria</p>
          <p className="text-[11px] text-slate-400">New procurement packages are posted weekly by our Jaipur project teams.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTenders.map((tender) => (
            <div
              key={tender.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200">
                    {tender.tenderNo || tender.tenderNumber}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    OPEN FOR BIDS
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">
                  {tender.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Category: <span className="text-slate-800">{tender.category}</span>
                </p>

                {tender.scopeOfWork && (
                  <p className="text-[11px] text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {tender.scopeOfWork}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Site Location:</span>
                    <span className="font-semibold text-slate-800">{tender.location || "Jaipur, RJ"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Est. Package Value:</span>
                    <span className="font-bold text-slate-900 font-mono">{tender.estimatedBudget || "Competitive"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Submission Deadline:</span>
                    <span className="font-bold text-amber-700 font-mono">
                      {tender.dueDate || tender.deadline
                        ? new Date(tender.dueDate || tender.deadline).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Open Package"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenBid(tender)}
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Submit Quotation / कोटेशन दें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bidding Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedTender(null)} />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-violet-700">
                  {selectedTender.tenderNumber}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                  {selectedTender.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTender(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bidError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bidError}</span>
              </div>
            )}

            {bidSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{bidSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitBid} className="space-y-3">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Only approved empanelled partners can bid. Need ID? <Link href="/empanelment/apply" className="text-violet-600 underline">Register here</Link>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Quoted Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="e.g. 4200000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Timeline (in Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={proposedDays}
                    onChange={(e) => setProposedDays(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Technical Remarks / BOQ Inclusions
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Mention equipment deployed, warranty, GST rate included..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTender(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={biddingSubmitting}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-md shadow-violet-600/20 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{biddingSubmitting ? "Submitting..." : "Submit Bid"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Procurement Helpline Support Box */}
      <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Need Assistance with Bidding or Tender Submissions?</h3>
        <p className="text-xs text-slate-500">
          Reach out directly to the Hindustan Projects Central Procurement Desk for BOQ clarifications and EMD deposit references.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700 pt-1">
          {content.tendersHelplinePhone && (
            <a
              href={`tel:${content.tendersHelplinePhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{content.tendersHelplinePhone}</span>
            </a>
          )}
          {content.tendersHelplineEmail && (
            <a
              href={`mailto:${content.tendersHelplineEmail}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>{content.tendersHelplineEmail}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
