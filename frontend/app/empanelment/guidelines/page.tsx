"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  FileText,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Layers,
  HelpCircle,
  PhoneCall,
  Lock,
  QrCode,
  FileCheck,
  FileClock,
  AlertTriangle,
  Briefcase,
  Truck,
  Wrench,
  Zap,
  Paintbrush,
  HardHat,
} from "lucide-react";
import {
  EmpanelmentContent,
  DEFAULT_EMPANELMENT_CONTENT,
} from "@/lib/empanelmentContent";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "What is the fee for vendor empanelment registration?",
    a: "Application Fee: ₹0 (Free Registration). Hindustan Projects does not charge any fee for online empanelment registration.",
  },
  {
    q: "How long does the application review process take?",
    a: "The standard verification timeframe is 48–72 hours following online application submission.",
  },
  {
    q: "Is GSTIN mandatory to submit an empanelment application?",
    a: "The GSTIN field is optional in the registration form. PAN remains mandatory for application submission.",
  },
  {
    q: "Which documents are collected during online registration?",
    a: "Online registration collects your enterprise PAN number (mandatory), banking details (bank name, account number, IFSC), and optional GSTIN. The form interface provides document upload slots for a PAN card copy, GST certificate, and cancelled cheque/passbook copy, which are submitted with your application record. Uploaded files for MSME certificates and past work orders are not currently persisted by the portal.",
  },
  {
    q: "How do I check the status of my application?",
    a: "Visit /empanelment/track and enter your Tracking ID to view the current status of your application.",
  },
  {
    q: "Does empanelment guarantee contract awards?",
    a: "No. APPROVED empanelment status qualifies your enterprise to participate in active tenders at /empanelment/tenders. Empanelment approval does not guarantee a tender award or contract.",
  },
];

const TRADE_CATEGORIES = [
  {
    id: "civil-construction",
    title: "Civil Construction",
    subtitleHindi: "आरसीसी एवं चिनाई",
    description: "RCC structural works, masonry, structural erection, and general civil construction services.",
    icon: HardHat,
  },
  {
    id: "electrical-mep",
    title: "Electrical & MEP",
    subtitleHindi: "विद्युत एवं सबस्टेशन",
    description: "Electrical power distribution, substations, lighting, and specialized MEP installations.",
    icon: Zap,
  },
  {
    id: "plumbing-sanitation",
    title: "Plumbing & Sanitation",
    subtitleHindi: "प्लंबिंग कार्य",
    description: "Water supply piping, drainage, industrial plumbing, and sanitary systems.",
    icon: Wrench,
  },
  {
    id: "fabrication-peb",
    title: "Fabrication & PEB",
    subtitleHindi: "फैब्रिकेशन एवं स्टील",
    description: "Pre-engineered buildings (PEB), structural steel fabrication, trusses, and industrial sheds.",
    icon: Building2,
  },
  {
    id: "flooring-finishing",
    title: "Flooring & Finishing",
    subtitleHindi: "फ्लोरिंग एवं फिनिशिंग",
    description: "Industrial flooring, wall finishing, architectural glazing, waterproofing, and surface coating.",
    icon: Paintbrush,
  },
  {
    id: "material-supply",
    title: "Material Supply",
    subtitleHindi: "निर्माण सामग्री सप्लायर",
    description: "Supply of cement, structural steel, aggregates, bricks, and construction raw materials.",
    icon: Truck,
  },
];

const NAV_LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Registration", href: "#registration" },
  { label: "Categories", href: "#categories" },
  { label: "Documents", href: "#documents" },
  { label: "Workflow", href: "#workflow" },
  { label: "Compliance", href: "#compliance" },
  { label: "Gate Pass", href: "#gate-pass" },
  { label: "FAQs", href: "#faqs" },
  { label: "Contact", href: "#contact" },
];

