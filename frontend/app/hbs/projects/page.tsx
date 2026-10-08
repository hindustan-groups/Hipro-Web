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
  Award,
} from "lucide-react";
import {
  fetchHbsProjects,
  fetchHbsContent,
  fetchHbsServices,
} from "@/lib/hbsData";
import { cleanTelNumber, cleanWhatsAppNumber, buildHbsWhatsAppUrl } from "@/lib/hbsWhatsApp";
import HbsProjectsDirectory from "@/components/hbs/HbsProjectsDirectory";
import HbsHomePreFooterCta from "@/components/hbs/HbsHomePreFooterCta";

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

      <div className="bg-white text-slate-900 pb-0 space-y-12 sm:space-y-16">
        {/* ─────────────────────────────────────────────────────────────────
            1. PORTFOLIO HERO (Modern Architectural Composition)
        ───────────────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="projects-hero-heading"
          className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/80 pt-12 sm:pt-20 pb-12 sm:pb-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Heading, Value Prop, CTAs */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    Field Records &amp; Project Portfolio
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider">
                    {projects.length} Documented Works
                  </span>
                </div>

                <div className="space-y-3">
                  <h1
                    id="projects-hero-heading"
                    className="text-3xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-slate-900 leading-[1.12]"
                  >
                    Projects &amp; Proven Field Work
                    <span className="block text-blue-700 font-bold mt-1 text-2xl sm:text-3xl lg:text-4xl">
                      Executed Under Coordinated Civil Engineers
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-sans">
                    Documented structural rehabilitations, positive-side waterproofing treatments,
                    and specialized civil engineering works across Rajasthan. Turnkey execution with material certifications
                    and post-completion handover audits.
                  </p>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href={`${prefix}/contact`}
                    data-hbs-cta="quote"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98]"
                  >
                    <Wrench className="w-4 h-4 text-white shrink-0" />
                    <span>Get Free Inspection Quote</span>
                    <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </Link>

                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    aria-label={`Call Hind Build at ${content.phone}`}
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-[#0D2D5E] hover:bg-[#0A2349] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4 text-white shrink-0" />
                    <span>Call: {content.phone || "+91 94625 77757"}</span>
                  </a>

                  <a
                    href={heroWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hbs-cta="whatsapp"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl border border-emerald-300 bg-white text-emerald-700 text-xs sm:text-sm font-bold hover:bg-emerald-50 shadow-xs transition-colors active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Architectural Technical Metrics Card */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-[11px] font-mono text-red-600 uppercase tracking-widest font-bold">
                      PORTFOLIO METRICS
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      {projects.length === 0
                        ? "STATUS: PUBLICATION PENDING"
                        : "STATUS: ACTIVE ARCHIVE"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-red-600">
                        {projects.length}+
                      </div>
                      <div className="text-[11px] font-mono uppercase text-slate-600 tracking-wider mt-1 font-bold">
                        {projects.length === 0
                          ? "Documented Records"
                          : "Published Works"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Verified site reports
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-[#0D2D5E]">
                        HiPRO
                      </div>
                      <div className="text-[11px] font-mono uppercase text-slate-600 tracking-wider mt-1 font-bold">
                        Civil Heritage
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Established engineering
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-[#0D2D5E]">
                        100%
                      </div>
                      <div className="text-[11px] font-mono uppercase text-slate-600 tracking-wider mt-1 font-bold">
                        Itemized BOQ
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Transparent accounting
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-red-600">
                        Written
                      </div>
                      <div className="text-[11px] font-mono uppercase text-slate-600 tracking-wider mt-1 font-bold">
                        Work Warranty
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Certified execution
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Non-destructive root cause diagnostics before quotation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 border border-red-200/70 inline-block mb-2 rounded-md">
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
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-50 border border-red-200/70 text-red-600 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md">
                    <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Standardized Engineering Protocol</span>
                  </div>
                  <h2
                    id="process-heading"
                    className="text-2xl sm:text-3xl font-black uppercase font-display text-slate-900"
                  >
                    How Hind Build Executes Every Project
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md">
                  A disciplined 5-step engineering lifecycle ensuring
                  non-destructive root cause identification, certified
                  materials, and transparent deliverables.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {processSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50/70 p-5 border border-slate-200/80 rounded-xl space-y-2.5 relative group hover:border-red-400 hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-black text-red-600">
                        {step.step || String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                        PHASE
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase font-display pt-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            4. UNIFIED HIND BUILD PRE-FOOTER CTA
        ───────────────────────────────────────────────────────────────── */}
        <HbsHomePreFooterCta
          content={content}
          isSubdomain={isSubdomain}
        />
      </div>
    </>
  );
}
