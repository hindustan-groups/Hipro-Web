"use client";

import { useState, useEffect } from "react";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import {
  Settings,
  ShieldCheck,
  Server,
  Mail,
  Key,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Building2,
  Hammer,
  HelpCircle,
  Zap,
  Globe,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Star,
  Layers,
  ArrowRight,
  Shuffle,
  ShieldAlert,
  Sliders,
  CheckCheck,
} from "lucide-react";

export interface CorporateMailbox {
  id: string;
  name: string;
  email: string;
  brand: string;
  brandName?: string;
  deliveryMethod: "smtp" | "hostinger_api";
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpPassConfigured?: boolean;
  hostingerApiToken?: string;
  hostingerMailboxId?: string;
  isDefault?: boolean;
  status: "active" | "inactive";
  replyTo?: string;
  description?: string;
}

export interface DispatchRoutingRule {
  triggerKey: string;
  name: string;
  portal: string;
  description: string;
  mailboxId: string;
  fallbackMailboxId?: string;
  ccEmail?: string;
  active: boolean;
}

export default function AutoMailSettingsPage() {
  const [activeTab, setActiveTab] = useState<"mailboxes" | "routing" | "engine">("mailboxes");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Corporate Mailboxes State
  const [mailboxes, setMailboxes] = useState<CorporateMailbox[]>([]);
  const [testingMailboxId, setTestingMailboxId] = useState<string | null>(null);
  const [mailboxTestResults, setMailboxTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  // Mailbox Modal State (Add / Edit)
  const [isMailboxModalOpen, setIsMailboxModalOpen] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState<CorporateMailbox | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalTesting, setModalTesting] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [modalShowPassword, setModalShowPassword] = useState(false);

  // Mailbox Form State
  const [formMbName, setFormMbName] = useState("");
  const [formMbEmail, setFormMbEmail] = useState("");
  const [formMbBrand, setFormMbBrand] = useState("hipro");
  const [formMbBrandName, setFormMbBrandName] = useState("HiPRO Flagship Civil");
  const [formMbDelivery, setFormMbDelivery] = useState<"smtp" | "hostinger_api">("smtp");
  const [formMbHost, setFormMbHost] = useState("smtp.hostinger.com");
  const [formMbPort, setFormMbPort] = useState(465);
  const [formMbUser, setFormMbUser] = useState("");
  const [formMbPass, setFormMbPass] = useState("");
  const [formMbIsDefault, setFormMbIsDefault] = useState(false);
  const [formMbStatus, setFormMbStatus] = useState<"active" | "inactive">("active");
  const [formMbDesc, setFormMbDesc] = useState("");

  // Automated Dispatch Routing Matrix State
  const [routingRules, setRoutingRules] = useState<Record<string, DispatchRoutingRule>>({});
  const [savingRouting, setSavingRouting] = useState(false);

  // Global Engine Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState<"hostinger_api" | "smtp">("hostinger_api");
  const [hostingerApiToken, setHostingerApiToken] = useState("");
  const [hostingerApiTokenConfigured, setHostingerApiTokenConfigured] = useState(false);
  const [hostingerMailboxId, setHostingerMailboxId] = useState("");
  const [connectedMailboxes, setConnectedMailboxes] = useState<Array<{ resourceId: string; address: string }>>([]);
  const [fetchingMailboxes, setFetchingMailboxes] = useState(false);

  // SMTP Form State (Global fallback)
  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState("info@hindustanprojects.in");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpPassConfigured, setSmtpPassConfigured] = useState(false);

  // Rate Limits
  const [dailyLimit, setDailyLimit] = useState(200);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(15);
  const [replyTo, setReplyTo] = useState("info@hindustanprojects.in");

  // Test states
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; mailboxes?: Array<{ resourceId: string; address: string }> } | null>(null);
  const [testRecipient, setTestRecipient] = useState("");
  const [testSelectedMailboxId, setTestSelectedMailboxId] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch settings, mailboxes, and routing
  const fetchAllSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/automail/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setDeliveryMethod(s.deliveryMethod || "smtp");
        setHostingerApiToken(s.hostingerApiToken || "");
        setHostingerApiTokenConfigured(Boolean(s.hostingerApiTokenConfigured));
        setHostingerMailboxId(s.hostingerMailboxId || "");
        setSmtpHost(s.smtpHost || "smtp.hostinger.com");
        setSmtpPort(s.smtpPort || 465);
        setSmtpUser(s.smtpUser || "info@hindustanprojects.in");
        setSmtpPass("");
        setDailyLimit(s.dailyLimit || 200);
        setRateLimitPerMinute(s.rateLimitPerMinute || 15);
        setReplyTo(s.replyTo || "info@hindustanprojects.in");
        setSmtpPassConfigured(Boolean(s.smtpPassConfigured));

        // Mailboxes & Routing
        if (Array.isArray(s.mailboxes)) {
          setMailboxes(s.mailboxes);
          if (s.mailboxes.length > 0 && !testSelectedMailboxId) {
            setTestSelectedMailboxId(s.mailboxes[0].id);
          }
        }
        if (s.dispatchRouting) {
          setRoutingRules(s.dispatchRouting);
        }

        if (s.hostingerApiTokenConfigured) {
          fetchHostingerMailboxes();
        }
      }
    } catch {
      setToast({ message: "Failed to load current settings from server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchHostingerMailboxes = async () => {
    setFetchingMailboxes(true);
    try {
      const res = await fetch("/api/automail/mailboxes");
      const data = await res.json();
      if (data.success && Array.isArray(data.hostingerDiscovered)) {
        setConnectedMailboxes(data.hostingerDiscovered);
      }
    } catch {
      // Non-blocking
    } finally {
      setFetchingMailboxes(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingMailbox(null);
    setFormMbName("");
    setFormMbEmail("");
    setFormMbBrand("hipro");
    setFormMbBrandName("HiPRO Flagship Civil");
    setFormMbDelivery("smtp");
    setFormMbHost("smtp.hostinger.com");
    setFormMbPort(465);
    setFormMbUser("");
    setFormMbPass("");
    setFormMbIsDefault(mailboxes.length === 0);
    setFormMbStatus("active");
    setFormMbDesc("");
    setModalTestResult(null);
    setModalShowPassword(false);
    setIsMailboxModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (mb: CorporateMailbox) => {
    setEditingMailbox(mb);
    setFormMbName(mb.name);
    setFormMbEmail(mb.email);
    setFormMbBrand(mb.brand);
    setFormMbBrandName(mb.brandName || "Corporate Desk");
    setFormMbDelivery(mb.deliveryMethod || "smtp");
    setFormMbHost(mb.smtpHost || "smtp.hostinger.com");
    setFormMbPort(mb.smtpPort || 465);
    setFormMbUser(mb.smtpUser || mb.email);
    setFormMbPass("");
    setFormMbIsDefault(Boolean(mb.isDefault));
    setFormMbStatus(mb.status || "active");
    setFormMbDesc(mb.description || "");
    setModalTestResult(null);
    setModalShowPassword(false);
    setIsMailboxModalOpen(true);
  };

  // Test Mailbox from inside Modal
  const handleTestInModal = async () => {
    if (!formMbEmail.trim()) {
      setModalTestResult({ success: false, message: "Please enter an email address first." });
      return;
    }
    setModalTesting(true);
    setModalTestResult(null);
    try {
      const res = await fetch("/api/automail/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod: formMbDelivery,
          smtpHost: formMbHost,
          smtpPort: Number(formMbPort),
          smtpUser: formMbUser.trim() || formMbEmail.trim(),
          smtpPass: formMbPass.trim() || (editingMailbox?.smtpPassConfigured ? "••••••••••••" : ""),
        }),
      });
      const data = await res.json();
      setModalTestResult({
        success: data.success,
        message: data.message || (data.success ? "Connection handshake passed!" : "Connection handshake failed."),
      });
    } catch {
      setModalTestResult({ success: false, message: "Network error reaching server." });
    } finally {
      setModalTesting(false);
    }
  };

  // Save Mailbox from Modal
  const handleSaveMailbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMbEmail.trim() || !formMbName.trim()) {
      setToast({ message: "Mailbox display name and email address are required.", type: "error" });
      return;
    }

    setModalSaving(true);
    try {
      const payload: Partial<CorporateMailbox> = {
        ...(editingMailbox ? { id: editingMailbox.id } : {}),
        name: formMbName.trim(),
        email: formMbEmail.trim().toLowerCase(),
        brand: formMbBrand,
        brandName: formMbBrandName.trim(),
        deliveryMethod: formMbDelivery,
        smtpHost: formMbHost.trim(),
        smtpPort: Number(formMbPort),
        smtpUser: formMbUser.trim() || formMbEmail.trim().toLowerCase(),
        isDefault: formMbIsDefault,
        status: formMbStatus,
        description: formMbDesc.trim(),
      };

      if (formMbPass.trim()) {
        payload.smtpPass = formMbPass.trim();
      }

      const res = await fetch("/api/automail/mailboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: data.message || "Corporate mailbox saved!", type: "success" });
        setIsMailboxModalOpen(false);
        fetchAllSettings();
      } else {
        setToast({ message: data.error || "Failed to save mailbox", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving mailbox", type: "error" });
    } finally {
      setModalSaving(false);
    }
  };

  // Delete Mailbox
  const handleDeleteMailbox = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete corporate mailbox "${email}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/automail/mailboxes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Mailbox "${email}" deleted.`, type: "success" });
        fetchAllSettings();
      } else {
        setToast({ message: data.error || "Failed to delete mailbox", type: "error" });
      }
    } catch {
      setToast({ message: "Network error deleting mailbox", type: "error" });
    }
  };

  // Test single mailbox from card
  const handleTestMailbox = async (id: string) => {
    setTestingMailboxId(id);
    try {
      const res = await fetch(`/api/automail/mailboxes/${id}/test`, { method: "POST" });
      const data = await res.json();
      setMailboxTestResults((prev) => ({
        ...prev,
        [id]: {
          success: data.success,
          message: data.message || (data.success ? "Verified!" : "Failed"),
        },
      }));
    } catch {
      setMailboxTestResults((prev) => ({
        ...prev,
        [id]: { success: false, message: "Network error" },
      }));
    } finally {
      setTestingMailboxId(null);
    }
  };

  // Set Mailbox as Default
  const handleSetDefault = async (mb: CorporateMailbox) => {
    try {
      const res = await fetch("/api/automail/mailboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...mb, isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `"${mb.email}" is now the primary default outgoing mailbox.`, type: "success" });
        fetchAllSettings();
      }
    } catch {
      setToast({ message: "Failed to update default mailbox", type: "error" });
    }
  };

  // Save Dispatch Routing Matrix
  const handleSaveRouting = async () => {
    setSavingRouting(true);
    try {
      const res = await fetch("/api/automail/routing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routing: routingRules }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: "✓ Automated Dispatch Routing Matrix updated permanently!", type: "success" });
      } else {
        setToast({ message: data.error || "Failed to save routing matrix", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving routing rules", type: "error" });
    } finally {
      setSavingRouting(false);
    }
  };

  // Save Global Engine Settings
  const handleSaveEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTestResult(null);

    const effectivePass = smtpPass.trim() || (smtpPassConfigured ? "••••••••••••" : "");
    const effectiveToken = hostingerApiToken.trim();

    try {
      const res = await fetch("/api/automail/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          hostingerApiToken: effectiveToken,
          hostingerMailboxId,
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpUser,
          smtpPass: effectivePass,
          dailyLimit: Number(dailyLimit),
          rateLimitPerMinute: Number(rateLimitPerMinute),
          replyTo,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: "✓ Engine settings saved permanently to PostgreSQL!", type: "success" });
        setSmtpPassConfigured(Boolean(data.settings?.smtpPassConfigured));
        setHostingerApiTokenConfigured(Boolean(data.settings?.hostingerApiTokenConfigured));
        setSmtpPass("");
      } else {
        setToast({ message: data.error || "Failed to save engine settings", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Global Test Connection Handshake
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const effectivePass = smtpPass.trim() || (smtpPassConfigured ? "••••••••••••" : "");
    const effectiveToken = hostingerApiToken.trim();

    try {
      const res = await fetch("/api/automail/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          hostingerApiToken: effectiveToken,
          hostingerMailboxId,
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpUser,
          smtpPass: effectivePass,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        setToast({ message: "✓ Connection verified successfully!", type: "success" });
      } else {
        setToast({ message: "Connection test failed: " + (data.message || "Unknown error"), type: "error" });
      }
    } catch {
      setTestResult({ success: false, message: "Network error attempting to test connection" });
    } finally {
      setTesting(false);
    }
  };

  // Send Test Email Sandbox
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) {
      setToast({ message: "Please enter a test recipient email address", type: "error" });
      return;
    }

    setSendingTest(true);
    try {
      const res = await fetch("/api/automail/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testRecipient,
          mailboxId: testSelectedMailboxId,
          subject: "AutoMail Corporate Dispatch Test",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: `✓ Success! Test email delivered to ${testRecipient}`, type: "success" });
      } else {
        setToast({ message: data.error || "Failed to send test email", type: "error" });
      }
    } catch {
      setToast({ message: "Network error sending test email", type: "error" });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      <AutoMailNav />

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                Corporate AutoMail Engine
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                {mailboxes.length} Mailboxes Configured
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display mt-1">
              Multi-Mailbox Manager & Dispatch Routing
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Configure unlimited corporate mailboxes for Hindustan Projects, Hind Building (HBS), and auxiliary entities. Map every system event, quotation request, and KYC notification to its designated sender mailbox.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Corporate Mailbox</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("mailboxes")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "mailboxes"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Corporate Mailboxes ({mailboxes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("routing")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "routing"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Automated Dispatch Routing Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("engine")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "engine"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Hostinger Engine & Limits</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold">Loading AutoMail configurations...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* TAB 1: CORPORATE MAILBOXES MANAGER */}
          {/* ========================================================================= */}
          {activeTab === "mailboxes" && (
            <div className="space-y-6">
              {/* Mailbox Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mailboxes.map((mb) => {
                  const isTestingThis = testingMailboxId === mb.id;
                  const testRes = mailboxTestResults[mb.id];

                  return (
                    <div
                      key={mb.id}
                      className={`relative rounded-2xl bg-white border p-5 shadow-xs transition-all flex flex-col justify-between ${
                        mb.isDefault
                          ? "border-blue-300 ring-2 ring-blue-500/20 bg-gradient-to-b from-blue-50/30 to-white"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-mono">
                            {mb.brandName || mb.brand.toUpperCase()}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {mb.isDefault && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                Primary Default
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                mb.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {mb.status}
                            </span>
                          </div>
                        </div>

                        {/* Title & Email */}
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {mb.name}
                        </h3>
                        <p className="text-xs font-mono font-semibold text-blue-600 mt-1 break-all">
                          {mb.email}
                        </p>

                        {mb.description && (
                          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                            {mb.description}
                          </p>
                        )}

                        {/* Meta Pills */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[10px] font-mono text-slate-500">
                          <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
                            {mb.deliveryMethod === "hostinger_api" ? "Hostinger API (443)" : `SMTP (${mb.smtpPort || 465})`}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
                            {mb.smtpHost || "smtp.hostinger.com"}
                          </span>
                          {mb.smtpPassConfigured && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                              ✓ Password Saved
                            </span>
                          )}
                        </div>

                        {/* Inline Test Result Feedback */}
                        {testRes && (
                          <div
                            className={`mt-3 p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2 border ${
                              testRes.success
                                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                                : "bg-red-50 text-red-900 border-red-200"
                            }`}
                          >
                            {testRes.success ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            )}
                            <span className="truncate">{testRes.message}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTestMailbox(mb.id)}
                            disabled={isTestingThis}
                            title="Test Connection"
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {isTestingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            <span>Test Ping</span>
                          </button>

                          {!mb.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(mb)}
                              title="Make Default"
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-bold transition-all"
                            >
                              Set Default
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(mb)}
                            title="Edit Mailbox"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {mailboxes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMailbox(mb.id, mb.email)}
                              title="Delete Mailbox"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Card Placeholder */}
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 p-8 flex flex-col items-center justify-center gap-2 text-center transition-all group min-h-[220px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-all">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                    Add Another Corporate Mailbox
                  </span>
                  <span className="text-[11px] text-slate-400 max-w-[200px]">
                    Connect custom Hostinger email, SMTP host, or auxiliary department desk
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: AUTOMATED DISPATCH ROUTING MATRIX */}
          {/* ========================================================================= */}
          {activeTab === "routing" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Shuffle className="w-4 h-4 text-blue-600" />
                    <span>Automated Dispatch Routing Matrix (&quot;Kisko kis mail se jayega&quot;)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Map each automated website trigger, quotation request, and lead notification to your designated corporate mailbox.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveRouting}
                  disabled={savingRouting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 shrink-0"
                >
                  {savingRouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                  <span>Save Routing Matrix</span>
                </button>
              </div>

              {/* Routing Rules Table / Grid */}
              <div className="space-y-3">
                {Object.keys(routingRules).map((key) => {
                  const rule = routingRules[key];
                  const assignedMb = mailboxes.find((m) => m.id === rule.mailboxId);

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        rule.active
                          ? "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                          : "bg-slate-50/70 border-slate-200 opacity-60"
                      }`}
                    >
                      {/* Left: Trigger Information */}
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-mono">
                            {rule.portal}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{rule.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {rule.description}
                        </p>
                      </div>

                      {/* Middle: Outgoing Mailbox Selector */}
                      <div className="flex-1 max-w-sm">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                          Outgoing Sender Mailbox
                        </label>
                        <select
                          value={rule.mailboxId}
                          onChange={(e) => {
                            const newMbId = e.target.value;
                            setRoutingRules((prev) => ({
                              ...prev,
                              [key]: {
                                ...prev[key],
                                mailboxId: newMbId,
                              },
                            }));
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          {mailboxes.map((mb) => (
                            <option key={mb.id} value={mb.id}>
                              {mb.name} ({mb.email}) {mb.isDefault ? "★ Default" : ""}
                            </option>
                          ))}
                        </select>
                        {assignedMb && (
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                            Dispatched via: {assignedMb.email} ({assignedMb.deliveryMethod.toUpperCase()})
                          </span>
                        )}
                      </div>

                      {/* Right: Internal CC Alert Recipients & Toggle */}
                      <div className="flex items-center gap-4">
                        <div className="w-48">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                            Internal Alert CC
                          </label>
                          <input
                            type="text"
                            placeholder="Optional: director@..."
                            value={rule.ccEmail || ""}
                            onChange={(e) => {
                              const newCc = e.target.value;
                              setRoutingRules((prev) => ({
                                ...prev,
                                [key]: {
                                  ...prev[key],
                                  ccEmail: newCc,
                                },
                              }));
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        {/* Active Switch */}
                        <div className="flex flex-col items-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                            Active
                          </label>
                          <input
                            type="checkbox"
                            checked={rule.active}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setRoutingRules((prev) => ({
                                ...prev,
                                [key]: {
                                  ...prev[key],
                                  active: checked,
                                },
                              }));
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky Save Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Changes take effect immediately across all live contact, quote, and KYC pipelines.
                </span>
                <button
                  type="button"
                  onClick={handleSaveRouting}
                  disabled={savingRouting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {savingRouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                  <span>Save Routing Matrix</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HOSTINGER ENGINE & RATE LIMITS */}
          {/* ========================================================================= */}
          {activeTab === "engine" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Global Protocol Selector */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Hostinger Delivery Engine Credentials</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Test Handshake</span>
                    </button>
                  </div>

                  {testResult && (
                    <div
                      className={`p-4 rounded-xl text-xs font-bold flex items-start gap-3 border ${
                        testResult.success
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                          : "bg-red-50 text-red-900 border-red-200"
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-extrabold">{testResult.success ? "Connection Verified!" : "Connection Failed"}</p>
                        <p className="font-normal text-[11px] mt-0.5">{testResult.message}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("hostinger_api")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        deliveryMethod === "hostinger_api"
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-blue-900 uppercase">Hostinger Mail API</span>
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">Recommended</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">HTTPS Port 443 (Zero Timeout)</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Bypasses cloud host SMTP port blocks with instantaneous HTTPS delivery.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("smtp")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        deliveryMethod === "smtp"
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-900 uppercase">Direct SMTP Relay</span>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">Standard</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">Port 465 (SSL) / 587 (TLS)</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Standard SMTP protocol for VPS or unblocked socket hosts.
                      </p>
                    </button>
                  </div>

                  {/* Hostinger API Token Input */}
                  {deliveryMethod === "hostinger_api" && (
                    <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-blue-950 uppercase">
                          Hostinger Mail API Token
                        </label>
                        {hostingerApiTokenConfigured && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            ✓ Saved in Database
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showApiToken ? "text" : "password"}
                          value={hostingerApiToken}
                          onChange={(e) => setHostingerApiToken(e.target.value)}
                          placeholder="Paste Hostinger Mail API Token..."
                          className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiToken(!showApiToken)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                        >
                          {showApiToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Global Fallback SMTP Inputs */}
                  {deliveryMethod === "smtp" && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SMTP Host</label>
                          <input
                            type="text"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SMTP Port</label>
                          <input
                            type="number"
                            value={smtpPort}
                            onChange={(e) => setSmtpPort(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Default Username</label>
                          <input
                            type="email"
                            value={smtpUser}
                            onChange={(e) => setSmtpUser(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Default Password</label>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={smtpPass}
                            onChange={(e) => setSmtpPass(e.target.value)}
                            placeholder={smtpPassConfigured ? "•••••••••••• (Saved in DB)" : "Enter password"}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Daily Limits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Daily Sending Cap</label>
                      <input
                        type="number"
                        value={dailyLimit}
                        onChange={(e) => setDailyLimit(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rate Limit Per Minute</label>
                      <input
                        type="number"
                        value={rateLimitPerMinute}
                        onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveEngine}
                      disabled={saving}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                    >
                      {saving ? "Saving Engine Settings..." : "Save Engine Settings"}
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT 1 COLUMN: Live Test Email Sandbox */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>Live Test Dispatch Sandbox</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Send an instantaneous test email from any configured mailbox to verify real-world inbox delivery and formatting.
                  </p>

                  <form onSubmit={handleSendTestEmail} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Send From Mailbox
                      </label>
                      <select
                        value={testSelectedMailboxId}
                        onChange={(e) => setTestSelectedMailboxId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      >
                        {mailboxes.map((mb) => (
                          <option key={mb.id} value={mb.id}>
                            {mb.name} ({mb.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        placeholder="your-email@domain.com"
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sendingTest}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Send Real Test Email</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CORPORATE MAILBOX */}
      {/* ========================================================================= */}
      {isMailboxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                  {editingMailbox ? "Edit Mailbox" : "New Mailbox"}
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight font-display mt-1">
                  {editingMailbox ? "Edit Corporate Mailbox" : "Configure New Corporate Mailbox"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMailboxModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMailbox} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hindustan Projects Info Desk"
                    value={formMbName}
                    onChange={(e) => setFormMbName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="info@hindustanprojects.in"
                    value={formMbEmail}
                    onChange={(e) => {
                      setFormMbEmail(e.target.value);
                      if (!formMbUser) setFormMbUser(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Brand / Entity Profile
                  </label>
                  <select
                    value={formMbBrand}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormMbBrand(val);
                      if (val === "hipro") setFormMbBrandName("HiPRO Flagship Civil");
                      else if (val === "hbs") setFormMbBrandName("HBS Waterproofing & Structural Repair");
                      else if (val === "empanelment") setFormMbBrandName("Vendor Procurement Hub");
                      else setFormMbBrandName("Hindustan Projects Group HQ");
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="hipro">HiPRO Flagship Civil</option>
                    <option value="hbs">Hind Building (HBS Waterproofing)</option>
                    <option value="empanelment">Vendor Empanelment Hub</option>
                    <option value="all">Central Holding Group HQ</option>
                    <option value="custom">Custom Entity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Brand Tagline Label
                  </label>
                  <input
                    type="text"
                    value={formMbBrandName}
                    onChange={(e) => setFormMbBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Protocol & Credentials */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Hostinger SMTP Credentials
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={formMbHost}
                      onChange={(e) => setFormMbHost(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">SMTP Port</label>
                    <select
                      value={formMbPort}
                      onChange={(e) => setFormMbPort(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    >
                      <option value={465}>465 (SSL / TLS)</option>
                      <option value={587}>587 (STARTTLS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">SMTP Username</label>
                    <input
                      type="text"
                      value={formMbUser}
                      onChange={(e) => setFormMbUser(e.target.value)}
                      placeholder={formMbEmail || "username"}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600">Password</label>
                      {editingMailbox?.smtpPassConfigured && (
                        <span className="text-[10px] text-emerald-700 font-bold">✓ Saved</span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={modalShowPassword ? "text" : "password"}
                        value={formMbPass}
                        onChange={(e) => setFormMbPass(e.target.value)}
                        placeholder={editingMailbox?.smtpPassConfigured ? "•••••••••••• (Leave blank to keep)" : "Enter password"}
                        className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setModalShowPassword(!modalShowPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {modalShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestInModal}
                    disabled={modalTesting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition-all disabled:opacity-50"
                  >
                    {modalTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Test SMTP Connection</span>
                  </button>

                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formMbIsDefault}
                      onChange={(e) => setFormMbIsDefault(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Make Primary Default Mailbox</span>
                  </label>
                </div>

                {modalTestResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                      modalTestResult.success
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                        : "bg-red-50 text-red-900 border-red-200"
                    }`}
                  >
                    {modalTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{modalTestResult.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Purpose / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dispatches turnkey civil quotes and estimation responses"
                  value={formMbDesc}
                  onChange={(e) => setFormMbDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMailboxModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {modalSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingMailbox ? "Update Mailbox" : "Save Mailbox"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
