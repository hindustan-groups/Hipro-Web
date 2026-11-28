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
  Languages,
} from "lucide-react";

type Lang = "en" | "hi";

const FALLBACK_CATEGORIES = [
  { id: "civil", name: "Civil Construction", hi: "सिविल निर्माण (आरसीसी एवं चिनाई)" },
  { id: "mep", name: "Electrical & MEP", hi: "इलेक्ट्रिकल एवं सबस्टेशन कार्य" },
  { id: "plumbing", name: "Plumbing & Sanitation", hi: "प्लंबिंग एवं सैनिटेशन कार्य" },
  { id: "fabrication", name: "Fabrication & PEB", hi: "फैब्रिकेशन एवं स्टील कार्य" },
  { id: "finishing", name: "Flooring & Finishing", hi: "फ्लोरिंग, टाइल्स एवं फिनिशिंग" },
  { id: "material", name: "Material Supply", hi: "निर्माण सामग्री सप्लाई" },
];

const EXPERIENCE_OPTIONS = [
  { value: "Less than 1 Year", en: "Less than 1 Year", hi: "1 साल से कम" },
  { value: "1–3 Years", en: "1–3 Years", hi: "1–3 साल" },
  { value: "3–5 Years", en: "3–5 Years", hi: "3–5 साल" },
  { value: "5–10 Years", en: "5–10 Years", hi: "5–10 साल" },
  { value: "10+ Years", en: "10+ Years", hi: "10+ साल" },
];

const TEAM_SIZE_OPTIONS = [
  { value: "1-5", en: "1–5 Workers", hi: "1–5 कारीगर/वर्कर" },
  { value: "6-15", en: "6–15 Workers", hi: "6–15 कारीगर/वर्कर" },
  { value: "16-50", en: "16–50 Workers", hi: "16–50 कारीगर/वर्कर" },
  { value: "50+", en: "50+ Workers", hi: "50+ कारीगर/वर्कर" },
];

const PROJECT_SCALE_OPTIONS = [
  { value: "Day to Day", en: "Day to Day", hi: "रोज़मर्रा के छोटे काम (Day to Day)" },
  { value: "Small", en: "Small", hi: "छोटे प्रोजेक्ट (Small)" },
  { value: "Medium", en: "Medium", hi: "मध्यम प्रोजेक्ट (Medium)" },
  { value: "Large", en: "Large", hi: "बड़े प्रोजेक्ट (Large)" },
];

