"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  X,
  Mail,
  ChevronLeft,
  ChevronRight,
  Upload,
  RefreshCw,
  Building2,
  Hammer,
  Globe2,
  Sparkles,
  Download,
  Send,
  CheckSquare,
  Square,
  ChevronDown,
} from "lucide-react";

export default function AutoMailContacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Data Tools / Import Dropdown state
  const [dataDropdownOpen, setDataDropdownOpen] = useState(false);
  const dataDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dataDropdownRef.current && !dataDropdownRef.current.contains(event.target as Node)) {
        setDataDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add Contact Form
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("all");
  const [savingContact, setSavingContact] = useState(false);

  // Import State
  const [importBrand, setImportBrand] = useState("all");
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync CRM State
  const [syncHiproLeads, setSyncHiproLeads] = useState(true);
  const [syncHiproNewsletter, setSyncHiproNewsletter] = useState(true);
  const [syncHbsLeads, setSyncHbsLeads] = useState(true);
  const [syncingCrm, setSyncingCrm] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const brandParam = brandFilter !== "all" ? `&brand=${brandFilter}` : "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/automail/contacts?page=${page}&limit=25${brandParam}${searchParam}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
        setTotal(data.total || 0);
      }
    } catch {
      setToast({ message: "Failed to load audience contacts", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    setSelectedIds([]); // Clear selection when page or filter changes
  }, [page, search, brandFilter]);

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setSavingContact(true);
    try {
      const res = await fetch("/api/automail/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, name: newName, brand: newBrand }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Contact ${newEmail} added!`, type: "success" });
        setNewEmail("");
        setNewName("");
        setShowAddModal(false);
        fetchContacts();
      } else {
        setToast({ message: data.error || "Failed to add contact", type: "error" });
      }
    } catch {
      setToast({ message: "Network error adding contact", type: "error" });
    } finally {
      setSavingContact(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("brand", importBrand);

    try {
      const res = await fetch("/api/automail/contacts/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: data.message || `Imported contacts successfully!`, type: "success" });
        setShowImportModal(false);
        fetchContacts();
      } else {
        setToast({ message: data.error || "File import failed", type: "error" });
      }
    } catch {
      setToast({ message: "Network error during spreadsheet upload", type: "error" });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const syncFromCrm = async () => {
    setSyncingCrm(true);
    try {
      const res = await fetch("/api/automail/contacts/sync-crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncHiproLeads, syncHiproNewsletter, syncHbsLeads }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: data.message || "Synced CRM leads into AutoMail audience!", type: "success" });
        setShowSyncModal(false);
        fetchContacts();
      } else {
        setToast({ message: data.error || "Failed to sync CRM leads", type: "error" });
      }
    } catch {
      setToast({ message: "Network error syncing CRM leads", type: "error" });
    } finally {
      setSyncingCrm(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      "Email,Name,Brand,Phone,Tags\n" +
      "sharma.construction@gmail.com,Ramesh Sharma,hipro,9876543210,Commercial Villa\n" +
      "waterproofing.expert@gmail.com,Amit Verma,hbs,9876543211,Structural Repair\n" +
      "corporate.inquiry@group.com,Vikram Singh,all,9876543212,Turnkey Civil\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "hipro_automail_sample_contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: "Sample CSV template downloaded! Open in Excel, fill your contacts, and upload.", type: "success" });
  };

  const exportAudienceCsv = async () => {
    try {
      const brandParam = brandFilter !== "all" ? `&brand=${brandFilter}` : "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/automail/contacts?limit=10000${brandParam}${searchParam}`);
      const data = await res.json();
      const list = data.contacts || contacts;

      if (!list || list.length === 0) {
        setToast({ message: "No contacts to export in current filter", type: "info" });
        return;
      }

      const headers = "Email,Name,Brand,Source,Date Added\n";
      const rows = list
        .map((c: any) => {
          const email = `"${(c.email || "").replace(/"/g, '""')}"`;
          const name = `"${(c.name || "").replace(/"/g, '""')}"`;
          const brand = `"${(c.brand || "").replace(/"/g, '""')}"`;
          const source = `"${(c.source || "").replace(/"/g, '""')}"`;
          const date = `"${new Date(c.createdAt || Date.now()).toISOString().split("T")[0]}"`;
          return `${email},${name},${brand},${source},${date}`;
        })
        .join("\n");

      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `hipro_audience_${brandFilter}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToast({ message: `Exported ${list.length} contacts to CSV file!`, type: "success" });
    } catch {
      setToast({ message: "Failed to export contacts CSV", type: "error" });
    }
  };

  const deleteContact = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from audience?`)) return;
    try {
      const res = await fetch(`/api/automail/contacts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Removed ${email}`, type: "success" });
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        fetchContacts();
      }
    } catch {
      setToast({ message: "Failed to delete contact", type: "error" });
    }
  };

  const deleteAll = async () => {
    const promptMsg =
      brandFilter === "all"
        ? `Are you sure you want to permanently delete ALL ${total} contacts across all brands? This cannot be undone.`
        : `Are you sure you want to permanently delete all ${total} ${brandFilter.toUpperCase()} contacts?`;
    if (!confirm(promptMsg)) return;

    try {
      const brandParam = brandFilter !== "all" ? `?brand=${brandFilter}` : "";
      const res = await fetch(`/api/automail/contacts${brandParam}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: data.message || "Audience wiped", type: "success" });
        setSelectedIds([]);
        fetchContacts();
      }
    } catch {
      setToast({ message: "Failed to wipe audience", type: "error" });
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (contacts.length === 0) return;
    const allVisibleSelected = contacts.every((c) => selectedIds.includes(c.id));
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !contacts.some((c) => c.id === id)));
    } else {
      const currentVisibleIds = contacts.map((c) => c.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentVisibleIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteSelectedBatch = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected contacts?`)) return;

    try {
      const res = await fetch("/api/automail/contacts/delete-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Deleted ${data.count || selectedIds.length} contacts!`, type: "success" });
        setSelectedIds([]);
        fetchContacts();
      } else {
        setToast({ message: data.error || "Failed to delete contacts", type: "error" });
      }
    } catch {
      setToast({ message: "Network error deleting contacts", type: "error" });
    }
  };

  const composeToSelected = () => {
    if (selectedIds.length === 0) return;
    const selectedContacts = contacts.filter((c) => selectedIds.includes(c.id));
    const emails = selectedContacts.map((c) => c.email).join(",");
    router.push(`/admin/automail/compose?to=${encodeURIComponent(emails)}&brand=${brandFilter}`);
  };

  const allVisibleSelected = contacts.length > 0 && contacts.every((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-6">
      <AutoMailNav activeBrand={brandFilter} onBrandChange={setBrandFilter} />

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

      {/* Top Header & Actions Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Audience & Contact Manager</h2>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              {total} {total === 1 ? "Contact" : "Contacts"}
            </span>
            {brandFilter !== "all" && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                brandFilter === "hipro"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {brandFilter === "hipro" ? "HiPRO Scope" : "Hind Build Scope"}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized subscriber database spanning HiPRO, Hind Build & external marketing lists
          </p>
        </div>

        {/* Clean, single-row action bar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Data Tools Dropdown (Sync CRM, Import Spreadsheet, Export CSV) */}
          <div className="relative" ref={dataDropdownRef}>
            <button
              type="button"
              onClick={() => setDataDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Import & Sync</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  dataDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dataDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Audience & CRM Tools
                </div>

                {/* 1-Click Sync from CRM */}
                <button
                  type="button"
                  onClick={() => {
                    setDataDropdownOpen(false);
                    setShowSyncModal(true);
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-slate-50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">1-Click Sync from CRM</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full">Auto</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Import all leads & subscribers from CRM</p>
                  </div>
                </button>

                {/* Import CSV / Excel */}
                <button
                  type="button"
                  onClick={() => {
                    setDataDropdownOpen(false);
                    setShowImportModal(true);
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-slate-50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">Import CSV / Excel</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full">Spreadsheet</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Upload bulk audience contacts file</p>
                  </div>
                </button>

                {/* Export CSV */}
                <button
                  type="button"
                  onClick={() => {
                    setDataDropdownOpen(false);
                    exportAudienceCsv();
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-slate-50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Export Audience to CSV</p>
                    <p className="text-[11px] text-slate-500">Download current contact list</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Add Single Contact Primary CTA */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all whitespace-nowrap"
            title="Add a single new contact manually"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Table Controls Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audience by email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
          <span>
            Total in filter: <strong className="text-slate-900 font-mono">{total}</strong>
          </span>
          <button
            onClick={fetchContacts}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {total > 0 && (
            <button
              type="button"
              onClick={deleteAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200 rounded-lg transition-all"
              title={`Permanently delete all contacts in ${brandFilter} view`}
            >
              <Trash2 className="w-3 h-3" />
              <span>Wipe List ({total})</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Multi-Select Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-3 px-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 text-xs font-bold font-mono">
              {selectedIds.length}
            </div>
            <span className="text-xs font-bold text-white">
              {selectedIds.length} contact{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <span className="text-[11px] text-slate-400">| ready for bulk actions</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={composeToSelected}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Compose Mail ({selectedIds.length})</span>
            </button>
            <button
              type="button"
              onClick={deleteSelectedBatch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="rounded text-blue-600 cursor-pointer"
                    title="Select / deselect all on this page"
                  />
                </th>
                <th className="py-3 px-4">Contact Email</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Brand Tag</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Date Subscribed</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded" />
                    </td>
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">No contacts found.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Add a contact manually, import an Excel file, or sync directly from CRM Leads!
                    </p>
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr key={c.id} className={`transition-colors ${isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/50"}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded text-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{c.email}</td>
                      <td className="py-3 px-4 text-slate-600">{c.name || "—"}</td>
                      <td className="py-3 px-4">
                        {c.brand === "hipro" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <Building2 className="w-3 h-3" />
                            HiPRO
                          </span>
                        ) : c.brand === "hbs" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            <Hammer className="w-3 h-3" />
                            Hind Build
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            <Globe2 className="w-3 h-3" />
                            Universal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {c.source || "manual"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/admin/automail/compose?to=${encodeURIComponent(c.email)}&name=${encodeURIComponent(c.name || "")}&brand=${c.brand || "all"}`}
                            className="px-2.5 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-100 rounded-lg transition-all inline-flex items-center gap-1 text-[11px] font-bold"
                            title="Compose email to this contact"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Mail</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => deleteContact(c.id, c.email)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page {page} of {Math.ceil(total / 25) || 1}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={page >= Math.ceil(total / 25)}
              onClick={() => setPage(page + 1)}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Sync from CRM Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">1-Click Sync from CRM Leads</h3>
                <p className="text-xs text-slate-500">Import existing leads from your database into AutoMail</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncHiproNewsletter}
                  onChange={(e) => setSyncHiproNewsletter(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">HiPRO Newsletter Subscribers</p>
                  <p className="text-slate-500 text-[11px]">Active subscribers from website footer</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncHiproLeads}
                  onChange={(e) => setSyncHiproLeads(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">HiPRO Inquiries & Quote Leads</p>
                  <p className="text-slate-500 text-[11px]">Contact form messages and quotation requests</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncHbsLeads}
                  onChange={(e) => setSyncHbsLeads(e.target.checked)}
                  className="rounded text-red-600"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Hind Build (HBS) Leads & Quotes</p>
                  <p className="text-slate-500 text-[11px]">Repair, maintenance & waterproofing inquiries</p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={syncFromCrm}
                disabled={syncingCrm}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {syncingCrm ? "Syncing Database..." : "Execute 1-Click Sync"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV / Excel File Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Import CSV or Excel Spreadsheet</h3>
                  <p className="text-xs text-slate-500">Supports .csv, .xlsx, and .xls files</p>
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

            <div className="space-y-3">
              {/* Sample CSV Download Helper Card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Need the CSV Template?</p>
                  <p className="text-[11px] text-slate-500">Formatted with Email, Name, Brand headers</p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Sample</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Assign Imported Contacts To Brand:
                </label>
                <select
                  value={importBrand}
                  onChange={(e) => setImportBrand(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                >
                  <option value="all">Universal / All Brands</option>
                  <option value="hipro">HiPRO Construction</option>
                  <option value="hbs">Hind Build (HiBUILD)</option>
                </select>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/20 space-y-2"
              >
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Click to choose CSV or Excel file</p>
                <p className="text-[11px] text-slate-400">File should contain email column (and optional name)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {uploadingFile && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Parsing & importing spreadsheet contacts...</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Audience Contact</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addContact} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Brand Association
                </label>
                <select
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="all">Universal / All Brands</option>
                  <option value="hipro">HiPRO Construction</option>
                  <option value="hbs">Hind Build (HiBUILD)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {savingContact ? "Saving..." : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
