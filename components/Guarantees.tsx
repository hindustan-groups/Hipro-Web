"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import AnimateIn from "@/components/AnimateIn";

export default function Guarantees() {
  const [guarantees, setGuarantees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGuarantees = async () => {
      try {
        const res = await fetch("/api/guarantees");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setGuarantees(json.data);
        } else {
          // Fallback to defaults
          setGuarantees([
            {
              id: "1", badge: "EXPERT ASSURANCE", title: "In-House Technical Specialists",
              description: "Dedicated cross-functional team – Chartered Architect, Senior Site Manager, Lead Engineer, and Quality Control Inspector.",
              bg: "bg-construction-red", accent: "text-red-100", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80"
            },
            {
              id: "2", badge: "VETTED QUALITY", title: "Top-Tier Certified Contractors",
              description: "Every trade contractor undergoes a rigorous 6-stage auditing process ensuring compliance, safety, and craftsmanship.",
              bg: "bg-construction-navy", accent: "text-blue-200", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
            },
            {
              id: "3", badge: "LONG-TERM PROTECTION", title: "Built To Last. 10-Year Structural Guarantee",
              description: "Comprehensive post-handover warranty and structural inspections giving complete peace of mind for decades.",
              bg: "bg-black", accent: "text-slate-300", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", hasShield: true
            }
          ]);
        }
      } catch {
        // Fallback handled
      }
      setLoading(false);
    };
    fetchGuarantees();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // We want the progress to start filling when the top of the timeline is in the middle of the screen
      const startTrigger = windowHeight / 2;
      
      const scrollAmount = startTrigger - rect.top;
      const totalDistance = rect.height;
      
      let percentage = (scrollAmount / totalDistance) * 100;
      
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      
      setProgress(percentage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initialize
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return null;

  return (
    <section className="py-24 bg-white border-y border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <AnimateIn>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-red-50 border border-red-100 mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-construction-red" />
              <span className="text-[11px] font-bold text-construction-red uppercase tracking-wider">Uncompromising Standards</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-black font-display uppercase tracking-tight leading-tight">
              Guarantees Every Project Deserves
            </h2>
          </AnimateIn>
        </div>

        {/* Timeline Layout */}
        <div className="relative max-w-5xl mx-auto pb-12" ref={timelineRef}>
          
          {/* Background Track Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-100 md:-translate-x-[1px]"></div>
          
          {/* Active Fill Line */}
          <div 
            className="absolute left-6 md:left-1/2 top-0 w-[2px] bg-construction-red md:-translate-x-[1px] transition-all duration-75 ease-linear"
            style={{ height: `${progress}%` }}
          ></div>

          <div className="space-y-32">
            {guarantees.map((item, idx) => {
              const isEven = idx % 2 === 0;
              // Only show the item when the red line reaches its point (approximately 0%, 33%, 66%)
              // Adding -2 to the threshold so it appears right as the line touches the dot
              const showThreshold = idx * (100 / guarantees.length) - 2; 
              const isVisible = progress >= showThreshold;

              return (
                <div 
                  key={item.id} 
                  className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 transition-all duration-1000 ease-out ${isEven ? 'md:flex-row-reverse' : ''} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                >
                  
                  {/* Timeline Node - turns red when progress reaches it */}
                  <div 
                    className={`absolute left-6 md:left-1/2 top-8 md:top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white md:-translate-x-1/2 z-10 transition-colors duration-500 ${
                      isVisible ? 'bg-construction-red shadow-[0_0_0_4px_rgba(217,35,42,0.1)]' : 'bg-slate-300'
                    }`} 
                  />

                  {/* Content (Text) */}
                  <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:text-left md:pr-16' : 'md:text-right md:pl-16'}`}>
                    <span className="inline-block bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-4 shadow-sm border border-slate-800">
                      {item.badge}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 font-display tracking-tight mb-4">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>

                  {/* Media (Image) */}
                  <div className="w-full md:w-1/2 pl-16 md:pl-0 relative">
                    <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden border border-slate-200 shadow-xl bg-slate-50">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      
                      {/* Shield for the 3rd item */}
                      {item.hasShield && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <div className="relative w-32 h-40 flex items-center justify-center">
                            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_0_15px_rgba(217,35,42,0.8)]">
                              <path 
                                d="M50 5 L90 20 L90 60 C90 90 50 115 50 115 C50 115 10 90 10 60 L10 20 Z" 
                                fill="rgba(15,44,89,0.9)" 
                                stroke="#D9232A" 
                                strokeWidth="3"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="text-4xl font-bold text-white font-display leading-none mb-0.5">10</span>
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-200">Years</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
