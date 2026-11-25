"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CheckCircle,
  Eye,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Building2,
  X,
  ExternalLink,
  Trash2,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import QuickMailModal, { QuickMailRecipient } from "@/components/admin/QuickMailModal";
import { getAdminCache, setAdminCache } from "@/lib/adminCache";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);

  // Deletion state
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [successBanner, setSuccessBanner] = useState("");
  const [mailRecipient, setMailRecipient] = useState<QuickMailRecipient | null>(null);

  const openContactMail = (c: Contact) => {
    if (!c.email) return;
    setMailRecipient({
      name: c.name || "Client",
      email: c.email,
      phone: c.phone,
      leadId: c.id,
      leadType: "contact",
      brand: "hipro",
      triggerKey: "contact_inquiries",
      contextBadge: c.service || "General Inquiry",
      defaultNextStatus: "replied",
    });
  };

  const fetchContacts = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        setContacts(json.data);
        setAdminCache("admin:contacts_list", json.data);
      } else {
        setError(json.error || "Failed to load contacts");
      }
    } catch {
      setError("Network error connecting to inquiries service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = getAdminCache<Contact[]>("admin:contacts_list");
    if (cached) {
      setContacts(cached);
      setLoading(false);
    }
    fetchContacts(!cached);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      if (selected && selected.id === id) {
        setSelected((prev) => (prev ? { ...prev, status } : null));
      }
    } catch {
      /* silent */
    }
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/contact/${contactToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => prev.filter((c) => c.id !== contactToDelete.id));
        if (selected && selected.id === contactToDelete.id) {
          setSelected(null);
        }
        setSuccessBanner(`Inquiry from "${contactToDelete.name || "Client"}" has been permanently deleted.`);
        setContactToDelete(null);
        setTimeout(() => setSuccessBanner(""), 4500);
      } else {
        setDeleteError(data.error || "Failed to delete message");
      }
    } catch (err: any) {
      setDeleteError(err.message || "Network error while deleting message");
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const total = contacts.length;
    const newCount = contacts.filter((c) => c.status === "new" || !c.status).length;
    const read = contacts.filter((c) => c.status === "read").length;
    const replied = contacts.filter((c) => c.status === "replied").length;
    return { total, newCount, read, replied };
  }, [contacts]);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchFilter =
        filter === "all"
          ? true
          : filter === "new"
          ? c.status === "new" || !c.status
          : c.status === filter;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.service?.toLowerCase().includes(q) ||
        c.message?.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [contacts, filter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* ── Top Header Glass Breadcrumb ───────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.03)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                href="/admin/hipro"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-all shadow-2xs group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to HiPRO Overview</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Civil Inquiries Radar
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Direct Client Inquiries &amp; Consultations
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
              Inbound messages and consultation requests submitted through the official HiPRO web portal.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => fetchContacts(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Summary Bento Bar ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "All Inquiries", count: stats.total, filterKey: "all", color: "text-slate-900 bg-slate-50" },
          { label: "New Messages", count: stats.newCount, filterKey: "new", color: "text-blue-700 bg-blue-50" },
          { label: "Reviewed / Read", count: stats.read, filterKey: "read", color: "text-amber-700 bg-amber-50" },
          { label: "Replied / Closed", count: stats.replied, filterKey: "replied", color: "text-emerald-700 bg-emerald-50" },
        ].map((s) => {
          const isActive = filter === s.filterKey;
          return (
            <button
              key={s.filterKey}
              onClick={() => setFilter(s.filterKey)}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                isActive
                  ? "bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-sm"
                  : "bg-white/80 hover:bg-white border-slate-200/70 shadow-2xs"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {s.label}
              </p>
              <p className="text-xl font-black text-slate-900 font-display mt-0.5">
                {s.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar: Search & Filter Tabs ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, email, service..."
            className="w-full bg-white/90 border border-slate-200/80 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 overflow-x-auto w-full sm:w-auto">
          {["all", "new", "read", "replied"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                filter === s
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner("")} className="text-xs uppercase font-bold text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-sm flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs uppercase font-bold text-red-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Table Glass Container ─────────────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_30px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/70 text-slate-500 text-[11px] font-mono uppercase tracking-wider">
                <th className="px-5 py-3.5 font-bold">Client / Organization</th>
                <th className="px-5 py-3.5 font-bold">Requested Service</th>
                <th className="px-5 py-3.5 font-bold">Inquiry Message</th>
                <th className="px-5 py-3.5 font-bold text-center">Status</th>
                <th className="px-5 py-3.5 font-bold">Submitted Date</th>
                <th className="px-5 py-3.5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded-xl w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-16">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No contact inquiries found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery || filter !== "all"
                        ? "Try clearing your search or status filter."
                        : "Client messages submitted via hindustanprojects.in/contact will appear here."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-blue-100 shadow-2xs">
                            {c.name ? c.name.charAt(0) : "C"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{c.name || "Anonymous Client"}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.email || c.phone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-slate-100/90 text-slate-800 text-xs font-semibold rounded-full border border-slate-200/60 inline-flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-blue-600" />
                          <span>{c.service || "General Turnkey"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-slate-600 text-xs truncate font-medium">
                          {c.message || "No message body provided."}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <StatusBadge status={c.status || "new"} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelected(c);
                              if (c.status === "new" || !c.status) {
                                updateStatus(c.id, "read");
                              }
                            }}
                            title="View Full Inquiry"
                            className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {c.email && (
                            <button
                              onClick={() => openContactMail(c)}
                              title="Send Official Email Reply"
                              className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {c.status !== "replied" && (
                            <button
                              onClick={() => updateStatus(c.id, "replied")}
                              title="Mark as Replied"
                              className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setDeleteError("");
                              setContactToDelete(c);
                            }}
                            title="Delete Inquiry"
                            className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-400 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
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

        <div className="px-5 py-3.5 border-t border-slate-200/70 bg-slate-50/50 text-slate-500 text-xs font-medium flex items-center justify-between">
          <span className="font-mono text-[11px]">{filtered.length} inquiries shown</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {stats.newCount} new • {stats.read} read • {stats.replied} replied
          </span>
        </div>
      </div>

      {/* ── Detail Drawer Modal ───────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                  Civil Consultation Inquiry
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  {selected.name || "Anonymous Client"}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px]">Email</span>
                <p className="font-semibold text-slate-900 truncate mt-0.5">
                  {selected.email ? (
                    <button
                      type="button"
                      onClick={() => openContactMail(selected)}
                      className="text-blue-600 hover:underline font-semibold text-left truncate max-w-full cursor-pointer"
                    >
                      {selected.email}
                    </button>
                  ) : "—"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px]">Phone</span>
                <p className="font-semibold text-slate-900 truncate mt-0.5">
                  {selected.phone ? (
                    <a href={`tel:${selected.phone}`} className="text-blue-600 hover:underline">
                      {selected.phone}
                    </a>
                  ) : "—"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px]">Requested Service</span>
                <p className="font-semibold text-slate-900 truncate mt-0.5">{selected.service || "General"}</p>
              </div>
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px]">Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={selected.status || "new"} />
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1.5">Inquiry Message</span>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {selected.message || "No text provided."}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-mono">
                {selected.createdAt ? new Date(selected.createdAt).toLocaleString("en-IN") : ""}
              </span>
              <div className="flex items-center gap-2">
                {selected.email && (
                  <button
                    type="button"
                    onClick={() => openContactMail(selected)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Mail</span>
                  </button>
                )}
                {selected.status !== "replied" && (
                  <button
                    onClick={() => updateStatus(selected.id, "replied")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                  >
                    Mark Replied
                  </button>
                )}
                <button
                  onClick={() => {
                    setDeleteError("");
                    setContactToDelete(selected);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Apple Cupertino Glassmorphic Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!contactToDelete}
        title="Delete Contact Inquiry?"
        description="Are you sure you want to permanently delete this client inquiry? This record will be erased from PostgreSQL database and cannot be recovered."
        recordDetail={
          contactToDelete
            ? {
                title: contactToDelete.name || "Anonymous Client",
                subtitle: contactToDelete.email || contactToDelete.phone || "No contact info",
                tag: contactToDelete.service || "General Inquiry",
                date: contactToDelete.createdAt ? new Date(contactToDelete.createdAt).toLocaleDateString("en-IN") : undefined,
              }
            : undefined
        }
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteContact}
        onCancel={() => {
          if (!isDeleting) {
            setContactToDelete(null);
            setDeleteError("");
          }
        }}
      />

      <QuickMailModal
        isOpen={Boolean(mailRecipient)}
        onClose={() => setMailRecipient(null)}
        recipient={mailRecipient}
        onSentSuccess={({ email, updatedStatus }) => {
          if (updatedStatus && mailRecipient?.leadId) {
            setContacts((prev) =>
              prev.map((c) => (c.id === mailRecipient.leadId ? { ...c, status: updatedStatus } : c))
            );
            if (selected?.id === mailRecipient.leadId) {
              setSelected((prev) => (prev ? { ...prev, status: updatedStatus } : null));
            }
          }
          setSuccessBanner(`Official email reply delivered to ${email}!`);
          setTimeout(() => setSuccessBanner(""), 4000);
        }}
      />
    </div>
  );
}
