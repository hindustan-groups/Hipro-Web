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
import type { Service, Project, Stats as StatType, Testimonial, Settings, BlogPost, Guarantee, HeroSlide } from "@/lib/types";

export default async function Home() {
  const [
    settingsData,
    slides,
    stats,
    services,
    projects,
    testimonials,
    blogs,
    guarantees,
  ] = await Promise.all([
    findAll<Settings>("settings"),
    findAll<HeroSlide>("hero"),
    findAll<StatType>("stats"),
    findAll<Service>("services"),
    findAll<Project>("projects"),
    findAll<Testimonial>("testimonials"),
    findAll<BlogPost>("blogs"),
    findAll<Guarantee>("guarantees"),
  ]);

  const settings = settingsData[0] || {};
  const slidedata = slides.filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  const statsdata = stats.sort((a, b) => (a.order || 0) - (b.order || 0));
  let pageContent: any = {};
  try {
    if (settings.pageContent) pageContent = JSON.parse(settings.pageContent);
  } catch { /* silent */ }

  const servicesData = services.filter(s => s.active !== false).sort((a, b) => (a.order || 99) - (b.order || 99));
  const projectsData = projects.filter(p => p.status !== "archived");
  const testimonialsData = testimonials.filter(t => t.approved !== false);
  const blogsData = blogs
    .filter(b => b.active !== false)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const guaranteesData = guarantees
    .filter(g => g.active !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  return (
    <>
      <Hero initialSlides={slidedata} initialStats={statsdata} />
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
