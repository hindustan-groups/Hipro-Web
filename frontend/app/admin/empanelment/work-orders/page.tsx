"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  ExternalLink,
  Sliders,
  X,
  Loader2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";

interface WorkOrder {
  id: string;
  workOrderNo: string;
  projectName: string;
  packageTitle: string;
  contractAmount: number;
  startDate: string | null;
  completionTargetDate: string | null;
  progressPercent: number;
  status: string;
  vendor: {
    id: string;
    companyName: string;
    contactName: string;
    phone: string;
    tier: string;
    city: string;
  };
  invoices: any[];
}

interface Invoice {
  id: string;
  invoiceNo: string;
  amount: number;
  tdsDeduction: number;
  netPayable: number;
  status: string;
  rtgsRef: string | null;
  paidAt: string | null;
  createdAt: string;
  vendor: {
    companyName: string;
    tier: string;
    phone: string;
    gstin: string | null;
    pan: string;
  };
  workOrder: {
    workOrderNo: string;
    projectName: string;
    packageTitle: string;
  } | null;
}

export default function WorkOrdersBillingPage() {
  const [activeTab, setActiveTab] = useState<"work-orders" | "invoices">("work-orders");
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [approvedVendors, setApprovedVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [rtgsInput, setRtgsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Work Order Form State
  const [woVendorId, setWoVendorId] = useState("");
  const [woProjectName, setWoProjectName] = useState("");
  const [woPackageTitle, setWoPackageTitle] = useState("");
  const [woAmount, setWoAmount] = useState("");
  const [woCompletionDate, setWoCompletionDate] = useState("");

  // New Invoice Form State
  const [invVendorId, setInvVendorId] = useState("");
  const [invWoId, setInvWoId] = useState("");
  const [invNo, setInvNo] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invTds, setInvTds] = useState("2");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [woRes, invRes, vendorsRes] = await Promise.all([
        fetch("/api/empanelment/admin/work-orders", { credentials: "include", cache: "no-store" }),
        fetch("/api/empanelment/admin/invoices", { credentials: "include", cache: "no-store" }),
        fetch("/api/empanelment/admin/applications?status=APPROVED", { credentials: "include", cache: "no-store" }),
      ]);

      if (
        woRes.status === 401 ||
        invRes.status === 401 ||
        vendorsRes.status === 401 ||
        (woRes.redirected && woRes.url.includes("admin-login"))
      ) {
        window.location.href = "/admin-login";
        return;
      }

      const parseSafe = async (res: Response) => {
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) return null;
        try {
          return await res.json();
        } catch {
          return null;
        }
      };

      const [woData, invData, vData] = await Promise.all([
        parseSafe(woRes),
        parseSafe(invRes),
        parseSafe(vendorsRes),
      ]);

      if (woData?.success) setWorkOrders(woData.workOrders || []);
      if (invData?.success) setInvoices(invData.invoices || []);
      if (vData?.success) setApprovedVendors(vData.applications || []);
    } catch (err) {
      console.error("Failed to load work orders & invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!woVendorId || !woProjectName || !woPackageTitle || !woAmount) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/empanelment/admin/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vendorId: woVendorId,
          projectName: woProjectName,
          packageTitle: woPackageTitle,
          contractAmount: woAmount,
          completionTargetDate: woCompletionDate || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsWoModalOpen(false);
        setWoProjectName("");
        setWoPackageTitle("");
        setWoAmount("");
        fetchData();
      }
    } catch (err) {
      console.error("Error creating work order:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invVendorId || !invNo || !invAmount) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/empanelment/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vendorId: invVendorId,
          workOrderId: invWoId || undefined,
          invoiceNo: invNo,
          amount: invAmount,
          tdsPercent: invTds,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsInvoiceModalOpen(false);
        setInvNo("");
        setInvAmount("");
        fetchData();
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgress = async (id: string, progressPercent: number) => {
    try {
      await fetch(`/api/empanelment/admin/work-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          progressPercent,
          status: progressPercent === 100 ? "COMPLETED" : "IN_EXECUTION",
        }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !rtgsInput) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/empanelment/admin/invoices/${selectedInvoice.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "PAID",
          rtgsRef: rtgsInput.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsPayModalOpen(false);
        setSelectedInvoice(null);
        setRtgsInput("");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to mark paid:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalContractVal = workOrders.reduce((acc, wo) => acc + (wo.contractAmount || 0), 0);
  const totalInvoicedVal = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const totalPaidVal = invoices.filter((i) => i.status === "PAID").reduce((acc, inv) => acc + (inv.netPayable || 0), 0);

  const filteredWorkOrders = workOrders.filter((wo) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      wo.workOrderNo.toLowerCase().includes(q) ||
      wo.projectName.toLowerCase().includes(q) ||
      wo.packageTitle.toLowerCase().includes(q) ||
      wo.vendor?.companyName.toLowerCase().includes(q)
    );
  });

  const filteredInvoices = invoices.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inv.invoiceNo.toLowerCase().includes(q) ||
      inv.vendor?.companyName.toLowerCase().includes(q) ||
      inv.workOrder?.packageTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Apple Page Header */}
      <EmpanelmentAdminPageHeader
        badge="Contracts & Billing"
        title="Work Orders & Invoicing Suite"
        description="Issue project packages to empanelled contractors, track milestone progress, and record RTGS payouts."
        breadcrumbs={[
          { label: "Empanelment", href: "/admin/empanelment" },
          { label: "Work Orders & Billing" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition-colors shadow-xs disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
            </button>
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
            >
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span>Record Invoice</span>
            </button>
            <button
              onClick={() => setIsWoModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Issue Work Order</span>
            </button>
          </div>
        }
      />

      {/* Apple Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Contract Value</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-mono">
            ₹ {(totalContractVal / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{workOrders.length} Active Packages</div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Invoiced</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-mono">
            ₹ {(totalInvoicedVal / 100000).toFixed(2)} L
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{invoices.length} Milestone Claims</div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RTGS Disbursed</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-mono text-emerald-700">
            ₹ {(totalPaidVal / 100000).toFixed(2)} L
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Audited &amp; Settled Payouts</div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Apple Segmented Tabs */}
        <div className="inline-flex items-center p-1 bg-slate-200/50 rounded-2xl border border-slate-200/60 max-w-fit">
          <button
            onClick={() => setActiveTab("work-orders")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "work-orders"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Active Work Orders ({workOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "invoices"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Milestone Invoices ({invoices.length})</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === "work-orders" ? "Search work order, project, vendor..." : "Search invoice no, vendor..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs"
          />
        </div>
      </div>

      {/* Tab 1: Work Orders */}
      {activeTab === "work-orders" && (
        <div>
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-xs bg-white/80 rounded-3xl border border-slate-200/80">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              Loading work orders...
            </div>
          ) : filteredWorkOrders.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-2xl p-16 text-center text-slate-400 text-xs rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">No work orders issued yet</p>
              <p className="text-xs text-slate-400">Click &quot;Issue Work Order&quot; to award a package to an empanelled partner.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorkOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-900 border border-amber-200/70">
                        {wo.workOrderNo}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-2">{wo.packageTitle}</h3>
                      <p className="text-xs text-slate-500">{wo.projectName}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        wo.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-800 border border-blue-500/20"
                      }`}
                    >
                      {wo.status?.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Contractor</span>
                      <span className="font-bold text-slate-800 text-xs block truncate">{wo.vendor?.companyName}</span>
                      <span className="text-[10px] text-amber-800 block font-mono font-semibold">({wo.vendor?.tier?.replace("_", " ")})</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Contract Value</span>
                      <span className="font-bold text-slate-900 font-mono text-sm block">
                        ₹ {wo.contractAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Progress Slider */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-600 text-[11px]">Site Execution Progress:</span>
                      <span className="font-bold font-mono text-amber-700">{wo.progressPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={wo.progressPercent}
                      onChange={(e) => handleUpdateProgress(wo.id, parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Invoices */}
      {activeTab === "invoices" && (
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              Loading invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">No milestone invoices found</p>
              <p className="text-xs text-slate-400">Click &quot;Record Invoice&quot; to log a contractor milestone claim.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Invoice No</th>
                    <th className="py-3.5 px-5">Vendor &amp; Package</th>
                    <th className="py-3.5 px-5">Gross Claim</th>
                    <th className="py-3.5 px-5">TDS (2%)</th>
                    <th className="py-3.5 px-5">Net Payable</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md inline-block border border-slate-200/50">
                          {inv.invoiceNo}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{inv.vendor?.companyName}</div>
                        <div className="text-[11px] text-slate-500">
                          {inv.workOrder ? inv.workOrder.packageTitle : "General Milestone"}
                        </div>
                      </td>

                      <td className="py-4 px-5 font-mono font-bold text-slate-800">
                        ₹ {inv.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-4 px-5 font-mono text-slate-500">
                        ₹ {inv.tdsDeduction.toLocaleString("en-IN")}
                      </td>

                      <td className="py-4 px-5 font-mono font-extrabold text-amber-800">
                        ₹ {inv.netPayable.toLocaleString("en-IN")}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                              : inv.status === "APPROVED"
                              ? "bg-blue-500/10 text-blue-800 border border-blue-500/20"
                              : "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                          }`}
                        >
                          {inv.status}
                        </span>
                        {inv.rtgsRef && (
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                            RTGS: {inv.rtgsRef}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap text-right">
                        {inv.status !== "PAID" ? (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsPayModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Settled</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Issue Work Order */}
      {isWoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Issue New Work Order</h3>
                <p className="text-xs text-slate-500 mt-0.5">Award contract package to verified partner</p>
              </div>
              <button
                onClick={() => setIsWoModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Approved Contractor *
                </label>
                <select
                  value={woVendorId}
                  onChange={(e) => setWoVendorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Choose Empanelled Partner --</option>
                  {approvedVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.companyName} ({v.tier?.replace("_", " ")} &bull; {v.city || "Rajasthan"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bhilwara Industrial Textile Hub Phase II"
                  value={woProjectName}
                  onChange={(e) => setWoProjectName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Package Title / Scope *
                </label>
                <input
                  type="text"
                  placeholder="e.g. RCC Foundation & Column Shuttering"
                  value={woPackageTitle}
                  onChange={(e) => setWoPackageTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Contract Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4500000"
                    value={woAmount}
                    onChange={(e) => setWoAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Target Completion
                  </label>
                  <input
                    type="date"
                    value={woCompletionDate}
                    onChange={(e) => setWoCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWoModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Issue Work Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Invoice */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Milestone Invoice</h3>
                <p className="text-xs text-slate-500 mt-0.5">Log contractor claim for audit</p>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Contractor *
                </label>
                <select
                  value={invVendorId}
                  onChange={(e) => setInvVendorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Choose Empanelled Partner --</option>
                  {approvedVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Link to Work Order (Optional)
                </label>
                <select
                  value={invWoId}
                  onChange={(e) => setInvWoId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- None / General Milestone --</option>
                  {workOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.workOrderNo} &bull; {wo.packageTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Invoice No *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-041"
                    value={invNo}
                    onChange={(e) => setInvNo(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Gross Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Mark Paid with RTGS */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record RTGS Settlement</h3>
                <p className="text-xs text-slate-500 mt-0.5">Invoice: {selectedInvoice.invoiceNo}</p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Vendor:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.vendor?.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Payable:</span>
                <span className="font-extrabold text-emerald-700 font-mono">
                  ₹ {selectedInvoice.netPayable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <form onSubmit={handleMarkPaid} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Bank UTR / RTGS Ref No *
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC2026101298412"
                  value={rtgsInput}
                  onChange={(e) => setRtgsInput(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
