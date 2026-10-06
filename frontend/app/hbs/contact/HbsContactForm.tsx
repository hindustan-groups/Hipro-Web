"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";

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
  const initialSelected = useMemo(() => {
    if (paramService) {
      const match = serviceOptions.find(
        (s) =>
          s.toLowerCase().includes(paramService.toLowerCase()) ||
          paramService.toLowerCase().includes(s.toLowerCase())
      );
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

  // Status State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string>("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [serviceLimitNotice, setServiceLimitNotice] = useState(false);

  // Honeypot field — must stay empty for real users
  const [honeypot, setHoneypot] = useState("");

  const whatsappRaw = content?.whatsapp?.replace(/[^\d]/g, "") || "917597000601";
  const phoneFormatted = content?.phone || "+91 75970 00601";

  // Service toggle handler (Max 4)
  const toggleService = (srv: string) => {
    setServiceLimitNotice(false);
    if (selectedServices.includes(srv)) {
      if (selectedServices.length === 1) {
        // Keep at least one service selected
        return;
      }
      setSelectedServices(selectedServices.filter((s) => s !== srv));
    } else {
      if (selectedServices.length >= 4) {
        setServiceLimitNotice(true);
        return;
      }
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const removeService = (srv: string) => {
    if (selectedServices.length > 1) {
      setSelectedServices(selectedServices.filter((s) => s !== srv));
      setServiceLimitNotice(false);
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
          source: "hbs_contact_page",
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

  return (
    <div className="bg-white border border-slate-200 p-6 sm:p-10 shadow-xs">
      {success ? (
        <div className="py-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 animate-in zoom-in-75 duration-300" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 border border-emerald-300 inline-block">
                Inspection Scheduled · Ref #{leadRefCode}
              </span>
              <h3 className="text-2xl font-black text-slate-900 uppercase font-display pt-1">
                Site Inspection Request Confirmed!
              </h3>
            </div>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-slate-900">{name}</strong>. Our senior site supervisor will contact you via{" "}
              <strong className="text-slate-900">{preferredContact}</strong> at{" "}
              <span className="font-mono font-bold text-slate-900">{phone}</span> within 2 working hours.
            </p>
          </div>

          {/* Submission Summary Card */}
          <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 space-y-3 max-w-lg mx-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 font-mono text-[11px]">
              <span className="text-slate-500">REFERENCE NUMBER:</span>
              <span className="font-bold text-amber-800 font-mono">#{leadRefCode}</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                Selected Services ({selectedServices.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedServices.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 text-slate-800 font-semibold text-[11px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            {location && (
              <div className="flex items-center gap-2 pt-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Site Location: <strong>{location}</strong></span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
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
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors min-h-[44px]"
            >
              Submit Another Request
            </button>
            <a
              href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
                `Hello Hind Build, I have submitted an inspection request (#${leadRefCode}) for: ${selectedServices.join(", ")}. Please confirm schedule.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Confirm on WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
              className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
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
              1. MULTI-SERVICE SELECTION (Max 4)
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
                <span
                  className={`px-2 py-0.5 ${
                    selectedServices.length === 4
                      ? "bg-amber-100 text-amber-900 border border-amber-300 font-black"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {selectedServices.length}/4
                </span>
              </div>
            </div>

            {/* Currently Selected Chips */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 border border-slate-200 min-h-[46px]">
              {selectedServices.map((srv) => (
                <span
                  key={srv}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 text-white font-bold text-xs uppercase tracking-wide shadow-2xs"
                >
                  <Check className="w-3 h-3 text-white" />
                  <span>{srv}</span>
                  {selectedServices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(srv)}
                      className="hover:bg-amber-700 p-0.5 ml-0.5 rounded-none transition-colors"
                      aria-label={`Remove ${srv}`}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {serviceLimitNotice && (
              <p className="text-[11px] text-amber-800 font-mono bg-amber-50 p-2 border border-amber-200">
                Notice: Maximum 4 services can be selected simultaneously. Please deselect an existing service to add another.
              </p>
            )}

            {/* Quick Multi-Select Grid */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                Click to add or remove trades:
              </span>
              <div
                id="hbs_services_selector"
                className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-2 border border-slate-200 bg-slate-50/50"
              >
                {serviceOptions.map((opt) => {
                  const isSelected = selectedServices.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleService(opt)}
                      className={`text-left p-2 text-xs transition-colors flex items-center justify-between border ${
                        isSelected
                          ? "bg-amber-50 border-amber-500 text-amber-950 font-bold"
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
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600"
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
                  className={`w-full bg-slate-50 border text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600 font-mono ${
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
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600 pl-8"
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
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600"
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
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold border transition-colors ${
                    preferredContact === "Phone Call"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredContact("WhatsApp")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold border transition-colors ${
                    preferredContact === "WhatsApp"
                      ? "bg-emerald-600 text-white border-emerald-600"
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
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-3 text-xs focus:outline-none focus:border-amber-600 resize-none leading-relaxed"
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. SUBMIT BUTTON
          ───────────────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider py-4 shadow-xs transition-colors disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 min-h-[48px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting Inspection Request...</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 text-white" />
                <span>Book Free Site Inspection</span>
              </>
            )}
          </button>

          {/* Direct WhatsApp Callout */}
          <div className="pt-1 text-center text-xs text-slate-500 space-y-1">
            <p>
              Need immediate emergency dispatch? Call{" "}
              <a
                href={`tel:${phoneFormatted.replace(/[^\d+]/g, "")}`}
                className="font-bold text-slate-800 font-mono hover:text-amber-700"
              >
                {phoneFormatted}
              </a>
            </p>
            <p className="text-[11px] text-slate-400">
              Or chat with our engineers directly:{" "}
              <a
                href={`https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Build,%20I%20would%20like%20to%20schedule%20a%20site%20inspection.`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2"
              >
                WhatsApp Hind Build
              </a>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
