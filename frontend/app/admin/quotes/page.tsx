"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Send,
  Building2,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { getAdminCache, setAdminCache } from "@/lib/adminCache";

interface Quote {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  location: string;
  description: string;
  timeline: string;
  status: string;
  createdAt: string;
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Quote | null>(null);

  const fetchQuotes = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quote");
      const json = await res.json();
      if (json.success) {
        setQuotes(json.data);
        setAdminCache("admin:quotes_list", json.data);
      } else {
        setError(json.error || "Failed to load quotes");
      }
    } catch {
      setError("Network error connecting to quote service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = getAdminCache<Quote[]>("admin:quotes_list");
    if (cached) {
      setQuotes(cached);
      setLoading(false);
    }
    fetchQuotes(!cached);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/quote", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchQuotes(false);
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, status } : null));
      }
    } catch {
      /* silent */
    }
  };

  const filteredQuotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return quotes.filter((q) => {
      const matchesFilter = filter === "all" ? true : q.status?.toLowerCase() === filter.toLowerCase();
      if (!matchesFilter) return false;
      if (!query) return true;
      return (
        q.name?.toLowerCase().includes(query) ||
        q.email?.toLowerCase().includes(query) ||
        q.phone?.toLowerCase().includes(query) ||
        q.projectType?.toLowerCase().includes(query) ||
        q.location?.toLowerCase().includes(query) ||
        q.budget?.toLowerCase().includes(query)
      );
    });
  }, [quotes, filter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: quotes.length,
      pending: quotes.filter((q) => q.status === "pending").length,
      reviewed: quotes.filter((q) => q.status === "reviewed").length,
      approved: quotes.filter((q) => q.status === "approved").length,
      rejected: quotes.filter((q) => q.status === "rejected").length,
    };
  }, [quotes]);

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* ── Top Header Glass Breadcrumb ───────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.03)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                href="/admin/hipro"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-all shadow-2xs group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to HiPRO Overview</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider border border-emerald-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Civil Quotes Pipeline
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Turnkey Quotation Inquiries
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
              Direct project estimation requests submitted by commercial, industrial, and residential clients.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => fetchQuotes(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : "text-slate-500"}`} />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
            <Link
              href="/admin/automail/compose?brand=hipro"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0F2C59] hover:bg-blue-900 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Quote Email</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Summary Bento Bar ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "All Requests", count: stats.total, filterKey: "all", color: "text-slate-900 bg-slate-50" },
          { label: "Pending", count: stats.pending, filterKey: "pending", color: "text-amber-700 bg-amber-50" },
          { label: "Reviewed", count: stats.reviewed, filterKey: "reviewed", color: "text-blue-700 bg-blue-50" },
          { label: "Approved", count: stats.approved, filterKey: "approved", color: "text-emerald-700 bg-emerald-50" },
          { label: "Rejected", count: stats.rejected, filterKey: "rejected", color: "text-rose-700 bg-rose-50" },
        ].map((s) => {
          const isActive = filter === s.filterKey;
          return (
            <button
              key={s.filterKey}
              onClick={() => setFilter(s.filterKey)}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                isActive
                  ? "bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-sm"
                  : "bg-white/80 hover:bg-white border-slate-200/70 shadow-2xs"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {s.label}
              </p>
              <p className="text-xl font-black text-slate-900 font-display mt-0.5">
                {s.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar: Search & Filter Tabs ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, phone, city..."
            className="w-full bg-white/90 border border-slate-200/80 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 overflow-x-auto w-full sm:w-auto">
          {["all", "pending", "reviewed", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                filter === s
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      {/* ── Content Grid: Quotes Table & Detail Drawer ────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quotes Table */}
        <div className="lg:col-span-2 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="px-5 py-3.5">Client & Contact</th>
                  <th className="px-4 py-3.5">Scope / Type</th>
                  <th className="px-4 py-3.5">Budget</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded-lg w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-400 text-xs">
                      No quotation requests found.
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => {
                    const isSelected = selected?.id === q.id;
                    const initial = (q.name || "C").charAt(0).toUpperCase();

                    return (
                      <tr
                        key={q.id}
                        onClick={() => setSelected(q)}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          isSelected ? "bg-blue-50/70" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-blue-200/60">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{q.name}</p>
                              <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                                {q.phone || q.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{q.projectType || "General Civil"}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {q.location || "Rajasthan"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-semibold text-slate-700">
                            {q.budget || "Custom"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={q.status} />
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div
                            className="inline-flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => updateStatus(q.id, "approved")}
                              title="Approve Quote"
                              className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors cursor-pointer border border-emerald-200"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateStatus(q.id, "rejected")}
                              title="Reject Quote"
                              className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition-colors cursor-pointer border border-rose-200"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Showing {filteredQuotes.length} quotes</span>
            <span>hindustanprojects.in funnel</span>
          </div>
        </div>

        {/* Selected Quote Detail Drawer */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 p-6 shadow-sm sticky top-24 h-fit">
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Quote Record
                  </span>
                  <StatusBadge status={selected.status} />
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{selected.name}</h3>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{selected.projectType}</p>
              </div>

              {/* Contact Pills */}
              <div className="space-y-2 text-xs">
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors border border-slate-200/70 truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{selected.email}</span>
                  </a>
                )}
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors border border-slate-200/70 truncate font-mono"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{selected.phone}</span>
                  </a>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Budget</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{selected.budget || "Custom"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Location</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{selected.location || "Rajasthan"}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/60">
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Timeline</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{selected.timeline || "Immediate / Flexible"}</p>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">
                    Project Requirements
                  </p>
                  <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                    {selected.description}
                  </div>
                </div>
              )}

              {/* AutoMail Dispatch Trigger */}
              <Link
                href={`/admin/automail/compose?brand=hipro&to=${encodeURIComponent(
                  selected.email || ""
                )}&subject=${encodeURIComponent(
                  `HiPRO Quotation Proposal — ${selected.projectType || "Civil Project"}`
                )}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Send className="w-3.5 h-3.5 text-blue-300" />
                <span>Send Quotation via AutoMail →</span>
              </Link>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => updateStatus(selected.id, "reviewed")}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                >
                  Review
                </button>
                <button
                  onClick={() => updateStatus(selected.id, "approved")}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-2xs cursor-pointer"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(selected.id, "rejected")}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-600">Select a quote to review</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                Inspect client specifications, budget, and dispatch official estimates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
