"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  RefreshCw,
  Plus,
  Trash2,
  Star,
  CheckCircle,
  Clock,
  Filter,
  Pencil,
  ImageIcon,
  Search,
  ArrowUpDown,
  Archive,
  Eye,
  AlertTriangle,
  X,
  Check,
  Globe,
  Sliders,
  FileText,
  Building,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Upload,
} from "lucide-react";
import type { Project, ProjectHighlight, ProjectFaq, ProjectGalleryItem } from "@/lib/types";
import ProjectGeneralTab from "@/components/admin/projects/ProjectGeneralTab";
import ProjectSpecificationsTab from "@/components/admin/projects/ProjectSpecificationsTab";
import ProjectNarrativeTab from "@/components/admin/projects/ProjectNarrativeTab";
import ProjectMediaTab from "@/components/admin/projects/ProjectMediaTab";
import ProjectSeoTab from "@/components/admin/projects/ProjectSeoTab";
import ProjectPreviewModal from "@/components/admin/projects/ProjectPreviewModal";
import PublishReviewModal from "@/components/admin/projects/PublishReviewModal";
import ProjectSuccessPanel from "@/components/admin/projects/ProjectSuccessPanel";

type EditorTab = "general" | "specifications" | "narrative" | "media" | "seo";

interface FormState {
  title: string;
  slug: string;
  category: string;
  subCategories: string[];
  status: "active" | "ongoing" | "completed" | "archived";
  publishStatus: "draft" | "published" | "archived";
  featured: boolean;
  order: number;

  client: string;
  owner: string;
  area: string;
  services: string[];
  location: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  targetLocation: string;
  latitude: string | number;
  longitude: string | number;
  googleMapsUrl: string;
  date: string;
  completionDate: string;

  shortDescription: string;
  description: string;
  highlights: ProjectHighlight[];
  faqs: ProjectFaq[];

  image: string;
  imageAlt: string;
  imageCaption: string;
  galleryDetails: ProjectGalleryItem[];
  videoUrl: string;
  videoType: "youtube" | "vimeo" | "direct" | "none";
  videoTitle: string;
  videoDescription: string;
  videoPoster: string;

  metaTitle: string;
  metaDescription: string;
  focusKeywords: string;
  secondaryKeywords: string;
  canonicalUrl: string;
  ogImage: string;
  noIndex: boolean;
  noFollow: boolean;
}

