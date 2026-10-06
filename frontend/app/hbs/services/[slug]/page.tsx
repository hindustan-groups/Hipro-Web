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
  Image as ImageIcon
} from "lucide-react";
import {
  fetchHbsContent,
  fetchHbsServices,
  fetchHbsServiceBySlug
} from "@/lib/hbsData";
import HbsFaqAccordion from "@/components/hbs/HbsFaqAccordion";

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
        .map((s) => s.trim())
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

  const phoneRaw = content.phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
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
        className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
          <Link href={homeHref} className="hover:text-amber-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href={`${prefix}/services`} className="hover:text-amber-700 transition-colors">
            Services
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate">
            {service.title}
          </span>
        </div>
      </nav>

      {/* B. Hero Section */}
      <section className="bg-slate-900 text-white py-12 sm:py-16 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Title & CTAs */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Service #{service.serviceNumber || "19"}
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                  Engineering Division
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase font-display tracking-tight text-white leading-tight">
                {service.title}
              </h1>

              {service.hindiTitle && (
                <p className="text-base sm:text-lg font-semibold text-amber-400">
                  {service.hindiTitle}
                </p>
              )}

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {service.shortDescription || service.fullDescription}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <Link
                  href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
                  className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-md min-h-[44px]"
                >
                  <Wrench className="w-4 h-4 text-slate-950" />
                  <span>Book Free Inspection</span>
                </Link>

                <a
                  href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
                    service.whatsappCtaText || `Hello Hind Build, I would like to inquire about ${service.title}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-colors min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Visual or Highlight Card */}
            <div className="lg:col-span-5">
              {service.image ? (
                <div className="relative aspect-4/3 w-full bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-xl">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-300 font-mono">
                    Official Hind Build Engineering Execution
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                        Turnkey Service Delivery
                      </h2>
                      <p className="text-[11px] text-slate-400">Civil Engineers &amp; Certified Technicians</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Non-destructive acoustic &amp; moisture diagnosis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Standardized industrial chemicals and sealants</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Backed by parent company Hindustan Projects</span>
                    </li>
                  </ul>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Dispatch Area</span>
                    <span className="text-amber-400 font-bold">Bhilwara &amp; Rajasthan</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Column */}
          <main className="lg:col-span-8 space-y-12">
            {/* C. Service Overview */}
            <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600" />
                <h2 className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-slate-900">
                  Service Overview &amp; Technical Scope
                </h2>
              </div>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
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
                        className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      >
                        <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span className="font-medium leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* D. Benefits Section (rendered only if present) */}
            {benefits.length > 0 && (
              <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-700" />
                  <h2 className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-slate-900">
                    Core Benefits &amp; Advantages
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-amber-50/40 border border-amber-200 text-xs sm:text-sm text-slate-800 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-none bg-amber-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* E. Process Section (rendered only if present) */}
            {processSteps.length > 0 && (
              <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-700" />
                  <h2 className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-slate-900">
                    Execution Methodology &amp; Process
                  </h2>
                </div>

                <div className="space-y-4">
                  {processSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-slate-50 border border-slate-200 relative"
                    >
                      <div className="w-8 h-8 bg-slate-900 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs border border-slate-800">
                        {step.step || String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 uppercase font-mono">
                          {step.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
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
                  <div className="bg-white border border-slate-200 p-6 space-y-3 shadow-xs border-t-4 border-t-amber-600">
                    <div className="flex items-center gap-2 text-amber-700">
                      <ShieldCheck className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                        Warranty &amp; Quality Guarantee
                      </h3>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {service.warrantyDetails}
                    </p>
                  </div>
                )}

                {service.pricingEstimate && (
                  <div className="bg-white border border-slate-200 p-6 space-y-3 shadow-xs border-t-4 border-t-slate-900">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Clock className="w-5 h-5 text-amber-700" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                        Estimation &amp; Pricing Guidance
                      </h3>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {service.pricingEstimate}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* H. Service Gallery (rendered only if present) */}
            {galleryImages.length > 0 && (
              <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-700" />
                  <h2 className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-slate-900">
                    Work Gallery &amp; Project Photos
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-4/3 bg-slate-100 border border-slate-200 overflow-hidden group"
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

            {/* I. FAQs Section (rendered only if present) */}
            {faqs.length > 0 && (
              <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-700" />
                  <h2 className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-slate-900">
                    Frequently Asked Questions
                  </h2>
                </div>

                <HbsFaqAccordion faqs={faqs} />
              </section>
            )}

            {/* J. Strong Bottom CTA Banner */}
            <section className="bg-slate-950 text-white p-8 sm:p-10 border-l-4 border-amber-500 space-y-4 shadow-md">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                Direct Engineering Dispatch
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase font-display tracking-tight text-white">
                Book An On-Site Evaluation For {service.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Our qualified site supervisor will evaluate your property with scientific moisture meters and structural inspection protocols. Get a clear written estimate before any work starts.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
                  className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 text-xs uppercase tracking-wider transition-colors min-h-[44px]"
                >
                  <Wrench className="w-4 h-4 text-slate-950" />
                  <span>Request Inspection</span>
                </Link>

                <a
                  href={`tel:${phoneRaw}`}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold px-6 py-3.5 text-xs uppercase tracking-wider transition-colors min-h-[44px] font-mono"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Call {content.phone}</span>
                </a>
              </div>
            </section>
          </main>

          {/* Right Sidebar: Contact, Trust & Related Services */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick Contact Card */}
            <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-xs sticky top-24">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  Rapid Assistance
                </span>
                <h3 className="text-base font-bold text-slate-900 uppercase font-display">
                  Schedule {service.title}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50/60 border border-amber-200 text-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Parent Company Oversight</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    All work performed under civil engineers from Hindustan Projects (HiPRO).
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <Link
                    href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider py-3 shadow-xs transition-colors min-h-[44px]"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Get Free Estimation</span>
                  </Link>

                  <a
                    href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
                      `Hello Hind Build, I need a site visit for: ${service.title}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs uppercase tracking-wider py-2.5 transition-colors min-h-[44px]"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Engineer</span>
                  </a>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Operating Hours:</span>
                    <span className="font-semibold text-slate-700">{content.businessHours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Direct Helpline:</span>
                    <a href={`tel:${phoneRaw}`} className="font-mono text-amber-700 font-bold hover:underline">
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
                          className="flex items-center justify-between p-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 text-xs text-slate-700 hover:text-amber-800 transition-colors group"
                        >
                          <span className="font-semibold truncate">{rel.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`${prefix}/services`}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider block text-center pt-1"
                  >
                    View All 19 Services →
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
