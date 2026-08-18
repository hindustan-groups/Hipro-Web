import PublicProjectGrid from "@/components/PublicProjectGrid";
import ProjectsHero from "@/components/ProjectsHero";
import { findAll } from "@/lib/db";
import type { Project } from "@/lib/types";

export default async function ProjectsPage() {
  const allProjects = await findAll<Project>("projects");
  const featuredProjects = allProjects.filter((p) => p.featured === true);

  return (
    <>
      {featuredProjects.length > 0 ? (
        <ProjectsHero featuredProjects={featuredProjects} />
      ) : (
        <section className="bg-slate-50 pt-36 pb-20 border-b border-slate-200 text-center">
          <h1 className="text-4xl font-bold text-slate-900 font-display uppercase tracking-tight">Our Portfolio</h1>
        </section>
      )}

      {/* Dynamic Filterable & Sortable Grid */}
      <PublicProjectGrid projects={allProjects} />

      {/* CTA */}
      <section className="py-12 px-4 bg-white pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-none bg-slate-50 px-10 py-16 text-center shadow-lg border border-slate-200">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 font-display uppercase tracking-tight">
              Want To Showcase <span className="font-serif italic font-normal text-construction-red normal-case">Your Build Here?</span>
            </h2>
            <p className="text-slate-600 font-light mb-8 max-w-xl mx-auto text-base leading-relaxed">
              Partner with Hindustan Projects for end-to-end master planning, structural design, and construction execution.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-3 bg-construction-navy hover:bg-blue-900 text-white font-bold px-8 py-4 rounded-none text-sm transition-all uppercase tracking-wider shadow-md"
            >
              Start Your Project
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
