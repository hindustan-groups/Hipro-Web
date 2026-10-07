"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Quote,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Pause,
  Play,
  MapPin,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import type { HbsTestimonial } from "@/lib/types";

interface HbsHomeTestimonialsShowcaseProps {
  testimonials?: HbsTestimonial[];
}

const DEFAULT_TESTIMONIALS: HbsTestimonial[] = [
  {
    id: "def-1",
    name: "Rajesh Sharma",
    designation: "Home Owner",
    location: "Shastri Nagar, Bhilwara",
    service: "Terrace Waterproofing",
    content:
      "Hamari chhat se barish me kafi paani tapak raha tha. HiBUILD team ne thorough site inspection ki aur 5-layer elastomeric chemical coating ki. Pichle 2 saal se ek boond leakage nahi hai. Highly reliable and clean work!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "def-2",
    name: "Priya Mehta",
    designation: "Society Secretary",
    location: "Sukher, Udaipur",
    service: "Building Exterior Painting & Plaster",
    content:
      "4-storey apartment society ka exterior painting aur crack repair timely complete hua. Inke technicians trained aur background-verified the. Site safai ka pura dhyan rakha aur budget me best finish di.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "def-3",
    name: "Amit Verma",
    designation: "Showroom Owner",
    location: "Jaipur Road, Bhilwara",
    service: "Commercial Renovation & Tiling",
    content:
      "Commercial showroom renovation ke liye transparent written quote diya aur strictly commitment date par handover kiya. Quality of materials aur tiles finishing bilkul A-one hai. Zero hidden charges!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "def-4",
    name: "Sunil Rathi",
    designation: "Villa Owner",
    location: "Vigyan Nagar, Kota",
    service: "Structure Repair & Epoxy Grouting",
    content:
      "Purani building ke main columns me deep cracks the. Inke structural engineer ne proper load audit karke micro-concrete aur epoxy injection se repair kiya. 10 saal ka formal warranty card bhi provide kiya.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "def-5",
    name: "Vikas Jain",
    designation: "Plant Manager",
    location: "RIICO Industrial Area, Bhilwara",
    service: "Industrial Roof Heat & Waterproofing",
    content:
      "Large industrial warehouse roof leakage aur heat issue solve kar diya bina hamari factory production roke. High standard safety equipment use kiye aur after-service support bhi prompt hai. Very professional!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
  },
];

const AUTOPLAY_DURATION_MS = 5000;

