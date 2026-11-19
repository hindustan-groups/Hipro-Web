"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Search,
  Building2,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  RefreshCw,
  FileCheck2,
} from "lucide-react";

interface VerifiedVendor {
  trackingId: string;
  companyName: string;
  status: string;
  category: string;
  tier: string;
  approvedAt?: string | null;
  city?: string | null;
  state?: string | null;
  digitalCertificateUrl?: string | null;
}

const KNOWN_PENDING_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_VERIFICATION",
  "TECHNICAL_AUDIT",
  "FINANCIAL_REVIEW",
  "DOCS_REQUESTED",
];

const KNOWN_VOID_STATUSES = ["REJECTED", "BLACKLISTED"];

/**
 * Validate that a certificate URL uses a safe protocol (https, http, or data:application/pdf).
 * Blocks javascript:, vbscript:, data:text/html, and arbitrary unsafe schemes.
 */
function isSafeCertificateUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:text/html")
  ) {
    return false;
  }
  if (lower.startsWith("https://") || lower.startsWith("http://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }
  if (lower.startsWith("data:application/pdf") || lower.startsWith("data:image/")) {
    return true;
  }
  return false;
}

const TIER_LABELS: Record<string, { label: string; badgeClass: string }> = {
  CLASS_A: {
    label: "CLASS A • MEGA CONTRACTOR",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
  },
  CLASS_B: {
    label: "CLASS B • CORE CIVIL & MEP",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
  },
  CLASS_C: {
    label: "CLASS C • SPECIALIZED TRADE",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  CLASS_D: {
    label: "CLASS D • LOCAL SUPPLIER",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
  },
  TIER_A: {
    label: "CLASS A • MEGA CONTRACTOR",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
  },
  TIER_B: {
    label: "CLASS B • CORE CIVIL & MEP",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
  },
  TIER_C: {
    label: "CLASS C • SPECIALIZED TRADE",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  TIER_D: {
    label: "CLASS D • LOCAL SUPPLIER",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
  },
  PROVISIONAL: {
    label: "PROVISIONAL • UNDER EVALUATION",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
  },
};

function VerifyPartnerContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get("id") || searchParams?.get("trackingId") || "";

  const [inputCode, setInputCode] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [vendor, setVendor] = useState<VerifiedVendor | null>(null);
  const [searchedId, setSearchedId] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [networkError, setNetworkError] = useState("");

  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const raw = (codeToVerify || inputCode).trim().toUpperCase();
      if (!raw) {
        setVendor(null);
        setNotFound(false);
        setNetworkError("Please enter a valid Empanelment ID (e.g. HP-EMP-849201).");
        return;
      }

      setLoading(true);
      setNetworkError("");
      setNotFound(false);
      setSearchedId(raw);

      try {
        const res = await fetch(`/api/empanelment/verify/${encodeURIComponent(raw)}`, {
          cache: "no-store",
        });

        if (res.status === 404) {
          setVendor(null);
          setNotFound(true);
          return;
        }

        const json = await res.json();
        if (!res.ok || !json.success || !json.application) {
          setVendor(null);
          setNotFound(true);
          return;
        }

        setVendor(json.application);
      } catch (err: any) {
        setVendor(null);
        setNotFound(false);
        setNetworkError("Unable to connect to the central procurement registry. Please check your network.");
      } finally {
        setLoading(false);
      }
    },
    [inputCode]
  );

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, [initialId, handleVerify]);

  const tierInfo = vendor?.tier ? TIER_LABELS[vendor.tier] || { label: vendor.tier, badgeClass: "bg-slate-100 text-slate-800 border-slate-200" } : null;

  const formattedApprovalDate = vendor?.approvedAt
    ? new Date(vendor.approvedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-16 space-y-8 text-xs">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>HINDUSTAN PROJECTS PROCUREMENT REGISTRY</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">
          Partner Credential Verification
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
          आधिकारिक संविदाकार / आपूर्तिकर्ता प्रमाणीकरण: PVC स्मार्ट कार्ड या डिजिटल क्रेडेंशियल की प्रामाणिकता जांचें
        </p>
      </div>

      {/* Manual Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-2">
        <label className="block text-[10px] uppercase font-bold text-slate-500">
          Enter Empanelment Tracking ID to Verify
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. HP-EMP-849201"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm sm:text-xs text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
            <span>{loading ? "Verifying..." : "Verify Credential"}</span>
          </button>
        </div>
        {networkError && (
          <p className="text-red-600 text-[11px] font-medium pt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{networkError}</span>
          </p>
        )}
      </div>

      {/* RESULT STATE 1: OFFICIALLY APPROVED PARTNER */}
      {vendor && vendor.status === "APPROVED" && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/50 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          {/* Top Verification Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-black uppercase tracking-wider">
                  ✓ VERIFIED & APPROVED PARTNER
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
                  {vendor.companyName}
                </h2>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono">
              <p className="text-[10px] text-slate-400 uppercase font-bold">EMPANELMENT ID</p>
              <p className="text-sm font-black text-slate-900 tracking-wider">{vendor.trackingId}</p>
            </div>
          </div>

          {/* Core Verified Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Approved Contractor Tier</span>
              </p>
              <p className="text-xs font-bold text-slate-900">
                {tierInfo?.label || vendor.tier || "CLASS A • CONTRACTOR"}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Authorized Category</span>
              </p>
              <p className="text-xs font-bold text-slate-900">
                {vendor.category || "General Contracting & Civil"}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Empanelled Since</span>
              </p>
              <p className="text-xs font-bold text-slate-900">
                {formattedApprovalDate || "Active Term"}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Registered Location</span>
              </p>
              <p className="text-xs font-bold text-slate-900">
                {[vendor.city, vendor.state].filter(Boolean).join(", ") || "Rajasthan, India"}
              </p>
            </div>
          </div>

          {/* Official Registry Declaration */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold">Official Credential Authenticated</p>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                This contractor credential is valid and active in the Hindustan Projects Procurement Registry. Authorized for project tender bidding and site gate pass issuance.
              </p>
            </div>
          </div>

          {/* Optional Digital Certificate Link */}
          {vendor.digitalCertificateUrl && isSafeCertificateUrl(vendor.digitalCertificateUrl) && (
            <div className="pt-2 flex justify-end">
              <a
                href={vendor.digitalCertificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 underline underline-offset-4"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
                <span>View Official Digital Empanelment Certificate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* RESULT STATE 2: APPLICATION IN REVIEW (NOT APPROVED) */}
      {vendor && KNOWN_PENDING_STATUSES.includes(vendor.status) && (
        <div className="bg-white rounded-3xl border-2 border-amber-400 p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-mono text-[10px] font-black uppercase tracking-wider">
                APPLICATION IN REVIEW • NOT YET APPROVED
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                {vendor.companyName}
              </h2>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
            <p className="font-bold text-xs">Partner Credentials Not Yet Active</p>
            <p className="text-[11px] leading-relaxed">
              This Tracking ID (<strong className="font-mono">{vendor.trackingId}</strong>) belongs to an application currently under evaluation (Status: <strong>{vendor.status}</strong>). Partner credentials have not been approved.
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 text-[11px]">
            <span className="text-slate-500 font-medium">To check full application progress:</span>
            <Link
              href={`/empanelment/track?id=${encodeURIComponent(vendor.trackingId)}`}
              className="font-bold text-amber-800 hover:text-amber-950 underline"
            >
              Open Application Tracker →
            </Link>
          </div>
        </div>
      )}

      {/* RESULT STATE 3: REJECTED OR INACTIVE */}
      {vendor && KNOWN_VOID_STATUSES.includes(vendor.status) && (
        <div className="bg-white rounded-3xl border-2 border-red-500 p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 text-red-900 border border-red-300 font-mono text-[10px] font-black uppercase tracking-wider">
                CREDENTIAL INACTIVE / NOT APPROVED
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1 font-mono">
                {vendor.trackingId}
              </h2>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-1">
            <p className="font-bold text-xs">Credential Void</p>
            <p className="text-[11px] leading-relaxed">
              This empanelment record is marked as <strong>{vendor.status}</strong>. This entity does not hold active partner credentials with Hindustan Projects and is not authorized for commercial bidding or site access.
            </p>
          </div>
        </div>
      )}

      {/* RESULT STATE 4: UNKNOWN / UNEXPECTED STATUS (STATUS UNAVAILABLE) */}
      {vendor &&
        vendor.status !== "APPROVED" &&
        !KNOWN_PENDING_STATUSES.includes(vendor.status) &&
        !KNOWN_VOID_STATUSES.includes(vendor.status) && (
          <div className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-mono text-[10px] font-black uppercase tracking-wider">
                  STATUS VERIFICATION UNAVAILABLE
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1 font-mono">
                  {vendor.trackingId}
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1">
              <p className="font-bold text-xs">Credential Status Could Not Be Automatically Verified</p>
              <p className="text-[11px] leading-relaxed">
                The credential status for reference code <strong className="font-mono">{vendor.trackingId}</strong> is recorded as <strong>{vendor.status}</strong>, which cannot be verified automatically. Active partner credentials cannot be confirmed.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 text-[11px]">
              <span className="text-slate-500 font-medium">For verification assistance, contact:</span>
              <a
                href="mailto:empanelment@hindustanprojects.in"
                className="font-bold text-slate-800 hover:text-black underline"
              >
                empanelment@hindustanprojects.in
              </a>
            </div>
          </div>
        )}

      {/* RESULT STATE 4: INVALID / RECORD NOT FOUND */}
      {notFound && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-4 text-center animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Credential Not Found in Registry</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No contractor record exists for reference code <strong className="font-mono text-slate-800">{searchedId}</strong>. Please ensure the QR code or tracking number was scanned accurately.
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            For support or queries, contact the procurement desk at{" "}
            <a href="mailto:empanelment@hindustanprojects.in" className="text-slate-700 font-semibold underline">
              empanelment@hindustanprojects.in
            </a>
          </p>
        </div>
      )}

      {/* Security Note */}
      <div className="text-center pt-4 border-t border-slate-200/80">
        <p className="text-[11px] text-slate-400">
          Official digital partner verification powered by Hindustan Projects (HiPRO) Central Registry.
        </p>
      </div>
    </div>
  );
}

export default function EmpanelmentVerifyPartnerPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-20 text-center text-xs text-slate-500 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
          <p>Connecting to procurement registry...</p>
        </div>
      }
    >
      <VerifyPartnerContent />
    </Suspense>
  );
}
