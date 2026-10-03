"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowRight,
  Award,
  Layers,
  Calculator,
} from "lucide-react";
import EstimatorEngine from "@/components/estimator/EstimatorEngine";
import type { CostEstimatorCMSConfig } from "@/components/estimator/types";
import { DEFAULT_ESTIMATOR_CMS_CONFIG } from "@/components/estimator/configDefaults";
import { COMPANY_INFO } from "@/lib/companyData";

const FAQ_ITEMS = [
  {
    q: "What is the average house construction cost per sq. ft in Bhilwara and Rajasthan?",
    a: "In 2026, standard turnkey residential house construction in Bhilwara and across Rajasthan ranges from ₹1,680 to ₹2,450 per sq. ft of built-up area. A standard Silver package costs ~₹1,680/sqft, our most popular Gold (Classic) package costs ₹1,850/sqft (using Tata/UltraTech/Jaquar), and architectural luxury packages (Platinum/Royale) range from ₹2,150 to ₹2,450/sqft depending on imported Italian marble, UPVC double-glazing, and designer elevation treatments.",
  },
  {
    q: "How much does it cost to build a house on a 100 Gaj (900 sqft) plot?",
    a: "For a 100 Gaj (20×45 ft) plot, built-up area typically averages around 1,500 sqft for a G+1 duplex home (including ground coverage, first floor living, parking, and balcony). At our Gold Package rate of ₹1,850/sqft, the estimated complete turnkey construction cost is approximately ₹27.75 Lakhs to ₹29.5 Lakhs, including foundation, RCC structure, brick masonry, premium tiles, Jaquar bath fittings, modular switches, and exterior 3D elevation.",
  },
  {
    q: "Why should I use Hindustan Projects instead of hiring a local 'Thekedar' (contractor)?",
    a: "Local contractors often provide vague initial verbal quotes that later balloon with 30-50% cost overruns, substandard duplicate materials (unbranded steel/cement), delayed timelines, and zero post-handover warranty. Hindustan Projects provides a legally binding Guaranteed Fixed-Price Agreement, 100% genuine brand factory invoicing (Tata Tiscon, UltraTech 53, Jaquar, Asian Paints), an escrow-style 9-stage payment release schedule, and an official 10-Year Structural Integrity Warranty.",
  },
  {
    q: "What is the difference between Plot Area and Built-up Area?",
    a: "Plot Area is the total boundary footprint of your land (e.g. 1,500 sq. ft or ~167 Gaj). Built-up Area is the actual constructed floor space across all levels. For a Ground + 1 Floor house on a 1,500 sqft plot, the built-up area is roughly 2,520 sqft (Ground floor ~1,200 sqft + First floor ~1,200 sqft + Covered parking & balconies ~120 sqft). Construction cost is always calculated on the total Built-Up Area.",
  },
  {
    q: "Are architectural drawings, 3D elevation, and structural designs included?",
    a: "Yes! Every turnkey construction package with Hindustan Projects includes complete Vastu-compliant 2D architectural floor plans, 3D photo-realistic exterior elevation renders, structural engineering CAD blueprints, and plumbing/electrical working drawings at zero additional charge.",
  },
  {
    q: "How do milestone-based payments work?",
    a: "You never pay large upfront sums. Payments are divided into 9 safe, certified milestone stages (e.g., Booking 5%, Foundation 10%, Plinth 10%, Ground Slab 15%, First Slab 15%, Brickwork 15%, Finishing 15%, Paint & Elevation 10%, Final Handover 5%). Each stage is only billed after physical inspection and quality sign-off by our site engineers.",
  },
];

