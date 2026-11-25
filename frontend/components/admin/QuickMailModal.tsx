"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  X,
  Send,
  Mail,
  Eye,
  PenSquare,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  Flame,
} from "lucide-react";

export interface QuickMailPreset {
  id: string;
  label: string;
  subject: string;
  messageText: string;
  nextStatus?: string;
}

export interface QuickMailRecipient {
  name: string;
  email: string;
  phone?: string;
  leadId?: string;
  leadType?:
    | "quote"
    | "estimator"
    | "contact"
    | "project"
    | "service"
    | "application"
    | "hbs_lead"
    | "vendor_app";
  brand?: "hipro" | "hbs" | "empanelment" | "all";
  triggerKey?: string;
  contextBadge?: string;
  defaultSubject?: string;
  defaultMessage?: string;
  defaultNextStatus?: string;
  statusOptions?: Array<{ value: string; label: string }>;
  presets?: QuickMailPreset[];
}

interface QuickMailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: QuickMailRecipient | null;
  onSentSuccess?: (result: { email: string; updatedStatus?: string; messageId?: string }) => void;
}

interface MailboxItem {
  id: string;
  name: string;
  email: string;
  brand: string;
  brandName?: string;
  isDefault?: boolean;
}

function buildDefaultPresets(recipient: QuickMailRecipient): QuickMailPreset[] {
  if (recipient.presets && recipient.presets.length > 0) {
    return recipient.presets;
  }

  const firstName = (recipient.name || "Client").trim().split(/\s+/)[0] || "there";
  const type = recipient.leadType || "contact";

  if (type === "quote" || type === "estimator") {
    return [
      {
        id: "quote_followup",
        label: "Quote & Estimate Follow-up",
        subject: `Hi ${firstName}, Regarding Your Project Quotation Request — Hindustan Projects`,
        messageText: `Dear ${recipient.name || "Client"},\n\nThank you for requesting a project quotation with Hindustan Projects.\n\nOur engineering and estimation team has reviewed your project requirements${recipient.contextBadge ? ` (${recipient.contextBadge})` : ""}. We would love to schedule a quick consultation call or site visit to finalize the detailed BOQ and timeline.\n\nPlease let us know your preferred time slot for a discussion, or reach us directly on +91 75970 00601.\n\nWarm regards,\nEngineering & Estimation Team\nHindustan Projects`,
        nextStatus: "reviewed",
      },
      {
        id: "quote_approved",
        label: "Approve & Share Next Steps",
        subject: `Project Proposal & Next Steps Confirmed for ${recipient.name || firstName} — Hindustan Projects`,
        messageText: `Dear ${recipient.name || "Client"},\n\nWe are pleased to confirm the initial project assessment for your construction requirement.\n\nOur project coordinator will shortly connect with you with the detailed execution roadmap and contract milestone schedule.\n\nWarm regards,\nHindustan Projects Management`,
        nextStatus: "approved",
      },
    ];
  }

  if (type === "application") {
    return [
      {
        id: "app_shortlist",
        label: "Shortlist / Interview Invite",
        subject: `Interview Invitation — ${recipient.contextBadge || "Career Application"} at Hindustan Projects`,
        messageText: `Dear ${recipient.name || "Candidate"},\n\nThank you for applying with Hindustan Projects.\n\nWe have reviewed your profile and would like to invite you for an interview discussion with our technical hiring panel.\n\nPlease reply with your availability over the next 2–3 working days so we can confirm the interview slot and venue details.\n\nBest regards,\nHR & Talent Acquisition\nHindustan Projects`,
        nextStatus: "interviewed",
      },
      {
        id: "app_review",
        label: "Application Under Review",
        subject: `Update on Your Application with Hindustan Projects`,
        messageText: `Dear ${recipient.name || "Candidate"},\n\nWe confirm receipt of your job application and resume with Hindustan Projects. Our HR & engineering department is currently evaluating profiles and will update you on the next steps shortly.\n\nBest regards,\nHR Team — Hindustan Projects`,
        nextStatus: "reviewed",
      },
    ];
  }

  if (type === "hbs_lead") {
    return [
      {
        id: "hbs_inspection",
        label: "Site Inspection Schedule",
        subject: `Site Inspection Confirmation for ${recipient.name || firstName} — Hind Building Solutions`,
        messageText: `Dear ${recipient.name || "Client"},\n\nThank you for contacting Hind Building Solutions (HiBUILD) for waterproofing & structural repair works.\n\nOur technical field engineer is available to conduct a non-destructive thermal & moisture inspection at your property to diagnose the root cause and share a written treatment plan with workmanship warranty.\n\nPlease confirm your preferred date/time or call +91 75970 00601.\n\nWarm regards,\nTechnical Care Team\nHind Building Solutions`,
        nextStatus: "FOLLOW_UP",
      },
      {
        id: "hbs_quotation",
        label: "Repair BOQ & Warranty Proposal",
        subject: `Waterproofing Treatment Quotation & 10-Yr Warranty Proposal — Hind Building Solutions`,
        messageText: `Dear ${recipient.name || "Client"},\n\nFollowing our review of your repair requirement${recipient.contextBadge ? ` (${recipient.contextBadge})` : ""}, we have prepared the technical treatment scope and chemical specification proposal.\n\nAll treatments come with multi-stage polymer/PU application standards and documented warranty assurance.\n\nPlease reply here or call +91 75970 00601 to proceed with execution scheduling.\n\nWarm regards,\nHind Building Solutions`,
        nextStatus: "QUOTATION_SENT",
      },
    ];
  }

  if (type === "vendor_app") {
    return [
      {
        id: "vendor_update",
        label: "KYC Review Update",
        subject: `Vendor Empanelment Status Update — Hindustan Projects`,
        messageText: `Dear ${recipient.name || "Partner"},\n\nThank you for submitting your vendor empanelment dossier with Hindustan Projects Procurement Directorate.\n\nPlease check your Partner Portal or reply to this email if you need to submit any additional GST, PAN, or work-order credentials.\n\nWarm regards,\nProcurement Directorate\nHindustan Projects`,
      },
    ];
  }

  // Contact / Project / Service / General Inquiry default
  return [
    {
      id: "inquiry_reply",
      label: "Direct Inquiry Reply",
      subject: `Re: Your Inquiry with Hindustan Projects — Confirmation & Next Steps`,
      messageText: `Dear ${recipient.name || "Client"},\n\nThank you for reaching out to Hindustan Projects.\n\nWe have reviewed your message${recipient.contextBadge ? ` regarding ${recipient.contextBadge}` : ""}. One of our senior project specialists is ready to discuss your requirements in detail.\n\nPlease feel free to reply directly to this email or reach our helpline at +91 75970 00601.\n\nWarm regards,\nHindustan Projects Team`,
      nextStatus: "replied",
    },
    {
      id: "consultation_invite",
      label: "Schedule Consultation Call",
      subject: `Schedule Your Engineering Consultation — Hindustan Projects`,
      messageText: `Dear ${recipient.name || "Client"},\n\nThank you for contacting Hindustan Projects. We would be delighted to connect over a call or in-person meeting at your convenience to understand your project scope, budget, and timeline.\n\nLet us know a convenient time slot.\n\nWarm regards,\nHindustan Projects`,
      nextStatus: "replied",
    },
  ];
}