const DEFAULT_FORM: FormState = {
  title: "",
  slug: "",
  category: "",
  subCategories: [],
  status: "ongoing",
  publishStatus: "draft",
  featured: false,
  order: 0,

  client: "",
  owner: "",
  area: "",
  services: [],
  location: "",
  city: "",
  district: "",
  state: "",
  country: "",
  postalCode: "",
  targetLocation: "",
  latitude: "",
  longitude: "",
  googleMapsUrl: "",
  date: "",
  completionDate: "",

  shortDescription: "",
  description: "",
  highlights: [],
  faqs: [],

  image: "",
  imageAlt: "",
  imageCaption: "",
  galleryDetails: [],
  videoUrl: "",
  videoType: "none",
  videoTitle: "",
  videoDescription: "",
  videoPoster: "",

  metaTitle: "",
  metaDescription: "",
  focusKeywords: "",
  secondaryKeywords: "",
  canonicalUrl: "",
  ogImage: "",
  noIndex: false,
  noFollow: false,
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Convert API Project object to FormState
function projectToFormState(p: Project): FormState {
  let subCats: string[] = [];
  if (p.subCategories) {
    try {
      subCats = Array.isArray(p.subCategories) ? p.subCategories : JSON.parse(p.subCategories);
    } catch {
      subCats = String(p.subCategories).split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  let svcs: string[] = [];
  if (p.services) {
    try {
      svcs = Array.isArray(p.services) ? p.services : JSON.parse(p.services);
    } catch {
      svcs = String(p.services).split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  let hls: ProjectHighlight[] = [];
  if (p.highlights) {
    try {
      hls = Array.isArray(p.highlights) ? p.highlights : JSON.parse(p.highlights);
    } catch {
      hls = [];
    }
  }

  let fqs: ProjectFaq[] = [];
  if (p.faqs) {
    try {
      fqs = Array.isArray(p.faqs) ? p.faqs : JSON.parse(p.faqs);
    } catch {
      fqs = [];
    }
  }

  let gDetails: ProjectGalleryItem[] = [];
  if (p.galleryDetails) {
    try {
      gDetails = Array.isArray(p.galleryDetails) ? p.galleryDetails : JSON.parse(p.galleryDetails);
    } catch {
      gDetails = [];
    }
  } else if (p.images) {
    try {
      const urls = typeof p.images === "string" && p.images.trim().startsWith("[")
        ? JSON.parse(p.images)
        : p.images.split("\n").map((s) => s.trim()).filter(Boolean);
      gDetails = urls.map((u: string, idx: number) => ({
        url: u,
        alt: `${p.title} photo ${idx + 1}`,
        order: idx + 1,
      }));
    } catch {
      gDetails = [];
    }
  }

  return {
    title: p.title || "",
    slug: p.slug || generateSlug(p.title || ""),
    category: p.category || "",
    subCategories: subCats,
    status: (p.status as any) || "ongoing",
    publishStatus: (p.publishStatus as any) || "draft",
    featured: p.featured ?? false,
    order: p.order ?? 0,

    client: p.client || "",
    owner: p.owner || "",
    area: p.area || "",
    services: svcs,
    location: p.location || "",
    city: p.city || "",
    district: p.district || "",
    state: p.state || "",
    country: p.country || "",
    postalCode: p.postalCode || "",
    targetLocation: p.targetLocation || "",
    latitude: p.latitude ?? "",
    longitude: p.longitude ?? "",
    googleMapsUrl: p.googleMapsUrl || "",
    date: p.date || "",
    completionDate: p.completionDate || "",

    shortDescription: p.shortDescription || "",
    description: p.description || "",
    highlights: hls,
    faqs: fqs,

    image: p.image || "",
    imageAlt: p.imageAlt || "",
    imageCaption: p.imageCaption || "",
    galleryDetails: gDetails,
    videoUrl: p.videoUrl || "",
    videoType: (p.videoType as any) || "none",
    videoTitle: p.videoTitle || "",
    videoDescription: p.videoDescription || "",
    videoPoster: p.videoPoster || "",

    metaTitle: p.metaTitle || "",
    metaDescription: p.metaDescription || "",
    focusKeywords: p.focusKeywords || "",
    secondaryKeywords: p.secondaryKeywords || "",
    canonicalUrl: p.canonicalUrl || "",
    ogImage: p.ogImage || "",
    noIndex: p.noIndex ?? false,
    noFollow: p.noFollow ?? false,
  };
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Editor states
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>("general");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // New Modals & Dialogs
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProjectData, setPreviewProjectData] = useState<FormState | null>(null);
  const [showPublishReviewModal, setShowPublishReviewModal] = useState(false);
  const [showSuccessPanel, setShowSuccessPanel] = useState(false);
  const [successPanelData, setSuccessPanelData] = useState<{
    title: string;
    slug: string;
    publishStatus: "draft" | "published" | "archived";
  } | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  // Filters & Sorting in List View
  const [searchQuery, setSearchQuery] = useState("");
  const [publishStatusFilter, setPublishStatusFilter] = useState<string>("all");
  const [operationalStatusFilter, setOperationalStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"order" | "newest" | "oldest" | "title">("order");

  // Fetch Projects from API (with ?all=true for full admin visibility)
  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects?all=true", {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setProjects(json.data || []);
      } else {
        setError(json.error || "Failed to load projects");
      }
    } catch {
      setError("Network error while communicating with projects backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Update form state helper
  const handleFormChange = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
    if ("slug" in updates) {
      setSlugError("");
    }
  };

  // Open New Project Editor
  const handleStartAdd = () => {
    setEditingProject(null);
    setForm(DEFAULT_FORM);
    setActiveTab("general");
    setIsSlugManuallyEdited(false);
    setSlugError("");
    setIsDirty(false);
    setShowEditor(true);
  };

  // Open Edit Existing Project
  const handleStartEdit = (p: Project) => {
    setEditingProject(p);
    setIsSlugManuallyEdited(true);
    setSlugError("");
    setForm(projectToFormState(p));
    setActiveTab("general");
    setIsDirty(false);
    setShowEditor(true);
  };

  // Open Draft-Safe Preview for a row project without editing
  const handleRowPreview = (p: Project) => {
    setPreviewProjectData(projectToFormState(p));
    setShowPreviewModal(true);
  };

  // Open Draft-Safe Preview for active editor form
  const handleActiveFormPreview = () => {
    setPreviewProjectData(form);
    setShowPreviewModal(true);
  };

  // Close Editor safely
  const handleRequestCloseEditor = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
      return;
    }
    forceCloseEditor();
  };

  const forceCloseEditor = () => {
    setShowEditor(false);
    setEditingProject(null);
    setForm(DEFAULT_FORM);
    setIsDirty(false);
    setSlugError("");
    setShowUnsavedConfirm(false);
  };

  // Minimum structural validation required to save a draft
  const validateDraftFields = (): boolean => {
    if (!form.title.trim()) {
      setActiveTab("general");
      setError("Project Title is a required field to save a draft.");
      return false;
    }
    if (!form.location.trim()) {
      setActiveTab("specifications");
      setError("General Location Display is a required field to save a draft.");
      return false;
    }
    return true;
  };

  // Strict validation for live publishing (All 4 hard-required fields)
  const validatePublishRequiredFields = (): boolean => {
    if (!form.title.trim()) {
      setActiveTab("general");
      setError("Project Title is a required field before publishing.");
      return false;
    }
    if (!form.location.trim()) {
      setActiveTab("specifications");
      setError("General Location Display is a required field before publishing.");
      return false;
    }
    if (!form.date.trim()) {
      setActiveTab("specifications");
      setError("Project Date / Timeline Display is a required field before publishing.");
      return false;
    }
    if (!form.description.trim()) {
      setActiveTab("narrative");
      setError("Full Project Case Study Narrative is a required field before publishing.");
      return false;
    }
    return true;
  };

  // Triggered when user clicks "Publish Project" button in editor header
  const handleStartPublishFlow = () => {
    setError("");
    // Open Pre-Publish Review Modal so user can review the 4 required and 12 recommended items
    setShowPublishReviewModal(true);
  };

  // Submit Handler (Supports Draft, Published, or Explicit Status)
  const handleSave = async (overridePublishStatus?: "draft" | "published" | "archived") => {
    const targetPublishStatus = overridePublishStatus || form.publishStatus;

    if (targetPublishStatus === "published") {
      if (!validatePublishRequiredFields()) {
        setShowPublishReviewModal(true);
        return;
      }
    } else {
      if (!validateDraftFields()) {
        return;
      }
    }

    setSaving(true);
    setError("");
    setSlugError("");

    try {
      const isEdit = !!editingProject;
      const url = isEdit ? `/api/projects/${editingProject.id}` : "/api/projects";
      const method = isEdit ? "PATCH" : "POST";

      const payload: any = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase() || generateSlug(form.title),
        category: form.category.trim(),
        subCategories: form.subCategories.length > 0 ? JSON.stringify(form.subCategories) : null,
        status: form.status,
        publishStatus: targetPublishStatus,
        featured: form.featured,
        order: Number(form.order) || 0,

        client: form.client.trim() || null,
        owner: form.owner.trim() || null,
        area: form.area.trim() || null,
        services: form.services.length > 0 ? JSON.stringify(form.services) : null,
        location: form.location.trim(),
        city: form.city.trim() || null,
        district: form.district.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || null,
        postalCode: form.postalCode.trim() || null,
        targetLocation: form.targetLocation.trim() || null,
        latitude: form.latitude !== "" && !isNaN(Number(form.latitude)) ? Number(form.latitude) : null,
        longitude: form.longitude !== "" && !isNaN(Number(form.longitude)) ? Number(form.longitude) : null,
        googleMapsUrl: form.googleMapsUrl.trim() || null,
        date: form.date.trim(),
        completionDate: form.completionDate.trim() || null,

        shortDescription: form.shortDescription.trim() || null,
        description: form.description.trim(),
        highlights: form.highlights.length > 0 ? JSON.stringify(form.highlights) : null,
        faqs: form.faqs.length > 0 ? JSON.stringify(form.faqs) : null,

        image: form.image.trim(),
        imageAlt: form.imageAlt.trim() || null,
        imageCaption: form.imageCaption.trim() || null,
        galleryDetails: form.galleryDetails.length > 0 ? JSON.stringify(form.galleryDetails) : null,
        videoUrl: form.videoUrl.trim() || null,
        videoType: form.videoType,
        videoTitle: form.videoTitle.trim() || null,
        videoDescription: form.videoDescription.trim() || null,
        videoPoster: form.videoPoster.trim() || null,

        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        focusKeywords: form.focusKeywords.trim() || null,
        secondaryKeywords: form.secondaryKeywords.trim() || null,
        canonicalUrl: form.canonicalUrl.trim() || null,
        ogImage: form.ogImage.trim() || null,
        noIndex: form.noIndex,
        noFollow: form.noFollow,
      };

      if (isEdit) {
        payload.id = editingProject.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.status === 409) {
        setActiveTab("general");
        setSlugError(json.error || "Slug already in use. Please enter a unique slug.");
        setError("Duplicate slug detected. Please resolve on the General tab.");
        setSaving(false);
        return;
      }

      if (!res.ok || !json.success) {
        setError(json.error || `Failed to save project (Error ${res.status})`);
        setSaving(false);
        return;
      }

      // Close Publish Review modal if open
      setShowPublishReviewModal(false);

      // Open Success Panel
      setSuccessPanelData({
        title: form.title.trim(),
        slug: payload.slug,
        publishStatus: targetPublishStatus,
      });
      setShowSuccessPanel(true);

      setIsDirty(false);
      fetchProjects();
    } catch {
      setError("Network error while saving project");
    } finally {
      setSaving(false);
    }
  };

  // Delete Action: Safe Archive by default, or Permanent with double confirmation
  const handleDeleteProject = async (p: Project, permanent = false) => {
    const confirmText = permanent
      ? `PERMANENTLY DELETE "${p.title}"?\n\nThis will destroy the database record and cannot be undone.`
      : `Archive "${p.title}"?\n\nThis unpublishes the project from the public website and preserves it safely in the archive.`;

    if (!confirm(confirmText)) return;

    try {
      const url = `/api/projects/${p.id}${permanent ? "?permanent=true" : ""}`;
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage(permanent ? `Project permanently deleted` : `Project safely archived`);
        setTimeout(() => setSuccessMessage(""), 4000);
        fetchProjects();
      } else {
        alert(json.error || "Failed to delete project");
      }
    } catch {
      alert("Network error during delete operation");
    }
  };

  // Quick 1-Click Toggle Featured
  const handleToggleFeatured = async (p: Project) => {
    try {
      const res = await fetch(`/api/projects/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: p.id, featured: !p.featured }),
      });
      const json = await res.json();
      if (json.success) {
        fetchProjects();
      }
    } catch {
      /* silent */
    }
  };

  // Quick 1-Click Toggle Operational Status (Ongoing vs Completed)
  const handleToggleOperationalStatus = async (p: Project) => {
    const nextStatus = p.status === "completed" ? "ongoing" : "completed";
    try {
      const res = await fetch(`/api/projects/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: p.id, status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchProjects();
      }
    } catch {
      /* silent */
    }
  };

  // Quick 1-Click Toggle Publication Status (Draft vs Published)
  const handleTogglePublishStatus = async (p: Project) => {
    const nextStatus = p.publishStatus === "published" ? "draft" : "published";
    const promptMsg =
      nextStatus === "published"
        ? `Make "${p.title}" publicly visible on the live website?`
        : `Unpublish "${p.title}" and return it to Draft? (It will be hidden from public view)`;

    if (!confirm(promptMsg)) return;

    try {
      const res = await fetch(`/api/projects/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: p.id, publishStatus: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchProjects();
      }
    } catch {
      /* silent */
    }
  };

  // Filter and sort calculation
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            p.title.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q) ||
            (p.client && p.client.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q)) ||
            (p.slug && p.slug.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Publication Status Filter
        if (publishStatusFilter !== "all") {
          if ((p.publishStatus || "draft") !== publishStatusFilter) return false;
        }

        // Operational Status Filter
        if (operationalStatusFilter !== "all") {
          if (operationalStatusFilter === "ongoing") {
            if (p.status !== "ongoing" && p.status !== "active") return false;
          } else if (p.status !== operationalStatusFilter) {
            return false;
          }
        }

        // Category Filter
        if (categoryFilter !== "all") {
          if (p.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "order") {
          return (a.order ?? 0) - (b.order ?? 0);
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [projects, searchQuery, publishStatusFilter, operationalStatusFilter, categoryFilter, sortBy]);

  // Counts for quick metric badges
  const publishedCount = projects.filter((p) => p.publishStatus === "published").length;
  const draftCount = projects.filter((p) => (p.publishStatus || "draft") === "draft").length;
  const archivedCount = projects.filter((p) => p.publishStatus === "archived").length;
  const ongoingCount = projects.filter((p) => p.status === "ongoing" || p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  // ─────────────────────────────────────────────────────────────
  // TAB COMPLETION & READINESS CALCULATIONS (Strictly Informational)
  // ─────────────────────────────────────────────────────────────
  const isTab1Valid = Boolean(form.title && form.title.trim());
  const isTab2Valid = Boolean(form.location && form.location.trim() && form.date && form.date.trim());
  const isTab3Valid = Boolean(form.description && form.description.trim());
  const hasCoverImage = Boolean(form.image && form.image.trim());

  const requiredCount = [
    Boolean(form.title.trim()),
    Boolean(form.location.trim()),
    Boolean(form.date.trim()),
    Boolean(form.description.trim()),
  ].filter(Boolean).length;

  const recommendedCount = [
    Boolean(form.category.trim()),
    hasCoverImage,
    Boolean(form.imageAlt.trim()),
    Boolean(form.shortDescription.trim()),
    form.highlights.length > 0,
    form.galleryDetails.length > 0,
    form.faqs.length > 0,
    Boolean(form.metaTitle.trim()),
    Boolean(form.metaDescription.trim()),
    Boolean(form.focusKeywords.trim()),
    Boolean(form.city && form.state),
    Boolean(form.googleMapsUrl || (form.latitude && form.longitude)),
  ].filter(Boolean).length;

  const completenessPercent = Math.min(
    100,
    Math.round(requiredCount * 15 + recommendedCount * (40 / 12))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: 5-TAB PROJECT EDITOR (MODAL / INLINE DRAWER)        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showEditor && (
        <div className="bg-white border-2 border-construction-navy shadow-xl">
          {/* Editor Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-600 text-white px-2 py-0.5">
                  {editingProject ? "Project Editor" : "New Portfolio Project"}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                    form.publishStatus === "published"
                      ? "bg-emerald-600 text-white"
                      : form.publishStatus === "archived"
                      ? "bg-purple-600 text-white"
                      : "bg-amber-500 text-slate-900"
                  }`}
                >
                  Publish State: {form.publishStatus.toUpperCase()}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                    form.status === "completed"
                      ? "bg-emerald-700 text-white"
                      : form.status === "archived"
                      ? "bg-slate-700 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  Lifecycle: {form.status.toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1 truncate max-w-xl">
                {form.title.trim() || "Untitled Construction Project"}
              </h2>
            </div>

            {/* Quick Action Buttons in Header */}
            <div className="flex items-center gap-2.5">
              {/* Preview Button */}
              <button
                type="button"
                onClick={handleActiveFormPreview}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Preview project using active form state"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Project</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleStartPublishFlow}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Publish Project</span>
              </button>

              <button
                type="button"
                onClick={handleRequestCloseEditor}
                className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer"
                title="Close Editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Completeness & Readiness Info Strip */}
          <div className="bg-slate-800/90 text-slate-300 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-700">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Project Readiness:</span>
                <span className="font-mono font-bold text-white">{completenessPercent}%</span>
              </span>
              <span className="text-slate-500">•</span>
              <span>
                Required:{" "}
                <span
                  className={`font-mono font-bold ${
                    requiredCount === 4 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {requiredCount}/4 {requiredCount === 4 ? "✓" : "⚠"}
                </span>
              </span>
              <span className="text-slate-500">•</span>
              <span>
                Recommended: <span className="font-mono font-bold text-slate-200">{recommendedCount}/12</span>
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              Only 4 fields required to save/publish. Recommended fields enrich search and conversions.
            </div>
          </div>

          {/* 5-Tab Navigation Bar with Completion Indicators */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
            {/* Tab 1: General */}
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "general"
                  ? "border-construction-navy text-construction-navy bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>1. General</span>
              {isTab1Valid ? (
                <CheckCircle className="w-3 h-3 text-emerald-600" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Title required" />
              )}
            </button>

            {/* Tab 2: Specifications */}
            <button
              type="button"
              onClick={() => setActiveTab("specifications")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "specifications"
                  ? "border-construction-navy text-construction-navy bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>2. Specifications</span>
              {isTab2Valid ? (
                <CheckCircle className="w-3 h-3 text-emerald-600" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Location & Date required" />
              )}
            </button>

            {/* Tab 3: Narrative */}
            <button
              type="button"
              onClick={() => setActiveTab("narrative")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "narrative"
                  ? "border-construction-navy text-construction-navy bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>3. Narrative</span>
              {isTab3Valid ? (
                <CheckCircle className="w-3 h-3 text-emerald-600" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Description required" />
              )}
            </button>

            {/* Tab 4: Media */}
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "media"
                  ? "border-construction-navy text-construction-navy bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>4. Media ({form.galleryDetails.length + (form.image ? 1 : 0)})</span>
              {hasCoverImage && <CheckCircle className="w-3 h-3 text-blue-600" />}
            </button>

            {/* Tab 5: SEO / AEO / GEO */}
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "seo"
                  ? "border-construction-navy text-construction-navy bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>5. SEO / AEO / GEO</span>
              {form.metaTitle && form.metaDescription && (
                <CheckCircle className="w-3 h-3 text-emerald-600" />
              )}
            </button>
          </div>

          {/* Active Tab Content Area */}
          <div className="p-6 md:p-8">
            {activeTab === "general" && (
              <ProjectGeneralTab
                formData={{
                  title: form.title,
                  slug: form.slug,
                  category: form.category,
                  subCategories: form.subCategories,
                  status: form.status,
                  publishStatus: form.publishStatus,
                  featured: form.featured,
                  order: form.order,
                }}
                onChange={handleFormChange}
                slugError={slugError}
                isSlugManuallyEdited={isSlugManuallyEdited}
                setIsSlugManuallyEdited={setIsSlugManuallyEdited}
                generateSlug={generateSlug}
              />
            )}

            {activeTab === "specifications" && (
              <ProjectSpecificationsTab
                formData={{
                  client: form.client,
                  owner: form.owner,
                  area: form.area,
                  services: form.services,
                  location: form.location,
                  city: form.city,
                  district: form.district,
                  state: form.state,
                  country: form.country,
                  postalCode: form.postalCode,
                  targetLocation: form.targetLocation,
                  latitude: form.latitude,
                  longitude: form.longitude,
                  googleMapsUrl: form.googleMapsUrl,
                  date: form.date,
                  completionDate: form.completionDate,
                }}
                onChange={handleFormChange}
              />
            )}

            {activeTab === "narrative" && (
              <ProjectNarrativeTab
                formData={{
                  shortDescription: form.shortDescription,
                  description: form.description,
                  highlights: form.highlights,
                  faqs: form.faqs,
                }}
                onChange={handleFormChange}
              />
            )}

            {activeTab === "media" && (
              <ProjectMediaTab
                formData={{
                  title: form.title,
                  image: form.image,
                  imageAlt: form.imageAlt,
                  imageCaption: form.imageCaption,
                  galleryDetails: form.galleryDetails,
                  videoUrl: form.videoUrl,
                  videoType: form.videoType,
                  videoTitle: form.videoTitle,
                  videoDescription: form.videoDescription,
                  videoPoster: form.videoPoster,
                }}
                onChange={handleFormChange}
              />
            )}

            {activeTab === "seo" && (
              <ProjectSeoTab
                formData={{
                  title: form.title,
                  slug: form.slug,
                  metaTitle: form.metaTitle,
                  metaDescription: form.metaDescription,
                  focusKeywords: form.focusKeywords,
                  secondaryKeywords: form.secondaryKeywords,
                  canonicalUrl: form.canonicalUrl,
                  ogImage: form.ogImage,
                  noIndex: form.noIndex,
                  noFollow: form.noFollow,

                  shortDescription: form.shortDescription,
                  highlights: form.highlights,
                  faqs: form.faqs,
                  city: form.city,
                  district: form.district,
                  state: form.state,
                  country: form.country,
                  postalCode: form.postalCode,
                  targetLocation: form.targetLocation,
                  latitude: form.latitude,
                  longitude: form.longitude,
                  googleMapsUrl: form.googleMapsUrl,
                  client: form.client,
                  image: form.image,
                }}
                onChange={handleFormChange}
              />
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {isDirty ? (
                <span className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Unsaved changes in form
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Check className="w-3.5 h-3.5" /> All changes clean
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleRequestCloseEditor}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleActiveFormPreview}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={handleStartPublishFlow}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Publish Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: PROJECTS PORTFOLIO LIST & FILTERS                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!showEditor && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                Projects Portfolio CMS
              </h1>
              <p className="text-slate-500 text-sm">
                Manage ongoing and completed construction portfolios with SEO, AEO, GEO, and image galleries.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchProjects}
                disabled={loading}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3.5 py-2 text-xs font-medium disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button
                onClick={handleStartAdd}
                className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-5 py-2 text-sm font-semibold transition-colors shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Project
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 p-3 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Total Projects
              </span>
              <span className="text-xl font-bold text-slate-900">{projects.length}</span>
            </div>

            <div className="bg-white border border-emerald-200 p-3 shadow-sm bg-emerald-50/20">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                Published (Live)
              </span>
              <span className="text-xl font-bold text-emerald-700">{publishedCount}</span>
            </div>

            <div className="bg-white border border-amber-200 p-3 shadow-sm bg-amber-50/20">
              <span className="text-[10px] font-bold uppercase text-amber-700 block">
                Drafts (Hidden)
              </span>
              <span className="text-xl font-bold text-amber-700">{draftCount}</span>
            </div>

            <div className="bg-white border border-blue-200 p-3 shadow-sm bg-blue-50/20">
              <span className="text-[10px] font-bold uppercase text-blue-700 block">
                Ongoing Work
              </span>
              <span className="text-xl font-bold text-blue-700">{ongoingCount}</span>
            </div>

            <div className="bg-white border border-purple-200 p-3 shadow-sm bg-purple-50/20">
              <span className="text-[10px] font-bold uppercase text-purple-700 block">
                Archived
              </span>
              <span className="text-xl font-bold text-purple-700">{archivedCount}</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, location, client..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Publication Status Filter */}
              <select
                value={publishStatusFilter}
                onChange={(e) => setPublishStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-construction-navy"
              >
                <option value="all">Publish: All</option>
                <option value="published">Publish: Published Only</option>
                <option value="draft">Publish: Drafts Only</option>
                <option value="archived">Publish: Archived Only</option>
              </select>

              {/* Operational Lifecycle Filter */}
              <select
                value={operationalStatusFilter}
                onChange={(e) => setOperationalStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-construction-navy"
              >
                <option value="all">Lifecycle: All</option>
                <option value="ongoing">Lifecycle: Ongoing</option>
                <option value="completed">Lifecycle: Completed</option>
                <option value="archived">Lifecycle: Archived</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-construction-navy"
              >
                <option value="all">Category: All</option>
                <option value="commercial">Commercial</option>
                <option value="residential">Residential</option>
                <option value="industrial">Industrial</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="institutional">Institutional</option>
              </select>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold uppercase tracking-wider text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="order">Display Order</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-semibold">Project</th>
                    <th className="text-left px-3 py-3 font-semibold">Publish Status</th>
                    <th className="text-left px-3 py-3 font-semibold">Lifecycle</th>
                    <th className="text-left px-3 py-3 font-semibold">Category</th>
                    <th className="text-left px-3 py-3 font-semibold">Location</th>
                    <th className="text-left px-3 py-3 font-semibold">Client</th>
                    <th className="text-center px-2 py-3 font-semibold">Featured</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="h-6 bg-slate-100" />
                        </td>
                      </tr>
                    ))
                  ) : filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-slate-500 py-16">
                        No projects match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => {
                      const isPublished = p.publishStatus === "published";
                      const isCompleted = p.status === "completed";

                      let galleryCount = 0;
                      if (p.galleryDetails) {
                        try {
                          galleryCount = Array.isArray(p.galleryDetails)
                            ? p.galleryDetails.length
                            : JSON.parse(p.galleryDetails).length;
                        } catch {
                          galleryCount = 0;
                        }
                      } else if (p.images) {
                        try {
                          galleryCount = typeof p.images === "string" && p.images.trim().startsWith("[")
                            ? JSON.parse(p.images).length
                            : p.images.split("\n").filter(Boolean).length;
                        } catch {
                          galleryCount = 0;
                        }
                      }

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          {/* Project Cover & Title */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="w-11 h-11 object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-slate-900 font-bold leading-snug truncate max-w-xs">
                                  {p.title}
                                </p>
                                <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                                  /projects/{p.slug || p.id}
                                </p>
                                {galleryCount > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-construction-navy bg-blue-50 px-1.5 py-0.2 border border-blue-100 mt-1">
                                    <ImageIcon className="w-3 h-3" /> {galleryCount} Photos
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Publishing Status Toggle */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleTogglePublishStatus(p)}
                              title="Click to toggle between Draft and Published"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                                isPublished
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                  : p.publishStatus === "archived"
                                  ? "bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100"
                                  : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                              }`}
                            >
                              {isPublished ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" /> Published
                                </>
                              ) : p.publishStatus === "archived" ? (
                                <>
                                  <Archive className="w-3 h-3 text-purple-600" /> Archived
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" /> Draft
                                </>
                              )}
                            </button>
                          </td>

                          {/* Operational Status Toggle */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleOperationalStatus(p)}
                              title="Click to toggle between Ongoing and Completed"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              }`}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Completed
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-none-full bg-blue-500 animate-pulse" />{" "}
                                  Ongoing
                                </>
                              )}
                            </button>
                          </td>

                          {/* Category */}
                          <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                              {p.category}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap max-w-[140px] truncate text-xs">
                            {p.location}
                          </td>

                          {/* Client */}
                          <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap max-w-[120px] truncate text-xs">
                            {p.client || "—"}
                          </td>

                          {/* Featured */}
                          <td className="px-2 py-3.5 text-center">
                            <button
                              onClick={() => handleToggleFeatured(p)}
                              title="Toggle Featured on Homepage"
                              className={`w-7 h-7 inline-flex items-center justify-center transition-colors cursor-pointer ${
                                p.featured
                                  ? "bg-yellow-100 text-yellow-600 border border-yellow-200"
                                  : "bg-slate-50 border border-slate-200 text-slate-300 hover:text-yellow-500"
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${p.featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Row Preview Button */}
                              <button
                                onClick={() => handleRowPreview(p)}
                                title="Draft-Safe Full Preview"
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-700 text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-600" />
                                <span>Preview</span>
                              </button>

                              <button
                                onClick={() => handleStartEdit(p)}
                                title="Edit full project specifications"
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-construction-navy hover:text-construction-navy text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>

                              <button
                                onClick={() => handleDeleteProject(p, false)}
                                title="Safe Archive Project (Unpublishes safely)"
                                className="w-7 h-7 bg-white border border-slate-200 hover:bg-purple-50 hover:text-purple-700 text-slate-400 inline-flex items-center justify-center transition-all shadow-sm cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteProject(p, true)}
                                title="Permanently Delete Project from Database"
                                className="w-7 h-7 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-400 inline-flex items-center justify-center transition-all shadow-sm cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

            {/* Table Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium flex items-center justify-between">
              <span>
                Showing {filteredProjects.length} of {projects.length} portfolio records
              </span>
              <div className="flex gap-4 text-xs font-medium">
                <span className="text-emerald-700 font-semibold">{publishedCount} Published</span>
                <span className="text-amber-700 font-semibold">{draftCount} Drafts</span>
                <span className="text-blue-700 font-semibold">{ongoingCount} Ongoing</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: DRAFT-SAFE FULL PROJECT PREVIEW MODAL                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showPreviewModal && previewProjectData && (
        <ProjectPreviewModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewProjectData(null);
          }}
          project={previewProjectData}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: PRE-PUBLISH REVIEW MODAL                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showPublishReviewModal && (
        <PublishReviewModal
          isOpen={showPublishReviewModal}
          onClose={() => setShowPublishReviewModal(false)}
          onConfirmPublish={() => handleSave("published")}
          onJumpToTab={(tabIdx) => {
            const tabs: EditorTab[] = ["general", "specifications", "narrative", "media", "seo"];
            if (tabs[tabIdx]) {
              setActiveTab(tabs[tabIdx]);
            }
          }}
          isPublishing={saving}
          project={form}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: POST-SAVE / PUBLISH SUCCESS PANEL                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showSuccessPanel && successPanelData && (
        <ProjectSuccessPanel
          isOpen={showSuccessPanel}
          onClose={() => {
            setShowSuccessPanel(false);
            setSuccessPanelData(null);
            setShowEditor(false);
            setEditingProject(null);
            setForm(DEFAULT_FORM);
          }}
          onContinueEditing={() => {
            setShowSuccessPanel(false);
            setSuccessPanelData(null);
          }}
          title={successPanelData.title}
          slug={successPanelData.slug}
          publishStatus={successPanelData.publishStatus}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 4: UNSAVED CHANGES CONFIRMATION DIALOG                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showUnsavedConfirm && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Unsaved Changes</h3>
                <p className="text-xs text-slate-500">
                  You have unsaved edits in this project. What would you like to do?
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  handleSave("draft");
                }}
                className="w-full py-2 bg-construction-navy hover:bg-blue-800 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={forceCloseEditor}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Discard Changes &amp; Close
              </button>

              <button
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
