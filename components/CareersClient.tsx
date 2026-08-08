"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import JobApplicationModal from "@/components/JobApplicationModal";
import type { JobPosting } from "@/lib/types";

interface CareersClientProps {
  jobs: JobPosting[];
}

export default function CareersClient({ jobs }: CareersClientProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <>
      <JobApplicationModal 
        isOpen={!!selectedRole}
        roleTitle={selectedRole || ""}
        onClose={() => setSelectedRole(null)}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mb-10">
        {jobs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No open positions currently available. Check back later or submit an open application below!
          </div>
        ) : (
          jobs.map((job, i) => (
            <div key={job.id || i} className="bg-white p-8 border border-slate-200/80 shadow-md hover:shadow-xl transition-shadow flex flex-col">
              <h3 className="text-xl font-bold text-black font-display uppercase mb-3">{job.title}</h3>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-6">
                <span className="bg-slate-100 px-2 py-1">{job.type}</span>
                <span>•</span>
                <span>{job.location}</span>
              </div>
              {job.description && (
                <p className="text-sm text-slate-600 mb-6 line-clamp-3">{job.description}</p>
              )}
              <div className="mt-auto pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedRole(job.title)}
                  className="inline-flex items-center gap-2 text-construction-navy text-xs font-bold uppercase tracking-wider hover:text-construction-red transition-colors"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
