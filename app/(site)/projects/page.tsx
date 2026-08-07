import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { findAll } from "@/lib/db";
import type { Project } from "@/lib/types";

const categoryColor: Record<string, string> = {
  Commercial: "text-black bg-slate-100 border border-slate-200",
  Residential: "text-construction-red bg-red-50 border border-red-100",
  Industrial: "text-slate-800 bg-slate-100 border border-slate-200",
};

export default async function ProjectsPage() {
  const allProjects = await findAll<Project>("projects");
  const ongoingProjects = allProjects.filter(p => p.status === "active");
  const completedProjects = allProjects.filter(p => p.status === "archived");

  return (
    <>
      {/* Header */}
      <section className="bg-white pt-36 pb-20 px-4 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-red-50 border border-red-100 text-construction-red mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-none bg-construction-red animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider">500+ Completed Projects</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-5 font-display uppercase tracking-tight">
            Featured <span className="text-construction-red">Portfolio</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            Exemplary civil engineering, landmark developments, and luxury construction delivered with structural perfection.
          </p>
        </div>
      </section>

      {/* Filter row */}
      <section className="bg-white py-8 px-4 border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
          {["All", "Residential", "Commercial", "Industrial"].map((cat) => (
            <button
              key={cat}
              className={`px-6 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                cat === "All"
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-construction-red hover:text-construction-red"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid - Ongoing */}
      <section id="ongoing" className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-8 font-display uppercase tracking-tight border-b border-slate-200 pb-4">
            Ongoing <span className="text-construction-red">Projects</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ongoingProjects.map((p, i) => (
              <Link
                href={`/projects/${p.id}`}
                key={i}
                className="group rounded-none border border-slate-200/80 bg-white overflow-hidden hover:border-construction-red/40 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                <div className="overflow-hidden h-60 relative">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-none mb-3 ${categoryColor[p.category] || categoryColor.Commercial}`}>
                      {p.category}
                    </span>
                    <h3 className="text-xl font-bold text-black mb-2 font-display uppercase tracking-tight group-hover:text-construction-red transition-colors">{p.title}</h3>
                    <p className="text-xs text-slate-600 font-light mb-4 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-4 border-t border-slate-100">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-construction-red" />{p.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-black" />{p.date}</span>
                  </div>
                </div>
              </Link>
            ))}
            {ongoingProjects.length === 0 && (
              <p className="text-slate-500 font-light italic col-span-full">No ongoing projects to display.</p>
            )}
          </div>
        </div>
      </section>

      {/* Grid - Completed */}
      <section id="completed" className="py-16 bg-slate-50 px-4 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-8 font-display uppercase tracking-tight border-b border-slate-200 pb-4">
            Completed <span className="text-construction-red">Projects</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {completedProjects.map((p, i) => (
              <Link
                href={`/projects/${p.id}`}
                key={i}
                className="group rounded-none border border-slate-200/80 bg-white overflow-hidden hover:border-construction-red/40 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                <div className="overflow-hidden h-60 relative">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-none mb-3 ${categoryColor[p.category] || categoryColor.Commercial}`}>
                      {p.category}
                    </span>
                    <h3 className="text-xl font-bold text-black mb-2 font-display uppercase tracking-tight group-hover:text-construction-red transition-colors">{p.title}</h3>
                    <p className="text-xs text-slate-600 font-light mb-4 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-4 border-t border-slate-100">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-construction-red" />{p.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-black" />{p.date}</span>
                  </div>
                </div>
              </Link>
            ))}
            {completedProjects.length === 0 && (
              <p className="text-slate-500 font-light italic col-span-full">No completed projects to display.</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-white pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-none bg-black px-10 py-16 text-center shadow-2xl border border-white/10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-display uppercase tracking-tight">
              Want To Showcase <span className="text-construction-red">Your Build Here?</span>
            </h2>
            <p className="text-slate-300 font-light mb-8 max-w-xl mx-auto text-base">
              Partner with Hindustan Projects for end-to-end master planning, structural design, and construction execution.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-3 bg-construction-red hover:bg-red-700 text-white font-bold px-8 py-4 rounded-none text-sm transition-all uppercase tracking-wider shadow-lg shadow-red-600/30"
            >
              Start Your Project
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
