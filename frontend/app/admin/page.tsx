"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Inbox,
  ClipboardList,
  Users,
  Building2,
  Award,
  RefreshCw,
  BookOpen,
  Plus,
  ExternalLink,
  Pencil,
  HardHat,
  Briefcase,
  Mail,
  Send,
  Layers,
  LayoutTemplate,
  Info,
  MapPin,
  Settings,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
  Activity,
  CheckCircle2
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import type { BlogPost } from "@/lib/types";
import { getAdminCache, setAdminCache } from "@/lib/adminCache";

interface DashboardData {
  contacts:     { total: number; new: number; read: number; replied: number };
  quotes:       { total: number; pending: number; reviewed: number; approved: number; rejected: number };
  newsletter:   { total: number };
  projects:     { total: number; active: number; featured: number };
  testimonials: { total: number; pending: number; approved: number };
  blogs?:       { total: number; published: number; drafts: number };
  applications?:{ total: number; new: number };
  services?:    { total: number; active: number };
  recentContacts: { id: string; name: string; email: string; phone?: string; message: string; status: string; createdAt: string }[];
  recentQuotes:   { id: string; name: string; email: string; phone?: string; projectType: string; budget: string; status: string; createdAt: string }[];
  recentApplications?: { id: string; name: string; email: string; role: string; experience: string; cvUrl: string; status: string; createdAt: string }[];
  recentBlogs?:   BlogPost[];
}