export default function HbsHomeTestimonialsShowcase({
  testimonials = [],
}: HbsHomeTestimonialsShowcaseProps) {
  // Combine real DB testimonials with default Rajasthan customer stories
  const items = useMemo(() => {
    const combined = [...testimonials];
    for (const def of DEFAULT_TESTIMONIALS) {
      if (!combined.some((t) => t.name === def.name)) {
        combined.push(def);
      }
    }
    return combined.length > 0 ? combined : DEFAULT_TESTIMONIALS;
  }, [testimonials]);

  const count = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeAnim, setFadeAnim] = useState(true);
  const [progress, setProgress] = useState(0);

  const touchStartX = useRef<number | null>(null);

  // Auto-play timer + smooth progress line
  useEffect(() => {
    if (isPaused || count <= 1) return;

    const stepMs = 50;
    const progressInc = (stepMs / AUTOPLAY_DURATION_MS) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Trigger next slide with micro-fade transition
          setFadeAnim(false);
          setTimeout(() => {
            setActiveIndex((cur) => (cur + 1) % count);
            setFadeAnim(true);
          }, 150);
          return 0;
        }
        return prev + progressInc;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, count]);

  const goToSlide = useCallback((newIdx: number) => {
    setFadeAnim(false);
    setProgress(0);
    setTimeout(() => {
      setActiveIndex(newIdx);
      setFadeAnim(true);
    }, 150);
  }, []);

  const handlePrev = useCallback(() => {
    const prevIdx = (activeIndex - 1 + count) % count;
    goToSlide(prevIdx);
  }, [activeIndex, count, goToSlide]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % count;
    goToSlide(nextIdx);
  }, [activeIndex, count, goToSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const currentItem = items[activeIndex] || items[0];

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-12 sm:py-16 md:py-20 bg-slate-50/70 border-b border-slate-200/80 relative overflow-hidden"
    >
      {/* Decorative architectural background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
        {/* ── HEADER: Title + Google Trust Pill ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-center sm:text-left">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 justify-center sm:justify-start">
              <span className="w-4 h-0.75 bg-red-600 rounded-full" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-red-600">
                CLIENT TESTIMONIALS
              </span>
            </div>
            <h2
              id="testimonials-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 font-display"
            >
              What Our Clients Say
            </h2>
          </div>

          {/* Google Rating Badge */}
          <div className="inline-flex items-center justify-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-800 self-center sm:self-auto">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="font-extrabold text-slate-900">4.9 / 5</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">100+ Google Reviews</span>
          </div>
        </div>

        {/* ── SINGLE ULTRA-MODERN FEATURED TESTIMONIAL BOX ── */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-300"
        >
          {/* Top Auto-Play Slim Progress Line */}
          <div className="w-full h-1 bg-slate-100 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-[#0D2D5E] transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Background Watermark Quote */}
          <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-6 pointer-events-none opacity-[0.04]">
            <Quote className="w-28 h-28 sm:w-44 sm:h-44 text-[#0D2D5E]" />
          </div>

          {/* Inner Content Area */}
          <div className="p-4 sm:p-7 md:p-9 space-y-4 sm:space-y-6 relative z-10">
            {/* Top Bar inside Box: Quote Icon + Rating Stars + Counter */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#0D2D5E]/10 text-[#0D2D5E] flex items-center justify-center shrink-0">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5 fill-[#0D2D5E]/20" />
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-amber-400">
                  {Array.from({ length: currentItem.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[11px] sm:text-xs font-black text-slate-800 ml-1">5.0</span>
                </div>
              </div>

              {/* Status & Counter */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Main Testimonial Quote Text with Smooth Fade Transition */}
            <div
              className={`transition-all duration-200 ease-out min-h-[68px] sm:min-h-[96px] flex items-center ${
                fadeAnim ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              }`}
            >
              <p className="text-xs sm:text-base md:text-lg font-medium text-slate-800 leading-relaxed sm:leading-relaxed">
                &ldquo;{currentItem.content}&rdquo;
              </p>
            </div>

            {/* Bottom Row: Client Profile on Left + Navigation Controls on Right */}
            <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {/* Client Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-[#0D2D5E]/20 overflow-hidden relative shrink-0 shadow-xs">
                  {currentItem.avatar || currentItem.image ? (
                    <Image
                      src={currentItem.avatar || currentItem.image!}
                      alt={currentItem.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0D2D5E] text-white flex items-center justify-center font-bold text-xs sm:text-sm">
                      {currentItem.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-base font-black text-slate-900 tracking-tight truncate">
                    {currentItem.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 text-[11px] sm:text-xs text-slate-500 font-medium">
                    <span className="truncate">{currentItem.designation || "Property Owner"}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-0.5 text-slate-600 truncate">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      {currentItem.location}
                    </span>
                  </div>
                  {currentItem.service && (
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#0D2D5E] bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200/50">
                      <Wrench className="w-2.5 h-2.5 text-[#0D2D5E]" />
                      <span className="truncate">Work: {currentItem.service}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Controls: Prev / Pause / Next Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Testimonial"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-[#0D2D5E] hover:text-white active:scale-95 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  title={isPaused ? "Resume auto-change" : "Pause auto-change"}
                  aria-label={isPaused ? "Resume" : "Pause"}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-xs"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-700 text-slate-700 ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Testimonial"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-[#0D2D5E] hover:text-white active:scale-95 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE CLIENT CHIPS BAR (DESKTOP QUICK-SWITCH) & DOTS (MOBILE) ── */}
        <div className="space-y-3">
          {/* Desktop 1-Click Client Chips */}
          <div className="hidden sm:flex items-center justify-center gap-2 flex-wrap">
            {items.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#0D2D5E] text-white shadow-sm ring-2 ring-[#0D2D5E]/20 scale-105"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-red-500 animate-pulse" : "bg-slate-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Clean Dots Indicator */}
          <div className="flex sm:hidden items-center justify-center gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? "w-6 bg-[#0D2D5E]" : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
