"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/lib/types";

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (!testimonials || testimonials.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[currentIndex];

  return (
    <section id="section-testimonials" className="py-8 bg-slate-800 relative overflow-hidden border-t border-slate-700">
      {/* Background Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-none px-4 py-1 mb-2 shadow-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-none bg-white animate-pulse" />
            <span className="text-[10px] md:text-[11px] text-white font-bold uppercase tracking-widest">Client Stories</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white font-display tracking-tight uppercase">What Our Partners Say</h2>
        </div>

        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
          <div className="relative w-full max-w-lg h-[320px] md:h-[280px]">
            {testimonials.map((t, i) => {
              let positionClass = "translate-x-0 scale-75 opacity-0 z-0 pointer-events-none";
              
              if (i === currentIndex) {
                positionClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-2xl shadow-black/50";
              } else if (testimonials.length > 1) {
                const nextIndex = (currentIndex + 1) % testimonials.length;
                const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                
                if (i === nextIndex) {
                  positionClass = "translate-x-[40%] md:translate-x-[60%] lg:translate-x-[75%] scale-90 opacity-30 z-20 cursor-pointer hover:opacity-50";
                } else if (i === prevIndex && testimonials.length > 2) {
                  positionClass = "-translate-x-[40%] md:-translate-x-[60%] lg:-translate-x-[75%] scale-90 opacity-30 z-20 cursor-pointer hover:opacity-50";
                }
              }

              return (
                <div 
                  key={i}
                  onClick={() => i !== currentIndex && setCurrentIndex(i)}
                  className={`absolute top-0 left-0 w-full transition-all duration-700 ease-out ${positionClass}`}
                >
                  <div className="relative p-6 md:p-8 rounded-none bg-white/[0.05] border border-white/20 backdrop-blur-md overflow-hidden group flex flex-col justify-center h-full">
                    {/* Massive watermark quote */}
                    <div className="absolute -top-6 -left-2 text-[120px] leading-none font-serif text-white/5 pointer-events-none select-none transition-all duration-500 group-hover:text-white/10">
                      &ldquo;
                    </div>

                    <div className="relative z-10">
                      <div className="flex gap-1 mb-4">
                        {[...Array(t.rating || 5)].map((_, si) => (
                          <Star key={si} className="w-4 h-4 fill-amber-500 text-amber-500 opacity-90" />
                        ))}
                      </div>

                      <p className="text-sm md:text-base text-slate-200 leading-relaxed font-light mb-6 italic max-w-2xl line-clamp-4">
                        &quot;{t.text}&quot;
                      </p>

                      <div className="flex items-center gap-4 border-t border-white/10 pt-4 mt-auto">
                        <div className="relative shrink-0">
                          <img src={t.image} alt={t.name} className="w-12 h-12 rounded-none object-cover border border-white/20 grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white font-display uppercase tracking-wider">{t.name}</p>
                          <p className="text-[10px] font-semibold text-construction-navy mt-1 bg-white px-1.5 py-0.5 inline-block uppercase tracking-wider">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          
        </div>
      </div>
    </section>
  );
}
