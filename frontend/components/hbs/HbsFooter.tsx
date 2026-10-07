"use client";

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
  HardHat,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";
import { cleanTelNumber, getHomeWhatsAppUrl } from "@/lib/hbsWhatsApp";

interface HbsFooterProps {
  content: HbsContent;
  services?: HbsService[];
}

export default function HbsFooter({ content, services = [] }: HbsFooterProps) {
  const phoneRaw = cleanTelNumber(content.phone || "+919462577757");
  const footerWaUrl = getHomeWhatsAppUrl(content.whatsapp || "919462577757");

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

  // Dynamic services list (prefer CMS services, fallback to core building services)
  const displayedServices =
    services.length > 0
      ? services.slice(0, 8)
      : [
          { title: "Terrace & Roof Waterproofing", slug: "water-leakage-solution" },
          { title: "Structure Repair & Crack Grouting", slug: "structure-repair" },
          { title: "Building Painting & Damp Treatment", slug: "painting-and-wall-repair" },
          { title: "Plumbing & Sanitary Systems", slug: "plumbing-and-electrical" },
          { title: "Terrace Heat Proofing & Coating", slug: "terrace-and-bird-protection" },
          { title: "Anti-Termite Soil Treatment", slug: "termite-control" },
          { title: "Precision Tile & Stone Work", slug: "tile-work" },
          { title: "Commercial & Home Renovation", slug: "renovation-remodeling" },
        ];

  return (
    <footer
      id="site-footer"
      aria-label="Site Footer"
      className="bg-slate-50 text-slate-700 relative border-t border-slate-200/90 overflow-hidden"
    >
      {/* ── Top Brand Accent Ribbon (Deep Blue to Red Line) ── */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0D2D5E] via-red-600 to-[#0D2D5E]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-28 sm:pb-12 z-10 space-y-12">
        {/* ── MAIN 4-COLUMN HIERARCHY ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* COLUMN 1: Brand Identity & Parent Company Trust (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href={homeHref}
              className="inline-flex items-center group focus-visible:outline-none"
              aria-label="HiBUILD Home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hibuild-logo.png"
                alt="HiBUILD - Hind Building Solutions"
                className="h-10 sm:h-12 w-auto object-contain group-hover:scale-[1.02] transition-transform"
              />
            </Link>

            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-sm">
              {content.tagline ||
                "Complete care for your building. Engineering-grade non-destructive diagnostics, chemical waterproofing, structural rehabilitation, painting, and turnkey facility maintenance across Rajasthan."}
            </p>

            {/* Parent Company Heritage Card (Clean Light Style) */}
            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                <span>A Brand Under Hindustan Projects</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Backed by the civil engineering heritage of{" "}
                <a
                  href="https://www.hindustanprojects.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 underline decoration-red-600/50 hover:text-red-600 font-semibold transition-colors"
                >
                  Hindustan Projects (HiPRO)
                </a>
                . Bringing industrial civil rigor to property repair and maintenance.
              </p>
            </div>

            {/* Social Channels */}
            {hasSocials && (
              <div className="pt-1 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                  Follow Our Work
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-red-600 hover:text-red-600 text-slate-600 flex items-center justify-center shadow-2xs transition-all duration-200"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-red-600 hover:text-red-600 text-slate-600 flex items-center justify-center shadow-2xs transition-all duration-200"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-red-600 hover:text-red-600 text-slate-600 flex items-center justify-center shadow-2xs transition-all duration-200"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-red-600 hover:text-red-600 text-slate-600 flex items-center justify-center shadow-2xs transition-all duration-200"
                      aria-label="YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <span>Quick Links</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href={homeHref}
                  className="group flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-medium transition-colors py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/about`}
                  className="group flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-medium transition-colors py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  <span>About HiBUILD</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/services`}
                  className="group flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-medium transition-colors py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  <span>All 19 Services</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/projects`}
                  className="group flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-medium transition-colors py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  <span>Our Projects</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/why-choose-us`}
                  className="group flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-medium transition-colors py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  <span>Why Choose Us</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/contact`}
                  className="group flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-medium transition-colors py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  <span>Book Free Inspection</span>
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-200">
                <a
                  href="https://www.hindustanprojects.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium transition-colors py-0.5"
                >
                  <span>Parent Portal (HiPRO)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-red-600" />
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Core Specialized Services (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>Core Services</span>
              </h3>
              <Link
                href={`${prefix}/services`}
                className="text-[11px] text-red-600 hover:text-red-700 font-bold inline-flex items-center gap-0.5 transition-colors"
              >
                <span>View All (19)</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <ul className="space-y-1.5 text-xs">
              {displayedServices.map((s, idx) => (
                <li key={s.slug || idx}>
                  <Link
                    href={`${prefix}/services/${s.slug}`}
                    className="group flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium transition-colors py-0.5 truncate"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-red-600 transition-colors shrink-0" />
                    <span className="truncate group-hover:translate-x-0.5 transition-transform">
                      {s.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: Contact & Site Support (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <span>Contact &amp; Support</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Address */}
              <div className="flex items-start gap-2.5 text-slate-600">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {content.address || "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001"}
                </span>
              </div>

              {/* Priority Call Card */}
              <div className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  Engineer Priority Line
                </span>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    className="text-slate-900 hover:text-red-600 font-black text-sm tracking-wide transition-colors"
                  >
                    {content.phone || "+91 94625 77757"}
                  </a>
                </div>
              </div>

              {/* WhatsApp Direct */}
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href={footerWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hbs-cta="whatsapp"
                  className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors"
                >
                  WhatsApp Direct Consultation
                </a>
              </div>

              {/* Email */}
              {content.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#0D2D5E] shrink-0" />
                  <a
                    href={`mailto:${content.email}`}
                    className="text-slate-600 hover:text-slate-900 truncate transition-colors"
                  >
                    {content.email}
                  </a>
                </div>
              )}

              {/* Business Hours */}
              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-500 font-medium">
                  {content.businessHours || "Mon – Sat: 8:00 AM – 8:00 PM (Emergency Dispatch)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 TRUST ASSURANCE PILLARS STRIP (Clean Modern Cards) ── */}
        <div className="pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-slate-800 font-bold">Up to 10-Yr Warranty</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <HardHat className="w-4 h-4 text-[#0D2D5E] shrink-0" />
              <span className="text-slate-800 font-bold">Civil Engineer Supervision</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-800 font-bold">ISI Certified Branded Materials</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-slate-800 font-bold">Doorstep Rajasthan Service</span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR: COPYRIGHT & POLICIES ── */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} Hind Building Solutions (HiBUILD). All rights reserved.</p>

          <div className="flex items-center flex-wrap gap-4 text-[11px]">
            {content.privacyPolicyUrl && (
              <Link
                href={content.privacyPolicyUrl}
                className="hover:text-slate-900 transition-colors"
              >
                Privacy Policy
              </Link>
            )}
            {content.termsUrl && (
              <Link
                href={content.termsUrl}
                className="hover:text-slate-900 transition-colors"
              >
                Terms of Service
              </Link>
            )}
            <a
              href="https://www.hindustanprojects.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-red-600 font-semibold transition-colors inline-flex items-center gap-1"
            >
              <span>An Enterprise of Hindustan Projects</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
