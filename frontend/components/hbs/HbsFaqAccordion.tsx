"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

interface HbsFaqAccordionProps {
  faqs: FaqItem[];
}

export default function HbsFaqAccordion({ faqs }: HbsFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const buttonId = `faq-btn-${idx}`;
        const panelId = `faq-panel-${idx}`;

        return (
          <div
            key={idx}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "border-red-200 bg-red-50/20 shadow-xs"
                : "border-slate-200/90 bg-white hover:border-slate-300"
            }`}
          >
            <button
              id={buttonId}
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-xl"
            >
              <span className={`text-sm sm:text-base font-bold transition-colors ${
                isOpen ? "text-red-700" : "text-slate-900"
              }`}>
                {faq.q}
              </span>
              <span
                className={`p-1.5 rounded-lg shrink-0 transition-transform duration-200 ${
                  isOpen
                    ? "rotate-180 text-red-600 bg-red-100/70"
                    : "text-slate-400 bg-slate-100"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-red-100/70"
              >
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

