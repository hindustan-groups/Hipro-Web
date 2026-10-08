"use client";

import { useEffect, useState, useMemo } from "react";
import {
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
  Calendar,
  Star,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  FileText,
  Check,
  Sparkles,
  Clock,
  Building2,
  ArrowLeftRight,
} from "lucide-react";
import type { HbsProject } from "@/lib/types";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";

/* ────────────────────────────────────────────────────────────────
   Types & helpers
──────────────────────────────────────────────────────────────── */

interface BeforeAfterItem {
  before: string;
  after: string;
  title: string;
}

interface ProjectFormData {
  id?: string;
  title: string;
  slug: string;
  serviceCategory: string;
  clientType: string;
  location: string;
  status: string;
  date: string;
  order: number;
  featured: boolean;
  active: boolean;
  areaTreated: string;
  durationDays: string;
  heroImage: string;
  galleryImages: string[];
  beforeAfterList: BeforeAfterItem[];
  description: string;
  problemStatement: string;
  solutionStatement: string;
  resultStatement: string;
  scopeList: string[];
  metaTitle: string;
  metaDescription: string;
}

const POPULAR_CATEGORIES = [
  "Structure Repair",
  "Waterproofing",
  "Heritage Restoration",
  "Industrial Flooring",
  "Protective Coating",
  "Expansion Joints",
  "Structural Retrofitting",
  "Facade Rehabilitation",
];

