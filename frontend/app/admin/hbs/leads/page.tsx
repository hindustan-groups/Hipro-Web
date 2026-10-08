"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  Inbox,
  RefreshCw,
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Eye,
  X,
  Filter,
  Download,
  User,
  DollarSign,
  Tag,
  Plus,
  Send,
  Clock,
  ShieldAlert,
  MapPin,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Building2,
  Check,
  AlertTriangle,
  Award,
  Layers,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Laptop,
  FolderKanban,
  ShieldCheck,
  ChevronDown,
  Activity,
  FileText,
  Sliders,
  MessageCircle,
} from "lucide-react";
import type { HbsLead, HbsInternalNote } from "@/lib/types";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";

const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "QUOTATION_SENT",
  "CONVERTED",
  "LOST",
  "SPAM",
] as const;

const LEAD_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const TRADE_SERVICES_LIST = [
  "Basement & Foundation Waterproofing",
  "Terrace & Roof Waterproofing",
  "Structural Repair & Rehabilitation",
  "Industrial Epoxy & PU Flooring",
  "Expansion & Construction Joints",
  "Concrete Crack Pressure Injection",
  "Heat Reflective Cool Roof Coating",
  "Facade Protection & Water Repellents",
  "Anti-Carbonation Protective Coating",
  "Wet Areas & Bathroom Sealing",
  "Retaining Wall & Podium Waterproofing",
  "Shotcrete & Guniting Works",
];

const PIPELINE_STAGES = [
  {
    id: "NEW",
    label: "New Inbound",
    subtitle: "Needs site callback",
    color: "amber",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    glow: "border-amber-400/50 bg-amber-500/5",
    accent: "#E08E00",
    nextStage: "CONTACTED",
    nextLabel: "Mark Contacted",
  },
  {
    id: "CONTACTED",
    label: "First Contact",
    subtitle: "Intro & scope audit",
    color: "blue",
    badge: "bg-blue-100 text-blue-900 border-blue-300",
    glow: "border-blue-400/50 bg-blue-500/5",
    accent: "#0D2D5E",
    nextStage: "FOLLOW_UP",
    nextLabel: "Schedule Visit",
  },
  {
    id: "FOLLOW_UP",
    label: "Site Inspection",
    subtitle: "Field audit / Follow-up",
    color: "purple",
    badge: "bg-purple-100 text-purple-900 border-purple-300",
    glow: "border-purple-400/50 bg-purple-500/5",
    accent: "#7C3AED",
    nextStage: "QUOTATION_SENT",
    nextLabel: "Send Quotation",
  },
  {
    id: "QUOTATION_SENT",
    label: "Quotation Sent",
    subtitle: "Proposal submitted",
    color: "indigo",
    badge: "bg-indigo-100 text-indigo-900 border-indigo-300",
    glow: "border-indigo-400/50 bg-indigo-500/5",
    accent: "#4F46E5",
    nextStage: "CONVERTED",
    nextLabel: "Mark Deal Won",
  },
  {
    id: "CONVERTED",
    label: "Won & Executed",
    subtitle: "Work order confirmed",
    color: "emerald",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
    glow: "border-emerald-400/50 bg-emerald-500/5",
    accent: "#059669",
    nextStage: null,
    nextLabel: null,
  },
];

const AVATAR_GRADIENTS = [
  "from-blue-600 to-indigo-700",
  "from-amber-600 to-orange-700",
  "from-emerald-600 to-teal-700",
  "from-purple-600 to-pink-700",
  "from-indigo-600 to-cyan-700",
  "from-rose-600 to-red-700",
];

