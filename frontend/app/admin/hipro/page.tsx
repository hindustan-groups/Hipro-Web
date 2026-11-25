"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  FolderOpen,
  HardHat,
  FileText,
  Mail,
  BookOpen,
  Star,
  Users,
  Briefcase,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Clock,
  Sparkles,
  BarChart2,
  TrendingUp,
  Layers,
  Activity,
  ArrowUpRight,
  Plus,
  Calculator,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { getAdminCache, setAdminCache } from "@/lib/adminCache";
import QuickMailModal, { type QuickMailRecipient } from "@/components/admin/QuickMailModal";

export default function HiproControlCenterPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");
  const [activeHoverMonth, setActiveHoverMonth] = useState<number | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<"quotes" | "contacts" | "projects" | "services">("quotes");
  const [mailRecipient, setMailRecipient] = useState<QuickMailRecipient | null>(null);

  const isFetchingRef = useRef(false);

  // Live Digital Clock Ticker
  useEffect(() => {
    setCurrentTime(new Date());
    setLastSyncedTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async (showLoading = true) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setAdminCache("admin:master_dashboard", json.data);
        setLastSyncedTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      } else {
        setError(json.error || "Failed to load HiPRO metrics");
      }
    } catch {
      setError("Network issue while connecting to backend.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const cached = getAdminCache<any>("admin:master_dashboard");
    if (cached) {
      setData(cached);
      setLoading(false);
      loadData(false);
    } else {
      loadData(true);
    }
  }, [loadData]);

  // Executive Time-of-Day Greeting
  const getGreeting = () => {
    if (!currentTime) return "Civil Operations Board 👋";
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 12) return "Good morning, Civil Operations Board 👋";
    if (hour >= 12 && hour < 17) return "Good afternoon, Civil Operations Board 👋";
    if (hour >= 17 && hour < 22) return "Good evening, Civil Operations Board 👋";
    return "Welcome back, Civil Operations Board 👋";
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

  const hiproMetrics = useMemo(() => {
    return (
      data?.hipro || {
        projects: { total: 0, active: 0, featured: 0 },
        services: { total: 0, active: 0 },
        quotes: { total: 0, pending: 0, approved: 0 },
        contacts: { total: 0, new: 0, replied: 0 },
        blogs: { total: 0, published: 0 },
        careers: { total: 0, new: 0, openJobs: 0 },
        testimonials: { total: 0 },
        team: { total: 0 },
        hero: { total: 0 },
        stats: { total: 0 },
        guarantees: { total: 0 },
        subscribers: { total: 0 },
      }
    );
  }, [data]);

  const recentQuotes = useMemo(() => data?.recentQuotes || [], [data]);
  const recentContacts = useMemo(() => data?.recentContacts || [], [data]);
  const recentProjects = useMemo(() => data?.recentProjects || [], [data]);
  const recentServices = useMemo(() => data?.recentServices || [], [data]);

  // Monthly Velocity Data for Civil Pipeline (Dynamically Grounded in PostgreSQL)
  const monthlyData = useMemo(() => {
    if (hiproMetrics.velocity?.months && Array.isArray(hiproMetrics.velocity.months)) {
      return hiproMetrics.velocity.months;
    }
    // Fallback: Generate empty 6-month calendar baseline with 0 values
    const now = new Date();
    const fallbackMonths = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      fallbackMonths.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        year: d.getFullYear(),
        quotes: 0,
        contacts: 0,
        label: `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}${i === 0 ? " (Current)" : ""}`,
      });
    }
    return fallbackMonths;
  }, [hiproMetrics.velocity?.months]);

  const maxVal = useMemo(() => {
    const highest = Math.max(...monthlyData.map((d: any) => (d.quotes || 0) + (d.contacts || 0)), 0);
    return highest > 0 ? highest : 5;
  }, [monthlyData]);

  return (
    <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-8 pb-16">
      {/* ── 1. Top Civil Executive Command Banner ─────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.03)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Brand & Greeting */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-200/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="HiPRO Corporate"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-all shadow-2xs group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>← Back to Master HQ</span>
                </Link>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-200/80 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Flagship Civil Portal
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase font-mono border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  hindustanprojects.in Live
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display mt-2">
                {getGreeting()}
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
                Executive performance metrics, turnkey quotation pipeline & civil portfolio status.
              </p>
            </div>
          </div>

          {/* Clock & Action Controls */}
          <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto">
            {/* Live IST Digital Clock */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-100/70 border border-slate-200/80 text-xs shadow-2xs">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="font-mono font-bold text-slate-900 text-xs leading-none">
                  {formattedTime || "00:00:00 IST"}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-none">{formattedDate}</p>
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span>{loading ? "Refreshing..." : "Sync"}</span>
            </button>

            {/* Live Website */}
            <a
              href="https://www.hindustanprojects.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0F2C59] hover:bg-blue-900 shadow-sm transition-all"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
            </a>
          </div>
        </div>

        {/* ── Direct Quick Actions Pill Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100/80">
          <Link
            href="/admin/projects"
            className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-blue-200 hover:shadow-xs transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Manage Projects</p>
              <p className="text-[10px] text-slate-400 font-mono">Portfolio Catalog</p>
            </div>
          </Link>

          <Link
            href="/admin/quotes"
            className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-emerald-200 hover:shadow-xs transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Quotes Pipeline</p>
              <p className="text-[10px] text-slate-400 font-mono">Review Estimates</p>
            </div>
          </Link>

          <Link
            href="/admin/blogs"
            className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-purple-200 hover:shadow-xs transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Blog Insights</p>
              <p className="text-[10px] text-slate-400 font-mono">Publish Articles</p>
            </div>
          </Link>

          <Link
            href="/admin/cost-estimator"
            className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-amber-200 hover:shadow-xs transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Cost Estimator</p>
              <p className="text-[10px] text-slate-400 font-mono">Rate Calculator CMS</p>
            </div>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      {/* ── 2. Primary 4 Core Business Funnel Pillars (Apple Bento Cards) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
              Primary Civil Inbound & Funnel Pillars
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time PostgreSQL metrics · Click any card to manage its records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Turnkey Quotes Pipeline */}
          <Link
            href="/admin/quotes"
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Quotes Pipeline
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-display">
                  {hiproMetrics.quotes.total}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {hiproMetrics.quotes.pending} pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>{hiproMetrics.quotes.approved} approved orders</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Open Hub →</span>
              </p>
            </div>
          </Link>

          {/* Card 2: Direct Inquiries */}
          <Link
            href="/admin/contacts"
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Direct Inquiries
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-display">
                  {hiproMetrics.contacts.total}
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {hiproMetrics.contacts.new} new
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>{hiproMetrics.contacts.replied} replied inquiries</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Open Inbox →</span>
              </p>
            </div>
          </Link>

          {/* Card 3: Civil Construction Portfolio */}
          <Link
            href="/admin/projects"
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Civil Portfolio
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-100 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-display">
                  {hiproMetrics.projects.total}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {hiproMetrics.projects.active} active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>{hiproMetrics.projects.featured} landmark features</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Catalog →</span>
              </p>
            </div>
          </Link>

          {/* Card 4: Civil Capabilities */}
          <Link
            href="/admin/services"
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Civil Capabilities
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100 group-hover:scale-110 transition-transform">
                <HardHat className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-display">
                  {hiproMetrics.services.total}
                </span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {hiproMetrics.services.active} active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Turnkey engineering specs</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Specs →</span>
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 3. Civil Inbound & Quotation Velocity Chart (Cupertino Glass) ── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 font-display uppercase tracking-wider">
                Civil Inbound & Quotation Velocity
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live PostgreSQL Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Monthly estimate inquiries and direct homeowner consultations submitted on hindustanprojects.in
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-600" />
              <span className="text-slate-600">Quotes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span className="text-slate-600">Contacts</span>
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          {/* Main SVG Bar Chart */}
          <div className="lg:col-span-3">
            <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 pt-4 px-2">
              {monthlyData.map((d: any, idx: number) => {
                const totalActivity = (d.quotes || 0) + (d.contacts || 0);
                const hasActivity = totalActivity > 0;
                const totalH = hasActivity ? Math.min(100, Math.max(16, Math.round((totalActivity / maxVal) * 100))) : 0;
                const quotesH = hasActivity ? Math.round(((d.quotes || 0) / totalActivity) * totalH) : 0;
                const contactsH = hasActivity ? totalH - quotesH : 0;
                const isHovered = activeHoverMonth === idx;

                return (
                  <div
                    key={`${d.month}-${d.year || idx}`}
                    onMouseEnter={() => setActiveHoverMonth(idx)}
                    onMouseLeave={() => setActiveHoverMonth(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-12 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-mono shadow-xl whitespace-nowrap z-20 pointer-events-none animate-in fade-in zoom-in-95">
                        <p className="font-bold">{d.label}</p>
                        <p className="text-slate-300">
                          {d.quotes || 0} quotes · {d.contacts || 0} inquiries
                        </p>
                      </div>
                    )}

                    {/* Bars */}
                    <div className="w-full max-w-[48px] flex flex-col justify-end h-full">
                      {hasActivity ? (
                        <>
                          {contactsH > 0 && (
                            <div
                              style={{ height: `${contactsH}%` }}
                              className="w-full bg-emerald-500 rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                            />
                          )}
                          {quotesH > 0 && (
                            <div
                              style={{ height: `${quotesH}%` }}
                              className={`w-full bg-blue-600 ${contactsH === 0 ? "rounded-t-lg" : ""} rounded-b-lg transition-all duration-300 group-hover:brightness-110`}
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-1.5 bg-slate-200/80 rounded-full group-hover:bg-slate-300 transition-colors" />
                      )}
                    </div>

                    {/* Month Label */}
                    <span
                      className={`text-xs font-mono font-bold mt-3 transition-colors ${
                        isHovered ? "text-blue-600" : hasActivity ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Velocity Stats Side Column */}
          <div className="lg:col-span-1 space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Pipeline Budget</span>
              <span className="font-bold text-slate-900 font-mono">
                {hiproMetrics.velocity?.pipelineBudget || "₹0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Avg. Construction Scope</span>
              <span className="font-bold text-slate-900 font-mono">
                {hiproMetrics.velocity?.avgScope || "Turnkey Civil Specs"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Leading Territories</span>
              <span
                className="font-bold text-slate-900 font-mono truncate max-w-[140px] text-right"
                title={hiproMetrics.velocity?.leadingTerritories || "Bhilwara (HQ)"}
              >
                {hiproMetrics.velocity?.leadingTerritories || "Bhilwara (HQ)"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <span className="text-slate-500">Portal Conversion</span>
              <span className="font-bold text-emerald-600 font-mono">
                {hiproMetrics.velocity?.portalConversion || "Verified Operational"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Secondary Operational Metrics (4 Bento Cards in 1 Row) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Blog Insights */}
        <Link
          href="/admin/blogs"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Blog Insights
            </span>
            <p className="text-2xl font-black text-slate-900 font-display mt-1">
              {hiproMetrics.blogs.total}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {hiproMetrics.blogs.published} published articles
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center ring-1 ring-purple-100 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
        </Link>

        {/* Card 2: Client Reviews */}
        <Link
          href="/admin/testimonials"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Client Reviews
            </span>
            <p className="text-2xl font-black text-slate-900 font-display mt-1">
              {hiproMetrics.testimonials?.total || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              5.0 ★ verified reviews
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100 group-hover:scale-105 transition-transform">
            <Star className="w-5 h-5" />
          </div>
        </Link>

        {/* Card 3: Leadership Team */}
        <Link
          href="/admin/team"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Leadership Team
            </span>
            <p className="text-2xl font-black text-slate-900 font-display mt-1">
              {hiproMetrics.team?.total || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Directors & engineers
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center ring-1 ring-cyan-100 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </Link>

        {/* Card 4: Candidate CVs */}
        <Link
          href="/admin/applications"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Candidate CVs
            </span>
            <p className="text-2xl font-black text-slate-900 font-display mt-1">
              {hiproMetrics.careers.total}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {hiproMetrics.careers.new} new engineer CV
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-100 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* ── 5. Live Inbound Streams: Turnkey Quotes & Inquiries ───── */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm overflow-hidden">
        {/* Stream Header with Tabs */}
        <div className="p-6 md:p-7 border-b border-slate-200/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display">
              Live HiPRO Operations & Portfolio Stream
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live estimate requests, client inquiries, civil projects & engineering services
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
              <button
                onClick={() => setActiveFeedTab("quotes")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeFeedTab === "quotes"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Quotes ({hiproMetrics.quotes.total})
              </button>
              <button
                onClick={() => setActiveFeedTab("contacts")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeFeedTab === "contacts"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Inquiries ({hiproMetrics.contacts.total})
              </button>
              <button
                onClick={() => setActiveFeedTab("projects")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeFeedTab === "projects"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Projects ({hiproMetrics.projects.total})
              </button>
              <button
                onClick={() => setActiveFeedTab("services")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeFeedTab === "services"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Services ({hiproMetrics.services.total})
              </button>
            </div>

            <Link
              href={
                activeFeedTab === "quotes"
                  ? "/admin/quotes"
                  : activeFeedTab === "contacts"
                  ? "/admin/contacts"
                  : activeFeedTab === "projects"
                  ? "/admin/projects"
                  : "/admin/services"
              }
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-blue-600 text-white transition-all shrink-0"
            >
              Manage Hub →
            </Link>
          </div>
        </div>

        {/* Tab 1: Quotes */}
        {activeFeedTab === "quotes" && (
          <div className="divide-y divide-slate-100/90">
            {recentQuotes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No recent quote requests found.
              </div>
            ) : (
              recentQuotes.slice(0, 6).map((q: any) => (
                <div
                  key={q.id}
                  className="p-4 md:px-6 hover:bg-blue-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{q.name || "Client Quote"}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {q.projectType || "General Construction"} · Budget:{" "}
                      <span className="font-semibold text-slate-700">{q.budget || "Custom"}</span>
                    </p>
                    <p className="text-slate-400 text-[10px] font-mono mt-0.5">{q.phone || q.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                      {q.status || "Pending"}
                    </span>
                    {q.email && (
                      <button
                        type="button"
                        onClick={() =>
                          setMailRecipient({
                            name: q.name || "Client",
                            email: q.email,
                            phone: q.phone || "",
                            leadId: q.id,
                            leadType: "quote",
                            brand: "hipro",
                            triggerKey: "quote_requests",
                            contextBadge: `Quote • ${q.projectType || "Turnkey Construction"}`,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-semibold transition-all shadow-2xs"
                        title={`Send mail to ${q.email}`}
                      >
                        <Mail className="w-3 h-3" />
                        <span>Mail</span>
                      </button>
                    )}
                    <Link
                      href={`/admin/quotes`}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Contacts */}
        {activeFeedTab === "contacts" && (
          <div className="divide-y divide-slate-100/90">
            {recentContacts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No recent contact messages found.
              </div>
            ) : (
              recentContacts.slice(0, 6).map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 md:px-6 hover:bg-blue-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="max-w-xl">
                    <p className="font-bold text-slate-900">{c.name || "Website Inquirer"}</p>
                    <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1 italic">
                      &quot;{c.message}&quot;
                    </p>
                    <p className="text-slate-400 text-[10px] font-mono mt-0.5">{c.phone || c.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                        c.status === "new"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {c.status || "new"}
                    </span>
                    {c.email && (
                      <button
                        type="button"
                        onClick={() =>
                          setMailRecipient({
                            name: c.name || "Inquirer",
                            email: c.email,
                            phone: c.phone || "",
                            leadId: c.id,
                            leadType: "contact",
                            brand: "hipro",
                            triggerKey: "contact_inquiries",
                            contextBadge: "Direct Contact Inquiry",
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-semibold transition-all shadow-2xs"
                        title={`Send mail to ${c.email}`}
                      >
                        <Mail className="w-3 h-3" />
                        <span>Mail</span>
                      </button>
                    )}
                    <Link
                      href={`/admin/contacts`}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Reply</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Projects */}
        {activeFeedTab === "projects" && (
          <div className="divide-y divide-slate-100/90">
            {recentProjects.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No projects found in database.
              </div>
            ) : (
              recentProjects.map((p: any) => (
                <div
                  key={p.id}
                  className="p-4 md:px-6 hover:bg-blue-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                      {p.featured && (
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      <span className="font-semibold text-slate-700">{p.category || "Civil Project"}</span> · {p.location || "Rajasthan Corridor"}
                    </p>
                    {p.client && <p className="text-slate-400 text-[10px] mt-0.5">Client: {p.client}</p>}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      Active Execution
                    </span>
                    <Link
                      href={`/admin/projects`}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Services */}
        {activeFeedTab === "services" && (
          <div className="divide-y divide-slate-100/90">
            {recentServices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No services found in database.
              </div>
            ) : (
              recentServices.map((s: any) => (
                <div
                  key={s.id}
                  className="p-4 md:px-6 hover:bg-blue-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{s.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Category: <span className="font-semibold text-slate-700">{s.category || "Turnkey Engineering"}</span> · Turnkey Civil Execution Spec
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      Live Spec
                    </span>
                    <Link
                      href={`/admin/services`}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Configure</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <QuickMailModal
        isOpen={Boolean(mailRecipient)}
        onClose={() => setMailRecipient(null)}
        recipient={mailRecipient}
        onSentSuccess={() => {
          loadData(false);
        }}
      />
    </div>
  );
}
