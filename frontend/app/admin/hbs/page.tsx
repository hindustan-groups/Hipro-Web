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
  LayoutTemplate
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";

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
        newLeadsCount: leads.filter((l: any) => l.status === "new").length,
      });

      setRecentLeads(leads.slice(0, 5));
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
        // refresh counts
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            Sub-Brand Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
            Hind Build CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dedicated management panel for Hind Build repair, waterproofing, and building maintenance operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/hbs"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors uppercase tracking-wider"
          >
            <span>Live Public Site (/hbs)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="HBS Catalog Services"
          value={stats.servicesCount}
          sub="Turnkey Services"
          icon={HardHat}
          trend={stats.servicesCount === 19 ? "All 19 Active" : undefined}
        />
        <StatCard
          label="Project Showcases"
          value={stats.projectsCount}
          sub="Verified Case Studies"
          icon={FolderOpen}
        />
        <StatCard
          label="Client Testimonials"
          value={stats.testimonialsCount}
          sub="Property & Society Reviews"
          icon={Star}
        />
        <StatCard
          label="Inquiries & Quote Requests"
          value={stats.leadsCount}
          sub={`${stats.newLeadsCount} Pending Review`}
          icon={Inbox}
          trend={stats.newLeadsCount > 0 ? `${stats.newLeadsCount} New` : undefined}
        />
      </div>

      {/* Quick Access Matrix */}
      <div className="bg-white border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono mb-4">
          Hind Build CMS Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <Link
            href="/admin/hbs/services"
            className="group p-4 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 group-hover:text-amber-700 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-600" />
                <span>Services (19)</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-500">
              Manage all 19 service catalog entries — descriptions, images, features, FAQs.
            </p>
          </Link>

          <Link
            href="/admin/hbs/projects"
            className="group p-4 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 group-hover:text-amber-700 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-600" />
                <span>Projects & Work</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-500">
              Add and manage case studies, before/after images, scope of work, and testimonials.
            </p>
          </Link>

          <Link
            href="/admin/hbs/leads"
            className="group p-4 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 group-hover:text-amber-700 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-amber-600" />
                <span>Leads & Quotes</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-500">
              Full CRM — 7-stage pipeline, priority, quotation amount, call/WhatsApp, notes.
            </p>
          </Link>

          <Link
            href="/admin/hbs/branding"
            className="group p-4 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 group-hover:text-amber-700 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                <span>Branding & Logos</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-500">
              Upload primary/dark logos, logo mark, favicon, and default OG image.
            </p>
          </Link>

          <Link
            href="/admin/hbs/seo"
            className="group p-4 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 group-hover:text-amber-700 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>SEO & Meta</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-500">
              Global meta title, description, canonical URL, OG image, Twitter card, JSON-LD.
            </p>
          </Link>

          <Link
            href="/admin/hbs/media"
            className="group p-4 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 group-hover:text-amber-700 flex items-center gap-2">
                <GalleryHorizontalEnd className="w-4 h-4 text-amber-600" />
                <span>Media Library</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-500">
              Upload, organise, and copy URLs for Cloudinary assets across all Hind Build folders.
            </p>
          </Link>

        </div>
      </div>

      {/* Recent Leads Preview */}
      <div className="bg-white border border-slate-200">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase font-display">
              Recent Quote Requests & Inquiries
            </h2>
            <p className="text-xs text-slate-500">
              Latest requests submitted through the HBS portal
            </p>
          </div>
          <Link
            href="/admin/hbs/leads"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wider flex items-center gap-1"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No quote requests received yet. Inquiries submitted via `/hbs/contact` or quote modals will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Requested Service</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{lead.name}</div>
                      {lead.email && <div className="text-[11px] text-slate-400 font-normal">{lead.email}</div>}
                    </td>
                    <td className="p-3 font-mono">
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-amber-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </a>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {lead.selectedService || "General Infiltration / Repair"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          lead.status === "new"
                            ? "bg-amber-100 text-amber-800"
                            : lead.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="text-[11px] font-mono border border-slate-300 bg-white px-2 py-1"
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

      {/* Safety & Isolation Notice */}
      <div className="p-4 bg-slate-900 text-white flex items-start gap-3 border-l-4 border-amber-500">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Architecture Isolation Status: 100% Verified
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            All HBS data uses dedicated database models (<code className="text-amber-300">HbsContent</code>, <code className="text-amber-300">HbsService</code>, <code className="text-amber-300">HbsProject</code>, <code className="text-amber-300">HbsTestimonial</code>, <code className="text-amber-300">HbsLead</code>). The flagship Hindustan Projects (HiPRO) website and database tables remain untouched and isolated.
          </p>
        </div>
      </div>
    </div>
  );
}
