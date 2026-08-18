import Link from "next/link";
import { ArrowRight, Phone, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section id="section-cta" className="py-20 px-4 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative rounded-none overflow-hidden shadow-xl shadow-slate-900/5 border border-slate-200/80 bg-slate-50"
        >
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)",
              backgroundSize: "24px 24px"
            }}
          />

          <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Text */}
            <div className="text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-none px-4 py-1.5 mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-xs text-white font-bold uppercase tracking-wider">Free Engineering Consultation</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-black mb-4 font-display uppercase tracking-tight leading-tight">
                Ready To Build <span className="font-serif italic font-normal text-construction-red normal-case">Your Next Milestone?</span>
              </h2>
              <p className="text-slate-600 font-light text-base md:text-lg leading-relaxed">
                Connect with our senior technical advisors for a complimentary feasibility analysis and project estimate.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-4 shrink-0 w-full md:w-auto">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-3 bg-construction-navy btn-sweep text-white font-bold px-8 py-4 rounded-none text-sm uppercase tracking-wider shadow-lg shadow-blue-900/30"
              >
                Get Free Estimate
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-8 py-4 rounded-none text-sm transition-all border border-slate-300 shadow-sm uppercase tracking-wider"
              >
                <Phone className="w-4 h-4 text-construction-red" />
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
