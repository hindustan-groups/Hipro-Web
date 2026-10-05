import Link from "next/link";
import { ArrowRight, Wrench, MapPin, CheckCircle, Clock } from "lucide-react";
import { fetchHbsProjects, fetchHbsContent } from "@/lib/hbsData";

export const revalidate = 60;

export default async function HbsProjectsPage() {
  const [projects, content] = await Promise.all([
    fetchHbsProjects(),
    fetchHbsContent(),
  ]);

  return (
    <div className="space-y-12 sm:space-y-16 py-12">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-slate-200 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            Verified Site Execution
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase font-display tracking-tight">
            Our Work & <span className="text-amber-600">Case Studies</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Real transformations across residential properties, commercial towers, and industrial plants. View our structural rehabilitation, seepage remediation, and building maintenance records.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {projects.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center space-y-4">
            <Wrench className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 uppercase font-display">
              Projects Showcase Updating
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Our recent repair case studies and before/after photo documentation are currently being uploaded by our site supervisors.
            </p>
            <Link
              href="/hbs/contact"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider transition-colors"
            >
              <span>Request Inspection For Your Site</span>
              <ArrowRight className="w-4 h-4 text-amber-500" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              let beforeAfter = null;
              try {
                if (project.beforeAfterImages) {
                  beforeAfter = typeof project.beforeAfterImages === "string" ? JSON.parse(project.beforeAfterImages) : project.beforeAfterImages;
                }
              } catch {}

              return (
                <div
                  key={project.id}
                  className="bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        {project.location || "Bhilwara"}
                      </span>
                      <span className="font-mono text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
                        {project.serviceCategory || "Repair"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 uppercase font-display">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {project.description || "Comprehensive site rehabilitation and moisture protection execution."}
                    </p>

                    {/* Status Badge */}
                    <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Completed & Warranty Active</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {project.date || "Verified Case"}
                    </span>
                    <Link
                      href={`/hbs/contact?project=${encodeURIComponent(project.title)}`}
                      className="font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider text-[11px]"
                    >
                      Inquire Similar Work →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white p-8 sm:p-10 border-l-4 border-amber-500 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold uppercase font-display">
              Have A Complex Structural or Seepage Problem?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Our site engineers examine foundations, balconies, expansion joints, and basement slabs using diagnostic sensors.
            </p>
          </div>
          <Link
            href="/hbs/contact"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 text-xs uppercase tracking-wider shrink-0 transition-colors"
          >
            <span>Book Engineering Inspection</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
        </div>
      </section>
    </div>
  );
}
