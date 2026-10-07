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
  MessageSquare,
  Zap,
  Building2,
  Check,
  Flame,
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
    <div className="space-y-8 max-w-6xl pb-12">
      {/* ── 1. GLASS HEADER ─────────────────────────────────────────── */}
      <HbsAdminPageHeader
        title="Hind Build Admin Console"
        description="Unified Glassmorphic management hub for Hind Building Solutions (HiBUILD) — Live CMS content, verified case studies, 19 trade catalogs, and customer leads."
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
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-[0.98]"
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

      {/* ── 2. GLASS STAT CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Leads Card */}
        <div className="relative group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/90 border border-white/80 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-600">
              Customer Leads
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50/80 border border-red-200/60 flex items-center justify-center text-red-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">
            {stats.leadsCount}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            {stats.newLeadsCount > 0 ? (
              <span className="px-2.5 py-0.5 bg-red-500/10 text-red-700 border border-red-200 font-mono text-[10px] font-bold rounded-full animate-pulse">
                {stats.newLeadsCount} New Pending
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> All reviewed
              </span>
            )}
          </div>
        </div>

        {/* Services Card */}
        <div className="relative group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/90 border border-white/80 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-600">
              Trade Services
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs group-hover:scale-105 transition-transform">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">
            {stats.servicesCount || 19}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            19 Specialized building trades
          </div>
        </div>

        {/* Projects Card */}
        <div className="relative group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/90 border border-white/80 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-600">
              Case Studies
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">
            {stats.projectsCount}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Field audits across Rajasthan
          </div>
        </div>

        {/* Reviews Card */}
        <div className="relative group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/90 border border-white/80 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-600">
              Verified Reviews
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-center text-amber-500 shadow-2xs group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">
            {stats.testimonialsCount}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            5-star verified ratings
          </div>
        </div>
      </div>

      {/* ── 3. RECENT LEADS (FROSTED GLASS TABLE) ────────────────────── */}
      <div className="backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl shadow-lg shadow-slate-200/40 overflow-hidden">
        <div className="p-5 border-b border-slate-100/90 flex items-center justify-between">
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
          <div className="p-10 text-center text-slate-400 text-xs">
            No inquiries recorded yet. Customer submissions from website forms will appear here in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/60 text-slate-600 font-mono text-[10px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Contact / Phone</th>
                  <th className="px-5 py-3.5 font-semibold">Service Request</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">{lead.name}</div>
                      {lead.email && (
                        <div className="text-[11px] text-slate-400 font-normal">{lead.email}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-slate-800 hover:text-red-600 transition-colors inline-flex items-center gap-1.5 font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5 text-red-600" />
                        <span>{lead.phone}</span>
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 bg-slate-100/80 border border-slate-200 text-slate-800 text-[11px] rounded-lg font-semibold truncate inline-block max-w-[200px]">
                        {lead.selectedService || "General Evaluation"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 font-mono text-[10px] font-bold rounded-full uppercase ${
                          lead.status === "new" || lead.status === "NEW"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : lead.status === "completed" || lead.status === "CONVERTED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
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
                        className="text-[11px] font-mono border border-slate-200 bg-white/90 px-2 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-2xs"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. COMPLETE CMS MODULES GRID (GLASSMORPHIC CARDS) ───────── */}
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
          <span className="text-[11px] font-mono font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
            10 Modules Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1: Home Page */}
          <Link
            href="/admin/hbs/home"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Home Page CMS
                </div>
                <div className="text-[11px] text-slate-500">
                  Hero banner, stats counter &amp; pre-footer
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 2: About Page */}
          <Link
            href="/admin/hbs/about"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  About Page CMS
                </div>
                <div className="text-[11px] text-slate-500">
                  Heritage story, 4 metrics &amp; mission
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 3: Why Choose Us (New!) */}
          <Link
            href="/admin/hbs/why-choose-us"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Why Choose Us &amp; FAQs
                </div>
                <div className="text-[11px] text-slate-500">
                  Comparison matrix, 6 pillars &amp; Q&amp;A
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 4: Services */}
          <Link
            href="/admin/hbs/services"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  19 Services Catalog
                </div>
                <div className="text-[11px] text-slate-500">
                  Titles, Hindi names, pricing &amp; scope
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 5: Projects */}
          <Link
            href="/admin/hbs/projects"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Projects &amp; Case Studies
                </div>
                <div className="text-[11px] text-slate-500">
                  Field diagnostics, specs &amp; gallery
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 6: Leads */}
          <Link
            href="/admin/hbs/leads"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Leads &amp; Triage Desk
                </div>
                <div className="text-[11px] text-slate-500">
                  Pipeline, engineer dispatch &amp; logs
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 7: Testimonials */}
          <Link
            href="/admin/hbs/testimonials"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Client Reviews &amp; Ratings
                </div>
                <div className="text-[11px] text-slate-500">
                  Homeowner &amp; society verified reviews
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 8: Settings & Contact */}
          <Link
            href="/admin/hbs/settings"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Contact &amp; Global Settings
                </div>
                <div className="text-[11px] text-slate-500">
                  Phone numbers, WhatsApp &amp; address
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 9: Branding */}
          <Link
            href="/admin/hbs/branding"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Branding &amp; Logos
                </div>
                <div className="text-[11px] text-slate-500">
                  Logos, favicon, lockup &amp; social marks
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Module 10: SEO */}
          <Link
            href="/admin/hbs/seo"
            className="group p-5 backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-white/80 hover:border-red-300 rounded-2xl shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  SEO &amp; Meta Engine
                </div>
                <div className="text-[11px] text-slate-500">
                  Meta descriptions, keywords &amp; OG tags
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* ── 5. GOVERNANCE BANNER ───────────────────────────────────────── */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/80 p-5 rounded-2xl flex items-start gap-3.5 shadow-sm text-xs">
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
