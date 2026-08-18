"use client";

import { useEffect, useState } from "react";
import { 
  Download, FileText, CheckCircle, Clock, RefreshCw, 
  Trash2, Search, UserCheck, XCircle, Mail, Phone, Briefcase 
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import type { JobApplication } from "@/lib/types";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setApplications(json.data || []);
      } else {
        setError(json.error || "Failed to load applications");
      }
    } catch {
      setError("Network error loading applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status } : app))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job application?")) return;
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) => prev.filter((app) => app.id !== id));
      }
    } catch (err) {
      console.error("Error deleting application:", err);
    }
  };

  const filtered = applications.filter((app) => {
    const matchFilter = filter === "all" || app.status === filter;
    const matchSearch =
      search === "" ||
      app.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.role?.toLowerCase().includes(search.toLowerCase()) ||
      app.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.phone?.includes(search);
    return matchFilter && matchSearch;
  });

  const countNew = applications.filter((a) => a.status === "new").length;
  const countReviewed = applications.filter((a) => a.status === "reviewed").length;
  const countApproved = applications.filter((a) => a.status === "approved" || a.status === "interviewed").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-construction-red font-bold text-xs uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" /> Recruitment Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display uppercase tracking-tight">
            Job Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, download candidate resumes, and manage hiring stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApplications}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Applicants</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{applications.length}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">New / Unread</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{countNew}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Under Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{countReviewed}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Interviewed / Shortlisted</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{countApproved}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, role, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["all", "new", "reviewed", "interviewed", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                filter === st
                  ? "bg-construction-navy text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st} {st !== "all" && `(${applications.filter((a) => a.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading Applications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm font-semibold">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-base text-slate-800">No applications found</p>
            <p className="text-xs text-slate-500 mt-1">
              {search || filter !== "all"
                ? "Try adjusting your filters or search query."
                : "When candidates apply through the Careers page, their profiles will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Candidate Details</th>
                  <th className="px-6 py-4">Applied Role</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Date Applied</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Resume / CV</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Candidate Name & Contacts */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{app.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <a href={`mailto:${app.email}`} className="hover:text-construction-navy hover:underline">
                          {app.email}
                        </a>
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a href={`tel:${app.phone}`} className="hover:text-construction-navy hover:underline">
                            {app.phone}
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Position */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-construction-navy bg-blue-50/80 border border-blue-100 px-3 py-1 rounded-lg text-xs">
                        {app.role}
                      </span>
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-4 font-semibold text-slate-800 text-xs">
                      {app.experience || "N/A"}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={app.status || "new"}
                        onChange={(e) => updateStatus(app.id!, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none ${
                          app.status === "new"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : app.status === "reviewed"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : app.status === "interviewed" || app.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <option value="new">🔵 New</option>
                        <option value="reviewed">🟡 Reviewed</option>
                        <option value="interviewed">🟢 Interviewed</option>
                        <option value="rejected">🔴 Rejected</option>
                      </select>
                    </td>

                    {/* Resume / CV Link */}
                    <td className="px-6 py-4 text-center">
                      {app.cvUrl ? (
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-construction-navy hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:scale-105"
                          title="Open Resume in new tab"
                        >
                          <Download className="w-3.5 h-3.5 text-yellow-400" />
                          View CV
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No File</span>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteApplication(app.id!)}
                        className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
