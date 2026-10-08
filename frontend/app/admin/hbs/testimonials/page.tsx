"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Star,
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
  User,
  MapPin,
} from "lucide-react";
import type { HbsTestimonial } from "@/lib/types";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";

const EMPTY_TESTIMONIAL: Partial<HbsTestimonial> = {
  name: "",
  designation: "",
  content: "",
  rating: 5,
  image: "",
  serviceCategory: "Structure Repair",
  location: "Rajasthan",
  order: 1,
  featured: false,
  active: true,
};

export default function HbsAdminTestimonials() {
  const [testimonials, setTestimonials] = useState<HbsTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<Partial<HbsTestimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<HbsTestimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/testimonials?all=true", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTestimonials(json.data);
      } else {
        setMessage({ text: json.error || "Failed to load testimonials", type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to connect to backend API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTestimonials = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return testimonials;
    return testimonials.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.designation && t.designation.toLowerCase().includes(q)) ||
        (t.location && t.location.toLowerCase().includes(q)) ||
        t.content.toLowerCase().includes(q)
    );
  }, [testimonials, search]);

  const openAddModal = () => {
    setEditingItem({
      ...EMPTY_TESTIMONIAL,
      order: testimonials.length + 1,
    });
  };

  const openEditModal = (item: HbsTestimonial) => {
    setEditingItem({ ...item });
  };

  const closeModal = () => {
    setEditingItem(null);
  };

  const handleToggleActive = async (item: HbsTestimonial) => {
    const nextActive = !item.active;
    setTestimonials((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, active: nextActive } : t))
    );
    try {
      const res = await fetch(`/api/hbs/testimonials/${item.id}`, {
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
        body: JSON.stringify({ paths: ["/hbs"] }),
      }).catch(() => {});
    } catch {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, active: item.active } : t))
      );
      setMessage({ text: `Could not update visibility for "${item.name}".`, type: "error" });
    }
  };

  const handleToggleFeatured = async (item: HbsTestimonial) => {
    const nextFeatured = !item.featured;
    setTestimonials((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, featured: nextFeatured } : t))
    );
    try {
      const res = await fetch(`/api/hbs/testimonials/${item.id}`, {
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
        body: JSON.stringify({ paths: ["/hbs"] }),
      }).catch(() => {});
    } catch {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, featured: item.featured } : t))
      );
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeletingId(itemToDelete.id);
    try {
      const res = await fetch(`/api/hbs/testimonials/${itemToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== itemToDelete.id));
        setMessage({ text: `Testimonial by "${itemToDelete.name}" deleted.`, type: "success" });
        fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: ["/hbs"] }),
        }).catch(() => {});
        setItemToDelete(null);
      } else {
        setMessage({ text: json.error || "Failed to delete testimonial", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setMessage({ text: "", type: "" });

    const payload = {
      ...editingItem,
      rating: Number(editingItem.rating) || 5,
      order: Number(editingItem.order) || 0,
    };

    const isEdit = Boolean(editingItem.id);
    const url = isEdit ? `/api/hbs/testimonials/${editingItem.id}` : "/api/hbs/testimonials";
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
          text: `Testimonial by "${payload.name}" ${isEdit ? "updated" : "published"} successfully!`,
          type: "success",
        });
        closeModal();
        loadData();

        fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: ["/hbs"] }),
        }).catch(() => {});
      } else {
        setMessage({ text: json.error || "Failed to save testimonial.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Testimonials" }]}
        title="Client Reviews & Trust"
        description="Customer reviews, society feedback, and verified rehabilitation ratings displayed across Hind Build."
      >
        <button
          type="button"
          onClick={loadData}
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
          <span>Add Testimonial</span>
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

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by client name, society, location, review..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-red-500 transition-colors"
          />
        </div>
        <div className="text-xs font-mono text-slate-500">
          Showing: <strong className="text-slate-900">{filteredTestimonials.length}</strong> Reviews
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading reviews...
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No testimonials found. Click &ldquo;Add Testimonial&rdquo; to publish your first client review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3 pl-4">Client</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Review Content</th>
                  <th className="p-3 text-center">Featured</th>
                  <th className="p-3 text-center">Visibility</th>
                  <th className="p-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTestimonials.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Client & Avatar */}
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          {item.image || item.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image || item.avatar || ""}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-semibold text-slate-900 truncate max-w-[200px]">
                            {item.name}
                          </span>
                          {item.designation && (
                            <span className="block text-[11px] text-slate-500 truncate max-w-[200px]">
                              {item.designation}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="p-3">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      {item.location && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      )}
                    </td>

                    {/* Content */}
                    <td className="p-3 max-w-sm truncate">
                      <span className="italic text-slate-700">&ldquo;{item.content}&rdquo;</span>
                    </td>

                    {/* Featured star toggle */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item)}
                        title={item.featured ? "Remove from Featured" : "Mark as Featured"}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.featured
                            ? "bg-amber-50 border-amber-300 text-amber-500"
                            : "bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-500"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.featured ? "fill-amber-400" : ""}`} />
                      </button>
                    </td>

                    {/* Active toggle */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                          item.active
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.active ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {item.active ? "Live" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right pr-4">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Delete Review?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the testimonial by{" "}
              <strong className="text-slate-900">&ldquo;{itemToDelete.name}&rdquo;</strong>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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

      {/* Edit / Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 w-full max-w-xl max-h-[90vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white/70 backdrop-blur-md shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingItem.id ? `Edit Review: ${editingItem.name}` : "Add Client Testimonial"}
                </h2>
                <p className="text-xs text-slate-500">
                  Verified customer satisfaction and project feedback
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

            <form onSubmit={handleSaveSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client / Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Rameshwar Sharma"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Society Name
                  </label>
                  <input
                    type="text"
                    value={editingItem.designation || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, designation: e.target.value }))
                    }
                    placeholder="e.g. Secretary, Silver Oak Apartments"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={editingItem.location || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="e.g. Jaipur / Bhilwara"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Executed
                  </label>
                  <input
                    type="text"
                    value={editingItem.serviceCategory || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, serviceCategory: e.target.value }))
                    }
                    placeholder="e.g. Structure Repair, Waterproofing"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Avatar / Society Photo (optional)
                </label>
                <HbsImageUploader
                  value={editingItem.image || editingItem.avatar}
                  onChange={(url) => setEditingItem((prev) => ({ ...prev, image: url, avatar: url }))}
                  folder="hbs/media"
                  recommendedSize="400×400px"
                  previewHeight="h-28"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Review Text *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.content || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="The client's authentic review and remarks on Hind Build engineering..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={editingItem.rating || 5}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, rating: Number(e.target.value) }))
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-red-500"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Good)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={editingItem.order ?? 0}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, order: Number(e.target.value) }))
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 font-mono focus:outline-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.featured)}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Featured Review
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.active !== false}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, active: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Live & Publicly Visible
                  </span>
                </label>
              </div>

              </div>

              {/* Modal Sticky Footer */}
              <div className="px-6 py-3.5 bg-slate-50/90 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between shrink-0">
                <div className="text-[11px] text-slate-500">
                  {editingItem.name ? `Editing: ${editingItem.name}` : "New Review"}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300/80 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
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
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Review</span>
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
