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
      href: "/admin/empanelment/applications",
      badge: "All Categories",
      badgeColor: "bg-slate-100/80 text-slate-600 border-slate-200/60",
      iconColor: "text-amber-700 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Pending KYC Review",
      value: pendingKyc,
      sub: pendingKyc > 0 ? `${pendingKyc} requires approval` : "All reviews up to date",
      icon: Clock,
      href: "/admin/empanelment/applications?status=PENDING",
      badge: pendingKyc > 0 ? "Action Required" : "Cleared",
      badgeColor: pendingKyc > 0 ? "bg-amber-500/10 text-amber-800 border-amber-500/20" : "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
      iconColor: pendingKyc > 0 ? "text-amber-800 bg-amber-500/15 border-amber-500/30" : "text-amber-700 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Empanelled Partners",
      value: approvedPartners,
      sub: "Verified vendors & firms",
      icon: CheckCircle2,
      href: "/admin/empanelment/directory",
      badge: "Verified",
      badgeColor: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
      iconColor: "text-amber-700 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Active Tenders",
      value: activeTendersCount,
      sub: `${s.totalBids || 0} commercial bids received`,
      icon: Briefcase,
      href: "/admin/empanelment/tenders",
      badge: "Live Packages",
      badgeColor: "bg-slate-100/80 text-slate-600 border-slate-200/60",
      iconColor: "text-amber-700 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Today's Gate Passes",
      value: todayPasses,
      sub: "Site entries logged today",
      icon: QrCode,
      href: "/admin/empanelment/gate-passes",
      badge: "Site Security",
      badgeColor: "bg-slate-100/80 text-slate-600 border-slate-200/60",
      iconColor: "text-amber-700 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <a
            key={i}
            href={c.href}
            className="group bg-white/75 backdrop-blur-xl rounded-2xl border border-slate-200/70 p-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-slate-300/80 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between select-none relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide leading-tight group-hover:text-slate-900 transition-colors">
                {c.label}
              </span>
              <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${c.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="flex items-baseline justify-between gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                  {c.value ?? 0}
                </span>
                <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${c.badgeColor} shrink-0`}>
                  {c.badge}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 mt-1 truncate">
                {c.sub}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
