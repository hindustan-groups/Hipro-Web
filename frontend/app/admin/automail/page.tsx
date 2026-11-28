"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Inbox,
  Settings,
  Sliders,
} from "lucide-react";

export default function AutoMailDashboard() {
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [routingRules, setRoutingRules] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [togglingTrigger, setTogglingTrigger] = useState<string | null>(null);

  // Sync & Filter state
  const [syncingCrm, setSyncingCrm] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [logStatusFilter, setLogStatusFilter] = useState<"all" | "sent" | "failed">("all");
  const [logSenderFilter, setLogSenderFilter] = useState<string>("all");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const senderParam = logSenderFilter !== "all" ? `&senderEmail=${encodeURIComponent(logSenderFilter)}` : "";
      const [statsRes, logsRes, routingRes] = await Promise.all([
        fetch(`/api/automail/stats?brand=${selectedBrand}`),
        fetch(`/api/automail/logs?brand=${selectedBrand}&limit=25${senderParam}`),
        fetch("/api/automail/routing"),
      ]);
      const [data, logsData, routingData] = await Promise.all([
        statsRes.json(),
        logsRes.json(),
        routingRes.json(),
      ]);
      if (data.success) setStats(data.stats);
      if (logsData.success && Array.isArray(logsData.logs)) setRecentLogs(logsData.logs);
      if (routingData.success) {
        if (Array.isArray(routingData.mailboxes)) setMailboxes(routingData.mailboxes);
        if (routingData.routing) setRoutingRules(routingData.routing);
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

  const senderFilterOptions = useMemo(() => {
    const opts: Array<{ email: string; label: string }> = [];
    for (const mb of mailboxes) {
      opts.push({ email: mb.email.toLowerCase(), label: `${mb.email} (Primary)` });
      for (const alias of mb.aliases || []) {
        opts.push({ email: alias.toLowerCase(), label: `${alias} (Alias)` });
      }
    }
    return opts;
  }, [mailboxes]);

  const portalSummaries = useMemo(() => {
    const activeBoxes = mailboxes.filter((m) => m.status === "active");
    const defaultBox = activeBoxes.find((m) => m.isDefault) || activeBoxes[0] || mailboxes[0];

    const resolvePortalSender = (brandKey: string, triggerKeys: string[], fallbackAlias: string) => {
      for (const tk of triggerKeys) {
        const rule = routingRules[tk];
        if (rule?.senderAlias) return rule.senderAlias;
        const mb = activeBoxes.find((m) => m.id === rule?.mailboxId);
        if (mb && mb.brand === brandKey) return mb.email;
      }
      const brandBox = activeBoxes.find((m) => m.brand === brandKey);
      if (brandBox) return brandBox.email;
      const aliasMatch = activeBoxes
        .flatMap((m) => m.aliases || [])
        .find((a) => a.toLowerCase() === fallbackAlias.toLowerCase());
      return aliasMatch || defaultBox?.email || fallbackAlias;
    };

    const countActiveRoutes = (keys: string[]) =>
      keys.filter((k) => routingRules[k]?.active).length;

    return [
      {
        id: "hipro",
        title: "Portal 1: HiPRO Civil",
        subtitle: "Quotes, Cost Estimator, Contact & Careers",
        sender: resolvePortalSender("hipro", ["quote_requests", "contact_inquiries", "job_applications"], "info@hindustanprojects.in"),
        contacts: stats?.brandDistribution?.hipro || 0,
        activeRoutes: countActiveRoutes(["quote_requests", "contact_inquiries", "job_applications"]),
        totalRoutes: 3,
        icon: Building2,
        accentBorder: "border-blue-200 hover:border-blue-400",
        iconBg: "bg-blue-50 text-blue-600 border-blue-100",
        pillBg: "bg-blue-50 text-blue-700 border-blue-200",
      },
      {
        id: "hbs",
        title: "Portal 2: Hind Build (HBS)",
        subtitle: "Waterproofing, Crack Repair & AMC",
        sender: resolvePortalSender("hbs", ["hbs_leads"], "hindbuild@hindustanprojects.in"),
        contacts: stats?.brandDistribution?.hbs || 0,
        activeRoutes: countActiveRoutes(["hbs_leads"]),
        totalRoutes: 1,
        icon: Hammer,
        accentBorder: "border-red-200 hover:border-red-400",
        iconBg: "bg-red-50 text-red-600 border-red-100",
        pillBg: "bg-red-50 text-red-700 border-red-200",
      },
      {
        id: "empanelment",
        title: "Portal 3: Vendor Empanelment",
        subtitle: "KYC Approvals, Tenders & Gate Passes",
        sender: resolvePortalSender("empanelment", ["vendor_kyc_approvals", "tenders_support", "smart_pvc_cards", "site_gate_passes"], "empanel@hindustanprojects.in"),
        contacts: stats?.brandDistribution?.empanelment || 0,
        activeRoutes: countActiveRoutes(["vendor_kyc_approvals", "tenders_support", "smart_pvc_cards", "site_gate_passes"]),
        totalRoutes: 4,
        icon: ShieldCheck,
        accentBorder: "border-amber-200 hover:border-amber-400",
        iconBg: "bg-amber-50 text-amber-700 border-amber-100",
        pillBg: "bg-amber-50 text-amber-800 border-amber-200",
      },
    ];
  }, [mailboxes, routingRules, stats]);

  const toggleAutomationRule = async (triggerKey: string) => {
    const existing = routingRules[triggerKey];
    if (!existing) return;
    setTogglingTrigger(triggerKey);
    const updatedRouting = {
      ...routingRules,
      [triggerKey]: { ...existing, active: !existing.active },
    };
    setRoutingRules(updatedRouting);
    try {
      const res = await fetch("/api/automail/routing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routing: updatedRouting }),
      });
      const data = await res.json();
      if (!data.success) {
        setRoutingRules(routingRules);
        setSyncToast("Failed to update automation rule");
      }
    } catch {
      setRoutingRules(routingRules);
      setSyncToast("Network error updating automation rule");
    } finally {
      setTogglingTrigger(null);
    }
  };

  const testConnection = async () => {
    setTestingSmtp(true);
    setSmtpStatus(null);
    try {
      const res = await fetch("/api/automail/test-connection");
      const data = await res.json();
      setSmtpStatus(data);
    } catch {
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
  const usagePercent = Math.min((((stats?.sentToday || 0) / (stats?.dailyLimit || 200)) * 100), 100);
  const totalAliases = mailboxes.reduce((acc, m) => acc + (Array.isArray(m.aliases) ? m.aliases.length : 0), 0);

  return (
    <div className="space-y-6">
      <AutoMailNav activeBrand={selectedBrand} onBrandChange={setSelectedBrand} />

      {syncToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{syncToast}</span>
          <button onClick={() => setSyncToast(null)} className="text-emerald-500 hover:text-emerald-800">✕</button>
        </div>
      )}

      {stats?.settings && !stats.settings.smtpConfigured && !loading && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">Hostinger Mailbox Credentials Needed!</h3>
              <p className="text-xs text-red-700 mt-0.5">
                Mail deliver karne ke liye pehle Mailboxes &amp; Control me Hostinger password ya Mail API token save karein.
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

      {totalContacts === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Audience list khali hai (0 Contacts)</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Website ke inquiries, quotes, vendors aur newsletter subscribers ko 1-click me sync karein.
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

      {/* 1. EXECUTIVE HERO COMMAND BANNER */}
      <div className="relative z-0 overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-[#0B1528] to-slate-950 border border-white/15 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute -top-24 -right-16 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Unified Mail &amp; Automation Hub</span>
            <span className="text-white/40">•</span>
            <span className="text-white/90">
              {selectedBrand === "hipro"
                ? "HiPRO Scope"
                : selectedBrand === "hbs"
                ? "Hind Build Scope"
                : selectedBrand === "empanelment"
                ? "Empanelment Scope"
                : "All 3 Portals"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {selectedBrand === "hipro"
              ? "HiPRO Construction Mail Suite"
              : selectedBrand === "hbs"
              ? "Hind Build Solutions Mail Suite"
              : selectedBrand === "empanelment"
              ? "Vendor Empanelment Mail Suite"
              : "Hindustan Group Mail Command"}
          </h2>

          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-300 font-medium">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              {mailboxes.filter((m) => m.status === "active").length} Active Mailbox(es)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              {totalAliases} Configured Alias(es)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              {totalContacts} Synced Contacts
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Link
            href={selectedBrand !== "all" ? `/admin/automail/compose?brand=${selectedBrand}` : "/admin/automail/compose"}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Compose &amp; AI Draft</span>
          </Link>
          <Link
            href="/admin/automail/inbox"
            className="inline-flex items-center gap-2 px-4 py-3 bg-white/15 hover:bg-white/20 border border-white/25 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-xl transition-all"
          >
            <Inbox className="w-4 h-4 text-emerald-300" />
            <span>Open Inbox</span>
          </Link>
          <Link
            href="/admin/automail/settings"
            className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-xl transition-all"
          >
            <Settings className="w-4 h-4 text-blue-300" />
            <span>Mailboxes &amp; Aliases</span>
          </Link>
          <button
            onClick={fetchStats}
            className="p-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-white/90 hover:text-white transition-all"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. 3-PORTAL ARCHITECTURE & ALIAS MAP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              3-Portal Mail &amp; Alias Routing Map (&ldquo;Konsa Portal Kis Mail Se Chalta Hai&rdquo;)
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any portal card to filter dashboard metrics &amp; logs, or jump directly to Compose.
            </p>
          </div>
          {selectedBrand !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedBrand("all")}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Show All Portals ({totalContacts})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portalSummaries.map((portal) => {
            const Icon = portal.icon;
            const isActive = selectedBrand === portal.id;
            return (
              <div
                key={portal.id}
                onClick={() => setSelectedBrand(isActive ? "all" : portal.id)}
                className={`cursor-pointer bg-white border rounded-2xl p-5 transition-all shadow-2xs space-y-3.5 ${
                  isActive ? "ring-2 ring-blue-500/25 border-blue-500" : portal.accentBorder
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${portal.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{portal.title}</h4>
                      <p className="text-[11px] text-slate-500">{portal.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-slate-900 font-mono">{portal.contacts}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-800 truncate">{portal.sender}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${portal.pillBg}`}>
                    {portal.activeRoutes}/{portal.totalRoutes} Auto
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
                  <Link
                    href={`/admin/automail/compose?brand=${portal.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Compose {portal.id.toUpperCase()}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link
                    href={`/admin/automail/contacts?brand=${portal.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    Audience ({portal.contacts})
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delivered Emails</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats?.totalSent || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Successfully delivered</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{stats?.successRate ?? 100}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Transmission health</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Campaigns</span>
            <Send className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalCampaigns || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Broadcasts &amp; direct logs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Failed / Bounced</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-600">{stats?.totalFailed || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Delivery errors</p>
        </div>
      </div>

      {/* 4. AUTOMATION ENGINE & HOSTINGER HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automation Rules Quick Controls */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AutoMail Automation Engine</h3>
                <p className="text-xs text-slate-500">Live website event triggers &amp; automatic alias routing</p>
              </div>
            </div>
            <Link href="/admin/automail/settings" className="text-xs font-bold text-blue-600 hover:underline">
              Full Control Matrix →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["quote_requests", "hbs_leads", "vendor_kyc_approvals", "tenders_support"].map((key) => {
              const rule = routingRules[key];
              if (!rule) return null;
              const mb = mailboxes.find((m) => m.id === rule.mailboxId);
              const effectiveEmail = rule.senderAlias || mb?.email || "info@hindustanprojects.in";
              return (
                <div
                  key={key}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{rule.name}</p>
                    <p className="text-[10px] font-mono text-blue-700 truncate mt-0.5">From: {effectiveEmail}</p>
                  </div>
                  <button
                    type="button"
                    disabled={togglingTrigger === key}
                    onClick={() => toggleAutomationRule(key)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all shrink-0 ${
                      rule.active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-200 text-slate-600 border-slate-300"
                    }`}
                  >
                    {rule.active ? "Auto ON" : "Paused"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quota & Connection Diagnostic */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Quota &amp; Connection</h3>
              </div>
              <span className="text-xs font-black font-mono text-slate-900">
                {stats?.sentToday || 0} / {stats?.dailyLimit || 200}
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent > 80 ? "bg-red-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>{stats?.rateLimit || 15}/min safe limit</span>
              <span>{Math.round(usagePercent)}% used today</span>
            </div>

            {smtpStatus && (
              <div
                className={`p-2.5 rounded-xl text-[11px] font-semibold ${
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingSmtp ? "animate-spin" : ""}`} />
            <span>{testingSmtp ? "Testing Hostinger..." : "Test Hostinger Connection"}</span>
          </button>
        </div>
      </div>

      {/* 5. UNIFIED LIVE MAIL DISPATCH AUDIT LOG */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Recent Mail Dispatches (All Panels &amp; Campaigns)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified live delivery audit covering Inbox Replies, CRM Quick Mail, Empanelment &amp; Campaigns
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
                <th className="py-3 px-4">Sender Mailbox / Alias</th>
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
                            {isDirect ? "Direct / Reply" : "Campaign Broadcast"}
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
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
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
