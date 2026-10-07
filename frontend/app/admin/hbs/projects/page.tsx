"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Save,
  MapPin,
  Calendar
} from "lucide-react";
import type { HbsProject } from "@/lib/types";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";

const EMPTY_PROJECT: Partial<HbsProject> = {
  title: "",
  slug: "",
  location: "Rajasthan",
  serviceCategory: "Structure Repair",
  description: "",
  images: "",
  beforeAfterImages: "",
  date: "2024",
  status: "completed",
  order: 1,
  active: true,
};

export default function HbsAdminProjects() {
  const [projects, setProjects] = useState<HbsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProject, setEditingProject] = useState<Partial<HbsProject> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  const loadProjects = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/projects?all=true", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setProjects(json.data);
      } else {
        setMessage({ text: json.error || "Failed to load projects", type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to connect to backend API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(search.toLowerCase())) ||
      (p.serviceCategory && p.serviceCategory.toLowerCase().includes(search.toLowerCase()))
  );

  const openEditModal = (project: Partial<HbsProject>) => {
    setEditingProject(project);
  };

  const closeModal = () => {
    setEditingProject(null);
  };

  const handleToggleActive = async (project: HbsProject) => {
    try {
      const res = await fetch(`/api/hbs/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active: !project.active }),
      });
      const json = await res.json();
      if (json.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, active: !project.active } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/hbs/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setMessage({ text: `Project "${title}" deleted.`, type: "success" });
      } else {
        setMessage({ text: json.error || "Failed to delete project", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSaving(true);
    setMessage({ text: "", type: "" });

    const payload = {
      ...editingProject,
      order: Number(editingProject.order) || 0,
    };

    const isEdit = Boolean(editingProject.id);
    const url = isEdit ? `/api/hbs/projects/${editingProject.id}` : "/api/hbs/projects";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({
          text: `Project ${isEdit ? "updated" : "created"} successfully!`,
          type: "success",
        });
        closeModal();
        loadProjects();

        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/hbs", "/hbs/projects"] }),
          });
        } catch {}
      } else {
        setMessage({ text: json.error || "Failed to save project.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Apple-minimal Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Projects" }]}
        title="Projects & Case Studies"
        description="Publish completed rehabilitation projects, scope details, and verified before/after imagery."
      >
        <button
          onClick={loadProjects}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reload</span>
        </button>

        <button
          onClick={() => openEditModal(EMPTY_PROJECT)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </HbsAdminPageHeader>

      {message.text && (
        <div
          className={`p-4 text-xs flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, location, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 focus:bg-white focus:outline-amber-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-500">
          Showing: <strong className="text-slate-900">{filteredProjects.length}</strong> Projects
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">Project Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3">Order</th>
              <th className="p-3">Visibility</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No projects added yet. Click &quot;Add Project&quot; to publish your first verified HBS case study.
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-sm">{project.title}</div>
                    {project.slug && (
                      <div className="text-slate-400 text-[11px] font-mono">{project.slug}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px]">
                      {project.serviceCategory || "General"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{project.location || "Rajasthan"}</span>
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-50 text-amber-800">
                      {project.status || "completed"}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{project.order}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(project)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase transition-colors ${
                        project.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      {project.active ? (
                        <>
                          <Eye className="w-3 h-3 text-green-700" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-slate-500" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(project)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project.id || "", project.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-2xl my-8 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase text-slate-900 font-display">
                  {editingProject.id ? "Edit Project" : "Add HBS Project / Case Study"}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingProject.id ? `Editing: ${editingProject.title}` : "Provide project details"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title || ""}
                  onChange={(e) =>
                    setEditingProject((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full text-xs border border-slate-300 p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Service Category
                  </label>
                  <input
                    type="text"
                    value={editingProject.serviceCategory || ""}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, serviceCategory: e.target.value }))
                    }
                    placeholder="e.g. Structure Repair, Waterproofing"
                    className="w-full text-xs border border-slate-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingProject.location || ""}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="e.g. Bhilwara / Jaipur"
                    className="w-full text-xs border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Project Description / Engineering Scope
                </label>
                <textarea
                  rows={4}
                  value={editingProject.description || ""}
                  onChange={(e) =>
                    setEditingProject((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full text-xs border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={editingProject.status || "completed"}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full text-xs border border-slate-300 p-2 bg-white"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress / Ongoing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={editingProject.order ?? 0}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, order: Number(e.target.value) }))
                    }
                    className="w-full text-xs border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="projectActive"
                  checked={editingProject.active !== false}
                  onChange={(e) =>
                    setEditingProject((prev) => ({ ...prev, active: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="projectActive" className="text-xs font-bold text-slate-700 uppercase">
                  Active & Visible on Public Site
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
