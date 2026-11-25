"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Inbox,
  Users,
  Building2,
  HardHat,
  Briefcase,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Activity,
  RefreshCw,
  FolderOpen,
  FileText,
  KeyRound,
  ChevronRight,
  ExternalLink,
  Flame,
  Search,
  X,
  Clock,
  ArrowUpRight,
  BarChart2,
  TrendingUp,
  PieChart,
  Layers,
  Settings,
  CheckCircle2,
  Database,
  ArrowDownUp,
  Server,
  Radio,
  Cpu,
  HardDrive,
} from "lucide-react";
import { getAdminCache, setAdminCache } from "@/lib/adminCache";

interface ExecutiveData {
  executive: {
    totalInquiries: number;
    pendingActions: number;
    activePortalsCount: number;
    systemHealth: string;
    monthlyMetrics?: any[];
  };
  hipro: {
    projects: { total: number; active: number; featured: number };
    services: { total: number; active: number };
    quotes: { total: number; pending: number; approved: number };
    contacts: { total: number; new: number; replied: number };
    blogs: { total: number; published: number };
    careers: { total: number; new: number };
    velocity?: any;
  };
  hbs: {
    leads: { total: number; new: number; converted: number };
    services: { total: number };
    projects: { total: number };
  };
  vendorHub: {
    applications: { total: number; submitted: number; approved: number };
    tenders: { total: number; active: number };
    gatePasses: { total: number; today: number };
  };
  automail: {
    campaigns: number;
    dispatchesToday: number;
    connectedCount?: number;
    mailboxes?: Array<{
      id: string;
      name: string;
      email: string;
      brand: string;
      brandName?: string;
      status: string;
      smtpPort?: number;
      smtpHost?: string;
      deliveryMethod?: string;
      description?: string;
      isDefault?: boolean;
    }>;
  };
  recentQuotes: any[];
  recentContacts: any[];
  recentHbsLeads: any[];
  recentVendorApps: any[];
  recentApplications: any[];
}

