"use client";

import { useState, useEffect, useMemo } from "react";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import {
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
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Star,
  Shuffle,
  Sliders,
  CheckCheck,
  ShieldCheck,
  Server,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Lock,
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

interface MailboxPreset {
  key: string;
  label: string;
  name: string;
  email: string;
  brand: "hipro" | "hbs" | "empanelment" | "all";
  brandName: string;
  description: string;
}

const MAILBOX_PRESETS: MailboxPreset[] = [
  {
    key: "hipro",
    label: "HiPRO Civil",
    name: "Hindustan Projects Civil Desk",
    email: "info@hindustanprojects.in",
    brand: "hipro",
    brandName: "HiPRO Flagship Civil",
    description: "Turnkey construction quotes, cost estimator & website project inquiries.",
  },
  {
    key: "hbs",
    label: "HBS Waterproofing",
    name: "Hind Building Solutions Desk",
    email: "hbs@hindustanprojects.in",
    brand: "hbs",
    brandName: "HBS Waterproofing & Structural Repair",
    description: "Terrace waterproofing, seepage audits, crack injection & repair BOQs.",
  },
  {
    key: "empanelment",
    label: "Empanelment Hub",
    name: "HiPRO Empanelment & Tenders Desk",
    email: "empanelment@hindustanprojects.in",
    brand: "empanelment",
    brandName: "Vendor Procurement Hub",
    description: "Contractor KYC approvals, tender invitations, RA billing & digital gate passes.",
  },
  {
    key: "careers",
    label: "HR & Careers",
    name: "Hindustan Projects HR & Careers",
    email: "careers@hindustanprojects.in",
    brand: "hipro",
    brandName: "HiPRO Civil Talent Desk",
    description: "Job application confirmations, civil engineer interview schedules & HR outreach.",
  },
  {
    key: "custom",
    label: "Custom Desk",
    name: "",
    email: "",
    brand: "all",
    brandName: "Hindustan Projects Group",
    description: "",
  },
];

function getBrandStyle(brand: string) {
  const b = (brand || "all").toLowerCase();
  if (b === "hipro") {
    return {
      pill: "bg-blue-50 text-blue-700 border-blue-200",
      topBar: "from-blue-600 to-indigo-600",
      label: "HiPRO Civil",
      Icon: Building2,
    };
  }
  if (b === "hbs") {
    return {
      pill: "bg-red-50 text-red-700 border-red-200",
      topBar: "from-red-600 to-rose-600",
      label: "Hind Build (HBS)",
      Icon: Hammer,
    };
  }
  if (b === "empanelment") {
    return {
      pill: "bg-amber-50 text-amber-800 border-amber-200",
      topBar: "from-amber-500 to-orange-600",
      label: "Empanelment Hub",
      Icon: ShieldCheck,
    };
  }
  return {
    pill: "bg-slate-100 text-slate-700 border-slate-200",
    topBar: "from-slate-800 to-slate-900",
    label: "All Portals HQ",
    Icon: Globe,
  };
}

export default function AutoMailSettingsPage() {
  const [activeTab, setActiveTab] = useState<"mailboxes" | "routing" | "engine">("mailboxes");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showHostingerGuide, setShowHostingerGuide] = useState(true);

  // Corporate Mailboxes State
  const [mailboxes, setMailboxes] = useState<CorporateMailbox[]>([]);
  const [testingMailboxId, setTestingMailboxId] = useState<string | null>(null);
  const [mailboxTestResults, setMailboxTestResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});

  // Add / Edit Modal State
  const [isMailboxModalOpen, setIsMailboxModalOpen] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState<CorporateMailbox | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalTesting, setModalTesting] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [modalShowToken, setModalShowToken] = useState(false);

  // Mailbox Form State
  const [formPresetKey, setFormPresetKey] = useState("hipro");
  const [formMbName, setFormMbName] = useState("");
  const [formMbEmail, setFormMbEmail] = useState("");
  const [formMbBrand, setFormMbBrand] = useState("hipro");
  const [formMbBrandName, setFormMbBrandName] = useState("HiPRO Flagship Civil");
  const [formMbDelivery, setFormMbDelivery] = useState<"smtp" | "hostinger_api">("smtp");
  const [formMbHost, setFormMbHost] = useState("smtp.hostinger.com");
  const [formMbPort, setFormMbPort] = useState(465);
  const [formMbUser, setFormMbUser] = useState("");
  const [formMbPass, setFormMbPass] = useState("");
  const [formMbApiToken, setFormMbApiToken] = useState("");
  const [formMbHostingerId, setFormMbHostingerId] = useState("");
  const [formMbReplyTo, setFormMbReplyTo] = useState("");
  const [formMbIsDefault, setFormMbIsDefault] = useState(false);
  const [formMbStatus, setFormMbStatus] = useState<"active" | "inactive">("active");
  const [formMbDesc, setFormMbDesc] = useState("");
  const [formAutoAssignRoutes, setFormAutoAssignRoutes] = useState(true);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<CorporateMailbox | null>(null);
  const [deletingMb, setDeletingMb] = useState(false);

  // Quick Test Email Modal (from any mailbox card or route)
  const [quickTestModalOpen, setQuickTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [testSelectedMailboxId, setTestSelectedMailboxId] = useState("");
  const [testSelectedBrand, setTestSelectedBrand] = useState("hipro");

  // Automated Dispatch Routing Matrix State
  const [routingRules, setRoutingRules] = useState<Record<string, DispatchRoutingRule>>({});
  const [routingPortalFilter, setRoutingPortalFilter] = useState("all");
  const [savingRouting, setSavingRouting] = useState(false);

  // Global Engine Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState<"hostinger_api" | "smtp">("hostinger_api");
  const [hostingerApiToken, setHostingerApiToken] = useState("");
  const [hostingerApiTokenConfigured, setHostingerApiTokenConfigured] = useState(false);
  const [hostingerMailboxId, setHostingerMailboxId] = useState("");
  const [connectedMailboxes, setConnectedMailboxes] = useState<Array<{ resourceId: string; address: string }>>([]);
  const [fetchingMailboxes, setFetchingMailboxes] = useState(false);

  // Global SMTP Fallback Form State
  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState("info@hindustanprojects.in");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpPassConfigured, setSmtpPassConfigured] = useState(false);

  // Rate Limits
  const [dailyLimit, setDailyLimit] = useState(200);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(15);
  const [replyTo, setReplyTo] = useState("info@hindustanprojects.in");

  // Global Test states & Toast
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    mailboxes?: Array<{ resourceId: string; address: string }>;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const copyValue = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
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
      setToast({ message: "Failed to load AutoMail settings from server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive default fallback mailbox & per-portal coverage
  const defaultMailbox = useMemo(
    () => mailboxes.find((m) => m.isDefault && m.status === "active") || mailboxes.find((m) => m.status === "active") || mailboxes[0],
    [mailboxes]
  );

  const portalCoverage = useMemo(() => {
    const pick = (brandKey: string) => {
      const dedicated = mailboxes.find((m) => m.brand === brandKey && m.status === "active");
      return { dedicated, effective: dedicated || defaultMailbox };
    };
    return {
      hipro: pick("hipro"),
      hbs: pick("hbs"),
      empanelment: pick("empanelment"),
    };
  }, [mailboxes, defaultMailbox]);

  // Reverse map: mailboxId -> array of routing rules using it
  const routesByMailbox = useMemo(() => {
    const map: Record<string, DispatchRoutingRule[]> = {};
    Object.values(routingRules).forEach((rule) => {
      const targetMb = mailboxes.find((m) => m.id === rule.mailboxId && m.status === "active") || defaultMailbox;
      if (!targetMb) return;
      if (!map[targetMb.id]) map[targetMb.id] = [];
      map[targetMb.id].push(rule);
    });
    return map;
  }, [routingRules, mailboxes, defaultMailbox]);

  // Discovered Hostinger mailboxes not yet added
  const unlinkedHostingerBoxes = useMemo(() => {
    const existingEmails = new Set(mailboxes.map((m) => m.email.toLowerCase().trim()));
    return connectedMailboxes.filter((h) => h.address && !existingEmails.has(h.address.toLowerCase().trim()));
  }, [connectedMailboxes, mailboxes]);

  const applyPresetToForm = (preset: MailboxPreset) => {
    setFormPresetKey(preset.key);
    if (preset.key !== "custom") {
      setFormMbName(preset.name);
      setFormMbEmail(preset.email);
      setFormMbUser(preset.email);
      setFormMbReplyTo(preset.email);
    }
    setFormMbBrand(preset.brand);
    setFormMbBrandName(preset.brandName);
    setFormMbDesc(preset.description);
  };

  // Open Modal for Add
  const handleOpenAddModal = (suggestedBrand?: "hipro" | "hbs" | "empanelment" | "custom", prefillEmail?: string, resourceId?: string) => {
    setEditingMailbox(null);
    const chosenBrand = suggestedBrand || "hbs";
    const matchedPreset = MAILBOX_PRESETS.find((p) => p.key === chosenBrand) || MAILBOX_PRESETS[0];

    setFormPresetKey(matchedPreset.key);
    setFormMbName(matchedPreset.name);
    const emailVal = prefillEmail || matchedPreset.email;
    setFormMbEmail(emailVal);
    setFormMbBrand(matchedPreset.brand);
    setFormMbBrandName(matchedPreset.brandName);
    setFormMbDelivery(hostingerApiTokenConfigured ? "hostinger_api" : deliveryMethod || "smtp");
    setFormMbHost("smtp.hostinger.com");
    setFormMbPort(465);
    setFormMbUser(emailVal);
    setFormMbPass("");
    setFormMbApiToken("");
    setFormMbHostingerId(resourceId || "");
    setFormMbReplyTo(emailVal);
    setFormMbIsDefault(mailboxes.length === 0);
    setFormMbStatus("active");
    setFormMbDesc(matchedPreset.description);
    setFormAutoAssignRoutes(true);
    setModalTestResult(null);
    setModalShowPassword(false);
    setModalShowToken(false);
    setIsMailboxModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (mb: CorporateMailbox) => {
    setEditingMailbox(mb);
    setFormPresetKey("custom");
    setFormMbName(mb.name);
    setFormMbEmail(mb.email);
    setFormMbBrand(mb.brand);
    setFormMbBrandName(mb.brandName || "Corporate Desk");
    setFormMbDelivery(mb.deliveryMethod || "smtp");
    setFormMbHost(mb.smtpHost || "smtp.hostinger.com");
    setFormMbPort(mb.smtpPort || 465);
    setFormMbUser(mb.smtpUser || mb.email);
    setFormMbPass("");
    setFormMbApiToken(mb.hostingerApiToken || "");
    setFormMbHostingerId(mb.hostingerMailboxId || "");
    setFormMbReplyTo(mb.replyTo || mb.email);
    setFormMbIsDefault(Boolean(mb.isDefault));
    setFormMbStatus(mb.status || "active");
    setFormMbDesc(mb.description || "");
    setFormAutoAssignRoutes(false);
    setModalTestResult(null);
    setModalShowPassword(false);
    setModalShowToken(false);
    setIsMailboxModalOpen(true);
  };

  // Test Mailbox from inside Modal
  const handleTestInModal = async () => {
    if (!formMbEmail.trim()) {
      setModalTestResult({ success: false, message: "Please enter the Hostinger email address first." });
      return;
    }
    setModalTesting(true);
    setModalTestResult(null);
    try {
      const res = await fetch("/api/automail/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailboxId: editingMailbox?.id,
          deliveryMethod: formMbDelivery,
          smtpHost: formMbHost,
          smtpPort: Number(formMbPort),
          smtpUser: formMbUser.trim() || formMbEmail.trim(),
          smtpPass: formMbPass.trim() || (editingMailbox?.smtpPassConfigured ? "••••••••••••" : ""),
          hostingerApiToken: formMbApiToken.trim() || undefined,
          hostingerMailboxId: formMbHostingerId.trim() || undefined,
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
      const payload: Partial<CorporateMailbox> & { autoAssignBrandRoutes?: boolean } = {
        ...(editingMailbox ? { id: editingMailbox.id } : {}),
        name: formMbName.trim(),
        email: formMbEmail.trim().toLowerCase(),
        brand: formMbBrand,
        brandName: formMbBrandName.trim(),
        deliveryMethod: formMbDelivery,
        smtpHost: formMbHost.trim() || "smtp.hostinger.com",
        smtpPort: Number(formMbPort) || 465,
        smtpUser: formMbUser.trim() || formMbEmail.trim().toLowerCase(),
        hostingerMailboxId: formMbHostingerId.trim(),
        replyTo: formMbReplyTo.trim() || formMbEmail.trim().toLowerCase(),
        isDefault: formMbIsDefault,
        status: formMbStatus,
        description: formMbDesc.trim(),
        autoAssignBrandRoutes: formAutoAssignRoutes,
      };

      if (formMbPass.trim()) payload.smtpPass = formMbPass.trim();
      if (formMbApiToken.trim()) payload.hostingerApiToken = formMbApiToken.trim();

      const res = await fetch("/api/automail/mailboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setToast({
          message: formAutoAssignRoutes
            ? `Saved "${payload.email}" and auto-mapped ${formMbBrand.toUpperCase()} triggers in Control Matrix!`
            : data.message || "Corporate mailbox saved permanently!",
          type: "success",
        });
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

  // Confirm Delete Mailbox
  const confirmDeleteMailbox = async () => {
    if (!deleteTarget) return;
    setDeletingMb(true);
    try {
      const res = await fetch(`/api/automail/mailboxes/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Mailbox "${deleteTarget.email}" deleted cleanly.`, type: "success" });
        setDeleteTarget(null);
        fetchAllSettings();
      } else {
        setToast({ message: data.error || "Failed to delete mailbox", type: "error" });
      }
    } catch {
      setToast({ message: "Network error deleting mailbox", type: "error" });
    } finally {
      setDeletingMb(false);
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
        body: JSON.stringify({ id: mb.id, name: mb.name, email: mb.email, isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `"${mb.email}" is now the primary default fallback mailbox.`, type: "success" });
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
        setToast({ message: "Dispatch Control Matrix saved permanently to PostgreSQL!", type: "success" });
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
        setToast({ message: "Engine settings saved permanently to PostgreSQL!", type: "success" });
        setSmtpPassConfigured(Boolean(data.settings?.smtpPassConfigured));
        setHostingerApiTokenConfigured(Boolean(data.settings?.hostingerApiTokenConfigured));
        setSmtpPass("");
        if (data.settings?.hostingerApiTokenConfigured) {
          fetchHostingerMailboxes();
        }
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
        setToast({ message: "Connection verified successfully!", type: "success" });
        if (Array.isArray(data.mailboxes)) {
          setConnectedMailboxes(data.mailboxes);
        }
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
    if (!testRecipient.trim()) {
      setToast({ message: "Please enter a test recipient email address", type: "error" });
      return;
    }

    setSendingTest(true);
    try {
      const targetMb = mailboxes.find((m) => m.id === testSelectedMailboxId) || defaultMailbox;
      const res = await fetch("/api/automail/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testRecipient.trim(),
          mailboxId: testSelectedMailboxId || targetMb?.id,
          brand: testSelectedBrand || targetMb?.brand || "hipro",
          subject: `Verified Delivery Check (${targetMb?.email || "AutoMail"})`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: `Test email sent cleanly to ${testRecipient}!`, type: "success" });
        setQuickTestModalOpen(false);
      } else {
        setToast({ message: data.error || "Failed to send test email", type: "error" });
      }
    } catch {
      setToast({ message: "Network error sending test email", type: "error" });
    } finally {
      setSendingTest(false);
    }
  };

  const openQuickTestForMailbox = (mb: CorporateMailbox, brandOverride?: string) => {
    setTestSelectedMailboxId(mb.id);
    setTestSelectedBrand(brandOverride || (mb.brand !== "custom" ? mb.brand : "hipro"));
    setQuickTestModalOpen(true);
  };

  const filteredRoutingEntries = useMemo(() => {
    const entries = Object.entries(routingRules);
    if (routingPortalFilter === "all") return entries;
    return entries.filter(([, rule]) => {
      const p = (rule.portal || "").toLowerCase();
      if (routingPortalFilter === "hipro") return p.includes("hipro");
      if (routingPortalFilter === "hbs") return p.includes("hbs") || p.includes("hind building");
      if (routingPortalFilter === "empanelment") return p.includes("vendor") || p.includes("procurement");
      return p.includes("group") || p.includes("headquarters");
    });
  }, [routingRules, routingPortalFilter]);

  const activeRouteCount = useMemo(
    () => Object.values(routingRules).filter((r) => r.active).length,
    [routingRules]
  );

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
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Header + 3-Portal Coverage Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                Mailbox &amp; Control Center
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                {mailboxes.filter((m) => m.status === "active").length} / {mailboxes.length} Mailboxes Active
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
                {activeRouteCount} Auto-Routes Active
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              Hostinger Mailboxes &amp; Portal Dispatch Control
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Yahan se aap Hostinger par banaye gaye sabhi corporate mailboxes add kar sakte ho aur control kar sakte ho ki
              HiPRO, HBS aur Empanelment Portal ke har event pe kaunsa email address mail bhejega.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {defaultMailbox && (
              <button
                type="button"
                onClick={() => openQuickTestForMailbox(defaultMailbox)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Send Test Email</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleOpenAddModal("hbs")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hostinger Mailbox</span>
            </button>
          </div>
        </div>

        {/* 3-Portal Live Sender Readiness Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {[
            {
              key: "hipro" as const,
              title: "Portal 1: HiPRO Civil",
              subtitle: "Quotes, Estimator, Contact & Careers",
              cov: portalCoverage.hipro,
              border: "border-blue-200/80 bg-blue-50/40",
              badge: "text-blue-700 bg-blue-100/80",
              Icon: Building2,
            },
            {
              key: "hbs" as const,
              title: "Portal 2: Hind Building (HBS)",
              subtitle: "Waterproofing, Crack Repair & AMC",
              cov: portalCoverage.hbs,
              border: "border-red-200/80 bg-red-50/40",
              badge: "text-red-700 bg-red-100/80",
              Icon: Hammer,
            },
            {
              key: "empanelment" as const,
              title: "Portal 3: Vendor Empanelment",
              subtitle: "KYC Approvals, Tenders & Gate Passes",
              cov: portalCoverage.empanelment,
              border: "border-amber-200/80 bg-amber-50/40",
              badge: "text-amber-800 bg-amber-100/80",
              Icon: ShieldCheck,
            },
          ].map((p) => {
            const PIcon = p.Icon;
            return (
              <div key={p.key} className={`rounded-2xl border p-3.5 flex items-center justify-between gap-3 ${p.border}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${p.badge}`}>
                      <PIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">{p.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{p.subtitle}</p>
                  <p className="text-[11px] font-mono font-bold text-slate-800 mt-1 truncate">
                    {p.cov.effective ? p.cov.effective.email : "No active mailbox"}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  {p.cov.dedicated ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Dedicated
                    </span>
                  ) : (
                    <>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                        Using Primary
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(p.key)}
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Add {p.key}@
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pt-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("mailboxes")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "mailboxes"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>1. Hostinger Mailboxes ({mailboxes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("routing")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "routing"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>2. Event Routing Control ({Object.keys(routingRules).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("engine")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "engine"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>3. Hostinger API, Limits &amp; Global Fallback</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold">Loading mailboxes &amp; control matrix...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* TAB 1: CORPORATE MAILBOXES MANAGER + HOSTINGER SETUP ASSISTANT */}
          {/* ========================================================================= */}
          {activeTab === "mailboxes" && (
            <div className="space-y-6">
              {/* Collapsible Hostinger Setup Guide */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setShowHostingerGuide((v) => !v)}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-white/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Hostinger Se Naya Mailbox Add Karne Ka Tarika (Step-by-Step)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Hostinger hPanel me mailbox banane ke baad yahan SMTP ya Hostinger API se connect karein
                      </p>
                    </div>
                  </div>
                  {showHostingerGuide ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {showHostingerGuide && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          Step 1 • Hostinger hPanel
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">Create Mailbox in Hostinger</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Hostinger &rarr; <strong>Emails</strong> &rarr; <strong>hindustanprojects.in</strong> &rarr;{" "}
                        <strong>Email Accounts</strong> par jayein aur naya email banayein (jaise{" "}
                        <code className="font-mono text-slate-900">hbs@</code> ya{" "}
                        <code className="font-mono text-slate-900">empanelment@</code>). Password note kar lein.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Step 2 • Connection Details
                      </span>
                      <p className="font-bold text-slate-900">SMTP Details (Copy-Ready)</p>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <span className="font-mono text-slate-700">Host: smtp.hostinger.com</span>
                          <button
                            type="button"
                            onClick={() => copyValue("host", "smtp.hostinger.com")}
                            className="text-blue-600 font-bold flex items-center gap-1"
                          >
                            {copiedKey === "host" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <span className="font-mono text-slate-700">Port: 465 (SSL) • User: Full Email</span>
                          <button
                            type="button"
                            onClick={() => copyValue("port", "465")}
                            className="text-blue-600 font-bold flex items-center gap-1"
                          >
                            {copiedKey === "port" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Cloud Tip: Agar Tab 3 me Hostinger API Token saved hai, toh bina password alag dale bhi HTTPS (443) se deliver hoga!
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                        Step 3 • Assign &amp; Test
                      </span>
                      <p className="font-bold text-slate-900">Click Add Mailbox &amp; Map Portal</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        &ldquo;Add Hostinger Mailbox&rdquo; par click karke Portal (<strong className="text-slate-900">HiPRO / HBS / Empanelment</strong>) select karein. Auto-routing on rakhne se us portal ke saare mails automatically us naye mailbox se jana shuru ho jayenge!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hostinger Auto-Discovered Mailboxes */}
              {hostingerApiTokenConfigured && (
                <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Hostinger Account Auto-Discovery ({connectedMailboxes.length} Found)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Hostinger Mail API token se live detected mailboxes — 1-click me connect karein
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={fetchHostingerMailboxes}
                      disabled={fetchingMailboxes}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${fetchingMailboxes ? "animate-spin" : ""}`} />
                      <span>Sync from Hostinger</span>
                    </button>
                  </div>

                  {connectedMailboxes.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Click &ldquo;Sync from Hostinger&rdquo; to detect active mailboxes on your domain.
                    </p>
                  ) : unlinkedHostingerBoxes.length === 0 ? (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        All {connectedMailboxes.length} Hostinger mailbox(es) (
                        {connectedMailboxes.map((b) => b.address).join(", ")}) are already connected below!
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {unlinkedHostingerBoxes.map((hb) => {
                        const guessBrand = hb.address.toLowerCase().includes("hbs")
                          ? "hbs"
                          : hb.address.toLowerCase().includes("empanel") || hb.address.toLowerCase().includes("tender")
                          ? "empanelment"
                          : "hipro";
                        return (
                          <div
                            key={hb.resourceId || hb.address}
                            className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-mono font-bold text-slate-900 truncate">{hb.address}</p>
                              <p className="text-[10px] text-blue-700 font-semibold">
                                Ready in Hostinger • ID: {hb.resourceId.slice(0, 10)}...
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(guessBrand, hb.address, hb.resourceId)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shrink-0"
                            >
                              + Connect
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Mailbox Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {mailboxes.map((mb) => {
                  const isTestingThis = testingMailboxId === mb.id;
                  const testRes = mailboxTestResults[mb.id];
                  const style = getBrandStyle(mb.brand);
                  const BrandIcon = style.Icon;
                  const assignedRoutes = routesByMailbox[mb.id] || [];
                  const hasCreds = Boolean(
                    mb.smtpPassConfigured ||
                      (mb.hostingerApiToken && mb.hostingerApiToken.trim()) ||
                      (mb.deliveryMethod === "hostinger_api" && hostingerApiTokenConfigured)
                  );

                  return (
                    <div
                      key={mb.id}
                      className={`relative rounded-2xl bg-white border overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between ${
                        mb.isDefault
                          ? "border-blue-300 ring-2 ring-blue-500/15"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`h-1.5 w-full bg-gradient-to-r ${style.topBar}`} />

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${style.pill}`}
                            >
                              <BrandIcon className="w-3 h-3" />
                              {mb.brandName || style.label}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {mb.isDefault && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  Default
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">{mb.name}</h3>
                          <p className="text-xs font-mono font-bold text-blue-700 mt-1 break-all">{mb.email}</p>

                          {mb.description && (
                            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{mb.description}</p>
                          )}

                          {/* Used By Events Strip */}
                          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Controls {assignedRoutes.length} Active Website Event(s):
                            </p>
                            {assignedRoutes.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic">
                                Manual compose / QuickMail only (assign routes in Tab 2)
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {assignedRoutes.slice(0, 4).map((r) => (
                                  <span
                                    key={r.triggerKey}
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80"
                                  >
                                    {r.name.split(" & ")[0]}
                                  </span>
                                ))}
                                {assignedRoutes.length > 4 && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                                    +{assignedRoutes.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Meta Pills */}
                          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-500">
                            <span className="px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200">
                              {mb.deliveryMethod === "hostinger_api"
                                ? "Hostinger API (443)"
                                : `${mb.smtpHost || "smtp.hostinger.com"}:${mb.smtpPort || 465}`}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md border font-semibold ${
                                hasCreds
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {hasCreds ? "✓ Credentials Ready" : "⚠ Add Password / Token"}
                            </span>
                          </div>

                          {/* Inline Test Feedback */}
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
                              <span className="line-clamp-2">{testRes.message}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTestMailbox(mb.id)}
                              disabled={isTestingThis}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              {isTestingThis ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              <span>Test</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openQuickTestForMailbox(mb)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send Test</span>
                            </button>

                            {!mb.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(mb)}
                                className="px-2.5 py-1.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-bold transition-all"
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
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {mailboxes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(mb)}
                                title="Delete Mailbox"
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Card Placeholder */}
                <button
                  type="button"
                  onClick={() => handleOpenAddModal("hbs")}
                  className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 p-8 flex flex-col items-center justify-center gap-2.5 text-center transition-all group min-h-[260px]"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 group-hover:bg-blue-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                    + Add New Hostinger Mailbox
                  </span>
                  <span className="text-[11px] text-slate-500 max-w-[220px] leading-relaxed">
                    Connect dedicated email IDs like <span className="font-mono font-semibold">hbs@</span>,{" "}
                    <span className="font-mono font-semibold">empanelment@</span> or{" "}
                    <span className="font-mono font-semibold">careers@</span>
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: FULL EVENT ROUTING CONTROL MATRIX */}
          {/* ========================================================================= */}
          {activeTab === "routing" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Shuffle className="w-4 h-4 text-blue-600" />
                    <span>Event-by-Event Dispatch Control (&ldquo;Kisko Kis Mailbox Se Jayega&rdquo;)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Har portal aur website form event ke liye choose karein ki kaunsa Hostinger mailbox mail bheje aur kisko internal CC alert mile.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal("hbs")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Mailbox</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRouting}
                    disabled={savingRouting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    {savingRouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                    <span>Save Control Matrix</span>
                  </button>
                </div>
              </div>

              {/* Portal Filter Strip */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: `All Events (${Object.keys(routingRules).length})` },
                  { id: "hipro", label: "HiPRO Civil" },
                  { id: "hbs", label: "Hind Building (HBS)" },
                  { id: "empanelment", label: "Vendor Empanelment" },
                  { id: "hq", label: "HQ & Broadcasts" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setRoutingPortalFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      routingPortalFilter === f.id
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Routing Rules List */}
              <div className="space-y-3">
                {filteredRoutingEntries.map(([key, rule]) => {
                  const selectedMb = mailboxes.find((m) => m.id === rule.mailboxId);
                  const effectiveMb =
                    (selectedMb && selectedMb.status === "active" ? selectedMb : null) || defaultMailbox;
                  const isFallback = !selectedMb || selectedMb.id !== effectiveMb?.id;

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-2xl border transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${
                        rule.active
                          ? "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                          : "bg-slate-50/70 border-slate-200 opacity-65"
                      }`}
                    >
                      {/* Left: Event Details */}
                      <div className="space-y-1 flex-1 max-w-md">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-mono">
                            {rule.portal}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{rule.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{rule.description}</p>
                        {effectiveMb && (
                          <div className="flex items-center gap-1.5 pt-0.5 text-[10px] font-mono">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${
                                isFallback
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {isFallback ? `Smart Fallback -> ${effectiveMb.email}` : `Live -> ${effectiveMb.email}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Middle: Outgoing Mailbox Selector */}
                      <div className="flex-1 max-w-sm">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                          Outgoing Sender Mailbox
                        </label>
                        <select
                          value={mailboxes.some((m) => m.id === rule.mailboxId) ? rule.mailboxId : effectiveMb?.id || ""}
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
                              {mb.email} — {mb.name} {mb.isDefault ? "(Default)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Right: Internal CC Alert + Quick Test + Toggle */}
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="w-48">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                            Internal Alert CC (Optional)
                          </label>
                          <input
                            type="email"
                            placeholder="director@hindustan..."
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

                        {effectiveMb && (
                          <button
                            type="button"
                            onClick={() =>
                              openQuickTestForMailbox(
                                effectiveMb,
                                rule.portal.toLowerCase().includes("hbs") ||
                                  rule.portal.toLowerCase().includes("hind building")
                                  ? "hbs"
                                  : rule.portal.toLowerCase().includes("vendor")
                                  ? "empanelment"
                                  : "hipro"
                              )
                            }
                            className="px-3 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
                            title="Send test email for this route"
                          >
                            Test Route
                          </button>
                        )}

                        {/* Toggle Switch */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            {rule.active ? "Active" : "Paused"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={rule.active}
                            onClick={() => {
                              setRoutingRules((prev) => ({
                                ...prev,
                                [key]: {
                                  ...prev[key],
                                  active: !prev[key].active,
                                },
                              }));
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              rule.active ? "bg-emerald-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                                rule.active ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Saved permanently in PostgreSQL — applies immediately across Quotes, Contact Inquiries, HBS, Vendor Hub &amp; AutoMail.
                </span>
                <button
                  type="button"
                  onClick={handleSaveRouting}
                  disabled={savingRouting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {savingRouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                  <span>Save Control Matrix</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HOSTINGER ENGINE, API TOKEN & LIMITS */}
          {/* ========================================================================= */}
          {activeTab === "engine" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span>Hostinger Global Transport &amp; Rate Limits</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Primary fallback credentials + daily anti-spam throttling controls
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Test Global Handshake</span>
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
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Cloud Recommended
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">HTTPS Port 443 (Render Safe)</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Zero SMTP firewall blocks + auto-resolves multiple Hostinger mailboxes (`info@`, `hbs@`, `empanelment@`).
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
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                          Standard
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">Port 465 (SSL) / 587 (TLS)</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Classic per-mailbox username &amp; password authentication over `smtp.hostinger.com`.
                      </p>
                    </button>
                  </div>

                  {deliveryMethod === "hostinger_api" && (
                    <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-blue-950 uppercase">
                          Hostinger Mail API Token (Global Account Token)
                        </label>
                        {hostingerApiTokenConfigured && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
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
                          placeholder="Paste Hostinger Mail API Token (Webmail -> Settings -> Agentic Mail)..."
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
                      <p className="text-[11px] text-slate-600">
                        Get token from <strong>mail.hostinger.com &rarr; Settings &rarr; Agentic Mail / Developer API</strong>. Once saved, click &ldquo;Test Global Handshake&rdquo; to auto-discover all mailboxes.
                      </p>
                    </div>
                  )}

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
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fallback Username</label>
                          <input
                            type="email"
                            value={smtpUser}
                            onChange={(e) => setSmtpUser(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fallback Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={smtpPass}
                              onChange={(e) => setSmtpPass(e.target.value)}
                              placeholder={smtpPassConfigured ? "•••••••••••• (Saved in DB)" : "Enter mailbox password"}
                              className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                      className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                    >
                      {saving ? "Saving Engine Settings..." : "Save Engine Settings Permanently"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Test Dispatch */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>Live Test Dispatch Sandbox</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Choose any connected Hostinger mailbox and fire a test email to inspect live inbox delivery.
                  </p>

                  <form onSubmit={handleSendTestEmail} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Send From Mailbox</label>
                      <select
                        value={testSelectedMailboxId}
                        onChange={(e) => setTestSelectedMailboxId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      >
                        {mailboxes.map((mb) => (
                          <option key={mb.id} value={mb.id}>
                            {mb.email} ({mb.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Portal Wrapper Preview</label>
                      <select
                        value={testSelectedBrand}
                        onChange={(e) => setTestSelectedBrand(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="hipro">HiPRO Civil Portal Design</option>
                        <option value="hbs">Hind Building (HBS) Design</option>
                        <option value="empanelment">Vendor Empanelment Design</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Test Inbox Email</label>
                      <input
                        type="email"
                        placeholder="you@gmail.com"
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
                      <span>Send Test Email Now</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT HOSTINGER MAILBOX */}
      {/* ========================================================================= */}
      {isMailboxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                  {editingMailbox ? "Edit Connected Mailbox" : "New Hostinger Mailbox"}
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                  {editingMailbox ? `Configure ${editingMailbox.email}` : "Add Hostinger Corporate Mailbox"}
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
              {/* Quick Portal Presets (Add Mode) */}
              {!editingMailbox && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    1-Click Portal Preset (Select to Auto-Fill Desk Role)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MAILBOX_PRESETS.map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => applyPresetToForm(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          formPresetKey === preset.key
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Sender Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hind Building Solutions"
                    value={formMbName}
                    onChange={(e) => setFormMbName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-[10px] text-slate-400">Appears as sender name in client inbox</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hostinger Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="hbs@hindustanprojects.in"
                    value={formMbEmail}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormMbEmail(val);
                      if (!editingMailbox) {
                        setFormMbUser(val);
                        setFormMbReplyTo(val);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-[10px] text-slate-400">Exact email created in Hostinger hPanel</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Assign to Portal
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="hipro">Portal 1: HiPRO Flagship Civil</option>
                    <option value="hbs">Portal 2: Hind Building (HBS)</option>
                    <option value="empanelment">Portal 3: Vendor Empanelment Hub</option>
                    <option value="all">All Portals / Master Group HQ</option>
                    <option value="custom">Custom / Auxiliary Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Reply-To Address
                  </label>
                  <input
                    type="email"
                    placeholder={formMbEmail || "reply@hindustanprojects.in"}
                    value={formMbReplyTo}
                    onChange={(e) => setFormMbReplyTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium"
                  />
                </div>
              </div>

              {/* Delivery Protocol Selector Inside Modal */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Hostinger Transport Mode
                  </span>
                  <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormMbDelivery("hostinger_api")}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        formMbDelivery === "hostinger_api"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Hostinger API (443)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMbDelivery("smtp")}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        formMbDelivery === "smtp"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      SMTP (465 / 587)
                    </button>
                  </div>
                </div>

                {formMbDelivery === "hostinger_api" ? (
                  <div className="space-y-3">
                    {connectedMailboxes.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Link Hostinger Account Mailbox ID (Optional)
                        </label>
                        <select
                          value={formMbHostingerId}
                          onChange={(e) => setFormMbHostingerId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        >
                          <option value="">Auto-match by email address ({formMbEmail || "..."})</option>
                          {connectedMailboxes.map((h) => (
                            <option key={h.resourceId} value={h.resourceId}>
                              {h.address} ({h.resourceId})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Mailbox-Specific Hostinger API Token (Leave blank to share Global Token)
                      </label>
                      <div className="relative">
                        <input
                          type={modalShowToken ? "text" : "password"}
                          value={formMbApiToken}
                          onChange={(e) => setFormMbApiToken(e.target.value)}
                          placeholder={
                            hostingerApiTokenConfigured
                              ? "Global Hostinger API Token already active (optional override)"
                              : "Paste Hostinger Mail API Token..."
                          }
                          className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setModalShowToken(!modalShowToken)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                        >
                          {modalShowToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
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
                        <option value={465}>465 (SSL / TLS — Hostinger Default)</option>
                        <option value={587}>587 (STARTTLS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">SMTP Username</label>
                      <input
                        type="text"
                        value={formMbUser}
                        onChange={(e) => setFormMbUser(e.target.value)}
                        placeholder={formMbEmail || "full email address"}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">Mailbox Password</label>
                        {editingMailbox?.smtpPassConfigured && (
                          <span className="text-[10px] text-emerald-700 font-bold">✓ Saved</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={modalShowPassword ? "text" : "password"}
                          value={formMbPass}
                          onChange={(e) => setFormMbPass(e.target.value)}
                          placeholder={
                            editingMailbox?.smtpPassConfigured
                              ? "•••••••••••• (Leave blank to keep)"
                              : "Hostinger mailbox password"
                          }
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
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleTestInModal}
                    disabled={modalTesting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition-all disabled:opacity-50"
                  >
                    {modalTesting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Test Connection</span>
                  </button>

                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formMbIsDefault}
                      onChange={(e) => setFormMbIsDefault(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Make Primary Default</span>
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

              {/* Purpose & Auto-Route Option */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Purpose / Desk Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatches waterproofing quotes & inspection emails"
                    value={formMbDesc}
                    onChange={(e) => setFormMbDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mailbox Status</label>
                  <select
                    value={formMbStatus}
                    onChange={(e) => setFormMbStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="active">Active (Live for Dispatch)</option>
                    <option value="inactive">Paused (Inactive)</option>
                  </select>
                </div>
              </div>

              {formMbBrand !== "custom" && (
                <label className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAutoAssignRoutes}
                    onChange={(e) => setFormAutoAssignRoutes(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-blue-950">
                      Auto-map matching {formMbBrand.toUpperCase()} triggers in Event Control Matrix
                    </p>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      Automatically connects {formMbBrand.toUpperCase()} automated portal emails to{" "}
                      <span className="font-mono font-bold">{formMbEmail || "this mailbox"}</span> on save.
                    </p>
                  </div>
                </label>
              )}

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
                  className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {modalSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingMailbox ? "Update Mailbox" : "Save Hostinger Mailbox"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK TEST DISPATCH MODAL */}
      {/* ========================================================================= */}
      {quickTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Send Live Test Email</h3>
                  <p className="text-[11px] text-slate-500">Verify real delivery &amp; portal template styling</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickTestModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">From Mailbox</label>
                <select
                  value={testSelectedMailboxId}
                  onChange={(e) => setTestSelectedMailboxId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                >
                  {mailboxes.map((mb) => (
                    <option key={mb.id} value={mb.id}>
                      {mb.email} ({mb.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Portal Template Theme</label>
                <select
                  value={testSelectedBrand}
                  onChange={(e) => setTestSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="hipro">Portal 1: HiPRO Civil</option>
                  <option value="hbs">Portal 2: Hind Building (HBS)</option>
                  <option value="empanelment">Portal 3: Vendor Empanelment</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Recipient Email *</label>
                <input
                  type="email"
                  required
                  placeholder="your-email@gmail.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickTestModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Test Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CUPERTINO DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Remove Corporate Mailbox?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-mono font-bold text-slate-800">{deleteTarget.email}</span> will be disconnected. Any assigned routes will automatically revert to your primary default mailbox.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingMb}
                onClick={confirmDeleteMailbox}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {deletingMb ? "Removing..." : "Remove Mailbox"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
