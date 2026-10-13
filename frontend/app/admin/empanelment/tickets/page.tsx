"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  Loader2,
  ShieldAlert,
  Building,
  User,
  Phone,
} from "lucide-react";

interface Ticket {
  id: string;
  ticketNo: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    tier: string;
    trackingId: string;
  };
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Reply Modal
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("RESOLVED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/empanelment/admin/tickets?";
      if (statusFilter !== "ALL") url += `status=${statusFilter}&`;
      if (priorityFilter !== "ALL") url += `priority=${priorityFilter}&`;

      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenReply = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setReplyText(ticket.adminReply || "");
    setReplyStatus(ticket.status === "OPEN" ? "RESOLVED" : ticket.status);
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/empanelment/admin/tickets/${activeTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          adminReply: replyText,
          status: replyStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveTicket(null);
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to save reply:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.ticketNo.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.vendor?.companyName.toLowerCase().includes(q) ||
      t.vendor?.trackingId.toLowerCase().includes(q)
    );
  });

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const urgentCount = tickets.filter((t) => t.priority === "URGENT" && t.status !== "RESOLVED").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              EMPANELMENT DESK
            </span>
            <span className="text-xs text-slate-400 font-semibold">&bull; Helpdesk & Support</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
            Vendor Support Tickets
          </h1>
          <p className="text-xs text-slate-500">
            Review queries, statutory verification requests, and respond to empanelled vendors.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Tickets</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{tickets.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/30">
          <div className="text-[10px] font-bold text-amber-700 uppercase">Open / Pending</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{openCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-2xs bg-red-50/30">
          <div className="text-[10px] font-bold text-red-700 uppercase">Urgent (Site Halt)</div>
          <div className="text-2xl font-extrabold text-red-700 mt-1">{urgentCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/30">
          <div className="text-[10px] font-bold text-emerald-700 uppercase">Resolved</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{resolvedCount}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ticket no, vendor company, tracking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            Loading tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No support tickets match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Vendor & Contact</th>
                  <th className="py-3 px-4">Subject & Message</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{ticket.ticketNo}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ticket.vendor?.companyName}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{ticket.vendor?.contactName}</span>
                        <span>&bull;</span>
                        <span>{ticket.vendor?.phone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-800 line-clamp-1">{ticket.subject}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {ticket.message}
                      </div>
                      {ticket.adminReply && (
                        <div className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 line-clamp-1">
                          Reply: {ticket.adminReply}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ticket.priority === "URGENT"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : ticket.priority === "HIGH"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ticket.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : ticket.status === "OPEN"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenReply(ticket)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
                      >
                        {ticket.adminReply ? "Edit Reply" : "Reply"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {activeTicket.ticketNo}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{activeTicket.subject}</h3>
                <p className="text-xs text-slate-500">
                  {activeTicket.vendor?.companyName} ({activeTicket.vendor?.contactName})
                </p>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Vendor Original Message */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Vendor Message:
              </span>
              {activeTicket.message}
            </div>

            <form onSubmit={handleSaveReply} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Official Procurement Directorate Reply *
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your response to the contractor..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Update Ticket Status
                </label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="OPEN">Keep Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Dispatch Reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
