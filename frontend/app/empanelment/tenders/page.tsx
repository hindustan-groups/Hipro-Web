"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, UserPlus, ArrowRight, Briefcase } from "lucide-react";

export default function PublicTendersGatePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const token =
        localStorage.getItem("vendor_token") ||
        localStorage.getItem("hipro_vendor_token");
      if (token) {
        router.replace("/empanelment/portal/tenders");
      }
    } catch (_e) {}
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-6 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#dc2626] border border-red-200 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-[#dc2626] bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <Briefcase className="w-3.5 h-3.5" />
            <span>REGISTERED VENDORS ONLY</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight font-display">
            Active Tenders &amp; BOQ Packages
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Live construction tenders, technical specifications, and commercial bidding are restricted exclusively to registered &amp; approved Hindustan Projects vendors. Please log in to your Vendor Portal to view active tenders.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/empanelment/login?redirect=/empanelment/portal/tenders"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Partner Portal Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/empanelment/apply"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register as Vendor</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
