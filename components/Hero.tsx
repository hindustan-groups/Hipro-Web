"use client";

import Link from "next/link";
import { ArrowRight, Building2, HardHat, Award } from "lucide-react";

function RevealWord({ word, delay }: { word: string; delay: number }) {
  return (
    <span className="inline-block overflow-hidden leading-[1.15]" style={{ verticalAlign: "bottom" }}>
      <span className="inline-block animate-word-reveal" style={{ animationDelay: `${delay}s` }}>
        {word}
      </span>
    </span>
  );
}

export default function Hero() {
  return (
    <section id="section-hero" className="relative min-h-screen bg-surface overflow-hidden flex items-center justify-center pt-24 pb-16 px-4 perspective-1200 grid-bg">

      {/* Glow blobs */}
      <div className="blob w-[600px] h-[600px] bg-blue-400 top-[-100px] right-[-100px] animate-glow-pulse" />
      <div className="blob w-[500px] h-[500px] bg-red-300 bottom-[-80px] left-[-80px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="blob w-[300px] h-[300px] bg-purple-300 top-[40%] left-[20%] animate-glow-pulse" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-2 mb-8 shadow-3d-sm animate-fade-in"
          style={{ animationDelay: "0.05s" }}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[13px] text-gray-600 font-medium">Trusted Construction Since 1999</span>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">EST. 1999</span>
        </div>

        {/* Headline — word reveal */}
        <h1 className="text-5xl md:text-7xl lg:text-[86px] font-bold leading-[1.08] mb-6 font-display">
          <span className="block">
            <RevealWord word="Building" delay={0.15} />{" "}
            <RevealWord word="Your" delay={0.24} />
          </span>
          <span className="block">
            <span className="inline-block overflow-hidden leading-[1.15]" style={{ verticalAlign: "bottom" }}>
              <span className="inline-block text-gradient-red animate-word-reveal" style={{ animationDelay: "0.34s" }}>Vision</span>
            </span>
            {" "}
            <span className="inline-block overflow-hidden leading-[1.15]" style={{ verticalAlign: "bottom" }}>
              <span className="inline-block text-gray-900 animate-word-reveal" style={{ animationDelay: "0.43s" }}>Into</span>
            </span>
          </span>
          <span className="block">
            <span className="inline-block overflow-hidden leading-[1.15]" style={{ verticalAlign: "bottom" }}>
              <span className="inline-block text-gradient-blue animate-word-reveal" style={{ animationDelay: "0.53s" }}>Reality</span>
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-blur-in"
          style={{ animationDelay: "0.7s" }}
        >
          Professional construction services for residential, commercial, and industrial projects.
          Quality craftsmanship delivered on time, every time.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-7 py-3.5 rounded-full text-[15px] transition-all shadow-glow-blue hover:shadow-3d-lg animate-slide-left"
            style={{ animationDelay: "0.82s" }}
          >
            Start Your Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 glass-light text-gray-800 font-semibold px-7 py-3.5 rounded-full text-[15px] transition-all shadow-3d-sm hover:shadow-3d-md animate-slide-right"
            style={{ animationDelay: "0.82s" }}
          >
            View Portfolio
          </Link>
        </div>

        {/* 3D Floating cards above the hero image */}
        <div className="relative mb-6">
          {/* Floating card — left */}
          <div
            className="hidden lg:flex absolute -left-6 top-8 z-20 glass-light rounded-2xl p-4 shadow-3d-lg animate-float card-3d items-center gap-3"
            style={{ animationDelay: "0s" }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-gray-900">500+ Projects</p>
              <p className="text-[11px] text-gray-500">Successfully Completed</p>
            </div>
          </div>

          {/* Floating card — right */}
          <div
            className="hidden lg:flex absolute -right-6 top-12 z-20 glass-light rounded-2xl p-4 shadow-3d-lg animate-float card-3d items-center gap-3"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-gray-900">98% Satisfaction</p>
              <p className="text-[11px] text-gray-500">Client Rating</p>
            </div>
          </div>

          {/* Floating card — bottom right */}
          <div
            className="hidden lg:flex absolute -right-4 bottom-12 z-20 glass-light rounded-2xl p-4 shadow-3d-lg animate-float card-3d items-center gap-3"
            style={{ animationDelay: "3s" }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-gray-900">25+ Years</p>
              <p className="text-[11px] text-gray-500">Of Excellence</p>
            </div>
          </div>

          {/* Hero Image */}
          <div
            className="rounded-3xl overflow-hidden shadow-3d-xl border border-white/80 animate-blur-in card-3d"
            style={{ animationDelay: "0.9s" }}
          >
            <img
              src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600&q=85"
              alt="Construction site"
              className="w-full h-[500px] object-cover"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { number: "25+",  label: "Years Experience",  gradient: "from-red-500 to-orange-500" },
            { number: "500+", label: "Projects Done",     gradient: "from-blue-500 to-indigo-600" },
            { number: "200+", label: "Team Members",      gradient: "from-red-500 to-rose-600" },
            { number: "98%",  label: "Satisfaction Rate", gradient: "from-blue-600 to-purple-600" },
          ].map((s, i) => (
            <div
              key={i}
              className="py-6 px-4 glass-light rounded-2xl shadow-3d-sm card-3d animate-slide-up text-center"
              style={{ animationDelay: `${1.0 + i * 0.1}s` }}
            >
              <div className={`text-4xl font-bold mb-1 font-display bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                {s.number}
              </div>
              <div className="text-[13px] text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
