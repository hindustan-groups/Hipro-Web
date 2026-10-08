import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Award,
  Clock,
  Wrench,
  Building2,
  ChevronRight,
  HardHat,
  MessageSquare,
  Phone,
  Target,
  Eye,
  Check,
  Cpu,
  Sparkles,
  MapPin,
} from "lucide-react";
import { fetchHbsContent } from "@/lib/hbsData";
import { cleanTelNumber, getContactWhatsAppUrl } from "@/lib/hbsWhatsApp";
import HbsHomePreFooterCta from "@/components/hbs/HbsHomePreFooterCta";

export const revalidate = 60;

interface KeyMetric {
  value: string;
  label: string;
  desc: string;
}

interface AboutCmsData {
  heroMode?: "SPLIT" | "IMAGE_ONLY";
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  storyTitle?: string;
  storyImage?: string;
  keyMetrics?: KeyMetric[];
}

const DEFAULT_ABOUT_DATA: AboutCmsData = {
  heroMode: "SPLIT",
  heroBadge: "Specialized Division of Hindustan Projects (HiPRO)",
  heroTitle: "Engineering Heritage & About Hind Build",
  heroSubtitle:
    "Bridging the gap between unorganized local handymen and large-scale civil contractors with turnkey engineering discipline, non-destructive diagnostic testing, itemized BOQs, and written warranties across Rajasthan.",
  heroImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=1200&auto=format&fit=crop",
  storyTitle: "Why We Founded Hind Build",
  storyImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
  keyMetrics: [
    {
      value: "HiPRO",
      label: "Parent Oversight",
      desc: "Supervised under senior civil engineering governance and quality benchmarks.",
    },
    {
      value: "Turnkey",
      label: "Full-Trade Solutions",
      desc: "Single-window accountability for waterproofing, cracks, and restoration.",
    },
    {
      value: "NDT First",
      label: "Diagnosis Origin",
      desc: "Electronic moisture scanners to identify root cause before treatment.",
    },
    {
      value: "10-Year",
      label: "Documented Warranty",
      desc: "Formal certificate issued with post-execution quality test sign-off.",
    },
  ],
};

function parseAboutImagesData(raw: any): AboutCmsData {
  if (!raw) return DEFAULT_ABOUT_DATA;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      const heroUrl =
        parsed[0]?.includes("1541888946425") || parsed[0]?.includes("1581094794329")
          ? DEFAULT_ABOUT_DATA.heroImage
          : parsed[0] || DEFAULT_ABOUT_DATA.heroImage;
      const storyUrl =
        parsed[1]?.includes("1504307651254")
          ? DEFAULT_ABOUT_DATA.storyImage
          : parsed[1] || DEFAULT_ABOUT_DATA.storyImage;
      return {
        ...DEFAULT_ABOUT_DATA,
        heroImage: heroUrl,
        storyImage: storyUrl,
      };
    }
    if (typeof parsed === "object" && parsed !== null) {
      const heroUrl =
        parsed.heroImage?.includes("1541888946425") || parsed.heroImage?.includes("1581094794329")
          ? DEFAULT_ABOUT_DATA.heroImage
          : parsed.heroImage || DEFAULT_ABOUT_DATA.heroImage;
      return {
        ...DEFAULT_ABOUT_DATA,
        ...parsed,
        heroMode: parsed.heroMode === "IMAGE_ONLY" ? "IMAGE_ONLY" : "SPLIT",
        heroImage: heroUrl,
        storyImage: parsed.storyImage || DEFAULT_ABOUT_DATA.storyImage,
        keyMetrics:
          Array.isArray(parsed.keyMetrics) && parsed.keyMetrics.length > 0
            ? parsed.keyMetrics
            : DEFAULT_ABOUT_DATA.keyMetrics,
      };
    }
  } catch {}
  return DEFAULT_ABOUT_DATA;
}

