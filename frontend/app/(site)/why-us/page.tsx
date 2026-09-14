import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  Compass,
  HardHat,
  Layers,
  FileText,
  CheckCircle2,
  Building2,
  Ruler,
  Calculator,
  Briefcase,
} from "lucide-react";
import CTASection from "@/components/CTASection";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Why Us | Engineering Discipline & Execution Reliability",
  description:
    "Learn why clients choose Hindustan Projects (HiPRO) for integrated architectural planning, precision land surveying, turnkey civil construction, and project management in Bhilwara and Rajasthan.",
  alternates: {
    canonical: "/why-us",
  },
};

export default function WhyUsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO: Engineering Integrity & Execution Discipline
          ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-28 sm:pt-32 md:pt-36 pb-12 md:pb-16 px-4 border-b border-slate-200/80 overflow-hidden">
        {/* Subtle Architectural Drafting Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0F2C59 1px, transparent 1px), linear-gradient(to bottom, #0F2C59 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        {/* Ambient Lighting Gradients */}
        <div
          className="absolute -top-24 right-0 w-96 h-96 bg-slate-100/70 rounded-full blur-3xl pointer-events-none -z-0"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 left-0 w-80 h-80 bg-red-50/40 rounded-full blur-3xl pointer-events-none -z-0"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Eyebrow Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-slate-50 border border-slate-200 text-construction-navy mb-4 sm:mb-5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-construction-red" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              Engineering Integrity · Execution Discipline
            </span>
          </div>

          {/* Primary H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 font-display uppercase tracking-tight leading-[1.15]">
            Why Hindustan Projects: Built On Technical Discipline &amp;{" "}
            <span className="font-serif italic font-normal text-construction-red normal-case tracking-normal">
              Structural Reliability
            </span>
          </h1>

          {/* Supporting Lead Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto font-light leading-relaxed mb-6 sm:mb-8">
            Headquartered in Bhilwara, Hindustan Projects (HiPRO) unites architectural planning, digital land surveying, civil construction, and structured project consultancy under a single accountable standard of execution.
          </p>

          {/* 3 Hero Capability Anchors (Architectural Ledger / Schedule Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90 border border-slate-200/90 bg-slate-50/70 max-w-4xl mx-auto mb-6 sm:mb-8 text-left shadow-xs">
            <div className="p-4 sm:p-5 group hover:bg-white transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">
                  01 / INTEGRATION
                </span>
                <Layers className="w-3.5 h-3.5 text-construction-red" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-display mb-1">
                Integrated Project Coordination
              </h2>
              <p className="text-[11px] sm:text-[12px] text-slate-600 font-normal leading-snug">
                Unified delivery aligning architectural design, surveying, and civil execution under one roof
              </p>
            </div>

            <div className="p-4 sm:p-5 group hover:bg-white transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">
                  02 / SUPERVISION
                </span>
                <HardHat className="w-3.5 h-3.5 text-construction-red" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-display mb-1">
                Engineering &amp; Site Supervision
              </h2>
              <p className="text-[11px] sm:text-[12px] text-slate-600 font-normal leading-snug">
                Dedicated supervisory presence coordinating trades, structural masonry, and milestone quality
              </p>
            </div>

            <div className="p-4 sm:p-5 group hover:bg-white transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">
                  03 / MANAGEMENT
                </span>
                <Compass className="w-3.5 h-3.5 text-construction-red" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-display mb-1">
                Milestone-Based Management
              </h2>
              <p className="text-[11px] sm:text-[12px] text-slate-600 font-normal leading-snug">
                Systematic phase scheduling, progress reporting, and transparent client coordination
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-construction-navy hover:bg-slate-900 text-white font-bold px-5 py-3 rounded-none text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm group"
            >
              <span>Discuss Your Project</span>
              <ArrowRight className="w-4 h-4 text-construction-red group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#engineering-pillars"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3 rounded-none border border-slate-300 text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs"
            >
              <span>Explore Engineering Pillars</span>
              <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — ENGINEERING PILLARS: Core Execution Principles
          ───────────────────────────────────────────────────────────── */}
      <section
        id="engineering-pillars"
        className="py-16 md:py-24 px-4 bg-slate-50/60 border-b border-slate-200/80 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 text-construction-navy mb-3 text-[11px] font-bold uppercase tracking-wider">
              <span>Core Engineering Standards</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight mb-3">
              Principles Grounded In{" "}
              <span className="font-serif italic font-normal text-construction-red normal-case">
                Practical Execution
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
              Construction outcomes depend on clarity before excavation begins. We eliminate fragmented contractor handoffs by combining planning, technical design, and active site supervision.
            </p>
          </div>

          {/* 4 Technical Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-none shadow-xs hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 text-construction-red" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 block">
                    PILLAR 01
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight font-display">
                    Engineering-Led Planning
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light mb-4">
                Every project begins with structural and spatial evaluation before construction mobilizes. By coordinating digital land measurements, boundary demarcations, and architectural perspectives early, we prevent costly layout changes during site execution.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-construction-navy shrink-0" />
                <span>Topographic assessment &amp; architectural alignment</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-none shadow-xs hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-construction-red" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 block">
                    PILLAR 02
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight font-display">
                    Integrated Construction Coordination
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light mb-4">
                We manage turnkey civil works directly — from heavy RCC framework and masonry to interior and exterior finishing. Having a single accountable team bridges the traditional disconnect between drawing boards and active jobsites.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-construction-navy shrink-0" />
                <span>Single-point responsibility across civil trades</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-none shadow-xs hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <HardHat className="w-5 h-5 text-construction-red" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 block">
                    PILLAR 03
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight font-display">
                    Dedicated Project Supervision
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light mb-4">
                Our site supervision focuses on practical quality control and workmanship oversight. Dedicated supervisors monitor material handling, structural reinforcement alignment, and trade coordination throughout the construction lifecycle.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-construction-navy shrink-0" />
                <span>On-site oversight &amp; structural discipline</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-none shadow-xs hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-construction-red" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 block">
                    PILLAR 04
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight font-display">
                    Transparent Client Communication
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light mb-4">
                We believe trust is built on predictability. Project owners receive structured stage reports, documented milestone progress, and clear technical guidance — ensuring full transparency from initial feasibility to final key handover.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-construction-navy shrink-0" />
                <span>Documented milestone tracking &amp; regular updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — DELIVERY APPROACH: The 4-Stage Project Journey
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 text-construction-navy mb-3 text-[11px] font-bold uppercase tracking-wider">
              <span>Structured Execution Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight mb-3">
              Our Disciplined{" "}
              <span className="font-serif italic font-normal text-construction-red normal-case">
                Delivery Approach
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
              Every project moves through four verified stages designed to maintain structural integrity, budget predictability, and clear milestone coordination.
            </p>
          </div>

          {/* 4-Step Process Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Step 01 */}
            <div className="border border-slate-200 p-5 sm:p-6 bg-slate-50/40 relative group hover:bg-white hover:border-slate-300 transition-colors">
              <div className="text-xs font-mono font-bold tracking-widest text-construction-red mb-3">
                STAGE 01
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 font-display mb-2">
                Survey &amp; Site Assessment
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                Digital land measurements, boundary demarcations, topographic level evaluations, and spatial feasibility analysis.
              </p>
            </div>

            {/* Step 02 */}
            <div className="border border-slate-200 p-5 sm:p-6 bg-slate-50/40 relative group hover:bg-white hover:border-slate-300 transition-colors">
              <div className="text-xs font-mono font-bold tracking-widest text-construction-red mb-3">
                STAGE 02
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 font-display mb-2">
                Architectural &amp; Technical Design
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                Comprehensive 2D/3D layouts, structural drawing coordination, elevation aesthetics, and municipal sanction documentation.
              </p>
            </div>

            {/* Step 03 */}
            <div className="border border-slate-200 p-5 sm:p-6 bg-slate-50/40 relative group hover:bg-white hover:border-slate-300 transition-colors">
              <div className="text-xs font-mono font-bold tracking-widest text-construction-red mb-3">
                STAGE 03
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 font-display mb-2">
                Civil Execution &amp; Supervision
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                Turnkey civil construction, heavy RCC casting, brickwork, masonry, and continuous supervisory monitoring on-site.
              </p>
            </div>

            {/* Step 04 */}
            <div className="border border-slate-200 p-5 sm:p-6 bg-slate-50/40 relative group hover:bg-white hover:border-slate-300 transition-colors">
              <div className="text-xs font-mono font-bold tracking-widest text-construction-red mb-3">
                STAGE 04
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 font-display mb-2">
                Finishing &amp; Milestone Handover
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                Interior and exterior detailing, MEP coordination, final quality inspections, and documented handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — CONTEXTUAL NAVIGATION: Explore Capabilities & Tools
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              Explore Hindustan Projects
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-light">
              Review our specialized practice disciplines, browse executed project portfolio, or calculate estimated construction costs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: Services */}
            <Link
              href="/services"
              className="bg-white border border-slate-200 p-6 rounded-none shadow-xs hover:border-construction-navy hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-construction-navy group-hover:text-construction-red transition-colors">
                  <Ruler className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 font-display mb-1.5 group-hover:text-construction-navy transition-colors">
                  Engineering Services
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light mb-4">
                  Explore our 6 practice areas covering architecture, civil construction, surveying, ETP/STP plants, and PMC.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-construction-navy group-hover:text-construction-red transition-colors">
                <span>View All Services</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Projects */}
            <Link
              href="/projects"
              className="bg-white border border-slate-200 p-6 rounded-none shadow-xs hover:border-construction-navy hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-construction-navy group-hover:text-construction-red transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 font-display mb-1.5 group-hover:text-construction-navy transition-colors">
                  Project Portfolio
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light mb-4">
                  Discover executed residential, commercial, and industrial engineering work delivered across the region.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-construction-navy group-hover:text-construction-red transition-colors">
                <span>View Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Cost Estimator */}
            <Link
              href="/cost-estimator"
              className="bg-white border border-slate-200 p-6 rounded-none shadow-xs hover:border-construction-navy hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-construction-navy group-hover:text-construction-red transition-colors">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 font-display mb-1.5 group-hover:text-construction-navy transition-colors">
                  Cost Estimator
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light mb-4">
                  Calculate realistic construction cost estimates for your upcoming residential or commercial build.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-construction-navy group-hover:text-construction-red transition-colors">
                <span>Estimate Build Cost</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — GLOBAL CTA: Direct Consultation & Contacts
          ───────────────────────────────────────────────────────────── */}
      <CTASection />
    </div>
  );
}
