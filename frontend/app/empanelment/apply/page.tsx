"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  Phone,
  CreditCard,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  AlertCircle,
  Sparkles,
  Lock,
  Camera,
} from "lucide-react";
import {
  EmpanelmentContent,
  EmpanelmentCategory,
  DEFAULT_EMPANELMENT_CONTENT,
  parseJsonField,
} from "@/lib/empanelmentContent";

export default function EmpanelmentRegistrationWizard() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);

  useEffect(() => {
    async function loadCms() {
      try {
        const res = await fetch("/api/empanelment/content", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content) {
            setContent({ ...DEFAULT_EMPANELMENT_CONTENT, ...json.content });
          }
        }
      } catch (_e) {}
    }
    loadCms();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Enterprise Profile
    companyName: "",
    tradeName: "",
    category: "Civil Construction",
    gstin: "",
    pan: "",
    state: "Rajasthan",
    entityType: "Proprietorship (Individual)",

    // Step 2: Contact & Location
    contactName: "",
    phone: "",
    email: "",
    address: "",
    city: "Jaipur",
    pincode: "",

    // Step 3: Banking & Financials
    bankName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    yearsInBusiness: 5,
    annualTurnover: "₹50 Lakh – ₹1 Crore",
    workforceCount: 20,

    // Step 4: Documents (Base64 compressed or links)
    gstDocUrl: "",
    panDocUrl: "",
    chequeDocUrl: "",
    msmeDocUrl: "",
    pastWorkDocUrl: "",

    // Step 5: Declaration
    termsAgreed: false,
  });

  // GST Auto-Verification Status
  const [gstLoading, setGstLoading] = useState(false);
  const [gstFeedback, setGstFeedback] = useState<string | null>(null);

  const handleVerifyGst = async () => {
    const rawGst = (formData.gstin || "").trim().toUpperCase();
    if (!rawGst || rawGst.length !== 15) {
      setGstFeedback("Please enter a valid 15-digit GSTIN number.");
      return;
    }

    setGstLoading(true);
    setGstFeedback(null);

    try {
      const res = await fetch("/api/empanelment/gst-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gstin: rawGst }),
      });
      const json = await res.json();

      if (json.valid) {
        setFormData((prev) => ({
          ...prev,
          gstin: json.gstin,
          pan: json.pan,
          state: json.state,
          entityType: json.entityType,
        }));
        setGstFeedback(`✓ Valid GSTIN: ${json.state} • ${json.entityType}`);
      } else {
        setGstFeedback(json.error || "Invalid GSTIN format.");
      }
    } catch (err) {
      setGstFeedback("Could not verify GSTIN right now.");
    } finally {
      setGstLoading(false);
    }
  };

  // Client-side HTML5 Canvas Photo Compression (Shrinks 12MB photos to ~250KB)
  const handleFileUpload = (field: string, file: File) => {
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
            setFormData((prev) => ({ ...prev, [field]: compressedBase64 }));
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or text file
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.termsAgreed) {
      setError("Please agree to the code of conduct declaration.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/empanelment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit application");
      }

      setSuccessData(json);
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (!successData?.trackingId) return;
    navigator.clipboard.writeText(successData.trackingId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            APPLICATION SUBMITTED SUCCESSFULLY
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">
            Empanelment Dossier Received!
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            आपका वेंडर पंजीकरण फॉर्म सफलतापूर्वक प्राप्त हो गया है। कृपया अपना यूनिक ट्रैकिंग आईडी नोट कर लें।
          </p>
        </div>

        {/* Tracking ID Badge */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
            OFFICIAL EMPANELMENT TRACKING ID
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl md:text-3xl font-mono font-black tracking-wider text-white">
              {successData.trackingId}
            </span>
            <button
              onClick={handleCopyId}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Copy Tracking ID"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            A confirmation SMS & Email has been dispatched to {formData.phone}
          </p>
        </div>

        {/* Next Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-4 w-full">
          <Link
            href={`/empanelment/track?id=${successData.trackingId}`}
            className="px-6 py-3.5 rounded-2xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Track Application & Download ID Card</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/empanelment"
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all text-center"
          >
            Back to Portal Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
          5-STEP CONTRACTOR ONBOARDING WIZARD
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">
          Vendor & Contractor Registration (पंजीकरण)
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Fill your business details below. Form auto-saves and validates GSTIN instantly.
        </p>
      </div>

      {/* Stepper Bar (Responsive: Progress bar on mobile, 5 pills on tablet/desktop) */}
      <div className="space-y-2">
        {/* Compact Mobile Banner with Percentage Bar */}
        <div className="sm:hidden bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#dc2626] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                {step}
              </span>
              <span className="truncate">
                {step === 1 && "Step 1 of 5: Enterprise Profile"}
                {step === 2 && "Step 2 of 5: Contact & Office Address"}
                {step === 3 && "Step 3 of 5: Banking & Capacity"}
                {step === 4 && "Step 4 of 5: KYC Documents"}
                {step === 5 && "Step 5 of 5: Review & Declaration"}
              </span>
            </span>
            <span className="font-mono text-slate-500 text-[11px] shrink-0">{step * 20}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#dc2626] h-full rounded-full transition-all duration-300"
              style={{ width: `${step * 20}%` }}
            />
          </div>
        </div>

        {/* Desktop & Tablet 5-Step Grid */}
        <div className="hidden sm:grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { id: 1, label: "Profile", icon: Building2 },
            { id: 2, label: "Contact", icon: Phone },
            { id: 3, label: "Banking", icon: CreditCard },
            { id: 4, label: "KYC Docs", icon: FileText },
            { id: 5, label: "Review", icon: ShieldCheck },
          ].map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div
                key={s.id}
                onClick={() => done && setStep(s.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  active
                    ? "bg-[#dc2626] text-white border-[#dc2626] shadow-sm font-bold"
                    : done
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 cursor-pointer font-semibold"
                    : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 md:p-8 shadow-sm space-y-6 text-xs">
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Enterprise Profile & GST */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 1: Enterprise Profile & GSTIN</h2>
              <p className="text-slate-500 text-[11px]">कंपनी या फर्म का नाम एवं जीएसटी विवरण</p>
            </div>

            {/* GSTIN 1-Click Verification */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                15-Digit GSTIN (Optional if unregistered local vendor)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  maxLength={15}
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 08AAAAA0000A1Z5"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-mono uppercase font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm sm:text-xs"
                />
                <button
                  type="button"
                  onClick={handleVerifyGst}
                  disabled={gstLoading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shrink-0 transition-colors w-full sm:w-auto"
                >
                  {gstLoading ? "Decoding..." : "Verify GST"}
                </button>
              </div>

              {gstFeedback && (
                <p className={`text-[11px] font-semibold ${gstFeedback.startsWith("✓") ? "text-emerald-700" : "text-red-700"}`}>
                  {gstFeedback}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Legal Company / Enterprise Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Sharma Civil Constructions Pvt Ltd / Sharma Contractors"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  PAN Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Trade Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                >
                  {(() => {
                    const cats: EmpanelmentCategory[] = parseJsonField(
                      content.categoriesList,
                      parseJsonField(DEFAULT_EMPANELMENT_CONTENT.categoriesList, [])
                    );
                    if (cats.length > 0) {
                      return cats.map((cat) => (
                        <option key={cat.id || cat.title} value={cat.title}>
                          {cat.title}
                        </option>
                      ));
                    }
                    return (
                      <>
                        <option value="Civil Construction">Civil Construction (आरसीसी एवं चिनाई)</option>
                        <option value="Electrical & MEP">Electrical & MEP (विद्युत एवं सबस्टेशन)</option>
                        <option value="Plumbing & Sanitation">Plumbing & Sanitation (प्लंबिंग कार्य)</option>
                        <option value="Fabrication & PEB">Fabrication & PEB (फेब्रिकेशन एवं स्टील)</option>
                        <option value="Flooring & Finishing">Flooring & Finishing (फ्लोरिंग एवं फिनिशिंग)</option>
                        <option value="Material Supply">Material Supply (निर्माण सामग्री सप्लायर)</option>
                      </>
                    );
                  })()}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Entity Legal Form
                </label>
                <input
                  type="text"
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  State / Jurisdiction
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Key Personnel & Contact Coordinates */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 2: Contact Coordinates & Office Address</h2>
              <p className="text-slate-500 text-[11px]">प्रमुख व्यक्ति एवं कार्यलय का पता</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Proprietor / Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9829012345"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. sharma.civil@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Office / Workshop Address *
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot / Ward No, Industrial Area / Street, Jaipur"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 302020"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Banking & Capacity */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 3: Direct RTGS Banking & Capacity</h2>
              <p className="text-slate-500 text-[11px]">भुगतान के लिए बैंक खाता एवं वार्षिक टर्नओवर</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g. State Bank of India / HDFC"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="e.g. 38192004812"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                  placeholder="e.g. SBIN0001234"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 uppercase focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Years in Business
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsInBusiness}
                  onChange={(e) => setFormData({ ...formData, yearsInBusiness: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Annual Turnover Bracket
                </label>
                <select
                  value={formData.annualTurnover}
                  onChange={(e) => setFormData({ ...formData, annualTurnover: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Above ₹2 Crore">Above ₹2 Crore (&gt; ₹2 Cr)</option>
                  <option value="₹50 Lakh – ₹2 Crore">₹50 Lakh – ₹2 Crore</option>
                  <option value="₹10 Lakh – ₹50 Lakh">₹10 Lakh – ₹50 Lakh</option>
                  <option value="Under ₹10 Lakh">Under ₹10 Lakh (&lt; ₹10L)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Direct Skilled Workforce
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.workforceCount}
                  onChange={(e) => setFormData({ ...formData, workforceCount: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: KYC Document Upload with Smart Canvas Compression */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 4: KYC Documents Upload</h2>
              <p className="text-slate-500 text-[11px]">
                दस्तावेज़ की फोटो या पीडीएफ अपलोड करें (फ़ोन से ली गई फोटो स्वतः कंप्रेस हो जाएगी)
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: "GST Certificate (जीएसटी प्रमाण पत्र)", key: "gstDocUrl", required: true },
                { label: "PAN Card Document (पैन कार्ड)", key: "panDocUrl", required: true },
                { label: "Cancelled Cheque / Passbook (कैंसिल्ड चेक)", key: "chequeDocUrl", required: true },
                { label: "MSME / Udyam Certificate (एमएसएमई / उद्यम)", key: "msmeDocUrl", required: false },
                { label: "Past Projects / Experience Proof (कार्य अनुभव)", key: "pastWorkDocUrl", required: false },
              ].map((doc) => {
                const isUploaded = !!(formData as any)[doc.key];

                return (
                  <div
                    key={doc.key}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                      isUploaded
                        ? "bg-emerald-50/50 border-emerald-300"
                        : "bg-slate-50/70 border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${isUploaded ? "text-emerald-600" : "text-slate-400"}`} />
                        <span className="font-bold text-slate-900 text-xs">{doc.label}</span>
                        {doc.required && <span className="text-red-500">*</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isUploaded ? "✓ Document attached & verified" : "Click to select camera photo or PDF"}
                      </p>
                    </div>

                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 text-xs shadow-2xs flex items-center gap-1.5 shrink-0 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isUploaded ? "Change File" : "Choose File"}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.key, file);
                        }}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Digital Declaration */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 5: Review & Digital Declaration</h2>
              <p className="text-slate-500 text-[11px]">अंतिम जांच एवं घोषणा पत्र</p>
            </div>

            {/* Summary Grid */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Enterprise:</span>
                <span className="font-bold text-slate-900">{formData.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Key Person:</span>
                <span className="font-bold text-slate-900">{formData.contactName} ({formData.phone})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Trade Category:</span>
                <span className="font-bold text-slate-900">{formData.category}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">GSTIN / PAN:</span>
                <span className="font-mono font-bold text-slate-900">{formData.gstin || "N/A"} / {formData.pan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Account:</span>
                <span className="font-mono font-bold text-slate-900">{formData.bankName} • {formData.bankAccountNumber}</span>
              </div>
            </div>

            {/* Declaration Checkbox */}
            <label className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.termsAgreed}
                onChange={(e) => setFormData({ ...formData, termsAgreed: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded text-[#dc2626] border-slate-300 focus:ring-red-500"
              />
              <span className="text-[11px] text-slate-700 leading-relaxed font-medium">
                I hereby declare that all information, GST credentials, and banking proofs provided are true and accurate. I agree to abide by the safety, quality, and anti-corruption policies of Hindustan Projects.
                (मैं घोषणा करता/करती हूँ कि दी गई सभी जानकारियां एवं दस्तावेज़ सत्य हैं।)
              </span>
            </label>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && (!formData.companyName || !formData.pan)) {
                  setError("Please enter Company Name and PAN number.");
                  return;
                }
                if (step === 2 && (!formData.contactName || !formData.phone || !formData.email)) {
                  setError("Please enter Contact Person Name, Phone, and Email.");
                  return;
                }
                setError("");
                setStep(step + 1);
              }}
              className="px-6 py-2.5 min-h-[44px] rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all ml-auto"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all ml-auto"
            >
              {submitting ? "Submitting Application..." : "Submit Registration (जमा करें)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
