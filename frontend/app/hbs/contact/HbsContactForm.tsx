"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle, AlertCircle, Loader2, MessageSquare, Wrench,
} from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";

// ─── Indian phone validator ────────────────────────────────────────────────
// Accepts: 10-digit numbers starting with 6-9, with optional +91 / 0 prefix.
function validateIndianPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s\-().]/g, "").replace(/^\+91|^91|^0/, "");
  return /^[6-9]\d{9}$/.test(cleaned);
}

// ─── Fallback service list (used only when API is unavailable) ─────────────
// This MUST stay in sync with the DB seed but is only a safety net — the live
// page will always prefer the dynamically fetched list from /api/hbs/services.
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
  const serviceOptions: string[] =
    services.length > 0
      ? [
          ...services.map((s) =>
            s.serviceNumber ? `${s.serviceNumber}. ${s.title}` : s.title
          ),
          "Turnkey Property Maintenance",
          "Other Repair Inquiry",
        ]
      : HBS_SERVICES_FALLBACK;

  const defaultService = searchParams.get("service") || serviceOptions[0];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedService, setSelectedService] = useState(defaultService);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Honeypot field — must stay empty for real users
  const [honeypot, setHoneypot] = useState("");

  const whatsappRaw = content?.whatsapp?.replace(/[^\d]/g, "") || "917597000601";

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

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/hbs/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone.trim(),
          email,
          selectedService,
          message,
          source: "hbs_contact_page",
        }),
      });

      const json = await res.json();
      if (json.success) {
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

  return (
    <div className="bg-white border border-slate-200 p-6 sm:p-10 shadow-xs">
      {success ? (
        <div className="py-12 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto animate-in zoom-in-75 duration-300" />
          <h3 className="text-2xl font-black text-slate-900 uppercase font-display">
            Inspection Request Confirmed!
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Thank you, <strong className="text-slate-900">{name}</strong>. Your inquiry regarding{" "}
            <span className="font-semibold text-amber-700">{selectedService}</span> has been
            assigned to our senior site supervisor. We will call you at{" "}
            <span className="font-mono font-bold text-slate-900">{phone}</span> shortly.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setName("");
                setPhone("");
                setEmail("");
                setMessage("");
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Submit Another Request
            </button>
            <a
              href={`https://wa.me/${whatsappRaw}?text=Hi%20HBS%2C%20I%20just%20submitted%20an%20inspection%20request%20for%20${encodeURIComponent(selectedService)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Confirm on WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <span className="text-amber-700 font-mono text-xs font-bold uppercase tracking-wider block mb-1">
              Direct Dispatch
            </span>
            <h3 className="text-2xl font-black text-slate-900 uppercase font-display">
              Schedule Free Site Inspection
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Fill out the details below. Our field engineering team will coordinate an on-site evaluation.
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

          {/* Service Selector — hydrated from database */}
          <div>
            <label
              htmlFor="hbs_service"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Service Required *
            </label>
            <select
              id="hbs_service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-3 px-3 text-xs focus:outline-none focus:border-amber-600 font-medium"
              required
            >
              {serviceOptions.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="hbs_name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
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
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
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

          {/* Email */}
          <div>
            <label
              htmlFor="hbs_email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
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

          {/* Message / Issue Details */}
          <div>
            <label
              htmlFor="hbs_message"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Issue Location & Problem Details *
            </label>
            <textarea
              id="hbs_message"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Ground floor dampness on exterior walls, peeling paint, or pigeon netting required for 3 balconies in Azad Nagar, Bhilwara..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-3 text-xs focus:outline-none focus:border-amber-600 resize-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 shadow-xs transition-colors disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting Request...</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 text-white" />
                <span>Book Site Inspection</span>
              </>
            )}
          </button>

          {/* WhatsApp fallback */}
          <p className="text-center text-[11px] text-slate-400">
            Or send your details directly:{" "}
            <a
              href={`https://wa.me/${whatsappRaw}?text=Hi%20HBS%2C%20I%20need%20a%20${encodeURIComponent(selectedService)}%20inspection.`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2"
            >
              WhatsApp Us
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
