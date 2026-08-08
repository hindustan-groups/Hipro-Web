"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

import type { HeroSlide, Stats as StatType } from "@/lib/types";

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [stats, setStats] = useState<StatType[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch("/api/hero");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setSlides(json.data.filter((s: HeroSlide) => s.active !== false));
        }
      } catch (err) {
        console.error("Failed to load hero slides:", err);
      }
    };
    
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    fetchSlides();
    fetchStats();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section id="section-hero" className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      
      {/* Background Images Slider */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div 
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ${
                idx === currentSlide ? "scale-105" : "scale-100"
              }`}
            />
            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>
        ))}
        {/* Blueprint Vector Grid Overlay Pattern */}
        <div 
          className="absolute inset-0 opacity-20 z-10 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-full pt-32 pb-24">
        <div className="w-full grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 xl:col-span-8 animate-fade-in relative">
            {/* Decorative line */}
            <div className="absolute -left-8 top-12 bottom-12 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
            
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 backdrop-blur-md shadow-lg shadow-black/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-construction-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-construction-red"></span>
              </span>
              <span className="text-[13px] text-white font-bold uppercase tracking-[0.2em]">
                {slides[currentSlide].tagline}
              </span>
            </div>

            {/* Headline */}
            <div className="min-h-[160px] md:min-h-[200px]">
              <h1 
                key={`title-${currentSlide}`} 
                className="text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-bold text-white leading-[1.05] mb-6 font-display tracking-tighter animate-fade-up drop-shadow-2xl"
              >
                {slides[currentSlide].title}
              </h1>
              
              <p 
                key={`desc-${currentSlide}`}
                className="text-lg md:text-xl text-slate-200 max-w-2xl font-light leading-relaxed animate-fade-up border-l-2 border-construction-red pl-6"
                style={{ animationDelay: "0.2s" }}
              >
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-5 mt-10 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Link
                href="/contact"
                className="group relative inline-flex items-center justify-center gap-3 bg-construction-red text-white font-bold px-8 py-4 rounded-none text-[15px] transition-all uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] hover:shadow-[0_0_60px_-15px_rgba(220,38,38,0.7)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative">Start Your Project</span>
                <ArrowRight className="w-5 h-5 relative group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link
                href="/projects"
                className="group inline-flex items-center justify-center gap-2 bg-transparent border border-white/30 hover:border-white hover:bg-white text-white hover:text-black font-bold px-8 py-4 rounded-none text-[15px] transition-all duration-300 uppercase tracking-widest backdrop-blur-sm"
              >
                View Portfolio
              </Link>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 animate-fade-in relative z-20" style={{ animationDelay: "0.5s" }}>
            <div className="bg-black/40 backdrop-blur-2xl p-10 border border-white/10 shadow-2xl relative rounded-3xl overflow-hidden group">
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <h3 className="text-3xl text-white font-display font-bold mb-3 tracking-tight">Request A Quote</h3>
              <p className="text-slate-400 text-[15px] mb-8 font-light leading-relaxed">Fill out the form below to get a free estimate.</p>
              
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Quote requested!"); }}>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full bg-white/5 border border-white/10 text-white px-5 py-3.5 text-[15px] focus:outline-none focus:border-construction-red focus:bg-white/10 transition-colors rounded-xl placeholder:text-slate-500" 
                    required
                  />
                </div>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full bg-white/5 border border-white/10 text-white px-5 py-3.5 text-[15px] focus:outline-none focus:border-construction-red focus:bg-white/10 transition-colors rounded-xl placeholder:text-slate-500" 
                    required
                  />
                </div>
                <div className="relative">
                  <select 
                    className="w-full bg-white/5 border border-white/10 text-slate-300 px-5 py-3.5 text-[15px] focus:outline-none focus:border-construction-red focus:bg-white/10 transition-colors rounded-xl appearance-none"
                    required
                  >
                    <option value="" className="text-black bg-white">Select a Service</option>
                    <option value="architecture" className="text-black bg-white">Architecture Planning</option>
                    <option value="construction" className="text-black bg-white">Construction Services</option>
                    <option value="interior" className="text-black bg-white">Interior & Exterior</option>
                    <option value="other" className="text-black bg-white">Other Inquiry</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-white hover:bg-slate-100 text-black font-bold py-4 px-4 transition-all uppercase tracking-widest text-[14px] mt-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Get Quote Now
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-32 lg:bottom-40 left-0 right-0 z-30 flex justify-center gap-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`group relative flex items-center justify-center transition-all ${
              idx === currentSlide ? "w-16" : "w-8 hover:w-12"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          >
            <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
              idx === currentSlide ? "bg-construction-red" : "bg-white/30 group-hover:bg-white/60"
            }`} />
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 hidden lg:block bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8 divide-x divide-white/10">
            {stats.slice(0, 4).map((s, i) => (
              <div key={s.id || i} className="pl-8 first:pl-0 text-left animate-fade-in" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                <div className="text-4xl font-bold text-white font-display mb-2 tracking-tight">{s.value}</div>
                <div className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
