"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Scale,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Award,
  FileText,
  Clock,
  HardHat,
  HelpCircle,
  Workflow,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";

interface ComparisonRow {
  feature: string;
  hindBuild: string;
  local: string;
}

interface PillarItem {
  title: string;
  desc: string;
  tag: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface ProtocolStage {
  step: string;
  title: string;
  desc: string;
}

const DEFAULT_COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Diagnostic Methodology",
    hindBuild: "Non-destructive digital moisture meters, pipe pressure testers & rebar scanners before any chiseling.",
    local: "Blind guesswork, random wall chipping, and superficial plastering that misses the water pathway.",
  },
  {
    feature: "Engineering Supervision",
    hindBuild: "Qualified civil engineering graduates and senior HiPRO supervisors dedicated on-site daily.",
    local: "Unsupervised daily-wage masons with zero formal civil engineering training or quality checks.",
  },
  {
    feature: "Chemicals & Materials",
    hindBuild: "100% factory-sealed, batch-coded industrial systems (Dr. Fixit, Fosroc, Sika, Asian Paints).",
    local: "Diluted, repackaged, or expired chemical mixes purchased from unverified local retail outlets.",
  },
  {
    feature: "Cost Transparency & BOQ",
    hindBuild: "Itemized digital BOQ with exact square-footage, chemical specifications, and zero surprise add-ons.",
    local: "Rough verbal lump-sum estimates that escalate by 50%–80% once halfway through execution.",
  },
  {
    feature: "Warranty & Accountability",
    hindBuild: "Formal written warranty certificate with post-execution 48-hour flood testing and handover sign-off.",
    local: "Oral assurances with zero legal liability; unreachable when seepage recurs during next monsoon.",
  },
  {
    feature: "Service Spectrum",
    hindBuild: "Single-window coordination for 19 specialized structural, waterproofing, electrical & civil trades.",
    local: "Homeowner forced to coordinate 5 conflicting contractors with zero accountability between them.",
  },
];

const DEFAULT_PILLARS: PillarItem[] = [
  {
    title: "HiPRO Civil Heritage & Governance",
    desc: "Backed by Hindustan Projects (HiPRO), bringing large-scale industrial civil rigor to residential, commercial, and institutional facility maintenance.",
    tag: "Parent Governance",
  },
  {
    title: "Non-Destructive Diagnostic Protocol",
    desc: "We pinpoint hydrostatic pressure vectors, capillary rising dampness, and pipe faults with electronic scanners before recommending a single rupee of civil intervention.",
    tag: "NDT Diagnostics",
  },
  {
    title: "Certified Chemical Applicators",
    desc: "Our applicators undergo manufacturer-certified training for polyurethane elastomeric coatings, polymer-modified mortars, and structural injection grouting.",
    tag: "Certified Craft",
  },
  {
    title: "100% Itemized Digital BOQ",
    desc: "Every quotation is transparently itemized with product brands, application thicknesses (DFT/WFT), surface measurements, and milestone schedules.",
    tag: "Zero Hidden Costs",
  },
  {
    title: "Written Multi-Year Warranties",
    desc: "We provide legally documented warranty certificates backed by thorough post-cure flood testing and thermal inspection audits.",
    tag: "Legal Security",
  },
  {
    title: "Rapid Turnaround Across Rajasthan",
    desc: "Mobile inspection engineers and rapid-deployment teams stationed in Bhilwara, Jaipur, Udaipur, Kota, and Ajmer for timely doorstep service.",
    tag: "Regional Presence",
  },
];

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: "How is Hind Build different from regular local contractors or mistris?",
    a: "Local contractors rely on visual guesswork and often plaster over active leaks, leading to recurring dampness within months. Hind Build operates under formal civil engineering standards: we utilize non-destructive moisture scanners to isolate root causes, deploy certified chemical systems from Sika, Fosroc, and Dr. Fixit, provide itemized line-item BOQs, and back our work with written warranty certificates.",
  },
  {
    q: "Do you provide a formal written warranty on repair and waterproofing works?",
    a: "Yes. Every completed waterproofing, structural rehabilitation, and chemical barrier project receives an official written Hind Build warranty certificate specifying the treated areas, application grades, and warranty duration (up to 10 years depending on the service tier).",
  },
  {
    q: "What happens during your free doorstep site inspection?",
    a: "A qualified Hind Build site engineer visits your property with electronic moisture meters and diagnostic tools. They conduct a comprehensive walk-through, identify moisture ingress sources or structural fissures, document measurements, and prepare an itemized digital estimate without any obligation to proceed.",
  },
  {
    q: "Can Hind Build handle large commercial and industrial buildings as well as homes?",
    a: "Absolutely. Hind Build manages residential villas, apartment societies, commercial office complexes, hospitals, and industrial warehouses across Rajasthan. Our parent company heritage (Hindustan Projects) equips us with the heavy machinery, safety scaffolding, and multi-trade workforce needed for large facilities.",
  },
  {
    q: "How does your itemized BOQ prevent unexpected cost overruns?",
    a: "Unlike local handymen who quote vague lump-sum amounts that balloon mid-project, our BOQ details exact surface area (sq. ft), chemical brands, coats applied, and labour rates upfront. You know your complete financial outlay before work commences, with zero hidden surprises.",
  },
  {
    q: "Can I hire Hind Build for multiple maintenance issues at once?",
    a: "Yes! That is one of our greatest advantages. With 19 specialized building trades—including waterproofing, structural concrete repair, painting, plumbing, electrical, termite treatment, and civil renovation—you deal with a single project manager and one unified billing source.",
  },
];

