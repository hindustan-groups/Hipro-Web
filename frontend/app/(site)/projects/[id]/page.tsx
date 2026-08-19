import { notFound } from "next/navigation";
import { MapPin, Calendar, CheckCircle2, ArrowLeft, Building } from "lucide-react";
import Link from "next/link";
import { findById } from "@/lib/db";
import type { Project } from "@/lib/types";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await findById<Project>("projects", decodeURIComponent(params.id));

  if (!project) {
    return notFound();
  }

  const categoryColor: Record<string, string> = {
    Commercial: "text-black bg-slate-100 border border-slate-200",
    Residential: "text-construction-red bg-red-50 border border-red-100",
    Industrial: "text-slate-800 bg-slate-100 border border-slate-200",
  };

  // Extract project specific gallery images
  let galleryImages: string[] = [];
  if (project.images) {
    try {
      if (project.images.trim().startsWith("[")) {
        galleryImages = JSON.parse(project.images);
      } else {
        galleryImages = project.images.split("\n").map(s => s.trim()).filter(Boolean);
      }
    } catch {
      galleryImages = project.images.split("\n").map(s => s.trim()).filter(Boolean);
    }
  }

  const allProjectImages = Array.from(new Set([project.image, ...galleryImages].filter(Boolean)));

  return (
    <article className="bg-white min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-16">
          <Link 
            href="/projects"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-bold uppercase tracking-wider mb-8 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-none ${categoryColor[project.category] || categoryColor.Commercial}`}>
              {project.category}
            </span>
            <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-none ${project.status === 'active' || project.status === 'ongoing' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
              {project.status === 'active' || project.status === 'ongoing' ? 'Ongoing' : 'Completed'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-display uppercase tracking-tight max-w-4xl">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-medium">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-construction-red" />
              {project.location}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-construction-red" />
              {project.date}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Left Column: Description */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-slate-100 border border-slate-200 mb-6">
                <Building className="w-4 h-4 text-construction-red" />
                <span className="text-xs font-bold text-black uppercase tracking-wider">Project Overview</span>
              </div>
              <h2 className="text-3xl font-bold text-black mb-6 font-display uppercase tracking-tight">
                About The <span className="text-construction-red">Project</span>
              </h2>
              <div className="prose prose-lg prose-slate max-w-none mb-12">
                <p className="text-slate-600 font-light leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {/* Project Gallery */}
              <div>
                <h3 className="text-xl font-bold text-black font-display uppercase tracking-tight mb-6 border-b border-slate-200 pb-3">
                  Gallery & Execution ({allProjectImages.length} Photos)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {allProjectImages.map((imgUrl, i) => (
                    <div 
                      key={i} 
                      className={`${i % 3 === 0 ? "col-span-2 h-64 md:h-[400px]" : "h-48 md:h-72"} relative group overflow-hidden bg-slate-100 border border-slate-200 shadow-sm`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${project.title} - Image ${i + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar details */}
          <div className="md:col-span-1">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-none sticky top-32">
              <h3 className="text-lg font-bold text-black font-display uppercase tracking-wider mb-6 border-b border-slate-200 pb-4">
                Project Details
              </h3>
              
              <ul className="space-y-6">
                <li>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-black font-medium">{project.location}</p>
                </li>
                <li>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-black font-medium">{project.category}</p>
                </li>
                <li>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-black font-medium">{project.date}</p>
                </li>
                <li>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <p className="flex items-center gap-2 text-black font-medium">
                    <CheckCircle2 className={`w-4 h-4 ${project.status === 'active' ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <span className="capitalize">{project.status}</span>
                  </p>
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-4 font-light">Interested in a similar project?</p>
                <Link 
                  href="/contact"
                  className="flex items-center justify-center gap-2 bg-black hover:bg-construction-red text-white font-bold py-3 px-4 rounded-none transition-colors uppercase tracking-wider text-xs w-full"
                >
                  Request A Quote
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </article>
  );
}
