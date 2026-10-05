"use client";

import { useEffect, useState, useMemo } from "react";
import {
  HardHat,
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
  Check
} from "lucide-react";
import type { HbsService } from "@/lib/types";

const EMPTY_SERVICE: Partial<HbsService> = {
  serviceNumber: "",
  title: "",
  hindiTitle: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  icon: "Wrench",
  image: "",
  order: 1,
  active: true,
  metaTitle: "",
  metaDescription: "",
};

export default function HbsAdminServices() {
  const [services, setServices] = useState<HbsService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState<Partial<HbsService> | null>(null);
  const [featuresText, setFeaturesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  const loadServices = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/services?all=true", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setServices(json.data);
      } else {
        setMessage({ text: json.error || "Failed to load services", type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to connect to backend API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.hindiTitle && s.hindiTitle.toLowerCase().includes(q)) ||
        (s.serviceNumber && s.serviceNumber.includes(q)) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [services, search]);

  const openEditModal = (service: Partial<HbsService>) => {
    setEditingService(service);
    let featLines = "";
    if (service.features) {
      try {
        const parsed = typeof service.features === "string" ? JSON.parse(service.features) : service.features;
        if (Array.isArray(parsed)) featLines = parsed.join("\n");
      } catch {
        featLines = String(service.features);
      }
    }
    setFeaturesText(featLines);
  };

  const closeModal = () => {
    setEditingService(null);
    setFeaturesText("");
  };

  const handleToggleActive = async (service: HbsService) => {
    try {
      const res = await fetch(`/api/hbs/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active: !service.active }),
      });
      const json = await res.json();
      if (json.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, active: !service.active } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/hbs/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        setMessage({ text: `Service "${title}" deleted.`, type: "success" });
      } else {
        setMessage({ text: json.error || "Failed to delete service", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setSaving(true);
    setMessage({ text: "", type: "" });

    const feats = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      ...editingService,
      features: feats,
      order: Number(editingService.order) || 0,
    };

    const isEdit = Boolean(editingService.id);
    const url = isEdit ? `/api/hbs/services/${editingService.id}` : "/api/hbs/services";
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
          text: `Service ${isEdit ? "updated" : "created"} successfully!`,
          type: "success",
        });
        closeModal();
        loadServices();

        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/hbs", "/hbs/services"] }),
          });
        } catch {}
      } else {
        setMessage({ text: json.error || "Failed to save service.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            Service Catalog CMS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
            HBS Services (19 Modules)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage titles, Hindi script descriptions, order index, features checklist, and activation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadServices}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>

          <button
            onClick={() => openEditModal(EMPTY_SERVICE)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

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
            placeholder="Search by title, Hindi, or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 focus:bg-white focus:outline-amber-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-500">
          Total: <strong className="text-slate-900">{filteredServices.length}</strong> / 19
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3 w-16">#</th>
              <th className="p-3">Service Name & Hindi</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Order</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredServices.map((service) => (
              <tr key={service.id} className="hover:bg-slate-50/50">
                <td className="p-3 font-mono font-bold text-amber-700">
                  {service.serviceNumber || "—"}
                </td>
                <td className="p-3">
                  <div className="font-bold text-slate-900 text-sm">
                    {service.title}
                  </div>
                  {service.hindiTitle && (
                    <div className="text-slate-500 text-xs font-medium">
                      {service.hindiTitle}
                    </div>
                  )}
                </td>
                <td className="p-3 font-mono text-[11px] text-slate-500">
                  {service.slug}
                </td>
                <td className="p-3 font-mono">
                  {service.order}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(service)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase transition-colors ${
                      service.active
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {service.active ? (
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
                      onClick={() => openEditModal(service)}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service.id || "", service.title)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
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

      {/* Edit / Add Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-2xl my-8 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase text-slate-900 font-display">
                  {editingService.id ? "Edit Service" : "Add New HBS Service"}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingService.id ? `Editing: ${editingService.title}` : "Fill service details"}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Number (e.g. 01)
                  </label>
                  <input
                    type="text"
                    value={editingService.serviceNumber || ""}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, serviceNumber: e.target.value }))
                    }
                    className="w-full text-xs border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    English Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.title || ""}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingService((prev) => ({
                        ...prev,
                        title,
                        slug: prev?.id ? prev.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                      }));
                    }}
                    className="w-full text-xs border border-slate-300 p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Hindi Title
                  </label>
                  <input
                    type="text"
                    value={editingService.hindiTitle || ""}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, hindiTitle: e.target.value }))
                    }
                    className="w-full text-xs border border-slate-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.slug || ""}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="w-full text-xs border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={editingService.shortDescription || ""}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...prev, shortDescription: e.target.value }))
                  }
                  className="w-full text-xs border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Engineering Description
                </label>
                <textarea
                  rows={4}
                  value={editingService.fullDescription || ""}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...prev, fullDescription: e.target.value }))
                  }
                  className="w-full text-xs border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Key Scope Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Structural crack injection&#10;RCC column carbon wrapping&#10;Core test verification"
                  className="w-full text-xs border border-slate-300 p-2 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={editingService.order ?? 0}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, order: Number(e.target.value) }))
                    }
                    className="w-full text-xs border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="serviceActive"
                    checked={editingService.active !== false}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, active: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="serviceActive" className="text-xs font-bold text-slate-700 uppercase">
                    Active & Visible on Public Site
                  </label>
                </div>
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
                      <span>Save Service</span>
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
