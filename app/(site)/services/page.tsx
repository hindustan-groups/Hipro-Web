import Link from "next/link";
import { findAll } from "@/lib/db";
import type { Service } from "@/lib/types";
import * as Icons from "lucide-react";

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
            Our <span className="text-construction-red">Capabilities</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-light leading-relaxed mb-8">
            Turnkey civil engineering, structural design, architecture, and construction solutions across residential, commercial, and industrial sectors.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => {
              const Icon = (Icons as any)[s.icon] || Icons.Wrench;
              const slug = s.title.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
              
              return (
                <Link 
                  href={`/services/${slug}`} 
                  key={i} 
                  className="group bg-white border border-slate-200/80 rounded-none overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={s.image} 
                      alt={s.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-construction-red flex items-center justify-center text-white shadow-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-black mb-3 font-display uppercase tracking-tight group-hover:text-construction-red transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-slate-600 font-light leading-relaxed text-sm flex-1 mb-6">
                      {s.description}
                    </p>
                    
                    <div className="mt-auto inline-flex items-center text-sm font-bold text-construction-navy uppercase tracking-wider group-hover:text-construction-red transition-colors">
                      Explore Capability <Icons.ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
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
          <div className="rounded-none bg-black px-10 py-16 text-center shadow-2xl border border-white/10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-display uppercase tracking-tight">
              Ready To Launch <span className="text-construction-red">Your Next Build?</span>
            </h2>
            <p className="text-slate-300 font-light mb-8 max-w-xl mx-auto text-base">
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
