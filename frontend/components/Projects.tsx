import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Building } from "lucide-react";
import type { Project } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

export default function Projects({ projects = [], title }: { projects?: Project[], title?: string }) {
  const displayProjects = (projects || []).slice(0, 3);
  const hasProjects = displayProjects.length > 0;

  return (
    <section id="section-projects" className="pt-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-construction-navy font-display uppercase tracking-wider mb-4">
              {title ? title : <>Landmarks In The <span className="font-serif italic font-normal text-construction-red normal-case">Making</span></>}
            </h2>
            <div className="flex w-64 h-1">
              <div className="w-1/3 h-full bg-yellow-500"></div>
              <div className="w-2/3 h-full bg-construction-navy"></div>
            </div>
          </div>
          {hasProjects && (
            <Link 
              href="/projects" 
              className="group inline-flex items-center gap-2 text-construction-navy font-bold hover:text-construction-red transition-colors uppercase tracking-widest text-xs"
            >
              View Full Portfolio 
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {hasProjects ? (
        /* Gapless Project Grid */
        <div className="w-full">
          <div className="grid md:grid-cols-3 w-full">
            {displayProjects.map((p, i) => (
              <Link
                href={`/projects/${p.id}`}
                key={i}
                className="group relative overflow-hidden h-[500px] md:h-[600px] block w-full bg-slate-900"
              >
                {/* Image */}
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={!isOptimizableImage(p.image)}
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
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
      ) : (
        /* Professional Empty State */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-slate-50 border border-slate-200 p-10 md:p-14 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-12 h-12 bg-white border border-slate-200 mx-auto flex items-center justify-center text-construction-navy mb-4 shadow-sm">
              <Building className="w-6 h-6 text-construction-navy" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
              Project Portfolio Updating
            </h3>
            <p className="text-slate-600 text-sm font-light leading-relaxed mb-6">
              Our active site portfolio and project documentation are currently being updated with our latest construction milestones across Rajasthan.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-construction-navy hover:bg-slate-900 text-white font-bold px-6 py-3 text-xs uppercase tracking-widest transition-all shadow-sm"
            >
              Inquire About Ongoing Projects
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
