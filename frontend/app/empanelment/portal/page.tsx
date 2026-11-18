"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  FileCheck2,
  QrCode,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useVendorPortal } from "./context";
import SmartCardPreviewModal from "@/components/admin/empanelment/SmartCardPreviewModal";

export default function VendorDashboardPage() {
  const { vendor, refreshVendor } = useVendorPortal();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [smartCardOpen, setSmartCardOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/vendor/portal/dashboard", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to load dashboard data");
        }
        const json = await res.json();
        if (json.success && json.data) {
          setDashboardData(json.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const app = dashboardData?.application || vendor?.application;
  const metrics = dashboardData?.metrics || {
    tendersCount: 0,
    bidsCount: 0,
    gatePassesCount: 0,
    activeGatePassesCount: 0,
  };
  const recentBids = dashboardData?.recentBids || [];
  const recentGatePasses = dashboardData?.recentGatePasses || [];
  const recentActivity = dashboardData?.recentActivity || [];

  const isApproved = app?.status === "APPROVED";
  const isDocsRequested = app?.status === "DOCS_REQUESTED";

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. WELCOME BANNER & STATUS */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#dc2626] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                {app?.trackingId || "VENDOR"}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                  isApproved
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : isDocsRequested
                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {app?.status || "ACTIVE"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {app?.companyName || "Vendor Dashboard"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Welcome to the official HiPRO procurement portal. Manage tender bids, site passes, and credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            {isApproved && (
              <button
                onClick={() => setSmartCardOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>PVC Smart Card</span>
              </button>
            )}

            <Link
              href="/empanelment/portal/gate-pass"
              className="px-4 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs shadow-red-600/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate Gate Pass</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KPI METRICS GRID */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Empanelment Status & Tier */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Capacity Tier
            </span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-950">
              {app?.tier?.replace("_", " ") || "CLASS C"}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {app?.category || "Registered Category"}
            </p>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Score: {app?.eligibilityScore || 85}/100</span>
          </div>
        </div>

        {/* Metric 2: Live Matched Tenders */}
        <Link
          href="/empanelment/portal/tenders"
          className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-red-300 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Matched Tenders
            </span>
            <FileCheck2 className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-950">
              {metrics.tendersCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Active for your trade</p>
          </div>
          <div className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
            <span>Browse Opportunities</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Metric 3: Submitted Bids */}
        <Link
          href="/empanelment/portal/tenders?tab=bids"
          className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-red-300 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Submitted Bids
            </span>
            <TrendingUp className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-950">
              {metrics.bidsCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Formal proposals</p>
          </div>
          <div className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
            <span>View Submissions</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Metric 4: Active Gate Passes */}
        <Link
          href="/empanelment/portal/gate-pass"
          className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-red-300 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Passes
            </span>
            <QrCode className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-950">
              {metrics.activeGatePassesCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">24-hr site entries</p>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <span>Pass Management</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 3. DUAL COLUMN: SMART CARD & QUICK ACTIONS + RECENT ACTIVITY */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Quick Actions & Recent Bids */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Tiles */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Vendor Portal Workflows
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/empanelment/portal/tenders"
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#dc2626] transition-colors">
                    Bid on Tenders
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Review published packages and submit quotes.
                  </p>
                </div>
              </Link>

              <Link
                href="/empanelment/portal/gate-pass"
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#dc2626] transition-colors">
                    Site Gate Pass
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Generate instant 24-hr worker entry authorization.
                  </p>
                </div>
              </Link>

              <Link
                href="/empanelment/portal/documents"
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#dc2626] transition-colors">
                    Document Vault
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Manage KYC, GSTIN, and compliance proofs.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Submitted Bids Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-sm text-slate-950 tracking-tight">
                  Recent Tender Bids
                </h2>
                <p className="text-xs text-slate-500">Your latest competitive quotes</p>
              </div>
              <Link
                href="/empanelment/portal/tenders?tab=bids"
                className="text-xs font-bold text-[#dc2626] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBids.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No tender bids submitted yet. Check{" "}
                <Link href="/empanelment/portal/tenders" className="text-[#dc2626] font-bold underline">
                  Live Tenders
                </Link>{" "}
                to participate.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentBids.map((bid: any) => (
                  <div
                    key={bid.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">
                        {bid.tender?.title || "Tender Bid"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Ref: {bid.tender?.tenderNo || bid.tenderId} • Submitted:{" "}
                        {new Date(bid.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-slate-900">
                        {typeof bid.amount === "number" ? `₹${bid.amount.toLocaleString("en-IN")}` : bid.amount}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                        {bid.status || "SUBMITTED"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: PVC Smart Card & Activity Stream */}
        <div className="space-y-6">
          {/* Official PVC Smart Card Card */}
          {isApproved ? (
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                  <span className="font-mono text-xs font-bold text-amber-300">
                    PVC SMART CARD
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                  VALIDATED
                </span>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono">Empanelled Partner</p>
                <h3 className="font-black text-sm text-white mt-0.5">{app?.companyName}</h3>
                <p className="text-xs text-amber-400 font-bold mt-1">
                  {app?.tier?.replace("_", " ")} • {app?.category}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>ID: {app?.trackingId}</span>
                <span>STATE: {app?.state || "Rajasthan"}</span>
              </div>

              <button
                onClick={() => setSmartCardOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View & Print PVC Card</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <Clock className="w-4 h-4" />
                <h3 className="font-bold text-xs">Empanelment in Review</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your application dossier is being reviewed by the HiPRO Engineering Procurement Committee. Once approved, your official PVC Smart Card credentials will unlock here.
              </p>
            </div>
          )}

          {/* Activity Log Feed */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-sm text-slate-950 tracking-tight">Recent Activity</h2>
              <Link
                href="/empanelment/portal/activity"
                className="text-xs font-bold text-[#dc2626] hover:underline"
              >
                All &rarr;
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400">No activity logged yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">{log.action.replace(/_/g, " ")}</p>
                      {log.details && (
                        <p className="text-[10px] text-slate-500 line-clamp-1">{log.details}</p>
                      )}
                      <p className="text-[9px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleDateString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PVC Smart Card Modal */}
      {app && (
        <SmartCardPreviewModal
          isOpen={smartCardOpen}
          onClose={() => setSmartCardOpen(false)}
          vendor={{
            companyName: app.companyName,
            contactName: app.contactName,
            trackingId: app.trackingId,
            tier: app.tier,
            category: app.category || "General",
            phone: app.phone,
            city: app.city,
            approvedAt: app.approvedAt || app.createdAt,
          }}
        />
      )}
    </div>
  );
}
