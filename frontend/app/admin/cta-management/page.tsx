"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Save, RefreshCw, ToggleLeft, ToggleRight, Search,
  ExternalLink, Phone, MessageSquare, Mail, Link2,
  ArrowRight, ChevronDown, ChevronUp, CheckCircle2,
  XCircle, AlertCircle, Filter, Edit3, RotateCcw
} from "lucide-react";
import type { CTAConfig } from "@/lib/cta";
import { DEFAULT_CTAS, mergeCTAsWithDefaults, resolveCTAHref } from "@/lib/cta";

const ACTION_TYPE_ICONS: Record<string, any> = {
  internal: Link2,
  external: ExternalLink,
  phone: Phone,
  whatsapp: MessageSquare,
  email: Mail,
  anchor: ArrowRight,
  modal: ArrowRight,
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  internal: "Internal Link",
  external: "External Link",
  phone: "Phone Call",
  whatsapp: "WhatsApp",
  email: "Email",
  anchor: "Anchor / Scroll",
  modal: "Modal Trigger",
};

const STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: "primary", label: "Primary (Navy)" },
  { value: "danger", label: "Danger (Red)" },
  { value: "secondary", label: "Secondary (Outline)" },
  { value: "ghost", label: "Ghost (Glass)" },
  { value: "whatsapp", label: "WhatsApp (Green)" },
  { value: "text", label: "Text Link" },
];

const UNIQUE_LOCATIONS: string[] = Array.from(
  new Set(DEFAULT_CTAS.map((c) => c.location ?? "Other").filter(Boolean))
);

