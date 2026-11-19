"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  Briefcase,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-3xl bg-white/70 border border-slate-200/60 p-5 animate-pulse shadow-xs"
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
      label: "Empanelled Partners",
      value: approvedPartners,
      detail: `${totalApps} total applicants registered`,
      icon: Users,
      href: "/admin/empanelment/directory",
      badge: "Approved",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      accent: "text-emerald-700",
    },
    {
      label: "Pending KYC Review",
      value: pendingKyc,
      detail: pendingKyc > 0 ? "Requires compliance verification" : "All dossiers up to date",
      icon: Clock,
      href: "/admin/empanelment/applications?status=PENDING",
      badge: pendingKyc > 0 ? "Action Needed" : "All Clear",
      badgeColor: pendingKyc > 0 ? "bg-amber-500/10 text-amber-900 border-amber-500/20" : "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      accent: pendingKyc > 0 ? "text-amber-800" : "text-emerald-700",
      isUrgent: pendingKyc > 0,
    },
    {
      label: "Active Site Tenders",
      value: activeTendersCount,
      detail: `${s.totalBids || 0} commercial quotes collected`,
      icon: Briefcase,
      href: "/admin/empanelment/tenders",
      badge: "Live RFQs",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200/80",
      accent: "text-blue-700",
    },
    {
      label: "Today's Gate Passes",
      value: todayPasses,
      detail: "24-Hr site entry authorizations",
      icon: QrCode,
      href: "/admin/empanelment/gate-passes",
      badge: "Site Security",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200/80",
      accent: "text-slate-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.label}
            href={c.href}
            scroll={false}
            className={`group relative bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
              c.isUrgent
                ? "border-amber-300/80 shadow-[0_8px_30px_rgba(245,158,11,0.06)] ring-1 ring-amber-400/20 hover:border-amber-400"
                : "border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-md hover:border-slate-200"
            }`}
          >
            {/* Top row: Label + Badge + Arrow */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">{c.label}</span>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${c.badgeColor}`}>
                  {c.badge}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>

            {/* Middle: Big Metric */}
            <div className="my-4">
              <div className="text-3xl font-black tracking-tight text-slate-900 font-sans">
                {c.value}
              </div>
            </div>

            {/* Bottom: Subtitle + Icon */}
            <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate pr-2 font-medium text-[11px]">{c.detail}</span>
              <Icon className={`w-4 h-4 shrink-0 ${c.accent}`} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
