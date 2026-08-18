import Link from "next/link";
import { findAll } from "@/lib/db";
import type { Service } from "@/lib/types";
import * as Icons from "lucide-react";

import DynamicIcon from "@/components/DynamicIcon";

export default async function ServicesPage() {
  const allServices = await findAll<Service>("services");
  const services = allServices.filter(s => s.active !== false).sort((a, b) => (a.order || 99) - (b.order || 99));

  return (
    <>
      {/* Premium Light Hero Header */}
      <section className="relative pt-36 pb-20 bg-slate-50 border-b border-slate-200 overflow-hidden">
        {/* Subtle Architectural Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-200/50 to-transparent z-0"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-none bg-white border border-slate-200 text-slate-700 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-none bg-construction-red animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">End-To-End Engineering & Construction</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 font-display uppercase tracking-tight">
            Our <span className="font-serif italic font-normal text-construction-red normal-case">Capabilities</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-light leading-relaxed mb-8">
            Turnkey civil engineering, structural design, architecture, and construction solutions across residential, commercial, and industrial sectors.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((s, i) => {
              const slug = (s.title || "").toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
              const firstWord = (s.title || "Service").split(' ')[0];
              const imageUrl = s.image || "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=1200&q=80";
              
              return (
                <div 
                  key={i}
                  className="group relative h-[320px] md:h-[380px] w-full rounded-[2rem] overflow-hidden shadow-lg shadow-slate-900/10 bg-slate-900"
                >
                  {/* Background Image */}
                  <img 
                    src={imageUrl} 
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