export default function AdminDashboard() {
  const cachedDash = getAdminCache<DashboardData>("admin:dashboard");
  const [data, setData]           = useState<DashboardData | null>(cachedDash);
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [loading, setLoading]     = useState(!cachedDash);
  const [error, setError]         = useState("");
  const [activeFeedTab, setActiveFeedTab] = useState<"quotes" | "contacts" | "applications">("quotes");

  const fetchData = async (force = false) => {
    if (force || !data) {
      setLoading(true);
    }
    setError("");
    try {
      const [dashRes, blogsRes] = await Promise.allSettled([
        fetch("/api/dashboard", { credentials: "include", cache: "no-store" }),
        fetch("/api/blogs", { cache: "no-store" }),
      ]);

      let dashData: any = null;
      if (dashRes.status === "fulfilled" && dashRes.value.ok) {
        const json = await dashRes.value.json();
        if (json.success) dashData = json.data;
      }

      let blogs: BlogPost[] = [];
      if (blogsRes.status === "fulfilled" && blogsRes.value.ok) {
        const json = await blogsRes.value.json();
        if (Array.isArray(json.data)) blogs = json.data;
        else if (Array.isArray(json)) blogs = json;
      }
      setBlogsList(blogs);

      if (dashData) {
        if (!dashData.blogs && blogs.length > 0) {
          dashData.blogs = {
            total: blogs.length,
            published: blogs.filter(b => (b.status || "published").toLowerCase() === "published" && b.active !== false).length,
            drafts: blogs.filter(b => (b.status || "").toLowerCase() === "draft" || b.active === false).length,
          };
        }
        if (!dashData.recentBlogs && blogs.length > 0) {
          dashData.recentBlogs = blogs.slice(0, 5);
        }
        setData(dashData);
        setAdminCache("admin:dashboard", dashData);
      } else if (dashRes.status === "fulfilled" && !dashRes.value.ok) {
        if (dashRes.value.status === 401) {
          setError("Your admin session has expired. Redirecting to login...");
          window.location.href = "/admin-login";
        } else {
          setError("Failed to load dashboard data from server.");
        }
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalArticles = data?.blogs?.total ?? blogsList.length;
  const publishedArticles = data?.blogs?.published ?? blogsList.filter(b => (b.status || "published").toLowerCase() === "published" && b.active !== false).length;
  const recentBlogs = (data?.recentBlogs && data.recentBlogs.length > 0) ? data.recentBlogs : blogsList.slice(0, 5);

  const pendingQuotesCount = data?.quotes?.pending ?? 0;
  const newContactsCount = data?.contacts?.new ?? 0;
  const newApplicationsCount = data?.applications?.new ?? 0;
  const totalActionableInquiries = pendingQuotesCount + newContactsCount + newApplicationsCount;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live System Active
            </span>
            {totalActionableInquiries > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-construction-red/10 text-construction-red border border-construction-red/20 text-[11px] font-bold uppercase tracking-wider font-mono">
                {totalActionableInquiries} New Inquiries
              </span>
            )}
          </div>
          <h2 className="text-slate-900 font-bold text-2xl md:text-3xl tracking-tight font-display">
            Executive Command Center
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl">
            Real-time management portal for Hindustan Projects. Monitor incoming inquiries, publish portfolio work, and coordinate site operations.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => fetchData(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/leads"
            className="flex items-center gap-2 bg-construction-navy hover:bg-blue-900 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-sm group"
          >
            <Inbox className="w-3.5 h-3.5 text-construction-red" />
            <span>Open Leads Hub</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchData(true)} className="underline font-bold hover:text-red-900">Retry</button>
        </div>
      )}

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-white border border-slate-200 shadow-xs" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6 animate-pulse">
            <div className="h-80 bg-white border border-slate-200 shadow-xs" />
            <div className="h-80 bg-white border border-slate-200 shadow-xs" />
          </div>
        </div>
      ) : data ? (
        <>
          {/* Section 1: Core Key Metrics Cards (Categorized) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-construction-red" />
                Operational Key Metrics
              </h3>
              <span className="text-[11px] text-slate-400">Click any card to jump directly to section</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Quote Inquiries */}
              <Link href="/admin/quotes" className="block group transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Quote Requests"
                  value={data.quotes.total}
                  sub={`${data.quotes.pending} pending action`}
                  icon={ClipboardList}
                  trend={data.quotes.pending > 0 ? `${data.quotes.pending} New` : undefined}
                />
              </Link>

              {/* Contact Messages */}
              <Link href="/admin/contacts" className="block group transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Contact Messages"
                  value={data.contacts.total}
                  sub={`${data.contacts.new} unread`}
                  icon={Inbox}
                  trend={data.contacts.new > 0 ? `${data.contacts.new} Unread` : undefined}
                />
              </Link>

              {/* Job Applications */}
              <Link href="/admin/applications" className="block group transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Job Applications"
                  value={data.applications?.total ?? 0}
                  sub={`${data.applications?.new ?? 0} new candidates`}
                  icon={Briefcase}
                  trend={(data.applications?.new ?? 0) > 0 ? `${data.applications?.new} New` : undefined}
                />
              </Link>

              {/* Newsletter Subscribers */}
              <Link href="/admin/newsletter" className="block group transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Newsletter Audience"
                  value={data.newsletter.total}
                  sub="Active subscribers"
                  icon={Users}
                />
              </Link>

              {/* Projects Portfolio */}
              <Link href="/admin/projects" className="block group transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Projects Portfolio"
                  value={data.projects.total}
                  sub={`${data.projects.active} active · ${data.projects.featured} featured`}
                  icon={Building2}
                />
              </Link>

              {/* Services Offered */}
              <Link href="/admin/services" className="block group transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Services Catalog"
                  value={data.services?.total ?? 10}
                  sub={`${data.services?.active ?? 10} active offerings`}
                  icon={HardHat}
                />
              </Link>

              {/* Blog Articles */}
              <Link href="/admin/blogs" className="block group transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Blog Articles"
                  value={totalArticles}
                  sub={`${publishedArticles} live published`}
                  icon={BookOpen}
                />
              </Link>

              {/* Client Reviews */}
              <Link href="/admin/testimonials" className="block group transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Client Reviews"
                  value={data.testimonials.total}
                  sub={`${data.testimonials.pending} awaiting approval`}
                  icon={Award}
                  trend={data.testimonials.pending > 0 ? `${data.testimonials.pending} Pending` : undefined}
                />
              </Link>
            </div>
          </div>

          {/* Section 2: Quick Launch Operational Modules (Matches Sidebar Sections) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-construction-navy" />
              Quick Module Launch Deck
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Module 1: CRM & Leads */}
              <div className="bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="w-9 h-9 bg-red-50 text-construction-red flex items-center justify-center mb-3">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <h4 className="text-slate-900 font-bold text-sm">Leads & Inquiries</h4>
                  <p className="text-slate-500 text-xs mt-1">Review quotes, contact messages, and career submissions.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                  <Link href="/admin/leads" className="font-semibold text-construction-navy hover:underline">Leads Hub &rarr;</Link>
                  <Link href="/admin/quotes" className="text-slate-500 hover:text-slate-900">Quotes</Link>
                  <Link href="/admin/contacts" className="text-slate-500 hover:text-slate-900">Contacts</Link>
                </div>
              </div>

              {/* Module 2: Content & Portfolio */}
              <div className="bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="w-9 h-9 bg-blue-50 text-construction-navy flex items-center justify-center mb-3">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-slate-900 font-bold text-sm">Content & Portfolio</h4>
                  <p className="text-slate-500 text-xs mt-1">Manage project case studies, services, blogs, and testimonials.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                  <Link href="/admin/projects" className="font-semibold text-construction-navy hover:underline">Projects &rarr;</Link>
                  <Link href="/admin/services" className="text-slate-500 hover:text-slate-900">Services</Link>
                  <Link href="/admin/blogs" className="text-slate-500 hover:text-slate-900">Blogs</Link>
                </div>
              </div>

              {/* Module 3: Pages & Site CMS */}
              <div className="bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="w-9 h-9 bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                    <LayoutTemplate className="w-4 h-4" />
                  </div>
                  <h4 className="text-slate-900 font-bold text-sm">Pages & Site CMS</h4>
                  <p className="text-slate-500 text-xs mt-1">Update hero banner slides, about story, contact details, and menus.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                  <Link href="/admin/hero" className="font-semibold text-construction-navy hover:underline">Hero Banner &rarr;</Link>
                  <Link href="/admin/projects-hero" className="text-slate-500 hover:text-slate-900">Projects Hero</Link>
                  <Link href="/admin/about" className="text-slate-500 hover:text-slate-900">About</Link>
                  <Link href="/admin/navigation" className="text-slate-500 hover:text-slate-900">Nav</Link>
                </div>
              </div>

              {/* Module 4: System & Settings */}
              <div className="bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="w-9 h-9 bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                    <Settings className="w-4 h-4" />
                  </div>
                  <h4 className="text-slate-900 font-bold text-sm">System & Roles</h4>
                  <p className="text-slate-500 text-xs mt-1">Configure company profile, Cloudinary credentials, and employee roles.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                  <Link href="/admin/settings" className="font-semibold text-construction-navy hover:underline">Settings &rarr;</Link>
                  <Link href="/admin/users" className="text-slate-500 hover:text-slate-900">Users</Link>
                  <Link href="/admin/stats" className="text-slate-500 hover:text-slate-900">Analytics</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Recent Activity Feeds (Tabbed for clean organization) */}
          <div className="bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Feed Tab Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-slate-50/50 gap-4">
              <div className="flex items-center gap-1 bg-white p-1 border border-slate-200">
                <button
                  onClick={() => setActiveFeedTab("quotes")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeFeedTab === "quotes"
                      ? "bg-construction-navy text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Quote Requests ({data.recentQuotes.length})
                </button>
                <button
                  onClick={() => setActiveFeedTab("contacts")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeFeedTab === "contacts"
                      ? "bg-construction-navy text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Contact Messages ({data.recentContacts.length})
                </button>
                <button
                  onClick={() => setActiveFeedTab("applications")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeFeedTab === "applications"
                      ? "bg-construction-navy text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Applications ({data.recentApplications?.length ?? 0})
                </button>
              </div>

              <Link
                href={`/admin/leads?type=${activeFeedTab === "quotes" ? "quote" : activeFeedTab === "contacts" ? "contact" : "application"}`}
                className="text-xs font-bold uppercase tracking-wider text-construction-red hover:underline flex items-center gap-1.5"
              >
                <span>View Full Hub</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feed Content */}
            <div className="p-0">
              {activeFeedTab === "quotes" && (
                data.recentQuotes.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No quote requests recorded yet</p>
                    <p className="text-xs text-slate-400 mt-1">Inquiries submitted via cost calculator will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.recentQuotes.map((q) => (
                      <div key={q.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase shrink-0">
                            {(q.name || "Q").charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 truncate">{q.name || "Anonymous"}</p>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
                                {q.status || "pending"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {q.email} {q.phone && `· ${q.phone}`} · Project: <span className="font-semibold text-slate-700">{q.projectType || "General"}</span> · Budget: <span className="font-semibold text-slate-700">{q.budget || "N/A"}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ""}
                          </span>
                          <Link
                            href="/admin/leads?type=quote"
                            className="text-xs font-bold text-construction-navy hover:text-blue-700 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            Details &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeFeedTab === "contacts" && (
                data.recentContacts.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No contact messages yet</p>
                    <p className="text-xs text-slate-400 mt-1">Direct inquiries from the contact form will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.recentContacts.map((c) => (
                      <div key={c.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase shrink-0">
                            {(c.name || "C").charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 truncate">{c.name || "Anonymous"}</p>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200">
                                {c.status || "new"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {c.email} {c.phone && `· ${c.phone}`} · &quot;{c.message?.slice(0, 70)}...&quot;
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                          </span>
                          <Link
                            href="/admin/leads?type=contact"
                            className="text-xs font-bold text-construction-navy hover:text-blue-700 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            Details &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeFeedTab === "applications" && (
                (!data.recentApplications || data.recentApplications.length === 0) ? (
                  <div className="py-12 px-4 text-center">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No job applications submitted yet</p>
                    <p className="text-xs text-slate-400 mt-1">Candidates applying via careers page will show up here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.recentApplications.map((app) => (
                      <div key={app.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase shrink-0">
                            {(app.name || "A").charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 truncate">{app.name}</p>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200">
                                {app.status || "new"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              Role: <span className="font-semibold text-slate-700">{app.role}</span> · Experience: {app.experience} · {app.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ""}
                          </span>
                          <Link
                            href="/admin/applications"
                            className="text-xs font-bold text-construction-navy hover:text-blue-700 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            Review CV &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Section 4: Blog Articles & Content Publishing Spotlight */}
          <div className="bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-slate-100 bg-white gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 border border-red-100 flex items-center justify-center text-construction-red shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-sm tracking-tight font-display">
                    Content Engine & Regional SEO Insights
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {totalArticles} articles published ({publishedArticles} active). Target Rajasthan keywords and site architecture.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/admin/blogs"
                  className="inline-flex items-center gap-1.5 bg-construction-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Write Article
                </Link>
                <Link
                  href="/admin/blogs"
                  className="text-construction-navy text-xs font-bold hover:text-blue-700 transition-colors uppercase tracking-wider"
                >
                  Manage All &rarr;
                </Link>
              </div>
            </div>

            {recentBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50">
                <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-900 font-semibold text-sm">No blog articles published yet</p>
                <p className="text-slate-500 text-xs mt-1 mb-4 max-w-sm">
                  Create construction guides, cost estimation insights, and local SEO articles.
                </p>
                <Link
                  href="/admin/blogs"
                  className="inline-flex items-center gap-1.5 bg-construction-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Create First Article
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBlogs.map((b) => {
                  const isPublished = (b.status || "published").toLowerCase() === "published" && b.active !== false;
                  return (
                    <div
                      key={b.id || b.slug}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-4 hover:bg-slate-50/80 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {b.image ? (
                          <div className="w-12 h-12 shrink-0 bg-slate-100 border border-slate-200 overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={b.image}
                              alt={b.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                                isPublished
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {isPublished ? "Published" : "Draft"}
                            </span>
                            {b.category && (
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
                                {b.category}
                              </span>
                            )}
                            {b.targetLocation && (
                              <span className="text-[10px] font-medium text-slate-500 hidden md:inline">
                                &middot; {b.targetLocation}
                              </span>
                            )}
                          </div>
                          <Link
                            href="/admin/blogs"
                            className="text-slate-900 text-sm font-bold hover:text-construction-red transition-colors block truncate"
                          >
                            {b.title}
                          </Link>
                          <p className="text-slate-400 text-xs mt-0.5 truncate">
                            By {b.author || "Hindustan Projects"} &middot; {b.date || "Recent"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Link
                          href={`/blogs/${b.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 transition-colors"
                          title="View live post on site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Live Post</span>
                        </Link>
                        <Link
                          href="/admin/blogs"
                          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-construction-navy hover:bg-blue-900 px-3.5 py-1.5 transition-colors shadow-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit Article</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
