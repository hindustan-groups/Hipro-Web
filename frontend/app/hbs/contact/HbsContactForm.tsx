"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Wrench,
  Check,
  X,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FolderKanban,
  Building,
  Home,
  Factory,
  Calendar,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  Droplets,
  Paintbrush,
  Bug,
} from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";
import {
  cleanWhatsAppNumber,
  cleanTelNumber,
  getLeadSuccessWhatsAppUrl,
  getContactWhatsAppUrl,
  buildHbsWhatsAppUrl,
} from "@/lib/hbsWhatsApp";

// Indian phone validator: accepts 10-digit numbers starting with 6-9, optional +91/0 prefix.
function validateIndianPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s\-().]/g, "").replace(/^\+91|^91|^0/, "");
  return /^[6-9]\d{9}$/.test(cleaned);
}

// Fallback service list (used only when API is unavailable)
const HBS_SERVICES_FALLBACK = [
  "01. Structure Repair",
  "02. Water Leakage Solution",
  "03. Plumbing & Electrical",
  "04. Painting & Wall Repair",
  "05. Terrace & Bird Protection",
  "06. Termite Control",
  "07. Tile Work",
  "08. AC, Lift & Solar",
  "09. Electrical & Machine Work",
  "10. Safety & Compliance",
  "11. Gardening",
  "12. Cleaning Services",
  "13. Packers & Movers",
  "14. CCTV & Security",
  "15. Smart Home Automation",
  "16. Furniture Work",
  "17. Wall Decor & Wallpaper",
  "18. Facade Work (ACP & Glass)",
  "19. Fabrication Work",
  "Turnkey Property Maintenance",
  "Other Repair Inquiry",
];

// High-intent shortcut service categories
const POPULAR_SHORTCUTS = [
  { label: "Waterproofing & Seepage", matchKey: "water leakage", icon: Droplets },
  { label: "Structure & Crack Repair", matchKey: "structure repair", icon: Wrench },
  { label: "Painting & Wall Plaster", matchKey: "painting", icon: Paintbrush },
  { label: "Plumbing & Electrical", matchKey: "plumbing", icon: Zap },
  { label: "Termite & Pest Control", matchKey: "termite", icon: Bug },
  { label: "Turnkey Maintenance", matchKey: "turnkey", icon: Building },
];

export interface HbsContactFormProps {
  services: HbsService[];
  content: HbsContent | null;
}

