"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Pencil,
  Maximize2,
  Minimize2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Columns,
  Sparkles,
  HelpCircle,
  Link as LinkIcon,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Save,
  Globe,
  Layers,
  Compass,
} from "lucide-react";
import type { BlogPost, FaqItem, InternalLink, BlogCtaConfig, BlogStatus, SearchIntent } from "@/lib/types";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  parseMarkdownBlocks,
  renderFormattedText,
  safeJsonParse,
} from "@/lib/blogUtils";

interface BlogFormData {
  id?: string;
  // Content & Media
  title: string;
  slug: string;
  category: string;
  author: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  excerpt: string;
  content: string;
  date: string;

  // Publishing
  status: BlogStatus;
  publishDate: string; // ISO string or datetime-local
  active: boolean;

  // SEO & GEO
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  geoKeywords: string;
  targetLocation: string;
  searchIntent: SearchIntent;
  keywords: string;

  // Structured Content & Linking
  faqs: FaqItem[];
  internalLinks: InternalLink[];
  relatedPostIds: string[];
  customCta: BlogCtaConfig;
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getTodayIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

const EMPTY_FORM: BlogFormData = {
  title: "",
  slug: "",
  category: "Construction & Engineering",
  author: "Hindustan Projects",
  image: "",
  imageAlt: "",
  imageCaption: "",
  excerpt: "",
  content: "",
  date: "",

  status: "published",
  publishDate: "",
  active: true,

  metaTitle: "",
  metaDescription: "",
  primaryKeyword: "",
  secondaryKeywords: "",
  geoKeywords: "",
  targetLocation: "Bhilwara, Rajasthan",
  searchIntent: "informational",
  keywords: "",

  faqs: [],
  internalLinks: [],
  relatedPostIds: [],
  customCta: {
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
  },
};

type TabKey = "content" | "seo" | "faq" | "links" | "publishing";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormData>(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState<BlogFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("content");
  const [previewMode, setPreviewMode] = useState<"write" | "preview" | "split">("write");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "unpublished">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blogs?all=true");
      const json = await res.json();
      if (json.success) {
        setBlogs(json.data || []);
      } else {
        setError(json.error || "Failed to load blogs");
      }
    } catch {
      setError("Network error while connecting to backend");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("blog-content-input") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.content;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setForm((p) => ({ ...p, content: newContent }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 0);
  };

  const startCreate = () => {
    const fresh: BlogFormData = {
      ...EMPTY_FORM,
      date: getTodayFormatted(),
      publishDate: getTodayIsoDate(),
      status: "published",
      active: true,
    };
    setForm(fresh);
    setOriginalForm(fresh);
    setEditingId(null);
    setActiveTab("content");
    setPreviewMode("write");
    setIsFullscreen(false);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const startEdit = (b: BlogPost) => {
    // Parse structured arrays safely
    const parsedFaqs = safeJsonParse<FaqItem[]>(b.faqs, []);
    const parsedLinks = safeJsonParse<InternalLink[]>(b.internalLinks, []);
    const parsedRelated = safeJsonParse<string[]>(b.relatedPostIds, []);
    const parsedCta = safeJsonParse<BlogCtaConfig>(b.customCta, {
      title: "",
      description: "",
      buttonText: "",
      buttonUrl: "",
    });

    // Determine status
    let initialStatus: BlogStatus = "published";
    if (b.status && ["draft", "published", "unpublished"].includes(b.status.toLowerCase())) {
      initialStatus = b.status.toLowerCase() as BlogStatus;
    } else if (b.active === false) {
      initialStatus = "draft";
    }

    let pDate = "";
    if (b.publishDate) {
      try {
        const d = new Date(b.publishDate);
        if (!isNaN(d.getTime())) {
          const offset = d.getTimezoneOffset() * 60000;
          pDate = new Date(d.getTime() - offset).toISOString().slice(0, 16);
        }
      } catch {
        pDate = "";
      }
    }

    const editData: BlogFormData = {
      id: b.id,
      title: b.title || "",
      slug: b.slug || "",
      category: b.category || "Construction & Engineering",
      author: b.author || "Hindustan Projects",
      image: b.image || "",
      imageAlt: b.imageAlt || "",
      imageCaption: b.imageCaption || "",
      excerpt: b.excerpt || "",
      content: b.content || "",
      date: b.date || getTodayFormatted(),

      status: initialStatus,
      publishDate: pDate,
      active: initialStatus === "published",

      metaTitle: b.metaTitle || "",
      metaDescription: b.metaDescription || "",
      primaryKeyword: b.primaryKeyword || "",
      secondaryKeywords: b.secondaryKeywords || "",
      geoKeywords: b.geoKeywords || "",
      targetLocation: b.targetLocation || "Bhilwara, Rajasthan",
      searchIntent: (b.searchIntent as SearchIntent) || "informational",
      keywords: b.keywords || "",

      faqs: Array.isArray(parsedFaqs) ? parsedFaqs : [],
      internalLinks: Array.isArray(parsedLinks) ? parsedLinks : [],
      relatedPostIds: Array.isArray(parsedRelated) ? parsedRelated : [],
      customCta: parsedCta && typeof parsedCta === "object" ? parsedCta : EMPTY_FORM.customCta,
    };

    setForm(editData);
    setOriginalForm(editData);
    setEditingId(b.id || null);
    setActiveTab("content");
    setPreviewMode("write");
    setIsFullscreen(false);
    setError("");
    setSuccess("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFormDirty = () => {
    return JSON.stringify(form) !== JSON.stringify(originalForm);
  };

  const handleCloseForm = () => {
    if (isFormDirty()) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes in this blog post. Are you sure you want to discard them?"
      );
      if (!confirmDiscard) return;
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOriginalForm(EMPTY_FORM);
    setIsFullscreen(false);
    setError("");
  };

  const handleSlugifyTitle = () => {
    if (!form.title) return;
    const autoSlug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setForm((p) => ({ ...p, slug: autoSlug }));
  };

  // FAQ builder actions
  const addFaq = () => {
    setForm((p) => ({
      ...p,
      faqs: [...p.faqs, { question: "", answer: "" }],
    }));
  };

  const updateFaq = (index: number, field: "question" | "answer", val: string) => {
    setForm((p) => {
      const updated = [...p.faqs];
      updated[index] = { ...updated[index], [field]: val };
      return { ...p, faqs: updated };
    });
  };

  const removeFaq = (index: number) => {
    setForm((p) => ({
      ...p,
      faqs: p.faqs.filter((_, i) => i !== index),
    }));
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === form.faqs.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    setForm((p) => {
      const updated = [...p.faqs];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...p, faqs: updated };
    });
  };

  // Internal Links builder actions
  const addInternalLink = () => {
    setForm((p) => ({
      ...p,
      internalLinks: [...p.internalLinks, { label: "", url: "" }],
    }));
  };

  const updateInternalLink = (index: number, field: "label" | "url", val: string) => {
    setForm((p) => {
      const updated = [...p.internalLinks];
      updated[index] = { ...updated[index], [field]: val };
      return { ...p, internalLinks: updated };
    });
  };

  const removeInternalLink = (index: number) => {
    setForm((p) => ({
      ...p,
      internalLinks: p.internalLinks.filter((_, i) => i !== index),
    }));
  };

  // Submission handler supporting explicit target status
  const executeSave = async (overrideStatus?: BlogStatus) => {
    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Article title is required.");
      setActiveTab("content");
      setSaving(false);
      return;
    }

    if (!form.content.trim()) {
      setError("Article body content is required.");
      setActiveTab("content");
      setSaving(false);
      return;
    }

    if (!form.image) {
      setError("Cover image is required before saving or publishing.");
      setActiveTab("content");
      setSaving(false);
      return;
    }

    const targetStatus = overrideStatus || form.status;
    const targetActive = targetStatus === "published";

    // Clean valid FAQs
    const cleanFaqs = form.faqs
      .filter((f) => f.question.trim().length > 0 && f.answer.trim().length > 0)
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));

    // Clean valid internal links
    const cleanLinks = form.internalLinks
      .filter((l) => l.label.trim().length > 0 && l.url.trim().length > 0)
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() }));

    // Clean CTA
    const hasCustomCta =
      form.customCta.title.trim() &&
      form.customCta.buttonText.trim() &&
      form.customCta.buttonUrl.trim();
    const cleanCta = hasCustomCta
      ? {
          title: form.customCta.title.trim(),
          description: form.customCta.description?.trim() || undefined,
          buttonText: form.customCta.buttonText.trim(),
          buttonUrl: form.customCta.buttonUrl.trim(),
        }
      : null;

    // Convert publishDate to ISO if provided
    let isoPublishDate: string | null = null;
    if (form.publishDate) {
      try {
        const d = new Date(form.publishDate);
        if (!isNaN(d.getTime())) {
          isoPublishDate = d.toISOString();
        }
      } catch {
        isoPublishDate = null;
      }
    }

    const payload = {
      id: editingId || undefined,
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      author: form.author.trim() || "Hindustan Projects",
      image: form.image.trim(),
      imageAlt: form.imageAlt.trim() || form.title.trim(),
      imageCaption: form.imageCaption.trim() || null,
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      date: form.date.trim() || getTodayFormatted(),

      status: targetStatus,
      publishDate: isoPublishDate,
      active: targetActive,

      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      primaryKeyword: form.primaryKeyword.trim() || null,
      secondaryKeywords: form.secondaryKeywords.trim() || null,
      geoKeywords: form.geoKeywords.trim() || null,
      targetLocation: form.targetLocation.trim() || null,
      searchIntent: form.searchIntent || "informational",
      keywords: form.keywords.trim() || null,

      faqs: cleanFaqs.length > 0 ? JSON.stringify(cleanFaqs) : null,
      internalLinks: cleanLinks.length > 0 ? JSON.stringify(cleanLinks) : null,
      relatedPostIds: form.relatedPostIds.length > 0 ? JSON.stringify(form.relatedPostIds) : null,
      customCta: cleanCta ? JSON.stringify(cleanCta) : null,
    };

    try {
      const isEdit = Boolean(editingId);
      const url = "/api/blogs";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        const actionVerb =
          targetStatus === "published"
            ? "published"
            : targetStatus === "draft"
            ? "saved as draft"
            : "unpublished";
        setSuccess(`Blog post ${actionVerb} successfully!`);
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setOriginalForm(EMPTY_FORM);
        fetchBlogs();
      } else {
        setError(json.error || "Failed to save blog post");
      }
    } catch {
      setError("Network error occurred while saving post");
    }
    setSaving(false);
  };

  const deleteBlog = async (id?: string, title?: string) => {
    if (!id) return;
    const promptMsg = title
      ? `Are you sure you want to permanently delete "${title}"? This action cannot be undone.`
      : "Are you sure you want to delete this blog post? This action cannot be undone.";

    if (!window.confirm(promptMsg)) return;

    try {
      const res = await fetch("/api/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("Blog post deleted successfully.");
        fetchBlogs();
      } else {
        setError(json.error || "Failed to delete blog post");
      }
    } catch {
      setError("Network error while deleting post");
    }
  };

  // Metrics calculation
  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const charCount = form.content.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const previewBlocks = parseMarkdownBlocks(form.content);

  // Filtered blogs for table
  const filteredBlogs = blogs.filter((b) => {
    const postStatus = (b.status || (b.active !== false ? "published" : "draft")).toLowerCase();
    if (statusFilter !== "all" && postStatus !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = b.title?.toLowerCase().includes(q);
      const matchSlug = b.slug?.toLowerCase().includes(q);
      const matchCat = b.category?.toLowerCase().includes(q);
      const matchAuthor = b.author?.toLowerCase().includes(q);
      return matchTitle || matchSlug || matchCat || matchAuthor;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display uppercase tracking-tight">
            Blog CMS V2 &amp; SEO Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Production content management system with structured FAQs, local SEO targeting, and publishing workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBlogs}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-none text-xs font-medium disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          {!showForm && (
            <button
              onClick={startCreate}
              className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-4 py-2 rounded-none text-sm font-semibold transition-colors shadow-md shadow-blue-900/20"
            >
              <Plus className="w-4 h-4" /> Create Blog Post
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-none bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-none bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {success}
          </div>
          <button
            onClick={() => setSuccess("")}
            className="text-xs uppercase font-bold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create / Edit Form Modal or Container */}
      {showForm && (
        <div
          className={`bg-white border border-slate-200 shadow-xl rounded-none p-6 md:p-8 space-y-6 transition-all ${
            isFullscreen
              ? "fixed inset-0 z-50 overflow-y-auto bg-white p-6 md:p-10"
              : "relative"
          }`}
        >
          {/* Form Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-construction-red/10 text-construction-red">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-slate-900 font-bold text-lg font-display uppercase tracking-tight">
                    {editingId ? "Edit Article" : "Create New Article"}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                      form.status === "published"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : form.status === "draft"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-300"
                    }`}
                  >
                    {form.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {editingId
                    ? `Slug: /blogs/${form.slug || "slug-here"}`
                    : "Draft and publish an SEO-optimized engineering or construction guide."}
                </p>
              </div>
            </div>

            {/* Quick Actions & Window Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {form.slug && (
                <Link
                  href={`/blogs/${form.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 text-xs font-semibold text-construction-navy hover:text-construction-red border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                  title="Preview live or draft article (Admin authenticated)"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Preview Page
                </Link>
              )}

              <button
                type="button"
                onClick={() => executeSave("draft")}
                disabled={saving}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Save Draft
              </button>

              <button
                type="button"
                onClick={() => executeSave("published")}
                disabled={saving}
                className="px-4 py-1.5 bg-construction-navy hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-900/20"
              >
                <Globe className="w-3.5 h-3.5" /> Publish Now
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleCloseForm}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-semibold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>

          {/* CMS V2 Navigation Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`px-5 py-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === "content"
                  ? "border-construction-navy text-construction-navy bg-white font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" /> 1. Content &amp; Media
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`px-5 py-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === "seo"
                  ? "border-construction-navy text-construction-navy bg-white font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Compass className="w-4 h-4" /> 2. SEO &amp; GEO
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={`px-5 py-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === "faq"
                  ? "border-construction-navy text-construction-navy bg-white font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <HelpCircle className="w-4 h-4" /> 3. FAQ Builder ({form.faqs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("links")}
              className={`px-5 py-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === "links"
                  ? "border-construction-navy text-construction-navy bg-white font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <LinkIcon className="w-4 h-4" /> 4. Links &amp; CTA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("publishing")}
              className={`px-5 py-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === "publishing"
                  ? "border-construction-navy text-construction-navy bg-white font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-4 h-4" /> 5. Publishing
            </button>
          </div>

          {/* TAB 1: CONTENT & MEDIA */}
          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Cover Image + Alt Text + Caption */}
              <div className="grid md:grid-cols-3 gap-5 p-5 bg-slate-50 border border-slate-200">
                <div className="md:col-span-1">
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Cover Image (Required) *
                  </label>
                  <ImageUpload
                    value={form.image}
                    onChange={(url) => setForm((p) => ({ ...p, image: url }))}
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                      Image Alt Text (Accessibility &amp; Google Image SEO)
                    </label>
                    <input
                      value={form.imageAlt}
                      onChange={(e) => setForm((p) => ({ ...p, imageAlt: e.target.value }))}
                      placeholder="Descriptive alt text, e.g. Residential turnkey building foundation under construction in Bhilwara"
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Defaults to article title if left blank.
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                      Image Caption (Editorial attribution or subtitle)
                    </label>
                    <input
                      value={form.imageCaption}
                      onChange={(e) => setForm((p) => ({ ...p, imageCaption: e.target.value }))}
                      placeholder="e.g. Modern duplex civil construction project executed by HiPRO in Rajasthan."
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-700 text-xs uppercase tracking-wider block font-bold">
                      Article Title *
                    </label>
                    <button
                      type="button"
                      onClick={handleSlugifyTitle}
                      className="text-[11px] text-construction-navy hover:text-construction-red font-semibold uppercase tracking-wider flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-generate Slug
                    </button>
                  </div>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Turnkey Construction vs Labour Contract in Rajasthan: Complete Cost Guide"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    URL Slug (Unique URL identifier) *
                  </label>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="turnkey-construction-vs-labour-contract-in-rajasthan"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Public URL: https://www.hindustanprojects.in/blogs/{form.slug || "slug-here"}
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Category *
                  </label>
                  <input
                    required
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Construction & Engineering"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>

                {/* Excerpt */}
                <div className="md:col-span-2">
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Excerpt (Summary Lead Paragraph) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.excerpt}
                    onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                    placeholder="A compelling 1-2 sentence lead paragraph displayed on blog cards and search engine snippets..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>
              </div>

              {/* Markdown Editor & Toolbar */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <label className="text-slate-700 text-xs uppercase tracking-wider block font-bold">
                      Article Body (Markdown) *
                    </label>
                    <div className="flex items-center border border-slate-200 rounded-none text-xs bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("write")}
                        className={`px-3 py-1 font-semibold transition-colors ${
                          previewMode === "write"
                            ? "bg-construction-navy text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("preview")}
                        className={`px-3 py-1 font-semibold transition-colors ${
                          previewMode === "preview"
                            ? "bg-construction-navy text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("split")}
                        className={`px-3 py-1 font-semibold hidden md:flex items-center gap-1 transition-colors ${
                          previewMode === "split"
                            ? "bg-construction-navy text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Columns className="w-3 h-3" /> Split View
                      </button>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span>{wordCount} words</span>
                    <span>{charCount} chars</span>
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-construction-red" />
                      {readTimeMin} min read
                    </span>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 border border-slate-200 text-xs mb-2">
                  <button
                    type="button"
                    onClick={() => insertMarkdown("## ", "\n")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-200"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("### ", "\n")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-200"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("**", "**")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-200"
                    title="Bold"
                  >
                    **Bold**
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("*", "*")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 italic border border-slate-200"
                    title="Italic"
                  >
                    *Italic*
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("`", "`")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 font-mono border border-slate-200 text-[11px]"
                    title="Inline Code"
                  >
                    `Code`
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("- ", "\n")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 border border-slate-200"
                    title="Bullet List"
                  >
                    • Bullet
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("1. ", "\n")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 border border-slate-200"
                    title="Numbered List"
                  >
                    1. Numbered
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("[", "](https://)")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-blue-700 underline border border-slate-200"
                    title="Link"
                  >
                    [Link]
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("![Alt description](", ")")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-emerald-700 border border-slate-200 font-semibold"
                    title="Image Markdown"
                  >
                    ![Image]
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertMarkdown(
                        "\n| Feature | Option A | Option B |\n| :--- | :--- | :--- |\n| Scope | Full Turnkey | Labour Only |\n"
                      )
                    }
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold"
                    title="Table Template"
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("> ", "\n")}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 italic border border-slate-200"
                    title="Quote"
                  >
                    &quot; Quote
                  </button>
                </div>

                {/* Editor / Live Preview Container */}
                <div
                  className={`grid gap-4 ${
                    previewMode === "split" ? "md:grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {(previewMode === "write" || previewMode === "split") && (
                    <textarea
                      id="blog-content-input"
                      required
                      rows={isFullscreen ? 26 : 16}
                      value={form.content}
                      onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                      placeholder="Write your article in Markdown. Use ## for H2 headings, ### for H3 headings, - for lists, and [label](url) for links..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none p-4 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-mono leading-relaxed"
                    />
                  )}

                  {(previewMode === "preview" || previewMode === "split") && (
                    <div
                      className={`bg-white border border-slate-200 p-6 overflow-y-auto ${
                        isFullscreen ? "h-[680px]" : "h-[400px]"
                      }`}
                    >
                      <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                        <span className="text-xs uppercase font-bold tracking-wider text-construction-navy">
                          Live Rendering Preview
                        </span>
                        <span className="text-xs text-slate-400">Exact Semantic HTML</span>
                      </div>

                      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
                        {form.excerpt && (
                          <p className="text-base text-slate-800 font-light leading-relaxed mb-6 border-l-4 border-construction-red pl-4 italic bg-slate-50 py-2">
                            {form.excerpt}
                          </p>
                        )}

                        {previewBlocks.map((block, idx) => {
                          switch (block.type) {
                            case "h1":
                            case "h2":
                              return (
                                <h2
                                  key={idx}
                                  className="text-xl font-bold text-slate-900 mt-6 mb-3 font-display uppercase tracking-tight"
                                >
                                  {block.content}
                                </h2>
                              );
                            case "h3":
                              return (
                                <h3
                                  key={idx}
                                  className="text-base font-bold text-construction-navy mt-4 mb-2 font-display"
                                >
                                  {block.content}
                                </h3>
                              );
                            case "image":
                              return (
                                <figure key={idx} className="my-4">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={block.content}
                                    alt={block.items?.[0] || "Blog visual"}
                                    className="w-full max-h-72 object-cover border border-slate-200 shadow-sm"
                                  />
                                  {block.items?.[0] && (
                                    <figcaption className="text-xs text-slate-500 mt-1 text-center italic">
                                      {block.items[0]}
                                    </figcaption>
                                  )}
                                </figure>
                              );
                            case "ul":
                              return (
                                <ul key={idx} className="space-y-1.5 my-3 pl-2">
                                  {block.items?.map((it, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700">
                                      <span className="w-1.5 h-1.5 rounded-full bg-construction-red mt-2 shrink-0" />
                                      <span>{renderFormattedText(it)}</span>
                                    </li>
                                  ))}
                                </ul>
                              );
                            case "ol":
                              return (
                                <ol key={idx} className="space-y-1.5 my-3 pl-2 list-none">
                                  {block.items?.map((it, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700">
                                      <span className="text-xs font-bold text-construction-red mt-0.5 shrink-0">
                                        0{i + 1}.
                                      </span>
                                      <span>{renderFormattedText(it)}</span>
                                    </li>
                                  ))}
                                </ol>
                              );
                            case "blockquote":
                              return (
                                <blockquote
                                  key={idx}
                                  className="border-l-4 border-construction-red bg-slate-50 p-4 my-4 italic text-slate-800"
                                >
                                  {renderFormattedText(block.content || "")}
                                </blockquote>
                              );
                            case "table":
                              return (
                                <div key={idx} className="overflow-x-auto my-4 border border-slate-200">
                                  <table className="w-full text-left text-xs">
                                    {block.headers && (
                                      <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-900">
                                        <tr>
                                          {block.headers.map((h, hi) => (
                                            <th key={hi} className="p-2.5">
                                              {h}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                    )}
                                    {block.rows && (
                                      <tbody className="divide-y divide-slate-100">
                                        {block.rows.map((r, ri) => (
                                          <tr key={ri} className="hover:bg-slate-50">
                                            {r.map((c, ci) => (
                                              <td key={ci} className="p-2.5 text-slate-600">
                                                {renderFormattedText(c)}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    )}
                                  </table>
                                </div>
                              );
                            case "paragraph":
                            default:
                              return (
                                <p key={idx} className="my-2.5">
                                  {renderFormattedText(block.content || "")}
                                </p>
                              );
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEO & GEO STRATEGY */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              {/* Live Google SERP Simulation */}
              <div className="p-5 bg-slate-50 border border-slate-200">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" /> Google Search Result Simulation (SERP Preview)
                </div>
                <div className="bg-white p-4 border border-slate-200 max-w-2xl rounded-sm shadow-sm">
                  <div className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-mono">
                    <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700">
                      H
                    </span>
                    <span>https://www.hindustanprojects.in &gt; blogs &gt; {form.slug || "article-url"}</span>
                  </div>
                  <h4 className="text-blue-800 hover:underline text-lg font-medium cursor-pointer leading-snug">
                    {form.metaTitle || form.title || "Article Meta Title Will Appear Here | Hindustan Projects"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {form.metaDescription || form.excerpt || "Your meta description snippet will appear here in Google search engine results..."}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Meta Title with character length meter */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-700 text-xs uppercase tracking-wider block font-bold">
                      Meta Title (Custom Browser / SERP Title)
                    </label>
                    <span
                      className={`text-xs font-semibold ${
                        form.metaTitle.length > 60
                          ? "text-amber-600"
                          : form.metaTitle.length >= 45
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {form.metaTitle.length}/60 chars (recommended: 50–60)
                    </span>
                  </div>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value }))}
                    placeholder="e.g. Turnkey Construction in Bhilwara | Cost, Timeline & Quality Guide (2026)"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>

                {/* Meta Description with character meter */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-700 text-xs uppercase tracking-wider block font-bold">
                      Meta Description (Search Engine Snippet)
                    </label>
                    <span
                      className={`text-xs font-semibold ${
                        form.metaDescription.length > 160
                          ? "text-amber-600"
                          : form.metaDescription.length >= 130
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {form.metaDescription.length}/160 chars (recommended: 140–160)
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={form.metaDescription}
                    onChange={(e) => setForm((p) => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="A concise, compelling 140–160 character description designed to maximize search click-through rate..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>

                {/* Primary Keyword */}
                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Primary Keyword *
                  </label>
                  <input
                    value={form.primaryKeyword}
                    onChange={(e) => setForm((p) => ({ ...p, primaryKeyword: e.target.value }))}
                    placeholder="e.g. turnkey construction cost in bhilwara"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-semibold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Target search term this article is designed to rank for.
                  </span>
                </div>

                {/* Search Intent */}
                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Search Intent
                  </label>
                  <select
                    value={form.searchIntent}
                    onChange={(e) => setForm((p) => ({ ...p, searchIntent: e.target.value as SearchIntent }))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-medium"
                  >
                    <option value="informational">Informational (Guides, tutorials, insights)</option>
                    <option value="commercial">Commercial (Comparing services, evaluation)</option>
                    <option value="transactional">Transactional (Ready to hire, get a quote)</option>
                    <option value="navigational">Navigational (Brand or company specific)</option>
                  </select>
                </div>

                {/* Secondary Keywords */}
                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Secondary Keywords (Comma-separated)
                  </label>
                  <input
                    value={form.secondaryKeywords}
                    onChange={(e) => setForm((p) => ({ ...p, secondaryKeywords: e.target.value }))}
                    placeholder="house construction rates, labour vs turnkey, civil contractors"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>

                {/* Local & GEO Keywords */}
                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Local &amp; GEO Keywords
                  </label>
                  <input
                    value={form.geoKeywords}
                    onChange={(e) => setForm((p) => ({ ...p, geoKeywords: e.target.value }))}
                    placeholder="Bhilwara, Jaipur, Udaipur, Chittorgarh, Rajasthan"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>

                {/* Target Location */}
                <div className="md:col-span-2">
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Target Location (For Schema.org Geographic Place)
                  </label>
                  <input
                    value={form.targetLocation}
                    onChange={(e) => setForm((p) => ({ ...p, targetLocation: e.target.value }))}
                    placeholder="e.g. Bhilwara, Rajasthan, India"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Injected into Schema.org BlogPosting `contentLocation` structured data for local map &amp; SERP relevance.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ BUILDER */}
          {activeTab === "faq" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Structured FAQ Builder
                  </h4>
                  <p className="text-xs text-slate-500">
                    Questions entered here automatically render in a public accordion and generate Schema.org FAQPage JSON-LD.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFaq}
                  className="flex items-center gap-1.5 bg-construction-navy text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>

              {form.faqs.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 bg-slate-50">
                  <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No FAQs added yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click &quot;Add Question&quot; to provide clear Q&amp;A blocks for search engines and readers.
                  </p>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="mt-3 text-xs text-construction-navy hover:text-construction-red font-bold uppercase tracking-wider"
                  >
                    + Add First FAQ
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-construction-red uppercase tracking-wider">
                          FAQ #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveFaq(idx, "up")}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === form.faqs.length - 1}
                            onClick={() => moveFaq(idx, "down")}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFaq(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 ml-1"
                            title="Remove FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-700 text-xs font-bold block mb-1">
                          Question:
                        </label>
                        <input
                          value={faq.question}
                          onChange={(e) => updateFaq(idx, "question", e.target.value)}
                          placeholder="e.g. How much does turnkey house construction cost per sq ft in Bhilwara?"
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 text-xs focus:outline-none focus:border-construction-navy"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 text-xs font-bold block mb-1">
                          Answer:
                        </label>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                          placeholder="Direct, authoritative answer without promotional fluff..."
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 text-xs focus:outline-none focus:border-construction-navy leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LINKS & CTA */}
          {activeTab === "links" && (
            <div className="space-y-8">
              {/* Contextual Internal Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                      Contextual Internal Links
                    </h4>
                    <p className="text-xs text-slate-500">
                      Recommend specific service pages or tools to associate with this topic.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addInternalLink}
                    className="flex items-center gap-1.5 bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>

                {form.internalLinks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No custom internal links specified.</p>
                ) : (
                  <div className="space-y-2">
                    {form.internalLinks.map((link, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-2">
                        <input
                          value={link.label}
                          onChange={(e) => updateInternalLink(lIdx, "label", e.target.value)}
                          placeholder="Anchor text, e.g. Architectural Planning"
                          className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 text-xs"
                        />
                        <input
                          value={link.url}
                          onChange={(e) => updateInternalLink(lIdx, "url", e.target.value)}
                          placeholder="/services/architecture-planning"
                          className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => removeInternalLink(lIdx)}
                          className="p-2 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Articles Selector */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Curated Related Articles
                </h4>
                <p className="text-xs text-slate-500">
                  Select specific published articles to highlight in the sidebar (falls back to latest 3 if empty).
                </p>
                <div className="grid md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 border border-slate-200">
                  {blogs
                    .filter((b) => b.id !== form.id)
                    .map((b) => {
                      const isChecked = form.relatedPostIds.includes(b.slug || b.id || "");
                      return (
                        <label
                          key={b.id}
                          className="flex items-start gap-2.5 p-2 bg-white border border-slate-200 text-xs cursor-pointer hover:bg-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const slugOrId = b.slug || b.id || "";
                              if (e.target.checked) {
                                setForm((p) => ({
                                  ...p,
                                  relatedPostIds: [...p.relatedPostIds, slugOrId],
                                }));
                              } else {
                                setForm((p) => ({
                                  ...p,
                                  relatedPostIds: p.relatedPostIds.filter((x) => x !== slugOrId),
                                }));
                              }
                            }}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <span className="font-bold text-slate-900 line-clamp-1">{b.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">/{b.slug}</span>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Custom CTA Override */}
              <div className="space-y-4 pt-4 border-t border-slate-200 p-5 bg-slate-50 border">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Custom Article CTA Override
                  </h4>
                  <p className="text-xs text-slate-500">
                    Optional: Override the default Rajasthan cost calculator sidebar widget with a tailored inquiry call-to-action.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 text-xs font-bold block mb-1">CTA Headline</label>
                    <input
                      value={form.customCta.title}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          customCta: { ...p.customCta, title: e.target.value },
                        }))
                      }
                      placeholder="e.g. Need Structural Drawings for Your Plot?"
                      className="w-full bg-white border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs font-bold block mb-1">Button Text</label>
                    <input
                      value={form.customCta.buttonText}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          customCta: { ...p.customCta, buttonText: e.target.value },
                        }))
                      }
                      placeholder="Consult an Architect"
                      className="w-full bg-white border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs font-bold block mb-1">Button Destination URL</label>
                    <input
                      value={form.customCta.buttonUrl}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          customCta: { ...p.customCta, buttonUrl: e.target.value },
                        }))
                      }
                      placeholder="/contact?service=Architecture"
                      className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs font-bold block mb-1">CTA Subtitle / Description</label>
                    <input
                      value={form.customCta.description || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          customCta: { ...p.customCta, description: e.target.value },
                        }))
                      }
                      placeholder="Speak with our senior civil engineer in Bhilwara today."
                      className="w-full bg-white border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PUBLISHING & WORKFLOW */}
          {activeTab === "publishing" && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Publication Status &amp; Visibility
                </h4>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Draft */}
                  <div
                    onClick={() => setForm((p) => ({ ...p, status: "draft", active: false }))}
                    className={`p-4 border text-left cursor-pointer transition-all ${
                      form.status === "draft"
                        ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400/20"
                        : "bg-white border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-amber-800">
                        Draft
                      </span>
                      <EyeOff className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Hidden from public listing and sitemap. Visible only to logged-in admins.
                    </p>
                  </div>

                  {/* Published */}
                  <div
                    onClick={() => setForm((p) => ({ ...p, status: "published", active: true }))}
                    className={`p-4 border text-left cursor-pointer transition-all ${
                      form.status === "published"
                        ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20"
                        : "bg-white border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                        Published (Live)
                      </span>
                      <Eye className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Publicly visible, indexed in sitemap.xml, and eligible for Google rankings.
                    </p>
                  </div>

                  {/* Unpublished */}
                  <div
                    onClick={() => setForm((p) => ({ ...p, status: "unpublished", active: false }))}
                    className={`p-4 border text-left cursor-pointer transition-all ${
                      form.status === "unpublished"
                        ? "bg-slate-200 border-slate-400 ring-2 ring-slate-400/20"
                        : "bg-white border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        Unpublished
                      </span>
                      <EyeOff className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Taken down from public access. Kept safely in database for future reactivation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Publication Schedule Date */}
                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Publication Timestamp (Local Time)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.publishDate}
                    onChange={(e) => setForm((p) => ({ ...p, publishDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:border-construction-navy"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    If set in the future, the article will automatically remain hidden from the public until this timestamp is reached.
                  </span>
                </div>

                {/* Display Date */}
                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Human-Readable Display Date
                  </label>
                  <input
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    placeholder="e.g. September 9, 2026"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:border-construction-navy"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Rendered directly on cards and the article header.
                  </span>
                </div>

                {/* Author Name */}
                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                    Author Name
                  </label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                    placeholder="Hindustan Projects"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:border-construction-navy"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Footer Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => executeSave("published")}
                disabled={saving}
                className="bg-construction-navy hover:bg-blue-800 text-white px-8 py-3 rounded-none text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20"
              >
                {saving ? "Saving..." : editingId ? "Update & Publish" : "Publish Article"}
              </button>

              <button
                type="button"
                onClick={() => executeSave("draft")}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-none text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-colors shadow-sm"
              >
                Save as Draft
              </button>

              {editingId && form.status === "published" && (
                <button
                  type="button"
                  onClick={() => executeSave("unpublished")}
                  disabled={saving}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-3 rounded-none text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Unpublish
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseForm}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-none text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
            </div>

            {isFormDirty() && (
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> You have unsaved changes
              </span>
            )}
          </div>
        </div>
      )}

      {/* Blogs Table with Filters */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 border transition-colors ${
                statusFilter === "all"
                  ? "bg-construction-navy text-white border-construction-navy"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              All ({blogs.length})
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-3 py-1.5 border transition-colors ${
                statusFilter === "published"
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Published ({blogs.filter((b) => (b.status || (b.active !== false ? "published" : "draft")) === "published").length})
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1.5 border transition-colors ${
                statusFilter === "draft"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Drafts ({blogs.filter((b) => (b.status || (b.active !== false ? "published" : "draft")) === "draft").length})
            </button>
            <button
              onClick={() => setStatusFilter("unpublished")}
              className={`px-3 py-1.5 border transition-colors ${
                statusFilter === "unpublished"
                  ? "bg-slate-700 text-white border-slate-700"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Unpublished ({blogs.filter((b) => b.status === "unpublished").length})
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 text-xs text-slate-900 rounded-none focus:outline-none focus:border-construction-navy"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 font-semibold w-16">Cover</th>
                <th className="px-5 py-3.5 font-semibold">Article &amp; SEO Target</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded-none w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-16">
                    {searchQuery || statusFilter !== "all"
                      ? "No articles matching the selected filters."
                      : "No blog posts found. Click \"Create Blog Post\" to write your first article."}
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((b) => {
                  const postStatus = (b.status || (b.active !== false ? "published" : "draft")).toLowerCase();
                  return (
                    <tr
                      key={b.id}
                      className={`transition-colors ${
                        postStatus !== "published" ? "bg-slate-50/50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        {b.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={b.image}
                            alt={b.imageAlt || b.title}
                            className="w-12 h-12 object-cover rounded-none border border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 rounded-none" />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{b.title}</div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-slate-400">/{b.slug}</span>
                          {b.primaryKeyword && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 border border-blue-200">
                              KW: {b.primaryKeyword}
                            </span>
                          )}
                          {b.targetLocation && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2">
                              {b.targetLocation}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-none text-xs font-medium">
                          {b.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-xs">
                        {b.date}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                            postStatus === "published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : postStatus === "draft"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          {postStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/blogs/${b.slug}`}
                            target="_blank"
                            title="Preview article"
                            className="w-8 h-8 rounded-none bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all shadow-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => startEdit(b)}
                            title="Edit article"
                            className="w-8 h-8 rounded-none bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-600 flex items-center justify-center transition-all shadow-sm"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteBlog(b.id, b.title)}
                            title="Delete article"
                            className="w-8 h-8 rounded-none bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 flex items-center justify-center transition-all shadow-sm"
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
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium flex items-center justify-between">
          <span>{filteredBlogs.length} articles shown</span>
          <span className="text-[11px] text-slate-400">
            {blogs.filter((b) => (b.status || (b.active !== false ? "published" : "draft")) === "published").length} published •{" "}
            {blogs.filter((b) => (b.status || (b.active !== false ? "published" : "draft")) === "draft").length} drafts •{" "}
            {blogs.filter((b) => b.status === "unpublished").length} unpublished
          </span>
        </div>
      </div>
    </div>
  );
}
