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
  Send,
  KeyRound,
  RotateCw,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export interface VendorApplicationDetail {
  id: string;
  trackingId: string;
  companyName: string;
  tradeName?: string | null;
  category?: string | null;
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
  accountNumber?: string | null;
  bankAccountNumber?: string | null;
  ifscCode?: string | null;
  bankIfsc?: string | null;
  establishmentYear?: string | null;
  yearsInBusiness?: number | null;
  teamSize?: string | null;
  turnoverBracket?: string | null;
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
  const [activeTab, setActiveTab] = useState<"review" | "emails" | "activity">("review");
  const [saving, setSaving] = useState(false);
  const [tier, setTier] = useState("CLASS_C");
  const [category, setCategory] = useState<string>("");
  const [score, setScore] = useState(85);
  const [remarks, setRemarks] = useState("");
  const [ceoSigned, setCeoSigned] = useState(false);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Email sending modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("CUSTOM");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailModalSuccess, setEmailModalSuccess] = useState("");
  const [emailModalError, setEmailModalError] = useState("");
  const [mailboxes, setMailboxes] = useState<
    Array<{ id: string; name: string; email: string; aliases?: string[]; brandName?: string }>
  >([]);
  const [selectedMailboxId, setSelectedMailboxId] = useState("");
  const [selectedSenderEmail, setSelectedSenderEmail] = useState("");
  const [loadingMailContext, setLoadingMailContext] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);
  const [aiError, setAiError] = useState("");

  // Portal invite state
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Email & Activity logs
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

  useEffect(() => {
    if (application) {
      const normalizedTier = (application.tier || "CLASS_C").replace(/^TIER_/, "CLASS_");
      setTier(normalizedTier);
      setCategory(application.category || "");
      setScore(application.eligibilityScore || 85);
      setRemarks(application.adminRemarks || "");
      setCeoSigned(application.ceoSigned || false);
      setError("");
      setActionSuccess("");
      setInviteSuccess("");
      setActiveTab("review");
      loadLogs(application.id);
    }
  }, [application]);

  const loadLogs = async (appId: string) => {
    setLoadingLogs(true);
    try {
      const [emailsRes, activityRes] = await Promise.all([
        fetch(`/api/empanelment/admin/applications/${appId}/emails`, { credentials: "include" }),
        fetch(`/api/empanelment/admin/applications/${appId}/activity`, { credentials: "include" }),
      ]);

      if (emailsRes.ok) {
        const json = await emailsRes.json();
        if (json.success && json.data) setEmailLogs(json.data);
      }
      if (activityRes.ok) {
        const json = await activityRes.json();
        if (json.success && json.data) setActivityLogs(json.data);
      }
    } catch (_e) {
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (!isEmailModalOpen) return;
    setLoadingMailContext(true);
    fetch("/api/mail/context?triggerKey=vendor_kyc_approvals&brand=empanelment", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setMailboxes(json.data.mailboxes || []);
          if (json.data.defaultMailbox?.id) {
            setSelectedMailboxId(json.data.defaultMailbox.id);
            setSelectedSenderEmail(json.data.defaultMailbox.email || "");
          } else if (json.data.mailboxes?.length > 0) {
            setSelectedMailboxId(json.data.mailboxes[0].id);
            setSelectedSenderEmail(json.data.mailboxes[0].email || "");
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMailContext(false));
  }, [isEmailModalOpen]);

  if (!isOpen || !application) return null;

  const handleUpdate = async (newStatus: string) => {
    if ((newStatus === "APPROVED" || ceoSigned) && (!category || category.trim() === "")) {
      setError("Cannot approve application without assigning an approved trade category.");
      return;
    }

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
          category: category.trim() ? category.trim() : null,
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

      if (newStatus === "APPROVED") {
        setActionSuccess("Application APPROVED! Official setup email dispatched to vendor.");
      } else {
        setActionSuccess(`Application marked as ${newStatus}`);
      }
      onStatusUpdated(json.application || {
        ...application,
        status: newStatus,
        tier,
        category: category.trim() ? category.trim() : null,
        adminRemarks: remarks,
        eligibilityScore: score,
        ceoSigned,
      });
      loadLogs(application.id);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to submit update");
    } finally {
      setSaving(false);
    }
  };

  const handleInviteToPortal = async () => {
    setInviting(true);
    setInviteSuccess("");
    setError("");

    try {
      const res = await fetch(`/api/empanelment/admin/accounts/invite/${application.id}`, {
        method: "POST",
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to issue portal invitation");
      }

      const link = json.data?.activationUrl || `${window.location.origin}/empanelment/activate?token=${json.data?.token}`;
      setInviteSuccess(link);
      loadLogs(application.id);
    } catch (err: any) {
      setError(err.message || "Failed to generate portal invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleSendManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) {
      setEmailModalError("Subject and message body are required.");
      return;
    }

    setSendingEmail(true);
    setEmailModalError("");
    setEmailModalSuccess("");

    try {
      const res = await fetch(`/api/empanelment/admin/applications/${application.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: emailSubject.trim(),
          htmlBody: emailBody.trim(),
          template: emailTemplate,
          mailboxId: selectedMailboxId || undefined,
          senderEmail: selectedSenderEmail || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to dispatch email");
      }

      setEmailModalSuccess("Email logged and dispatched via HiPRO Automail engine!");
      loadLogs(application.id);
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailSubject("");
        setEmailBody("");
        setAiPrompt("");
        setAiError("");
      }, 1500);
    } catch (err: any) {
      setEmailModalError(err.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const senderOptions = mailboxes.flatMap((mb) => {
    const label = mb.brandName || mb.name;
    const primary = [{ mailboxId: mb.id, email: mb.email, label, isAlias: false }];
    const aliasItems = (mb.aliases || [])
      .filter((alias) => alias && alias.toLowerCase() !== mb.email.toLowerCase())
      .map((alias) => ({ mailboxId: mb.id, email: alias, label, isAlias: true }));
    return [...primary, ...aliasItems];
  });

  const activeSenderEmail =
    selectedSenderEmail || mailboxes[0]?.email || "empanel@hindustanprojects.in";

  const handleAiDraftEmail = async () => {
    if (!application) return;
    const promptToUse =
      aiPrompt.trim() ||
      `Write a professional vendor empanelment update to ${application.contactName} (${application.companyName}, Tracking ID ${application.trackingId}).`;
    setAiDrafting(true);
    setAiError("");
    try {
      const res = await fetch("/api/automail/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: promptToUse,
          mode: "reply",
          brand: "empanelment",
          incomingSubject: emailSubject || undefined,
          recipientName: application.contactName,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate AI draft");
      }
      if (json.subject) setEmailSubject(json.subject);
      if (json.bodyText) setEmailBody(json.bodyText);
    } catch (err: any) {
      setAiError(err.message || "AI drafting failed");
    } finally {
      setAiDrafting(false);
    }
  };

  const handleRetryEmail = async (logId: string) => {
    setRetryingLogId(logId);
    try {
      const res = await fetch(`/api/empanelment/admin/emails/${logId}/retry`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        loadLogs(application.id);
      }
    } catch (_e) {
    } finally {
      setRetryingLogId(null);
    }
  };

  const appAny = application as any;
  const docs = [
    {
      label: "Aadhaar Card (Front)",
      url: appAny.aadharFrontUrl,
      required: false,
    },
    {
      label: "Aadhaar Card (Back)",
      url: appAny.aadharBackUrl,
      required: false,
    },
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
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-800 border border-amber-500/20 flex items-center justify-center font-bold text-sm shadow-2xs">
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
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {category || application.category || "Pending Classification"} • Submitted{" "}
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Vendor</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2 border-b border-slate-100 bg-white flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("review")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "review"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Review &amp; KYC
          </button>
          <button
            onClick={() => setActiveTab("emails")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "emails"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Automail History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-[#dc2626] font-bold">
              {emailLogs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "activity"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Activity Audit</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {activityLogs.length}
            </span>
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

          {/* ========================================================== */}
          {/* TAB 1: REVIEW & KYC */}
          {/* ========================================================== */}
          {activeTab === "review" && (
            <div className="space-y-6">
              {/* Status Ribbon & Invite Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Workflow Stage
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {application.currentStage || application.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                  <button
                    onClick={handleInviteToPortal}
                    disabled={inviting}
                    title="Resend 1-click password setup link to vendor's email"
                    className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{inviting ? "Sending..." : "Resend Setup Link"}</span>
                  </button>
                </div>
              </div>

              {/* Mobile OTP & Work Profile (from 5-Step Registration) */}
              {(appAny.phoneVerified || appAny.experienceYears || appAny.projectScale || appAny.primaryRole) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile Verification</span>
                    <span className="font-bold text-slate-900">
                      {appAny.phoneVerified ? "OTP Verified ✓" : "Unverified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Vendor Type</span>
                    <span className="font-bold text-slate-900">{appAny.entityType || "—"}</span>
                  </div>
                  {appAny.primaryRole && (
                    <div className="col-span-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Custom / Primary Work</span>
                      <span className="font-bold text-slate-900">{appAny.primaryRole}</span>
                    </div>
                  )}
                  {appAny.experienceYears && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Experience</span>
                      <span className="font-bold text-slate-900">{appAny.experienceYears}</span>
                    </div>
                  )}
                  {appAny.projectScale && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Project Scale</span>
                      <span className="font-bold text-slate-900">{appAny.projectScale}</span>
                    </div>
                  )}
                </div>
              )}

              {inviteSuccess && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                  <p className="font-bold text-xs">Direct Portal Password Setup Link:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteSuccess}
                      className="flex-1 bg-white border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteSuccess);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center gap-1"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              )}

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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">GSTIN</p>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{application.gstin || "NOT PROVIDED"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">PAN Card</p>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{application.pan}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Annual Turnover</p>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {application.turnoverBracket || application.annualTurnover || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Bank Name</p>
                    <p className="font-semibold text-slate-900 mt-0.5">{application.bankName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Account Number</p>
                    <p className="font-mono text-slate-900 mt-0.5">
                      {application.accountNumber || application.bankAccountNumber || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">IFSC Code</p>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">
                      {application.ifscCode || application.bankIfsc || "—"}
                    </p>
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
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 font-semibold flex items-center gap-1 transition-colors text-[11px]"
                        >
                          <span>View File</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Trade Category (व्यापार श्रेणी) *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">— Select Category (Required to Approve) —</option>
                      <option value="Civil Construction">Civil Construction</option>
                      <option value="Electrical & MEP">Electrical & MEP</option>
                      <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
                      <option value="Fabrication & PEB">Fabrication & PEB</option>
                      <option value="Flooring & Finishing">Flooring & Finishing</option>
                      <option value="Material Supply">Material Supply</option>
                    </select>
                  </div>

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
          )}

          {/* ========================================================== */}
          {/* TAB 2: EMAILS LOG */}
          {/* ========================================================== */}
          {activeTab === "emails" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900">
                  Empanelment Mailer Dispatch Log
                </h3>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-3 py-1 rounded-xl bg-[#dc2626] text-white text-xs font-bold"
                >
                  + New Email
                </button>
              </div>

              {emailLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No automated or manual emails logged for this vendor yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{log.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            log.status === "SENT"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        To: {log.recipient} • Sent:{" "}
                        {new Date(log.sentAt || log.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {log.status !== "SENT" && (
                        <button
                          onClick={() => handleRetryEmail(log.id)}
                          disabled={retryingLogId === log.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>{retryingLogId === log.id ? "Retrying..." : "Retry Dispatch"}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: ACTIVITY AUDIT */}
          {/* ========================================================== */}
          {activeTab === "activity" && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-slate-900">
                Vendor Activity & Security Audit Events
              </h3>
              {activityLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No security or submission events logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {activityLogs.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{act.action.replace(/_/g, " ")}</p>
                        {act.details && <p className="text-slate-500 text-[11px]">{act.details}</p>}
                        <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                          Actor: {act.actorName || act.actorType}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {new Date(act.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            onClick={() => handleUpdate("REJECTED")}
            disabled={saving}
            className="px-4 py-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/80 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-1.5 transition-colors text-xs disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdate("DOCS_REQUESTED")}
              disabled={saving}
              className="px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-purple-50/80 hover:bg-purple-100 text-purple-800 font-semibold transition-colors text-xs disabled:opacity-50"
            >
              Request Docs
            </button>

            <button
              onClick={() => handleUpdate("APPROVED")}
              disabled={saving}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs flex items-center gap-2 transition-all text-xs disabled:opacity-50 active:scale-[0.99]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{saving ? "Processing..." : "Approve & Empanel"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Email Composer Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsEmailModalOpen(false)} />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-950 text-base">Send Email via HiPRO Automail</h3>
                <p className="text-xs text-slate-500">To: {application.email}</p>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {emailModalError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
                {emailModalError}
              </div>
            )}

            {emailModalSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {emailModalSuccess}
              </div>
            )}

            <form onSubmit={handleSendManualEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  From Mailbox / Alias
                </label>
                {loadingMailContext ? (
                  <div className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading mailboxes &amp; aliases...
                  </div>
                ) : senderOptions.length > 1 ? (
                  <select
                    value={`${selectedMailboxId}::${activeSenderEmail}`}
                    onChange={(e) => {
                      const [mbId, senderEmail] = e.target.value.split("::");
                      setSelectedMailboxId(mbId || "");
                      setSelectedSenderEmail(senderEmail || "");
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 font-mono font-semibold"
                  >
                    {senderOptions.map((opt) => (
                      <option key={`${opt.mailboxId}::${opt.email}`} value={`${opt.mailboxId}::${opt.email}`}>
                        {opt.email} ({opt.isAlias ? `Alias · ${opt.label}` : opt.label})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-mono font-bold text-emerald-800">
                    {activeSenderEmail}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Template
                </label>
                <select
                  value={emailTemplate}
                  onChange={(e) => {
                    const t = e.target.value;
                    setEmailTemplate(t);
                    if (t === "DOCS_REQUESTED") {
                      setEmailSubject("Clarification & Document Revision Required - Hindustan Projects Empanelment");
                      setEmailBody(`Dear ${application.contactName},\n\nPlease review the requested updates to your empanelment application dossier.\n\nRemarks:\n${remarks || "Please re-upload a clear copy of your GSTIN certificate and cancelled cheque."}\n\nYou can re-upload your files directly by signing in to the Vendor Portal.\n\nWarm regards,\nHindustan Projects Procurement Team`);
                    } else if (t === "INVITATION") {
                      setEmailSubject("Your HiPRO Vendor Portal Account is Ready - Invitation & Activation");
                      setEmailBody(`Dear ${application.contactName},\n\nWe are pleased to invite ${application.companyName} to the HiPRO Vendor Partner Portal.\n\nPlease activate your account to browse live construction tenders and generate 24-hr site gate passes.\n\nWarm regards,\nHindustan Projects Team`);
                    } else if (t === "APPROVED") {
                      setEmailSubject("Congratulations! Empanelment Approved - Hindustan Projects");
                      setEmailBody(`Dear ${application.contactName},\n\nWe are pleased to inform you that ${application.companyName} has been approved as an empanelled contractor (${tier}) under ${category}.\n\nYour official PVC Smart Card credentials are now active.\n\nWarm regards,\nHindustan Projects`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 font-semibold"
                >
                  <option value="CUSTOM">Custom Ad-hoc Message</option>
                  <option value="DOCS_REQUESTED">Document Revision Request</option>
                  <option value="INVITATION">Vendor Portal Account Invitation</option>
                  <option value="APPROVED">Empanelment Approval Notification</option>
                </select>
              </div>

              {/* AI Draft Assistant */}
              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-800 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Draft with AI</span>
                  </div>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAiDraftEmail();
                      }
                    }}
                    placeholder="e.g. Ask for updated GST & cancelled cheque..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAiDraftEmail}
                    disabled={aiDrafting}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 shrink-0"
                  >
                    {aiDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>{aiDrafting ? "Drafting..." : "AI Draft"}</span>
                  </button>
                </div>
                {aiError && <p className="text-[11px] text-red-600">{aiError}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Action Required: Document Update for Empanelment"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Body (Automail HTML Wrapper automatically applied) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Type message text here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="px-5 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingEmail ? "Dispatching..." : "Send Email"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
