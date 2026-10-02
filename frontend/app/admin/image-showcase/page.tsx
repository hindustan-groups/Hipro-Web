"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  Settings as SettingsIcon,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import HomeImageShowcase, {
  DEFAULT_IMAGE_SHOWCASE,
  DEFAULT_SHOWCASE_ITEMS,
} from "@/components/HomeImageShowcase";
import type { Settings, ImageShowcaseContent, ImageShowcaseItem } from "@/lib/types";

interface SectionFormState {
  badge: string;
  title: string;
  subtitle: string;
  enabled: boolean;
}

export default function AdminImageShowcasePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  // Full settings document preserved for non-destructive updates
  const [fullSettings, setFullSettings] = useState<Settings | null>(null);

  // Section level configuration
  const [sectionForm, setSectionForm] = useState<SectionFormState>({
    badge: DEFAULT_IMAGE_SHOWCASE.badge || "OUR WORK IN FOCUS",
    title: DEFAULT_IMAGE_SHOWCASE.title || "Engineering & Architectural Footprint",
    subtitle: DEFAULT_IMAGE_SHOWCASE.subtitle || "",
    enabled: true,
  });

  // Showcase items list
  const [items, setItems] = useState<ImageShowcaseItem[]>(DEFAULT_SHOWCASE_ITEMS);

  // Baseline for dirty state detection
  const [baseline, setBaseline] = useState<{
    sectionForm: SectionFormState;
    itemsJson: string;
  }>({
    sectionForm: {
      badge: DEFAULT_IMAGE_SHOWCASE.badge || "OUR WORK IN FOCUS",
      title: DEFAULT_IMAGE_SHOWCASE.title || "Engineering & Architectural Footprint",
      subtitle: DEFAULT_IMAGE_SHOWCASE.subtitle || "",
      enabled: true,
    },
    itemsJson: JSON.stringify(DEFAULT_SHOWCASE_ITEMS),
  });

  // Modal / Drawer state for adding or editing an image
  const [editingItem, setEditingItem] = useState<ImageShowcaseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalForm, setModalForm] = useState<ImageShowcaseItem>({
    id: "",
    image: "",
    title: "",
    alt: "",
    category: "Commercial",
    order: 1,
    active: true,
  });

  // Collapsible section config panel
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  // Live preview toggle
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Calculate dirty state
  const isDirty = useMemo(() => {
    const formChanged =
      sectionForm.badge !== baseline.sectionForm.badge ||
      sectionForm.title !== baseline.sectionForm.title ||
      sectionForm.subtitle !== baseline.sectionForm.subtitle ||
      sectionForm.enabled !== baseline.sectionForm.enabled;
    const itemsChanged = JSON.stringify(items) !== baseline.itemsJson;
    return formChanged || itemsChanged;
  }, [sectionForm, items, baseline]);

  // Fetch settings from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setStatusMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/settings", { credentials: "include" });
      const json = await res.json();

      if (json.success && json.data) {
        const s: Settings = json.data;
        setFullSettings(s);

        let pc: any = {};
        if (s.pageContent) {
          try {
            pc = typeof s.pageContent === "string" ? JSON.parse(s.pageContent) : s.pageContent;
          } catch {
            pc = {};
          }
        }

        const showcase: ImageShowcaseContent = pc.imageShowcase || {};

        const loadedSection: SectionFormState = {
          badge: showcase.badge ?? DEFAULT_IMAGE_SHOWCASE.badge ?? "OUR WORK IN FOCUS",
          title: showcase.title ?? DEFAULT_IMAGE_SHOWCASE.title ?? "Engineering & Architectural Footprint",
          subtitle: showcase.subtitle ?? DEFAULT_IMAGE_SHOWCASE.subtitle ?? "",
          enabled: showcase.enabled !== undefined ? showcase.enabled : true,
        };

        const loadedItems: ImageShowcaseItem[] =
          Array.isArray(showcase.items) && showcase.items.length > 0
            ? showcase.items.map((it, idx) => ({
                id: it.id || `showcase-${idx + 1}`,
                image: it.image || "",
                title: it.title || "",
                alt: it.alt || "",
                category: it.category || "Commercial",
                order: it.order ?? idx + 1,
                active: it.active !== false,
              }))
            : DEFAULT_SHOWCASE_ITEMS;

        setSectionForm(loadedSection);
        setItems(loadedItems);
        setBaseline({
          sectionForm: loadedSection,
          itemsJson: JSON.stringify(loadedItems),
        });
      }
    } catch {
      setStatusMessage({
        text: "Failed to load showcase data. Please verify your connection.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true);
    setStatusMessage({ text: "", type: "" });

    try {
      let currentParsed: any = {};
      if (fullSettings?.pageContent) {
        try {
          currentParsed =
            typeof fullSettings.pageContent === "string"
              ? JSON.parse(fullSettings.pageContent)
              : fullSettings.pageContent;
        } catch {
          currentParsed = {};
        }
      }

      const showcasePayload: ImageShowcaseContent = {
        badge: sectionForm.badge.trim(),
        title: sectionForm.title.trim(),
        subtitle: sectionForm.subtitle.trim(),
        enabled: sectionForm.enabled,
        items: items.map((it, idx) => ({
          ...it,
          order: idx + 1,
        })),
      };

      const updatedPageContent = {
        ...currentParsed,
        imageShowcase: showcasePayload,
      };

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pageContent: JSON.stringify(updatedPageContent),
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setStatusMessage({
          text: "Showcase configuration successfully saved to production!",
          type: "success",
        });
        setBaseline({
          sectionForm: { ...sectionForm },
          itemsJson: JSON.stringify(items),
        });
        if (resData.data) {
          setFullSettings(resData.data);
        }

        // Instant on-demand revalidation for home page & settings cache
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag: "settings", path: "/" }),
            credentials: "include",
          });
        } catch {
          // background revalidation attempt
        }
      } else {
        setStatusMessage({
          text: resData.error || "Failed to update showcase settings.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "Network error occurred while saving. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reorder helpers
  const moveItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // re-assign sequential order
    const reordered = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setItems(reordered);
  };

  // Toggle active status
  const toggleActive = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, active: !it.active } : it))
    );
  };

  // Delete item
  const handleDelete = (id: string, title?: string) => {
    if (confirm(`Are you sure you want to delete "${title || "this image"}" from the showcase?`)) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingItem(null);
    setModalForm({
      id: `showcase-${Date.now()}`,
      image: "",
      title: "",
      alt: "",
      category: "Commercial",
      order: items.length + 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (item: ImageShowcaseItem) => {
    setModalMode("edit");
    setEditingItem(item);
    setModalForm({ ...item });
    setIsModalOpen(true);
  };

  // Save from modal
  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.image || modalForm.image.trim().length === 0) {
      alert("Please upload or enter a valid image URL.");
      return;
    }

    if (modalMode === "add") {
      setItems((prev) => [
        ...prev,
        {
          ...modalForm,
          id: `showcase-${Date.now()}`,
          order: prev.length + 1,
        },
      ]);
    } else {
      setItems((prev) =>
        prev.map((it) => (it.id === modalForm.id ? { ...modalForm } : it))
      );
    }

    setIsModalOpen(false);
  };

  // Live preview content object
  const previewContent: ImageShowcaseContent = useMemo(() => {
    return {
      badge: sectionForm.badge,
      title: sectionForm.title,
      subtitle: sectionForm.subtitle,
      enabled: sectionForm.enabled,
      items: items,
    };
  }, [sectionForm, items]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-slate-200 shadow-sm rounded-none">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <span>Home Page</span>
            <span>/</span>
            <span className="text-construction-navy font-bold">Image Showcase</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-red-600" />
            Home Dual-Row Image Showcase
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage continuous infinite dual-row image marquee displayed on the homepage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Site
          </Link>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-construction-navy hover:bg-blue-900 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes {isDirty && <span className="w-2 h-2 rounded-full bg-amber-400" />}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage.text && (
        <div
          className={`p-4 border text-sm font-medium flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage({ text: "", type: "" })}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section Header Configuration Accordion */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setIsConfigExpanded(!isConfigExpanded)}
          className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <SettingsIcon className="w-4 h-4 text-slate-500" />
            <span>Section Headings & Display Controls</span>
            <span className="text-xs font-normal text-slate-400">
              (Optional badge, headline, and enabled switch)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2 py-0.5 font-bold ${
                sectionForm.enabled
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {sectionForm.enabled ? "Section Enabled" : "Section Disabled"}
            </span>
            {isConfigExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {isConfigExpanded && (
          <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Section Badge / Eyebrow
                </label>
                <input
                  type="text"
                  value={sectionForm.badge}
                  onChange={(e) =>
                    setSectionForm((prev) => ({ ...prev, badge: e.target.value }))
                  }
                  placeholder="e.g. OUR WORK IN FOCUS"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:border-construction-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Section Headline
                </label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) =>
                    setSectionForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Engineering & Architectural Footprint"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:border-construction-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Section Subtitle
              </label>
              <textarea
                rows={2}
                value={sectionForm.subtitle}
                onChange={(e) =>
                  setSectionForm((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="Brief supporting statement..."
                className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:border-construction-navy"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sectionForm.enabled}
                  onChange={(e) =>
                    setSectionForm((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-construction-navy"></div>
              </label>
              <span className="text-xs font-bold text-slate-700">
                Showcase Visibility: {sectionForm.enabled ? "Visible on Home Page" : "Hidden from Home Page"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Showcase Images Table */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-construction-navy" />
            <h2 className="text-base font-bold text-slate-900">
              Showcase Images ({items.length})
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 font-semibold">
              {items.filter((i) => i.active !== false).length} Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="text-xs px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              {showLivePreview ? "Hide Live Marquee Preview" : "Show Live Marquee Preview"}
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="text-xs px-3 py-1.5 bg-construction-navy text-white hover:bg-blue-900 font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Image
            </button>
          </div>
        </div>

        {/* Images List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-16 text-center">Order</th>
                <th className="py-3 px-3 w-28">Thumbnail</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-3 w-32">Category</th>
                <th className="py-3 px-3 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No images in showcase. Click &quot;Add Image&quot; to begin.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.active === false ? "opacity-60 bg-slate-50/40" : ""
                    }`}
                  >
                    {/* Order Controls */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveItem(index, "up")}
                          disabled={index === 0}
                          title="Move up"
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-slate-700 text-xs">{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => moveItem(index, "down")}
                          disabled={index === items.length - 1}
                          title="Move down"
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3 px-3 align-middle">
                      <div className="relative w-24 h-14 rounded border border-slate-200 bg-slate-900 overflow-hidden shadow-xs">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.alt || item.title || "Showcase thumbnail"}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                            No image
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Alt */}
                    <td className="py-3 px-4 align-middle">
                      <div className="font-bold text-slate-900 text-sm">{item.title || "(Untitled Image)"}</div>
                      <div className="text-slate-500 text-xs mt-0.5 truncate max-w-md">
                        Alt: {item.alt || "(No alt text specified)"}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono truncate max-w-md">
                        {item.image}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 align-middle">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded">
                        {item.category || "General"}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-3 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => toggleActive(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors ${
                          item.active !== false
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {item.active !== false ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-700" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-500" />
                            Hidden
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-construction-navy hover:bg-slate-100 transition-colors"
                          title="Edit image details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete image"
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
      </div>

      {/* Live Continuous Marquee Preview */}
      {showLivePreview && (
        <div className="bg-slate-900 border border-slate-800 shadow-md">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Marquee Interactive Preview (Desktop & Mobile Simulation)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Row 1: Right → Left | Row 2: Left → Right
            </span>
          </div>

          <div className="py-6">
            <HomeImageShowcase content={previewContent} />
          </div>
        </div>
      )}

      {/* Add / Edit Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                {modalMode === "add" ? "Add Showcase Image" : "Edit Showcase Image"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Image Upload or URL <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  value={modalForm.image}
                  onChange={(url) => setModalForm((prev) => ({ ...prev, image: url }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title / Caption
                </label>
                <input
                  type="text"
                  value={modalForm.title || ""}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Apex Commercial IT Complex"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:border-construction-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category Tag
                  </label>
                  <select
                    value={modalForm.category || "Commercial"}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:border-construction-navy bg-white"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Planning">Planning</option>
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={modalForm.order || 1}
                    onChange={(e) =>
                      setModalForm((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:border-construction-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Accessibility Alt Text
                </label>
                <input
                  type="text"
                  value={modalForm.alt || ""}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, alt: e.target.value }))}
                  placeholder="e.g. Commercial glass skyscraper built by HiPRO"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:border-construction-navy"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm.active}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, active: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-construction-navy"></div>
                </label>
                <span className="text-xs font-bold text-slate-700">
                  {modalForm.active ? "Active in Showcase" : "Disabled / Hidden"}
                </span>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-construction-navy hover:bg-blue-900 shadow-sm"
                >
                  {modalMode === "add" ? "Add to Showcase" : "Update Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
