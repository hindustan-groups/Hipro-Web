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
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";

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

      if (res.status === 401 || (res.redirected && res.url.includes("admin-login"))) {
        window.location.href = "/admin-login";
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return;

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
    <div className="space-y-6">
      {/* Apple Page Header */}
      <EmpanelmentAdminPageHeader
        badge="Empanelment Desk"
        title="Vendor Support Tickets"
        description="Review queries, statutory verification requests, and dispatch official procurement replies."
        breadcrumbs={[
          { label: "Empanelment", href: "/admin/empanelment" },
          { label: "Support Tickets" },
        ]}
        actions={
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition-colors shadow-xs disabled:opacity-50"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
          </button>
        }
      />

      {/* Apple Bento KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{tickets.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All tickets logged</div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Open / Pending</div>
          <div className="text-2xl font-black text-amber-800 mt-1 font-mono">{openCount}</div>
          <div className="text-[11px] text-amber-800/70 mt-0.5 font-medium">Awaiting response</div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Urgent (Site Halt)</div>
          <div className="text-2xl font-black text-rose-700 mt-1 font-mono">{urgentCount}</div>
          <div className="text-[11px] text-rose-600/70 mt-0.5 font-medium">Requires priority attention</div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Resolved</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-700/70 mt-0.5 font-medium">Closed queries</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white/80 backdrop-blur-2xl p-4 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticket no, vendor company, tracking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-2xl border border-slate-200/80 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
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
            className="px-3.5 py-2 text-xs font-semibold rounded-2xl border border-slate-200/80 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
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
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            Loading tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">No support tickets found</p>
            <p className="text-xs text-slate-400">Tickets submitted by empanelled vendors will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Ticket No</th>
                  <th className="py-3.5 px-5">Vendor &amp; Contact</th>
                  <th className="py-3.5 px-5">Subject &amp; Message</th>
                  <th className="py-3.5 px-5">Priority</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md inline-block border border-slate-200/50">
                        {ticket.ticketNo}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{ticket.vendor?.companyName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{ticket.vendor?.contactName}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span>{ticket.vendor?.phone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{ticket.subject}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {ticket.message}
                      </div>
                      {ticket.adminReply && (
                        <div className="text-[10px] text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 mt-1 line-clamp-1 font-medium">
                          Reply: {ticket.adminReply}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ticket.priority === "URGENT"
                            ? "bg-rose-500/10 text-rose-800 border border-rose-500/20"
                            : ticket.priority === "HIGH"
                            ? "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="py-4 px-5 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ticket.status === "RESOLVED"
                            ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                            : ticket.status === "OPEN"
                            ? "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                            : "bg-slate-100 text-slate-700 border border-slate-200/60"
                        }`}
                      >
                        {ticket.status?.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-4 px-5 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenReply(ticket)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-[0.98]"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-900 border border-amber-200/70">
                  {activeTicket.ticketNo}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{activeTicket.subject}</h3>
                <p className="text-xs text-slate-500">
                  {activeTicket.vendor?.companyName} ({activeTicket.vendor?.contactName})
                </p>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vendor Original Message */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Vendor Message:
              </span>
              {activeTicket.message}
            </div>

            <form onSubmit={handleSaveReply} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Procurement Response *
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your response to the contractor..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Update Ticket Status
                </label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                >
                  <option value="OPEN">Keep Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Save &amp; Dispatch Reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
