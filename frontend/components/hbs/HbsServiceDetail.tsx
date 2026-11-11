import React from "react";
import { ShieldCheck, CheckCircle } from "lucide-react";

export interface HbsWarrantyProps {
  warrantyDetails?: string | null;
  className?: string;
}

/**
 * Validates whether warranty content is non-empty.
 * Returns false for null, undefined, empty string, or whitespace-only strings.
 */
export function hasValidWarranty(warrantyDetails?: string | null): boolean {
  if (!warrantyDetails || typeof warrantyDetails !== "string") {
    return false;
  }
  return warrantyDetails.trim().length > 0;
}

/**
 * Renders the HBS Warranty Guarantee card.
 * Returns null if warrantyDetails is null, undefined, empty, or whitespace-only.
 * Preserves the exact styling, iconography, and colors of the existing design.
 */
export function HbsWarrantyCard({ warrantyDetails, className = "" }: HbsWarrantyProps) {
  if (!hasValidWarranty(warrantyDetails)) {
    return null;
  }

  const cleanText = warrantyDetails!.trim();

  return (
    <div
      data-testid="hbs-warranty-card"
      className={`bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs border-t-4 border-t-red-600 ${className}`}
    >
      <div className="flex items-center gap-2 text-red-600">
        <ShieldCheck className="w-5 h-5" />
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
          Warranty &amp; Quality Guarantee
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        {cleanText}
      </p>
    </div>
  );
}

/**
 * Renders the "Written Warranty" trust micro-indicator badge.
 * Returns null if warrantyDetails is null, undefined, or empty.
 */
export function HbsWarrantyBadge({ warrantyDetails, className = "" }: HbsWarrantyProps) {
  if (!hasValidWarranty(warrantyDetails)) {
    return null;
  }

  return (
    <div
      data-testid="hbs-warranty-badge"
      className={`flex items-center gap-1.5 ${className}`}
    >
      <CheckCircle className="w-4 h-4 text-emerald-600" />
      <span>Written Warranty</span>
    </div>
  );
}

export default HbsWarrantyCard;
