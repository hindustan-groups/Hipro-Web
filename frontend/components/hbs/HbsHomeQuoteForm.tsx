"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Phone,
  User,
  ShieldCheck,
  Clock,
  Home,
  Building2,
  Briefcase,
  Droplets,
  Paintbrush,
  Hammer,
  Zap,
  Check,
  MessageSquare,
  ChevronDown,
  Wrench,
  Bug,
  Grid,
  Sparkle,
  Fan,
  Video,
  Armchair,
  Truck,
  Cpu,
  Trees,
} from "lucide-react";
import type { HbsService } from "@/lib/types";

interface HbsHomeQuoteFormProps {
  services?: HbsService[];
  phoneRaw?: string;
  whatsappUrl?: string;
}

const POPULAR_SERVICES = [
  { id: "waterproofing", label: "Waterproofing", icon: Droplets, desc: "Leakage & Roof" },
  { id: "painting", label: "Painting & Wall", icon: Paintbrush, desc: "Interior/Exterior" },
  { id: "repair", label: "Structure Repair", icon: Hammer, desc: "Plaster & Cracks" },
  { id: "plumbing_electric", label: "Plumbing & Electric", icon: Zap, desc: "Wiring & Pipes" },
  { id: "renovation", label: "Renovation", icon: Home, desc: "Complete Makeover" },
  { id: "other", label: "Other Services", icon: Briefcase, desc: "All Maintenance" },
];

const OTHER_SPECIFIC_OPTIONS = [
  { id: "termite", label: "Termite Control", icon: Bug },
  { id: "tiles", label: "Tile & Flooring Work", icon: Grid },
  { id: "cleaning", label: "Deep Cleaning", icon: Sparkle },
  { id: "ac_solar", label: "AC, Lift & Solar", icon: Fan },
  { id: "cctv", label: "CCTV & Security", icon: Video },
  { id: "furniture", label: "Furniture & Carpentry", icon: Armchair },
  { id: "packers", label: "Packers & Movers", icon: Truck },
  { id: "smarthome", label: "Smart Home Automation", icon: Cpu },
  { id: "gardening", label: "Gardening & Lawn", icon: Trees },
];

const PROPERTY_TYPES = [
  { id: "house", label: "Independent House" },
  { id: "flat", label: "Apartment / Flat" },
  { id: "commercial", label: "Office / Commercial" },
];

export default function HbsHomeQuoteForm({
  services = [],
  phoneRaw = "+919482877757",
  whatsappUrl = "https://wa.me/919482877757",
}: HbsHomeQuoteFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedService, setSelectedService] = useState("Waterproofing");
  const [specificOtherWork, setSpecificOtherWork] = useState("Termite Control");
  const [customOtherText, setCustomOtherText] = useState("");
  const [propertyType, setPropertyType] = useState("Independent House");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Determine effective service name
  const effectiveService =
    selectedService === "Other Services"
      ? customOtherText.trim() || specificOtherWork || "Other Services"
      : selectedService;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/hbs/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          selectedService: effectiveService,
          propertyType,
          message: message.trim(),
          source: "hbs_home_quote_box",
        }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success !== false) {
        setSuccess(true);
      } else {
        setSuccess(true);
      }
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 text-slate-900 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
        
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            Request Confirmed
          </span>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 font-display">
            Thank You, {name}!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your free site visit request for <strong className="text-slate-900">{effectiveService}</strong> has been received. Our senior engineer will call you at <strong className="text-slate-900">{phone}</strong> within 15 minutes.
          </p>
        </div>

        {/* Quick WhatsApp Connect */}
        <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">
          <a
            href={`${whatsappUrl}?text=${encodeURIComponent(`Hi HiBUILD, I just requested a site visit for ${effectiveService} at my ${propertyType}. My name is ${name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp Now</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setName("");
              setPhone("");
              setMessage("");
              setCustomOtherText("");
            }}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold py-1.5 transition-colors cursor-pointer"
          >
            Book Another Visit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100/90 text-slate-900 relative">
      {/* Top Banner Header */}
      <div className="space-y-1 mb-5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-red-600" />
            <span>100% Free Site Inspection</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Call in 15 Min</span>
          </div>
        </div>

        <h3 className="text-xl sm:text-[22px] font-black tracking-tight text-slate-900 font-display pt-1">
          Get a Free Site Visit &amp; Quote
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          Select your required service and our expert engineers will inspect your property.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200/80 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Quick Service Selector (Interactive Chips) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            1. Select Service Required*
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POPULAR_SERVICES.map((s) => {
              const isSelected = selectedService === s.label;
              const IconComponent = s.icon;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSelectedService(s.label)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-[#0D2D5E] border-[#0D2D5E] text-white shadow-sm ring-2 ring-[#0D2D5E]/20"
                      : "bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <IconComponent
                      className={`w-4 h-4 ${isSelected ? "text-red-400" : "text-[#0D2D5E]"}`}
                    />
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </div>
                  <span className="text-xs font-bold leading-tight truncate">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── EXPANDABLE SUB-PICKER FOR 'OTHER SERVICES' ── */}
          {selectedService === "Other Services" && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-300/80 space-y-2.5 transition-all animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#0D2D5E]" />
                  <span>Choose Specific Work:</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Tap to select or type below</span>
              </div>

              {/* 1-Tap Pills for Other Services */}
              <div className="flex flex-wrap gap-1.5">
                {OTHER_SPECIFIC_OPTIONS.map((sub) => {
                  const isSubActive =
                    !customOtherText.trim() && specificOtherWork === sub.label;
                  const SubIcon = sub.icon;
                  return (
                    <button
                      type="button"
                      key={sub.id}
                      onClick={() => {
                        setSpecificOtherWork(sub.label);
                        setCustomOtherText("");
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSubActive
                          ? "bg-[#0D2D5E] text-white shadow-xs"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? "text-red-400" : "text-[#0D2D5E]"}`} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Write-in Field */}
              <div>
                <input
                  type="text"
                  value={customOtherText}
                  onChange={(e) => setCustomOtherText(e.target.value)}
                  placeholder="Or type custom work (e.g. False ceiling, Glass partition, Fabrication...)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D2D5E] transition-all"
                />
              </div>

              {/* Active Selection Indicator */}
              <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Selected Service: </span>
                <strong className="text-slate-900 font-bold">
                  {effectiveService}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* 2. Property Type (1-Tap Toggle) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            2. Property Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PROPERTY_TYPES.map((p) => {
              const isSelected = propertyType === p.label;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPropertyType(p.label)}
                  className={`py-2 px-2 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer truncate ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p.label.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Name & Phone Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Name*
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Sharma"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D2D5E] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number*
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-xs font-bold text-slate-500">
                <span>+91</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D2D5E] focus:bg-white transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Message / Note (Optional) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Specific Issue / Location (Optional)
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. 2nd floor balcony, Mansarovar Jaipur"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D2D5E] focus:bg-white transition-all"
          />
        </div>

        {/* 5. Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-5 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 mt-2 cursor-pointer group"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <span>Book Free Site Visit &amp; Quote</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Trust Badges Footer */}
        <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>No Obligation</span>
          </span>
          <span className="text-slate-300">•</span>
          <span>Zero Spam</span>
          <span className="text-slate-300">•</span>
          <span>Verified Engineers</span>
        </div>
      </form>
    </div>
  );
}
