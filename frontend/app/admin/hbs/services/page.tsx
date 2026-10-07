"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Save,
  Check,
  Trash2,
  ExternalLink,
  FileText,
  ListChecks,
  Workflow,
  ShieldCheck,
  IndianRupee,
  HelpCircle,
  ImageIcon,
  Globe,
  Info,
  X,
} from "lucide-react";
import type { HbsService } from "@/lib/types";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";

/* ────────────────────────────────────────────────────────────────
   Types & helpers
──────────────────────────────────────────────────────────────── */

interface ProcessStep {
  step: string;
  title: string;
  desc: string;
}
interface Faq {
  q: string;
  a: string;
}

interface ServiceForm {
  id?: string;
  serviceNumber: string;
  title: string;
  hindiTitle: string;
  slug: string;
  order: number;
  active: boolean;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  whatsappCtaText: string;
  benefits: string[];
  processSteps: ProcessStep[];
  warrantyDetails: string;
  pricingEstimate: string;
  faqs: Faq[];
  image: string;
  galleryImages: string[];
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

type SectionId =
  | "basic"
  | "content"
  | "benefits"
  | "process"
  | "warranty"
  | "pricing"
  | "faqs"
  | "media"
  | "seo";

const SECTIONS: { id: SectionId; label: string; icon: typeof Info }[] = [
  { id: "basic", label: "Basic", icon: Info },
  { id: "content", label: "Content", icon: FileText },
  { id: "benefits", label: "Benefits", icon: ListChecks },
  { id: "process", label: "Process", icon: Workflow },
  { id: "warranty", label: "Warranty", icon: ShieldCheck },
  { id: "pricing", label: "Pricing", icon: IndianRupee },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "seo", label: "SEO", icon: Globe },
];

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toStringList(value: unknown): string[] {
  const parsed = parseJson<unknown>(value, []);
  return Array.isArray(parsed) ? parsed.map((v) => String(v ?? "")) : [];
}

function toForm(s: Partial<HbsService>): ServiceForm {
  const steps = parseJson<any[]>(s.processSteps, []);
  const faqs = parseJson<any[]>(s.faqs, []);
  return {
    id: s.id,
    serviceNumber: s.serviceNumber || "",
    title: s.title || "",
    hindiTitle: s.hindiTitle || "",
    slug: s.slug || "",
    order: Number(s.order) || 0,
    active: s.active !== false,
    icon: s.icon || "Wrench",
    shortDescription: s.shortDescription || "",
    fullDescription: s.fullDescription || "",
    features: toStringList(s.features),
    whatsappCtaText: s.whatsappCtaText || "",
    benefits: toStringList(s.benefits),
    processSteps: Array.isArray(steps)
      ? steps.map((p, i) => ({
          step: String(p?.step ?? String(i + 1).padStart(2, "0")),
          title: String(p?.title ?? ""),
          desc: String(p?.desc ?? p?.description ?? ""),
        }))
      : [],
    warrantyDetails: s.warrantyDetails || "",
    pricingEstimate: s.pricingEstimate || "",
    faqs: Array.isArray(faqs)
      ? faqs.map((f) => ({
          q: String(f?.q ?? f?.question ?? ""),
          a: String(f?.a ?? f?.answer ?? ""),
        }))
      : [],
    image: s.image || "",
    galleryImages: toStringList(s.galleryImages),
    metaTitle: s.metaTitle || "",
    metaDescription: s.metaDescription || "",
    ogImage: s.ogImage || "",
  };
}

