"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import type { HbsProject } from "@/lib/types";

interface HbsHomeProjectsShowcaseProps {
  projects: HbsProject[];
  prefix: string;
}

const CATEGORIES = ["All", "Repair", "Waterproofing", "Painting", "Renovation"];

export default function HbsHomeProjectsShowcase({
  projects,
  prefix,
}: HbsHomeProjectsShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects = selectedCategory === "All"
    ? projects.slice(0, 5)
    : projects.filter((p) => {
        const cat = (p.serviceCategory || "").toLowerCase();
        const sel = selectedCategory.toLowerCase();
        return cat.includes(sel) || sel.includes(cat);
      }).slice(0, 5);

  const displayList = filteredProjects.length > 0 ? filteredProjects : projects.slice(0, 5);

  return (
    <section aria-labelledby="projects-showcase-heading" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-red-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                OUR PROJECTS
              </span>
            </div>
            <h2
              id="projects-showcase-heading"
              className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display"
            >
              Our Recent <span className="text-blue-700">Work</span>
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#0B1528] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Project Cards Grid (2 cols mobile, 5 cols desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {displayList.map((project, idx) => (
            <Link
              key={project.id || idx}
              href={`${prefix}/projects/${project.slug || `project-${idx + 1}`}`}
              className="group flex flex-col space-y-2.5 bg-white rounded-2xl overflow-hidden p-2 hover:shadow-lg border border-slate-200/80 hover:border-blue-600 transition-all duration-300"
            >
              {/* Photo Thumbnail */}
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900">
                <Image
                  src={
                    project.images?.[0] ||
                    "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&auto=format&fit=crop"
                  }
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Title & Location */}
              <div className="px-1 pb-1 space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                  {project.title}
                </h3>
                {project.location && (
                  <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                    <span>{project.location}</span>
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
