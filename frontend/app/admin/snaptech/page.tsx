"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Code2,
  Smartphone,
  Server,
  Sparkles,
  ArrowRight,
  Layers,
  Building2,
  Laptop
} from "lucide-react";

const SNAPTECH_ADMIN_URL = "https://www.snaptech.digital/admin-hp9z7k5w8v3q2m4x";
const SNAPTECH_WEBSITE_URL = "https://www.snaptech.digital";

export default function SnapTechAdminBridgePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNAPTECH_ADMIN_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* 1. Header Banner & Quick Launcher */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-bold uppercase tracking-wider font-mono rounded-md">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Hindustan Group &middot; IT &amp; Digital Venture
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold uppercase tracking-wider font-mono rounded-md">
                <ShieldCheck className="w-3 h-3" />
                Secure Token Route
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/snaptech-icon.png"
                alt="SnapTech Logo"
                className="w-12 h-12 object-contain rounded-full shadow-xs border border-blue-200/80 bg-white p-0.5 shrink-0 ring-2 ring-blue-500/10"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-display">
                  SnapTech Digital Console
                </h1>
                <p className="text-slate-500 text-xs md:text-sm font-sans mt-0.5">
                  Web &amp; App Development Agency &middot; Client Management, Tech Operations &amp; Lead Inquiries
                </p>
              </div>
            </div>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-2xs"
              title="Copy secure admin URL"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied URL!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Admin URL</span>
                </>
              )}
            </button>

            <a
              href={SNAPTECH_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Live Website ↗</span>
            </a>

            <a
              href={SNAPTECH_ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-[0_4px_16px_rgba(37,99,235,0.3)] group active:scale-[0.98]"
            >
              <span>Launch SnapTech Admin</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Direct Gateway Access Card */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-200 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dedicated Remote Production Gateway</span>
          </div>

          <div className="flex items-center gap-4 pt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/snaptech-icon.png"
              alt="SnapTech"
              className="w-14 h-14 object-contain rounded-full bg-white p-1 shadow-lg shrink-0 border-2 border-white/80 ring-2 ring-blue-400/30"
            />
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Direct Access to SnapTech Production Management Portal
              </h2>
              <p className="text-blue-200 text-xs font-mono mt-0.5">Hindustan Group &middot; Official IT &amp; Web Wing</p>
            </div>
          </div>

          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Clicking the button below opens the SnapTech Digital administrative console in a secure, isolated workspace tab.
            You can oversee web project delivery, manage mobile app deployments, review inbound technology quote inquiries, and configure agency assets.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={SNAPTECH_ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all group active:scale-[0.98]"
            >
              <span>Open SnapTech Admin (admin-hp9z7k5w8v3q2m4x)</span>
              <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-[11px] text-slate-300 font-mono truncate">
              {SNAPTECH_ADMIN_URL}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Agency Operational Services */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            SnapTech Digital Agency Portfolio &amp; Capabilities
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Managed via SnapTech Console</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Laptop className="w-5 h-5" />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">Web App Development</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Full-stack Next.js, React, Node.js applications, CMS systems, and enterprise portals.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">Mobile Applications</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Native and cross-platform Android &amp; iOS software with high-performance UI and offline sync.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">Custom Software &amp; ERPs</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Tailored business software, billing engines, CRM integration, and automated internal workflows.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">Cloud Infrastructure &amp; SEO</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Enterprise cloud hosting, continuous deployment, speed optimization, and search engine dominance.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Multi-Brand Executive Switcher */}
      <div className="p-6 bg-slate-100/60 border border-slate-200/80 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          Switch Between Hindustan Group Consoles
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/admin"
            scroll={false}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="HiPRO" className="w-8 h-8 object-contain rounded-xs mix-blend-multiply" />
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-900">Hindustan Projects (HiPRO)</p>
                <p className="text-[11px] text-slate-500">Core Architecture &amp; Construction Master Admin</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/admin/hbs"
            scroll={false}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hbs-icon.jpg" alt="Hind Build" className="w-8 h-8 object-contain rounded-xs" />
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-red-600">Hind Build Solutions (HiBUILD)</p>
                <p className="text-[11px] text-slate-500">Turnkey Building Repair &amp; Maintenance CMS</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
