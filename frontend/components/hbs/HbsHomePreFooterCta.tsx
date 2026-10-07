"use client";

import Image from "next/image";
import { Phone, MessageSquare, ArrowRight } from "lucide-react";
import type { HbsContent } from "@/lib/types";
import { cleanTelNumber, cleanWhatsAppNumber, buildHbsWhatsAppUrl } from "@/lib/hbsWhatsApp";

interface HbsHomePreFooterCtaProps {
  phoneRaw?: string;
  phoneDisplay?: string;
  whatsappNumber?: string;
  prefix?: string;
  content?: HbsContent;
  isSubdomain?: boolean;
}

export default function HbsHomePreFooterCta({
  phoneRaw: propPhoneRaw,
  phoneDisplay: propPhoneDisplay,
  whatsappNumber: propWhatsappNumber,
  prefix: propPrefix,
  content,
  isSubdomain,
}: HbsHomePreFooterCtaProps) {
  const phoneDisplay = propPhoneDisplay || content?.phone || "+91 75970 00601";
  const phoneRaw = propPhoneRaw || cleanTelNumber(phoneDisplay);
  const whatsappNumber = propWhatsappNumber || cleanWhatsAppNumber(content?.whatsapp);
  const prefix = propPrefix ?? (isSubdomain ? "" : "/hbs");

  const waUrl = buildHbsWhatsAppUrl(
    whatsappNumber,
    "Hello Hind Build Team, I want to inquire about building repair and maintenance services for my property."
  );

  return (
    <section
      aria-label="Contact Hind Build"
      className="relative bg-[#0D2D5E] text-white py-10 sm:py-12 border-b border-black/20 overflow-hidden"
    >
      {/* Subtle architectural backdrop overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-luminosity">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop"
          alt="Building Skyline"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Clean Heading & Subtitle */}
        <div className="space-y-1.5 text-center md:text-left max-w-2xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display tracking-tight">
            Need Professional Building Services?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 font-sans">
            Let&apos;s take care of your property. Fast doorstep site inspection across Bhilwara &amp; Rajasthan.
          </p>
        </div>

        {/* Right: Clean Dual Buttons (Call + WhatsApp) */}
        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3 shrink-0">
          {/* Primary: Call Button */}
          <a
            href={`tel:${phoneRaw}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4 stroke-[2.2]" />
            <span>Call: {phoneDisplay || "+91 94625 77757"}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* Secondary: WhatsApp Button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Us</span>
          </a>
        </div>
      </div>
    </section>
  );
}
