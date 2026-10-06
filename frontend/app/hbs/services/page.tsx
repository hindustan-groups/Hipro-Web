import type { Metadata } from "next";
import Link from "next/link";
import {
  Wrench,
  ArrowRight,
  MessageSquare,
  Phone,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  ClipboardCheck,
} from "lucide-react";
import { fetchHbsServices, fetchHbsContent } from "@/lib/hbsData";
import HbsServicesDirectory from "@/components/hbs/HbsServicesDirectory";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [content, services] = await Promise.all([
    fetchHbsContent(),
    fetchHbsServices(),
  ]);

  const isSubdomainActive =
    process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const baseUrl = isSubdomainActive
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in";
  const canonicalUrl = `${baseUrl}/services`;

  const totalCount = services.length;
  const title = `All ${totalCount} Specialized Building Services | Hind Build`;
  const description =
    content.metaDescription ||
    `Browse all ${totalCount} specialized civil, structural, waterproofing, and electrical solutions from Hind Build. Turnkey execution with written warranty and transparent BOQ.`;

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
      images: [
        {
          url: content.ogDefaultImage || `${baseUrl}/hbs-og-default.svg`,
          width: 1200,
          height: 630,
          alt: "Hind Build Specialized Services",
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

export default async function HbsServicesPage() {
  const [services, content] = await Promise.all([
    fetchHbsServices(),
    fetchHbsContent(),
  ]);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  const phoneRaw = content.phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

  // Safely parse process steps if configured
  let processSteps: Array<{ step: string; title: string; desc: string }> = [];
  try {
    if (content.processSteps) {
      processSteps =
        typeof content.processSteps === "string"
          ? JSON.parse(content.processSteps)
          : (content.processSteps as any);
    }
  } catch {
    processSteps = [];
  }

  // Safely parse guarantee section if configured
  let guaranteeData: { title?: string; description?: string; badge?: string } | null = null;
  try {
    if (content.guaranteeSection) {
      guaranteeData =
        typeof content.guaranteeSection === "string"
          ? JSON.parse(content.guaranteeSection)
          : (content.guaranteeSection as any);
    }
  } catch {
    guaranteeData = null;
  }

  // JSON-LD Schema.org ItemList of all active services
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Hind Build - Specialized Building Services",
    description:
      "Complete catalog of specialized structural repair, waterproofing, and building maintenance trades.",
    numberOfItems: services.length,
    itemListElement: services.map((service, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: service.title,
      url: `https://hindbuilding.hindustanprojects.in/services/${service.slug}`,
      description: service.shortDescription || service.fullDescription || "",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* ─────────────────────────────────────────────────────────────────
            1. SERVICES DIRECTORY HERO (Asymmetric Industrial Composition)
        ───────────────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="services-hero-heading"
          className="relative bg-slate-950 text-white border-b border-slate-800 -mt-8 sm:-mt-12 overflow-hidden"
        >
          {/* Subtle Engineering Grid Backdrop */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#f59e0b 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Heading, Value Prop, CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <HardHat className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Engineering Solutions Directory</span>
                </div>

                <div className="space-y-3">
                  <h1
                    id="services-hero-heading"
                    className="text-3xl sm:text-5xl lg:text-5xl font-black uppercase font-display tracking-tight text-white leading-tight"
                  >
                    Specialized Building &amp;{" "}
                    <span className="text-amber-400">Civil Services</span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                    From non-destructive structural repair and chemical pressure
                    injection to positive-side terrace waterproofing, solar
                    maintenance, and smart security. Turnkey execution with
                    itemized BOQ and written guarantee.
                  </p>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href={`${prefix}/contact`}
                    className="hbs-btn-primary min-h-[48px] px-6 text-xs font-black uppercase tracking-wider shadow-md"
                  >
                    <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>Book Site Inspection</span>
                  </Link>

                  <a
                    href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
                      "Hello Hind Build, I would like to inquire about your specialized building services."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hbs-btn-whatsapp min-h-[48px] px-6 text-xs font-bold uppercase tracking-wider shadow-md"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Inquire via WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${phoneRaw}`}
                    className="hbs-btn-secondary min-h-[48px] px-5 text-xs font-bold uppercase tracking-wider"
                  >
                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Call: {content.phone}</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Industrial Technical Strip Box */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900 border-2 border-slate-800 p-6 sm:p-8 space-y-6 relative shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                      CATALOG METRICS
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      STATUS: ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950 border border-slate-800">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
                        {services.length}
                      </div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                        Active Trades
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                        HiPRO
                      </div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                        Civil Heritage
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                        100%
                      </div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                        Itemized BOQ
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
                        Written
                      </div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                        Work Warranty
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Certified chemical polymers &amp; NDT diagnostics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Turnkey accountability — zero subcontractor confusion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            2. SERVICES DIRECTORY & SEARCH (All active services rendered)
        ───────────────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="directory-list-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6"
        >
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 border border-amber-200 inline-block mb-2">
                All {services.length} Specialized Solutions
              </span>
              <h2
                id="directory-list-heading"
                className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight"
              >
                Comprehensive Trade Catalog
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md">
              Filter by problem, trade, or keyword. Click any service to inspect
              technical scope, benefits, chemical specifications, and FAQs.
            </p>
          </div>

          {/* Interactive Client Component for Search & Instant Filtering */}
          <HbsServicesDirectory
            services={services}
            prefix={prefix}
            whatsappRaw={whatsappRaw}
            phoneRaw={phoneRaw}
            phoneFormatted={content.phone}
          />
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            3. HOW HBS APPROACHES WORK (PROCESS)
        ───────────────────────────────────────────────────────────────── */}
        {processSteps.length > 0 && (
          <section
            aria-labelledby="process-heading"
            className="max-w-7xl mx-auto px-4 sm:px-6"
          >
            <div className="bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Standardized Engineering Protocol</span>
                  </div>
                  <h2
                    id="process-heading"
                    className="text-2xl sm:text-3xl font-black uppercase font-display text-white"
                  >
                    How Hind Build Executes Every Building Solution
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                  A disciplined 5-step engineering lifecycle ensuring
                  non-destructive root cause identification, certified
                  materials, and transparent deliverables.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {processSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-5 border border-slate-800 space-y-2.5 relative group hover:border-amber-500/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-black text-amber-400">
                        {step.step || String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        PHASE
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase font-display pt-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            4. GUARANTEE / TRUST BANNER (Conditionally Rendered from CMS)
        ───────────────────────────────────────────────────────────────── */}
        {guaranteeData && (
          <section
            aria-labelledby="guarantee-heading"
            className="max-w-7xl mx-auto px-4 sm:px-6"
          >
            <div className="bg-amber-50 border-2 border-amber-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">
                    {guaranteeData.badge || "Written Workmanship Warranty"}
                  </span>
                  <h3
                    id="guarantee-heading"
                    className="text-lg sm:text-xl font-black uppercase font-display text-slate-900"
                  >
                    {guaranteeData.title ||
                      "Certified Quality & Material Assurance"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
                    {guaranteeData.description ||
                      "Every repair and installation executed by Hind Build comes with a signed handover audit report, certified manufacturer warranty cards, and scheduled post-completion inspections."}
                  </p>
                </div>
              </div>

              <Link
                href={`${prefix}/contact`}
                className="hbs-btn-primary min-h-[44px] px-6 text-xs font-black uppercase tracking-wider shrink-0"
              >
                <span>Request Inspection</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </Link>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            5. FINAL STRONG CONVERSION CTA
        ───────────────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6 pb-6"
        >
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-12 border-l-8 border-amber-500 shadow-xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold block">
                Turnkey Engineering Desk
              </span>
              <h2
                id="cta-heading"
                className="text-2xl sm:text-4xl font-black uppercase font-display leading-tight text-white"
              >
                Need Multiple Services For A Property?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We provide integrated turnkey package solutions for housing
                societies (RWA), commercial complexes, retail chains, and
                luxury residences. Transparent itemized BOQ with dedicated site
                supervision.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch gap-3 shrink-0 w-full xl:w-auto">
              <Link
                href={`${prefix}/contact`}
                className="hbs-btn-primary min-h-[48px] px-6 text-xs font-black uppercase tracking-wider shadow-md"
              >
                <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                <span>Book Site Inspection</span>
              </Link>

              <a
                href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
                  "Hello Hind Build, I would like to schedule a site inspection for multiple building services."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hbs-btn-whatsapp min-h-[48px] px-6 text-xs font-bold uppercase tracking-wider shadow-md"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:${phoneRaw}`}
                className="hbs-btn-secondary min-h-[48px] px-5 text-xs font-bold uppercase tracking-wider"
              >
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Call: {content.phone}</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