export default function HbsContactForm({ services, content }: HbsContactFormProps) {
  const searchParams = useSearchParams();

  // Build displayed service list: prefer DB records, else fallback
  const serviceOptions: string[] = useMemo(() => {
    if (services.length > 0) {
      return [
        ...services.map((s) =>
          s.serviceNumber ? `${s.serviceNumber}. ${s.title}` : s.title
        ),
        "Turnkey Property Maintenance",
        "Other Repair Inquiry",
      ];
    }
    return HBS_SERVICES_FALLBACK;
  }, [services]);

  const paramService = searchParams.get("service");
  const paramProject = searchParams.get("project");

  const initialSelected = useMemo(() => {
    if (paramService) {
      const normalizedParam = paramService.replace(/[-_]/g, " ").toLowerCase().trim();
      const match = serviceOptions.find((s) => {
        const cleanS = s.replace(/^\d+\.\s*/, "").toLowerCase().trim();
        return (
          cleanS === normalizedParam ||
          cleanS.includes(normalizedParam) ||
          normalizedParam.includes(cleanS)
        );
      });
      if (match) return [match];
    }
    return [serviceOptions[0]];
  }, [paramService, serviceOptions]);

  // Form State
  const [selectedServices, setSelectedServices] = useState<string[]>(initialSelected);
  const [propertyType, setPropertyType] = useState<string>("Residential Villa / House");
  const [urgency, setUrgency] = useState<string>("Within 24–48 Hours (Priority)");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContact, setPreferredContact] = useState<"Phone Call" | "WhatsApp">("Phone Call");
  const [message, setMessage] = useState("");

  // Expandable full service drawer state
  const [showAllServices, setShowAllServices] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

  // Auto-fill project inquiry message if project param is supplied and message is empty
  useEffect(() => {
    if (paramProject && !message) {
      setMessage(`I am interested in discussing a solution similar to your case study: "${paramProject}".`);
    }
  }, [paramProject]);

  // Status State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string>("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Honeypot field for bot rejection
  const [honeypot, setHoneypot] = useState("");

  const whatsappRaw = cleanWhatsAppNumber(content?.whatsapp);
  const phoneRaw = cleanTelNumber(content?.phone);
  const phoneFormatted = content?.phone || "+91 75970 00601";

  // Filtered services for full drawer
  const filteredServices = useMemo(() => {
    if (!serviceSearch.trim()) return serviceOptions;
    const q = serviceSearch.toLowerCase().trim();
    return serviceOptions.filter((s) => s.toLowerCase().includes(q));
  }, [serviceOptions, serviceSearch]);

  // Service toggle handler
  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      if (selectedServices.length === 1) return; // Keep at least one
      setSelectedServices(selectedServices.filter((s) => s !== srv));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const removeService = (srv: string) => {
    if (selectedServices.length > 1) {
      setSelectedServices(selectedServices.filter((s) => s !== srv));
    }
  };

  // Shortcut handler
  const handleShortcutClick = (shortcut: typeof POPULAR_SHORTCUTS[0]) => {
    const matched = serviceOptions.find((s) =>
      s.toLowerCase().includes(shortcut.matchKey)
    );
    if (matched) {
      toggleService(matched);
    }
  };

  const handlePhoneBlur = () => {
    if (phone && !validateIndianPhone(phone)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number.");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent bot rejection

    if (!validateIndianPhone(phone)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      return;
    }

    if (selectedServices.length === 0) {
      setError("Please select at least one service.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Pack extra qualification tags into structured metadata string for admin readability
      const metaLine = `[Property: ${propertyType} | Urgency: ${urgency} | Preferred: ${preferredContact}]`;
      const combinedMessage = message.trim()
        ? `${metaLine}\n\n${message.trim()}`
        : metaLine;

      const res = await fetch("/api/hbs/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          selectedServices,
          selectedService: selectedServices.join(", "),
          location: location.trim(),
          preferredContact,
          message: combinedMessage,
          source: paramProject
            ? `hbs_contact_project_${encodeURIComponent(paramProject)}`
            : "hbs_contact_page",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmittedLeadId(json.data?.id || String(Date.now()));
        setSuccess(true);
      } else {
        setError(json.error || "Unable to submit request. Please call directly.");
      }
    } catch {
      setError("Network connection issue. Please contact us via phone or WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const leadRefCode = submittedLeadId
    ? `HB-${submittedLeadId.slice(-6).toUpperCase()}`
    : "HB-INSP";

  const leadSuccessWaUrl = getLeadSuccessWhatsAppUrl(
    content?.whatsapp,
    leadRefCode,
    selectedServices
  );

  const directPhotoWaUrl = buildHbsWhatsAppUrl(
    content?.whatsapp,
    `Hi Hind Build, I would like to send photos of our building problem for preliminary technical review. (Name: ${name || "Customer"}, Location: ${location || "Rajasthan"})`
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 lg:p-10 shadow-xs relative">
      {success ? (
        <div className="py-6 sm:py-8 space-y-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 animate-in zoom-in-75 duration-300" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md border border-emerald-300 inline-block">
              Inspection Request Confirmed: #{leadRefCode}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Site Inspection Booked!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Thank you, <strong className="text-slate-900">{name}</strong>. A Hind Build civil engineer is being assigned to your request. We will contact you shortly via{" "}
              <strong className="text-slate-900">{preferredContact}</strong> at{" "}
              <span className="font-mono font-bold text-slate-900">{phone}</span> to confirm your doorstep visit time.
            </p>
          </div>

          {/* Submission Summary Card */}
          <div className="p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 max-w-lg mx-auto text-left text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 font-mono text-[11px]">
              <span className="text-slate-500 uppercase font-bold">DISPATCH TICKET:</span>
              <span className="font-bold text-red-600 font-mono text-xs">#{leadRefCode}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Property Type</span>
                <span className="font-semibold text-slate-800">{propertyType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Timeline Priority</span>
                <span className="font-semibold text-slate-800">{urgency}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                Selected Trades ({selectedServices.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedServices.map((srv, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md border border-slate-200 text-slate-800 font-semibold text-[11px]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{srv}</span>
                  </span>
                ))}
              </div>
            </div>

            {location && (
              <div className="flex items-center gap-2 pt-1 text-slate-600 border-t border-slate-200/60">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Site Location: <strong className="text-slate-800">{location}</strong></span>
              </div>
            )}
          </div>

          {/* Instant Follow-up Options */}
          <div className="space-y-3 max-w-lg mx-auto pt-2">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-500 block">
              Want Faster Dispatch or Send Photos?
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <a
                href={leadSuccessWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-hbs-cta="whatsapp"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all min-h-[46px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Engineer on WhatsApp</span>
              </a>

              <a
                href={`tel:${phoneRaw}`}
                data-hbs-cta="call"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0D2D5E] hover:bg-[#0A2349] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all min-h-[46px]"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Hotline</span>
              </a>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSuccess(false);
                setName("");
                setPhone("");
                setLocation("");
                setEmail("");
                setMessage("");
                setSelectedServices([serviceOptions[0]]);
              }}
              className="text-xs text-slate-500 hover:text-red-600 font-semibold underline underline-offset-4 py-2 transition-colors"
            >
              Book Another Inspection
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7" noValidate>
          {paramProject && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 flex items-center justify-between gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Referenced Project:</strong> {paramProject}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-red-600 bg-white px-2 py-0.5 rounded-md border border-red-200">
                Context Attached
              </span>
            </div>
          )}

          {/* Form Header */}
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                Zero-Cost Doorstep Inspection
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-medium">
                100% Free • No Obligation
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase font-display pt-1">
              Request Engineering Diagnosis &amp; BOQ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
              Fill out this quick form or call our direct helpdesk. A certified civil engineer will inspect your property with calibrated diagnostic meters.
            </p>
          </div>

          {error && (
            <div
              className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Honeypot field for bot rejection */}
          <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="hbs_hp_website">Website</label>
            <input
              id="hbs_hp_website"
              type="text"
              name="website_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          {/* ── STEP 1: SERVICE SELECTION ────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                1. Required Services / Trades *
              </label>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                <span className="text-slate-400 text-[11px]">Selected:</span>
                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200 font-bold">
                  {selectedServices.length} {selectedServices.length === 1 ? "Trade" : "Trades"}
                </span>
              </div>
            </div>

            {/* Quick-Click High-Intent Shortcut Badges */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                Popular Services (Click to Add / Remove):
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {POPULAR_SHORTCUTS.map((shortcut, idx) => {
                  const Icon = shortcut.icon;
                  const isSelected = selectedServices.some((s) =>
                    s.toLowerCase().includes(shortcut.matchKey)
                  );
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleShortcutClick(shortcut)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-red-600 text-white border-red-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{shortcut.label}</span>
                      {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currently Active Selected Tags with Quick-Remove */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 min-h-[46px]">
              {selectedServices.map((srv) => (
                <span
                  key={srv}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-red-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-red-600 shrink-0" />
                  <span className="truncate max-w-[200px]">{srv}</span>
                  {selectedServices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(srv)}
                      className="hover:bg-red-50 text-slate-400 hover:text-red-600 p-0.5 rounded-sm transition-colors"
                      aria-label={`Remove ${srv}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Expandable 19-Trade Full Catalog Drawer */}
            <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowAllServices(!showAllServices)}
                className="w-full py-2.5 px-3.5 text-xs font-bold text-slate-700 bg-slate-50/60 hover:bg-slate-100/80 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    {showAllServices
                      ? "Hide Full 19 Trades Catalog"
                      : "Browse All 19 Specialized Trades (+)"}
                  </span>
                </div>
                {showAllServices ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showAllServices && (
                <div className="p-3 space-y-2 border-t border-slate-100 bg-slate-50/30">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search trade by keyword (e.g. tile, termite, solar, paint)..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {filteredServices.map((opt) => {
                      const isSelected = selectedServices.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleService(opt)}
                          className={`text-left p-2 text-xs rounded-lg transition-all flex items-center justify-between border ${
                            isSelected
                              ? "bg-red-50 border-red-400 text-red-950 font-bold shadow-2xs"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate pr-1 text-[11px]">{opt}</span>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          ) : (
                            <span className="text-slate-300 text-xs shrink-0">+</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── STEP 2: PROPERTY TYPE & TIMELINE ─────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Property Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                2. Property Type *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "Villa / House", icon: Home },
                  { label: "Apartment", icon: Building },
                  { label: "Commercial", icon: Factory },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = propertyType.includes(item.label.split(" ")[0]);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPropertyType(item.label)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urgency Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                3. Timeline / Urgency *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "24–48 Hrs", sub: "Priority" },
                  { label: "This Week", sub: "Standard" },
                  { label: "Budgeting", sub: "Consult" },
                ].map((item, idx) => {
                  const isSelected = urgency.includes(item.label);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUrgency(`${item.label} (${item.sub})`)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-red-600 text-white border-red-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-[11px] font-bold">{item.label}</span>
                      <span className={`text-[9px] uppercase font-mono ${isSelected ? "text-red-100" : "text-slate-400"}`}>
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── STEP 3: CUSTOMER & SITE INFORMATION ──────────────────── */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              4. Contact &amp; Site Details
            </span>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="hbs_name"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="hbs_name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rakesh Agarwal"
                  autoComplete="name"
                  className="w-full bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 py-2.5 px-3.5 text-xs focus:outline-none focus:border-red-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <div>
                <label
                  htmlFor="hbs_phone"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    id="hbs_phone"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    onBlur={handlePhoneBlur}
                    placeholder="+91 98765 43210"
                    aria-describedby={phoneError ? "hbs_phone_error" : undefined}
                    className={`w-full bg-slate-50/80 border rounded-xl text-slate-900 py-2.5 px-3.5 text-xs focus:outline-none focus:border-red-600 focus:bg-white font-mono transition-all shadow-2xs ${
                      phoneError ? "border-red-400 ring-1 ring-red-400" : "border-slate-300"
                    }`}
                  />
                </div>
                {phoneError && (
                  <p id="hbs_phone_error" className="mt-1 text-[11px] text-red-600 font-medium" role="alert">
                    {phoneError}
                  </p>
                )}
              </div>
            </div>

            {/* Location & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="hbs_location"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Site Location / City in Rajasthan *
                </label>
                <div className="relative">
                  <input
                    id="hbs_location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bhopal Ganj, Bhilwara (or Jaipur, Udaipur...)"
                    className="w-full bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 py-2.5 px-3.5 pl-8 text-xs focus:outline-none focus:border-red-600 focus:bg-white transition-all shadow-2xs"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="hbs_email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="hbs_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 py-2.5 px-3.5 text-xs focus:outline-none focus:border-red-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Preferred Callback Channel */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Preferred Callback Method:
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <button
                  type="button"
                  onClick={() => setPreferredContact("Phone Call")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold border rounded-xl transition-all ${
                    preferredContact === "Phone Call"
                      ? "bg-[#0D2D5E] text-white border-[#0D2D5E] shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredContact("WhatsApp")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold border rounded-xl transition-all ${
                    preferredContact === "WhatsApp"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── STEP 4: PROBLEM DESCRIPTION ──────────────────────────── */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <label
              htmlFor="hbs_message"
              className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono"
            >
              5. Problem Description &amp; Specific Concerns *
            </label>
            <textarea
              id="hbs_message"
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Ground floor wall peeling dampness, roof slab seepage during rain, deep plaster cracks on exterior wall..."
              className="w-full bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 p-3 text-xs focus:outline-none focus:border-red-600 focus:bg-white resize-none leading-relaxed transition-all shadow-2xs"
            />
          </div>

          {/* ── STEP 5: HIGH-IMPACT CONVERSION ACTIONS ───────────────── */}
          <div className="pt-3 space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                data-hbs-cta="quote"
                className="flex-1 flex items-center justify-center gap-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 min-h-[48px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Assigning Field Engineer...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 text-white" />
                    <span>Schedule Free Site Inspection</span>
                    <ArrowRight className="w-4 h-4 text-white ml-0.5" />
                  </>
                )}
              </button>

              <a
                href={directPhotoWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-hbs-cta="whatsapp"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors min-h-[48px] shadow-2xs active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Send Photos on WhatsApp</span>
              </a>
            </div>

            {/* Microcopy & Assurance */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Inspection Fee • No Obligation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Non-Destructive Calibrated Scanners</span>
              </div>
              <div>
                Direct line:{" "}
                <a
                  href={`tel:${phoneRaw}`}
                  data-hbs-cta="call"
                  className="font-bold text-slate-800 font-mono hover:text-red-600 underline underline-offset-2"
                >
                  {phoneFormatted}
                </a>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
