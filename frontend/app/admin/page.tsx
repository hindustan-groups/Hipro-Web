"use client";

import { useEffect, useState } from "react";
import { Inbox, ClipboardList, Users, Building2, Award, RefreshCw } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

interface DashboardData {
  contacts:     { total: number; new: number; read: number; replied: number };
  quotes:       { total: number; pending: number; reviewed: number; approved: number; rejected: number };
  newsletter:   { total: number };
  projects:     { total: number; active: number; featured: number };
  testimonials: { total: number; pending: number; approved: number };
  recentContacts: { id: string; name: string; email: string; message: string; status: string; createdAt: string }[];
  recentQuotes:   { id: string; name: string; email: string; projectType: string; budget: string; status: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error || "Failed to load dashboard");
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">Welcome back, Admin</p>
          <h2 className="text-slate-900 font-bold text-2xl">Overview</h2>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-none-none text-sm font-medium transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> 
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-none-none bg-red-50 border border-red-100 text-red-600 text-sm font-medium">{error}</div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 shadow-sm rounded-none-none" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Messages"   value={data.contacts.total}    sub={`${data.contacts.new} new`}           icon={Inbox} />
            <StatCard label="Quotes"     value={data.quotes.total}      sub={`${data.quotes.pending} pending`}     icon={ClipboardList} />
            <StatCard label="Subscribers"value={data.newsletter.total}  sub="newsletter"                          icon={Users} />
            <StatCard label="Projects"   value={data.projects.active}   sub={`${data.projects.featured} featured`} icon={Building2} />
            <StatCard label="Reviews"    value={data.testimonials.total} sub={`${data.testimonials.pending} pending`} icon={Award} />
          </div>

          {/* Recent activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent contacts */}
            <div className="bg-white border border-slate-200/80 shadow-sm shadow-slate-200/50 rounded-none-none overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
                <h3 className="text-slate-900 font-bold text-sm tracking-tight">Recent Messages</h3>
                <a href="/admin/contacts" className="text-construction-navy text-[13px] font-semibold hover:text-blue-700 transition-colors">View all &rarr;</a>
              </div>
              {data.recentContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 flex-1">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-none-full flex items-center justify-center mb-3 shadow-sm">
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
                        <div className="w-9 h-9 shrink-0 rounded-none-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
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
            <div className="bg-white border border-slate-200/80 shadow-sm shadow-slate-200/50 rounded-none-none overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
                <h3 className="text-slate-900 font-bold text-sm tracking-tight">Recent Quote Requests</h3>
                <a href="/admin/quotes" className="text-construction-navy text-[13px] font-semibold hover:text-blue-700 transition-colors">View all &rarr;</a>
              </div>
              {data.recentQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 flex-1">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-none-full flex items-center justify-center mb-3 shadow-sm">
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
                        <div className="w-9 h-9 shrink-0 rounded-none-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
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
