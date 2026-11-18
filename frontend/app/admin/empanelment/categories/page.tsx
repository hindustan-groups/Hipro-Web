"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  Layers,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  X,
  Search,
  ArrowLeft,
  Building2,
  HardHat,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Truck,
  Sparkles,
} from "lucide-react";

export default function CategoryStudioPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // New Subcategory Modal
  const [targetCategory, setTargetCategory] = useState<any | null>(null);
  const [subName, setSubName] = useState("");
  const [subHindi, setSubHindi] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [submittingSub, setSubmittingSub] = useState(false);
  const [subModalError, setSubModalError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/empanelment/categories", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
          if (json.data.length > 0 && !expandedCategoryId) {
            setExpandedCategoryId(json.data[0].id);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCategory || !subName.trim()) return;

    setSubmittingSub(true);
    setSubModalError("");

    try {
      const res = await fetch(
        `/api/empanelment/categories/${targetCategory.id}/subcategories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: subName.trim(),
            nameHindi: subHindi.trim() || undefined,
            description: subDesc.trim() || undefined,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create subcategory");
      }

      setActionSuccess(`Subcategory "${subName}" created under ${targetCategory.name}!`);
      setTargetCategory(null);
      setSubName("");
      setSubHindi("");
      setSubDesc("");
      fetchCategories();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      setSubModalError(err.message || "Failed to add subcategory");
    } finally {
      setSubmittingSub(false);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "civil-construction":
        return <HardHat className="w-5 h-5 text-amber-600" />;
      case "electrical-mep":
        return <Zap className="w-5 h-5 text-blue-600" />;
      case "plumbing-sanitation":
        return <Droplets className="w-5 h-5 text-cyan-600" />;
      case "fabrication-peb":
        return <Hammer className="w-5 h-5 text-orange-600" />;
      case "flooring-finishing":
        return <Paintbrush className="w-5 h-5 text-purple-600" />;
      case "material-supply":
        return <Truck className="w-5 h-5 text-emerald-600" />;
      default:
        return <Boxes className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/empanelment"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Empanelment Admin</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono font-bold text-[#dc2626]">CATEGORY STUDIO</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Vendor Trade & Subcategory Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage canonical trade categories, subcategories, Hindi translations, and procurement classification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            6 Canonical Categories Active
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Grid / List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            Loading categories and subcategories...
          </div>
        ) : (
          categories.map((cat) => {
            const isExpanded = expandedCategoryId === cat.id;
            const subcategories = cat.subcategories || [];

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                {/* Category Header Bar */}
                <div
                  onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getCategoryIcon(cat.slug)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-sm sm:text-base text-slate-950">
                          {cat.name}
                        </h2>
                        {cat.nameHindi && (
                          <span className="text-xs text-slate-500 font-medium">
                            ({cat.nameHindi})
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-600">
                          {cat.slug}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {cat.description || "Canonical trade category"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-[#dc2626] border border-red-200">
                      {subcategories.length} Subcategories
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetCategory(cat);
                        setSubName("");
                        setSubHindi("");
                        setSubDesc("");
                        setSubModalError("");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Subcategory</span>
                    </button>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Subcategories Expanded Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Subcategories under {cat.name}</span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        Order: {cat.sortOrder}
                      </span>
                    </div>

                    {subcategories.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        No subcategories registered yet. Click &quot;Add Subcategory&quot; to add one.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subcategories.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <h3 className="font-bold text-xs text-slate-900">{sub.name}</h3>
                                {sub.nameHindi && (
                                  <p className="text-[11px] text-slate-500 font-medium">
                                    {sub.nameHindi}
                                  </p>
                                )}
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600">
                                {sub.slug}
                              </span>
                            </div>
                            {sub.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {sub.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Subcategory Modal */}
      {targetCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setTargetCategory(null)} />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#dc2626]">
                  {targetCategory.name}
                </span>
                <h3 className="font-black text-slate-950 text-base">Add Subcategory</h3>
              </div>
              <button
                onClick={() => setTargetCategory(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {subModalError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>{subModalError}</div>
              </div>
            )}

            <form onSubmit={handleAddSubcategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subcategory Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Earthwork & Excavation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hindi Translation (वैकल्पिक)
                </label>
                <input
                  type="text"
                  value={subHindi}
                  onChange={(e) => setSubHindi(e.target.value)}
                  placeholder="e.g. मिट्टी खुदाई एवं भराव"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Trade Scope
                </label>
                <textarea
                  rows={2}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  placeholder="Details of works covered under this subcategory..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTargetCategory(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSub}
                  className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {submittingSub ? "Saving..." : "Add Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

