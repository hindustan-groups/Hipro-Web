"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus, Trash2, Star, CheckCircle, Clock, Filter, Pencil, ImageIcon, Search, ArrowUpDown } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import MultiImageUpload from "@/components/admin/MultiImageUpload";

interface Project {
  id: string; 
  title: string; 
  category: string; 
  location: string;
  date: string; 
  image: string; 
  images?: string;
  description: string;
  featured: boolean; 
  status: string; // "completed", "archived", "ongoing", "active"
  createdAt: string;
}

const EMPTY: Omit<Project, "id" | "createdAt"> = {
  title: "", 
  category: "Commercial", 
  location: "", 
  date: "",
  image: "", 
  images: "",
  description: "", 
  featured: false, 
  status: "active", // active/ongoing by default
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm]         = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving]     = useState(false);
  
  // Tab filter: "all", "completed", "ongoing"
  const [statusTab, setStatusTab]           = useState<"all" | "completed" | "ongoing">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery]       = useState<string>("");
  const [sortBy, setSortBy]                 = useState<"newest" | "oldest" | "title">("newest");

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

  const handleStartAdd = () => {
    setEditingProject(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const handleStartEdit = (p: Project) => {
    setEditingProject(p);
    setForm({
      title: p.title || "",
      category: p.category || "Commercial",
      location: p.location || "",
      date: p.date || "",
      image: p.image || "",
      images: p.images || "",
      description: p.description || "",
      featured: p.featured ?? false,
      status: p.status || "active",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const isEdit = !!editingProject;
      const url = "/api/projects";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit ? { id: editingProject.id, ...form } : form;

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) { 
        setShowForm(false); 
        setEditingProject(null);
        setForm(EMPTY); 
        fetchProjects(); 
      }
      else setError(json.error || "Failed to save project");
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

  const toggleStatus = async (p: Project) => {
    const isCompleted = p.status === "completed" || p.status === "archived";
    const nextStatus = isCompleted ? "active" : "completed";
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, status: nextStatus }),
    });
    fetchProjects();
  };

  // Filter & Sort logic
  const completedProjects = projects.filter(p => p.status === "completed" || p.status === "archived");
  const ongoingProjects   = projects.filter(p => p.status === "active" || p.status === "ongoing");

  let filteredProjects = statusTab === "completed" 
    ? completedProjects 
    : statusTab === "ongoing" 
    ? ongoingProjects 
    : projects;

  if (categoryFilter !== "All") {
    filteredProjects = filteredProjects.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredProjects = filteredProjects.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.location.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  filteredProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "newest") {
      return (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0);
    }
    if (sortBy === "oldest") {
      return (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0);
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Projects Portfolio</h1>
          <p className="text-slate-500 text-sm">Manage ongoing and completed construction projects and their image galleries.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={fetchProjects} disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3.5 py-2 rounded-none text-xs font-medium disabled:opacity-50 transition-colors shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={handleStartAdd}
            className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-5 py-2 rounded-none text-sm font-semibold transition-colors shadow-md shadow-blue-900/20">
            <Plus className="w-4 h-4" /> Add New Project
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Status Tabs (All / Completed / Ongoing) */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusTab("all")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              statusTab === "all"
                ? "border-construction-navy text-construction-navy bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            All ({projects.length})
          </button>

          <button
            onClick={() => setStatusTab("ongoing")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              statusTab === "ongoing"
                ? "border-amber-500 text-amber-700 bg-amber-50/50"
                : "border-transparent text-slate-500 hover:text-amber-600"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Ongoing ({ongoingProjects.length})
          </button>

          <button
            onClick={() => setStatusTab("completed")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              statusTab === "completed"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-500 hover:text-emerald-600"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Completed ({completedProjects.length})
          </button>
        </div>

        {/* Search, Category & Sorting Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="bg-white border border-slate-200 text-slate-900 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy w-44"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
          >
            <option value="All">All Categories</option>
            <option value="Commercial">Commercial</option>
            <option value="Residential">Residential</option>
            <option value="Industrial">Industrial</option>
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold uppercase tracking-wider text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="p-4 rounded-none bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

      {/* Add / Edit Project Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-construction-navy shadow-lg rounded-none p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-slate-900 font-bold text-lg">
              {editingProject ? `Edit Project & Images: "${editingProject.title}"` : "New Construction Project"}
            </h3>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingProject(null); }}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase"
            >
              Close
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {(["title", "location", "date"] as const).map((field) => (
              <div key={field}>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">{field}</label>
                <input required value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder={`e.g. ${field === "title" ? "Cyber Tower Phase 2" : field === "location" ? "New Delhi" : "2024 - 2026"}`}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
              </div>
            ))}

            {/* Category */}
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all">
                <option>Commercial</option>
                <option>Residential</option>
                <option>Industrial</option>
              </select>
            </div>

            {/* Project Status */}
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Project Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-semibold">
                <option value="active">Ongoing (In Progress)</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Main Cover Image */}
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Main Cover Image</label>
              <ImageUpload value={form.image} onChange={(url) => setForm((p) => ({ ...p, image: url }))} />
            </div>

            {/* Additional Project Gallery Images */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-slate-500 text-xs uppercase tracking-wider block font-medium">
                Gallery Photos for Existing Project (Upload or add multiple photos)
              </label>
              <MultiImageUpload
                value={
                  form.images 
                    ? (form.images.trim().startsWith("[") 
                        ? (() => { try { return JSON.parse(form.images); } catch { return []; } })()
                        : form.images.split("\n").map(s => s.trim()).filter(Boolean))
                    : []
                }
                onChange={(urls) => setForm((p) => ({ ...p, images: JSON.stringify(urls) }))}
              />
              <p className="text-slate-400 text-xs mt-1">Upload multiple photos or paste image links. All photos will display in this project&apos;s photo gallery.</p>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="featured" checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="w-4 h-4 accent-construction-navy" />
              <label htmlFor="featured" className="text-slate-700 text-sm font-medium cursor-pointer">Featured Project (Display on Homepage)</label>
            </div>
          </div>

          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Provide key details about structural scope, square footage, engineering highlights..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none transition-all" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2.5 rounded-none text-sm font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20">
              {saving ? "Saving..." : editingProject ? "Update Project & Photos" : "Save New Project"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingProject(null); }}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-2.5 rounded-none text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Projects Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 font-semibold">Project</th>
                <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold">Category</th>
                <th className="text-left px-5 py-3.5 font-semibold">Location</th>
                <th className="text-left px-5 py-3.5 font-semibold">Date</th>
                <th className="text-left px-5 py-3.5 font-semibold">Featured</th>
                <th className="text-left px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded-none" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-16">
                    No projects found for this filter tab.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const isDone = p.status === "completed" || p.status === "archived";
                  let galleryCount = 0;
                  if (p.images) {
                    try {
                      galleryCount = p.images.trim().startsWith("[") 
                        ? JSON.parse(p.images).length 
                        : p.images.split("\n").filter(Boolean).length;
                    } catch { galleryCount = 0; }
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {p.image && (
                            <img src={p.image} alt={p.title} className="w-10 h-10 object-cover rounded-none border border-slate-200 shrink-0" />
                          )}
                          <div>
                            <p className="text-slate-900 font-semibold">{p.title}</p>
                            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{p.description}</p>
                            {galleryCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-construction-navy bg-blue-50 px-1.5 py-0.5 border border-blue-100 mt-1">
                                <ImageIcon className="w-3 h-3" /> {galleryCount} Gallery Photos
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Column with 1-click Toggle */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(p)}
                          title="Click to toggle status between Ongoing and Completed"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none border transition-all cursor-pointer ${
                            isDone 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              <span>Ongoing</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                          {p.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{p.location}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{p.date}</td>

                      <td className="px-5 py-4">
                        <button onClick={() => toggleFeatured(p)} className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors ${p.featured ? "bg-yellow-100 text-yellow-600 border border-yellow-200" : "bg-slate-50 border border-slate-200 text-slate-400 hover:text-yellow-500"}`}>
                          <Star className={`w-4 h-4 ${p.featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                        </button>
                      </td>

                      {/* Edit & Delete Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(p)}
                            title="Edit Project Details & Add Images"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-construction-navy hover:text-construction-navy text-slate-600 text-xs font-semibold rounded-none transition-all shadow-sm"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit / Add Photos</span>
                          </button>
                          
                          <button
                            onClick={() => deleteProject(p.id)}
                            title="Delete Project"
                            className="w-8 h-8 rounded-none bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 flex items-center justify-center transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium flex items-center justify-between">
          <span>Showing {filteredProjects.length} of {projects.length} projects</span>
          <div className="flex gap-4 text-xs font-medium">
            <span className="text-amber-700 font-semibold">{ongoingProjects.length} Ongoing</span>
            <span className="text-emerald-700 font-semibold">{completedProjects.length} Completed</span>
          </div>
        </div>
      </div>

    </div>
  );
}
