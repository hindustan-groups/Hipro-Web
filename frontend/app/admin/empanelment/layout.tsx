"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  ExternalLink,
  QrCode,
  Sparkles,
  ChevronRight,
  Send,
  LayoutDashboard,
  Inbox,
  Users,
  Briefcase,
  Layers,
  FileText,
  MessageSquare,
} from "lucide-react";

export default function EmpanelmentAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navTabs = [
    { href: "/admin/empanelment", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/empanelment/applications", label: "Applications", icon: Inbox },
    { href: "/admin/empanelment/directory", label: "Partner Directory", icon: Users },
    { href: "/admin/empanelment/tenders", label: "Tenders & Bids", icon: Briefcase },
    { href: "/admin/empanelment/gate-passes", label: "Gate Passes", icon: QrCode },
    { href: "/admin/empanelment/categories", label: "Category Studio", icon: Layers },
    { href: "/admin/empanelment/work-orders", label: "Work Orders", icon: FileText },
    { href: "/admin/empanelment/tickets", label: "Support Tickets", icon: MessageSquare },
    { href: "/admin/empanelment/content", label: "Portal Studio", icon: Sparkles },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* macOS Translucent Command Header */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-slate-200/70 p-4 sm:px-5 sm:py-4 shadow-[0_2px_16px_rgba(15,23,42,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold text-slate-500">
            <span className="text-slate-400">Admin</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-amber-800 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>Procurement & Empanelment Board</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[9.5px] text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full border border-slate-200/60 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              PostgreSQL Connected
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Contractor Empanelment & Procurement Hub
          </h1>
          <p className="text-[11.5px] text-slate-500 max-w-2xl leading-relaxed">
            Centralized operations for contractor KYC approvals, statutory document audits, tender RFPs & 24-hr site gate passes.
          </p>
        </div>

        {/* Quick Utility Action Links */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/empanelment"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border border-slate-200/70 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
            title="Open Live Public Empanelment Portal"
          >
            <span>Public Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/empanelment/verify-pass"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border border-slate-200/70 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
            title="Open Security Guard Scanner Simulator"
          >
            <QrCode className="w-3 h-3 text-slate-500" />
            <span>Guard Scanner</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/admin/automail?brand=empanelment"
            className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border border-slate-200/70 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
            title="Open AutoMail Dispatcher for Empanelment"
          >
            <Send className="w-3 h-3 text-slate-500" />
            <span>AutoMail</span>
          </Link>
        </div>
      </div>

      {/* Persistent Empanelment Secondary Command Tab Bar */}
      <nav
        aria-label="Empanelment Navigation"
        className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-1.5 shadow-xs overflow-x-auto scrollbar-none"
      >
        <div className="flex items-center gap-1 min-w-max">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Page Slot */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