const getInitials = (name?: string) => {
  if (!name) return "HB";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarGradient = (id?: string) => {
  if (!id) return AVATAR_GRADIENTS[0];
  const charCode = id.charCodeAt(id.length - 1) || 0;
  return AVATAR_GRADIENTS[charCode % AVATAR_GRADIENTS.length];
};

export default function HbsAdminLeads() {
  const [leads, setLeads] = useState<HbsLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount_desc" | "priority">("newest");
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");

  // macOS Window Controls state
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCollapsedWidgets, setIsCollapsedWidgets] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lead Detail Drawer / Inspector Modal
  const [viewingLead, setViewingLead] = useState<HbsLead | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"dossier" | "commercial" | "notes">("dossier");
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  // Edit fields
  const [editStatus, setEditStatus] = useState("NEW");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editQuotationAmount, setEditQuotationAmount] = useState<string>("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Create Inbound Lead Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "Bhilwara, Rajasthan",
    preferredContact: "Phone Call",
    selectedServices: [] as string[],
    priority: "HIGH",
    status: "NEW",
    assignedTo: "",
    quotationAmount: "",
    message: "",
    initialNote: "",
  });

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  // Keyboard shortcut: Cmd+K / Ctrl+K focuses Spotlight search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/leads", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setLeads(json.data);
        if (viewingLead) {
          const fresh = json.data.find((l: HbsLead) => l.id === viewingLead.id);
          if (fresh) {
            setViewingLead(fresh);
          }
        }
      } else {
        setMessage({ text: json.error || "Failed to load leads", type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to connect to backend API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLeadModal = (lead: HbsLead) => {
    setViewingLead(lead);
    setInspectorTab("dossier");
    setEditStatus((lead.status || "NEW").toUpperCase());
    setEditPriority((lead.priority || "MEDIUM").toUpperCase());
    setEditAssignedTo(lead.assignedTo || "");
    setEditQuotationAmount(lead.quotationAmount ? String(lead.quotationAmount) : "");
    setEditName(lead.name || "");
    setEditPhone(lead.phone || "");
    setEditEmail(lead.email || "");
    setNewNote("");
  };

  // Helper parsers
  const parseNotes = (raw: any): HbsInternalNote[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const parseSelectedServices = (serviceStr?: string | null): string[] => {
    if (!serviceStr) return ["General Evaluation"];
    if (serviceStr.startsWith("[") && serviceStr.endsWith("]")) {
      try {
        const parsed = JSON.parse(serviceStr);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return serviceStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const parseLeadMeta = (message?: string | null) => {
    if (!message) return { location: null, preferredContact: null, cleanMessage: "" };
    const match = message.match(/^\[([^\]]+)\]\s*/);
    let location: string | null = null;
    let preferredContact: string | null = null;
    let cleanMessage = message;

    if (match) {
      cleanMessage = message.slice(match[0].length).trim();
      const parts = match[1].split("|");
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed.toLowerCase().startsWith("location:")) {
          location = trimmed.slice("location:".length).trim();
        } else if (trimmed.toLowerCase().startsWith("preferred contact:")) {
          preferredContact = trimmed.slice("preferred contact:".length).trim();
        }
      }
    }
    return { location, preferredContact, cleanMessage };
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => {
      const s = (l.status || "NEW").toUpperCase();
      return s === "NEW" || s === "PENDING";
    }).length;
    const inProgress = leads.filter((l) => {
      const s = (l.status || "").toUpperCase();
      return s === "CONTACTED" || s === "FOLLOW_UP";
    }).length;
    const quotedLeads = leads.filter(
      (l) => (l.status || "").toUpperCase() === "QUOTATION_SENT" || (l.quotationAmount && l.quotationAmount > 0)
    );
    const totalQuotedValue = quotedLeads.reduce((acc, l) => acc + (Number(l.quotationAmount) || 0), 0);
    const wonCount = leads.filter((l) => (l.status || "").toUpperCase() === "CONVERTED").length;
    const winRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;

    return { total, newCount, inProgress, quotedCount: quotedLeads.length, totalQuotedValue, wonCount, winRate };
  }, [leads]);

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    const list = leads.filter((l) => {
      const currentSt = (l.status || "NEW").toUpperCase();
      const currentPr = (l.priority || "MEDIUM").toUpperCase();

      const matchesStatus =
        statusFilter === "all" ||
        currentSt === statusFilter.toUpperCase() ||
        (statusFilter === "NEW" && ["NEW", "PENDING"].includes(currentSt));

      const matchesPriority =
        priorityFilter === "all" || currentPr === priorityFilter.toUpperCase();

      const services = parseSelectedServices(l.selectedService).map((s) => s.toLowerCase());
      const matchesService =
        serviceFilter === "all" ||
        services.some((s) => s.includes(serviceFilter.toLowerCase()));

      const q = search.toLowerCase();
      const meta = parseLeadMeta(l.message);
      const matchesSearch =
        !search ||
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.selectedService && l.selectedService.toLowerCase().includes(q)) ||
        (l.assignedTo && l.assignedTo.toLowerCase().includes(q)) ||
        (meta.location && meta.location.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q));

      return matchesStatus && matchesPriority && matchesService && matchesSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "amount_desc") {
        return (b.quotationAmount || 0) - (a.quotationAmount || 0);
      }
      if (sortBy === "priority") {
        const priorityOrder: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const prA = priorityOrder[(a.priority || "MEDIUM").toUpperCase()] || 0;
        const prB = priorityOrder[(b.priority || "MEDIUM").toUpperCase()] || 0;
        return prB - prA;
      }
      // default "newest"
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [leads, search, statusFilter, priorityFilter, serviceFilter, sortBy]);

  // Quick Status Update
  const updateStatusQuick = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/hbs/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
        if (viewingLead && viewingLead.id === id) {
          setViewingLead((prev) => (prev ? { ...prev, status: newStatus } : null));
          setEditStatus(newStatus);
        }
        setMessage({ text: `Lead stage updated to ${newStatus}`, type: "success" });
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: "Failed to update lead status", type: "error" });
    }
  };

  // Advance to Next Stage
  const advanceStage = (id: string, currentStatus?: string) => {
    const cur = (currentStatus || "NEW").toUpperCase();
    const stage = PIPELINE_STAGES.find((s) => s.id === cur);
    if (stage && stage.nextStage) {
      updateStatusQuick(id, stage.nextStage);
    }
  };

  // Save Lead CRM Details
  const saveLeadDetails = async () => {
    if (!viewingLead?.id) return;
    setSavingDetails(true);
    try {
      const numAmount = editQuotationAmount ? parseFloat(editQuotationAmount) : null;
      const res = await fetch(`/api/hbs/leads/${viewingLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: editStatus,
          priority: editPriority,
          assignedTo: editAssignedTo.trim() || null,
          quotationAmount: numAmount,
          name: editName.trim() || viewingLead.name,
          phone: editPhone.trim() || viewingLead.phone,
          email: editEmail.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ text: "Lead parameters updated successfully!", type: "success" });
        await loadLeads();
      } else {
        setMessage({ text: json.error || "Failed to update lead.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSavingDetails(false);
    }
  };

  // Submit Internal Engineering Note
  const submitNote = async () => {
    if (!viewingLead?.id || !newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/hbs/leads/${viewingLead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note: newNote.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setNewNote("");
        setMessage({ text: "Inspection note added to audit trail.", type: "success" });
        await loadLeads();
      } else {
        setMessage({ text: json.error || "Failed to add note.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving note.", type: "error" });
    } finally {
      setAddingNote(false);
    }
  };

  // Create Inbound Lead Manually
  const handleCreateInboundLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name.trim() || !newLeadForm.phone.trim()) {
      setMessage({ text: "Client name and direct phone number are required.", type: "error" });
      return;
    }
    setCreatingLead(true);
    try {
      const numAmount = newLeadForm.quotationAmount ? parseFloat(newLeadForm.quotationAmount) : null;
      const res = await fetch("/api/hbs/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newLeadForm.name.trim(),
          phone: newLeadForm.phone.trim(),
          email: newLeadForm.email.trim() || null,
          location: newLeadForm.location.trim() || "Bhilwara, Rajasthan",
          preferredContact: newLeadForm.preferredContact,
          selectedServices: newLeadForm.selectedServices.length > 0 ? newLeadForm.selectedServices : ["General Structural Evaluation"],
          priority: newLeadForm.priority,
          status: newLeadForm.status,
          assignedTo: newLeadForm.assignedTo.trim() || null,
          quotationAmount: numAmount,
          message: newLeadForm.message.trim() || "Inbound inquiry logged directly via Admin CRM.",
          source: "admin_manual_crm",
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (newLeadForm.initialNote.trim() && json.data?.id) {
          try {
            await fetch(`/api/hbs/leads/${json.data.id}/notes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ note: newLeadForm.initialNote.trim() }),
            });
          } catch {}
        }
        setMessage({ text: `Inbound lead for "${newLeadForm.name}" created!`, type: "success" });
        setIsCreateOpen(false);
        setNewLeadForm({
          name: "",
          phone: "",
          email: "",
          location: "Bhilwara, Rajasthan",
          preferredContact: "Phone Call",
          selectedServices: [],
          priority: "HIGH",
          status: "NEW",
          assignedTo: "",
          quotationAmount: "",
          message: "",
          initialNote: "",
        });
        await loadLeads();
      } else {
        setMessage({ text: json.error || "Failed to create lead", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while creating lead.", type: "error" });
    } finally {
      setCreatingLead(false);
    }
  };

  // Delete Lead
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete lead from "${name}"?`)) return;
    try {
      const res = await fetch(`/api/hbs/leads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (viewingLead?.id === id) setViewingLead(null);
        setMessage({ text: `Lead from "${name}" permanently deleted.`, type: "success" });
      } else {
        setMessage({ text: json.error || "Failed to delete lead", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      "Reference ID",
      "Name",
      "Phone",
      "Email",
      "Location",
      "Service Requested",
      "Status",
      "Priority",
      "Assigned Engineer",
      "Quotation (INR)",
      "Created Date",
      "Message / Scope",
    ];
    const rows = leads.map((l) => {
      const meta = parseLeadMeta(l.message);
      return [
        `"#HB-${(l.id || "").slice(-6).toUpperCase()}"`,
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.phone}"`,
        `"${l.email || ""}"`,
        `"${meta.location || "Bhilwara"}"`,
        `"${(l.selectedService || "").replace(/"/g, '""')}"`,
        `"${l.status || "NEW"}"`,
        `"${l.priority || "MEDIUM"}"`,
        `"${l.assignedTo || ""}"`,
        `"${l.quotationAmount || ""}"`,
        `"${l.createdAt ? new Date(String(l.createdAt)).toLocaleDateString("en-IN") : ""}"`,
        `"${(meta.cleanMessage || "").replace(/"/g, '""')}"`,
      ];
    });
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `hind_build_crm_pipeline_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st?: string) => {
    const s = (st || "NEW").toUpperCase();
    switch (s) {
      case "NEW":
        return "bg-amber-500/10 text-amber-900 border-amber-300";
      case "CONTACTED":
        return "bg-blue-500/10 text-blue-900 border-blue-300";
      case "FOLLOW_UP":
        return "bg-purple-500/10 text-purple-900 border-purple-300";
      case "QUOTATION_SENT":
        return "bg-indigo-500/10 text-indigo-900 border-indigo-300";
      case "CONVERTED":
        return "bg-emerald-500/10 text-emerald-900 border-emerald-300";
      case "LOST":
        return "bg-slate-200 text-slate-700 border-slate-300";
      case "SPAM":
        return "bg-red-500/10 text-red-900 border-red-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityBadge = (p?: string) => {
    const pr = (p || "MEDIUM").toUpperCase();
    switch (pr) {
      case "URGENT":
        return "bg-red-600 text-white shadow-xs font-bold animate-pulse";
      case "HIGH":
        return "bg-amber-500 text-slate-950 font-bold";
      case "MEDIUM":
        return "bg-slate-200 text-slate-700 font-semibold";
      case "LOW":
        return "bg-slate-100 text-slate-500 font-medium";
      default:
        return "bg-slate-100 text-slate-600 font-medium";
    }
  };

  const formatCurrency = (val?: number | null) => {
    if (!val || isNaN(val)) return "—";
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const getWhatsAppLink = (lead: HbsLead, templateType: "site_visit" | "quote" | "intro" = "intro") => {
    const cleanPhone = lead.phone.replace(/[^\d]/g, "");
    const fullPhone = cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone;
    const ref = `#HB-${(lead.id || "").slice(-6).toUpperCase()}`;
    const services = parseSelectedServices(lead.selectedService)[0] || "Structural Evaluation";

    let text = "";
    if (templateType === "site_visit") {
      text = `Hello ${lead.name}, greetings from Hind Building Solutions (HiBUILD). Regarding your inquiry (${ref}) for ${services}, our senior site engineer is scheduling physical site audits in your area. When would be a convenient time for an inspection visit?`;
    } else if (templateType === "quote") {
      text = `Hello ${lead.name}, regarding the quotation estimate of ${lead.quotationAmount ? `₹${lead.quotationAmount.toLocaleString("en-IN")}` : "prepared by our team"} for your ${services} project (${ref}), our engineering team is ready for mobilization. Would you like to review the work specifications?`;
    } else {
      text = `Hello ${lead.name}, thank you for contacting Hind Building Solutions (HiBUILD). We have received your inquiry (${ref}) for ${services}. How can our engineering repair team assist you today?`;
    }

    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={`transition-all duration-300 pb-16 space-y-5 ${isMaximized ? "w-full max-w-none" : "max-w-7xl mx-auto"}`}>
      {/* ── 0. BREADCRUMB & CONSOLE HEADER ────────────────────────────── */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Commercial CRM" }, { label: "Dispatch Hub" }]}
        title="Hind Build Lead CRM & Pipeline"
        description="Unified commercial dispatch workstation for Hind Building Solutions — Real-time site inspection requests, quotation stages, and deal conversions."
        badge="Active Pipeline"
      >
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0D2D5E] to-[#123974] hover:from-[#123974] hover:to-[#174894] rounded-xl transition-all shadow-md shadow-blue-950/20 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>New Inbound Lead</span>
        </button>

        {/* Apple Segmented View Toggle */}
        <div className="inline-flex items-center p-1 backdrop-blur-md bg-white/80 border border-slate-200/80 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("pipeline")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "pipeline"
                ? "bg-[#0D2D5E] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Kanban Pipeline"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "table"
                ? "bg-[#0D2D5E] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Data Grid Table"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>

        <button
          type="button"
          onClick={loadLeads}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md bg-white/80 border border-slate-200/80 hover:bg-white rounded-xl transition-colors shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
          <span className="hidden sm:inline">Reload</span>
        </button>

        <button
          type="button"
          onClick={exportCSV}
          disabled={leads.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 backdrop-blur-md bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
          title="Export CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </HbsAdminPageHeader>

      {/* Global Feedback Banner */}
      {message.text && (
        <div
          className={`p-3.5 text-xs flex items-center justify-between backdrop-blur-md border rounded-2xl shadow-sm transition-all ${
            message.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
              : "bg-red-50/90 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage({ text: "", type: "" })}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 1. MAIN macOS WINDOW CHASSIS CONTAINER ────────────────────── */}
      <div className="rounded-3xl border border-slate-300/80 bg-white/90 backdrop-blur-2xl shadow-[0_25px_70px_-15px_rgba(15,23,42,0.14)] ring-1 ring-black/5 overflow-hidden transition-all duration-300">
        
        {/* ── macOS WINDOW TITLEBAR (AUTHENTIC CHROME) ─────────────────── */}
        <div className="px-4 py-3 bg-gradient-to-b from-slate-100/95 via-slate-100/80 to-slate-200/60 border-b border-slate-200/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 select-none">
          
          {/* Left: macOS Traffic Light Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Close Dot: resets search & active filters */}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setServiceFilter("all");
              }}
              title="Reset Filters (Close active queries)"
              className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/80 flex items-center justify-center group/btn shadow-xs transition-transform active:scale-90 cursor-pointer"
            >
              <span className="text-[8px] text-[#4A0002] opacity-0 group-hover/btn:opacity-100 font-bold leading-none select-none">
                ✕
              </span>
            </button>

            {/* Minimize Dot: collapse / expand KPI widgets */}
            <button
              type="button"
              onClick={() => setIsCollapsedWidgets((prev) => !prev)}
              title={isCollapsedWidgets ? "Expand KPI Widgets" : "Minimize KPI Widgets"}
              className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/80 flex items-center justify-center group/btn shadow-xs transition-transform active:scale-90 cursor-pointer"
            >
              <span className="text-[9px] text-[#543500] opacity-0 group-hover/btn:opacity-100 font-bold leading-none select-none">
                —
              </span>
            </button>

            {/* Maximize / Zoom Dot: expands workspace full width */}
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              title={isMaximized ? "Restore Standard Width" : "Maximize Full-Width Workspace"}
              className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/80 flex items-center justify-center group/btn shadow-xs transition-transform active:scale-90 cursor-pointer"
            >
              <span className="text-[7px] text-[#0B4011] opacity-0 group-hover/btn:opacity-100 font-bold leading-none select-none">
                ⤢
              </span>
            </button>

            <span className="h-3.5 w-px bg-slate-300 mx-1 hidden sm:inline-block" />

            {/* Quick Window Title Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200/70 text-[11px] font-semibold text-slate-700 shadow-2xs">
              <Laptop className="w-3 h-3 text-[#0D2D5E]" />
              <span>Dispatch Console</span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] font-mono text-slate-500">Node bhilwara-01</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </div>
          </div>

          {/* Center: Window Title Badge */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <FolderKanban className="w-3.5 h-3.5 text-[#0D2D5E]" />
            <span className="tracking-tight">HiBUILD Commercial Lead Engine</span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              {leads.length} Leads
            </span>
          </div>

          {/* Right: Mac Toolbar Action Shortcuts */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Apple Segmented View Switcher */}
            <div className="flex items-center p-0.5 bg-slate-200/70 rounded-lg border border-slate-300/60 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode("pipeline")}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewMode === "pipeline"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-3 h-3" />
                <span>Grid</span>
              </button>
            </div>

            {/* Window maximize icon button */}
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              className="p-1.5 text-slate-500 hover:text-slate-800 bg-white/70 hover:bg-white rounded-lg border border-slate-200/80 transition-colors shadow-2xs"
              title={isMaximized ? "Restore Width" : "Maximize Workspace"}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* ── 2. macOS FROSTED METRIC WIDGETS (KPI SUMMARY) ───────────── */}
        {!isCollapsedWidgets && (
          <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50/80 to-white/60 border-b border-slate-200/70">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              
              {/* Widget 1: Total Leads */}
              <div className="group relative p-4 bg-white/85 backdrop-blur-xl border border-slate-200/80 hover:border-slate-300 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Total Leads
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Inbox className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                  {stats.total}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span>Recorded inquiries</span>
                </div>
              </div>

              {/* Widget 2: New Pending Callback */}
              <div className="group relative p-4 bg-gradient-to-br from-amber-50/70 to-white/90 backdrop-blur-xl border border-amber-200/80 hover:border-amber-300 rounded-2xl shadow-[0_4px_20px_rgba(245,158,11,0.04)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.09)] transition-all overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-amber-800 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    New Pending
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight font-display">
                  {stats.newCount}
                </div>
                <div className="text-[11px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
                  <span>Needs rapid callback</span>
                </div>
              </div>

              {/* Widget 3: Active Inspections */}
              <div className="group relative p-4 bg-gradient-to-br from-blue-50/70 to-white/90 backdrop-blur-xl border border-blue-200/80 hover:border-blue-300 rounded-2xl shadow-[0_4px_20px_rgba(13,45,94,0.04)] hover:shadow-[0_8px_25px_rgba(13,45,94,0.08)] transition-all">
                <div className="flex items-center justify-between text-blue-800 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    Site Audits
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-blue-100/80 flex items-center justify-center text-[#0D2D5E]">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0D2D5E] tracking-tight font-display">
                  {stats.inProgress}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span>Active field pipeline</span>
                </div>
              </div>

              {/* Widget 4: Quotation Pipeline */}
              <div className="group relative p-4 bg-gradient-to-br from-indigo-50/70 to-white/90 backdrop-blur-xl border border-indigo-200/80 hover:border-indigo-300 rounded-2xl shadow-[0_4px_20px_rgba(79,70,229,0.04)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.08)] transition-all">
                <div className="flex items-center justify-between text-indigo-800 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    Quotes Pipeline
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-indigo-100/80 flex items-center justify-center text-indigo-700">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight font-display truncate">
                  {formatCurrency(stats.totalQuotedValue)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span>{stats.quotedCount} commercial quotes</span>
                </div>
              </div>

              {/* Widget 5: Deals Won */}
              <div className="group relative p-4 bg-gradient-to-br from-emerald-50/70 to-white/90 backdrop-blur-xl border border-emerald-200/80 hover:border-emerald-300 rounded-2xl shadow-[0_4px_20px_rgba(5,150,105,0.04)] hover:shadow-[0_8px_25px_rgba(5,150,105,0.08)] transition-all col-span-2 md:col-span-1">
                <div className="flex items-center justify-between text-emerald-800 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    Deals Won
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight font-display flex items-baseline gap-2">
                  <span>{stats.wonCount}</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {stats.winRate}% Won
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span>Signed work orders</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── 3. macOS SPOTLIGHT SEARCH & FILTER TOOLBAR ───────────────── */}
        <div className="p-3.5 sm:p-4 bg-white/80 border-b border-slate-200/80 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Spotlight Search Box */}
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400 group-focus-within:text-[#0D2D5E] transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by client name, phone (+91), city, trade service, supervisor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-20 py-2 text-xs border border-slate-200/90 bg-slate-50/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2D5E]/20 focus:border-slate-300 transition-all text-slate-900 placeholder-slate-400"
              />
              <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400 shadow-2xs select-none">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>

            {/* macOS Style Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Priority Filter */}
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 bg-slate-50/80 hover:bg-white rounded-xl focus:outline-none text-slate-700 transition-colors cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="URGENT">🚨 Urgent Only</option>
                  <option value="HIGH">⚡ High Priority</option>
                  <option value="MEDIUM">🔹 Medium Priority</option>
                  <option value="LOW">⚪ Low Priority</option>
                </select>
              </div>

              {/* Service Category Filter */}
              <div className="relative">
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 bg-slate-50/80 hover:bg-white rounded-xl focus:outline-none text-slate-700 max-w-[200px] truncate transition-colors cursor-pointer"
                >
                  <option value="all">All Services</option>
                  {TRADE_SERVICES_LIST.map((srv) => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 bg-slate-50/80 hover:bg-white rounded-xl focus:outline-none text-slate-700 transition-colors cursor-pointer"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="amount_desc">Sort: Highest Quote (₹)</option>
                  <option value="priority">Sort: Highest Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* macOS Segmented Stage Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[#0D2D5E] text-white shadow-xs"
                  : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/90"
              }`}
            >
              <span>All Leads</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === "all" ? "bg-white/20" : "bg-slate-200 text-slate-700"}`}>
                {leads.length}
              </span>
            </button>

            {PIPELINE_STAGES.map((st) => {
              const count = leads.filter(
                (l) => (l.status || "NEW").toUpperCase() === st.id
              ).length;
              const isActive = statusFilter.toUpperCase() === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-[#0D2D5E] text-white shadow-xs"
                      : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/90"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: st.accent }}
                  />
                  <span>{st.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700 font-bold"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setStatusFilter("LOST")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "LOST"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-slate-100/90 text-slate-500 hover:bg-slate-200/90"
              }`}
            >
              <span>Lost / Archived</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === "LOST" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {leads.filter((l) => (l.status || "").toUpperCase() === "LOST").length}
              </span>
            </button>
          </div>
        </div>

        {/* ── 4. PIPELINE KANBAN BOARD (macOS LANES VIEW) ─────────────── */}
        {viewMode === "pipeline" && (
          <div className="p-4 sm:p-5 bg-slate-100/40">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
              {PIPELINE_STAGES.map((col) => {
                const columnLeads = filteredLeads.filter(
                  (l) => (l.status || "NEW").toUpperCase() === col.id
                );
                const columnValue = columnLeads.reduce(
                  (sum, l) => sum + (Number(l.quotationAmount) || 0),
                  0
                );

                return (
                  <div
                    key={col.id}
                    className="bg-slate-200/40 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-3 shadow-2xs flex flex-col min-h-[580px] max-h-[820px]"
                  >
                    {/* macOS Column Lane Header */}
                    <div className="pb-3 mb-3 border-b border-slate-200/70 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: col.accent }}
                          />
                          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-display">
                            {col.label}
                          </h3>
                          <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-white/90 border border-slate-200 text-slate-700">
                            {columnLeads.length}
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                          {columnValue > 0 ? formatCurrency(columnValue) : col.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Column Cards (Scrollable macOS Cards) */}
                    <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                      {columnLeads.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-mono text-[11px] border border-dashed border-slate-300 rounded-xl bg-white/40">
                          No inquiries in {col.label}
                        </div>
                      ) : (
                        columnLeads.map((lead) => {
                          const meta = parseLeadMeta(lead.message);
                          const services = parseSelectedServices(lead.selectedService);
                          const refCode = `#HB-${(lead.id || "").slice(-6).toUpperCase()}`;

                          return (
                            <div
                              key={lead.id}
                              className="group bg-white/95 hover:bg-white border border-slate-200/90 hover:border-blue-400/80 rounded-2xl p-3.5 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 space-y-2.5 relative"
                            >
                              {/* Card Header: Client Initials Avatar & Name */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {/* Avatar Icon */}
                                  <div
                                    className={`w-7 h-7 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                                      lead.id
                                    )} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                                  >
                                    {getInitials(lead.name)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <button
                                      type="button"
                                      onClick={() => openLeadModal(lead)}
                                      className="font-bold text-xs text-slate-900 hover:text-[#0D2D5E] text-left line-clamp-1 block w-full truncate transition-colors cursor-pointer"
                                    >
                                      {lead.name}
                                    </button>
                                    <span className="text-[10px] font-mono text-slate-400 block">
                                      {refCode}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded-md shrink-0 ${getPriorityBadge(
                                    lead.priority
                                  )}`}
                                >
                                  {lead.priority || "MEDIUM"}
                                </span>
                              </div>

                              {/* Location */}
                              {meta.location && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="truncate">{meta.location}</span>
                                </div>
                              )}

                              {/* Services Tags */}
                              <div className="flex flex-wrap gap-1">
                                <span
                                  className="px-2 py-0.5 bg-slate-100/90 text-slate-800 rounded-md text-[10px] font-medium truncate max-w-full"
                                  title={services[0]}
                                >
                                  {services[0] || "General Assessment"}
                                </span>
                                {services.length > 1 && (
                                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-md text-[9px] font-bold shrink-0">
                                    +{services.length - 1}
                                  </span>
                                )}
                              </div>

                              {/* Quotation & Supervisor Indicator */}
                              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                                {lead.quotationAmount ? (
                                  <span className="font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 text-[10px]">
                                    {formatCurrency(lead.quotationAmount)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px] italic">
                                    No quote set
                                  </span>
                                )}

                                {lead.assignedTo ? (
                                  <span className="text-[10px] text-slate-600 flex items-center gap-1 font-medium truncate max-w-[95px]">
                                    <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                    <span className="truncate">
                                      {lead.assignedTo.replace(/Er\.\s*/i, "")}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-300 italic">
                                    Unassigned
                                  </span>
                                )}
                              </div>

                              {/* macOS Quick Action Footer */}
                              <div className="pt-2 mt-0.5 flex items-center justify-between gap-1.5 border-t border-slate-100">
                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Phone Call Button */}
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="w-7 h-7 flex items-center justify-center bg-amber-50/90 hover:bg-amber-100 text-amber-800 border border-amber-200/60 rounded-lg transition-all duration-150 hover:scale-105 shrink-0"
                                    title={`Call ${lead.phone}`}
                                  >
                                    <Phone className="w-3 h-3 text-amber-700" />
                                  </a>

                                  {/* WhatsApp Chat Button */}
                                  <a
                                    href={getWhatsAppLink(
                                      lead,
                                      col.id === "FOLLOW_UP"
                                        ? "site_visit"
                                        : col.id === "QUOTATION_SENT"
                                        ? "quote"
                                        : "intro"
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 flex items-center justify-center bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 rounded-lg transition-all duration-150 hover:scale-105 shrink-0"
                                    title="Open WhatsApp Chat"
                                  >
                                    <MessageSquare className="w-3 h-3 text-emerald-700" />
                                  </a>

                                  {/* macOS Inspector Quick Look Button */}
                                  <button
                                    type="button"
                                    onClick={() => openLeadModal(lead)}
                                    className="w-7 h-7 flex items-center justify-center bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-200/70 rounded-lg transition-all duration-150 hover:scale-105 shrink-0 cursor-pointer"
                                    title="Inspect Lead Dossier"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Advance Stage Button */}
                                {col.nextStage && (
                                  <button
                                    type="button"
                                    onClick={() => advanceStage(lead.id || "", col.id)}
                                    className="h-7 px-2 text-[10px] font-bold text-slate-700 hover:text-white bg-slate-100/90 hover:bg-[#0D2D5E] border border-slate-200/80 hover:border-[#0D2D5E] rounded-lg transition-all duration-150 flex items-center gap-1 shrink-0 shadow-2xs group/adv cursor-pointer"
                                    title={`Advance to ${col.nextLabel}`}
                                  >
                                    <span>Next</span>
                                    <ArrowRight className="w-2.5 h-2.5 transition-transform duration-150 group-hover/adv:translate-x-0.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 5. ADVANCED DATA TABLE VIEW (macOS NUMBERS GRID) ─────────── */}
        {viewMode === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/80 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Customer &amp; Location</th>
                  <th className="p-3.5">Direct Contact</th>
                  <th className="p-3.5">Requested Trade Services</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Assigned Lead</th>
                  <th className="p-3.5">Quotation (₹)</th>
                  <th className="p-3.5">Pipeline Stage</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400 font-mono text-xs">
                      No inquiries found matching current filter parameters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const currentStatus = (lead.status || "NEW").toUpperCase();
                    const meta = parseLeadMeta(lead.message);
                    const services = parseSelectedServices(lead.selectedService);

                    return (
                      <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors">
                        {/* Customer */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                                lead.id
                              )} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {getInitials(lead.name)}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => openLeadModal(lead)}
                                className="font-bold text-slate-900 text-sm hover:text-[#0D2D5E] text-left block cursor-pointer transition-colors"
                              >
                                {lead.name}
                              </button>
                              <div className="text-[10px] font-mono text-amber-800 font-bold">
                                #HB-{(lead.id || "").slice(-6).toUpperCase()}
                              </div>
                              {meta.location && (
                                <div className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                  <span className="truncate max-w-[170px]">{meta.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Direct Contact */}
                        <td className="p-3.5 font-mono">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-amber-800 hover:underline flex items-center gap-1 font-semibold"
                              title="Call"
                            >
                              <Phone className="w-3 h-3 text-amber-600" />
                              <span>{lead.phone}</span>
                            </a>

                            <a
                              href={getWhatsAppLink(lead)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold hover:bg-emerald-200 rounded-md flex items-center gap-1 transition-colors"
                              title="Open WhatsApp Chat"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-700" />
                              <span>WA</span>
                            </a>
                          </div>
                          {meta.preferredContact && (
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Prefers: {meta.preferredContact}
                            </span>
                          )}
                        </td>

                        {/* Services */}
                        <td className="p-3.5">
                          <div className="flex flex-col gap-1 items-start max-w-[220px]">
                            <span
                              className="px-2 py-0.5 bg-slate-100 text-slate-800 font-medium text-[11px] rounded truncate max-w-full"
                              title={services[0]}
                            >
                              {services[0] || "General Assessment"}
                            </span>
                            {services.length > 1 && (
                              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
                                +{services.length - 1} more service{services.length > 2 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="p-3.5 font-mono">
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md ${getPriorityBadge(
                              lead.priority
                            )}`}
                          >
                            {lead.priority || "MEDIUM"}
                          </span>
                        </td>

                        {/* Assigned To */}
                        <td className="p-3.5 text-[11px] text-slate-700">
                          {lead.assignedTo ? (
                            <span className="flex items-center gap-1 font-medium">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{lead.assignedTo}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Quotation */}
                        <td className="p-3.5 font-mono text-[11px] font-bold text-slate-900">
                          {lead.quotationAmount ? (
                            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                              ₹{lead.quotationAmount.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">—</span>
                          )}
                        </td>

                        {/* Stage Dropdown */}
                        <td className="p-3.5">
                          <select
                            value={currentStatus}
                            onChange={(e) => updateStatusQuick(lead.id || "", e.target.value)}
                            className={`text-[10px] font-mono uppercase font-bold border px-2.5 py-1 rounded-lg cursor-pointer ${getStatusBadge(
                              currentStatus
                            )}`}
                          >
                            {LEAD_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Date */}
                        <td className="p-3.5 font-mono text-[11px] text-slate-400">
                          {lead.createdAt
                            ? new Date(String(lead.createdAt)).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openLeadModal(lead)}
                              className="p-1.5 text-slate-500 hover:text-[#0D2D5E] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Inspect Lead"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(lead.id || "", lead.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Lead"
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
          </div>
        )}

      </div>

      {/* ── 6. MODAL: + NEW INBOUND LEAD (macOS SHEET WINDOW) ─────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* macOS Modal Titlebar */}
            <div className="px-5 py-3.5 bg-gradient-to-b from-slate-100/90 to-slate-200/60 border-b border-slate-200/80 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/80 flex items-center justify-center group shadow-xs cursor-pointer"
                  title="Close Sheet"
                >
                  <span className="text-[8px] text-[#4A0002] opacity-0 group-hover:opacity-100 font-bold leading-none select-none">✕</span>
                </button>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/80" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/80" />
                <span className="ml-2 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Log Inbound Lead</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInboundLead} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Verma"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full border border-slate-300 p-2.5 bg-slate-50/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2D5E]/20"
                  />
                </div>

                {/* Direct Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 94141 99999"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full border border-slate-300 p-2.5 bg-slate-50/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2D5E]/20 font-mono"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. client@example.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full border border-slate-300 p-2.5 bg-slate-50/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2D5E]/20"
                  />
                </div>

                {/* Site Location */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Site Location / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Subhash Nagar, Bhilwara"
                    value={newLeadForm.location}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, location: e.target.value })}
                    className="w-full border border-slate-300 p-2.5 bg-slate-50/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2D5E]/20"
                  />
                </div>
              </div>

              {/* Service Selection Quick Tags */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                  Requested Trade Services (Click to Select)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50/80 border border-slate-200 rounded-xl">
                  {TRADE_SERVICES_LIST.map((srv) => {
                    const isSelected = newLeadForm.selectedServices.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewLeadForm({
                              ...newLeadForm,
                              selectedServices: newLeadForm.selectedServices.filter((s) => s !== srv),
                            });
                          } else {
                            setNewLeadForm({
                              ...newLeadForm,
                              selectedServices: [...newLeadForm.selectedServices, srv],
                            });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? "bg-[#0D2D5E] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                        <span>{srv}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CRM Parameters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Priority */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Priority
                  </label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value })}
                    className="w-full border border-slate-300 p-2 bg-white rounded-xl focus:outline-none font-bold"
                  >
                    {LEAD_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Initial Stage */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Initial Stage
                  </label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value })}
                    className="w-full border border-slate-300 p-2 bg-white rounded-xl focus:outline-none font-bold"
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Supervisor */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Assigned Lead
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Er. Sharma"
                    value={newLeadForm.assignedTo}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedTo: e.target.value })}
                    className="w-full border border-slate-300 p-2 bg-white rounded-xl focus:outline-none"
                  />
                </div>

                {/* Quotation Estimate */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Quotation Est. (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={newLeadForm.quotationAmount}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, quotationAmount: e.target.value })}
                    className="w-full border border-slate-300 p-2 bg-white rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Requirement Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                  Project Scope / Site Problem Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe basement leakage depth, roof area (sq. ft.), crack severity, or timeline..."
                  value={newLeadForm.message}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                  className="w-full border border-slate-300 p-2.5 bg-slate-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2D5E]/20"
                />
              </div>

              {/* Initial Internal Note */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                  Internal Engineering Note (Audit Trail)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Client requested urgent site visit on Saturday morning."
                  value={newLeadForm.initialNote}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, initialNote: e.target.value })}
                  className="w-full border border-slate-300 p-2.5 bg-slate-50 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingLead}
                  className="px-5 py-2 bg-gradient-to-r from-[#0D2D5E] to-[#123974] hover:from-[#123974] hover:to-[#174894] text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>{creatingLead ? "Logging Lead..." : "Save Inbound Lead"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. macOS LEAD INSPECTOR WINDOW (QUICK LOOK & WORKFLOW) ────── */}
      {viewingLead && (
        <div className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto my-auto shadow-[0_30px_90px_-20px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
            
            {/* macOS Inspector Window Titlebar */}
            <div className="px-5 py-3.5 bg-gradient-to-b from-slate-100/95 to-slate-200/70 border-b border-slate-200/90 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingLead(null)}
                  className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/80 flex items-center justify-center group shadow-xs cursor-pointer"
                  title="Close Inspector"
                >
                  <span className="text-[8px] text-[#4A0002] opacity-0 group-hover:opacity-100 font-bold leading-none select-none">✕</span>
                </button>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/80" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/80" />
                
                <span className="ml-2 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-[#0D2D5E]" />
                  <span>Lead Inspector — {viewingLead.name}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                  #HB-{(viewingLead.id || "").slice(-6).toUpperCase()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Communication Ribbon */}
            <div className="px-6 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Call */}
                <a
                  href={`tel:${viewingLead.phone}`}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-amber-400 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Call {viewingLead.phone}</span>
                </a>

                {/* WhatsApp: Site Visit */}
                <a
                  href={getWhatsAppLink(viewingLead, "site_visit")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-300 hover:bg-emerald-500/20 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WA: Site Visit</span>
                </a>

                {/* WhatsApp: Quote Follow-up */}
                <a
                  href={getWhatsAppLink(viewingLead, "quote")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-300 hover:bg-emerald-500/20 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WA: Proposal</span>
                </a>

                {/* Email */}
                {viewingLead.email && (
                  <a
                    href={`mailto:${viewingLead.email}?subject=Hind Building Solutions Quote #${(viewingLead.id || "").slice(-6).toUpperCase()}`}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span>Source: {viewingLead.source || "hbs_website"}</span>
              </div>
            </div>

            {/* macOS Segmented Tab Controller */}
            <div className="px-6 pt-3 pb-2 border-b border-slate-200 flex items-center gap-2">
              <div className="flex items-center p-1 bg-slate-200/70 rounded-xl border border-slate-300/60 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setInspectorTab("dossier")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    inspectorTab === "dossier"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#0D2D5E]" />
                  <span>Client Dossier &amp; Scope</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab("commercial")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    inspectorTab === "commercial"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-[#0D2D5E]" />
                  <span>Commercial Deal Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab("notes")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    inspectorTab === "notes"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#0D2D5E]" />
                  <span>Site Audit Trail ({parseNotes(viewingLead.internalNotes).length})</span>
                </button>
              </div>
            </div>

            {/* Inspector Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Interactive Pipeline Progress Stepper (Always Visible on top of body) */}
              <div className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Lead Pipeline Stage Progression (Click to Change)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PIPELINE_STAGES.map((st, idx) => {
                    const isCurrent = editStatus.toUpperCase() === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setEditStatus(st.id);
                          if (viewingLead.id) updateStatusQuick(viewingLead.id, st.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isCurrent
                            ? "bg-[#0D2D5E] text-white border-[#0D2D5E] shadow-sm font-bold"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span>Step {idx + 1}</span>
                          {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-xs font-bold leading-tight truncate">{st.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── TAB 1: CLIENT DOSSIER & SCOPE ────────────────────── */}
              {inspectorTab === "dossier" && (() => {
                const meta = parseLeadMeta(viewingLead.message);
                const services = parseSelectedServices(viewingLead.selectedService);
                return (
                  <div className="space-y-4">
                    {/* Meta Particulars Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                          Direct Phone
                        </span>
                        <span className="font-mono font-bold text-slate-900">{viewingLead.phone}</span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                          Email Address
                        </span>
                        <span className="font-mono text-slate-800 truncate block">
                          {viewingLead.email || "Not Provided"}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                          Site Location
                        </span>
                        <span className="font-mono text-slate-800 truncate block">
                          {meta.location || "Bhilwara / Rajasthan"}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                          Preferred Contact
                        </span>
                        <span className="font-mono text-amber-800 font-bold truncate block">
                          {meta.preferredContact || "Phone Call"}
                        </span>
                      </div>
                    </div>

                    {/* Selected Services Tags */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                        Requested Trade Services ({services.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {services.map((srv, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{srv}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Customer Message / Scope */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Client Scope / Problem Description
                      </span>
                      <p className="text-slate-800 leading-relaxed bg-white p-3 border border-slate-200 rounded-lg whitespace-pre-wrap">
                        {meta.cleanMessage || "No additional message provided."}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* ── TAB 2: COMMERCIAL DEAL CONTROLS ──────────────────── */}
              {inspectorTab === "commercial" && (
                <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-700" />
                    <span>Commercial Deal Controls &amp; Quotation Settings</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                        Pipeline Stage
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full border border-slate-300 p-2 bg-white rounded-xl font-mono font-bold uppercase focus:outline-none"
                      >
                        {LEAD_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                        Priority Level
                      </label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full border border-slate-300 p-2 bg-white rounded-xl font-mono font-bold uppercase focus:outline-none"
                      >
                        {LEAD_PRIORITIES.map((pr) => (
                          <option key={pr} value={pr}>
                            {pr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                        Assigned Lead / Supervisor
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Er. Sharma"
                        value={editAssignedTo}
                        onChange={(e) => setEditAssignedTo(e.target.value)}
                        className="w-full border border-slate-300 p-2 bg-white rounded-xl focus:outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                        Quotation Amount (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 75000"
                        value={editQuotationAmount}
                        onChange={(e) => setEditQuotationAmount(e.target.value)}
                        className="w-full border border-slate-300 p-2 bg-white rounded-xl font-mono focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Client Contact Info Updates */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-amber-200/60">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border border-slate-300 p-2 bg-white rounded-xl focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full border border-slate-300 p-2 bg-white rounded-xl font-mono focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full border border-slate-300 p-2 bg-white rounded-xl focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={saveLeadDetails}
                      disabled={savingDetails}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {savingDetails ? "Updating..." : "Save CRM Deal Settings"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── TAB 3: SITE AUDIT TRAIL & NOTES ──────────────────── */}
              {inspectorTab === "notes" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>Internal Inspection Notes &amp; Audit Trail</span>
                  </h4>

                  {/* Notes Timeline */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {parseNotes(viewingLead.internalNotes).length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        No engineering notes logged yet. Use the field below to document site inspection findings, moisture readings, client callbacks, or quotation revisions.
                      </p>
                    ) : (
                      parseNotes(viewingLead.internalNotes).map((note, idx) => (
                        <div
                          key={note.id || idx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span className="font-bold text-slate-800">{note.author || "Site Supervisor"}</span>
                            <span>{note.createdAt ? new Date(note.createdAt).toLocaleString("en-IN") : ""}</span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-wrap">{(note as any).note || (note as any).content || ""}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add private inspection audit note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitNote();
                        }
                      }}
                      className="flex-1 text-xs border border-slate-300 p-2.5 bg-slate-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2D5E]/20"
                    />
                    <button
                      type="button"
                      onClick={submitNote}
                      disabled={addingNote || !newNote.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-[#0D2D5E] to-[#123974] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-amber-400" />
                      <span>{addingNote ? "Adding..." : "Add Note"}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Inspector Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleDelete(viewingLead.id || "", viewingLead.name)}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead Permanently</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
