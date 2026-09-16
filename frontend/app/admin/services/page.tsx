"use client";

import { useEffect, useState, useMemo } from "react";
import {
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit,
  ExternalLink,
  Check,
  Building2,
  HardHat,
  Ruler,
  Palette,
  Droplets,
  Briefcase,
  Compass,
  FileText,
  Search,
  Sparkles,
  Layers,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  X,
  PlusCircle,
  AlertCircle,
  Globe,
  Sliders,
  DollarSign
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import DynamicIcon from "@/components/DynamicIcon";
import { Service, Guarantee } from "@/lib/types";
import { getServiceSlug } from "@/lib/companyData";
import {
  resolveServiceDetail,
  ServiceFeatureDetail,
  ServiceApplication,
  ServiceStage,
  ServiceFaq
} from "@/lib/serviceContentData";

interface ServiceFormState {
  title: string;
  category: string;
  icon: string;
  image: string;
  order: number;
  active: boolean;
  features: string[];
  description: string;
  badge: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  overviewHeading: string;
  overviewParagraphs: string[];
  detailedCapabilities: ServiceFeatureDetail[];
  applicationsHeading: string;
  applications: ServiceApplication[];
  stagesHeading: string;
  stages: ServiceStage[];
  deliverablesHeading: string;
  deliverables: string[];
  whyChooseHeading: string;
  whyChoosePoints: { title: string; description: string }[];
  faqs: ServiceFaq[];
  indicativeRatesNotice?: {
    heading: string;
    description: string;
    tiers: { name: string; rate: string; highlight: string }[];
  } | null;
}

const EMPTY_SERVICE: ServiceFormState = {
  title: "",
  description: "",
  category: "Design & Planning",
  icon: "Wrench",
  image: "",
  order: 1,
  active: true,
  features: [],
  badge: "",
  tagline: "",
  metaTitle: "",
  metaDescription: "",
  overviewHeading: "Engineering Overview & Technical Scope",
  overviewParagraphs: [""],
  detailedCapabilities: [
    { title: "", description: "", points: [""] }
  ],
  applicationsHeading: "Project Types & Sectors",
  applications: [
    { title: "", description: "" }
  ],
  stagesHeading: "Coordinated Execution Stages",
  stages: [
    { step: "01", title: "", description: "" },
    { step: "02", title: "", description: "" },
    { step: "03", title: "", description: "" }
  ],
  deliverablesHeading: "Confirmed Deliverables & Handover",
  deliverables: [""],
  whyChooseHeading: "Why HiPRO for This Service",
  whyChoosePoints: [
    { title: "", description: "" }
  ],
  faqs: [
    { question: "", answer: "" }
  ],
  indicativeRatesNotice: null
};

const EMPTY_GUARANTEE: Omit<Guarantee, "id" | "createdAt"> = {
  badge: "",
  title: "",
  description: "",
  bg: "bg-construction-navy",
  accent: "text-blue-200",
  image: "",
  hasShield: false,
  order: 1,
  active: true,
};

const SUGGESTED_ICONS = [
  "HardHat",
  "Compass",
  "Ruler",
  "Palette",
  "Droplets",
  "Briefcase",
  "Building2",
  "Wrench",
  "ShieldCheck",
  "FileText",
  "CheckCircle2",
  "Layers"
];

const CATEGORY_OPTIONS = [
  "Design & Planning",
  "Civil Construction",
  "Interior & Exterior Design",
  "Surveying & Land Mapping",
  "Water Treatment & Infrastructure",
  "Project Management & PMC"
];

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState<"services" | "guarantees">("services");
  const [services, setServices] = useState<Service[]>([]);
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Sub-tabs for the rich service editor
  const [editorSubTab, setEditorSubTab] = useState<
    "basics" | "overview" | "typologies" | "deliverables" | "faqs"
  >("basics");

  // Forms
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(EMPTY_SERVICE);
  const [guaranteeForm, setGuaranteeForm] = useState(EMPTY_GUARANTEE);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [resS, resG] = await Promise.all([
        fetch("/api/services?all=true", { credentials: "include", cache: "no-store" }),
        fetch("/api/guarantees", { credentials: "include", cache: "no-store" })
      ]);
      const [jsonS, jsonG] = await Promise.all([resS.json(), resG.json()]);

      if (jsonS.success) setServices(jsonS.data);
      if (jsonG.success) setGuarantees(jsonG.data);
    } catch {
      setError("Network error fetching services data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.badge && s.badge.toLowerCase().includes(q))
    );
  }, [services, searchQuery]);

  // Handlers
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const url = "/api/services";
      const method = editingServiceId ? "PATCH" : "POST";
      const payload: any = {
        ...serviceForm,
        overviewParagraphs: serviceForm.overviewParagraphs.filter((p) => p.trim() !== ""),
        detailedCapabilities: serviceForm.detailedCapabilities.filter((c) => c.title.trim() !== ""),
        applications: serviceForm.applications.filter((a) => a.title.trim() !== ""),
        stages: serviceForm.stages.filter((st) => st.title.trim() !== ""),
        deliverables: serviceForm.deliverables.filter((d) => d.trim() !== ""),
        whyChoosePoints: serviceForm.whyChoosePoints.filter((w) => w.title.trim() !== ""),
        faqs: serviceForm.faqs.filter((f) => f.question.trim() !== ""),
      };

      if (editingServiceId) {
        payload.id = editingServiceId;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        setSuccessMsg(editingServiceId ? "Service updated successfully!" : "Service created successfully!");
        setShowForm(false);
        setServiceForm(EMPTY_SERVICE);
        setEditingServiceId(null);
        fetchData();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setError(json.error || "Failed to save service");
      }
    } catch {
      setError("Network error while saving service");
    }
    setSaving(false);
  };

  const startEditService = (service: Service) => {
    setEditingServiceId(service.id || null);
    setError("");
    setSuccessMsg("");

    const slug = getServiceSlug(service.title);
    const resolved = resolveServiceDetail(service, slug);

    let featuresList: string[] = [];
    try {
      featuresList = typeof service.features === "string"
        ? JSON.parse(service.features)
        : (Array.isArray(service.features) ? service.features : []);
    } catch {
      featuresList = [];
    }

    setServiceForm({
      title: service.title || "",
      category: service.category || "Design & Planning",
      icon: service.icon || "Wrench",
      image: service.image || "",
      order: service.order ?? 1,
      active: service.active !== false,
      description: service.description || "",
      features: featuresList,
      badge: service.badge || resolved?.badge || "",
      tagline: service.tagline || resolved?.tagline || "",
      metaTitle: service.metaTitle || resolved?.metaTitle || "",
      metaDescription: service.metaDescription || resolved?.metaDescription || "",
      overviewHeading: service.overviewHeading || resolved?.overviewHeading || "Engineering Overview & Technical Scope",
      overviewParagraphs: resolved?.overviewParagraphs && resolved.overviewParagraphs.length > 0
        ? resolved.overviewParagraphs
        : [service.description || ""],
      detailedCapabilities: resolved?.detailedCapabilities && resolved.detailedCapabilities.length > 0
        ? resolved.detailedCapabilities
        : [{ title: "", description: "", points: [""] }],
      applicationsHeading: service.applicationsHeading || resolved?.applicationsHeading || "Applications & Sectors",
      applications: resolved?.applications && resolved.applications.length > 0
        ? resolved.applications
        : [{ title: "", description: "" }],
      stagesHeading: service.stagesHeading || resolved?.stagesHeading || "Workflow & Execution Stages",
      stages: resolved?.stages && resolved.stages.length > 0
        ? resolved.stages
        : [{ step: "01", title: "", description: "" }],
      deliverablesHeading: service.deliverablesHeading || resolved?.deliverablesHeading || "Project Deliverables & Handover",
      deliverables: resolved?.deliverables && resolved.deliverables.length > 0
        ? resolved.deliverables
        : [""],
      whyChooseHeading: service.whyChooseHeading || resolved?.whyChooseHeading || "Why Choose Hindustan Projects",
      whyChoosePoints: resolved?.whyChoosePoints && resolved.whyChoosePoints.length > 0
        ? resolved.whyChoosePoints
        : [{ title: "", description: "" }],
      faqs: resolved?.faqs && resolved.faqs.length > 0
        ? resolved.faqs
        : [{ question: "", answer: "" }],
      indicativeRatesNotice: resolved?.indicativeRatesNotice || null,
    });

    setEditorSubTab("basics");
    setActiveTab("services");
    setShowForm(true);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleGuaranteeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/guarantees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(guaranteeForm)
      });
      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        setGuaranteeForm(EMPTY_GUARANTEE);
        fetchData();
      } else {
        setError(json.error || "Failed to save guarantee");
      }
    } catch {
      setError("Network error");
    }
    setSaving(false);
  };

  const deleteItem = async (type: "services" | "guarantees", id: string) => {
    if (!confirm("Are you sure you want to permanently delete this item?")) return;
    try {
      await fetch(`/api/${type}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id })
      });
      fetchData();
    } catch {
      /* silent */
    }
  };

  const toggleActive = async (type: "services" | "guarantees", item: any) => {
    try {
      await fetch(`/api/${type}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: item.id, active: !item.active })
      });
      fetchData();
    } catch {
      /* silent */
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header & Notifications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-construction-red" />
            Services & Guarantees CMS
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage comprehensive engineering service pages, technical capabilities, process workflows, FAQs, and guarantees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => {
              setEditingServiceId(null);
              setServiceForm(EMPTY_SERVICE);
              setEditorSubTab("basics");
              setShowForm(!showForm || editingServiceId !== null);
            }}
            className="flex items-center gap-2 bg-construction-navy hover:bg-blue-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add {activeTab === "services" ? "Service" : "Guarantee"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => {
            setActiveTab("services");
            setShowForm(false);
            setError("");
          }}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "services"
              ? "border-construction-red text-construction-red"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Core Engineering Services ({services.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("guarantees");
            setShowForm(false);
            setError("");
          }}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "guarantees"
              ? "border-construction-red text-construction-red"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Company Guarantees ({guarantees.length})
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ENTERPRISE SERVICE CMS EDITOR */}
      {showForm && activeTab === "services" && (
        <div className="bg-white border-2 border-construction-navy shadow-lg overflow-hidden transition-all animate-fadeIn">
          {/* Editor Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-construction-red text-white">
                  {editingServiceId ? "Editing Service" : "New Service"}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {serviceForm.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {serviceForm.title || "Untitled Service"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {editingServiceId && serviceForm.title && (
                <a
                  href={`/services/${getServiceSlug(serviceForm.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Live Page
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingServiceId(null);
                  setServiceForm(EMPTY_SERVICE);
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleServiceSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-construction-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor Navigation Sub-Tabs */}
          <div className="bg-slate-100 border-b border-slate-200 px-6 flex flex-wrap gap-1">
            {[
              { id: "basics", label: "Hero & Core Info", icon: Building2 },
              { id: "overview", label: "Overview & Capabilities", icon: Layers },
              { id: "typologies", label: "Typologies & Stages", icon: Sliders },
              { id: "deliverables", label: "Deliverables & Why Us", icon: ShieldCheck },
              { id: "faqs", label: "FAQs & SEO Metadata", icon: Globe },
            ].map((sub) => {
              const Icon = sub.icon;
              const isActive = editorSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setEditorSubTab(sub.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${
                    isActive
                      ? "border-construction-navy text-construction-navy bg-white shadow-sm"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-construction-navy" : "text-slate-500"}`} />
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <form onSubmit={handleServiceSubmit} className="p-6 md:p-8 space-y-6">
            {/* SUB-TAB 1: HERO & CORE INFO */}
            {editorSubTab === "basics" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50/70 border border-blue-200 p-4 text-xs text-blue-900 leading-relaxed">
                  <strong>Service Directory & Hero Configuration:</strong> Configure foundational service properties. The Title, Category, Icon, and Short Description drive service cards on the homepage and services directory, while the Hero Badge and Tagline lead the individual service landing page.
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                      Service Title *
                    </label>
                    <input
                      required
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Architecture & Planning"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                      Category *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                      Hero Badge (Pre-heading pill)
                    </label>
                    <input
                      value={serviceForm.badge}
                      onChange={(e) => setServiceForm((p) => ({ ...p, badge: e.target.value }))}
                      placeholder="e.g. Architectural & Civil Planning"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                      Display Order & Status
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="1"
                          required
                          value={serviceForm.order ?? 1}
                          onChange={(e) =>
                            setServiceForm((p) => ({
                              ...p,
                              order: e.target.value === "" ? 1 : parseInt(e.target.value) || 1
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 select-none bg-slate-100 border border-slate-300 px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={serviceForm.active}
                          onChange={(e) => setServiceForm((p) => ({ ...p, active: e.target.checked }))}
                          className="w-4 h-4 text-construction-navy focus:ring-0 rounded"
                        />
                        <span>Active on Website</span>
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                      Hero Tagline (High-impact banner subtitle)
                    </label>
                    <input
                      value={serviceForm.tagline}
                      onChange={(e) => setServiceForm((p) => ({ ...p, tagline: e.target.value }))}
                      placeholder="e.g. From plot measurement and structural RCC design to complete 3D architectural perspectives..."
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                      Short Summary / Card Description *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Brief 1-2 sentence description shown on overview cards..."
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none transition-all"
                    />
                  </div>

                  {/* Icon Picker */}
                  <div className="md:col-span-2">
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                      Icon Name (Lucide Icon)
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="relative flex-1 w-full">
                        <input
                          required
                          value={serviceForm.icon}
                          onChange={(e) => setServiceForm((p) => ({ ...p, icon: e.target.value }))}
                          placeholder="e.g. HardHat, Compass, Ruler"
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 pl-4 pr-11 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-200 border border-slate-300 flex items-center justify-center text-construction-navy pointer-events-none shadow-sm">
                          <DynamicIcon name={serviceForm.icon || "HelpCircle"} className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">Quick Pick:</span>
                        {SUGGESTED_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setServiceForm((p) => ({ ...p, icon: iconName }))}
                            className={`px-2 py-1 text-xs flex items-center gap-1 border transition-colors ${
                              serviceForm.icon === iconName
                                ? "bg-construction-navy text-white border-construction-navy"
                                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            <DynamicIcon name={iconName} className="w-3 h-3" />
                            <span>{iconName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="md:col-span-2">
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                      Cover / Hero Image
                    </label>
                    <ImageUpload
                      value={serviceForm.image}
                      onChange={(url) => setServiceForm((p) => ({ ...p, image: url }))}
                    />
                  </div>

                  {/* Simple Features (Card Highlights) */}
                  <div className="md:col-span-2">
                    <label className="text-slate-700 text-xs uppercase tracking-wider block mb-1 font-bold">
                      Key Highlights for Homepage Cards (One item per line)
                    </label>
                    <textarea
                      rows={3}
                      value={serviceForm.features ? serviceForm.features.join("\n") : ""}
                      onChange={(e) =>
                        setServiceForm((p) => ({
                          ...p,
                          features: e.target.value.split("\n").filter((f) => f.trim() !== "")
                        }))
                      }
                      placeholder="e.g. Master Site Planning & 3D Modeling&#10;Structural Engineering Analysis&#10;Regulatory Approvals & Blueprinting"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: OVERVIEW & CAPABILITIES */}
            {editorSubTab === "overview" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-blue-50/70 border border-blue-200 p-4 text-xs text-blue-900 leading-relaxed">
                  <strong>Technical Scope & Pillar Capabilities:</strong> The overview section provides an in-depth engineering summary of what HiPRO delivers in Rajasthan. Below that, 3 core capabilities break down specific technical pillars with detailed explanations and actionable bullet points.
                </div>

                {/* Overview Paragraphs */}
                <div className="space-y-4 border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-slate-800 text-xs uppercase tracking-wider block font-bold">
                        Overview Section Heading
                      </label>
                      <input
                        value={serviceForm.overviewHeading}
                        onChange={(e) => setServiceForm((p) => ({ ...p, overviewHeading: e.target.value }))}
                        placeholder="e.g. Engineering Overview & Technical Scope"
                        className="mt-1 w-full max-w-lg bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-construction-navy"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setServiceForm((p) => ({
                          ...p,
                          overviewParagraphs: [...p.overviewParagraphs, ""]
                        }))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-construction-navy text-white text-xs font-semibold hover:bg-blue-900 self-start"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Paragraph
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {serviceForm.overviewParagraphs.map((para, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <span className="text-xs font-mono font-bold text-slate-400 mt-2.5 w-6 text-right">
                          P{idx + 1}
                        </span>
                        <textarea
                          rows={3}
                          value={para}
                          onChange={(e) => {
                            const newParas = [...serviceForm.overviewParagraphs];
                            newParas[idx] = e.target.value;
                            setServiceForm((p) => ({ ...p, overviewParagraphs: newParas }));
                          }}
                          placeholder={`Enter paragraph ${idx + 1}...`}
                          className="flex-1 bg-white border border-slate-300 text-slate-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-y"
                        />
                        {serviceForm.overviewParagraphs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newParas = serviceForm.overviewParagraphs.filter((_, i) => i !== idx);
                              setServiceForm((p) => ({ ...p, overviewParagraphs: newParas }));
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                            title="Remove Paragraph"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Capabilities */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Core Technical Capabilities (3 Pillars)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Detailed breakdown cards with technical scope and itemized engineering bullet points.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setServiceForm((p) => ({
                          ...p,
                          detailedCapabilities: [
                            ...p.detailedCapabilities,
                            { title: "", description: "", points: [""] }
                          ]
                        }))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-construction-navy text-white text-xs font-semibold hover:bg-blue-900"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Capability
                    </button>
                  </div>

                  <div className="space-y-4">
                    {serviceForm.detailedCapabilities.map((cap, capIdx) => (
                      <div key={capIdx} className="bg-slate-50 border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-construction-navy flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" /> Capability #{capIdx + 1}
                          </span>
                          {serviceForm.detailedCapabilities.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newCaps = serviceForm.detailedCapabilities.filter((_, i) => i !== capIdx);
                                setServiceForm((p) => ({ ...p, detailedCapabilities: newCaps }));
                              }}
                              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-1 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                              Capability Title *
                            </label>
                            <input
                              required
                              value={cap.title}
                              onChange={(e) => {
                                const newCaps = [...serviceForm.detailedCapabilities];
                                newCaps[capIdx].title = e.target.value;
                                setServiceForm((p) => ({ ...p, detailedCapabilities: newCaps }));
                              }}
                              placeholder="e.g. Master Site Planning & 3D Spatial Modeling"
                              className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-construction-navy"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                              Technical Description *
                            </label>
                            <textarea
                              required
                              rows={2}
                              value={cap.description}
                              onChange={(e) => {
                                const newCaps = [...serviceForm.detailedCapabilities];
                                newCaps[capIdx].description = e.target.value;
                                setServiceForm((p) => ({ ...p, detailedCapabilities: newCaps }));
                              }}
                              placeholder="Describe engineering methodology and deliverables for this capability..."
                              className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:border-construction-navy resize-y"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                              Engineering Deliverable Points (One per line)
                            </label>
                            <textarea
                              rows={3}
                              value={cap.points ? cap.points.join("\n") : ""}
                              onChange={(e) => {
                                const newCaps = [...serviceForm.detailedCapabilities];
                                newCaps[capIdx].points = e.target.value.split("\n").filter((pt) => pt.trim() !== "");
                                setServiceForm((p) => ({ ...p, detailedCapabilities: newCaps }));
                              }}
                              placeholder="Micro-climate analysis optimizing natural airflow&#10;Functional space zoning separating private & social areas&#10;Photorealistic 3D elevations visualizing materials"
                              className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono focus:outline-none focus:border-construction-navy resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: TYPOLOGIES & PROCESS STAGES */}
            {editorSubTab === "typologies" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-blue-50/70 border border-blue-200 p-4 text-xs text-blue-900 leading-relaxed">
                  <strong>Typologies & Process Stages:</strong> Define the project sectors or building categories this service addresses (e.g. Residential, Commercial, Industrial), alongside the sequential 5-step engineering execution workflow.
                </div>

                {/* Applications / Typologies */}
                <div className="space-y-4 border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-slate-800 text-xs uppercase tracking-wider block font-bold">
                        Typologies Section Heading
                      </label>
                      <input
                        value={serviceForm.applicationsHeading}
                        onChange={(e) => setServiceForm((p) => ({ ...p, applicationsHeading: e.target.value }))}
                        placeholder="e.g. Project Types We Plan"
                        className="mt-1 w-full max-w-lg bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-construction-navy"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setServiceForm((p) => ({
                          ...p,
                          applications: [...p.applications, { title: "", description: "" }]
                        }))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-construction-navy text-white text-xs font-semibold hover:bg-blue-900 self-start"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Sector / Typology
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3 pt-2">
                    {serviceForm.applications.map((app, appIdx) => (
                      <div key={appIdx} className="bg-white border border-slate-300 p-4 space-y-2 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const newApps = serviceForm.applications.filter((_, i) => i !== appIdx);
                            setServiceForm((p) => ({ ...p, applications: newApps }));
                          }}
                          className="absolute right-2 top-2 text-slate-300 hover:text-red-600 transition-colors"
                          title="Remove Typology"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <input
                          value={app.title}
                          onChange={(e) => {
                            const newApps = [...serviceForm.applications];
                            newApps[appIdx].title = e.target.value;
                            setServiceForm((p) => ({ ...p, applications: newApps }));
                          }}
                          placeholder="e.g. Residential Homes & Villas"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-construction-navy"
                        />
                        <textarea
                          rows={3}
                          value={app.description}
                          onChange={(e) => {
                            const newApps = [...serviceForm.applications];
                            newApps[appIdx].description = e.target.value;
                            setServiceForm((p) => ({ ...p, applications: newApps }));
                          }}
                          placeholder="Description of utility and planning..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2 text-xs focus:outline-none focus:border-construction-navy resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sequential Process Stages */}
                <div className="space-y-4 border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-slate-800 text-xs uppercase tracking-wider block font-bold">
                        Process Workflow Section Heading
                      </label>
                      <input
                        value={serviceForm.stagesHeading}
                        onChange={(e) => setServiceForm((p) => ({ ...p, stagesHeading: e.target.value }))}
                        placeholder="e.g. Coordinated Planning Stages"
                        className="mt-1 w-full max-w-lg bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-construction-navy"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const stepNum = String(serviceForm.stages.length + 1).padStart(2, "0");
                        setServiceForm((p) => ({
                          ...p,
                          stages: [...p.stages, { step: stepNum, title: "", description: "" }]
                        }))
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-construction-navy text-white text-xs font-semibold hover:bg-blue-900 self-start"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Process Stage
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {serviceForm.stages.map((stg, stgIdx) => (
                      <div key={stgIdx} className="bg-white border border-slate-300 p-4 flex flex-col md:flex-row gap-3 items-start">
                        <div className="w-16 shrink-0">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                            Step
                          </label>
                          <input
                            value={stg.step}
                            onChange={(e) => {
                              const newStages = [...serviceForm.stages];
                              newStages[stgIdx].step = e.target.value;
                              setServiceForm((p) => ({ ...p, stages: newStages }));
                            }}
                            className="w-full bg-slate-100 border border-slate-200 text-center font-mono font-bold text-slate-800 px-2 py-1.5 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex-1 space-y-2 w-full">
                          <input
                            value={stg.title}
                            onChange={(e) => {
                              const newStages = [...serviceForm.stages];
                              newStages[stgIdx].title = e.target.value;
                              setServiceForm((p) => ({ ...p, stages: newStages }));
                            }}
                            placeholder="Stage Title (e.g. Site Assessment & Spatial Brief)"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-construction-navy"
                          />
                          <textarea
                            rows={2}
                            value={stg.description}
                            onChange={(e) => {
                              const newStages = [...serviceForm.stages];
                              newStages[stgIdx].description = e.target.value;
                              setServiceForm((p) => ({ ...p, stages: newStages }));
                            }}
                            placeholder="Detailed activities performed during this stage..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2 text-xs focus:outline-none focus:border-construction-navy resize-none"
                          />
                        </div>

                        {serviceForm.stages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newStages = serviceForm.stages.filter((_, i) => i !== stgIdx);
                              setServiceForm((p) => ({ ...p, stages: newStages }));
                            }}
                            className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 transition-colors"
                            title="Delete Stage"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: DELIVERABLES & WHY CHOOSE & RATES */}
            {editorSubTab === "deliverables" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-blue-50/70 border border-blue-200 p-4 text-xs text-blue-900 leading-relaxed">
                  <strong>Handover Deliverables & Value Propositions:</strong> Specify the tangible documentation and items the client receives at project completion, along with HiPRO&apos;s distinctive competitive advantages in Rajasthan.
                </div>

                {/* Confirmed Handover Deliverables */}
                <div className="space-y-4 border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-slate-800 text-xs uppercase tracking-wider block font-bold">
                        Deliverables Section Heading
                      </label>
                      <input
                        value={serviceForm.deliverablesHeading}
                        onChange={(e) => setServiceForm((p) => ({ ...p, deliverablesHeading: e.target.value }))}
                        placeholder="e.g. Confirmed Planning Deliverables"
                        className="mt-1 w-full max-w-lg bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-construction-navy"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setServiceForm((p) => ({
                          ...p,
                          deliverables: [...p.deliverables, ""]
                        }))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-construction-navy text-white text-xs font-semibold hover:bg-blue-900 self-start"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Deliverable Item
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 pt-2">
                    {serviceForm.deliverables.map((deliv, delivIdx) => (
                      <div key={delivIdx} className="flex items-center gap-2 bg-white border border-slate-300 p-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <input
                          value={deliv}
                          onChange={(e) => {
                            const newDelivs = [...serviceForm.deliverables];
                            newDelivs[delivIdx] = e.target.value;
                            setServiceForm((p) => ({ ...p, deliverables: newDelivs }));
                          }}
                          placeholder="e.g. Complete Structural RCC Working Drawings & Schedules"
                          className="flex-1 text-xs text-slate-800 font-medium focus:outline-none"
                        />
                        {serviceForm.deliverables.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newDelivs = serviceForm.deliverables.filter((_, i) => i !== delivIdx);
                              setServiceForm((p) => ({ ...p, deliverables: newDelivs }));
                            }}
                            className="text-slate-300 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why Choose HiPRO Points */}
                <div className="space-y-4 border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-slate-800 text-xs uppercase tracking-wider block font-bold">
                        Why Choose Us Section Heading
                      </label>
                      <input
                        value={serviceForm.whyChooseHeading}
                        onChange={(e) => setServiceForm((p) => ({ ...p, whyChooseHeading: e.target.value }))}
                        placeholder="e.g. Why HiPRO for Architectural Planning"
                        className="mt-1 w-full max-w-lg bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-construction-navy"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setServiceForm((p) => ({
                          ...p,
                          whyChoosePoints: [...p.whyChoosePoints, { title: "", description: "" }]
                        }))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-construction-navy text-white text-xs font-semibold hover:bg-blue-900 self-start"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Value Proposition
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3 pt-2">
                    {serviceForm.whyChoosePoints.map((wc, wcIdx) => (
                      <div key={wcIdx} className="bg-white border border-slate-300 p-4 space-y-2 relative">
                        {serviceForm.whyChoosePoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPoints = serviceForm.whyChoosePoints.filter((_, i) => i !== wcIdx);
                              setServiceForm((p) => ({ ...p, whyChoosePoints: newPoints }));
                            }}
                            className="absolute right-2 top-2 text-slate-300 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <input
                          value={wc.title}
                          onChange={(e) => {
                            const newPoints = [...serviceForm.whyChoosePoints];
                            newPoints[wcIdx].title = e.target.value;
                            setServiceForm((p) => ({ ...p, whyChoosePoints: newPoints }));
                          }}
                          placeholder="e.g. Seamless Design-to-Construction Handoff"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-construction-navy"
                        />
                        <textarea
                          rows={3}
                          value={wc.description}
                          onChange={(e) => {
                            const newPoints = [...serviceForm.whyChoosePoints];
                            newPoints[wcIdx].description = e.target.value;
                            setServiceForm((p) => ({ ...p, whyChoosePoints: newPoints }));
                          }}
                          placeholder="Detailed explanation of this advantage..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2 text-xs focus:outline-none focus:border-construction-navy resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Indicative Rates Notice */}
                <div className="border border-slate-200 bg-slate-50/60 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Indicative Rates Notice Box (Optional)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Display an engineering cost guidance table (e.g. turnkey civil construction rates in Rajasthan).
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 bg-white border border-slate-300 px-3 py-1.5 shadow-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(serviceForm.indicativeRatesNotice)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setServiceForm((p) => ({
                              ...p,
                              indicativeRatesNotice: {
                                heading: "Indicative Civil Construction Rates in Rajasthan",
                                description: "All rates are calculated based on built-up area and specification levels. Final quotations depend on structural soil reports and customized architectural requirements.",
                                tiers: [
                                  { name: "Basic Residential Package", rate: "₹1,450 – ₹1,650 / sq.ft", highlight: "Standard RCC Frame & Brickwork" },
                                  { name: "Premium Commercial / Luxury", rate: "₹1,850 – ₹2,400+ / sq.ft", highlight: "High-spec Finish & Granite" },
                                ]
                              }
                            }));
                          } else {
                            setServiceForm((p) => ({ ...p, indicativeRatesNotice: null }));
                          }
                        }}
                        className="w-4 h-4 text-construction-navy"
                      />
                      <span>Enable Rates Box</span>
                    </label>
                  </div>

                  {serviceForm.indicativeRatesNotice && (
                    <div className="bg-white border border-amber-200 p-4 space-y-3 pt-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 uppercase">Rates Box Heading</label>
                          <input
                            value={serviceForm.indicativeRatesNotice.heading}
                            onChange={(e) =>
                              setServiceForm((p) => ({
                                ...p,
                                indicativeRatesNotice: {
                                  ...p.indicativeRatesNotice!,
                                  heading: e.target.value
                                }
                              }))
                            }
                            className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 text-xs font-bold mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 uppercase">Disclaimer / Note</label>
                          <input
                            value={serviceForm.indicativeRatesNotice.description}
                            onChange={(e) =>
                              setServiceForm((p) => ({
                                ...p,
                                indicativeRatesNotice: {
                                  ...p.indicativeRatesNotice!,
                                  description: e.target.value
                                }
                              }))
                            }
                            className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Specification Tiers</label>
                        {serviceForm.indicativeRatesNotice.tiers.map((tier, tIdx) => (
                          <div key={tIdx} className="flex gap-2 items-center bg-slate-50 border border-slate-200 p-2">
                            <input
                              value={tier.name}
                              onChange={(e) => {
                                const newTiers = [...serviceForm.indicativeRatesNotice!.tiers];
                                newTiers[tIdx].name = e.target.value;
                                setServiceForm((p) => ({
                                  ...p,
                                  indicativeRatesNotice: { ...p.indicativeRatesNotice!, tiers: newTiers }
                                }));
                              }}
                              placeholder="Tier Name (e.g. Standard)"
                              className="flex-1 text-xs bg-white border border-slate-300 px-2 py-1 font-bold"
                            />
                            <input
                              value={tier.rate}
                              onChange={(e) => {
                                const newTiers = [...serviceForm.indicativeRatesNotice!.tiers];
                                newTiers[tIdx].rate = e.target.value;
                                setServiceForm((p) => ({
                                  ...p,
                                  indicativeRatesNotice: { ...p.indicativeRatesNotice!, tiers: newTiers }
                                }));
                              }}
                              placeholder="Rate (e.g. ₹1,450 / sq.ft)"
                              className="w-48 text-xs bg-white border border-slate-300 px-2 py-1 font-mono"
                            />
                            <input
                              value={tier.highlight}
                              onChange={(e) => {
                                const newTiers = [...serviceForm.indicativeRatesNotice!.tiers];
                                newTiers[tIdx].highlight = e.target.value;
                                setServiceForm((p) => ({
                                  ...p,
                                  indicativeRatesNotice: { ...p.indicativeRatesNotice!, tiers: newTiers }
                                }));
                              }}
                              placeholder="Key Highlight"
                              className="flex-1 text-xs bg-white border border-slate-300 px-2 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newTiers = serviceForm.indicativeRatesNotice!.tiers.filter((_, i) => i !== tIdx);
                                setServiceForm((p) => ({
                                  ...p,
                                  indicativeRatesNotice: { ...p.indicativeRatesNotice!, tiers: newTiers }
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setServiceForm((p) => ({
                              ...p,
                              indicativeRatesNotice: {
                                ...p.indicativeRatesNotice!,
                                tiers: [
                                  ...p.indicativeRatesNotice!.tiers,
                                  { name: "New Tier", rate: "₹1,500 / sq.ft", highlight: "Specification details" }
                                ]
                              }
                            }));
                          }}
                          className="text-xs text-construction-navy font-bold hover:underline flex items-center gap-1 mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Tier
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 5: FAQS & SEO METADATA */}
            {editorSubTab === "faqs" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-blue-50/70 border border-blue-200 p-4 text-xs text-blue-900 leading-relaxed">
                  <strong>Interactive FAQs & SEO Optimization:</strong> The FAQs are automatically integrated with Google Schema.org FAQPage structured data to power rich snippets on Google Search. Meta Title & Description drive the SERP snippet.
                </div>

                {/* FAQ Builder */}
                <div className="space-y-4 border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-slate-900 text-xs uppercase tracking-wider font-bold">
                        Frequently Asked Questions (Schema.org Integrated)
                      </h3>
                      <p className="text-slate-500 text-xs">
                        Add specific, high-intent questions property owners ask about this service.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setServiceForm((p) => ({
                          ...p,
                          faqs: [...p.faqs, { question: "", answer: "" }]
                        }))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-construction-navy text-white text-xs font-semibold hover:bg-blue-900 self-start"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {serviceForm.faqs.map((faq, faqIdx) => (
                      <div key={faqIdx} className="bg-white border border-slate-300 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-construction-navy uppercase tracking-wider">
                            Q#{faqIdx + 1}
                          </span>
                          {serviceForm.faqs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newFaqs = serviceForm.faqs.filter((_, i) => i !== faqIdx);
                                setServiceForm((p) => ({ ...p, faqs: newFaqs }));
                              }}
                              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          )}
                        </div>

                        <input
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...serviceForm.faqs];
                            newFaqs[faqIdx].question = e.target.value;
                            setServiceForm((p) => ({ ...p, faqs: newFaqs }));
                          }}
                          placeholder="Question: e.g. What drawings are included in an architectural planning package?"
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-bold focus:outline-none focus:border-construction-navy"
                        />

                        <textarea
                          rows={3}
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...serviceForm.faqs];
                            newFaqs[faqIdx].answer = e.target.value;
                            setServiceForm((p) => ({ ...p, faqs: newFaqs }));
                          }}
                          placeholder="Comprehensive, informative answer grounded in verified facts..."
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 text-xs focus:outline-none focus:border-construction-navy resize-y"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEO Metadata & SERP Snippet Preview */}
                <div className="space-y-5 border border-slate-200 bg-slate-50/60 p-5">
                  <h3 className="text-slate-900 text-xs uppercase tracking-wider font-bold">
                    Search Engine Optimization (SEO) & Google SERP Preview
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-slate-700 text-xs uppercase tracking-wider font-bold">
                          Meta Title Tag
                        </label>
                        <span className={`text-[11px] font-mono ${
                          serviceForm.metaTitle.length > 60 ? "text-amber-600 font-bold" : "text-slate-400"
                        }`}>
                          {serviceForm.metaTitle.length} / 60 chars
                        </span>
                      </div>
                      <input
                        value={serviceForm.metaTitle}
                        onChange={(e) => setServiceForm((p) => ({ ...p, metaTitle: e.target.value }))}
                        placeholder="e.g. Architectural Planning & 3D Design in Bhilwara | HiPRO"
                        className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:border-construction-navy"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-slate-700 text-xs uppercase tracking-wider font-bold">
                          Meta Description
                        </label>
                        <span className={`text-[11px] font-mono ${
                          serviceForm.metaDescription.length > 160 ? "text-amber-600 font-bold" : "text-slate-400"
                        }`}>
                          {serviceForm.metaDescription.length} / 160 chars
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={serviceForm.metaDescription}
                        onChange={(e) => setServiceForm((p) => ({ ...p, metaDescription: e.target.value }))}
                        placeholder="e.g. Professional architectural planning and structural RCC drawings in Bhilwara, Rajasthan..."
                        className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2 text-xs focus:outline-none focus:border-construction-navy resize-none"
                      />
                    </div>
                  </div>

                  {/* Google SERP Card Mockup */}
                  <div className="bg-white border border-slate-300 p-4 rounded max-w-2xl shadow-sm">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-bold tracking-wider">
                      Google Search Result Snippet Preview
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                      <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-construction-navy">
                        H
                      </div>
                      <span>hindustanprojects.com › services › {getServiceSlug(serviceForm.title || "service")}</span>
                    </div>
                    <div className="text-base text-blue-800 hover:underline font-medium cursor-pointer leading-snug">
                      {serviceForm.metaTitle || `${serviceForm.title || "Service"} | Hindustan Projects (HiPRO)`}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {serviceForm.metaDescription || serviceForm.description || "Learn about Hindustan Projects comprehensive engineering and construction services in Bhilwara, Rajasthan."}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Footer Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                {editingServiceId ? (
                  <span>
                    Editing ID: <code className="font-mono text-slate-800">{editingServiceId}</code>
                  </span>
                ) : (
                  <span>Creating new service record</span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingServiceId(null);
                    setServiceForm(EMPTY_SERVICE);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-2.5 bg-construction-navy hover:bg-blue-900 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Save Service
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* GUARANTEE FORM */}
      {showForm && activeTab === "guarantees" && (
        <form onSubmit={handleGuaranteeSubmit} className="bg-white border-2 border-construction-navy shadow-sm p-6 space-y-4">
          <h3 className="text-slate-900 font-bold text-lg">New Company Guarantee</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {(["title", "badge", "bg", "accent"] as const).map((field) => (
              <div key={field}>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">{field}</label>
                <input
                  required
                  value={guaranteeForm[field as keyof typeof guaranteeForm] as string}
                  onChange={(e) => setGuaranteeForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                />
              </div>
            ))}
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Has Shield Icon</label>
              <select
                value={guaranteeForm.hasShield ? "yes" : "no"}
                onChange={(e) => setGuaranteeForm((p) => ({ ...p, hasShield: e.target.value === "yes" }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Order Index</label>
              <input
                type="number"
                min="1"
                required
                value={guaranteeForm.order ?? 1}
                onChange={(e) =>
                  setGuaranteeForm((p) => ({
                    ...p,
                    order: e.target.value === "" ? 1 : parseInt(e.target.value) || 1
                  }))
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Image</label>
              <ImageUpload
                value={guaranteeForm.image}
                onChange={(url) => setGuaranteeForm((p) => ({ ...p, image: url }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Description</label>
              <textarea
                required
                rows={3}
                value={guaranteeForm.description}
                onChange={(e) => setGuaranteeForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Save Guarantee
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-white border border-slate-200 text-slate-600 px-6 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* SEARCH BAR & SUMMARY */}
      {activeTab === "services" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter services by keyword..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-construction-navy"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Showing {filteredServices.length} of {services.length} services
          </div>
        </div>
      )}

      {/* SERVICES / GUARANTEES TABLES */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "services" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="text-left px-5 py-3.5">Service & Scope</th>
                  <th className="text-left px-5 py-3.5">Category</th>
                  <th className="text-left px-5 py-3.5">Icon</th>
                  <th className="text-left px-5 py-3.5">Order</th>
                  <th className="text-left px-5 py-3.5">Status</th>
                  <th className="text-right px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="h-10 bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-500 py-16">
                      {searchQuery ? "No services match your search filter." : "No services yet."}
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((s) => {
                    const slug = getServiceSlug(s.title);
                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors ${
                          s.active === false ? "opacity-60 bg-slate-50/50" : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-construction-navy">
                              <DynamicIcon name={s.icon || "Building2"} className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-slate-900 font-bold leading-snug">{s.title}</p>
                              {s.badge && (
                                <span className="inline-block text-[10px] text-slate-500 font-medium">
                                  {s.badge}
                                </span>
                              )}
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                /services/{slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-800 font-medium">
                            {s.category || "Design & Planning"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono">
                            <DynamicIcon name={s.icon} className="w-3 h-3 text-construction-navy" />
                            <span>{s.icon}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-700 font-bold whitespace-nowrap">
                          #{s.order}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleActive("services", s)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold ${
                              s.active !== false
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                          >
                            {s.active !== false ? (
                              <>
                                <Eye className="w-3 h-3" /> Published
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" /> Draft / Hidden
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`/services/${slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-colors"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => startEditService(s)}
                              className="px-3 h-8 bg-construction-navy hover:bg-blue-900 text-white flex items-center gap-1 text-xs font-bold transition-colors shadow-sm"
                              title="Edit Comprehensive Content"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit CMS
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem("services", s.id as string)}
                              className="w-8 h-8 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors"
                              title="Delete Service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="text-left px-5 py-3.5">Guarantee</th>
                  <th className="text-left px-5 py-3.5">Badge</th>
                  <th className="text-left px-5 py-3.5">Order</th>
                  <th className="text-left px-5 py-3.5">Active</th>
                  <th className="text-right px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-5 py-4">
                        <div className="h-10 bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : guarantees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500 py-16">
                      No guarantees yet.
                    </td>
                  </tr>
                ) : (
                  guarantees.map((g) => (
                    <tr
                      key={g.id}
                      className={`transition-colors ${
                        g.active === false ? "opacity-50 bg-slate-50/50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="text-slate-900 font-semibold">{g.title}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-slate-100 px-2 py-1">{g.badge}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">#{g.order}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => toggleActive("guarantees", g)}
                          className={`w-8 h-8 flex items-center justify-center ${
                            g.active !== false ? "bg-green-100 text-green-700" : "bg-slate-50 text-slate-400"
                          }`}
                        >
                          {g.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => deleteItem("guarantees", g.id as string)}
                          className="w-8 h-8 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold flex items-center justify-between">
          <span>{activeTab === "services" ? `${services.length} registered services` : `${guarantees.length} registered guarantees`}</span>
          <span className="text-slate-400 font-mono text-[11px]">Hindustan Projects CMS</span>
        </div>
      </div>
    </div>
  );
}
