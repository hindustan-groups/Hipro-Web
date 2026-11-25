"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Briefcase,
  Plus,
  RefreshCw,
  ChevronRight,
  Eye,
  Award,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Layers,
  QrCode,
  FileText,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  LayoutTemplate,
  Mail,
} from "lucide-react";
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";
import EmpanelmentKpiCards from "@/components/admin/empanelment/EmpanelmentKpiCards";
import ApplicationReviewDrawer, {
  VendorApplicationDetail,
} from "@/components/admin/empanelment/ApplicationReviewDrawer";
import TenderCreateModal from "@/components/admin/empanelment/TenderCreateModal";
import { getAdminCache, setAdminCache } from "@/lib/adminCache";

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

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
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
          if (!ct.includes("application/json")) return null;
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

      if (statsJson?.success) {
        setAdminCache("admin:empanelment_dashboard", {
          stats: statsJson.stats,
          recentApplications: appsJson?.applications || [],
          activeTenders: tendersJson?.tenders || [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load empanelment metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = getAdminCache<{ stats: any; recentApplications: any[]; activeTenders: any[] }>(
      "admin:empanelment_dashboard"
    );
    if (cached) {
      setStats(cached.stats);
      setRecentApplications(cached.recentApplications);
      setActiveTenders(cached.activeTenders);
      setLoading(false);
    }
    fetchDashboardData(!cached);
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

  // Pending review applications (highest priority for the admin)
  const pendingApps = recentApplications.filter((a) =>
    ["SUBMITTED", "UNDER_VERIFICATION", "TECHNICAL_AUDIT", "FINANCIAL_REVIEW", "DOCS_REQUESTED"].includes(a.status)
  );

  return (
    <div className="space-y-6">
      {/* Clean Apple Page Header */}
      <EmpanelmentAdminPageHeader
        title="Vendor Empanelment Overview"
        description="Unified operations center for contractor onboarding, KYC compliance verification, active tenders, and daily site gate passes."
        badge="Live Operations"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDashboardData()}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 transition-all shadow-xs disabled:opacity-50"
              title="Refresh All Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
            </button>

            <button
              onClick={() => setIsTenderModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Post Tender</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-rose-800 text-xs flex items-center gap-2.5 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Bento KPI Metric Cards */}
      <EmpanelmentKpiCards stats={stats} loading={loading} />

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 Cols): Pending KYC Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">
                    KYC Verification Queue
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Contractors awaiting statutory audit and empanelment approval
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20">
                {pendingApps.length} Pending
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                Checking contractor pipeline...
              </div>
            ) : pendingApps.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-800 text-sm">All KYC reviews up to date</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No pending vendor dossiers requiring verification. New registrations will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingApps.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/50 -mx-2 px-2 rounded-2xl transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {app.companyName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {app.companyName}
                          </h4>
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {app.trackingId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {app.contactName} • {app.category || "General Trade"} • {app.city || "Rajasthan"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenReview(app)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shrink-0 flex items-center gap-1 shadow-xs transition-all active:scale-[0.98]"
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>Review</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Showing top urgent items
              </span>
              <Link
                href="/admin/empanelment/applications"
                scroll={false}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 group"
              >
                <span>Open Full Applications Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Active Tenders & Quick Modules */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Tenders Card */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Active Site Tenders
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Commercial packages accepting contractor bids
                  </p>
                </div>
              </div>

              <Link
                href="/admin/empanelment/tenders"
                scroll={false}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                View Radar →
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Loading live tenders...
              </div>
            ) : activeTenders.length === 0 ? (
              <div className="py-8 text-center space-y-1 text-slate-400 text-xs">
                <p className="font-semibold text-slate-700">No active tender notices right now</p>
                <p className="text-[11px]">Click &quot;Post Tender&quot; to publish a procurement package.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTenders.slice(0, 3).map((tender) => (
                  <Link
                    key={tender.id}
                    href="/admin/empanelment/tenders"
                    scroll={false}
                    className="block p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition-all space-y-1.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-[9px] font-bold text-amber-900 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-200/60">
                          {tender.tenderNumber}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs mt-1 truncate group-hover:text-amber-800 transition-colors">
                          {tender.title}
                        </h4>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-2xs shrink-0">
                        {tender.bidsCount || 0} quotes
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{tender.category}</span>
                      <span className="font-semibold text-slate-800">{tender.estimatedBudget || "—"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Operational Shortcuts */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Empanelment Modules
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/admin/empanelment/directory"
                scroll={false}
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-2xs border border-slate-200/70 group-hover:text-amber-700">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">Partner Directory</p>
                  <p className="text-[10px] text-slate-400">Class A/B/C cards</p>
                </div>
              </Link>

              <Link
                href="/admin/empanelment/gate-passes"
                scroll={false}
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-2xs border border-slate-200/70 group-hover:text-amber-700">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">Gate Passes</p>
                  <p className="text-[10px] text-slate-400">24-Hr site registry</p>
                </div>
              </Link>

              <Link
                href="/admin/empanelment/categories"
                scroll={false}
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-2xs border border-slate-200/70 group-hover:text-amber-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">Trade Categories</p>
                  <p className="text-[10px] text-slate-400">Master trade studio</p>
                </div>
              </Link>

              <Link
                href="/admin/empanelment/work-orders"
                scroll={false}
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-2xs border border-slate-200/70 group-hover:text-amber-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">Work Orders</p>
                  <p className="text-[10px] text-slate-400">Billing &amp; RTGS</p>
                </div>
              </Link>

              <Link
                href="/admin/empanelment/content"
                scroll={false}
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-2xs border border-slate-200/70 group-hover:text-amber-700">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">Portal CMS</p>
                  <p className="text-[10px] text-slate-400">Landing &amp; Content</p>
                </div>
              </Link>

              <Link
                href="/admin/empanelment/tickets"
                scroll={false}
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-2xs border border-slate-200/70 group-hover:text-amber-700">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">Support Desk</p>
                  <p className="text-[10px] text-slate-400">Grievances &amp; Q&amp;A</p>
                </div>
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