function getDefaultStatusOptions(leadType?: QuickMailRecipient["leadType"]) {
  if (leadType === "quote" || leadType === "estimator") {
    return [
      { value: "", label: "Keep current status" },
      { value: "reviewed", label: "Mark as Reviewed" },
      { value: "approved", label: "Mark as Approved" },
    ];
  }
  if (leadType === "application") {
    return [
      { value: "", label: "Keep current status" },
      { value: "reviewed", label: "Mark as Under Review" },
      { value: "interviewed", label: "Mark as Shortlisted" },
      { value: "rejected", label: "Mark as Rejected" },
    ];
  }
  if (leadType === "hbs_lead") {
    return [
      { value: "", label: "Keep current stage" },
      { value: "CONTACTED", label: "Move to First Contact" },
      { value: "FOLLOW_UP", label: "Move to Site Inspection" },
      { value: "QUOTATION_SENT", label: "Move to Quotation Sent" },
    ];
  }
  if (leadType === "contact" || leadType === "project" || leadType === "service") {
    return [
      { value: "", label: "Keep current status" },
      { value: "replied", label: "Mark as Replied" },
      { value: "read", label: "Mark as Read" },
    ];
  }
  return [];
}

export default function QuickMailModal({
  isOpen,
  onClose,
  recipient,
  onSentSuccess,
}: QuickMailModalProps) {
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedMailboxId, setSelectedMailboxId] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  // Server context state
  const [loadingContext, setLoadingContext] = useState(false);
  const [mailboxes, setMailboxes] = useState<MailboxItem[]>([]);
  const [emailConfigured, setEmailConfigured] = useState(true);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);

  // Live preview state
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");

  // Dispatch state
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sentResult, setSentResult] = useState<{
    message: string;
    senderEmail: string;
    messageId?: string;
    isMock?: boolean;
  } | null>(null);

  const presets = recipient ? buildDefaultPresets(recipient) : [];
  const statusOptions =
    recipient?.statusOptions && recipient.statusOptions.length > 0
      ? recipient.statusOptions
      : getDefaultStatusOptions(recipient?.leadType);

  // Initialize form whenever recipient opens
  useEffect(() => {
    if (!isOpen || !recipient) return;

    const initialPresets = buildDefaultPresets(recipient);
    const firstPreset = initialPresets[0];

    setActiveTab("compose");
    setSubject(recipient.defaultSubject || firstPreset?.subject || "");
    setMessageText(recipient.defaultMessage || firstPreset?.messageText || "");
    setUpdateStatus(
      recipient.defaultNextStatus !== undefined
        ? recipient.defaultNextStatus
        : firstPreset?.nextStatus || ""
    );
    setError("");
    setSentResult(null);
    setPreviewHtml("");

    // Fetch real corporate mailbox context
    setLoadingContext(true);
    const params = new URLSearchParams();
    if (recipient.triggerKey) params.set("triggerKey", recipient.triggerKey);
    if (recipient.brand) params.set("brand", recipient.brand);

    fetch(`/api/mail/context?${params.toString()}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setMailboxes(json.data.mailboxes || []);
          setEmailConfigured(json.data.emailConfigured !== false);
          setCustomTemplates(json.data.customTemplates || []);
          if (json.data.defaultMailbox?.id) {
            setSelectedMailboxId(json.data.defaultMailbox.id);
          } else if (json.data.mailboxes?.length > 0) {
            setSelectedMailboxId(json.data.mailboxes[0].id);
          }
        }
      })
      .catch(() => {
        // Non-blocking fallback handled gracefully
      })
      .finally(() => setLoadingContext(false));
  }, [isOpen, recipient]);

  const loadPreview = useCallback(async () => {
    if (!recipient) return;
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/mail/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: recipient.email,
          name: recipient.name,
          subject,
          messageText,
          brand: recipient.brand || "hipro",
          mailboxId: selectedMailboxId || undefined,
          triggerKey: recipient.triggerKey,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPreviewHtml(json.data.previewHtml || "");
        setPreviewSubject(json.data.previewSubject || subject);
      }
    } catch {
      // Quiet failover
    } finally {
      setLoadingPreview(false);
    }
  }, [recipient, subject, messageText, selectedMailboxId]);

  useEffect(() => {
    if (activeTab === "preview" && isOpen && recipient) {
      loadPreview();
    }
  }, [activeTab, isOpen, recipient, loadPreview]);

  if (!isOpen || !recipient) return null;

  const activeMailbox =
    mailboxes.find((m) => m.id === selectedMailboxId) || mailboxes[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError("Subject line is required.");
      return;
    }
    if (!messageText.trim()) {
      setError("Please enter a reply message.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: recipient.email,
          name: recipient.name,
          subject: subject.trim(),
          messageText: messageText.trim(),
          brand: recipient.brand || "hipro",
          mailboxId: selectedMailboxId || undefined,
          triggerKey: recipient.triggerKey,
          leadId: recipient.leadId,
          leadType: recipient.leadType,
          updateStatus: updateStatus || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to send email. Check AutoMail Settings.");
        return;
      }

      setSentResult({
        message: json.message || `Email delivered to ${recipient.email}!`,
        senderEmail: json.data?.senderEmail || activeMailbox?.email || "info@hindustanprojects.in",
        messageId: json.data?.messageId,
        isMock: json.data?.isMock,
      });

      if (onSentSuccess) {
        onSentSuccess({
          email: recipient.email,
          updatedStatus: json.data?.updatedStatus || updateStatus || undefined,
          messageId: json.data?.messageId,
        });
      }
    } catch {
      setError("Network error while communicating with mail server.");
    } finally {
      setSending(false);
    }
  };

  const brand = recipient.brand || "hipro";
  const isHbs = brand === "hbs";
  const isEmp = brand === "empanelment";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-mail-modal-title"
    >
      {/* Translucent backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/55 backdrop-blur-md transition-opacity"
        onClick={() => !sending && onClose()}
      />

      {/* Apple Cupertino Frosted Sheet Container */}
      <div className="relative z-10 w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_28px_70px_-15px_rgba(15,23,42,0.38)] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isHbs
                  ? "bg-orange-50 text-orange-600 border border-orange-200/80"
                  : isEmp
                  ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                  : "bg-blue-50 text-blue-600 border border-blue-200/80"
              }`}
            >
              {isHbs ? (
                <Flame className="w-5 h-5" />
              ) : isEmp ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="quick-mail-modal-title"
                  className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate"
                >
                  Send Official Mail to {recipient.name || "Client"}
                </h2>
                {recipient.contextBadge && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[200px]">
                    {recipient.contextBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                To: <span className="text-slate-800 font-semibold">{recipient.email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={sending}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close mail composer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State after Dispatch */}
        {sentResult ? (
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">Email Delivered Successfully!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {sentResult.message}
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                  From: {sentResult.senderEmail}
                </span>
                {sentResult.messageId && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                    ID: {String(sentResult.messageId).slice(0, 22)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/admin/automail"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                View Mail Logs
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Done &amp; Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col flex-1 min-h-0">
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Credentials missing warning if unconfigured */}
              {!emailConfigured && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Hostinger Mail API / SMTP credentials missing in AutoMail Settings.</span>
                  </div>
                  <Link
                    href="/admin/automail/settings"
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] shrink-0"
                  >
                    Configure →
                  </Link>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between gap-2">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-rose-500 hover:text-rose-800"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Sender Mailbox & Segmented Tab Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono shrink-0">
                    From:
                  </span>
                  {loadingContext ? (
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Resolving mailbox...
                    </span>
                  ) : mailboxes.length > 1 ? (
                    <select
                      value={selectedMailboxId}
                      onChange={(e) => setSelectedMailboxId(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500 truncate max-w-full cursor-pointer"
                    >
                      {mailboxes.map((mb) => (
                        <option key={mb.id} value={mb.id}>
                          {mb.email} ({mb.brandName || mb.name})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-mono font-bold truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {activeMailbox?.email || "info@hindustanprojects.in"}
                    </span>
                  )}
                </div>

                {/* Write vs Live Preview Segmented Control */}
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("compose")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "compose"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>Write Reply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "preview"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Email</span>
                  </button>
                </div>
              </div>

              {activeTab === "compose" ? (
                <>
                  {/* Quick 1-Click Presets */}
                  {presets.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Quick Reply Templates (1-Click Fill)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {presets.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSubject(p.subject);
                              setMessageText(p.messageText);
                              if (p.nextStatus !== undefined) {
                                setUpdateStatus(p.nextStatus);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold transition-all cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                        {customTemplates.slice(0, 2).map((ct) => (
                          <button
                            key={ct.id}
                            type="button"
                            onClick={() => {
                              setSubject(ct.subject);
                              const plain = String(ct.html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                              setMessageText(plain || ct.title);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition-all cursor-pointer"
                          >
                            ★ {ct.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subject Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Clean Message Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                        Message Body *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Auto-wrapped in official Hindustan Projects branding &amp; footer
                      </span>
                    </div>
                    <textarea
                      rows={7}
                      required
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Write your reply here in simple plain text..."
                      className="w-full px-3.5 py-3 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y min-h-[160px]"
                    />
                  </div>

                  {/* Auto-Update Record Status */}
                  {recipient.leadId && statusOptions.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-700">
                        After sending email, update status:
                      </span>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                /* Live Visual Branded Email Preview Tab */
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-400 font-mono uppercase text-[10px] mr-1.5">From:</span>
                      <span className="font-semibold text-slate-900">
                        {activeMailbox?.name || "Hindustan Projects"} &lt;{activeMailbox?.email || "info@hindustanprojects.in"}&gt;
                      </span>
                    </p>
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-400 font-mono uppercase text-[10px] mr-1.5">To:</span>
                      <span className="font-semibold text-slate-900">
                        {recipient.name} &lt;{recipient.email}&gt;
                      </span>
                    </p>
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-400 font-mono uppercase text-[10px] mr-1.5">Subject:</span>
                      <span className="font-bold text-slate-900">{previewSubject || subject}</span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden min-h-[300px] max-h-[380px] overflow-y-auto">
                    {loadingPreview ? (
                      <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span>Rendering official corporate template...</span>
                      </div>
                    ) : (
                      <div
                        className="p-2"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Ribbon */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/admin/automail/compose?to=${encodeURIComponent(recipient.email)}&name=${encodeURIComponent(recipient.name || "")}&brand=${recipient.brand || "hipro"}`}
                onClick={onClose}
                className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
                title="Open in full AutoMail Studio for raw HTML templates or bulk campaigns"
              >
                <Mail className="w-3 h-3" />
                <span>Advanced AutoMail Studio</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  disabled={sending}
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Mail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Email Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
