import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  ShieldCheck,
  Check,
  Phone,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  Award,
  Star,
  ChevronRight,
  FileText,
  FolderKanban,
  MapPin,
  CheckCircle2,
  Cpu,
  HardHat,
  Quote
} from "lucide-react";
import {
  fetchHbsContent,
  fetchHbsServices,
  fetchHbsProjects,
  fetchHbsTestimonials,
  DEFAULT_HBS_CONTENT
} from "@/lib/hbsData";
import { cleanTelNumber, getHomeWhatsAppUrl } from "@/lib/hbsWhatsApp";
import HbsHero from "@/components/hbs/HbsHero";
import AnimateIn from "@/components/AnimateIn";
import type { HbsHeroConfig, HbsDiagnosticSection } from "@/lib/types";

export const revalidate = 60;

export default async function HbsHomePage() {
  const [content, services, projects, testimonials] = await Promise.all([
    fetchHbsContent(),
    fetchHbsServices(),
    fetchHbsProjects(),
    fetchHbsTestimonials(),
  ]);

  const phoneRaw = cleanTelNumber(content.phone);
  const homeWaUrl = getHomeWhatsAppUrl(content.whatsapp);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  // Parse JSON configs safely with graceful fallbacks
  let whyChooseItems: Array<{ title: string; description: string; icon?: string }> = [];
  try {
    if (content.whyChooseUs) {
      whyChooseItems =
        typeof content.whyChooseUs === "string"
          ? JSON.parse(content.whyChooseUs)
          : (content.whyChooseUs as any);
    } else if (DEFAULT_HBS_CONTENT.whyChooseUs) {
      whyChooseItems =
        typeof DEFAULT_HBS_CONTENT.whyChooseUs === "string"
          ? JSON.parse(DEFAULT_HBS_CONTENT.whyChooseUs)
          : (DEFAULT_HBS_CONTENT.whyChooseUs as any);
    }
  } catch {
    whyChooseItems = [];
  }

  // Hero configuration
  let heroConfig: HbsHeroConfig = {
    enabled: true,
    displayMode: "TEXT_AND_IMAGE",
    layoutPreset: "split",
    badge: "A Specialized Division of Hindustan Projects (HiPRO)",
    headlineAccent: "Engineering-Grade Protection",
    primaryCtaLabel: "Get Free Quote",
    primaryCtaUrl: "/contact",
    secondaryCtaLabel: "WhatsApp Hind Build",
    secondaryCtaUrl: "",
    emergencyPhone: "+91 75970 00601",
    mobileImage: "",
    altText: "Hind Build engineering site inspection and execution",
    showCadGrid: true,
    showAmbientGlow: true,
    showFloatingBadges: true,
    floatingBadge1Title: "Structural Diagnostic Hub",
    floatingBadge1Sub: "Non-Destructive Thermal & Moisture Profiling",
    floatingBadge2Title: "150+ Turnkey Works Delivered",
    floatingBadge2Sub: "★★★★★ 4.9/5 Verified Client Trust · Rajasthan",
    highlights: [
      { label: "10-Year Water-Tight Guarantee", icon: "ShieldCheck" },
      { label: "Non-Destructive Diagnostic Scanning", icon: "Cpu" },
      { label: "Civil Engineer Site Supervision", icon: "HardHat" },
      { label: "24-48h Rapid Dispatch", icon: "Clock" },
    ],
  };
  try {
    if (content.heroCtas) {
      const parsed =
        typeof content.heroCtas === "string"
          ? JSON.parse(content.heroCtas)
          : content.heroCtas;
      heroConfig = { ...heroConfig, ...parsed };
    }
  } catch {}

  // Curate featured service (e.g. Service 01 or 02) and remaining services
  const featuredService = services[0] || null;
  const secondaryFeatured = services[1] || null;

  // Default process steps if none in CMS
  const processList = [
    {
      num: "01",
      title: "Diagnose",
      desc: "Calibrated electronic moisture testing and crack depth scanning to isolate root causes without invasive damage.",
    },
    {
      num: "02",
      title: "Plan",
      desc: "Transparent engineering formulation with verified chemical systems and itemized BOQ specifications.",
    },
    {
      num: "03",
      title: "Execute",
      desc: "Turnkey application by certified applicators under senior civil engineering supervision.",
    },
    {
      num: "04",
      title: "Quality Check",
      desc: "Ponding tests, thermal re-evaluation, and formal sign-off against documented benchmarks.",
    },
    {
      num: "05",
      title: "Handover",
      desc: "Detailed site completion record accompanied by our written work guarantee certificate.",
    },
  ];

  // Diagnostic Principle & Solution Section configuration
  const DEFAULT_DIAGNOSTIC: HbsDiagnosticSection = {
    enabled: true,
    eyebrow: "Diagnostic Principle",
    heading: "Most building repairs fail because surface symptoms are patched while the water pathway stays active.",
    description: "Plastering over dampness or applying generic cement offers only temporary cosmetic relief. Without identifying hydrostatic pressure points or hairline slab fractures, moisture continues to corrode embedded rebar from within.",
    rightMode: "CARD",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Hind Build diagnostic site inspection and moisture tracing",
    imageCaption: "Site Inspection & Non-Destructive Scanning",
    approachBadge: "The Hind Build Engineering Approach",
    approachDescription: "We deploy non-destructive electronic moisture detection, industrial-grade chemical barrier membranes, and calibrated crack injection polymers. Root causes are systematically eliminated before finishing layers are applied.",
    features: [
      "Non-invasive moisture tracing",
      "Certified industrial sealants",
      "Turnkey single-point warranty",
      "Senior engineering sign-off",
    ],
    footerNote: "Backed by Hindustan Projects (HiPRO)",
    ctaLabel: "Book Site Diagnosis",
    ctaUrl: "/contact",
  };

  let diagnostic: HbsDiagnosticSection = DEFAULT_DIAGNOSTIC;
  try {
    if (content.guaranteeSection) {
      const parsed =
        typeof content.guaranteeSection === "string"
          ? JSON.parse(content.guaranteeSection)
          : (content.guaranteeSection as any);
      diagnostic = { ...DEFAULT_DIAGNOSTIC, ...parsed };
    } else if (DEFAULT_HBS_CONTENT.guaranteeSection) {
      const parsed =
        typeof DEFAULT_HBS_CONTENT.guaranteeSection === "string"
          ? JSON.parse(DEFAULT_HBS_CONTENT.guaranteeSection)
          : (DEFAULT_HBS_CONTENT.guaranteeSection as any);
      diagnostic = { ...DEFAULT_DIAGNOSTIC, ...parsed };
    }
  } catch {
    diagnostic = DEFAULT_DIAGNOSTIC;
  }

  const diagnosticFeatures = diagnostic.features && diagnostic.features.length > 0
    ? diagnostic.features
    : DEFAULT_DIAGNOSTIC.features || [];

  return (
    <div className="bg-white text-slate-900 selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO — ULTRA-MODERN ARCHITECTURAL ENGINEERING SHOWCASE
      ───────────────────────────────────────────────────────────────── */}
      <HbsHero
        content={content}
        heroConfig={heroConfig}
        prefix={prefix}
        phoneRaw={phoneRaw}
        homeWaUrl={homeWaUrl}
      />

      {/* ─────────────────────────────────────────────────────────────────
          2. MINIMAL EDITORIAL TRUST STRIP (ANIMATED 4 PILLARS)
      ───────────────────────────────────────────────────────────────── */}
      <section aria-label="Core Engineering Pillars" className="py-12 sm:py-16 border-b border-slate-200/80 bg-slate-50/60 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <AnimateIn delay={40}>
              <div className="group p-5 rounded-2xl border border-transparent hover:border-amber-300/80 hover:bg-white hover:shadow-hbs-card hover:-translate-y-1 transition-all duration-300 relative h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-0.5 w-6 bg-amber-600/30 group-hover:w-12 group-hover:bg-amber-600 transition-all duration-300" />
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                    01 / Method
                  </p>
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-tight text-slate-900 font-display">
                    Engineering Diagnostics
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Non-destructive electronic moisture detection and crack depth evaluation trace root causes before touching masonry.
                  </p>
                </div>
              </div>
            </AnimateIn>

            <AnimateIn delay={120}>
              <div className="group p-5 rounded-2xl border border-transparent hover:border-amber-300/80 hover:bg-white hover:shadow-hbs-card hover:-translate-y-1 transition-all duration-300 relative h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-0.5 w-6 bg-amber-600/30 group-hover:w-12 group-hover:bg-amber-600 transition-all duration-300" />
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                    02 / Pricing
                  </p>
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-tight text-slate-900 font-display">
                    Transparent Estimates
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Itemized BOQ with verified chemical specifications (Fosroc, Sika, Dr. Fixit) and fixed scope. Zero hidden rework fees.
                  </p>
                </div>
              </div>
            </AnimateIn>

            <AnimateIn delay={200}>
              <div className="group p-5 rounded-2xl border border-transparent hover:border-amber-300/80 hover:bg-white hover:shadow-hbs-card hover:-translate-y-1 transition-all duration-300 relative h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-0.5 w-6 bg-amber-600/30 group-hover:w-12 group-hover:bg-amber-600 transition-all duration-300" />
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                    03 / Accountability
                  </p>
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-tight text-slate-900 font-display">
                    Single-Window Execution
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All 19 building maintenance trades managed by one accountable engineering team. No juggling 5 independent contractors.
                  </p>
                </div>
              </div>
            </AnimateIn>

            <AnimateIn delay={280}>
              <div className="group p-5 rounded-2xl border border-transparent hover:border-amber-300/80 hover:bg-white hover:shadow-hbs-card hover:-translate-y-1 transition-all duration-300 relative h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-0.5 w-6 bg-amber-600/30 group-hover:w-12 group-hover:bg-amber-600 transition-all duration-300" />
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                    04 / Assurance
                  </p>
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-tight text-slate-900 font-display">
                    Written Work Guarantee
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Documented warranties on structural rehabilitation and waterproofing treatments backed by post-application testing logs.
                  </p>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          3. PROBLEM → SOLUTION (ANIMATED EDITORIAL NARRATIVE & BANNER)
      ───────────────────────────────────────────────────────────────── */}
      {diagnostic.enabled !== false && (
        <section aria-labelledby="problem-heading" className="py-16 sm:py-24 border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Left: Editorial Statement */}
              <div className="lg:col-span-5">
                <AnimateIn direction="left" delay={60}>
                  <div className="space-y-4">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700 inline-block">
                      {diagnostic.eyebrow || "Diagnostic Principle"}
                    </span>
                    <h2
                      id="problem-heading"
                      className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 leading-[1.2] font-display"
                    >
                      {diagnostic.heading || "Most building repairs fail because surface symptoms are patched while the water pathway stays active."}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1">
                      {diagnostic.description || "Plastering over dampness or applying generic cement offers only temporary cosmetic relief. Without identifying hydrostatic pressure points or hairline slab fractures, moisture continues to corrode embedded rebar from within."}
                    </p>
                  </div>
                </AnimateIn>
              </div>

              {/* Right: The Solution — Dark Card, Image Banner, or Image with Overlay */}
              <div className="lg:col-span-7">
                <AnimateIn direction="right" delay={120}>
                  <div className="space-y-6">
                    {/* Mode 1: Clean Photo / Image Banner */}
                    {diagnostic.rightMode === "IMAGE" ? (
                      <div className="group relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-900 aspect-[16/10] sm:aspect-[16/9] min-h-[300px]">
                        {diagnostic.image ? (
                          <img
                            src={diagnostic.image}
                            alt={diagnostic.imageAlt || "Hind Build site inspection banner"}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center font-mono text-xs">
                            <ShieldCheck className="w-8 h-8 text-amber-500/50 mb-2" />
                            <span>No diagnostic image uploaded yet. Add an image banner in Admin.</span>
                          </div>
                        )}

                        {/* Soft architectural dark gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/30" />

                        {/* Top Technical Badge */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{diagnostic.approachBadge || "The Hind Build Engineering Approach"}</span>
                        </div>

                        {/* Bottom Info Pill */}
                        {(diagnostic.imageCaption || diagnostic.approachDescription) && (
                          <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-white space-y-1">
                            {diagnostic.imageCaption && (
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                                {diagnostic.imageCaption}
                              </span>
                            )}
                            {diagnostic.approachDescription && (
                              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-sans">
                                {diagnostic.approachDescription}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : diagnostic.rightMode === "IMAGE_OVERLAY" ? (
                      /* Mode 2: Image Banner with Approach Overlay */
                      <div className="group relative rounded-2xl overflow-hidden border border-slate-800 shadow-md bg-slate-950">
                        {diagnostic.image && (
                          <img
                            src={diagnostic.image}
                            alt={diagnostic.imageAlt || "Hind Build site inspection"}
                            className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95" />
                        <div className="relative p-6 sm:p-8 space-y-4">
                          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold">
                            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{diagnostic.approachBadge || "The Hind Build Engineering Approach"}</span>
                          </div>
                          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                            {diagnostic.approachDescription || "We deploy non-destructive electronic moisture detection, industrial-grade chemical barrier membranes, and calibrated crack injection polymers. Root causes are systematically eliminated before finishing layers are applied."}
                          </p>
                          {diagnosticFeatures.length > 0 && (
                            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-mono">
                              {diagnosticFeatures.map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Mode 3 (Default): Dark Engineering Approach Card */
                      <div className="group p-6 sm:p-8 bg-slate-900 text-white rounded-2xl space-y-4 shadow-sm border border-slate-800 hover:border-amber-500/40 hover:shadow-hbs-glow transition-all duration-300 relative overflow-hidden">
                        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold">
                          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{diagnostic.approachBadge || "The Hind Build Engineering Approach"}</span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                          {diagnostic.approachDescription || "We deploy non-destructive electronic moisture detection, industrial-grade chemical barrier membranes, and calibrated crack injection polymers. Root causes are systematically eliminated before finishing layers are applied."}
                        </p>
                        {diagnosticFeatures.length > 0 && (
                          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-mono">
                            {diagnosticFeatures.map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Supporting context link */}
                    <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-mono">
                      <span>{diagnostic.footerNote || "Backed by Hindustan Projects (HiPRO)"}</span>
                      <Link
                        href={diagnostic.ctaUrl?.startsWith("http") ? diagnostic.ctaUrl : `${prefix}${diagnostic.ctaUrl || "/contact"}`}
                        className="group font-bold text-slate-900 hover:text-amber-700 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>{diagnostic.ctaLabel || "Book Site Diagnosis"}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </AnimateIn>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          4. SERVICES — ANIMATED 19-SERVICE SYSTEM & FEATURED DUO
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="services-system-heading" className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-50/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
          {/* Header */}
          <AnimateIn delay={40}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                  19 Specialist Trades
                </span>
                <h2
                  id="services-system-heading"
                  className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 font-display"
                >
                  Comprehensive Building Maintenance
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  From foundation waterproofing to structural rehabilitation, facade work, and facility upkeep. All 19 trades execute under one unified warranty.
                </p>
              </div>

              <Link
                href={`${prefix}/services`}
                className="group inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-amber-700 uppercase tracking-wider shrink-0 transition-colors"
              >
                <span>View All 19 Services</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </AnimateIn>

          {/* Featured Highlight Duo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredService && (
              <AnimateIn delay={100}>
                <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:border-amber-400/80 hover:shadow-hbs-crisp hover:-translate-y-1.5 transition-all duration-300 h-full">
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={
                        featuredService.image ||
                        "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={featuredService.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 550px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/85 backdrop-blur-md rounded-md text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                      SERVICE #{featuredService.serviceNumber || "01"}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        <Link href={`${prefix}/services/${featuredService.slug}`}>
                          {featuredService.title}
                        </Link>
                      </h3>
                      {featuredService.hindiTitle && (
                        <p className="text-xs text-slate-400 font-medium">{featuredService.hindiTitle}</p>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {featuredService.shortDescription ||
                        "Specialized diagnosis, certified chemical barriers, and guaranteed restoration."}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                      <span className="font-mono text-[11px] text-slate-400">Turnkey Civil Protocol</span>
                      <Link
                        href={`${prefix}/services/${featuredService.slug}`}
                        className="font-semibold text-slate-900 hover:text-amber-700 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            )}

            {secondaryFeatured && (
              <AnimateIn delay={180}>
                <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:border-amber-400/80 hover:shadow-hbs-crisp hover:-translate-y-1.5 transition-all duration-300 h-full">
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={
                        secondaryFeatured.image ||
                        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={secondaryFeatured.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 550px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/85 backdrop-blur-md rounded-md text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                      SERVICE #{secondaryFeatured.serviceNumber || "02"}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        <Link href={`${prefix}/services/${secondaryFeatured.slug}`}>
                          {secondaryFeatured.title}
                        </Link>
                      </h3>
                      {secondaryFeatured.hindiTitle && (
                        <p className="text-xs text-slate-400 font-medium">{secondaryFeatured.hindiTitle}</p>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {secondaryFeatured.shortDescription ||
                        "High-polymer elastomeric membranes and injection grouts for permanent waterproofing."}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                      <span className="font-mono text-[11px] text-slate-400">Turnkey Civil Protocol</span>
                      <Link
                        href={`${prefix}/services/${secondaryFeatured.slug}`}
                        className="font-semibold text-slate-900 hover:text-amber-700 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            )}
          </div>

          {/* Compact 19-Trade Directory Strip */}
          <AnimateIn delay={140}>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 space-y-4 hover:border-slate-300 transition-colors shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-semibold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Full 19-Service Trade Index</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Click any trade to view specifications
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                {services.map((svc, idx) => {
                  const sNumber = svc.serviceNumber || String(idx + 1).padStart(2, "0");
                  return (
                    <Link
                      key={svc.slug || idx}
                      href={`${prefix}/services/${svc.slug}`}
                      className="group p-2.5 rounded-lg hover:bg-amber-50/70 border border-transparent hover:border-amber-200/80 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="font-mono text-[11px] font-semibold text-amber-700 bg-amber-50 group-hover:bg-amber-100 px-1.5 py-0.5 rounded transition-colors">
                          #{sNumber}
                        </span>
                        <span className="text-xs font-medium text-slate-800 group-hover:text-amber-800 transition-colors truncate">
                          {svc.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-amber-700 group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          5. PROCESS — ANIMATED 5-STAGE EDITORIAL TIMELINE
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="process-heading" className="py-16 sm:py-24 border-b border-slate-200/80 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14">
          <AnimateIn delay={40}>
            <div className="max-w-xl space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                Execution Protocol
              </span>
              <h2
                id="process-heading"
                className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 font-display"
              >
                How Hind Build Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                A transparent, 5-stage diagnostic and execution cycle ensuring zero guesswork, accountable milestones, and durable protection.
              </p>
            </div>
          </AnimateIn>

          {/* Process Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-6 pt-4">
            {processList.map((item, idx) => (
              <AnimateIn key={idx} delay={idx * 80}>
                <div className="group space-y-2.5 p-4 rounded-xl border border-slate-200/80 hover:border-amber-400 hover:bg-white hover:shadow-hbs-card hover:-translate-y-1 transition-all duration-300 relative h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-mono font-black text-amber-600 group-hover:text-amber-500 transition-colors block">
                        {item.num}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 font-display group-hover:text-amber-800 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="h-0.5 w-full bg-slate-100 group-hover:bg-amber-400 transition-colors mt-2" />
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          6. WHY HIND BUILD — ANIMATED HIGH-TECH SPREAD
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="why-heading" className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-950 text-white relative overflow-hidden">
        {/* Subtle CAD Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Narrative & Verified Pillars */}
            <div className="lg:col-span-6">
              <AnimateIn direction="left" delay={80}>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400 inline-block">
                      Engineering Standards
                    </span>
                    <h2
                      id="why-heading"
                      className="text-2xl sm:text-4xl font-semibold tracking-tight text-white leading-tight font-display"
                    >
                      Built around engineering discipline, not temporary fixes.
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Modern properties represent substantial investments. Hind Build bridges the massive divide between unverified local handymen and large-scale civil contractors.
                    </p>
                  </div>

                  {/* Verified Pillars */}
                  <div className="space-y-3 pt-2">
                    <div className="group space-y-1 border-l-2 border-amber-500/80 pl-4 py-1 hover:border-amber-400 hover:pl-5 transition-all duration-200">
                      <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Civil Engineering Oversight</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Supervised by Hindustan Projects (HiPRO) senior civil engineers and certified site supervisors.
                      </p>
                    </div>

                    <div className="group space-y-1 border-l-2 border-amber-500/80 pl-4 py-1 hover:border-amber-400 hover:pl-5 transition-all duration-200">
                      <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Non-Destructive Testing</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Advanced moisture meters and pipe leak scanners prevent unnecessary and destructive breaking.
                      </p>
                    </div>

                    <div className="group space-y-1 border-l-2 border-amber-500/80 pl-4 py-1 hover:border-amber-400 hover:pl-5 transition-all duration-200">
                      <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Transparent Itemized Estimates</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Defined chemical systems, application coats, labor hours, and execution timelines before work starts.
                      </p>
                    </div>

                    <div className="group space-y-1 border-l-2 border-amber-500/80 pl-4 py-1 hover:border-amber-400 hover:pl-5 transition-all duration-200">
                      <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Written Work Guarantee</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Documented warranties on structural repairs and waterproofing treatments backed by post-application testing logs.
                      </p>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            </div>

            {/* Right: Technical Image Framing */}
            <div className="lg:col-span-6">
              <AnimateIn direction="right" delay={160}>
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 group">
                  <Image
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop"
                    alt="Hind Build certified chemical application"
                    fill
                    sizes="(max-width: 1024px) 100vw, 550px"
                    className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/15 text-xs font-mono text-slate-300 flex items-center justify-between shadow-lg">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Certified Industrial Systems</span>
                    </span>
                    <span className="text-amber-400 font-bold">Dr. Fixit · Fosroc · Sika</span>
                  </div>
                </div>
              </AnimateIn>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          7. PROJECTS / CASE STUDIES — ANIMATED FIELD RECORDS
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="projects-heading" className="py-16 sm:py-24 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <AnimateIn delay={40}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                  Field Records
                </span>
                <h2
                  id="projects-heading"
                  className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 font-display"
                >
                  Verified Project Showcases
                </h2>
              </div>
              <Link
                href={`${prefix}/projects`}
                className="group inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-amber-700 uppercase tracking-wider shrink-0 transition-colors"
              >
                <span>View Case Studies</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimateIn>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((p, idx) => (
                <AnimateIn key={p.id} delay={idx * 100}>
                  <div className="group bg-white rounded-xl border border-slate-200/80 p-5 space-y-3 hover:border-amber-400/80 hover:-translate-y-1.5 hover:shadow-hbs-crisp transition-all duration-300 h-full flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>{p.location || "Rajasthan"}</span>
                        <span className="text-amber-700 font-bold uppercase bg-amber-50 px-2 py-0.5 rounded">
                          {p.serviceCategory || "Repair"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 font-display group-hover:text-amber-800 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {p.description || "Turnkey site rehabilitation and moisture protection execution."}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">{p.date || "Verified"}</span>
                      <Link
                        href={`${prefix}/projects/${p.slug}`}
                        className="font-semibold text-slate-900 hover:text-amber-700 inline-flex items-center gap-1"
                      >
                        <span>Case Study</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          ) : (
            /* High-end portfolio compilation invitation */
            <AnimateIn delay={100}>
              <div className="p-8 sm:p-12 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-colors">
                <div className="space-y-2 max-w-xl">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase rounded-md inline-block">
                    Engineering Site Logs
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                    Verified project documentation is currently being compiled.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Our site supervisors are curating before/after forensic photographic logs from recently completed terrace waterproofing and structural rehabilitation sites in Bhilwara.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0 w-full sm:w-auto">
                  <Link
                    href={`${prefix}/contact`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all min-h-[44px] active:scale-[0.98] shadow-sm hover:shadow-md"
                  >
                    <span>Request Site Inspection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </AnimateIn>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          8. TESTIMONIAL — ANIMATED EDITORIAL QUOTATION
      ───────────────────────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section aria-label="Client Feedback" className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-50/40 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <AnimateIn delay={80}>
              <div className="text-center space-y-6 relative p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                  <Quote className="w-6 h-6" />
                </div>

                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700 block">
                  Verified Client Trust
                </span>

                <blockquote className="text-lg sm:text-2xl font-medium tracking-tight text-slate-900 leading-relaxed font-display">
                  &ldquo;{testimonials[0].content}&rdquo;
                </blockquote>

                <div className="space-y-1 pt-2">
                  <p className="text-sm font-bold text-slate-900 uppercase">
                    {testimonials[0].name}
                  </p>
                  <p className="text-xs font-mono text-slate-500">
                    {testimonials[0].designation || "Property Owner"} · Bhilwara
                  </p>
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          9. FINAL CTA — ANIMATED CLOSING CONVERSION STRIP
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="final-cta-heading" className="py-20 sm:py-28 bg-slate-950 text-white relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <AnimateIn delay={60}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Diagnostic Site Assessment Active</span>
            </div>
          </AnimateIn>

          <AnimateIn delay={120}>
            <h2
              id="final-cta-heading"
              className="text-3xl sm:text-5xl font-semibold tracking-tight text-white font-display leading-tight"
            >
              Have a building problem?
              <br />
              <span className="text-amber-400">Let’s diagnose it properly.</span>
            </h2>
          </AnimateIn>

          <AnimateIn delay={180}>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Schedule a non-destructive site inspection with our field engineers across Bhilwara and Rajasthan. Get an itemized, transparent quote with zero obligation.
            </p>
          </AnimateIn>

          <AnimateIn delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`${prefix}/contact`}
                data-hbs-cta="quote"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] min-h-[44px] shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
              >
                <span>Get Free Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <a
                href={homeWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-hbs-cta="whatsapp"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/5 hover:bg-white/10 text-white font-medium text-xs uppercase tracking-wider rounded-xl border border-white/15 transition-all active:scale-[0.98] min-h-[44px]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Hind Build</span>
              </a>
            </div>
          </AnimateIn>

          <AnimateIn delay={300}>
            <p className="text-xs text-slate-500 font-mono pt-4">
              Direct technician dispatch:{" "}
              <a
                href={`tel:${phoneRaw}`}
                data-hbs-cta="call"
                className="text-slate-300 hover:text-amber-400 underline underline-offset-2 transition-colors font-semibold"
              >
                {content.phone || "+91 75970 00601"}
              </a>
            </p>
          </AnimateIn>
        </div>
      </section>
    </div>
  );
}
