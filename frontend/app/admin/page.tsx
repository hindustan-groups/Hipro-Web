"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Inbox,
  ClipboardList,
  Users,
  Building2,
  HardHat,
  Briefcase,
  Mail,
  Send,
  Layers,
  LayoutTemplate,
  Info,
  MapPin,
  Settings,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
  Activity,
  CheckCircle2,
  Globe,
  RefreshCw,
  FolderOpen,
  Star,
  FileText,
  Compass,
  KeyRound,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Flame,
  UserCheck,
  Check,
} from "lucide-react";
import { getAdminCache, setAdminCache } from "@/lib/adminCache";

interface ExecutiveData {
  executive: {
    totalInquiries: number;
    pendingActions: number;
    activePortalsCount: number;
    systemHealth: string;
  };
  hipro: {
    projects: { total: number; active: number; featured: number };
    services: { total: number; active: number };
    quotes: { total: number; pending: number; approved: number };
    contacts: { total: number; new: number; replied: number };
    blogs: { total: number; published: number };
    careers: { total: number; new: number };
  };
  hbs: {
    leads: { total: number; new: number; converted: number };
    services: { total: number };
    projects: { total: number };
  };
  vendorHub: {
    applications: { total: number; submitted: number; approved: number };
    tenders: { total: number; active: number };
    gatePasses: { total: number; today: number };
  };
  automail: {
    campaigns: number;
    dispatchesToday: number;
  };
  recentQuotes: { id: string; name: string; email: string; phone?: string; projectType: string; budget: string; status: string; createdAt: string }[];
  recentContacts: { id: string; name: string; email: string; phone?: string; message: string; status: string; createdAt: string }[];
  recentHbsLeads: { id: string; name: string; phone: string; email?: string; selectedService?: string; status: string; createdAt: string }[];
  recentVendorApps: { id: string; trackingId: string; companyName: string; contactName: string; email: string; phone: string; category?: string; tier: string; status: string; submittedAt: string }[];
  recentApplications: { id: string; name: string; email: string; role: string; experience: string; cvUrl: string; status: string; createdAt: string }[];
}

