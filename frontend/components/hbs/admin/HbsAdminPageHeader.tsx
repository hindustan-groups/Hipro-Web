import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HbsAdminPageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  badge?: string;
  children?: React.ReactNode;
}

export default function HbsAdminPageHeader({
  breadcrumbs = [],
  title,
  description,
  badge,
  children,
}: HbsAdminPageHeaderProps) {
  return (
    <div className="pb-5 mb-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1 max-w-2xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <Link href="/admin/hbs" className="hover:text-slate-800 transition-colors">
            Hind Build Admin
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-slate-800 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-700 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
          {badge && (
            <span className="ml-2 inline-flex items-center px-2 py-0.2 text-[9px] font-bold font-mono uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 rounded-md">
              {badge}
            </span>
          )}
        </nav>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
          {title}
        </h1>

        {/* Short Description */}
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            {description}
          </p>
        )}
      </div>

      {/* Primary Actions Slot */}
      {children && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {children}
        </div>
      )}
    </div>
  );
}
