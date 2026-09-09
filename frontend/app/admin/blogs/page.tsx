"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import type { BlogPost } from "@/lib/types";
import ImageUpload from "@/components/admin/ImageUpload";
import { parseMarkdownBlocks, renderFormattedText } from "@/lib/blogUtils";

interface BlogFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
  active: boolean;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const EMPTY_FORM: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  date: "",
  author: "Hindustan Projects",
  category: "Construction & Engineering",
  active: true,
  metaTitle: "",
  metaDescription: "",
  keywords: "",
};

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
  const [previewMode, setPreviewMode] = useState<"write" | "preview" | "split">("write");
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    };
    setForm(fresh);
    setOriginalForm(fresh);
    setEditingId(null);
    setPreviewMode("write");
    setIsFullscreen(false);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const startEdit = (b: BlogPost) => {
    const editData: BlogFormData = {
      id: b.id,
      title: b.title || "",
      slug: b.slug || "",
      excerpt: b.excerpt || "",
      content: b.content || "",
      image: b.image || "",
      date: b.date || getTodayFormatted(),
      author: b.author || "Hindustan Projects",
      category: b.category || "Construction & Engineering",
      active: b.active !== false,
      metaTitle: b.metaTitle || "",
      metaDescription: b.metaDescription || "",
      keywords: b.keywords || "",
    };
    setForm(editData);
    setOriginalForm(editData);
    setEditingId(b.id || null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.image) {
      setError("Cover image is required before publishing or updating.");
      setSaving(false);
      return;
    }

    try {
      const isEdit = Boolean(editingId);
      const url = "/api/blogs";
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit ? { id: editingId, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(isEdit ? "Blog post updated successfully!" : "Blog post published successfully!");
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

  const toggleActive = async (b: BlogPost) => {
    try {
      const res = await fetch("/api/blogs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, active: !b.active }),
      });
      const json = await res.json();
      if (json.success) {
        fetchBlogs();
      } else {
        setError(json.error || "Failed to update post status");
      }
    } catch {
      setError("Network error while updating status");
    }
  };

  // Metrics calculation
  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const charCount = form.content.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const previewBlocks = parseMarkdownBlocks(form.content);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display uppercase tracking-tight">
            Blog &amp; Article Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, publish, and edit high-performing SEO articles and insights for HiPRO.
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
        <form
          onSubmit={handleSubmit}
          className={`bg-white border border-slate-200 shadow-xl rounded-none p-6 md:p-8 space-y-6 transition-all ${
            isFullscreen
              ? "fixed inset-0 z-50 overflow-y-auto bg-white p-6 md:p-10"
              : "relative"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-construction-red/10 text-construction-red">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-slate-900 font-bold text-lg font-display uppercase tracking-tight">
                  {editingId ? "Edit Blog Post" : "Create New Blog Post"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingId
                    ? "Modify fields, preview markdown formatting, and save updates to production."
                    : "Draft and publish a new long-form construction or engineering article."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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

          {/* Cover Image */}
          <div>
            <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
              Cover Image (Required) *
            </label>
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm((p) => ({ ...p, image: url }))}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Title */}
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
                placeholder="e.g. Turnkey Construction vs Labour Contract in Rajasthan"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-semibold"
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

            {/* Content Editor with View Controls */}
            <div className="md:col-span-2">
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

              {/* Helper Toolbar */}
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
                      "\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Item 1 | Item 2 | Item 3 |\n"
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

              {/* Editor / Preview Area */}
              <div
                className={`grid gap-4 ${
                  previewMode === "split" ? "md:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {/* Textarea */}
                {(previewMode === "write" || previewMode === "split") && (
                  <textarea
                    id="blog-content-input"
                    required
                    rows={isFullscreen ? 24 : 14}
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Write your article in Markdown. Use ## for section headings, - for bullet points, ![alt](url) for images, and [text](url) for links..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none p-4 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-mono leading-relaxed"
                  />
                )}

                {/* Live Preview */}
                {(previewMode === "preview" || previewMode === "split") && (
                  <div
                    className={`bg-white border border-slate-200 p-6 overflow-y-auto ${
                      isFullscreen ? "h-[650px]" : "h-[360px]"
                    }`}
                  >
                    <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-wider text-construction-navy">
                        Live Preview
                      </span>
                      <span className="text-xs text-slate-400">Exact Public Rendering</span>
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
                                <img
                                  src={block.content}
                                  alt={block.items?.[0] || "Blog image"}
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

            {/* Category */}
            <div>
              <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                Category *
              </label>
              <input
                required
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g. Construction & Engineering"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
              />
            </div>

            {/* Author */}
            <div>
              <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                Author Name
              </label>
              <input
                value={form.author}
                onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                placeholder="Hindustan Projects"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
              />
            </div>

            {/* Publish Date */}
            <div>
              <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                Publication Date
              </label>
              <input
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                placeholder="e.g. September 9, 2026"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Human-readable calendar date displayed on public cards.
              </span>
            </div>

            {/* Active Status Switch */}
            <div className="flex items-center gap-3 pt-6">
              <label className="text-slate-700 text-xs uppercase tracking-wider font-bold">
                Published Status:
              </label>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors flex items-center gap-2 ${
                  form.active
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                    : "bg-slate-100 text-slate-600 border-slate-300"
                }`}
              >
                {form.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {form.active ? "Published (Live)" : "Draft (Hidden)"}
              </button>
            </div>

            {/* SEO & Discovery */}
            <div className="md:col-span-2 pt-5 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" /> SEO &amp; Discovery Settings
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                    URL Slug (Unique identifier) *
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="e.g. turnkey-construction-vs-labour-contract-in-rajasthan"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Target URL: https://www.hindustanprojects.in/blogs/{form.slug || "slug-here"}
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                    Meta Title (Custom Browser Title)
                  </label>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value }))}
                    placeholder="Leave empty to use main article title"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>

                <div>
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                    Keywords (Comma-separated)
                  </label>
                  <input
                    value={form.keywords}
                    onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))}
                    placeholder="house construction, turnkey, bhilwara, rajasthan"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                    Meta Description (SERP Snippet)
                  </label>
                  <textarea
                    rows={2}
                    value={form.metaDescription}
                    onChange={(e) => setForm((p) => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="Search engine description snippet (150-160 characters recommended)..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving || !form.image}
                className="bg-construction-navy hover:bg-blue-800 text-white px-8 py-3 rounded-none text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20"
              >
                {saving
                  ? "Saving Changes..."
                  : editingId
                  ? "Update Blog Post"
                  : "Publish Blog Post"}
              </button>
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
        </form>
      )}

      {/* Blogs Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 font-semibold w-16">Cover</th>
                <th className="px-5 py-3.5 font-semibold">Article Details</th>
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
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-16">
                    No blog posts found. Click &quot;Create Blog Post&quot; to write your first article.
                  </td>
                </tr>
              ) : (
                blogs.map((b) => (
                  <tr
                    key={b.id}
                    className={`transition-colors ${
                      b.active === false ? "opacity-60 bg-slate-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-5 py-4">
                      {b.image ? (
                        <img
                          src={b.image}
                          alt={b.title}
                          className="w-12 h-12 object-cover rounded-none border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded-none" />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{b.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-400">/{b.slug}</span>
                        <span>•</span>
                        <span>{b.author || "Hindustan Projects"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-none text-xs font-medium">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-xs">{b.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleActive(b)}
                          title={b.active !== false ? "Active (Click to hide)" : "Hidden (Click to publish)"}
                          className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors ${
                            b.active !== false
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          {b.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEdit(b)}
                          title="Edit article"
                          className="w-8 h-8 rounded-none bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-600 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBlog(b.id, b.title)}
                          title="Delete article"
                          className="w-8 h-8 rounded-none bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 flex items-center justify-center transition-all shadow-sm"
                        >
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
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium flex items-center justify-between">
          <span>{blogs.length} blog posts total</span>
          <span className="text-[11px] text-slate-400">
            {blogs.filter((b) => b.active !== false).length} published •{" "}
            {blogs.filter((b) => b.active === false).length} drafts
          </span>
        </div>
      </div>
    </div>
  );
}
