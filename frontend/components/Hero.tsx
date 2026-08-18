"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

import type { HeroSlide, Stats as StatType } from "@/lib/types";

interface HeroProps {
  initialSlides?: HeroSlide[];
  initialStats?: StatType[];
}

const fallbackHeroImages = [
  "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=2000&q=85",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85",
  "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=85"
];

const defaultSlides: HeroSlide[] = [
  {
    id: "default-1",
    title: "ENGINEERING LANDMARKS. DELIVERING EXCELLENCE.",
    subtitle: "Turnkey Civil Engineering, Structural Design, and Modern Construction Infrastructure across India.",
    tagline: "India's Premier Construction & Infrastructure Firm",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=2000&q=85",
    order: 1,
    active: true
  },
  {
    id: "default-2",
    title: "ARCHITECTURAL MASTERY & PRECISION EXECUTION",
    subtitle: "Creating state-of-the-art commercial complexes, residential townships, and industrial facilities.",
    tagline: "Delivering Visionary Infrastructure",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85",
    order: 2,
    active: true
  },
  {
    id: "default-3",
    title: "SUSTAINABLE INFRASTRUCTURE FOR THE FUTURE",
    subtitle: "Pioneering smart construction methodologies, eco-friendly concrete, and rapid project deliveries.",
    tagline: "Building Tomorrow, Today",
    image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=85",
    order: 3,
    active: true
  }
];

const defaultStats: StatType[] = [
  { id: "1", label: "Projects Completed", value: "500+", icon: "Building", order: 1 },
  { id: "2", label: "Expert Engineers", value: "200+", icon: "Users", order: 2 },
  { id: "3", label: "Years Experience", value: "25+", icon: "History", order: 3 },
  { id: "4", label: "Client Satisfaction", value: "99%", icon: "Award", order: 4 }
];

function formatHeroTitle(title: string) {
  if (!title) return "";
  if (title.includes("<span")) {
    return <span dangerouslySetInnerHTML={{ __html: title }} />;
  }
  const words = title.split(" ");
  if (words.length <= 2) {
    return title;
  }
  const midIdx = Math.floor(words.length / 2);
  return (
    <>
      {words.slice(0, midIdx).join(" ")}{" "}
      <span className="font-serif italic font-normal text-construction-red normal-case drop-shadow-lg">
        {words[midIdx]}
      </span>{" "}
      {words.slice(midIdx + 1).join(" ")}
    </>
  );
}

export default function Hero({ initialSlides = [], initialStats = [] }: HeroProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : defaultSlides
  );
  const [stats, setStats] = useState<StatType[]>(
    initialStats && initialStats.length > 0 ? initialStats : defaultStats
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides);
    }
  }, [initialSlides]);

  useEffect(() => {
    if (initialStats && initialStats.length > 0) {
      setStats(initialStats);
    }
  }, [initialStats]);

  useEffect(() => {
    const fetchSlides = async () => {
      if (initialSlides && initialSlides.length > 0) return;
      try {
        const res = await fetch("/api/hero");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSlides(json.data.filter((s: HeroSlide) => s.active !== false));
        }
      } catch (err) {
        console.error("Failed to load hero slides:", err);
      }
    };
    
    const fetchStats = async () => {
      if (initialStats && initialStats.length > 0) return;
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    fetchSlides();
    fetchStats();
  }, [initialSlides, initialStats]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlideList = slides.length > 0 ? slides : defaultSlides;
  const activeSlide = activeSlideList[currentSlide] || activeSlideList[0] || defaultSlides[0];

  return (
    <section id="section-hero" className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      
      {/* Background Images Slider */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        {activeSlideList.map((slide, idx) => {
          const validImg = slide.image && slide.image.trim() !== "" 
            ? slide.image 
            : fallbackHeroImages[idx % fallbackHeroImages.length];

          return (
            <div 
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={validImg}
                alt={slide.title || "Construction Project"}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = fallbackHeroImages[idx % fallbackHeroImages.length];
                }}
                className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] ${
                  idx === currentSlide ? "scale-105" : "scale-100"
                }`}
              />
              {/* Cinematic Gradient Overlay (Text readable while image stays clearly visible) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
            </div>
          );
        })}
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
                {activeSlide.tagline}
              </span>
            </div>

            {/* Headline */}
            <div className="min-h-[160px] md:min-h-[200px]">
              <h1 
                key={`title-${currentSlide}`} 
                className="text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-bold text-white leading-[1.05] mb-6 font-display tracking-tighter animate-fade-up drop-shadow-2xl"
              >
                {formatHeroTitle(activeSlide.title)}
              </h1>
              
              <p 
                key={`desc-${currentSlide}`}
                className="text-lg md:text-xl text-slate-200 max-w-2xl font-light leading-relaxed animate-fade-up border-l-2 border-construction-red pl-6"
                style={{ animationDelay: "0.2s" }}
              >
                {activeSlide.subtitle}
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
