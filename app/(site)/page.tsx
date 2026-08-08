import Hero from "@/components/Hero";
import Guarantees from "@/components/Guarantees";
import CostEstimator from "@/components/CostEstimator";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Blogs from "@/components/Blogs";
import AnimateIn from "@/components/AnimateIn";
import { findAll } from "@/lib/db";
import type { Service, Project, Stats as StatType, Testimonial, Settings } from "@/lib/types";

export default async function Home() {
  const settingsData = await findAll<Settings>("settings");
  const settings = settingsData[0] || {};
  
  let pageContent: any = {};
  try {
    if (settings.pageContent) pageContent = JSON.parse(settings.pageContent);
  } catch { /* silent */ }

  const services = await findAll<Service>("services");
  const servicesData = services.filter(s => s.active !== false).sort((a, b) => (a.order || 99) - (b.order || 99));
  
  const projects = await findAll<Project>("projects");
  const projectsData = projects.filter(p => p.status !== "archived");
  
  const testimonials = await findAll<Testimonial>("testimonials");
  const testimonialsData = testimonials.filter(t => t.approved !== false);

  return (
    <>
      <Hero />
      <AnimateIn><Services services={servicesData} /></AnimateIn>
      <AnimateIn delay={100}><Guarantees /></AnimateIn>
      <AnimateIn delay={200}><CostEstimator /></AnimateIn>
      <AnimateIn><Projects projects={projectsData} title={pageContent.projectsHeader} /></AnimateIn>
      <AnimateIn><Testimonials testimonials={testimonialsData} /></AnimateIn>
      <AnimateIn><Blogs /></AnimateIn>
      <AnimateIn><CTASection /></AnimateIn>
    </>
  );
}
