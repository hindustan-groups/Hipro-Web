"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  ShieldCheck,
  User,
  Briefcase,
  Upload,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  Edit3,
  Trash2,
  Users,
  Clock,
  Layers,
  CreditCard,
  MapPin,
  Lock,
} from "lucide-react";

const FALLBACK_CATEGORIES = [
  { id: "civil", name: "Civil Construction", label: "Civil Construction (आरसीसी एवं चिनाई)" },
  { id: "mep", name: "Electrical & MEP", label: "Electrical & MEP (विद्युत एवं सबस्टेशन)" },
  { id: "plumbing", name: "Plumbing & Sanitation", label: "Plumbing & Sanitation (प्लंबिंग कार्य)" },
  { id: "fabrication", name: "Fabrication & PEB", label: "Fabrication & PEB (फैब्रिकेशन एवं स्टील)" },
  { id: "finishing", name: "Flooring & Finishing", label: "Flooring & Finishing (फ्लोरिंग एवं फिनिशिंग)" },
  { id: "material", name: "Material Supply", label: "Material Supply (निर्माण सामग्री)" },
];

const EXPERIENCE_OPTIONS = [
  "Less than 1 Year",
  "1–3 Years",
  "3–5 Years",
  "5–10 Years",
  "10+ Years",
];

const TEAM_SIZE_OPTIONS = [
  { value: "1-5", label: "1–5 Workers" },
  { value: "6-15", label: "6–15 Workers" },
  { value: "16-50", label: "16–50 Workers" },
  { value: "50+", label: "50+ Workers" },
];

const PROJECT_SCALE_OPTIONS = [
  {
    value: "Day to Day",
    label: "Day to Day",
    desc: "Daily maintenance, repairs & quick site jobs",
  },
  {
    value: "Small",
    label: "Small",
    desc: "Small residential / commercial work packages",
  },
  {
    value: "Medium",
    label: "Medium",
    desc: "Mid-scale building & infrastructure contracts",
  },
  {
    value: "Large",
    label: "Large",
    desc: "Full-scale EPC / multi-crore project execution",
  },
];

const INDIAN_STATES = [
  "Rajasthan",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Uttar Pradesh",
  "Uttarakhand",
  "Other",
];

const VENDOR_TYPE_OPTIONS = [
  { value: "INDIVIDUAL_WORKER", label: "Individual / Only Worker (मैं अकेला वर्कर/कारीगर हूँ)" },
  { value: "RUN_SMALL_TEAM", label: "Contractor with Team (मैं टीम के साथ काम करता हूँ)" },
  { value: "OWN_BUSINESS", label: "I Own a Business / Firm (मेरा खुद का बिजनेस/फर्म है)" },
];

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PIN_REGEX = /^\d{6}$/;

