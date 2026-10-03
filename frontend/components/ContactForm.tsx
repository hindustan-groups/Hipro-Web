"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { cleanServiceTitle } from "@/lib/companyData";

interface ContactFormProps {
  services?: { title: string }[];
  customCategories?: string[];
  buttonText?: string;
  responseNote?: string;
}

function ContactFormInner({
  services = [],
  customCategories = [],
  buttonText = "Submit Project Inquiry",
  responseNote = "Our senior project engineers will respond within 24 business hours.",
}: ContactFormProps) {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", service: "", message: "",
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [customService, setCustomService] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill from query params (e.g. from service or project detail pages)
  useEffect(() => {
    if (!searchParams) return;
    const serviceParam = searchParams.get("service");
    const projectParam = searchParams.get("project");

    if (serviceParam) {
      setFormData((prev) => ({
        ...prev,
        service: cleanServiceTitle(serviceParam),
      }));
    }

    if (projectParam) {
      setFormData((prev) => ({
        ...prev,
        message: prev.message || `I am inquiring regarding the "${projectParam}" execution specifications. Please provide a technical review and cost estimate.`,
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setError("Please check the permission box to agree to our Privacy Policy & Terms of Service.");
      return;
    }
    setLoading(true);
    setError("");

    const finalService =
      formData.service === "Other / Custom Requirement" && customService.trim()
        ? `Other: ${customService.trim()}`
        : formData.service;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, service: finalService }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        trackEvent("generate_lead", {
          form_id: "contact_page",
          service_category: finalService || undefined,
        });
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: "", email: "", phone: "", service: "", message: "" });
          setCustomService("");
        }, 5000);
      } else {
        setError(data.error || "Failed to submit message");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Compute normalized service category options
  const baseCategoryOptions =
    customCategories && customCategories.length > 0
      ? customCategories.map((c) => c.trim()).filter(Boolean)
      : services && services.length > 0
      ? Array.from(
          new Set(
            services
              .map((s) => cleanServiceTitle(s?.title || ""))
              .filter(Boolean)
          )
        )
      : [
          "Architecture & Planning",
          "Professional Construction Services",
          "Surveying & Site Measurements",
          "Interior & Exterior Design",
          "Water Treatment Plant Construction",
          "Project Management & Consultancy",
          "Structural Engineering & Analysis",
          "Construction Cost Estimation & BOQ",
        ];

  const categoryOptions = [
    ...baseCategoryOptions.filter((opt) => !/^other/i.test(opt)),
    "Other / Custom Requirement",
  ];

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 rounded-none bg-red-50 border border-red-100 text-construction-red flex items-center justify-center shadow-md">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xl font-bold text-black font-display uppercase tracking-tight">Message Received!</p>
        <p className="text-sm text-slate-500 font-light">{responseNote}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name *</label>
          <input
            id="contact-name"
            type="text" name="name" value={formData.name} onChange={handleChange} required
            disabled={loading}
            placeholder="John Doe"
            className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red disabled:opacity-60 transition-all"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address *</label>
          <input
            id="contact-email"
            type="email" name="email" value={formData.email} onChange={handleChange} required
            disabled={loading}
            placeholder="john@company.com"
            className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red disabled:opacity-60 transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
          <input
            id="contact-phone"
            type="tel" name="phone" value={formData.phone} onChange={handleChange}
            disabled={loading}
            placeholder="+91 75970 00601"
            className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red disabled:opacity-60 transition-all"
          />
        </div>
        <div>
          <label htmlFor="contact-service" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Service Category</label>
          <select
            id="contact-service"
            aria-label="Service Category"
            name="service" value={formData.service} onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red disabled:opacity-60 transition-all"
          >
            <option value="">Select a service category</option>
            {categoryOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {formData.service === "Other / Custom Requirement" && (
            <div className="mt-2.5">
              <input
                id="contact-custom-service"
                type="text"
                aria-label="Specific custom service or work required"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                disabled={loading}
                placeholder="Specify your required service / work..."
                className="w-full px-3.5 py-2.5 rounded-none border border-slate-300 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-construction-red focus:border-construction-red focus:bg-white disabled:opacity-60 transition-all font-sans"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Project Details *</label>
        <textarea
          id="contact-message"
          aria-label="Project Details"
          name="message" value={formData.message} onChange={handleChange} required rows={4}
          disabled={loading}
          placeholder="Specify project scope, location, timeline, and estimated plot area..."
          className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red disabled:opacity-60 transition-all resize-none"
        />
      </div>

      {/* User Permission & Privacy Consent Checkbox */}
      <div className="p-3 bg-slate-50 border border-slate-200">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            id="contact-consent-checkbox"
            type="checkbox"
            required
            disabled={loading}
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded-none border-slate-300 text-construction-red focus:ring-construction-red/30 cursor-pointer accent-red-600 shrink-0"
          />
          <span className="text-xs text-slate-600 leading-relaxed font-light">
            I give my explicit consent to <strong className="text-slate-900 font-semibold">Hindustan Projects (HiPRO)</strong> to contact me via Call, WhatsApp, or Email regarding this inquiry, and I agree to the{" "}
            <Link href="/privacy-policy" target="_blank" className="font-semibold text-construction-red hover:underline">
              Privacy Policy
            </Link>
            ,{" "}
            <Link href="/cookie-policy" target="_blank" className="font-semibold text-construction-red hover:underline">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" target="_blank" className="font-semibold text-construction-red hover:underline">
              Terms of Service
            </Link>
            . <span className="text-construction-red font-bold">*</span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-construction-red hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-none text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all cursor-pointer"
      >
        {loading ? "Sending Message..." : buttonText}
      </button>
    </form>
  );
}

export default function ContactForm(props: ContactFormProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Loading form...</div>}>
      <ContactFormInner {...props} />
    </Suspense>
  );
}