/** Only existing HbsService columns are sent. Slug is never sent for existing services. */
function toPayload(f: ServiceForm, isNew: boolean) {
  const clean = (list: string[]) => list.map((v) => v.trim()).filter(Boolean);
  const payload: Record<string, unknown> = {
    serviceNumber: f.serviceNumber.trim() || null,
    title: f.title.trim(),
    hindiTitle: f.hindiTitle.trim() || null,
    order: Number(f.order) || 0,
    active: f.active,
    icon: f.icon || null,
    shortDescription: f.shortDescription.trim() || null,
    fullDescription: f.fullDescription.trim() || null,
    features: clean(f.features),
    whatsappCtaText: f.whatsappCtaText.trim() || null,
    benefits: clean(f.benefits),
    processSteps: f.processSteps
      .filter((p) => p.title.trim() || p.desc.trim())
      .map((p, i) => ({
        step: p.step.trim() || String(i + 1).padStart(2, "0"),
        title: p.title.trim(),
        desc: p.desc.trim(),
      })),
    warrantyDetails: f.warrantyDetails.trim() || null,
    pricingEstimate: f.pricingEstimate.trim() || null,
    faqs: f.faqs
      .filter((x) => x.q.trim() && x.a.trim())
      .map((x) => ({ q: x.q.trim(), a: x.a.trim() })),
    image: f.image || null,
    galleryImages: clean(f.galleryImages),
    metaTitle: f.metaTitle.trim() || null,
    metaDescription: f.metaDescription.trim() || null,
    ogImage: f.ogImage || null,
  };
  if (isNew) payload.slug = f.slug.trim().toLowerCase();
  return payload;
}

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ────────────────────────────────────────────────────────────────
   Small UI primitives (admin-only, slate/white, 8px controls)
──────────────────────────────────────────────────────────────── */

const inputCls =
  "w-full min-h-[44px] px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-500";

