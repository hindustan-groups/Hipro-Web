"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  Inbox,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
} from "lucide-react";
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";
import ApplicationReviewDrawer, {
  VendorApplicationDetail,
} from "@/components/admin/empanelment/ApplicationReviewDrawer";
import SmartCardPreviewModal from "@/components/admin/empanelment/SmartCardPreviewModal";

export default function ApplicationsPipelinePage() {
  const [applications, setApplications] = useState<VendorApplicationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const qStatus = searchParams?.get("status") || "ALL";

  // Filters
  const [statusFilter, setStatusFilter] = useState(qStatus);
  const [tierFilter, setTierFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (qStatus && qStatus !== statusFilter) {
      setStatusFilter(qStatus);
    }
  }, [qStatus]);

  // Modals & Drawers
  const [selectedApplication, setSelectedApplication] = useState<VendorApplicationDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [smartCardVendor, setSmartCardVendor] = useState<any>(null);
  const [isSmartCardOpen, setIsSmartCardOpen] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (tierFilter !== "ALL") params.append("tier", tierFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/empanelment/admin/applications?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401 || (res.redirected && res.url.includes("admin-login"))) {
        window.location.href = "/admin-login";
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Unable to load applications (Session expired or server error)");
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch applications");
      }

      setApplications(json.applications || []);
    } catch (err: any) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, tierFilter, categoryFilter]);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenReview = (app: VendorApplicationDetail) => {
    setSelectedApplication(app);
    setIsDrawerOpen(true);
  };

  const handleOpenSmartCard = (app: VendorApplicationDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    setSmartCardVendor(app);
    setIsSmartCardOpen(true);
  };

  const handleStatusUpdated = (updated: VendorApplicationDetail) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
    );
  };

  const statusTabs = [
    { label: "All Pipeline", value: "ALL" },
    { label: "OTP Leads (Draft)", value: "DRAFT" },
    { label: "Pending Review", value: "PENDING" },
    { label: "Submitted", value: "SUBMITTED" },
    { label: "Under Review", value: "UNDER_REVIEW" },
    { label: "Docs Pending", value: "DOCS_REQUESTED" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "VN";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="space-y-5">
      {/* Apple-Style Page Header */}
      <EmpanelmentAdminPageHeader
        breadcrumbs={[{ label: "Applications Pipeline" }]}
        title="Contractor KYC Pipeline"
        description="Verify business credentials, past work portfolios, assign CPWD capacity tiers, and dispatch portal onboarding."
        badge={`${applications.length} Records`}
      >
        <button
          onClick={fetchApplications}
          disabled={loading}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 transition-all shadow-xs disabled:opacity-50"
          title="Refresh Applications"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </EmpanelmentAdminPageHeader>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Controls Bento */}
      <div className="bg-white/75 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-3 shadow-xs space-y-2.5">
        {/* Status Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Select Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, owner, GSTIN, PAN, tracking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchApplications()}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-50 hover:bg-white rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Tiers (A, B, C, D)</option>
            <option value="CLASS_A">Class A (&gt; ₹2 Cr)</option>
            <option value="CLASS_B">Class B (₹50L – ₹2 Cr)</option>
            <option value="CLASS_C">Class C (₹10L – ₹50L)</option>
            <option value="CLASS_D">Class D (&lt; ₹10L)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 hover:bg-white rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Trade Categories</option>
            <option value="Civil Construction">Civil Construction</option>
            <option value="Electrical & MEP">Electrical & MEP</option>
            <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
            <option value="Fabrication & PEB">Fabrication & PEB</option>
            <option value="Flooring & Finishing">Flooring & Finishing</option>
            <option value="Material Supply">Material Supply</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_2px_16px_rgba(15,23,42,0.02)] overflow-hidden">
        {loading ? (
          <div className="p-14 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-600" />
            <p className="font-semibold text-slate-700">Loading applications pipeline...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-14 text-center text-xs text-slate-500 space-y-2">
            <Inbox className="w-9 h-9 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No applications matching your filters</p>
            <p className="text-[11px] text-slate-400">Try adjusting your search terms or clearing status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/40 border-b border-slate-200/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vendor & Enterprise</th>
                  <th className="px-3.5 py-3 font-semibold">Category</th>
                  <th className="px-3.5 py-3 font-semibold">Tracking ID</th>
                  <th className="px-3.5 py-3 font-semibold">Location</th>
                  <th className="px-3.5 py-3 font-semibold">Capacity Tier</th>
                  <th className="px-3.5 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                    onClick={() => handleOpenReview(app)}
                  >
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
                            {app.phoneVerified && (
                              <span className="text-[9.5px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                OTP ✓
                              </span>
                            )}
                            {app.gstin && (
                              <span className="text-[9.5px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                GSTIN ✓
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-3.5">
                      <span className="font-medium text-slate-700 block truncate">
                        {app.category || (
                          app.primaryRole ? (
                            <span className="text-amber-700 font-semibold">{app.primaryRole}</span>
                          ) : (
                            <span className="italic text-slate-400 font-normal text-[11px]">Unassigned</span>
                          )
                        )}
                      </span>
                    </td>

                    <td className="px-3.5 py-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10.5px]">
                          {app.trackingId}
                        </span>
                        <button
                          onClick={(e) => handleCopy(app.trackingId, e)}
                          title="Copy Tracking ID"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          {copiedId === app.trackingId ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-3.5 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                      {app.city || "—"}{app.state ? `, ${app.state}` : ""}
                    </td>

                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {app.tier.replace(/^TIER_/, "CLASS_").replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          app.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : app.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            app.status === "APPROVED"
                              ? "bg-emerald-500"
                              : app.status === "REJECTED"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        {app.status === "APPROVED" && (
                          <button
                            onClick={(e) => handleOpenSmartCard(app, e)}
                            title="Preview PVC Smart Card"
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] border border-amber-200/80 inline-flex items-center gap-1 transition-colors"
                          >
                            <CreditCard className="w-3 h-3 text-amber-600" />
                            <span>Card</span>
                          </button>
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

      {/* Slide-out Review Drawer */}
      <ApplicationReviewDrawer
        application={selectedApplication}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* PVC Smart Card Modal */}
      <SmartCardPreviewModal
        vendor={smartCardVendor}
        isOpen={isSmartCardOpen}
        onClose={() => setIsSmartCardOpen(false)}
      />
    </div>
  );
}
