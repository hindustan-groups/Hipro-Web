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
  Youtube,
  Cpu,
  HardHat,
  Award,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";
import { cleanTelNumber, getHomeWhatsAppUrl } from "@/lib/hbsWhatsApp";

interface HbsFooterProps {
  content: HbsContent;
  services?: HbsService[];
}

export default function HbsFooter({ content, services = [] }: HbsFooterProps) {
  const phoneRaw = cleanTelNumber(content.phone || "+917597000601");
  const footerWaUrl = getHomeWhatsAppUrl(content.whatsapp || "917597000601");

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

  // Dynamic services list (prefer CMS services, fallback to core repair services)
  const displayedServices =
    services.length > 0
      ? services.slice(0, 10)
      : [
          { title: "Structure Repair & Rehabilitation", slug: "structure-repair" },
          { title: "Water Leakage & Waterproofing", slug: "water-leakage-solution" },
          { title: "Plumbing & Sanitary Systems", slug: "plumbing-and-electrical" },
          { title: "Painting & Damp Wall Treatment", slug: "painting-and-wall-repair" },
          { title: "Terrace & Heat Proofing", slug: "terrace-and-bird-protection" },
          { title: "Anti-Termite Soil Treatment", slug: "termite-control" },
          { title: "Precision Tile & Stone Work", slug: "tile-work" },
          { title: "AC, Lift & Solar Integration", slug: "ac-lift-solar" },
        ];

  return (
    <footer
      id="site-footer"
      aria-label="Site Footer"
      className="bg-slate-950 text-slate-300 relative border-t border-slate-800/80 overflow-hidden"
    >
      {/* ─────────────────────────────────────────────────────────────────
          TOP AMBER ACCENT LINE WITH GLOW
      ───────────────────────────────────────────────────────────────── */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.6)]" />

      {/* Subtle CAD Blueprint Grid Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Ambient Top Glow Orbs */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────────
          1. RAPID DISPATCH & EMERGENCY HOTLINE RIBBON
      ───────────────────────────────────────────────────────────────── */}
      <div className="relative border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Live Dispatch Beacon */}
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Engineering Dispatch Active
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-slate-400">
                  Bhilwara &amp; Rajasthan Regional Hub · Non-Destructive Inspection Desk
                </span>
              </div>
            </div>

            {/* Quick Emergency Actions */}
            <div className="flex items-center flex-wrap justify-center gap-2.5 sm:gap-3 w-full lg:w-auto">
              <a
                href={`tel:${phoneRaw}`}
                data-hbs-cta="call"
                aria-label={`Call emergency hotline at ${content.phone || "+91 75970 00601"}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold transition-all duration-200 active:scale-[0.98] min-h-[40px]"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call: {content.phone || "+91 75970 00601"}</span>
              </a>

              <a
                href={footerWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-hbs-cta="whatsapp"
                aria-label="WhatsApp Priority Support"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all duration-200 active:scale-[0.98] min-h-[40px]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Priority</span>
              </a>

              <Link
                href={`${prefix}/contact`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold uppercase tracking-wider transition-all duration-200 min-h-[40px]"
              >
                <span>Book Site Visit</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          2. MAIN 4-COLUMN FOOTER HIERARCHY
      ───────────────────────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-36 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* COLUMN 1: HBS Brand Identity & Parent Company Heritage (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              href={homeHref}
              className="group inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              aria-label="Hind Build Home"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content.logoDark || content.logoPrimary || content.logoMark || "/hbs-icon.jpg"}
                  alt={content.brandName || "Hind Build"}
                  className="h-10 sm:h-11 w-auto max-w-[140px] object-contain shrink-0 transition-transform duration-300 group-hover:scale-105 rounded-lg bg-white p-0.5"
                />
                <div>
                  <span className="text-xl font-black text-white uppercase tracking-tight block font-display">
                    {content.brandName || "Hind Build"}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">
                    {content.tagline || "Repair · Maintenance · Protection"}
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Engineering-grade non-destructive diagnostics, chemical waterproofing, structural rehabilitation, and facility upkeep across Bhilwara &amp; Rajasthan.
            </p>

            {/* Parent Company Heritage Card */}
            <div className="p-4 bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800 rounded-xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Parent Company Heritage</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                A specialized engineering division of{" "}
                <Link
                  href="/"
                  className="text-white underline decoration-amber-500/50 hover:decoration-amber-400 hover:text-amber-400 font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 transition-colors"
                >
                  Hindustan Projects (HiPRO)
                </Link>
                . Bringing industrial civil construction rigor to property repair and maintenance.
              </p>
            </div>

            {/* Official Social Channels */}
            {hasSocials && (
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2 font-mono">
                  Official Channels
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-slate-900/90 border border-slate-800 rounded-lg hover:border-amber-500 hover:text-amber-400 hover:-translate-y-0.5 text-slate-400 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
                      className="w-9 h-9 bg-slate-900/90 border border-slate-800 rounded-lg hover:border-amber-500 hover:text-amber-400 hover:-translate-y-0.5 text-slate-400 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
                      className="w-9 h-9 bg-slate-900/90 border border-slate-800 rounded-lg hover:border-amber-500 hover:text-amber-400 hover:-translate-y-0.5 text-slate-400 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
                      className="w-9 h-9 bg-slate-900/90 border border-slate-800 rounded-lg hover:border-amber-500 hover:text-amber-400 hover:-translate-y-0.5 text-slate-400 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      aria-label="Hind Build on YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: Company Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2.5 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Company</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href={homeHref}
                  className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all duration-200 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  <span>Hind Build Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/about`}
                  className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all duration-200 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  <span>About Us &amp; Standards</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/services`}
                  className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all duration-200 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  <span>19 Specialist Trades</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/projects`}
                  className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all duration-200 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  <span>Case Studies &amp; Records</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/contact`}
                  className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all duration-200 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  <span>Book Site Inspection</span>
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-800/60">
                <Link
                  href="/"
                  className="group inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  <span>Parent HiPRO Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Specialized 19 Services Preview (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Specialist Trades</span>
              </h4>
              <Link
                href={`${prefix}/services`}
                className="text-[10px] font-mono uppercase text-amber-400 hover:text-amber-300 font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>All 19</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <ul className="space-y-1.5 text-xs">
              {displayedServices.map((s, idx) => (
                <li key={s.slug || idx}>
                  <Link
                    href={`${prefix}/services/${s.slug}`}
                    className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all duration-200 py-1 truncate focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                  >
                    <span className="font-mono text-[10px] text-slate-500 group-hover:text-amber-400 transition-colors shrink-0">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate group-hover:translate-x-1 transition-transform">
                      {s.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: Diagnostic Desk & Direct Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2.5 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Diagnostic Desk</span>
            </h4>

            <div className="space-y-3.5 text-xs">
              {/* Location */}
              {content.address && (
                <div className="flex items-start gap-2.5 text-slate-400">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{content.address}</span>
                </div>
              )}

              {/* Phone */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Priority Engineer Line
                </span>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    aria-label={`Call Hind Build at ${content.phone || "+91 75970 00601"}`}
                    className="text-white hover:text-amber-400 font-bold font-mono text-sm tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                  >
                    {content.phone || "+91 75970 00601"}
                  </a>
                </div>
              </div>

              {/* WhatsApp Direct */}
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={footerWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hbs-cta="whatsapp"
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                >
                  WhatsApp Direct Consultation
                </a>
              </div>

              {/* Email */}
              {content.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a
                    href={`mailto:${content.email}`}
                    className="text-slate-300 hover:text-white truncate transition-colors py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                  >
                    {content.email}
                  </a>
                </div>
              )}

              {/* Business Hours */}
              {content.businessHours && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800/80">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-400 font-mono">
                    {content.businessHours}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            3. VERIFIED ENGINEERING ASSURANCE PILLARS STRIP
        ───────────────────────────────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-slate-800/80">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300">10-Year Water-Tight Guarantee</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300">Non-Destructive Thermal Profiling</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <HardHat className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300">Senior Civil Engineer Supervision</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Itemized BOQ &amp; Certified Chemicals</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            4. BOTTOM BAR: COPYRIGHT, LEGAL & PARENT LINK
        ───────────────────────────────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} Hind Build. All rights reserved.</p>

          <div className="flex items-center flex-wrap gap-4 text-[11px]">
            {content.privacyPolicyUrl && (
              <Link
                href={content.privacyPolicyUrl}
                className="hover:text-amber-400 transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
              >
                Privacy Policy
              </Link>
            )}
            {content.privacyPolicyUrl && content.termsUrl && (
              <span aria-hidden="true" className="text-slate-700">•</span>
            )}
            {content.termsUrl && (
              <Link
                href={content.termsUrl}
                className="hover:text-amber-400 transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
              >
                Terms of Service
              </Link>
            )}
            {(content.privacyPolicyUrl || content.termsUrl) && (
              <span aria-hidden="true" className="text-slate-700">•</span>
            )}
            <span className="text-slate-400">
              A Hindustan Projects Company
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
