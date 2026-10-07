import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MessageSquare,
  Phone,
  ShieldCheck,
  Cpu,
  HardHat,
  Clock,
  Sparkles,
  CheckCircle2,
  Award,
  Zap,
  Activity,
  Layers,
  MapPin,
  Compass
} from "lucide-react";
import type { HbsContent, HbsHeroConfig } from "@/lib/types";

// Icon resolution helper for dynamic trust highlights
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Cpu,
  HardHat,
  Clock,
  Sparkles,
  CheckCircle2,
  Award,
  Zap,
  Activity,
  Layers,
  MapPin,
  Compass,
};

export interface HbsHeroProps {
  content: Partial<HbsContent>;
  heroConfig: HbsHeroConfig;
  prefix?: string;
  phoneRaw?: string;
  homeWaUrl?: string;
  isInteractivePreview?: boolean;
}

export default function HbsHero({
  content,
  heroConfig,
  prefix = "/hbs",
  phoneRaw = "+917597000601",
  homeWaUrl = "https://wa.me/917597000601",
  isInteractivePreview = false,
}: HbsHeroProps) {
  // If disabled, render nothing
  if (heroConfig.enabled === false) {
    return null;
  }

  const displayMode = heroConfig.displayMode || "TEXT_AND_IMAGE";

  // Layout preset for TEXT_AND_IMAGE: "split" (default) | "centered" | "minimal"
  const layoutPreset = heroConfig.layoutPreset || "split";

  // Visual effects toggles
  const showCadGrid = heroConfig.showCadGrid !== false;
  const showAmbientGlow = heroConfig.showAmbientGlow !== false;
  const showFloatingBadges = heroConfig.showFloatingBadges !== false;

  // Resolve Images
  const heroImage =
    content.heroImage ||
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop";
  const heroMobileImage = heroConfig.mobileImage || heroImage;

  // Resolve CTA destinations
  const primaryCtaDestination = heroConfig.primaryCtaUrl
    ? heroConfig.primaryCtaUrl.startsWith("http")
      ? heroConfig.primaryCtaUrl
      : `${prefix}${heroConfig.primaryCtaUrl.startsWith("/") ? "" : "/"}${heroConfig.primaryCtaUrl}`
    : `${prefix}/contact`;

  const secondaryCtaDestination = heroConfig.secondaryCtaUrl
    ? heroConfig.secondaryCtaUrl.startsWith("http")
      ? heroConfig.secondaryCtaUrl
      : `${prefix}${heroConfig.secondaryCtaUrl.startsWith("/") ? "" : "/"}${heroConfig.secondaryCtaUrl}`
    : homeWaUrl;

  const emergencyPhone = heroConfig.emergencyPhone || content.phone || "+91 75970 00601";
  const emergencyPhoneRaw = emergencyPhone.replace(/[^0-9+]/g, "");

  // Highlights list (fallback to verified engineering highlights)
  const highlights =
    heroConfig.highlights && heroConfig.highlights.length > 0
      ? heroConfig.highlights
      : [
          { label: "10-Year Water-Tight Guarantee", icon: "ShieldCheck" },
          { label: "Non-Destructive Diagnostic Scanning", icon: "Cpu" },
          { label: "Civil Engineer Site Supervision", icon: "HardHat" },
          { label: "24-48h Rapid Dispatch", icon: "Clock" },
        ];

  // Floating HUD Badge copy
  const badge1Title = heroConfig.floatingBadge1Title || "Structural Diagnostic Hub";
  const badge1Sub = heroConfig.floatingBadge1Sub || "Non-Destructive Thermal & Moisture Profiling";
  const badge2Title = heroConfig.floatingBadge2Title || "150+ Turnkey Works Delivered";
  const badge2Sub = heroConfig.floatingBadge2Sub || "★★★★★ 4.9/5 Verified Client Trust · Rajasthan";
  const coordinatesTag = heroConfig.coordinatesTag || "BHILWARA · RAJASTHAN [25.3463° N, 74.6360° E]";

  // Title formatting with accent support
  const rawTitle = content.heroTitle || "Complete building repair, maintenance & protection.";
  const headlineAccent = heroConfig.headlineAccent;

  const renderHeadline = () => {
    if (!headlineAccent || !rawTitle.toLowerCase().includes(headlineAccent.toLowerCase())) {
      return rawTitle;
    }
    const idx = rawTitle.toLowerCase().indexOf(headlineAccent.toLowerCase());
    const before = rawTitle.slice(0, idx);
    const match = rawTitle.slice(idx, idx + headlineAccent.length);
    const after = rawTitle.slice(idx + headlineAccent.length);

    return (
      <>
        {before}
        <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent underline decoration-amber-500/30 decoration-2 underline-offset-4">
          {match}
        </span>
        {after}
      </>
    );
  };

  const customBgColor = heroConfig.backgroundColor || "#020617";

  return (
    <section
      aria-label="Hind Build Hero"
      style={{ backgroundColor: customBgColor }}
      className="relative pt-6 sm:pt-10 lg:pt-12 pb-14 sm:pb-20 lg:pb-28 border-b border-slate-800/80 overflow-hidden text-white selection:bg-amber-400/30 selection:text-amber-200"
    >
      {/* ─────────────────────────────────────────────────────────────────
          1. ARCHITECTURAL ATMOSPHERE & CAD GRID BACKGROUND
      ───────────────────────────────────────────────────────────────── */}
      {showCadGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]"
          aria-hidden="true"
        />
      )}

      {/* Subtle Specular Ambient Glows */}
      {showAmbientGlow && (
        <>
          <div
            className="absolute -top-40 -left-20 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none"
            aria-hidden="true"
          />
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          2. HERO MAIN CONTAINER
      ───────────────────────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =============================================================
            MODE 1: IMAGE_ONLY — FULL-WIDTH IMMERSIVE ARCHITECTURAL BANNER
        ============================================================= */}
        {displayMode === "IMAGE_ONLY" && (
          <div className="relative w-full">
            {/* Ambient specular back-glow */}
            <div
              className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-amber-500/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-60 pointer-events-none"
              aria-hidden="true"
            />
            {/* Visual Frame: Responsive 4:3 on mobile, 16:9 on tablet, 21:9 on desktop */}
            <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-slate-900 group">
              {isInteractivePreview ? (
                <img
                  src={heroImage}
                  alt={heroConfig.altText || "Hind Build visual banner"}
                  className="w-full h-full object-cover object-center"
                />
              ) : heroConfig.mobileImage ? (
                <>
                  <Image
                    src={heroMobileImage}
                    alt={heroConfig.altText || "Hind Build visual banner"}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, 1px"
                    className="object-cover object-center sm:hidden"
                  />
                  <Image
                    src={heroImage}
                    alt={heroConfig.altText || "Hind Build visual banner"}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center hidden sm:block"
                  />
                </>
              ) : (
                <Image
                  src={heroImage}
                  alt={heroConfig.altText || "Hind Build visual banner"}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover object-center"
                />
              )}

              {/* Depth Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Engineering Blueprint Tag (Bottom Left) */}
              <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-950/80 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/10 text-[10px] sm:text-xs font-mono text-slate-300 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-white">Hind Build Engineering</span>
                <span className="text-slate-500">|</span>
                <span className="text-amber-300">Turnkey Civil Execution · Rajasthan</span>
              </div>

              {/* Coordinates Tag (Bottom Right) */}
              <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-mono text-slate-400">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{coordinatesTag}</span>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================
            MODE 2: TEXT_ONLY — FOCUSED EDITORIAL & ACTION DECK
        ============================================================= */}
        {displayMode === "TEXT_ONLY" && (
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 z-10">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-full backdrop-blur-xl shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-xs tracking-wider uppercase text-amber-400 font-mono">
                Hind Build
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-300 truncate max-w-[240px] sm:max-w-none font-medium">
                {heroConfig.badge || "A Specialized Division of Hindustan Projects (HiPRO)"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] font-display">
              {renderHeadline()}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal max-w-3xl">
              {content.heroSubtitle ||
                "Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions across Rajasthan."}
            </p>

            {/* 4 Trust Micro-Chips */}
            {highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
                {highlights.slice(0, 4).map((item, idx) => {
                  const IconComponent = ICON_MAP[item.icon || "ShieldCheck"] || ShieldCheck;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl backdrop-blur-md transition-all"
                    >
                      <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 shrink-0">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-slate-300 font-medium truncate">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href={primaryCtaDestination}
                data-hbs-cta="quote"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg min-h-[46px]"
              >
                <span>{heroConfig.primaryCtaLabel || "Get Free Quote"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={secondaryCtaDestination}
                target={secondaryCtaDestination.startsWith("http") ? "_blank" : undefined}
                rel={secondaryCtaDestination.startsWith("http") ? "noopener noreferrer" : undefined}
                data-hbs-cta="whatsapp"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs uppercase tracking-wider rounded-xl border border-white/15 min-h-[46px]"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>{heroConfig.secondaryCtaLabel || "WhatsApp Hind Build"}</span>
              </a>

              {emergencyPhone && (
                <a
                  href={`tel:${emergencyPhoneRaw}`}
                  data-hbs-cta="call"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{emergencyPhone}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* =============================================================
            MODE 3: TEXT_AND_IMAGE — MODERN HYBRID (SPLIT / CENTERED)
        ============================================================= */}
        {displayMode === "TEXT_AND_IMAGE" && (
          <>
            {/* PRESET: SPLIT (DEFAULT HIGH-IMPACT STUDIO ARCHITECTURE) */}
            {layoutPreset === "split" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Left Column (7 cols on desktop, full width on mobile) */}
                <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10">
                  {/* Eyebrow Pill */}
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-full backdrop-blur-xl transition-all shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="font-semibold text-xs tracking-wider uppercase text-amber-400 font-mono">
                      Hind Build
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-300 truncate max-w-[200px] sm:max-w-none font-medium">
                      {heroConfig.badge || "A Specialized Division of Hindustan Projects (HiPRO)"}
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-white leading-[1.1] font-display">
                    {renderHeadline()}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl font-sans">
                    {content.heroSubtitle ||
                      "Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions across Rajasthan."}
                  </p>

                  {/* 4 Trust Micro-Chips */}
                  {highlights.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {highlights.slice(0, 4).map((item, idx) => {
                        const IconComponent = ICON_MAP[item.icon || "ShieldCheck"] || ShieldCheck;
                        return (
                          <div
                            key={idx}
                            className="group/chip flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-amber-400/40 rounded-xl backdrop-blur-md transition-all duration-300"
                          >
                            <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 group-hover/chip:bg-amber-500/20 group-hover/chip:text-amber-300 transition-colors shrink-0">
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs text-slate-300 font-medium tracking-tight group-hover/chip:text-white transition-colors truncate">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CTA Deck */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                    {isInteractivePreview ? (
                      <div
                        data-hbs-cta="quote"
                        className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_24px_-4px_rgba(245,158,11,0.35)] min-h-[46px] cursor-pointer"
                      >
                        <span>{heroConfig.primaryCtaLabel || "Get Free Quote"}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    ) : (
                      <Link
                        href={primaryCtaDestination}
                        data-hbs-cta="quote"
                        className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_24px_-4px_rgba(245,158,11,0.35)] active:scale-[0.98] min-h-[46px]"
                      >
                        <span>{heroConfig.primaryCtaLabel || "Get Free Quote"}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}

                    {isInteractivePreview ? (
                      <div
                        data-hbs-cta="whatsapp"
                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs uppercase tracking-wider rounded-xl border border-white/15 min-h-[46px] cursor-pointer"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>{heroConfig.secondaryCtaLabel || "WhatsApp Hind Build"}</span>
                      </div>
                    ) : (
                      <a
                        href={secondaryCtaDestination}
                        target={secondaryCtaDestination.startsWith("http") ? "_blank" : undefined}
                        rel={secondaryCtaDestination.startsWith("http") ? "noopener noreferrer" : undefined}
                        data-hbs-cta="whatsapp"
                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs uppercase tracking-wider rounded-xl border border-white/15 backdrop-blur-xl transition-all active:scale-[0.98] min-h-[46px]"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>{heroConfig.secondaryCtaLabel || "WhatsApp Hind Build"}</span>
                      </a>
                    )}

                    {emergencyPhone && (
                      <a
                        href={`tel:${emergencyPhoneRaw}`}
                        data-hbs-cta="call"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{emergencyPhone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Column (5 cols on desktop, responsive image below on mobile) */}
                <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                  <div
                    className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-amber-500/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-60 pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-slate-900 group">
                    {isInteractivePreview ? (
                      <img
                        src={heroImage}
                        alt={heroConfig.altText || "Hind Build site inspection"}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : heroConfig.mobileImage ? (
                      <>
                        <Image
                          src={heroMobileImage}
                          alt={heroConfig.altText || "Hind Build engineering site inspection and execution"}
                          fill
                          priority
                          sizes="(max-width: 640px) 100vw, 1px"
                          className="object-cover object-center sm:hidden transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <Image
                          src={heroImage}
                          alt={heroConfig.altText || "Hind Build engineering site inspection and execution"}
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                          className="object-cover object-center hidden sm:block transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </>
                    ) : (
                      <Image
                        src={heroImage}
                        alt={heroConfig.altText || "Hind Build engineering site inspection and execution"}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Floating HUD Badges (Responsive scaling for mobile) */}
                    {showFloatingBadges && (
                      <>
                        {/* Top-Right Badge: Diagnostic Hub */}
                        <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 max-w-[180px] sm:max-w-[240px] px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 bg-slate-950/85 backdrop-blur-xl rounded-lg sm:rounded-xl border border-white/15 shadow-xl">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] sm:text-[11px] font-bold font-mono uppercase tracking-wider text-white truncate">
                              {badge1Title}
                            </span>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-slate-300 font-sans leading-tight line-clamp-2">
                            {badge1Sub}
                          </p>
                        </div>

                        {/* Bottom-Left Badge: Turnkey Works */}
                        <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 max-w-[200px] sm:max-w-[270px] px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 bg-slate-950/85 backdrop-blur-xl rounded-lg sm:rounded-xl border border-white/15 shadow-xl">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[10px] sm:text-xs font-bold text-white tracking-tight truncate">
                              {badge2Title}
                            </span>
                          </div>
                          <p className="text-[9px] sm:text-[10px] font-mono text-amber-300/90 leading-tight truncate">
                            {badge2Sub}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Technical Coordinates Tag */}
                    <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[9px] font-mono text-slate-400">
                      <MapPin className="w-2.5 h-2.5 text-amber-400" />
                      <span>{coordinatesTag}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRESET: CENTERED */}
            {layoutPreset === "centered" && (
              <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 z-10">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/[0.04] border border-white/10 rounded-full backdrop-blur-xl shadow-md mx-auto">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-semibold text-xs tracking-wider uppercase text-amber-400 font-mono">
                    Hind Build
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-300 font-medium">
                    {heroConfig.badge || "A Specialized Division of HiPRO"}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] font-display">
                  {renderHeadline()}
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
                  {content.heroSubtitle ||
                    "Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions across Rajasthan."}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                  <Link
                    href={primaryCtaDestination}
                    data-hbs-cta="quote"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg min-h-[46px]"
                  >
                    <span>{heroConfig.primaryCtaLabel || "Get Free Quote"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={secondaryCtaDestination}
                    data-hbs-cta="whatsapp"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs uppercase tracking-wider rounded-xl border border-white/15 min-h-[46px]"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>{heroConfig.secondaryCtaLabel || "WhatsApp Hind Build"}</span>
                  </a>
                </div>

                <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900 mt-6 sm:mt-8">
                  <Image
                    src={heroImage}
                    alt={heroConfig.altText || "Hind Build site inspection"}
                    fill
                    priority
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
