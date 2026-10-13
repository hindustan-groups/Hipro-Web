"use client";

import React from "react";
import {
  Inbox,
  ShieldCheck,
  Briefcase,
  QrCode,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface KpiData {
  total: number;
  submitted: number;
  underReview: number;
  docsRequested: number;
  approved: number;
  rejected: number;
  activeTenders: number;
  totalBids: number;
  todayGatePasses: number;
}

interface EmpanelmentKpiCardsProps {
  stats: KpiData | null;
  loading?: boolean;
}

export default function EmpanelmentKpiCards({ stats, loading }: EmpanelmentKpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-white border border-slate-200 p-4 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const s = (stats as any) || {};

  const totalApps = s.totalApplications ?? s.total ?? 0;
  const pendingKyc = s.pendingVerification ?? ((s.submitted || 0) + (s.underReview || 0) + (s.docsRequested || 0));
  const approvedPartners = s.approvedPartners ?? s.approved ?? 0;
  const activeTendersCount = s.activeTenders ?? 0;
  const todayPasses = s.totalPassesToday ?? s.todayGatePasses ?? 0;

  const cards = [
    {
      label: "Total Applications",
      value: totalApps,
      sub: "Registrations received",
      icon: Inbox,
      badge: "All Categories",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    },
    {
      label: "Pending KYC Review",
      value: pendingKyc,
      sub: pendingKyc > 0 ? `${pendingKyc} requires approval` : "All reviews up to date",
      icon: Clock,
      badge: pendingKyc > 0 ? "Action Required" : "Cleared",
      badgeColor: pendingKyc > 0 ? "bg-amber-50 text-amber-800 border-amber-300" : "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Empanelled Partners",
      value: approvedPartners,
      sub: "Verified vendors & firms",
      icon: CheckCircle2,
      badge: "Verified",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Active Tenders",
      value: activeTendersCount,
      sub: `${s.totalBids || 0} commercial bids received`,
      icon: Briefcase,
      badge: "Live Packages",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Today's Gate Passes",
      value: todayPasses,
      sub: "Site entries logged today",
      icon: QrCode,
      badge: "Site Security",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide leading-tight">
                {c.label}
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-600">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                  {c.value ?? 0}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.badgeColor} shrink-0`}>
                  {c.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {c.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
