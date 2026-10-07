import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  MessageSquare,
  Phone,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
  Building2,
  Image as ImageIcon
} from "lucide-react";
import {
  fetchHbsContent,
  fetchHbsServices,
  fetchHbsServiceBySlug
} from "@/lib/hbsData";
import { cleanTelNumber, getServiceWhatsAppUrl } from "@/lib/hbsWhatsApp";
import HbsFaqAccordion from "@/components/hbs/HbsFaqAccordion";
import HbsHomePreFooterCta from "@/components/hbs/HbsHomePreFooterCta";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const services = await fetchHbsServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [service, content] = await Promise.all([
    fetchHbsServiceBySlug(slug),
    fetchHbsContent(),
  ]);

  if (!service) {
    return {
      title: "Service Not Found | Hind Build",
    };
  }

  const isSubdomainActive = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const baseUrl = isSubdomainActive
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in";
  const canonicalUrl = `${baseUrl}/services/${service.slug}`;

  const title = service.metaTitle || `${service.title} | Hind Build`;
  const description =
    service.metaDescription ||
    service.shortDescription ||
    service.fullDescription ||
    `Professional ${service.title} by Hind Build, specialized building maintenance and repair division under Hindustan Projects.`;

  const ogImage =
    service.ogImage ||
    service.image ||
    content.ogDefaultImage ||
    content.logoPrimary ||
    "/hbs-og-default.svg";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Hind Build",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${service.title} - Hind Build`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// Helpers for safe array parsing