const CLIENT_TYPES = [
  "Residential Society",
  "Commercial Complex",
  "Industrial Plant",
  "Heritage Property",
  "Institutional / School",
  "Government / Infrastructure",
  "Individual Homeowner",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseStringList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v ?? "").trim()).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v ?? "").trim()).filter(Boolean);
    } catch {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function toProjectForm(p?: Partial<HbsProject> | null): ProjectFormData {
  if (!p) {
    return {
      title: "",
      slug: "",
      serviceCategory: "Structure Repair",
      clientType: "Residential Society",
      location: "Rajasthan",
      status: "completed",
      date: new Date().getFullYear().toString(),
      order: 1,
      featured: false,
      active: true,
      areaTreated: "",
      durationDays: "",
      heroImage: "",
      galleryImages: [],
      beforeAfterList: [],
      description: "",
      problemStatement: "",
      solutionStatement: "",
      resultStatement: "",
      scopeList: [],
      metaTitle: "",
      metaDescription: "",
    };
  }

  const allImages = parseStringList(p.images);
  const heroImage = allImages[0] || "";
  const galleryImages = allImages.slice(1);

  const rawBeforeAfter = parseJson<any[]>(p.beforeAfterImages, []);
  const beforeAfterList: BeforeAfterItem[] = Array.isArray(rawBeforeAfter)
    ? rawBeforeAfter.map((item) => ({
        before: String(item?.before ?? ""),
        after: String(item?.after ?? ""),
        title: String(item?.title ?? ""),
      }))
    : [];

  const rawScope = parseStringList(p.scopeOfWork);

  return {
    id: p.id,
    title: p.title || "",
    slug: p.slug || "",
    serviceCategory: p.serviceCategory || "Structure Repair",
    clientType: p.clientType || "Residential Society",
    location: p.location || "Rajasthan",
    status: p.status || "completed",
    date: p.date || "",
    order: Number(p.order) || 0,
    featured: Boolean(p.featured),
    active: p.active !== false,
    areaTreated: p.areaTreated || "",
    durationDays: p.durationDays !== null && p.durationDays !== undefined ? String(p.durationDays) : "",
    heroImage,
    galleryImages,
    beforeAfterList,
    description: p.description || "",
    problemStatement: p.problemStatement || "",
    solutionStatement: p.solutionStatement || "",
    resultStatement: p.resultStatement || "",
    scopeList: rawScope,
    metaTitle: p.metaTitle || "",
    metaDescription: p.metaDescription || "",
  };
}

function toProjectPayload(form: ProjectFormData) {
  const images = [form.heroImage.trim(), ...form.galleryImages.map((s) => s.trim())].filter(Boolean);
  const beforeAfterImages = form.beforeAfterList
    .map((item) => ({
      before: item.before.trim(),
      after: item.after.trim(),
      title: item.title.trim(),
    }))
    .filter((item) => item.before || item.after);

  const scopeOfWork = form.scopeList.map((s) => s.trim()).filter(Boolean);

  return {
    title: form.title.trim(),
    slug: form.slug.trim().toLowerCase() || slugify(form.title),
    location: form.location.trim() || null,
    serviceCategory: form.serviceCategory.trim() || null,
    clientType: form.clientType.trim() || null,
    description: form.description.trim() || null,
    scopeOfWork: scopeOfWork.length > 0 ? scopeOfWork : null,
    problemStatement: form.problemStatement.trim() || null,
    solutionStatement: form.solutionStatement.trim() || null,
    resultStatement: form.resultStatement.trim() || null,
    areaTreated: form.areaTreated.trim() || null,
    durationDays: form.durationDays.trim() ? Number(form.durationDays) : null,
    images: images.length > 0 ? images : null,
    beforeAfterImages: beforeAfterImages.length > 0 ? beforeAfterImages : null,
    date: form.date.trim() || null,
    status: form.status || "completed",
    featured: form.featured,
    active: form.active,
    order: Number(form.order) || 0,
    metaTitle: form.metaTitle.trim() || null,
    metaDescription: form.metaDescription.trim() || null,
  };
}

type ModalTab = "basic" | "media" | "case_study" | "seo";

/* ────────────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────────────── */

export default function HbsAdminProjects() {
  const [projects, setProjects] = useState<HbsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form modal state
  const [form, setForm] = useState<ProjectFormData | null>(null);
  const [modalTab, setModalTab] = useState<ModalTab>("basic");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete modal state
  const [projectToDelete, setProjectToDelete] = useState<HbsProject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Notifications
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  const loadProjects = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/projects?all=true", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
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

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !q ||
        [p.title, p.location, p.serviceCategory, p.clientType, p.slug]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && (p.status || "completed") === "completed") ||
        (statusFilter === "in_progress" && p.status === "in_progress") ||
        (statusFilter === "featured" && Boolean(p.featured));

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const openAddModal = () => {
    const next = toProjectForm(null);
    next.order = projects.length + 1;
    setForm(next);
    setModalTab("basic");
    setFormError("");
  };

  const openEditModal = (p: HbsProject) => {
    setForm(toProjectForm(p));
    setModalTab("basic");
    setFormError("");
  };

  const closeModal = () => {
    setForm(null);
    setFormError("");
  };

  const updateForm = <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // Quick toggle active
  const handleToggleActive = async (project: HbsProject) => {
    const nextActive = !project.active;
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, active: nextActive } : p))
    );
    try {
      const res = await fetch(`/api/hbs/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active: nextActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error();

      fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paths: ["/hbs", "/hbs/projects", `/hbs/projects/${project.slug}`],
        }),
      }).catch(() => {});
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, active: project.active } : p))
      );
      setMessage({ text: `Could not update visibility for "${project.title}".`, type: "error" });
    }
  };

  // Quick toggle featured
  const handleToggleFeatured = async (project: HbsProject) => {
    const nextFeatured = !project.featured;
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, featured: nextFeatured } : p))
    );
    try {
      const res = await fetch(`/api/hbs/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ featured: nextFeatured }),
      });
      const json = await res.json();
      if (!json.success) throw new Error();

      fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paths: ["/hbs", "/hbs/projects", `/hbs/projects/${project.slug}`],
        }),
      }).catch(() => {});
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: project.featured } : p))
      );
      setMessage({ text: `Could not toggle featured status for "${project.title}".`, type: "error" });
    }
  };

  // Confirm delete project
  const confirmDeleteProject = async () => {
    if (!projectToDelete?.id) return;
    setDeletingId(projectToDelete.id);
    try {
      const res = await fetch(`/api/hbs/projects/${projectToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) {
        setMessage({ text: json.error || "Failed to delete project.", type: "error" });
        return;
      }
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setMessage({ text: `Project "${projectToDelete.title}" deleted permanently.`, type: "success" });
      fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paths: ["/hbs", "/hbs/projects", `/hbs/projects/${projectToDelete.slug}`],
        }),
      }).catch(() => {});
      setProjectToDelete(null);
    } catch {
      setMessage({ text: "Network error occurred while deleting project.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  // Submit save (create or update)
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setFormError("");

    if (!form.title.trim()) {
      setModalTab("basic");
      setFormError("Project title is required.");
      return;
    }

    const isEdit = Boolean(form.id);
    const slug = form.slug.trim() || slugify(form.title);
    if (!slug) {
      setModalTab("basic");
      setFormError("Project slug is required.");
      return;
    }

    setSaving(true);
    const payload = toProjectPayload(form);
    const url = isEdit ? `/api/hbs/projects/${form.id}` : "/api/hbs/projects";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMessage({
          text: `Project "${payload.title}" ${isEdit ? "updated" : "published"} successfully!`,
          type: "success",
        });
        closeModal();
        loadProjects();

        fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paths: ["/hbs", "/hbs/projects", `/hbs/projects/${payload.slug}`],
          }),
        }).catch(() => {});
      } else {
        setFormError(json.error || "Failed to save project.");
      }
    } catch {
      setFormError("Network error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Helper to extract first image for table thumbnail
  const getThumbnail = (p: HbsProject) => {
    const list = parseStringList(p.images);
    return list[0] || null;
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Projects" }]}
        title="Projects & Case Studies"
        description="Publish completed rehabilitation projects, scope details, and verified before/after imagery."
      >
        <button
          type="button"
          onClick={loadProjects}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reload</span>
        </button>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </HbsAdminPageHeader>

      {/* Message Banner */}
      {message.text && (
        <div
          role="status"
          className={`p-4 text-xs flex items-center justify-between gap-2 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage({ text: "", type: "" })}
            className="p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/90 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by title, category, city, client type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200/80 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-1 bg-slate-100/70 backdrop-blur-md rounded-xl text-xs border border-slate-200/50">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "completed"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Completed
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "in_progress"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("featured")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "featured"
                  ? "bg-white text-amber-600 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Featured ★
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No projects found. Click &ldquo;Add Project&rdquo; to publish your first verified HBS case study.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3 pl-4">Project</th>
                  <th className="p-3">Category & Scope</th>
                  <th className="p-3">Location & Client</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Featured</th>
                  <th className="p-3 text-center">Visibility</th>
                  <th className="p-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => {
                  const thumb = getThumbnail(project);
                  return (
                    <tr key={project.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Project info & thumb */}
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumb}
                                alt=""
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Building2 className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="block font-semibold text-slate-900 truncate max-w-[220px]">
                              {project.title}
                            </span>
                            <span className="block text-[11px] text-slate-400 font-mono truncate max-w-[220px]">
                              /hbs/projects/{project.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {project.serviceCategory || "General"}
                        </span>
                        {project.areaTreated && (
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            {project.areaTreated}
                          </span>
                        )}
                      </td>

                      {/* Location & Client */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{project.location || "Rajasthan"}</span>
                        </div>
                        {project.clientType && (
                          <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">
                            {project.clientType}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`inline-block font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            project.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {project.status || "completed"}
                        </span>
                        {project.date && (
                          <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                            {project.date}
                          </span>
                        )}
                      </td>

                      {/* Featured star toggle */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(project)}
                          title={project.featured ? "Remove from Featured" : "Mark as Featured"}
                          className={`p-1.5 rounded-lg border transition-all ${
                            project.featured
                              ? "bg-amber-50 border-amber-300 text-amber-500"
                              : "bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-500"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${project.featured ? "fill-amber-400" : ""}`} />
                        </button>
                      </td>

                      {/* Visibility active toggle */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(project)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                            project.active
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              project.active ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {project.active ? "Live" : "Hidden"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right pr-4">
                        <div className="inline-flex items-center gap-1.5">
                          {project.slug && (
                            <a
                              href={`/hbs/projects/${project.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View live case study"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(project)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit project details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProjectToDelete(project)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Delete Project?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900">&ldquo;{projectToDelete.title}&rdquo;</strong>? It will be removed from Hind Build projects and its live URL (
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded-md text-slate-700">
                /hbs/projects/{projectToDelete.slug}
              </code>
              ) will no longer be accessible.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProject}
                disabled={Boolean(deletingId)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-[0_4px_14px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Full Modal */}
      {form && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white/70 backdrop-blur-md shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {form.id ? `Edit: ${form.title}` : "Add New HBS Project / Case Study"}
                  </h2>
                  {form.id ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      ID: {form.id.slice(0, 8)}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                  {form.id ? `/hbs/projects/${form.slug || "…"}` : "Publish a verified engineering restoration"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200/80 px-6 py-2.5 gap-2 bg-slate-50/50 backdrop-blur-sm shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setModalTab("basic")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  modalTab === "basic"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                Overview & Details
              </button>
              <button
                type="button"
                onClick={() => setModalTab("media")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  modalTab === "media"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                Photos & Before/After
              </button>
              <button
                type="button"
                onClick={() => setModalTab("case_study")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  modalTab === "case_study"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                Scope & Engineering
              </button>
              <button
                type="button"
                onClick={() => setModalTab("seo")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  modalTab === "seo"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                SEO & Social Meta
              </button>
            </div>

            {/* Modal Form with Scrollable Content and Sticky Footer */}
            <form onSubmit={handleSaveSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                {formError && (
                  <div className="p-3 text-xs flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

              {/* TAB 1: BASIC */}
              {modalTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setForm((prev) =>
                            prev ? { ...prev, title, slug: prev.id ? prev.slug : slugify(title) } : prev
                          );
                        }}
                        placeholder="e.g. Heritage Haveli Structural Grouting"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 font-medium focus:outline-red-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          URL Slug *
                        </label>
                        {!form.id && (
                          <button
                            type="button"
                            onClick={() => updateForm("slug", slugify(form.title))}
                            className="text-[11px] text-red-600 hover:underline"
                          >
                            Auto generate
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => updateForm("slug", slugify(e.target.value))}
                        placeholder="e.g. heritage-haveli-structural-grouting"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 font-mono focus:outline-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Service Category
                      </label>
                      <input
                        type="text"
                        list="categories-list"
                        value={form.serviceCategory}
                        onChange={(e) => updateForm("serviceCategory", e.target.value)}
                        placeholder="Choose or type category"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                      />
                      <datalist id="categories-list">
                        {POPULAR_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Client Type
                      </label>
                      <input
                        type="text"
                        list="client-types-list"
                        value={form.clientType}
                        onChange={(e) => updateForm("clientType", e.target.value)}
                        placeholder="Choose or type client type"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                      />
                      <datalist id="client-types-list">
                        {CLIENT_TYPES.map((ct) => (
                          <option key={ct} value={ct} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Location / City
                      </label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => updateForm("location", e.target.value)}
                        placeholder="e.g. Bhilwara / Jaipur"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Project Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => updateForm("status", e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-red-500"
                      >
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Completion Year / Date
                      </label>
                      <input
                        type="text"
                        value={form.date}
                        onChange={(e) => updateForm("date", e.target.value)}
                        placeholder="e.g. 2024 or Oct 2023"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Area Treated
                      </label>
                      <input
                        type="text"
                        value={form.areaTreated}
                        onChange={(e) => updateForm("areaTreated", e.target.value)}
                        placeholder="e.g. 15,000 sq.ft"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        value={form.durationDays}
                        onChange={(e) => updateForm("durationDays", e.target.value)}
                        placeholder="e.g. 45"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 font-mono focus:outline-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={form.order}
                        onChange={(e) => updateForm("order", Number(e.target.value))}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 font-mono focus:outline-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-3 border-t border-slate-100">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => updateForm("featured", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Featured Case Study (Showcased on Home Page)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => updateForm("active", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Live & Publicly Visible
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA & BEFORE/AFTER */}
              {modalTab === "media" && (
                <div className="space-y-6">
                  {/* Hero Image */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Primary Project Photo (Hero)
                    </h3>
                    <HbsImageUploader
                      value={form.heroImage}
                      onChange={(url) => updateForm("heroImage", url)}
                      folder="hbs/projects"
                      label="Upload Main Project Cover"
                      description="Shown as the main card thumbnail and hero banner."
                      recommendedSize="1200×800px"
                      aspectRatioHint="3:2"
                      previewHeight="h-44"
                    />
                  </div>

                  {/* Additional Gallery Photos */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Additional Gallery Photos ({form.galleryImages.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => updateForm("galleryImages", [...form.galleryImages, ""])}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Gallery Photo
                      </button>
                    </div>

                    {form.galleryImages.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No additional gallery photos added yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {form.galleryImages.map((imgUrl, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-slate-700">Photo #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateForm(
                                    "galleryImages",
                                    form.galleryImages.filter((_, i) => i !== idx)
                                  )
                                }
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                            <HbsImageUploader
                              value={imgUrl}
                              onChange={(url) =>
                                updateForm(
                                  "galleryImages",
                                  form.galleryImages.map((val, i) => (i === idx ? url : val))
                                )
                              }
                              folder="hbs/projects"
                              recommendedSize="1200×800px"
                              previewHeight="h-32"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Before / After Photos Manager */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Before & After Comparative Imagery
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Provides verified proof of defect rectification (e.g. cracked wall vs cured finish).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateForm("beforeAfterList", [
                            ...form.beforeAfterList,
                            { before: "", after: "", title: "" },
                          ])
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-100 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Before/After Pair
                      </button>
                    </div>

                    {form.beforeAfterList.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No before & after pairs configured yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {form.beforeAfterList.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                Comparative Pair #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateForm(
                                    "beforeAfterList",
                                    form.beforeAfterList.filter((_, i) => i !== idx)
                                  )
                                }
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Pair
                              </button>
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                Defect / Repair Title (optional)
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const title = e.target.value;
                                  updateForm(
                                    "beforeAfterList",
                                    form.beforeAfterList.map((v, i) => (i === idx ? { ...v, title } : v))
                                  );
                                }}
                                placeholder="e.g. Deep Column Concrete Spalling & Grouting"
                                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-red-500"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="border border-red-200 rounded-lg p-2.5 bg-red-50/30">
                                <span className="block text-[11px] font-bold text-red-700 uppercase mb-1">
                                  Before Rectification
                                </span>
                                <HbsImageUploader
                                  value={item.before}
                                  onChange={(url) =>
                                    updateForm(
                                      "beforeAfterList",
                                      form.beforeAfterList.map((v, i) =>
                                        i === idx ? { ...v, before: url } : v
                                      )
                                    )
                                  }
                                  folder="hbs/projects"
                                  previewHeight="h-32"
                                />
                              </div>

                              <div className="border border-emerald-200 rounded-lg p-2.5 bg-emerald-50/30">
                                <span className="block text-[11px] font-bold text-emerald-700 uppercase mb-1">
                                  After Hind Build Treatment
                                </span>
                                <HbsImageUploader
                                  value={item.after}
                                  onChange={(url) =>
                                    updateForm(
                                      "beforeAfterList",
                                      form.beforeAfterList.map((v, i) =>
                                        i === idx ? { ...v, after: url } : v
                                      )
                                    )
                                  }
                                  folder="hbs/projects"
                                  previewHeight="h-32"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CASE STUDY & STATEMENTS */}
              {modalTab === "case_study" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Problem Statement / Defect Analysis
                    </label>
                    <textarea
                      rows={3}
                      value={form.problemStatement}
                      onChange={(e) => updateForm("problemStatement", e.target.value)}
                      placeholder="Describe what structural issues, leaks, cracks, or deterioration the building was suffering from..."
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Engineering Solution & Treatment Applied
                    </label>
                    <textarea
                      rows={3}
                      value={form.solutionStatement}
                      onChange={(e) => updateForm("solutionStatement", e.target.value)}
                      placeholder="Describe the specialized materials, polymers, micro-concrete, injection resins, or application methodology used..."
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Result & Post-Treatment Outcome
                    </label>
                    <textarea
                      rows={3}
                      value={form.resultStatement}
                      onChange={(e) => updateForm("resultStatement", e.target.value)}
                      placeholder="Describe the permanent structural stabilization, leak elimination, or warranty provided..."
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                    />
                  </div>

                  {/* Scope of work bullet points */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Scope of Work (Bullet Points)
                      </label>
                      <button
                        type="button"
                        onClick={() => updateForm("scopeList", [...form.scopeList, ""])}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Bullet Point
                      </button>
                    </div>

                    {form.scopeList.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No scope items added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {form.scopeList.map((scope, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-5 text-right text-[11px] font-mono text-slate-400">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              value={scope}
                              onChange={(e) =>
                                updateForm(
                                  "scopeList",
                                  form.scopeList.map((val, i) => (i === idx ? e.target.value : val))
                                )
                              }
                              placeholder="e.g. High-pressure polyurethane injection grouting in basement expansion joints"
                              className="flex-1 text-xs rounded-lg border border-slate-300 p-2 focus:outline-red-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateForm(
                                  "scopeList",
                                  form.scopeList.filter((_, i) => i !== idx)
                                )
                              }
                              className="p-1.5 text-slate-400 hover:text-red-600"
                              title="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      General Project Overview Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                      placeholder="General summary of the project scope, client background, and completion highlights..."
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SEO */}
              {modalTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={form.metaTitle}
                      onChange={(e) => updateForm("metaTitle", e.target.value)}
                      placeholder={`${form.title || "Project"} | Case Study | Hind Build`}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Leave empty to use automatic title generation. Recommended: 50–60 characters.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.metaDescription}
                      onChange={(e) => updateForm("metaDescription", e.target.value)}
                      placeholder="Brief summary for Google search results and WhatsApp link previews..."
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Recommended: 120–155 characters.
                    </p>
                  </div>
                </div>
              )}

              </div>

              {/* Modal Sticky Action Bar */}
              <div className="px-6 py-3.5 bg-slate-50/90 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between shrink-0">
                <div className="text-[11px] text-slate-500">
                  {form.title ? (
                    <span className="truncate max-w-[240px] inline-block align-middle font-medium text-slate-700">
                      Editing &ldquo;{form.title}&rdquo;
                    </span>
                  ) : (
                    <span>New Project Draft</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300/80 rounded-xl hover:bg-slate-100/80 transition-colors shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold text-xs rounded-xl shadow-[0_4px_14px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Project...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Project</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
