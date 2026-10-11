"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import { BUSINESS_TEMPLATES, AutomailBusinessTemplate } from "@/lib/automailTemplates";
import {
  PenSquare,
  Eye,
  Save,
  Code,
  Tag,
  ArrowLeft,
  Loader2,
  Building2,
  Hammer,
  Globe2,
  Send,
  Sparkles,
  CheckCircle2,
  LayoutTemplate,
  Search,
  Users,
  AlertTriangle,
  Zap,
  BookmarkPlus,
  Layers,
  FileUp,
  Filter,
  ChevronDown,
  Wand2,
} from "lucide-react";

const SMART_WORKFLOWS = [
  {
    id: "quote_followup",
    title: "Quotation & Rates Follow-up",
    icon: "📑",
    badge: "Quotes",
    desc: "Detailed build cost estimates & commercial proposal",
    brand: "hipro",
    subject: "Hi {{first_name}}, Detailed Quotation & Estimate from Hindustan Projects",
    templateId: "hipro_quote_followup",
  },
  {
    id: "turnkey_pitch",
    title: "Turnkey Construction Proposal",
    icon: "🏗️",
    badge: "HiPRO Master",
    desc: "Turnkey villa, commercial or warehouse construction",
    brand: "hipro",
    subject: "Comprehensive Construction & Turnkey Engineering Services for {{name}}",
    templateId: "hipro_turnkey_pitch",
  },
  {
    id: "hbs_repair",
    title: "Building Repair & Waterproofing",
    icon: "🛠️",
    badge: "Hind Build",
    desc: "Crack repair, waterproofing & building maintenance",
    brand: "hbs",
    subject: "Hi {{first_name}}, Specialized Building Repair & Protection — Hind Build Solutions",
    templateId: "hbs_building_repair_suite",
  },
  {
    id: "site_inspection",
    title: "Site Survey & Consultation",
    icon: "📐",
    badge: "Inspection",
    desc: "Confirming engineer site inspection schedule",
    brand: "hipro",
    subject: "Site Inspection & Engineering Consultation Confirmation for {{name}}",
    templateId: "hipro_client_satisfaction",
  },
  {
    id: "hbs_roof",
    title: "Terrace Waterproofing (10-Yr)",
    icon: "💧",
    badge: "10-Yr Warranty",
    desc: "Leakage, dampness & terrace protection proposal",
    brand: "hbs",
    subject: "Terrace Waterproofing Proposal & 10-Year Warranty for {{name}}",
    templateId: "hbs_roof_waterproofing_quote",
  },
];

