"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Inbox,
  Clock,
  Briefcase,
  QrCode,
  ArrowRight,
  Award,
  Zap,
  Lock,
  Phone,
  FileText,
  ChevronRight,
  HelpCircle,
  Truck,
  Building2,
} from "lucide-react";

export default function EmpanelmentLandingPage() {
  const tiers = [
    {
      name: "TIER A • MEGA CONTRACTOR",
      range: "Above ₹2 Crore",
      rangeHi: "₹2 करोड़ से ऊपर",
      desc: "Turnkey Civil Construction, PEB Structural Steel, Major MEP Projects & Heavy Earthmoving.",
      color: "border-amber-400 bg-amber-50/50 text-amber-900",
      badge: "Turnkey Prime",
    },
    {
      name: "TIER B • CORE CIVIL & MEP",
      range: "₹50 Lakh – ₹2 Crore",
      rangeHi: "₹50 लाख से ₹2 करोड़",
      desc: "Reinforced Concrete, Masonry & Plastering, Electrical Substations, Commercial HVAC & Plumbing.",
      color: "border-blue-300 bg-blue-50/50 text-blue-900",
      badge: "Core Works",
    },
    {
      name: "TIER C • SPECIALIZED TRADE",
      range: "₹10 Lakh – ₹50 Lakh",
      rangeHi: "₹10 लाख से ₹50 लाख",
      desc: "Flooring & Tiling, Waterproofing Systems, Painting & Texture, Aluminum Glazing, Fabrication.",
      color: "border-emerald-300 bg-emerald-50/50 text-emerald-900",
      badge: "Specialized",
    },
    {
      name: "TIER D • LOCAL CONTRACTOR",
      range: "Under ₹10 Lakh",
      rangeHi: "₹10 लाख से कम",
      desc: "Masonry Sub-contractors, Skilled Labour Supply, Ready-mix & Brick Suppliers, Minor Site Works.",
      color: "border-slate-300 bg-slate-50 text-slate-800",
      badge: "Local Sub-Contract",
    },
  ];

  const steps = [
    { num: "01", title: "Instant GST Verification", titleHi: "जीएसटी एवं पैन जांच", desc: "Enter your 15-digit GSTIN. Our system auto-decodes your state, enterprise entity, and PAN." },
    { num: "02", title: "Contact & Banking Coordinates", titleHi: "संपर्क एवं बैंक खाता", desc: "Submit key proprietor details, registered address, and bank account for direct RTGS payouts." },
    { num: "03", title: "KYC Document Upload", titleHi: "दस्तावेज़ अपलोड", desc: "Upload GST Certificate, PAN Card, and Cancelled Cheque. Mobile camera photos auto-compress." },
    { num: "04", title: "Technical Verification & Scoring", titleHi: "दस्तावेज़ सत्यापन", desc: "Our procurement engineers verify past work experience and assign capacity Tier (A/B/C/D)." },
    { num: "05", title: "Smart PVC Card & Site Passes", titleHi: "स्मार्ट कार्ड एवं गेट पास", desc: "Receive your Digital PVC ID Card and generate daily 24-hr site gate passes for your workforce." },
  ];

  const faqs = [
    {
      q: "Who is eligible to register on this portal? / कौन पंजीकरण कर सकता है?",
      a: "Any contractor, firm, proprietorship, or supplier operating in Rajasthan & North India dealing in Civil, Electrical, MEP, Finishing, or Material Supply with a valid PAN/GST can register.",
    },
    {
      q: "How long does KYC verification take? / सत्यापन में कितना समय लगता है?",
      a: "Applications are typically processed within 24 to 48 working hours by our Jaipur procurement desk. You can track live status anytime using your unique Tracking ID.",
    },
    {
      q: "How does the Daily Site Gate Pass work? / डेली गेट पास कैसे काम करता है?",
      a: "Approved vendors simply enter their Tracking ID on our portal before arriving at site, enter workforce head count and vehicle number, and get an instant QR pass that security guards scan at the gate.",
    },
    {
      q: "How do I participate in active construction tenders? / टेंडर में भाग कैसे लें?",
      a: "Visit the Active Tenders section. Select any open procurement package, verify your Tracking ID, and submit your commercial quotation and completion timeline.",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section (Warm Architectural Luxury & High Trust) */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-amber-500/10 via-slate-50/50 to-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-200 shadow-2xs text-amber-900 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Official Vendor & Contractor Empanelment • 2026 Registry</span>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display leading-[1.15]">
              Partner with Hindustan Projects as a Verified Contractor
            </h1>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              वेंडर एवं ठेकेदार आधिकारिक पंजीकरण पोर्टल — पारदर्शी ऑनलाइन टेंडरिंग, तत्काल डेली साइट गेट पास, एवं समय पर सुरक्षित भुगतान।
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/empanelment/apply"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Apply for Empanelment / नया पंजीकरण</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/empanelment/track"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-bold text-sm shadow-xs flex items-center gap-2 transition-all"
            >
              <span>Track Status & Smart Card / स्थिति जांचें</span>
            </Link>
          </div>

          {/* 4 Feature Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8 text-left">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-bold text-slate-900">Direct RTGS Payouts</p>
              <p className="text-[11px] text-slate-500">Milestone-linked digital billing</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-1">
              <QrCode className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-bold text-slate-900">24-Hr Site Gate Passes</p>
              <p className="text-[11px] text-slate-500">Instant labour entry QR</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-1">
              <Award className="w-4 h-4 text-violet-600" />
              <p className="text-xs font-bold text-slate-900">PVC Smart ID Card</p>
              <p className="text-[11px] text-slate-500">Official verified credentials</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-1">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-bold text-slate-900">L1 Bidding Radar</p>
              <p className="text-[11px] text-slate-500">Transparent active tenders</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Quick Portals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
            Fast Access Contractor Portals
          </h2>
          <p className="text-xs text-slate-500">ठेकेदारों एवं सप्लायर्स के लिए त्वरित ऑनलाइन सेवाएं</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/empanelment/apply"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                New Registration (नया पंजीकरण)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                5-step quick onboarding with 1-click GSTIN auto-fill and instant application tracking.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
              Start Application <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/empanelment/track"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                Track Application & ID Card
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Check approval stage and download your PVC Smart Card with dynamic QR verification.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
              Check Status <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/empanelment/tenders"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-violet-400 transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-violet-700 transition-colors">
                Active Construction Tenders
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Explore active site work packages in Civil, MEP & Finishing and submit quotations online.
              </p>
            </div>
            <span className="text-xs font-bold text-violet-700 flex items-center gap-1">
              View Active Tenders <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/empanelment/gate-pass"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-rose-400 transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                Daily 24-Hr Site Gate Pass
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generate security gate passes with labour headcount and vehicle number for site access.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
              Generate Gate Pass <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* Contractor Capacity Tiers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-10 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-xl space-y-8">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              Procurement Classification
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display">
              Contractor Capacity Tiers (श्रेणी विभाजन)
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Every partner is evaluated based on annual turnover, machinery, and past execution track record:
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((t, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                      {t.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white tracking-wide">{t.name}</h3>
                  <p className="text-xs font-bold text-amber-400 mt-0.5">{t.range}</p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-Step Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
            How Empanelment Works (पंजीकरण प्रक्रिया)
          </h2>
          <p className="text-xs text-slate-500">5 सरल चरणों में आधिकारिक अनुबंध भागीदार बनें</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {steps.map((st, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 relative"
            >
              <span className="text-2xl font-black font-display text-amber-500/30 block">
                {st.num}
              </span>
              <h3 className="font-bold text-slate-900 text-xs">{st.title}</h3>
              <p className="text-[10px] font-semibold text-slate-400">{st.titleHi}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
            Frequently Asked Questions (अक्सर पूछे जाने वाले सवाल)
          </h2>
          <p className="text-xs text-slate-500">Need help? Read common questions below or contact our desk</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
            >
              <h3 className="font-bold text-xs md:text-sm text-slate-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pre-footer Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center space-y-4 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-black font-display">
            Ready to Build with Hindustan Projects?
          </h2>
          <p className="text-xs md:text-sm max-w-xl mx-auto text-amber-50 leading-relaxed">
            Submit your application today. Direct work orders, verified PVC ID credentials, and prompt milestone payments.
          </p>
          <div className="pt-2">
            <Link
              href="/empanelment/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all"
            >
              <span>Begin Registration (पंजीकरण शुरू करें)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