export default function MasterCompanyDashboard() {
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStreamTab, setActiveStreamTab] = useState<"all" | "quotes" | "hbs" | "vendors" | "contacts">("all");

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (isFetchingRef.current && !force) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;

    setData((currentData) => {
      if (force || !currentData) {
        setLoading(true);
      }
      return currentData;
    });
    setError("");

    try {
      const res = await fetch("/api/dashboard", {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Your session has expired. Redirecting to login...");
          window.location.href = "/admin-login";
          return;
        }
        setError("Failed to load company dashboard data from server.");
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setAdminCache("admin:master_dashboard", json.data);
      } else {
        setError(json.error || "Invalid response from server.");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Network connection issue. Please check server.");
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const cached = getAdminCache<ExecutiveData>("admin:master_dashboard");
    if (cached) {
      setData(cached);
      setLoading(false);
      fetchData(false);
    } else {
      fetchData(true);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Unified stream list with normalized badges
  const unifiedStream = useMemo(() => {
    if (!data) return [];
    const items: Array<{
      id: string;
      type: "quote" | "hbs" | "vendor" | "contact";
      brandName: string;
      brandColor: string;
      title: string;
      subtitle: string;
      contact: string;
      status: string;
      date: string;
      actionUrl: string;
    }> = [];

    // HiPRO Quotes
    (data.recentQuotes || []).forEach((q) => {
      items.push({
        id: `quote-${q.id}`,
        type: "quote",
        brandName: "HiPRO Corporate",
        brandColor: "bg-blue-50 text-blue-800 border-blue-200",
        title: q.name || "Client Quote Request",
        subtitle: `${q.projectType || "General Construction"} · Budget: ${q.budget || "Custom"}`,
        contact: q.phone || q.email,
        status: q.status,
        date: q.createdAt,
        actionUrl: "/admin/quotes",
      });
    });

    // HBS Leads
    (data.recentHbsLeads || []).forEach((h) => {
      items.push({
        id: `hbs-${h.id}`,
        type: "hbs",
        brandName: "Hind Building (HBS)",
        brandColor: "bg-orange-50 text-orange-800 border-orange-200",
        title: h.name || "Repair Diagnostic Lead",
        subtitle: h.selectedService || "Waterproofing & Rehabilitation",
        contact: h.phone || h.email || "Phone",
        status: h.status,
        date: h.createdAt,
        actionUrl: "/admin/hbs/leads",
      });
    });

    // Vendor Applications
    (data.recentVendorApps || []).forEach((v) => {
      items.push({
        id: `vendor-${v.id}`,
        type: "vendor",
        brandName: "Vendor Portal",
        brandColor: "bg-amber-50 text-amber-800 border-amber-200",
        title: v.companyName || v.contactName || "Subcontractor Application",
        subtitle: `${v.category || "General Contracting"} · Tier: ${v.tier}`,
        contact: `${v.contactName} (${v.phone || v.email})`,
        status: v.status,
        date: v.submittedAt || (v as any).createdAt,
        actionUrl: "/admin/empanelment/applications",
      });
    });

    // Contact Messages
    (data.recentContacts || []).forEach((c) => {
      items.push({
        id: `contact-${c.id}`,
        type: "contact",
        brandName: "General Inquiry",
        brandColor: "bg-slate-100 text-slate-800 border-slate-200",
        title: c.name || "Direct Message",
        subtitle: c.message?.slice(0, 70) || "Website contact submission",
        contact: c.email || c.phone || "Email",
        status: c.status,
        date: c.createdAt,
        actionUrl: "/admin/contacts",
      });
    });

    // Sort by descending date
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const filteredStream = useMemo(() => {
    if (activeStreamTab === "all") return unifiedStream;
    if (activeStreamTab === "quotes") return unifiedStream.filter((i) => i.type === "quote");
    if (activeStreamTab === "hbs") return unifiedStream.filter((i) => i.type === "hbs");
    if (activeStreamTab === "vendors") return unifiedStream.filter((i) => i.type === "vendor");
    if (activeStreamTab === "contacts") return unifiedStream.filter((i) => i.type === "contact");
    return unifiedStream;
  }, [unifiedStream, activeStreamTab]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* ── 1. Corporate Executive Command Bar (Apple Cupertino Glass) ── */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_30px_rgba(15,23,42,0.03)] p-6 md:p-8 relative overflow-hidden">
        {/* Subtle background ambient gradient bloom */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-200/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="HiPRO Corporate"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight font-display">
                  Hindustan Projects Group
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  3 Digital Assets Live
                </span>
              </div>
              <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
                Master Headquarters Cockpit · Cross-brand portfolio, supply chain procurement & corporate governance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="Refresh Real-time Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span>{loading ? "Syncing..." : "Sync Metrics"}</span>
            </button>

            <Link
              href="/admin/automail"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-blue-300" />
              <span>AutoMail Studio</span>
            </Link>

            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200/80 transition-all shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security & 2FA</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-600 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button onClick={() => fetchData(true)} className="underline hover:text-red-800">Retry</button>
        </div>
      )}

      {/* ── 2. Top Executive Aggregated Bento Grid (Apple Cupertino Style) ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Inquiries */}
        <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Business Inquiries</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100 group-hover:scale-105 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {loading && !data ? "..." : data?.executive.totalInquiries ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              <span className="font-bold text-amber-600">{data?.executive.pendingActions ?? 0}</span>
              <span>pending review across portals</span>
            </p>
          </div>
        </div>

        {/* Procurement & Supply Chain */}
        <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Vendor Network & KYC</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {loading && !data ? "..." : data?.vendorHub.applications.total ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              <span className="font-bold text-emerald-600">{data?.vendorHub.applications.approved ?? 0}</span>
              <span>verified partners ·</span>
              <span className="font-bold text-blue-600">{data?.vendorHub.tenders.active ?? 0}</span>
              <span>live tenders</span>
            </p>
          </div>
        </div>

        {/* Civil & Infrastructure Assets */}
        <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Portfolio & Catalog</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-100 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 font-display">
              {loading && !data ? "..." : (data?.hipro.projects.total ?? 0) + (data?.hbs.projects.total ?? 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              <span>{data?.hipro.services.active ?? 0} HiPRO services ·</span>
              <span>{data?.hbs.services.total ?? 0} HBS repair specs</span>
            </p>
          </div>
        </div>

        {/* Security & System Operations */}
        <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Master Governance</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <p className="text-xl font-black text-emerald-700 font-display">Operational</p>
              <span className="text-[10px] font-bold uppercase bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono border border-emerald-200/60">
                2FA Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              <span>{data?.automail.dispatchesToday ?? 0} emails dispatched today</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. The 3 Hero Digital Web Properties (Apple Showcase Bento) ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display">
              Managed Web Properties & Brand Gateways
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any of the 3 corporate digital portals to access its isolated CMS, catalog, leads, or public interface.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── CARD 1: HiPRO Corporate ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
            <div className="h-1.5 bg-gradient-to-r from-[#0F2C59] via-blue-600 to-indigo-500" />
            <div className="p-6 md:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-200/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.jpg" alt="HiPRO" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight font-display">
                      HiPRO Corporate
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">hindustanprojects.in</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 rounded-full border border-blue-200/80">
                  Flagship
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                Core civil engineering, multi-crore infrastructure portfolio, architectural planning, dynamic cost estimation, and careers.
              </p>

              {/* Metrics Ribbon */}
              <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.hipro.projects.total ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Projects</p>
                </div>
                <div>
                  <p className="text-base font-bold text-amber-600">{data?.hipro.quotes.pending ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">New Quotes</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.hipro.blogs.published ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Articles</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/projects"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0F2C59] hover:bg-slate-900 text-white shadow-xs transition-all"
                >
                  Manage Projects
                </Link>
                <Link
                  href="/admin/quotes"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 shadow-2xs transition-all"
                >
                  Quotes Hub
                </Link>
              </div>
              <a
                href="https://www.hindustanprojects.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/60 shadow-2xs transition-all"
                title="Open Public Site (New Tab)"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* ── CARD 2: Hind Building Solutions (HBS) ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
            <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
            <div className="p-6 md:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0 ring-1 ring-orange-500/20">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight font-display">
                      Hind Building (HBS)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">hindbuilding.hindustanprojects.in</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 rounded-full border border-orange-200/80">
                  Sub-Brand
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                Specialized waterproofing, concrete retrofitting, structural crack repair, expansion joints, and automated repair BOQ generation.
              </p>

              {/* Metrics Ribbon */}
              <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
                <div>
                  <p className="text-base font-bold text-orange-600">{data?.hbs.leads.new ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">New Leads</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.hbs.services.total ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Services</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.hbs.leads.total ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Total Leads</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/hbs/leads"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all"
                >
                  Manage Leads
                </Link>
                <Link
                  href="/admin/hbs"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 shadow-2xs transition-all"
                >
                  HBS Studio
                </Link>
              </div>
              <a
                href="https://hindbuilding.hindustanprojects.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-orange-700 bg-white/80 hover:bg-white border border-slate-200/60 shadow-2xs transition-all"
                title="Open HBS Site (New Tab)"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* ── CARD 3: Vendor Empanelment & Procurement Hub ── */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400" />
            <div className="p-6 md:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight font-display">
                      Vendor Procurement Hub
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">empanelment.hindustanprojects.in</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 rounded-full border border-amber-200/80">
                  Procurement
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                Contractor KYC vetting, CPWD grading (Class A–D), digital Smart PVC cards, live tender bidding, and worker site gate passes.
              </p>

              {/* Metrics Ribbon */}
              <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
                <div>
                  <p className="text-base font-bold text-amber-600">{data?.vendorHub.applications.submitted ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">KYC Queue</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{data?.vendorHub.tenders.active ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Live Tenders</p>
                </div>
                <div>
                  <p className="text-base font-bold text-emerald-600">{data?.vendorHub.applications.approved ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Partners</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/empanelment/applications"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all"
                >
                  KYC Pipeline
                </Link>
                <Link
                  href="/admin/empanelment"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 shadow-2xs transition-all"
                >
                  Vendor Hub
                </Link>
              </div>
              <a
                href="https://empanelment.hindustanprojects.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-amber-700 bg-white/80 hover:bg-white border border-slate-200/60 shadow-2xs transition-all"
                title="Open Public Portal (New Tab)"
              >
                <span>Live Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Unified Cross-Portal Live Stream (Apple Segmented Table) ── */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-6 md:p-7 border-b border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display">
              Real-Time Cross-Portal Inquiries Stream
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified chronological feed of quotes, diagnostic leads, vendor registrations, and messages.
            </p>
          </div>

          {/* Apple Segmented Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveStreamTab("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeStreamTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({unifiedStream.length})
            </button>
            <button
              onClick={() => setActiveStreamTab("quotes")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeStreamTab === "quotes" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              HiPRO Quotes ({data?.recentQuotes.length ?? 0})
            </button>
            <button
              onClick={() => setActiveStreamTab("hbs")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeStreamTab === "hbs" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              HBS Leads ({data?.recentHbsLeads.length ?? 0})
            </button>
            <button
              onClick={() => setActiveStreamTab("vendors")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeStreamTab === "vendors" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Vendor KYC ({data?.recentVendorApps.length ?? 0})
            </button>
            <button
              onClick={() => setActiveStreamTab("contacts")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeStreamTab === "contacts" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Contacts ({data?.recentContacts.length ?? 0})
            </button>
          </div>
        </div>

        {/* Stream Table */}
        <div className="divide-y divide-slate-100/80 overflow-x-auto">
          {filteredStream.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recent inquiries found in this category.
            </div>
          ) : (
            filteredStream.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="p-4 md:px-6 hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${item.brandColor}`}>
                    {item.brandName}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-slate-500 text-[11px] truncate mt-0.5">{item.subtitle}</p>
                    <p className="text-slate-400 text-[10px] font-mono mt-0.5">{item.contact}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full uppercase border border-slate-200/60">
                    {item.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </span>
                  <Link
                    href={item.actionUrl}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 flex items-center gap-1 group/btn transition-all"
                  >
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
