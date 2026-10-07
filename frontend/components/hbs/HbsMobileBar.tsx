"use client";

import Link from "next/link";
import { Phone, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { cleanTelNumber, getHomeWhatsAppUrl } from "@/lib/hbsWhatsApp";

interface HbsMobileBarProps {
  phone?: string;
  whatsapp?: string;
}

export default function HbsMobileBar({
  phone = "+91 75970 00601",
  whatsapp = "+91 75970 00601",
}: HbsMobileBarProps) {
  const phoneRaw = cleanTelNumber(phone);
  const mobileWaUrl = getHomeWhatsAppUrl(whatsapp);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  return (
    <aside
      aria-label="Quick Contact & Booking"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-3 sm:bottom-4 sm:inset-x-6 max-w-md mx-auto z-50 md:hidden pointer-events-none"
    >
      <div className="pointer-events-auto p-1.5 rounded-2xl bg-[#0B1528]/95 backdrop-blur-2xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(220,38,38,0.2)] flex items-center gap-2 ring-1 ring-white/10">
        {/* 1. Quick Phone Call */}
        <a
          href={`tel:${phoneRaw}`}
          data-hbs-cta="call"
          aria-label={`Call HiBUILD at ${phone}`}
          className="w-11 h-11 shrink-0 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          title="Call Directly"
        >
          <Phone className="w-4 h-4 text-white" />
        </a>

        {/* 2. Direct WhatsApp with Live Status Ping */}
        <a
          href={mobileWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-hbs-cta="whatsapp"
          aria-label="Chat with HiBUILD on WhatsApp"
          className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-400 border border-emerald-500/40 flex items-center justify-center transition-all relative shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          title="Chat on WhatsApp"
        >
          <MessageSquare className="w-4 h-4 text-emerald-300" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </a>

        {/* 3. Primary CTA: Free Site Visit / Consultation */}
        <Link
          href={`${prefix}/contact`}
          data-hbs-cta="quote"
          aria-label="Book Free Site Visit"
          className="flex-1 h-11 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-[0_2px_14px_rgba(220,38,38,0.4)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="font-black truncate">Free Site Visit</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-white shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
