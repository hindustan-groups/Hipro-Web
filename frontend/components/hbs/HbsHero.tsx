"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  Users,
  Award,
  FileText,
} from "lucide-react";
import type { HbsContent, HbsHeroConfig } from "@/lib/types";

export interface HbsHeroProps {
  content: Partial<HbsContent>;
  heroConfig?: Partial<HbsHeroConfig>;
  prefix?: string;
  phoneRaw?: string;
  homeWaUrl?: string;
  isInteractivePreview?: boolean;
}

export default function HbsHero({
  content,
  heroConfig,
  prefix = "/hbs",
}: HbsHeroProps) {
  const heroImageSrc =
    (heroConfig?.heroImage && heroConfig.heroImage !== "/hibuild-hero-full.png"
      ? heroConfig.heroImage
      : content?.heroImage) ||
    heroConfig?.heroImage ||
    content?.heroImage ||
    "/hibuild-hero-full.png";

  const mobileImageSrc = heroConfig?.mobileImage || heroImageSrc;
  const isDefaultImage = heroImageSrc === "/hibuild-hero-full.png";

  const badgeText = heroConfig?.badge || "COMPLETE CARE FOR YOUR BUILDING";
  const headline = heroConfig?.headline;
  const subheadline =
    heroConfig?.subheadline ||
    content?.heroSubtitle ||
    "Hind Building Solutions (HiBUILD) provides professional building repair, waterproofing, painting, plumbing, electrical, renovation and all maintenance services for homes, apartments, offices and commercial buildings.";
  const primaryCtaLabel = heroConfig?.primaryCtaLabel || "Get a Free Site Visit";
  const primaryCtaUrl = heroConfig?.primaryCtaUrl
    ? (heroConfig.primaryCtaUrl.startsWith("http")
        ? heroConfig.primaryCtaUrl
        : `${prefix}${heroConfig.primaryCtaUrl.replace(/^\/hbs/, "")}`)
    : `${prefix}/contact`;
  const secondaryCtaLabel = heroConfig?.secondaryCtaLabel || "Our Services";
  const secondaryCtaUrl = heroConfig?.secondaryCtaUrl
    ? (heroConfig.secondaryCtaUrl.startsWith("http")
        ? heroConfig.secondaryCtaUrl
        : `${prefix}${heroConfig.secondaryCtaUrl.replace(/^\/hbs/, "")}`)
    : `${prefix}/services`;

  return (
    <section
      aria-label="HiBUILD Hero"
      className="relative bg-white overflow-hidden text-slate-900 pt-2 sm:pt-4 lg:pt-5 pb-0"
    >
      {/* ── Desktop Full-Bleed Background Artwork (Right Side) ── */}
      {/* Seamless full-bleed: touches the right edge and bottom ribbon directly */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[48%] xl:w-[50%] h-full pointer-events-none select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src={heroImageSrc}
            alt={heroConfig?.altText || "HiBUILD Expert Building Care & Maintenance"}
            fill
            priority
            unoptimized={heroImageSrc.startsWith("http")}
            sizes="(min-width: 1280px) 50vw, 48vw"
            className={`object-cover ${isDefaultImage ? "object-bottom" : "object-center"}`}
          />
          {/* Subtle horizontal gradient blend on left edge so photo melts smoothly into pure white */}
          <div
            className="absolute inset-y-0 left-0 w-20 xl:w-28 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-0 lg:min-h-[440px] xl:min-h-[465px]">
          {/* ── Left Column: Editorial & Conversion (7 cols on lg) ── */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4 py-2 lg:py-3">
            {/* Eyebrow Line */}
            <div className="flex items-center gap-2.5">
              <span className="w-5 sm:w-6 h-0.75 bg-red-600 rounded-full shrink-0" />
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-red-600">
                {badgeText}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[44px] xl:text-[48px] font-black tracking-tight text-slate-900 leading-[1.12]">
              {headline ? (
                headline.includes("\n") ? (
                  headline.split("\n").map((line, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <br />}
                      {line.includes("Build Better") ? (
                        <>
                          {line.replace("Build Better", "")}
                          <span className="text-[#0D50B8]">Build Better.</span>
                        </>
                      ) : (
                        line
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  headline
                )
              ) : (
                <>
                  Repair. Protect.
                  <br />
                  Maintain. <span className="text-[#0D50B8]">Build Better.</span>
                </>
              )}
            </h1>

            {/* Description Subtitle */}
            <p className="text-sm sm:text-[14px] text-slate-600 leading-relaxed max-w-lg">
              {subheadline}
            </p>

            {/* 4 Trust Badges in a Row (Matching Mockup with blue icons & bold labels, no box) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 pt-1 pb-1">
              <div className="flex flex-col items-start gap-1">
                <Users className="w-5 h-5 text-[#0D50B8] shrink-0" />
                <span className="text-xs sm:text-[13px] font-bold text-slate-800">Reliable Team</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <Award className="w-5 h-5 text-[#0D50B8] shrink-0" />
                <span className="text-xs sm:text-[13px] font-bold text-slate-800">Quality Work</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <Clock className="w-5 h-5 text-[#0D50B8] shrink-0" />
                <span className="text-xs sm:text-[13px] font-bold text-slate-800">On-Time Service</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <FileText className="w-5 h-5 text-[#0D50B8] shrink-0" />
                <span className="text-xs sm:text-[13px] font-bold text-slate-800">Transparent Pricing</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={primaryCtaUrl}
                data-hbs-cta="quote"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={secondaryCtaUrl}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 bg-white hover:bg-slate-50 active:scale-[0.98] text-[#0D50B8] font-bold text-xs sm:text-sm rounded-xl border-2 border-[#0D50B8] transition-all"
              >
                <span>{secondaryCtaLabel}</span>
              </Link>
            </div>
          </div>

          {/* ── Spacer on Desktop (5 cols) so Left Content never overlaps artwork ── */}
          <div className="hidden lg:block lg:col-span-5 pointer-events-none" aria-hidden="true" />
        </div>
      </div>

      {/* ── Mobile Artwork: Edge-to-Edge full width right below the buttons (touches ribbon directly) ── */}
      <div className="lg:hidden relative w-full mt-6 aspect-[730/602] overflow-hidden">
        <Image
          src={mobileImageSrc}
          alt={heroConfig?.altText || "HiBUILD Expert Building Care & Maintenance"}
          fill
          priority
          unoptimized={mobileImageSrc.startsWith("http")}
          sizes="100vw"
          className={`object-cover ${isDefaultImage ? "object-bottom" : "object-center"}`}
        />
      </div>
    </section>
  );
}
