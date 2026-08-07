"use client";

import { useState, useRef, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

export default function Guarantees() {
  const guarantees = [
    {
      id: 1,
      badge: "EXPERT ASSURANCE",
      title: "In-House Technical Specialists",
      description: "Dedicated cross-functional team – Chartered Architect, Senior Site Manager, Lead Engineer, and Quality Control Inspector.",
      bg: "bg-construction-red",
      accent: "text-red-100",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    },
    {
      id: 2,
      badge: "VETTED QUALITY",
      title: "Top-Tier Certified Contractors",
      description: "Every trade contractor undergoes a rigorous 6-stage auditing process ensuring compliance, safety, and craftsmanship.",
      bg: "bg-construction-navy",
      accent: "text-blue-200",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    },
    {
      id: 3,
      badge: "LONG-TERM PROTECTION",
      title: "Built To Last. 10-Year Structural Guarantee",
      description: "Comprehensive post-handover warranty and structural inspections giving complete peace of mind for decades.",
      bg: "bg-black",
      accent: "text-slate-300",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      hasShield: true,
    }
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const scrollProgress = -top;
      const totalScrollable = height - viewportHeight;
      
      if (scrollProgress < 0) {
        setActiveIndex(0);
      } else if (scrollProgress >= totalScrollable) {
        setActiveIndex(guarantees.length - 1);
      } else {
        const progressRatio = scrollProgress / totalScrollable;
        const index = Math.floor(progressRatio * guarantees.length);
        setActiveIndex(Math.min(index, guarantees.length - 1));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [guarantees.length]);

  return (
    <section ref={containerRef} className="relative bg-white border-y border-slate-200/60" style={{ height: `${guarantees.length * 100}vh` }}>
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Text List */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-12 py-12 lg:py-0 w-full z-30">
            
            <div className="mb-2 lg:mb-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-red-50 border border-red-100 mb-6 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-construction-red" />
                <span className="text-xs font-bold text-construction-red uppercase tracking-wider">Uncompromising Standards</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-black font-display uppercase tracking-tight leading-tight">
                Guarantees Every Project Deserves
              </h2>
            </div>

            <div className="relative pl-8 md:pl-10">
              {/* Vertical line track */}
              <div className="absolute left-1.5 md:left-2 top-2 bottom-6 w-[2px] bg-slate-100"></div>
              
              {/* Active line fill */}
              <div 
                className="absolute left-1.5 md:left-2 top-2 w-[2px] bg-construction-red transition-all duration-700 ease-out"
                style={{ height: `${(activeIndex / (guarantees.length - 1)) * 100}%` }}
              ></div>

              <div className="space-y-8 md:space-y-10">
                {guarantees.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  const isPast = idx < activeIndex;
                  
                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[38px] md:-left-[46px] top-1 w-4 h-4 rounded-full border-2 transition-all duration-500 bg-white z-10 ${
                        isActive ? 'border-construction-red shadow-[0_0_10px_rgba(217,35,42,0.4)] scale-125' : isPast ? 'border-construction-red' : 'border-slate-300'
                      }`}>
                         {isActive && <div className="absolute inset-1 rounded-full bg-construction-red"></div>}
                      </div>

                      <div className={`transition-all duration-500 ease-out ${
                        isActive ? "opacity-100 translate-x-2" : "opacity-40"
                      }`}>
                        <span className={`text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2 block transition-colors duration-500 ${isActive ? 'text-construction-red' : 'text-slate-400'}`}>
                          {item.badge}
                        </span>
                        <h3 className={`text-2xl md:text-3xl font-bold font-display tracking-tight mb-3 transition-colors duration-500 ${
                          isActive ? "text-black" : "text-slate-500"
                        }`}>
                          {item.title}
                        </h3>
                        
                        <div className={`grid transition-all duration-500 ease-in-out ${
                          isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}>
                          <div className="overflow-hidden">
                            <p className="text-base md:text-lg text-slate-600 font-light leading-relaxed pb-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Media Container */}
          <div className="hidden lg:block lg:col-span-7 relative h-[75vh]">
            {/* Architectural decorative frame */}
            <div className="absolute -inset-4 md:-inset-6 border border-slate-200/80 bg-slate-50/50 -z-10 translate-x-4 translate-y-4"></div>
            
            <div className="w-full h-full relative rounded-none overflow-hidden shadow-2xl bg-slate-900 z-20 border border-slate-200/50">
              {guarantees.map((item, idx) => (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${
                    idx === activeIndex 
                      ? "opacity-100 scale-100 z-10" 
                      : "opacity-0 scale-110 z-0"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
                  
                  {/* Shield for the 3rd card */}
                  {item.hasShield && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="relative w-48 h-56 flex items-center justify-center">
                        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_0_30px_rgba(217,35,42,0.8)]">
                          <path 
                            d="M50 5 L90 20 L90 60 C90 90 50 115 50 115 C50 115 10 90 10 60 L10 20 Z" 
                            fill="none" 
                            stroke="#D9232A" 
                            strokeWidth="2.5"
                            className="animate-[pulse_3s_ease-in-out_infinite]"
                          />
                          <path 
                            d="M50 8 L87 22 L87 60 C87 88 50 111 50 111 C50 111 13 88 13 60 L13 22 Z" 
                            fill="rgba(15,44,89,0.9)" 
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-5xl font-bold text-white font-display leading-none mb-1">10</span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">Years</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
        </div>
        
        {/* Mobile background image (absolute behind text) */}
        <div className="lg:hidden absolute inset-0 z-0">
           {guarantees.map((item, idx) => (
              <img
                key={item.id}
                src={item.image}
                alt={item.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  idx === activeIndex 
                    ? "opacity-10 scale-100 z-10" 
                    : "opacity-0 scale-105 z-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-white/90 z-20 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
