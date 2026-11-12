"use client";

import { useState, useEffect } from "react";
import { Phone, MessageSquare } from "lucide-react";
import { COMPANY_INFO } from "@/lib/companyData";

export default function MobileStickyBar() {
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const phone = COMPANY_INFO.phone;
  const whatsappText = encodeURIComponent(
    "Hello HiPRO, I would like to discuss a construction/engineering project."
  );
  const whatsappUrl = `https://wa.me/917597000601?text=${whatsappText}`;

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const footer = document.getElementById("main-footer") || document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry) {
          setIsFooterVisible(entry.isIntersecting);
        }
      },
      {
        root: null,
        // Hide as soon as the top of footer enters the mobile viewport
        threshold: 0.02,
        rootMargin: "0px 0px 0px 0px",
      }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-2xl px-3 py-2 flex items-center gap-2 safe-bottom transition-all duration-300 ease-in-out transform ${
        isFooterVisible
          ? "translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto"
      }`}
      role="region"
      aria-label="Quick Mobile Contact"
    >
      <a
        href={`tel:${phone}`}
        data-analytics-location="mobile_sticky_bar"
        className="flex-1 inline-flex items-center justify-center gap-2 bg-construction-navy hover:bg-blue-900 active:bg-blue-950 text-white font-bold py-3 px-3 rounded-none text-xs uppercase tracking-wider shadow-md transition-colors"
        aria-label="Call Hindustan Projects"
      >
        <Phone className="w-4 h-4 text-construction-red" />
        <span>Call HiPRO</span>
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics-location="mobile_sticky_bar"
        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white font-bold py-3 px-3 rounded-none text-xs uppercase tracking-wider shadow-md transition-colors"
        aria-label="Chat with Hindustan Projects on WhatsApp"
      >
        <MessageSquare className="w-4 h-4 fill-white" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
