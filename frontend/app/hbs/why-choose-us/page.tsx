import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Wrench,
  ArrowRight,
  Phone,
  MessageSquare,
  ChevronRight,
  Award,
  HardHat,
  Cpu,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Search,
  Scale,
  Building,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { fetchHbsContent, fetchHbsServices } from "@/lib/hbsData";
import { cleanTelNumber, cleanWhatsAppNumber, buildHbsWhatsAppUrl } from "@/lib/hbsWhatsApp";
import HbsHomePreFooterCta from "@/components/hbs/HbsHomePreFooterCta";
import HbsFaqAccordion from "@/components/hbs/HbsFaqAccordion";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchHbsContent();

  const isSubdomainActive =
    process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const baseUrl = isSubdomainActive
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in";
  const canonicalUrl = `${baseUrl}/why-choose-us`;

  const title = "Why Choose Hind Build | Engineering-Grade Building Maintenance";
  const description =
    "Discover why property owners across Rajasthan choose Hind Build over unorganized contractors. 19 specialized trades, non-destructive diagnostics, itemized BOQ, and written warranties.";

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
          alt: "Why Choose Hind Build",
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

const COMPARISON_ROWS = [
  {
    feature: "Diagnostic Methodology",
    hindBuild: "Non-destructive digital moisture meters, pipe pressure testers & rebar scanners before any chiseling.",
    local: "Blind guesswork, random wall chipping, and superficial plastering that misses the water pathway.",
  },
  {
    feature: "Engineering Supervision",
    hindBuild: "Qualified civil engineering graduates and senior HiPRO supervisors dedicated on-site daily.",
    local: "Unsupervised daily-wage masons with zero formal civil engineering training or quality checks.",
  },
  {
    feature: "Chemicals & Materials",
    hindBuild: "100% factory-sealed, batch-coded industrial systems (Dr. Fixit, Fosroc, Sika, Asian Paints).",
    local: "Diluted, repackaged, or expired chemical mixes purchased from unverified local retail outlets.",
  },
  {
    feature: "Cost Transparency & BOQ",
    hindBuild: "Itemized digital BOQ with exact square-footage, chemical specifications, and zero surprise add-ons.",
    local: "Rough verbal lump-sum estimates that escalate by 50%–80% once halfway through execution.",
  },
  {
    feature: "Warranty & Accountability",
    hindBuild: "Formal written warranty certificate with post-execution 48-hour flood testing and handover sign-off.",
    local: "Oral assurances with zero legal liability; unreachable when seepage recurs during next monsoon.",
  },
  {
    feature: "Service Spectrum",
    hindBuild: "Single-window coordination for 19 specialized structural, waterproofing, electrical & civil trades.",
    local: "Homeowner forced to coordinate 5 conflicting contractors with zero accountability between them.",
  },
];

const PILLARS = [
  {
    icon: HardHat,
    title: "HiPRO Civil Heritage & Governance",
    desc: "Backed by Hindustan Projects (HiPRO), bringing large-scale industrial civil rigor to residential, commercial, and institutional facility maintenance.",
    tag: "Parent Governance",
  },
  {
    icon: Cpu,
    title: "Non-Destructive Diagnostic Protocol",
    desc: "We pinpoint hydrostatic pressure vectors, capillary rising dampness, and pipe faults with electronic scanners before recommending a single rupee of civil intervention.",
    tag: "NDT Diagnostics",
  },
  {
    icon: Award,
    title: "Certified Chemical Applicators",
    desc: "Our applicators undergo manufacturer-certified training for polyurethane elastomeric coatings, polymer-modified mortars, and structural injection grouting.",
    tag: "Certified Craft",
  },
  {
    icon: FileText,
    title: "100% Itemized Digital BOQ",
    desc: "Every quotation is transparently itemized with product brands, application thicknesses (DFT/WFT), surface measurements, and milestone schedules.",
    tag: "Zero Hidden Costs",
  },
  {
    icon: ShieldCheck,
    title: "Written Multi-Year Warranties",
    desc: "We provide legally documented warranty certificates backed by thorough post-cure flood testing and thermal inspection audits.",
    tag: "Legal Security",
  },
  {
    icon: Clock,
    title: "Rapid Turnaround Across Rajasthan",
    desc: "Mobile inspection engineers and rapid-deployment teams stationed in Bhilwara, Jaipur, Udaipur, Kota, and Ajmer for timely doorstep service.",
    tag: "Regional Presence",
  },
];

