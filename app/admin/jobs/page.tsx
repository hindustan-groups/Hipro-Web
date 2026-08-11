"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import type { JobPosting } from "@/lib/types";

const EMPTY: Omit<JobPosting, "id" | "createdAt" | "updatedAt"> = {
  title: "", type: "Full-Time", location: "", description: "", order: 99, active: true,
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/jobs");
      const json = await res.json();
      if (json.success) setJobs(json.data);
      else setError(json.error || "Failed to load jobs");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { setShowForm(false); setForm(EMPTY); fetchJobs(); }
      else setError(json.error || "Failed to save");
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const deleteJob = async (id?: string) => {
    if (!id || !confirm("Delete this job posting?")) return;
    try {
      await fetch(`/api/jobs`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchJobs();
    } catch { /* silent */ }
  };

  const toggleActive = async (j: JobPosting) => {
    await fetch(`/api/jobs`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: j.id, active: !j.active }),
    });
    fetchJobs();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={fetchJobs} disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-none-none text-xs font-medium disabled:opacity-50 transition-colors shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-4 py-2 rounded-none-none text-sm font-semibold transition-colors shadow-md shadow-blue-900/20">
          <Plus className="w-4 h-4" /> Add Job Posting
        </button>
      </div>

      {error && <div className="p-4 rounded-none-none bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-none-none p-6 space-y-4">
          <h3 className="text-slate-900 font-bold text-lg">New Job Posting</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Job Title *</label>
              <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Job Type *</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all">
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Location *</label>
              <input required value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Order Index (Low = First)</label>
              <input type="number" required value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 99 }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2 rounded-none-none text-sm font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20">
              {saving ? "Saving..." : "Save Job"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-2 rounded-none-none text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-none-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 font-semibold">Title</th>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold">Location</th>
                <th className="px-5 py-3.5 font-semibold">Order</th>
                <th className="px-5 py-3.5 font-semibold text-center">Active</th>
                <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded-none-none w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-500 py-16">No job postings yet. Click &quot;Add Job Posting&quot; to create one.</td></tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className={`transition-colors ${j.active === false ? "opacity-50 bg-slate-50/50" : "hover:bg-slate-50"}`}>
                    <td className="px-5 py-4 font-bold text-slate-900">{j.title}</td>
                    <td className="px-5 py-4 text-slate-600"><span className="px-2 py-1 bg-slate-100 rounded-none-none text-xs">{j.type}</span></td>
                    <td className="px-5 py-4 text-slate-600">{j.location}</td>
                    <td className="px-5 py-4 text-slate-600">{j.order}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button onClick={() => toggleActive(j)} className={`w-8 h-8 rounded-none-none flex items-center justify-center transition-colors ${j.active !== false ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700"}`}>
                          {j.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button onClick={() => deleteJob(j.id)}
                          className="w-8 h-8 rounded-none-none bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 flex items-center justify-center transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium">{jobs.length} job postings</div>
      </div>
    </div>
  );
}
