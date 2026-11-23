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
  LayoutTemplate,
  Calculator,
  Info,
  MapPin,
  Star,
  Users,
  Briefcase,
  Settings,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Clock,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Layers,
  Activity,
  ArrowUpRight,
  Eye,
  Camera,
  Compass,
} from "lucide-react";
import { getAdminCache, setAdminCache } from "@/lib/adminCache";

export default function HiproControlCenterPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");

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
    if (!currentTime) return "Civil Operations Team 👋";
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
                Core Architecture, Mega Infra, Turnkey Civil Engineering & Cost Estimation
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
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      {/* ── 2. Primary Civil Inbound & Funnel Pillars (4 Bento Cards) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
              Live Business Pipeline & Core Capabilities
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time counts from PostgreSQL database — Click any card to manage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Turnkey Quotes */}
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
                <span className="text-blue-600 font-semibold group-hover:underline">Open →</span>
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
                <span>{hiproMetrics.contacts.replied} replied consultations</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Open →</span>
              </p>
            </div>
          </Link>

          {/* Card 3: Civil Portfolio */}
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
                <span className="text-blue-600 font-semibold group-hover:underline">Open →</span>
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
                <span>Turnkey execution specs</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Open →</span>
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 3. Content, Leadership & Careers Matrix (4 Bento Cards) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
              Content Insights, Team & Recruitment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live counts of editorial insights, reviews, leadership personnel & job candidates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 5: Engineering Blogs */}
          <Link
            href="/admin/blogs"
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Blog Insights
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center ring-1 ring-purple-100 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-display">
                  {hiproMetrics.blogs.total}
                </span>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {hiproMetrics.blogs.published} published
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Articles & technical journals</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Open →</span>
              </p>
            </div>
          </Link>

          {/* Card 6: Client Reviews */}
          <Link
            href="/admin/testimonials"
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Client Reviews
              </span>
              <div className="w-10 h-10 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center ring-1 ring-yellow-100 group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-display">
                  {hiproMetrics.testimonials?.total || 0}
                </span>
                <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                  5.0 ★ Rating
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Verified client testimonials</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Open →</span>
              </p>
            </div>
          </Link>

          {/* Card 7: Leadership & Engineers */}
          <Link
            href="/admin/team"
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Leadership Team
              </span>
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center ring-1 ring-cyan-100 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-display">
                  {hiproMetrics.team?.total || 0}
                </span>
                <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                  Active Staff
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Directors & senior engineers</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Open →</span>
              </p>
            </div>
          </Link>

          {/* Card 8: Careers & Job Applicants */}
          <Link
            href="/admin/applications"
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Candidate CVs
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-100 group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-display">
                  {hiproMetrics.careers.total}
                </span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {hiproMetrics.careers.new} new
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Engineer & site supervisor CVs</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Open →</span>
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 4. Page Builder, Pricing Engine & Site CMS Deck ───── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
              Page Builder, Cost Estimator & Platform Settings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any section below to directly open and manage its live configuration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Cost Estimator CMS */}
          <Link
            href="/admin/cost-estimator"
            className="p-5 rounded-3xl bg-indigo-50/50 hover:bg-white border border-indigo-200/80 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Cost Estimator Rates CMS
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  3 Tiers · 60+ Cities
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Rajasthan square-foot calculator rates, package specs & city multipliers.
              </p>
            </div>
          </Link>

          {/* Hero Banner CMS */}
          <Link
            href="/admin/hero"
            className="p-5 rounded-3xl bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Hero Banner Slider
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {hiproMetrics.hero?.total || 0} Slides
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Main landing page headline typography, background imagery & CTA buttons.
              </p>
            </div>
          </Link>

          {/* Homepage KPI Counters */}
          <Link
            href="/admin/stats"
            className="p-5 rounded-3xl bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Homepage KPI Counters
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {hiproMetrics.stats?.total || 0} Counters
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Years of experience, square feet built & happy client satisfaction metrics.
              </p>
            </div>
          </Link>

          {/* Newsletter Subscribers */}
          <Link
            href="/admin/newsletter"
            className="p-5 rounded-3xl bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Newsletter Audience
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {hiproMetrics.subscribers?.total || 0} Subscribed
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Registered subscribers receiving civil industry briefs & company updates.
              </p>
            </div>
          </Link>

          {/* About Us Page CMS */}
          <Link
            href="/admin/about"
            className="p-5 rounded-3xl bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Info className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  About Us Page CMS
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Live CMS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Founding story, vision, 6-stage engineering workflow & quality benchmarks.
              </p>
            </div>
          </Link>

          {/* Contact Page CMS */}
          <Link
            href="/admin/contact-page"
            className="p-5 rounded-3xl bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Contact Page & Maps CMS
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  HQ Maps
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Bhilwara headquarters address, interactive Google Maps & support hours.
              </p>
            </div>
          </Link>

          {/* Navigation Menus */}
          <Link
            href="/admin/navigation"
            className="p-5 rounded-3xl bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Navigation Menus
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Header & Footer
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Header main navigation, service dropdowns & footer link tree structure.
              </p>
            </div>
          </Link>

          {/* Image Showcase Gallery */}
          <Link
            href="/admin/image-showcase"
            className="p-5 rounded-3xl bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Image Showcase Gallery
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Showcase
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Curated visual gallery of on-site civil execution and engineering works.
              </p>
            </div>
          </Link>

          {/* HiPRO Site Settings CMS */}
          <Link
            href="/admin/settings"
            className="p-5 rounded-3xl bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  HiPRO Site Settings CMS
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Cloudinary & Meta
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Cloudinary media CDN credentials, verified corporate contacts & social links.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 5. Live Recent Quotation Inquiries Stream ──────────── */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-6 md:p-7 border-b border-slate-200/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display">
              Recent HiPRO Turnkey Quote Requests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct estimate inquiries submitted by prospective clients on hindustanprojects.in
            </p>
          </div>
          <Link
            href="/admin/quotes"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
          >
            View All Quotes ({hiproMetrics.quotes.total}) →
          </Link>
        </div>

        <div className="divide-y divide-slate-100/90">
          {recentQuotes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recent quote requests found.
            </div>
          ) : (
            recentQuotes.slice(0, 5).map((q: any) => (
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
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                    {q.status || "Pending"}
                  </span>
                  <Link
                    href={`/admin/quotes`}
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
      </div>
    </div>
  );
}