const FAQS = [
  {
    q: "How is Hind Build different from regular local contractors or mistris?",
    a: "Local contractors rely on visual guesswork and often plaster over active leaks, leading to recurring dampness within months. Hind Build operates under formal civil engineering standards: we utilize non-destructive moisture scanners to isolate root causes, deploy certified chemical systems from Sika, Fosroc, and Dr. Fixit, provide itemized line-item BOQs, and back our work with written warranty certificates.",
  },
  {
    q: "Do you provide a formal written warranty on repair and waterproofing works?",
    a: "Yes. Every completed waterproofing, structural rehabilitation, and chemical barrier project receives an official written Hind Build warranty certificate specifying the treated areas, application grades, and warranty duration (up to 10 years depending on the service tier).",
  },
  {
    q: "What happens during your free doorstep site inspection?",
    a: "A qualified Hind Build site engineer visits your property with electronic moisture meters and diagnostic tools. They conduct a comprehensive walk-through, identify moisture ingress sources or structural fissures, document measurements, and prepare an itemized digital estimate without any obligation to proceed.",
  },
  {
    q: "Can Hind Build handle large commercial and industrial buildings as well as homes?",
    a: "Absolutely. Hind Build manages residential villas, apartment societies, commercial office complexes, hospitals, and industrial warehouses across Rajasthan. Our parent company heritage (Hindustan Projects) equips us with the heavy machinery, safety scaffolding, and multi-trade workforce needed for large facilities.",
  },
  {
    q: "How does your itemized BOQ prevent unexpected cost overruns?",
    a: "Unlike local handymen who quote vague lump-sum amounts that balloon mid-project, our BOQ details exact surface area (sq. ft), chemical brands, coats applied, and labour rates upfront. You know your complete financial outlay before work commences, with zero hidden surprises.",
  },
  {
    q: "Can I hire Hind Build for multiple maintenance issues at once?",
    a: "Yes! That is one of our greatest advantages. With 19 specialized building trades—including waterproofing, structural concrete repair, painting, plumbing, electrical, termite treatment, and civil renovation—you deal with a single project manager and one unified billing source.",
  },
];

