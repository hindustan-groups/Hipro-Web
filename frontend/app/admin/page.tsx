"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import type { BlogPost } from "@/lib/types";

interface DashboardData {
  contacts:     { total: number; new: number; read: number; replied: number };
  quotes:       { total: number; pending: number; reviewed: number; approved: number; rejected: number };
  newsletter:   { total: number };
  projects:     { total: number; active: number; featured: number };
  testimonials: { total: number; pending: number; approved: number };
  blogs?:       { total: number; published: number; drafts: number };
  recentContacts: { id: string; name: string; email: string; message: string; status: string; createdAt: string }[];
  recentQuotes:   { id: string; name: string; email: string; projectType: string; budget: string; status: string; createdAt: string }[];
  recentBlogs?:   BlogPost[];
}

export default function AdminDashboard() {
  const [data, setData]           = useState<DashboardData | null>(null);
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, blogsRes] = await Promise.allSettled([
        fetch("/api/dashboard"),
        fetch("/api/blogs"),
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
      } else if (dashRes.status === "fulfilled" && !dashRes.value.ok) {
        setError("Failed to load dashboard");
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalArticles = data?.blogs?.total ?? blogsList.length;
  const publishedArticles = data?.blogs?.published ?? blogsList.filter(b => (b.status || "published").toLowerCase() === "published" && b.active !== false).length;
  const recentBlogs = (data?.recentBlogs && data.recentBlogs.length > 0) ? data.recentBlogs : blogsList.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">Welcome back, Admin</p>
          <h2 className="text-slate-900 font-bold text-2xl">Overview</h2>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 text-sm font-medium transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> 
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium">{error}</div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 shadow-sm" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Stat cards including Blog Articles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Messages"    value={data.contacts.total}    sub={`${data.contacts.new} new`}           icon={Inbox} />
            <StatCard label="Quotes"      value={data.quotes.total}      sub={`${data.quotes.pending} pending`}     icon={ClipboardList} />
            <StatCard label="Subscribers" value={data.newsletter.total}  sub="newsletter"                          icon={Users} />
            <StatCard label="Projects"    value={data.projects.active}   sub={`${data.projects.featured} featured`} icon={Building2} />
            <StatCard label="Reviews"     value={data.testimonials.total} sub={`${data.testimonials.pending} pending`} icon={Award} />
            <Link href="/admin/blogs" className="block group transition-transform hover:-translate-y-0.5">
              <StatCard label="Articles"  value={totalArticles} sub={`${publishedArticles} published`} icon={BookOpen} />
            </Link>
          </div>

          {/* Dedicated Blog Articles Section */}
          <div className="bg-white border border-slate-200/80 shadow-sm shadow-slate-200/50 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-slate-100 bg-white gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 border border-red-100 flex items-center justify-center text-construction-red shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-sm tracking-tight">Blog & Industry Insights</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Publish articles, build FAQs, and optimize SEO ranking</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/blogs"
                  className="inline-flex items-center gap-1.5 bg-construction-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Write New Article
                </Link>
                <Link
                  href="/admin/blogs"
                  className="text-construction-navy text-[13px] font-semibold hover:text-blue-700 transition-colors"
                >
                  Manage CMS &rarr;
                </Link>
              </div>
            </div>

            {recentBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 flex-1">
                <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-900 font-semibold text-sm">No blog articles published yet</p>
                <p className="text-slate-500 text-xs mt-1 mb-4 max-w-sm">
                  Create informative guides, construction updates, and local SEO insights for Hindustan Projects.
                </p>
                <Link
                  href="/admin/blogs"
                  className="inline-flex items-center gap-1.5 bg-construction-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 transition-colors shadow-sm"
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
                            className="text-slate-900 text-[14px] font-bold hover:text-construction-red transition-colors block truncate"
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
                          title="View live post"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Live</span>
                        </Link>
                        <Link
                          href="/admin/blogs"
                          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-construction-navy hover:bg-blue-900 px-3.5 py-1.5 transition-colors shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit in CMS</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent contacts */}
            <div className="bg-white border border-slate-200/80 shadow-sm shadow-slate-200/50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
                <h3 className="text-slate-900 font-bold text-sm tracking-tight">Recent Messages</h3>
                <Link href="/admin/contacts" className="text-construction-navy text-[13px] font-semibold hover:text-blue-700 transition-colors">View all &rarr;</Link>
              </div>
              {data.recentContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 flex-1">
                  <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm">
                    <Inbox className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-900 font-semibold text-sm">No new messages</p>
                  <p className="text-slate-500 text-xs mt-1">When users contact you, they will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.recentContacts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-6 py-4 gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                          {(c.name || "U").charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-900 text-[13.5px] font-semibold truncate group-hover:text-construction-navy transition-colors">{c.name || "Anonymous"}</p>
                          <p className="text-slate-500 text-[12px] truncate">{c.email || ""}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent quotes */}
            <div className="bg-white border border-slate-200/80 shadow-sm shadow-slate-200/50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
                <h3 className="text-slate-900 font-bold text-sm tracking-tight">Recent Quote Requests</h3>
                <Link href="/admin/quotes" className="text-construction-navy text-[13px] font-semibold hover:text-blue-700 transition-colors">View all &rarr;</Link>
              </div>
              {data.recentQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 flex-1">
                  <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm">
                    <ClipboardList className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-900 font-semibold text-sm">No quote requests yet</p>
                  <p className="text-slate-500 text-xs mt-1">Project inquiries will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.recentQuotes.map((q) => (
                    <div key={q.id} className="flex items-center justify-between px-6 py-4 gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                          {(q.name || "U").charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-900 text-[13.5px] font-semibold truncate group-hover:text-construction-navy transition-colors">{q.name || "Anonymous"}</p>
                          <p className="text-slate-500 text-[12px] truncate">{q.projectType} &middot; {q.budget}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
