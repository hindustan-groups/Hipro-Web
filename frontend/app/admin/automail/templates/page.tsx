"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import {
  BUSINESS_TEMPLATES,
  AutomailBusinessTemplate,
} from "@/lib/automailTemplates";
import {
  Layers,
  Search,
  Sparkles,
  Building2,
  Hammer,
  Globe2,
  Send,
  Eye,
  CheckCircle2,
  Monitor,
  Smartphone,
  ArrowRight,
  Copy,
  Plus,
  Upload,
  Edit,
  Trash2,
  CopyCheck,
  Code2,
  FileCode,
  FileUp,
  ChevronDown,
  Filter,
  Check,
} from "lucide-react";

interface CustomTemplateItem {
  id: string;
  title: string;
  category: string;
  brand: "hipro" | "hbs" | "all";
  badge: string;
  description: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  html: string;
  isCustom?: boolean;
}

export default function AutoMailTemplatesPage() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedTab, setSelectedTab] = useState<"all" | "presets" | "custom">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Custom templates fetched from API
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateItem[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<CustomTemplateItem | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create / Edit Modal
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorCategory, setEditorCategory] = useState("Official Company");
  const [editorBrand, setEditorBrand] = useState<"hipro" | "hbs" | "all">("all");
  const [editorDescription, setEditorDescription] = useState("");
  const [editorSubject, setEditorSubject] = useState("");
  const [editorSenderName, setEditorSenderName] = useState("");
  const [editorSenderEmail, setEditorSenderEmail] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<"file" | "paste">("file");
  const [importTitle, setImportTitle] = useState("");
  const [importBrand, setImportBrand] = useState<"hipro" | "hbs" | "all">("all");
  const [importSubject, setImportSubject] = useState("");
  const [importCategory, setImportCategory] = useState("Imported Design");
  const [importPastedHtml, setImportPastedHtml] = useState("");
  const [uploadingHtmlFile, setUploadingHtmlFile] = useState(false);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);

  // Add / Import Template Dropdown state
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const actionDropdownRef = useRef<HTMLDivElement>(null);

  // Category Filter Dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target as Node)) {
        setActionDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const fetchCustomTemplates = async () => {
    setLoadingCustom(true);
    try {
      const res = await fetch("/api/automail/custom-templates");
      const data = await res.json();
      if (data.success) {
        setCustomTemplates(data.templates || []);
      }
    } catch {
      console.error("Failed to load custom templates");
    } finally {
      setLoadingCustom(false);
    }
  };

  useEffect(() => {
    fetchCustomTemplates();
  }, []);

  const allTemplates: CustomTemplateItem[] = [
    ...customTemplates.map((t) => ({ ...t, isCustom: true })),
    ...BUSINESS_TEMPLATES.map((t) => ({ ...t, isCustom: false })),
  ];

  const categories = [
    "all",
    "Construction & Engineering",
    "Building Repair & Maintenance",
    "Formal Quotations",
    "Client Relations",
    "Official Company",
    "Imported Design",
  ];

  const filteredTemplates = allTemplates.filter((t) => {
    // Tab filter
    if (selectedTab === "presets" && t.isCustom) return false;
    if (selectedTab === "custom" && !t.isCustom) return false;

    // Brand filter
    const matchesBrand = selectedBrand === "all" || t.brand === selectedBrand || t.brand === "all";

    // Category filter
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;

    // Search filter
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());

    return matchesBrand && matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (t: CustomTemplateItem) => {
    router.push(`/admin/automail/compose?template=${t.id}&brand=${t.brand}`);
  };

  const copySubject = (subject: string, id: string) => {
    navigator.clipboard.writeText(subject);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingId(null);
    setEditorTitle("");
    setEditorCategory("Official Company");
    setEditorBrand(selectedBrand !== "all" ? (selectedBrand as any) : "hipro");
    setEditorDescription("");
    setEditorSubject("Hindustan Projects Official Update for {{name}}");
    setEditorSenderName(selectedBrand === "hbs" ? "Hind Build Solutions" : "Hindustan Projects");
    setEditorSenderEmail(selectedBrand === "hbs" ? "hbs@hindustanprojects.in" : "info@hindustanprojects.in");
    setEditorHtml(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hindustan Projects Official</title>
</head>
<body style="margin: 0; padding: 24px; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #0f172a; padding: 24px; text-align: center; border-bottom: 4px solid #2563eb;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">Hindustan Projects</h1>
      <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0; text-transform: uppercase;">Engineering • Civil Infrastructure • Quality Build</p>
    </div>
    <div style="padding: 28px;">
      <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">Dear {{name}},</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Thank you for choosing Hindustan Projects. We are delighted to share this official communication regarding our turnkey civil and engineering solutions.
      </p>
      <div style="margin: 24px 0; padding: 16px; background-color: #f1f5f9; border-left: 4px solid #2563eb; border-radius: 4px;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">Custom Project Highlight</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #475569;">Insert custom specifications, quotation estimates, or inspection reports here.</p>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        If you have any questions, feel free to reply directly to this email or reach us at <strong style="color: #2563eb;">+91 98765 43210</strong>.
      </p>
      <p style="font-size: 14px; color: #0f172a; margin-bottom: 0;">Warm regards,<br><strong>Team Hindustan Projects</strong></p>
    </div>
    <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
      © ${new Date().getFullYear()} Hindustan Projects. All rights reserved.
    </div>
  </div>
</body>
</html>`);
    setShowEditorModal(true);
  };

  // Duplicate an existing template to edit as custom
  const handleDuplicate = (t: CustomTemplateItem) => {
    setEditingId(null);
    setEditorTitle(`${t.title} (Custom Copy)`);
    setEditorCategory(t.category);
    setEditorBrand(t.brand);
    setEditorDescription(`Customized variation of ${t.title}`);
    setEditorSubject(t.subject);
    setEditorSenderName(t.senderName);
    setEditorSenderEmail(t.senderEmail);
    setEditorHtml(t.html);
    setShowEditorModal(true);
    setToast({ message: `Duplicated "${t.title}" into custom editor. Modify and save!`, type: "info" });
  };

  // Open Edit Modal for a custom template
  const handleEdit = (t: CustomTemplateItem) => {
    setEditingId(t.id);
    setEditorTitle(t.title);
    setEditorCategory(t.category);
    setEditorBrand(t.brand);
    setEditorDescription(t.description);
    setEditorSubject(t.subject);
    setEditorSenderName(t.senderName);
    setEditorSenderEmail(t.senderEmail);
    setEditorHtml(t.html);
    setShowEditorModal(true);
  };

  // Delete Custom Template
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete custom template "${title}"?`)) return;
    try {
      const res = await fetch(`/api/automail/custom-templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Template "${title}" deleted.`, type: "success" });
        fetchCustomTemplates();
      } else {
        setToast({ message: data.error || "Failed to delete template", type: "error" });
      }
    } catch {
      setToast({ message: "Network error deleting template", type: "error" });
    }
  };

  // Save Custom Template (Create or Update)
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorTitle || !editorSubject || !editorHtml) {
      setToast({ message: "Please fill Title, Subject, and HTML code", type: "error" });
      return;
    }

    setSavingTemplate(true);
    try {
      const url = editingId ? `/api/automail/custom-templates/${editingId}` : "/api/automail/custom-templates";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editorTitle,
          category: editorCategory,
          brand: editorBrand,
          description: editorDescription,
          subject: editorSubject,
          senderName: editorSenderName,
          senderEmail: editorSenderEmail,
          html: editorHtml,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({
          message: editingId ? `Template "${editorTitle}" updated!` : `Custom template "${editorTitle}" created!`,
          type: "success",
        });
        setShowEditorModal(false);
        fetchCustomTemplates();
        setSelectedTab("custom");
      } else {
        setToast({ message: data.error || "Failed to save template", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving template", type: "error" });
    } finally {
      setSavingTemplate(false);
    }
  };

  // Handle HTML File Upload
  const handleHtmlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHtmlFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("brand", importBrand);
    formData.append("category", importCategory);
    if (importTitle) formData.append("title", importTitle);
    if (importSubject) formData.append("subject", importSubject);

    try {
      const res = await fetch("/api/automail/custom-templates/import-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: data.message || `HTML template imported successfully!`, type: "success" });
        setShowImportModal(false);
        fetchCustomTemplates();
        setSelectedTab("custom");
      } else {
        setToast({ message: data.error || "Failed to import HTML template", type: "error" });
      }
    } catch {
      setToast({ message: "Network error during file upload", type: "error" });
    } finally {
      setUploadingHtmlFile(false);
      if (htmlFileInputRef.current) htmlFileInputRef.current.value = "";
    }
  };

  // Handle Pasted HTML Import
  const handlePastedHtmlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importPastedHtml.trim()) {
      setToast({ message: "Please paste your HTML code", type: "error" });
      return;
    }

    setUploadingHtmlFile(true);
    try {
      const res = await fetch("/api/automail/custom-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: importTitle.trim() || "Imported HTML Template",
          category: importCategory,
          brand: importBrand,
          description: "Imported custom HTML email template",
          subject: importSubject.trim() || "Official Notification from Hindustan Projects",
          html: importPastedHtml,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Pasted HTML template saved successfully!`, type: "success" });
        setShowImportModal(false);
        setImportPastedHtml("");
        fetchCustomTemplates();
        setSelectedTab("custom");
      } else {
        setToast({ message: data.error || "Failed to save imported template", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving template", type: "error" });
    } finally {
      setUploadingHtmlFile(false);
    }
  };

  // Insert variable tag into HTML editor
  const insertVariable = (variable: string) => {
    setEditorHtml((prev) => prev + ` {{${variable}}}`);
  };

  return (
    <div className="space-y-6">
      <AutoMailNav activeBrand={selectedBrand} onBrandChange={setSelectedBrand} />

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : toast.type === "info"
              ? "bg-blue-50 text-blue-800 border border-blue-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Top Header & Action Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Email Template Library</h2>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
              {allTemplates.length} Total Templates
            </span>
            {customTemplates.length > 0 && (
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                {customTemplates.length} Custom / Imported
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official branded HTML email templates for HiPRO, Hind Build, custom company pitches & imported designs
          </p>
        </div>

        {/* Action Buttons Toolbar - Compact & Single-Row */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Open Compose Studio */}
          <Link
            href={`/admin/automail/compose?brand=${selectedBrand}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold border border-slate-200/80 transition-all shadow-2xs whitespace-nowrap"
            title="Open Compose Studio"
          >
            <Send className="w-3.5 h-3.5 text-slate-500" />
            <span>Compose Studio</span>
          </Link>

          {/* Add / Import Template Dropdown */}
          <div className="relative" ref={actionDropdownRef}>
            <button
              type="button"
              onClick={() => setActionDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Template</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-blue-200 transition-transform ${
                  actionDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {actionDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Template Actions
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActionDropdownOpen(false);
                    openCreateModal();
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-slate-50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Create Custom Template</p>
                    <p className="text-[11px] text-slate-500">Design company template from scratch</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionDropdownOpen(false);
                    setImportMode("file");
                    setImportTitle("");
                    setImportSubject("");
                    setImportBrand(selectedBrand !== "all" ? (selectedBrand as any) : "all");
                    setShowImportModal(true);
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-slate-50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Upload HTML File</p>
                    <p className="text-[11px] text-slate-500">Import .html file from Canva / Figma</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionDropdownOpen(false);
                    setImportMode("paste");
                    setImportTitle("");
                    setImportSubject("");
                    setImportBrand(selectedBrand !== "all" ? (selectedBrand as any) : "all");
                    setShowImportModal(true);
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-slate-50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Paste HTML Code</p>
                    <p className="text-[11px] text-slate-500">Paste raw email code directly</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Filter & Tabs Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Primary View Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Templates ({allTemplates.length})
            </button>
            <button
              onClick={() => setSelectedTab("presets")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTab === "presets" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏢 Built-In Presets ({BUSINESS_TEMPLATES.length})
            </button>
            <button
              onClick={() => setSelectedTab("custom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedTab === "custom" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>My Custom & Imported ({customTemplates.length})</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, subject or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Dropdown & Filter Info */}
        <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Category Dropdown */}
            <div className="relative shrink-0" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Category:</span>
                <span className="text-slate-900 font-semibold">{selectedCategory === "all" ? "All Categories" : selectedCategory}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${categoryDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter By Category</div>
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(c);
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedCategory === c
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{c === "all" ? "All Categories" : c}</span>
                      {selectedCategory === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                <span>Clear filter ({selectedCategory})</span>
                <span className="text-xs">✕</span>
              </button>
            )}
          </div>

          {/* Brand Scope Filter Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span>Brand Scope:</span>
            <span className="font-mono text-slate-800 uppercase px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px]">
              {selectedBrand}
            </span>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((t) => (
          <div
            key={t.id}
            className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4 ${
              t.isCustom ? "border-blue-200 ring-1 ring-blue-500/10" : "border-slate-200"
            }`}
          >
            <div className="space-y-3">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      t.brand === "hipro"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : t.brand === "hbs"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {t.brand === "hipro" ? (
                      <Building2 className="w-3 h-3" />
                    ) : t.brand === "hbs" ? (
                      <Hammer className="w-3 h-3" />
                    ) : (
                      <Globe2 className="w-3 h-3" />
                    )}
                    <span>{t.badge}</span>
                  </span>

                  {t.isCustom && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Custom
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {t.category}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Subject Line Preview Box */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Subject Line</span>
                  <button
                    onClick={() => copySubject(t.subject, t.id)}
                    className="hover:text-slate-700 flex items-center gap-0.5"
                    title="Copy subject"
                  >
                    {copiedId === t.id ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Copied
                      </span>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-800 font-mono text-[11px] truncate">{t.subject}</p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(t)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUseTemplate(t)}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Use Template</span>
                </button>
              </div>

              {/* Secondary utility actions */}
              <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleDuplicate(t)}
                  className="text-slate-500 hover:text-blue-600 flex items-center gap-1 p-1 hover:bg-slate-50 rounded"
                  title="Duplicate as new custom template"
                >
                  <CopyCheck className="w-3 h-3" />
                  <span>Duplicate</span>
                </button>

                {t.isCustom && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEdit(t)}
                      className="text-slate-500 hover:text-amber-600 flex items-center gap-1 p-1 hover:bg-slate-50 rounded"
                      title="Edit template details & HTML"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id, t.title)}
                      className="text-slate-500 hover:text-red-600 flex items-center gap-1 p-1 hover:bg-slate-50 rounded"
                      title="Delete custom template"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <Layers className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-bold text-slate-700">No templates found for this filter.</p>
          <p className="text-[11px] text-slate-400">
            Try switching tabs, clearing search, or click &ldquo;+ Create Custom Template&rdquo; to add your own!
          </p>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. INTERACTIVE LIVE PREVIEW MODAL                              */}
      {/* ============================================================== */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{previewTemplate.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {previewTemplate.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Subject: {previewTemplate.subject}
                </p>
              </div>

              {/* Device Toggle & Close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      previewDevice === "desktop" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      previewDevice === "mobile" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Preview Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70 flex justify-center">
              <div
                className={`transition-all bg-white shadow-md rounded-xl overflow-hidden ${
                  previewDevice === "mobile" ? "max-w-sm w-full" : "max-w-2xl w-full"
                }`}
              >
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: previewTemplate.html
                      .replace(/\{\{name\}\}/g, "Valued Client")
                      .replace(/\{\{email\}\}/g, "client@company.com"),
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Variables like <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono font-bold">{"{{name}}"}</code> will replace dynamically during send.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <span>Use This Template in Compose</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CREATE / EDIT CUSTOM TEMPLATE MODAL                         */}
      {/* ============================================================== */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingId ? "Edit Custom Email Template" : "Create Official Custom Template"}
                  </h3>
                  <p className="text-xs text-slate-500">Design company branded emails tailored for your business</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Template Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="e.g. HiPRO Festive Commercial Discount"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Brand Association
                  </label>
                  <select
                    value={editorBrand}
                    onChange={(e) => setEditorBrand(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="hipro">HiPRO Construction</option>
                    <option value="hbs">Hind Build (HiBUILD)</option>
                    <option value="all">Universal / All Brands</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editorCategory}
                    onChange={(e) => setEditorCategory(e.target.value)}
                    placeholder="e.g. Official Company"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={editorSubject}
                  onChange={(e) => setEditorSubject(e.target.value)}
                  placeholder="e.g. Exclusive Project Proposal for {{name}} - Hindustan Projects"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Default Sender Name
                  </label>
                  <input
                    type="text"
                    value={editorSenderName}
                    onChange={(e) => setEditorSenderName(e.target.value)}
                    placeholder="e.g. Hindustan Projects"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Default Sender Email
                  </label>
                  <input
                    type="email"
                    value={editorSenderEmail}
                    onChange={(e) => setEditorSenderEmail(e.target.value)}
                    placeholder="e.g. info@hindustanprojects.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Variable Helper Chips */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                <span className="font-bold text-blue-900">Insert Variable:</span>
                {["name", "email", "phone", "brand", "date"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="px-2 py-0.5 rounded bg-white text-blue-700 border border-blue-200 text-[11px] font-mono font-bold hover:bg-blue-100 transition-all"
                  >
                    + {"{{" + v + "}}"}
                  </button>
                ))}
              </div>

              {/* Code Editor & Live Preview Tabs or Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                    <span>HTML Email Code *</span>
                    <span className="text-[10px] text-slate-400 font-mono">Full HTML supported</span>
                  </label>
                  <textarea
                    required
                    rows={16}
                    value={editorHtml}
                    onChange={(e) => setEditorHtml(e.target.value)}
                    className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Live HTML Preview
                  </label>
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 h-[335px] overflow-y-auto">
                    <div
                      className="bg-white rounded-lg p-4 shadow-xs"
                      dangerouslySetInnerHTML={{
                        __html: editorHtml
                          .replace(/\{\{name\}\}/g, "Valued Client")
                          .replace(/\{\{email\}\}/g, "client@company.com"),
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTemplate}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-xs"
                >
                  {savingTemplate ? "Saving Template..." : editingId ? "Update Template" : "Save Custom Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. IMPORT TEMPLATE MODAL (FILE UPLOAD OR PASTE RAW HTML)       */}
      {/* ============================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Import HTML Email Template</h3>
                  <p className="text-xs text-slate-500">Import from Figma, Canva, Stripo, or external HTML file</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setImportMode("file")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  importMode === "file" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload .html File
              </button>
              <button
                type="button"
                onClick={() => setImportMode("paste")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  importMode === "paste" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paste HTML Code Directly
              </button>
            </div>

            {/* Common Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Template Title (Optional)
                </label>
                <input
                  type="text"
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  placeholder="Auto-detected from file or specify"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Assign To Brand
                </label>
                <select
                  value={importBrand}
                  onChange={(e) => setImportBrand(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
                >
                  <option value="all">Universal / All Brands</option>
                  <option value="hipro">HiPRO Construction</option>
                  <option value="hbs">Hind Build (HiBUILD)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={importSubject}
                onChange={(e) => setImportSubject(e.target.value)}
                placeholder="e.g. Official Proposal from Hindustan Projects"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Mode A: File Upload */}
            {importMode === "file" && (
              <div className="space-y-3">
                <div
                  onClick={() => htmlFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/20 space-y-2"
                >
                  <FileCode className="w-8 h-8 text-blue-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">Click to select .html or .htm file</p>
                  <p className="text-[11px] text-slate-400">Supports responsive email templates with inline styles</p>
                </div>
                <input
                  ref={htmlFileInputRef}
                  type="file"
                  accept=".html, .htm"
                  className="hidden"
                  onChange={handleHtmlFileUpload}
                />
                {uploadingHtmlFile && (
                  <p className="text-xs font-bold text-blue-600 text-center animate-pulse">
                    Importing template file...
                  </p>
                )}
              </div>
            )}

            {/* Mode B: Paste Raw HTML */}
            {importMode === "paste" && (
              <form onSubmit={handlePastedHtmlImport} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Paste HTML Code Here:
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={importPastedHtml}
                    onChange={(e) => setImportPastedHtml(e.target.value)}
                    placeholder="<!DOCTYPE html><html><body>...</body></html>"
                    className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-700 outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingHtmlFile}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    {uploadingHtmlFile ? "Importing..." : "Save Imported Template"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
