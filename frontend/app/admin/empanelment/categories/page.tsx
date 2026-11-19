"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  X,
  HardHat,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Truck,
  RefreshCw,
} from "lucide-react";
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";

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
      let res = await fetch("/api/empanelment/admin/categories", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        res = await fetch("/api/empanelment/categories", { cache: "no-store" });
      }
      if (res.ok) {
        const json = await res.json();
        const list = json.categories || json.data || [];
        if (json.success && Array.isArray(list)) {
          setCategories(list);
          if (list.length > 0 && !expandedCategoryId) {
            setExpandedCategoryId(list[0].id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCategory || !subName.trim()) return;

    setSubmittingSub(true);
    setSubModalError("");

    try {
      const res = await fetch(
        `/api/empanelment/admin/categories/${targetCategory.id}/subcategories`,
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
    <div className="space-y-5">
      {/* Apple-Style Page Header */}
      <EmpanelmentAdminPageHeader
        breadcrumbs={[{ label: "Category Studio" }]}
        title="Trade & Category Studio"
        description="Manage canonical contractor classifications, specialized subcategories, Hindi terms, and procurement scopes."
        badge={`${categories.length} Master Trades`}
      >
        <button
          onClick={fetchCategories}
          disabled={loading}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 transition-all shadow-xs disabled:opacity-50"
          title="Refresh Categories"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </EmpanelmentAdminPageHeader>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Grid / List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-14 text-center text-xs text-slate-400 bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/60">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-600 mb-2" />
            Loading categories and subcategories...
          </div>
        ) : (
          categories.map((cat) => {
            const isExpanded = expandedCategoryId === cat.id;
            const subcategories = cat.subcategories || [];

            return (
              <div
                key={cat.id}
                className="bg-white/85 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_2px_12px_rgba(15,23,42,0.02)] overflow-hidden transition-all duration-200"
              >
                {/* Category Header Bar */}
                <div
                  onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                      {getCategoryIcon(cat.slug)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-sm sm:text-base text-slate-900">
                          {cat.name}
                        </h2>
                        {cat.nameHindi && (
                          <span className="text-xs text-slate-400 font-medium">
                            ({cat.nameHindi})
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {cat.slug}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {cat.description || "Canonical trade category"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
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
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add Sub</span>
                    </button>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Subcategories Expanded Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Subcategories under {cat.name}</span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        Order: {cat.sortOrder ?? 0}
                      </span>
                    </div>

                    {subcategories.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        No subcategories registered yet. Click &quot;Add Sub&quot; to define specific scopes.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subcategories.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <h3 className="font-bold text-xs text-slate-900">{sub.name}</h3>
                                {sub.nameHindi && (
                                  <p className="text-[11px] text-slate-400 font-medium">
                                    {sub.nameHindi}
                                  </p>
                                )}
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-500 border border-slate-200">
                                {sub.slug}
                              </span>
                            </div>
                            {sub.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
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
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setTargetCategory(null)} />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {targetCategory.name}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">Add Specialized Subcategory</h3>
              </div>
              <button
                onClick={() => setTargetCategory(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {subModalError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>{subModalError}</div>
              </div>
            )}

            <form onSubmit={handleAddSubcategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subcategory Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Earthwork & Excavation"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hindi Translation (वैकल्पिक)
                </label>
                <input
                  type="text"
                  value={subHindi}
                  onChange={(e) => setSubHindi(e.target.value)}
                  placeholder="e.g. मिट्टी खुदाई एवं भराव"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trade Scope / Description
                </label>
                <textarea
                  rows={2}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  placeholder="Details of works covered under this subcategory..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTargetCategory(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSub}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
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
