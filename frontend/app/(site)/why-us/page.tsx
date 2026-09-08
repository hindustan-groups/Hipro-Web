import type { Metadata } from "next";
import WhyUs from "@/components/WhyUs";
import CTASection from "@/components/CTASection";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Why Us | Engineering Excellence & Quality Execution",
  description: "Discover why clients trust Hindustan Projects (HiPRO) for turnkey civil engineering, vetted trade supervision, and quality-first construction in Rajasthan and beyond.",
  alternates: {
    canonical: "/why-us",
  },
};

export default function WhyUsPage() {
  return (
    <div className="pt-24 bg-slate-50 min-h-screen">
      <WhyUs isH1={true} />
      
      {/* Contextual Links */}
      <section className="py-8 bg-white border-b border-slate-200/80 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-600">
            Want to see our structural standards in practice or calculate build costs?
          </p>
          <div className="flex items-center gap-3">
            <a
              href="/projects"
              className="text-xs font-bold uppercase tracking-wider text-construction-navy hover:text-construction-red transition-colors border border-slate-300 px-4 py-2.5 bg-slate-50 hover:bg-slate-100"
            >
              View Executed Projects →
            </a>
            <a
              href="/cost-estimator"
              className="text-xs font-bold uppercase tracking-wider text-white bg-construction-navy hover:bg-blue-900 transition-colors px-4 py-2.5"
            >
              Estimate Build Cost →
            </a>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
