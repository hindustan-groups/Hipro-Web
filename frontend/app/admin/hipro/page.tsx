"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

export default function HiproControlCenterPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load HiPRO metrics");
      }
    } catch {
      setError("Network issue while connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hiproMetrics = data?.hipro || {
    projects: { total: 0, active: 0, featured: 0 },
    services: { total: 0, active: 0 },
    quotes: { total: 0, pending: 0, approved: 0 },
    contacts: { total: 0, new: 0, replied: 0 },
    blogs: { total: 0, published: 0 },
    careers: { total: 0, new: 0 },
  };

  const recentQuotes = data?.recentQuotes || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* ── 1. Top Brand Banner ───────────────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.03)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-[11px] font-semibold text-slate-700 transition-all shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back to Master HQ</span>
                </Link>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-200/80 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Flagship Web
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight font-display mt-2">
                HiPRO Corporate Web · Control Center
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
                hindustanprojects.in · Core Architecture, Mega Infra, Turnkey Civil Engineering & Cost Estimation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
            <a
              href="https://www.hindustanprojects.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
            >
              <span>Live Website</span>
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
        {/* Projects */}
        <Link
          href="/admin/projects"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Civil Portfolio</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100 group-hover:scale-105 transition-transform">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {hiproMetrics.projects.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-bold text-emerald-600">{hiproMetrics.projects.active} active</span>
              <span>· {hiproMetrics.projects.featured} featured</span>
            </p>
          </div>
        </Link>

        {/* Services */}
        <Link
          href="/admin/services"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Civil Services</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100 group-hover:scale-105 transition-transform">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {hiproMetrics.services.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-bold text-blue-600">{hiproMetrics.services.active} active services</span>
            </p>
          </div>
        </Link>

        {/* Quotes */}
        <Link
          href="/admin/quotes"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Quotes Pipeline</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-100 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {hiproMetrics.quotes.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-bold text-amber-600">{hiproMetrics.quotes.pending} pending review</span>
            </p>
          </div>
        </Link>

        {/* Inquiries */}
        <Link
          href="/admin/contacts"
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Direct Inquiries</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {hiproMetrics.contacts.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-bold text-emerald-600">{hiproMetrics.contacts.new} new messages</span>
            </p>
          </div>
        </Link>
      </div>

      {/* ── 3. Complete HiPRO CMS Launch Matrix ────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display">
              HiPRO Content & Site Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated editorial and configuration tools for the flagship corporate portal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Projects Portfolio", desc: "Civil & infra case studies, images & milestones", href: "/admin/projects", icon: FolderOpen, color: "text-blue-600 bg-blue-50" },
            { title: "Civil Services", desc: "Turnkey execution, engineering & architecture specs", href: "/admin/services", icon: HardHat, color: "text-amber-600 bg-amber-50" },
            { title: "Quotes Pipeline", desc: "Client estimates, budget breakdowns & inquiries", href: "/admin/quotes", icon: FileText, color: "text-emerald-600 bg-emerald-50" },
            { title: "Blog Insights", desc: "Articles, technical journals & site updates", href: "/admin/blogs", icon: BookOpen, color: "text-purple-600 bg-purple-50" },
            { title: "Hero Banner CMS", desc: "Main headline, typography & background media", href: "/admin/hero", icon: LayoutTemplate, color: "text-rose-600 bg-rose-50" },
            { title: "Cost Estimator CMS", desc: "Square-foot construction rate calculator engine", href: "/admin/cost-estimator", icon: Calculator, color: "text-indigo-600 bg-indigo-50" },
            { title: "About Page CMS", desc: "Founding story, vision, leadership & heritage", href: "/admin/about", icon: Info, color: "text-teal-600 bg-teal-50" },
            { title: "Contact Page CMS", desc: "Headquarters location, maps & inquiry desks", href: "/admin/contact-page", icon: MapPin, color: "text-orange-600 bg-orange-50" },
            { title: "Client Reviews", desc: "Customer testimonials & project ratings", href: "/admin/testimonials", icon: Star, color: "text-yellow-600 bg-yellow-50" },
            { title: "Leadership & Team", desc: "Directors, civil engineers & site staff", href: "/admin/team", icon: Users, color: "text-cyan-600 bg-cyan-50" },
            { title: "Job Applications", desc: "Careers portal applicants & candidate CVs", href: "/admin/applications", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
            { title: "HiPRO Site Settings", desc: "Socials, metadata & public footer setup", href: "/admin/settings", icon: Settings, color: "text-slate-600 bg-slate-100" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl p-5 bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-start gap-4 group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 4. Recent Quotes Stream ───────────────────────────── */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-6 md:p-7 border-b border-slate-200/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display">
              Recent HiPRO Quote Inquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct estimate requests from prospective clients on hindustanprojects.in
            </p>
          </div>
          <Link
            href="/admin/quotes"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
          >
            View All Quotes →
          </Link>
        </div>

        <div className="divide-y divide-slate-100/80">
          {recentQuotes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recent quote requests found.
            </div>
          ) : (
            recentQuotes.slice(0, 5).map((q: any) => (
              <div
                key={q.id}
                className="p-4 md:px-6 hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{q.name || "Client Quote"}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {q.projectType || "General Construction"} · Budget: {q.budget || "Custom"}
                  </p>
                  <p className="text-slate-400 text-[10px] font-mono mt-0.5">{q.phone || q.email}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                    {q.status || "Pending"}
                  </span>
                  <Link
                    href={`/admin/quotes`}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Manage →
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