const VENDOR_TYPE_OPTIONS = [
  {
    value: "INDIVIDUAL_WORKER",
    en: "Individual / Only Worker",
    hi: "मैं अकेला वर्कर / कारीगर हूँ",
  },
  {
    value: "RUN_SMALL_TEAM",
    en: "Contractor with Team",
    hi: "मैं टीम के साथ काम करता हूँ (ठेकेदार)",
  },
  {
    value: "OWN_BUSINESS",
    en: "I Own a Business / Firm",
    hi: "मेरा खुद का बिजनेस / फर्म है",
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

const COPY = {
  en: {
    badge: "Vendor Registration",
    title: "Partner with Hindustan Projects",
    tabs: ["Mobile OTP", "Contact", "Work Details", "Documents", "Preview"],
    t1Tag: "Tab 1 • Mobile Verification",
    t1Title: "Verify Your Mobile Number",
    t1Sub: "Enter your 10-digit mobile number to receive a 6-digit OTP.",
    mobileLabel: "Mobile Number",
    sendOtp: "Send OTP",
    resendOtp: "Resend OTP",
    sending: "Sending...",
    enterOtp: "Enter 6-Digit OTP",
    verifyOtp: "Verify with OTP",
    verifying: "Verifying...",
    verifiedMsg: "verified!",
    change: "Change",
    nextContact: "Next: Contact Details",
    t2Tag: "Tab 2 • Vendor Contact Details",
    t2Title: "Your Name & Address",
    t2Sub: "Select your vendor type and enter your address details.",
    vendorType: "Vendor Type / Business Profile",
    fullName: "Full Name",
    firmName: "Business / Firm Name",
    optional: "(Optional)",
    email: "Email",
    address: "Full Address",
    pin: "PIN Code",
    district: "District / City",
    state: "State",
    nextWork: "Next: Work Details",
    t3Tag: "Tab 3 • Work Details",
    t3Title: "Work Category, Experience & Capacity",
    catLabel: "What work do you do? (Category)",
    catPlaceholder: "-- Select Work Category --",
    otherCat: "Other (Type your work)",
    customWorkLabel: "Type Your Work / Trade",
    customWorkPh: "e.g. Painting, Tiles, Welding, Borewell, Waterproofing",
    expLabel: "Experience (How long?)",
    expPh: "-- Select Experience --",
    teamLabel: "Team Size",
    teamPh: "-- Select Team Size --",
    scaleLabel: "Projects / Services You Handle",
    nextDocs: "Next: Upload Documents",
    t4Tag: "Tab 4 • Upload Documents",
    t4Title: "Aadhaar Card & PAN Card",
    t4Sub: "Upload clear photos or PDFs of your Aadhaar Card (Front & Back) and PAN Card.",
    aadharFront: "Aadhaar Front",
    aadharBack: "Aadhaar Back",
    uploadFront: "Upload Front",
    uploadBack: "Upload Back",
    noPanLabel: "I don't have a PAN Card right now",
    panNumber: "PAN Number",
    panPhoto: "PAN Card Photo / PDF",
    uploadPan: "Tap to Upload PAN Card",
    nextPreview: "Next: Preview Form",
    t5Tag: "Step 5 • Preview & User Consent",
    t5Title: "Review Your Details Before Submitting",
    t5Sub: "Verify all information below. Click Edit on any section to make changes.",
    edit: "Edit",
    consentPrefix: "User Consent & Declaration:",
    consentText:
      "I confirm that all personal, work, and document details submitted above are true and authentic. I authorize Hindustan Projects to verify my credentials for vendor empanelment.",
    submitBtn: "Submit Registration",
    submitting: "Submitting...",
    back: "Back",
    successBadge: "Registration Submitted",
    thankYou: "Thank You,",
    successMsg:
      "Your vendor registration has been received. Your account is active — open your dashboard or save your Tracking ID below.",
    trackingLabel: "Application Tracking ID",
    goDashboard: "Go to Vendor Dashboard",
    trackStatus: "Track Status",
  },
  hi: {
    badge: "वेंडर रजिस्ट्रेशन",
    title: "हिन्दुस्तान प्रोजेक्ट्स से जुड़ें",
    tabs: ["मोबाइल OTP", "संपर्क", "काम की जानकारी", "दस्तावेज़", "प्रीव्यू"],
    t1Tag: "स्टेप 1 • मोबाइल सत्यापन",
    t1Title: "अपना मोबाइल नंबर सत्यापित करें",
    t1Sub: "6-अंकों का OTP प्राप्त करने के लिए अपना 10-अंकों का मोबाइल नंबर दर्ज करें।",
    mobileLabel: "मोबाइल नंबर",
    sendOtp: "OTP भेजें",
    resendOtp: "OTP दोबारा भेजें",
    sending: "भेजा जा रहा है...",
    enterOtp: "6-अंकों का OTP दर्ज करें",
    verifyOtp: "OTP सत्यापित करें",
    verifying: "जाँच हो रही है...",
    verifiedMsg: "सत्यापित हो गया!",
    change: "बदलें",
    nextContact: "आगे: संपर्क जानकारी",
    t2Tag: "स्टेप 2 • संपर्क एवं पता",
    t2Title: "आपका नाम और पता",
    t2Sub: "अपनी श्रेणी चुनें और पूरा पता भरें।",
    vendorType: "आप किस तरह काम करते हैं?",
    fullName: "पूरा नाम",
    firmName: "बिजनेस / फर्म का नाम",
    optional: "(वैकल्पिक)",
    email: "ईमेल",
    address: "पूरा पता",
    pin: "पिन कोड",
    district: "जिला / शहर",
    state: "राज्य",
    nextWork: "आगे: काम की जानकारी",
    t3Tag: "स्टेप 3 • काम की जानकारी",
    t3Title: "काम की श्रेणी, अनुभव और टीम",
    catLabel: "आप क्या काम करते हैं? (श्रेणी)",
    catPlaceholder: "-- अपने काम की श्रेणी चुनें --",
    otherCat: "अन्य (अपना काम खुद लिखें)",
    customWorkLabel: "अपना काम लिखें",
    customWorkPh: "जैसे: पेंटिंग, टाइल्स, वेल्डिंग, बोरवेल, वाटरप्रूफिंग",
    expLabel: "कितने समय से काम कर रहे हैं?",
    expPh: "-- अनुभव चुनें --",
    teamLabel: "टीम साइज (कितने लोग हैं)",
    teamPh: "-- टीम साइज चुनें --",
    scaleLabel: "आप किस तरह के प्रोजेक्ट संभाल सकते हैं?",
    nextDocs: "आगे: दस्तावेज़ अपलोड करें",
    t4Tag: "स्टेप 4 • दस्तावेज़ अपलोड",
    t4Title: "आधार कार्ड और पैन कार्ड",
    t4Sub: "अपने आधार कार्ड (आगे और पीछे) और पैन कार्ड की साफ फोटो या PDF अपलोड करें।",
    aadharFront: "आधार (आगे)",
    aadharBack: "आधार (पीछे)",
    uploadFront: "आगे की फोटो",
    uploadBack: "पीछे की फोटो",
    noPanLabel: "मेरे पास अभी पैन कार्ड नहीं है",
    panNumber: "पैन नंबर",
    panPhoto: "पैन कार्ड फोटो / PDF",
    uploadPan: "पैन कार्ड अपलोड करें",
    nextPreview: "आगे: फॉर्म प्रीव्यू देखें",
    t5Tag: "स्टेप 5 • प्रीव्यू और सहमति",
    t5Title: "सबमिट करने से पहले जानकारी जांचें",
    t5Sub: "नीचे दी गई जानकारी जांच लें। किसी भी हिस्से को बदलने के लिए Edit दबाएं।",
    edit: "बदलें",
    consentPrefix: "सहमति एवं घोषणा:",
    consentText:
      "मैं पुष्टि करता हूँ कि ऊपर दी गई सभी जानकारी और दस्तावेज़ बिल्कुल सही हैं। मैं हिन्दुस्तान प्रोजेक्ट्स को सत्यापन की अनुमति देता हूँ।",
    submitBtn: "रजिस्ट्रेशन सबमिट करें",
    submitting: "सबमिट हो रहा है...",
    back: "पीछे",
    successBadge: "रजिस्ट्रेशन सफल",
    thankYou: "धन्यवाद,",
    successMsg:
      "आपका रजिस्ट्रेशन प्राप्त हो गया है। आपका अकाउंट सक्रिय है — नीचे से डैशबोर्ड खोलें या ट्रैकिंग ID सेव करें।",
    trackingLabel: "एप्लीकेशन ट्रैकिंग ID",
    goDashboard: "वेंडर डैशबोर्ड खोलें",
    trackStatus: "स्टेटस देखें",
  },
} as const;

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
  const [lang, setLang] = useState<Lang>("en");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const t = COPY[lang];

  const [categories, setCategories] = useState<Array<{ id: string; name: string; hi?: string }>>(
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
  const [customWorkType, setCustomWorkType] = useState("");
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
    try {
      const saved = localStorage.getItem("hipro_vendor_lang");
      if (saved === "hi" || saved === "en") setLang(saved);
    } catch (_e) {}

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
                hi: c.name,
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

  const toggleLanguage = (nextLang: Lang) => {
    setLang(nextLang);
    try {
      localStorage.setItem("hipro_vendor_lang", nextLang);
    } catch (_e) {}
  };

  const handleSendOtp = async () => {
    setError("");
    const cleanPhone = phone.replace(/\D/g, "");
    if (!PHONE_REGEX.test(cleanPhone)) {
      setError(
        lang === "hi"
          ? "कृपया 10-अंकों का सही मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit Indian mobile number."
      );
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
      setError(lang === "hi" ? "कृपया 6-अंकों का OTP दर्ज करें।" : "Please enter the 6-digit OTP.");
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
      setError(lang === "hi" ? "फ़ाइल 8 MB से कम होनी चाहिए।" : "File size must be under 8 MB.");
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
        setError(
          lang === "hi"
            ? "कृपया पहले OTP से मोबाइल नंबर सत्यापित करें।"
            : "Please verify your mobile number with OTP first."
        );
        return;
      }
      setStep(2);
      return;
    }
    if (currentStep === 2) {
      if (!contactName.trim()) {
        setError(lang === "hi" ? "कृपया अपना पूरा नाम लिखें।" : "Please enter your full name.");
        return;
      }
      if (entityType === "OWN_BUSINESS" && !companyName.trim()) {
        setError(
          lang === "hi" ? "कृपया अपने बिजनेस/फर्म का नाम लिखें।" : "Please enter your Business / Firm name."
        );
        return;
      }
      if (!address.trim()) {
        setError(lang === "hi" ? "कृपया अपना पूरा पता लिखें।" : "Please enter your complete address.");
        return;
      }
      if (!PIN_REGEX.test(pincode.trim())) {
        setError(lang === "hi" ? "कृपया 6-अंकों का सही पिन कोड डालें।" : "Please enter a valid 6-digit PIN code.");
        return;
      }
      if (!district.trim()) {
        setError(lang === "hi" ? "कृपया अपना जिला / शहर लिखें।" : "Please enter your District / City.");
        return;
      }
      if (!stateName.trim()) {
        setError(lang === "hi" ? "कृपया अपना राज्य चुनें।" : "Please select your State.");
        return;
      }
      setStep(3);
      return;
    }
    if (currentStep === 3) {
      if (!category) {
        setError(
          lang === "hi"
            ? "कृपया अपने काम की श्रेणी चुनें।"
            : "Please select what work/service you do (Category)."
        );
        return;
      }
      if (category === "__OTHER__" && !customWorkType.trim()) {
        setError(
          lang === "hi" ? "कृपया अपना काम लिखें।" : "Please type/describe the work you do."
        );
        return;
      }
      if (!experienceYears) {
        setError(lang === "hi" ? "कृपया अपना अनुभव चुनें।" : "Please select your experience.");
        return;
      }
      if (!teamSize) {
        setError(lang === "hi" ? "कृपया अपनी टीम साइज चुनें।" : "Please select your team size.");
        return;
      }
      if (projectScale.length === 0) {
        setError(
          lang === "hi"
            ? "कृपया कम से कम एक प्रोजेक्ट प्रकार चुनें।"
            : "Please select at least one project/service type you can handle."
        );
        return;
      }
      setStep(4);
      return;
    }
    if (currentStep === 4) {
      if (!aadharFrontUrl || !aadharBackUrl) {
        setError(
          lang === "hi"
            ? "कृपया आधार कार्ड की आगे और पीछे दोनों फोटो अपलोड करें।"
            : "Please upload both Front and Back sides of your Aadhaar Card."
        );
        return;
      }
      if (hasPan) {
        const cleanPan = pan.trim().toUpperCase();
        if (!PAN_REGEX.test(cleanPan)) {
          setError(
            lang === "hi"
              ? "कृपया सही 10-अक्षरों का पैन नंबर डालें (या पैन नहीं है पर टिक करें)।"
              : "Please enter a valid 10-character PAN number (e.g. ABCDE1234F), or check 'I don't have a PAN Card'."
          );
          return;
        }
        if (!panCardUrl) {
          setError(
            lang === "hi"
              ? "कृपया पैन कार्ड अपलोड करें या 'मेरे पास पैन कार्ड नहीं है' चुनें।"
              : "Please upload your PAN Card photo or PDF, or check 'I don't have a PAN Card'."
          );
          return;
        }
      }
      setStep(5);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!termsAgreed) {
      setError(
        lang === "hi"
          ? "कृपया सबमिट करने से पहले सहमति बॉक्स पर टिक करें।"
          : "Please accept the user consent & declaration before submitting."
      );
      return;
    }

    const isCustomCategory = category === "__OTHER__";
    setSubmitting(true);
    try {
      const res = await fetch("/api/empanelment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
          category: isCustomCategory ? undefined : category,
          primaryRole: isCustomCategory ? customWorkType.trim() : category,
          skillsDetails: isCustomCategory ? customWorkType.trim() : "",
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
    { num: 1, label: t.tabs[0], icon: Phone },
    { num: 2, label: t.tabs[1], icon: User },
    { num: 3, label: t.tabs[2], icon: Briefcase },
    { num: 4, label: t.tabs[3], icon: Upload },
    { num: 5, label: t.tabs[4], icon: FileCheck2 },
  ];

  // Success Screen
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
              {t.successBadge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {t.thankYou} {contactName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {t.successMsg}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-md mx-auto">
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.trackingLabel}
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
              <span>{t.goDashboard}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/empanelment/track?id=${encodeURIComponent(successData.trackingId)}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              {t.trackStatus}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-10 space-y-4">
      {/* Header + 1-Tap Language Switcher */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-full flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-[#dc2626] border border-red-200 text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            <span>{t.badge}</span>
          </span>

          {/* English / Hindi Switcher */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-200/70 border border-slate-300/70 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => toggleLanguage("en")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                lang === "en" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              <Languages className="w-3 h-3" />
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => toggleLanguage("hi")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                lang === "hi" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              <span>हिन्दी</span>
            </button>
          </div>
        </div>

        <h1 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">
          {t.title}
        </h1>
      </div>

      {/* Responsive 5-Tab Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-3 shadow-xs overflow-x-auto">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 min-w-[320px]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = step === tab.num;
            const isDone = step > tab.num;
            const canClick = tab.num <= step || (tab.num === 2 && otpVerified);
            return (
              <button
                key={tab.num}
                type="button"
                disabled={!canClick}
                onClick={() => canClick && setStep(tab.num)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : isDone
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-slate-400 bg-slate-50/70"
                } disabled:cursor-not-allowed`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-full">{tab.label}</span>
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
          <div className="space-y-4">
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
                {t.t1Tag}
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-950">{t.t1Title}</h2>
              <p className="text-xs text-slate-500">{t.t1Sub}</p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t.mobileLabel} <span className="text-rose-600">*</span>
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
                        ? t.sending
                        : resendCooldown > 0
                        ? `${resendCooldown}s`
                        : otpSent
                        ? t.resendOtp
                        : t.sendOtp}
                    </button>
                  )}
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs font-bold text-slate-800">
                      {t.enterOtp} <span className="text-rose-600">*</span>
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
                      {verifyingOtp ? t.verifying : t.verifyOtp}
                    </button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      +91 {phone} {t.verifiedMsg}
                    </span>
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
                    {t.change}
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
                <span>{t.nextContact}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: VENDOR CONTACT DETAILS */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
                {t.t2Tag}
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-950">{t.t2Title}</h2>
              <p className="text-xs text-slate-500">{t.t2Sub}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  {t.vendorType} <span className="text-rose-600">*</span>
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                >
                  {VENDOR_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {lang === "hi" ? opt.hi : opt.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  {t.fullName} <span className="text-rose-600">*</span>
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
                    {t.firmName}{" "}
                    {entityType === "OWN_BUSINESS" ? (
                      <span className="text-rose-600">*</span>
                    ) : (
                      <span className="text-slate-400 font-normal">{t.optional}</span>
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
                  {t.email} <span className="text-slate-400 font-normal">{t.optional}</span>
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
                  {t.address} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={lang === "hi" ? "मकान/प्लॉट नं., गली, मोहल्ला / गांव" : "House / Plot No, Street, Area / Village"}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {t.pin} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="311001"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {t.district} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder={lang === "hi" ? "जैसे: भीलवाड़ा" : "e.g. Bhilwara"}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  {t.state} <span className="text-rose-600">*</span>
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
                <span>{t.back}</span>
              </button>
              <button
                type="button"
                onClick={() => validateAndNext(2)}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>{t.nextWork}</span>
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
                {t.t3Tag}
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-950">{t.t3Title}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Category Dropdown with Other (Custom) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  {t.catLabel} <span className="text-rose-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                >
                  <option value="">{t.catPlaceholder}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {lang === "hi" ? cat.hi || cat.name : cat.name}
                    </option>
                  ))}
                  <option value="__OTHER__">{t.otherCat}</option>
                </select>
              </div>

              {/* Custom Work Type Input when Other is selected */}
              {category === "__OTHER__" && (
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">
                    {t.customWorkLabel} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={customWorkType}
                    onChange={(e) => setCustomWorkType(e.target.value)}
                    placeholder={t.customWorkPh}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}

              {/* Experience Dropdown */}
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {t.expLabel} <span className="text-rose-600">*</span>
                  </span>
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                >
                  <option value="">{t.expPh}</option>
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <option key={exp.value} value={exp.value}>
                      {lang === "hi" ? exp.hi : exp.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Size Dropdown */}
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {t.teamLabel} <span className="text-rose-600">*</span>
                  </span>
                </label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                >
                  <option value="">{t.teamPh}</option>
                  {TEAM_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {lang === "hi" ? opt.hi : opt.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project / Service Scale (Compact 2x2 Grid) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {t.scaleLabel} <span className="text-rose-600">*</span>
                </span>
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
                        <span className="text-xs font-black text-slate-900">
                          {lang === "hi" ? sc.hi : sc.en}
                        </span>
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
                <span>{t.back}</span>
              </button>
              <button
                type="button"
                onClick={() => validateAndNext(3)}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>{t.nextDocs}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: UPLOAD DOCUMENTS (AADHAAR FRONT/BACK & OPTIONAL PAN) */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
                {t.t4Tag}
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-950">{t.t4Title}</h2>
              <p className="text-xs text-slate-500">{t.t4Sub}</p>
            </div>

            {/* Aadhaar Front & Back */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {/* Aadhaar Front */}
              <div className="p-2.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                    {t.aadharFront} <span className="text-rose-600">*</span>
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
                      {uploadingField === "aadharFront" ? "..." : t.uploadFront}
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
                    {t.aadharBack} <span className="text-rose-600">*</span>
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
                      {uploadingField === "aadharBack" ? "..." : t.uploadBack}
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

            {/* PAN Number & PAN Card Upload */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!hasPan}
                  onChange={(e) => setHasPan(!e.target.checked)}
                  className="w-4 h-4 accent-[#dc2626] rounded"
                />
                <span className="text-xs font-bold text-slate-700">{t.noPanLabel}</span>
              </label>

              {hasPan && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {t.panNumber} <span className="text-rose-600">*</span>
                        </span>
                      </label>
                      {pan.length > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            PAN_REGEX.test(pan.trim().toUpperCase())
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {PAN_REGEX.test(pan.trim().toUpperCase()) ? "Valid ✓" : "ABCDE1234F"}
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

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {t.panPhoto} <span className="text-rose-600">*</span>
                      </span>
                      {panCardUrl && (
                        <button
                          type="button"
                          onClick={() => setPanCardUrl("")}
                          className="text-rose-600 hover:text-rose-700 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {panCardUrl ? (
                      panCardUrl.startsWith("data:application/pdf") ? (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>PAN Card PDF Uploaded</span>
                        </div>
                      ) : (
                        <img
                          src={panCardUrl}
                          alt="PAN Card"
                          className="w-full max-w-sm h-28 object-cover rounded-xl border border-slate-200"
                        />
                      )
                    ) : (
                      <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white cursor-pointer transition-colors p-3 text-center">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-slate-700">
                          {uploadingField === "panCard" ? "..." : t.uploadPan}
                        </span>
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
                <span>{t.back}</span>
              </button>
              <button
                type="button"
                onClick={() => validateAndNext(4)}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>{t.nextPreview}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: PREVIEW FORM & USER CONSENT */}
        {/* ============================================================ */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
                {t.t5Tag}
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-950">{t.t5Title}</h2>
              <p className="text-xs text-slate-500">{t.t5Sub}</p>
            </div>

            <div className="space-y-2.5">
              {/* Summary 1: Mobile */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.mobileLabel}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                    <span>+91 {phone}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      OTP ✓
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t.edit}</span>
                </button>
              </div>

              {/* Summary 2: Contact Details */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.tabs[1]}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.edit}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">{t.fullName}:</span>{" "}
                    <span className="font-bold text-slate-900">{contactName}</span>
                  </div>
                  {entityType !== "INDIVIDUAL_WORKER" && companyName && (
                    <div>
                      <span className="text-slate-400">{t.firmName}:</span>{" "}
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
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.tabs[2]}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.edit}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">Work:</span>{" "}
                    <span className="font-bold text-slate-900">
                      {category === "__OTHER__" ? customWorkType : category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Exp:</span>{" "}
                    <span className="font-bold text-slate-900">{experienceYears}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Team:</span>{" "}
                    <span className="font-bold text-slate-900">{teamSize}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Scale:</span>{" "}
                    <span className="font-bold text-slate-900">{projectScale.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Summary 4: Documents */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.tabs[3]} (PAN: {hasPan ? pan : "Not Provided"})
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.edit}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    {t.aadharFront} ✓
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    {t.aadharBack} ✓
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg ${
                      hasPan ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {hasPan ? "PAN ✓" : "PAN Skipped"}
                  </span>
                </div>
              </div>
            </div>

            {/* User Consent */}
            <label className="p-3.5 rounded-2xl border border-slate-200 bg-amber-50/60 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#dc2626] rounded shrink-0"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong>{t.consentPrefix}</strong> {t.consentText}
              </span>
            </label>

            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.back}</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !termsAgreed}
                className="px-7 py-3 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{submitting ? t.submitting : t.submitBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
