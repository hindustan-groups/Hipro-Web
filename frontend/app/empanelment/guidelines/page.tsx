import React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  HardHat,
  Scale,
  Download,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "Empanelment Guidelines & NBC 2016 Standards | Hindustan Projects",
  description:
    "Official procurement guidelines, statutory document criteria, National Building Code (NBC 2016) safety compliance, and capacity tier thresholds for Hindustan Projects contractors.",
};

export default function EmpanelmentGuidelinesPage() {
  const tiers = [
    {
      code: "CLASS_A",
      title: "Class 'A' Prime Partner",
      turnover: "₹ 5.00 Crore+ (Per Annum)",
      capacity: "Single Work Order Up to ₹ 10.00 Cr",
      validity: "3 Years",
      color: "from-amber-500 to-amber-700",
      border: "border-amber-300",
      bg: "bg-amber-50/50",
      scope:
        "Mega Industrial Sheds, Turnkey PEB Structures, Multi-Storey Commercial Complexes, Infrastructure Highways & Bridges.",
    },
    {
      code: "CLASS_B",
      title: "Class 'B' Major Contractor",
      turnover: "₹ 1.00 Crore – ₹ 5.00 Crore",
      capacity: "Single Work Order Up to ₹ 2.50 Cr",
      validity: "2 Years",
      color: "from-blue-600 to-indigo-700",
      border: "border-blue-200",
      bg: "bg-blue-50/50",
      scope:
        "Industrial RCC Foundations, Plinth & Structure Masonry, MEP Firefighting & HVAC, Heavy Fabrication & Roofing.",
    },
    {
      code: "CLASS_C",
      title: "Class 'C' Specialized Subcontractor",
      turnover: "₹ 25 Lakhs – ₹ 1.00 Crore",
      capacity: "Single Work Order Up to ₹ 50 Lakhs",
      validity: "2 Years",
      color: "from-emerald-600 to-teal-700",
      border: "border-emerald-200",
      bg: "bg-emerald-50/50",
      scope:
        "Trimix Industrial Flooring, Waterproofing & Grouting, Aluminum & Glass Glazing, Boundary Walls, Specialized Finishing.",
    },
    {
      code: "CLASS_D",
      title: "Class 'D' Provisional / Local Trades",
      turnover: "Under ₹ 25 Lakhs / New MSME",
      capacity: "Single Work Order Up to ₹ 15 Lakhs",
      validity: "1 Year",
      color: "from-slate-600 to-slate-800",
      border: "border-slate-200",
      bg: "bg-slate-50/50",
      scope:
        "Labor Supply, Formwork & Shuttering, Earthwork Excavation, Local Aggregate / Sand Suppliers, Electrical Conduit Wiring.",
    },
  ];

  const statutoryDocs = [
    {
      title: "Permanent Account Number (PAN)",
      authority: "Income Tax Department",
      requiredFor: "All Entities",
      desc: "Mandatory corporate or individual PAN card copy linked with bank account.",
    },
    {
      title: "Goods & Services Tax (GSTIN)",
      authority: "GST Network (Govt of India)",
      requiredFor: "Class A, B, C (Optional for Class D)",
      desc: "Valid 15-digit GST registration certificate. Must be filed active for last 2 quarters.",
    },
    {
      title: "CA Certified Turnover / Audited Balances",
      authority: "Chartered Accountant (ICAI)",
      requiredFor: "Class A & B",
      desc: "Audited balance sheet and profit & loss statements for last 3 financial years with UDIN.",
    },
    {
      title: "Bank Solvency & Cancelled Cheque",
      authority: "Scheduled Commercial Bank",
      requiredFor: "All Entities",
      desc: "Cancelled cheque showing account holder name, IFS code, and bank branch for RTGS transfers.",
    },
    {
      title: "EPFO & ESIC Registration",
      authority: "Ministry of Labour",
      requiredFor: "Contractors with >10 Workers",
      desc: "Mandatory compliance for deployed site workforce under building and other construction workers act.",
    },
    {
      title: "MSME Udyam Registration (Optional)",
      authority: "Ministry of MSME",
      requiredFor: "Micro & Small Enterprises",
      desc: "Provides procurement priority and EMD fee exemptions for eligible local vendors.",
    },
  ];

  return (
    <div className="py-10 bg-slate-50/70 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Procurement Code & Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Vendor Empanelment Guidelines & Compliance Criteria
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Standard operating procedure, eligibility benchmarks, and statutory documentation guidelines prescribed by the Hindustan Projects Directorate of Procurement for civil, MEP, and industrial contracts.
          </p>
        </div>

        {/* Capacity Tiers Matrix */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                1. Capacity Classification & Thresholds
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vendors are classified into 4 standardized capacity brackets based on statutory audit scoring.
              </p>
            </div>
            <Link
              href="/empanelment/apply"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <span>Apply for Empanelment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tiers.map((tier) => (
              <div
                key={tier.code}
                className={`bg-white rounded-3xl p-6 border ${tier.border} shadow-2xs hover:shadow-md transition-all space-y-4 relative overflow-hidden`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {tier.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{tier.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    Validity: {tier.validity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Annual Turnover</span>
                    <span className="font-bold text-slate-800">{tier.turnover}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Order Capability</span>
                    <span className="font-bold text-amber-700">{tier.capacity}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-1">Eligible Work Scope:</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{tier.scope}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Documents Required */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              2. Mandatory Statutory Documentation Checklist
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ensure high-resolution photocopies or digital PDF scans are prepared prior to starting the online 5-step registration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statutoryDocs.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-xs text-slate-900">{doc.title}</h3>
                </div>
                <div className="text-[11px] font-mono text-amber-700 bg-amber-50/50 px-2 py-0.5 rounded w-fit">
                  {doc.authority} &bull; {doc.requiredFor}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NBC 2016 Safety & Site Protocols */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  3. Site Safety & Quality Protocols (NBC 2016)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  National Building Code of India & Directorate of Industrial Safety Guidelines
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Harm Tolerance Policy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-300">
            <div className="space-y-2">
              <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                A. Mandatory Site PPE
              </h3>
              <p>
                All contractor personnel, supervisors, and sub-tier laborers must wear ISI-marked hard hats (IS 2925), steel-toe safety boots (IS 15298), high-visibility reflective vests, and safety harnesses for working at heights &gt;2 meters.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                B. 24-Hour Digital Gate Passes
              </h3>
              <p>
                No worker or vehicle is permitted beyond site security checkpoints without a valid QR-encoded 24-hr daily Gate Pass issued via the HiPRO portal and verified by the site safety officer.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                C. Material Testing & Slump Logs
              </h3>
              <p>
                For all concrete pours and structural steel deliveries, contractors must provide batch mix slips, 7-day and 28-day cube compression test certificates, and mill test reports (MTR) prior to milestone billing.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer Card */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-display">
              Ready to Partner with Hindustan Projects?
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              Complete your online empanelment in under 10 minutes with our 1-click GST auto-decoder and instant photo compression wizard.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/empanelment/apply"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>Start Application Now</span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
