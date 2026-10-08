"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HardHat,
  FolderOpen,
  Star,
  Inbox,
  Settings,
  ExternalLink,
  RefreshCw,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Palette,
  GalleryHorizontalEnd,
  Compass,
  LayoutTemplate,
  Info,
  Scale,
  Sparkles,
  MapPin,
  MessageSquare,
  Zap,
  Building2,
  Check,
  Flame,
  Plus,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";

interface HbsStats {
  servicesCount: number;
  projectsCount: number;
  testimonialsCount: number;
  leadsCount: number;
  newLeadsCount: number;
}

export default function HbsAdminDashboard() {
  const [stats, setStats] = useState<HbsStats>({
    servicesCount: 0,
    projectsCount: 0,
    testimonialsCount: 0,
    leadsCount: 0,
    newLeadsCount: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [resServices, resProjects, resTestimonials, resLeads] = await Promise.all([
        fetch("/api/hbs/services?all=true", { credentials: "include", cache: "no-store" }),
        fetch("/api/hbs/projects?all=true", { credentials: "include", cache: "no-store" }),
        fetch("/api/hbs/testimonials?all=true", { credentials: "include", cache: "no-store" }),
        fetch("/api/hbs/leads", { credentials: "include", cache: "no-store" }),
      ]);

      const [servicesJson, projectsJson, testimonialsJson, leadsJson] = await Promise.all([
        resServices.json(),
        resProjects.json(),
        resTestimonials.json(),
        resLeads.json(),
      ]);

      const services = servicesJson.success ? servicesJson.data : [];
      const projects = projectsJson.success ? projectsJson.data : [];
      const testimonials = testimonialsJson.success ? testimonialsJson.data : [];
      const leads = leadsJson.success ? leadsJson.data : [];

      setStats({
        servicesCount: services.length,
        projectsCount: projects.length,
        testimonialsCount: testimonials.length,
        leadsCount: leads.length,
        newLeadsCount: leads.filter((l: any) => l.status === "new" || l.status === "NEW").length,
      });

      setRecentLeads(leads.slice(0, 6));
    } catch {
      setError("Failed to load dashboard data. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/hbs/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setRecentLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* ── 1. APPLE GLASS HEADER ─────────────────────────────────────────── */}
      <HbsAdminPageHeader
        title="Hind Build Admin Console"
        description="Unified Glassmorphic management hub for Hind Building Solutions (HiBUILD) — Live CMS content, verified case studies, trade catalogs, and customer leads."
      >
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md bg-white/80 border border-white hover:bg-white transition-all rounded-xl shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
          <span>Refresh</span>
        </button>

        <Link
          href="/hbs"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all shadow-[0_4px_14px_rgba(239,68,68,0.35)] active:scale-[0.98]"
        >
          <span>View Live Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </HbsAdminPageHeader>

      {error && (
        <div className="p-4 backdrop-blur-md bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 2. APPLE GLASS STAT CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Leads Card */}
        <div className="relative group p-6 bg-white/80 backdrop-blur-2xl hover:bg-white/95 border border-white/90 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">
              Customer Leads
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/10 to-red-500/20 border border-red-200/60 flex items-center justify-center text-red-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
            {stats.leadsCount}
          </div>
          <div className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5">
            {stats.newLeadsCount > 0 ? (
              <span className="px-2.5 py-0.5 bg-red-500/10 text-red-700 border border-red-200 font-mono text-[10px] font-bold rounded-full animate-pulse">
                {stats.newLeadsCount} New Pending
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> All reviewed
              </span>
            )}
          </div>
        </div>

        {/* Services Card */}
        <div className="relative group p-6 bg-white/80 backdrop-blur-2xl hover:bg-white/95 border border-white/90 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">
              Trade Services
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/20 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs group-hover:scale-105 transition-transform">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
            {stats.servicesCount || 0}
          </div>
          <div className="text-xs text-slate-500 mt-2.5 text-[11px]">
            Active building trades catalog
          </div>
        </div>

        {/* Projects Card */}
        <div className="relative group p-6 bg-white/80 backdrop-blur-2xl hover:bg-white/95 border border-white/90 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">
              Case Studies
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/20 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
            {stats.projectsCount}
          </div>
          <div className="text-xs text-slate-500 mt-2.5 text-[11px]">
            Field audits across Rajasthan
          </div>
        </div>

        {/* Reviews Card */}
        <div className="relative group p-6 bg-white/80 backdrop-blur-2xl hover:bg-white/95 border border-white/90 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">
              Verified Reviews
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-yellow-500/20 border border-amber-200/60 flex items-center justify-center text-amber-500 shadow-2xs group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
            {stats.testimonialsCount}
          </div>
          <div className="text-xs text-slate-500 mt-2.5 text-[11px]">
            5-star verified ratings
          </div>
        </div>
      </div>

      {/* ── 3. APPLE QUICK ACTIONS BAR ────────────────────────────────────── */}
      <div className="p-4 bg-white/70 backdrop-blur-2xl border border-white/90 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            Quick Actions:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/hbs/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-800 hover:text-slate-950 font-semibold text-xs rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>+ Add Project</span>
          </Link>
          <Link
            href="/admin/hbs/services"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-800 hover:text-slate-950 font-semibold text-xs rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Add Service</span>
          </Link>
          <Link
            href="/admin/hbs/testimonials"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-800 hover:text-slate-950 font-semibold text-xs rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>+ Add Review</span>
          </Link>
          <Link
            href="/admin/hbs/home"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-800 hover:text-slate-950 font-semibold text-xs rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-purple-600" />
            <span>Homepage CMS</span>
          </Link>
          <Link
            href="/admin/hbs/leads"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-800 hover:text-slate-950 font-semibold text-xs rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all"
          >
            <Inbox className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open Leads Hub</span>
          </Link>
        </div>
      </div>

      {/* ── 4. RECENT LEADS (FROSTED GLASS TABLE) ────────────────────── */}
      <div className="backdrop-blur-2xl bg-white/80 border border-white/90 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Live Inquiries &amp; Inspection Leads</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Real-time site visits and repair requests submitted through website forms
            </p>
          </div>
          <Link
            href="/admin/hbs/leads"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No inquiries recorded yet. Customer submissions from website forms will appear here in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-500 font-mono text-[10px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Contact &amp; Quick Reach</th>
                  <th className="px-5 py-3.5 font-semibold">Service Request</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {recentLeads.map((lead) => {
                  const cleanPhone = lead.phone ? String(lead.phone).replace(/\D/g, "") : "";
                  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs font-mono shrink-0 border border-slate-200/60">
                            {lead.name ? lead.name.charAt(0).toUpperCase() : "C"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs truncate max-w-[180px]">{lead.name}</div>
                            {lead.email && (
                              <div className="text-[11px] text-slate-400 font-normal truncate max-w-[180px]">{lead.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-slate-800 hover:text-red-600 transition-colors inline-flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.phone}</span>
                          </a>
                          {waPhone && (
                            <a
                              href={`https://wa.me/${waPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] rounded-lg font-semibold truncate inline-block max-w-[200px] border border-slate-200/60">
                          {lead.selectedService || "General Evaluation"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 font-mono text-[10px] font-bold rounded-full uppercase ${
                            lead.status === "new" || lead.status === "NEW"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : lead.status === "completed" || lead.status === "CONVERTED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="text-[11px] font-mono border border-slate-200 bg-white px-2 py-1.5 rounded-xl text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-red-500 shadow-2xs"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. COMPLETE CMS MODULES GRID (APPLE SQUIRCLE TILES) ───────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Content &amp; Experience Management Modules
            </h2>
            <p className="text-xs text-slate-500">
              Edit every page, section, claim, and specification to keep website data 100% accurate.
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-500 bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
            12 Modules Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1: Home Page (All 8 Sections) */}
          <Link
            href="/admin/hbs/home"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Homepage CMS
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  All 8 dynamic landing sections
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 2: About Page */}
          <Link
            href="/admin/hbs/about"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Info className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  About Page CMS
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Heritage story, 4 metrics &amp; mission
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 3: Why Choose Us */}
          <Link
            href="/admin/hbs/why-choose-us"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <Scale className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Why Choose Us &amp; FAQs
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Comparison matrix, 6 pillars &amp; Q&amp;A
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 4: Services */}
          <Link
            href="/admin/hbs/services"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <HardHat className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Services Catalog
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Titles, Hindi names, pricing &amp; scope
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 5: Projects */}
          <Link
            href="/admin/hbs/projects"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Projects &amp; Case Studies
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Field diagnostics, specs &amp; gallery
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 6: Leads */}
          <Link
            href="/admin/hbs/leads"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Customer Leads &amp; CRM
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Pipeline, engineer dispatch &amp; logs
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 7: Testimonials */}
          <Link
            href="/admin/hbs/testimonials"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-yellow-500/25 group-hover:scale-105 transition-transform">
                <Star className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Client Reviews &amp; Ratings
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Verified homeowner reviews
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 8: Header & Navbar */}
          <Link
            href="/admin/hbs/settings?tab=navbar"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Header &amp; Navbar CMS
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Sticky bar, nav links &amp; buttons
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 9: Footer & Legal CMS */}
          <Link
            href="/admin/hbs/settings?tab=footer"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Footer &amp; Legal CMS
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  4 Columns, regional address &amp; pillars
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 10: Settings & Contact */}
          <Link
            href="/admin/hbs/settings?tab=contact"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-700/25 group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Hotlines, WhatsApp &amp; Hours
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Phone numbers, WhatsApp &amp; hours
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 11: Branding */}
          <Link
            href="/admin/hbs/branding"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-fuchsia-500/25 group-hover:scale-105 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Branding &amp; Logos
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Logos, favicon &amp; social assets
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 12: SEO */}
          <Link
            href="/admin/hbs/seo"
            className="group p-5 bg-white/80 backdrop-blur-2xl hover:bg-white border border-white/90 hover:border-red-300 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  SEO &amp; Meta Engine
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Meta descriptions, keywords &amp; OG tags
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* ── 6. GOVERNANCE BANNER ───────────────────────────────────────── */}
      <div className="backdrop-blur-2xl bg-white/80 border border-white/90 p-5 rounded-3xl flex items-start gap-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-900 font-bold block">
            HiBUILD Isolated Architecture &amp; Live Verification:
          </strong>
          <p className="text-slate-600 leading-relaxed font-sans">
            Dedicated database collections (<code className="text-red-600 font-mono font-bold">HbsContent</code>, <code className="text-red-600 font-mono font-bold">HbsService</code>, <code className="text-red-600 font-mono font-bold">HbsProject</code>, <code className="text-red-600 font-mono font-bold">HbsLead</code>) ensure all content updates take effect immediately on the live website without hardcoded text or fake claims.
          </p>
        </div>
      </div>
    </div>
  );
}
