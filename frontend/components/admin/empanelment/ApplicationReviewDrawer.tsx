"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  AlertCircle,
  Sparkles,
  Lock,
} from "lucide-react";

export interface VendorApplicationDetail {
  id: string;
  trackingId: string;
  companyName: string;
  tradeName?: string | null;
  category: string;
  tier: string;
  status: string;
  currentStage: string;
  contactName: string;
  phone: string;
  email: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  gstin?: string | null;
  pan: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  yearsInBusiness?: number | null;
  annualTurnover?: string | null;
  workforceCount?: number | null;
  pastClients?: string | null;
  gstDocUrl?: string | null;
  panDocUrl?: string | null;
  chequeDocUrl?: string | null;
  msmeDocUrl?: string | null;
  pastWorkDocUrl?: string | null;
  eligibilityScore?: number | null;
  adminRemarks?: string | null;
  ceoSigned?: boolean;
  ceoSignedDate?: string | null;
  createdAt: string;
  approvedAt?: string | null;
}

interface ApplicationReviewDrawerProps {
  application: VendorApplicationDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updated: VendorApplicationDetail) => void;
}

export default function ApplicationReviewDrawer({
  application,
  isOpen,
  onClose,
  onStatusUpdated,
}: ApplicationReviewDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [tier, setTier] = useState("CLASS_C");
  const [score, setScore] = useState(85);
  const [remarks, setRemarks] = useState("");
  const [ceoSigned, setCeoSigned] = useState(false);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    if (application) {
      const normalizedTier = (application.tier || "CLASS_C").replace(/^TIER_/, "CLASS_");
      setTier(normalizedTier);
      setScore(application.eligibilityScore || 85);
      setRemarks(application.adminRemarks || "");
      setCeoSigned(application.ceoSigned || false);
      setError("");
      setActionSuccess("");
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const handleUpdate = async (newStatus: string) => {
    setSaving(true);
    setError("");
    setActionSuccess("");

    try {
      const res = await fetch(`/api/empanelment/admin/applications/${application.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          tier,
          eligibilityScore: score,
          adminRemarks: remarks,
          ceoSigned: newStatus === "APPROVED" ? ceoSigned : undefined,
          currentStage:
            newStatus === "APPROVED"
              ? "Empanelled Partner — Active"
              : newStatus === "REJECTED"
              ? "Application Rejected"
              : newStatus === "DOCS_REQUESTED"
              ? "Awaiting Vendor Clarification"
              : "KYC Under Active Review",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update application status");
      }

      setActionSuccess(`Application marked as ${newStatus}`);
      onStatusUpdated(json.application);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to submit update");
    } finally {
      setSaving(false);
    }
  };

  const appAny = application as any;
  const docs = [
    {
      label: "GST Certificate",
      url: appAny.gstCertificateUrl || application.gstDocUrl,
      required: true,
    },
    {
      label: "PAN Card Document",
      url: appAny.panCardUrl || application.panDocUrl,
      required: true,
    },
    {
      label: "Cancelled Cheque / Bank Passbook",
      url: appAny.bankChequeUrl || application.chequeDocUrl,
      required: true,
    },
    {
      label: "Work Experience / Past Order Proof",
      url: appAny.workExperienceDocUrl || application.pastWorkDocUrl,
      required: false,
    },
    {
      label: "MSME / Udyam Certificate",
      url: appAny.msmeDocUrl || appAny.msmeCertificateUrl,
      required: false,
    },
    {
      label: "Authorized Signatory Proof",
      url: appAny.signatureUrl,
      required: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {application.companyName}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {application.trackingId}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {application.category} • Submitted{" "}
                {application.createdAt && !isNaN(new Date(application.createdAt).getTime())
                  ? new Date(application.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recently"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Status & Current Stage Ribbon */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Workflow Stage
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {application.currentStage || application.status}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                application.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : application.status === "REJECTED"
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : application.status === "DOCS_REQUESTED"
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              {application.status}
            </span>
          </div>

          {/* Contact & Location Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>Key Person & Location</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Contact Person</p>
                <p className="font-semibold text-slate-900 mt-0.5">{application.contactName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Phone Number</p>
                <a href={`tel:${application.phone}`} className="font-semibold text-blue-600 hover:underline mt-0.5 block">
                  {application.phone}
                </a>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Email</p>
                <a href={`mailto:${application.email}`} className="font-semibold text-blue-600 hover:underline mt-0.5 block truncate">
                  {application.email}
                </a>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">City & State</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {application.city || "—"}, {application.state || "—"} ({application.pincode || "—"})
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Registered Office Address</p>
                <p className="font-medium text-slate-700 mt-0.5">{application.address || "—"}</p>
              </div>
            </div>
          </div>

          {/* Tax & Banking Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tax & Banking Registry</span>
            </h3>
            <div className="grid grid-cols-3 gap-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">GSTIN</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{application.gstin || "NOT PROVIDED"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">PAN Card</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{application.pan}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Years in Business</p>
                <p className="font-semibold text-slate-900 mt-0.5">{application.yearsInBusiness ? `${application.yearsInBusiness} Years` : "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Bank Name</p>
                <p className="font-semibold text-slate-900 mt-0.5">{application.bankName || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Account Number</p>
                <p className="font-mono text-slate-900 mt-0.5">{application.bankAccountNumber || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">IFSC Code</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{application.bankIfsc || "—"}</p>
              </div>
            </div>
          </div>

          {/* Uploaded KYC Documents */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Uploaded KYC Documents</span>
            </h3>
            <div className="space-y-2">
              {docs.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${doc.url ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{doc.label}</p>
                      <p className="text-[10px] text-slate-400">
                        {doc.url ? "File attached & verified" : doc.required ? "Pending upload" : "Optional document"}
                      </p>
                    </div>
                  </div>

                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold flex items-center gap-1 transition-colors text-[11px]"
                    >
                      <span>View File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 italic">Not Uploaded</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assessment & Tier Assignment */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>KYC Assessment & Capacity Tier</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Assign Vendor Tier
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="CLASS_A">Class A — Turnkey / Unlimited (&gt; ₹25 Cr)</option>
                  <option value="CLASS_B">Class B — Major Contracts (₹5 Cr – ₹25 Cr)</option>
                  <option value="CLASS_C">Class C — Specialized &amp; Trade Works (₹50 Lakh – ₹5 Cr)</option>
                  <option value="CLASS_D">Class D — Local &amp; Site Supply (&lt; ₹50 Lakh)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Eligibility Score (0 – 100)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600"
                  />
                  <span className="w-10 text-right font-mono font-bold text-slate-800">{score}%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Admin Evaluation Notes / Clarification Message
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Write internal KYC remarks or instructions to vendor..."
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={ceoSigned}
                onChange={(e) => setCeoSigned(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-700 font-semibold">
                Attach CEO Digital Seal & Signature on Official Certificate
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            onClick={() => handleUpdate("REJECTED")}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold flex items-center gap-1.5 transition-colors text-xs"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdate("DOCS_REQUESTED")}
              disabled={saving}
              className="px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-colors text-xs"
            >
              Request Docs
            </button>

            <button
              onClick={() => handleUpdate("APPROVED")}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saving ? "Processing..." : "Approve & Empanel"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
