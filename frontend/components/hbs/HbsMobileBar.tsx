"use client";

import Link from "next/link";
import { Phone, MessageSquare, Wrench } from "lucide-react";
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
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 p-2 shadow-2xl safe-area-bottom">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* Call Now */}
        <a
          href={`tel:${phoneRaw}`}
          data-hbs-cta="call"
          className="flex flex-col items-center justify-center py-2 px-1 bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg border border-slate-700/60 text-center transition-all duration-150 active:scale-[0.97] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label={`Call Hind Build at ${phone}`}
        >
          <Phone className="w-4 h-4 text-amber-400 mb-0.5 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Call Now</span>
        </a>

        {/* WhatsApp */}
        <a
          href={mobileWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-hbs-cta="whatsapp"
          className="flex flex-col items-center justify-center py-2 px-1 bg-emerald-700/90 hover:bg-emerald-600 text-white rounded-lg border border-emerald-600/50 text-center transition-all duration-150 active:scale-[0.97] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Chat with Hind Build on WhatsApp"
        >
          <MessageSquare className="w-4 h-4 text-emerald-200 mb-0.5 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
        </a>

        {/* Get Quote */}
        <Link
          href={`${prefix}/contact`}
          data-hbs-cta="quote"
          className="flex flex-col items-center justify-center py-2 px-1 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black rounded-lg border border-amber-400/40 text-center shadow-xs transition-all duration-150 active:scale-[0.97] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label="Request Free Inspection / Quote"
        >
          <Wrench className="w-4 h-4 text-slate-950 mb-0.5 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider">Get Quote</span>
        </Link>
      </div>
    </div>
  );
}
