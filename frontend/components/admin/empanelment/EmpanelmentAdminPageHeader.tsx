"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface EmpanelmentAdminPageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function EmpanelmentAdminPageHeader({
  breadcrumbs = [],
  title,
  description,
  badge,
  actions,
  children,
}: EmpanelmentAdminPageHeaderProps) {
  const actionContent = actions || children;
  return (
    <div className="relative bg-white/80 backdrop-blur-2xl border border-slate-200/60 p-5 sm:p-6 rounded-3xl shadow-[0_4px_24px_rgba(15,23,42,0.03)] mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 overflow-hidden">
      {/* Subtle Apple Ambient Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      
      <div className="space-y-1.5 max-w-2xl relative z-10">
        {/* Breadcrumb Bar */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <Link
            href="/admin/empanelment"
            scroll={false}
            className="hover:text-slate-800 transition-colors inline-flex items-center gap-1 font-semibold text-slate-600"
          >
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            <span>Empanelment</span>
          </Link>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  scroll={false}
                  className="hover:text-slate-800 transition-colors text-slate-500 font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-800 font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}

          {badge && (
            <span className="ml-1 inline-flex items-center px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-500/20 rounded-full">
              {badge}
            </span>
          )}
        </nav>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
          {title}
        </h1>

        {/* Subtitle / Description */}
        {description && (
          <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-sans">
            {description}
          </p>
        )}
      </div>

      {/* Action Slot */}
      {actionContent && (
        <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0">
          {actionContent}
        </div>
      )}
    </div>
  );
}
