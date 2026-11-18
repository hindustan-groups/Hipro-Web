"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Briefcase,
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  Eye,
  Award,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <Award className="w-3 h-3 text-amber-600" />
            Class A
          </span>
        );
      case "CLASS_B":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Class B
          </span>
        );
      case "CLASS_C":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            Class C
          </span>
        );
      case "CLASS_D":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
            Class D
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200">
            Unassigned
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case "DOCS_REQUESTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Docs Pending
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200">
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
    <div className="space-y-5">
      {/* Apple-Style Page Header */}
      <EmpanelmentAdminPageHeader
        title="Empanelment Overview"
        description="Real-time command center for contractor KYC approvals, active tenders, and daily site gate passes."
        badge="Live Operations"
      >
        <button
          onClick={() => fetchDashboardData()}
          disabled={loading}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 transition-all shadow-xs disabled:opacity-50"
          title="Refresh All Metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>

        <button
          onClick={() => setIsTenderModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Post New Tender</span>
        </button>
      </EmpanelmentAdminPageHeader>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Bento Row */}
      <EmpanelmentKpiCards stats={stats} loading={loading} />

      {/* Main Section: KYC Applications Verification Queue */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_2px_16px_rgba(15,23,42,0.02)] overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3.5 sm:px-5 sm:py-3.5 border-b border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700">
                <Inbox className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-900">
                Applications Queue
              </h2>
              <span className="text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                {recentApplications.length}
              </span>
            </div>

            {/* Apple Segmented Control Filter Tabs */}
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-200/50 rounded-full text-[11px] font-medium">
              <button
                onClick={() => setPipelineFilter("ALL")}
                className={`px-3 py-1 rounded-full transition-all ${
                  pipelineFilter === "ALL"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({recentApplications.length})
              </button>
              <button
                onClick={() => setPipelineFilter("PENDING")}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                  pipelineFilter === "PENDING"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
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
                className={`px-3 py-1 rounded-full transition-all ${
                  pipelineFilter === "APPROVED"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setPipelineFilter("REJECTED")}
                className={`px-3 py-1 rounded-full transition-all ${
                  pipelineFilter === "REJECTED"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search firm, phone, tracking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-full text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 w-48 sm:w-60 transition-all shadow-2xs"
              />
            </div>

            <Link
              href="/admin/empanelment/applications"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 shrink-0 px-2.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <span>Full Pipeline</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Table Content */}
        {filteredApplications.length === 0 ? (
          <div className="p-14 text-center text-xs text-slate-500 space-y-2">
            <Inbox className="w-9 h-9 text-slate-300 mx-auto" />
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
              <thead className="bg-slate-50/40 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vendor / Enterprise</th>
                  <th className="px-3.5 py-3 font-semibold">Category & Scope</th>
                  <th className="px-3.5 py-3 font-semibold">Capacity Tier</th>
                  <th className="px-3.5 py-3 font-semibold">Tracking ID</th>
                  <th className="px-3.5 py-3 font-semibold">Applied Date</th>
                  <th className="px-3.5 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                    onClick={() => handleOpenReview(app)}
                  >
                    {/* Enterprise & Owner */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {getInitials(app.companyName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-amber-800 transition-colors truncate text-xs">
                            {app.companyName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1.5 mt-0.5">
                            <span>{app.contactName}</span>
                            <span>•</span>
                            <span>{app.phone}</span>
                            {app.gstin && (
                              <span className="text-[9.5px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                GSTIN ✓
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3.5 py-3.5">
                      <span className="font-medium text-slate-800 block truncate">
                        {app.category}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                        {app.tradeName || "Contractor / Vendor"}
                      </span>
                    </td>

                    {/* Tier */}
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      {renderTierBadge(app.tier)}
                    </td>

                    {/* Tracking ID */}
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {app.trackingId}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td className="px-3.5 py-3.5 whitespace-nowrap text-slate-400 font-medium text-[11px]">
                      {app.createdAt && !isNaN(new Date(app.createdAt).getTime())
                        ? new Date(app.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent"}
                    </td>

                    {/* Status */}
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(app.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {app.email && (
                          <Link
                            href={`/admin/automail/compose?to=${encodeURIComponent(app.email)}&name=${encodeURIComponent(app.companyName)}&brand=empanelment&template=empanelment_kyc_approval`}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Send AutoMail Notice"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <button
                          onClick={() => handleOpenReview(app)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors text-[11px] inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Review</span>
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

      {/* Lower Section: Active Commercial Tenders (Bento Widget) */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-5 shadow-[0_2px_16px_rgba(15,23,42,0.02)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">
                Active Commercial Packages & Tenders
              </h3>
              <p className="text-[11px] text-slate-400">
                Work packages open for commercial bidding by empaneled vendors.
              </p>
            </div>
          </div>
          <Link
            href="/admin/empanelment/tenders"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Manage All Tenders</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {activeTenders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs space-y-2">
            <Briefcase className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No active tender notices right now.</p>
            <p className="text-[11px] text-slate-400">Post a new contractor work package to invite quotations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeTenders.slice(0, 6).map((tender) => (
              <div
                key={tender.id}
                className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/70 hover:border-slate-300 hover:bg-white transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.2 rounded-md">
                      {tender.tenderNo}
                    </span>
                    <p className="font-bold text-slate-900 text-xs mt-1 line-clamp-1">
                      {tender.title}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                    {tender.bidsCount || 0} Bids
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/50">
                  <span className="truncate max-w-[150px] font-medium text-slate-600">{tender.category}</span>
                  <span className="font-bold text-slate-900">{tender.estimatedBudget || "Competitive"}</span>
                </div>

                <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{tender.location}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono shrink-0">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Due {new Date(tender.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
