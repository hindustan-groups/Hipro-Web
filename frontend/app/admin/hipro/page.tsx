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
  Plus,
  Clock,
  Sparkles,
  Inbox,
  BarChart2,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  TrendingUp,
  Layers,
  Activity,
  ShieldCheck,
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
        careers: { total: 0, new: 0 },
      }
    );
  }, [data]);

  const recentQuotes = useMemo(() => data?.recentQuotes || [], [data]);
  const recentContacts = useMemo(() => data?.recentContacts || [], [data]);

  return (
    <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-8 pb-16">
      {/* ── 1. Civil Command Executive Welcome Banner ─────────── */}
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

      {/* ── 2. Top 4 Core Metrics (Apple Bento Cards) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* 1. Civil Portfolio */}
        <Link
          href="/admin/projects"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Civil Portfolio
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100 group-hover:scale-105 transition-transform">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {hiproMetrics.projects.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-bold text-emerald-600">{hiproMetrics.projects.active} active execution</span>
              <span>· {hiproMetrics.projects.featured} featured</span>
            </p>
          </div>
        </Link>

        {/* 2. Civil Capabilities */}
        <Link
          href="/admin/services"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Civil Capabilities
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100 group-hover:scale-105 transition-transform">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {hiproMetrics.services.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-bold text-amber-600">{hiproMetrics.services.active} active specs</span>
              <span>· Turnkey handover</span>
            </p>
          </div>
        </Link>

        {/* 3. Turnkey Quotes Pipeline */}
        <Link
          href="/admin/quotes"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Quotes Pipeline
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {hiproMetrics.quotes.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-bold text-emerald-600">{hiproMetrics.quotes.pending} pending review</span>
              <span>· {hiproMetrics.quotes.approved} approved</span>
            </p>
          </div>
        </Link>

        {/* 4. Inbound Inquiries & Careers */}
        <Link
          href="/admin/contacts"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Inbound Leads & CVs
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center ring-1 ring-purple-100 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {hiproMetrics.contacts.total + hiproMetrics.careers.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-bold text-purple-600">{hiproMetrics.contacts.new} new messages</span>
              <span>· {hiproMetrics.careers.new} new CVs</span>
            </p>
          </div>
        </Link>
      </div>

      {/* ── 3. Split Executive Operations & CMS Workspace ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* ── LEFT COLUMN (7 Cols): Real-time Streams & Quotation Feed ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Quotes Feed */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm overflow-hidden">
            <div className="p-5 md:px-6 border-b border-slate-200/60 flex items-center justify-between">
              <div>
                <h2 className="text-sm md:text-base font-bold text-slate-900 uppercase tracking-wider font-display">
                  Recent Turnkey Quotation Inquiries
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct estimation requests from prospective clients on hindustanprojects.in
                </p>
              </div>
              <Link
                href="/admin/quotes"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shrink-0"
              >
                Open Pipeline →
              </Link>
            </div>

            <div className="divide-y divide-slate-100/90">
              {recentQuotes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No quotation requests in queue.
                </div>
              ) : (
                recentQuotes.slice(0, 5).map((q: any) => (
                  <div
                    key={q.id}
                    className="p-4 md:px-6 hover:bg-blue-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{q.name || "Client Quote"}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                        {q.projectType || "General Construction"} · Budget:{" "}
                        <span className="font-semibold text-slate-700">{q.budget || "Custom"}</span>
                      </p>
                      <p className="text-slate-400 text-[10px] font-mono mt-0.5 truncate">
                        {q.phone || q.email || "No phone provided"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                      <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        {q.status || "Pending"}
                      </span>
                      <Link
                        href="/admin/quotes"
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Review →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Direct Messages Stream */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm overflow-hidden">
            <div className="p-5 md:px-6 border-b border-slate-200/60 flex items-center justify-between">
              <div>
                <h2 className="text-sm md:text-base font-bold text-slate-900 uppercase tracking-wider font-display">
                  Direct Inbound Messages
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  General technical inquiries and consultations submitted via Contact page
                </p>
              </div>
              <Link
                href="/admin/contacts"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shrink-0"
              >
                View Inquiries →
              </Link>
            </div>

            <div className="divide-y divide-slate-100/90">
              {recentContacts.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No direct inquiries in queue.
                </div>
              ) : (
                recentContacts.slice(0, 4).map((c: any) => (
                  <div
                    key={c.id}
                    className="p-4 md:px-6 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{c.name || "Inquirer"}</p>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">
                        {c.subject || c.message || "Consultation Request"}
                      </p>
                      <p className="text-slate-400 text-[10px] font-mono mt-0.5">
                        {c.email || c.phone}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 shrink-0">
                      {c.status || "new"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (5 Cols): Categorized Civil CMS Command Studio ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Category 1: Civil Content & Engineering Editorial */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 p-6 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Studio Category 1
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display mt-0.5">
                Editorial & Web Content
              </h2>
            </div>

            <div className="space-y-2">
              {[
                { title: "Hero Banner CMS", desc: "Main headline & typography slider", href: "/admin/hero", icon: LayoutTemplate, color: "text-rose-600 bg-rose-50" },
                { title: "Homepage KPI Counters", desc: "Years of experience & landmark statistics", href: "/admin/stats", icon: BarChart2, color: "text-emerald-600 bg-emerald-50" },
                { title: "About Page CMS", desc: "Company founding story & engineering principles", href: "/admin/about", icon: Info, color: "text-teal-600 bg-teal-50" },
                { title: "Contact Page CMS", desc: "Bhilwara headquarters address & Google Maps", href: "/admin/contact-page", icon: MapPin, color: "text-orange-600 bg-orange-50" },
                { title: "Engineering Blog Insights", desc: "Technical articles & construction updates", href: "/admin/blogs", icon: BookOpen, color: "text-purple-600 bg-purple-50" },
                { title: "Client Reviews & Ratings", desc: "Customer testimonials & project ratings", href: "/admin/testimonials", icon: Star, color: "text-yellow-600 bg-yellow-50" },
                { title: "Leadership & Team", desc: "Directors, civil engineers & site staff", href: "/admin/team", icon: Users, color: "text-cyan-600 bg-cyan-50" },
                { title: "Job Applications", desc: "Careers portal applicants & candidate CVs", href: "/admin/applications", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-3 rounded-2xl bg-slate-50/60 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.2">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Category 2: Pricing Engine & Platform Controls */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 p-6 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Studio Category 2
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display mt-0.5">
                Pricing & Platform Settings
              </h2>
            </div>

            <div className="space-y-2">
              <Link
                href="/admin/cost-estimator"
                className="p-3.5 rounded-2xl bg-indigo-50/50 hover:bg-white border border-indigo-200/80 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Calculator className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Cost Estimator CMS Engine
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Rajasthan square-foot rates, Gold/Diamond/Platinum packages & 60+ cities
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/admin/settings"
                className="p-3 rounded-2xl bg-slate-50/60 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      HiPRO Site Settings CMS
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.2">
                      Cloudinary media CDN, official contacts & social links
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/admin/navigation"
                className="p-3 rounded-2xl bg-slate-50/60 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Navigation Menus
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.2">
                      Public header links, dropdowns & footer menu matrix
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
