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
  const [loading, setLoading] = useState(true);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<any>(null);

  // Sync state
  const [syncingCrm, setSyncingCrm] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/automail/stats?brand=${selectedBrand}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load automail stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedBrand]);

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
        body: JSON.stringify({ syncHiproLeads: true, syncHiproNewsletter: true, syncHbsLeads: true }),
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

      {/* Missing SMTP Credentials Alert */}
      {stats?.settings && !stats.settings.smtpConfigured && !loading && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">Hostinger Mailbox Password Missing!</h3>
              <p className="text-xs text-red-700 mt-0.5">
                Emails send karne ke liye pehle Hostinger email aur password Settings tab me configure karein taaki emails fail na ho.
              </p>
            </div>
          </div>
          <Link
            href="/admin/automail/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all whitespace-nowrap self-start sm:self-auto"
          >
            <span>Configure Hostinger SMTP →</span>
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

      {/* Top Banner / Welcome Action */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3 text-blue-400" />
            <span>Universal Mail Pipeline Active</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            {selectedBrand === "hipro"
              ? "HiPRO Construction Mail Suite"
              : selectedBrand === "hbs"
              ? "Hind Build Solutions Mail Suite"
              : "Global Multi-Brand AutoMail Hub"}
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Send bulk announcements, quotations & updates across all sub-brands with automatic rate-limiting and Hostinger SMTP anti-spam protection.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Link
            href={selectedBrand !== "all" ? `/admin/automail/compose?brand=${selectedBrand}` : "/admin/automail/compose"}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-xs shadow-lg shadow-red-600/25 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>⚡ Compose & Send Email</span>
          </Link>
          <Link
            href="/admin/automail/contacts"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Audience ({totalContacts})</span>
          </Link>
          <button
            onClick={fetchStats}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
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
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900">Audience Check Karo</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Website ke leads ko yahan lane ke liye &ldquo;Sync Leads&rdquo; button dabayein ya Excel spreadsheet upload karein.
            </p>
            <button
              type="button"
              onClick={handleQuickSync}
              disabled={syncingCrm}
              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>{syncingCrm ? "Syncing..." : "Sync Leads Abhi Karo"}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-900">Template Choose Karo</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Compose studio me jakar HiPRO ya Hind Build ka pre-made business template select karein.
            </p>
            <Link
              href="/admin/automail/compose"
              className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>Templates Dekho</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900">&ldquo;Send Email Now&rdquo; Dabao</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Kisko bhejna hai tick karein aur direct Send dabayein. Hostinger SMTP se bina spam hue safely deliver hoga.
            </p>
            <Link
              href="/admin/automail/compose"
              className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Compose Kholo</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Brand Distribution Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          onClick={() => setSelectedBrand("all")}
          className={`cursor-pointer bg-white border p-4 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-between ${
            selectedBrand === "all" ? "border-amber-500 ring-2 ring-amber-500/10 bg-amber-50/20" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Total Group Contacts</p>
              <p className="text-[11px] text-slate-500">All brands + CSV uploads</p>
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
    </div>
  );
}
