"use client";

import { useState } from "react";
import { X, FileText, Send, Phone, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { CalculationResult, EstimatorState } from "./types";
import { formatIndianCurrency, formatIndianNumber } from "./calculateEstimate";
import { generateAndPrintBOQ } from "./boqPdfGenerator";
import { trackEvent } from "@/lib/analytics";
import { COMPANY_INFO } from "@/lib/companyData";

interface EstimatorLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  actionType: "pdf" | "whatsapp" | "consultation" | "limit_reached";
  state: EstimatorState;
  result: CalculationResult;
  whatsappNumber?: string;
  limitTitle?: string;
  limitSubtitle?: string;
}

export default function EstimatorLeadModal({
  isOpen,
  onClose,
  onSuccess,
  actionType,
  state,
  result,
  whatsappNumber,
  limitTitle,
  limitSubtitle,
}: EstimatorLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(state.city);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setLoading(true);

    const cleanPhone = phone.replace(/\D/g, "");
    const email = `lead-${cleanPhone}@hindustanprojects.in`;
    const budgetStr = `${formatIndianCurrency(result.totalCost)} (${state.tier} Package)`;
    const description = `Interactive Estimator Lead:
Action: ${actionType.toUpperCase()}
Plot: ${state.plotArea} sqft (${Math.round(state.plotArea / 9)} Gaj)
Floors: ${state.floors} | Basement: ${state.basement}
Parking: ${state.parkingCars} Cars | Balconies: ${state.balconies}
Location: ${location || state.city}, Rajasthan
Package: ${state.tier} (@ ₹${result.baseRatePerSqft}/sqft)
Total Built-up: ${result.builtUpArea} sqft
Total Estimated Budget: ${formatIndianCurrency(result.totalCost)}
Effective Unit Rate: ₹${result.effectiveRatePerSqft}/sqft
Addons: ${Object.entries(state.addons).filter(([, v]) => v).map(([k]) => k).join(", ") || "None"}
Materials BOM: Cement ${result.materials.cementBags} bags, Steel ${result.materials.steelTonnes} MT, Bricks ${result.materials.bricksCount} units.`;

    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Cost Estimator User",
          email,
          phone: cleanPhone,
          location: `${location || state.city}, Rajasthan`,
          projectType: `Cost Estimator - ${state.tier}`,
          budget: budgetStr,
          description,
          timeline: result.timelineMonths,
        }),
      });

      // Track lead generation
      trackEvent("generate_lead", {
        form_id: `estimator_${actionType}`,
        package: state.tier,
        budget: result.totalCost,
      });

      // Save cookie and localStorage
      document.cookie = "cost_estimator_unlocked=true; path=/; max-age=604800"; // 7 days
      localStorage.setItem("user_phone", cleanPhone);
      localStorage.setItem("user_name", name);

      if (onSuccess) {
        onSuccess();
      }

      setSubmitted(true);

      // Perform requested action
      if (actionType === "pdf") {
        setTimeout(() => {
          generateAndPrintBOQ(state, result, { name, phone: cleanPhone, location });
          onClose();
        }, 600);
      } else if (actionType === "whatsapp") {
        const text = encodeURIComponent(
          `Hello Hindustan Projects team, I just calculated my house construction estimate on your website:\n\n` +
          `• Plot Area: ${formatIndianNumber(state.plotArea)} sqft (${Math.round(state.plotArea / 9)} Gaj)\n` +
          `• Floors: ${state.floors.toUpperCase()}\n` +
          `• City: ${location || state.city}\n` +
          `• Package: ${state.tier} Package\n` +
          `• Built-up Area: ${formatIndianNumber(result.builtUpArea)} sqft\n` +
          `• Estimated Budget: ${formatIndianCurrency(result.totalCost)}\n\n` +
          `My Name: ${name || "Client"}\n` +
          `Phone: ${cleanPhone}\n\n` +
          `Could you please share the detailed brand-wise BOQ and schedule a free site consultation?`
        );
        const targetWhatsapp = whatsappNumber || COMPANY_INFO.whatsappNumber || "7597000601";
        window.open(`https://wa.me/91${targetWhatsapp}?text=${text}`, "_blank");
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (actionType === "limit_reached") {
        setTimeout(() => {
          onClose();
        }, 400);
      }
    } catch (err) {
      setError("Network error. Please try again or WhatsApp us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-none shadow-2xl overflow-hidden border border-slate-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-black transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted && actionType === "consultation" ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
              Consultation Requested!
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Thank you, <strong>{name}</strong>. Our senior civil estimating engineer in <strong>{location || state.city}</strong> will contact you at <strong>{phone}</strong> within 2 business hours with verified site guidance and zero cost overrun commitments.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-[#0F2C59] text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 text-center">
              <div className="w-12 h-12 bg-red-50 text-[#D9232A] rounded-full flex items-center justify-center mx-auto mb-3 border border-red-100 shadow-xs">
                {actionType === "pdf" ? (
                  <FileText className="w-6 h-6" />
                ) : actionType === "whatsapp" ? (
                  <Send className="w-6 h-6" />
                ) : actionType === "limit_reached" ? (
                  <Sparkles className="w-6 h-6" />
                ) : (
                  <Phone className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-xl font-bold font-display uppercase tracking-tight text-slate-900">
                {actionType === "pdf"
                  ? "Download Itemized Engineering BOQ"
                  : actionType === "whatsapp"
                  ? "Get Estimate on WhatsApp"
                  : actionType === "limit_reached"
                  ? limitTitle || "Unlock Unlimited Calculations"
                  : "Book Free Architectural Site Feasibility"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {actionType === "pdf"
                  ? "Receive a complete civil engineering BOQ report with material quantities, brand specifications, and milestone schedule."
                  : actionType === "whatsapp"
                  ? "We'll send your exact project estimate, floor breakdown and package specifications directly to your WhatsApp."
                  : actionType === "limit_reached"
                  ? limitSubtitle || "You've viewed your free calculations. Enter your WhatsApp number to unlock unlimited estimates, live materials BOM, and full BOQ access."
                  : "Our chief civil engineer will conduct a free site assessment and Vastu feasibility review for your plot."}
              </p>

              {/* Estimate preview chip */}
              <div className="mt-4 inline-flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 shadow-2xs text-xs">
                <span className="text-slate-500">Current Estimate:</span>
                <strong className="text-[#D9232A] font-black">{formatIndianCurrency(result.totalCost)}</strong>
                <span className="text-slate-400">|</span>
                <span className="text-slate-700 font-semibold">{state.tier} ({result.builtUpArea} sqft)</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  aria-label="Your Full Name"
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-[#D9232A] focus:ring-1 focus:ring-[#D9232A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  WhatsApp Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3.5 border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-sm font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    aria-label="WhatsApp Mobile Number"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-[#D9232A] focus:ring-1 focus:ring-[#D9232A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Plot Location / City
                </label>
                <input
                  type="text"
                  aria-label="Plot Location or City"
                  placeholder="e.g. Bhopal Ganj, Bhilwara"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-[#D9232A] focus:ring-1 focus:ring-[#D9232A]"
                />
              </div>

              {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 bg-[#D9232A] hover:bg-red-700 text-white font-bold uppercase tracking-wider text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : actionType === "pdf" ? (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Download Official BOQ PDF</span>
                  </>
                ) : actionType === "whatsapp" ? (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Open WhatsApp Breakdown</span>
                  </>
                ) : actionType === "limit_reached" ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Unlock Unlimited Calculations</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Free Site Consultation</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[10px] text-slate-400">
                🔒 100% Privacy Protected · Zero Spam Guarantee · Fixed-Price Commitment
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
