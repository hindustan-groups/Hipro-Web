"use client";

import React from "react";
import {
  Inbox,
  Users,
  ShieldCheck,
  Briefcase,
  QrCode,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/60 backdrop-blur-xl border border-slate-200/60 p-4 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const s = stats || {
    total: 0,
    submitted: 0,
    underReview: 0,
    docsRequested: 0,
    approved: 0,
    rejected: 0,
    activeTenders: 0,
    totalBids: 0,
    todayGatePasses: 0,
  };

  const pendingKyc = (s.submitted || 0) + (s.underReview || 0) + (s.docsRequested || 0);

  const cards = [
    {
      label: "Total Applications",
      value: s.total,
      sub: "Registrations received",
      icon: Inbox,
      gradient: "from-blue-500/10 to-indigo-500/5",
      iconColor: "text-blue-600 bg-blue-50",
      borderColor: "border-blue-100/80",
    },
    {
      label: "Pending KYC Review",
      value: pendingKyc,
      sub: `${s.underReview || 0} in active review`,
      icon: Clock,
      gradient: "from-amber-500/10 to-orange-500/5",
      iconColor: "text-amber-600 bg-amber-50",
      borderColor: "border-amber-100/80",
      highlight: pendingKyc > 0,
    },
    {
      label: "Empanelled Partners",
      value: s.approved,
      sub: "Active approved vendors",
      icon: CheckCircle2,
      gradient: "from-emerald-500/10 to-teal-500/5",
      iconColor: "text-emerald-600 bg-emerald-50",
      borderColor: "border-emerald-100/80",
    },
    {
      label: "Active Tenders",
      value: s.activeTenders,
      sub: `${s.totalBids || 0} commercial bids`,
      icon: Briefcase,
      gradient: "from-violet-500/10 to-purple-500/5",
      iconColor: "text-violet-600 bg-violet-50",
      borderColor: "border-violet-100/80",
    },
    {
      label: "Today's Gate Passes",
      value: s.todayGatePasses,
      sub: "Site entries logged",
      icon: QrCode,
      gradient: "from-rose-500/10 to-pink-500/5",
      iconColor: "text-rose-600 bg-rose-50",
      borderColor: "border-rose-100/80",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border ${c.borderColor} p-4 shadow-2xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative z-10 flex items-start justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {c.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${c.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="relative z-10 mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-display">
                  {c.value}
                </span>
                {c.highlight && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">
                {c.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
