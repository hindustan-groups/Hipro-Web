"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
  Loader2,
  AlertTriangle,
  PhoneCall,
  MapPin,
  FileText,
  Sliders,
  Check,
  Zap,
  Activity,
  XCircle,
} from "lucide-react";

export interface MasterHqSettings {
  holdingName: string;
  holdingCin: string;
  holdingGst: string;
  headOffice: string;
  centralEmail: string;
  supportPhone: string;
  emergencyHelpline: string;
  portalRouting: {
    hiproDomain: string;
    hbsDomain: string;
    vendorDomain: string;
  };
  maintenanceMode: {
    hipro: boolean;
    hbs: boolean;
    vendor: boolean;
    maintenanceNotice: string;
  };
  brandAssets: {
    logoUrl: string;
    faviconUrl: string;
    letterheadHeader: string;
    officialDisclaimer: string;
  };
  updatedAt?: string;
}

export default function MasterHqSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Settings State
  const [holdingName, setHoldingName] = useState("Hindustan Projects Group");
  const [holdingCin, setHoldingCin] = useState("U45201RJ2020PTC068942");
  const [holdingGst, setHoldingGst] = useState("08AABCH1234F1Z8");
  const [headOffice, setHeadOffice] = useState("Near Circuit House, Subhash Nagar, Bhilwara, Rajasthan 311001");
  const [centralEmail, setCentralEmail] = useState("info@hindustanprojects.in");
  const [supportPhone, setSupportPhone] = useState("+91 94141 12345");
  const [emergencyHelpline, setEmergencyHelpline] = useState("+91 1482 234567");

  // Domain routing
  const [hiproDomain, setHiproDomain] = useState("https://www.hindustanprojects.in");
  const [hbsDomain, setHbsDomain] = useState("https://hindbuilding.hindustanprojects.in");
  const [vendorDomain, setVendorDomain] = useState("https://empanelment.hindustanprojects.in");

  // Maintenance flags
  const [hiproMaint, setHiproMaint] = useState(false);
  const [hbsMaint, setHbsMaint] = useState(false);
  const [vendorMaint, setVendorMaint] = useState(false);
  const [maintNotice, setMaintNotice] = useState("This portal is currently undergoing scheduled infrastructure maintenance. Normal operations will resume shortly.");

  // Brand assets
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");
  const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");
  const [letterheadHeader, setLetterheadHeader] = useState("Hindustan Projects Group · Architectural Engineering, Turnkey Construction & Civil Infrastructure");
  const [officialDisclaimer, setOfficialDisclaimer] = useState("Confidentiality Notice: This digital transmission and any accompanying credentials are confidential and legally privileged. Strictly governed by Hindustan Projects Group central corporate governance protocols.");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Domain ping states
  const [pingingDomain, setPingingDomain] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { online: boolean; latencyMs: number; statusText: string }>>({});

  // Fetch real settings from backend API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/hq", { credentials: "include" });
      const json = await res.json();
      if (json.success && json.data) {
        const d: MasterHqSettings = json.data;
        setHoldingName(d.holdingName || "Hindustan Projects Group");
        setHoldingCin(d.holdingCin || "");
        setHoldingGst(d.holdingGst || "");
        setHeadOffice(d.headOffice || "");
        setCentralEmail(d.centralEmail || "info@hindustanprojects.in");
        setSupportPhone(d.supportPhone || "");
        setEmergencyHelpline(d.emergencyHelpline || "");

        if (d.portalRouting) {
          setHiproDomain(d.portalRouting.hiproDomain || "https://www.hindustanprojects.in");
          setHbsDomain(d.portalRouting.hbsDomain || "https://hindbuilding.hindustanprojects.in");
          setVendorDomain(d.portalRouting.vendorDomain || "https://empanelment.hindustanprojects.in");
        }

        if (d.maintenanceMode) {
          setHiproMaint(Boolean(d.maintenanceMode.hipro));
          setHbsMaint(Boolean(d.maintenanceMode.hbs));
          setVendorMaint(Boolean(d.maintenanceMode.vendor));
          setMaintNotice(d.maintenanceMode.maintenanceNotice || "");
        }

        if (d.brandAssets) {
          setLogoUrl(d.brandAssets.logoUrl || "/logo.jpg");
          setFaviconUrl(d.brandAssets.faviconUrl || "/favicon.ico");
          setLetterheadHeader(d.brandAssets.letterheadHeader || "");
          setOfficialDisclaimer(d.brandAssets.officialDisclaimer || "");
        }

        if (d.updatedAt) {
          setLastUpdated(d.updatedAt);
        }
      }
    } catch {
      setToast({ message: "Failed to load HQ settings from server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings to Database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    const payload: Partial<MasterHqSettings> = {
      holdingName: holdingName.trim(),
      holdingCin: holdingCin.trim(),
      holdingGst: holdingGst.trim(),
      headOffice: headOffice.trim(),
      centralEmail: centralEmail.trim(),
      supportPhone: supportPhone.trim(),
      emergencyHelpline: emergencyHelpline.trim(),
      portalRouting: {
        hiproDomain: hiproDomain.trim(),
        hbsDomain: hbsDomain.trim(),
        vendorDomain: vendorDomain.trim(),
      },
      maintenanceMode: {
        hipro: hiproMaint,
        hbs: hbsMaint,
        vendor: vendorMaint,
        maintenanceNotice: maintNotice.trim(),
      },
      brandAssets: {
        logoUrl: logoUrl.trim(),
        faviconUrl: faviconUrl.trim(),
        letterheadHeader: letterheadHeader.trim(),
        officialDisclaimer: officialDisclaimer.trim(),
      },
    };

    try {
      const res = await fetch("/api/settings/hq", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setToast({ message: "✓ Master HQ Corporate Settings saved permanently to database!", type: "success" });
        if (json.data?.updatedAt) {
          setLastUpdated(json.data.updatedAt);
        }
      } else {
        setToast({ message: json.error || "Failed to save HQ settings", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving settings to server", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Real-time Domain Route Health Ping
  const handlePingDomain = async (key: string, url: string) => {
    setPingingDomain(key);
    try {
      const res = await fetch("/api/settings/hq/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (json.success && json.result) {
        setPingResults((prev) => ({
          ...prev,
          [key]: {
            online: json.result.online,
            latencyMs: json.result.latencyMs,
            statusText: `${json.result.statusCode > 0 ? `HTTP ${json.result.statusCode} ` : ""}${json.result.statusText}`,
          },
        }));
      }
    } catch {
      setPingResults((prev) => ({
        ...prev,
        [key]: {
          online: false,
          latencyMs: 0,
          statusText: "Ping error",
        },
      }));
    } finally {
      setPingingDomain(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
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
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                  Central Governance
                </span>
                {lastUpdated && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Synced: {new Date(lastUpdated).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight mt-0.5">
                Master HQ System Settings
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Holding company legal identity, multi-portal DNS routing, and platform governance.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving Changes..." : "Save HQ Configuration"}</span>
        </button>
      </div>

      {/* Toast Alert Feedback */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold">Loading Master HQ database configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* ── Section 1: Holding Company Legal Identity ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-slate-900" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                    1. Corporate Legal Identity & Registrations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official company records used across tax invoices, proposals, and contractor contracts.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-mono">
                PostgreSQL Synced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Holding Enterprise Name *
                </label>
                <input
                  type="text"
                  required
                  value={holdingName}
                  onChange={(e) => setHoldingName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Corporate CIN / Registration No.
                </label>
                <input
                  type="text"
                  value={holdingCin}
                  onChange={(e) => setHoldingCin(e.target.value)}
                  placeholder="e.g. U45201RJ2020PTC068942"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Group GSTIN Identification
                </label>
                <input
                  type="text"
                  value={holdingGst}
                  onChange={(e) => setHoldingGst(e.target.value)}
                  placeholder="e.g. 08AABCH1234F1Z8"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Holding Official Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={centralEmail}
                    onChange={(e) => setCentralEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Corporate Helpline Phone *
                </label>
                <div className="relative">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+91 94141 12345"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Emergency Site 24/7 Helpline
                </label>
                <div className="relative">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={emergencyHelpline}
                    onChange={(e) => setEmergencyHelpline(e.target.value)}
                    placeholder="+91 1482 234567"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Registered Headquarters Address *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={headOffice}
                    onChange={(e) => setHeadOffice(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Multi-Domain Gateways & Live Route Radar ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                    2. Multi-Domain Gateways & Live Route Radar
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live server-to-server health ping and domain connectivity tests for each managed web property.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Route 1: HiPRO */}
              <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    W1
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">HiPRO Corporate Web</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono">
                        Flagship Civil
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="url"
                        value={hiproDomain}
                        onChange={(e) => setHiproDomain(e.target.value)}
                        className="w-72 sm:w-96 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-mono font-semibold text-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {pingResults.hipro && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border font-mono ${
                        pingResults.hipro.online
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {pingResults.hipro.online ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Online ({pingResults.hipro.latencyMs}ms)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>{pingResults.hipro.statusText}</span>
                        </>
                      )}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePingDomain("hipro", hiproDomain)}
                    disabled={pingingDomain === "hipro"}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                  >
                    {pingingDomain === "hipro" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span>Ping Route</span>
                  </button>

                  <a
                    href={hiproDomain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span>Open Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Route 2: HBS */}
              <div className="p-5 rounded-2xl bg-orange-50/40 border border-orange-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    W2
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Hind Building Solutions (HBS)</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-mono">
                        Waterproofing
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="url"
                        value={hbsDomain}
                        onChange={(e) => setHbsDomain(e.target.value)}
                        className="w-72 sm:w-96 px-3 py-1.5 bg-white border border-orange-200 rounded-lg text-xs font-mono font-semibold text-orange-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {pingResults.hbs && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border font-mono ${
                        pingResults.hbs.online
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {pingResults.hbs.online ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Online ({pingResults.hbs.latencyMs}ms)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>{pingResults.hbs.statusText}</span>
                        </>
                      )}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePingDomain("hbs", hbsDomain)}
                    disabled={pingingDomain === "hbs"}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                  >
                    {pingingDomain === "hbs" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span>Ping Route</span>
                  </button>

                  <a
                    href={hbsDomain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span>Open Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Route 3: Vendor Empanelment */}
              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    W3
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Vendor Procurement Hub</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono">
                        KYC & Tenders
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="url"
                        value={vendorDomain}
                        onChange={(e) => setVendorDomain(e.target.value)}
                        className="w-72 sm:w-96 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-mono font-semibold text-amber-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {pingResults.vendor && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border font-mono ${
                        pingResults.vendor.online
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {pingResults.vendor.online ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Online ({pingResults.vendor.latencyMs}ms)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>{pingResults.vendor.statusText}</span>
                        </>
                      )}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePingDomain("vendor", vendorDomain)}
                    disabled={pingingDomain === "vendor"}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                  >
                    {pingingDomain === "vendor" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span>Ping Route</span>
                  </button>

                  <a
                    href={vendorDomain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span>Open Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Independent Portal Maintenance Mode & Kill-Switches ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Sliders className="w-5 h-5 text-red-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  3. Maintenance Mode & Emergency Isolation Switches
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Independently isolate any portal during code deployment or database migrations without affecting the other web properties.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* HiPRO Switch */}
              <div className={`p-4 rounded-2xl border transition-all ${hiproMaint ? "bg-amber-50/60 border-amber-300" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">HiPRO Civil Web</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hiproMaint}
                      onChange={(e) => setHiproMaint(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Status: <strong className={hiproMaint ? "text-amber-800" : "text-emerald-700"}>{hiproMaint ? "Maintenance Mode Active" : "Normal Live Operations"}</strong>
                </p>
              </div>

              {/* HBS Switch */}
              <div className={`p-4 rounded-2xl border transition-all ${hbsMaint ? "bg-amber-50/60 border-amber-300" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Hind Building (HBS)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hbsMaint}
                      onChange={(e) => setHbsMaint(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Status: <strong className={hbsMaint ? "text-amber-800" : "text-emerald-700"}>{hbsMaint ? "Maintenance Mode Active" : "Normal Live Operations"}</strong>
                </p>
              </div>

              {/* Vendor Hub Switch */}
              <div className={`p-4 rounded-2xl border transition-all ${vendorMaint ? "bg-amber-50/60 border-amber-300" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Vendor Hub & Portal</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vendorMaint}
                      onChange={(e) => setVendorMaint(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Status: <strong className={vendorMaint ? "text-amber-800" : "text-emerald-700"}>{vendorMaint ? "Maintenance Mode Active" : "Normal Live Operations"}</strong>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Maintenance Banner Notice Message
              </label>
              <textarea
                rows={2}
                value={maintNotice}
                onChange={(e) => setMaintNotice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* ── Section 4: Brand Assets & Corporate Letterheads ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  4. Brand Assets, Letterhead & Legal Disclaimers
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Corporate assets used across PDF quote generation, automated emails, and browser identity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Master Logo Path / URL
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Favicon Path / URL
                </label>
                <input
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:bg-white outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Letterhead Top Header Line
                </label>
                <input
                  type="text"
                  value={letterheadHeader}
                  onChange={(e) => setLetterheadHeader(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium text-xs focus:bg-white outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Official Confidentiality Disclaimer
                </label>
                <textarea
                  rows={2}
                  value={officialDisclaimer}
                  onChange={(e) => setOfficialDisclaimer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium text-xs focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── Save Bar Sticky Footer ── */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Permanent persistence: Changes save directly to the PostgreSQL database.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving Changes..." : "Save HQ Configuration"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
