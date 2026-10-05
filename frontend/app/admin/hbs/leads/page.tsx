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
  Download
} from "lucide-react";
import type { HbsLead } from "@/lib/types";

export default function HbsAdminLeads() {
  const [leads, setLeads] = useState<HbsLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingLead, setViewingLead] = useState<HbsLead | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  const loadLeads = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/leads", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setLeads(json.data);
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

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.selectedService && l.selectedService.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
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
        }
      }
    } catch (e) {
      console.error(e);
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
    const headers = ["Name", "Phone", "Email", "Service", "Status", "Date", "Message"];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email || ""}"`,
      `"${(l.selectedService || "").replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.createdAt ? new Date(String(l.createdAt)).toLocaleDateString() : ""}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hbs_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            CRM & Quote Inquiries
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
            HBS Customer Leads & Quotes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Inquiries generated from public HBS quote forms, service booking popups, and phone callbacks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLeads}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={leads.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors uppercase tracking-wider disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, phone, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 focus:bg-white focus:outline-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {["all", "new", "contacted", "in_progress", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-mono uppercase font-bold transition-colors ${
                statusFilter === st
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Direct Contact</th>
              <th className="p-3">Service Requested</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No inquiries found matching current filters.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const cleanPhone = lead.phone.replace(/[^\d]/g, "");
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                      {lead.email && (
                        <div className="text-slate-400 text-[11px] font-mono">{lead.email}</div>
                      )}
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
                          href={`https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodeURIComponent(
                            `Hello ${lead.name}, thank you for contacting Hind Building Solutions (HBS). How can our engineering team assist you?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded-none hover:bg-green-200 flex items-center gap-1"
                          title="Open WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-green-700" />
                          <span>WA</span>
                        </a>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {lead.selectedService || "General Evaluation"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {lead.createdAt ? new Date(String(lead.createdAt)).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : "—"}
                    </td>
                    <td className="p-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id || "", e.target.value)}
                        className={`text-[11px] font-mono uppercase font-bold border px-2 py-1 ${
                          lead.status === "new"
                            ? "bg-amber-50 border-amber-300 text-amber-900"
                            : lead.status === "completed"
                            ? "bg-green-50 border-green-300 text-green-900"
                            : "bg-blue-50 border-blue-300 text-blue-900"
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingLead(lead)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 transition-colors"
                          title="View Details"
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

      {/* Viewing Lead Modal */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900 font-display">
                  Inquiry Details
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  Received: {viewingLead.createdAt ? new Date(String(viewingLead.createdAt)).toLocaleString() : "—"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                    Customer Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{viewingLead.name}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                    Status
                  </span>
                  <span className="font-bold text-amber-700 uppercase font-mono">
                    {viewingLead.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Phone & Contact
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">{viewingLead.phone}</span>
                  {viewingLead.email && (
                    <span className="text-slate-500 font-mono">({viewingLead.email})</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Requested Service
                </span>
                <span className="font-semibold text-slate-900">
                  {viewingLead.selectedService || "General Site Evaluation"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Problem Description / Message
                </span>
                <p className="text-slate-700 leading-relaxed italic bg-white p-3 border border-slate-200">
                  {viewingLead.message || "No additional message provided."}
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400">
                  Source: {viewingLead.source || "hbs_website"}
                </span>
                <button
                  type="button"
                  onClick={() => setViewingLead(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
