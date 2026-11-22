"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Building2,
  Mail,
  ShieldCheck,
  Globe,
  Database,
  Save,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Server,
  Layers,
  KeyRound,
  ExternalLink,
} from "lucide-react";

export default function MasterHqSettingsPage() {
  const [holdingName, setHoldingName] = useState("Hindustan Projects Group");
  const [holdingCin, setHoldingCin] = useState("U45201RJ2020PTC068942");
  const [holdingGst, setHoldingGst] = useState("08AABCH1234F1Z8");
  const [headOffice, setHeadOffice] = useState("Near Circuit House, Subhash Nagar, Bhilwara, Rajasthan 311001");
  const [centralEmail, setCentralEmail] = useState("contact@hindustanprojects.in");
  const [supportPhone, setSupportPhone] = useState("+91 94141 12345");
  const [saved, setSaved] = useState(false);

  // Active domain routes
  const [hiproDomain] = useState("https://www.hindustanprojects.in");
  const [hbsDomain] = useState("https://hindbuilding.hindustanprojects.in");
  const [vendorDomain] = useState("https://empanelment.hindustanprojects.in");

  // Maintenance flags
  const [hiproLive, setHiproLive] = useState(true);
  const [hbsLive, setHbsLive] = useState(true);
  const [vendorLive, setVendorLive] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_30px_rgba(15,23,42,0.03)] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors mb-3 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Master Cockpit</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight">
                Master HQ System Settings
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Holding company legal identity, multi-portal DNS routing, and platform governance.
              </p>
            </div>
          </div>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── Section 1: Holding Company Legal Identity ── */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-construction-navy" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Corporate Legal Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Holding Enterprise Name
              </label>
              <input
                type="text"
                value={holdingName}
                onChange={(e) => setHoldingName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Corporate CIN / Registration No.
              </label>
              <input
                type="text"
                value={holdingCin}
                onChange={(e) => setHoldingCin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Group GSTIN Identification
              </label>
              <input
                type="text"
                value={holdingGst}
                onChange={(e) => setHoldingGst(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Holding Central Official Email
              </label>
              <input
                type="email"
                value={centralEmail}
                onChange={(e) => setCentralEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Registered Headquarters Address
              </label>
              <input
                type="text"
                value={headOffice}
                onChange={(e) => setHeadOffice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Multi-Portal Domains & Gateway Routing ── */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Globe className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Multi-Domain Gateway Routing
            </h2>
          </div>

          <div className="space-y-4">
            {/* HiPRO */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  W1
                </div>
                <div>
                  <p className="font-bold text-slate-900">HiPRO Corporate Web</p>
                  <p className="text-[11px] text-blue-700 font-mono">{hiproDomain}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Online
                </span>
                <a
                  href={hiproDomain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                >
                  <span>Test Route</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* HBS */}
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  W2
                </div>
                <div>
                  <p className="font-bold text-slate-900">Hind Building Solutions (HBS)</p>
                  <p className="text-[11px] text-orange-700 font-mono">{hbsDomain}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Online
                </span>
                <a
                  href={hbsDomain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                >
                  <span>Test Route</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Vendor Procurement */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  W3
                </div>
                <div>
                  <p className="font-bold text-slate-900">Vendor Empanelment Hub</p>
                  <p className="text-[11px] text-amber-700 font-mono">{vendorDomain}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Online
                </span>
                <a
                  href={vendorDomain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                >
                  <span>Test Route</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Save Button ── */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save HQ Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
