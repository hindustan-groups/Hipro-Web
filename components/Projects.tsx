import Link from "next/link";
import { ArrowUpRight, Building } from "lucide-react";
import type { Project } from "@/lib/types";

export default function Projects({ projects, title }: { projects: Project[], title?: string }) {
  // Only take first 3 projects to ensure the 3-column layout is perfect
  const displayProjects = projects.slice(0, 3);

  return (
    <section id="section-projects" className="pt-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-construction-navy font-display uppercase tracking-wider mb-4">
              {title || "Landmarks In The Making"}
            </h2>
            <div className="flex w-64 h-1">
              <div className="w-1/3 h-full bg-yellow-500"></div>
              <div className="w-2/3 h-full bg-construction-navy"></div>
            </div>
          </div>
          <Link 
            href="/projects" 
            className="group inline-flex items-center gap-2 text-construction-navy font-bold hover:text-construction-red transition-colors uppercase tracking-widest text-xs"
          >
            View Full Portfolio 
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Gapless Project Grid */}
      <div className="w-full">
        <div className="grid md:grid-cols-3 w-full">
          {displayProjects.map((p, i) => (
            <Link
              href={`/projects/${p.id}`}
              key={i}
              className="group relative overflow-hidden h-[500px] md:h-[600px] block w-full bg-slate-900"
            >
              {/* Image */}
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />
              
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content Overlay (Appears on Hover) */}
              <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center text-center">
                <h3 className="text-xl md:text-2xl font-bold text-white font-display tracking-tight mb-2 drop-shadow-lg">
                  {p.title}
                </h3>
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                  View Details <ArrowUpRight className="w-4 h-4 text-construction-red" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
