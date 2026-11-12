"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowRight, Phone, MessageSquare } from "lucide-react";
import { COMPANY_INFO } from "@/lib/companyData";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const HOMEPAGE_FAQS: FaqItem[] = [
  {
    id: "faq-project-types",
    question: "What types of construction projects does HiPRO handle?",
    answer:
      "HiPRO delivers comprehensive civil, industrial, commercial, and residential developments across Rajasthan and Western India. Our portfolio includes industrial manufacturing plants, textile factories, commercial complexes, institutional facilities, modern residential bungalows, and specialized civil infrastructure such as water treatment plants and structural rehabilitation projects.",
  },
  {
    id: "faq-turnkey-execution",
    question: "Do you provide end-to-end project execution?",
    answer:
      "Yes, HiPRO specializes in full-lifecycle turnkey execution. We manage projects from architectural planning, site surveying, soil testing, and structural engineering through to material procurement, civil construction, MEP integration, interior finishing, and final regulatory handover under unified, accountable project management.",
  },
  {
    id: "faq-cost-estimate",
    question: "How can I get a construction cost estimate?",
    answer:
      "You can use our interactive online Cost Estimator directly on this website for an instant preliminary estimate based on your built-up area and construction tier. For a comprehensive, itemized Bill of Quantities (BOQ), you can also submit your architectural drawings or schedule a consultation with our senior estimation engineers.",
  },
  {
    id: "faq-site-inspection",
    question: "Can I request a site inspection or consultation?",
    answer:
      "Yes. You can request an on-site inspection or feasibility consultation by contacting our technical team via our contact form, phone (+91 75970 00601), or WhatsApp. Our senior civil engineers conduct thorough site visits to evaluate topographical, structural, soil, and regulatory site parameters.",
  },
  {
    id: "faq-service-locations",
    question: "Which locations does HiPRO serve?",
    answer:
      "Headquartered in Bhilwara, Rajasthan, HiPRO primarily serves Rajasthan and Western India, with completed and ongoing projects across Bhilwara, Chittorgarh, Udaipur, Jaipur, Ajmer, and surrounding industrial corridors and commercial districts.",
  },
  {
    id: "faq-project-quotation",
    question: "How can I request a project quotation?",
    answer:
      "You can request an official project quotation by filling out our inquiry form on the Contact page or calling us directly at +91 75970 00601. Sharing your project scope, location, approximate plot area, and any existing architectural plans helps our team prepare an accurate, competitive proposal quickly.",
  },
  {
    id: "faq-quality-standards",
    question: "How does HiPRO maintain construction quality?",
    answer:
      "Quality is enforced through rigorous engineering protocols: laboratory material testing (cement grade certification, steel tensile verification, aggregate screening), stage-wise site inspections, experienced resident site supervisors, precision concrete batching, and transparent milestone reports shared with clients throughout construction.",
  },
  {
    id: "faq-contact-team",
    question: "How can I contact the HiPRO team?",
    answer:
      "You can reach us via phone or WhatsApp at +91 75970 00601, email us at info@hindustanprojects.in, or visit our head office opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan. Our office is open Monday through Saturday during regular business hours.",
  },
];

export default function FaqSection() {
  // One-open-at-a-time accordion behavior (first open by default for immediate preview)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // Structured FAQPage Schema for Rich Snippets on Google Search
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOMEPAGE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      id="section-faq"
      aria-labelledby="faq-main-heading"
      className="py-16 sm:py-20 lg:py-24 bg-slate-50/70 border-t border-slate-200/80 relative overflow-hidden"
    >
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Subtle Blueprint Grid Accent */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#0B1B3D 1px, transparent 1px), linear-gradient(to right, #0B1B3D 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* =========================================================
            SECTION HEADER
            ========================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 shadow-xs mb-3.5">
            <HelpCircle className="w-3.5 h-3.5 text-construction-red" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-construction-navy">
              Frequently Asked Questions
            </span>
          </div>

          {/* Main Heading */}
          <h2
            id="faq-main-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 font-display tracking-tight leading-tight uppercase mb-3.5"
          >
            Clear Answers To{" "}
            <span className="font-serif italic font-normal text-construction-red normal-case">
              Common Questions
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Everything you need to know about our turnkey execution, engineering standards,
            cost estimation, and site consultation process across Rajasthan.
          </p>
        </div>

        {/* =========================================================
            ACCORDION CONTAINER
            ========================================================= */}
        <div className="space-y-3" role="region" aria-label="Frequently Asked Questions Accordion">
          {HOMEPAGE_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const buttonId = `faq-trigger-${idx}`;
            const panelId = `faq-content-${idx}`;

            return (
              <div
                key={faq.id}
                className={`border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-slate-300 shadow-sm"
                    : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {/* Accordion Header / Button */}
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full min-h-[52px] py-4 px-4 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-construction-navy focus-visible:ring-inset transition-colors select-none"
                  >
                    <span
                      className={`text-xs sm:text-sm md:text-base font-bold font-display tracking-tight transition-colors ${
                        isOpen ? "text-construction-red" : "text-slate-900 hover:text-construction-navy"
                      }`}
                    >
                      {faq.question}
                    </span>

                    {/* Chevron Indicator */}
                    <span
                      className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180 bg-red-50 border-red-200 text-construction-red"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                </h3>

                {/* Accordion Answer Panel */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className={`px-4 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 ${
                    isOpen ? "block animate-in fade-in-50 duration-150" : "hidden"
                  }`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================
            BOTTOM CONTACT CTA STRIP
            ========================================================= */}
        <div className="mt-10 sm:mt-12 p-5 sm:p-6 bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-display uppercase tracking-wide">
              Still have questions about your project?
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Connect with our technical advisors in Bhilwara for personalized project guidance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-construction-navy hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5 text-construction-red" />
            </Link>

            <a
              href={`tel:${COMPANY_INFO.phone}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-wider transition-colors border border-slate-200"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>Call Us</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
