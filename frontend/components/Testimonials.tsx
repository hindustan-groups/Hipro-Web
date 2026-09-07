"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

// Verified client testimonials; empty array by default so unverified/fake reviews are never rendered
const defaultTestimonials: Testimonial[] = [];

export default function Testimonials({ testimonials = [] }: { testimonials?: Testimonial[] }) {
  // Filter out developer test reviews and unapproved records
  const validTestimonials = (testimonials || []).filter(
    (t) =>
      t.approved === true &&
      !/^(avinash|piyush|test)/i.test(t.name?.trim() || "") &&
      !/services of compan/i.test(t.text || "")
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const totalCount = validTestimonials.length;

  // Auto-advance
  useEffect(() => {
    if (totalCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalCount);
    }, 8000);
    return () => clearInterval(timer);
  }, [totalCount]);

  const hasTestimonials = validTestimonials.length > 0;

  return (
    <section id="section-testimonials" className="py-16 bg-slate-800 relative overflow-hidden border-t border-slate-700">
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
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white font-display tracking-tight uppercase">
            What Our <span className="font-serif italic font-normal text-construction-red normal-case">Partners</span> Say
          </h2>
        </div>

        {hasTestimonials ? (
          <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
            <div className="relative w-full max-w-lg h-[320px] md:h-[280px]">
              {validTestimonials.map((t, i) => {
                let positionClass = "translate-x-0 scale-75 opacity-0 z-0 pointer-events-none";
                
                if (i === currentIndex) {
                  positionClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-2xl shadow-black/50";
                } else if (validTestimonials.length > 1) {
                  const nextIndex = (currentIndex + 1) % validTestimonials.length;
                  const prevIndex = (currentIndex - 1 + validTestimonials.length) % validTestimonials.length;
                  
                  if (i === nextIndex) {
                    positionClass = "translate-x-[40%] md:translate-x-[60%] lg:translate-x-[75%] scale-90 opacity-30 z-20 cursor-pointer hover:opacity-50";
                  } else if (i === prevIndex && validTestimonials.length > 2) {
                    positionClass = "-translate-x-[40%] md:-translate-x-[60%] lg:-translate-x-[75%] scale-90 opacity-30 z-20 cursor-pointer hover:opacity-50";
                  }
                }

                return (
                  <div 
                    key={t.id || i}
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
                          {t.image ? (
                            <div className="relative shrink-0">
                              <Image 
                                src={t.image} 
                                alt={t.name} 
                                width={48} 
                                height={48} 
                                unoptimized={!isOptimizableImage(t.image)}
                                className="w-12 h-12 rounded-none object-cover border border-white/20 grayscale group-hover:grayscale-0 transition-all duration-500" 
                              />
                            </div>
                          ) : null}
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
          </div>
        ) : (
          /* Clean professional empty state */
          <div className="max-w-xl mx-auto text-center py-10 px-6 bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-none bg-white/5 border border-white/10 mb-4 text-slate-400">
              <Star className="w-5 h-5 text-amber-400/80" />
            </div>
            <h3 className="text-base font-bold text-white font-display uppercase tracking-wider mb-2">
              Client Reviews In Verification
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Our verified client feedback portfolio is currently being curated with our latest project handovers across Rajasthan. Testimonials will be published soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
