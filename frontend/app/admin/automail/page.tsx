"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import {
  Users,
  Send,
  TrendingUp,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Zap,
  Building2,
  Hammer,
  ShieldCheck,
  Globe2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  PlayCircle,
} from "lucide-react";

export default function AutoMailDashboard() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<any>(null);

  // Sync state
  const [syncingCrm, setSyncingCrm] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [logStatusFilter, setLogStatusFilter] = useState<"all" | "sent" | "failed">("all");
  const [logSenderFilter, setLogSenderFilter] = useState<string>("all");
  const [senderFilterOptions, setSenderFilterOptions] = useState<Array<{ email: string; label: string }>>([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const senderParam = logSenderFilter !== "all" ? `&senderEmail=${encodeURIComponent(logSenderFilter)}` : "";
      const [statsRes, logsRes, mbRes] = await Promise.all([
        fetch(`/api/automail/stats?brand=${selectedBrand}`),
        fetch(`/api/automail/logs?brand=${selectedBrand}&limit=25${senderParam}`),
        fetch("/api/automail/mailboxes"),
      ]);
      const [data, logsData, mbData] = await Promise.all([statsRes.json(), logsRes.json(), mbRes.json()]);
      if (data.success) {
        setStats(data.stats);
      }
      if (logsData.success && Array.isArray(logsData.logs)) {
        setRecentLogs(logsData.logs);
      }
      if (mbData.success && Array.isArray(mbData.mailboxes)) {
        const opts: Array<{ email: string; label: string }> = [];
        for (const mb of mbData.mailboxes) {
          opts.push({ email: mb.email.toLowerCase(), label: `${mb.email} (Primary)` });
          for (const alias of mb.aliases || []) {
            opts.push({ email: alias.toLowerCase(), label: `${alias} (Alias)` });
          }
        }
        setSenderFilterOptions(opts);
      }
    } catch (err) {
      console.error("Failed to load automail stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedBrand, logSenderFilter]);

  const testConnection = async () => {
    setTestingSmtp(true);
    setSmtpStatus(null);
    try {
      const res = await fetch("/api/automail/test-connection");
      const data = await res.json();
      setSmtpStatus(data);
    } catch (err: any) {
      setSmtpStatus({ success: false, message: "Network error reaching server" });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleQuickSync = async () => {
    setSyncingCrm(true);
    setSyncToast(null);
    try {
      const res = await fetch("/api/automail/contacts/sync-crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncHiproLeads: true,
          syncHiproNewsletter: true,
          syncHbsLeads: true,
          syncEmpanelmentVendors: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncToast(`Success! Synced ${data.syncedCount} leads from website into AutoMail!`);
        fetchStats();
      } else {
        setSyncToast("Sync failed: " + (data.error || "Unknown error"));
      }
    } catch {
      setSyncToast("Network error syncing CRM leads");
    } finally {
      setSyncingCrm(false);
    }
  };

  const totalContacts = stats?.totalContacts || 0;
  const usagePercent = Math.min(
    (((stats?.sentToday || 0) / (stats?.dailyLimit || 200)) * 100),
    100
  );

  return (
    <div className="space-y-6">
      {/* Universal Multi-Brand Header */}
      <AutoMailNav activeBrand={selectedBrand} onBrandChange={setSelectedBrand} />

      {/* Sync Toast Feedback */}
      {syncToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{syncToast}</span>
          <button onClick={() => setSyncToast(null)} className="text-emerald-500 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* Missing Credentials Alert */}
      {stats?.settings && !stats.settings.smtpConfigured && !loading && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">Hostinger Mailbox Credentials Needed!</h3>
              <p className="text-xs text-red-700 mt-0.5">
                Mail deliver karne ke liye pehle Settings &rarr; Hostinger Mailboxes me email password ya Hostinger Mail API token save karein.
              </p>
            </div>
          </div>
          <Link
            href="/admin/automail/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all whitespace-nowrap self-start sm:self-auto"
          >
            <span>Add Hostinger Mailbox →</span>
          </Link>
        </div>
      )}

      {/* Zero Audience Warning Banner */}
      {totalContacts === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Audience list khali hai (0 Contacts)</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Mail send karne ke liye pehle website ke inquiries, quotes aur newsletter subscribers ko sync karein.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickSync}
            disabled={syncingCrm}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all whitespace-nowrap self-start sm:self-auto disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{syncingCrm ? "Syncing..." : "Sync Website Leads Now"}</span>
          </button>
        </div>
      )}

      {/* Top Banner / Welcome Action - High-End Glassmorphism */}
      <div className="relative z-0 overflow-hidden rounded-3xl p-6 sm:p-7 md:p-8 bg-gradient-to-br from-slate-900/95 via-[#0B1528]/90 to-slate-950/95 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_1px_0_rgba(255,255,255,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
        {/* Specular glass reflection & sheen highlights */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-transparent to-white/[0.06] pointer-events-none" />

        {/* Ambient luminous glow orbs */}
        <div className="absolute -top-24 -right-16 w-80 h-80 bg-rose-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-xl">
          {/* Frosted Glass Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-blue-200 text-[10px] font-mono font-bold uppercase tracking-wider shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <Zap className="w-3 h-3 text-blue-400" />
            <span>Universal Mail Pipeline Active</span>
            <span className="h-2.5 w-px bg-white/20" />
            <span className="text-white/80 font-sans normal-case text-[10px]">
              {selectedBrand === "hipro"
                ? "HiPRO Scope"
                : selectedBrand === "hbs"
                ? "Hind Build Scope"
                : selectedBrand === "empanelment"
                ? "Empanelment Scope"
                : "All Brands"}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              {selectedBrand === "hipro"
                ? "HiPRO Construction Mail Suite"
                : selectedBrand === "hbs"
                ? "Hind Build Solutions Mail Suite"
                : selectedBrand === "empanelment"
                ? "Vendor Empanelment Mail Suite"
                : "Global Multi-Brand AutoMail Hub"}
            </h2>
            <p className="mt-1.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
              Send bulk announcements, quotations &amp; updates across all sub-brands with automatic rate-limiting and Hostinger SMTP anti-spam protection.
            </p>
          </div>

          {/* Micro feature pills with frosted glass */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Hostinger Anti-Spam Guard</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium backdrop-blur-md">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Auto Rate-Limit (100/hr)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium backdrop-blur-md">
              <Globe2 className="w-3 h-3 text-blue-400" />
              <span>{stats?.settings?.activeMailboxesCount ?? 1} Active Mailbox(es)</span>
            </div>
            <Link
              href="/admin/automail/settings"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-[10px] text-blue-200 font-semibold backdrop-blur-md transition-colors"
            >
              <span>Manage Mailboxes &amp; Control →</span>
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href={selectedBrand !== "all" ? `/admin/automail/compose?brand=${selectedBrand}` : "/admin/automail/compose"}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-400 text-white font-black rounded-2xl text-xs sm:text-sm shadow-[0_12px_28px_-6px_rgba(225,29,72,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-red-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span>Compose &amp; Send Email</span>
          </Link>
          <Link
            href="/admin/automail/contacts"
            className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_8px_20px_-6px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Users className="w-4 h-4 text-blue-300" />
            <span>Audience ({totalContacts})</span>
          </Link>
          <button
            onClick={fetchStats}
            className="p-3.5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-2xl text-white/90 hover:text-white backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* EASY 3-STEP HOW IT WORKS CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-blue-600" />
            <span>Email Kaise Send Karein (Step-By-Step Guide):</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Yeh 3 steps follow karke aap 1 minute me sabhi leads ko business email bhej sakte hain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group p-4 rounded-2xl bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-200 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                1
              </div>
              {stats?.settings?.smtpConfigured && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {stats?.settings?.activeMailboxesCount ?? 1} Active
                </span>
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-900">Mailboxes &amp; Routing Setup</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Hostinger ke mail IDs (`info@`, `hbs@`, `empanelment@`) add karein aur portal event mapping set karein.
            </p>
            <Link
              href="/admin/automail/settings"
              className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Mailboxes &amp; Control Kholo</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="group p-4 rounded-2xl bg-slate-50/80 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-200 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                2
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                15+ Suites
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">3-Portal Template Choose</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              HiPRO Civil, Hind Build (HBS) ya Empanelment Hub ka corporate template preview aur test karein.
            </p>
            <Link
              href="/admin/automail/templates"
              className="text-[11px] font-bold text-amber-600 hover:underline inline-flex items-center gap-1"
            >
              <span>3-Portal Templates Dekho</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="group p-4 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-200 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                3
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                {totalContacts} Leads
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">&ldquo;Send Email Now&rdquo; Dabao</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Kisko bhejna hai tick karein aur direct Send dabayein. Hostinger SMTP se bina spam hue safely deliver hoga.
            </p>
            <Link
              href="/admin/automail/compose"
              className="text-[11px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Compose Kholo</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Brand Distribution Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedBrand("hipro")}
          className={`cursor-pointer bg-white border p-4 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-between ${
            selectedBrand === "hipro" ? "border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/20" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">HiPRO Audience</p>
              <p className="text-[11px] text-slate-500">Inquiries, Quotes, Careers</p>
            </div>
          </div>
          <span className="text-base font-black text-slate-900 font-mono">
            {stats?.brandDistribution?.hipro || 0}
          </span>
        </div>

        <div
          onClick={() => setSelectedBrand("hbs")}
          className={`cursor-pointer bg-white border p-4 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-between ${
            selectedBrand === "hbs" ? "border-red-500 ring-2 ring-red-500/10 bg-red-50/20" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Hind Build (HiBUILD)</p>
              <p className="text-[11px] text-slate-500">Repair, Waterproofing Leads</p>
            </div>
          </div>
          <span className="text-base font-black text-slate-900 font-mono">
            {stats?.brandDistribution?.hbs || 0}
          </span>
        </div>

        <div
          onClick={() => setSelectedBrand("empanelment")}
          className={`cursor-pointer bg-white border p-4 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-between ${
            selectedBrand === "empanelment" ? "border-amber-500 ring-2 ring-amber-500/10 bg-amber-50/20" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Empanelled Partners</p>
              <p className="text-[11px] text-slate-500">Vendors & Contractors</p>
            </div>
          </div>
          <span className="text-base font-black text-slate-900 font-mono">
            {stats?.brandDistribution?.empanelment || 0}
          </span>
        </div>

        <div
          onClick={() => setSelectedBrand("all")}
          className={`cursor-pointer bg-white border p-4 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-between ${
            selectedBrand === "all" ? "border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/20" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Total Group Contacts</p>
              <p className="text-[11px] text-slate-500">All 3 portals + CSV uploads</p>
            </div>
          </div>
          <span className="text-base font-black text-slate-900 font-mono">
            {stats?.totalContacts || 0}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Campaigns</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalCampaigns || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Created across all channels</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delivered Emails</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats?.totalSent || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Successfully delivered</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600">{stats?.successRate || 100}%</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Transmission health</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Failed / Bounced</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">{stats?.totalFailed || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Failed delivery attempts</p>
        </div>
      </div>

      {/* Quota & SMTP Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Quota Tracker */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hostinger Mailbox Quota Monitor</h3>
                <p className="text-xs text-slate-500">Safe limits to prevent email provider spam flags</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-slate-900 font-mono">{stats?.sentToday || 0}</span>
              <span className="text-xs text-slate-500 font-mono"> / {stats?.dailyLimit || 200} daily</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent > 80 ? "bg-red-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Rate Limit: {stats?.rateLimit || 5} emails/min (Safe Throttle)</span>
              <span>{Math.round(usagePercent)}% Used Today</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>TLS Port 465 SSL Encryption Active</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">Resets daily at 00:00 UTC</span>
          </div>
        </div>

        {/* SMTP Diagnostic Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Hostinger Connection</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500">
              Verify that Hostinger SMTP host, credentials, and mailbox are responding normally.
            </p>

            {smtpStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  smtpStatus.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {smtpStatus.message}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={testConnection}
            disabled={testingSmtp}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingSmtp ? "animate-spin" : ""}`} />
            <span>{testingSmtp ? "Testing SMTP Server..." : "Test Connection Now"}</span>
          </button>
        </div>
      </div>

      {/* Unified Live Mail Dispatch Audit Log */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Recent Mail Dispatches (All Panels &amp; Campaigns)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified live delivery audit covering CRM Quick Mail, Empanelment, AutoMail Direct &amp; Campaigns
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {senderFilterOptions.length > 0 && (
              <select
                value={logSenderFilter}
                onChange={(e) => setLogSenderFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono font-semibold text-slate-700 outline-none focus:border-blue-500"
                title="Filter sent logs by Mailbox or Alias"
              >
                <option value="all">All Mailboxes &amp; Aliases</option>
                {senderFilterOptions.map((opt) => (
                  <option key={opt.email} value={opt.email}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-[11px] font-bold">
              {(["all", "sent", "failed"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setLogStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                    logStatusFilter === st
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {st === "all" ? "All" : st === "sent" ? "Delivered" : "Failed"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/admin/automail/compose"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose Mail</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Subject &amp; Channel</th>
                <th className="py-3 px-4">Sender Mailbox</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(() => {
                const visibleLogs = recentLogs.filter((l: any) =>
                  logStatusFilter === "all"
                    ? true
                    : logStatusFilter === "sent"
                    ? l.status === "sent"
                    : l.status !== "sent"
                );
                if (visibleLogs.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <p className="text-xs font-semibold text-slate-500">
                          No recent email dispatches recorded yet for this filter.
                        </p>
                        <Link
                          href="/admin/automail/compose"
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Compose First Email</span>
                        </Link>
                      </td>
                    </tr>
                  );
                }
                return visibleLogs.map((log: any) => {
                  const isDirect = log.campaign?.template === "direct_crm";
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{log.contactName || "Client"}</p>
                        <p className="text-[11px] font-mono text-slate-500">{log.contactEmail}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">
                          {log.campaign?.subject || log.campaign?.name || "Direct Dispatch"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isDirect
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {isDirect ? "Direct / CRM Quick Mail" : "Campaign Broadcast"}
                          </span>
                          {!isDirect && log.campaignId && (
                            <Link
                              href={`/admin/automail/campaigns/${log.campaignId}`}
                              className="text-[10px] font-semibold text-blue-600 hover:underline"
                            >
                              Monitor →
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {log.campaign?.senderEmail || "info@hindustanprojects.in"}
                      </td>
                      <td className="py-3 px-4">
                        {log.status === "sent" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Delivered
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold"
                            title={log.error || "Delivery failed"}
                          >
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
