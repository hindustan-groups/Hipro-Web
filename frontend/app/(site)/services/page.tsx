import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowDown,
  Building2,
  Calculator,
  Compass,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { findAll } from "@/lib/db";
import type { Service } from "@/lib/types";
import DynamicIcon from "@/components/DynamicIcon";
import { cleanServiceTitle, getServiceSlug } from "@/lib/companyData";
import { isOptimizableImage } from "@/lib/imageUtils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Construction & Engineering Services",
  description: "Comprehensive civil construction, architectural planning, digital surveying, interior design, and project management services by Hindustan Projects (HiPRO).",
  alternates: {
    canonical: "/services",
  },
};

export default async function ServicesPage() {
  const allServices = await findAll<Service>("services");
  const services = allServices.filter(s => s.active !== false).sort((a, b) => (a.order || 99) - (b.order || 99));

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO: Authoritative Engineering & Execution
          ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-28 sm:pt-32 md:pt-36 pb-12 md:pb-16 px-4 border-b border-slate-200/80 overflow-hidden">
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
        {/* Subtle Ambient Lighting Accents */}
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
            <ShieldCheck className="w-4 h-4 text-construction-red" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              Engineering · Construction · Infrastructure
            </span>
          </div>

          {/* Primary H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 font-display uppercase tracking-tight leading-[1.15]">
            Engineering Services Built for{" "}
            <span className="font-serif italic font-normal text-construction-red normal-case tracking-normal">
              Real-World Execution
            </span>
          </h1>

          {/* Supporting Lead Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto font-light leading-relaxed mb-6 sm:mb-8">
            Integrated engineering, construction, architectural and project management services for residential, commercial and infrastructure projects.
          </p>

          {/* 3 Technical Domain Anchors / Proof Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto mb-6 sm:mb-8 text-left">
            <div className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-none bg-white border border-slate-200 flex items-center justify-center text-construction-navy shadow-xs">
                  <Compass className="w-3.5 h-3.5 text-construction-red" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
                  Engineering &amp; Planning
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] text-slate-600 font-normal leading-snug">
                Architectural planning, structural engineering and technical design support.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-none bg-white border border-slate-200 flex items-center justify-center text-construction-navy shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-construction-red" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
                  Construction &amp; Execution
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] text-slate-600 font-normal leading-snug">
                Disciplined site execution with coordinated construction and project management.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-none bg-white border border-slate-200 flex items-center justify-center text-construction-navy shadow-xs">
                  <Layers className="w-3.5 h-3.5 text-construction-red" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
                  Infrastructure &amp; Support
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] text-slate-600 font-normal leading-snug">
                Practical engineering support for infrastructure and development requirements.
              </p>
            </div>
          </div>

          {/* Concise Action CTA Area */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-construction-navy hover:bg-slate-900 text-white font-bold px-5 py-3 rounded-none text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm group"
            >
              <span>Consult Technical Team</span>
              <ArrowRight className="w-4 h-4 text-construction-red group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/cost-estimator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3 rounded-none border border-slate-300 text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs"
            >
              <Calculator className="w-4 h-4 text-construction-red" />
              <span>Estimate Project Cost</span>
            </Link>
            <a
              href="#services-list"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-slate-600 hover:text-construction-navy px-3 py-3 rounded-none text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Explore All Services</span>
              <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services-list" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((s, i) => {
              const cleanTitle = cleanServiceTitle(s.title);
              const slug = getServiceSlug(cleanTitle);
              const firstWord = (cleanTitle || "Service").split(' ')[0];
              const imageUrl = s.image || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=75";
              
              return (
                <div 
                  key={i}
                  className="group relative h-[320px] md:h-[380px] w-full rounded-[2rem] overflow-hidden shadow-lg shadow-slate-900/10 bg-slate-900"
                >
                  {/* Background Image */}
                  <Image 
                    src={imageUrl} 
                    alt={s.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized={!isOptimizableImage(imageUrl)}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300" />
                  
                  {/* Content Box */}
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                          <DynamicIcon name={s.icon || "Wrench"} className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] uppercase tracking-widest font-bold text-slate-300">
                          {s.category || "Our Capabilities"}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white font-display mb-2 leading-tight">
                        {s.title}
                      </h3>
                      <p className="text-slate-200 font-light line-clamp-2 text-sm md:text-base">
                        {s.description}
                      </p>
                    </div>
                    
                    <Link 
                      href={`/services/${slug}`}
                      className="inline-flex shrink-0 items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-orange-900/30 hover:shadow-orange-900/50"
                    >
                      Explore {firstWord}
                    </Link>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-red-50 border border-red-100 text-construction-red mb-4 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider">Methodology</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight">
              Our <span className="text-construction-red">Process</span>
            </h2>
            <p className="text-slate-600 mt-3 font-light text-base">
              A systematic approach ensuring structural integrity, timely delivery, and precise execution on every site.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[1px] bg-slate-200 -translate-y-1/2 z-0" />
            
            {[
              { step: "01", title: "Consultation & Planning", desc: "Initial blueprint reviews, site evaluations, and feasibility studies." },
              { step: "02", title: "Design & Engineering", desc: "Structural calculations, 3D modeling, and obtaining necessary permits." },
              { step: "03", title: "Execution & Build", desc: "Active construction phase with rigorous safety and quality controls." },
              { step: "04", title: "Handover & Support", desc: "Final inspections, project delivery, and post-construction warranties." },
            ].map((p, i) => (
              <div key={i} className="relative z-10 bg-white border border-slate-200/80 p-8 shadow-lg shadow-slate-900/5 text-center group hover:-translate-y-1 transition-all">
                <div className="w-16 h-16 mx-auto bg-black text-white rounded-none flex items-center justify-center font-display font-bold text-2xl mb-6 shadow-md group-hover:bg-construction-red transition-colors">
                  {p.step}
                </div>
                <h3 className="text-lg font-bold text-black mb-3 font-display uppercase tracking-tight">{p.title}</h3>
                <p className="text-xs text-slate-600 font-light leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-white pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-none bg-slate-50 px-10 py-16 text-center shadow-lg border border-slate-200/80">
            <h2 className="text-3xl md:text-5xl font-bold text-construction-navy mb-4 font-display uppercase tracking-tight">
              Ready To Launch <span className="text-construction-red">Your Next Build?</span>
            </h2>
            <p className="text-slate-600 font-light mb-8 max-w-xl mx-auto text-base">
              Consult with our senior technical engineering team for complete BOQ estimation and blueprint reviews.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-construction-red hover:bg-red-700 text-white font-bold px-8 py-4 rounded-none text-sm transition-all uppercase tracking-wider shadow-lg shadow-red-600/30"
            >
              Contact Technical Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
