"use client";

import React, { useEffect, useState } from "react";
import {
  Inbox,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Users,
  Award,
} from "lucide-react";
import ApplicationReviewDrawer, {
  VendorApplicationDetail,
} from "@/components/admin/empanelment/ApplicationReviewDrawer";
import SmartCardPreviewModal from "@/components/admin/empanelment/SmartCardPreviewModal";

export default function ApplicationsPipelinePage() {
  const [applications, setApplications] = useState<VendorApplicationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    { label: "Submitted", value: "SUBMITTED" },
    { label: "Under Review", value: "UNDER_REVIEW" },
    { label: "Docs Requested", value: "DOCS_REQUESTED" },
    { label: "Approved Partners", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Applications Pipeline & KYC Verification
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review GST, PAN, banking proofs, assign capacity tiers, and release partner credentials
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="self-start md:self-auto p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, person, GSTIN, PAN, phone, or tracking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchApplications()}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Tiers</option>
            <option value="TIER_A">Tier A (&gt; ₹2 Cr)</option>
            <option value="TIER_B">Tier B (₹50L – ₹2 Cr)</option>
            <option value="TIER_C">Tier C (₹10L – ₹50L)</option>
            <option value="TIER_D">Tier D (&lt; ₹10L)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
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
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-600" />
            Loading applications pipeline...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Inbox className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No applications matching your filters</p>
            <p className="text-[11px] text-slate-400">Try adjusting the status or clear search filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Company & Contact</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Capacity Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => handleOpenReview(app)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                        {app.companyName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                        {app.contactName} • {app.phone}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-600 line-clamp-1">
                        {app.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span>{app.trackingId}</span>
                        <button
                          onClick={(e) => handleCopy(app.trackingId, e)}
                          title="Copy Tracking ID"
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {copiedId === app.trackingId ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600 text-[11px]">
                      {app.city || "—"}, {app.state || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {app.tier.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : app.status === "REJECTED"
                            ? "bg-red-50 text-red-700 border border-red-200/60"
                            : app.status === "DOCS_REQUESTED"
                            ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                            : "bg-amber-50 text-amber-800 border border-amber-200/60"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        {app.status === "APPROVED" && (
                          <button
                            onClick={(e) => handleOpenSmartCard(app, e)}
                            title="Preview PVC Smart Card"
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200/70"
                          >
                            PVC Card
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenReview(app)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold transition-colors text-[11px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
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
