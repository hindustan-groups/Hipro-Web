import Hero from "@/components/Hero";
import Guarantees from "@/components/Guarantees";
import CostEstimator from "@/components/CostEstimator";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <Guarantees />
      <CostEstimator />
      <Stats />
      <Services />
      <Projects />
      <WhyUs />
      <Testimonials />
      <CTASection />
    </>
  );
}
