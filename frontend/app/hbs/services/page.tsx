import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageSquare, Phone, ShieldCheck, CheckCircle, Wrench, Sparkles, Building2 } from "lucide-react";
import { fetchHbsServices, fetchHbsContent } from "@/lib/hbsData";
import { buildHbsWhatsAppUrl, cleanTelNumber } from "@/lib/hbsWhatsApp";
import HbsServicesDirectory from "@/components/hbs/HbsServicesDirectory";
import HbsHomePreFooterCta from "@/components/hbs/HbsHomePreFooterCta";
import type { HbsService } from "@/lib/types";

export const revalidate = 60;

const FEATURED_SLUGS = ["structure-repair", "water-leakage-solution"];

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

function parseList(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return val.split("\n").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function FeaturedService({
  service,
  prefix,
  index,
  priority,
}: {
  service: HbsService;
  prefix: string;
  index: number;
  priority: boolean;
}) {
  const no = service.serviceNumber || String(index + 1).padStart(2, "0");
  const href = `${prefix}/services/${service.slug}`;
  const features = parseList(service.features).slice(0, 3);

  return (
    <article className="group flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300">
      <div>
        <Link
          href={href}
          className="block relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label={`Explore ${service.title}`}
        >
          {service.image && (
            <Image
              src={service.image}
              alt={`${service.title} — Hind Build`}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
            />
          )}
          {/* Badge over image */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-[#0D2D5E]/90 backdrop-blur-md text-white font-mono text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
              #{no}
            </span>
            {service.hindiTitle && (
              <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs hidden sm:inline-block">
                {service.hindiTitle}
              </span>
            )}
          </div>
        </Link>

        <div className="pt-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 font-mono">
            Flagship Engineering Solution
          </span>
          <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight group-hover:text-red-600 transition-colors">
            <Link
              href={href}
              className="focus-visible:outline-none focus-visible:underline underline-offset-4"
            >
              {service.title}
            </Link>
          </h3>
          {service.shortDescription && (
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
              {service.shortDescription}
            </p>
          )}

          {/* Key Deliverables Preview */}
          {features.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors focus-visible:outline-none"
        >
          View Scope &amp; Warranty
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
        <Link
          href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
          data-hbs-cta="quote"
          className="inline-flex items-center px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
        >
          Get Quote
        </Link>
      </div>
    </article>
  );
}

export default async function HbsServicesPage() {
  const [services, content] = await Promise.all([
    fetchHbsServices(),
    fetchHbsContent(),
  ]);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  const phoneRaw = cleanTelNumber(content.phone || "+91 94625 77757");
  const heroWaUrl = buildHbsWhatsAppUrl(
    content.whatsapp,
    "Hi Hind Build, I would like to inquire about your specialized building services."
  );

  // Featured: 01 Structure Repair + 02 Water Leakage Solution (fallback: first two services).
  let featured = FEATURED_SLUGS.map((slug) =>
    services.find((s) => s.slug === slug)
  ).filter((s): s is HbsService => Boolean(s));
  if (featured.length < 2) featured = services.slice(0, 2);

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

      <div className="bg-white text-slate-900 pb-0">
        {/* ── 1. Hero Section ─────────────────────────── */}
        <section
          aria-labelledby="services-hero-heading"
          className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/80 pt-12 sm:pt-20 pb-12 sm:pb-16"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                Specialized Engineering Catalog
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider">
                {services.length} Specialized Trades
              </span>
            </div>

            <h1
              id="services-hero-heading"
              className="mt-4 max-w-4xl text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-slate-900 leading-[1.12]"
            >
              Building Repair, Maintenance &amp; Structural Protection
              <span className="block text-slate-400 font-bold mt-1 text-2xl sm:text-3xl lg:text-4xl">
                Executed Under Coordinated Civil Engineers
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm sm:text-lg text-slate-600 leading-relaxed font-sans">
              Browse {services.length} specialized services — from precision non-destructive
              waterproofing and concrete structural repair to electrical, security, and facade protection with single-point accountability.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={`${prefix}/contact`}
                data-hbs-cta="quote"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md transition-all active:scale-[0.98]"
              >
                <Wrench className="w-4 h-4 text-white" />
                <span>Get Free Inspection Quote</span>
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Link>

              <a
                href={`tel:${phoneRaw}`}
                data-hbs-cta="call"
                aria-label={`Call Hind Build at ${content.phone}`}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-[#0D2D5E] hover:bg-[#0A2349] text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Call: {content.phone || "+91 94625 77757"}</span>
              </a>

              <a
                href={heroWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-hbs-cta="whatsapp"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl border border-emerald-300 bg-white text-emerald-700 text-sm font-bold hover:bg-emerald-50 shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* 4 Trust Pillars Strip */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">10-Yr Warranty</h3>
                  <p className="text-[11px] text-slate-500">Written agreement</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Civil Engineers</h3>
                  <p className="text-[11px] text-slate-500">HiPRO oversight</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">ISI Chemicals</h3>
                  <p className="text-[11px] text-slate-500">Standardized sealants</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Free Inspection</h3>
                  <p className="text-[11px] text-slate-500">Transparent BOQ</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2–4. Search → Featured → All services ─────────────── */}
        <div className="pt-10 sm:pt-14">
          <HbsServicesDirectory services={services} prefix={prefix}>
            {featured.length > 0 && (
              <section
                aria-labelledby="featured-services-heading"
                className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 font-mono block">
                      Priority Trades
                    </span>
                    <h2
                      id="featured-services-heading"
                      className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
                    >
                      Featured Flagship Solutions
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    High-demand restoration systems
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                  {featured.map((service, i) => (
                    <FeaturedService
                      key={service.id || service.slug}
                      service={service}
                      prefix={prefix}
                      index={services.indexOf(service)}
                      priority={i === 0}
                    />
                  ))}
                </div>
              </section>
            )}
          </HbsServicesDirectory>
        </div>

        {/* ── 5. Multi-Service Inquiry Card ──────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14">
          <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-6 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8 shadow-xs">
            <div className="max-w-xl space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
                Turnkey Multiple Service Package
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Need more than one service?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Combine waterproofing, painting, structural crack repairs, or electrical works into a single turnkey project. We coordinate a single on-site diagnostic visit and deliver a combined BOQ estimate.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={`${prefix}/contact`}
                data-hbs-cta="quote"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md transition-all active:scale-[0.98]"
              >
                <span>Request Combined Quote</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href={heroWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-hbs-cta="whatsapp"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── 6. Full-Width Pre-Footer Ribbon ──────────────────────── */}
        <HbsHomePreFooterCta
          phoneRaw={phoneRaw}
          phoneDisplay={content.phone || "+91 94625 77757"}
          whatsappNumber={content.whatsapp}
          prefix={prefix}
        />
      </div>
    </>
  );
}

