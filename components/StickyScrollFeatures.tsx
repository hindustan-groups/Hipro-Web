"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Attract the right clients",
    description: "Showcase your portfolio with stunning visuals and case studies that highlight your expertise in high-end construction.",
    image: "https://images.unsplash.com/photo-1541888081622-15cb2a21e422?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Win more business",
    description: "Build trust through verified testimonials, detailed service breakdowns, and transparent project methodologies.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Offer specialized services",
    description: "From architecture planning to civil structure testing, lay out your capabilities clearly for prospective partners.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200"
  }
];

export default function StickyScrollFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how far we've scrolled into the container
      // top is 0 when the sticky section hits the top of the viewport
      const scrollProgress = -top;
      
      // The total scrollable distance is height - viewportHeight
      const totalScrollable = height - viewportHeight;
      
      if (scrollProgress < 0) {
        setActiveIndex(0);
      } else if (scrollProgress >= totalScrollable) {
        setActiveIndex(features.length - 1);
      } else {
        // Calculate which index should be active
        const progressRatio = scrollProgress / totalScrollable;
        const index = Math.floor(progressRatio * features.length);
        setActiveIndex(Math.min(index, features.length - 1));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative bg-black" style={{ height: `${features.length * 100}vh` }}>
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Side: Text List */}
          <div className="flex flex-col justify-center space-y-12 py-12 lg:py-0 w-full z-30">
            {features.map((feature, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div 
                  key={idx}
                  className={`transition-all duration-500 ease-out ${
                    isActive ? "opacity-100 translate-x-0" : "opacity-30 -translate-x-4"
                  }`}
                >
                  <h3 className={`text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4 transition-colors duration-500 ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}>
                    {feature.title}
                  </h3>
                  
                  {/* Expandable Description */}
                  <div className={`grid transition-all duration-500 ease-in-out ${
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                    <div className="overflow-hidden">
                      <p className="text-lg text-slate-300 font-light leading-relaxed pt-2">
                        {feature.description}
                      </p>
                      {isActive && (
                        <Link href="/services" className="inline-flex items-center gap-2 mt-6 text-construction-red hover:text-white font-bold uppercase tracking-wider text-sm transition-colors group">
                          Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side: Media Container */}
          <div className="hidden lg:block h-[70vh] relative rounded-none overflow-hidden border border-white/10 shadow-2xl bg-slate-900 z-20">
            {features.map((feature, idx) => (
              <img
                key={idx}
                src={feature.image}
                alt={feature.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  idx === activeIndex 
                    ? "opacity-100 scale-100 z-10" 
                    : "opacity-0 scale-105 z-0"
                }`}
              />
            ))}
            
            {/* Subtle overlay gradient for image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-20 pointer-events-none" />
          </div>
          
        </div>
        
        {/* Mobile background image (absolute behind text) */}
        <div className="lg:hidden absolute inset-0 z-0">
           {features.map((feature, idx) => (
              <img
                key={idx}
                src={feature.image}
                alt={feature.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  idx === activeIndex 
                    ? "opacity-30 scale-100 z-10" 
                    : "opacity-0 scale-105 z-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-black/80 z-20 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
