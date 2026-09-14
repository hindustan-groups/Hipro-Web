import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Compass,
  HardHat,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  Phone,
  Mail,
  Clock,
  Sparkles,
  FileText,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react";
import CTASection from "@/components/CTASection";
import GroupEcosystem from "@/components/GroupEcosystem";
import { findAll } from "@/lib/db";
import type {
  TeamMember,
  Settings,
  AboutPageContent,
  AboutHighlightItem,
  AboutFactItem,
  AboutPrincipleItem,
  AboutStageItem,
  AboutSectorItem,
  AboutQualityItem,
} from "@/lib/types";
import { COMPANY_INFO, ABOUT_PAGE_DATA } from "@/lib/companyData";
import { isOptimizableImage } from "@/lib/imageUtils";

export const revalidate = 60;

function safeJsonParse<T>(value: any, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

async function getAboutContent(previewRequested?: boolean): Promise<{
  content: AboutPageContent | null;
  isPreviewActive: boolean;
}> {
  let isPreviewActive = false;
  let rawUrl = process.env.BACKEND_API_URL || "https://hipro-web-1.onrender.com";
  if (rawUrl.startsWith("https:") && !rawUrl.startsWith("https://")) {
    rawUrl = rawUrl.replace(/^https:?\/*/, "https://");
  } else if (rawUrl.startsWith("http:") && !rawUrl.startsWith("http://")) {
    rawUrl = rawUrl.replace(/^http:?\/*/, "http://");
  } else if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }
  const backendUrl = rawUrl.replace(/\/+$/, "");

  if (previewRequested) {
    try {
      const adminSession = cookies().get("admin_session")?.value;
      if (adminSession) {
        const res = await fetch(`${backendUrl}/api/about?preview=true`, {
          headers: { Cookie: `admin_session=${adminSession}` },
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return { content: json.data, isPreviewActive: true };
          }
        }
      }
    } catch (err) {
      console.warn("About draft preview fetch error:", err);
    }
  }

  try {
    const res = await fetch(`${backendUrl}/api/about`, {
      next: { revalidate: 60, tags: ["about"] },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return { content: json.data, isPreviewActive: false };
      }
    }
  } catch (err) {
    console.warn("About content fetch error, falling back to verified defaults:", err);
  }

  return { content: null, isPreviewActive: false };
}

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getAboutContent();
  let title = content?.metaTitle || "About Us — Engineering & Construction Firm";
  if (title.includes(" | Hindustan Projects (HiPRO)")) {
    title = title.replace(/\s*\|\s*Hindustan Projects \(HiPRO\).*/i, "").trim();
  }
  const description =
    content?.metaDescription ||
    "Hindustan Projects (HiPRO) is an engineering, turnkey construction, and infrastructure firm headquartered in Bhilwara, Rajasthan. Delivering disciplined civil execution, architectural planning, and precision surveying since 2019.";
  const canonical = content?.canonicalUrl || "/about";
  const ogTitle = content?.ogTitle || title;
  const ogDesc = content?.ogDescription || description;
  const ogImg = content?.ogImage || "/logo.jpg";
  const twTitle = content?.twitterTitle || ogTitle;
  const twDesc = content?.twitterDescription || ogDesc;
  const twImg = content?.twitterImage || ogImg;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "https://www.hindustanprojects.in/about",
      siteName: "Hindustan Projects (HiPRO)",
      title: ogTitle,
      description: ogDesc,
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: "Hindustan Projects (HiPRO)",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: twTitle,
      description: twDesc,
      images: [twImg],
    },
  };
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams?: { preview?: string };
}) {
  const previewRequested = searchParams?.preview === "true";

  const [{ content, isPreviewActive }, allTeam, settingsData] =
    await Promise.all([
      getAboutContent(previewRequested),
      findAll<TeamMember>("team"),
      findAll<Settings>("settings"),
    ]);

  const team = allTeam
    .filter((m) => m.active !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  const founderInDb = team.find((m) => m.isFounder);
  const additionalTeam = team.filter((m) => !m.isFounder);

  const settings = settingsData[0] || {};
  let pageContent: any = {};
  try {
    if (settings.pageContent) pageContent = JSON.parse(settings.pageContent);
  } catch {
    /* silent */
  }

  // Base verified company data defaults
  const fallback = ABOUT_PAGE_DATA;

  // Resolved Content with Field-by-Field Fallback Hierarchy
  const heroBadge = content?.heroBadge || fallback.hero.badge;
  const heroHeadingPrefix =
    content?.heroHeadingPrefix || fallback.hero.headingPrefix;
  const heroHeadingAccent =
    content?.heroHeadingAccent || fallback.hero.headingAccent;
  const heroHeadingSuffix =
    content?.heroHeadingSuffix || fallback.hero.headingSuffix;
  const heroDescription =
    content?.heroDescription || fallback.hero.description;
  const heroHighlights: AboutHighlightItem[] = safeJsonParse(
    content?.heroHighlights,
    fallback.hero.operationalHighlights
  );
  const heroPrimaryCta = content?.heroPrimaryCtaText || "Explore Capabilities";
  const heroSecondaryCta =
    content?.heroSecondaryCtaText || "Estimate Build Cost";

  // Executive Statement
  const executiveBadge =
    content?.executiveBadge || fallback.executiveStatement.badge;
  const executiveTitle =
    content?.executiveTitle || fallback.executiveStatement.title;
  const executiveStatementParagraphs: string[] = safeJsonParse(
    content?.executiveStatement,
    fallback.executiveStatement.statement
  );
  const founderImage =
    content?.founderImage ||
    founderInDb?.img ||
    pageContent?.aboutImage ||
    null;
  const founderImageAlt =
    content?.founderImageAlt ||
    founderInDb?.name ||
    fallback.executiveStatement.leaderName;

  // Company Facts
  const companyFacts: AboutFactItem[] = safeJsonParse(
    content?.companyFacts,
    fallback.companyAtAGlance
  );

  // Mission & Vision
  const missionTag = content?.missionTag || fallback.missionVision.mission.tag;
  const missionTitle =
    content?.missionTitle || fallback.missionVision.mission.title;
  const missionDescription =
    content?.missionDescription || fallback.missionVision.mission.description;
  const visionTag = content?.visionTag || fallback.missionVision.vision.tag;
  const visionTitle =
    content?.visionTitle || fallback.missionVision.vision.title;
  const visionDescription =
    content?.visionDescription || fallback.missionVision.vision.description;

  // Engineering Principles
  const engineeringPrinciples: AboutPrincipleItem[] = safeJsonParse(
    content?.engineeringPrinciples,
    fallback.missionVision.principles
  );

  // Execution Stages
  const executionStages: AboutStageItem[] = safeJsonParse(
    content?.executionStages,
    fallback.executionStages
  );

  // Capabilities & Sectors
  const capabilitiesSectors: AboutSectorItem[] = safeJsonParse(
    content?.capabilitiesSectors,
    fallback.capabilitiesAndSectors
  );

  // Quality & Commitments
  const qualityHeading =
    content?.qualityHeading ||
    "Committed to Quality & Responsible Engineering";
  const qualitySubtitle =
    content?.qualitySubtitle ||
    "Every building represents significant capital investment and enduring responsibility. We approach each phase with disciplined site supervision and transparent coordination.";
  const qualityCommitments: AboutQualityItem[] = safeJsonParse(
    content?.qualityCommitments,
    fallback.qualityCommitment
  );

  // Regional Focus
  const regionalHeading =
    content?.regionalHeading ||
    "Headquartered in Bhilwara. Serving Rajasthan.";
  const regionalDescription =
    content?.regionalDescription || fallback.regionalFocus.description;
  const defaultRegionalBullets = [
    "Familiarity with regional soil profiles, structural foundation needs, and Rajasthan climate conditions.",
    "Active coordination with local municipal sanction processes and statutory setback guidelines.",
    "Direct access to regional stone, masonry, cement, and steel supply chains for predictable project procurement.",
  ];
  const regionalBullets: string[] = safeJsonParse(
    content?.regionalBullets,
    defaultRegionalBullets
  );

  // Contact info stays unified with global Settings
  const phone = settings.companyPhone || COMPANY_INFO.formattedPhone;
  const email = settings.companyEmail || COMPANY_INFO.email;
  const address = settings.companyAddress || COMPANY_INFO.address;

  // Code-Controlled JSON-LD Schema
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": "https://www.hindustanprojects.in/about#webpage",
      url: "https://www.hindustanprojects.in/about",
      name:
        content?.metaTitle ||
        "About Us | Hindustan Projects (HiPRO) — Engineering & Construction",
      description:
        content?.metaDescription ||
        "Founded in 2019 in Bhilwara, Rajasthan, Hindustan Projects (HiPRO) delivers disciplined civil execution, architectural planning, precision surveying, and infrastructure solutions.",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://www.hindustanprojects.in/#website",
        url: "https://www.hindustanprojects.in/",
        name: "Hindustan Projects (HiPRO)",
      },
      about: {
        "@type": "Organization",
        "@id": "https://www.hindustanprojects.in/#organization",
        name: "Hindustan Projects (HiPRO)",
        url: "https://www.hindustanprojects.in/",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          "position": 1,
          name: "Home",
          item: "https://www.hindustanprojects.in/",
        },
        {
          "@type": "ListItem",
          "position": 2,
          name: "About Us",
          item: "https://www.hindustanprojects.in/about",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Yogesh Kharol",
      jobTitle: "Founder & Director",
      ...(founderImage ? { image: founderImage } : {}),
      worksFor: {
        "@type": "Organization",
        name: "Hindustan Projects (HiPRO)",
        url: "https://www.hindustanprojects.in/",
      },
    },
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Admin Draft Preview Notification Banner */}
      {isPreviewActive && (
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2.5 text-xs uppercase tracking-wider text-center sticky top-0 z-50 flex items-center justify-center gap-3 shadow-md">
          <span>⚠️ Admin Preview Mode — Viewing Live Unpublished Draft Content</span>
          <Link
            href="/admin/about"
            className="underline hover:text-white transition-colors text-[11px] font-extrabold ml-2"
          >
            Return to Admin CMS &rarr;
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO: Corporate Header & Operational Snapshot
          ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-36 pb-20 px-4 overflow-hidden border-b border-slate-200/80">
        {/* Subtle Architectural Blueprint Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #0F2C59 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 right-0 w-96 h-96 bg-slate-100/60 rounded-full blur-3xl pointer-events-none -z-0"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-slate-100 border border-slate-200 text-construction-navy mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-construction-red" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {heroBadge}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 font-display uppercase tracking-tight leading-[1.12]">
            {heroHeadingPrefix}{" "}
            <span className="font-serif italic font-normal text-construction-red normal-case">
              {heroHeadingAccent}
            </span>{" "}
            {heroHeadingSuffix}
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed mb-10">
            {heroDescription}
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link
              href="/services"
              className="inline-flex items-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-8 py-3.5 rounded-none text-xs uppercase tracking-widest transition-all shadow-md shadow-blue-950/20"
            >
              {heroPrimaryCta}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/cost-estimator"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold px-7 py-3.5 rounded-none text-xs uppercase tracking-widest border border-slate-300 transition-all shadow-sm"
            >
              {heroSecondaryCta}
            </Link>
          </div>

          {/* Verified Operational Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-200/80">
            {heroHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 p-4 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {highlight.label}
                </p>
                <p className="text-sm sm:text-base font-bold text-black font-display uppercase tracking-tight">
                  {highlight.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — EXECUTIVE STATEMENT: Leadership Perspective
          ───────────────────────────────────────────────────────────── */}
      <section
        id="leadership-statement"
        className="py-24 bg-slate-50 border-b border-slate-200/80 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Leadership Visual Representation */}
            <div className="lg:col-span-5">
              {founderImage ? (
                <div className="relative h-[460px] w-full rounded-none overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
                  <Image
                    src={founderImage}
                    alt={founderImageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    unoptimized={!isOptimizableImage(founderImage)}
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-xl font-bold font-display uppercase tracking-tight">
                      {fallback.executiveStatement.leaderName}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-slate-300 font-medium">
                      {fallback.executiveStatement.leaderRole}
                    </p>
                  </div>
                </div>
              ) : (
                /* Architectural Leadership Card Fallback */
                <div className="relative h-[460px] w-full rounded-none overflow-hidden border border-slate-200/80 bg-white p-8 md:p-10 shadow-lg flex flex-col justify-between">
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #0F2C59 1px, transparent 1px), linear-gradient(to bottom, #0F2C59 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                    aria-hidden="true"
                  />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-widest">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Executive Office
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      Est. 2019
                    </span>
                  </div>

                  {/* Monogram Crest */}
                  <div className="relative z-10 text-center my-auto py-8">
                    <div className="w-24 h-24 mx-auto border-2 border-construction-navy flex items-center justify-center bg-slate-50 mb-6 shadow-sm">
                      <Building2 className="w-12 h-12 text-construction-navy" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display uppercase tracking-tight">
                      {fallback.executiveStatement.leaderName}
                    </h2>
                    <p className="text-xs font-bold text-construction-red uppercase tracking-wider mt-1">
                      {fallback.executiveStatement.leaderRole}
                    </p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
                      {fallback.executiveStatement.company}
                    </p>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Corporate Governance</span>
                    <span className="font-semibold text-slate-700">Bhilwara HQ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Leadership Statement Copy */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white border border-slate-200 text-construction-navy mb-5 shadow-sm">
                <span className="w-2 h-2 bg-construction-red" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {executiveBadge}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-black font-display uppercase tracking-tight mb-6 leading-tight">
                {executiveTitle}
              </h2>

              <div className="border-l-2 border-construction-red pl-6 space-y-4 mb-8">
                {executiveStatementParagraphs.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-base sm:text-lg text-slate-700 font-light leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Leadership Signoff Block */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-black font-display uppercase tracking-tight">
                    {fallback.executiveStatement.leaderName}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-construction-navy">
                    {fallback.executiveStatement.leaderRole} · {COMPANY_INFO.name}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={COMPANY_INFO.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Connect with Hindustan Projects on LinkedIn"
                    className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-[#0077b5] hover:border-[#0077b5] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={COMPANY_INFO.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Hindustan Projects on Instagram"
                    className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-[#E1306C] hover:border-[#E1306C] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={COMPANY_INFO.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit Hindustan Projects on Facebook"
                    className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — COMPANY AT A GLANCE: Corporate Specification Matrix
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-construction-navy mb-4">
              <FileText className="w-3.5 h-3.5 text-construction-navy" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Corporate Profile
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight">
              HiPRO At A Glance
            </h2>
            <p className="text-slate-600 mt-3 font-light text-base md:text-lg">
              Key operational parameters, headquarters context, and practice focus grounded strictly in verified corporate facts.
            </p>
          </div>

          {/* Architectural Specification Sheet Grid */}
          <div className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Left Column */}
              <div className="divide-y divide-slate-200">
                {companyFacts.slice(0, Math.ceil(companyFacts.length / 2)).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 sm:p-7 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {item.label}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 font-display">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="divide-y divide-slate-200">
                {companyFacts.slice(Math.ceil(companyFacts.length / 2)).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 sm:p-7 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {item.label}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 font-display">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — PURPOSE, VISION & ENGINEERING PRINCIPLES
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white border border-slate-200 text-construction-navy mb-4 shadow-sm">
              <Compass className="w-4 h-4 text-construction-red" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Corporate Tenets
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight">
              Mission, Vision &amp; Principles
            </h2>
            <p className="text-slate-600 mt-3 font-light text-base md:text-lg">
              The professional commitments and engineering disciplines guiding our architectural and civil projects.
            </p>
          </div>

          {/* Mission & Vision Split Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Mission */}
            <div className="p-8 sm:p-10 bg-white border border-slate-200/80 shadow-md relative">
              <div className="w-10 h-1 bg-construction-red mb-6" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {missionTag}
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-black font-display uppercase tracking-tight mb-4">
                {missionTitle}
              </h3>
              <p className="text-slate-600 font-light leading-relaxed text-base">
                {missionDescription}
              </p>
            </div>

            {/* Vision */}
            <div className="p-8 sm:p-10 bg-white border border-slate-200/80 shadow-md relative">
              <div className="w-10 h-1 bg-construction-navy mb-6" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {visionTag}
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-black font-display uppercase tracking-tight mb-4">
                {visionTitle}
              </h3>
              <p className="text-slate-600 font-light leading-relaxed text-base">
                {visionDescription}
              </p>
            </div>
          </div>

          {/* Core Engineering Principles Cards */}
          <div>
            <div className="text-center mb-10">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display uppercase tracking-tight">
                Core Engineering Principles
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {engineeringPrinciples.map((p, idx) => (
                <div
                  key={idx}
                  className="p-7 bg-white border border-slate-200/80 shadow-sm hover:border-construction-navy/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-100 border border-slate-200 text-construction-navy font-mono text-xs font-bold">
                      0{idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-black font-display uppercase tracking-tight">
                      {p.title}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — HOW HiPRO WORKS: 4-Stage Project Workflow
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-construction-navy mb-4">
              <Layers className="w-3.5 h-3.5 text-construction-navy" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Execution Lifecycle
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight">
              How We Deliver Projects
            </h2>
            <p className="text-slate-600 mt-3 font-light text-base md:text-lg">
              A structured 4-stage engineering lifecycle linking surveying, architectural coordination, civil construction, and verified handover.
            </p>
          </div>

          {/* 4 Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {executionStages.map((stage, idx) => (
              <div
                key={idx}
                className="relative bg-slate-50 border border-slate-200/80 p-7 flex flex-col justify-between hover:border-construction-navy/40 transition-colors"
              >
                <div>
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                    <span className="text-3xl font-black font-display text-construction-red">
                      {stage.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Phase {idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-black font-display uppercase tracking-tight mb-3">
                    {stage.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed mb-6">
                    {stage.desc}
                  </p>
                </div>

                {/* Service Link */}
                <div className="pt-4 border-t border-slate-200/60 mt-4">
                  <Link
                    href={`/services/${stage.serviceSlug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-construction-navy hover:text-construction-red transition-colors"
                  >
                    {stage.serviceName}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6 — CAPABILITIES & SECTORS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white border border-slate-200 text-construction-navy mb-4 shadow-sm">
                <HardHat className="w-4 h-4 text-construction-navy" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Core Capabilities
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight">
                Disciplines &amp; Sectors
              </h2>
              <p className="text-slate-600 mt-3 font-light text-base md:text-lg">
                Delivering civil construction, architectural design, surveying, and infrastructure solutions across major build sectors.
              </p>
            </div>

            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-construction-navy hover:text-construction-red transition-colors shrink-0"
            >
              View All 6 Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Quadrants Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {capabilitiesSectors.map((cap, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 p-8 sm:p-9 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-construction-red uppercase tracking-wider">
                      Sector 0{idx + 1}
                    </span>
                    <span className="w-2 h-2 bg-slate-300" />
                  </div>

                  <h3 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-3">
                    {cap.sector}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed mb-6">
                    {cap.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {cap.services.map((svc, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 border border-slate-200"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={`/services/${cap.primarySlug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-construction-navy hover:text-construction-red transition-colors"
                  >
                    Explore Sector Solutions <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Cost Estimator Contextual Banner */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight">
                Planning a Construction or Civil Project in Rajasthan?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 font-light mt-1">
                Use our interactive construction cost estimator to calculate indicative square-foot build budgets.
              </p>
            </div>
            <Link
              href="/cost-estimator"
              className="shrink-0 inline-flex items-center gap-2 bg-construction-navy hover:bg-slate-900 text-white font-bold px-6 py-3 text-xs uppercase tracking-widest transition-all"
            >
              Launch Cost Estimator <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7 — QUALITY & RESPONSIBLE EXECUTION (Dark Navy)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#091D36] text-white border-b border-slate-800 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white/10 border border-white/15 text-white mb-5">
              <ShieldCheck className="w-4 h-4 text-construction-red" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-200">
                Quality &amp; Responsibility
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display uppercase tracking-tight">
              {qualityHeading}
            </h2>
            <p className="text-slate-300 mt-4 font-light text-base md:text-lg leading-relaxed">
              {qualitySubtitle}
            </p>
          </div>

          {/* 4 Quality Commitments Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualityCommitments.map((qc, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 p-7 hover:border-white/30 transition-colors"
              >
                <div className="w-10 h-10 bg-white/10 border border-white/15 flex items-center justify-center text-construction-red font-display font-bold text-base mb-6">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-white font-display uppercase tracking-tight mb-3">
                  {qc.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  {qc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8 — BHILWARA & RAJASTHAN REGIONAL FOCUS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Regional Authority */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-construction-navy mb-5">
                <MapPin className="w-4 h-4 text-construction-red" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Regional Focus · Bhilwara HQ
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight mb-6 leading-tight">
                {regionalHeading}
              </h2>

              <p className="text-slate-600 text-base md:text-lg font-light leading-relaxed mb-6">
                {regionalDescription}
              </p>

              <div className="space-y-3 mb-8">
                {regionalBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-construction-red shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-7 py-3.5 rounded-none text-xs uppercase tracking-widest transition-all shadow-md"
              >
                Connect With Our Bhilwara Office
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: Office Contact Matrix */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 border border-slate-200/80 p-8 shadow-md">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-6">
                  <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center text-construction-navy">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black font-display uppercase tracking-tight">
                      Head Office Address
                    </h3>
                    <p className="text-[11px] font-bold text-construction-red uppercase tracking-wider">
                      Bhilwara, Rajasthan
                    </p>
                  </div>
                </div>

                <div className="space-y-5 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-light leading-relaxed">
                      {address}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <a
                      href={COMPANY_INFO.phoneTel}
                      className="text-slate-800 font-bold hover:text-construction-red transition-colors"
                    >
                      {phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <a
                      href={COMPANY_INFO.emailMailto}
                      className="text-slate-800 font-bold hover:text-construction-red transition-colors"
                    >
                      {email}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-600 font-light">
                      Mon – Sat: 09:00 AM – 07:00 PM
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Follow HiPRO:
                  </span>
                  <a
                    href={COMPANY_INFO.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-slate-500 hover:text-[#0077b5] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={COMPANY_INFO.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-slate-500 hover:text-[#E1306C] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={COMPANY_INFO.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="text-slate-500 hover:text-[#1877F2] transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          OPTIONAL: Additional Team Members (Rendered only if active team exists)
          ───────────────────────────────────────────────────────────── */}
      {additionalTeam.length > 0 && (
        <section className="py-20 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-construction-navy mb-2 block">
                Technical Team
              </span>
              <h2 className="text-3xl font-bold text-black font-display uppercase tracking-tight">
                Engineering &amp; Site Supervisors
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalTeam.map((m, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200/80 p-6 flex items-center gap-4 shadow-sm"
                >
                  {m.img ? (
                    <div className="relative w-16 h-16 shrink-0 rounded-none overflow-hidden bg-slate-100 border border-slate-200">
                      <Image
                        src={m.img}
                        alt={m.name}
                        fill
                        sizes="64px"
                        unoptimized={!isOptimizableImage(m.img)}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-construction-navy font-bold font-display text-lg">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display uppercase tracking-tight">
                      {m.name}
                    </h3>
                    <p className="text-xs font-semibold text-construction-navy uppercase tracking-wider mt-0.5">
                      {m.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9 — HINDUSTAN GROUP ECOSYSTEM
          ───────────────────────────────────────────────────────────── */}
      <GroupEcosystem pageContent={pageContent} />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10 — FINAL CTA: Project Consultation
          ───────────────────────────────────────────────────────────── */}
      <CTASection />
    </>
  );
}
