"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, KeyRound, Lock } from "lucide-react";
import SecuritySettingsCard from "@/components/admin/SecuritySettingsCard";
import AdminGatewayKeyCard from "@/components/admin/AdminGatewayKeyCard";

export default function MasterSecurityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* ── Top Header Breadcrumb ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all mb-3 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Master HQ</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
                Master Security & 2FA Vault
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Parent Company Access Control · Stealth Gateway URL Obscurity & RFC 6238 2FA Governance
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-semibold border border-emerald-500/20 shadow-2xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Multi-Layer Perimeter Enforced</span>
        </div>
      </div>

      {/* ── Stealth Gateway Secret URL Card ───────────────────── */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm p-6 md:p-8">
        <AdminGatewayKeyCard />
      </div>

      {/* ── 2FA & Password Management Card ───────────────────── */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm p-6 md:p-8">
        <SecuritySettingsCard />
      </div>
    </div>
  );
}
