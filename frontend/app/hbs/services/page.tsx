import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageSquare } from "lucide-react";
import { fetchHbsServices, fetchHbsContent } from "@/lib/hbsData";
import { buildHbsWhatsAppUrl } from "@/lib/hbsWhatsApp";
import HbsServicesDirectory from "@/components/hbs/HbsServicesDirectory";
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
    // `absolute` prevents the layout template from appending "| Hind Build" a second time.
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

  return (
    <article className="group">
      <Link
        href={href}
        className="block relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-2xl bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
        aria-label={`Explore ${service.title}`}
      >
        {service.image && (
          <Image
            src={service.image}
            alt={`${service.title} — Hind Build`}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
      </Link>

      <div className="pt-5 sm:pt-6">
        <span className="text-xs font-mono text-slate-400">{no}</span>
        <h3 className="mt-1.5 text-2xl sm:text-[28px] font-semibold tracking-tight text-slate-900 leading-tight">
          <Link
            href={href}
            className="focus-visible:outline-none focus-visible:underline underline-offset-4"
          >
            {service.title}
          </Link>
        </h3>
        {service.shortDescription && (
          <p className="mt-2.5 text-[15px] text-slate-600 leading-relaxed line-clamp-3 max-w-lg">
            {service.shortDescription}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold text-slate-900 group/cta focus-visible:outline-none focus-visible:underline underline-offset-4"
          >
            Explore Service
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover/cta:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
          <Link
            href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
            data-hbs-cta="quote"
            className="inline-flex items-center min-h-[44px] text-sm text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:underline underline-offset-4"
          >
            Get a quote
          </Link>
        </div>
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

  const heroWaUrl = buildHbsWhatsAppUrl(
    content.whatsapp,
    "Hi Hind Build, I would like to inquire about your specialized building services."
  );

  // Featured: 01 Structure Repair + 02 Water Leakage Solution (fallback: first two services).
  let featured = FEATURED_SLUGS.map((slug) =>
    services.find((s) => s.slug === slug)
  ).filter((s): s is HbsService => Boolean(s));
  if (featured.length < 2) featured = services.slice(0, 2);

  // JSON-LD Schema.org ItemList of all active services (unchanged)
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

      <div className="bg-white text-slate-900 pb-20 sm:pb-28">
        {/* ── 1. Compact editorial hero ─────────────────────────── */}
        <section
          aria-labelledby="services-hero-heading"
          className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-8 sm:pb-12"
        >
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Hind Build Services
          </p>
          <h1
            id="services-hero-heading"
            className="mt-4 max-w-4xl text-[32px] leading-[1.1] sm:text-5xl lg:text-[56px] font-semibold tracking-tight text-slate-900"
          >
            Building repair, maintenance and protection
            <span className="text-slate-400">
              {" "}— handled through one coordinated engineering team.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] sm:text-lg text-slate-600 leading-relaxed">
            {services.length} specialised services, from structural repair and
            leakage solutions to electrical, security and facade work, with
            one point of accountability.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={`${prefix}/contact`}
              data-hbs-cta="quote"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
            >
              Get Free Quote
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href={heroWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-hbs-cta="whatsapp"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </section>

        {/* ── 2–4. Search → Featured → All services ─────────────── */}
        <HbsServicesDirectory services={services} prefix={prefix}>
          {featured.length > 0 && (
            <section
              aria-labelledby="featured-services-heading"
              className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16"
            >
              <h2
                id="featured-services-heading"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Featured
              </h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-10">
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

        {/* ── 5. Closing conversion ─────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28">
          <div className="rounded-2xl bg-slate-50 border border-slate-200/70 px-6 py-10 sm:px-12 sm:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                Need more than one service?
              </h2>
              <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
                Select multiple services in one request. Our team will plan
                a single inspection and a combined estimate.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={`${prefix}/contact`}
                data-hbs-cta="quote"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
              >
                Get Free Quote
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href={heroWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-hbs-cta="whatsapp"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
