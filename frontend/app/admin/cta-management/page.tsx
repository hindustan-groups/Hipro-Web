"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Save, RefreshCw, ToggleLeft, ToggleRight, Search,
  ExternalLink, Phone, MessageSquare, Mail, Link2,
  ArrowRight, CheckCircle2, XCircle, AlertCircle,
  Filter, Edit3, RotateCcw, Copy, Check, Eye,
  Sparkles, Layers, MapPin, Undo2
} from "lucide-react";
import type { CTAConfig, CTAStyle, CTAActionType } from "@/lib/cta";
import {
  DEFAULT_CTAS,
  mergeCTAsWithDefaults,
  resolveCTAHref,
  getCTAStyleClasses,
} from "@/lib/cta";

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
  internal: "Internal Page",
  external: "External Link",
  phone: "Phone Call",
  whatsapp: "WhatsApp Chat",
  email: "Email Link",
  anchor: "Anchor / Scroll",
  modal: "Modal Trigger",
};

const STYLE_OPTIONS: { value: CTAStyle; label: string; desc: string }[] = [
  { value: "primary", label: "Primary (Navy)", desc: "Brand deep navy #0F2C59 with subtle shadow" },
  { value: "danger", label: "Danger / Brand Red", desc: "HiPRO red #C41E3A high-conversion button" },
  { value: "secondary", label: "Secondary (Outline / Light)", desc: "White background with slate border" },
  { value: "ghost", label: "Ghost (Glass on Dark)", desc: "Translucent glass effect for dark hero banners" },
  { value: "whatsapp", label: "WhatsApp (Emerald)", desc: "Official WhatsApp emerald green" },
  { value: "text", label: "Text Link (Underline)", desc: "Minimal text link with navy/red hover underline" },
];

