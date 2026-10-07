"use client";

import { useEffect, useState } from "react";
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
  Save
} from "lucide-react";
import type { HbsTestimonial } from "@/lib/types";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";

const EMPTY_TESTIMONIAL: Partial<HbsTestimonial> = {
  name: "",
  designation: "",
  content: "",
  rating: 5,
  order: 1,
  active: true,
};

export default function HbsAdminTestimonials() {
  const [testimonials, setTestimonials] = useState<HbsTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<Partial<HbsTestimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/testimonials?all=true", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
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

  const filteredTestimonials = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.designation && t.designation.toLowerCase().includes(search.toLowerCase())) ||
      t.content.toLowerCase().includes(search.toLowerCase())
  );

  const openEditModal = (item: Partial<HbsTestimonial>) => {
    setEditingItem(item);
  };

  const closeModal = () => {
    setEditingItem(null);
  };

  const handleToggleActive = async (item: HbsTestimonial) => {
    try {
      const res = await fetch(`/api/hbs/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active: !item.active }),
      });
      const json = await res.json();
      if (json.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, active: !item.active } : t))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete testimonial by "${name}"?`)) return;
    try {
      const res = await fetch(`/api/hbs/testimonials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        setMessage({ text: `Testimonial by "${name}" deleted.`, type: "success" });
      } else {
        setMessage({ text: json.error || "Failed to delete testimonial", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
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
          text: `Testimonial ${isEdit ? "updated" : "created"} successfully!`,
          type: "success",
        });
        closeModal();
        loadData();

        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/hbs"] }),
          });
        } catch {}
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
    <div className="space-y-6">
      {/* Apple-minimal Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Testimonials" }]}
        title="Testimonials & Reviews"
        description="Manage endorsements from apartment society presidents, facility managers, and verified clients."
      >
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reload</span>
        </button>

        <button
          onClick={() => openEditModal(EMPTY_TESTIMONIAL)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Testimonial</span>
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
            placeholder="Search by client name, society, review..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 focus:bg-white focus:outline-amber-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-500">
          Showing: <strong className="text-slate-900">{filteredTestimonials.length}</strong> Testimonials
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="bg-white border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">Client & Role</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Review Excerpt</th>
              <th className="p-3">Order</th>
              <th className="p-3">Visibility</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTestimonials.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No testimonials added yet. Click &quot;Add Testimonial&quot; to publish your first client review.
                </td>
              </tr>
            ) : (
              filteredTestimonials.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    {item.designation && (
                      <div className="text-slate-500 text-xs font-medium">{item.designation}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="p-3 max-w-md truncate">
                    <span className="italic text-slate-600">&quot;{item.content}&quot;</span>
                  </td>
                  <td className="p-3 font-mono">{item.order}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase transition-colors ${
                        item.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      {item.active ? (
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
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id || "", item.name)}
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
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-xl my-8 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase text-slate-900 font-display">
                  {editingItem.id ? "Edit Testimonial" : "Add Client Testimonial"}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingItem.id ? `Review by: ${editingItem.name}` : "Client review details"}
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

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full text-xs border border-slate-300 p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Designation / Society / Location
                  </label>
                  <input
                    type="text"
                    value={editingItem.designation || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, designation: e.target.value }))
                    }
                    placeholder="e.g. Secretary, Silver Oak Apartments"
                    className="w-full text-xs border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Review / Testimonial Text *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.content || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, content: e.target.value }))
                  }
                  className="w-full text-xs border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Rating (Stars 1-5)
                  </label>
                  <select
                    value={editingItem.rating || 5}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, rating: Number(e.target.value) }))
                    }
                    className="w-full text-xs border border-slate-300 p-2 bg-white"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Good)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={editingItem.order ?? 0}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, order: Number(e.target.value) }))
                    }
                    className="w-full text-xs border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="testActive"
                  checked={editingItem.active !== false}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, active: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="testActive" className="text-xs font-bold text-slate-700 uppercase">
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
                      <span>Save Testimonial</span>
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
