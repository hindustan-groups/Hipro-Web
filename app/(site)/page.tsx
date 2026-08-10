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
import type { Service, Project, Stats as StatType, Testimonial, Settings, BlogPost, Guarantee } from "@/lib/types";

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

  const blogs = await findAll<BlogPost>("blogs");
  const blogsData = blogs
    .filter(b => b.active !== false)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const guarantees = await findAll<Guarantee>("guarantees");
  const guaranteesData = guarantees
    .filter(g => g.active !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  return (
    <>
      <Hero />
      <AnimateIn><Services services={servicesData} /></AnimateIn>
      <AnimateIn delay={100}><Guarantees guarantees={guaranteesData} /></AnimateIn>
      <AnimateIn delay={200}><CostEstimator /></AnimateIn>
      <AnimateIn><Projects projects={projectsData} title={pageContent.projectsHeader} /></AnimateIn>
      <AnimateIn><Testimonials testimonials={testimonialsData} /></AnimateIn>
      <AnimateIn><Blogs posts={blogsData} /></AnimateIn>
      <AnimateIn><CTASection /></AnimateIn>
    </>
  );
}
