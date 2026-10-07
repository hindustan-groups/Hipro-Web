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

import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";

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
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-7 max-w-6xl">
      {/* Apple-minimal Header */}
      <HbsAdminPageHeader
        title="Hind Build Admin"
        description="Unified management console for Hind Build service catalog, verified case studies, media assets, and customer inquiries."
      >
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>

        <Link
          href="/hbs"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </HbsAdminPageHeader>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Useful Summary Cards: Leads, Services, Projects, Testimonials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Leads</span>
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display">{stats.leadsCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            {stats.newLeadsCount > 0 ? (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-mono text-[10px] font-semibold rounded">
                {stats.newLeadsCount} New Pending
              </span>
            ) : (
              <span>All inquiries reviewed</span>
            )}
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Services</span>
            <HardHat className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display">{stats.servicesCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.servicesCount === 19 ? "All 19 catalog services active" : "Turnkey services"}
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Projects</span>
            <FolderOpen className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display">{stats.projectsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Verified case studies</div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Testimonials</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display">{stats.testimonialsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Client & society reviews</div>
        </div>
      </div>

      {/* 2. Recent Leads */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Leads
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest inquiries submitted from public quote forms and WhatsApp triggers
            </p>
          </div>
          <Link
            href="/admin/hbs/leads"
            className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No inquiries recorded yet. Submissions through `/hbs/contact` and quote buttons will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div>{lead.name}</div>
                      {lead.email && <div className="text-[11px] text-slate-400 font-normal">{lead.email}</div>}
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-slate-800 hover:text-amber-700 transition-colors flex items-center gap-1 font-medium"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.phone}</span>
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded">
                        {lead.selectedService || "General Evaluation"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 font-mono text-[10px] font-medium rounded uppercase ${
                          lead.status === "new" || lead.status === "NEW"
                            ? "bg-amber-100 text-amber-800"
                            : lead.status === "completed" || lead.status === "CONVERTED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="text-[11px] font-mono border border-slate-200 bg-white px-2 py-1 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
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

      {/* 3. Quick Actions: Edit Home, Manage Services, Add Project, View Leads, Branding, SEO */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <Link
            href="/admin/hbs/home"
            className="group p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                <LayoutTemplate className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Edit Home</div>
                <div className="text-[11px] text-slate-500">Hero, value props, statistics</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/hbs/services"
            className="group p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                <HardHat className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Manage Services</div>
                <div className="text-[11px] text-slate-500">19 services catalog & details</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/hbs/projects"
            className="group p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Add Project</div>
                <div className="text-[11px] text-slate-500">Publish case study & photos</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/hbs/leads"
            className="group p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">View Leads</div>
                <div className="text-[11px] text-slate-500">Inquiry pipeline & CRM</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/hbs/branding"
            className="group p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Branding</div>
                <div className="text-[11px] text-slate-500">Logos, favicons & mark</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/hbs/seo"
            className="group p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">SEO</div>
                <div className="text-[11px] text-slate-500">Meta tags, canonical & social</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      {/* Safety & Isolation Footer Note */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-700 font-medium">Isolated Architecture:</strong> Hind Build CMS manages dedicated sub-brand records (<code className="text-slate-800">HbsService</code>, <code className="text-slate-800">HbsProject</code>, <code className="text-slate-800">HbsLead</code>, <code className="text-slate-800">HbsContent</code>). HiPRO flagship records remain completely insulated.
        </p>
      </div>
    </div>
  );
}
