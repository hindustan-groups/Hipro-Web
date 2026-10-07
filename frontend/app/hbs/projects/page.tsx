import type { Metadata } from "next";
import Link from "next/link";
import {
  Wrench,
  ArrowRight,
  MessageSquare,
  Phone,
  HardHat,
  FolderKanban,
  CheckCircle2,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";
import {
  fetchHbsProjects,
  fetchHbsContent,
  fetchHbsServices,
} from "@/lib/hbsData";
import { cleanTelNumber, cleanWhatsAppNumber, buildHbsWhatsAppUrl } from "@/lib/hbsWhatsApp";
import HbsProjectsDirectory from "@/components/hbs/HbsProjectsDirectory";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [content, projects] = await Promise.all([
    fetchHbsContent(),
    fetchHbsProjects(),
  ]);

  const isSubdomainActive =
    process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const baseUrl = isSubdomainActive
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in";
  const canonicalUrl = `${baseUrl}/projects`;

  const totalCount = projects.length;
  const title = "Projects & Field Work | Hind Build";
  const description =
    content.metaDescription ||
    "Documented civil engineering, structural rehabilitation, and waterproofing field records by Hind Build. Turnkey execution with written warranties.";

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
          alt: "Hind Build Project Records",
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

export default async function HbsProjectsPage() {
  const [projects, content, services] = await Promise.all([
    fetchHbsProjects(),
    fetchHbsContent(),
    fetchHbsServices(),
  ]);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  const phoneRaw = cleanTelNumber(content.phone);
  const whatsappRaw = cleanWhatsAppNumber(content.whatsapp);
  const heroWaUrl = buildHbsWhatsAppUrl(
    content.whatsapp,
    "Hi Hind Build, I would like to inquire about your completed project records and site capabilities."
  );
  const bottomWaUrl = buildHbsWhatsAppUrl(
    content.whatsapp,
    "Hi Hind Build, I would like to schedule an engineering assessment for my site."
  );

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

  // Schema.org structured data (No fake ItemList entries if projects === 0)
  const jsonLd =
    projects.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Hind Build - Field Work & Project Records",
          description:
            "Documented structural repair, waterproofing, and specialized building maintenance field records.",
          url: "https://hindbuilding.hindustanprojects.in/projects",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: projects.length,
            itemListElement: projects.map((project, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              name: project.title,
              url: `https://hindbuilding.hindustanprojects.in/projects/${project.slug}`,
              description: project.description || "",
            })),
          },
        }
      : {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Hind Build - Field Work & Project Records",
          description:
            "Documented structural repair, waterproofing, and specialized building maintenance field records.",
          url: "https://hindbuilding.hindustanprojects.in/projects",
        };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* ─────────────────────────────────────────────────────────────────
            1. PORTFOLIO HERO (Asymmetric Dark Industrial Composition)
        ───────────────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="projects-hero-heading"
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
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider rounded-md">
                  <HardHat className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Field Records &amp; Project Portfolio</span>
                </div>

                <div className="space-y-3">
                  <h1
                    id="projects-hero-heading"
                    className="text-3xl sm:text-5xl lg:text-5xl font-black uppercase font-display tracking-tight text-white leading-tight"
                  >
                    Projects &amp; <span className="text-amber-400">Field Work</span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                    Documented structural rehabilitations, positive-side
                    waterproofing treatments, and specialized civil engineering
                    works. Turnkey execution with material certifications and
                    post-completion handover audits.
                  </p>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href={`${prefix}/contact`}
                    data-hbs-cta="quote"
                    className="hbs-btn-primary min-h-[48px] px-6 text-xs font-black uppercase tracking-wider shadow-md rounded-lg active:scale-[0.98]"
                  >
                    <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>Get Free Quote</span>
                  </Link>

                  <a
                    href={heroWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hbs-cta="whatsapp"
                    className="hbs-btn-whatsapp min-h-[48px] px-6 text-xs font-bold uppercase tracking-wider shadow-md rounded-lg active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    aria-label={`Call Hind Build at ${content.phone}`}
                    className="hbs-btn-secondary min-h-[48px] px-5 text-xs font-bold uppercase tracking-wider rounded-lg active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Call Hind Build</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Industrial Technical Strip Box */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900/95 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6 relative shadow-2xl backdrop-blur-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                      PORTFOLIO METRICS
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {projects.length === 0
                        ? "STATUS: PUBLICATION PENDING"
                        : "STATUS: ACTIVE ARCHIVE"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-950/90 border border-slate-800/80 rounded-xl">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
                        {projects.length}
                      </div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                        {projects.length === 0
                          ? "Documented Records"
                          : "Published Works"}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/90 border border-slate-800/80 rounded-xl">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                        HiPRO
                      </div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                        Civil Heritage
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/90 border border-slate-800/80 rounded-xl">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                        100%
                      </div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                        Itemized BOQ
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/90 border border-slate-800/80 rounded-xl">
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
                      <span>Non-destructive root cause diagnostics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Zero subcontractor dilution — dedicated Hind Build supervisors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            2. PROJECT DIRECTORY SECTION
        ───────────────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="portfolio-archive-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6"
        >
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 border border-amber-200 inline-block mb-2 rounded-md">
                Field Execution Documentation
              </span>
              <h2
                id="portfolio-archive-heading"
                className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight"
              >
                Comprehensive Project Archive
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md">
              Detailed technical case studies and site inspection reports. Filter
              by location, client type, or engineering trade.
            </p>
          </div>

          {/* Interactive Directory / Empty State Component */}
          <HbsProjectsDirectory
            projects={projects}
            services={services}
            prefix={prefix}
            whatsappRaw={whatsappRaw}
            phoneRaw={phoneRaw}
            phoneFormatted={content.phone}
          />
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            3. HOW HBS APPROACHES WORK (PROCESS) — Only if populated in CMS
        ───────────────────────────────────────────────────────────────── */}
        {processSteps.length > 0 && (
          <section
            aria-labelledby="process-heading"
            className="max-w-7xl mx-auto px-4 sm:px-6"
          >
            <div className="bg-slate-900/95 border border-slate-800/80 rounded-2xl text-white p-8 sm:p-12 shadow-xl space-y-8 backdrop-blur-xs">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md">
                    <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Standardized Engineering Protocol</span>
                  </div>
                  <h2
                    id="process-heading"
                    className="text-2xl sm:text-3xl font-black uppercase font-display text-white"
                  >
                    How Hind Build Executes Every Project
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
                    className="bg-slate-950 p-5 border border-slate-800 rounded-xl space-y-2.5 relative group hover:border-amber-500/60 transition-colors"
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
            4. FINAL STRONG CONVERSION CTA
        ───────────────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6 pb-6"
        >
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-12 border-l-8 border-amber-500 border border-slate-850 rounded-2xl shadow-xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold block">
                Turnkey Engineering Support
              </span>
              <h2
                id="cta-heading"
                className="text-2xl sm:text-4xl font-black uppercase font-display leading-tight text-white"
              >
                Need An Engineering Assessment For Your Site?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                From structural crack diagnostics and basement waterproofing to
                turnkey property renovation. Dedicated site supervisors, itemized
                BOQ, and written guarantees.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch gap-3 shrink-0 w-full xl:w-auto">
              <Link
                href={`${prefix}/contact`}
                data-hbs-cta="quote"
                className="hbs-btn-primary min-h-[48px] px-6 text-xs font-black uppercase tracking-wider shadow-md rounded-lg active:scale-[0.98]"
              >
                <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                <span>Get Free Quote</span>
              </Link>

              <a
                href={bottomWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-hbs-cta="whatsapp"
                className="hbs-btn-whatsapp min-h-[48px] px-6 text-xs font-bold uppercase tracking-wider shadow-md rounded-lg active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${phoneRaw}`}
                data-hbs-cta="call"
                aria-label={`Call Hind Build at ${content.phone}`}
                className="hbs-btn-secondary min-h-[48px] px-5 text-xs font-bold uppercase tracking-wider rounded-lg active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Call Hind Build</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