export default function MasterCompanyDashboard() {
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartTimeRange, setChartTimeRange] = useState<"30d" | "90d" | "6m" | "ytd">("6m");
  const [activeHoverMonth, setActiveHoverMonth] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Live Digital Clock Ticker
  useEffect(() => {
    setCurrentTime(new Date());
    setLastSyncedTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async (force = false) => {
    if (isFetchingRef.current && !force) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;

    setData((currentData) => {
      if (force || !currentData) {
        setLoading(true);
      }
      return currentData;
    });
    setError("");

    try {
      const res = await fetch("/api/dashboard", {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Your session has expired. Redirecting to login...");
          window.location.href = "/admin-login";
          return;
        }
        setError("Failed to load company dashboard data from server.");
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setAdminCache("admin:master_dashboard", json.data);
        setLastSyncedTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      } else {
        setError(json.error || "Invalid response from server.");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Network connection issue. Please check server.");
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const cached = getAdminCache<ExecutiveData>("admin:master_dashboard");
    if (cached) {
      setData(cached);
      setLoading(false);
      fetchData(false);
    } else {
      fetchData(true);
    }

    // 30s background real-time telemetry auto-polling
    const autoSyncTimer = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => {
      clearInterval(autoSyncTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Executive Time-of-Day Greeting
  const getGreeting = () => {
    if (!currentTime) return "Executive Board 👋";
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 12) return "Good morning, Executive Board 👋";
    if (hour >= 12 && hour < 17) return "Good afternoon, Executive Board 👋";
    if (hour >= 17 && hour < 22) return "Good evening, Executive Board 👋";
    return "Welcome back, Executive Board 👋";
  };

  const formattedDate = currentTime
    ? currentTime.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";

  // Dynamic monthly velocity data based on real portal metrics
  const monthlyMetrics = useMemo(() => {
    if (data?.executive?.monthlyMetrics && Array.isArray(data.executive.monthlyMetrics)) {
      return data.executive.monthlyMetrics;
    }
    const now = new Date();
    const fallback = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      fallback.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        year: d.getFullYear(),
        hipro: 0,
        hbs: 0,
        vendor: 0,
        totalInbound: 0,
        converted: 0,
      });
    }
    return fallback;
  }, [data?.executive?.monthlyMetrics]);

  // Real-time consolidated activity feed across all 3 group portals
  const recentActivityFeed = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      portal: string;
      portalColor: string;
      desc: string;
      time: string;
      dateObj: Date;
      iconType: "quote" | "lead" | "vendor" | "contact" | "job";
    }> = [];

    // Real Quotes (HiPRO Civil)
    (data?.recentQuotes || []).forEach((q: any) => {
      list.push({
        id: `quote-${q.id}`,
        title: `Turnkey Quote: ${q.name || "Customer"}`,
        portal: "HiPRO Civil",
        portalColor: "bg-blue-50 text-blue-700",
        desc: `${q.projectType || "Civil Works"}${q.budget ? ` · Budget: ${q.budget}` : ""}`,
        time: q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent",
        dateObj: new Date(q.createdAt || 0),
        iconType: "quote",
      });
    });

    // Real HBS Leads (Hind Building Solutions)
    (data?.recentHbsLeads || []).forEach((l: any) => {
      list.push({
        id: `hbs-${l.id}`,
        title: `Waterproofing Lead: ${l.name || "Customer"}`,
        portal: "Hind Building",
        portalColor: "bg-orange-50 text-orange-700",
        desc: `${l.selectedService || "Repair/Inspection"}${l.phone ? ` · Phone: ${l.phone}` : ""}`,
        time: l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent",
        dateObj: new Date(l.createdAt || 0),
        iconType: "lead",
      });
    });

    // Real Vendor Applications
    (data?.recentVendorApps || []).forEach((v: any) => {
      list.push({
        id: `vendor-${v.id}`,
        title: `Contractor KYC: ${v.companyName || "Vendor"}`,
        portal: "Vendor Hub",
        portalColor: "bg-amber-50 text-amber-700",
        desc: `${v.category || "Civil Works"}${v.tier ? ` · Tier: ${v.tier}` : ""}`,
        time: v.submittedAt ? new Date(v.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent",
        dateObj: new Date(v.submittedAt || 0),
        iconType: "vendor",
      });
    });

    // Real Contact Inquiries
    (data?.recentContacts || []).forEach((c: any) => {
      list.push({
        id: `contact-${c.id}`,
        title: `Direct Inquiry: ${c.name || "Inquirer"}`,
        portal: "HiPRO Civil",
        portalColor: "bg-blue-50 text-blue-700",
        desc: `${c.service || "Consultation"}${c.phone ? ` · Phone: ${c.phone}` : ""}`,
        time: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent",
        dateObj: new Date(c.createdAt || 0),
        iconType: "contact",
      });
    });

    // Real Job Applications
    (data?.recentApplications || []).forEach((a: any) => {
      list.push({
        id: `job-${a.id}`,
        title: `Job Application: ${a.name || "Applicant"}`,
        portal: "Careers",
        portalColor: "bg-purple-50 text-purple-700",
        desc: `Role: ${a.role || "Civil Engineer"}${a.experience ? ` · Exp: ${a.experience}` : ""}`,
        time: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent",
        dateObj: new Date(a.createdAt || 0),
        iconType: "job",
      });
    });

    return list.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).slice(0, 5);
  }, [data]);

  // Dynamic Chart Scale & Paths for Master HQ Area Chart
  const maxInboundVal = useMemo(() => {
    const highest = Math.max(
      ...monthlyMetrics.map((m: any) => Math.max(m.hipro || 0, m.hbs || 0, m.vendor || 0)),
      0
    );
    return highest > 0 ? highest : 5;
  }, [monthlyMetrics]);

  const hiproPoints = useMemo(() => {
    return monthlyMetrics.map((m: any, i: number) => ({
      x: 60 + i * 96,
      y: 180 - Math.round(((m.hipro || 0) / maxInboundVal) * 140),
    }));
  }, [monthlyMetrics, maxInboundVal]);

  const hbsPoints = useMemo(() => {
    return monthlyMetrics.map((m: any, i: number) => ({
      x: 60 + i * 96,
      y: 180 - Math.round(((m.hbs || 0) / maxInboundVal) * 140),
    }));
  }, [monthlyMetrics, maxInboundVal]);

  const vendorPoints = useMemo(() => {
    return monthlyMetrics.map((m: any, i: number) => ({
      x: 60 + i * 96,
      y: 180 - Math.round(((m.vendor || 0) / maxInboundVal) * 140),
    }));
  }, [monthlyMetrics, maxInboundVal]);

  const hiproPath = useMemo(() => {
    const line = hiproPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = `${line} L ${hiproPoints[hiproPoints.length - 1]?.x || 540} 180 L 60 180 Z`;
    return { line, area };
  }, [hiproPoints]);

  const hbsPath = useMemo(() => {
    const line = hbsPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = `${line} L ${hbsPoints[hbsPoints.length - 1]?.x || 540} 180 L 60 180 Z`;
    return { line, area };
  }, [hbsPoints]);

  const vendorPath = useMemo(() => {
    const line = vendorPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = `${line} L ${vendorPoints[vendorPoints.length - 1]?.x || 540} 180 L 60 180 Z`;
    return { line, area };
  }, [vendorPoints]);

  // Donut Chart Distribution
  const portalSplit = useMemo(() => {
    const hiproCount = (data?.hipro?.quotes?.total || 0) + (data?.hipro?.contacts?.total || 0);
    const hbsCount = data?.hbs?.leads?.total || 0;
    const vendorCount = data?.vendorHub?.applications?.total || 0;
    const total = hiproCount + hbsCount + vendorCount;

    if (total === 0) {
      return {
        hiproPct: 100,
        hbsPct: 0,
        vendorPct: 0,
        hiproLen: 376.99,
        hbsLen: 0,
        vendorLen: 0,
        hbsOffset: 0,
        vendorOffset: 0,
      };
    }

    const hiproPct = Math.round((hiproCount / total) * 100);
    const hbsPct = Math.round((hbsCount / total) * 100);
    const vendorPct = Math.max(0, 100 - hiproPct - hbsPct);

    const circumference = 376.99;
    const hiproLen = (hiproPct / 100) * circumference;
    const hbsLen = (hbsPct / 100) * circumference;
    const vendorLen = (vendorPct / 100) * circumference;

    return {
      hiproPct,
      hbsPct,
      vendorPct,
      hiproLen,
      hbsLen,
      vendorLen,
      hbsOffset: -hiproLen,
      vendorOffset: -(hiproLen + hbsLen),
    };
  }, [data]);

  return (
    <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-8 pb-20 px-4 sm:px-6">
      {/* ── 1. CORPORATE EXECUTIVE WELCOME BANNER (Apple Cupertino Glass) ── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_30px_rgba(15,23,42,0.03)] p-6 md:p-8 relative overflow-hidden">
        {/* Ambient Gradient Blooms */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left: Brand & Executive Greeting */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-200/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="Hindustan Projects Group"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-construction-navy font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Executive Command Cockpit
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  3 Portals Online
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display mt-1">
                {getGreeting()}
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                Central holding company governance for Hindustan Projects Group · Cross-brand civil portfolio, waterproofing solutions & supply chain procurement.
              </p>
            </div>
          </div>

          {/* Right: Unified Apple Glass Clock & Sync Widget */}
          <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all shrink-0">
            {/* Clock Icon & Live Indicator */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ring-1 ring-blue-100/60">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-900 tracking-tight">
                    {formattedTime || "00:00:00"} <span className="text-[10px] text-slate-400 font-normal">IST</span>
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 font-sans font-medium mt-0.5">
                  {formattedDate || "Today"}
                </p>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="h-7 w-px bg-slate-200/80" />

            {/* Sync Action Button */}
            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-all cursor-pointer group"
              title="Refresh Live Metrics"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500 group-hover:text-blue-600"}`} />
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[11px] font-bold leading-tight text-slate-800">
                  {loading ? "Syncing..." : "Sync"}
                </span>
                <span className="block text-[9px] text-slate-400 font-mono">
                  {lastSyncedTime ? `Synced ${lastSyncedTime}` : "Real-time"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* ── Sub-Bar: Central Operations Quick Access ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100/80">
          <Link
            href="/admin/backup"
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-blue-200 hover:shadow-xs transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Database Backup</p>
              <p className="text-[10px] text-slate-400 font-mono">Vault & Recovery</p>
            </div>
          </Link>

          <Link
            href="/admin/data-tools"
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-emerald-200 hover:shadow-xs transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ArrowDownUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Import & Export</p>
              <p className="text-[10px] text-slate-400 font-mono">CSV / JSON Studio</p>
            </div>
          </Link>

          <Link
            href="/admin/api-keys"
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-amber-200 hover:shadow-xs transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">API Keys & Secrets</p>
              <p className="text-[10px] text-slate-400 font-mono">Key Rotation</p>
            </div>
          </Link>

          <Link
            href="/admin/security"
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-purple-200 hover:shadow-xs transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Security & 2FA</p>
              <p className="text-[10px] text-slate-400 font-mono">TOTP Vault</p>
            </div>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-600 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button onClick={() => fetchData(true)} className="underline hover:text-red-800">Retry</button>
        </div>
      )}

      {/* ── 2. EXECUTIVE AGGREGATED BENTO GRID (Apple Cupertino Style) ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Inquiries */}
        <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Business Inquiries</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100 group-hover:scale-105 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {loading && !data ? "..." : data?.executive.totalInquiries ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              <span className="font-bold text-amber-600">{data?.executive.pendingActions ?? 0}</span>
              <span>pending review across portals</span>
            </p>
          </div>
        </div>

        {/* Procurement & Supply Chain */}
        <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Vendor Network & KYC</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {loading && !data ? "..." : data?.vendorHub.applications.total ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-emerald-600">{data?.vendorHub.applications.approved ?? 0} verified</span>
              <span className="text-slate-300">·</span>
              <span className="font-bold text-blue-600">{data?.vendorHub.tenders.active ?? 0} live tenders</span>
            </p>
          </div>
        </div>

        {/* Civil & Infrastructure Assets */}
        <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Portfolio & Catalog</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-100 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {loading && !data ? "..." : (data?.hipro.projects.total ?? 0) + (data?.hbs.projects.total ?? 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-1.5">
              <span>{data?.hipro.services.active ?? 0} HiPRO services</span>
              <span className="text-slate-300">·</span>
              <span>{data?.hbs.services.total ?? 0} HBS specs</span>
            </p>
          </div>
        </div>

        {/* Security & System Operations */}
        <div
          onClick={() => setIsTelemetryOpen(true)}
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          title="Click to view live server health & telemetry"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Master Governance</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <p className="text-xl font-black text-emerald-700 font-display">Operational</p>
              <span className="text-[10px] font-bold uppercase bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono border border-emerald-200/60">
                2FA Active
              </span>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs text-slate-500">
              <span>{data?.automail.dispatchesToday ?? 0} emails dispatched</span>
              <span className="text-[10px] font-mono text-blue-600 font-bold group-hover:underline">Health →</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. THE 3 CORE DIGITAL WEB PROPERTIES (Apple Showcase Bento) ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display">
              Managed Web Properties & Brand Gateways
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any of the 3 corporate digital portals to access its isolated CMS, catalog, leads, or public interface.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── CARD 1: HiPRO Corporate ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
            <div className="h-1.5 bg-gradient-to-r from-[#0F2C59] via-blue-600 to-indigo-500" />
            <div className="p-6 md:p-7">
              <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-200/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.jpg" alt="HiPRO" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight font-display truncate">
                        HiPRO Corporate
                      </h3>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Portal Online" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">hindustanprojects.in</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 rounded-full border border-blue-200/80 shrink-0 whitespace-nowrap shadow-3xs">
                  Civil Flagship
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                Core civil engineering, multi-crore infrastructure portfolio, architectural planning, dynamic cost estimation, and careers.
              </p>

              {/* Metrics Ribbon */}
              <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.hipro.projects.total ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Projects</p>
                </div>
                <div>
                  <p className="text-base font-bold text-amber-600">{data?.hipro.quotes.pending ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">New Quotes</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.hipro.blogs.published ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Articles</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/hipro"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0F2C59] hover:bg-slate-900 text-white shadow-xs transition-all"
                >
                  HiPRO Studio →
                </Link>
                <Link
                  href="/admin/quotes"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 shadow-2xs transition-all"
                >
                  Quotes Hub
                </Link>
              </div>
              <a
                href="https://www.hindustanprojects.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/60 shadow-2xs transition-all"
                title="Open Public Site (New Tab)"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* ── CARD 2: Hind Building Solutions (HBS) ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
            <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
            <div className="p-6 md:p-7">
              <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-200/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/hibuild-logo.png" alt="Hind Building Solutions" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight font-display truncate">
                        Hind Building (HBS)
                      </h3>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Portal Online" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">hindbuilding.hindustanprojects.in</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 rounded-full border border-orange-200/80 shrink-0 whitespace-nowrap shadow-3xs">
                  Repair BOQ
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                Specialized waterproofing, concrete retrofitting, structural crack repair, expansion joints, and automated repair BOQ generation.
              </p>

              {/* Metrics Ribbon */}
              <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
                <div>
                  <p className="text-base font-bold text-orange-600">{data?.hbs.leads.new ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">New Leads</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.hbs.services.total ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Services</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.hbs.leads.total ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Total Leads</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/hbs"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all"
                >
                  HBS Studio →
                </Link>
                <Link
                  href="/admin/hbs/leads"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 shadow-2xs transition-all"
                >
                  Repair Leads
                </Link>
              </div>
              <a
                href="https://hindbuilding.hindustanprojects.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-orange-700 bg-white/80 hover:bg-white border border-slate-200/60 shadow-2xs transition-all"
                title="Open HBS Site (New Tab)"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* ── CARD 3: Vendor Empanelment & Procurement Hub ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400" />
            <div className="p-6 md:p-7">
              <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight font-display truncate">
                        Vendor Hub
                      </h3>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Portal Online" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">empanelment.hindustanprojects.in</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 rounded-full border border-amber-200/80 shrink-0 whitespace-nowrap shadow-3xs">
                  Procurement
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                Contractor KYC vetting, CPWD grading (Class A–D), digital Smart PVC cards, live tender bidding, and worker site gate passes.
              </p>

              {/* Metrics Ribbon */}
              <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
                <div>
                  <p className="text-base font-bold text-amber-600">{data?.vendorHub.applications.submitted ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">KYC Queue</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.vendorHub.tenders.active ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Live Tenders</p>
                </div>
                <div>
                  <p className="text-base font-bold text-emerald-600">{data?.vendorHub.applications.approved ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Partners</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/empanelment"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all"
                >
                  Vendor Hub →
                </Link>
                <Link
                  href="/admin/empanelment/applications"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 shadow-2xs transition-all"
                >
                  KYC Pipeline
                </Link>
              </div>
              <a
                href="https://empanelment.hindustanprojects.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-amber-700 bg-white/80 hover:bg-white border border-slate-200/60 shadow-2xs transition-all"
                title="Open Public Portal (New Tab)"
              >
                <span>Live Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. ENTERPRISE HOLDING TOOLS & DATA VAULT (Apple Cupertino Style) ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
              <Database className="w-4 h-4 text-construction-navy" />
              Enterprise Holding Tools & Data Vault
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mission-critical corporate infrastructure: automated database backups, universal CSV/JSON data tools, and cryptographic secrets management.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Database Backup Vault */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
            <div className="p-6">
              <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ring-1 ring-blue-100">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 font-display truncate">
                      Database Backup Vault
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">SQLite / Postgres Snapshots</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/80 shrink-0">
                  Auto 03:00 AM
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                Automated daily snapshot vault with point-in-time state captures and one-click JSON/SQL recovery dump.
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-[11px] font-mono text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Vault Status:</span>
                  <strong className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Healthy
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stored Snapshots:</span>
                  <strong className="text-slate-800">3 Verified Backups</strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Retention: 30 Days</span>
              <Link
                href="/admin/backup"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-blue-600 text-white shadow-xs transition-all"
              >
                <span>Open Vault</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Universal Data Import & Export */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-400" />
            <div className="p-6">
              <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ring-1 ring-emerald-100">
                    <ArrowDownUp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 font-display truncate">
                      Data Import & Export
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">CSV / JSON Studio</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 rounded-full border border-blue-200/80 shrink-0">
                  Universal Sync
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                Extract complete datasets across HiPRO projects, quotes, HBS customer leads, and contractor KYC applications.
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-[11px] font-mono text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Target Datasets:</span>
                  <strong className="text-slate-800">5 Collections</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>File Formats:</span>
                  <strong className="text-slate-800">CSV & JSON Dump</strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Batch Ingestion</span>
              <Link
                href="/admin/data-tools"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-emerald-600 text-white shadow-xs transition-all"
              >
                <span>Launch Studio</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 3: API Keys & Master Secrets */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
            <div className="p-6">
              <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 ring-1 ring-amber-100">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 font-display truncate">
                      API Keys & Secrets Vault
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">Microservice Tokens</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 rounded-full border border-purple-200/80 shrink-0">
                  Cryptographic
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                Manage production gateway keys, sandbox credentials, webhook HMAC secrets, and emergency 2FA break-glass keys.
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-[11px] font-mono text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Armed Secrets:</span>
                  <strong className="text-slate-800">5 Master Tokens</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rotation Policy:</span>
                  <strong className="text-amber-700 font-bold">1-Click Instant</strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Export .env</span>
              <Link
                href="/admin/api-keys"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-amber-600 text-white shadow-xs transition-all"
              >
                <span>Manage Keys</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. EXECUTIVE ANALYTICS & DATA VISUALIZATIONS (APPLE HIG CHARTS) ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-construction-navy" />
              Cross-Brand Analytics & Portfolio Velocity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidated enterprise telemetry, volume velocity, and digital asset distribution across the 3 portals.
            </p>
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 self-start sm:self-auto">
            <button
              onClick={() => setChartTimeRange("30d")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                chartTimeRange === "30d" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setChartTimeRange("90d")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                chartTimeRange === "90d" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setChartTimeRange("6m")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                chartTimeRange === "6m" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setChartTimeRange("ytd")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                chartTimeRange === "ytd" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              YTD 2026
            </button>
          </div>
        </div>

        {/* ── Main Analytics Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── CHART 1: Cross-Brand Inquiries Velocity (Area Chart) ── */}
          <div className="lg:col-span-2 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-display">
                    Cross-Portal Inquiries & Velocity Trend
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Monthly volume intake across HiPRO Civil, HBS Waterproofing, and Vendor KYC.
                  </p>
                </div>

                {/* Legend Chips */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-slate-700 font-semibold">HiPRO Civil</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="text-slate-700 font-semibold">HBS Repair</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-700 font-semibold">Vendor KYC</span>
                  </div>
                </div>
              </div>

              {/* ── Smooth Interactive SVG Area Chart ── */}
              <div className="relative mt-6 h-64 w-full">
                <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="hiproGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="hbsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="vendorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97706" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide Gridlines */}
                  <line x1="40" y1="30" x2="580" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <text x="20" y="34" fontSize="9" fill="#94A3B8" fontFamily="monospace">{maxInboundVal}</text>

                  <line x1="40" y1="80" x2="580" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <text x="20" y="84" fontSize="9" fill="#94A3B8" fontFamily="monospace">{Math.round(maxInboundVal * 0.66)}</text>

                  <line x1="40" y1="130" x2="580" y2="130" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <text x="20" y="134" fontSize="9" fill="#94A3B8" fontFamily="monospace">{Math.round(maxInboundVal * 0.33)}</text>

                  <line x1="40" y1="180" x2="580" y2="180" stroke="#CBD5E1" strokeWidth="1" />
                  <text x="20" y="184" fontSize="9" fill="#94A3B8" fontFamily="monospace">0</text>

                  {/* Area 1: HiPRO (Blue) */}
                  <path d={hiproPath.area} fill="url(#hiproGrad)" />
                  <path d={hiproPath.line} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

                  {/* Area 2: HBS (Orange) */}
                  <path d={hbsPath.area} fill="url(#hbsGrad)" />
                  <path d={hbsPath.line} fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Area 3: Vendor Hub (Amber) */}
                  <path d={vendorPath.area} fill="url(#vendorGrad)" />
                  <path d={vendorPath.line} fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" />

                  {/* Data Points & Month Labels */}
                  {monthlyMetrics.map((item, idx) => {
                    const cx = 60 + idx * 96;
                    const cy = hiproPoints[idx]?.y ?? 180;
                    const isHovered = activeHoverMonth === idx;
                    return (
                      <g
                        key={item.month}
                        className="cursor-pointer group"
                        onMouseEnter={() => setActiveHoverMonth(idx)}
                        onMouseLeave={() => setActiveHoverMonth(null)}
                      >
                        {/* Hover vertical line */}
                        {isHovered && (
                          <line x1={cx} y1="30" x2={cx} y2="180" stroke="#94A3B8" strokeDasharray="2 2" strokeWidth="1" />
                        )}

                        {/* Point circles */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 5 : 3.5}
                          fill="#2563EB"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          className="transition-all"
                        />

                        {/* Month text */}
                        <text
                          x={cx}
                          y="200"
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight={isHovered ? "bold" : "normal"}
                          fill={isHovered ? "#0F172A" : "#64748B"}
                          fontFamily="sans-serif"
                        >
                          {item.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip when hovering over a month */}
                {activeHoverMonth !== null && (
                  <div
                    className="absolute top-2 bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl text-xs font-mono pointer-events-none border border-slate-700 transition-all z-20"
                    style={{ left: `${10 + activeHoverMonth * 16}%` }}
                  >
                    <p className="font-bold text-slate-300 pb-1 border-b border-slate-700">
                      Month of {monthlyMetrics[activeHoverMonth].month}
                    </p>
                    <div className="space-y-1 mt-1.5 text-[11px]">
                      <p className="text-blue-300 flex justify-between gap-4">
                        <span>HiPRO Quotes:</span>
                        <span className="font-bold">{monthlyMetrics[activeHoverMonth].hipro}</span>
                      </p>
                      <p className="text-orange-300 flex justify-between gap-4">
                        <span>HBS Leads:</span>
                        <span className="font-bold">{monthlyMetrics[activeHoverMonth].hbs}</span>
                      </p>
                      <p className="text-amber-300 flex justify-between gap-4">
                        <span>Vendor KYC:</span>
                        <span className="font-bold">{monthlyMetrics[activeHoverMonth].vendor}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance KPI ribbon */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 text-center">
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">MoM Status</p>
                <p className="text-base font-black text-emerald-600 font-display mt-0.5 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Live Sync
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Submissions</p>
                <p className="text-base font-black text-slate-900 font-display mt-0.5">
                  {data?.executive?.totalInquiries ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Pending Action</p>
                <p className="text-base font-black text-blue-600 font-display mt-0.5">
                  {data?.executive?.pendingActions ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* ── CHART 2: Digital Asset Distribution (Apple Donut Chart) ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-display">
                  Digital Asset Portfolio Share
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Business intake allocation across group properties.
                </p>
              </div>

              {/* ── Apple SVG Radial Donut Chart ── */}
              <div className="relative flex items-center justify-center mt-6 h-52">
                <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="18"
                  />

                  {/* Segment 1: HiPRO */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="18"
                    strokeDasharray={`${portalSplit.hiproLen} 376.99`}
                    strokeDashoffset="0"
                    className="transition-all duration-1000 ease-out"
                  />

                  {/* Segment 2: HBS */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth="18"
                    strokeDasharray={`${portalSplit.hbsLen} 376.99`}
                    strokeDashoffset={portalSplit.hbsOffset}
                    className="transition-all duration-1000 ease-out"
                  />

                  {/* Segment 3: Vendor Hub */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="18"
                    strokeDasharray={`${portalSplit.vendorLen} 376.99`}
                    strokeDashoffset={portalSplit.vendorOffset}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Center Core Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 font-display">100%</span>
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Coverage</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-3 mt-4 text-xs font-medium">
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-slate-800 font-bold">HiPRO Corporate</span>
                  </div>
                  <span className="font-mono font-bold text-blue-700">{portalSplit.hiproPct}%</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50/50 border border-orange-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                    <span className="text-slate-800 font-bold">Hind Building (HBS)</span>
                  </div>
                  <span className="font-mono font-bold text-orange-700">{portalSplit.hbsPct}%</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span className="text-slate-800 font-bold">Vendor Hub</span>
                  </div>
                  <span className="font-mono font-bold text-amber-700">{portalSplit.vendorPct}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-center">
              <span className="text-[11px] text-slate-400 font-mono">
                Unified Group Holding Telemetry
              </span>
            </div>
          </div>
        </div>

        {/* ── Sub-Analytics Row: Inbound vs Converted + Operational SLAs ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparative Grouped Bar Chart */}
          <div className="lg:col-span-2 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-display">
                  Monthly Influx vs Converted Contracts
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Comparison between total received inquiries and successfully contracted deliverables.
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-800" />
                  <span className="text-slate-700 font-semibold">Total Inbound</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-slate-700 font-semibold">Contracted</span>
                </div>
              </div>
            </div>

            {/* SVG Grouped Bars */}
            <div className="mt-6 h-52 w-full">
              <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                {/* Horizontal Guide lines */}
                <line x1="30" y1="20" x2="490" y2="20" stroke="#F1F5F9" />
                <line x1="30" y1="65" x2="490" y2="65" stroke="#F1F5F9" />
                <line x1="30" y1="110" x2="490" y2="110" stroke="#F1F5F9" />
                <line x1="30" y1="150" x2="490" y2="150" stroke="#E2E8F0" />

                {monthlyMetrics.slice(1).map((item, idx) => {
                  const xBase = 60 + idx * 95;
                  const maxTotal = Math.max(...monthlyMetrics.map((m: any) => m.totalInbound || 0), 5);
                  const inboundH = item.totalInbound > 0 ? Math.max(8, Math.round((item.totalInbound / maxTotal) * 110)) : 2;
                  const convH = item.converted > 0 ? Math.max(8, Math.round((item.converted / maxTotal) * 110)) : 2;

                  return (
                    <g key={item.month}>
                      {/* Inbound Bar */}
                      <rect
                        x={xBase}
                        y={150 - inboundH}
                        width="22"
                        height={inboundH}
                        rx="5"
                        fill="#0F172A"
                        className="hover:opacity-85 transition-opacity"
                      />
                      {/* Converted Bar */}
                      <rect
                        x={xBase + 26}
                        y={150 - convH}
                        width="22"
                        height={convH}
                        rx="5"
                        fill="#10B981"
                        className="hover:opacity-85 transition-opacity"
                      />
                      {/* Month label */}
                      <text
                        x={xBase + 24}
                        y="170"
                        textAnchor="middle"
                        fontSize="11"
                        fill="#64748B"
                        fontFamily="monospace"
                      >
                        {item.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Holding Operational Health SLAs */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-display">
                  Corporate Governance SLAs
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Operational benchmark compliance metrics.
                </p>
              </div>

              <div className="space-y-4 mt-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Inquiry Response SLA</span>
                    <span className="font-mono text-emerald-600 font-bold">98.6%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "98.6%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Contractor KYC Vetting</span>
                    <span className="font-mono text-blue-600 font-bold">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">2FA Security Compliance</span>
                    <span className="font-mono text-indigo-600 font-bold">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Multi-Portal Uptime</span>
                    <span className="font-mono text-emerald-600 font-bold">99.98%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "99.98%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <Link
                href="/admin/security"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Open Security & 2FA Vault →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. MASTER HQ GOVERNANCE & REAL-TIME ACTIVITY STREAM ── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              Corporate Governance & Real-Time Event Stream
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consolidated telemetry, automated vault actions, and multi-mailbox dispatch status across Hindustan Group.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Live Holding Activity Stream (2 cols) */}
          <div className="lg:col-span-2 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-display">
                Executive Audit & Activity Log
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                Live Polling
              </span>
            </div>

            <div className="divide-y divide-slate-100 space-y-2">
              {recentActivityFeed.length > 0 ? (
                recentActivityFeed.map((item) => (
                  <div key={item.id} className="pt-2.5 flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      {item.iconType === "quote" && <Building2 className="w-4 h-4 text-blue-600" />}
                      {item.iconType === "lead" && <Flame className="w-4 h-4 text-orange-600" />}
                      {item.iconType === "vendor" && <ShieldCheck className="w-4 h-4 text-amber-600" />}
                      {item.iconType === "contact" && <Mail className="w-4 h-4 text-blue-600" />}
                      {item.iconType === "job" && <Briefcase className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 truncate">{item.title}</p>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full shrink-0 ${item.portalColor}`}>
                          {item.portal}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.desc}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  <p className="font-semibold text-slate-600">No recent submissions recorded</p>
                  <p className="mt-1">Incoming turnkey quotes, HBS customer leads, and contractor applications will appear here live.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Multi-Mailbox Operational Radar (1 col) */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-display">
                    Multi-Mailbox Radar
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {data?.automail?.connectedCount ?? (data?.automail?.mailboxes?.length || 2)} Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Dual company mailboxes powering automated corporate dispatches and repair notifications.
              </p>

              {/* Dynamic Connected Mailboxes */}
              <div className="mt-4 space-y-3">
                {(data?.automail?.mailboxes && data.automail.mailboxes.length > 0
                  ? data.automail.mailboxes
                  : [
                      {
                        id: "mb_hp_primary",
                        name: "Hindustan Projects Corporate & HiPRO Civil",
                        email: "info@hindustanprojects.in",
                        brand: "hipro",
                        brandName: "Flagship Civil",
                        status: "active",
                        smtpPort: 465,
                        description: "Turnkey Quotes, Job Applications & Holding Master Notifications",
                      },
                      {
                        id: "mb_hbs_waterproofing",
                        name: "Hind Building Solutions (HBS)",
                        email: "hbs@hindustanprojects.in",
                        brand: "hbs",
                        brandName: "HBS Repairs",
                        status: "active",
                        smtpPort: 465,
                        description: "Waterproofing Inspections, Crack Repair BOQ & Quotes",
                      },
                    ]
                ).map((mb, idx) => {
                  const isHbs = mb.brand === "hbs";
                  const isEmpanelment = mb.brand === "empanelment";
                  const isActive = mb.status === "active";

                  return (
                    <div
                      key={mb.id || mb.email || idx}
                      className={`p-3.5 rounded-2xl border space-y-1 transition-all ${
                        isHbs
                          ? "bg-orange-50/50 border-orange-200/70"
                          : isEmpanelment
                          ? "bg-amber-50/50 border-amber-200/70"
                          : "bg-slate-50 border-slate-200/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                            isHbs
                              ? "text-orange-600"
                              : isEmpanelment
                              ? "text-amber-700"
                              : "text-slate-400"
                          }`}
                        >
                          Mailbox {idx + 1} · {mb.brandName || (isHbs ? "HBS Repairs" : isEmpanelment ? "Procurement" : "Flagship")}
                        </span>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            TLS {mb.smtpPort || 465} Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Standby
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 font-mono break-all">
                        {mb.email}
                      </p>
                      {mb.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {mb.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-5">
              <Link
                href="/admin/automail/settings"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>Manage AutoMail Settings →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. SYSTEM TELEMETRY & HEALTH MODAL (Apple Cupertino Style) ── */}
      {isTelemetryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setIsTelemetryOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-1 ring-emerald-200">
              <Activity className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 font-display">
              Holding HQ System Telemetry & Infrastructure Health
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Live status of microservices, database clusters, and outbound relays for Hindustan Projects Group.
            </p>

            <div className="mt-5 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 font-sans">API Gateway Cluster</p>
                  <p className="text-[11px] text-slate-400">Node.js Express (Port 5000)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  200 OK · 14ms
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 font-sans">Database Storage Engine</p>
                  <p className="text-[11px] text-slate-400">PostgreSQL 16 / Prisma ORM</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Healthy · 14 Tables
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 font-sans">In-Memory Session Cache</p>
                  <p className="text-[11px] text-slate-400">Persistent globalThis cache (120s TTL)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Active · 0ms
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 font-sans">Two-Factor Authentication</p>
                  <p className="text-[11px] text-slate-400">RFC 6238 TOTP Google Authenticator</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Enforced
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 font-sans">Corporate Mail Relays</p>
                  <p className="text-[11px] text-slate-400">
                    {data?.automail?.mailboxes && data.automail.mailboxes.length > 0
                      ? data.automail.mailboxes.map((m) => m.email.split("@")[0] + "@").join(" & ") + " (" + (data.automail.mailboxes[0].deliveryMethod === "hostinger_api" ? "Hostinger API" : "Hostinger SMTP") + ")"
                      : "info@ & hbs@ (Hostinger SMTP)"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {data?.automail?.connectedCount ?? (data?.automail?.mailboxes?.length || 2)} Armed
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setIsTelemetryOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
