"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Briefcase,
  ShieldCheck,
  Users,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Award,
  Mail,
  MapPin,
  Calendar,
  Building2,
  QrCode,
  ArrowRight,
  FileText,
  Filter,
} from "lucide-react";
import EmpanelmentKpiCards from "@/components/admin/empanelment/EmpanelmentKpiCards";
import ApplicationReviewDrawer, {
  VendorApplicationDetail,
} from "@/components/admin/empanelment/ApplicationReviewDrawer";
import TenderCreateModal from "@/components/admin/empanelment/TenderCreateModal";

export default function EmpanelmentAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<VendorApplicationDetail[]>([]);
  const [activeTenders, setActiveTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [pipelineFilter, setPipelineFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals / Drawers
  const [selectedApplication, setSelectedApplication] = useState<VendorApplicationDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const fetchJson = async (url: string) => {
        try {
          const res = await fetch(url, { credentials: "include", cache: "no-store" });
          if (res.status === 401 || (res.redirected && res.url.includes("admin-login"))) {
            window.location.href = "/admin-login";
            return null;
          }
          const ct = res.headers.get("content-type") || "";
          if (!ct.includes("application/json")) {
            return null;
          }
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      };

      const [statsJson, appsJson, tendersJson] = await Promise.all([
        fetchJson("/api/empanelment/admin/stats"),
        fetchJson("/api/empanelment/admin/applications"),
        fetchJson("/api/empanelment/admin/tenders"),
      ]);

      if (statsJson?.success) setStats(statsJson.stats);
      if (appsJson?.success) setRecentApplications(appsJson.applications || []);
      if (tendersJson?.success) setActiveTenders(tendersJson.tenders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load empanelment metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenReview = (app: VendorApplicationDetail) => {
    setSelectedApplication(app);
    setIsDrawerOpen(true);
  };

  const handleStatusUpdated = (updated: VendorApplicationDetail) => {
    setRecentApplications((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
    );
    fetchDashboardData();
  };

  // Filtered applications
  const filteredApplications = recentApplications.filter((app) => {
    if (pipelineFilter === "PENDING") {
      const isPending = [
        "SUBMITTED",
        "UNDER_VERIFICATION",
        "TECHNICAL_AUDIT",
        "FINANCIAL_REVIEW",
        "DOCS_REQUESTED",
      ].includes(app.status);
      if (!isPending) return false;
    } else if (pipelineFilter === "APPROVED" && app.status !== "APPROVED") {
      return false;
    } else if (pipelineFilter === "REJECTED" && app.status !== "REJECTED") {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = app.companyName?.toLowerCase().includes(q);
      const matchOwner =
        app.contactName?.toLowerCase().includes(q) || app.tradeName?.toLowerCase().includes(q);
      const matchPhone = app.phone?.toLowerCase().includes(q);
      const matchTracking = app.trackingId?.toLowerCase().includes(q);
      const matchCat = app.category?.toLowerCase().includes(q);
      if (!matchName && !matchOwner && !matchPhone && !matchTracking && !matchCat) return false;
    }
    return true;
  });

  const getInitials = (name?: string) => {
    if (!name) return "VN";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const renderTierBadge = (tier?: string) => {
    switch (tier) {
      case "CLASS_A":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-900 border border-amber-300 shadow-2xs">
            <Award className="w-3 h-3 text-amber-700" />
            Class A
          </span>
        );
      case "CLASS_B":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-200/70">
            Class B
          </span>
        );
      case "CLASS_C":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80">
            Class C
          </span>
        );
      case "CLASS_D":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200/60">
            Class D
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400 bg-slate-50/60 border border-slate-200/60">
            Unassigned
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-800 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case "DOCS_REQUESTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Docs Pending
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {status.replace(/_/g, " ")}
          </span>
        );
    }
  };

  const pendingCount = recentApplications.filter((a) =>
    ["SUBMITTED", "UNDER_VERIFICATION", "TECHNICAL_AUDIT", "FINANCIAL_REVIEW", "DOCS_REQUESTED"].includes(a.status)
  ).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Sub-Header Operational Toolbar (macOS Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Operations Control Desk</span>
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[9.5px] font-mono font-semibold tracking-wider text-slate-600 bg-slate-100/90 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Live Operations
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time pipeline of incoming contractor KYC registrations, verified partners, and tenders.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchDashboardData()}
            className="p-1.5 rounded-full bg-white/80 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-all shadow-2xs"
            title="Refresh All Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsTenderModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Post New Tender</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row with Interactive Drilldowns */}
      <EmpanelmentKpiCards stats={stats} loading={loading} />

      {/* Main Section: KYC Applications Verification Queue (macOS Bento Card) */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-slate-200/70 shadow-[0_2px_16px_rgba(15,23,42,0.02)] overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3 sm:px-4 sm:py-3 border-b border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700">
                <Inbox className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Applications Queue
              </h3>
              <span className="text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded-full">
                {recentApplications.length}
              </span>
            </div>

            {/* Apple Segmented Control Filter Tabs */}
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-200/60 rounded-full text-[11px] font-medium">
              <button
                onClick={() => setPipelineFilter("ALL")}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  pipelineFilter === "ALL"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({recentApplications.length})
              </button>
              <button
                onClick={() => setPipelineFilter("PENDING")}
                className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                  pipelineFilter === "PENDING"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Pending Review</span>
                {pendingCount > 0 && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setPipelineFilter("APPROVED")}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  pipelineFilter === "APPROVED"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setPipelineFilter("REJECTED")}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  pipelineFilter === "REJECTED"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search firm, phone, tracking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1 bg-white/90 border border-slate-200/80 rounded-full text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 w-48 sm:w-56 transition-all"
              />
            </div>

            <Link
              href="/admin/empanelment/applications"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 shrink-0 px-2 py-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <span>Pipeline</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Table Content */}
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">
              {loading ? "Loading incoming applications..." : "No matching applications found."}
            </p>
            <p className="text-[11px] text-slate-400">
              Try adjusting your search query or switching filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200/60 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">Vendor / Enterprise</th>
                  <th className="px-3 py-2.5 font-semibold">Category & Scope</th>
                  <th className="px-3 py-2.5 font-semibold">Capacity Tier</th>
                  <th className="px-3 py-2.5 font-semibold">Tracking ID</th>
                  <th className="px-3 py-2.5 font-semibold">Applied Date</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3.5 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => handleOpenReview(app)}
                  >
                    {/* Enterprise & Owner */}
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {getInitials(app.companyName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                            {app.companyName}
                          </p>
                          <p className="text-[10.5px] text-slate-400 font-medium truncate flex items-center gap-1.5 mt-0.5">
                            <span>{app.contactName}</span>
                            <span>•</span>
                            <span>{app.phone}</span>
                            {app.gstin && (
                              <span className="text-[9.5px] font-mono font-semibold text-slate-600 bg-slate-100/90 px-1.5 py-0.2 rounded border border-slate-200/80">
                                GSTIN ✓
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3">
                      <span className="font-medium text-slate-800 block truncate">
                        {app.category}
                      </span>
                      <span className="text-[10.5px] text-slate-400 truncate block mt-0.5">
                        {app.tradeName || "Contractor / Vendor"}
                      </span>
                    </td>

                    {/* Tier */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      {renderTierBadge(app.tier)}
                    </td>

                    {/* Tracking ID */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                        {app.trackingId}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td className="px-3 py-3 whitespace-nowrap text-slate-400 font-medium text-[10.5px]">
                      {app.createdAt && !isNaN(new Date(app.createdAt).getTime())
                        ? new Date(app.createdAt).toLocaleDateString()
                        : "Recent"}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      {renderStatusBadge(app.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {app.email && (
                          <Link
                            href={`/admin/automail/compose?to=${encodeURIComponent(app.email)}&name=${encodeURIComponent(app.companyName)}&brand=empanelment&template=empanelment_kyc_approval`}
                            className="p-1.5 rounded-full text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Send AutoMail Notice"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <button
                          onClick={() => handleOpenReview(app)}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold transition-colors text-[10.5px] inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Review KYC</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lower Section: Active Tenders & Capacity Standards (macOS Bento Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Active Commercial Tenders */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/70 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs">
                  Active Commercial Tenders
                </h3>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded-full">
                  {activeTenders.length}
                </span>
              </div>
              <Link
                href="/admin/empanelment/tenders"
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                Manage All →
              </Link>
            </div>

            {activeTenders.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs space-y-1.5">
                <Briefcase className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">No active tender notices right now.</p>
                <p className="text-[10.5px] text-slate-400">Click below to post a new contractor work package.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeTenders.slice(0, 3).map((tender) => (
                  <div
                    key={tender.id}
                    className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-[9.5px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                          {tender.tenderNo}
                        </span>
                        <p className="font-semibold text-slate-900 text-xs mt-0.5 line-clamp-1">
                          {tender.title}
                        </p>
                      </div>
                      <span className="font-mono text-[9.5px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                        {tender.bidsCount || 0} Bids
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-1.5 border-t border-slate-200/50">
                      <span className="truncate max-w-[150px] font-medium text-slate-600">{tender.category}</span>
                      <span className="font-bold text-slate-900">{tender.estimatedBudget || "TBD"}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]">{tender.location}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Due {new Date(tender.dueDate).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsTenderModalOpen(true)}
              className="w-full py-2 rounded-xl border border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/40 hover:bg-amber-50/30 text-slate-600 hover:text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Tender Notice</span>
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Standards & Quick Navigation */}
        <div className="lg:col-span-5 space-y-4">
          {/* Capacity Tier Classification Standards */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/70 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs">
                  Capacity Standards
                </h3>
              </div>
              <span className="text-[9.5px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
                CPWD / HiPRO
              </span>
            </div>

            <p className="text-slate-500 text-[10.5px] leading-relaxed">
              Assigned during KYC evaluation based on past turnover and track record:
            </p>

            <div className="space-y-1 pt-0.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-200/70">
                <span className="font-bold text-amber-900 text-[10.5px]">CLASS A</span>
                <span className="text-slate-700 font-medium text-[10.5px]">Turnkey &gt; ₹2 Crore</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-200/50">
                <span className="font-bold text-amber-800 text-[10.5px]">CLASS B</span>
                <span className="text-slate-700 font-medium text-[10.5px]">Core Civil ₹50L – ₹2 Cr</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 border border-slate-200/80">
                <span className="font-bold text-slate-800 text-[10.5px]">CLASS C</span>
                <span className="text-slate-600 font-medium text-[10.5px]">Specialized ₹10L – ₹50L</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <span className="font-bold text-slate-600 text-[10.5px]">CLASS D</span>
                <span className="text-slate-500 font-medium text-[10.5px]">Local Supplies &lt; ₹10L</span>
              </div>
            </div>
          </div>

          {/* Quick Hub Modules Navigation */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/70 p-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Procurement Directorate Modules
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/admin/empanelment/gate-passes"
                className="p-2 rounded-xl bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/60 hover:border-slate-300 transition-all group"
              >
                <div className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <QrCode className="w-3 h-3" />
                </div>
                <p className="font-bold text-slate-900 text-xs">Site Passes</p>
                <p className="text-[9.5px] text-slate-400">24-Hr gate security</p>
              </Link>

              <Link
                href="/admin/empanelment/work-orders"
                className="p-2 rounded-xl bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/60 hover:border-slate-300 transition-all group"
              >
                <div className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <FileText className="w-3 h-3" />
                </div>
                <p className="font-bold text-slate-900 text-xs">Work Orders</p>
                <p className="text-[9.5px] text-slate-400">Milestone billing</p>
              </Link>

              <Link
                href="/admin/empanelment/directory"
                className="p-2 rounded-xl bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/60 hover:border-slate-300 transition-all group"
              >
                <div className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Users className="w-3 h-3" />
                </div>
                <p className="font-bold text-slate-900 text-xs">Directory</p>
                <p className="text-[9.5px] text-slate-400">Verified Rolodex</p>
              </Link>

              <Link
                href="/admin/automail?brand=empanelment"
                className="p-2 rounded-xl bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/60 hover:border-slate-300 transition-all group"
              >
                <div className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Mail className="w-3 h-3" />
                </div>
                <p className="font-bold text-slate-900 text-xs">AutoMail Hub</p>
                <p className="text-[9.5px] text-slate-400">Broadcast notices</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Review Drawer */}
      <ApplicationReviewDrawer
        application={selectedApplication}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Tender Modal */}
      <TenderCreateModal
        isOpen={isTenderModalOpen}
        onClose={() => setIsTenderModalOpen(false)}
        onCreated={() => fetchDashboardData()}
      />
    </div>
  );
}
