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
  Layers,
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

  // Modals / Drawers
  const [selectedApplication, setSelectedApplication] = useState<VendorApplicationDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, appsRes, tendersRes] = await Promise.all([
        fetch("/api/empanelment/admin/stats", { credentials: "include", cache: "no-store" }),
        fetch("/api/empanelment/admin/applications", { credentials: "include", cache: "no-store" }),
        fetch("/api/empanelment/admin/tenders", { credentials: "include", cache: "no-store" }),
      ]);

      const [statsJson, appsJson, tendersJson] = await Promise.all([
        statsRes.json().catch(() => ({})),
        appsRes.json().catch(() => ({})),
        tendersRes.json().catch(() => ({})),
      ]);

      if (statsJson.success) setStats(statsJson.stats);
      if (appsJson.success) setRecentApplications(appsJson.applications?.slice(0, 8) || []);
      if (tendersJson.success) setActiveTenders(tendersJson.tenders?.slice(0, 4) || []);
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

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Vendor Empanelment Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Centralized procurement KYC, contractor tiering, daily site gate passes, and L1 bidding radar
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData()}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors shadow-2xs"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsTenderModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tender</span>
          </button>

          <a
            href="https://empanelment.hindustanprojects.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/60 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Live Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <EmpanelmentKpiCards stats={stats} loading={loading} />

      {/* Split Grid: Recent Applications Pipeline + Active Procurement Tenders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Applications Pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent KYC Applications
              </h2>
            </div>
            <Link
              href="/admin/empanelment/applications"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
            >
              <span>View All Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {loading ? "Loading incoming applications..." : "No vendor applications received yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[10px] uppercase font-bold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Vendor / Enterprise</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Tracking ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentApplications.map((app) => (
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
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                          {app.trackingId}
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
                          <button
                            onClick={() => handleOpenReview(app)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold transition-colors text-[11px] inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Procurement Radar & Tier Rules */}
        <div className="space-y-6">
          {/* Active Tenders Box */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Active Tenders Radar
                </h2>
              </div>
              <Link
                href="/admin/empanelment/tenders"
                className="text-xs font-bold text-violet-700 hover:text-violet-800"
              >
                Manage
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-3">
              {activeTenders.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active tenders published right now.
                </div>
              ) : (
                activeTenders.map((tender) => (
                  <div
                    key={tender.id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:border-violet-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 text-xs line-clamp-1">
                        {tender.title}
                      </p>
                      <span className="font-mono text-[10px] font-bold text-violet-700 shrink-0">
                        {tender.bidsCount || 0} Bids
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{tender.category}</span>
                      <span className="font-semibold text-slate-700">{tender.estimatedBudget || "TBD"}</span>
                    </div>
                  </div>
                ))
              )}

              <button
                onClick={() => setIsTenderModalOpen(true)}
                className="w-full py-2 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:text-slate-900 hover:border-violet-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Work Package</span>
              </button>
            </div>
          </div>

          {/* Partner Tiering Blueprint */}
          <div className="bg-gradient-to-br from-slate-900 to-amber-950 text-white rounded-2xl p-5 shadow-lg space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-sm uppercase tracking-wider text-amber-300 font-display">
                Contractor Capacity Tiers
              </h3>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Assigned automatically during KYC evaluation based on turnover and machinery capabilities:
            </p>
            <div className="space-y-2 pt-1 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="font-bold text-amber-400">TIER A</span>
                <span className="text-slate-300">Turnkey &gt; ₹2 Crore</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="font-bold text-blue-400">TIER B</span>
                <span className="text-slate-300">Core Civil ₹50L – ₹2 Cr</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="font-bold text-emerald-400">TIER C</span>
                <span className="text-slate-300">Specialized ₹10L – ₹50L</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="font-bold text-slate-400">TIER D</span>
                <span className="text-slate-300">Local Supply &lt; ₹10L</span>
              </div>
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
