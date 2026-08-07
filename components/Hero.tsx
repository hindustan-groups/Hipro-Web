"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

import type { HeroSlide } from "@/lib/types";

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
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
    fetchSlides();
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
          <img
            key={slide.id || idx}
            src={slide.image}
            alt={`Construction site ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Blueprint Vector Grid Overlay Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
        {/* Gradient Overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-full pt-32 pb-24">
        <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 xl:col-span-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-none px-4 py-2 mb-8 backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-none bg-white animate-pulse" />
              <span className="text-sm text-white font-bold uppercase tracking-wider">
                {slides[currentSlide].tagline}
              </span>
            </div>

            {/* Headline */}
            <div className="min-h-[160px] md:min-h-[200px]">
              <h1 
                key={`title-${currentSlide}`} 
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6 font-display tracking-tight animate-fade-up"
              >
                {slides[currentSlide].title}
              </h1>
              
              <p 
                key={`desc-${currentSlide}`}
                className="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed animate-fade-up"
                style={{ animationDelay: "0.2s" }}
              >
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-3 bg-construction-navy btn-sweep text-white font-bold px-8 py-4 rounded-none text-[15px] transition-all uppercase tracking-wider shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white hover:text-black text-white font-bold px-8 py-4 rounded-none text-[15px] transition-all uppercase tracking-wider backdrop-blur-sm border border-white/20"
              >
                View Portfolio
              </Link>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="bg-black/60 backdrop-blur-xl p-8 border border-white/10 shadow-2xl relative">
              {/* Subtle top accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-construction-red" />
              
              <h3 className="text-2xl text-white font-display font-bold mb-2 tracking-tight uppercase">Request A Quote</h3>
              <p className="text-slate-400 text-sm mb-6 font-light">Fill out the form below to get a free estimate.</p>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Quote requested!"); }}>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-construction-red focus:bg-white/10 transition-colors rounded-none placeholder:text-slate-500" 
                  required
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-construction-red focus:bg-white/10 transition-colors rounded-none placeholder:text-slate-500" 
                  required
                />
                <select 
                  className="w-full bg-white/5 border border-white/10 text-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-construction-red focus:bg-white/10 transition-colors rounded-none"
                  required
                >
                  <option value="" className="text-black bg-white">Select a Service</option>
                  <option value="architecture" className="text-black bg-white">Architecture Planning</option>
                  <option value="construction" className="text-black bg-white">Construction Services</option>
                  <option value="interior" className="text-black bg-white">Interior & Exterior</option>
                  <option value="other" className="text-black bg-white">Other Inquiry</option>
                </select>
                <button 
                  type="submit" 
                  className="w-full bg-construction-red hover:bg-red-700 text-white font-bold py-4 px-4 transition-all uppercase tracking-wider text-sm mt-2 shadow-lg shadow-red-900/20"
                >
                  Get Quote Now
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-12 h-1.5 transition-all rounded-none ${
              idx === currentSlide ? "bg-white shadow-sm shadow-white/50" : "bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 hidden lg:block bg-black/40 border-t border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 divide-x divide-slate-800">
            {[
              { number: "25+",  label: "Years Experience" },
              { number: "500+", label: "Projects Done" },
              { number: "200+", label: "Team Members" },
              { number: "98%",  label: "Satisfaction Rate" },
            ].map((s, i) => (
              <div key={i} className="py-6 px-8 text-center animate-fade-in" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                <div className="text-3xl font-bold text-white font-display mb-1">{s.number}</div>
                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
