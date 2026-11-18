"use client";

import React from "react";
import Link from "next/link";
import {
  Inbox,
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/70 border border-slate-200/60 p-4 animate-pulse shadow-xs"
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
      href: "/admin/empanelment/applications",
      badge: "All KYC",
      badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
      iconColor: "text-slate-700 bg-slate-100 border-slate-200/60",
    },
    {
      label: "Pending Review",
      value: pendingKyc,
      sub: pendingKyc > 0 ? `${pendingKyc} need verification` : "All reviews cleared",
      icon: Clock,
      href: "/admin/empanelment/applications?status=PENDING",
      badge: pendingKyc > 0 ? "Action Required" : "Cleared",
      badgeColor: pendingKyc > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconColor: pendingKyc > 0 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Empanelled Partners",
      value: approvedPartners,
      sub: "Verified contractors",
      icon: CheckCircle2,
      href: "/admin/empanelment/directory",
      badge: "Approved",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Active Tenders",
      value: activeTendersCount,
      sub: `${s.totalBids || 0} commercial bids`,
      icon: Briefcase,
      href: "/admin/empanelment/tenders",
      badge: "Live RFQs",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      iconColor: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      label: "Today's Gate Passes",
      value: todayPasses,
      sub: "24-Hr site entries",
      icon: QrCode,
      href: "/admin/empanelment/gate-passes",
      badge: "Security",
      badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
      iconColor: "text-violet-700 bg-violet-50 border-violet-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Link
            key={i}
            href={c.href}
            scroll={false}
            className="group bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between select-none relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-900 transition-colors">
                {c.label}
              </span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${c.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
                  {c.value ?? 0}
                </span>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${c.badgeColor} shrink-0`}>
                  {c.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate font-medium">
                {c.sub}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
