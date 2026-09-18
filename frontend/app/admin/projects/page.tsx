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
  Copy,
  ExternalLink,
  Layers,
  ShieldCheck,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
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
  const [copiedCanonical, setCopiedCanonical] = useState(false);
  const [showMobileInspector, setShowMobileInspector] = useState(false);

  // Modals & Dialogs
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
    setShowMobileInspector(false);
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
    setShowMobileInspector(false);
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
    setShowMobileInspector(false);
  };

  const handleCopyCanonical = () => {
    const rawSlug = form.slug.trim() || generateSlug(form.title.trim()) || "project";
    const canonical = form.canonicalUrl.trim() || `https://www.hindustanprojects.in/projects/${rawSlug}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(canonical);
      setCopiedCanonical(true);
      setTimeout(() => setCopiedCanonical(false), 2000);
    }
  };

  // Minimum structural validation required to save a draft
  const validateDraftFields = (): boolean => {
    if (!form.title.trim()) {
      setActiveTab("general");
      setError("Project Title is required to save a draft.");
      return false;
    }
    if (!form.location.trim()) {
      setActiveTab("general");
      setError("Site Location is required to save a draft.");
      return false;
    }
    return true;
  };

  // Strict validation for live publishing (All 4 hard-required fields)
  const validatePublishRequiredFields = (): boolean => {
    if (!form.title.trim()) {
      setActiveTab("general");
      setError("Project Title is required before publishing.");
      return false;
    }
    if (!form.location.trim()) {
      setActiveTab("general");
      setError("Site Location is required before publishing.");
      return false;
    }
    if (!form.date.trim()) {
      setActiveTab("specifications");
      setError("Project Date / Timeline is required before publishing.");
      return false;
    }
    if (!form.description.trim()) {
      setActiveTab("narrative");
      setError("Full Case Study Narrative is required before publishing.");
      return false;
    }
    return true;
  };

  // Triggered when user clicks "Publish Project" button in command bar
  const handleStartPublishFlow = () => {
    setError("");
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

  // TAB COMPLETION & READINESS CALCULATIONS
  const isTab1Valid = Boolean(form.title && form.title.trim() && form.location && form.location.trim());
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
      {/* SECTION 1: 5-PHASE PROJECT WORKBENCH EDITOR                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showEditor && (
        <div className="bg-white border border-slate-300 shadow-sm rounded-none">
          {/* SINGLE UNIFIED STICKY COMMAND BAR */}
          <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
            {/* Upper Command Bar */}
            <div className="px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border-b border-slate-200 text-slate-900">
              {/* Left Group */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={handleRequestCloseEditor}
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 border border-slate-300 transition-colors shrink-0 cursor-pointer"
                  title="Return to Projects List"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Projects</span>
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                    <span className="text-construction-navy font-bold uppercase text-[10px]">
                      {editingProject ? `ID #${editingProject.id}` : "NEW PROJECT"}
                    </span>
                    <span className="text-slate-300">/</span>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider border ${
                        form.publishStatus === "published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : form.publishStatus === "archived"
                          ? "bg-purple-50 text-purple-700 border-purple-300"
                          : "bg-amber-50 text-amber-800 border-amber-300"
                      }`}
                    >
                      {form.publishStatus.toUpperCase()}
                    </span>

                    {/* Unsaved indicator */}
                    {isDirty ? (
                      <span className="px-1.5 py-0.2 text-[9px] font-mono text-amber-800 bg-amber-50 border border-amber-300 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-amber-600" /> Unsaved
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 text-[9px] font-mono text-slate-600 bg-slate-100 border border-slate-300 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-600" /> Synced
                      </span>
                    )}
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate max-w-xl font-display mt-0.5">
                    {form.title.trim() || "Untitled Project Specification"}
                  </h2>
                </div>
              </div>

              {/* Right Action Group */}
              <div className="flex items-center gap-2 flex-wrap shrink-0 justify-end">
                <button
                  type="button"
                  onClick={handleActiveFormPreview}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 rounded-none cursor-pointer"
                  title="Live preview in light mode"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded-none disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="button"
                  onClick={handleStartPublishFlow}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded-none shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>

                <button
                  type="button"
                  onClick={handleRequestCloseEditor}
                  className="text-slate-500 hover:text-slate-900 p-1.5 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close Workbench"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Phase Navigation Bar (Horizontally Scrollable on Mobile) */}
            <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-4 sm:px-6 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 shrink-0">
                {/* 01 General / Identity */}
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`flex items-center gap-1.5 py-3 px-3 sm:px-3.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === "general"
                      ? "border-slate-900 text-slate-900 bg-white shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="w-5 h-5 rounded-none bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-800">
                    01
                  </span>
                  <span>Identity</span>
                  {isTab1Valid ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-500" title="Title & Location required" />
                  )}
                </button>

                {/* 02 Specifications & GEO */}
                <button
                  type="button"
                  onClick={() => setActiveTab("specifications")}
                  className={`flex items-center gap-1.5 py-3 px-3 sm:px-3.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === "specifications"
                      ? "border-slate-900 text-slate-900 bg-white shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="w-5 h-5 rounded-none bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-800">
                    02
                  </span>
                  <span>Specs &amp; GEO</span>
                  {isTab2Valid ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-500" title="Location & Date required" />
                  )}
                </button>

                {/* 03 Narrative & FAQs */}
                <button
                  type="button"
                  onClick={() => setActiveTab("narrative")}
                  className={`flex items-center gap-1.5 py-3 px-3 sm:px-3.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === "narrative"
                      ? "border-slate-900 text-slate-900 bg-white shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="w-5 h-5 rounded-none bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-800">
                    03
                  </span>
                  <span>Narrative</span>
                  {isTab3Valid ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-500" title="Description required" />
                  )}
                </button>

                {/* 04 Media & Gallery */}
                <button
                  type="button"
                  onClick={() => setActiveTab("media")}
                  className={`flex items-center gap-1.5 py-3 px-3 sm:px-3.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === "media"
                      ? "border-slate-900 text-slate-900 bg-white shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="w-5 h-5 rounded-none bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-800">
                    04
                  </span>
                  <span>Media ({form.galleryDetails.length + (form.image ? 1 : 0)})</span>
                  {hasCoverImage && <CheckCircle className="w-3.5 h-3.5 text-slate-900" />}
                </button>

                {/* 05 Search & AI */}
                <button
                  type="button"
                  onClick={() => setActiveTab("seo")}
                  className={`flex items-center gap-1.5 py-3 px-3 sm:px-3.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === "seo"
                      ? "border-slate-900 text-slate-900 bg-white shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="w-5 h-5 rounded-none bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-800">
                    05
                  </span>
                  <span>Search &amp; AI</span>
                  {form.metaTitle && form.metaDescription && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>
              </div>

              {/* Quick Readiness Badge on Right (Desktop) */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-mono py-2 shrink-0">
                <span className="text-slate-500">Readiness:</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold text-[11px]">
                  {completenessPercent}%
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold ${
                    requiredCount === 4
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {requiredCount}/4 Required
                </span>
              </div>
            </div>
          </div>

          {/* MAIN 2-COLUMN WORKBENCH: Left 8 Cols Form (~68%), Right 4 Cols Inspector (~32%) */}
          <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/60">
            {/* Mobile / Tablet Collapsible Inspector Toggle (< 1024px) */}
            <div className="lg:hidden mb-4 bg-white border border-slate-200 p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  Readiness: {completenessPercent}% · {requiredCount}/4 Required
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileInspector(!showMobileInspector)}
                className="text-xs font-mono font-bold uppercase px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{showMobileInspector ? "Hide" : "Inspect"}</span>
                {showMobileInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Form Editor (8 Cols on desktop, 12 on mobile/tablet) */}
              <div className="lg:col-span-8 space-y-6 w-full">
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
                      location: form.location,
                      city: form.city,
                      district: form.district,
                      state: form.state,
                      country: form.country,
                      postalCode: form.postalCode,
                      targetLocation: form.targetLocation,
                      image: form.image,
                      imageAlt: form.imageAlt,
                      shortDescription: form.shortDescription,
                      description: form.description,
                      date: form.date,
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
                      category: form.category,
                      status: form.status,
                      title: form.title,
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

              {/* Right Column: Sticky Workbench Inspector Panel */}
              <div
                className={`lg:col-span-4 space-y-5 lg:sticky lg:top-28 ${
                  showMobileInspector ? "block" : "hidden lg:block"
                }`}
              >
                {/* Card 1: Publish Readiness Audit */}
                <div className="bg-white border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                        Publish Readiness Audit
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {completenessPercent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-none overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        requiredCount === 4 ? "bg-emerald-600" : "bg-amber-500"
                      }`}
                      style={{ width: `${completenessPercent}%` }}
                    />
                  </div>

                  {/* Criteria Counts */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-50 border border-slate-200 p-2.5">
                      <span className="text-[10px] text-slate-500 block uppercase">Mandatory</span>
                      <span
                        className={`text-sm font-bold ${
                          requiredCount === 4 ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {requiredCount} / 4 {requiredCount === 4 ? "✓ Ready" : "⚠ Gaps"}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2.5">
                      <span className="text-[10px] text-slate-500 block uppercase">Recommended</span>
                      <span className="text-sm font-bold text-slate-800">
                        {recommendedCount} / 12 Enriched
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPublishReviewModal(true)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                    <span>Run Full Audit Drawer</span>
                  </button>
                </div>

                {/* Card 2: Canonical Route & Slug Inspector */}
                <div className="bg-white border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                        Canonical Route &amp; Slug
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">SEO / AEO</span>
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block">Public Path:</span>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-semibold break-all text-[11px]">
                      /projects/{form.slug.trim() || generateSlug(form.title.trim()) || "..."}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyCanonical}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>{copiedCanonical ? "Copied!" : "Copy URL"}</span>
                    </button>

                    {form.publishStatus === "published" && form.slug && (
                      <a
                        href={`https://www.hindustanprojects.in/projects/${form.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-sm"
                        title="Open Live URL"
                      >
                        <ExternalLink className="w-3 h-3 text-blue-600" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Card 3: Fast Operational Controls */}
                <div className="bg-white border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                      Workbench Quick Controls
                    </h3>
                  </div>

                  {/* Featured Toggle */}
                  <label className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center gap-2">
                      <Star
                        className={`w-4 h-4 ${
                          form.featured ? "fill-amber-500 text-amber-500" : "text-slate-400"
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        Featured on Homepage
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => handleFormChange({ featured: e.target.checked })}
                      className="w-4 h-4 accent-amber-600 cursor-pointer rounded-none"
                    />
                  </label>

                  {/* Lifecycle Toggle */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">
                      Lifecycle Stage:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleFormChange({ status: "ongoing" })}
                        className={`py-1 text-xs font-mono font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                          form.status === "ongoing" || form.status === "active"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        Ongoing
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormChange({ status: "completed" })}
                        className={`py-1 text-xs font-mono font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                          form.status === "completed"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        Completed
                      </button>
                    </div>
                  </div>

                  {/* Bot Indexing Quick Toggle */}
                  <label className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-slate-800 font-mono block">
                        Search Indexing
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {form.noIndex ? "noindex (hidden from search)" : "Indexable (Active)"}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!form.noIndex}
                      onChange={(e) => handleFormChange({ noIndex: !e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer rounded-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: PROJECTS REGISTRY (LIST & MOBILE CARDS)            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!showEditor && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-slate-500 uppercase mb-1">
                <span>PORTFOLIO WORKBENCH</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-900 font-bold">PROJECTS REGISTRY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-slate-900">
                HiPRO Projects Registry
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                Central ledger for industrial, commercial, and turnkey construction portfolio assets.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={fetchProjects}
                disabled={loading}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-none disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button
                onClick={handleStartAdd}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" /> New Project
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 p-3 sm:p-4 shadow-sm rounded-none">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Total Projects
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-display">{projects.length}</span>
            </div>

            <div className="bg-white border border-emerald-200 p-3 sm:p-4 shadow-sm rounded-none bg-emerald-50/20">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Published (Live)
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-display">{publishedCount}</span>
            </div>

            <div className="bg-white border border-amber-200 p-3 sm:p-4 shadow-sm rounded-none bg-amber-50/20">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 block mb-1">
                Drafts
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-700 font-display">{draftCount}</span>
            </div>

            <div className="bg-white border border-blue-200 p-3 sm:p-4 shadow-sm rounded-none bg-blue-50/20">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 block mb-1">
                Ongoing
              </span>
              <span className="text-xl sm:text-2xl font-bold text-blue-700 font-display">{ongoingCount}</span>
            </div>

            <div className="bg-white border border-purple-200 p-3 sm:p-4 shadow-sm rounded-none bg-purple-50/20 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 block mb-1">
                Archived
              </span>
              <span className="text-xl sm:text-2xl font-bold text-purple-700 font-display">{archivedCount}</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 p-3.5 sm:p-4 shadow-sm rounded-none flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, location, client..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-8 pr-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={publishStatusFilter}
                onChange={(e) => setPublishStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy cursor-pointer"
              >
                <option value="all">Publish: All</option>
                <option value="published">Publish: Published</option>
                <option value="draft">Publish: Drafts</option>
                <option value="archived">Publish: Archived</option>
              </select>

              <select
                value={operationalStatusFilter}
                onChange={(e) => setOperationalStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy cursor-pointer"
              >
                <option value="all">Lifecycle: All</option>
                <option value="ongoing">Lifecycle: Ongoing</option>
                <option value="completed">Lifecycle: Completed</option>
                <option value="archived">Lifecycle: Archived</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy cursor-pointer"
              >
                <option value="all">Category: All</option>
                <option value="commercial">Commercial</option>
                <option value="residential">Residential</option>
                <option value="industrial">Industrial</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="institutional">Institutional</option>
              </select>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-none">
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

          {/* DESKTOP VIEW: Projects Table (>= md / 768px) */}
          <div className="hidden md:block bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
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
                      <td colSpan={8} className="text-center text-slate-500 py-16 text-xs font-mono">
                        No projects match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => {
                      const isPublished = p.publishStatus === "published";
                      const isCompleted = p.status === "completed";

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Project Cover & Title */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {p.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="w-12 h-12 object-cover border border-slate-200 shrink-0 rounded-none"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 rounded-none">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-slate-900 font-bold leading-snug truncate max-w-xs font-display">
                                  {p.title}
                                </p>
                                <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                                  /projects/{p.slug || p.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Publishing Status Toggle */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleTogglePublishStatus(p)}
                              title="Click to toggle between Draft and Published"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border rounded-none cursor-pointer transition-all ${
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
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border rounded-none cursor-pointer transition-all ${
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
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Ongoing
                                </>
                              )}
                            </button>
                          </td>

                          {/* Category */}
                          <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-none">
                              {p.category || "—"}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap max-w-[140px] truncate text-xs">
                            {p.location || "—"}
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
                              className={`w-7 h-7 inline-flex items-center justify-center transition-colors rounded-none cursor-pointer ${
                                p.featured
                                  ? "bg-amber-50 text-amber-600 border border-amber-300"
                                  : "bg-slate-50 border border-slate-200 text-slate-300 hover:text-amber-500"
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${p.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleRowPreview(p)}
                                title="Draft-Safe Full Preview"
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-600 text-xs font-mono font-bold uppercase rounded-none transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-600" />
                                <span>Preview</span>
                              </button>

                              <button
                                onClick={() => handleStartEdit(p)}
                                title="Edit Project Specifications"
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer"
                              >
                                <Pencil className="w-3 h-3 text-amber-400" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => handleDeleteProject(p, false)}
                                title="Archive Project"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-none cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5" />
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
          </div>

          {/* MOBILE VIEW: Project Cards (< md / 768px) */}
          <div className="md:hidden space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 p-4 animate-pulse space-y-3">
                  <div className="h-5 bg-slate-200 w-3/4" />
                  <div className="h-4 bg-slate-100 w-1/2" />
                </div>
              ))
            ) : filteredProjects.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 text-center text-slate-500 text-xs font-mono">
                No projects match the current filters.
              </div>
            ) : (
              filteredProjects.map((p) => {
                const isPublished = p.publishStatus === "published";
                const isCompleted = p.status === "completed";

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200 p-4 space-y-3 shadow-sm"
                  >
                    {/* Top Row: Thumbnail + Title + Featured Star */}
                    <div className="flex items-start gap-3">
                      {p.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-14 h-14 object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                            {p.category || "Unassigned"}
                          </span>
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            className="text-slate-400 hover:text-amber-500 p-1"
                          >
                            <Star className={`w-3.5 h-3.5 ${p.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                          </button>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 font-display leading-tight truncate">
                          {p.title}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400 truncate">
                          /projects/{p.slug || p.id}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 text-slate-600 font-mono">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-construction-red shrink-0" />
                        <span className="truncate">{p.location || "No Location"}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{p.date || "No Date"}</span>
                      </div>
                    </div>

                    {/* Status Badges Row */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePublishStatus(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border cursor-pointer ${
                          isPublished
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-amber-50 text-amber-700 border-amber-300"
                        }`}
                      >
                        {isPublished ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{isPublished ? "Published" : "Draft"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleOperationalStatus(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                        <span>{isCompleted ? "Completed" : "Ongoing"}</span>
                      </button>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleRowPreview(p)}
                        className="flex-1 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="flex-1 py-1.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Pencil className="w-3 h-3 text-amber-400" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p, false)}
                        className="p-1.5 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Archive Project"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODALS & PANELS                                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Light Mode Project Preview Modal */}
      {showPreviewModal && previewProjectData && (
        <ProjectPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          project={previewProjectData}
        />
      )}

      {/* 2. Publish Review Modal */}
      {showPublishReviewModal && (
        <PublishReviewModal
          isOpen={showPublishReviewModal}
          onClose={() => setShowPublishReviewModal(false)}
          onConfirmPublish={() => handleSave("published")}
          onJumpToTab={(tabIdx) => {
            const tabs: EditorTab[] = ["general", "specifications", "narrative", "media", "seo"];
            setActiveTab(tabs[tabIdx] || "general");
          }}
          isPublishing={saving}
          project={{
            title: form.title,
            location: form.location,
            date: form.date,
            description: form.description,
            category: form.category,
            image: form.image,
            imageAlt: form.imageAlt,
            shortDescription: form.shortDescription,
            highlights: form.highlights,
            galleryDetails: form.galleryDetails,
            faqs: form.faqs,
            metaTitle: form.metaTitle,
            metaDescription: form.metaDescription,
            focusKeywords: form.focusKeywords,
            city: form.city,
            state: form.state,
            googleMapsUrl: form.googleMapsUrl,
            latitude: form.latitude,
            longitude: form.longitude,
            videoUrl: form.videoUrl,
            client: form.client,
            owner: form.owner,
            area: form.area,
            postalCode: form.postalCode,
            canonicalUrl: form.canonicalUrl,
          }}
        />
      )}

      {/* 3. Project Success Panel */}
      {showSuccessPanel && successPanelData && (
        <ProjectSuccessPanel
          isOpen={showSuccessPanel}
          onClose={() => setShowSuccessPanel(false)}
          onContinueEditing={() => setShowSuccessPanel(false)}
          title={successPanelData.title}
          slug={successPanelData.slug}
          publishStatus={successPanelData.publishStatus}
        />
      )}

      {/* 4. Unsaved Changes Confirm Dialog */}
      {showUnsavedConfirm && (
        <div className="fixed inset-0 z-[10001] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Discard Unsaved Changes?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have unsaved changes in this project workbench. If you close now without saving, those updates will be lost.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={forceCloseEditor}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                Discard &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