function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: ReactNode;
  counter?: { value: number; max: number };
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-slate-700">{label}</span>
        {counter && (
          <span
            className={`text-[11px] font-mono ${
              counter.value > counter.max ? "text-red-600" : "text-slate-400"
            }`}
          >
            {counter.value}/{counter.max}
          </span>
        )}
      </span>
      {children}
      {hint && <span className="block mt-1.5 text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function Card({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>}
        </div>
        {action}
      </header>
      <div className="px-5 sm:px-6 py-5 space-y-5">{children}</div>
    </section>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 min-h-[36px] px-3 text-[13px] font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 shrink-0"
    >
      <Plus className="w-3.5 h-3.5" />
      {children}
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  emptyText,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  addLabel: string;
  emptyText: string;
}) {
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-[13px] text-slate-500">{emptyText}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 text-right text-[11px] font-mono text-slate-400 shrink-0">
            {i + 1}
          </span>
          <input
            className={inputCls}
            value={item}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
          />
          <RemoveButton
            label={`Remove item ${i + 1}`}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <div className="pt-1">
        <AddButton onClick={() => onChange([...items, ""])}>{addLabel}</AddButton>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Page
──────────────────────────────────────────────────────────────── */

export default function HbsAdminServices() {
  const [services, setServices] = useState<HbsService[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [listMessage, setListMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Editor state
  const [form, setForm] = useState<ServiceForm | null>(null);
  const [baseline, setBaseline] = useState("");
  const [section, setSection] = useState<SectionId>("basic");
  const [saving, setSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [editorError, setEditorError] = useState("");

  const loadServices = async () => {
    setLoading(true);
    setListMessage(null);
    try {
      const res = await fetch("/api/hbs/services?all=true", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setServices(json.data);
      else setListMessage({ text: json.error || "Failed to load services.", type: "error" });
    } catch {
      setListMessage({ text: "Could not reach the backend API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const isDirty = useMemo(
    () => (form ? JSON.stringify(form) !== baseline : false),
    [form, baseline]
  );

  // Browser-level warning when leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) =>
      [s.serviceNumber, s.title, s.hindiTitle, s.slug, s.shortDescription]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [services, query]);

  const openEditor = (service: Partial<HbsService>) => {
    const next = toForm(service);
    if (!service.id) next.order = services.length + 1;
    setForm(next);
    setBaseline(JSON.stringify(next));
    setSection("basic");
    setEditorError("");
    setSavedRecently(false);
    window.scrollTo({ top: 0 });
  };

  const closeEditor = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    setForm(null);
    setBaseline("");
  };

  const update = <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleToggleActive = async (service: HbsService) => {
    const nextActive = !service.active;
    setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, active: nextActive } : s)));
    try {
      const res = await fetch(`/api/hbs/services/${service.id}`, {
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
        body: JSON.stringify({ paths: ["/hbs", "/hbs/services", `/hbs/services/${service.slug}`] }),
      }).catch(() => {});
    } catch {
      setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, active: service.active } : s)));
      setListMessage({ text: `Could not update "${service.title}".`, type: "error" });
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setEditorError("");

    if (!form.title.trim()) {
      setSection("basic");
      setEditorError("Title is required.");
      return;
    }
    const isNew = !form.id;
    if (isNew && !form.slug.trim()) {
      setSection("basic");
      setEditorError("Slug is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(isNew ? "/api/hbs/services" : `/api/hbs/services/${form.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(toPayload(form, isNew)),
      });
      const json = await res.json();
      if (!json.success || !json.data) {
        setEditorError(json.error || "Failed to save service.");
        return;
      }

      const saved: HbsService = json.data;
      setServices((prev) =>
        isNew
          ? [...prev, saved].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          : prev.map((s) => (s.id === saved.id ? saved : s))
      );
      const next = toForm(saved);
      setForm(next);
      setBaseline(JSON.stringify(next));
      setSavedRecently(true);
      setTimeout(() => setSavedRecently(false), 2500);

      fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: ["/hbs", "/hbs/services", `/hbs/services/${saved.slug}`] }),
      }).catch(() => {});
    } catch {
      setEditorError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form?.id) return;
    if (!window.confirm(`Delete "${form.title}" permanently? This removes its public page.`)) return;
    try {
      const res = await fetch(`/api/hbs/services/${form.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) {
        setEditorError(json.error || "Failed to delete service.");
        return;
      }
      setServices((prev) => prev.filter((s) => s.id !== form.id));
      setListMessage({ text: `"${form.title}" deleted.`, type: "success" });
      setForm(null);
      setBaseline("");
    } catch {
      setEditorError("Network error while deleting.");
    }
  };

  /* ── LIST VIEW ─────────────────────────────────────────────── */
  if (!form) {
    return (
      <div className="space-y-6 max-w-5xl">
        <HbsAdminPageHeader
          breadcrumbs={[{ label: "Services" }]}
          title="Services"
          description={loading ? "Loading…" : `${services.length} services`}
        >
          <button
            type="button"
            onClick={loadServices}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 text-[13px] font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Reload
          </button>
          <button
            type="button"
            onClick={() => openEditor({})}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 text-[13px] font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" />
            Add service
          </button>
        </HbsAdminPageHeader>

        {listMessage && (
          <div
            role="status"
            className={`flex items-center gap-2 px-4 py-3 text-[13px] rounded-lg border ${
              listMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {listMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1">{listMessage.text}</span>
            <button type="button" onClick={() => setListMessage(null)} aria-label="Dismiss" className="p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="relative">
          <label htmlFor="admin-service-search" className="sr-only">
            Search services
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="admin-service-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, number or slug"
            className={`${inputCls} pl-10`}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading services…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-slate-500">No services found.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <li key={s.id} className="flex items-center gap-3 pr-3 hover:bg-slate-50/70">
                  <button
                    type="button"
                    onClick={() => openEditor(s)}
                    className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4 py-3 text-left focus-visible:outline-none focus-visible:bg-slate-50"
                  >
                    <div className="w-14 h-11 shrink-0 rounded-md bg-slate-100 overflow-hidden">
                      {s.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="w-7 text-[12px] font-mono text-slate-400 shrink-0">
                      {s.serviceNumber || "—"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900 truncate">{s.title}</span>
                      <span className="block text-xs text-slate-500 font-mono truncate">/{s.slug}</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(s)}
                    aria-label={`${s.active ? "Hide" : "Show"} ${s.title}`}
                    className={`shrink-0 inline-flex items-center gap-1.5 min-h-[32px] px-2.5 text-[12px] font-medium rounded-full border ${
                      s.active
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {s.active ? "Live" : "Hidden"}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 hidden sm:block" aria-hidden="true" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  /* ── EDITOR VIEW ───────────────────────────────────────────── */
  const isNew = !form.id;
  const publicPath = `/services/${form.slug || "…"}`;

  return (
    <div className="max-w-6xl pb-28">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <button
            type="button"
            onClick={closeEditor}
            className="inline-flex items-center gap-1 min-h-[36px] -ml-1 px-1 text-[13px] text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
            All services
          </button>
          <h1 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
            {isNew ? "New service" : form.title || "Untitled service"}
          </h1>
          {!isNew && (
            <p className="mt-0.5 text-[13px] text-slate-500 font-mono truncate">
              #{form.serviceNumber || "—"} · {publicPath}
            </p>
          )}
        </div>
        {!isNew && form.active && (
          <a
            href={`/hbs/services/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 text-[13px] font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 self-start sm:self-auto"
          >
            View live page
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-6 lg:gap-8">
        {/* Section navigation: vertical on desktop, scrollable strip on mobile */}
        <nav aria-label="Service sections" className="lg:sticky lg:top-6 self-start -mx-4 px-4 lg:mx-0 lg:px-0">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSection(id)}
                  aria-current={section === id ? "page" : undefined}
                  className={`w-full inline-flex items-center gap-2.5 min-h-[40px] px-3 text-[13px] rounded-lg whitespace-nowrap transition-colors ${
                    section === id
                      ? "bg-slate-900 text-white font-medium"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Section content */}
        <div className="min-w-0 space-y-6">
          {editorError && (
            <div role="alert" className="flex items-center gap-2 px-4 py-3 text-[13px] rounded-lg border bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {editorError}
            </div>
          )}

          {section === "basic" && (
            <Card title="Basic" description="Identity, ordering and visibility.">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-4">
                <Field label="Number">
                  <input
                    className={`${inputCls} font-mono`}
                    value={form.serviceNumber}
                    placeholder="01"
                    onChange={(e) => update("serviceNumber", e.target.value)}
                  />
                </Field>
                <Field label="Service name">
                  <input
                    className={inputCls}
                    value={form.title}
                    placeholder="Structure Repair"
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) =>
                        prev ? { ...prev, title, slug: prev.id ? prev.slug : slugify(title) } : prev
                      );
                    }}
                  />
                </Field>
              </div>
              <Field label="Hindi name">
                <input
                  className={inputCls}
                  value={form.hindiTitle}
                  onChange={(e) => update("hindiTitle", e.target.value)}
                />
              </Field>
              <Field
                label="URL slug"
                hint={
                  isNew
                    ? "Generated from the name. Cannot be changed after the service is created."
                    : "Locked to protect existing links and search rankings."
                }
              >
                <input
                  className={`${inputCls} font-mono`}
                  value={form.slug}
                  disabled={!isNew}
                  onChange={(e) => update("slug", slugify(e.target.value))}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Display order">
                  <input
                    type="number"
                    className={`${inputCls} font-mono`}
                    value={form.order}
                    onChange={(e) => update("order", Number(e.target.value))}
                  />
                </Field>
                <div>
                  <span className="block mb-1.5 text-[13px] font-medium text-slate-700">Visibility</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.active}
                    onClick={() => update("active", !form.active)}
                    className="w-full min-h-[44px] flex items-center justify-between px-3 border border-slate-300 rounded-lg text-sm text-slate-700"
                  >
                    {form.active ? "Live on website" : "Hidden"}
                    <span
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        form.active ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          form.active ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
              {!isNew && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3 text-[13px] font-medium text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete service
                  </button>
                </div>
              )}
            </Card>
          )}

          {section === "content" && (
            <Card title="Content" description="What appears on the listing and detail page.">
              <Field
                label="Short description"
                hint="Shown on the services listing. Keep it to one or two lines."
                counter={{ value: form.shortDescription.length, max: 160 }}
              >
                <textarea
                  rows={2}
                  className={inputCls}
                  value={form.shortDescription}
                  onChange={(e) => update("shortDescription", e.target.value)}
                />
              </Field>
              <Field label="Full description">
                <textarea
                  rows={6}
                  className={inputCls}
                  value={form.fullDescription}
                  onChange={(e) => update("fullDescription", e.target.value)}
                />
              </Field>
              <div>
                <span className="block mb-1.5 text-[13px] font-medium text-slate-700">Scope of work</span>
                <StringListEditor
                  items={form.features}
                  onChange={(v) => update("features", v)}
                  placeholder="e.g. Structural crack injection"
                  addLabel="Add scope item"
                  emptyText="No scope items yet."
                />
              </div>
              <Field label="WhatsApp message" hint="Pre-filled text when a visitor taps WhatsApp on this service.">
                <input
                  className={inputCls}
                  value={form.whatsappCtaText}
                  onChange={(e) => update("whatsappCtaText", e.target.value)}
                />
              </Field>
            </Card>
          )}

          {section === "benefits" && (
            <Card title="Benefits" description="Short, verifiable outcomes for the customer.">
              <StringListEditor
                items={form.benefits}
                onChange={(v) => update("benefits", v)}
                placeholder="e.g. Written workmanship warranty"
                addLabel="Add benefit"
                emptyText="No benefits added."
              />
            </Card>
          )}

          {section === "process" && (
            <Card
              title="Process"
              description="Steps shown in order on the detail page."
              action={
                <AddButton
                  onClick={() =>
                    update("processSteps", [
                      ...form.processSteps,
                      { step: String(form.processSteps.length + 1).padStart(2, "0"), title: "", desc: "" },
                    ])
                  }
                >
                  Add step
                </AddButton>
              }
            >
              {form.processSteps.length === 0 && <p className="text-[13px] text-slate-500">No steps yet.</p>}
              {form.processSteps.map((p, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      aria-label={`Step ${i + 1} number`}
                      className={`${inputCls} w-20 font-mono`}
                      value={p.step}
                      onChange={(e) =>
                        update("processSteps", form.processSteps.map((x, j) => (j === i ? { ...x, step: e.target.value } : x)))
                      }
                    />
                    <input
                      aria-label={`Step ${i + 1} title`}
                      className={inputCls}
                      placeholder="Step title"
                      value={p.title}
                      onChange={(e) =>
                        update("processSteps", form.processSteps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                      }
                    />
                    <RemoveButton
                      label={`Remove step ${i + 1}`}
                      onClick={() => update("processSteps", form.processSteps.filter((_, j) => j !== i))}
                    />
                  </div>
                  <textarea
                    aria-label={`Step ${i + 1} description`}
                    rows={2}
                    className={inputCls}
                    placeholder="What happens in this step"
                    value={p.desc}
                    onChange={(e) =>
                      update("processSteps", form.processSteps.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))
                    }
                  />
                </div>
              ))}
            </Card>
          )}

          {section === "warranty" && (
            <Card title="Warranty" description="Only state warranties Hind Build actually provides.">
              <Field label="Warranty details">
                <textarea
                  rows={5}
                  className={inputCls}
                  value={form.warrantyDetails}
                  onChange={(e) => update("warrantyDetails", e.target.value)}
                />
              </Field>
            </Card>
          )}

          {section === "pricing" && (
            <Card title="Pricing" description="Indicative only. Leave empty to hide pricing on the page.">
              <Field label="Pricing estimate" hint="e.g. Starts from ₹XX per sq.ft (final quote after inspection)">
                <input
                  className={inputCls}
                  value={form.pricingEstimate}
                  onChange={(e) => update("pricingEstimate", e.target.value)}
                />
              </Field>
            </Card>
          )}

          {section === "faqs" && (
            <Card
              title="FAQs"
              description="Also published as FAQ structured data."
              action={<AddButton onClick={() => update("faqs", [...form.faqs, { q: "", a: "" }])}>Add FAQ</AddButton>}
            >
              {form.faqs.length === 0 && <p className="text-[13px] text-slate-500">No FAQs yet.</p>}
              {form.faqs.map((f, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      aria-label={`Question ${i + 1}`}
                      className={`${inputCls} font-medium`}
                      placeholder="Question"
                      value={f.q}
                      onChange={(e) => update("faqs", form.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))}
                    />
                    <RemoveButton
                      label={`Remove FAQ ${i + 1}`}
                      onClick={() => update("faqs", form.faqs.filter((_, j) => j !== i))}
                    />
                  </div>
                  <textarea
                    aria-label={`Answer ${i + 1}`}
                    rows={3}
                    className={inputCls}
                    placeholder="Answer"
                    value={f.a}
                    onChange={(e) => update("faqs", form.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))}
                  />
                </div>
              ))}
            </Card>
          )}

          {section === "media" && (
            <>
              <Card title="Main image" description="Used on the listing, featured cards and detail hero.">
                <HbsImageUploader
                  value={form.image}
                  onChange={(url) => update("image", url)}
                  folder="hbs/services"
                  label="Main image"
                  recommendedSize="1600×1200px"
                  aspectRatioHint="4:3"
                  previewHeight="h-48"
                />
                <div className="flex gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[13px] text-slate-600">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                  <span>
                    Alt text is generated automatically as{" "}
                    <strong className="font-medium text-slate-900">
                      “{form.title || "Service name"} — Hind Build”
                    </strong>
                    . A custom alt field requires a new database column.
                  </span>
                </div>
              </Card>
              <Card
                title="Gallery"
                description="Additional photos on the detail page."
                action={<AddButton onClick={() => update("galleryImages", [...form.galleryImages, ""])}>Add image</AddButton>}
              >
                {form.galleryImages.length === 0 && <p className="text-[13px] text-slate-500">No gallery images.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.galleryImages.map((url, i) => (
                    <div key={i} className="relative p-3 border border-slate-200 rounded-lg">
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <RemoveButton
                          label={`Remove gallery image ${i + 1}`}
                          onClick={() => update("galleryImages", form.galleryImages.filter((_, j) => j !== i))}
                        />
                      </div>
                      <HbsImageUploader
                        value={url}
                        onChange={(next) =>
                          update("galleryImages", form.galleryImages.map((v, j) => (j === i ? next : v)))
                        }
                        folder="hbs/services"
                        label={`Image ${i + 1}`}
                        previewHeight="h-32"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {section === "seo" && (
            <Card title="SEO" description="Search and social sharing for this service page.">
              <Field label="SEO title" counter={{ value: form.metaTitle.length, max: 60 }} hint="Leave empty to use the service name.">
                <input
                  className={inputCls}
                  value={form.metaTitle}
                  placeholder={`${form.title || "Service"} | Hind Build`}
                  onChange={(e) => update("metaTitle", e.target.value)}
                />
              </Field>
              <Field label="Meta description" counter={{ value: form.metaDescription.length, max: 160 }}>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={form.metaDescription}
                  placeholder={form.shortDescription}
                  onChange={(e) => update("metaDescription", e.target.value)}
                />
              </Field>

              {/* Search preview */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2">Search preview</p>
                <p className="text-xs text-slate-600 truncate">hindbuilding.hindustanprojects.in › services › {form.slug || "…"}</p>
                <p className="mt-0.5 text-[17px] leading-snug text-[#1a0dab] truncate">
                  {form.metaTitle || `${form.title || "Service"} | Hind Build`}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-600 line-clamp-2">
                  {form.metaDescription || form.shortDescription || "No description yet."}
                </p>
              </div>

              <HbsImageUploader
                value={form.ogImage}
                onChange={(url) => update("ogImage", url)}
                folder="hbs/services"
                label="Social share image (optional)"
                description="Falls back to the main image."
                recommendedSize="1200×630px"
                aspectRatioHint="1.91:1"
                previewHeight="h-32"
              />
              <p className="text-xs text-slate-500">
                Canonical URL and structured data are generated automatically from the slug and content.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 inset-x-0 lg:left-auto lg:w-[calc(100%-var(--admin-sidebar-w,0px))] z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
          <span className="text-[13px]" aria-live="polite">
            {isDirty ? (
              <span className="inline-flex items-center gap-2 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {isNew ? "New service" : "All changes saved"}
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeEditor}
              className="min-h-[44px] px-4 text-[13px] font-medium text-slate-700 rounded-lg hover:bg-slate-100"
            >
              {isDirty ? "Cancel" : "Done"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (!isDirty && !isNew)}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 text-[13px] font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : savedRecently ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
