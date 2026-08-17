"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import type { Project } from "@/lib/types";

export default function ProjectsHero({ featuredProjects }: { featuredProjects: Project[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (featuredProjects.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProjects.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredProjects.length]);

  if (featuredProjects.length === 0) return null;

  return (
    <section className="relative min-h-[85vh] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-900">
      {/* Background Images Slider */}
      <div className="absolute inset-0 z-0">
        {featuredProjects.map((project, idx) => (
          <div 
            key={project.id}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={project.image}
              alt={project.title}
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ${
                idx === currentSlide ? "scale-105" : "scale-100"
              }`}
            />
            {/* Very light gradient just for text readability at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}
        {/* Blueprint Vector Grid Overlay Pattern */}
        <div 
          className="absolute inset-0 opacity-15 z-10 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-full pt-32 pb-24">
        <div className="w-full grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-8 xl:col-span-9 relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 backdrop-blur-md shadow-lg shadow-black/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-construction-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-construction-red"></span>
              </span>
              <span className="text-[13px] text-white font-bold uppercase tracking-[0.2em]">
                Featured Project Spotlight
              </span>
            </div>

            {/* Dynamic Content Slider */}
            <div className="relative h-[220px] sm:h-[180px]">
              {featuredProjects.map((project, idx) => (
                <div
                  key={project.id}
                  className={`absolute inset-0 transition-all duration-1000 transform ${
                    idx === currentSlide 
                      ? "opacity-100 translate-y-0 pointer-events-auto" 
                      : "opacity-0 translate-y-8 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center gap-2 text-construction-red font-bold text-sm uppercase tracking-widest mb-4">
                    <MapPin className="w-4 h-4" /> {project.location}
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 font-display uppercase tracking-tight leading-[1.1] drop-shadow-2xl">
                    {project.title}
                  </h1>
                  
                  <Link 
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-3 bg-construction-red hover:bg-red-700 text-white font-bold px-8 py-4 text-sm transition-all uppercase tracking-wider group w-fit"
                  >
                    View Project Details
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
        {featuredProjects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-500 rounded-none h-1.5 ${
              idx === currentSlide 
                ? "bg-construction-red w-12" 
                : "bg-white/30 hover:bg-white/50 w-6"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