export default function AdminCTAManagement() {
  const [ctas, setCtas] = useState<CTAConfig[]>([...DEFAULT_CTAS]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<CTAConfig>>({});
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [rawPageContent, setRawPageContent] = useState<any>({});

  // ── Load settings on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          let pc: any = {};
          try {
            pc = data.data.pageContent ? JSON.parse(data.data.pageContent) : {};
          } catch { pc = {}; }
          setRawPageContent(pc);
          if (Array.isArray(pc?.ctas) && pc.ctas.length > 0) {
            setCtas(mergeCTAsWithDefaults(pc.ctas));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Filtered view ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = ctas;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.key.toLowerCase().includes(q) ||
          (c.location || "").toLowerCase().includes(q) ||
          c.destination.toLowerCase().includes(q)
      );
    }
    if (locationFilter !== "all") {
      list = list.filter((c) => c.location === locationFilter);
    }
    return list;
  }, [ctas, search, locationFilter]);

  // ── Edit helpers ────────────────────────────────────────────────────────
  const startEdit = (cta: CTAConfig) => {
    setEditingKey(cta.key);
    setEditDraft({ ...cta });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditDraft({});
  };

  const saveDraft = () => {
    if (!editingKey || !editDraft) return;
    setCtas((prev) =>
      prev.map((c) => (c.key === editingKey ? { ...c, ...editDraft } : c))
    );
    setEditingKey(null);
    setEditDraft({});
    setMessage({ type: "info", text: "Change staged — click Save All to persist." });
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleEnabled = (key: string) => {
    setCtas((prev) =>
      prev.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c))
    );
    setMessage({ type: "info", text: "Toggle staged — click Save All to persist." });
    setTimeout(() => setMessage(null), 2500);
  };

  const resetToDefault = (key: string) => {
    const def = DEFAULT_CTAS.find((d) => d.key === key);
    if (!def) return;
    setCtas((prev) => prev.map((c) => (c.key === key ? { ...def } : c)));
    setMessage({ type: "info", text: `"${def.label}" reset to default — click Save All to persist.` });
    setTimeout(() => setMessage(null), 3000);
  };

  // ── Persist to DB ───────────────────────────────────────────────────────
  const saveAll = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Build updated pageContent — preserve ALL other keys
      const updatedPageContent = { ...rawPageContent, ctas };

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageContent: JSON.stringify(updatedPageContent) }),
      });
      const data = await res.json();

      if (data.success) {
        setRawPageContent(updatedPageContent);
        // Revalidate relevant pages
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tags: ["settings"],
            paths: ["/", "/about", "/services", "/projects", "/contact", "/blogs"],
          }),
        }).catch(() => {});
        setMessage({ type: "success", text: "All CTAs saved and site cache revalidated successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save CTAs." });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Network error while saving." });
    }
    setSaving(false);
  };

  // ── Grouped by location for display ────────────────────────────────────
  const locationOrder = Array.from(new Set(DEFAULT_CTAS.map((c) => c.location ?? "Other")));
  const grouped: Record<string, CTAConfig[]> = {};
  for (const cta of filtered) {
    const loc = cta.location ?? "Other";
    if (!grouped[loc]) grouped[loc] = [];
    grouped[loc].push(cta);
  }

  const changedCount = ctas.filter((c) => {
    const def = DEFAULT_CTAS.find((d) => d.key === c.key);
    if (!def) return true;
    return (
      c.label !== def.label ||
      c.destination !== def.destination ||
      c.actionType !== def.actionType ||
      c.style !== def.style ||
      c.enabled !== def.enabled ||
      c.openNewTab !== def.openNewTab
    );
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-construction-navy mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading CTA configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-5 h-5 text-construction-red" />
            <h1 className="text-2xl font-bold text-slate-900 font-display uppercase tracking-tight">
              CTA Management
            </h1>
            {changedCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded border border-amber-200">
                {changedCount} unsaved
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">
            {ctas.length} CTAs across {locationOrder.length} page locations
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-construction-navy hover:bg-construction-navy/90 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 shadow-sm disabled:opacity-50 transition-all"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save All CTAs"}
        </button>
      </div>

      {/* ── Status message ── */}
      {message && (
        <div
          className={`flex items-center gap-3 px-4 py-3 border text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : message.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : message.type === "error" ? (
            <XCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by label, key, or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 focus:border-construction-navy"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-9 pr-8 py-2 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 bg-white appearance-none min-w-[200px]"
          >
            <option value="all">All Locations ({ctas.length})</option>
            {locationOrder.map((loc) => (
              <option key={loc} value={loc}>
                {loc} ({ctas.filter((c) => c.location === loc).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── CTA Groups ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No CTAs match your search.
        </div>
      ) : (
        locationOrder
          .filter((loc) => grouped[loc]?.length > 0)
          .map((loc) => (
            <div key={loc} className="bg-white border border-slate-200 overflow-hidden">
              {/* Section header */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">
                    {loc}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {grouped[loc].length} CTA{grouped[loc].length !== 1 ? "s" : ""}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    grouped[loc].every((c) => c.enabled !== false)
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : grouped[loc].some((c) => c.enabled !== false)
                      ? "text-amber-700 bg-amber-50 border-amber-200"
                      : "text-slate-500 bg-slate-100 border-slate-200"
                  }`}
                >
                  {grouped[loc].every((c) => c.enabled !== false)
                    ? "All Enabled"
                    : grouped[loc].some((c) => c.enabled !== false)
                    ? "Partial"
                    : "All Disabled"}
                </span>
              </div>

              {/* CTA rows */}
              <div className="divide-y divide-slate-100">
                {grouped[loc].map((cta) => {
                  const isEditing = editingKey === cta.key;
                  const def = DEFAULT_CTAS.find((d) => d.key === cta.key);
                  const isModified =
                    def &&
                    (cta.label !== def.label ||
                      cta.destination !== def.destination ||
                      cta.actionType !== def.actionType ||
                      cta.style !== def.style ||
                      cta.enabled !== def.enabled);
                  const ActionIcon = ACTION_TYPE_ICONS[cta.actionType] || Link2;

                  return (
                    <div key={cta.key} className={`${cta.enabled === false ? "opacity-60" : ""}`}>
                      {/* Row header */}
                      <div className="px-5 py-4 flex flex-wrap items-center gap-3">
                        {/* Enable toggle */}
                        <button
                          onClick={() => toggleEnabled(cta.key)}
                          title={cta.enabled !== false ? "Disable this CTA" : "Enable this CTA"}
                          className="shrink-0"
                        >
                          {cta.enabled !== false ? (
                            <ToggleRight className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-300" />
                          )}
                        </button>

                        {/* Label + key */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{cta.label}</span>
                            {isModified && (
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                                Modified
                              </span>
                            )}
                            {cta.enabled === false && (
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                            <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {cta.key}
                            </code>
                            <span className="flex items-center gap-1">
                              <ActionIcon className="w-3 h-3" />
                              {ACTION_TYPE_LABELS[cta.actionType]}
                            </span>
                            <span className="font-mono truncate max-w-[200px]" title={cta.destination}>
                              {cta.destination}
                            </span>
                          </div>
                        </div>

                        {/* Style badge */}
                        <span
                          className={`hidden sm:inline-flex text-[10px] font-bold uppercase px-2 py-0.5 border rounded shrink-0 ${
                            cta.style === "danger"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : cta.style === "primary"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : cta.style === "whatsapp"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {cta.style}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isModified && (
                            <button
                              onClick={() => resetToDefault(cta.key)}
                              title="Reset to default"
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors rounded"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => (isEditing ? cancelEdit() : startEdit(cta))}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                              isEditing
                                ? "bg-slate-100 border-slate-200 text-slate-700"
                                : "bg-construction-navy text-white border-transparent hover:bg-construction-navy/90"
                            }`}
                          >
                            <Edit3 className="w-3 h-3" />
                            {isEditing ? "Cancel" : "Edit"}
                          </button>
                        </div>
                      </div>

                      {/* Inline edit form */}
                      {isEditing && (
                        <div className="px-5 pb-5 bg-slate-50 border-t border-slate-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                            {/* Label */}
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Button Label *
                              </label>
                              <input
                                type="text"
                                value={editDraft.label ?? ""}
                                onChange={(e) => setEditDraft((d) => ({ ...d, label: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 focus:border-construction-navy bg-white"
                                placeholder="e.g. Get a Free Quote"
                              />
                            </div>

                            {/* Action Type */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Action Type *
                              </label>
                              <select
                                value={editDraft.actionType ?? "internal"}
                                onChange={(e) =>
                                  setEditDraft((d) => ({ ...d, actionType: e.target.value as any }))
                                }
                                className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 bg-white"
                              >
                                {Object.entries(ACTION_TYPE_LABELS).map(([v, l]) => (
                                  <option key={v} value={v}>{l}</option>
                                ))}
                              </select>
                            </div>

                            {/* Style */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Style
                              </label>
                              <select
                                value={editDraft.style ?? "primary"}
                                onChange={(e) =>
                                  setEditDraft((d) => ({ ...d, style: e.target.value as any }))
                                }
                                className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 bg-white"
                              >
                                {STYLE_OPTIONS.map(({ value, label }) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>

                            {/* Destination */}
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Destination *
                                {editDraft.actionType === "phone" && (
                                  <span className="ml-1 font-normal normal-case text-slate-400">
                                    — raw number e.g. +917597000601
                                  </span>
                                )}
                                {editDraft.actionType === "whatsapp" && (
                                  <span className="ml-1 font-normal normal-case text-slate-400">
                                    — country-code number only e.g. 917597000601
                                  </span>
                                )}
                              </label>
                              <input
                                type="text"
                                value={editDraft.destination ?? ""}
                                onChange={(e) =>
                                  setEditDraft((d) => ({ ...d, destination: e.target.value }))
                                }
                                className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 bg-white font-mono"
                                placeholder="/contact or tel:... or https://..."
                              />
                              {editDraft.actionType && editDraft.destination && (
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Preview href:{" "}
                                  <code className="bg-slate-100 px-1 rounded">
                                    {resolveCTAHref(editDraft as CTAConfig)}
                                  </code>
                                </p>
                              )}
                            </div>

                            {/* Open new tab */}
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={editDraft.openNewTab ?? false}
                                  onChange={(e) =>
                                    setEditDraft((d) => ({ ...d, openNewTab: e.target.checked }))
                                  }
                                  className="w-4 h-4 accent-construction-navy"
                                />
                                <span className="text-xs font-semibold text-slate-700">Open in new tab</span>
                              </label>
                            </div>
                          </div>

                          {/* Description (readonly reference) */}
                          {cta.description && (
                            <p className="mt-3 text-[11px] text-slate-400 bg-white border border-slate-100 px-3 py-2 rounded">
                              <span className="font-semibold text-slate-600">Note: </span>
                              {cta.description}
                            </p>
                          )}

                          <div className="mt-4 flex items-center gap-3">
                            <button
                              onClick={saveDraft}
                              className="inline-flex items-center gap-2 bg-construction-navy text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-construction-navy/90 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Apply Changes
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <p className="text-[11px] text-slate-400 ml-auto">
                              ↑ Applied locally — click <strong>Save All CTAs</strong> above to persist to DB.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
      )}

      {/* ── Bottom save bar ── */}
      {changedCount > 0 && (
        <div className="sticky bottom-6 flex justify-center">
          <div className="bg-white border border-slate-200 shadow-xl px-6 py-4 flex items-center gap-4">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-slate-700">
              <strong>{changedCount}</strong> unsaved change{changedCount !== 1 ? "s" : ""}
            </p>
            <button
              onClick={saveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-construction-navy text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-construction-navy/90 disabled:opacity-50 transition-all"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
