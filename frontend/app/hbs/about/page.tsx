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
} from "lucide-react";
import { fetchHbsContent } from "@/lib/hbsData";
import { cleanTelNumber, getContactWhatsAppUrl } from "@/lib/hbsWhatsApp";

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
      value: "19 Trades",
      label: "Turnkey Solutions",
      desc: "Single-window accountability for waterproofing, cracks, and restoration.",
    },
    {
      value: "NDT First",
      label: "Diagnosis Origin",
      desc: "Electronic moisture scanners to identify root cause before treatment.",
    },
    {
      value: "Written",
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

  const phoneRaw = cleanTelNumber(content.phone);
  const contactWaUrl = getContactWhatsAppUrl(content.whatsapp);

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
    <div className="space-y-14 sm:space-y-20 lg:space-y-24 py-6 sm:py-10 pb-28 lg:pb-16 bg-white overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO SECTION (Light Architectural Composition with Image Showcase)
      ───────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="about-hero-heading"
        className="relative bg-gradient-to-b from-amber-50/40 via-white to-slate-50/60 border-b border-slate-200/80 -mt-6 sm:-mt-10 overflow-hidden py-8 sm:py-14 lg:py-18"
      >
        {/* Subtle Architectural Dot Matrix Grid */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-slate-500 mb-4 sm:mb-6 font-medium"
          >
            <Link href={homeHref} className="hover:text-amber-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">About Hind Build</span>
          </nav>

          {aboutData.heroMode === "IMAGE_ONLY" ? (
            <div className="space-y-6">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-900 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider rounded-full shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {aboutData.heroBadge || "Specialized Division of Hindustan Projects (HiPRO)"}
                  </span>
                </div>

                <h1
                  id="about-hero-heading"
                  className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase font-display tracking-tight text-slate-950 leading-[1.12]"
                >
                  {aboutData.heroTitle ? (
                    aboutData.heroTitle
                  ) : (
                    <>
                      Engineering Heritage &amp;{" "}
                      <span className="text-amber-600">About Hind Build</span>
                    </>
                  )}
                </h1>

                <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl leading-relaxed">
                  {aboutData.heroSubtitle ||
                    "Bridging the gap between unorganized local handymen and large-scale civil contractors with turnkey engineering discipline, non-destructive diagnostic testing, itemized BOQs, and written warranties across Rajasthan."}
                </p>

                {/* Primary Actions */}
                <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:gap-3 pt-2">
                  <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3">
                    <Link
                      href={`${prefix}/contact`}
                      data-hbs-cta="quote"
                      className="hbs-btn-primary min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md rounded-lg active:scale-[0.98] justify-center"
                    >
                      <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>Get Free Quote</span>
                    </Link>

                    <Link
                      href={`${prefix}/services`}
                      className="hbs-btn-secondary min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 text-xs font-bold uppercase tracking-wider shadow-2xs rounded-lg active:scale-[0.98] justify-center"
                    >
                      <span>19 Services</span>
                      <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                    </Link>
                  </div>

                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] sm:min-h-[48px] border border-slate-300 hover:border-slate-400 bg-white text-slate-800 hover:text-slate-950 text-xs font-mono font-semibold transition-all rounded-lg active:scale-[0.98] shadow-2xs"
                    aria-label={`Call Hind Build at ${content.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{content.phone || "+91 75970 00601"}</span>
                  </a>
                </div>
              </div>

              {/* Single Full-Width Banner Image */}
              <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={aboutData.heroImage || DEFAULT_ABOUT_DATA.heroImage}
                  alt="Hind Build Civil Engineering & Restoration"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                {/* Coordinates Badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-amber-400 font-mono text-[10px] sm:text-xs font-semibold border border-amber-500/30 shadow-md">
                  BHILWARA · RAJASTHAN [25.3463° N, 74.6360° E]
                </div>

                {/* Floating Bottom Badge */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/10 text-[10px] sm:text-xs font-mono text-slate-300 flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-white">Hind Build Engineering</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-amber-300">Turnkey Civil Execution · Rajasthan</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Value Prop, CTAs */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-900 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider rounded-full shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {aboutData.heroBadge || "Specialized Division of Hindustan Projects (HiPRO)"}
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h1
                    id="about-hero-heading"
                    className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase font-display tracking-tight text-slate-950 leading-[1.12]"
                  >
                    {aboutData.heroTitle ? (
                      aboutData.heroTitle
                    ) : (
                      <>
                        Engineering Heritage &amp;{" "}
                        <span className="text-amber-600">About Hind Build</span>
                      </>
                    )}
                  </h1>

                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl leading-relaxed">
                    {aboutData.heroSubtitle ||
                      "Bridging the gap between unorganized local handymen and large-scale civil contractors with turnkey engineering discipline, non-destructive diagnostic testing, itemized BOQs, and written warranties across Rajasthan."}
                  </p>
                </div>

                {/* Quick Trust Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1 max-w-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Senior Civil Engineering Oversight</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Non-Destructive Thermal &amp; Moisture NDT</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Itemized Digital BOQs with Zero Hidden Costs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Written Performance Warranties Handover</span>
                  </div>
                </div>

                {/* Primary Actions (Mobile-tuned 2-col or desktop flex) */}
                <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:gap-3 pt-2">
                  <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3">
                    <Link
                      href={`${prefix}/contact`}
                      data-hbs-cta="quote"
                      className="hbs-btn-primary min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md rounded-lg active:scale-[0.98] justify-center"
                    >
                      <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>Get Free Quote</span>
                    </Link>

                    <Link
                      href={`${prefix}/services`}
                      className="hbs-btn-secondary min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 text-xs font-bold uppercase tracking-wider shadow-2xs rounded-lg active:scale-[0.98] justify-center"
                    >
                      <span>19 Services</span>
                      <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                    </Link>
                  </div>

                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] sm:min-h-[48px] border border-slate-300 hover:border-slate-400 bg-white text-slate-800 hover:text-slate-950 text-xs font-mono font-semibold transition-all rounded-lg active:scale-[0.98] shadow-2xs"
                    aria-label={`Call Hind Build at ${content.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{content.phone || "+91 75970 00601"}</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Hero Photographic Showcase */}
              <div className="lg:col-span-5">
                <div className="relative group">
                  {/* Decorative Amber Glow */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aboutData.heroImage || DEFAULT_ABOUT_DATA.heroImage}
                      alt="Hind Build Civil Engineering & Restoration"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    />

                    {/* Gradient Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    {/* Coordinates Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-amber-400 font-mono text-[10px] font-semibold border border-amber-500/30 shadow-md">
                      BHILWARA · RAJASTHAN [25.3463° N, 74.6360° E]
                    </div>

                    {/* Floating Bottom Card */}
                    <div className="absolute bottom-3 left-3 right-3 p-3 sm:p-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-lg flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/hbs-icon.jpg"
                          alt="Hind Build"
                          className="w-8 h-8 rounded-lg object-contain shrink-0 border border-slate-200 bg-white"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate font-display uppercase tracking-tight">
                            Engineering Site Care
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 truncate">
                            Non-Destructive Testing · Certified Materials
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-[10px] rounded-md uppercase">
                        Parent Supervised
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4-Key Metrics Strip (2x2 on Mobile, 4-col on Desktop) */}
          <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {(aboutData.keyMetrics || DEFAULT_ABOUT_DATA.keyMetrics || []).map((km, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-amber-400/50 transition-all group"
              >
                <span className="text-amber-600 font-mono text-xl sm:text-2xl font-black block group-hover:translate-x-0.5 transition-transform">
                  {km.value}
                </span>
                <h3 className="text-[11px] sm:text-xs uppercase font-mono font-bold tracking-wider text-slate-900 mt-1">
                  {km.label}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-normal mt-0.5 sm:mt-1">
                  {km.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          2. STORY & GENESIS (Symmetrical, Balanced 2-Column Section)
      ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Narrative & Heritage */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1.5">
              <span className="text-amber-700 font-mono text-xs uppercase tracking-widest font-bold block">
                Engineering Heritage &amp; Genesis
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 uppercase font-display tracking-tight leading-tight">
                {aboutData.storyTitle || "Why We Founded Hind Build"}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3.5">
              <p>
                {content.aboutStory ||
                  "Hind Build was founded under Hindustan Projects (HiPRO) to bridge the massive gap between informal local handymen and large civil contractors. Modern buildings represent substantial investments, yet minor moisture ingress, foundation settlements, and electrical wear frequently turn into catastrophic structural hazards. Hind Build brings certified engineering discipline, non-destructive diagnosis, and turnkey accountability to building maintenance across Rajasthan."}
              </p>
              <p>
                Every site inspection is carried out with digital moisture sensors, thermal imaging,
                and acoustic scanners to treat root causes rather than superficial cosmetic
                cover-ups.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/80 to-amber-100/40 text-slate-900 border-l-4 border-amber-500 rounded-xl border border-amber-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Parent Company Engineering Supervision</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Operating with the rigorous technical standards, bulk chemical procurement power, and
                senior structural engineering oversight of Hindustan Projects (HiPRO).
              </p>
            </div>
          </div>

          {/* Right Column: Story Photo Showcase + Inspection Specs */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-100 aspect-[4/3] group">
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
                <span className="block text-[10px] font-mono font-bold text-amber-700 uppercase">IS Codes</span>
                <span className="block text-xs font-semibold text-slate-800">Compliant</span>
              </div>
              <div className="p-2 sm:p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="block text-[10px] font-mono font-bold text-amber-700 uppercase">Chemicals</span>
                <span className="block text-xs font-semibold text-slate-800">Industrial</span>
              </div>
              <div className="p-2 sm:p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="block text-[10px] font-mono font-bold text-amber-700 uppercase">Pricing</span>
                <span className="block text-xs font-semibold text-slate-800">Itemized BOQ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          3. CORPORATE MISSION & VISION (Balanced 2-Column Side-by-Side Grid)
      ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Corporate Mission */}
          <div className="bg-gradient-to-br from-white to-amber-50/20 border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-3 hover:border-amber-400/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
                  <Target className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
                  Corporate Mission
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 uppercase font-display tracking-tight">
                Extend Structural Longevity &amp; Protect Investments
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {content.mission ||
                  "To extend the functional life, aesthetic dignity, and structural safety of every residential, commercial, and industrial property through dependable, engineering-grade maintenance."}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-mono text-amber-700 font-semibold uppercase">
              <Check className="w-3.5 h-3.5 text-amber-600" />
              <span>Turnkey Execution · Engineering Standards</span>
            </div>
          </div>

          {/* Corporate Vision */}
          <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Eye className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                  Corporate Vision
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 uppercase font-display tracking-tight">
                Rajasthan&apos;s Most Dependable Single-Window Brand
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {content.vision ||
                  "To be Rajasthan's most trusted single-window building maintenance and protection brand, synonymous with integrity, speed, and lasting craftsmanship."}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-mono text-slate-700 font-semibold uppercase">
              <Check className="w-3.5 h-3.5 text-slate-600" />
              <span>Statewide Reach · Written Assurance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          4. WHY CHOOSE HIND BUILD (Core Guiding Principles - Light Theme)
      ───────────────────────────────────────────────────────────────── */}
      {whyChooseItems.length > 0 && (
        <section className="bg-slate-50 py-14 sm:py-20 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10 sm:mb-12 space-y-2">
              <span className="text-amber-700 font-mono text-xs uppercase tracking-wider font-bold block">
                The Engineering Standard
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase font-display tracking-tight text-slate-950">
                Core Guiding Principles
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Built on engineering accuracy, certified materials, and institutional accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {whyChooseItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3 shadow-2xs hover:shadow-md hover:border-amber-400/50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 font-mono font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    0{idx + 1}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase font-display tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-1.5">
            <span className="text-amber-700 font-mono text-xs uppercase tracking-wider font-bold block">
              Operational Backbone
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
              Execution &amp; Supervisory Standards
            </h2>
            <p className="text-xs text-slate-500">
              Structured engineering governance ensuring code-compliant site handover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {teamItems.map((member, idx) => (
              <div
                key={idx}
                className="bg-white p-5 sm:p-6 border border-slate-200 rounded-2xl space-y-2.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase font-display tracking-tight pt-1">
                  {member.name}
                </h3>
                <p className="text-xs font-semibold text-amber-700 uppercase font-mono tracking-wider">
                  {member.role}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          6. CALL TO ACTION (Direct Site Evaluation Action)
          [CRITICAL USER CONSTRAINT: footer ke uper wale 1 jo cta wala hai usko kuch mat kerna]
      ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900/95 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-l-amber-500 border border-slate-800 rounded-2xl shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-xl sm:text-3xl font-black uppercase font-display">
              Have Questions About A Repair or Renovation?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Speak directly with a Hind Build engineer or request a non-destructive site evaluation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href={`${prefix}/contact`}
              data-hbs-cta="quote"
              className="hbs-btn-primary min-h-[48px] px-6 text-xs font-black uppercase tracking-wider shadow-md rounded-lg active:scale-[0.98]"
            >
              <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Get Free Quote</span>
            </Link>
            <a
              href={contactWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-hbs-cta="whatsapp"
              className="hbs-btn-whatsapp min-h-[48px] px-5 text-xs font-bold uppercase tracking-wider shadow-md rounded-lg active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${phoneRaw}`}
              data-hbs-cta="call"
              aria-label={`Call Hind Build at ${content.phone}`}
              className="hbs-btn-secondary min-h-[48px] px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 rounded-lg active:scale-[0.98]"
            >
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Call Hind Build</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
