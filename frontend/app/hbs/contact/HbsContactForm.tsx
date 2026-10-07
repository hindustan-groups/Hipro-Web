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
} from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";
import {
  cleanWhatsAppNumber,
  cleanTelNumber,
  getLeadSuccessWhatsAppUrl,
  getContactWhatsAppUrl,
} from "@/lib/hbsWhatsApp";

// ─── Indian phone validator ────────────────────────────────────────────────
// Accepts: 10-digit numbers starting with 6-9, with optional +91 / 0 prefix.
function validateIndianPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s\-().]/g, "").replace(/^\+91|^91|^0/, "");
  return /^[6-9]\d{9}$/.test(cleaned);
}

// ─── Fallback service list (used only when API is unavailable) ─────────────
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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContact, setPreferredContact] = useState<"Phone Call" | "WhatsApp">("Phone Call");
  const [message, setMessage] = useState("");

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

  // Honeypot field — must stay empty for real users
  const [honeypot, setHoneypot] = useState("");

  const whatsappRaw = cleanWhatsAppNumber(content?.whatsapp);
  const phoneRaw = cleanTelNumber(content?.phone);
  const phoneFormatted = content?.phone || "+91 75970 00601";

  // Service toggle handler — allow flexible multi-selection
  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      if (selectedServices.length === 1) {
        // Keep at least one service selected
        return;
      }
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

  const handlePhoneBlur = () => {
    if (phone && !validateIndianPhone(phone)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number.");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // silent bot rejection

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
          message: message.trim(),
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
    : "HB-REC";

  const leadSuccessWaUrl = getLeadSuccessWhatsAppUrl(
    content?.whatsapp,
    leadRefCode,
    selectedServices
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
      {success ? (
        <div className="py-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-10 h-10 animate-in zoom-in-75 duration-300" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300 inline-block">
                Reference: #{leadRefCode}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display pt-1">
                Request Received
              </h3>
            </div>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-slate-900">{name}</strong>. Our team will review your enquiry and contact you using your preferred method (
              <strong className="text-slate-900">{preferredContact}</strong> at{" "}
              <span className="font-mono font-bold text-slate-900">{phone}</span>).
            </p>
          </div>

          {/* Submission Summary Card */}
          <div className="p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 max-w-lg mx-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 font-mono text-[11px]">
              <span className="text-slate-500 uppercase font-bold">REFERENCE NUMBER:</span>
              <span className="font-bold text-amber-800 font-mono text-xs">#{leadRefCode}</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                Selected Services ({selectedServices.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedServices.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 p-1.5 bg-white rounded-md border border-slate-200 text-slate-800 font-semibold text-[11px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            {location && (
              <div className="flex items-center gap-2 pt-1 text-slate-600 border-t border-slate-200/60">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Site Location: <strong className="text-slate-800">{location}</strong></span>
              </div>
            )}
          </div>

          {/* Post-Submission Actions: Primary WhatsApp + Utility Call + Reset */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-lg mx-auto">
            <a
              href={leadSuccessWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-hbs-cta="whatsapp"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Hind Build</span>
            </a>

            <a
              href={`tel:${phoneRaw}`}
              data-hbs-cta="call"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg active:scale-[0.98] transition-all min-h-[44px]"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Call Now</span>
            </a>
          </div>

          <div className="text-center pt-2">
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
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-4 py-2"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {paramProject && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-amber-900 flex items-center justify-between gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Case Study Inquiry:</strong> {paramProject}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                Context Preserved
              </span>
            </div>
          )}

          <div>
            <span className="text-amber-700 font-mono text-xs font-bold uppercase tracking-wider block mb-1">
              Direct Engineering Dispatch
            </span>
            <h2 className="text-2xl font-black text-slate-900 uppercase font-display">
              Schedule Free Site Inspection
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your required trades below. Our field engineering team will coordinate an on-site evaluation with calibrated diagnostic equipment.
            </p>
          </div>

          {error && (
            <div
              className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Honeypot — hidden from real users via CSS, must remain empty */}
          <div
            className="absolute opacity-0 pointer-events-none h-0 overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor="hbs_hp_website">Website (do not fill)</label>
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

          {/* ─────────────────────────────────────────────────────────────
              1. MULTI-SERVICE SELECTION
          ───────────────────────────────────────────────────────────── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="hbs_services_selector"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                1. Select Services *
              </label>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                <span className="text-slate-500">Selected services:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  {selectedServices.length}
                </span>
              </div>
            </div>

            {/* Currently Selected Chips */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 min-h-[46px]">
              {selectedServices.map((srv) => (
                <span
                  key={srv}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 rounded-md text-white font-bold text-xs uppercase tracking-wide shadow-2xs"
                >
                  <Check className="w-3 h-3 text-white" />
                  <span>{srv}</span>
                  {selectedServices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(srv)}
                      className="hover:bg-amber-700 p-0.5 ml-0.5 rounded-xs transition-colors"
                      aria-label={`Remove ${srv}`}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Quick Multi-Select Grid */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                Click to add or remove trades:
              </span>
              <div
                id="hbs_services_selector"
                className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50"
              >
                {serviceOptions.map((opt) => {
                  const isSelected = selectedServices.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleService(opt)}
                      className={`text-left p-2 text-xs rounded-lg transition-all flex items-center justify-between border ${
                        isSelected
                          ? "bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate pr-1 text-[11px]">{opt}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <span className="text-slate-300 text-xs shrink-0">+</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              2. CONTACT DETAILS (Name, Phone, Location, Email)
          ───────────────────────────────────────────────────────────── */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              2. Customer &amp; Site Information
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
                  className="w-full bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="hbs_phone"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Contact Number *
                </label>
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
                  className={`w-full bg-slate-50/80 border rounded-lg text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600 focus:bg-white font-mono transition-all ${
                    phoneError ? "border-red-400" : "border-slate-300"
                  }`}
                />
                {phoneError && (
                  <p id="hbs_phone_error" className="mt-1 text-[11px] text-red-600" role="alert">
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
                  Property Location / City *
                </label>
                <div className="relative">
                  <input
                    id="hbs_location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Azad Nagar, Bhilwara"
                    className="w-full bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600 focus:bg-white pl-8 transition-all"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="hbs_email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Email Address (Optional)
                </label>
                <input
                  id="hbs_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rakesh@example.com"
                  autoComplete="email"
                  className="w-full bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Preferred Contact Method:
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => setPreferredContact("Phone Call")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold border rounded-lg transition-all ${
                    preferredContact === "Phone Call"
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredContact("WhatsApp")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold border rounded-lg transition-all ${
                    preferredContact === "WhatsApp"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. MESSAGE & DETAILS
          ───────────────────────────────────────────────────────────── */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label
              htmlFor="hbs_message"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              3. Problem Description &amp; Specific Concerns *
            </label>
            <textarea
              id="hbs_message"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Ground floor wall peeling, 2nd floor bathroom ceiling dampness, or pigeon netting required for 3 balconies..."
              className="w-full bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 p-3 text-xs focus:outline-none focus:border-amber-600 focus:bg-white resize-none leading-relaxed transition-all"
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. ACTIONS (Primary: Get Free Quote, Secondary: WhatsApp)
          ───────────────────────────────────────────────────────────── */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                data-hbs-cta="quote"
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-xs active:scale-[0.98] transition-all disabled:opacity-70 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Get Free Quote</span>
                )}
              </button>

              <a
                href={getContactWhatsAppUrl(content?.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                data-hbs-cta="whatsapp"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors min-h-[44px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Direct Call utility */}
            <div className="text-center text-xs text-slate-500">
              Direct hotline:{" "}
              <a
                href={`tel:${phoneRaw}`}
                data-hbs-cta="call"
                className="font-bold text-slate-800 font-mono hover:text-amber-700 underline underline-offset-2"
              >
                {phoneFormatted}
              </a>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
