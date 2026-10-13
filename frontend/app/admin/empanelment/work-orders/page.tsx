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
} from "lucide-react";

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

      const [woData, invData, vData] = await Promise.all([woRes.json(), invRes.json(), vendorsRes.json()]);

      if (woData.success) setWorkOrders(woData.workOrders || []);
      if (invData.success) setInvoices(invData.invoices || []);
      if (vData.success) setApprovedVendors(vData.applications || []);
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              CONTRACTS & BILLING
            </span>
            <span className="text-xs text-slate-400 font-semibold">&bull; Work Orders & Milestones</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
            Work Orders & Invoicing Suite
          </h1>
          <p className="text-xs text-slate-500">
            Issue project packages to empanelled contractors, track milestone progress, and record RTGS payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Work Order</span>
          </button>

          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-xs font-bold text-white transition-all shadow-xs"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Record Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Contract Value</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹ {(totalContractVal / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{workOrders.length} Active Packages</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs bg-blue-50/20">
          <div className="text-[10px] font-bold text-blue-700 uppercase">Gross Invoiced</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">
            ₹ {(totalInvoicedVal / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{invoices.length} Milestone Claims</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <div className="text-[10px] font-bold text-emerald-700 uppercase">RTGS Disbursed</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            ₹ {(totalPaidVal / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Audited & Settled</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("work-orders")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "work-orders"
              ? "border-amber-600 text-amber-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Active Work Orders ({workOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("invoices")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "invoices"
              ? "border-amber-600 text-amber-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Milestone Invoices ({invoices.length})</span>
        </button>
      </div>

      {/* Tab 1: Work Orders */}
      {activeTab === "work-orders" && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              Loading work orders...
            </div>
          ) : workOrders.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-3xl border border-slate-200">
              No work orders issued yet. Click &quot;Issue Work Order&quot; to award a package.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {wo.workOrderNo}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">{wo.packageTitle}</h3>
                      <p className="text-xs text-slate-500">{wo.projectName}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        wo.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {wo.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Contractor</span>
                      <span className="font-bold text-slate-800">{wo.vendor?.companyName}</span>
                      <span className="text-[10px] text-amber-700 block font-mono">({wo.vendor?.tier})</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Contract Value</span>
                      <span className="font-bold text-amber-600 font-mono text-sm">
                        ₹ {wo.contractAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Progress Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-600 text-[11px]">Site Execution Progress:</span>
                      <span className="font-bold font-mono text-amber-600">{wo.progressPercent}%</span>
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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No milestone invoices recorded yet. Click &quot;Record Invoice&quot; above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Vendor & Package</th>
                    <th className="py-3 px-4">Gross Claim</th>
                    <th className="py-3 px-4">TDS (2%)</th>
                    <th className="py-3 px-4">Net Payable</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{inv.invoiceNo}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inv.vendor?.companyName}</div>
                        <div className="text-[10px] text-slate-500">
                          {inv.workOrder ? inv.workOrder.packageTitle : "General Milestone"}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        ₹ {inv.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500">
                        ₹ {inv.tdsDeduction.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 font-mono font-extrabold text-amber-600">
                        ₹ {inv.netPayable.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            inv.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.status === "APPROVED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {inv.status}
                        </span>
                        {inv.rtgsRef && (
                          <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                            RTGS: {inv.rtgsRef}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        {inv.status !== "PAID" ? (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsPayModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Issue New Work Order</h3>
                <p className="text-xs text-slate-500">Award contract package to verified partner</p>
              </div>
              <button onClick={() => setIsWoModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  Select Approved Contractor *
                </label>
                <select
                  value={woVendorId}
                  onChange={(e) => setWoVendorId(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Choose Empanelled Partner --</option>
                  {approvedVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.companyName} ({v.tier} &bull; {v.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bhilwara Industrial Textile Hub Phase II"
                  value={woProjectName}
                  onChange={(e) => setWoProjectName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  Package Title / Scope *
                </label>
                <input
                  type="text"
                  placeholder="e.g. RCC Foundation & Column Shuttering"
                  value={woPackageTitle}
                  onChange={(e) => setWoPackageTitle(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                    Contract Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4500000"
                    value={woAmount}
                    onChange={(e) => setWoAmount(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                    Target Completion
                  </label>
                  <input
                    type="date"
                    value={woCompletionDate}
                    onChange={(e) => setWoCompletionDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsWoModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Milestone Invoice</h3>
                <p className="text-xs text-slate-500">Log contractor claim for audit</p>
              </div>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  Select Contractor *
                </label>
                <select
                  value={invVendorId}
                  onChange={(e) => setInvVendorId(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  Link to Work Order (Optional)
                </label>
                <select
                  value={invWoId}
                  onChange={(e) => setInvWoId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- None / General Milestone --</option>
                  {workOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.workOrderNo} &bull; {wo.packageTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                    Invoice No *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-041"
                    value={invNo}
                    onChange={(e) => setInvNo(e.target.value.toUpperCase())}
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                    Gross Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record RTGS Settlement</h3>
                <p className="text-xs text-slate-500">Invoice: {selectedInvoice.invoiceNo}</p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
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

            <form onSubmit={handleMarkPaid} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  Bank UTR / RTGS Ref No *
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC2026101298412"
                  value={rtgsInput}
                  onChange={(e) => setRtgsInput(e.target.value.toUpperCase())}
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 uppercase font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
