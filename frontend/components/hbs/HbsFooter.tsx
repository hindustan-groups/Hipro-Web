import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Facebook,
  Linkedin,
  Youtube
} from "lucide-react";
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

  // Parse social links safely
  let socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  } = {};
  try {
    if (content.socialLinks) {
      socialLinks =
        typeof content.socialLinks === "string"
          ? JSON.parse(content.socialLinks)
          : content.socialLinks;
    }
  } catch {}

  const hasSocials = Boolean(
    socialLinks.instagram ||
      socialLinks.facebook ||
      socialLinks.linkedin ||
      socialLinks.youtube
  );

  // Dynamic services list (prefer CMS services, fallback to core 8 repair services)
  const displayedServices =
    services.length > 0
      ? services.slice(0, 10)
      : [
          { title: "Structure Repair", slug: "structure-repair" },
          { title: "Water Leakage Solution", slug: "water-leakage-solution" },
          { title: "Plumbing & Electrical", slug: "plumbing-and-electrical" },
          { title: "Painting & Wall Repair", slug: "painting-and-wall-repair" },
          { title: "Terrace & Bird Protection", slug: "terrace-and-bird-protection" },
          { title: "Termite Control", slug: "termite-control" },
          { title: "Tile Work", slug: "tile-work" },
          { title: "AC, Lift & Solar", slug: "ac-lift-solar" },
        ];

  return (
    <footer
      aria-label="Site Footer"
      className="bg-slate-950 text-slate-300 pt-16 pb-24 md:pb-12 border-t-4 border-amber-500"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main 4-Column Footer Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: HBS Brand Identity & Parent Heritage (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href={homeHref}
              className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Hind Build Home"
            >
              {content.logoDark || content.logoPrimary ? (
                <img
                  src={content.logoDark || content.logoPrimary || ""}
                  alt={content.brandName || "Hind Build"}
                  className="h-10 sm:h-11 w-auto max-w-[220px] object-contain"
                />
              ) : content.logoMark ? (
                <div className="flex items-center gap-3">
                  <img
                    src={content.logoMark}
                    alt={content.brandName || "Hind Build"}
                    className="w-10 h-10 object-contain shrink-0"
                  />
                  <div>
                    <span className="text-lg font-black text-white uppercase tracking-tight block font-display">
                      {content.brandName || "Hind Build"}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">
                      {content.tagline || "Repair · Maintenance · Protection"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shrink-0 font-mono">
                    HB
                  </div>
                  <div>
                    <span className="text-lg font-black text-white uppercase tracking-tight block font-display">
                      {content.brandName || "Hind Build"}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">
                      {content.tagline || "Repair · Maintenance · Protection"}
                    </span>
                  </div>
                </div>
              )}
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Certified, non-destructive building maintenance, waterproofing, structural repairs, and specialized facility services across Bhilwara and Rajasthan. Backed by the engineering heritage of Hindustan Projects (HiPRO).
            </p>

            {/* Parent Company Endorsement */}
            <div className="p-3 bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Parent Company Heritage</span>
              </div>
              <p className="text-[11px] text-slate-400">
                A specialized engineering division of{" "}
                <Link
                  href="/"
                  className="text-white underline hover:text-amber-400 font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  Hindustan Projects (HiPRO)
                </Link>
                .
              </p>
            </div>

            {/* Official Social Channels (Render only when configured) */}
            {hasSocials && (
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2 font-mono">
                  Official Channels
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-amber-400 text-slate-400 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      aria-label="Hind Build on Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-amber-400 text-slate-400 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      aria-label="Hind Build on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-amber-400 text-slate-400 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      aria-label="Hind Build on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-amber-400 text-slate-400 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      aria-label="Hind Build on YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Company Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2 font-mono">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href={homeHref}
                  className="text-slate-400 hover:text-amber-400 transition-colors py-1 inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  Hind Build Home
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/about`}
                  className="text-slate-400 hover:text-amber-400 transition-colors py-1 inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  About Hind Build
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/projects`}
                  className="text-slate-400 hover:text-amber-400 transition-colors py-1 inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  Case Studies &amp; Work
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/contact`}
                  className="text-slate-400 hover:text-amber-400 transition-colors py-1 inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  Book Site Inspection
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-white transition-colors py-1 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  <span>Parent HiPRO Portal</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Specialized 19 Services Preview (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                Featured Services
              </h4>
              <Link
                href={`${prefix}/services`}
                className="text-[10px] font-mono uppercase text-amber-400 hover:text-amber-300 font-bold"
              >
                All 19 →
              </Link>
            </div>
            <ul className="space-y-1.5 text-xs">
              {displayedServices.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`${prefix}/services/${s.slug}`}
                    className="text-slate-400 hover:text-amber-400 transition-colors block truncate py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Direct Contact & Hotline (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2 font-mono">
              Contact & Hotline
            </h4>
            <div className="space-y-3 text-xs">
              {content.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-400 leading-relaxed">{content.address}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${phoneRaw}`}
                  className="text-slate-200 hover:text-amber-400 font-bold font-mono py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  {content.phone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Build,%20I%20need%20building%20repair%20assistance.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                >
                  WhatsApp Direct
                </a>
              </div>

              {content.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a
                    href={`mailto:${content.email}`}
                    className="text-slate-300 hover:text-white truncate py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                  >
                    {content.email}
                  </a>
                </div>
              )}

              {content.businessHours && (
                <div className="flex items-start gap-2 pt-2 border-t border-slate-800">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-400 font-mono">
                    {content.businessHours}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal & Parent Company Relationship */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} Hind Build. All rights reserved.</p>

          <div className="flex items-center flex-wrap gap-4 text-[11px]">
            {content.privacyPolicyUrl && (
              <Link
                href={content.privacyPolicyUrl}
                className="hover:text-slate-400 transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
              >
                Privacy Policy
              </Link>
            )}
            {content.privacyPolicyUrl && content.termsUrl && (
              <span aria-hidden="true">•</span>
            )}
            {content.termsUrl && (
              <Link
                href={content.termsUrl}
                className="hover:text-slate-400 transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
              >
                Terms of Service
              </Link>
            )}
            {(content.privacyPolicyUrl || content.termsUrl) && (
              <span aria-hidden="true">•</span>
            )}
            <span className="text-slate-400">A Hindustan Projects Company</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
