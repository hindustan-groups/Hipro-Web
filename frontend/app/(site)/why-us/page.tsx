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
      <WhyUs />
      <CTASection />
    </div>
  );
}
