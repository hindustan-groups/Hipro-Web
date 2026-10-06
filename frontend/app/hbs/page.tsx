import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  Clock,
  Sparkles,
  Droplets,
  Building2,
  Cpu,
  Award,
  Layers,
  Star,
  ChevronRight,
  AlertTriangle,
  FileText,
  Search,
  FolderKanban,
  MapPin
} from "lucide-react";
import {
  fetchHbsContent,
  fetchHbsServices,
  fetchHbsProjects,
  fetchHbsTestimonials,
  DEFAULT_HBS_CONTENT
} from "@/lib/hbsData";

export const revalidate = 60;

export default async function HbsHomePage() {
  const [content, services, projects, testimonials] = await Promise.all([
    fetchHbsContent(),
    fetchHbsServices(),
    fetchHbsProjects(),
    fetchHbsTestimonials(),
  ]);

  const phoneRaw = content.phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  // Parse JSON configs safely with graceful fallbacks
  let whyChooseItems: Array<{ title: string; description: string; icon?: string }> = [];
  try {
    if (content.whyChooseUs) {
      whyChooseItems = typeof content.whyChooseUs === "string" ? JSON.parse(content.whyChooseUs) : (content.whyChooseUs as any);
    } else if (DEFAULT_HBS_CONTENT.whyChooseUs) {
      whyChooseItems = typeof DEFAULT_HBS_CONTENT.whyChooseUs === "string" ? JSON.parse(DEFAULT_HBS_CONTENT.whyChooseUs) : (DEFAULT_HBS_CONTENT.whyChooseUs as any);
    }
  } catch {
    whyChooseItems = [];
  }

  let statsItems: Array<{ label: string; value: string; icon?: string }> = [];
  try {
    if (content.stats) {
      statsItems = typeof content.stats === "string" ? JSON.parse(content.stats) : (content.stats as any);
    }
  } catch {
    statsItems = [];
  }

  let processSteps: Array<{ step: string; title: string; desc: string }> = [];
  try {
    if (content.processSteps) {
      processSteps = typeof content.processSteps === "string" ? JSON.parse(content.processSteps) : (content.processSteps as any);
    }
  } catch {
    processSteps = [];
  }

  let guaranteeData: { title?: string; description?: string; badge?: string } | null = null;
  try {
    if (content.guaranteeSection) {
      guaranteeData = typeof content.guaranteeSection === "string" ? JSON.parse(content.guaranteeSection) : (content.guaranteeSection as any);
    }
  } catch {
    guaranteeData = null;
  }

  let heroConfig = {
    enabled: true,
    displayMode: "TEXT_AND_IMAGE" as "TEXT_AND_IMAGE" | "TEXT_ONLY" | "IMAGE_ONLY",
    imagePosition: "right" as "right" | "left" | "background",
    imageFit: "cover" as "cover" | "contain",
    overlayStrength: "medium" as "none" | "light" | "medium" | "dark",
    badge: "A Specialized Division of Hindustan Projects (HiPRO)",
    primaryCtaLabel: "Book Site Inspection",
    primaryCtaUrl: "/contact",
    secondaryCtaLabel: "Chat on WhatsApp",
    secondaryCtaUrl: "",
    mobileImage: "",
    backgroundImage: "",
  };
  try {
    if (content.heroCtas) {
      const parsed = typeof content.heroCtas === "string" ? JSON.parse(content.heroCtas) : content.heroCtas;
      heroConfig = { ...heroConfig, ...parsed };
    }
  } catch {}

  const heroImage =
    content.heroImage ||
    DEFAULT_HBS_CONTENT.heroImage ||
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop";

  const effectiveBgImage = heroConfig.backgroundImage || heroImage;
  const overlayMap: Record<string, string> = {
    none: "bg-transparent",
    light: "bg-slate-950/30",
    medium: "bg-slate-950/65",
    dark: "bg-slate-950/85",
  };
  const overlayClass = overlayMap[heroConfig.overlayStrength] || "bg-slate-950/65";

  const primaryCtaDestination = heroConfig.primaryCtaUrl
    ? (heroConfig.primaryCtaUrl.startsWith("http")
        ? heroConfig.primaryCtaUrl
        : `${prefix}${heroConfig.primaryCtaUrl.startsWith("/") ? "" : "/"}${heroConfig.primaryCtaUrl}`)
    : `${prefix}/contact`;

  const secondaryCtaIsExternal = heroConfig.secondaryCtaUrl?.startsWith("http");
  const secondaryCtaDestination = heroConfig.secondaryCtaUrl
    ? (secondaryCtaIsExternal
        ? heroConfig.secondaryCtaUrl
        : `${prefix}${heroConfig.secondaryCtaUrl.startsWith("/") ? "" : "/"}${heroConfig.secondaryCtaUrl}`)
    : `https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Build,%20I%20would%20like%20to%20schedule%20a%20site%20inspection.`;

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO SECTION (CMS-Controlled Presentation Engine)
      ───────────────────────────────────────────────────────────────── */}
      {heroConfig.enabled && (
        <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
          {/* Background Mode Rendering */}
          {heroConfig.imagePosition === "background" && heroConfig.displayMode !== "IMAGE_ONLY" && (
            <div className="absolute inset-0 z-0">
              <Image
                src={effectiveBgImage}
                alt="Hind Build engineering backdrop"
                fill
                priority
                sizes="100vw"
                className={heroConfig.imageFit === "contain" ? "object-contain" : "object-cover"}
              />
              <div className={`absolute inset-0 ${overlayClass}`} />
            </div>
          )}

          {/* Subtle Engineering Grid Backdrop */}
          {heroConfig.imagePosition !== "background" && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
          )}

          {/* MODE 1: IMAGE_ONLY */}
          {heroConfig.displayMode === "IMAGE_ONLY" ? (
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-slate-900 border-b border-slate-800">
              <Image
                src={heroImage}
                alt="Hind Build site execution"
                fill
                priority
                sizes="100vw"
                className={heroConfig.imageFit === "contain" ? "object-contain" : "object-cover"}
              />
              <div className={`absolute inset-0 ${overlayClass}`} />
              <div className="absolute bottom-6 inset-x-4 sm:inset-x-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 z-10">
                <div className="space-y-2 max-w-2xl">
                  {heroConfig.badge && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{heroConfig.badge}</span>
                    </div>
                  )}
                  <h1 className="text-2xl sm:text-4xl font-black uppercase text-white font-display">
                    {content.heroTitle || "Complete Building Repair, Maintenance & Protection"}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={primaryCtaDestination}
                    className="hbs-btn-primary min-h-[44px] px-6 text-xs font-black uppercase tracking-wider shadow-lg"
                  >
                    <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>{heroConfig.primaryCtaLabel || "Book Site Inspection"}</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : heroConfig.displayMode === "TEXT_ONLY" || heroConfig.imagePosition === "background" ? (
            /* MODE 2: TEXT_ONLY or BACKGROUND IMAGE */
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 relative z-10 text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider mx-auto">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{heroConfig.badge || "A Specialized Division of Hindustan Projects (HiPRO)"}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-display leading-[1.08]">
                {content.heroTitle || "Complete Building Repair, Maintenance & Protection"}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
                {content.heroSubtitle ||
                  "Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions across Rajasthan."}
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-200 font-semibold font-mono max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 p-2 bg-slate-900/80 border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Non-Destructive Testing</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 bg-slate-900/80 border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Documented Warranty</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>19 Specialized Trades</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href={primaryCtaDestination}
                  className="hbs-btn-primary min-h-[48px] px-6 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg"
                >
                  <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>{heroConfig.primaryCtaLabel || "Book Site Inspection"}</span>
                </Link>

                <a
                  href={secondaryCtaDestination}
                  target={secondaryCtaDestination.startsWith("http") ? "_blank" : undefined}
                  rel={secondaryCtaDestination.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="hbs-btn-whatsapp min-h-[48px] px-6 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>{heroConfig.secondaryCtaLabel || "Chat on WhatsApp"}</span>
                </a>

                <Link
                  href={`${prefix}/services`}
                  className="hbs-btn-secondary min-h-[48px] px-5 text-xs uppercase tracking-wider font-bold"
                >
                  <span>19 Services Catalog</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                </Link>
              </div>
            </div>
          ) : (
            /* MODE 3: TEXT_AND_IMAGE (Split Composition with Left/Right option) */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Text Column */}
                <div
                  className={`lg:col-span-7 space-y-6 ${
                    heroConfig.imagePosition === "left" ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{heroConfig.badge || "A Specialized Division of Hindustan Projects (HiPRO)"}</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-display leading-[1.08]">
                    {content.heroTitle || "Complete Building Repair, Maintenance & Protection"}
                  </h1>

                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
                    {content.heroSubtitle ||
                      "Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions for homes, commercial complexes, and institutions across Rajasthan."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-200 font-semibold font-mono">
                    <div className="flex items-center gap-2 p-2 bg-slate-900/80 border border-slate-800">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Non-Destructive Testing</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-900/80 border border-slate-800">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Documented Warranty</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>19 Specialized Trades</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                    <Link
                      href={primaryCtaDestination}
                      className="hbs-btn-primary min-h-[48px] px-6 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg"
                    >
                      <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>{heroConfig.primaryCtaLabel || "Book Site Inspection"}</span>
                    </Link>

                    <a
                      href={secondaryCtaDestination}
                      target={secondaryCtaDestination.startsWith("http") ? "_blank" : undefined}
                      rel={secondaryCtaDestination.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="hbs-btn-whatsapp min-h-[48px] px-6 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md"
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>{heroConfig.secondaryCtaLabel || "Chat on WhatsApp"}</span>
                    </a>

                    <Link
                      href={`${prefix}/services`}
                      className="hbs-btn-secondary min-h-[48px] px-5 text-xs uppercase tracking-wider font-bold"
                    >
                      <span>19 Services Catalog</span>
                      <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                    </Link>
                  </div>
                </div>

                {/* Image Column */}
                <div
                  className={`lg:col-span-5 ${
                    heroConfig.imagePosition === "left" ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full bg-slate-900 border-2 border-slate-800 shadow-2xl overflow-hidden group">
                    <Image
                      src={heroImage}
                      alt="Hind Build technical site inspection and building maintenance execution"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 550px"
                      className={`${
                        heroConfig.imageFit === "contain" ? "object-contain" : "object-cover"
                      } transition-transform duration-700 group-hover:scale-105`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-3 inset-x-3 p-3 bg-slate-950/90 backdrop-blur-xs border border-slate-700/80 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-slate-200 font-bold uppercase tracking-wider">
                          Turnkey Civil Execution
                        </span>
                      </div>
                      <span className="text-amber-400 font-bold">Bhilwara &amp; Rajasthan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Notice / Priority Dispatch Strip */}
          <div className="bg-amber-500 text-slate-950 px-4 py-3 border-t border-amber-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold font-mono">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <Clock className="w-4 h-4 shrink-0 text-slate-950" />
                <span>ACTIVE WATER INGRESS OR CRITICAL STRUCTURAL CRACK? EMERGENCY INSPECTION DISPATCH IN BHILWARA</span>
              </div>
              <a
                href={`tel:${phoneRaw}`}
                className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-white px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
              >
                <Phone className="w-3 h-3 text-amber-400" />
                <span>Call: {content.phone}</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          2. TRUST / TECHNICAL FACT STRIP (Below Hero)
      ───────────────────────────────────────────────────────────────── */}
      <section aria-label="Technical Metrics" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-white shadow-xs">
          <div className="space-y-1">
            <span className="text-amber-400 font-mono text-2xl sm:text-3xl font-black block">
              19 Trades
            </span>
            <p className="text-xs uppercase tracking-wider text-slate-300 font-bold font-mono">
              Complete Portfolio
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              From foundation waterproofing to structural crack retrofitting.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-amber-400 font-mono text-2xl sm:text-3xl font-black block">
              HiPRO Civil
            </span>
            <p className="text-xs uppercase tracking-wider text-slate-300 font-bold font-mono">
              Engineering Heritage
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Senior engineering supervision and site inspection standards.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-amber-400 font-mono text-2xl sm:text-3xl font-black block">
              Certified
            </span>
            <p className="text-xs uppercase tracking-wider text-slate-300 font-bold font-mono">
              Industrial Materials
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Authorized chemical barriers and high-performance polymer grouts.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-amber-400 font-mono text-2xl sm:text-3xl font-black block">
              Written
            </span>
            <p className="text-xs uppercase tracking-wider text-slate-300 font-bold font-mono">
              Documented Warranty
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Comprehensive guarantees backed by post-execution test logs.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          3. PROBLEM → SOLUTION INTRO
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="problem-solution-heading" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border border-slate-200 bg-white p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl mb-8 space-y-2">
            <span className="text-amber-700 font-mono text-xs uppercase tracking-wider font-bold block">
              Engineering Diagnosis vs Temporary Fixes
            </span>
            <h2
              id="problem-solution-heading"
              className="text-2xl sm:text-4xl font-black text-slate-900 uppercase font-display tracking-tight"
            >
              Why Conventional Building Repair Fails
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Most building issues are treated cosmetically with plaster, white cement, or unverified contractors. Without root-cause diagnostic testing, moisture pathways remain active and structural concrete degrades internally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Problem Card */}
            <div className="p-6 bg-slate-50 border-l-4 border-l-red-600 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2.5 text-red-700">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <h3 className="text-base font-bold uppercase font-display tracking-wide">
                  The Common Property Risk
                </h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold shrink-0 mt-0.5 font-mono">✕</span>
                  <span><strong>Hidden Seepage Pathways:</strong> Water travels through capillary voids, showing up far from the actual leak source.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold shrink-0 mt-0.5 font-mono">✕</span>
                  <span><strong>Rebar Corrosion &amp; Spalling:</strong> Moisture exposure corrodes embedded steel, cracking structural concrete beams and slabs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold shrink-0 mt-0.5 font-mono">✕</span>
                  <span><strong>Unaccountable Local Labor:</strong> Piecemeal handymen offer zero written guarantees, requiring repeated costly rework every monsoon.</span>
                </li>
              </ul>
            </div>

            {/* The HBS Solution Card */}
            <div className="p-6 bg-slate-900 text-white border-l-4 border-l-amber-500 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-base font-bold uppercase font-display tracking-wide text-white">
                  The Hind Build Engineering Standard
                </h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Non-Destructive Diagnosis:</strong> Calibrated electronic moisture meters pinpoint ingress origins without invasive chipping.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Certified Chemical Systems:</strong> High-polymer elastomeric membranes, crystalline sealants, and polyurethane injection grouts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Turnkey Single Accountability:</strong> Complete project documentation, clear itemized BOQ, and written warranty certification.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          4. SERVICES SHOWCASE (All 19 Services Dynamically Linked)
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="services-catalog-heading" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-2 border border-amber-200/60">
              Full Spectrum Maintenance
            </div>
            <h2
              id="services-catalog-heading"
              className="text-2xl sm:text-4xl font-black text-slate-900 uppercase font-display tracking-tight"
            >
              Our 19 Specialized <span className="text-amber-600">Building Services</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Turnkey repair, preventative protection, and mechanical maintenance. Engineered for homes, housing societies, retail showrooms, and industrial plants.
            </p>
          </div>

          <Link
            href={`${prefix}/services`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <span>Complete 19 Services Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 19 Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const serviceNo = service.serviceNumber || String(index + 1).padStart(2, "0");
            return (
              <div
                key={service.id || service.slug}
                className="bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div className="p-6 space-y-3">
                  {/* Service Number & Category */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
                      SERVICE {serviceNo}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-600 tracking-wider font-semibold">
                      Engineering Trade
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-lg font-bold text-slate-900 uppercase font-display group-hover:text-amber-700 transition-colors">
                    <Link
                      href={`${prefix}/services/${service.slug}`}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      {service.title}
                    </Link>
                  </h3>

                  {/* Hindi Subtitle if available */}
                  {service.hindiTitle && (
                    <p className="text-xs text-amber-800 font-medium">
                      {service.hindiTitle}
                    </p>
                  )}

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {service.shortDescription ||
                      "Engineered solution providing specialized application, certified chemical barriers, and written work guarantee."}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-600 font-mono">
                    Guaranteed Execution
                  </span>
                  <Link
                    href={`${prefix}/services/${service.slug}`}
                    className="font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider text-[11px] inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
                  >
                    <span>Explore Service</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Catalog Banner CTA */}
        <div className="mt-8 p-6 bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Looking for detailed technical specifications, chemicals used, and application steps for each trade?
          </p>
          <Link
            href={`${prefix}/services`}
            className="hbs-btn-secondary min-h-[44px] px-5 text-xs font-bold uppercase tracking-wider shrink-0"
          >
            <span>Open All 19 Services Catalog</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          5. WHY HBS (Canonical whyChooseUs CMS field)
      ───────────────────────────────────────────────────────────────── */}
      {whyChooseItems.length > 0 && (
        <section aria-labelledby="why-hbs-heading" className="bg-slate-950 text-white py-16 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12 space-y-2">
              <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold block">
                The Engineering Standard
              </span>
              <h2
                id="why-hbs-heading"
                className="text-2xl sm:text-4xl font-black uppercase font-display tracking-tight text-white"
              >
                Why Property Owners Choose <span className="text-amber-400">Hind Build</span>
              </h2>
              <p className="text-sm text-slate-400">
                Backed by civil engineers, certified applicators, and institutional accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChooseItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 p-6 space-y-3 hover:border-amber-500/40 transition-colors"
                >
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-sm">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-white uppercase font-display">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          6. PROCESS / HOW WE WORK (Engineering Workflow)
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="workflow-heading" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-amber-700 font-mono text-xs uppercase tracking-wider font-bold block">
              Field Execution Protocol
            </span>
            <h2
              id="workflow-heading"
              className="text-2xl sm:text-4xl font-black text-slate-900 uppercase font-display tracking-tight"
            >
              How Hind Build Works
            </h2>
            <p className="text-sm text-slate-600">
              A transparent, 5-stage diagnostic and execution process ensuring zero guesswork and durable protection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Inspection",
                desc: "Site visit by technicians using non-destructive moisture meters and crack scanners.",
              },
              {
                step: "02",
                title: "Diagnosis",
                desc: "Identification of root cause, water ingress origin, or structural load distress.",
              },
              {
                step: "03",
                title: "Itemized BOQ",
                desc: "Transparent quotation with defined chemical systems, labor, and execution timeline.",
              },
              {
                step: "04",
                title: "Execution",
                desc: "Trained chemical applicators apply certified industrial-grade treatment layers.",
              },
              {
                step: "05",
                title: "Warranty",
                desc: "Final water ponding test, quality log sign-off, and written guarantee certificate issued.",
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-50 border border-slate-200 space-y-2 relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-amber-700 font-mono text-sm font-black block">
                    {p.step}
                  </span>
                  <h3 className="text-sm font-bold uppercase font-display text-slate-900">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          7. PROJECT / WORK SHOWCASE (Graceful Handling When DB has 0 Projects)
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="case-studies-heading" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <span className="text-amber-700 font-mono text-xs uppercase tracking-wider font-bold block mb-1">
              Field Execution
            </span>
            <h2
              id="case-studies-heading"
              className="text-2xl sm:text-4xl font-black text-slate-900 uppercase font-display tracking-tight"
            >
              Recent Repair &amp; Protection Projects
            </h2>
          </div>
          <Link
            href={`${prefix}/projects`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <span>View All Case Studies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{p.location || "Bhilwara, Rajasthan"}</span>
                    <span className="text-amber-700 font-bold uppercase">{p.serviceCategory || "Repair"}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 uppercase font-display">
                    {p.slug ? (
                      <Link
                        href={`${prefix}/projects/${p.slug}`}
                        className="hover:text-amber-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        {p.title}
                      </Link>
                    ) : (
                      p.title
                    )}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3">
                    {p.description || "Comprehensive site rehabilitation and moisture protection execution."}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {p.date || "Verified Case"}
                  </span>
                  {p.slug ? (
                    <Link
                      href={`${prefix}/projects/${p.slug}`}
                      className="font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider text-[11px] inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
                    >
                      <span>Case Study</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      href={`${prefix}/contact?project=${encodeURIComponent(p.title)}`}
                      className="font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
                    >
                      Inquire →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Intentional, professional empty state when 0 projects in DB */
          <div className="bg-white border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <FolderKanban className="w-12 h-12 text-amber-700 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 uppercase font-display">
              Site Case Studies &amp; Photographic Logs Updating
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Our site engineers and quality supervisors are compiling before/after photographic documentation for recently completed terrace waterproofing and structural rehabilitation sites in Bhilwara.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`${prefix}/contact`}
                className="hbs-btn-secondary min-h-[44px] px-6 text-xs uppercase tracking-wider font-bold"
              >
                <span>Request Site Inspection For Your Facility</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
              <Link
                href={`${prefix}/services`}
                className="hbs-btn-outline min-h-[44px] px-5 text-xs uppercase tracking-wider font-bold"
              >
                <span>Explore 19 Services Instead</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          8. GUARANTEE / TRUST SECTION (Rendered only when populated)
      ───────────────────────────────────────────────────────────────── */}
      {guaranteeData && (
        <section aria-label="Work Guarantees" className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-emerald-950 text-white border-l-8 border-emerald-500 p-8 sm:p-10 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-bold">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>{guaranteeData.badge || "Documented Workmanship Assurance"}</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black uppercase font-display text-white">
              {guaranteeData.title || "Certified Engineering Guarantee"}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              {guaranteeData.description ||
                "Our structural repairs and waterproofing treatments carry documented warranties backed by post-application testing and certified chemical systems."}
            </p>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          9. TESTIMONIALS (If populated in CMS)
      ───────────────────────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section aria-labelledby="feedback-heading" className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
            <span className="text-amber-700 font-mono text-xs uppercase tracking-wider font-bold block">
              Client Feedback
            </span>
            <h2
              id="feedback-heading"
              className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display"
            >
              What Building Owners Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase">{t.name}</span>
                  <span className="text-slate-500 font-mono">{t.designation || "Property Owner"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          10. FINAL STRONG CONVERSION CTA
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="cta-heading" className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-slate-900 text-white p-8 sm:p-12 border-l-8 border-l-amber-500 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold block">
              Engineering Support On Call
            </span>
            <h2
              id="cta-heading"
              className="text-2xl sm:text-4xl font-black uppercase font-display leading-tight text-white"
            >
              Ready for a Non-Destructive Site Inspection?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Book an assessment for active leakages, structural fractures, electrical faults, or turnkey property renovation. Transparent itemized quotes with zero hidden charges.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href={`${prefix}/contact`}
              className="hbs-btn-primary min-h-[48px] px-6 text-xs font-black uppercase tracking-wider shadow-md"
            >
              <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Book Site Inspection</span>
            </Link>

            <a
              href={`https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Build,%20I%20would%20like%20to%20schedule%20a%20site%20inspection.`}
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
  );
}