export default function EmpanelmentGuidelinesPage() {
  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const prefix = process.env.NEXT_PUBLIC_BACKEND_URL
          ? process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "")
          : "";
        const res = await fetch(`${prefix}/api/empanelment/content`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content) {
            setContent({ ...DEFAULT_EMPANELMENT_CONTENT, ...json.content });
          }
        }
      } catch (_e) {
        // Safe fallback to default content
      }
    }
    loadData();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="bg-slate-50/60 font-sans text-slate-800 antialiased selection:bg-red-500 selection:text-white">
      {/* =========================================================================
          SECTION 1: HERO HEADER & CONFIRMED SUMMARY BADGES
      ========================================================================= */}
      <section className="relative pt-12 pb-10 sm:pt-16 sm:pb-12 border-b border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200/80">
              <BookOpen className="w-3.5 h-3.5 text-[#dc2626]" />
              <span>{content.guidelinesBadge || "Procurement Code & Standards"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              {content.guidelinesTitle || "Vendor & Contractor Empanelment Guidelines"}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {content.guidelinesSubtitle ||
                "Information regarding registration procedures, documentation requirements, and portal workflows for vendors, contractors, and suppliers seeking to work with Hindustan Projects."}
            </p>

            {/* Three Confirmed Summary Badges */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Application Fee: ₹0</div>
                  <div className="text-[11px] text-slate-500">Free Online Registration</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Verification SLA: 48–72h</div>
                  <div className="text-[11px] text-slate-500">Standard Review Window</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Online Status Tracking</div>
                  <div className="text-[11px] text-slate-500">Track via Tracking ID</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Secondary Anchor Navigation Bar */}
      <nav aria-label="Guidelines Sections" className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar text-xs font-semibold">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 whitespace-nowrap transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Sections */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* =========================================================================
            SECTION 2: WHAT IS VENDOR EMPANELMENT?
        ========================================================================= */}
        <section id="overview" className="scroll-mt-32 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
              Section 01
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              What is Vendor Empanelment?
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Empanelment is Hindustan Projects&apos; online pre-qualification portal for registering vendors,
              contractors, and suppliers prior to tender participation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4 text-[#dc2626]" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Online Pre-Qualification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Centralized registration via the online wizard to submit enterprise details, contact information,
                and statutory identification.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Search className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Application Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Applicants receive a Tracking ID generated on successful application submission to check status
                online anytime.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Tender Notice Access</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vendors with APPROVED status can view active procurement notices and submit bids through the tenders
                portal.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <QrCode className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Daily Site Gate Pass</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Partners with APPROVED status can submit requests for daily site entry passes for personnel and transport
                vehicles.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">
              <strong>Clarification:</strong> Empanelment qualifies an enterprise to participate in active tenders; it
              does not guarantee tender awards or contract allocation.
            </p>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: VENDOR REGISTRATION DETAILS
        ========================================================================= */}
        <section id="registration" className="scroll-mt-32 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
              Section 02
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Vendor Registration Details
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Essential profile information collected and verified during the online registration process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Mandatory Registration Information</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 w-36 shrink-0">Company / Trade Name:</span>
                  <span>Registered business name of the commercial enterprise.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 w-36 shrink-0">PAN Number:</span>
                  <span>
                    <strong className="text-slate-800">Mandatory for registration.</strong> Form and backend
                    validation block submission if missing.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 w-36 shrink-0">Contact Details:</span>
                  <span>Key contact person name, mobile telephone number, and official email address.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 w-36 shrink-0">Code of Conduct:</span>
                  <span>Mandatory declaration agreement prior to final submission.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Entity Legal Form Input &amp; Auto-Fill</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  The online registration form provides an editable text field for Entity Legal Form initialized to
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] ml-1">
                    Proprietorship (Individual)
                  </code>
                  .
                </p>
                <p>
                  When an applicant inputs a 15-digit GSTIN, the portal performs a local syntax check and extracts the
                  4th character of the embedded PAN to automatically suggest the constitution form (e.g. Company,
                  Proprietorship, Partnership/LLP Firm, Trust, Society).
                </p>
                <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  Applicants may edit this field manually if their registered constitution differs from the auto-decoded
                  suggestion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: TRADE CATEGORY SELECTION IN REGISTRATION FORM
        ========================================================================= */}
        <section id="categories" className="scroll-mt-32 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
              Section 03
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Trade Category Selection in Registration Form
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Applicants select their operational trade from the dropdown list configured in the registration form.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRADE_CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-[#dc2626] flex items-center justify-center font-bold text-xs">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{cat.title}</h3>
                    <div className="text-[11px] text-slate-500 font-medium">{cat.subtitleHindi}</div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs leading-relaxed">
            <strong>Important Qualification:</strong> The categories above represent the selection options currently
            configured in the registration form dropdown and do not constitute an approved company-wide procurement
            policy. Listing of categories does not imply active procurement opportunities or guarantee tender
            allocation in any category.
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: DOCUMENT CHECKLIST & TECHNICAL BEHAVIOR
        ========================================================================= */}
        <section id="documents" className="scroll-mt-32 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
              Section 04
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Document Checklist &amp; Technical Behavior
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Clear distinction between form required indicators, backend validation, and database persistence.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* PAN Item */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">Permanent Account Number (PAN)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                    Text Field: Mandatory (Backend-Enforced)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    Upload: Form UI Required
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                A valid PAN number is mandatory in the registration form; missing PAN blocks form submission. Step 4
                provides an upload slot for a PAN card copy (labeled with a required indicator in the interface; backend
                database column is nullable).
              </p>
            </div>

            {/* GSTIN Item */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">Goods &amp; Services Tax (GSTIN)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Text Field: Optional
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    Upload: Form UI Required
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The GSTIN field is optional. If entered, the portal performs a local 15-digit syntax check and
                auto-fills state and PAN details. Step 4 provides an upload slot for a GST certificate (labeled with a
                required indicator in the interface; backend database column is nullable).
              </p>
            </div>

            {/* Bank Item */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">Bank Details &amp; Cancelled Cheque</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Step 3 Inputs Collected
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    Upload: Form UI Required
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step 3 collects bank name, account number, and IFSC code. Step 4 provides an upload slot for a cancelled
                cheque or bank passbook copy (labeled with a required indicator in the interface; backend database column
                is nullable).
              </p>
            </div>

            {/* MSME & Past Work Notice */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">MSME Number &amp; Optional Document Notices</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 w-fit">
                  Technical Upload Notice
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step 1 provides an optional text field for recording an Udyam / MSME registration number (
                <code className="text-slate-800 font-mono text-[11px]">msmeUdyamNo</code>), which is stored in the
                database. While the form interface displays upload slots for MSME certificates and past work experience
                proofs, document file persistence for these two slots is not currently supported by the portal backend.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: APPLICATION & VERIFICATION WORKFLOW
        ========================================================================= */}
        <section id="workflow" className="scroll-mt-32 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
              Section 05
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Application &amp; Verification Workflow
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Step-by-step application submission, review timelines, and approved status benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <span className="text-xs font-mono font-bold text-[#dc2626] bg-red-50 px-2 py-0.5 rounded">
                STEP 01
              </span>
              <h3 className="font-bold text-sm text-slate-900">Online Submission</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete the registration wizard at <code className="text-[11px] text-slate-700">/empanelment/apply</code> (Profile, Contact, Banking, Documents, Declaration).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                STEP 02
              </span>
              <h3 className="font-bold text-sm text-slate-900">Tracking ID Generated</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                An official Tracking ID (<code className="text-[11px] text-slate-700">HP-EMP-XXXXXX</code>) is
                generated immediately upon submission. Initial status is SUBMITTED.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                STEP 03
              </span>
              <h3 className="font-bold text-sm text-slate-900">Verification Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Applications undergo administrative review within the standard verification timeframe (48–72 hours SLA
                confirmed by management). Track online anytime.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                STEP 04
              </span>
              <h3 className="font-bold text-sm text-slate-900">Approved Status Access</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                APPROVED status enables vendors to bid on active tenders and submit requests for Daily Site Gate
                Passes. Empanelment approval does not guarantee contract awards.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: STATUTORY & CONTRACTUAL COMPLIANCE
        ========================================================================= */}
        <section id="compliance" className="scroll-mt-32 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
              Section 06
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Statutory &amp; Contractual Compliance
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              General legal expectations and contractual governance principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">General Statutory Compliance</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Commercial entities registering on the portal are subject to applicable central and state laws, tax
                regulations, and statutory labour standards during any work execution.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Contractual Governance</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applicable tender documents or contract agreements should be referred to for project-specific
                commercial and technical terms, performance requirements, and delivery schedules.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 8: DIGITAL SITE GATE PASS SYSTEM
        ========================================================================= */}
        <section id="gate-pass" className="scroll-mt-32 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
              Section 07
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Digital Site Gate Pass System
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              On-demand gate pass request workflow for approved partners deploying personnel and vehicles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">On-Demand Request Workflow</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vendors with APPROVED empanelment status can submit a request for a Daily Site Gate Pass at{" "}
                <Link href="/empanelment/gate-pass" className="text-[#dc2626] font-semibold hover:underline">
                  /empanelment/gate-pass
                </Link>{" "}
                when deploying personnel, workforce members, or transport vehicles to site locations specified in the
                portal.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">24-Hour Validity Window</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Issued passes receive a pass code (<code className="text-[11px] text-slate-700">HP-GP-XXXXX</code>)
                valid for exactly 24 hours from issuance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Online &amp; QR Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Passes can be verified online or by scanning the pass QR code at{" "}
                <Link href="/empanelment/verify-pass" className="text-[#dc2626] font-semibold hover:underline">
                  /empanelment/verify-pass
                </Link>
                , which confirms pass active status and expiration time.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 9: FREQUENTLY ASKED QUESTIONS
        ========================================================================= */}
        <section id="faqs" className="scroll-mt-32 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
              Section 08
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Common questions regarding empanelment fee, review SLA, documentation, and tender bidding.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-[#dc2626] transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#dc2626]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-answer-${idx}`}
                      className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SECTION 10: CONTACT & SUPPORT CHANNELS
        ========================================================================= */}
        <section id="contact" className="scroll-mt-32 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dc2626]">
              Section 09
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Contact &amp; Support Channels
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Official self-service portals and corporate support routes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <PhoneCall className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Corporate Inquiries</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inquiries regarding empanelment and procurement may be submitted through the corporate contact portal.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dc2626] hover:underline pt-1"
              >
                <span>Visit /contact</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Search className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Track Application Status</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Check current review status anytime with your Tracking ID.
              </p>
              <Link
                href="/empanelment/track"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-1"
              >
                <span>Track Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <QrCode className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Daily Site Gate Pass</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate and verify 24-hour daily site access passes.
              </p>
              <Link
                href="/empanelment/gate-pass"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline pt-1"
              >
                <span>Request Gate Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 11: REGISTRATION CALL-TO-ACTION
        ========================================================================= */}
        <section className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-50 text-[#dc2626] text-[11px] font-bold uppercase tracking-wider">
              <span>Ready to Apply?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Vendor &amp; Contractor Registration
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Submit your online empanelment application for pre-qualification. Registration fee is ₹0 with a standard
              48–72 hour verification review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/empanelment/apply"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-2xl font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Register as a Vendor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/empanelment/track"
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors text-center"
            >
              Track Application Status
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