export default function AdminCTAManagement() {
  const [ctas, setCtas] = useState<CTAConfig[]>([...DEFAULT_CTAS]);
  // savedCtas holds the authoritative database baseline loaded from server
  const [savedCtas, setSavedCtas] = useState<CTAConfig[]>([...DEFAULT_CTAS]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<CTAConfig>>({});
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [rawPageContent, setRawPageContent] = useState<any>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewSurface, setPreviewSurface] = useState<"auto" | "light" | "dark">("auto");

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
            const merged = mergeCTAsWithDefaults(pc.ctas);
            setCtas(merged);
            setSavedCtas(merged);
          } else {
            setCtas([...DEFAULT_CTAS]);
            setSavedCtas([...DEFAULT_CTAS]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Dirty State Comparison ──────────────────────────────────────────────
  // Compares working state (ctas) against database baseline (savedCtas)
  const isCTAModifiedFromSaved = useCallback(
    (c: CTAConfig): boolean => {
      const saved = savedCtas.find((s) => s.key === c.key);
      if (!saved) return true;
      return (
        c.label !== saved.label ||
        c.destination !== saved.destination ||
        c.actionType !== saved.actionType ||
        c.style !== saved.style ||
        c.enabled !== saved.enabled ||
        c.openNewTab !== saved.openNewTab
      );
    },
    [savedCtas]
  );

  // Compares working state against factory defaults
  const isCTAModifiedFromDefault = (c: CTAConfig): boolean => {
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
  };

  const changedCtas = useMemo(() => {
    return ctas.filter(isCTAModifiedFromSaved);
  }, [ctas, isCTAModifiedFromSaved]);

  const changedCount = changedCtas.length;

  // ── Unique Locations ───────────────────────────────────────────────────
  const locationOrder = useMemo(() => {
    const fromDefs = Array.from(new Set(DEFAULT_CTAS.map((c) => c.location ?? "Other").filter(Boolean)));
    const fromCtas = Array.from(new Set(ctas.map((c) => c.location ?? "Other").filter(Boolean)));
    return Array.from(new Set([...fromDefs, ...fromCtas]));
  }, [ctas]);

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
          (c.section || "").toLowerCase().includes(q) ||
          c.destination.toLowerCase().includes(q) ||
          (c.usedIn || []).some((u) => u.toLowerCase().includes(q))
      );
    }
    if (locationFilter !== "all") {
      list = list.filter((c) => c.location === locationFilter);
    }
    return list;
  }, [ctas, search, locationFilter]);

  // Grouped by location
  const grouped = useMemo(() => {
    const map: Record<string, CTAConfig[]> = {};
    for (const cta of filtered) {
      const loc = cta.location ?? "Other";
      if (!map[loc]) map[loc] = [];
      map[loc].push(cta);
    }
    return map;
  }, [filtered]);

  // Locations that actually have CTAs to display
  const renderLocations = useMemo(() => {
    const keys = Object.keys(grouped).filter((k) => grouped[k]?.length > 0);
    const ordered = locationOrder.filter((loc) => keys.includes(loc));
    for (const k of keys) {
      if (!ordered.includes(k)) ordered.push(k);
    }
    return ordered;
  }, [grouped, locationOrder]);

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
    setMessage({
      type: "info",
      text: "Changes staged locally. Click 'Save All CTAs' to write to database and publish.",
    });
    setTimeout(() => setMessage(null), 4000);
  };

  const toggleEnabled = (key: string) => {
    setCtas((prev) =>
      prev.map((c) => (c.key === key ? { ...c, enabled: !(c.enabled ?? true) } : c))
    );
  };

  const discardEdits = (key: string) => {
    const saved = savedCtas.find((s) => s.key === key);
    if (!saved) return;
    setCtas((prev) => prev.map((c) => (c.key === key ? { ...saved } : c)));
    if (editingKey === key) {
      setEditDraft({ ...saved });
    }
    setMessage({ type: "info", text: `Unsaved edits for "${saved.label}" discarded.` });
    setTimeout(() => setMessage(null), 3000);
  };

  const resetToDefault = (key: string) => {
    const def = DEFAULT_CTAS.find((d) => d.key === key);
    if (!def) return;
    setCtas((prev) => prev.map((c) => (c.key === key ? { ...def } : c)));
    if (editingKey === key) {
      setEditDraft({ ...def });
    }
    setMessage({
      type: "info",
      text: `"${def.label}" reset to default settings. Click 'Save All CTAs' to persist.`,
    });
    setTimeout(() => setMessage(null), 3500);
  };

  const copyKeyToClipboard = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ── Persist to DB ───────────────────────────────────────────────────────
  const saveAll = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const updatedPageContent = { ...rawPageContent, ctas };

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pageContent: JSON.stringify(updatedPageContent) }),
      });
      const data = await res.json();

      if (data.success) {
        // Authoritative state synchronization: update baseline
        setSavedCtas([...ctas]);
        setRawPageContent(updatedPageContent);

        // Revalidate frontend cache with credentials
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            tags: ["settings"],
            paths: ["/", "/about", "/services", "/projects", "/contact", "/blogs"],
          }),
        }).catch(() => {});

        setMessage({
          type: "success",
          text: "Saved successfully! All CTAs updated in database and site cache revalidated.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save CTAs to database.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network or server error while saving CTAs. Your unsaved changes are preserved.",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-construction-navy mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading CTA CMS configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded-none bg-construction-navy flex items-center justify-center text-white">
              <Link2 className="w-4 h-4 text-construction-red" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display uppercase tracking-tight">
              CTA Management CMS
            </h1>
            {changedCount > 0 ? (
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-none border border-amber-300 inline-flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {changedCount} Unsaved Change{changedCount !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-none border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All Saved &amp; Synced
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Configure button labels, target destinations, styles, and visibility across all {locationOrder.length} page sections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={saveAll}
            disabled={saving || changedCount === 0}
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-6 py-3 transition-all shadow-sm ${
              changedCount > 0
                ? "bg-construction-red hover:bg-red-700 text-white shadow-red-600/20 shadow-md cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
            }`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : changedCount > 0 ? `Save All CTAs (${changedCount})` : "Saved (No Changes)"}
          </button>
        </div>
      </div>

      {/* ── Status message banner ── */}
      {message && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3.5 border text-sm font-medium transition-all ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : message.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : message.type === "error" ? (
              <XCircle className="w-5 h-5 shrink-0 text-red-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Filter & Search Toolbar ── */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by label, key (e.g. home_hero), section, or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 focus:border-construction-navy"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 bg-white appearance-none min-w-[220px] font-medium text-slate-700"
          >
            <option value="all">All Locations ({ctas.length} CTAs)</option>
            {locationOrder
              .filter((loc) => ctas.some((c) => c.location === loc))
              .map((loc) => (
                <option key={loc} value={loc}>
                  {loc} ({ctas.filter((c) => c.location === loc).length})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* ── CTA Groups by Location ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No CTAs match your search query. Try searching by CTA key, label, or location.
        </div>
      ) : (
        renderLocations.map((loc) => (
            <div key={loc} className="bg-white border border-slate-200 shadow-xs overflow-hidden">
              {/* Section Header */}
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-construction-red" />
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                    {loc}
                  </h2>
                  <span className="text-[11px] text-slate-400 font-sans font-normal">
                    ({grouped[loc].length} CTA{grouped[loc].length !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                      grouped[loc].every((c) => c.enabled !== false)
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : grouped[loc].some((c) => c.enabled !== false)
                        ? "text-amber-700 bg-amber-50 border-amber-200"
                        : "text-slate-500 bg-slate-100 border-slate-200"
                    }`}
                  >
                    {grouped[loc].every((c) => c.enabled !== false)
                      ? "All Active"
                      : grouped[loc].some((c) => c.enabled !== false)
                      ? "Partially Active"
                      : "All Hidden"}
                  </span>
                </div>
              </div>

              {/* CTA Rows */}
              <div className="divide-y divide-slate-100">
                {grouped[loc].map((cta) => {
                  const isEditing = editingKey === cta.key;
                  const isUnsaved = isCTAModifiedFromSaved(cta);
                  const isCustom = isCTAModifiedFromDefault(cta);
                  const ActionIcon = ACTION_TYPE_ICONS[cta.actionType] || Link2;
                  const currentDraft = isEditing ? { ...cta, ...editDraft } : cta;

                  return (
                    <div
                      key={cta.key}
                      className={`transition-colors ${
                        isEditing
                          ? "bg-slate-50/80 ring-2 ring-inset ring-construction-navy/20"
                          : isUnsaved
                          ? "bg-amber-50/30"
                          : cta.enabled === false
                          ? "bg-slate-50/40 opacity-75"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      {/* ── CTA Row Summary ── */}
                      <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Enable toggle + Identity + Badges */}
                        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                          {/* Visibility Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleEnabled(cta.key)}
                            title={cta.enabled !== false ? "Disable (hide on website)" : "Enable (show on website)"}
                            className="mt-0.5 sm:mt-0 shrink-0 cursor-pointer focus:outline-none"
                          >
                            {cta.enabled !== false ? (
                              <ToggleRight className="w-7 h-7 text-emerald-600 hover:text-emerald-700 transition-colors" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-slate-300 hover:text-slate-400 transition-colors" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0 space-y-1">
                            {/* Title & Status Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-900 font-display uppercase tracking-tight">
                                {cta.label}
                              </span>

                              {/* State Badges */}
                              {isUnsaved && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  Unsaved
                                </span>
                              )}
                              {isCustom && !isUnsaved && (
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                                  Customized
                                </span>
                              )}
                              {cta.enabled === false && (
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200">
                                  Hidden
                                </span>
                              )}
                            </div>

                            {/* Key + Location & Section Breadcrumb */}
                            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                              <button
                                type="button"
                                onClick={() => copyKeyToClipboard(cta.key)}
                                title="Click to copy CTA key"
                                className="inline-flex items-center gap-1 font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 text-[11px] transition-colors border border-slate-200/80 cursor-pointer"
                              >
                                {cta.key}
                                {copiedKey === cta.key ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-400" />
                                )}
                              </button>

                              {cta.section && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  • {cta.section}
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                <ActionIcon className="w-3 h-3 text-slate-400" />
                                {ACTION_TYPE_LABELS[cta.actionType] || cta.actionType}
                              </span>

                              <span className="font-mono text-[11px] text-slate-400 truncate max-w-[220px]" title={cta.destination}>
                                → {cta.destination}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: List Button Preview + Actions */}
                        <div className="flex items-center gap-4 self-end sm:self-auto shrink-0 flex-wrap">
                          {/* Miniature Button Preview (Phase 14) */}
                          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 border border-slate-200">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mr-1">
                              Preview:
                            </span>
                            <div
                              className={`text-[11px] font-bold px-3 py-1 uppercase tracking-wider inline-flex items-center gap-1.5 pointer-events-none select-none ${getCTAStyleClasses(
                                cta.style
                              )} ${cta.enabled === false ? "opacity-50" : ""}`}
                            >
                              <span>{cta.label}</span>
                              {cta.openNewTab && <ExternalLink className="w-2.5 h-2.5" />}
                            </div>
                          </div>

                          {/* Revert / Discard Action */}
                          {isUnsaved && (
                            <button
                              type="button"
                              onClick={() => discardEdits(cta.key)}
                              title="Discard unsaved changes and revert to database value"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100/80 border border-amber-300 transition-colors"
                            >
                              <Undo2 className="w-3 h-3" />
                              Discard
                            </button>
                          )}

                          {/* Edit / Close Button */}
                          <button
                            type="button"
                            onClick={() => (isEditing ? cancelEdit() : startEdit(cta))}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                              isEditing
                                ? "bg-slate-200 border-slate-300 text-slate-800"
                                : "bg-construction-navy hover:bg-slate-900 text-white border-transparent shadow-xs"
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {isEditing ? "Close Editor" : "Edit CTA"}
                          </button>
                        </div>
                      </div>

                      {/* ── Interactive Inline Edit Drawer (Phases 10–13) ── */}
                      {isEditing && (
                        <div className="px-5 py-6 bg-slate-50 border-t border-b border-slate-200 space-y-6">
                          {/* Breadcrumb & Section Context */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                            <div>
                              <div className="flex items-center gap-2 text-xs font-bold text-construction-navy uppercase tracking-wider">
                                <Layers className="w-3.5 h-3.5 text-construction-red" />
                                <span>{cta.location}</span>
                                <span>&rarr;</span>
                                <span>{cta.section || "CTA Button"}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Unique Identifier: <code className="font-mono text-construction-red font-bold">{cta.key}</code>
                              </p>
                            </div>

                            {/* Quick Reset to Factory Default */}
                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => resetToDefault(cta.key)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-construction-red border border-slate-300 px-3 py-1.5 bg-white transition-colors self-start"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset to Default Values
                              </button>
                            )}
                          </div>

                          {/* Used On Component List (Phase 12) */}
                          {cta.usedIn && cta.usedIn.length > 0 && (
                            <div className="bg-white border border-slate-200 p-3.5">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
                                Used on Website Components:
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                {cta.usedIn.map((place, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5"
                                  >
                                    <MapPin className="w-3 h-3 text-construction-red" />
                                    {place}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Grid: Form on Left + Live Preview on Right */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* ── Form Inputs (7 cols) ── */}
                            <div className="lg:col-span-7 space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Button Label */}
                                <div className="sm:col-span-2">
                                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Button Label *
                                  </label>
                                  <input
                                    type="text"
                                    value={currentDraft.label ?? ""}
                                    onChange={(e) =>
                                      setEditDraft((d) => ({ ...d, label: e.target.value }))
                                    }
                                    className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 focus:border-construction-navy bg-white font-medium"
                                    placeholder="e.g. Start Your Project"
                                  />
                                </div>

                                {/* Action Type */}
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Action Type *
                                  </label>
                                  <select
                                    value={currentDraft.actionType ?? "internal"}
                                    onChange={(e) =>
                                      setEditDraft((d) => ({
                                        ...d,
                                        actionType: e.target.value as CTAActionType,
                                      }))
                                    }
                                    className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 bg-white"
                                  >
                                    {Object.entries(ACTION_TYPE_LABELS).map(([v, l]) => (
                                      <option key={v} value={v}>
                                        {l}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Style Variant */}
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Style Variant *
                                  </label>
                                  <select
                                    value={currentDraft.style ?? "primary"}
                                    onChange={(e) =>
                                      setEditDraft((d) => ({
                                        ...d,
                                        style: e.target.value as CTAStyle,
                                      }))
                                    }
                                    className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 bg-white"
                                  >
                                    {STYLE_OPTIONS.map(({ value, label }) => (
                                      <option key={value} value={value}>
                                        {label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Destination */}
                                <div className="sm:col-span-2">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                      Target Destination *
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                      {currentDraft.actionType === "phone" && "Raw digits e.g. +917597000601"}
                                      {currentDraft.actionType === "whatsapp" && "Country code number e.g. 917597000601"}
                                      {currentDraft.actionType === "internal" && "Internal path e.g. /contact"}
                                      {currentDraft.actionType === "external" && "Full URL e.g. https://..."}
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    value={currentDraft.destination ?? ""}
                                    onChange={(e) =>
                                      setEditDraft((d) => ({ ...d, destination: e.target.value }))
                                    }
                                    className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/30 bg-white font-mono"
                                    placeholder="/contact or tel:... or https://..."
                                  />
                                </div>

                                {/* Options: Open in new tab & Visibility */}
                                <div className="flex items-center gap-6 sm:col-span-2 pt-1">
                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={currentDraft.openNewTab ?? false}
                                      onChange={(e) =>
                                        setEditDraft((d) => ({ ...d, openNewTab: e.target.checked }))
                                      }
                                      className="w-4 h-4 accent-construction-navy"
                                    />
                                    <span className="text-xs font-semibold text-slate-700">
                                      Open in New Tab (<code className="text-[10px]">_blank</code>)
                                    </span>
                                  </label>

                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={currentDraft.enabled ?? true}
                                      onChange={(e) =>
                                        setEditDraft((d) => ({ ...d, enabled: e.target.checked }))
                                      }
                                      className="w-4 h-4 accent-construction-navy"
                                    />
                                    <span className="text-xs font-semibold text-slate-700">
                                      Button Active (Visible on site)
                                    </span>
                                  </label>
                                </div>
                              </div>

                              {/* Form Action Buttons */}
                              <div className="pt-4 flex items-center gap-3 border-t border-slate-200">
                                <button
                                  type="button"
                                  onClick={saveDraft}
                                  className="inline-flex items-center gap-2 bg-construction-navy hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 shadow-sm transition-all cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Apply Changes
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 px-4 py-2.5 transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <span className="text-[11px] text-slate-400 ml-auto hidden sm:inline">
                                  Remember to click <strong>Save All CTAs</strong> above to publish.
                                </span>
                              </div>
                            </div>

                            {/* ── Per-CTA Live Visual Preview Card (Phases 10, 11, 13) ── */}
                            <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm p-4 space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
                                  <Eye className="w-4 h-4 text-construction-red" />
                                  <span>Per-Button Live Preview</span>
                                </div>
                                {/* Surface toggler for testing contrast */}
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewSurface("light")}
                                    className={`px-2 py-0.5 border ${
                                      previewSurface === "light"
                                        ? "bg-slate-800 text-white border-slate-800"
                                        : "bg-white text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    Light
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewSurface("dark")}
                                    className={`px-2 py-0.5 border ${
                                      previewSurface === "dark"
                                        ? "bg-slate-800 text-white border-slate-800"
                                        : "bg-white text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    Dark
                                  </button>
                                </div>
                              </div>

                              {/* Interactive Preview Canvas */}
                              <div
                                className={`p-8 flex flex-col items-center justify-center min-h-[160px] border transition-colors relative ${
                                  previewSurface === "dark" || (previewSurface === "auto" && currentDraft.style === "ghost")
                                    ? "bg-slate-900 border-slate-800 text-white"
                                    : "bg-slate-50 border-slate-200 text-slate-900"
                                }`}
                              >
                                <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest font-mono opacity-50">
                                  Rendered Output
                                </span>

                                {currentDraft.enabled === false ? (
                                  <div className="text-center space-y-1">
                                    <div
                                      className={`text-xs font-bold px-6 py-3 uppercase tracking-wider inline-flex items-center gap-2 opacity-40 line-through ${getCTAStyleClasses(
                                        currentDraft.style || "primary"
                                      )}`}
                                    >
                                      <span>{currentDraft.label || "Empty Label"}</span>
                                    </div>
                                    <p className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">
                                      Disabled (Will not render on website)
                                    </p>
                                  </div>
                                ) : (
                                  <div
                                    className={`text-xs font-bold px-6 py-3.5 uppercase tracking-wider inline-flex items-center gap-2 transition-transform transform active:scale-95 shadow-md ${getCTAStyleClasses(
                                      currentDraft.style || "primary"
                                    )}`}
                                  >
                                    <span>{currentDraft.label || "Button Label"}</span>
                                    {currentDraft.openNewTab ? (
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    ) : (
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Preview Specifications Table */}
                              <div className="bg-slate-50 border border-slate-200 text-[11px] p-3 space-y-1.5 font-mono">
                                <div className="flex justify-between">
                                  <span className="text-slate-400 font-sans">CTA Key:</span>
                                  <span className="font-bold text-slate-800">{cta.key}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400 font-sans">Style Token:</span>
                                  <span className="font-bold text-construction-red uppercase">
                                    {currentDraft.style}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400 font-sans">Action Type:</span>
                                  <span className="text-slate-700">
                                    {ACTION_TYPE_LABELS[currentDraft.actionType || "internal"]}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400 font-sans">Resolved Href:</span>
                                  <span className="text-slate-800 truncate max-w-[200px]" title={resolveCTAHref(currentDraft as CTAConfig)}>
                                    {resolveCTAHref(currentDraft as CTAConfig)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400 font-sans">Target Window:</span>
                                  <span className="text-slate-700">
                                    {currentDraft.openNewTab ? "New Tab (_blank)" : "Same Tab"}
                                  </span>
                                </div>
                              </div>
                            </div>
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

      {/* ── Sticky Bottom Save Bar (Phase 17) ── */}
      {changedCount > 0 && (
        <div className="sticky bottom-6 flex justify-center z-30">
          <div className="bg-white border-2 border-construction-navy shadow-2xl px-6 py-4 flex items-center gap-5 max-w-xl w-full justify-between animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {changedCount} unsaved CTA modification{changedCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-slate-500">
                  Save now to persist changes to PostgreSQL and revalidate live frontend cache.
                </p>
              </div>
            </div>
            <button
              onClick={saveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-construction-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 shadow-md transition-all cursor-pointer shrink-0"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save All CTAs"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