async function compressFileToDataUrl(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read PDF file."));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(ev.target?.result || ""));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = () => reject(new Error("Invalid image file."));
      img.src = String(ev.target?.result || "");
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function VendorRegistrationWizardPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Categories from backend
  const [categories, setCategories] = useState<Array<{ id: string; name: string; label?: string }>>(
    FALLBACK_CATEGORIES
  );

  // Tab 1: Mobile & OTP State
  const [phone, setPhone] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [demoOtpHint, setDemoOtpHint] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Tab 2: Vendor Contact Details
  const [entityType, setEntityType] = useState("INDIVIDUAL_WORKER");
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("Rajasthan");

  // Tab 3: Work Details
  const [category, setCategory] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [projectScale, setProjectScale] = useState<string[]>([]);

  // Tab 4: Upload Documents
  const [aadharFrontUrl, setAadharFrontUrl] = useState("");
  const [aadharBackUrl, setAadharBackUrl] = useState("");
  const [hasPan, setHasPan] = useState(true);
  const [pan, setPan] = useState("");
  const [panCardUrl, setPanCardUrl] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Step 5: User Consent
  const [termsAgreed, setTermsAgreed] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/empanelment/categories", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.categories) && json.categories.length > 0) {
            setCategories(
              json.categories.map((c: any) => ({
                id: c.id || c.slug || c.name,
                name: c.name,
                label: c.name,
              }))
            );
          }
        }
      } catch (_e) {}
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    setError("");
    const cleanPhone = phone.replace(/\D/g, "");
    if (!PHONE_REGEX.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/empanelment/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to send OTP.");
      }
      setPhone(cleanPhone);
      setOtpSent(true);
      setOtpVerified(false);
      setOtpToken("");
      setResendCooldown(json.cooldownSeconds || 30);
      setDemoOtpHint(json.demoOtp || "");
    } catch (err: any) {
      setError(err.message || "Could not send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!/^\d{6}$/.test(otpInput.trim())) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/empanelment/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpInput.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Invalid OTP.");
      }
      setOtpVerified(true);
      setOtpToken(json.otpToken || "");
      setDemoOtpHint("");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "aadharFront" | "aadharBack" | "panCard"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("File size must be under 8 MB.");
      return;
    }
    setError("");
    setUploadingField(field);
    try {
      const dataUrl = await compressFileToDataUrl(file);
      if (field === "aadharFront") setAadharFrontUrl(dataUrl);
      if (field === "aadharBack") setAadharBackUrl(dataUrl);
      if (field === "panCard") setPanCardUrl(dataUrl);
    } catch (err: any) {
      setError(err.message || "Failed to process document.");
    } finally {
      setUploadingField(null);
    }
  };

  const toggleProjectScale = (val: string) => {
    setProjectScale((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const validateAndNext = (currentStep: number) => {
    setError("");
    if (currentStep === 1) {
      if (!otpVerified) {
        setError("Please verify your mobile number with OTP first.");
        return;
      }
      setStep(2);
      return;
    }
    if (currentStep === 2) {
      if (!contactName.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (entityType === "OWN_BUSINESS" && !companyName.trim()) {
        setError("Please enter your Business / Firm name.");
        return;
      }
      if (!address.trim()) {
        setError("Please enter your complete address.");
        return;
      }
      if (!PIN_REGEX.test(pincode.trim())) {
        setError("Please enter a valid 6-digit PIN code.");
        return;
      }
      if (!district.trim()) {
        setError("Please enter your District / City.");
        return;
      }
      if (!stateName.trim()) {
        setError("Please select your State.");
        return;
      }
      setStep(3);
      return;
    }
    if (currentStep === 3) {
      if (!category) {
        setError("Please select what work/service you do (Category).");
        return;
      }
      if (!experienceYears) {
        setError("Please select how long you have been doing this work.");
        return;
      }
      if (!teamSize) {
        setError("Please select your team size.");
        return;
      }
      if (projectScale.length === 0) {
        setError("Please select at least one project/service type you can handle.");
        return;
      }
      setStep(4);
      return;
    }
    if (currentStep === 4) {
      if (!aadharFrontUrl || !aadharBackUrl) {
        setError("Please upload both Front and Back sides of your Aadhaar Card.");
        return;
      }
      if (hasPan) {
        const cleanPan = pan.trim().toUpperCase();
        if (!PAN_REGEX.test(cleanPan)) {
          setError("Please enter a valid 10-character PAN number (e.g. ABCDE1234F), or uncheck PAN if you don't have one.");
          return;
        }
        if (!panCardUrl) {
          setError("Please upload your PAN Card photo or PDF, or check 'I don't have a PAN Card'.");
          return;
        }
      }
      setStep(5);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!termsAgreed) {
      setError("Please accept the user consent & declaration before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/empanelment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otpToken,
          entityType,
          contactName: contactName.trim(),
          companyName:
            entityType === "INDIVIDUAL_WORKER"
              ? contactName.trim()
              : companyName.trim() || contactName.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          pincode: pincode.trim(),
          district: district.trim(),
          city: district.trim(),
          state: stateName.trim(),
          category,
          experienceYears,
          teamSize,
          projectScale,
          aadharFrontUrl,
          aadharBackUrl,
          hasPan,
          pan: hasPan ? pan.trim().toUpperCase() : "NOT_PROVIDED",
          panCardUrl: hasPan ? panCardUrl : undefined,
          termsAgreed: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit registration.");
      }
      if (json.token) {
        try {
          localStorage.setItem("vendor_token", json.token);
          localStorage.setItem("hipro_vendor_token", json.token);
        } catch (_e) {}
      }
      setSuccessData(json.application || { trackingId: json.trackingId });
    } catch (err: any) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTrackingId = () => {
    if (!successData?.trackingId) return;
    navigator.clipboard?.writeText(successData.trackingId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const tabs = [
    { num: 1, label: "Mobile OTP", icon: Phone },
    { num: 2, label: "Contact", icon: User },
    { num: 3, label: "Work Details", icon: Briefcase },
    { num: 4, label: "Documents", icon: Upload },
    { num: 5, label: "Preview", icon: FileCheck2 },
  ];

  // Success Screen
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
              Registration Submitted
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Thank You, {contactName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your vendor registration has been received by Hindustan Projects. Save your Tracking ID below to check verification status anytime.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-md mx-auto">
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Application Tracking ID
              </div>
              <div className="text-lg sm:text-xl font-mono font-black text-slate-950">
                {successData.trackingId}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyTrackingId}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? "Copied" : "Copy ID"}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/empanelment/portal"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Go to Vendor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/empanelment/track?id=${encodeURIComponent(successData.trackingId)}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Track Status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-10 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-[#dc2626] border border-red-200 text-[10px] font-mono font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3" />
          <span>Vendor Registration</span>
        </span>
        <h1 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">
          Partner with Hindustan Projects
        </h1>
      </div>

      {/* Responsive 5-Tab Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-3 shadow-xs overflow-x-auto">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 min-w-[320px]">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = step === t.num;
            const isDone = step > t.num;
            const canClick = t.num <= step || (t.num === 2 && otpVerified);
            return (
              <button
                key={t.num}
                type="button"
                disabled={!canClick}
                onClick={() => canClick && setStep(t.num)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : isDone
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-slate-400 bg-slate-50/70"
                } disabled:cursor-not-allowed`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-full">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-7 shadow-xs space-y-4">
        {/* ============================================================ */}
        {/* TAB 1: MOBILE NUMBER & OTP VERIFICATION */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
                Tab 1 • Mobile Verification
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                Verify Your Mobile Number
              </h2>
              <p className="text-xs text-slate-500">
                Enter your 10-digit mobile number to receive a one-time verification code (OTP).
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mobile Number <span className="text-rose-600">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="flex items-center flex-1 rounded-xl border border-slate-300 bg-slate-50/60 focus-within:border-slate-900 focus-within:bg-white transition-colors overflow-hidden">
                    <span className="px-3 py-3 text-xs font-bold text-slate-500 border-r border-slate-200 bg-slate-100/70">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      disabled={otpVerified}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                        setOtpSent(false);
                        setOtpInput("");
                      }}
                      placeholder="e.g. 9829012345"
                      className="w-full px-3.5 py-3 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none disabled:opacity-60"
                    />
                  </div>

                  {!otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || resendCooldown > 0}
                      className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors shrink-0 disabled:opacity-50"
                    >
                      {sendingOtp
                        ? "Sending..."
                        : resendCooldown > 0
                        ? `Resend (${resendCooldown}s)`
                        : otpSent
                        ? "Resend OTP"
                        : "Send OTP"}
                    </button>
                  )}
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs font-bold text-slate-800">
                      Enter 6-Digit OTP <span className="text-rose-600">*</span>
                    </label>
                    {demoOtpHint && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-mono font-bold">
                        Test OTP: {demoOtpHint}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit OTP"
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-center font-mono text-base font-black tracking-[0.35em] text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otpInput.length !== 6}
                      className="px-6 py-3 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify with OTP"}
                    </button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Mobile number +91 {phone} verified!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpVerified(false);
                      setOtpSent(false);
                      setOtpInput("");
                      setOtpToken("");
                    }}
                    className="text-[11px] font-bold text-emerald-700 underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => validateAndNext(1)}
                disabled={!otpVerified}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                <span>Next: Contact Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: VENDOR CONTACT DETAILS */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
                Tab 2 • Vendor Contact Details
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                Your Name &amp; Address
              </h2>
              <p className="text-xs text-slate-500">
                Provide your contact name and full workshop/office/residential address.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  Vendor Type / Business Profile <span className="text-rose-600">*</span>
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                >
                  {VENDOR_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Sharma"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {entityType !== "INDIVIDUAL_WORKER" && (
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Business / Firm Name{" "}
                    {entityType === "OWN_BUSINESS" ? (
                      <span className="text-rose-600">*</span>
                    ) : (
                      <span className="text-slate-400 font-normal">(Optional)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Sharma Civil Works"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}

              <div className={`space-y-1 col-span-2 ${entityType !== "INDIVIDUAL_WORKER" ? "sm:col-span-1" : ""}`}>
                <label className="block text-xs font-bold text-slate-700">
                  Email <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@company.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  Full Address <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Plot No, Street, Area / Village"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  PIN Code <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="e.g. 311001"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  District / City <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Bhilwara"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  State <span className="text-rose-600">*</span>
                </label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => validateAndNext(2)}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Next: Work Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: WORK DETAILS */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
                Tab 3 • Work Details
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-950">
                Work Category, Experience &amp; Capacity
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Category Dropdown */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  What work do you do? (Category) <span className="text-rose-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                >
                  <option value="">-- Select Work Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.label || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Dropdown */}
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Experience <span className="text-rose-600">*</span></span>
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                >
                  <option value="">-- Select Experience --</option>
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Size Dropdown */}
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Team Size <span className="text-rose-600">*</span></span>
                </label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                >
                  <option value="">-- Select Team Size --</option>
                  {TEAM_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project / Service Scale (Compact 2x2 Grid) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Projects / Services You Handle <span className="text-rose-600">*</span></span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROJECT_SCALE_OPTIONS.map((sc) => {
                  const selected = projectScale.includes(sc.value);
                  return (
                    <button
                      key={sc.value}
                      type="button"
                      onClick={() => toggleProjectScale(sc.value)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                        selected
                          ? "bg-red-50/80 border-[#dc2626] ring-1 ring-[#dc2626]"
                          : "bg-slate-50/70 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900">{sc.label}</span>
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            selected
                              ? "bg-[#dc2626] border-[#dc2626] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selected && <Check className="w-3 h-3" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => validateAndNext(3)}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Next: Upload Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: UPLOAD DOCUMENTS (AADHAAR FRONT/BACK & PAN CARD) */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
                Tab 4 • Upload Documents
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                Aadhaar Card &amp; PAN Card
              </h2>
              <p className="text-xs text-slate-500">
                Upload clear photos or PDFs of your Aadhaar Card (Front &amp; Back) and PAN Card.
              </p>
            </div>

            {/* Aadhaar Front & Back (Side-by-side even on mobile for compact UX) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {/* Aadhaar Front */}
              <div className="p-2.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                    Aadhaar Front <span className="text-rose-600">*</span>
                  </span>
                  {aadharFrontUrl && (
                    <button
                      type="button"
                      onClick={() => setAadharFrontUrl("")}
                      className="text-rose-600 hover:text-rose-700 text-[10px] font-bold flex items-center gap-0.5 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {aadharFrontUrl ? (
                  aadharFrontUrl.startsWith("data:application/pdf") ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>PDF Ready</span>
                    </div>
                  ) : (
                    <img
                      src={aadharFrontUrl}
                      alt="Aadhaar Front"
                      className="w-full h-24 sm:h-32 object-cover rounded-xl border border-slate-200"
                    />
                  )
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 sm:h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white cursor-pointer transition-colors p-2 text-center">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[11px] font-bold text-slate-700">
                      {uploadingField === "aadharFront" ? "Wait..." : "Upload Front"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "aadharFront")}
                    />
                  </label>
                )}
              </div>

              {/* Aadhaar Back */}
              <div className="p-2.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                    Aadhaar Back <span className="text-rose-600">*</span>
                  </span>
                  {aadharBackUrl && (
                    <button
                      type="button"
                      onClick={() => setAadharBackUrl("")}
                      className="text-rose-600 hover:text-rose-700 text-[10px] font-bold flex items-center gap-0.5 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {aadharBackUrl ? (
                  aadharBackUrl.startsWith("data:application/pdf") ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>PDF Ready</span>
                    </div>
                  ) : (
                    <img
                      src={aadharBackUrl}
                      alt="Aadhaar Back"
                      className="w-full h-24 sm:h-32 object-cover rounded-xl border border-slate-200"
                    />
                  )
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 sm:h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white cursor-pointer transition-colors p-2 text-center">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[11px] font-bold text-slate-700">
                      {uploadingField === "aadharBack" ? "Wait..." : "Upload Back"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "aadharBack")}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* PAN Number & PAN Card Upload (Optional for workers without PAN) */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!hasPan}
                  onChange={(e) => setHasPan(!e.target.checked)}
                  className="w-4 h-4 accent-[#dc2626] rounded"
                />
                <span className="text-xs font-bold text-slate-700">
                  I don&apos;t have a PAN Card right now (मेरे पास पैन कार्ड नहीं है)
                </span>
              </label>

              {hasPan && (
                <>
                  <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>PAN Number <span className="text-rose-600">*</span></span>
                  </label>
                  {pan.length > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        PAN_REGEX.test(pan.trim().toUpperCase())
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {PAN_REGEX.test(pan.trim().toUpperCase()) ? "Valid PAN Format ✓" : "Format: ABCDE1234F"}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs sm:text-sm font-bold uppercase text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    PAN Card Photo / PDF <span className="text-rose-600">*</span>
                  </span>
                  {panCardUrl && (
                    <button
                      type="button"
                      onClick={() => setPanCardUrl("")}
                      className="text-rose-600 hover:text-rose-700 text-[11px] font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {panCardUrl ? (
                  panCardUrl.startsWith("data:application/pdf") ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>PAN Card PDF Uploaded</span>
                    </div>
                  ) : (
                    <img
                      src={panCardUrl}
                      alt="PAN Card"
                      className="w-full max-w-sm h-36 object-cover rounded-xl border border-slate-200"
                    />
                  )
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white cursor-pointer transition-colors p-4 text-center">
                    <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                    <span className="text-xs font-bold text-slate-700">
                      {uploadingField === "panCard" ? "Processing..." : "Tap to Upload PAN Card"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, or PDF</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "panCard")}
                    />
                  </label>
                )}
              </div>
                </>
              )}
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => validateAndNext(4)}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Next: Preview Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: PREVIEW FORM & USER CONSENT */}
        {/* ============================================================ */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
                Step 5 • Preview &amp; User Consent
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                Review Your Details Before Submitting
              </h2>
              <p className="text-xs text-slate-500">
                Verify all information below. You can click Edit on any section to make changes.
              </p>
            </div>

            <div className="space-y-3">
              {/* Summary 1: Mobile */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mobile Number
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                    <span>+91 {phone}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      OTP Verified ✓
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Summary 2: Contact Details */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Contact &amp; Address Details
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Name:</span>{" "}
                    <span className="font-bold text-slate-900">{contactName}</span>
                  </div>
                  {companyName && (
                    <div>
                      <span className="text-slate-400">Firm:</span>{" "}
                      <span className="font-bold text-slate-900">{companyName}</span>
                    </div>
                  )}
                  <div className="sm:col-span-2 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {address}, {district}, {stateName} — {pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary 3: Work Details */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Work Details
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Category:</span>{" "}
                    <span className="font-bold text-slate-900">{category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Experience:</span>{" "}
                    <span className="font-bold text-slate-900">{experienceYears}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Team Size:</span>{" "}
                    <span className="font-bold text-slate-900">{teamSize} Workers</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Project Scale:</span>{" "}
                    <span className="font-bold text-slate-900">{projectScale.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Summary 4: Documents */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Uploaded Documents (PAN: {hasPan ? pan : "Not Provided"})
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    Aadhaar Front ✓
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    Aadhaar Back ✓
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg ${
                      hasPan ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {hasPan ? "PAN Card ✓" : "PAN Skipped"}
                  </span>
                </div>
              </div>
            </div>

            {/* User Consent */}
            <label className="p-4 rounded-2xl border border-slate-200 bg-amber-50/60 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#dc2626] rounded shrink-0"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong>User Consent &amp; Declaration:</strong> I confirm that all personal, work, and document details submitted above are true and authentic. I authorize Hindustan Projects to verify my Aadhaar, PAN, and work credentials for vendor empanelment.
              </span>
            </label>

            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !termsAgreed}
                className="px-7 py-3 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{submitting ? "Submitting..." : "Submit Registration"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
