import Hero from "@/components/Hero";
import HomeAbout from "@/components/HomeAbout";
import Guarantees from "@/components/Guarantees";
import CostEstimator from "@/components/CostEstimator";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import GroupEcosystem from "@/components/GroupEcosystem";
import CTASection from "@/components/CTASection";
import Blogs from "@/components/Blogs";
import HomeImageShowcase from "@/components/HomeImageShowcase";
import AnimateIn from "@/components/AnimateIn";
import { findAll, findLimited } from "@/lib/db";
import type { Service, Project, Stats as StatType, Testimonial, Settings, BlogPost, Guarantee, HeroSlide } from "@/lib/types";

// Home page content limits (server-side — only these records are fetched from DB)
const HOME_PROJECTS_LIMIT = 6;
const HOME_SERVICES_LIMIT = 6;
const HOME_BLOGS_LIMIT = 3;

export const revalidate = 60;

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
    // Server-side limited: only HOME_SERVICES_LIMIT services fetched from DB
    findLimited<Service>("services", HOME_SERVICES_LIMIT),
    // Server-side limited: only HOME_PROJECTS_LIMIT projects fetched from DB
    findLimited<Project>("projects", HOME_PROJECTS_LIMIT),
    findAll<Testimonial>("testimonials"),
    // Server-side limited: only HOME_BLOGS_LIMIT blogs fetched from DB
    findLimited<BlogPost>("blogs", HOME_BLOGS_LIMIT),
    findAll<Guarantee>("guarantees"),
  ]);

  const settings = settingsData[0] || {};
  const slidedata = slides.filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  const statsdata = stats.sort((a, b) => (a.order || 0) - (b.order || 0));
  let pageContent: any = {};
  try {
    if (settings.pageContent) {
      pageContent = typeof settings.pageContent === "string"
        ? JSON.parse(settings.pageContent)
        : settings.pageContent;
    }
  } catch { /* silent */ }

  const servicesData = services.filter(s => s.active !== false).sort((a, b) => (a.order || 99) - (b.order || 99));
  const projectsData = projects.filter(p => p.status !== "archived");
  const testimonialsData = testimonials.filter(
    (t) => t && t.approved === true
  );
  const now = new Date();
  // Server already returned only HOME_BLOGS_LIMIT blogs — apply publish-date safety filter only
  const blogsData = blogs
    .filter(b => {
      if (!b || b.active === false) return false;
      const status = (b.status || "published").toLowerCase();
      if (status !== "published") return false;
      if (b.publishDate) {
        const pd = new Date(b.publishDate);
        if (!isNaN(pd.getTime()) && pd > now) return false;
      }
      return true;
    });
  // No .slice() here — server already enforced the limit
  const guaranteesData = guarantees
    .filter(g => g.active !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  const projectStat = statsdata.find((s) => /project/i.test(s.label));
  const projectCount = projectStat?.value || "150+";

  return (
    <>
      <Hero initialSlides={slidedata} initialStats={statsdata} settings={settings} />
      <AnimateIn><HomeAbout pageContent={pageContent} projectCount={projectCount} settings={settings} /></AnimateIn>
      <AnimateIn><Services services={servicesData} settings={settings} /></AnimateIn>
      <AnimateIn delay={100}><Guarantees guarantees={guaranteesData} /></AnimateIn>
      <AnimateIn delay={200}><CostEstimator /></AnimateIn>
      <Projects projects={projectsData} title={pageContent.projectsHeader} settings={settings} />
      <HomeImageShowcase content={pageContent.imageShowcase} />
      <AnimateIn><GroupEcosystem pageContent={pageContent} /></AnimateIn>
      <AnimateIn><Blogs posts={blogsData} /></AnimateIn>
      <AnimateIn><Testimonials testimonials={testimonialsData} /></AnimateIn>
      <AnimateIn><CTASection /></AnimateIn>
    </>
  );
}
