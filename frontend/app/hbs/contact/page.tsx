import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  Loader2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ChevronRight,
  ShieldCheck,
  HardHat,
  Wrench,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Camera,
  FileText,
  BadgeCheck,
  Building,
} from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";
import { fetchHbsContent, fetchHbsServices } from "@/lib/hbsData";
import {
  cleanTelNumber,
  cleanWhatsAppNumber,
  buildHbsWhatsAppUrl,
} from "@/lib/hbsWhatsApp";
import HbsContactForm from "./HbsContactForm";
import HbsHomePreFooterCta from "@/components/hbs/HbsHomePreFooterCta";
import HbsFaqAccordion from "@/components/hbs/HbsFaqAccordion";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchHbsContent();
  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const baseUrl = isSubdomain
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in";
  const canonicalUrl = `${baseUrl}/contact`;

  const title = "Contact & Book Free Site Inspection | Hind Build";
  const description =
    "Book a 100% free doorstep site inspection with non-destructive diagnostics and itemized BOQ across Rajasthan. Direct civil engineering dispatch in Bhilwara, Jaipur, Udaipur, Kota, and Ajmer.";

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: content.ogDefaultImage || `${baseUrl}/hbs-og-default.svg`,
          width: 1200,
          height: 630,
          alt: "Contact Hind Build",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const CONTACT_FAQS = [
  {
    q: "Is the doorstep site inspection really 100% free with no hidden charges?",
    a: "Yes. Our initial doorstep evaluation by a qualified civil engineer is 100% complimentary across covered zones in Rajasthan. We perform non-destructive moisture readings, assess substrate conditions, and deliver an itemized digital BOQ with zero obligation to proceed.",
  },
  {
    q: "How soon will an engineer arrive at my site after submitting this request?",
    a: "Our dispatch coordinator calls you within 15–30 minutes during business hours (9:00 AM – 7:00 PM). Inspection visits are typically scheduled within 24 to 48 hours at your convenience. For active emergency pipe bursts or roof leaks, same-day rapid dispatch is prioritized.",
  },
  {
    q: "Can I send dampness or crack photos on WhatsApp for preliminary advice first?",
    a: "Absolutely! You can click the 'Send Photos on WhatsApp' button on this page to share clear photos or videos of the affected walls, ceiling, or floors directly with our technical desk. Our engineers will review the images and provide initial diagnostic feedback before the visit.",
  },
  {
    q: "How does Hind Build ensure transparent pricing without cost overruns?",
    a: "We provide an itemized line-item BOQ (Bill of Quantities) that details exact surface measurements, chemical systems (Dr. Fixit, Fosroc, Sika), application thicknesses (DFT/WFT), and labour rates upfront. There are no vague lump-sums and zero surprise price escalations.",
  },
  {
    q: "Do you provide written warranties on completed repair work?",
    a: "Yes. Every completed waterproofing, structural crack remediation, and chemical barrier project receives an official written Hind Build warranty certificate (up to 10 years depending on the service tier) backed by rigorous post-execution flood testing.",
  },
];

