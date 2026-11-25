"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  CheckCircle,
  Clock,
  RefreshCw,
  Trash2,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  ExternalLink,
  X,
  UserCheck,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import QuickMailModal, { QuickMailRecipient } from "@/components/admin/QuickMailModal";
import type { JobApplication } from "@/lib/types";
import { getAdminCache, setAdminCache } from "@/lib/adminCache";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Deletion modal state
  const [appToDelete, setAppToDelete] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [successBanner, setSuccessBanner] = useState("");
  const [mailRecipient, setMailRecipient] = useState<QuickMailRecipient | null>(null);

  const openApplicationMail = (app: JobApplication) => {
    if (!app.email) return;
    setMailRecipient({
      name: app.name || "Candidate",
      email: app.email,
      phone: app.phone,
      leadId: app.id,
      leadType: "application",
      brand: "hipro",
      triggerKey: "contact_inquiries",
      contextBadge: `${app.role || "Role"}${app.experience ? ` · ${app.experience}` : ""}`,
      defaultNextStatus: app.status === "new" ? "reviewed" : "",
    });
  };

  const fetchApplications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setApplications(json.data || []);
        setAdminCache("admin:applications_list", json.data || []);
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
    const cached = getAdminCache<JobApplication[]>("admin:applications_list");
    if (cached) {
      setApplications(cached);
      setLoading(false);
    }
    fetchApplications(!cached);
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

  const handleDeleteApplication = async () => {
    if (!appToDelete?.id) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/applications/${appToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) => prev.filter((app) => app.id !== appToDelete.id));
        setSuccessBanner(`Candidate application for "${appToDelete.name}" deleted.`);
        setAppToDelete(null);
        setTimeout(() => setSuccessBanner(""), 4500);
      } else {
        setDeleteError(json.error || "Failed to delete application");
      }
    } catch (err: any) {
      setDeleteError(err.message || "Network error deleting application");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchFilter = filter === "all" || app.status === filter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        app.name?.toLowerCase().includes(q) ||
        app.role?.toLowerCase().includes(q) ||
        app.email?.toLowerCase().includes(q) ||
        app.phone?.includes(q);
      return matchFilter && matchSearch;
    });
  }, [applications, filter, search]);

  const stats = useMemo(() => {
    const total = applications.length;
    const newCount = applications.filter((a) => a.status === "new").length;
    const reviewed = applications.filter((a) => a.status === "reviewed").length;
    const approved = applications.filter(
      (a) => a.status === "approved" || a.status === "interviewed"
    ).length;
    return { total, newCount, reviewed, approved };
  }, [applications]);

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* ── Top Header Glass Breadcrumb ───────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.03)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                href="/admin/hipro"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-all shadow-2xs group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to HiPRO Overview</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Careers Talent Pool
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Candidate Resumes &amp; Job Applications
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
              Review engineering, site supervisor, and managerial applicants submitted through the Careers portal.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/admin/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Manage Job Postings</span>
            </Link>
            <button
              onClick={() => fetchApplications(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Summary Bento Bar ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Candidates", count: stats.total, filterKey: "all" },
          { label: "New / Unread", count: stats.newCount, filterKey: "new" },
          { label: "Under Review", count: stats.reviewed, filterKey: "reviewed" },
          { label: "Shortlisted / Interviewed", count: stats.approved, filterKey: "interviewed" },
        ].map((s) => {
          const isActive = filter === s.filterKey;
          return (
            <button
              key={s.filterKey}
              onClick={() => setFilter(s.filterKey)}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                isActive
                  ? "bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-sm"
                  : "bg-white/80 hover:bg-white border-slate-200/70 shadow-2xs"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {s.label}
              </p>
              <p className="text-xl font-black text-slate-900 font-display mt-0.5">
                {s.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar: Search & Filter Tabs ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, role, email..."
            className="w-full bg-white/90 border border-slate-200/80 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 overflow-x-auto w-full sm:w-auto">
          {["all", "new", "reviewed", "interviewed", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                filter === st
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st} {st !== "all" && `(${applications.filter((a) => a.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner("")} className="text-xs uppercase font-bold text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-sm flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs uppercase font-bold text-red-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Table Glass Container ─────────────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_30px_rgba(15,23,42,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs font-bold font-mono uppercase tracking-wider">Loading Applications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-base text-slate-800">No applications found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || filter !== "all"
                ? "Try adjusting your filters or search query."
                : "When candidates apply through hindustanprojects.in/careers, their CVs will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/70 text-slate-500 text-[11px] font-mono uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Candidate Details</th>
                  <th className="px-6 py-4 font-bold">Applied Role</th>
                  <th className="px-6 py-4 font-bold">Experience</th>
                  <th className="px-6 py-4 font-bold">Date Applied</th>
                  <th className="px-6 py-4 font-bold">Pipeline Stage</th>
                  <th className="px-6 py-4 font-bold text-center">Resume / CV</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Candidate Name & Contacts */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{app.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-mono">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <button
                          type="button"
                          onClick={() => openApplicationMail(app)}
                          className="hover:text-blue-600 hover:underline cursor-pointer text-left"
                        >
                          {app.email}
                        </button>
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a href={`tel:${app.phone}`} className="hover:text-blue-600 hover:underline">
                            {app.phone}
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Position */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-900 bg-blue-50/80 border border-blue-200/80 px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-blue-600" />
                        <span>{app.role}</span>
                      </span>
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-4 font-semibold text-slate-800 text-xs">
                      {app.experience || "N/A"}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent"}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={app.status || "new"}
                        onChange={(e) => updateStatus(app.id!, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none transition-all shadow-2xs ${
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
                        <option value="reviewed">🟡 Under Review</option>
                        <option value="interviewed">🟢 Shortlisted</option>
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all"
                          title="Open Resume in new tab"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-300" />
                          <span>View CV</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No File</span>
                      )}
                    </td>

                    {/* Mail & Delete Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {app.email && (
                          <button
                            onClick={() => openApplicationMail(app)}
                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-xl transition-colors cursor-pointer"
                            title="Send Interview / Status Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDeleteError("");
                            setAppToDelete(app);
                          }}
                          className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-3.5 border-t border-slate-200/70 bg-slate-50/50 text-slate-500 text-xs font-medium flex items-center justify-between">
          <span className="font-mono text-[11px]">{filtered.length} candidates listed</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {stats.newCount} new • {stats.reviewed} review • {stats.approved} shortlisted
          </span>
        </div>
      </div>

      {/* Modern Apple Cupertino Glassmorphic Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!appToDelete}
        title="Delete Job Application?"
        description="Are you sure you want to permanently delete this candidate's application? The uploaded resume reference and contact history will be permanently removed."
        recordDetail={
          appToDelete
            ? {
                title: appToDelete.name || "Candidate",
                subtitle: appToDelete.email || appToDelete.phone || "No contact info",
                tag: appToDelete.role || "Job Application",
                date: appToDelete.createdAt ? new Date(appToDelete.createdAt).toLocaleDateString("en-IN") : undefined,
              }
            : undefined
        }
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteApplication}
        onCancel={() => {
          if (!isDeleting) {
            setAppToDelete(null);
            setDeleteError("");
          }
        }}
      />

      <QuickMailModal
        isOpen={Boolean(mailRecipient)}
        onClose={() => setMailRecipient(null)}
        recipient={mailRecipient}
        onSentSuccess={({ email, updatedStatus }) => {
          if (updatedStatus && mailRecipient?.leadId) {
            setApplications((prev) =>
              prev.map((a) => (a.id === mailRecipient.leadId ? { ...a, status: updatedStatus } : a))
            );
          }
          setSuccessBanner(`Official email sent to applicant ${email}!`);
          setTimeout(() => setSuccessBanner(""), 4000);
        }}
      />
    </div>
  );
}