export async function generateMetadata() {
  const content = await fetchHbsContent();
  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const canonicalUrl = isSubdomain
    ? "https://hindbuilding.hindustanprojects.in/about"
    : "https://www.hindustanprojects.in/hbs/about";
  const baseUrl = isSubdomain
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in/hbs";

  return {
    title: "About Hind Build | Specialized Building Repair & Civil Protection",
    description:
      content.metaDescription ||
      "Learn about Hind Build, an engineering-driven civil and building maintenance division of Hindustan Projects (HiPRO) delivering turnkey repairs, diagnostics, and written warranties across Rajasthan.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: "About Hind Build | Engineering-Grade Building Solutions",
      description:
        "Learn about Hind Build, an engineering-driven civil division under Hindustan Projects (HiPRO).",
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: content.ogDefaultImage || `${baseUrl}/hbs-og-default.svg`,
          width: 1200,
          height: 630,
          alt: "About Hind Build",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "About Hind Build | Civil & Building Maintenance Division",
      description:
        "Learn about Hind Build, an engineering-driven civil division under Hindustan Projects (HiPRO).",
    },
  };
}

export default async function HbsAboutPage() {
  const content = await fetchHbsContent();

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const phoneRaw = cleanTelNumber(content.phone || "+919462577757");
  const contactWaUrl = getContactWhatsAppUrl(content.whatsapp || "919462577757");

  const aboutData = parseAboutImagesData(content.aboutImages);

  let teamItems: Array<{ name: string; role: string; desc: string }> = [];
  try {
    if (content.team) {
      const parsedTeam = JSON.parse(content.team);
      if (Array.isArray(parsedTeam)) teamItems = parsedTeam;
    }
  } catch {}

  let whyChooseItems: Array<{ title: string; description: string; icon?: string }> = [];
  try {
    const rawWhy = content.whyChoosePoints || content.whyChooseUs;
    if (rawWhy) {
      const parsedWhy = typeof rawWhy === "string" ? JSON.parse(rawWhy) : rawWhy;
      if (Array.isArray(parsedWhy)) whyChooseItems = parsedWhy;
    }
  } catch {}

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 bg-white overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO SECTION (Clean Architectural Canvas)
      ───────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="about-hero-heading"
        className="relative bg-slate-50/70 border-b border-slate-200/80 overflow-hidden py-10 sm:py-16 lg:py-20"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-slate-500 font-medium"
          >
            <Link href={homeHref} className="hover:text-red-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">About Hind Build</span>
          </nav>

          {aboutData.heroMode === "IMAGE_ONLY" ? (
            <div className="space-y-6">
              <div className="max-w-3xl space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {aboutData.heroBadge || "Specialized Division of Hindustan Projects (HiPRO)"}
                  </span>
                </div>

                <h1
                  id="about-hero-heading"
                  className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase font-display tracking-tight text-slate-900 leading-[1.14]"
                >
                  {aboutData.heroTitle ? (
                    aboutData.heroTitle
                  ) : (
                    <>
                      Engineering Heritage &amp;{" "}
                      <span className="text-red-600">About Hind Build</span>
                    </>
                  )}
                </h1>

                <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl leading-relaxed">
                  {aboutData.heroSubtitle ||
                    "Bridging the gap between unorganized local handymen and large-scale civil contractors with turnkey engineering discipline, non-destructive diagnostic testing, itemized BOQs, and written warranties across Rajasthan."}
                </p>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`${prefix}/contact`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Wrench className="w-4 h-4 text-white shrink-0" />
                    <span>Get Free Quote</span>
                  </Link>

                  <Link
                    href={`${prefix}/services`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0D2D5E] hover:bg-[#091F42] active:scale-[0.98] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <span>All Services</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={`tel:${phoneRaw}`}
                    className="inline-flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{content.phone || "+91 94625 77757"}</span>
                  </a>
                </div>
              </div>

              {/* Full Width Photo Banner */}
              <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200/90 shadow-xl bg-slate-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={aboutData.heroImage || DEFAULT_ABOUT_DATA.heroImage}
                  alt="Hind Build Civil Engineering & Restoration"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1 bg-[#0D2D5E]/90 backdrop-blur-md rounded-full text-white font-mono text-[10px] sm:text-xs font-semibold border border-white/20 shadow-md">
                  BHILWARA · RAJASTHAN [25.3463° N, 74.6360° E]
                </div>

                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 text-xs text-slate-800 flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-900">Hind Build Engineering</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-[#0D2D5E] font-medium">Turnkey Civil Execution Across Rajasthan</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Value Prop, CTAs */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {aboutData.heroBadge || "Specialized Division of Hindustan Projects (HiPRO)"}
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h1
                    id="about-hero-heading"
                    className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase font-display tracking-tight text-slate-900 leading-[1.14]"
                  >
                    {aboutData.heroTitle ? (
                      aboutData.heroTitle
                    ) : (
                      <>
                        Engineering Heritage &amp;{" "}
                        <span className="text-red-600">About Hind Build</span>
                      </>
                    )}
                  </h1>

                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl leading-relaxed">
                    {aboutData.heroSubtitle ||
                      "Bridging the gap between unorganized local handymen and large-scale civil contractors with turnkey engineering discipline, non-destructive diagnostic testing, itemized BOQs, and written warranties across Rajasthan."}
                  </p>
                </div>

                {/* 4 Trust Highlights with Green Checkmarks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Senior Civil Engineering Oversight</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Non-Destructive Thermal &amp; Moisture NDT</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Itemized Digital BOQs with 0 Hidden Costs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 10-Year Documented Warranties</span>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`${prefix}/contact`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Wrench className="w-4 h-4 text-white shrink-0" />
                    <span>Get Free Quote</span>
                  </Link>

                  <Link
                    href={`${prefix}/services`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0D2D5E] hover:bg-[#091F42] active:scale-[0.98] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <span>All Services</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={`tel:${phoneRaw}`}
                    className="inline-flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{content.phone || "+91 94625 77757"}</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Hero Photographic Showcase */}
              <div className="lg:col-span-5">
                <div className="relative group">
                  <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200/90 shadow-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aboutData.heroImage || DEFAULT_ABOUT_DATA.heroImage}
                      alt="Hind Build Civil Engineering & Restoration"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    <div className="absolute top-3 right-3 px-3 py-1 bg-[#0D2D5E]/90 backdrop-blur-md rounded-full text-white font-mono text-[10px] font-semibold border border-white/20 shadow-md">
                      BHILWARA · RAJASTHAN [25.3463° N, 74.6360° E]
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 p-3 sm:p-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-lg flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={content.logoPrimary || content.logo || "/hibuild-logo.png"}
                          alt="HiBUILD - Hind Building Solutions"
                          className="h-7 w-auto object-contain shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate font-display uppercase tracking-tight">
                            Engineering Site Care
                          </p>
                          <p className="text-[10px] text-slate-500 truncate font-medium">
                            Non-Destructive Testing · Certified Materials
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-50 border border-blue-200 text-[#0D2D5E] font-bold text-[10px] rounded-md uppercase">
                        Parent Supervised
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4-Key Metrics Strip (2x2 on Mobile, 4-col on Desktop) */}
          <div className="pt-8 border-t border-slate-200/90 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {(aboutData.keyMetrics || DEFAULT_ABOUT_DATA.keyMetrics || []).map((km, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-[#0D2D5E]/30 transition-all group"
              >
                <span className="text-[#0D2D5E] font-display text-xl sm:text-2xl font-black block group-hover:translate-x-0.5 transition-transform">
                  {km.value}
                </span>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-900 mt-1">
                  {km.label}
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal mt-1">
                  {km.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          2. STORY & GENESIS (Symmetrical 2-Column Section)
      ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Narrative & Heritage */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.75 bg-red-600 rounded-full" />
                <span className="text-xs font-black uppercase tracking-widest text-red-600">
                  Engineering Heritage &amp; Genesis
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 uppercase font-display tracking-tight leading-tight">
                {aboutData.storyTitle || "Why We Founded Hind Build"}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3.5 font-medium">
              <p>
                {content.aboutStory ||
                  "Hind Build was founded under Hindustan Projects (HiPRO) to bridge the massive gap between informal local handymen and large civil contractors. Modern buildings represent substantial investments, yet minor moisture ingress, foundation settlements, and structural cracks frequently turn into catastrophic hazards. Hind Build brings certified engineering discipline, non-destructive diagnosis, and turnkey accountability to building maintenance across Rajasthan."}
              </p>
              <p>
                Every site inspection is carried out with digital moisture sensors, thermal imaging,
                and acoustic scanners to treat root causes rather than superficial cosmetic
                cover-ups.
              </p>
            </div>

            {/* Parent Company Card */}
            <div className="p-4 sm:p-5 bg-slate-50 border-2 border-slate-200/90 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 shrink-0 text-red-600" />
                <span>Parent Company Engineering Supervision</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operating with the technical rigor, bulk chemical procurement, and senior structural engineering governance of{" "}
                <Link href="/" className="text-[#0D2D5E] font-bold underline hover:text-red-600">
                  Hindustan Projects (HiPRO)
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Right Column: Story Photo + 3 Specs Chips */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200/90 shadow-md bg-slate-100 aspect-[4/3] group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={aboutData.storyImage || DEFAULT_ABOUT_DATA.storyImage}
                alt="Hind Build Field Engineering"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <p className="text-white text-xs font-semibold leading-snug">
                  Precision moisture audits &amp; turnkey restoration in Bhilwara &amp; Rajasthan
                </p>
              </div>
            </div>

            {/* Quick 3 Specs Chips below photo */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 sm:p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="block text-[10px] font-bold text-red-600 uppercase">IS Codes</span>
                <span className="block text-xs font-bold text-slate-900">Compliant</span>
              </div>
              <div className="p-2 sm:p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="block text-[10px] font-bold text-[#0D2D5E] uppercase">Chemicals</span>
                <span className="block text-xs font-bold text-slate-900">ISI Certified</span>
              </div>
              <div className="p-2 sm:p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Pricing</span>
                <span className="block text-xs font-bold text-slate-900">Itemized BOQ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          3. CORPORATE MISSION & VISION (Side-by-Side Cards)
      ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Corporate Mission */}
          <div className="bg-white border-2 border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 hover:border-red-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <Target className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-red-700 uppercase tracking-wider">
                  Corporate Mission
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase font-display tracking-tight">
                Extend Structural Longevity &amp; Protect Investments
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {content.mission ||
                  "To extend the functional life, aesthetic dignity, and structural safety of every residential, commercial, and industrial property through dependable, engineering-grade maintenance."}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-red-700 font-bold uppercase">
              <Check className="w-4 h-4 text-red-600" />
              <span>Turnkey Execution · Engineering Standards</span>
            </div>
          </div>

          {/* Corporate Vision */}
          <div className="bg-white border-2 border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0D2D5E] shrink-0">
                  <Eye className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-[#0D2D5E] uppercase tracking-wider">
                  Corporate Vision
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase font-display tracking-tight">
                Rajasthan&apos;s Most Dependable Single-Window Brand
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {content.vision ||
                  "To be Rajasthan's most trusted single-window building maintenance and protection brand, synonymous with integrity, speed, and lasting craftsmanship."}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-[#0D2D5E] font-bold uppercase">
              <Check className="w-4 h-4 text-[#0D2D5E]" />
              <span>Statewide Reach · Written Assurance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          4. WHY CHOOSE HIND BUILD (Core Guiding Principles)
      ───────────────────────────────────────────────────────────────── */}
      {whyChooseItems.length > 0 && (
        <section className="bg-slate-50/70 py-14 sm:py-20 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10 sm:mb-12 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.75 bg-red-600 rounded-full" />
                <span className="text-xs font-black uppercase tracking-wider text-red-600">
                  The Engineering Standard
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase font-display tracking-tight text-slate-900">
                Core Guiding Principles
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Built on engineering accuracy, certified materials, and institutional accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {whyChooseItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-3 shadow-2xs hover:shadow-md hover:border-red-300 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-display font-black text-sm shrink-0 group-hover:scale-105 transition-transform">
                    0{idx + 1}
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase font-display tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          5. TEAM / SUPERVISORY STRUCTURE (Rendered only when CMS contains team)
      ───────────────────────────────────────────────────────────────── */}
      {teamItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-1.5">
            <span className="text-red-600 text-xs uppercase tracking-wider font-black block">
              Operational Backbone
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
              Execution &amp; Supervisory Standards
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Structured engineering governance ensuring code-compliant site handover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {teamItems.map((member, idx) => (
              <div
                key={idx}
                className="bg-white p-5 sm:p-6 border-2 border-slate-200/90 rounded-2xl space-y-2.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0D2D5E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase font-display tracking-tight pt-1">
                  {member.name}
                </h3>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  {member.role}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed pt-1 font-medium">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          6. PRE-FOOTER CTA BANNER (Unified Brand Theme)
      ───────────────────────────────────────────────────────────────── */}
      <HbsHomePreFooterCta
        phoneRaw={phoneRaw}
        phoneDisplay={content.phone || "+91 94625 77757"}
        whatsappNumber={content.whatsapp || "919462577757"}
        prefix={prefix}
      />
    </div>
  );
}
