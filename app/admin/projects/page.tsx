"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus, Pencil, Trash2, Star } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Project {
  id: string; title: string; category: string; location: string;
  date: string; image: string; description: string;
  featured: boolean; status: string; createdAt: string;
}

const EMPTY: Omit<Project, "id" | "createdAt"> = {
  title: "", category: "Commercial", location: "", date: "",
  image: "", description: "", featured: false, status: "active",
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving]     = useState(false);

  const fetchProjects = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/projects?category=All");
      const json = await res.json();
      if (json.success) setProjects(json.data);
      else setError(json.error || "Failed to load projects");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res  = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { setShowForm(false); setForm(EMPTY); fetchProjects(); }
      else setError(json.error || "Failed to save");
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchProjects();
    } catch { /* silent */ }
  };

  const toggleFeatured = async (p: Project) => {
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, featured: !p.featured }),
    });
    fetchProjects();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={fetchProjects} disabled={loading}
          className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">New Project</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {(["title", "location", "date", "image"] as const).map((field) => (
              <div key={field}>
                <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">{field}</label>
                <input required value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Commercial</option><option>Residential</option><option>Industrial</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="featured" checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="w-4 h-4 accent-blue-500" />
              <label htmlFor="featured" className="text-gray-300 text-sm">Featured project</label>
            </div>
          </div>
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Save Project"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Project</th>
                <th className="text-left px-5 py-3 font-semibold">Category</th>
                <th className="text-left px-5 py-3 font-semibold">Location</th>
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-left px-5 py-3 font-semibold">Featured</th>
                <th className="text-left px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded-lg" /></td>
                    ))}
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-16">No projects yet. Click "Add Project" to create one.</td></tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{p.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">{p.description}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{p.category}</td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{p.location}</td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{p.date}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleFeatured(p)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${p.featured ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-800 text-gray-600 hover:text-yellow-400"}`}>
                        <Star className={`w-3.5 h-3.5 ${p.featured ? "fill-yellow-400" : ""}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => deleteProject(p.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-800 text-gray-500 text-xs">{projects.length} projects</div>
      </div>
    </div>
  );
}
