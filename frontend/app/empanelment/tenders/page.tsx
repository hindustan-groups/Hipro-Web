"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Search,
  AlertCircle,
  ArrowRight,
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

  // Package Details Modal State
  const [selectedTender, setSelectedTender] = useState<any | null>(null);

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
          Published tender packages and technical specifications available for contractor review.
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

      {/* Security Containment Banner */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-start sm:items-center gap-3 shadow-2xs max-w-4xl mx-auto">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Portal Security Upgrade Notice: </span>
          <span>
            Self-service electronic tender bidding is temporarily suspended while contractor authentication and verification systems are being upgraded. Tender packages and BOQ specifications remain published for informational review.
          </span>
        </div>
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
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    ACTIVE PACKAGE
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
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs text-xs"
              >
                <span>View Package & Bidding Notice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Package Details & Containment Notice Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedTender(null)} />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-violet-700">
                  {selectedTender.tenderNumber || selectedTender.tenderNo}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                  {selectedTender.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTender(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Package Details */}
            <div className="space-y-3 text-left">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Trade Category:</span>
                  <span className="font-bold text-slate-800">{selectedTender.category || "General"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-800">{selectedTender.location || "Jaipur, Rajasthan"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Estimated Value:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTender.estimatedBudget || "Competitive"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Due Date:</span>
                  <span className="font-mono font-bold text-amber-700">
                    {selectedTender.dueDate || selectedTender.deadline
                      ? new Date(selectedTender.dueDate || selectedTender.deadline).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Open Package"}
                  </span>
                </div>
              </div>

              {selectedTender.scopeOfWork && (
                <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                  <p className="font-bold text-slate-700 mb-0.5">Scope of Work:</p>
                  <p>{selectedTender.scopeOfWork}</p>
                </div>
              )}

              {/* Professional Suspension Notice */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Online Bidding Temporarily Suspended</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Electronic tender bidding is temporarily suspended while portal authentication and security upgrades are being implemented. Published tender packages and technical specifications remain available for informational review.
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  For technical queries or procurement clarifications regarding published tender requirements, please contact the Central Procurement Desk.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTender(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-colors text-xs text-center"
                >
                  Close Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Procurement Helpline Support Box */}
      <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Procurement Information & Clarifications</h3>
        <p className="text-xs text-slate-500">
          Reach out directly to the Hindustan Projects Central Procurement Desk for technical queries and clarifications regarding published tender packages.
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
