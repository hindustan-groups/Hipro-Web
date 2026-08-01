import Link from "next/link";
import { ArrowRight, Phone, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section id="section-cta" className="py-12 px-4 bg-surface relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* 3D floating card effect */}
        <div
          className="relative rounded-[2.5rem] overflow-hidden shadow-3d-xl border border-white/80"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 30%, #2563eb 60%, #7c3aed 100%)",
          }}
        >
          {/* Decorative inner elements */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-white/10" />

          {/* Grid lines */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}
          />

          <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Text */}
            <div className="text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-[12px] text-white/80 font-medium">Free Consultation Available</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-display leading-tight">
                Ready to Build
                <br />
                <span className="text-yellow-300">Something</span>{" "}
                <span className="text-blue-200">Great?</span>
              </h2>
              <p className="text-white/60 font-light text-base md:text-lg">
                Get a free estimate for your project. Our expert team is ready to bring your vision to life.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-700 font-bold px-7 py-4 rounded-2xl text-[15px] transition-all shadow-3d-lg hover:shadow-3d-xl group card-3d"
              >
                Get Free Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+15551234567"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-4 rounded-2xl text-[14px] transition-all border border-white/20 backdrop-blur-sm"
              >
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
