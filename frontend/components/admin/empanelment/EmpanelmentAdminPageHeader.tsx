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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/70">
      <div className="space-y-1.5 max-w-3xl">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <Link
            href="/admin/empanelment"
            scroll={false}
            className="hover:text-slate-800 transition-colors inline-flex items-center gap-1 font-semibold text-slate-500"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
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
            <span className="ml-1.5 inline-flex items-center px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider bg-amber-500/10 text-amber-900 border border-amber-500/20 rounded-full">
              {badge}
            </span>
          )}
        </nav>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          {title}
        </h1>

        {/* Subtitle / Description */}
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {/* Action Slot */}
      {actionContent && (
        <div className="flex items-center gap-2 shrink-0">
          {actionContent}
        </div>
      )}
    </div>
  );
}
