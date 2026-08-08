import WhyUs from "@/components/WhyUs";
import CTASection from "@/components/CTASection";

export const metadata = {
  title: "Why Hindustan Projects - Our Differentiators",
  description: "Discover why Hindustan Projects is the leading choice for landmark residential, commercial, and industrial infrastructure.",
};

export default function WhyUsPage() {
  return (
    <div className="pt-24 bg-slate-50 min-h-screen">
      <WhyUs />
      <CTASection />
    </div>
  );
}
