import Link from "next/link";
import { Phone, Mail, MapPin, MessageSquare, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";

interface HbsFooterProps {
  content: HbsContent;
  services?: HbsService[];
}

export default function HbsFooter({ content, services = [] }: HbsFooterProps) {
  const phoneRaw = content.phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  // Display top 12 services in footer or slice
  const displayedServices = services.length > 0 ? services.slice(0, 12) : [
    { title: "Structure Repair", slug: "structure-repair" },
    { title: "Water Leakage Solution", slug: "water-leakage-solution" },
    { title: "Plumbing & Electrical", slug: "plumbing-and-electrical" },
    { title: "Painting & Wall Repair", slug: "painting-and-wall-repair" },
    { title: "Terrace & Bird Protection", slug: "terrace-and-bird-protection" },
    { title: "Termite Control", slug: "termite-control" },
    { title: "Tile Work", slug: "tile-work" },
    { title: "AC, Lift & Solar", slug: "ac-lift-solar" },
    { title: "Electrical & Machine Work", slug: "electrical-and-machine-work" },
    { title: "Safety & Compliance", slug: "safety-and-compliance" },
    { title: "Cleaning Services", slug: "cleaning-services" },
    { title: "Fabrication Work", slug: "fabrication-work" },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 md:pb-12 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
                HBS
              </div>
              <div>
                <span className="text-lg font-black text-white uppercase tracking-tight block">
                  Hind Building Solutions
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                  Repair · Maintenance · Protection
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Hind Building Solutions (HBS) delivers certified, non-destructive building maintenance, waterproofing, structural repairs, and specialized facility services across Bhilwara and Rajasthan. Backed by the engineering heritage of Hindustan Projects (HiPRO).
            </p>

            <div className="p-3 bg-slate-900 border border-slate-800 text-xs space-y-1 rounded-none">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Parent Company Trust</span>
              </div>
              <p className="text-[11px] text-slate-400">
                A specialized sub-brand under{" "}
                <Link href="/" className="text-white underline hover:text-amber-400 font-semibold">
                  Hindustan Projects (HiPRO)
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Column 2: 19 Services Preview */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2">
              Featured Services
            </h4>
            <ul className="space-y-1.5 text-xs">
              {displayedServices.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`${prefix}/services#${s.slug}`}
                    className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="text-[10px] text-amber-500 opacity-60 group-hover:opacity-100">›</span>
                    <span>{s.title}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href={`${prefix}/services`}
                  className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px] uppercase tracking-wider"
                >
                  <span>View All 19 Services</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={homeHref} className="text-slate-400 hover:text-white transition-colors">
                  HBS Home
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/about`} className="text-slate-400 hover:text-white transition-colors">
                  About HBS
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/services`} className="text-slate-400 hover:text-white transition-colors">
                  All 19 Services
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/projects`} className="text-slate-400 hover:text-white transition-colors">
                  Our Work & Case Studies
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/contact`} className="text-slate-400 hover:text-white transition-colors">
                  Book Site Inspection
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-800/80">
                <Link href="/" className="text-amber-400 hover:underline inline-flex items-center gap-1">
                  <span>Visit Hindustan Projects ↗</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2">
              Helpdesk & Site Office
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{content.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`tel:${phoneRaw}`} className="text-white hover:text-amber-400 font-semibold">
                  {content.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${whatsappRaw}?text=Hi%20HBS,%20I%20need%20building%20repair%20assistance.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  WhatsApp Direct
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`mailto:${content.email}`} className="text-slate-300 hover:text-white">
                  {content.email}
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-slate-800">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-400">{content.businessHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Hind Building Solutions (HBS). All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy-policy" className="hover:text-slate-400">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-400">Terms of Service</Link>
            <span>•</span>
            <span className="text-slate-600">A Hindustan Projects Company</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
