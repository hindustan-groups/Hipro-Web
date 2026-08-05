"use client";

import { useEffect, useState } from "react";
import { Mail, FileText, Users, FolderOpen, Star, RefreshCw } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";

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
          <p className="text-gray-500 text-sm">Welcome back, Admin</p>
          <h2 className="text-white font-bold text-xl">Overview</h2>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-2xl" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Messages"   value={data.contacts.total}    sub={`${data.contacts.new} new`}           icon={Mail}      gradient="from-blue-500 to-indigo-600" />
            <StatCard label="Quotes"     value={data.quotes.total}      sub={`${data.quotes.pending} pending`}     icon={FileText}  gradient="from-red-500 to-orange-500" />
            <StatCard label="Subscribers"value={data.newsletter.total}  sub="newsletter"                          icon={Users}     gradient="from-blue-600 to-purple-600" />
            <StatCard label="Projects"   value={data.projects.active}   sub={`${data.projects.featured} featured`} icon={FolderOpen} gradient="from-red-500 to-rose-600" />
            <StatCard label="Reviews"    value={data.testimonials.total} sub={`${data.testimonials.pending} pending`} icon={Star}  gradient="from-blue-500 to-cyan-500" />
          </div>

          {/* Recent activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent contacts */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <h3 className="text-white font-semibold text-sm">Recent Messages</h3>
                <a href="/admin/contacts" className="text-blue-400 text-xs hover:underline">View all</a>
              </div>
              {data.recentContacts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-10">No messages yet</p>
              ) : (
                <div className="divide-y divide-gray-800">
                  {data.recentContacts.map((c) => (
                    <div key={c.id} className="flex items-start justify-between px-5 py-3 gap-3 hover:bg-gray-800/40 transition-colors">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{c.name}</p>
                        <p className="text-gray-500 text-xs truncate">{c.email}</p>
                        <p className="text-gray-600 text-xs mt-0.5 truncate">{c.message}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent quotes */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <h3 className="text-white font-semibold text-sm">Recent Quote Requests</h3>
                <a href="/admin/quotes" className="text-blue-400 text-xs hover:underline">View all</a>
              </div>
              {data.recentQuotes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-10">No quotes yet</p>
              ) : (
                <div className="divide-y divide-gray-800">
                  {data.recentQuotes.map((q) => (
                    <div key={q.id} className="flex items-start justify-between px-5 py-3 gap-3 hover:bg-gray-800/40 transition-colors">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{q.name}</p>
                        <p className="text-gray-500 text-xs truncate">{q.projectType} · {q.budget}</p>
                      </div>
                      <StatusBadge status={q.status} />
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