function parseStringList(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((item) => typeof item === "string" && item.trim().length > 0);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter((item) => typeof item === "string" && item.trim().length > 0);
    } catch {
      return val
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function parseProcessSteps(val: any): Array<{ step?: string; title: string; desc: string }> {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

function parseFaqs(val: any): Array<{ q: string; a: string }> {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export default async function HbsServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, content, allServices] = await Promise.all([
    fetchHbsServiceBySlug(slug),
    fetchHbsContent(),
    fetchHbsServices(),
  ]);

  if (!service) {
    notFound();
  }

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const phoneRaw = cleanTelNumber(content.phone || "+91 94625 77757");
  const serviceWaUrl = getServiceWhatsAppUrl(content.whatsapp, service.title);

  // Parse structured CMS lists safely
  const features = parseStringList(service.features);
  const benefits = parseStringList(service.benefits);
  const processSteps = parseProcessSteps(service.processSteps);
  const faqs = parseFaqs(service.faqs);
  const galleryImages = parseStringList(service.galleryImages);

  // Related services (exclude current)
  const relatedServices = allServices
    .filter((s) => s.slug !== service.slug)
    .slice(0, 4);

  // Structured Data (Schema.org Service + Optional FAQPage)
  const serviceJsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    description: service.shortDescription || service.fullDescription || undefined,
    provider: {
      "@type": "HomeAndConstructionBusiness",
      name: "Hind Build",
      url: isSubdomain
        ? "https://hindbuilding.hindustanprojects.in"
        : "https://www.hindustanprojects.in/hbs",
      telephone: content.phone,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bhilwara",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Rajasthan, India",
    },
    url: isSubdomain
      ? `https://hindbuilding.hindustanprojects.in/services/${service.slug}`
      : `https://www.hindustanprojects.in/hbs/services/${service.slug}`,
  };

  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }
      : null;

  const serviceNumber = service.serviceNumber || "19";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-0">
      {/* Schema.org Inject */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* A. Breadcrumb Bar */}
      <nav
        aria-label="Breadcrumb"
        className="bg-white/90 backdrop-blur-xs border-b border-slate-200/80 py-3.5 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
          <Link href={homeHref} className="hover:text-red-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href={`${prefix}/services`} className="hover:text-red-600 transition-colors">
            Services
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate">
            {service.title}
          </span>
        </div>
      </nav>

      {/* B. Hero Section (Clean Architectural Light Canvas) */}
      <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/80 py-10 sm:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Title, Trust & CTAs */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 font-mono text-xs font-bold uppercase tracking-wider border border-red-200/80 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  Service #{serviceNumber}
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                  Engineering Division
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-slate-900 font-display tracking-tight leading-[1.14]">
                {service.title}
              </h1>

              {service.hindiTitle && (
                <div>
                  <span className="text-sm sm:text-base font-bold text-[#0D2D5E] bg-blue-50/80 border border-blue-200/70 px-3.5 py-1.5 rounded-xl inline-block shadow-2xs">
                    {service.hindiTitle}
                  </span>
                </div>
              )}

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-sans">
                {service.shortDescription || service.fullDescription}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <Link
                  href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
                  data-hbs-cta="quote"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md min-h-[46px] rounded-xl active:scale-[0.98]"
                >
                  <Wrench className="w-4 h-4 text-white" />
                  <span>Get Free Quote</span>
                </Link>

                <a
                  href={`tel:${phoneRaw}`}
                  data-hbs-cta="call"
                  aria-label={`Call Hind Build at ${content.phone}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#0D2D5E] hover:bg-[#0A2349] text-white font-bold px-5 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 min-h-[46px] rounded-xl shadow-xs active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4 text-white" />
                  <span>Call Hind Build</span>
                </a>

                <a
                  href={serviceWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hbs-cta="whatsapp"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold px-5 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 min-h-[46px] rounded-xl shadow-xs active:scale-[0.98]"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Trust Micro-Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Written Warranty</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Civil Engineer Supervision</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Non-Destructive Testing</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual or Highlight Card */}
            <div className="lg:col-span-5">
              {service.image ? (
                <div className="relative aspect-4/3 w-full bg-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden shadow-xl group">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-800 font-semibold bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 px-3.5 py-2 shadow-sm flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-red-600" />
                      HiBUILD Certified Execution
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">Rajasthan</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-10 h-10 bg-red-50 border border-red-200/60 rounded-xl flex items-center justify-center text-red-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                        Turnkey Service Delivery
                      </h2>
                      <p className="text-[11px] text-slate-500">Civil Engineers &amp; Certified Technicians</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Non-destructive acoustic &amp; moisture diagnosis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Standardized industrial chemicals and sealants</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Backed by parent company Hindustan Projects</span>
                    </li>
                  </ul>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>Dispatch Area</span>
                    <span className="text-red-600 font-bold">Bhilwara &amp; Rajasthan</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Column */}
          <main className="lg:col-span-8 space-y-8 sm:space-y-10">
            {/* C. Service Overview */}
            <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <h2 className="text-lg sm:text-xl font-bold uppercase font-display tracking-tight text-slate-900">
                  Service Overview &amp; Technical Scope
                </h2>
              </div>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>
                  {service.fullDescription ||
                    service.shortDescription ||
                    `Comprehensive ${service.title} executed according to strict civil engineering standards. We diagnose the underlying physical and structural factors before deploying corrective systems.`}
                </p>
              </div>

              {/* Features / Key Deliverables */}
              {features.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Key Work Deliverables
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs sm:text-sm text-slate-800 font-medium hover:bg-slate-100/70 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* D. Benefits Section */}
            {benefits.length > 0 && (
              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg sm:text-xl font-bold uppercase font-display tracking-tight text-slate-900">
                    Core Benefits &amp; Advantages
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 flex items-start gap-3 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#0D2D5E] text-white font-mono font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* E. Process Section */}
            {processSteps.length > 0 && (
              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg sm:text-xl font-bold uppercase font-display tracking-tight text-slate-900">
                    Execution Methodology &amp; Process
                  </h2>
                </div>

                <div className="space-y-3">
                  {processSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 bg-slate-50/70 border border-slate-200/70 rounded-xl relative hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        {step.step || String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* F & G. Warranty & Pricing Row */}
            {(service.warrantyDetails || service.pricingEstimate) && (
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {service.warrantyDetails && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs border-t-4 border-t-red-600">
                    <div className="flex items-center gap-2 text-red-600">
                      <ShieldCheck className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                        Warranty &amp; Quality Guarantee
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                      {service.warrantyDetails}
                    </p>
                  </div>
                )}

                {service.pricingEstimate && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs border-t-4 border-t-[#0D2D5E]">
                    <div className="flex items-center gap-2 text-[#0D2D5E]">
                      <Clock className="w-5 h-5 text-[#0D2D5E]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                        Estimation &amp; Transparent BOQ
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                      {service.pricingEstimate}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* H. Service Gallery */}
            {galleryImages.length > 0 && (
              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg sm:text-xl font-bold uppercase font-display tracking-tight text-slate-900">
                    Work Gallery &amp; Project Photos
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-4/3 bg-slate-100 border border-slate-200/70 rounded-xl overflow-hidden group shadow-2xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`${service.title} photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* I. FAQs Section */}
            {faqs.length > 0 && (
              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg sm:text-xl font-bold uppercase font-display tracking-tight text-slate-900">
                    Frequently Asked Questions
                  </h2>
                </div>

                <HbsFaqAccordion faqs={faqs} />
              </section>
            )}

            {/* J. Bottom CTA Banner (Architectural Deep Navy Ribbon) */}
            <section className="bg-[#0D2D5E] text-white p-8 sm:p-10 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
              <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-widest block">
                Direct Engineering Dispatch
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase font-display tracking-tight text-white leading-tight">
                Book An On-Site Evaluation For {service.title}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
                Our qualified site supervisor evaluates your property with non-destructive moisture scanners and structural inspection protocols. Get a clear written estimate before any work starts.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <Link
                  href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
                  data-hbs-cta="quote"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 min-h-[46px] rounded-xl shadow-md active:scale-[0.98]"
                >
                  <Wrench className="w-4 h-4 text-white" />
                  <span>Get Free Quote</span>
                </Link>

                <a
                  href={`tel:${phoneRaw}`}
                  data-hbs-cta="call"
                  aria-label={`Call Hind Build at ${content.phone}`}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 min-h-[46px] rounded-xl active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4 text-white" />
                  <span>Call {content.phone}</span>
                </a>

                <a
                  href={serviceWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hbs-cta="whatsapp"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 min-h-[46px] rounded-xl shadow-xs active:scale-[0.98]"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </section>
          </main>

          {/* Right Sidebar: Contact, Trust & Related Services */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick Contact Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs sticky top-24">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider block mb-1">
                  Rapid Assistance
                </span>
                <h3 className="text-base font-bold text-slate-900 uppercase font-display">
                  Schedule {service.title}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#0D2D5E] text-xs">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>Parent Company Oversight</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    All work performed under civil engineers from Hindustan Projects (HiPRO).
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <Link
                    href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
                    data-hbs-cta="quote"
                    className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 shadow-md transition-all duration-200 min-h-[44px] rounded-xl active:scale-[0.98]"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Get Free Quote</span>
                  </Link>

                  <a
                    href={serviceWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hbs-cta="whatsapp"
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-3 transition-all duration-200 min-h-[44px] rounded-xl shadow-xs active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Operating Hours:</span>
                    <span className="font-semibold text-slate-700">{content.businessHours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Direct Helpline:</span>
                    <a
                      href={`tel:${phoneRaw}`}
                      data-hbs-cta="call"
                      aria-label={`Call Hind Build helpline at ${content.phone}`}
                      className="font-mono text-red-600 font-bold hover:underline"
                    >
                      {content.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Related Services */}
              {relatedServices.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Related Hind Build Solutions
                  </h4>
                  <ul className="space-y-2">
                    {relatedServices.map((rel) => (
                      <li key={rel.slug}>
                        <Link
                          href={`${prefix}/services/${rel.slug}`}
                          className="flex items-center justify-between p-3 bg-slate-50/80 hover:bg-red-50/50 hover:border-red-200 border border-slate-200/70 rounded-xl text-xs text-slate-700 hover:text-red-700 transition-all group"
                        >
                          <span className="font-semibold truncate">{rel.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`${prefix}/services`}
                    className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider block text-center pt-1"
                  >
                    View All 19 Services →
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Pre-Footer Call Ribbon */}
      <HbsHomePreFooterCta
        phoneRaw={phoneRaw}
        phoneDisplay={content.phone || "+91 94625 77757"}
        whatsappNumber={content.whatsapp}
        prefix={prefix}
      />
    </div>
  );
}

