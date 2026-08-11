import Link from "next/link";
import { Briefcase } from "lucide-react";
import CareersClient from "@/components/CareersClient";
import { findAll } from "@/lib/db";
import type { JobPosting } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const jobs = await findAll<JobPosting>("jobs");
  const activeJobs = jobs
    .filter(j => j.active !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return (
    <>
      {/* Header */}
      <section className="bg-white pt-36 pb-20 px-4 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-red-50 border border-red-100 text-construction-red mb-6 shadow-sm">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Join Our Team</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-5 font-display uppercase tracking-tight">
            Build Your <span className="text-construction-red">Career</span> With Us
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            We are always looking for passionate engineers, visionary architects, and dedicated site managers to join Hindustan Projects.
          </p>
        </div>
      </section>

      {/* ── Careers Grid ─────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CareersClient jobs={activeJobs} />
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-12 px-4 bg-slate-50 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-none bg-black px-10 py-16 text-center shadow-2xl border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display uppercase tracking-tight">
              Don&apos;t See a <span className="text-construction-red">Fit?</span>
            </h2>
            <p className="text-slate-300 font-light mb-8 max-w-xl mx-auto text-base">
              Send us your resume anyway. We are always on the lookout for top-tier talent to help shape the future of infrastructure.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-construction-red hover:bg-red-700 text-white font-bold px-8 py-4 rounded-none text-sm transition-all uppercase tracking-wider shadow-lg shadow-red-600/30"
            >
              Submit Open Application
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