export default async function HbsWhyChooseUsPage() {
  const [content, services] = await Promise.all([
    fetchHbsContent(),
    fetchHbsServices(),
  ]);

  let comparisonRows = COMPARISON_ROWS;
  let pillars = PILLARS;
  let faqs = FAQS;
  let protocolStages = [
    {
      step: "01",
      title: "NDT Root-Cause Audit",
      desc: "Electronic moisture scanners and pressure sensors isolate exact infiltration vectors.",
    },
    {
      step: "02",
      title: "Itemized Digital BOQ",
      desc: "Line-item estimate specifying exact chemical grades, surface area, and milestones.",
    },
    {
      step: "03",
      title: "Mechanical Surface Prep",
      desc: "Rotary grinding, V-grooving, and sound substrate exposure before chemical application.",
    },
    {
      step: "04",
      title: "Engineered Application",
      desc: "Multi-tier chemical membranes applied to calibrated wet-film thickness (WFT).",
    },
    {
      step: "05",
      title: "Flood Test & Handover",
      desc: "Rigorous 48-hour ponding test followed by written warranty certificate delivery.",
    },
  ];

  if (content.whyChooseUs) {
    try {
      const parsed =
        typeof content.whyChooseUs === "string"
          ? JSON.parse(content.whyChooseUs)
          : content.whyChooseUs;
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.comparisonRows) && parsed.comparisonRows.length > 0) {
          comparisonRows = parsed.comparisonRows;
        }
        if (Array.isArray(parsed.pillars) && parsed.pillars.length > 0) {
          pillars = parsed.pillars.map((p: any, idx: number) => ({
            ...p,
            icon: PILLARS[idx % PILLARS.length]?.icon || HardHat,
          }));
        }
        if (Array.isArray(parsed.faqs) && parsed.faqs.length > 0) {
          faqs = parsed.faqs;
        }
        if (Array.isArray(parsed.protocol) && parsed.protocol.length > 0) {
          protocolStages = parsed.protocol;
        }
      }
    } catch {}
  }

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const phoneRaw = cleanTelNumber(content.phone);
  const heroWaUrl = buildHbsWhatsAppUrl(
    content.whatsapp,
    "Hi Hind Build, I would like to learn more about your engineering standards and schedule a site inspection."
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Why Choose Hind Build",
    description:
      "Engineering-grade building maintenance, repair, and waterproofing with written warranties and itemized BOQ across Rajasthan.",
    url: isSubdomain
      ? "https://hindbuilding.hindustanprojects.in/why-choose-us"
      : "https://www.hindustanprojects.in/hbs/why-choose-us",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: pillars.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: p.title,
        description: p.desc,
      })),
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
        name: "Why Choose Us",
        item: isSubdomain
          ? "https://hindbuilding.hindustanprojects.in/why-choose-us"
          : "https://www.hindustanprojects.in/hbs/why-choose-us",
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
        {/* A. BREADCRUMB NAVIGATION */}
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
                Why Choose Us
              </li>
            </ol>
          </div>
        </nav>

        {/* ── 1. HERO SECTION (Centered Clean Architectural Layout) ── */}
        <section
          aria-labelledby="why-us-hero-heading"
          className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/80 pt-16 sm:pt-24 pb-14 sm:pb-20"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            {/* Badges in Center */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                The Hind Build Advantage
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider">
                Civil Engineering Rigor
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <div className="space-y-3 max-w-3xl mx-auto">
              <h1
                id="why-us-hero-heading"
                className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.12]"
              >
                Why Rajasthan Chooses Hind Build
                <span className="block text-slate-400 font-bold mt-2 text-2xl sm:text-3xl lg:text-4xl">
                  Engineering Rigor vs. Unregulated Guesswork
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto pt-1">
                Most building repairs in India fail because informal local mistris patch surface symptoms with generic cement while water continues to corrode rebar inside. Hind Build brings certified non-destructive diagnostics, transparent digital BOQs, and formal written warranties to protect your property investment.
              </p>
            </div>

            {/* Primary Actions Trio in Center */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <Link
                href={`${prefix}/contact`}
                data-hbs-cta="quote"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98]"
              >
                <Wrench className="w-4 h-4 text-white shrink-0" />
                <span>Book Free Site Inspection</span>
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

            {/* Trust Highlights Below Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Non-Destructive Electronic Diagnostics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>10-Year Documented Written Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Civil Engineer Supervised</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. HEAD-TO-HEAD COMPARISON MATRIX ──────────────────────── */}
        <section
          aria-labelledby="comparison-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6"
        >
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 border border-red-200/70 inline-block rounded-md">
              The Real Difference
            </span>
            <h2
              id="comparison-heading"
              className="text-2xl sm:text-4xl font-black uppercase font-display tracking-tight text-slate-900"
            >
              Hind Build vs. Local Unregulated Handymen
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Compare how our engineering-supervised model protects your building against recurring leaks, structural damage, and financial losses.
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90">
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider font-bold text-slate-500 bg-slate-50/60 w-1/4">
                    Evaluation Parameter
                  </th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider font-bold text-white bg-[#0D2D5E] w-3/8">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Hind Build (HiPRO Standard)</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider font-bold text-slate-600 bg-slate-100/80 w-3/8">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>Local Mistris / Contractors</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-5 px-6 font-bold text-slate-900 text-sm align-top font-display">
                      {row.feature}
                    </td>
                    <td className="py-5 px-6 text-xs sm:text-sm text-slate-800 bg-emerald-50/15 align-top">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{row.hindBuild}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-xs sm:text-sm text-slate-500 align-top">
                      <div className="flex items-start gap-2.5">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{row.local}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-Based Comparison View */}
          <div className="md:hidden space-y-4">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5"
              >
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    PARAMETER #{String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {row.feature}
                  </h3>
                </div>

                {/* Hind Build side */}
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hind Build Method</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {row.hindBuild}
                  </p>
                </div>

                {/* Local contractor side */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Typical Local Contractor</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {row.local}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. SIX PILLARS OF ENGINEERING EXCELLENCE ──────────────── */}
        <section
          aria-labelledby="pillars-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6"
        >
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 border border-red-200/70 inline-block rounded-md">
              Core Capabilities
            </span>
            <h2
              id="pillars-heading"
              className="text-2xl sm:text-4xl font-black uppercase font-display tracking-tight text-slate-900"
            >
              Six Pillars of Hind Build Engineering
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              How our structured processes ensure lasting structural protection and effortless property management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 hover:border-red-300 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200/80 text-red-600 flex items-center justify-center shadow-2xs group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        {pillar.tag}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors font-display">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400">
                      PILLAR #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Certified <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. 5-STEP ENGINEERING LIFECYCLE ────────────────────────── */}
        <section
          aria-labelledby="lifecycle-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-50 border border-red-200/70 text-red-600 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Standardized Engineering Protocol</span>
                </div>
                <h2
                  id="lifecycle-heading"
                  className="text-2xl sm:text-3xl font-black uppercase font-display text-slate-900"
                >
                  Our 5-Stage Execution Protocol
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md font-sans">
                Every Hind Build project follows strict ISO/IS-compliant milestones to guarantee permanent remediation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {protocolStages.map((stage, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 p-5 border border-slate-200/80 rounded-xl space-y-2.5 relative group hover:border-red-400 hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-black text-red-600">
                      {stage.step}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                      PHASE
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-display pt-1">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {stage.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. FREQUENTLY ASKED QUESTIONS ───────────────────────────── */}
        <section
          aria-labelledby="faqs-heading"
          className="max-w-4xl mx-auto px-4 sm:px-6"
        >
          <div className="text-center mb-8 space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 border border-red-200/70 inline-block rounded-md">
              Clear Answers
            </span>
            <h2
              id="faqs-heading"
              className="text-2xl sm:text-3xl font-black uppercase font-display text-slate-900"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Have questions about our inspection, warranty, or billing? Here are the most common questions answered.
            </p>
          </div>

          <HbsFaqAccordion faqs={faqs} />
        </section>

        {/* ── 6. UNIFIED PRE-FOOTER CTA ──────────────────────────────── */}
        <HbsHomePreFooterCta
          content={content}
          isSubdomain={isSubdomain}
        />
      </div>
    </>
  );
}
