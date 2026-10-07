"use client";

import { useEffect, useState, useMemo } from "react";
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
  MapPin
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

export default function HbsAdminLeads() {
  const [leads, setLeads] = useState<HbsLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingLead, setViewingLead] = useState<HbsLead | null>(null);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  // Modal edit states
  const [editStatus, setEditStatus] = useState("NEW");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editQuotationAmount, setEditQuotationAmount] = useState<string>("");

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
  }, []);

  const openLeadModal = (lead: HbsLead) => {
    setViewingLead(lead);
    setEditStatus((lead.status || "NEW").toUpperCase());
    setEditPriority((lead.priority || "MEDIUM").toUpperCase());
    setEditAssignedTo(lead.assignedTo || "");
    setEditQuotationAmount(lead.quotationAmount ? String(lead.quotationAmount) : "");
    setNewNote("");
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const currentSt = (l.status || "NEW").toUpperCase();
      const matchesStatus =
        statusFilter === "all" ||
        currentSt === statusFilter.toUpperCase() ||
        (statusFilter === "NEW" && ["NEW", "PENDING"].includes(currentSt));

      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.selectedService && l.selectedService.toLowerCase().includes(q)) ||
        (l.assignedTo && l.assignedTo.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

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
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ text: "Lead parameters saved successfully!", type: "success" });
        setLeads((prev) =>
          prev.map((l) =>
            l.id === viewingLead.id
              ? {
                  ...l,
                  status: editStatus,
                  priority: editPriority,
                  assignedTo: editAssignedTo.trim() || null,
                  quotationAmount: numAmount,
                }
              : l
          )
        );
        setViewingLead((prev) =>
          prev
            ? {
                ...prev,
                status: editStatus,
                priority: editPriority,
                assignedTo: editAssignedTo.trim() || null,
                quotationAmount: numAmount,
              }
            : null
        );
      } else {
        setMessage({ text: json.error || "Failed to update lead.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSavingDetails(false);
    }
  };

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
        setMessage({ text: "Internal note recorded.", type: "success" });
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete inquiry from "${name}"?`)) return;
    try {
      const res = await fetch(`/api/hbs/leads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (viewingLead?.id === id) setViewingLead(null);
        setMessage({ text: `Lead from "${name}" deleted.`, type: "success" });
      } else {
        setMessage({ text: json.error || "Failed to delete lead", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Service",
      "Status",
      "Priority",
      "Assigned To",
      "Quotation Amount",
      "Date",
      "Message",
    ];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email || ""}"`,
      `"${(l.selectedService || "").replace(/"/g, '""')}"`,
      `"${l.status || "NEW"}"`,
      `"${l.priority || "MEDIUM"}"`,
      `"${l.assignedTo || ""}"`,
      `"${l.quotationAmount || ""}"`,
      `"${l.createdAt ? new Date(String(l.createdAt)).toLocaleDateString() : ""}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `hind_build_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const getStatusBadge = (st?: string) => {
    const s = (st || "NEW").toUpperCase();
    switch (s) {
      case "NEW":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "CONTACTED":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "FOLLOW_UP":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "QUOTATION_SENT":
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      case "CONVERTED":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "LOST":
        return "bg-slate-200 text-slate-700 border-slate-300";
      case "SPAM":
        return "bg-red-100 text-red-900 border-red-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityBadge = (p?: string) => {
    const pr = (p || "MEDIUM").toUpperCase();
    switch (pr) {
      case "URGENT":
        return "bg-red-600 text-white";
      case "HIGH":
        return "bg-amber-500 text-slate-950 font-bold";
      case "MEDIUM":
        return "bg-slate-200 text-slate-700";
      case "LOW":
        return "bg-slate-100 text-slate-500";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Apple-minimal Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Leads" }]}
        title="Customer Leads & Quotes"
        description="Review incoming quote inquiries, manage CRM stage progression, and trigger client communications."
      >
        <button
          onClick={loadLeads}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reload</span>
        </button>

        <button
          onClick={exportCSV}
          disabled={leads.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </HbsAdminPageHeader>

      {message.text && (
        <div
          className={`p-4 text-xs flex items-center gap-2 border rounded-xl ${
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 border border-slate-200/80 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, phone, service, assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 rounded-lg focus:bg-white focus:outline-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", ...LEAD_STATUSES].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold transition-all rounded-md whitespace-nowrap ${
                statusFilter.toUpperCase() === st.toUpperCase()
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Direct Contact</th>
              <th className="p-3">Service Requested</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3">Quote (₹)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 font-mono text-xs">
                  No inquiries found matching current filters.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const cleanPhone = lead.phone.replace(/[^\d]/g, "");
                const currentStatus = (lead.status || "NEW").toUpperCase();
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                      <div className="text-[10px] font-mono text-amber-800 font-bold">
                        #HB-{(lead.id || "").slice(-6).toUpperCase()}
                      </div>
                      {lead.email && (
                        <div className="text-slate-400 text-[11px] font-mono">{lead.email}</div>
                      )}
                      {(() => {
                        const { location, preferredContact } = parseLeadMeta(lead.message);
                        return (
                          <div className="space-y-0.5 mt-1">
                            {location && (
                              <div className="text-slate-600 text-[10px] font-mono flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span className="truncate max-w-[160px]">{location}</span>
                              </div>
                            )}
                            {preferredContact && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                Prefers: <strong className="text-slate-700">{preferredContact}</strong>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-amber-700 hover:underline flex items-center gap-1 font-semibold"
                          title="Call"
                        >
                          <Phone className="w-3 h-3 text-amber-600" />
                          <span>{lead.phone}</span>
                        </a>

                        <a
                          href={`https://wa.me/${
                            cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone
                          }?text=${encodeURIComponent(
                            `Hello ${lead.name}, thank you for contacting Hind Build. How can our engineering team assist you?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold hover:bg-green-200 flex items-center gap-1"
                          title="Open WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-green-700" />
                          <span>WA</span>
                        </a>
                      </div>
                    </td>

                    <td className="p-3">
                      {(() => {
                        const srvList = parseSelectedServices(lead.selectedService);
                        return (
                          <div className="flex flex-col gap-1 items-start max-w-[220px]">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono text-[11px] truncate max-w-full font-medium" title={srvList[0]}>
                              {srvList[0] || "General Evaluation"}
                            </span>
                            {srvList.length > 1 && (
                              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
                                +{srvList.length - 1} more service{srvList.length > 2 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="p-3 font-mono">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold ${getPriorityBadge(
                          lead.priority
                        )}`}
                      >
                        {lead.priority || "MEDIUM"}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-[11px] text-slate-700">
                      {lead.assignedTo ? (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{lead.assignedTo}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="p-3 font-mono text-[11px] font-semibold text-slate-900">
                      {lead.quotationAmount ? `₹${lead.quotationAmount.toLocaleString("en-IN")}` : "—"}
                    </td>

                    <td className="p-3">
                      <select
                        value={currentStatus}
                        onChange={(e) => updateStatusQuick(lead.id || "", e.target.value)}
                        className={`text-[10px] font-mono uppercase font-bold border px-2 py-1 ${getStatusBadge(
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

                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {lead.createdAt
                        ? new Date(String(lead.createdAt)).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openLeadModal(lead)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 transition-colors"
                          title="View & Edit CRM"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(lead.id || "", lead.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                          title="Delete"
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

      {/* Viewing / Editing Lead Modal */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl my-8 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black uppercase text-slate-900 font-display">
                    {viewingLead.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-mono text-xs font-bold">
                    #HB-{(viewingLead.id || "").slice(-6).toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border rounded-md ${getStatusBadge(
                      editStatus
                    )}`}
                  >
                    {editStatus}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Reference: #HB-{(viewingLead.id || "").slice(-6).toUpperCase()} · Received:{" "}
                  {viewingLead.createdAt
                    ? new Date(String(viewingLead.createdAt)).toLocaleString("en-IN")
                    : "—"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Information Cards */}
            {(() => {
              const { location, preferredContact, cleanMessage } = parseLeadMeta(viewingLead.message);
              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Direct Phone
                      </span>
                      <a
                        href={`tel:${viewingLead.phone}`}
                        className="font-mono font-bold text-amber-700 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{viewingLead.phone}</span>
                      </a>
                    </div>

                    <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Email Address
                      </span>
                      <span className="font-mono text-slate-800 truncate block">
                        {viewingLead.email || "Not Provided"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Site Location
                      </span>
                      <span className="font-mono text-slate-800 truncate block">
                        {location || "Bhilwara / Rajasthan"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Preferred Contact
                      </span>
                      <span className="font-mono text-amber-800 font-bold truncate block">
                        {preferredContact || "Phone Call"}
                      </span>
                    </div>
                  </div>

                  {/* Selected Services Multi-Service Display */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                          Selected Services ({parseSelectedServices(viewingLead.selectedService).length}/4)
                        </span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-md uppercase">
                        Hind Build Trades
                      </span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {parseSelectedServices(viewingLead.selectedService).map((srv, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{srv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Problem Description / Message */}
                  <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                      Customer Message / Project Scope
                    </span>
                    <p className="text-slate-700 leading-relaxed italic bg-white p-3 border border-slate-200 rounded-lg">
                      {cleanMessage || "No additional message provided."}
                    </p>
                  </div>
                </>
              );
            })()}

            {/* CRM Workflow Parameters Form */}
            <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                <span>Lead Workflow &amp; Quotation Controls</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Lead Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border border-slate-300 p-2 bg-white rounded-lg font-mono font-bold uppercase focus:outline-amber-500"
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
                    className="w-full border border-slate-300 p-2 bg-white rounded-lg font-mono font-bold uppercase focus:outline-amber-500"
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
                    Assigned Supervisor / Engineer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Er. Sharma (Site Lead)"
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="w-full border border-slate-300 p-2 bg-white rounded-lg focus:outline-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Quotation Amount (INR ₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={editQuotationAmount}
                    onChange={(e) => setEditQuotationAmount(e.target.value)}
                    className="w-full border border-slate-300 p-2 bg-white rounded-lg font-mono focus:outline-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={saveLeadDetails}
                  disabled={savingDetails}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-xs"
                >
                  {savingDetails ? "Saving Details..." : "Update CRM Parameters"}
                </button>
              </div>
            </div>

            {/* Internal Engineering Notes */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Internal Notes &amp; Inspection Audit Log</span>
              </h4>

              {/* Notes Timeline */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {parseNotes(viewingLead.internalNotes).length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    No internal notes yet. Use the field below to document site inspection findings, client callbacks, or quotation revisions.
                  </p>
                ) : (
                  parseNotes(viewingLead.internalNotes).map((note, idx) => (
                    <div
                      key={note.id || idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span className="font-bold text-slate-800">{note.author || "Supervisor"}</span>
                        <span>{note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}</span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{(note as any).note || (note as any).content || ""}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add private internal supervisor note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitNote();
                    }
                  }}
                  className="flex-1 text-xs border border-slate-300 p-2 bg-slate-50 rounded-lg focus:bg-white focus:outline-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={submitNote}
                  disabled={addingNote || !newNote.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 inline-flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>{addingNote ? "Adding..." : "Add Note"}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-between items-center border-t border-slate-200">
              <span className="text-[10px] font-mono text-slate-400">
                Source: {viewingLead.source || "hbs_website"}
              </span>
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase rounded-lg transition-all"
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