export default function AutoMailCompose() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBrand = searchParams?.get("brand") || "all";
  const initialTo = searchParams?.get("to") || "";
  const initialName = searchParams?.get("name") || "";
  const initialTemplateId = searchParams?.get("template") || "";
  const initialSubject = searchParams?.get("subject") || "";

  // Core fields
  const [brand, setBrand] = useState(initialBrand);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [senderName, setSenderName] = useState(
    initialBrand === "hbs" ? "Hind Building Solutions" : "Hindustan Projects"
  );
  const [senderEmail, setSenderEmail] = useState(
    initialBrand === "hbs" ? "hbs@hindustanprojects.in" : "info@hindustanprojects.in"
  );
  const [htmlBody, setHtmlBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Dynamic Personalization Preview State
  const [previewPersonalized, setPreviewPersonalized] = useState(true);
  const [previewTestName, setPreviewTestName] = useState(initialName || "Ramesh Sharma");

  // Recipient Mode: "custom" (direct single/comma-separated emails) vs "group" (all/hipro/hbs)
  const [recipientMode, setRecipientMode] = useState<"custom" | "group">(initialTo ? "custom" : "group");
  const [customTo, setCustomTo] = useState(initialTo);
  const [customClientName, setCustomClientName] = useState(initialName);

  // Audience Targeting
  const [targetAudience, setTargetAudience] = useState<"all" | "hipro" | "hbs">("all");
  const [audienceCounts, setAudienceCounts] = useState<{ all: number; hipro: number; hbs: number }>({
    all: 0,
    hipro: 0,
    hbs: 0,
  });

  // SMTP status
  const [smtpConfigured, setSmtpConfigured] = useState(true);

  // Sending & saving states
  const [saving, setSaving] = useState(false);
  const [sendingDirect, setSendingDirect] = useState(false);
  const [showConfirmSendModal, setShowConfirmSendModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Template Library Modal
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);

  // Save as Template Modal
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateSaveName, setTemplateSaveName] = useState("");
  const [templateSaveCategory, setTemplateSaveCategory] = useState("Official Company");
  const [savingCustomTemplate, setSavingCustomTemplate] = useState(false);

  // Test email state
  const [testEmailModal, setTestEmailModal] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Load audience counts & custom templates
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/automail/stats");
        const data = await res.json();
        if (data.success && data.stats) {
          setAudienceCounts({
            all: data.stats.totalContacts || 0,
            hipro: data.stats.brandDistribution?.hipro || 0,
            hbs: data.stats.brandDistribution?.hbs || 0,
          });
        }
        if (data.settings && data.settings.smtpConfigured !== undefined) {
          setSmtpConfigured(data.settings.smtpConfigured);
        }
      } catch (err) {
        console.error("Failed to load audience count:", err);
      }
    }

    async function loadCustomTemplates() {
      try {
        const res = await fetch("/api/automail/custom-templates");
        const data = await res.json();
        if (data.success && data.templates) {
          setCustomTemplates(data.templates);
          if (initialTemplateId) {
            const foundCustom = data.templates.find((t: any) => t.id === initialTemplateId);
            if (foundCustom) applyTemplate(foundCustom);
          }
        }
      } catch (err) {
        console.error("Failed to load custom templates:", err);
      }
    }

    loadStats();
    loadCustomTemplates();
  }, [initialTemplateId]);

  // Set template on initial load
  useEffect(() => {
    if (initialTemplateId) {
      const found = BUSINESS_TEMPLATES.find((t) => t.id === initialTemplateId);
      if (found) {
        applyTemplate(found);
        return;
      }
    }
    if (!htmlBody) {
      const defaultTemplate = initialBrand === "hbs" ? BUSINESS_TEMPLATES[2] : BUSINESS_TEMPLATES[0];
      applyTemplate(defaultTemplate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplateId]);

  const applyTemplate = (t: any) => {
    setHtmlBody(t.html);
    setSubject(t.subject);
    setName(t.title);
    setBrand(t.brand || "all");
    setSenderName(t.senderName || (t.brand === "hbs" ? "Hind Building Solutions" : "Hindustan Projects"));
    setSenderEmail(t.senderEmail || (t.brand === "hbs" ? "hbs@hindustanprojects.in" : "info@hindustanprojects.in"));
    if (t.brand === "hipro") setTargetAudience("hipro");
    else if (t.brand === "hbs") setTargetAudience("hbs");
    else setTargetAudience("all");
    setShowLibraryModal(false);
    setToast({ message: `Loaded template: "${t.title}"`, type: "success" });
  };

  const saveAsCustomTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateSaveName.trim() || !htmlBody.trim()) {
      setToast({ message: "Template title and HTML content are required", type: "error" });
      return;
    }
    setSavingCustomTemplate(true);
    try {
      const res = await fetch("/api/automail/custom-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: templateSaveName.trim(),
          category: templateSaveCategory,
          brand,
          subject: subject || "Update from Hindustan Projects",
          senderName,
          senderEmail,
          html: htmlBody,
          description: `Saved from Compose Studio on ${new Date().toLocaleDateString()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Template "${templateSaveName}" saved to library!`, type: "success" });
        setShowSaveTemplateModal(false);
        setTemplateSaveName("");
        const refetch = await fetch("/api/automail/custom-templates");
        const refetchData = await refetch.json();
        if (refetchData.success) setCustomTemplates(refetchData.templates || []);
      } else {
        setToast({ message: data.error || "Failed to save template", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving template", type: "error" });
    } finally {
      setSavingCustomTemplate(false);
    }
  };

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    if (newBrand === "hbs") {
      setSenderName("Hind Building Solutions");
      setSenderEmail("hbs@hindustanprojects.in");
      setTargetAudience("hbs");
    } else if (newBrand === "hipro") {
      setSenderName("Hindustan Projects");
      setSenderEmail("info@hindustanprojects.in");
      setTargetAudience("hipro");
    } else {
      setSenderName("Hindustan Projects");
      setSenderEmail("info@hindustanprojects.in");
      setTargetAudience("all");
    }
  };

  const insertTag = (tag: string, target: "body" | "subject" = "body") => {
    if (target === "subject") {
      setSubject((prev) => (prev ? `${prev} ${tag}` : tag));
    } else {
      setHtmlBody((prev) => prev + ` ${tag} `);
    }
  };

  // Smart Auto-Name Detection when typing recipient email
  const handleCustomToChange = (val: string) => {
    setCustomTo(val);
    if (!customClientName.trim() && val.includes("@")) {
      const firstItem = val.split(/[\n,;]+/)[0]?.trim();
      if (!firstItem) return;
      const match = firstItem.match(/^(.*?)\s*<([^\s>]+@[^\s>]+)>$/);
      if (match && match[1]) {
        setCustomClientName(match[1].trim());
        setPreviewTestName(match[1].trim());
      } else if (firstItem.includes("@")) {
        const prefix = firstItem.split("@")[0];
        const namePart = prefix.replace(/[\._\-\+]+/g, " ").replace(/\d+/g, "").trim();
        if (namePart.length >= 2) {
          const capitalized = namePart
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          setCustomClientName(capitalized);
          setPreviewTestName(capitalized);
        }
      }
    }
  };

  // 1-Click Smart Workflow Applicator
  const applySmartWorkflow = (wf: (typeof SMART_WORKFLOWS)[0]) => {
    const found = BUSINESS_TEMPLATES.find((t) => t.id === wf.templateId) || BUSINESS_TEMPLATES[0];
    setHtmlBody(found.html);
    setSubject(wf.subject);
    setName(wf.title);
    setBrand(wf.brand as any);
    if (wf.brand === "hbs") {
      setSenderName("Hind Building Solutions");
      setSenderEmail("hbs@hindustanprojects.in");
      setTargetAudience("hbs");
    } else {
      setSenderName("Hindustan Projects");
      setSenderEmail("info@hindustanprojects.in");
      setTargetAudience("hipro");
    }
    setToast({
      message: `Workflow loaded: "${wf.title}". Formatted automatically for client!`,
      type: "success",
    });
  };

  // Render Real Client Visual Preview
  const getRenderedPreviewHtml = () => {
    if (!htmlBody) return "";
    if (!previewPersonalized) return htmlBody;
    const pName = previewTestName.trim() || customClientName.trim() || "Ramesh Sharma";
    const pFirstName = pName.split(" ")[0] || "Ramesh";
    const pEmail = customTo.split(/[\n,;]+/)[0]?.trim() || "ramesh.sharma@gmail.com";
    const pBrand = brand === "hbs" ? "Hind Building Solutions" : "Hindustan Projects";
    const pWebsite = brand === "hbs" ? "https://hindbuilding.hindustanprojects.in" : "https://www.hindustanprojects.in";
    const pPhone = brand === "hbs" ? "+91 75970 00601" : "+91 75970 00601";
    const pDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const pYear = String(new Date().getFullYear());

    return htmlBody
      .replace(/\{\{name\}\}/gi, pName)
      .replace(/\{\{client_name\}\}/gi, pName)
      .replace(/\{\{first_name\}\}/gi, pFirstName)
      .replace(/\{\{firstName\}\}/gi, pFirstName)
      .replace(/\{\{email\}\}/gi, pEmail)
      .replace(/\{\{brand\}\}/gi, pBrand)
      .replace(/\{\{company\}\}/gi, pBrand)
      .replace(/\{\{website\}\}/gi, pWebsite)
      .replace(/\{\{phone\}\}/gi, pPhone)
      .replace(/\{\{date\}\}/gi, pDate)
      .replace(/\{\{year\}\}/gi, pYear);
  };

  const getRenderedPreviewSubject = () => {
    if (!subject) return "";
    if (!previewPersonalized) return subject;
    const pName = previewTestName.trim() || customClientName.trim() || "Ramesh Sharma";
    const pFirstName = pName.split(" ")[0] || "Ramesh";
    const pEmail = customTo.split(/[\n,;]+/)[0]?.trim() || "ramesh.sharma@gmail.com";
    const pBrand = brand === "hbs" ? "Hind Building Solutions" : "Hindustan Projects";

    return subject
      .replace(/\{\{name\}\}/gi, pName)
      .replace(/\{\{client_name\}\}/gi, pName)
      .replace(/\{\{first_name\}\}/gi, pFirstName)
      .replace(/\{\{firstName\}\}/gi, pFirstName)
      .replace(/\{\{email\}\}/gi, pEmail)
      .replace(/\{\{brand\}\}/gi, pBrand);
  };

  // 1-Click Direct Send to Audience or Custom Recipient
  const handleDirectSend = async () => {
    if (!smtpConfigured) {
      setToast({
        message: "Hostinger SMTP password is missing! Please configure your password in Settings tab first.",
        type: "error",
      });
      return;
    }
    if (!subject) {
      setToast({ message: "Please provide an email subject line", type: "error" });
      return;
    }
    if (!htmlBody) {
      setToast({ message: "Email content cannot be empty", type: "error" });
      return;
    }
    if (recipientMode === "custom" && !customTo.trim()) {
      setToast({ message: "Please enter at least one recipient email address", type: "error" });
      return;
    }

    setSendingDirect(true);
    setShowConfirmSendModal(false);

    try {
      const payload: any = {
        name: name || subject,
        subject,
        brand,
        senderName,
        senderEmail,
        htmlBody,
        textBody: htmlBody.replace(/<[^>]*>/g, ""),
        customClientName: customClientName.trim() || undefined,
      };

      if (recipientMode === "custom") {
        payload.customRecipients = customTo;
      } else {
        payload.targetAudience = targetAudience;
      }

      const res = await fetch("/api/automail/send-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setToast({ message: data.message || "Broadcasting started!", type: "success" });
        setTimeout(() => {
          router.push(`/admin/automail/campaigns/${data.campaign.id}`);
        }, 1000);
      } else {
        setToast({ message: data.error || "Failed to start broadcast", type: "error" });
      }
    } catch {
      setToast({ message: "Network error starting broadcast", type: "error" });
    } finally {
      setSendingDirect(false);
    }
  };

  // Save as Draft
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject) {
      setToast({ message: "Campaign name and subject are required", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/automail/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          brand,
          senderName,
          senderEmail,
          htmlBody,
          textBody: htmlBody.replace(/<[^>]*>/g, ""),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: "Campaign saved as draft!", type: "success" });
        setTimeout(() => {
          router.push("/admin/automail/campaigns");
        }, 1000);
      } else {
        setToast({ message: data.error || "Failed to save campaign", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving campaign", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Send Test Email to Admin
  const sendTestEmail = async () => {
    if (!testEmailRecipient) return;
    setSendingTest(true);
    try {
      const res = await fetch("/api/automail/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailRecipient,
          subject: subject || "Test Campaign Preview",
          htmlBody: htmlBody || "<p>Test email preview</p>",
          brand,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Test email successfully delivered to ${testEmailRecipient}!`, type: "success" });
        setTestEmailModal(false);
      } else {
        setToast({ message: data.error || "Failed to send test email", type: "error" });
      }
    } catch {
      setToast({ message: "Network error sending test email", type: "error" });
    } finally {
      setSendingTest(false);
    }
  };

  const currentAudienceCount =
    targetAudience === "hipro"
      ? audienceCounts.hipro
      : targetAudience === "hbs"
      ? audienceCounts.hbs
      : audienceCounts.all;

  const combinedTemplates = [
    ...customTemplates.map((t) => ({ ...t, isCustom: true, badge: t.badge || "Custom" })),
    ...BUSINESS_TEMPLATES.map((t) => ({ ...t, isCustom: false })),
  ];

  const categories = [
    "all",
    "Custom / Imported",
    "Construction & Engineering",
    "Building Repair & Maintenance",
    "Formal Quotations",
    "Client Relations",
    "Official Company",
  ];

  const filteredTemplates = combinedTemplates.filter((t) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "Custom / Imported" ? t.isCustom : t.category === selectedCategory);
    const matchesSearch =
      !templateSearch ||
      t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <AutoMailNav activeBrand={brand} onBrandChange={handleBrandChange} />

      {/* SMTP Configuration Missing Warning */}
      {!smtpConfigured && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">Hostinger Mailbox Password Required</p>
              <p className="text-[11px] text-amber-800">
                Email deliver karne ke liye pehle Hostinger email aur password Settings tab me configure karein.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/automail/settings")}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all whitespace-nowrap shrink-0"
          >
            Open Settings & Enter Password →
          </button>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Easy 3-Step Guidance Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Easy Email Sender Studio</span>
            </h2>
            <p className="text-xs text-slate-500">
              Direct kisi ek email ko bhejo ya poori audience ko bulk me broadcast karo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLibraryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Template Gallery</span>
            </button>
            <button
              type="button"
              onClick={() => setTestEmailModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Mail</span>
            </button>
          </div>
        </div>

        {/* 3 Step Visual Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono font-bold text-blue-600 mr-1.5">STEP 1:</span>
            <span className="font-bold text-slate-800">Recipient Select Karo</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Direct email address likho ya audience segment chuno</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono font-bold text-amber-600 mr-1.5">STEP 2:</span>
            <span className="font-bold text-slate-800">Template & Subject Review</span>
            <p className="text-[11px] text-slate-500 mt-0.5">High-converting business template loaded hai</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono font-bold text-emerald-600 mr-1.5">STEP 3:</span>
            <span className="font-bold text-slate-800">&ldquo;Send Now&rdquo; Dabao</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Hostinger SMTP se safe rate-limiting ke saath send hoga</p>
          </div>
        </div>

        {/* 1-Click Smart Workflows: User & Name ke hisab se Auto-Generate */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Smart Workflows (1-Click Auto-Draft For Client):</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Client ke intent par click karein — Email body, greeting aur subject auto create hoga
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {SMART_WORKFLOWS.map((wf) => (
              <button
                key={wf.id}
                type="button"
                onClick={() => applySmartWorkflow(wf)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/60 text-left transition-all group flex flex-col justify-between shadow-2xs hover:shadow-xs active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-base">{wf.icon}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {wf.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 leading-snug">
                    {wf.title}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  {wf.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Composer Form */}
      <form onSubmit={handleSaveDraft} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* STEP 1: AUDIENCE / RECIPIENT SELECTOR BOX */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Step 1: Kisko Bhejna Hai? (Recipient Selection)</span>
            </label>

            {/* Recipient Mode Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => setRecipientMode("custom")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  recipientMode === "custom"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Send className="w-3 h-3" />
                <span>Direct Email(s) / Specific Client</span>
              </button>
              <button
                type="button"
                onClick={() => setRecipientMode("group")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  recipientMode === "group"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Audience Group ({currentAudienceCount})</span>
              </button>
            </div>
          </div>

          {/* MODE A: DIRECT CUSTOM RECIPIENT */}
          {recipientMode === "custom" && (
            <div className="bg-white border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    To: Recipient Email(s) *
                  </label>
                  <input
                    type="text"
                    value={customTo}
                    onChange={(e) => handleCustomToChange(e.target.value)}
                    placeholder="client@gmail.com (ya comma separated: a@gmail.com, b@gmail.com)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Single email daalo ya comma se multiple emails enter karo.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Client Name (Auto-Detected)</span>
                    {customClientName && (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Active: &quot;{customClientName}&quot;</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={customClientName}
                    onChange={(e) => {
                      setCustomClientName(e.target.value);
                      if (e.target.value) setPreviewTestName(e.target.value);
                    }}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Template me &ldquo;Dear {'{{name}}'}&rdquo; aur &ldquo;Hi {'{{first_name}}'}&rdquo; auto replace honge.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: AUDIENCE GROUP SEGMENT */}
          {recipientMode === "group" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    targetAudience === "all"
                      ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Sabhi Contacts Ko</span>
                    </span>
                    <input
                      type="radio"
                      name="audience"
                      checked={targetAudience === "all"}
                      onChange={() => setTargetAudience("all")}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    HiPRO + Hind Build + CSV Uploads ({audienceCounts.all} contacts)
                  </p>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    targetAudience === "hipro"
                      ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Sirf HiPRO Leads</span>
                    </span>
                    <input
                      type="radio"
                      name="audience"
                      checked={targetAudience === "hipro"}
                      onChange={() => {
                        setTargetAudience("hipro");
                        setBrand("hipro");
                        setSenderName("Hindustan Projects");
                        setSenderEmail("info@hindustanprojects.in");
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Quotes, Inquiries, Careers ({audienceCounts.hipro} contacts)
                  </p>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    targetAudience === "hbs"
                      ? "bg-red-50/70 border-red-300 ring-2 ring-red-400/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Hammer className="w-3.5 h-3.5 text-red-600" />
                      <span>Sirf Hind Build Leads</span>
                    </span>
                    <input
                      type="radio"
                      name="audience"
                      checked={targetAudience === "hbs"}
                      onChange={() => {
                        setTargetAudience("hbs");
                        setBrand("hbs");
                        setSenderName("Hind Building Solutions");
                        setSenderEmail("hbs@hindustanprojects.in");
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Repair, Waterproofing Inquiries ({audienceCounts.hbs} contacts)
                  </p>
                </label>
              </div>

              {currentAudienceCount === 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Audience list khali hai. Aap upar &ldquo;Direct Email(s)&rdquo; tab se kisi ko bhi direct email bhej sakte ho ya CRM leads sync kar sakte ho.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/automail/contacts")}
                    className="font-bold underline text-blue-700 whitespace-nowrap"
                  >
                    Sync Leads →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* STEP 2: SENDER DETAILS & SUBJECT */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Step 2: Sender Details & Subject Line
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                From Name (Sender Brand)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                From Email (Hostinger Mailbox)
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Email Subject Line *
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">Insert in Subject:</span>
                  <button
                    type="button"
                    onClick={() => insertTag("{{first_name}}", "subject")}
                    className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-mono font-bold border border-blue-200 transition-colors"
                    title="First Name (e.g. Ramesh)"
                  >
                    + {"{{first_name}}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTag("{{name}}", "subject")}
                    className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-mono font-bold border border-blue-200 transition-colors"
                    title="Full Name (e.g. Ramesh Sharma)"
                  >
                    + {"{{name}}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTag("{{brand}}", "subject")}
                    className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-mono font-bold border border-blue-200 transition-colors"
                    title="Brand Name"
                  >
                    + {"{{brand}}"}
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="e.g. Hi {{first_name}}, Detailed Quotation & Estimate from {{brand}}"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Personalization Tag Helper */}
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Smart Dynamic Personalization Tags (Auto-Replaced Per User):</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-medium">Click any tag to insert in email body:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => insertTag("{{first_name}}", "body")}
              className="px-2.5 py-1 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-mono font-bold transition-colors shadow-2xs"
              title="First Name (e.g. Ramesh)"
            >
              + {"{{first_name}}"} <span className="font-sans text-[10px] font-normal text-slate-500">(First Name)</span>
            </button>
            <button
              type="button"
              onClick={() => insertTag("{{name}}", "body")}
              className="px-2.5 py-1 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-mono font-bold transition-colors shadow-2xs"
              title="Full Name (e.g. Ramesh Sharma)"
            >
              + {"{{name}}"} <span className="font-sans text-[10px] font-normal text-slate-500">(Full Name)</span>
            </button>
            <button
              type="button"
              onClick={() => insertTag("{{email}}", "body")}
              className="px-2.5 py-1 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-mono font-bold transition-colors shadow-2xs"
              title="Client's Email"
            >
              + {"{{email}}"} <span className="font-sans text-[10px] font-normal text-slate-500">(Email)</span>
            </button>
            <button
              type="button"
              onClick={() => insertTag("{{brand}}", "body")}
              className="px-2.5 py-1 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-mono font-bold transition-colors shadow-2xs"
              title="Brand Name (e.g. Hindustan Projects)"
            >
              + {"{{brand}}"} <span className="font-sans text-[10px] font-normal text-slate-500">(Brand)</span>
            </button>
            <button
              type="button"
              onClick={() => insertTag("{{phone}}", "body")}
              className="px-2.5 py-1 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-mono font-bold transition-colors shadow-2xs"
              title="Helpline Phone"
            >
              + {"{{phone}}"} <span className="font-sans text-[10px] font-normal text-slate-500">(Phone)</span>
            </button>
            <button
              type="button"
              onClick={() => insertTag("{{date}}", "body")}
              className="px-2.5 py-1 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-mono font-bold transition-colors shadow-2xs"
              title="Today's Date"
            >
              + {"{{date}}"} <span className="font-sans text-[10px] font-normal text-slate-500">(Date)</span>
            </button>
          </div>
        </div>

        {/* STEP 3: HTML Editor & Live Visual Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              <span>Step 3: Email Layout Preview & Edit</span>
            </label>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  !showPreview ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <PenSquare className="w-3 h-3" />
                <span>Code Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  showPreview ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Live Visual Preview</span>
              </button>
            </div>
          </div>

          {showPreview ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 min-h-[380px] max-h-[650px] overflow-y-auto space-y-4">
              {/* Dynamic Preview Control Bar */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">
                    Live Client Preview Mode:
                  </span>
                  <span className="text-[11px] text-slate-500 hidden md:inline">
                    (Customer ko kaisa dikhega preview karein)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>Sample Name:</span>
                    <input
                      type="text"
                      value={previewTestName}
                      onChange={(e) => setPreviewTestName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none w-36 font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewPersonalized(!previewPersonalized)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                      previewPersonalized
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {previewPersonalized ? "✓ Personalized View" : "Raw {{name}} View"}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="pb-3 border-b border-slate-100 text-xs text-slate-600 space-y-1">
                  <p><strong>From:</strong> <span className="font-medium text-slate-900">{senderName} &lt;{senderEmail}&gt;</span></p>
                  <p><strong>To:</strong> <span className="font-medium text-slate-900">{previewPersonalized ? `${previewTestName || "Ramesh Sharma"} <${customTo.split(/[\n,;]+/)[0]?.trim() || "ramesh.sharma@gmail.com"}>` : (customTo || "{{email}}")}</span></p>
                  <p><strong>Subject:</strong> <span className="font-bold text-slate-900">{getRenderedPreviewSubject() || "(No subject entered)"}</span></p>
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: getRenderedPreviewHtml() || '<p style="text-align: center; color: #94a3b8; padding: 40px;">No HTML content written yet. Click "Template Gallery" to load a pre-made business template!</p>',
                  }}
                />
              </div>
            </div>
          ) : (
            <textarea
              rows={14}
              placeholder="Write your email HTML here..."
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 outline-none focus:border-blue-500 transition-all resize-y min-h-[300px] leading-relaxed"
            />
          )}
        </div>

        {/* BIG ACTION BAR: 1-CLICK SEND VS SAVE DRAFT */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl">
          <div className="text-xs text-slate-600">
            <p className="font-bold text-slate-900">
              {recipientMode === "custom"
                ? `Direct Send Mode: Delivering to ${customTo.trim() ? customTo.split(/[\n,;]+/).filter(Boolean).length : 0} Recipient(s)`
                : `Broadcast Mode: Delivering to ${currentAudienceCount} Contacts`}
            </p>
            <p className="text-[11px] text-slate-500">
              Delivered safely through Hostinger SMTP engine with safe pacing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setTemplateSaveName(name || subject || "Custom Business Template");
                setShowSaveTemplateModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl transition-all"
              title="Save current email design to Custom Templates Library"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Save As Template</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              {saving ? "Saving Draft..." : "Save Draft Only"}
            </button>

            <button
              type="button"
              disabled={
                sendingDirect ||
                (recipientMode === "custom" ? !customTo.trim() : currentAudienceCount === 0)
              }
              onClick={() => setShowConfirmSendModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {recipientMode === "custom"
                  ? `🚀 SEND EMAIL NOW (${customTo.trim() ? customTo.split(/[\n,;]+/).filter(Boolean).length : 0} RECIPIENT)`
                  : `🚀 SEND BROADCAST NOW (${currentAudienceCount} CONTACTS)`}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Save Draft As Custom Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookmarkPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Save As Reusable Template</h3>
                  <p className="text-xs text-slate-500">Save this design to use in future campaigns</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveAsCustomTemplate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Template Title *
                </label>
                <input
                  type="text"
                  required
                  value={templateSaveName}
                  onChange={(e) => setTemplateSaveName(e.target.value)}
                  placeholder="e.g. HiPRO Official Client Proposal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={templateSaveCategory}
                  onChange={(e) => setTemplateSaveCategory(e.target.value)}
                  placeholder="e.g. Official Company"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p><strong>Brand Tag:</strong> {brand.toUpperCase()}</p>
                <p><strong>Subject:</strong> {subject || "—"}</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCustomTemplate}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-xs"
                >
                  {savingCustomTemplate ? "Saving..." : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Sending */}
      {showConfirmSendModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {recipientMode === "custom" ? "Confirm Direct Email Send" : "Confirm Email Broadcast"}
              </h3>
              <p className="text-xs text-slate-500">
                Hostinger SMTP queue ke zariye safe transmission launch hoga.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 font-medium text-slate-700">
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>From:</strong> {senderName} &lt;{senderEmail}&gt;</p>
              <p>
                <strong>Recipient(s):</strong>{" "}
                <span className="font-mono text-blue-700">
                  {recipientMode === "custom"
                    ? customTo
                    : `${currentAudienceCount} contacts (${targetAudience.toUpperCase()})`}
                </span>
              </p>
              <p><strong>Server:</strong> Hostinger SMTP Engine</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmSendModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingDirect}
                onClick={handleDirectSend}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {sendingDirect ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initiating Transmission...</span>
                  </>
                ) : (
                  <span>Yes, Start Sending Now!</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Template Library Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Choose A Business or Custom Template</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select a template to automatically load high-converting copy, layouts, and sender details
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/automail/templates"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1 transition-all"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Import / Manage Templates →</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLibraryModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Category Dropdown & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-blue-500 shadow-2xs"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {selectedCategory !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded bg-blue-50"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-1">
              {filteredTemplates.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl p-4 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {t.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{t.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
                    <div className="p-2 bg-white rounded-lg border border-slate-200/60 text-[11px] text-slate-500 font-mono">
                      Subject: {t.subject}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Brand: <strong className="text-slate-700">{(t.brand || "all").toUpperCase()}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Send Live Test Email</h3>
            <p className="text-xs text-slate-500">
              Apni personal email dalkar live email design check karo
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Your Email Address *
              </label>
              <input
                type="email"
                placeholder="you@gmail.com"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTestEmailModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingTest || !testEmailRecipient}
                onClick={sendTestEmail}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