export default async function HbsContactPage() {
  const [content, allServices] = await Promise.all([
    fetchHbsContent(),
    fetchHbsServices(),
  ]);

  const services = allServices.filter((s) => s.active !== false);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const phone = content?.phone || "+91 75970 00601";
  const whatsapp = content?.whatsapp || "+91 75970 00601";
  const phoneRaw = cleanTelNumber(phone);
  const whatsappRaw = cleanWhatsAppNumber(whatsapp);
  const email = content?.email || "hbs@hindustanprojects.in";
  const address =
    content?.address ||
    "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001";
  const workingHours =
    content?.businessHours || "Monday to Saturday: 9:00 AM – 7:00 PM";

  const photoWaUrl = buildHbsWhatsAppUrl(
    whatsapp,
    "Hi Hind Build, I would like to send photos of our building problem for preliminary technical review and quote."
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact & Book Site Inspection | Hind Build",
    description:
      "Schedule an engineering diagnosis or get an itemized quote for building repair, waterproofing, and specialized maintenance.",
    url: isSubdomain
      ? "https://hindbuilding.hindustanprojects.in/contact"
      : "https://www.hindustanprojects.in/hbs/contact",
    mainEntity: {
      "@type": "LocalBusiness",
      name: "Hind Building Solutions (HiBUILD)",
      parentOrganization: {
        "@type": "Organization",
        name: "Hindustan Projects (HiPRO)",
      },
      telephone: phone,
      email: email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj",
        addressLocality: "Bhilwara",
        addressRegion: "Rajasthan",
        postalCode: "311001",
        addressCountry: "IN",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          opens: "09:00",
          closes: "19:00",
        },
      ],
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: isSubdomain
          ? "https://hindbuilding.hindustanprojects.in"
          : "https://www.hindustanprojects.in/hbs",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact & Book Inspection",
        item: isSubdomain
          ? "https://hindbuilding.hindustanprojects.in/contact"
          : "https://www.hindustanprojects.in/hbs/contact",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-white text-slate-900 pb-0 space-y-12 sm:space-y-16">
        {/* ── A. BREADCRUMB NAVIGATION ─────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xs py-3.5 text-xs -mb-12 sm:-mb-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ol className="flex items-center flex-wrap gap-2 text-slate-500 font-medium">
              <li>
                <Link
                  href={homeHref}
                  className="hover:text-red-600 transition-colors py-1 inline-flex items-center"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li className="text-slate-900 font-bold truncate">
                Contact &amp; Book Inspection
              </li>
            </ol>
          </div>
        </nav>

        {/* ── 1. HERO SECTION (Clean Left-Aligned Architectural Presentation) ── */}
        <section
          aria-labelledby="contact-hero-heading"
          className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/80 pt-12 sm:pt-16 pb-12 sm:pb-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Text & Value Proposition */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-5 text-left">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    Direct Civil Engineering Dispatch
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    100% Free Doorstep Visit Across Rajasthan
                  </span>
                </div>

                {/* Main Heading & Subtitle */}
                <div className="space-y-2">
                  <h1
                    id="contact-hero-heading"
                    className="text-3xl sm:text-5xl lg:text-[52px] font-black uppercase font-display tracking-tight text-slate-900 leading-[1.12]"
                  >
                    Book Free Doorstep <span className="text-red-600">Site Inspection</span>
                  </h1>
                  <p className="text-base sm:text-xl font-bold text-slate-700 font-display">
                    Non-Destructive Digital Diagnostics &amp; Itemized Digital BOQ
                  </p>
                </div>

                {/* Rich Authoritative Text */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans max-w-2xl">
                  Facing wall dampness, foundation seepage, ceiling peeling, or structural cracks? Our certified civil engineers conduct on-site electronic moisture scanning and structural audits before prescribing chemical treatments. You receive an itemized, line-item BOQ with zero hidden costs and formal written warranty protection.
                </p>

                {/* 4 Feature Value Chips */}
                <div className="pt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
                    <Zap className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span><strong>15-Min</strong> Response Promise</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>₹0 Fee</strong> Doorstep Visit</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span><strong>10-Yr</strong> Written Warranty</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>19</strong> Specialized Trades</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Direct Helpdesk Triage Widget */}
              <div className="lg:col-span-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                        Dispatch Helpdesk Active
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      Live
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Emergency Leaks or Immediate Triage:
                    </span>
                    <a
                      href={`tel:${phoneRaw}`}
                      data-hbs-cta="call"
                      className="text-xl sm:text-2xl font-black text-[#0D2D5E] hover:text-red-600 font-mono transition-colors block"
                    >
                      {phone}
                    </a>
                  </div>

                  <div className="space-y-2 pt-1">
                    <a
                      href={photoWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-hbs-cta="whatsapp"
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send Dampness Photos on WhatsApp</span>
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight">
                    Qualified civil engineering team stationed in Bhilwara with active field units in Jaipur, Udaipur, Kota &amp; Ajmer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. MAIN CONVERSION SECTION (Form + High-Trust Sidebar) ──── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column (Col-Span 7): High-Converting Lead Form */}
            <div className="lg:col-span-7">
              <Suspense
                fallback={
                  <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3 text-red-600" />
                    <p className="font-semibold text-slate-700">Loading inspection form...</p>
                  </div>
                }
              >
                <HbsContactForm services={services} content={content} />
              </Suspense>
            </div>

            {/* Right Column (Col-Span 5): High-Trust Conversion Sidebar */}
            <div className="lg:col-span-5 space-y-5">
              {/* Card 1: Direct Hotline & Priority Dispatch (Navy #0D2D5E) */}
              <div className="bg-[#0D2D5E] text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-[#163b72] relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                    ● Priority Engineering Line
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">
                    Direct Call
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-display">
                    Prefer Speaking to an Engineer?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Call our centralized dispatch desk for immediate triage, emergency water stop guidance, and inspection slot booking.
                  </p>
                </div>

                <div className="pt-1">
                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    aria-label={`Call Hind Build at ${phone}`}
                    className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4 text-white" />
                    <span>Call: {phone}</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Engineers On Call (Mon–Sat 9AM–7PM)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Instant</span>
                </div>
              </div>

              {/* Card 2: WhatsApp Instant Photo Evaluation (Emerald Card) */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 tracking-wider block">
                      Fast 5-Min Diagnosis
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Have Photos of Dampness or Cracks?
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Send photos or a video clip of your damaged wall, roof, or floor directly on WhatsApp. Our civil engineers will assess the severity and send preliminary guidance.
                </p>

                <a
                  href={photoWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hbs-cta="whatsapp"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors active:scale-[0.98]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Photos on WhatsApp</span>
                </a>
              </div>

              {/* Card 3: 4 Engineering Guarantees (Trust Box) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 block">
                    Our Commitment
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    The Hind Build Standard
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-sans">Zero Inspection Fee</strong>
                      <span className="text-[11px] text-slate-500">Doorstep site visit and electronic scanning are 100% complimentary.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-sans">Non-Destructive Scanners</strong>
                      <span className="text-[11px] text-slate-500">Moisture meters and pipe testers isolate issues without blind chipping.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-sans">Itemized Digital BOQ</strong>
                      <span className="text-[11px] text-slate-500">Transparent square footage, chemical grades, and zero surprise price escalations.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-sans">Written Multi-Year Warranty</strong>
                      <span className="text-[11px] text-slate-500">Documented certificate backed by post-cure 48-hour flood testing.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Registered Office & Operating Hub */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-6 space-y-3.5 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Central Office &amp; Coverage
                </span>

                <div className="space-y-2.5 text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block text-[11px]">Headquarters &amp; Dispatch Desk</strong>
                      <p className="text-[11px] text-slate-500 leading-snug">{address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block text-[11px]">Technical Email</strong>
                      <a href={`mailto:${email}`} className="text-[11px] text-red-600 font-semibold hover:underline">
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block text-[11px]">Operational Hours</strong>
                      <p className="text-[11px] text-slate-500 leading-snug">{workingHours}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Active Coverage:</span>
                  <span>Bhilwara • Jaipur • Udaipur • Kota • Ajmer</span>
                </div>
              </div>

              {/* Card 5: Corporate Entity Note */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Parent Heritage
                </span>
                <p className="text-[11px] leading-relaxed">
                  Hind Build is a specialized building repair &amp; maintenance division under{" "}
                  <strong className="text-slate-900">Hindustan Projects (HiPRO)</strong>, bringing industrial civil engineering rigor to properties across Rajasthan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. FREQUENTLY ASKED QUESTIONS ───────────────────────────── */}
        <section
          aria-labelledby="contact-faqs-heading"
          className="max-w-4xl mx-auto px-4 sm:px-6"
        >
          <div className="text-center mb-8 space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 border border-red-200/70 inline-block rounded-md">
              Inspection Details
            </span>
            <h2
              id="contact-faqs-heading"
              className="text-2xl sm:text-3xl font-black uppercase font-display text-slate-900"
            >
              Common Questions Before Booking
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Everything you need to know about our zero-cost site visit, BOQ estimation, and written warranty.
            </p>
          </div>

          <HbsFaqAccordion faqs={CONTACT_FAQS} />
        </section>

        {/* ── 4. UNIFIED PRE-FOOTER CTA ──────────────────────────────── */}
        <HbsHomePreFooterCta content={content} isSubdomain={isSubdomain} />
      </div>
    </>
  );
}