export default function CostEstimatorPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [cmsConfig, setCmsConfig] = useState<CostEstimatorCMSConfig>(DEFAULT_ESTIMATOR_CMS_CONFIG);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.pageContent) {
          try {
            const pc =
              typeof data.data.pageContent === "string"
                ? JSON.parse(data.data.pageContent)
                : data.data.pageContent;
            if (pc.costEstimator) {
              setCmsConfig(pc.costEstimator);
            }
          } catch {
            // keep fallback
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      
      {/* JSON-LD Structured Data for FAQ, BreadcrumbList & WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                "@id": "https://www.hindustanprojects.in/cost-estimator#app",
                name: "Hindustan Projects House Construction Cost Estimator",
                url: "https://www.hindustanprojects.in/cost-estimator",
                applicationCategory: "RealEstateApplication",
                operatingSystem: "All",
                provider: {
                  "@id": "https://www.hindustanprojects.in/#organization",
                },
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "INR",
                },
                description:
                  "Interactive house construction cost calculator for Bhilwara and Rajasthan. Calculate package-wise BOQ estimates and material breakdowns by Hindustan Projects.",
              },
              {
                "@type": "BreadcrumbList",
                "@id": "https://www.hindustanprojects.in/cost-estimator#breadcrumb",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.hindustanprojects.in",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Cost Estimator",
                    item: "https://www.hindustanprojects.in/cost-estimator",
                  },
                ],
              },
              {
                "@type": "FAQPage",
                "@id": "https://www.hindustanprojects.in/cost-estimator#faq",
                mainEntity: FAQ_ITEMS.map((faq) => ({
                  "@type": "Question",
                  name: faq.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.a,
                  },
                })),
              },
            ],
          }),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ======================================================== */}
        {/* HERO SECTION                                             */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto pt-6 pb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-50 border border-red-200 text-[#D9232A] text-xs font-bold uppercase tracking-widest mb-4">
            <Calculator className="w-3.5 h-3.5" />
            <span>{cmsConfig.heroBadge || "Rajasthan Construction Intelligence Engine"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 font-display tracking-tight leading-[1.15] mb-5">
            {cmsConfig.heroTitle || "House Construction Cost Calculator"}{" "}
            <br className="hidden sm:inline" />
            <span className="text-[#D9232A]">
              {cmsConfig.heroAccent || "& Itemized BOQ Engine"}
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
            {cmsConfig.heroDescription ||
              "Plan your dream home with Rajasthan’s most transparent construction estimation tool. Get instant, engineer-verified material breakdowns, package specifications, and milestone budgets for Bhilwara, Jaipur, Udaipur & beyond."}
          </p>

          {/* Quick Trust Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 p-4 shadow-2xs text-left">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#D9232A] shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900">Fixed-Price</div>
                <div className="text-[10px] text-slate-500">Zero Cost Overruns</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Award className="w-6 h-6 text-[#0F2C59] shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900">10-Yr Warranty</div>
                <div className="text-[10px] text-slate-500">Structural Guarantee</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900">100% Escrow</div>
                <div className="text-[10px] text-slate-500">Milestone Payments</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-6 h-6 text-blue-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900">150+ Builds</div>
                <div className="text-[10px] text-slate-500">Rajasthan Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE ESTIMATOR ENGINE TOOL                        */}
        {/* ======================================================== */}
        <section className="mb-20">
          <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Construction Estimator...</div>}>
            <EstimatorEngine
              initialArea={1500}
              initialFloors="g+1"
              initialTier="Gold"
              cmsConfig={cmsConfig}
            />
          </Suspense>
        </section>

        {/* ======================================================== */}
        {/* WHY HIPRO VS LOCAL CONTRACTOR COMPARISON TABLE           */}
        {/* ======================================================== */}
        <section className="mb-20 bg-white border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D9232A] mb-2 block">
              Transparent Engineering
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-slate-900">
              Hindustan Projects vs. Local Contractors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Why 200+ families across Bhilwara and Rajasthan trust our civil-engineering approach over traditional verbal thekedars.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm min-w-[650px]">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="p-4 font-bold text-slate-700 uppercase tracking-wider w-1/3">Key Parameter</th>
                  <th className="p-4 font-bold text-[#D9232A] uppercase tracking-wider w-1/3 bg-red-50/50">Hindustan Projects (HiPRO)</th>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-wider w-1/3">Traditional Local Contractor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-semibold text-slate-800">Cost Transparency</td>
                  <td className="p-4 bg-red-50/20 font-bold text-emerald-700">Guaranteed Fixed-Price Contract. Zero escalation clause.</td>
                  <td className="p-4 text-slate-500">Starts low; frequent hidden charges & 25-40% budget overruns.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-800">Material Brand Assurance</td>
                  <td className="p-4 bg-red-50/20 font-bold text-emerald-700">100% Verified Factory Invoices: Tata Tiscon, UltraTech, Jaquar.</td>
                  <td className="p-4 text-slate-500">Unbranded or duplicate regional materials with zero lab test certs.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-800">Payment Security</td>
                  <td className="p-4 bg-red-50/20 font-bold text-emerald-700">Escrow-style 9-Stage Milestone schedule. Pay only as work is verified.</td>
                  <td className="p-4 text-slate-500">Demands heavy advance payments before work even starts.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-800">Structural Warranty</td>
                  <td className="p-4 bg-red-50/20 font-bold text-emerald-700">Official 10-Year Structural Guarantee + 1-Year Free Maintenance.</td>
                  <td className="p-4 text-slate-500">Zero written warranty. Disappears after handover when cracks appear.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-800">Quality Control Audit</td>
                  <td className="p-4 bg-red-50/20 font-bold text-emerald-700">140+ Point QC Audit with digital site reports & cube compression tests.</td>
                  <td className="p-4 text-slate-500">Zero engineering supervision; left entirely to untrained masons.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-800">Timeline Commitment</td>
                  <td className="p-4 bg-red-50/20 font-bold text-emerald-700">Contractual On-Time Handover with penalty guarantee for delays.</td>
                  <td className="p-4 text-slate-500">Frequent 6 to 12 month unmonitored construction delays.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ======================================================== */}
        {/* FAQS SECTION                                             */}
        {/* ======================================================== */}
        <section className="mb-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D9232A] mb-2 block">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-slate-900">
              House Construction Cost in Rajasthan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Common questions answered by our chief civil estimation engineers.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white border border-slate-200 transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60"
                  >
                    <span className="text-sm font-bold text-slate-900 font-display">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-[#D9232A]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* BOTTOM CALL TO ACTION BANNER                             */}
        {/* ======================================================== */}
        <div className="bg-[#0F2C59] text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-block bg-[#D9232A] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 mb-3">
              Free Engineering Site Feasibility
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-white mb-2">
              Already have an architectural floor plan?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Send your blueprint or plot survey to our senior civil engineers in Bhilwara for a formal itemized BOQ tender and fixed-price quotation within 24 hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/91${COMPANY_INFO.whatsappNumber || "7597000601"}?text=Hello%20Hindustan%20Projects%2C%20I%20have%20an%20architectural%20plan%20and%20would%20like%20a%20detailed%20BOQ%20quote.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider text-center transition-all shadow-md"
            >
              WhatsApp Architectural Plan
            </a>

            <Link
              href="/contact"
              className="px-6 py-3.5 bg-white text-[#0F2C59] hover:bg-slate-100 font-bold text-xs uppercase tracking-wider text-center transition-all shadow-md"
            >
              Contact Our Engineers
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
