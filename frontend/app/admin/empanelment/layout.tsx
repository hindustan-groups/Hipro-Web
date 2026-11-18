"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  QrCode,
  Sparkles,
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
    { href: "/admin/empanelment/directory", label: "Directory", icon: Users },
    { href: "/admin/empanelment/tenders", label: "Tenders & Bids", icon: Briefcase },
    { href: "/admin/empanelment/gate-passes", label: "Gate Passes", icon: QrCode },
    { href: "/admin/empanelment/categories", label: "Category Studio", icon: Layers },
    { href: "/admin/empanelment/work-orders", label: "Work Orders", icon: FileText },
    { href: "/admin/empanelment/tickets", label: "Tickets", icon: MessageSquare },
    { href: "/admin/empanelment/content", label: "Portal Studio", icon: Sparkles },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Apple-Style Empanelment Command Bar */}
      <div className="bg-white/75 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Navigation Tabs */}
        <nav
          aria-label="Empanelment Navigation"
          className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 px-0.5"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                scroll={false}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-amber-400" : "text-slate-400"
                  }`}
                />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-1.5 shrink-0 px-1 justify-end">
          <Link
            href="/empanelment"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
            title="Open Live Public Empanelment Portal"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/empanelment/verify-pass"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
            title="Open Security Guard Scanner Simulator"
          >
            <QrCode className="w-3 h-3 text-slate-400" />
            <span>Scanner</span>
          </Link>

          <Link
            href="/admin/automail?brand=empanelment"
            className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
            title="Open AutoMail Dispatcher for Empanelment"
          >
            <Send className="w-3 h-3 text-slate-400" />
            <span>AutoMail</span>
          </Link>
        </div>
      </div>

      {/* Main Page Slot */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
