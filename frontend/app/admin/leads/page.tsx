"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  RefreshCw,
  Search,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Eye,
  Trash2,
  CheckCircle,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Briefcase,
  FileText,
  Calculator,
  User,
  Clock,
  Calendar,
  Building,
  ArrowUpDown,
  Download
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

export interface UnifiedLead {
  id: string;
  type: "contact" | "quote" | "estimator" | "project" | "service" | "application" | "newsletter";
  source: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  details: {
    service?: string;
    projectType?: string;
    budget?: string;
    location?: string;
    timeline?: string;
    role?: string;
    experience?: string;
    cvUrl?: string;
    message?: string;
    description?: string;
    active?: boolean;
    [key: string]: any;
  };
}

interface LeadCounts {
  all: number;
  contact: number;
  quote: number;
  estimator: number;
  project: number;
  service: number;
  application: number;
  newsletter: number;
  new: number;
  archived: number;
}

const TYPE_CONFIG = {
  all: { label: "All Leads", icon: MessageSquare, color: "text-slate-600 bg-slate-100" },
  contact: { label: "Contact Inquiries", icon: Mail, color: "text-blue-700 bg-blue-50 border-blue-200" },
  quote: { label: "Quote Requests", icon: FileText, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  estimator: { label: "Cost Estimates", icon: Calculator, color: "text-amber-700 bg-amber-50 border-amber-200" },
  application: { label: "Job Applications", icon: Briefcase, color: "text-purple-700 bg-purple-50 border-purple-200" },
  newsletter: { label: "Newsletter", icon: User, color: "text-teal-700 bg-teal-50 border-teal-200" },
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New / Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "in_progress", label: "In Progress" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [counts, setCounts] = useState<LeadCounts>({
    all: 0,
    contact: 0,
    quote: 0,
    estimator: 0,
    project: 0,
    service: 0,
    application: 0,
    newsletter: 0,
    new: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  // Filters & Pagination
  const [activeType, setActiveType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Detail Modal / Drawer
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null);

  // Safe Delete Modal
  const [deleteModalLead, setDeleteModalLead] = useState<UnifiedLead | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status updating indicator
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch leads from Unified Leads API
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeType && activeType !== "all") params.set("type", activeType);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      params.set("page", page.toString());
      params.set("limit", "20");
      params.set("sort", sortOrder);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch leads: Server responded with ${res.status}`);
      }
      const json = await res.json();
      if (json.success) {
        setLeads(json.data || []);
        if (json.counts) setCounts(json.counts);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalLeads(json.pagination.total || 0);
        }
      } else {
        setError(json.error || "Could not retrieve leads");
      }
    } catch (err: any) {
      setError(err.message || "Network error: Unable to load leads");
    } finally {
      setLoading(false);
    }
  }, [activeType, statusFilter, debouncedSearch, page, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Quick or detail status update
  const handleStatusChange = async (lead: UnifiedLead, newStatus: string) => {
    setUpdatingId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, type: lead.type }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
        );
        if (selectedLead?.id === lead.id) {
          setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setSuccessBanner(`Lead marked as ${newStatus.replace(/_/g, " ")}`);
        setTimeout(() => setSuccessBanner(""), 3000);
      } else {
        alert(data.error || "Failed to update lead status");
      }
    } catch (e: any) {
      alert("Network error: Could not update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Safe Deletion
  const confirmDelete = async () => {
    if (!deleteModalLead) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${deleteModalLead.id}?type=${deleteModalLead.type}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessBanner("Lead safely deleted");
        setTimeout(() => setSuccessBanner(""), 3000);
        if (selectedLead?.id === deleteModalLead.id) {
          setSelectedLead(null);
        }
        setDeleteModalLead(null);
        fetchLeads();
      } else {
        alert(data.error || "Failed to delete lead");
      }
    } catch {
      alert("Network error while deleting lead");
    } finally {
      setDeleting(false);
    }
  };

  // Clean phone helper for tel and WhatsApp
  const cleanPhone = (phoneStr: string) => {
    return (phoneStr || "").replace(/[^\d+]/g, "");
  };

  const getWhatsAppLink = (lead: UnifiedLead) => {
    const rawDigits = (lead.phone || "").replace(/\D/g, "");
    if (!rawDigits) return "#";
    // If 10 digits (India standard), prefix 91
    const intlNumber = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
    const greeting = encodeURIComponent(
      `Hello ${lead.name || ""}, thank you for reaching out to Hindustan Projects regarding your ${
        lead.details?.service || lead.details?.projectType || "enquiry"
      }. How can we assist you today?`
    );
    return `https://wa.me/${intlNumber}?text=${greeting}`;
  };

  const getMailtoLink = (lead: UnifiedLead) => {
    if (!lead.email) return "#";
    const subject = encodeURIComponent(`Regarding your enquiry with Hindustan Projects`);
    const body = encodeURIComponent(
      `Hi ${lead.name || "there"},\n\nThank you for contacting Hindustan Projects.\n\nWe received your request:\n"${
        lead.details?.message || lead.details?.description || "Inquiry"
      }"\n\nBest regards,\nHindustan Projects Team`
    );
    return `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-construction-red uppercase tracking-widest font-mono">
            <span>Management Console</span>
            <span>/</span>
            <span>Leads & Enquiries</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-display">
            Lead Management Hub
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Real-time pipeline connecting website forms, quote requests, cost estimates, and applications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchLeads()}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Hub</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner("")} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold uppercase tracking-wider scrollbar-none">
        {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map((t) => {
          const cfg = TYPE_CONFIG[t];
          const Icon = cfg.icon;
          const count =
            t === "all"
              ? counts.all
              : t === "contact"
              ? counts.contact
              : t === "quote"
              ? counts.quote
              : t === "estimator"
              ? counts.estimator
              : t === "application"
              ? counts.application
              : counts.newsletter;
          const isActive = activeType === t;

          return (
            <button
              key={t}
              onClick={() => {
                setActiveType(t);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-construction-navy text-construction-navy bg-white shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-construction-red" : "text-slate-400"}`} />
              <span>{cfg.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? "bg-construction-navy text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone, keyword, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-construction-navy focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700 focus:bg-white focus:border-construction-navy focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold ml-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700 focus:bg-white focus:border-construction-navy focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Leads Table / Cards Container */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        {loading && leads.length === 0 ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 w-full" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-slate-900 font-bold text-sm">No Leads Found</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || activeType !== "all"
                ? "No form submissions match the selected search or filter criteria."
                : "New website form submissions will automatically populate here in real time."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold font-mono">
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Type & Source</th>
                    <th className="py-3 px-4">Subject / Preview</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => {
                    const typeCfg = TYPE_CONFIG[lead.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.contact;
                    const previewText =
                      lead.details?.service ||
                      lead.details?.projectType ||
                      lead.details?.role ||
                      lead.details?.message ||
                      lead.details?.description ||
                      "—";

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          selectedLead?.id === lead.id ? "bg-slate-50 border-l-2 border-l-construction-navy" : ""
                        }`}
                      >
                        {/* Contact Name & Email */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="font-bold text-slate-900 hover:text-construction-navy text-left block"
                          >
                            {lead.name}
                          </button>
                          <div className="flex flex-col text-slate-500 text-[11px] mt-0.5 space-y-0.5">
                            {lead.email && <span className="truncate max-w-[200px]">{lead.email}</span>}
                            {lead.phone && <span className="font-mono text-slate-600">{lead.phone}</span>}
                          </div>
                        </td>

                        {/* Type & Source */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${typeCfg.color}`}
                          >
                            <typeCfg.icon className="w-3 h-3" />
                            {lead.type.toUpperCase()}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[170px]" title={lead.source}>
                            {lead.source}
                          </p>
                        </td>

                        {/* Subject / Preview */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-700 truncate font-medium text-[12px]">{previewText}</p>
                          {lead.details?.budget && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 font-bold uppercase mt-1 inline-block">
                              Budget: {lead.details.budget}
                            </span>
                          )}
                        </td>

                        {/* Status with Quick Select */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={lead.status}
                              disabled={updatingId === lead.id}
                              onChange={(e) => handleStatusChange(lead, e.target.value)}
                              className="text-[11px] font-bold uppercase tracking-wider bg-transparent border border-slate-200 px-2 py-1 focus:outline-none focus:border-construction-navy cursor-pointer"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="in_progress">In Progress</option>
                              <option value="converted">Converted</option>
                              <option value="closed">Closed</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              title="View Details"
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {lead.email && (
                              <a
                                href={getMailtoLink(lead)}
                                title="Reply via Email"
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {lead.phone && (
                              <>
                                <a
                                  href={`tel:${cleanPhone(lead.phone)}`}
                                  title="Call Lead"
                                  className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={getWhatsAppLink(lead)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp"
                                  className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </>
                            )}

                            <button
                              onClick={() => setDeleteModalLead(lead)}
                              title="Safe Delete"
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards (Visible on screen < 1024px) */}
            <div className="block lg:hidden divide-y divide-slate-200">
              {leads.map((lead) => {
                const typeCfg = TYPE_CONFIG[lead.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.contact;
                const previewText =
                  lead.details?.service ||
                  lead.details?.projectType ||
                  lead.details?.role ||
                  lead.details?.message ||
                  lead.details?.description ||
                  "—";

                return (
                  <div key={lead.id} className="p-4 space-y-3 hover:bg-slate-50 transition-colors">
                    {/* Top Row: Type & Date */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${typeCfg.color}`}
                      >
                        <typeCfg.icon className="w-3 h-3" />
                        {lead.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Middle Row: Name and Summary */}
                    <div>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="font-bold text-slate-900 text-sm text-left hover:text-construction-navy"
                      >
                        {lead.name}
                      </button>
                      <p className="text-slate-600 text-xs mt-0.5 line-clamp-2">{previewText}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500 text-[11px] mt-2">
                        {lead.email && <span className="truncate max-w-[180px]">{lead.email}</span>}
                        {lead.phone && <span className="font-mono text-slate-700">{lead.phone}</span>}
                      </div>
                    </div>

                    {/* Bottom Row: Quick Status & Direct Contact Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead, e.target.value)}
                        className="text-[11px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 px-2 py-1 focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                      </select>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800"
                        >
                          View
                        </button>
                        {lead.email && (
                          <a
                            href={`/admin/automail/compose?to=${encodeURIComponent(lead.email)}&name=${encodeURIComponent(lead.name || "")}&brand=${lead.source?.toLowerCase().includes("hbs") ? "hbs" : "hipro"}&template=lead_inquiry_followup`}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                            title="Send Email via AutoMail Studio"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={getWhatsAppLink(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setDeleteModalLead(lead)}
                          className="p-1.5 text-red-500 bg-red-50 border border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Server-Side Pagination Footer */}
        {totalLeads > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-900">{(page - 1) * 20 + 1}</span> to{" "}
              <span className="font-bold text-slate-900">
                {Math.min(page * 20, totalLeads)}
              </span>{" "}
              of <span className="font-bold text-slate-900">{totalLeads}</span> leads
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-2 font-mono font-bold text-slate-700">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER (PHASE 9) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="relative w-full max-w-xl bg-white h-full min-h-screen shadow-2xl flex flex-col border-l border-slate-200 animate-slideInRight">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      (TYPE_CONFIG[selectedLead.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.contact).color
                    }`}
                  >
                    {selectedLead.type.toUpperCase()}
                  </span>
                  <StatusBadge status={selectedLead.status} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
                  {selectedLead.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedLead.id}</p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs">
              {/* Status Selector */}
              <div className="bg-slate-50 p-4 border border-slate-200 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Lead Pipeline Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {["new", "contacted", "in_progress", "converted", "closed", "archived"].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedLead, st)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                        selectedLead.status === st
                          ? "bg-construction-navy text-white border-construction-navy shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                    <span className="font-semibold text-slate-900 break-all">{selectedLead.email || "—"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
                    <span className="font-semibold text-slate-900 font-mono">{selectedLead.phone || "—"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Source</span>
                    <span className="font-semibold text-slate-800">{selectedLead.source}</span>
                  </div>
                </div>
              </div>

              {/* Type-Specific Details */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                  Enquiry Details
                </h4>

                {/* Service / Project Type */}
                {(selectedLead.details?.service || selectedLead.details?.projectType) && (
                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Service / Project Category
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedLead.details.service || selectedLead.details.projectType}
                    </span>
                  </div>
                )}

                {/* Budget, Location, Timeline */}
                {(selectedLead.details?.budget ||
                  selectedLead.details?.location ||
                  selectedLead.details?.timeline) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedLead.details.budget && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-100">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Budget</span>
                        <span className="font-bold text-emerald-900">{selectedLead.details.budget}</span>
                      </div>
                    )}
                    {selectedLead.details.location && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                        <span className="font-semibold text-slate-800">{selectedLead.details.location}</span>
                      </div>
                    )}
                    {selectedLead.details.timeline && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Timeline</span>
                        <span className="font-semibold text-slate-800">{selectedLead.details.timeline}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Job Applicant Details */}
                {(selectedLead.details?.role || selectedLead.details?.experience || selectedLead.details?.cvUrl) && (
                  <div className="p-3 bg-purple-50 border border-purple-100 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase font-bold text-purple-800">Job Role</span>
                      <span className="font-bold text-purple-900">{selectedLead.details.role}</span>
                    </div>
                    {selectedLead.details.experience && (
                      <div className="flex justify-between text-xs">
                        <span className="text-purple-700">Experience:</span>
                        <span className="font-semibold text-purple-900">{selectedLead.details.experience}</span>
                      </div>
                    )}
                    {selectedLead.details.cvUrl && (
                      <div className="pt-2 border-t border-purple-200 flex justify-between items-center">
                        <span className="text-purple-800 font-semibold">Resume / CV</span>
                        <a
                          href={selectedLead.details.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 underline hover:text-purple-900"
                        >
                          <Download className="w-3.5 h-3.5" /> View / Download
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Message or Description */}
                {(selectedLead.details?.message || selectedLead.details?.description) && (
                  <div className="p-4 bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Submitted Message / Requirements
                    </span>
                    <p className="text-slate-800 text-xs whitespace-pre-wrap leading-relaxed">
                      {selectedLead.details.message || selectedLead.details.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="border-t border-slate-200 pt-4 flex flex-col gap-1 text-[11px] text-slate-400 font-mono">
                <div>
                  Created: {new Date(selectedLead.createdAt).toLocaleString("en-IN")}
                </div>
                {selectedLead.updatedAt && (
                  <div>
                    Last Updated: {new Date(selectedLead.updatedAt).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Buttons (PHASE 10) */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedLead.email && (
                  <>
                    <a
                      href={`/admin/automail/compose?to=${encodeURIComponent(selectedLead.email)}&name=${encodeURIComponent(selectedLead.name || "")}&brand=${selectedLead.source?.toLowerCase().includes("hbs") ? "hbs" : "hipro"}&template=lead_inquiry_followup`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs shadow-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> Send AutoMail
                    </a>
                  </>
                )}

                {selectedLead.phone && (
                  <>
                    <a
                      href={`tel:${cleanPhone(selectedLead.phone)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-xs shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <a
                      href={getWhatsAppLink(selectedLead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </>
                )}
              </div>

              <button
                onClick={() => setDeleteModalLead(selectedLead)}
                className="inline-flex items-center gap-1 px-3 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 font-bold uppercase tracking-wider text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAFE DELETION CONFIRMATION DIALOG (PHASE 15 & 16) */}
      {deleteModalLead && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-500 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Confirm Lead Deletion</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 text-xs space-y-1.5">
              <p>
                <strong className="text-slate-900">Name:</strong> {deleteModalLead.name}
              </p>
              {deleteModalLead.email && (
                <p>
                  <strong className="text-slate-900">Email:</strong> {deleteModalLead.email}
                </p>
              )}
              {deleteModalLead.phone && (
                <p>
                  <strong className="text-slate-900">Phone:</strong> {deleteModalLead.phone}
                </p>
              )}
              <p>
                <strong className="text-slate-900">Type:</strong>{" "}
                <span className="font-mono uppercase font-bold">{deleteModalLead.type}</span>
              </p>
              <p className="text-slate-400 font-mono text-[10px]">ID: {deleteModalLead.id}</p>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this lead record from the database?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalLead(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
