import Link from "next/link";
import { ArrowUpRight, MapPin, Building } from "lucide-react";
import type { Project } from "@/lib/types";

export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="section-projects" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-slate-100 border border-slate-200 mb-4">
              <Building className="w-4 h-4 text-construction-navy" />
              <span className="text-xs font-bold text-construction-navy uppercase tracking-wider">Portfolio Showcase</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight">Featured Projects</h2>
          </div>
          <Link 
            href="/projects" 
            className="group inline-flex items-center gap-3 text-black font-bold hover:text-construction-navy transition-colors uppercase tracking-wider text-sm"
          >
            View Full Portfolio 
            <div className="w-10 h-10 border border-slate-300 flex items-center justify-center group-hover:border-construction-navy group-hover:bg-construction-navy group-hover:text-white transition-all rounded-none shadow-sm">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </Link>
        </div>

        {/* Project Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((p, i) => (
            <Link
              href={`/projects/${p.id}`}
              key={i}
              className="group rounded-none overflow-hidden bg-white border border-slate-200/80 hover:border-slate-300 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 flex flex-col hover:-translate-y-1.5"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-64">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-black/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-none border border-white/10 shadow-sm">
                    {p.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black mb-2 font-display uppercase tracking-tight group-hover:text-construction-navy transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-4">{p.description}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-construction-navy" />
                    {p.location}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-construction-navy uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    Explore <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