const DEFAULT_PROTOCOL: ProtocolStage[] = [
  {
    step: "01",
    title: "NDT Root-Cause Audit",
    desc: "Electronic moisture scanners and pressure sensors isolate exact infiltration vectors.",
  },
  {
    step: "02",
    title: "Itemized Digital BOQ",
    desc: "Line-item estimate specifying exact chemical grades, surface area, and milestones.",
  },
  {
    step: "03",
    title: "Mechanical Surface Prep",
    desc: "Rotary grinding, V-grooving, and sound substrate exposure before chemical application.",
  },
  {
    step: "04",
    title: "Engineered Application",
    desc: "Multi-tier chemical membranes applied to calibrated wet-film thickness (WFT).",
  },
  {
    step: "05",
    title: "Flood Test & Handover",
    desc: "Rigorous 48-hour ponding test followed by written warranty certificate delivery.",
  },
];

type ActiveTab = "comparison" | "pillars" | "protocol" | "faqs";

export default function HbsWhyChooseUsAdmin() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("comparison");
  const [comparisonRows, setComparisonRows] = useState<ComparisonRow[]>(DEFAULT_COMPARISON_ROWS);
  const [pillars, setPillars] = useState<PillarItem[]>(DEFAULT_PILLARS);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [protocol, setProtocol] = useState<ProtocolStage[]>(DEFAULT_PROTOCOL);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/content", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.whyChooseUs) {
          try {
            const parsed =
              typeof json.data.whyChooseUs === "string"
                ? JSON.parse(json.data.whyChooseUs)
                : json.data.whyChooseUs;
            if (parsed && typeof parsed === "object") {
              if (Array.isArray(parsed.comparisonRows) && parsed.comparisonRows.length > 0) {
                setComparisonRows(parsed.comparisonRows);
              }
              if (Array.isArray(parsed.pillars) && parsed.pillars.length > 0) {
                setPillars(parsed.pillars);
              }
              if (Array.isArray(parsed.faqs) && parsed.faqs.length > 0) {
                setFaqs(parsed.faqs);
              }
              if (Array.isArray(parsed.protocol) && parsed.protocol.length > 0) {
                setProtocol(parsed.protocol);
              }
            }
          } catch {}
        }
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

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const payload = {
        comparisonRows,
        pillars,
        faqs,
        protocol,
      };

      const res = await fetch("/api/hbs/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          whyChooseUs: JSON.stringify(payload),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ text: "Why Choose Us content updated successfully!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 4000);
      } else {
        setMessage({ text: json.error || "Failed to save content", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Comparison row helpers
  const updateComparisonRow = (idx: number, field: keyof ComparisonRow, val: string) => {
    setComparisonRows((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const addComparisonRow = () => {
    setComparisonRows((prev) => [
      ...prev,
      {
        feature: "New Evaluation Parameter",
        hindBuild: "Hind Build engineering approach & certified process.",
        local: "Common issues encountered with local handymen.",
      },
    ]);
  };

  const removeComparisonRow = (idx: number) => {
    if (comparisonRows.length <= 1) return;
    setComparisonRows((prev) => prev.filter((_, i) => i !== idx));
  };

  // Pillar helpers
  const updatePillar = (idx: number, field: keyof PillarItem, val: string) => {
    setPillars((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const addPillar = () => {
    setPillars((prev) => [
      ...prev,
      {
        title: "New Engineering Pillar",
        desc: "Description of structural capability and quality guarantee.",
        tag: "Certified",
      },
    ]);
  };

  const removePillar = (idx: number) => {
    if (pillars.length <= 1) return;
    setPillars((prev) => prev.filter((_, i) => i !== idx));
  };

  // FAQ helpers
  const updateFaq = (idx: number, field: keyof FaqItem, val: string) => {
    setFaqs((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const addFaq = () => {
    setFaqs((prev) => [
      ...prev,
      {
        q: "New Frequently Asked Question?",
        a: "Clear, factual answer explaining process, timeline, or warranty.",
      },
    ]);
  };

  const removeFaq = (idx: number) => {
    if (faqs.length <= 1) return;
    setFaqs((prev) => prev.filter((_, i) => i !== idx));
  };

  // Protocol helpers
  const updateProtocol = (idx: number, field: keyof ProtocolStage, val: string) => {
    setProtocol((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  return (
    <div className="space-y-7 max-w-6xl pb-16">
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Why Choose Us & FAQs" }]}
        title="Why Choose Us &amp; FAQs CMS"
        description="Update comparison matrix, 6 engineering pillars, 5-stage execution protocol, and client FAQs to ensure zero hardcoded or fake claims."
      >
        <Link
          href="/hbs/why-choose-us"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md bg-white/80 border border-white hover:bg-white rounded-xl shadow-2xs transition-all"
        >
          <span>View Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </HbsAdminPageHeader>

      {message.text && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 backdrop-blur-md text-xs font-medium border shadow-sm ${
            message.type === "success"
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
              : "bg-red-50/80 border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── GLASS TABS NAVIGATION ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 backdrop-blur-xl bg-white/70 border border-white/80 rounded-2xl shadow-sm">
        <button
          onClick={() => setActiveTab("comparison")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "comparison"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Comparison Matrix ({comparisonRows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pillars")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "pillars"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>6 Engineering Pillars ({pillars.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("protocol")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "protocol"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>5-Stage Protocol ({protocol.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "faqs"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Client FAQs ({faqs.length})</span>
        </button>
      </div>

      {/* ── TAB 1: COMPARISON MATRIX ─────────────────────────────────── */}
      {activeTab === "comparison" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Head-to-Head Comparison Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Hind Build engineering rigor vs. typical local contractor practices.
              </p>
            </div>
            <button
              type="button"
              onClick={addComparisonRow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parameter</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className="p-5 backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl shadow-lg shadow-slate-200/40 space-y-3.5 relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                      PARAMETER #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <input
                      type="text"
                      value={row.feature}
                      onChange={(e) => updateComparisonRow(idx, "feature", e.target.value)}
                      placeholder="Parameter title (e.g. Diagnostic Methodology)"
                      className="font-bold text-slate-900 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-red-600 focus:outline-none px-1 py-0.5"
                    />
                  </div>

                  {comparisonRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeComparisonRow(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                      aria-label="Remove parameter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hind Build advantage */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hind Build Advantage (HiPRO Standard)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={row.hindBuild}
                      onChange={(e) => updateComparisonRow(idx, "hindBuild", e.target.value)}
                      placeholder="Enter Hind Build standard..."
                      className="w-full text-xs p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800 leading-relaxed resize-none"
                    />
                  </div>

                  {/* Local contractor weakness */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <span>Local Contractor / Mistri Method</span>
                    </label>
                    <textarea
                      rows={3}
                      value={row.local}
                      onChange={(e) => updateComparisonRow(idx, "local", e.target.value)}
                      placeholder="Enter typical local contractor practice..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-600 leading-relaxed resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: SIX PILLARS ───────────────────────────────────────── */}
      {activeTab === "pillars" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Six Pillars of Hind Build Engineering
              </h2>
              <p className="text-xs text-slate-500">
                Core technical capabilities displayed on the Why Choose Us page.
              </p>
            </div>
            <button
              type="button"
              onClick={addPillar}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pillar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl shadow-lg shadow-slate-200/40 space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      PILLAR #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <input
                      type="text"
                      value={pillar.tag}
                      onChange={(e) => updatePillar(idx, "tag", e.target.value)}
                      placeholder="Badge Tag"
                      className="text-[10px] font-mono font-bold uppercase text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md focus:outline-none"
                    />
                  </div>

                  {pillars.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePillar(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                      aria-label="Remove pillar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Pillar Title
                  </label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => updatePillar(idx, "title", e.target.value)}
                    placeholder="Pillar title"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={pillar.desc}
                    onChange={(e) => updatePillar(idx, "desc", e.target.value)}
                    placeholder="Pillar details and specifications..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 text-slate-700 leading-relaxed resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: PROTOCOL STAGES ──────────────────────────────────── */}
      {activeTab === "protocol" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              5-Stage Execution Protocol
            </h2>
            <p className="text-xs text-slate-500">
              ISO/IS-compliant milestones from diagnosis to post-execution flood testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {protocol.map((stage, idx) => (
              <div
                key={idx}
                className="p-5 backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl shadow-lg shadow-slate-200/40 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-mono text-xl font-black text-red-600">
                    {stage.step}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                    PHASE #{idx + 1}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Phase Title
                  </label>
                  <input
                    type="text"
                    value={stage.title}
                    onChange={(e) => updateProtocol(idx, "title", e.target.value)}
                    className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Phase Description
                  </label>
                  <textarea
                    rows={3}
                    value={stage.desc}
                    onChange={(e) => updateProtocol(idx, "desc", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 resize-none text-slate-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: CLIENT FAQS ──────────────────────────────────────── */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Client Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-500">
                Clear answers for warranty, inspection charges, BOQ accuracy &amp; coverage.
              </p>
            </div>
            <button
              type="button"
              onClick={addFaq}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl shadow-lg shadow-slate-200/40 space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    QUESTION #{String(idx + 1).padStart(2, "0")}
                  </span>

                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                      aria-label="Remove FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Question
                  </label>
                  <input
                    type="text"
                    value={faq.q}
                    onChange={(e) => updateFaq(idx, "q", e.target.value)}
                    placeholder="Enter question..."
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Answer
                  </label>
                  <textarea
                    rows={3}
                    value={faq.a}
                    onChange={(e) => updateFaq(idx, "a", e.target.value)}
                    placeholder="Enter clear, transparent answer..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 text-slate-700 leading-relaxed resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
